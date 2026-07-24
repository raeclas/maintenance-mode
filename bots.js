// bots.js — the Bot Farm as a POPULATION FLOW (ITRTG-clone model).
// The account generator spawns bots toward the server's session capacity;
// farming bots get banned at the zone's detection rate; training bots sit
// in private lobbies, safe. Population is a stream, not pets — nothing
// loved ever dies (attachment law holds by construction).
// Live tick and offline batch are the SAME function (clamp law).
// Starting values throughout — sim-gated; test plans in REMAKE-DESIGN §7.
import { zones, DROP_CHANCE } from "./farm.js";
import { rollItem } from "./gear.js";
import { attempt as enhAttempt } from "./enhance.js";
import { derive } from "./stats.js";

export const CREATE_PER_H = 60;       // base bots/hour (~1/min) — no dead-wait at the start
export const CAP_BASE = 40;           // dead server's leftover session slots — a usable swarm fast
export const CAP_GROWTH = 1.2;        // capacity ×1.2 per rank — the swarm scales into the thousands
export const POWER_PER_RANK = 0.25;   // script quality
export const SPEED_PER_RANK = 0.20;   // hardware
export const CREATE_PER_RANK = 0.5;   // generator: ×(1 + 0.5×rank)
// A bot borrows the PLAYER's power: strength = 10% of player atk, speed =
// 10% of player hits/s (copper power/speed ranks multiply on top). So the
// swarm rewards the character loop — train, battle, gear, enhance all lift
// every bot. Playtest-tuned (bot lane is not sim-gated).
export const BOT_ATK_FRAC = 0.10;
export const BOT_SPD_FRAC = 0.10;

// ITRTG-style trainings: constant cost per fill, every fill pays the gain,
// rate hard-caps at 1 fill/s (tier max rate = gain/s). Next tier unlocks
// after UNLOCK_FILLS fills of the previous. Which tier to RUN is the
// player's call — a maxed low tier can out-rate a young high tier.
// Starting values, sim-gated.
// NGU-style engine ceiling: any bar grants at most 50 fills/s. Low tiers
// have small costs so the cap is REACHABLE (RATE MAX = the visible goal);
// higher tiers raise the ceiling with bigger cost AND bigger gain.
export const UNLOCK_FILLS = 10_000;
export const UNLOCK_GROWTH = 3;   // each deeper tier needs ×3 more fills to unlock — paced
export function unlockFills(tierIdx) { return UNLOCK_FILLS * Math.pow(UNLOCK_GROWTH, tierIdx); }
export const MAX_FILLS_PER_S = 50;
// Training names speak the BOTTER register (feature-pass gate 3): script
// names a 2006 botting forum would trade.
export const TRAININGS = {
  atk: [
    { name: "swing macro", cost: 1, gain: 0.0005 },      // caps at squad output 50
    { name: "combo macro", cost: 12, gain: 0.005 },      // caps at 600
    { name: "cancel-weave script", cost: 120, gain: 0.045 },
    { name: "frame-perfect script", cost: 1000, gain: 0.35 },
    { name: "packet-replay macro", cost: 8000, gain: 2.8 },
    { name: "netcode desync", cost: 64000, gain: 22 },
    { name: "tick-rate exploit", cost: 500000, gain: 175 },
  ],
  speed: [
    { name: "autoclicker", cost: 2, gain: 0.00001 },
    { name: "turbo clicker", cost: 24, gain: 0.0001 },
    { name: "no-delay hack", cost: 240, gain: 0.0009 },
    { name: "input injector", cost: 2000, gain: 0.007 },
    { name: "kernel clicker", cost: 18000, gain: 0.055 },
    { name: "hypervisor spoof", cost: 150000, gain: 0.42 },
  ],
};

// Server privileges: ticket-bought admin leverage that STACKS on top of the
// copper rig ranks (|| 0 keeps old saves safe). See PRIV below.
export const T_POWER_PER_RANK = 0.5;
export const T_SPEED_PER_RANK = 0.4;
export const T_CREATE_PER_RANK = 0.5;
export const T_CAP_PER_RANK = 8;

export function botPower(b) { return 1 + POWER_PER_RANK * b.powerRank + T_POWER_PER_RANK * (b.tPower || 0); }
export function botSpeed(b) { return 1 + SPEED_PER_RANK * b.speedRank + T_SPEED_PER_RANK * (b.tSpeed || 0); }
// Multiplicative: each capRank multiplies the swarm ceiling (flat priv/GM
// bonuses ride inside the multiply). rank 28 → ~13k slots instead of 348.
export function capacity(b, gmCap = 0) {
  return Math.round((CAP_BASE + T_CAP_PER_RANK * (b.tCap || 0) + 2 * gmCap) * Math.pow(CAP_GROWTH, b.capRank));
}
export function createRate(b) { return CREATE_PER_H * (1 + CREATE_PER_RANK * b.createRank + T_CREATE_PER_RANK * (b.tGen || 0)); } // per hour
// One bot's zone DPS. player = derived stats {atk, hitsPerSec}. Squad DPS is
// n × this — each bot ≈ 1% of player DPS (0.1 atk × 0.1 speed) before ranks.
export function botDps(b, player) {
  const strength = BOT_ATK_FRAC * player.atk * botPower(b);
  const speed = BOT_SPD_FRAC * player.hitsPerSec * botSpeed(b);
  return strength * speed;
}

