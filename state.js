// state.js — single source of truth for the save shape.
// saveSystem normalizes over these defaults; the sim imports it too.
export function newState() {
  return {
    v: 1,
    lastSeen: 0,
    player: { atk: 10, hitsPerSec: 2.0 }, // starting values (REMAKE-DESIGN §3); lanes added when a system needs them
    wall: 1,
    boss: { pulls: 0, bestDepth: 0, scars: 0, broken: false }, // per-current-wall record; scars = permanent damage fraction
    cooldownUntil: 0, // epoch ms — survives reload
    pull: null,       // transient {startedAt, endsAt, rolledTotal} — never serialized
  };
}
