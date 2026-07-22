// stats.js — THE one-line formula (law 5: no multiplier soup).
// DPS = (10 + trainedATK + Σ gear) × GMdmg × hits/s × GMhaste
// GM terms are a separate, DISPLAYED lane (era-priced flags); the trained
// speed cap stays a training-lane identity — haste multiplies past it.
import { contribution } from "./gear.js";
import { gmDmgMult, gmHasteMult } from "./gm.js";
import { getBoss } from "./bosses.js";

export const BASE_ATK = 10;
export const BASE_HPS = 2.0;
// Speed SOFT cap — no HARD cap on power stats (design law: numbers keep going
// up, investment is never wasted). Below the knee hits/s is linear (full
// value); above it, diminishing returns via a <1 exponent — always positive,
// never a wall. Each wall sets its own knee (boss.speedKnee); harder walls
// raise it, re-steepening past speed investment. Guards the atk×speed
// quadratic runaway (law 5) without ever zeroing a point of speed.
export const SPEED_KNEE = 5.0;   // W1 default = the old hard cap (preserves pacing)
export const SPEED_SOFT_P = 0.5; // compression above the knee (starting value)

export function softHits(raw, knee = SPEED_KNEE) {
  return raw <= knee ? raw : knee * Math.pow(raw / knee, SPEED_SOFT_P);
}

export function derive(state) {
  let gearAtk = 0;
  for (const slot of ["weapon", "armor", "charm"]) {
    const it = state.gear[slot];
    if (it) gearAtk += contribution(it);
  }
  const atk = (BASE_ATK + state.bots.trained.atk + gearAtk) * gmDmgMult(state);
  const knee = getBoss(state.wall)?.speedKnee ?? SPEED_KNEE;
  const hitsPerSec = softHits(BASE_HPS + state.bots.trained.hits, knee) * gmHasteMult(state);
  return { atk, hitsPerSec };
}
