// pull.js — the Siege: an idle battler. The Warden is a persistent HP pool that
// drains continuously at Combat Power (derive().atk × hits/s, crit factor
// folded in). No pulls, no scars, no cooldown, no luck — the bar IS your
// progress and never regenerates. Break at hp ≤ 0. A broken Warden switches to
// Farm status: a timed set-piece roll (Trophy sets, guideline 8).
//
// (Old pull/scars/window/EV-projection model retired 2026-07-25 — the fight is
// earned power over time now, not lucky pulls. REWORK-IDLE-BATTLER.md.)
import { getBoss } from "./bosses.js";
import { derive } from "./stats.js";
import { delveBonus } from "./dungeon.js";
import { rollFarmDrop } from "./trophies.js";

// The one number that damages Wardens: character DPS with crits folded in.
export function combatPower(state) {
  const d = derive(state);
  return d.atk * d.hitsPerSec;
}

// Live drain: chip the frontier Warden's HP by CP over dtS seconds. No-op on a
// broken Warden (that path farms). Returns { dealt, broke, cp }.
export function drain(state, dtS) {
  if (state.boss.broken || dtS <= 0) return { dealt: 0, broke: false, cp: 0 };
  const cp = combatPower(state);
  const dealt = Math.min(state.boss.hp, cp * dtS);
  state.boss.hp = Math.max(0, state.boss.hp - dealt);
  const broke = state.boss.hp <= 0;
  if (broke) state.boss.broken = true; // caller grants rewards + dialogue + descend
  return { dealt, broke, cp };
}

// Skill bursts (Power Smash, Wild Swing, Energy Burst, Blade Dance riders)
// land through here — drain's guard and break semantics for a flat amount
// instead of CP×dt, so every damage path shares ONE break transition.
export function smite(state, dmg) {
  if (state.boss.broken || dmg <= 0) return { dealt: 0, broke: false };
  const dealt = Math.min(state.boss.hp, dmg);
  state.boss.hp = Math.max(0, state.boss.hp - dealt);
  const broke = state.boss.hp <= 0;
  if (broke) state.boss.broken = true;
  return { dealt, broke };
}

// Estimated seconds to kill at current CP — the readout that reads huge on
// arrival and drops as you scale. null when there's nothing to kill.
export function timeToKill(state) {
  if (state.boss.broken) return null;
  const cp = combatPower(state);
  return cp > 0 ? state.boss.hp / cp : Infinity;
}

// Fraction of the Warden's HP already gone (for the bar).
export function hpFrac(state) {
  const boss = getBoss(state.wall);
  if (!boss?.hp) return state.boss.broken ? 1 : 0;
  return Math.min(1, 1 - (state.boss.hp || 0) / boss.hp);
}

// Farm status: a broken Warden yields a set-piece roll every FARM_INTERVAL
// seconds of farming. Carry lives on state.boss.farmCarry.
export const FARM_INTERVAL = 30; // seconds per farm "kill"

export function farmTick(state, dtS) {
  const out = { rolls: 0, pieces: [] };
  if (!state.boss.broken || dtS <= 0) return out;
  let carry = (state.boss.farmCarry || 0) + dtS;
  while (carry >= FARM_INTERVAL) {
    carry -= FARM_INTERVAL;
    out.rolls++;
    const piece = rollFarmDrop(state, state.wall);
    if (piece) out.pieces.push(piece);
  }
  state.boss.farmCarry = carry;
  return out;
}

// Offline: same drain/farm as live, dtS already clamped by the caller. One
// linear drain call (CP constant across the batch — a slight over-credit
// bounded by the offline cap). Returns a summary for the log.
export function processIdle(state, dtS) {
  if (state.boss.broken) {
    const f = farmTick(state, dtS);
    return { broke: false, dealt: 0, farm: f };
  }
  const r = drain(state, dtS);
  return { broke: r.broke, dealt: r.dealt, farm: null };
}
