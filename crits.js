// crits.js — two-tier crits fold into Combat Power. A hit rolls Crit (×2), and
// of those Super Crit (×5). The EXPECTED multiplier rides in derive() as one
// displayed factor (guideline 5); the actual per-hit roll drives the damage
// stream (`rollHit`), so you SEE the `*` / `**` spikes while the whittle uses
// the smooth average. Crit is a chase: base ×1.16, grown via gear affixes.
import { SLOTS } from "./gear.js";

// Base values (starting numbers — playtest-tunable). rate/superRate are
// probabilities; critMult/superMult are the damage multipliers per tier.
export const BASE = { rate: 0.10, superRate: 0.20, critMult: 2, superMult: 5 };

// Resolve the player's live crit stats: base + equipped gear affixes.
// critRate affix adds probability points; critDmg adds to BOTH tier mults.
export function critStats(state) {
  let rate = BASE.rate, dmgBonus = 0;
  for (const slot of SLOTS) {
    const it = state.gear?.[slot];
    if (!it) continue;
    for (const af of it.affixes || []) {
      if (af.id === "critRate") rate += af.value / 100;
      else if (af.id === "critDmg") dmgBonus += af.value / 100;
    }
  }
  return { rate: Math.min(1, rate), superRate: BASE.superRate,
    critMult: BASE.critMult + dmgBonus, superMult: BASE.superMult + dmgBonus };
}

// Expected damage multiplier from the two-tier cascade — the CP factor.
// 1 + P(crit)·(mc−1) + P(crit)·P(super)·(ms−mc). All terms displayed.
export function critFactor(cs) {
  return 1 + cs.rate * (cs.critMult - 1) + cs.rate * cs.superRate * (cs.superMult - cs.critMult);
}

// Roll ONE hit for the visual stream. tier 0 normal / 1 crit / 2 super crit.
// Small ±15% variance so the numbers breathe.
export function rollHit(atk, cs, rng = Math.random) {
  let mult = 1, tier = 0;
  if (rng() < cs.rate) {
    mult = cs.critMult; tier = 1;
    if (rng() < cs.superRate) { mult = cs.superMult; tier = 2; }
  }
  return { dmg: atk * mult * (0.85 + 0.3 * rng()), tier };
}
