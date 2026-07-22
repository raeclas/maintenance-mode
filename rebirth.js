// rebirth.js — "Ban Wave" (§7b). Player-triggered prestige, never scheduled
// (no-obligation law). The anti-cheat finally notices the farm: the bot
// stratum (born-disposable, law 8 amendment) is wiped, but your SCRIPTS —
// the botting know-how — survive the ban and permanently lift damage.
//
// Because bot squad DPS is player-coupled, a PLAYER-damage multiplier lifts
// BOTH the boss fight and the farm at once — one clean displayed term that
// keeps going up across every reset.
import { newState } from "./state.js";

export const SCRIPT_DMG = 0.01; // +1% player damage per script (starting value, playtest-tuned)

export function totalFills(state) {
  const b = state.bots;
  return b.bars.atk.fills.reduce((s, n) => s + n, 0) + b.bars.speed.fills.reduce((s, n) => s + n, 0);
}

// Scripts a Ban Wave pays RIGHT NOW: √(training fills this run). The √ starves
// rebirth-spam (§7b abuse gate) — doubling the grind is far less than double pay.
export function pendingScripts(state) {
  return Math.floor(Math.sqrt(totalFills(state)));
}

// The permanent player-damage multiplier from banked scripts (displayed, law 5).
export function scriptMult(state) {
  return 1 + SCRIPT_DMG * (state.scripts || 0);
}

// Perform the Ban Wave. Banks scripts, resets ONLY the born-disposable bot
// stratum + copper. Keeps everything the character owns (attachment law 8):
// gear + scrap + stash, rig ranks, tickets, GM perks, scars, titles, wall.
// All bots are FREED (clean slate) — you re-allocate as the farm regrows. A
// "restore last allocation" convenience is a later automation slice, not a
// persisted over-allocation (pop resets to the seed, so persisting absolute
// counts just displays alloc 15 / pop 2 nonsense).
export function banWave(state) {
  const gained = pendingScripts(state);
  if (gained <= 0) return 0;
  state.scripts = (state.scripts || 0) + gained;
  state.rebirths = (state.rebirths || 0) + 1;

  const b = state.bots, f = newState().bots;
  b.pop = f.pop;             // farm collapses to seed population
  b.bars = f.bars;           // training tiers re-lock, fills/prog zeroed
  b.trained = f.trained;     // trained ATK/hits back to base
  b.alloc = f.alloc;         // all bots freed — fresh allocation
  b.enhCarry = 0;
  // rig ranks, tPriv, enhTarget persist as-is (bought upgrades, not the swarm)
  state.copper = 0;
  return gained;
}
