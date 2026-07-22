// trophies.js — the boss Trophy Set: a SEPARATE collection (not the 3 equip
// slots). Each Warden drops one unique piece on the break; owning it is a
// permanent, always-on displayed stat boost. Own every Warden's piece and the
// Set bonus lights up. Never resets — survives every Ban Wave (attachment law
// 8): the cabinet is the museum of everything you've conquered.
//
// Data lives on each boss (bosses.js `trophy`); this module is the code that
// reads it. Add a wall with a trophy → it appears here automatically.
import { bosses, getBoss } from "./bosses.js";

export const SET_BONUS = 0.5; // ×1.5 player damage when the whole set is owned

// Every trophy defined across all walls (the full set to chase).
export function allTrophyWalls() {
  return bosses.filter(b => b.trophy).map(b => b.wall);
}

export function ownsTrophy(state, wall) {
  return (state.trophies || []).includes(wall);
}

// Set completes when every defined trophy is owned (moving target: a new wall
// with a trophy re-opens the set until you break it too).
export function setComplete(state) {
  const all = allTrophyWalls();
  return all.length > 0 && all.every(w => ownsTrophy(state, w));
}

// Award a wall's trophy on its break. Idempotent. Returns the trophy or null.
export function awardTrophy(state, wall) {
  const t = getBoss(wall)?.trophy;
  if (!t) return null;
  if (!state.trophies) state.trophies = [];
  if (state.trophies.includes(wall)) return null;
  state.trophies.push(wall);
  return t;
}

// Aggregate the owned trophies' boosts for derive() — each a displayed term.
export function trophyMods(state) {
  let atkPct = 0, hastePct = 0;
  for (const w of state.trophies || []) {
    const t = getBoss(w)?.trophy;
    if (!t) continue;
    if (t.lane === "atk") atkPct += t.pct;
    else if (t.lane === "speed") hastePct += t.pct;
  }
  return { atkPct, hastePct, dmgMult: setComplete(state) ? 1 + SET_BONUS : 1 };
}
