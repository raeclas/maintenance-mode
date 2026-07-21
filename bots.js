// bots.js — the Bot Farm as a POPULATION FLOW (ITRTG-clone model).
// The account generator spawns bots toward the server's session capacity;
// farming bots get banned at the zone's detection rate; training bots sit
// in private lobbies, safe. Population is a stream, not pets — nothing
// loved ever dies (attachment law holds by construction).
// Live tick and offline batch are the SAME function (clamp law).
// Starting values throughout — sim-gated; test plans in REMAKE-DESIGN §7.
import { zones } from "./farm.js";
import { attempt as enhAttempt } from "./enhance.js";

export const CREATE_PER_H = 2;        // base bots/hour from the generator
export const CAP_BASE = 8;            // dead server's leftover session slots
export const CAP_PER_RANK = 4;        // each rank clears more dead sessions
export const POWER_PER_RANK = 0.25;   // script quality
export const SPEED_PER_RANK = 0.20;   // hardware
export const CREATE_PER_RANK = 0.5;   // generator: ×(1 + 0.5×rank)
export const BOT_BASE_DPS = 4;        // a naked account running a script

// ITRTG-style trainings: constant cost per fill, every fill pays the gain,
// rate hard-caps at 1 fill/s (tier max rate = gain/s). Next tier unlocks
// after UNLOCK_FILLS fills of the previous. Which tier to RUN is the
// player's call — a maxed low tier can out-rate a young high tier.
// Starting values, sim-gated.
export const UNLOCK_FILLS = 50;
export const MAX_FILLS_PER_S = 0.02; // 50s/fill floor — tiers CAN max out (the ITRTG feel)
export const SPEED_TRAIN_CAP = 3.0;  // trained hits/s: lane tops out at 2.0 + 3.0 = 5.0
export const TRAININGS = {
  atk: [
    { name: "macro loop", cost: 3000, gain: 2 },
    { name: "combo script", cost: 30_000, gain: 12 },
    { name: "kernel hook", cost: 240_000, gain: 70 },
    { name: "frame-perfect bot", cost: 1_800_000, gain: 400 },
  ],
  speed: [
    { name: "click daemon", cost: 6000, gain: 0.01 },
    { name: "packet burst", cost: 60_000, gain: 0.06 },
    { name: "zero-delay loop", cost: 480_000, gain: 0.3 },
  ],
};

export function botPower(b) { return 1 + POWER_PER_RANK * b.powerRank; }
export function botSpeed(b) { return 1 + SPEED_PER_RANK * b.speedRank; }
export function capacity(b, gmCap = 0) { return CAP_BASE + CAP_PER_RANK * b.capRank + 2 * gmCap; }
export function createRate(b) { return CREATE_PER_H * (1 + CREATE_PER_RANK * b.createRank); } // per hour
export function botDps(b) { return BOT_BASE_DPS * botPower(b) * botSpeed(b); }

// Copper costs (exponential — copper can't runaway-compound the chain)
export function capCost(b) { return Math.round(800 * Math.pow(3.5, b.capRank)); }
export function createCost(b) { return Math.round(500 * Math.pow(3, b.createRank)); }
export function powerCost(b) { return Math.round(200 * Math.pow(2.2, b.powerRank)); }
export function speedCost(b) { return Math.round(300 * Math.pow(2.5, b.speedRank)); }

const COSTS = { cap: capCost, create: createCost, power: powerCost, speed: speedCost };

export function buy(state, what) {
  const b = state.bots;
  const cost = COSTS[what](b);
  if (state.copper < cost) return false;
  state.copper -= cost;
  b[what + "Rank"]++;
  return true;
}

// Allocation is absolute bot counts per track (player types numbers),
// hard-clamped to the bots actually available. Bans can still drag pop
// below committed numbers afterwards — effAlloc scales that case down.
export function setAlloc(state, track, n) {
  const b = state.bots;
  n = Math.max(0, Math.floor(n) || 0);
  const others = Object.keys(b.alloc).filter(k => k !== track).reduce((s, k) => s + b.alloc[k], 0);
  b.alloc[track] = Math.min(n, Math.max(0, Math.floor(b.pop) - others));
}

export function effAlloc(b) {
  const a = b.alloc;
  const want = a.atk + a.spd + a.farm + (a.enh || 0);
  const scale = want > b.pop ? b.pop / want : 1;
  return { atk: a.atk * scale, spd: a.spd * scale, farm: a.farm * scale, enh: (a.enh || 0) * scale, scale };
}

