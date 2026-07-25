// dungeon.js — the Delve, reworked as an idle DEPTH ENGINE + synergy hub.
// The character delves continuously (no clicking, no gamble): reach depth =
// how deep the build's DPS clears + Reach upgrades. Deeper = more Cache/s (the
// delve's own resource — buried server data). Spend Cache on a tree whose
// nodes feed EVERY system, so the delve is the flywheel's connective tissue:
// every gain elsewhere pushes depth → more Cache → upgrades that lift the
// whole game. DPS-native (no new power stat — law 9 via existing power).
const DIFF_BASE = 10, DIFF_GROWTH = 1.7;
const CACHE_BASE = 0.5, CACHE_GROWTH = 1.35;

export function diff(floor) { return Math.round(DIFF_BASE * Math.pow(DIFF_GROWTH, floor - 1)); }
export function clearChance(floor, dps) {
  const r = dps / diff(floor);
  return r >= 1 ? 1 : Math.max(0, Math.pow(r, 1.5));
}
// Deepest floor the build clears for certain — the idle reach.
export function safeDepth(dps) { let n = 0; while (n < 999 && clearChance(n + 1, dps) >= 1) n++; return n; }

// The Cache tree — every node feeds a system (the synergy hub). Cache-priced,
// exponential (era-priced so no runaway, law 1). Starting values, playtest-tuned.
export const UPGRADES = {
  reach:     { label: "deeper bore",         gain: "+1 depth",       per: 1,    base: 20, mult: 2.0 },
  yield:     { label: "cache sifter",        gain: "+20% Cache/s",   per: 0.20, base: 15, mult: 1.8 },
  overclock: { label: "recovered overclock", gain: "+3% ATK",        per: 0.03, base: 30, mult: 1.7 },
  loot:      { label: "salvage beacon",      gain: "+4% drops",      per: 0.04, base: 40, mult: 1.9 },
  drill:     { label: "buried scripts",      gain: "+5% train rate", per: 0.05, base: 25, mult: 1.7 },
};

export function rank(state, key) { return state.dungeon.ranks?.[key] || 0; }
export function cost(state, key) { const u = UPGRADES[key]; return Math.round(u.base * Math.pow(u.mult, rank(state, key))); }
export function buy(state, key) {
  const c = cost(state, key);
  if ((state.dungeon.cache || 0) < c) return false;
  state.dungeon.cache -= c;
  if (!state.dungeon.ranks) state.dungeon.ranks = {};
  state.dungeon.ranks[key] = rank(state, key) + 1;
  return true;
}
// Multiplier a system-feeding node contributes (overclock/loot/drill).
export function delveBonus(state, key) { return 1 + UPGRADES[key].per * rank(state, key); }

// How deep the delve sits: build DPS clears + Reach upgrades.
export function reachDepth(state, dps) { return safeDepth(dps) + rank(state, "reach"); }
// Cache mined per second — exponential in depth, scaled by the Yield node.
export function cachePerSec(state, dps) {
  const d = reachDepth(state, dps);
  return CACHE_BASE * Math.pow(CACHE_GROWTH, d) * (1 + UPGRADES.yield.per * rank(state, "yield"));
}
