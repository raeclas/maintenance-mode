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

/* Depth is the SPINE, and until now it fed prestige nothing. Scripts came only
   from training fills, so breaking Vess, then Maren, then Korrin left every
   future Ban Wave paying exactly what it paid before. The ten-door ladder sat
   BESIDE the prestige loop instead of driving it — which is the real reason the
   tenth door did not read as an ending. Nothing about descending compounded.

   MULTIPLICATIVE, not a flat bonus per door, because the COST per door is
   multiplicative: wall HP climbs ~9x per wall. A `+k per door` term decays to
   irrelevance by the deep walls, which is the exact opposite of "pushing
   bosses pays". A constant proportional reward against a constant proportional
   cost keeps the incentive alive at every depth — while still growing far
   slower than the HP curve, so prestige alone can never outrun the ladder.

   Starting value 1.45 per door (W1 1.00 -> W5 4.4 -> W10 25.7). W1 is exactly
   1.0, so this changes nothing about the game as it currently plays; it only
   opens up as you descend.
   TEST: after breaking a door, the pending-scripts number should visibly jump
   on the next Ban Wave. If a break does not move a number the player notices,
   raise it. If a banked wave trivialises the NEXT door — wall N+1 falling
   faster than N did despite ~9x the HP — lower it.
   PLAYTEST-OWNED: internal/sim.js models a single run to the W1 break and does
   not model rebirth at all, so the sim cannot judge this number and will not
   drift on it. The user is the sim here, as with the bot lane.              */
export const DEPTH_PER_DOOR = 1.45;

// Doors cleared, as a multiplier on the Ban Wave payout. `maxWall` is monotonic
// and survives every reset, so depth cannot be farmed by rebirth-spam — the
// only way to raise it is to break a door you have never broken.
export function depthMult(state) {
  return DEPTH_PER_DOOR ** Math.max(0, (state.maxWall || 1) - 1);
}

// Scripts a Ban Wave pays RIGHT NOW: √(training fills this run) × depth. The √
// still starves rebirth-spam (§7b abuse gate) — doubling the grind is far less
// than double pay — and depth cannot be spammed at all, so the gate holds.
export function pendingScripts(state) {
  return Math.floor(Math.sqrt(totalFills(state)) * depthMult(state));
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
  // rig ranks, tPriv persist as-is (bought upgrades, not the swarm)
  state.copper = 0;
  return gained;
}
