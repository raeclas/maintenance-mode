// stats.js — THE one-line formula (law 5: no multiplier soup).
// DPS = (10 + trainedATK + Σ gear ip×(1+0.10×plus)) × hits/s
import { contribution } from "./gear.js";

export const BASE_ATK = 10;
export const BASE_HPS = 2.0;
export const ATK_PER_LVL = 8;      // starting value — sim-tuned
export const HPS_PER_LVL = 0.03;   // starting value
export const SPEED_LVL_CAP = 100;  // hard cap: hits/s never exceeds 5.0

export function derive(state) {
  let gearAtk = 0;
  for (const slot of ["weapon", "armor", "charm"]) {
    const it = state.gear[slot];
    if (it) gearAtk += contribution(it);
  }
  const atk = BASE_ATK + ATK_PER_LVL * state.bots.bars.atk.lvl + gearAtk;
  const hitsPerSec = BASE_HPS + HPS_PER_LVL * Math.min(state.bots.bars.speed.lvl, SPEED_LVL_CAP);
  return { atk, hitsPerSec };
}
