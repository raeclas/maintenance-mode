// stats.js — THE one-line formula (law 5: no multiplier soup).
// DPS = (10 + trainedATK + Σ gear) × GMdmg × hits/s × GMhaste
// GM terms are a separate, DISPLAYED lane (era-priced flags); the trained
// speed cap stays a training-lane identity — haste multiplies past it.
import { contribution, SLOTS } from "./gear.js";
import { AFFIXES } from "./affixes.js";
import { gmDmgMult, gmHasteMult } from "./gm.js";
import { scriptMult } from "./rebirth.js";
import { trophyMods } from "./trophies.js";
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

// Lanes are CODE (few, fixed identities); affixes are DATA summed into them.
// Every term below is displayed (law 5): gear base power + each affix line.
export function derive(state) {
  let gearAtk = 0, atkPct = 0, hitsFlat = 0, hastePct = 0, copperPct = 0;
  for (const slot of SLOTS) {
    const it = state.gear[slot];
    if (!it) continue;
    gearAtk += contribution(it); // base item power (ip × 1.12^plus)
    for (const af of it.affixes || []) {
      const a = AFFIXES[af.id];
      if (!a) continue;
      if (a.lane === "atk" && a.kind === "flat") gearAtk += af.value;
      else if (a.lane === "atk") atkPct += af.value;
      else if (a.lane === "speed" && a.kind === "flat") hitsFlat += af.value;
      else if (a.lane === "speed") hastePct += af.value;
      else if (a.lane === "farm") copperPct += af.value;
    }
  }
  const tm = trophyMods(state); // boss Trophy set: per-piece boosts + set bonus
  const atk = (BASE_ATK + state.bots.trained.atk + gearAtk) * (1 + atkPct / 100) * (1 + tm.atkPct / 100) * gmDmgMult(state) * scriptMult(state) * tm.dmgMult;
  const knee = getBoss(state.wall)?.speedKnee ?? SPEED_KNEE;
  const hitsPerSec = softHits(BASE_HPS + state.bots.trained.hits + hitsFlat, knee) * (1 + hastePct / 100) * (1 + tm.hastePct / 100) * gmHasteMult(state);
  return { atk, hitsPerSec, copperMult: 1 + copperPct / 100 };
}
