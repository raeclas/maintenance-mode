// gear.js — Diablo-style item power: ONE scalar per item, zero special
// effects in v1. contribution = ip × (1 + 0.10 × plus) ATK.
// Attachment law: nothing is ever destroyed — replaced gear goes to stash.

export const SLOTS = ["weapon", "armor", "charm"];

const NAMES = {
  weapon: ["Rusty Shortsword", "Militia Spear", "Saltglass Saber", "Steppe Warblade", "Throne Guard Halberd"],
  armor: ["Padded Vest", "Webspun Jerkin", "Saltglass Cuirass", "Ashen Scale Coat", "Throne Guard Plate"],
  charm: ["Cracked Bead", "Spider-Eye Charm", "Salt Talisman", "Ember Sigil", "Sigil of the First Door"],
};

export function contribution(item) {
  return item.ip * (1 + 0.10 * item.plus);
}

// zoneIdx 0-based; band comes from farm.js zone table
export function rollItem(zone, zoneIdx, rng = Math.random) {
  const slot = SLOTS[Math.floor(rng() * SLOTS.length)];
  const ip = Math.round(zone.ipLo + (zone.ipHi - zone.ipLo) * rng());
  return { slot, ip, plus: 0, zone: zoneIdx + 1, name: NAMES[slot][zoneIdx] };
}

// Equip if strictly better than current; loser goes to stash (never destroyed).
// Returns true if equipped.
export function autoEquip(state, item) {
  const cur = state.gear[item.slot];
  if (!cur || contribution(item) > contribution(cur)) {
    if (cur) state.gear.stash.push(cur);
    state.gear[item.slot] = item;
    return true;
  }
  state.gear.stash.push(item);
  return false;
}

// Manual: swap a stash item into its slot (plusses travel with the item).
export function equipFromStash(state, idx) {
  const item = state.gear.stash[idx];
  if (!item) return false;
  state.gear.stash.splice(idx, 1);
  const cur = state.gear[item.slot];
  if (cur) state.gear.stash.push(cur);
  state.gear[item.slot] = item;
  return true;
}
