// stats.js — THE one-line formula (law 5: no multiplier soup).
// DPS = (10 + trainedATK + Σ gear ip×(1+0.10×plus)) × hits/s
import { contribution } from "./gear.js";

export const BASE_ATK = 10;
export const BASE_HPS = 2.0;
export const SPEED_CAP = 5.0; // 2.0 base + 3.0 trained (bots.SPEED_TRAIN_CAP)

export function derive(state) {
  let gearAtk = 0;
  for (const slot of ["weapon", "armor", "charm"]) {
    const it = state.gear[slot];
    if (it) gearAtk += contribution(it);
  }
  const atk = BASE_ATK + state.bots.trained.atk + gearAtk;
  const hitsPerSec = Math.min(SPEED_CAP, BASE_HPS + state.bots.trained.hits);
  return { atk, hitsPerSec };
}
