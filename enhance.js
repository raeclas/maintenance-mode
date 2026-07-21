// enhance.js — the heartbeat, full REMAKE-DESIGN §5.
// Zones: safe +0→+5 (fail loses nothing), risk +6→+12 (fail −1),
// nightmare +13→+20 (fail drops to checkpoint). Checkpoints at +10 and +15.
// Failstacks: every fail anywhere = +1 stack = +1 percentage point; success
// consumes the WHOLE bank; capped at +15 points so Nightmare never
// approaches guarantee (law 1: every guarantee is an abuse vector).
// Safeguard: +6→+15 only, 3× copper, fail costs no plus. Locked above +15.
// Instant resolution, no ceremony (hard veto). Nothing destroyed, ever.

export const MAX_PLUS = 20;
export const STACK_CAP_PTS = 15; // stacks add at most +15 absolute percentage points

// Success rate attempting plus k → k+1 (starting values, §5).
const SAFE = [1.0, 0.9, 0.8, 0.7, 0.6];                        // k 0-4
const RISK = [0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.2];           // k 5-11
const NIGHTMARE = [0.15, 0.12, 0.09, 0.07, 0.05, 0.035, 0.025, 0.015]; // k 12-19

export function baseChance(k) {
  if (k < 5) return SAFE[k];
  if (k < 12) return RISK[k - 5];
  if (k < 20) return NIGHTMARE[k - 12];
  return 0;
}

export function chance(k, stacks = 0) {
  return Math.min(1, baseChance(k) + Math.min(stacks, STACK_CAP_PTS) / 100);
}

export function zone(k) {
  return k < 5 ? "safe" : k < 12 ? "risk" : "nightmare";
}
export function isRisk(k) { return k >= 5 && k < 12; }
export function isNightmare(k) { return k >= 12; }

// Where a failed nightmare attempt lands: the checkpoint below.
export function checkpointOf(k) {
  return k >= 15 ? 15 : k >= 10 ? 10 : 0;
}

export function canSafeguard(k) { return k >= 5 && k < 15; } // +6→+15 targets only

// Starting value: cost scales with the item and the plus.
export function cost(item, safeguard = false) {
  const c = Math.round(0.5 * item.ip * Math.pow(1.6, item.plus));
  return safeguard ? c * 3 : c;
}

// One attempt. Returns "success" | "fail" | "poor" | "max".
// Mutates item.plus and state.failstacks; caller reads both for the log.
export function attempt(state, item, rng = Math.random, safeguard = false) {
  if (item.plus >= MAX_PLUS) return "max";
  if (safeguard && !canSafeguard(item.plus)) safeguard = false;
  const c = cost(item, safeguard);
  if (state.copper < c) return "poor";
  state.copper -= c;
  if (rng() < chance(item.plus, state.failstacks)) {
    item.plus++;
    state.failstacks = 0; // success consumes the whole bank
    return "success";
  }
  state.failstacks++;
  if (!safeguard) {
    if (isNightmare(item.plus)) item.plus = checkpointOf(item.plus);
    else if (isRisk(item.plus)) item.plus--;
  }
  return "fail";
}

// ---- sim-only EV model (deterministic; players get honest per-click odds).
// Failstack approximation: at plus k the average bank when attempting is
// roughly the run of consecutive fails so far ≈ (1−p̂)/p̂ — solved
// self-consistently, capped like the real bank.
function effChance(k) {
  let p = baseChance(k);
  for (let i = 0; i < 8; i++) {
    p = Math.min(1, baseChance(k) + Math.min((1 - p) / Math.max(p, 1e-4), STACK_CAP_PTS) / 100);
  }
  return p;
}

// EV copper per unit ip to net one level up from k, falls included.
// Risk falls re-climb one level; nightmare falls re-climb from the checkpoint.
export function evCostPerIpFrom(k) {
  const C = [];
  for (let i = 0; i <= k; i++) {
    const p = effChance(i);
    const atkCost = 0.5 * Math.pow(1.6, i); // cost(item)/ip at plus i
    if (isNightmare(i)) {
      let reclimb = 0;
      for (let j = checkpointOf(i); j < i; j++) reclimb += C[j];
      C[i] = (atkCost + (1 - p) * reclimb) / p;
    } else if (isRisk(i) && i > 0) {
      C[i] = (atkCost + (1 - p) * C[i - 1]) / p;
    } else {
      C[i] = atkCost / p;
    }
  }
  return C[k];
}
