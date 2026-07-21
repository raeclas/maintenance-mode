// bots.js — the Bot Farm as a POPULATION FLOW (ITRTG-clone model).
// The account generator spawns bots toward the server's session capacity;
// farming bots get banned at the zone's detection rate; training bots sit
// in private lobbies, safe. Population is a stream, not pets — nothing
// loved ever dies (attachment law holds by construction).
// Live tick and offline batch are the SAME function (clamp law).
// Starting values throughout — sim-gated; test plans in REMAKE-DESIGN §7.
import { zones } from "./farm.js";

export const CREATE_PER_H = 2;        // base bots/hour from the generator
export const CAP_BASE = 8;            // dead server's leftover session slots
export const CAP_PER_RANK = 4;        // each rank clears more dead sessions
export const POWER_PER_RANK = 0.25;   // script quality
export const SPEED_PER_RANK = 0.20;   // hardware
export const CREATE_PER_RANK = 0.5;   // generator: ×(1 + 0.5×rank)
export const BOT_BASE_DPS = 4;        // a naked account running a script
export const BAR_COST_C = 180;        // bar level L costs 180×L² progress units (tuned for pop-scale training)

export function botPower(b) { return 1 + POWER_PER_RANK * b.powerRank; }
export function botSpeed(b) { return 1 + SPEED_PER_RANK * b.speedRank; }
export function capacity(b) { return CAP_BASE + CAP_PER_RANK * b.capRank; }
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
  const want = a.atk + a.spd + a.farm;
  const scale = want > b.pop ? b.pop / want : 1;
  return { atk: a.atk * scale, spd: a.spd * scale, farm: a.farm * scale, scale };
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

export function levelCost(lvl) { return BAR_COST_C * (lvl + 1) * (lvl + 1); }

// Advance the swarm by dtS seconds: creation, training, farming, bans.
// Same path live and offline (caller clamps dt). Long dts are sub-stepped
// internally so a 12h batch integrates the shrinking population the same
// way live play does (clamp law: batch ≡ live within chunk error).
export function tick(state, dtS) {
  while (dtS > 60) { tickChunk(state, 60); dtS -= 60; }
  tickChunk(state, dtS);
}

function tickChunk(state, dtS) {
  const b = state.bots;
  const dtH = dtS / 3600;

  // creation toward capacity
  b.pop = Math.min(capacity(b), b.pop + createRate(b) * dtH);

  // training (private lobbies — safe)
  const quality = botPower(b) * botSpeed(b);
  const eff = effAlloc(b);
  for (const bar of ["atk", "speed"]) {
    const trainPop = eff[bar === "atk" ? "atk" : "spd"];
    const B = b.bars[bar];
    B.prog += trainPop * quality * dtS;
    while (B.prog >= levelCost(B.lvl)) {
      B.prog -= levelCost(B.lvl);
      B.lvl++;
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
}
