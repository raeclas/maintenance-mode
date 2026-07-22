// gear.js — Diablo/PoE-lite items: a base power scalar (ip × 1.12^plus)
// PLUS rolled affixes. Rarity = affix COUNT, ip = affix TIER (see
// rarity.js / affixes.js). Attachment law: nothing is ever destroyed —
// replaced or filtered gear goes to stash or salvages into Scrap.
import { RARITIES, RARITY_IDX, rollRarity } from "./rarity.js";
import { AFFIXES, rollAffixes } from "./affixes.js";

export const SLOTS = ["weapon", "armor", "charm"];

// Dead-game register; names follow the zone that drops them.
const NAMES = {
  weapon: ["Rusty Shortsword", "Ravine Pike", "Salt-Etched Saber", "Cinder Warblade", "Sentry Halberd"],
  armor: ["Padded Vest", "Weaver-Silk Jerkin", "Salt-Crusted Cuirass", "Cinder Scale Coat", "Sentry Plate"],
  charm: ["Cracked Bead", "Weaver-Eye Charm", "Salt Talisman", "Ember Sigil", "Door Sentry Sigil"],
};

// Base item power (the "white" scalar). Compounding: +12 ≈ ×3.9, +20 ≈ ×9.6.
// Affixes ride ON TOP and are summed into their lanes by derive().
export function contribution(item) {
  return item.ip * Math.pow(1.12, item.plus);
}

// zoneIdx 0-based; ip band comes from the zone. Rarity is standardized
// (same odds everywhere); affix count follows rarity, affix tier follows ip.
export function rollItem(zone, zoneIdx, rng = Math.random) {
  const slot = SLOTS[Math.floor(rng() * SLOTS.length)];
  const ip = Math.round(zone.ipLo + (zone.ipHi - zone.ipLo) * rng());
  const rarity = rollRarity(rng);
  return {
    slot, ip, plus: 0, zone: zoneIdx + 1, name: NAMES[slot][zoneIdx],
    rarity: rarity.id,
    affixes: rollAffixes(ip, rarity.affixes, rng),
  };
}

export const STASH_CAP = 50;

// ---- Salvage → tiered Scrap (the sink; feeds the Reforge bench, Slice 2).
// Yield scales with rarity index and √ip. Deposited into state.scrap by tier.
export function scrapYield(item) {
  const ri = RARITY_IDX[item.rarity] ?? 0;
  return Math.max(1, Math.round((0.5 + ri) * Math.sqrt(item.ip)));
}

export function salvage(state, item) {
  const r = item.rarity || "common";
  const n = scrapYield(item);
  state.scrap[r] = (state.scrap[r] || 0) + n;
  return { rarity: r, n };
}

// Stash discipline: past cap, the lowest-base-power UNLOCKED item salvages.
function stashPush(state, item) {
  state.gear.stash.push(item);
  if (state.gear.stash.length <= STASH_CAP) return null;
  let worst = -1;
  for (let i = 0; i < state.gear.stash.length; i++) {
    const it = state.gear.stash[i];
    if (it.lock) continue;
    if (worst === -1 || contribution(it) < contribution(state.gear.stash[worst])) worst = i;
  }
  if (worst === -1) return null; // everything locked — cap yields to the lock
  const [gone] = state.gear.stash.splice(worst, 1);
  return { item: gone, scrap: salvage(state, gone) };
}

// ---- Loot filter: the DISPOSAL front door. NEVER auto-equips (agency law —
// the player builds). Keep if it clears BOTH floors (rarity AND ip — a
// low-ip Origin from an old zone is still junk); else it salvages to Scrap.
export function meetsKeep(item, keepRarity, keepIp) {
  return (RARITY_IDX[item.rarity] ?? 0) >= (RARITY_IDX[keepRarity] ?? 0) && item.ip >= (keepIp || 0);
}

// Route a fresh drop through the filter. Returns { kept, scrap?, overflow? }.
export function routeDrop(state, item) {
  const g = state.gear;
  if (meetsKeep(item, g.keepRarity, g.keepIp)) {
    return { kept: true, overflow: stashPush(state, item) };
  }
  return { kept: false, scrap: salvage(state, item) };
}

// Manual bulk sweep: salvage every UNLOCKED stash item at/below maxRarity
// (rarity index). Locked + equipped are untouched. Returns a scrap tally.
export function salvageMatching(state, maxRarityId) {
  const maxIdx = RARITY_IDX[maxRarityId] ?? 0;
  const keep = [], tally = {};
  let count = 0;
  for (const it of state.gear.stash) {
    if (!it.lock && (RARITY_IDX[it.rarity] ?? 0) <= maxIdx) {
      const { rarity, n } = salvage(state, it);
      tally[rarity] = (tally[rarity] || 0) + n;
      count++;
    } else keep.push(it);
  }
  state.gear.stash = keep;
  return { count, tally };
}

// Manual: swap a stash item into its slot (plusses + affixes travel with it).
export function equipFromStash(state, idx) {
  const item = state.gear.stash[idx];
  if (!item) return false;
  state.gear.stash.splice(idx, 1);
  const cur = state.gear[item.slot];
  if (cur) state.gear.stash.push(cur);
  state.gear[item.slot] = item;
  return true;
}
