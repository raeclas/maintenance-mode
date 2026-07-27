// stats.js — THE one-line formula (law 5: no multiplier soup).
// DPS = (10 + trainedATK + Σ gear) × GMdmg × hits/s × GMhaste
// GM terms are a separate, DISPLAYED lane (era-priced flags); the trained
// speed cap stays a training-lane identity — haste multiplies past it.
import { laneValue, SIG, SLOTS } from "./gear.js";
import { scriptMult } from "./rebirth.js";
import { trophyMods } from "./trophies.js";
import { armoryMods } from "./armory.js";
import { critStats, critFactor } from "./crits.js";
import { delveBonus } from "./dungeon.js";
import { getBoss } from "./bosses.js";
import { passiveMult, activeMods, coreMult } from "./skills.js";

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
  // Signature gear (v15): each slot is one permanent item feeding ONE lane —
  // weapon → flat ATK, armor → flat hits/s, charm → +% copper. laneValue =
  // ip × 1.12^plus × the slot's scale; every term displayed on its card.
  let gearAtk = 0, atkPct = 0, hitsFlat = 0, hastePct = 0, copperPct = 0;
  for (const slot of SLOTS) {
    const it = state.gear[slot];
    if (!it) continue;
    const v = laneValue(it);
    if (SIG[slot].lane === "atk") gearAtk += v;
    else if (SIG[slot].lane === "hits") hitsFlat += v;
    else if (SIG[slot].lane === "copperPct") copperPct += v;
  }
  const tm = trophyMods(state); // boss Trophy set: per-piece boosts + set bonus
  const am = armoryMods(state);  // the Armory: gear-collection rank passives (displayed lane terms)
  atkPct += am.atkPct; hastePct += am.hastePct; copperPct += am.copperPct;
  const cs = critStats(state);   // two-tier crit → per-hit roll stats + CP factor
  // Skill lane (skills.js). Focus forces every hit to crit; Rage doubles the
  // hit rate. Two ATK figures leave here:
  //   atkCore — the deterministic per-swing base (buffs, gear, trophies,
  //             Power Strike, Might). The LIVE fight rolls crits and procs
  //             on top of this for real (skills.tick roller).
  //   atk     — the EV total (core × critFactor × proc EV), for RATE
  //             consumers: bot DPS borrowing, Delve depth, time-to-breach,
  //             the sim. E[roller] == atk × hits by construction.
  const act = activeMods(state);
  if (act.allCrit) cs.rate = 1;
  const knee = getBoss(state.wall)?.speedKnee ?? SPEED_KNEE;
  const hitsPerSec = softHits(BASE_HPS + state.bots.trained.hits + hitsFlat, knee) * (1 + hastePct / 100) * (1 + tm.hastePct / 100) * act.hitsMult;
  const cf = critFactor(cs);
  const sk = passiveMult(state, hitsPerSec, cs, cf);
  const atkCore = (BASE_ATK + state.bots.trained.atk + gearAtk) * (1 + atkPct / 100) * (1 + tm.atkPct / 100) * scriptMult(state) * tm.dmgMult * delveBonus(state, "overclock") * coreMult(state) * act.atkMult;
  const atk = atkCore * cf * sk.mult;
  return { atk, atkCore, hitsPerSec, copperMult: 1 + (copperPct + tm.copperPct) / 100, crit: cs, skills: sk };
}
