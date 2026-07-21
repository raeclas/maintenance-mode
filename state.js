// state.js — single source of truth for the save shape.
// saveSystem normalizes over these defaults; the sim imports it too.
export function newState() {
  return {
    v: 2,
    lastSeen: 0,
    unlocked: false, // flips on first pull resolve — the intro beat reveal
    copper: 0,
    wall: 1,
    boss: { pulls: 0, bestDepth: 0, scars: 0, broken: false }, // per-current-wall record
    cooldownUntil: 0, // epoch ms — survives reload
    pull: null,       // transient {startedAt, endsAt, rolledFresh} — never serialized
    // Bot Farm: NGU triple — bar progress/s = assigned × power × speed.
    bots: {
      count: 2,       // borrowed accounts; more bought with copper
      powerRank: 0,   // script quality: power = 1 + 0.25×rank
      speedRank: 0,   // hardware: speed = 1 + 0.20×rank
      assign: { atk: 1, speed: 1 },
      bars: { atk: { lvl: 0, prog: 0 }, speed: { lvl: 0, prog: 0 } },
    },
    gear: { weapon: null, armor: null, charm: null, stash: [] }, // item = {slot, ip, plus, zone, name}
    farm: { zone: null, dropCarry: 0 },
  };
}
