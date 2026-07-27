// gear.js — SIGNATURE gear (reworked 2026-07-27, user-blessed design).
// Gear is no longer churn: each slot holds ONE permanent named item, earned
// at a story milestone, that GROWS forever — enhance pushes its plus
// (§5 heartbeat, same object for life), and slice 2 adds rerollable mod
// lines. Nothing is ever replaced or destroyed: gear joins the character,
// the strongest form of the attachment law.
//
// Drops are EVENTS now, not objects: a drop rolls {slot, zone, rarity},
// merges into its Armory entry (as always) and pays tiered Scrap — fuel for
// the slice-2 reforge bench. Epic+ drops bank a RELIC (slice-3 currency,
// banked from day one so no playtest drop is retroactively wasted). There
// is no stash, no filter, no equip decision — and no flood, because there
// is nothing to pile up.
import { RARITIES, RARITY_BY_ID, RARITY_IDX, rollRarity } from "./rarity.js";
import { merge } from "./armory.js";

export const SLOTS = ["weapon", "armor", "charm"];

// Dead-game register; Armory entries are named by the zone that drops them.
export const NAMES = {
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

/* The three signatures. Each is the zone-1 quest reward — the newbie gear
   every 2006 MMO printed — and it never gets replaced: a +20 Rusty
   Shortsword at the Tenth Door is both the satire and the attachment.
     ip     the item's scalar: drives BOTH enhance cost (enhance.js cost())
            and its stat via contribution() — one number, two meanings, so
            an attempt is never free (≈15c at +0 vs the 20c entry skill,
            growing ×1.6 per plus: the early-game brake the user asked for)
     scale  maps contribution() into the slot's lane (displayed in derive):
            weapon → flat ATK, armor → flat hits/s, charm → +% copper
     arrive milestone id (main.js grants on it) + the story line printed  */
export const SIG = {
  weapon: { ip: 30, scale: 0.5, lane: "atk",
    arriveAt: "firstCopper",
    story: "Quest complete: 'A First Errand'. The server has held your reward for six years." },
  armor: { ip: 24, scale: 0.014, lane: "hits",
    arriveAt: "firstArmoryRank",
    story: "Quest complete: 'Collector's Habit'. Reward mailed. Nobody else ever finished it." },
  charm: { ip: 20, scale: 0.5, lane: "copperPct",
    arriveAt: "cp100",
    story: "Quest complete: 'Proof of Strength'. The reward chest creaks open on its own." },
};

export function newSignature(slot) {
  return { slot, ip: SIG[slot].ip, plus: 0, name: NAMES[slot][0] };
}

// Base item power scalar (compounding: +12 ≈ ×3.9, +20 ≈ ×9.6). The slot's
// `scale` maps this into its lane — see derive().
export function contribution(item) {
  return item.ip * Math.pow(1.12, item.plus);
}

// The slot's displayed lane value at the item's current plus.
export function laneValue(item) {
  return contribution(item) * SIG[item.slot].scale;
}

// ---- drops as events ----
// Rarity is standardized (same odds everywhere); Overkill Saturation bias
// gives keep-best-of-(1+bias) rarity rolls — over-farming pays quality.
export function rollDrop(zoneIdx, rng = Math.random, bias = 0) {
  const slot = SLOTS[Math.floor(rng() * SLOTS.length)];
  let rarity = rollRarity(rng);
  for (let k = 0; k < bias; k++) { const r2 = rollRarity(rng); if (RARITY_IDX[r2.id] > RARITY_IDX[rarity.id]) rarity = r2; }
  return { slot, zone: zoneIdx + 1, name: NAMES[slot][zoneIdx], rarity: rarity.id };
}

// Scrap paid per drop event, by rarity (deeper zones pay MORE drops, not
// bigger ones — volume is the zone axis, rarity is the quality axis).
// Starting values; the scrap wallet is slice-2 reforge fuel.
export function fuelYield(rarityId) {
  const ri = RARITY_IDX[rarityId] ?? 0;
  return { rarity: rarityId, n: 1 + ri * ri };
}

// Epic and above banks a Relic — the slice-3 mod-line currency. Banked (not
// dropped on the floor) from the first commit so nothing is wasted later.
export const RELIC_MIN = "epic";
export function isRelic(rarityId) {
  return (RARITY_IDX[rarityId] ?? 0) >= (RARITY_IDX[RELIC_MIN] ?? 99);
}

// Resolve one drop event: Armory merge + scrap fuel (+ relic bank).
// Returns { merge, scrap, relic } for the caller's feedback.
export function resolveDrop(state, drop) {
  const merged = merge(state, drop);
  const scrap = fuelYield(drop.rarity);
  state.scrap[scrap.rarity] = (state.scrap[scrap.rarity] || 0) + scrap.n;
  let relic = false;
  if (isRelic(drop.rarity)) {
    state.relics = (state.relics || 0) + 1;
    relic = true;
  }
  return { merge: merged, scrap, relic };
}
