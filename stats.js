// stats.js — THE one-line formula (law 5: no multiplier soup).
// DPS = (10 + trainedATK + Σ gear) × GMdmg × hits/s × GMhaste
// GM terms are a separate, DISPLAYED lane (era-priced flags); the trained
// speed cap stays a training-lane identity — haste multiplies past it.
import { contribution } from "./gear.js";
import { gmDmgMult, gmHasteMult } from "./gm.js";

export const BASE_ATK = 10;
export const BASE_HPS = 2.0;
export const SPEED_CAP = 5.0; // 2.0 base + 3.0 trained (bots.SPEED_TRAIN_CAP)

export function derive(state) {
  let gearAtk = 0;
  for (const slot of ["weapon", "armor", "charm"]) {
    const it = state.gear[slot];
    if (it) gearAtk += contribution(it);
  }
  const atk = (BASE_ATK + state.bots.trained.atk + gearAtk) * gmDmgMult(state);
  const hitsPerSec = Math.min(SPEED_CAP, BASE_HPS + state.bots.trained.hits) * gmHasteMult(state);
  return { atk, hitsPerSec };
}
