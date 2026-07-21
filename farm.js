// farm.js — zone data. Zones are BOT-ONLY (the player's verb is the Boss):
// each zone runs when its squad's DPS (number × strength) clears the gate.
// Kills cap at 50/s per zone (NGU engine ceiling). Drops are chance-based
// per kill, rolled from the zone's IP band by the squad (see bots.js).
export const DROP_CHANCE = 1 / 400;  // per kill
export const OFFLINE_CAP_S = 12 * 3600;
export const KILL_CAP = 50;
// GM offline perk extends the clamp (rank-capped at +6h in gm.js)
export function offlineCapS(state) { return OFFLINE_CAP_S + (state.gm?.offline || 0) * 3600; }

// gate = minimum SQUAD DPS to hold the zone (starting values, sim-gated).
// detection: anti-cheat bans per farming bot per hour in this zone.
// Zone names speak the DEAD GAME register (feature-pass gate 3): the old
// world's leveling path, ending at the raid gate Vess guards.
// mobHP / gates sized to the BOT curve (bot dps ~12-130), not the player's
// boss DPS — zones are the swarm's ladder now.
export const zones = [
  { id: "z1", name: "Novice Meadow", gate: 0, mobHp: 12, copper: 5, ipLo: 10, ipHi: 30, mob: "Training Slime", detection: 0.02 },
  { id: "z2", name: "Webbed Ravine", gate: 120, mobHp: 60, copper: 20, ipLo: 40, ipHi: 120, mob: "Ravine Weaver", detection: 0.05 },
  { id: "z3", name: "Salt Flats", gate: 600, mobHp: 250, copper: 75, ipLo: 150, ipHi: 450, mob: "Salt Strider", detection: 0.1 },
  { id: "z4", name: "Cinder Steppe", gate: 2400, mobHp: 700, copper: 300, ipLo: 600, ipHi: 1800, mob: "Steppe Charger", detection: 0.15 },
  { id: "z5", name: "The Doorstep", gate: 7000, mobHp: 1500, copper: 2250, ipLo: 4500, ipHi: 13500, mob: "Door Sentry", detection: 0.25 },
];
