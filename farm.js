// farm.js — parking. Kills/s = min(KILL_CAP, DPS/mobHP) — the per-kill cap
// that offline batches inherit unchanged (clamp law). Drops are deterministic
// EV: fractional carry, whole items materialize on the carry.
import { derive } from "./stats.js";
import { rollItem } from "./gear.js";

export const KILL_CAP = 2.0;        // kills/s hard cap (gated faucet)
export const DROP_PER_KILLS = 200;  // 1 gear roll per 200 kills EV
export const OFFLINE_CAP_S = 12 * 3600;

// Starting values; gates displayed on the cards. Each zone ≈ one day of the arc.
export const zones = [
  { id: "z1", name: "Meadow of Beginnings", gate: 0, mobHp: 50, copper: 5, ipLo: 10, ipHi: 30, mob: "Training Slime" },
  { id: "z2", name: "Spider Hollows", gate: 500, mobHp: 1000, copper: 20, ipLo: 40, ipHi: 120, mob: "Web Matron" },
  { id: "z3", name: "Saltglass Flats", gate: 2000, mobHp: 4000, copper: 75, ipLo: 150, ipHi: 450, mob: "Glass Strider" },
  { id: "z4", name: "The Ashen Steppe", gate: 7500, mobHp: 15000, copper: 300, ipLo: 600, ipHi: 1800, mob: "Cinder Yak" },
  { id: "z5", name: "Throne Approach", gate: 32000, mobHp: 64000, copper: 2250, ipLo: 4500, ipHi: 13500, mob: "Doorward Echo" },
];

export function dpsOf(state) {
  const { atk, hitsPerSec } = derive(state);
  return atk * hitsPerSec;
}

export function killsPerSec(state, zone) {
  return Math.min(KILL_CAP, dpsOf(state) / zone.mobHp);
}

export function rateCard(state, zone) {
  const kps = killsPerSec(state, zone);
  return {
    kps,
    copperPerSec: kps * zone.copper,
    dropsPerHour: (kps * 3600) / DROP_PER_KILLS,
    locked: dpsOf(state) < zone.gate,
  };
}

// Advance farming by dtS seconds; onDrop(item) fires per materialized item.
// Same path live and offline (caller clamps dt to OFFLINE_CAP_S).
export function tick(state, dtS, rng = Math.random, onDrop = () => {}) {
  const zi = state.farm.zone;
  if (zi === null) return;
  const zone = zones[zi];
  if (dpsOf(state) < zone.gate) return; // gate re-checked every tick (no snapshot abuse)
  const kills = killsPerSec(state, zone) * dtS;
  state.copper += kills * zone.copper;
  state.farm.dropCarry += kills / DROP_PER_KILLS;
  while (state.farm.dropCarry >= 1) {
    state.farm.dropCarry -= 1;
    onDrop(rollItem(zone, zi, rng));
  }
}
