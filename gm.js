// gm.js — the GM tab. Tickets (meta currency from attempts) buy permanent
// account power and feature unlocks, GP/AP-shaped. Dying-server register.
// Law 1: bounded by RANK CAPS (utility) or ERA PRICING (uncapped flags'
// exponential costs). Everything here is sim-modeled.

// Account flags: uncapped permanent stat lane, era-priced.
export const FLAGS = {
  dmg: { label: "damage override", gain: "+4% ATK", base: 60, mult: 2.0 },
  haste: { label: "haste override", gain: "+2% speed", base: 90, mult: 2.2 },
};

// Admin tools: one-time feature unlocks (verbs, not dials).
export const UNLOCKS = {
  scheduler: { label: "encounter scheduler", desc: "auto-fires attempts on cooldown while online", cost: 150 },
  idleProc: { label: "idle encounter processing", desc: "attempts resolve while away (offline-clamped)", cost: 400 },
};

// Utility ranks: support cast, hard rank caps.
export const UTILITY = {
  cap: { label: "session cap +2", base: 20, mult: 2, max: 10 },
  offline: { label: "idle timeout +1h", base: 50, mult: 3, max: 6 },
  cooldown: { label: "encounter lockout −5s", base: 40, mult: 2.5, max: 6 },
  scar: { label: "repair scripts off +1% scar cap", base: 200, mult: 4, max: 3 },
};

export function flagCost(type, rank) {
  return Math.round(FLAGS[type].base * Math.pow(FLAGS[type].mult, rank));
}
export function utilityCost(type, rank) {
  return Math.round(UTILITY[type].base * Math.pow(UTILITY[type].mult, rank));
}

export function buyFlag(state, type) {
  const cost = flagCost(type, state.gm[type]);
  if (state.tickets < cost) return false;
  state.tickets -= cost;
  state.gm[type]++;
  return true;
}

export function buyUnlock(state, type) {
  if (state.gm[type]) return false;
  if (state.tickets < UNLOCKS[type].cost) return false;
  state.tickets -= UNLOCKS[type].cost;
  state.gm[type] = true;
  return true;
}

export function buyUtility(state, type) {
  const rank = state.gm[type];
  if (rank >= UTILITY[type].max) return false;
  const cost = utilityCost(type, rank);
  if (state.tickets < cost) return false;
  state.tickets -= cost;
  state.gm[type]++;
  return true;
}

// Multipliers the stat line displays as explicit terms (law 5).
export function gmDmgMult(state) { return 1 + 0.04 * (state.gm?.dmg || 0); }
export function gmHasteMult(state) { return 1 + 0.02 * (state.gm?.haste || 0); }

// Tickets per resolved attempt. SUB-LINEAR in depth (sqrt) so the
// tickets→flags→depth→tickets loop can't run away; bounded by the attempt
// cooldown (gated faucet); sim-modeled.
export function ticketYield(depth) {
  return Math.max(1, Math.round(150 * Math.pow(depth, 0.5)));
}
export const BREAK_TICKETS = 500; // wall break files a proper incident
