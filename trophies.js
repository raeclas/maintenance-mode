// trophies.js — boss Trophy SETS. Each Warden has its own 7-piece set (the
// seven parts of its door). You break the boss for a guaranteed first piece +
// Farm status, then RE-FARM the boss (re-Attempt) for a chance at the rest.
// Own all 7 of a boss's set → that boss's set bonus. Pieces are permanent,
// displayed stat boosts (law 5) that survive every Ban Wave (attachment law 8).
//
// Data-driven: a boss just declares `set: { name, mult }` (bosses.js). The 7
// pieces are generated from the shared PARTS template scaled by mult, so a new
// boss auto-gets a full set. state.setPieces = { [wall]: [owned part indices] }.
import { getBoss } from "./bosses.js";

// The seven parts of a door — one lane each (law 6). Base pcts; a boss's `mult`
// scales them (deeper Warden = stronger set). Starting values, playtest-tuned.
export const PARTS = [
  { part: "Hinge",     lane: "atk",   pct: 4 },
  { part: "Bolt",      lane: "atk",   pct: 4 },
  { part: "Latch",     lane: "speed", pct: 4 },
  { part: "Keyward",   lane: "speed", pct: 4 },
  { part: "Lintel",    lane: "atk",   pct: 5 },
  { part: "Threshold", lane: "farm",  pct: 8 },
  { part: "Frame",     lane: "atk",   pct: 5 },
];
export const SET_BONUS = 0.5;        // ×1.5 player damage per COMPLETED boss set
export const FARM_DROP_CHANCE = 0.25; // per farm-Attempt, chance at a new piece

export function bossHasSet(wall) { return !!getBoss(wall)?.set; }

// A concrete piece instance for a wall + part index (name + scaled stat).
export function pieceOf(wall, idx) {
  const b = getBoss(wall);
  const p = PARTS[idx];
  if (!b?.set || !p) return null;
  return { wall, idx, part: p.part, name: `${b.name}'s ${p.part}`,
    lane: p.lane, pct: Math.max(1, Math.round(p.pct * b.set.mult)) };
}

export function ownedIdxs(state, wall) { return state.setPieces?.[wall] || []; }
export function ownsPiece(state, wall, idx) { return ownedIdxs(state, wall).includes(idx); }
export function setCount(state, wall) { return ownedIdxs(state, wall).length; }
export function setComplete(state, wall) {
  return bossHasSet(wall) && PARTS.every((_, i) => ownsPiece(state, wall, i));
}

function grant(state, wall, idx) {
  if (!state.setPieces) state.setPieces = {};
  if (!state.setPieces[wall]) state.setPieces[wall] = [];
  if (state.setPieces[wall].includes(idx)) return null;
  state.setPieces[wall].push(idx);
  return pieceOf(wall, idx);
}

function pickUnowned(state, wall, rng) {
  const unowned = PARTS.map((_, i) => i).filter(i => !ownsPiece(state, wall, i));
  return unowned.length ? unowned[Math.floor(rng() * unowned.length)] : -1;
}

// Guaranteed piece on the break (the boss's first drop).
export function grantBreakPiece(state, wall, rng = Math.random) {
  if (!bossHasSet(wall)) return null;
  const idx = pickUnowned(state, wall, rng);
  return idx < 0 ? null : grant(state, wall, idx);
}

// One farm-Attempt roll: chance at a random not-yet-owned piece.
export function rollFarmDrop(state, wall, rng = Math.random) {
  if (!bossHasSet(wall) || rng() >= FARM_DROP_CHANCE) return null;
  const idx = pickUnowned(state, wall, rng);
  return idx < 0 ? null : grant(state, wall, idx);
}

// Aggregate all owned pieces (every boss) + per-completed-set bonus for derive.
export function trophyMods(state) {
  let atkPct = 0, hastePct = 0, copperPct = 0, dmgMult = 1;
  const sp = state.setPieces || {};
  for (const w of Object.keys(sp)) {
    const wall = Number(w);
    for (const idx of sp[w]) {
      const p = pieceOf(wall, idx);
      if (!p) continue;
      if (p.lane === "atk") atkPct += p.pct;
      else if (p.lane === "speed") hastePct += p.pct;
      else if (p.lane === "farm") copperPct += p.pct;
    }
    if (setComplete(state, wall)) dmgMult *= 1 + SET_BONUS;
  }
  return { atkPct, hastePct, copperPct, dmgMult };
}
