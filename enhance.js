// enhance.js — the heartbeat, v1: safe + risk zones only (REMAKE-DESIGN §5).
// Instant resolution, no ceremony (hard veto). Nothing destroyed.
// Nightmare / failstacks / checkpoints / safeguard: Slice 2.

export const MAX_PLUS = 12; // risk-zone ceiling this slice

// Success rate attempting plus k → k+1.
// Safe (k 0-4 → +1..+5): 100→60%, fail loses nothing.
// Risk (k 5-11 → +6..+12): 45→20%, fail = −1 plus.
const SAFE = [1.0, 0.9, 0.8, 0.7, 0.6];
const RISK = [0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.2];

export function chance(k) {
  if (k < 5) return SAFE[k];
  if (k < 12) return RISK[k - 5];
  return 0;
}

export function isRisk(k) { return k >= 5; }

// Starting value: EV copper +0→+12 ≈ hours of same-zone farming; tune the 0.5.
export function cost(item) {
  return Math.round(0.5 * item.ip * Math.pow(1.6, item.plus));
}

// One attempt. Returns "success" | "fail" | "poor" | "max".
export function attempt(state, item, rng = Math.random) {
  if (item.plus >= MAX_PLUS) return "max";
  const c = cost(item);
  if (state.copper < c) return "poor";
  state.copper -= c;
  if (rng() < chance(item.plus)) {
    item.plus++;
    return "success";
  }
  if (isRisk(item.plus)) item.plus--; // risk fail: −1 (a +6 fail lands on +5)
  return "fail";
}

// EV copper to net one level up from k, per unit of item ip (birth-death
// hitting cost: C(k) = (cost(k) + q×C(k-1)) / p, safe-zone falls are free).
// Used by the sim only — players get the honest per-click odds.
export function evCostPerIpFrom(k) {
  const C = [];
  for (let i = 0; i <= k; i++) {
    const p = chance(i);
    const atkCost = 0.5 * Math.pow(1.6, i); // cost(item)/ip at plus i
    C[i] = isRisk(i) && i > 0 ? (atkCost + (1 - p) * C[i - 1]) / p : atkCost / p;
  }
  return C[k];
}
