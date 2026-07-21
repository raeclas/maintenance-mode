// pull.js — the Pull + scars + projection, pure logic. No DOM; imported by
// the game AND the sim. depth = scars + DPS×window/bossHP, break at 100%
// (REMAKE-DESIGN §3).
import { getBoss } from "./bosses.js";
import { derive } from "./stats.js";
import { ticketYield, BREAK_TICKETS } from "./gm.js";

// Starting values (Numbers Policy). Test plan: W1 should feel like a siege —
// ~5-6 pulls, scars visibly chipping. If walls "fall over", lower SCAR_CAP;
// if rage-quits, raise it (§3). Variance is the projection band's width —
// tight enough that progress is real, wide enough for hope.
export const VARIANCE = 0.08;
export const COOLDOWN_MS = 60_000;
export const SCAR_CAP = 0.27;  // §3: pity capped at 25–30% of boss HP
export const SCAR_RATE = 0.10; // fraction of a failed pull's damage that persists

// GM-panel perks (rank-capped in gm.js) modify these per state:
export function cooldownMs(state) { return COOLDOWN_MS - (state.gm?.cooldown || 0) * 5_000; }
export function scarCap(state) { return SCAR_CAP + (state.gm?.scar || 0) * 0.01; }

export function dps(player) {
  return player.atk * player.hitsPerSec;
}

// Fresh damage a single pull deals at EV, as a fraction of boss HP.
export function expectedDepth(player, boss) {
  return (dps(player) * boss.windowS) / boss.hp;
}

// Projection band: what the next pull's TOTAL depth (scars included) lands in.
export function band(player, boss, scars) {
  const ev = expectedDepth(player, boss);
  return { lo: scars + ev * (1 - VARIANCE), hi: scars + ev * (1 + VARIANCE) };
}

// P(total depth ≥ 100%) — analytic, uniform band.
export function breakChance(player, boss, scars = 0) {
  const { lo, hi } = band(player, boss, scars);
  if (hi <= 1) return 0;
  if (lo >= 1) return 1;
  return (hi - 1) / (hi - lo);
}

// EV forecast: pulls until the wall breaks, assuming every pull rolls EV.
// The countable daydream (§3 projection). Infinity = power can't break it.
export function pullsToBreakEV(player, boss, scars, cap = SCAR_CAP) {
  const ev = expectedDepth(player, boss);
  let s = scars;
  for (let n = 1; n <= 1000; n++) {
    if (s + ev >= 1) return n;
    const grown = Math.min(cap, s + ev * SCAR_RATE);
    if (grown === s) return Infinity; // scars capped, EV still short
    s = grown;
  }
  return Infinity;
}

export function rollDepth(player, boss, rng = Math.random) {
  const ev = expectedDepth(player, boss);
  return ev * (1 - VARIANCE + 2 * VARIANCE * rng());
}

export function canPull(state, now) {
  return !state.pull && !state.boss.broken && now >= state.cooldownUntil;
}

export function startPull(state, now, rng = Math.random) {
  if (!canPull(state, now)) return false;
  const boss = getBoss(state.wall);
  state.pull = {
    startedAt: now,
    endsAt: now + boss.windowS * 1000,
    rolledFresh: rollDepth(derive(state), boss, rng),
  };
  return true;
}

// Fraction of the enrage window elapsed, 0..1.
export function pullFrac(state, now) {
  const p = state.pull;
  if (!p) return 0;
  return Math.min(1, (now - p.startedAt) / (p.endsAt - p.startedAt));
}

// Total depth right now: permanent scars + fresh damage accruing linearly.
export function currentDepth(state, now) {
  const p = state.pull;
  if (!p) return state.boss.scars;
  return state.boss.scars + p.rolledFresh * pullFrac(state, now);
}

// True once the pull is over: window elapsed, or 100% reached early.
export function pullDone(state, now) {
  return !!state.pull && (now >= state.pull.endsAt || currentDepth(state, now) >= 1);
}

// Idle encounter processing (GM unlock): resolve the attempts that would
// have fired while away. Same rolls, same scars, same faucets; count is
// clamped by the caller's already-clamped dt. Returns a summary.
export function processIdleAttempts(state, dtS, rng = Math.random) {
  const boss = getBoss(state.wall);
  const cycleS = cooldownMs(state) / 1000 + boss.windowS;
  let n = Math.floor(dtS / cycleS);
  const out = { attempts: 0, tickets: 0, best: 0, broke: false };
  while (n-- > 0 && !state.boss.broken) {
    state.cooldownUntil = 0;
    if (!startPull(state, 0, rng)) break;
    const depth = resolvePull(state, boss.windowS * 1000);
    const y = ticketYield(depth) + (state.boss.broken ? BREAK_TICKETS : 0);
    state.tickets += y;
    out.tickets += y;
    out.attempts++;
    out.best = Math.max(out.best, depth);
    if (state.boss.broken) out.broke = true;
  }
  state.cooldownUntil = Date.now() + (out.attempts ? cooldownMs(state) : 0);
  return out;
}

// Returns final total depth (capped at 100%). Break needs no cooldown;
// fail deepens scars (capped) and starts one.
export function resolvePull(state, now) {
  const fresh = state.pull.rolledFresh;
  const depth = Math.min(state.boss.scars + fresh, 1);
  state.pull = null;
  state.boss.pulls++;
  state.boss.bestDepth = Math.max(state.boss.bestDepth, depth);
  if (depth >= 1) {
    state.boss.broken = true;
  } else {
    state.boss.scars = Math.min(scarCap(state), state.boss.scars + fresh * SCAR_RATE);
    state.cooldownUntil = now + cooldownMs(state);
  }
  return depth;
}
