// instance.js — Dungeons (POC). The wall is never HP: a run ends when a
// mechanic goes UNANSWERED, and mechanics go unanswered because attrition ate
// the bots that were answering them. Sacrifice buys depth, never a dice roll —
// every number here is projected and displayed before you commit.
//
// Deliberately pure: the caller passes dps in (same posture as dungeon.js), so
// the whole model is testable without the DOM.
import { zones } from "./farm.js";
import { rollItem, routeDrop } from "./gear.js";

export const FLOOR_SECONDS = 6;    // floor 1 clear time at anchor CP
export const FLOOR_GROWTH = 1.15;  // each floor is this much longer
export const WIPE_AT = 0.25;       // penalty floor — below this the party wipes
export const BAN_BASE = 0.02;      // per floor, × key × 1.15^floor of staffed
export const BAN_GROWTH = 1.15;
export const BAN_CAP = 0.5;
export const PROXY_COST = 250;     // copper, per run
export const PROXY_CUT = 0.25;     // proxy rotation shaves this off the ban rate
// Dying costs you MOST of the run's loot, not all of it. A total wipe-out is a
// feel-bad snap that pushes players to bank early and never gamble; a penalty
// keeps the push-or-pull-out decision live without punishing a bad read.
export const WIPE_KEEP = 0.4;

// Each mechanic re-values a lane the player would otherwise ignore — this is
// the twist vehicle REMAKE-DESIGN wants for W2, not just a stat gate.
export const MECHANICS = [
  { id: "sunder",  label: "Sunder",      duty: "interrupt", pen: 0.12, gate: 0, lane: "speed" },
  { id: "dispel",  label: "Mass Dispel", duty: "dispel",    pen: 0.10, gate: 3, lane: "gear" },
  { id: "adds",    label: "Summon Adds", duty: "adds",      pen: 0.15, gate: 5, lane: "atk" },
];
export const DUTIES = MECHANICS.map(m => m.duty);

// Live mechanics grow with the key; coverage need grows every 2 levels.
export function liveMechanics(key) { return MECHANICS.slice(0, Math.min(key, MECHANICS.length)); }
export function needPerMechanic(key) { return Math.ceil(key / 2); }
// A duty is only coverable once the swarm's scripts are good enough.
export function dutyUnlocked(state, m) { return (state.bots.powerRank || 0) >= m.gate; }

export function banRate(key, floor, proxy) {
  const r = BAN_BASE * key * Math.pow(BAN_GROWTH, floor - 1);
  return Math.min(BAN_CAP, r * (proxy ? 1 - PROXY_CUT : 1));
}

export function floorTime(floor) { return FLOOR_SECONDS * Math.pow(FLOOR_GROWTH, floor - 1); }

// ---- the run, resolved one floor at a time -------------------------------
// Pure: takes a party snapshot, returns what the floor did to it. Used live by
// the tick AND by the pre-run projection, so the projection cannot lie.
export function resolveFloor(party, key, floor, proxy) {
  const need = needPerMechanic(key);
  const unanswered = [], answered = [];
  let mult = 1;
  for (const m of liveMechanics(key)) {
    // Bot counts are a stream (floats, like bots.pop) — a duty covers only with
    // WHOLE bodies on it. Rounding losses up instead would strip a whole bot on
    // floor 1 at any rate, collapsing every run before it started.
    if (Math.floor(party[m.duty] || 0) >= need) { answered.push(m); continue; }
    unanswered.push(m);
    mult *= 1 - m.pen;
  }
  const rate = banRate(key, floor, proxy);
  const lost = {};
  for (const d of DUTIES) {
    const n = party[d] || 0;
    lost[d] = Math.min(n, n * rate);
  }
  return { unanswered, answered, mult, lost };
}

