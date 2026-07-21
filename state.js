// state.js — single source of truth for the save shape.
// saveSystem normalizes over these defaults; the sim imports it too.
export function newState() {
  return {
    v: 4,
    lastSeen: 0,
    unlocked: false, // flips on first pull resolve — the intro beat reveal
    copper: 0,
    wall: 1,
    boss: { pulls: 0, bestDepth: 0, scars: 0, broken: false }, // per-current-wall record
    cooldownUntil: 0, // epoch ms — survives reload
    pull: null,       // transient {startedAt, endsAt, rolledFresh} — never serialized
    // Bot Farm: population FLOW. Generator fills toward server capacity;
    // farming bots get banned at zone detection rates. Alloc = % of pop.
    bots: {
      pop: 2,         // live bot accounts (float — it's a stream)
      banned: 0,      // lifetime bans (log flavor)
      capRank: 0,     // session slots: capacity = 8 + 4×rank
      createRank: 0,  // generator: 2/h × (1 + 0.5×rank)
      powerRank: 0,   // script quality: power = 1 + 0.25×rank
      speedRank: 0,   // hardware: speed = 1 + 0.20×rank
      alloc: { atk: 1, spd: 1, farm: 0 }, // absolute bot counts; rest idle
      farmZone: 0,
      bars: { atk: { lvl: 0, prog: 0 }, speed: { lvl: 0, prog: 0 } },
    },
    gear: {
      weapon: null, armor: null, charm: null,
      stash: [],          // item = {slot, ip, plus, zone, name, lock?}
      autoSalvage: false, // salvage non-upgrades on drop instead of stashing
    },
    farm: { zone: null, dropCarry: 0 },
  };
}