// Bots farm with their OWN stats through the player's kill math — copper
// only, mailed to the buyer (you). Gear drops stay player-exclusive.
export function botFarmRates(b, zi) {
  const z = zones[zi];
  const kps = Math.min(2.0, botDps(b) / z.mobHp);
  const farmPop = effAlloc(b).farm;
  return {
    copperPerSec: farmPop * kps * z.copper,
    bansPerHour: farmPop * z.detection,
    perBotCopperSec: kps * z.copper,
  };
}

export function setTier(state, bar, tier) {
  const B = state.bots.bars[bar];
  if (tier >= 0 && tier < B.unlocked && tier < TRAININGS[bar].length) {
    B.tier = tier;
    B.prog = 0; // progress doesn't transfer between tiers; fill counts do
  }
}

// Bot enhancing: time per attempt grows exponentially with the plus being
// pushed; squad quality shrinks it. Same copper cost, same RNG as manual —
// bots automate the ladder, they never beat the odds.
export const ENH_T0 = 30;      // seconds per attempt at +0, one bot, quality 1
export const ENH_GROWTH = 1.3; // per plus level

export function enhInterval(b, plus) {
  const squad = effAlloc(b).enh * botPower(b) * botSpeed(b);
  if (squad <= 0) return Infinity;
  return (ENH_T0 * Math.pow(ENH_GROWTH, plus)) / squad;
}

// Advance the swarm by dtS seconds: creation, training, farming, bans,
// enhancing. Same path live and offline (caller clamps dt). Long dts are
// sub-stepped internally so a 12h batch integrates the shrinking population
// the same way live play does (clamp law: batch ≡ live within chunk error).
// onEnh(result, item) fires per bot enhance attempt (UI feedback hook).
export function tick(state, dtS, onEnh = () => {}, rng = Math.random) {
  while (dtS > 60) { tickChunk(state, 60, onEnh, rng); dtS -= 60; }
  tickChunk(state, dtS, onEnh, rng);
}

function tickChunk(state, dtS, onEnh, rng) {
  const b = state.bots;
  const dtH = dtS / 3600;

  // creation toward capacity
  b.pop = Math.min(capacity(b, state.gm?.cap || 0), b.pop + createRate(b) * dtH);

  // training (private lobbies — safe): constant cost per fill, 1 fill/s cap
  const quality = botPower(b) * botSpeed(b);
  const eff = effAlloc(b);
  for (const bar of ["atk", "speed"]) {
    const trainPop = eff[bar === "atk" ? "atk" : "spd"];
    if (trainPop <= 0) continue;
    if (bar === "speed" && b.trained.hits >= SPEED_TRAIN_CAP) continue; // lane capped
    const B = b.bars[bar];
    const t = TRAININGS[bar][B.tier];
    const units = Math.min(trainPop * quality * dtS, t.cost * MAX_FILLS_PER_S * dtS);
    B.prog += units;
    while (B.prog >= t.cost) {
      B.prog -= t.cost;
      B.fills[B.tier] = (B.fills[B.tier] || 0) + 1;
      if (bar === "atk") b.trained.atk += t.gain;
      else b.trained.hits = Math.min(SPEED_TRAIN_CAP, b.trained.hits + t.gain);
      if (B.tier === B.unlocked - 1 && B.unlocked < TRAININGS[bar].length && B.fills[B.tier] >= UNLOCK_FILLS) {
        B.unlocked++;
      }
    }
  }

  // farming (public zones — detection bans at a rate; copper mailed in)
  if (eff.farm > 0 && b.farmZone !== null) {
    const r = botFarmRates(b, b.farmZone);
    state.copper += r.copperPerSec * dtS;
    const deaths = r.bansPerHour * dtH;
    b.pop = Math.max(0, b.pop - deaths);
    b.banned = (b.banned || 0) + deaths; // lifetime counter (log flavor)
  }

  // enhancing (real odds, real copper — stops at the target plus)
  if (eff.enh > 0 && b.enhTarget) {
    const item = state.gear[b.enhTarget.slot];
    if (item && item.plus < b.enhTarget.plus) {
      b.enhCarry += dtS;
      let interval = enhInterval(b, item.plus);
      let guard = 200; // ponytail: bound attempts per chunk; interval recomputes as plus moves
      while (b.enhCarry >= interval && guard-- > 0) {
        b.enhCarry -= interval;
        const res = enhAttempt(state, item, rng);
        onEnh(res, item);
        if (res === "poor" || item.plus >= b.enhTarget.plus) { b.enhCarry = 0; break; }
        interval = enhInterval(b, item.plus);
      }
    }
  }
}