// How deep this party clears before the penalty stack wipes it. Deterministic —
// this is the number the player commits against.
export function projectDepth(state) {
  const inst = state.instance;
  const party = { ...inst.party };
  let mult = 1, floor = 0;
  while (floor < 200) {
    const r = resolveFloor(party, inst.key, floor + 1, inst.proxy);
    if (mult * r.mult < WIPE_AT) break;
    mult *= r.mult;
    for (const d of DUTIES) party[d] -= r.lost[d];
    floor++;
  }
  return floor;
}

// Bots committed to the run leave the general pool; survivors come back.
export function partyCost(inst) { return DUTIES.reduce((s, d) => s + (inst.party[d] || 0), 0); }

export function canStart(state) {
  const inst = state.instance;
  return !inst.running && partyCost(inst) > 0 && Math.floor(state.bots.pop) >= partyCost(inst);
}

export function start(state) {
  if (!canStart(state)) return false;
  const inst = state.instance;
  if (inst.proxy) {
    if (state.copper < PROXY_COST) { inst.proxy = false; }
    else state.copper -= PROXY_COST;
  }
  state.bots.pop -= partyCost(inst);
  inst.running = true;
  inst.floor = 0;
  inst.haul = 0;
  inst.mult = 1;
  inst.carry = 0;
  inst.staffed = { ...inst.party };
  return true;
}

// Survivors rejoin the swarm. keepFrac of the haul becomes real drops — 1 when
// you pull out cleanly, WIPE_KEEP when the party dies.
export function finish(state, keepFrac, rng = Math.random) {
  const inst = state.instance;
  const items = [];
  const kept = Math.floor(inst.haul * keepFrac);
  if (kept > 0) {
    const zi = Math.min(inst.floor, zones.length - 1);
    for (let i = 0; i < kept; i++) {
      const item = rollItem(zones[zi], zi, rng, Math.min(3, Math.floor(inst.key / 3)));
      routeDrop(state, item);
      items.push(item);
    }
  }
  inst.best = Math.max(inst.best || 0, inst.floor); // how deep you got, win or lose
  state.bots.pop += DUTIES.reduce((s, d) => s + (inst.staffed[d] || 0), 0);
  inst.running = false;
  inst.staffed = null;
  inst.haul = 0;
  return items;
}

// One tick of a live run. Returns events for the log/journal to render.
export function tick(state, dps, dt, rng = Math.random) {
  const inst = state.instance;
  if (!inst.running) return null;
  const ev = { cleared: [], unanswered: [], banned: 0, wiped: false, banked: false, items: [] };
  inst.carry += dps * inst.mult * dt;
  let guard = 0;
  while (guard++ < 50) {
    const need = floorTime(inst.floor + 1) * dps; // anchor: floor 1 ≈ FLOOR_SECONDS at full CP
    if (inst.carry < need) break;
    inst.carry -= need;
    inst.floor++;
    const r = resolveFloor(inst.staffed, inst.key, inst.floor, inst.proxy);
    for (const d of DUTIES) { inst.staffed[d] -= r.lost[d]; ev.banned += r.lost[d]; }
    state.bots.banned += Object.values(r.lost).reduce((s, n) => s + n, 0);
    inst.mult *= r.mult;
    inst.haul++;
    ev.cleared.push(inst.floor);
    // The journal writes itself — meeting a mechanic logs it, answering it
    // solves it for good. Knowledge is the thing that ratchets here.
    for (const m of [...r.unanswered, ...r.answered]) {
      if (!inst.journal[m.id]) inst.journal[m.id] = { seen: true, solved: false };
    }
    for (const m of r.answered) inst.journal[m.id].solved = true;
    for (const m of r.unanswered) ev.unanswered.push(m);
    if (inst.mult < WIPE_AT) { ev.wiped = true; ev.lost = inst.haul - Math.floor(inst.haul * WIPE_KEEP); ev.items = finish(state, WIPE_KEEP, rng); return ev; }
    if (inst.floor >= inst.bankAt) { ev.banked = true; ev.items = finish(state, 1, rng); return ev; }
  }
  return ev;
}
