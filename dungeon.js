// dungeon.js — the character's DELVE: a push-your-luck descent, their own
// active verb (not the bots, not the boss coin-flip). Each floor is cleared
// by the character's BUILD (boss DPS = atk×hits/s, so gear/training/trophies/
// scripts all count — law 9 via existing power). Clear → loot into the HAUL →
// descend (harder, exponentially better) or extract (bank). Push past your
// power ceiling and the clear becomes a coin-flip; wipe and the un-banked haul
// is lost. This is the character's copper + gear source (salvage = scrap only).
//
// Timing/auto/offline live in main.js (cadence + the away-safe loop); this
// module is pure: difficulty, odds, loot, and the descend/extract mutations.
export const CLEAR_S = 2;              // seconds per floor (pacing; main gates it)
const DIFF_BASE = 10, DIFF_GROWTH = 1.7;
// Loot GROWS SLOWER than difficulty (1.4 < 1.7) so pushing infinitely deep has
// diminishing copper-per-risk — the greed is self-bounding. The Delve is the
// character's COPPER source only; it no longer drops gear (that was the
// unbounded runaway that out-geared the zones). Playtest-tuned.
const COPPER_BASE = 8, LOOT_GROWTH = 1.4;

export function diff(floor) { return Math.round(DIFF_BASE * Math.pow(DIFF_GROWTH, floor - 1)); }

// 1.0 while the floor is within your power; drops below it once diff outpaces
// your DPS — that's the gamble band beyond your safe depth.
export function clearChance(floor, dps) {
  const r = dps / diff(floor);
  return r >= 1 ? 1 : Math.max(0, Math.pow(r, 1.5));
}

// Deepest floor you clear for certain (the away-safe target).
export function safeDepth(dps) {
  let n = 0;
  while (n < 999 && clearChance(n + 1, dps) >= 1) n++;
  return n;
}

export function floorCopper(floor) { return Math.round(COPPER_BASE * Math.pow(LOOT_GROWTH, floor - 1)); }

function resetRun(d) { d.active = false; d.floor = 0; d.haul = { copper: 0 }; }

// Attempt the next floor. Success → copper into haul, floor++. Fail → WIPE:
// the un-banked haul is lost and the run resets. Returns an event to log.
export function descend(state, dps, rng = Math.random) {
  const d = state.dungeon;
  d.active = true;
  const next = d.floor + 1;
  if (rng() < clearChance(next, dps)) {
    d.floor = next;
    d.best = Math.max(d.best || 0, next);
    const copper = floorCopper(next);
    d.haul.copper += copper;
    return { cleared: true, floor: next, copper };
  }
  const lost = { copper: d.haul.copper, floor: d.floor };
  resetRun(d);
  return { cleared: false, wipedAt: next, lost };
}

// Bank the haul copper to the wallet. Run resets.
export function extract(state) {
  const d = state.dungeon;
  const out = { copper: d.haul.copper, floor: d.floor };
  state.copper += d.haul.copper;
  resetRun(d);
  return out;
}
