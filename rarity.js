// rarity.js — dead-game loot tiers. STANDARDIZED: identical drop odds in
// every zone (zones scale the ip BASE only, not rarity). Rarity governs
// affix COUNT; ip (from the zone) governs affix TIER. The two are
// orthogonal — a z1 Origin rolls 6 low-tier affixes, a z5 Common is a fat
// reforge base. Weights fall ~4–12× per step so top tiers are events.
export const RARITIES = [
  { id: "common",    name: "Common",    affixes: 0, weight: 1000, color: "#b8b8b8" },
  { id: "uncommon",  name: "Uncommon",  affixes: 1, weight: 300,  color: "#5fd35f" },
  { id: "rare",      name: "Rare",      affixes: 2, weight: 80,   color: "#5a8bd6" },
  { id: "epic",      name: "Epic",      affixes: 3, weight: 18,   color: "#b061d6" },
  { id: "legendary", name: "Legendary", affixes: 4, weight: 3.5,  color: "#e08a2e" },
  { id: "mythic",    name: "Mythic",    affixes: 5, weight: 0.5,  color: "#d64a4a" },
  { id: "origin",    name: "Origin",    affixes: 6, weight: 0.04, color: "#e8df8a" },
];

export const RARITY_BY_ID = Object.fromEntries(RARITIES.map(r => [r.id, r]));
export const RARITY_IDX = Object.fromEntries(RARITIES.map((r, i) => [r.id, i]));

const TOTAL_W = RARITIES.reduce((s, r) => s + r.weight, 0);

// Weighted pick — same table everywhere (law: no per-zone gating).
export function rollRarity(rng = Math.random) {
  let x = rng() * TOTAL_W;
  for (const r of RARITIES) if ((x -= r.weight) < 0) return r;
  return RARITIES[0];
}
