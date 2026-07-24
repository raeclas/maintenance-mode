// gear.js — Diablo/PoE-lite items: a base power scalar (ip × 1.12^plus)
// PLUS rolled affixes. Rarity = affix COUNT, ip = affix TIER (see
// rarity.js / affixes.js). Attachment law: nothing is ever destroyed —
// replaced or filtered gear goes to stash or salvages into Scrap.
import { RARITIES, RARITY_BY_ID, RARITY_IDX, rollRarity } from "./rarity.js";
import { AFFIXES, rollAffixes, affixTier } from "./affixes.js";

export const SLOTS = ["weapon", "armor", "charm"];

// Dead-game register; names follow the zone that drops them.
const NAMES = {
  weapon: ["Rusty Shortsword", "Ravine Pike", "Salt-Etched Saber", "Cinder Warblade", "Sentry Halberd",
    "Threshold Cleaver", "Nave Censer", "Undercroft Trident", "Long Dark Reaver", "Second Door Greatblade",
    "Frost Reaver", "Archive Halberd", "Obsidian Cleaver", "Spire Lance", "World-Edge Blade"],
  armor: ["Padded Vest", "Weaver-Silk Jerkin", "Salt-Crusted Cuirass", "Cinder Scale Coat", "Sentry Plate",
    "Threshold Carapace", "Nave Vestments", "Undercroft Wrap", "Long Dark Shroud", "Second Door Bulwark",
    "Frost Carapace", "Archive Plate", "Obsidian Scale", "Spire Ward", "World-Edge Aegis"],
  charm: ["Cracked Bead", "Weaver-Eye Charm", "Salt Talisman", "Ember Sigil", "Door Sentry Sigil",
    "Threshold Bead", "Nave Reliquary", "Undercroft Pearl", "Pale Eye", "Sealed Sigil",
    "Frost Bead", "Archive Seal", "Obsidian Eye", "Spire Sigil", "World-Edge Star"],
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

// Salvage yields SCRAP only (reforge fuel). The character's copper comes from
// their own verb — the dungeon delve — not from passively skimming bot drops.
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
// With the auto-filter OFF, every drop is kept (stashed) — no auto-salvage.
export function routeDrop(state, item) {
  const g = state.gear;
  if (g.autoFilter === false || meetsKeep(item, g.keepRarity, g.keepIp)) {
    return { kept: true, overflow: stashPush(state, item) };
  }
  return { kept: false, scrap: salvage(state, item) };
}

// Manual bulk sweep: salvage every UNLOCKED stash item at/below BOTH maxRarity
// (rarity index) AND maxIp — the same two axes as the auto filter. Locked +
// equipped are untouched. Returns a scrap tally.
export function salvageMatching(state, maxRarityId, maxIp = Infinity) {
  const maxIdx = RARITY_IDX[maxRarityId] ?? 0;
  const keep = [], tally = {};
  let count = 0;
  for (const it of state.gear.stash) {
    if (!it.lock && (RARITY_IDX[it.rarity] ?? 0) <= maxIdx && it.ip <= maxIp) {
      const { rarity, n } = salvage(state, it);
      tally[rarity] = (tally[rarity] || 0) + n;
      count++;
    } else keep.push(it);
  }
  state.gear.stash = keep;
  return { count, tally };
}

// ---- Reforge bench (Slice 2): reroll an item's affixes for Scrap of its
// OWN rarity tier. Cannot change rarity (affix COUNT) or ip (affix TIER) —
// only the composition + values reroll, within the item's fixed budget.
// Commons have no affixes, so nothing to reforge.
export function canReforge(item) {
  return item && (RARITY_BY_ID[item.rarity]?.affixes || 0) > 0;
}

// Cost is like-for-like scrap (sacrifice duplicates of the tier to perfect
// one), scaling with the item's affix tier. Starting values, playtest-tuned.
export function reforgeCost(item) {
  return { rarity: item.rarity, n: 2 * affixTier(item.ip) };
}

// Roll a CANDIDATE affix set — does NOT mutate the item (preview-then-commit,
// so a bad roll never demotes gear: attachment law 8). Deducts scrap on roll;
// returns the candidate, or null if the bench can't afford / can't reforge.
export function reforge(state, item, rng = Math.random) {
  if (!canReforge(item)) return null;
  const c = reforgeCost(item);
  if ((state.scrap[c.rarity] || 0) < c.n) return null;
  state.scrap[c.rarity] -= c.n;
  return rollAffixes(item.ip, RARITY_BY_ID[item.rarity].affixes, rng);
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
