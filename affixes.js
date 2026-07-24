// affixes.js — the CODE/DATA boundary that keeps the gear system
// maintainable: LANES are code (few, fixed — the law-6 identities that
// derive() owns), AFFIXES are data (a row in this table). Adding an affix
// later = one row here, zero formula rewrites. Every affix is a DISPLAYED
// term (law 5): `label(value)` prints in the item card and the per-boss math.
//
// Each affix maps to exactly one lane + kind:
//   lane  = which derive() accumulator it feeds (atk / speed / farm)
//   kind  = "flat" (added) or "pct" (percent, applied after flats)
//   base  = value at affix tier 1; +per for each tier above
// (enhance-luck lane deliberately deferred — a luck affix edges toward the
//  guarantee law 1 vetoes, so it needs its own band-cap design pass.)
// `ipFrac` affixes scale with the item's ip (stay relevant at any tier — flat
// ATK on a huge item is no longer a rounding error). The rest are % or small
// flats (speed lane) that don't relate to ip.
export const AFFIXES = {
  atkFlat: { lane: "atk",   kind: "flat", ipFrac: 0.08,             round: true,  label: v => `+${v} ATK` },
  atkPct:  { lane: "atk",   kind: "pct",  base: 4,    per: 2.5,     round: true,  label: v => `+${v}% ATK` },
  hits:    { lane: "speed", kind: "flat", base: 0.12, per: 0.12,    round: false, label: v => `+${v} hits/s` },
  haste:   { lane: "speed", kind: "pct",  base: 3,    per: 2,       round: true,  label: v => `+${v}% haste` },
  copper:  { lane: "farm",  kind: "pct",  base: 8,    per: 7,       round: true,  label: v => `+${v}% copper` },
};

export const AFFIX_IDS = Object.keys(AFFIXES);

// Affix TIER from item ip — one tier per zone ip band (each band is the next
// zone's ipLo). Deeper zone = higher ip = higher-tier (stronger) affixes: the
// chase re-steepens with every region. Add a threshold when zones extend.
const TIER_IP = [40, 150, 600, 4500, 13500, 40500, 121500, 364500, 1093500,
  3280500, 9841500, 29524500, 88573500, 265720500];
export function affixTier(ip) {
  let t = 1;
  for (const th of TIER_IP) { if (ip >= th) t++; else break; }
  return t;
}

function affixValue(a, tier, ip, rng) {
  if (a.ipFrac != null) { // scales with the item — a % of ip as a flat bonus
    const frac = a.ipFrac * (0.6 + 0.8 * rng()); // ±40% roll variance — the value chase
    return Math.max(1, Math.round(frac * ip));
  }
  const mid = a.base + a.per * (tier - 1);
  const v = mid * (0.75 + 0.5 * rng()); // ±25% roll variance
  return a.round ? Math.max(1, Math.round(v)) : +v.toFixed(2);
}

// Roll `n` DISTINCT affixes for an item of the given ip. n comes from rarity.
export function rollAffixes(ip, n, rng = Math.random) {
  const pool = AFFIX_IDS.slice();
  // Fisher–Yates the first n
  for (let i = 0; i < n && i < pool.length; i++) {
    const j = i + Math.floor(rng() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const tier = affixTier(ip);
  return pool.slice(0, Math.min(n, pool.length))
    .map(id => ({ id, tier, value: affixValue(AFFIXES[id], tier, ip, rng) }));
}

// Human line for an affix instance — used by the card and log.
export function affixLabel(af) {
  const a = AFFIXES[af.id];
  return a ? a.label(af.value) : af.id;
}
