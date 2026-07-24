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
  // Region 2 — behind the First Door (what Vess guarded). Same 5-zone ladder,
  // ×3 ip/gate steps continued. Bot-lane numbers = playtest-tuned, not sim-gated.
  { id: "z6", name: "The Threshold", gate: 21000, mobHp: 5000, copper: 7000, ipLo: 13500, ipHi: 40500, mob: "Threshold Husk", detection: 0.3 },
  { id: "z7", name: "Ashen Nave", gate: 63000, mobHp: 16000, copper: 21000, ipLo: 40500, ipHi: 121500, mob: "Nave Revenant", detection: 0.35 },
  { id: "z8", name: "Flooded Undercroft", gate: 190000, mobHp: 52000, copper: 65000, ipLo: 121500, ipHi: 364500, mob: "Undercroft Lurker", detection: 0.4 },
  { id: "z9", name: "The Long Dark", gate: 570000, mobHp: 170000, copper: 200000, ipLo: 364500, ipHi: 1093500, mob: "Pale Sentinel", detection: 0.45 },
  { id: "z10", name: "The Second Door", gate: 1700000, mobHp: 550000, copper: 620000, ipLo: 1093500, ipHi: 3280500, mob: "Sealed Warden", detection: 0.5 },
  // Region 3 — deeper into the dead server. ×3 ip/gate steps continued.
  { id: "z11", name: "Frostbound Wastes", gate: 5100000, mobHp: 1650000, copper: 1860000, ipLo: 3280500, ipHi: 9841500, mob: "Wastes Wight", detection: 0.5 },
  { id: "z12", name: "The Sunken Archive", gate: 15300000, mobHp: 5000000, copper: 5600000, ipLo: 9841500, ipHi: 29524500, mob: "Archive Colossus", detection: 0.52 },
  { id: "z13", name: "Obsidian Reach", gate: 46000000, mobHp: 15000000, copper: 17000000, ipLo: 29524500, ipHi: 88573500, mob: "Reach Devourer", detection: 0.54 },
  { id: "z14", name: "The Hollow Spire", gate: 138000000, mobHp: 45000000, copper: 50000000, ipLo: 88573500, ipHi: 265720500, mob: "Spire Revenant", detection: 0.56 },
  { id: "z15", name: "World's Edge", gate: 414000000, mobHp: 135000000, copper: 150000000, ipLo: 265720500, ipHi: 797161500, mob: "Edge Sentinel", detection: 0.58 },
];
