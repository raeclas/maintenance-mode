// gm.js — the abandoned GM panel. Tickets (meta currency from attempts)
// buy permanent account perks. Every perk is RANK-CAPPED (law 1: every
// guarantee is an abuse vector — no unbounded meta growth).
export const GM = {
  cap: { label: "session slots +2", base: 20, mult: 2, max: 10 },
  offline: { label: "offline cap +1h", base: 50, mult: 3, max: 6 },
  cooldown: { label: "attempt cooldown −5s", base: 40, mult: 2.5, max: 6 },
  scar: { label: "scar cap +1%", base: 200, mult: 4, max: 3 },
};

export function gmCost(type, rank) {
  return Math.round(GM[type].base * Math.pow(GM[type].mult, rank));
}

export function buyGm(state, type) {
  const rank = state.gm[type];
  if (rank >= GM[type].max) return false;
  const cost = gmCost(type, rank);
  if (state.tickets < cost) return false;
  state.tickets -= cost;
  state.gm[type]++;
  return true;
}

// Tickets per resolved attempt: damage files support tickets. Bounded by
// the attempt cooldown (gated faucet); sim-modeled.
export function ticketYield(depth) {
  return Math.max(1, Math.round(depth * 1000));
}
export const BREAK_TICKETS = 500; // wall break files a proper incident
