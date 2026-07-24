// armory.js — the dead game's Armory. Every named item (one per slot × zone)
// is an ENTRY you rank up by MERGING the copies you obtain: each drop feeds
// merge points to its entry (rarer copies count more), and crossing a
// threshold ranks it up for a permanent, DISPLAYED lane passive (law 5).
//
// Nothing is consumed and nothing is lost — the physical item still routes to
// stash/scrap; merging is just the running record of everything you've pulled.
// So every drop matters (even junk commons are fuel), old zones stay worth
// farming (still ranking their entries), and gear is never useless. Permanent,
// survives Ban Wave (attachment law 8). Fed by bot drops → playtest-gated, so
// NOT sim-modeled (see bot-lane-no-sim): the sim never rolls drops.
import { RARITY_IDX } from "./rarity.js";

export const BASE = 0.25;   // % lane bonus per rank, at zone 1
export const RMAX = 12;     // band-cap per entry (law 1 — the guarantee is bounded)
export const MERGE_WEIGHT = [1, 1.5, 2.5, 4, 6, 9, 13]; // merge points by rarity idx
const COST_BASE = 3, COST_GROWTH = 1.6; // geometric rank cost — self-limits (law 1)

// lane identity by slot (law 6): weapon→atk, armor→speed, charm→farm
export const LANE = { weapon: "atk", armor: "speed", charm: "farm" };

export const entryKey = item => `${item.slot}:${item.zone}`;

// Cumulative merge points to REACH rank r (rank 0 = 0 points). Geometric per
// step: cost(1→) = 3, then ×1.6 each rank.
export function pointsForRank(r) {
  let sum = 0;
  for (let k = 1; k <= r; k++) sum += Math.ceil(COST_BASE * Math.pow(COST_GROWTH, k - 1));
  return sum;
}

// Rank from accumulated points (capped at RMAX).
export function rankOf(points) {
  let r = 0;
  while (r < RMAX && points >= pointsForRank(r + 1)) r++;
  return r;
}

// The lane % an entry grants at a given rank. Deeper zones weigh more (the
// chase re-steepens each region); linear in rank, hard-capped by RMAX.
export function entryPct(slot, zone, rank) {
  return BASE * rank * (1 + 0.15 * (zone - 1));
}

// Merge a fresh drop into its entry. Returns a rank-up event or null (points
// still accrue either way). state.armory = { "slot:zone": points }.
export function merge(state, item) {
  if (!state.armory) state.armory = {};
  const key = entryKey(item);
  const before = state.armory[key] || 0;
  const w = MERGE_WEIGHT[RARITY_IDX[item.rarity] ?? 0] ?? 1;
  const after = before + w;
  state.armory[key] = after;
  const r0 = rankOf(before), r1 = rankOf(after);
  if (r1 === r0) return null;
  return { rankedUp: true, from: r0, to: r1, name: item.name,
    lane: LANE[item.slot], pct: entryPct(item.slot, item.zone, r1) };
}

// Aggregate every ranked entry into its lane, for derive() (all displayed).
export function armoryMods(state) {
  let atkPct = 0, hastePct = 0, copperPct = 0;
  const a = state.armory || {};
  for (const key of Object.keys(a)) {
    const rank = rankOf(a[key]);
    if (rank <= 0) continue;
    const [slot, z] = key.split(":");
    const pct = entryPct(slot, Number(z), rank);
    const lane = LANE[slot];
    if (lane === "atk") atkPct += pct;
    else if (lane === "speed") hastePct += pct;
    else if (lane === "farm") copperPct += pct;
  }
  return { atkPct, hastePct, copperPct };
}

// Panel summary: total rank across all entries + how many have any rank.
export function armoryStats(state) {
  const a = state.armory || {};
  let totalRank = 0, logged = 0;
  for (const key of Object.keys(a)) {
    const r = rankOf(a[key]);
    totalRank += r;
    if (r > 0) logged++;
  }
  return { totalRank, logged };
}
