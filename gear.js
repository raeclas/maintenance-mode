// gear.js — Diablo-style item power: ONE scalar per item, zero special
// effects in v1. contribution = ip × (1 + 0.10 × plus) ATK.
// Attachment law: nothing is ever destroyed — replaced gear goes to stash.

export const SLOTS = ["weapon", "armor", "charm"];

// Dead-game register; names follow the zone that drops them.
const NAMES = {
  weapon: ["Rusty Shortsword", "Ravine Pike", "Salt-Etched Saber", "Cinder Warblade", "Sentry Halberd"],
  armor: ["Padded Vest", "Weaver-Silk Jerkin", "Salt-Crusted Cuirass", "Cinder Scale Coat", "Sentry Plate"],
  charm: ["Cracked Bead", "Weaver-Eye Charm", "Salt Talisman", "Ember Sigil", "Door Sentry Sigil"],
};

// Compounding, not linear: every plus is felt, high plusses are events
// (starting value 1.12 — +12 ≈ ×3.9, +20 ≈ ×9.6; sim-gated).
export function contribution(item) {
  return item.ip * Math.pow(1.12, item.plus);
}

// zoneIdx 0-based; band comes from farm.js zone table
export function rollItem(zone, zoneIdx, rng = Math.random) {
  const slot = SLOTS[Math.floor(rng() * SLOTS.length)];
  const ip = Math.round(zone.ipLo + (zone.ipHi - zone.ipLo) * rng());
  return { slot, ip, plus: 0, zone: zoneIdx + 1, name: NAMES[slot][zoneIdx] };
}

export const STASH_CAP = 50;
export const SALVAGE_RATE = 0.5; // copper per ip when an item decomposes

// Salvage value: an item decomposes into copper (visible, never silent).
export function salvageValue(item) {
  return Math.max(1, Math.round(SALVAGE_RATE * item.ip));
}

export function salvage(state, item) {
  const v = salvageValue(item);
  state.copper += v;
  return v;
}

// Stash discipline: locked and equipped items are untouchable; past the
// cap, the lowest-contribution unlocked item decomposes (logged by caller).
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
  salvage(state, gone);
  return gone;
}

// Equip if strictly better than current; loser goes to stash (or straight
// to salvage when autoSalvage is on and the drop isn't an upgrade).
// Returns { equipped, salvaged, overflow } for the caller's log line.
export function autoEquip(state, item) {
  const cur = state.gear[item.slot];
  if (!cur || contribution(item) > contribution(cur)) {
    let overflow = null;
    if (cur) overflow = stashPush(state, cur);
    state.gear[item.slot] = item;
    return { equipped: true, salvaged: false, overflow };
  }
  if (state.gear.autoSalvage) {
    salvage(state, item);
    return { equipped: false, salvaged: true, overflow: null };
  }
  return { equipped: false, salvaged: false, overflow: stashPush(state, item) };
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