// Copper costs (exponential — copper can't runaway-compound the chain).
// Bases softened 2026-07-22 (flatter scaling) so rig upgrades stay buyable
// deep instead of walling out; still exponential. Playtest-tuned (bot lane).
export function capCost(b) { return Math.round(800 * Math.pow(1.65, b.capRank)); }
export function createCost(b) { return Math.round(500 * Math.pow(1.7, b.createRank)); }
export function powerCost(b) { return Math.round(200 * Math.pow(1.6, b.powerRank)); }
export function speedCost(b) { return Math.round(300 * Math.pow(1.7, b.speedRank)); }

const COSTS = { cap: capCost, create: createCost, power: powerCost, speed: speedCost };

export function buy(state, what) {
  const b = state.bots;
  const cost = COSTS[what](b);
  if (state.copper < cost) return false;
  state.copper -= cost;
  b[what + "Rank"]++;
  return true;
}

// Server privileges — the TICKET-bought bot lane (admin leverage the grubby
// copper can't buy). Rendered in the GM tab; dying-server/admin register.
// Uncapped, era-priced (exponential) so the boss→tickets→farm loop stays
// bounded (law 1). Ranks live on state.bots (effect reads b directly).
// Starting values, playtest-tuned.
export const PRIV = {
  power: { label: "priority execution", gain: "+50% bot power", field: "tPower", base: 40, mult: 1.6 },
  speed: { label: "rate-limit lift", gain: "+40% bot speed", field: "tSpeed", base: 50, mult: 1.6 },
  gen: { label: "auto-provisioning", gain: "+50% generation", field: "tGen", base: 80, mult: 1.7 },
  cap: { label: "reserved sessions", gain: "+8 capacity", field: "tCap", base: 60, mult: 1.7 },
};
export function privRank(b, what) { return b[PRIV[what].field] || 0; }
export function privCost(b, what) { return Math.round(PRIV[what].base * Math.pow(PRIV[what].mult, privRank(b, what))); }
export function buyPriv(state, what) {
  const cost = privCost(state.bots, what);
  if (state.tickets < cost) return false;
  state.tickets -= cost;
  state.bots[PRIV[what].field] = privRank(state.bots, what) + 1;
  return true;
}

// NGU model: alloc is a VECTOR — every bar (training tier, zone, enhance
// squad) takes its own bot count and all bars run in parallel. Bars are
// addressed as "atk.0", "speed.2", "zones.3", "enh".
function allocRef(b, key) {
  const [group, idx] = key.split(".");
  return idx === undefined ? { arr: b.alloc, k: group } : { arr: b.alloc[group], k: Number(idx) };
}

export function allocTotal(b) {
  const a = b.alloc;
  return a.atk.reduce((s, n) => s + n, 0) + a.speed.reduce((s, n) => s + n, 0)
    + a.zones.reduce((s, n) => s + n, 0) + a.enh;
}

export function freeBots(b) {
  return Math.max(0, b.pop - allocTotal(b));
}

// Hard-clamped to the bots actually available. Bans can still drag pop
// below committed numbers afterwards — effScale covers that case.
export function setAlloc(state, key, n) {
  const b = state.bots;
  const { arr, k } = allocRef(b, key);
  n = Math.max(0, Math.floor(n) || 0);
  const others = allocTotal(b) - arr[k];
  arr[k] = Math.min(n, Math.max(0, Math.floor(b.pop) - others));
}

export function effScale(b) {
  const want = allocTotal(b);
  return want > b.pop ? b.pop / want : 1;
}

// Bots needed to hit a bar's rate ceiling (the NGU "cap" button).
export function capNeeded(b, key, player) {
  const q = botPower(b) * botSpeed(b);
  const [group, idx] = key.split(".");
  if (group === "zones") {
    const z = zones[Number(idx)];
    return Math.ceil((MAX_FILLS_PER_S * z.mobHp) / botDps(b, player)); // 50 kills/s
  }
  const t = TRAININGS[group][Number(idx)];
  return Math.ceil((t.cost * MAX_FILLS_PER_S) / q);
}

// One zone's bot farm rates for n allocated bots (kills capped at 50/s).
// A squad below the zone's gate DPS can't hold the zone — no yield, no bans.
export function botZoneRates(b, zi, n, player) {
  const z = zones[zi];
  const squadDps = n * botDps(b, player);
  const held = squadDps >= z.gate;
  const kps = held ? Math.min(MAX_FILLS_PER_S, squadDps / z.mobHp) : 0;
  return {
    held,
    squadDps,
    kps,
    copperPerSec: kps * z.copper,
    bansPerHour: held ? n * z.detection : 0,
  };
}

