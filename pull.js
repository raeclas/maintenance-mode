// pull.js — the Pull, pure logic. No DOM; imported by the game AND the sim.
// depth = DPS × window / bossHP, break at 100% (REMAKE-DESIGN §3).
import { getBoss } from "./bosses.js";

// Starting values (Numbers Policy). Variance is the seed of §3's projection
// band; test plan: 3–6 pulls to break W1 — if breaks feel arbitrary, narrow
// the band, never push EV past 100%.
// ponytail: this milestone the breaking pull is earned by luck, not power —
// scars (M2) and enhance (M3) make it earned.
export const VARIANCE = 0.08;
export const COOLDOWN_MS = 60_000;

export function dps(player) {
  return player.atk * player.hitsPerSec;
}

export function expectedDepth(player, boss) {
  return (dps(player) * boss.windowS) / boss.hp;
}

// P(roll ≥ 100%) for a uniform band ev±VARIANCE — analytic, used by sim + UI.
export function breakChance(player, boss) {
  const ev = expectedDepth(player, boss);
  const lo = ev * (1 - VARIANCE), hi = ev * (1 + VARIANCE);
  if (hi <= 1) return 0;
  if (lo >= 1) return 1;
  return (hi - 1) / (hi - lo);
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
    rolledTotal: rollDepth(state.player, boss, rng),
  };
  return true;
}

// Fraction of the enrage window elapsed, 0..1.
export function pullFrac(state, now) {
  const p = state.pull;
  if (!p) return 0;
  return Math.min(1, (now - p.startedAt) / (p.endsAt - p.startedAt));
}

// Depth accrues linearly across the window toward the rolled total.
export function currentDepth(state, now) {
  const p = state.pull;
  if (!p) return 0;
  return p.rolledTotal * pullFrac(state, now);
}

// True once the pull is over: window elapsed, or 100% reached early.
export function pullDone(state, now) {
  return !!state.pull && (now >= state.pull.endsAt || currentDepth(state, now) >= 1);
}

// Returns final depth (capped at 100%). Break needs no cooldown; fail starts one.
export function resolvePull(state, now) {
  const depth = Math.min(state.pull.rolledTotal, 1);
  state.pull = null;
  state.boss.pulls++;
  state.boss.bestDepth = Math.max(state.boss.bestDepth, depth);
  if (depth >= 1) state.boss.broken = true;
  else state.cooldownUntil = now + COOLDOWN_MS;
  return depth;
}
