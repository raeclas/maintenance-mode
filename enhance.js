// enhance.js — the heartbeat, REMAKE-DESIGN §5 (ENDLESS since 2026-07-27).
// No MAX_PLUS: the +0→+20 emotional arc repeats forever in ERAS — odds key
// on plus % 20 (safe k%20<5, risk 5–11, nightmare 12–19), so +21 opens a
// fresh safe band while cost ×1.6^plus compounds forever (era-priced by
// construction). Landmarks (gear.js: era×20 + {5,10,15,17,20}) are FLOORS:
// a fail never drops below a landmark you've reached — every reached bundle
// is permanent (attachment law). Failstacks: fails bank points (gear can
// raise the rate), success spends the bank down to gear's floor; capped at
// +15 points so Nightmare never approaches guarantee.
// Safeguard: risk band through +15 of each era, 3× copper, fail costs no
// plus. Instant resolution, no sound (hard veto). Nothing destroyed, ever.
import { ERA_LEN, landmarkBelow, gearFx } from "./gear.js";

export const STACK_CAP_PTS = 15; // stacks add at most +15 absolute percentage points

// Success rate attempting plus k → k+1 (starting values, §5); era-cyclic.
const SAFE = [1.0, 0.9, 0.8, 0.7, 0.6];                        // k%20 0-4
const RISK = [0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.2];           // k%20 5-11
const NIGHTMARE = [0.15, 0.12, 0.09, 0.07, 0.05, 0.035, 0.025, 0.015]; // k%20 12-19

export function baseChance(k) {
  const m = k % ERA_LEN;
  if (m < 5) return SAFE[m];
  if (m < 12) return RISK[m - 5];
  return NIGHTMARE[m - 12];
}

export function chance(k, stacks = 0) {
  return Math.min(1, baseChance(k) + Math.min(stacks, STACK_CAP_PTS) / 100);
}

export function zone(k) {
  const m = k % ERA_LEN;
  return m < 5 ? "safe" : m < 12 ? "risk" : "nightmare";
}
export function isRisk(k) { return zone(k) === "risk"; }
export function isNightmare(k) { return zone(k) === "nightmare"; }

// Where a fail lands: never below a reached landmark (gear.js floors).
export function failsTo(k) {
  if (isNightmare(k)) return landmarkBelow(k);
  if (isRisk(k)) return Math.max(k - 1, landmarkBelow(k));
  return k; // safe band: nothing lost
}

export function canSafeguard(k) { const m = k % ERA_LEN; return m >= 5 && m < 15; }

// Starting value: cost scales with the item and the plus; the charm's deep
// milestones discount it (gearFx.enhCostX — displayed on the button).
export function cost(item, safeguard = false, state = null) {
  const disc = state ? gearFx(state).enhCostX : 1;
  const c = Math.round(0.5 * item.ip * Math.pow(1.6, item.plus) * disc);
  return safeguard ? c * 3 : c;
}

// One attempt. Returns "success" | "fail" | "poor".
// Mutates item.plus and state.failstacks; caller reads both for the log.
export function attempt(state, item, rng = Math.random, safeguard = false) {
  if (safeguard && !canSafeguard(item.plus)) safeguard = false;
  const G = gearFx(state);
  const c = cost(item, safeguard, state);
  if (state.copper < c) return "poor";
  state.copper -= c;
  if (rng() < chance(item.plus, state.failstacks)) {
    item.plus++;
    state.failstacks = G.failstackFloor; // success spends the bank (to gear's floor)
    return "success";
  }
  state.failstacks += 1 + G.failstackPerFail; // gear raises the banking rate
  if (!safeguard) item.plus = failsTo(item.plus);
  return "fail";
}

// ---- sim-only EV model (deterministic; players get honest per-click odds).
// Failstack approximation: at plus k the average bank when attempting is
// roughly the run of consecutive fails so far ≈ (1−p̂)/p̂ — solved
// self-consistently, capped like the real bank. Gear discounts/rates are
// deliberately NOT modeled (conservative lower bound).
function effChance(k) {
  let p = baseChance(k);
  for (let i = 0; i < 8; i++) {
    p = Math.min(1, baseChance(k) + Math.min((1 - p) / Math.max(p, 1e-4), STACK_CAP_PTS) / 100);
  }
  return p;
}

// EV copper per unit ip to net one level up from k, falls included.
// Risk falls re-climb from the floor rule; nightmare falls re-climb from
// the landmark below.
export function evCostPerIpFrom(k) {
  const C = [];
  for (let i = 0; i <= k; i++) {
    const p = effChance(i);
    const atkCost = 0.5 * Math.pow(1.6, i); // cost(item)/ip at plus i
    const floor = failsTo(i);
    if (floor >= i) { // safe band or standing on a landmark: no re-climb
      C[i] = atkCost / p;
    } else {
      let reclimb = 0;
      for (let j = floor; j < i; j++) reclimb += C[j];
      C[i] = (atkCost + (1 - p) * reclimb) / p;
    }
  }
  return C[k];
}