// Bots needed for the squad to hold a zone (its gate DPS).
export function gateNeeded(b, zi, player) {
  return Math.ceil(zones[zi].gate / botDps(b, player));
}

// Bot enhancing: time per attempt grows exponentially with the plus being
// pushed; squad quality shrinks it. Same copper cost, same RNG as manual —
// bots automate the ladder, they never beat the odds.
export const ENH_T0 = 30;      // seconds per attempt at +0, one bot, quality 1
export const ENH_GROWTH = 1.3; // per plus level

export function enhInterval(b, plus) {
  const squad = b.alloc.enh * effScale(b) * botPower(b) * botSpeed(b);
  if (squad <= 0) return Infinity;
  return (ENH_T0 * Math.pow(ENH_GROWTH, plus)) / squad;
}

// Advance the swarm by dtS seconds: creation, training, farming, bans,
// drops, enhancing. Same path live and offline (caller clamps dt). Long
// dts are sub-stepped internally so a 12h batch integrates the shrinking
// population the same way live play does (clamp law).
// onEvent(kind, item) fires per bot event: kind = "drop" for zone gear
// rolls, or an enhance result ("success"/"fail"/"poor") for the squad.
export function tick(state, dtS, onEvent = () => {}, rng = Math.random) {
  while (dtS > 60) { tickChunk(state, 60, onEvent, rng); dtS -= 60; }
  tickChunk(state, dtS, onEvent, rng);
}

function tickChunk(state, dtS, onEvent, rng) {
  const b = state.bots;
  const dtH = dtS / 3600;
  const player = derive(state); // zone squad DPS borrows player power

  // creation toward capacity
  b.pop = Math.min(capacity(b, state.gm?.cap || 0), b.pop + createRate(b) * dtH);

  // training (private lobbies — safe): every unlocked tier runs in
  // parallel with its own squad; each bar caps at 50 fills/s
  const quality = botPower(b) * botSpeed(b);
  const scale = effScale(b);
  for (const bar of ["atk", "speed"]) {
    const B = b.bars[bar];
    for (let i = 0; i < B.unlocked; i++) {
      const squad = (b.alloc[bar][i] || 0) * scale;
      if (squad <= 0) continue;
      const t = TRAININGS[bar][i];
      const units = Math.min(squad * quality * dtS, t.cost * MAX_FILLS_PER_S * dtS);
      B.prog[i] = (B.prog[i] || 0) + units;
      while (B.prog[i] >= t.cost) {
        B.prog[i] -= t.cost;
        B.fills[i] = (B.fills[i] || 0) + 1;
        if (bar === "atk") b.trained.atk += t.gain;
        else b.trained.hits += t.gain; // no hard cap — speed's returns soft-cap in stats.js
        if (i === B.unlocked - 1 && B.unlocked < TRAININGS[bar].length && B.fills[i] >= unlockFills(i)) {
          B.unlocked++;
        }
      }
    }
  }

  // farming: every held zone runs in parallel; each zone's detection bans
  // its own squad at a rate; copper mailed in; drops roll CHANCE-BASED
  // per kill from the zone's IP band (expected count + random remainder —
  // exact per-kill odds at live tick sizes, EV at offline batch sizes)
  for (let zi = 0; zi < zones.length; zi++) {
    const n = (b.alloc.zones[zi] || 0) * scale;
    if (n <= 0) continue;
    const r = botZoneRates(b, zi, n, player);
    if (!r.held) continue;
    state.copper += r.copperPerSec * dtS * (player.copperMult || 1); // +copper affixes
    const np = r.kps * dtS * DROP_CHANCE;
    let drops = Math.floor(np) + (rng() < np - Math.floor(np) ? 1 : 0);
    while (drops-- > 0) onEvent("drop", rollItem(zones[zi], zi, rng));
    const deaths = r.bansPerHour * dtH;
    b.pop = Math.max(0, b.pop - deaths);
    b.banned = (b.banned || 0) + deaths; // lifetime counter (log flavor)
  }

  // enhancing (real odds, real copper — stops at the target plus)
  if (b.alloc.enh * scale > 0 && b.enhTarget) {
    const item = state.gear[b.enhTarget.slot];
    if (item && item.plus < b.enhTarget.plus) {
      b.enhCarry += dtS;
      let interval = enhInterval(b, item.plus);
      let guard = 200; // ponytail: bound attempts per chunk; interval recomputes as plus moves
      while (b.enhCarry >= interval && guard-- > 0) {
        b.enhCarry -= interval;
        const res = enhAttempt(state, item, rng);
        onEvent(res, item);
        if (res === "poor" || item.plus >= b.enhTarget.plus) { b.enhCarry = 0; break; }
        interval = enhInterval(b, item.plus);
      }
    }
  }
}
