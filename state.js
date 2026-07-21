// state.js — single source of truth for the save shape.
// saveSystem normalizes over these defaults; the sim imports it too.
export function newState() {
  return {
    v: 8,
    lastSeen: 0,
    unlocked: false, // flips on first pull resolve — the intro beat reveal
    copper: 0,
    tickets: 0,    // meta currency: damaging Content files support tickets nobody handles
    // GM tab: flags (uncapped, era-priced), unlocks (booleans), utility (rank-capped)
    gm: { dmg: 0, haste: 0, scheduler: false, idleProc: false, schedulerOn: true, cap: 0, offline: 0, cooldown: 0, scar: 0 },
    failstacks: 0, // Luck's mechanical body — every fail banks +1%, success spends the bank
    titles: [],    // earned forever (attachment law): "+18" etc.
    wall: 1,
    boss: { pulls: 0, bestDepth: 0, scars: 0, broken: false, nearSaid: false }, // per-current-wall record
    cooldownUntil: 0, // epoch ms — survives reload
    pull: null,       // transient {startedAt, endsAt, rolledFresh} — never serialized
    // Bot Farm: population FLOW. Generator fills toward server capacity;
    // farming bots get banned at zone detection rates. Alloc = % of pop.
    bots: {
      pop: 2,         // live bot accounts (float — it's a stream)
      banned: 0,      // lifetime bans (log flavor)
      capRank: 0,     // session slots: capacity = 8 + 4×rank
      createRank: 0,  // generator: 2/h × (1 + 0.5×rank)
      powerRank: 0,   // script quality: power = 1 + 0.25×rank
      speedRank: 0,   // hardware: speed = 1 + 0.20×rank
      // NGU model: every bar takes its OWN allocation and all bars run in
      // parallel. Max a bar's rate → surplus belongs on the next bar.
      alloc: {
        atk: [1, 0, 0, 0],   // per ATK training tier
        speed: [1, 0, 0],    // per SPEED training tier
        zones: [0, 0, 0, 0, 0], // bots farming each zone
        enh: 0,
      },
      enhTarget: { slot: "weapon", plus: 10 }, // bots enhance this item toward this plus
      enhCarry: 0, // fractional attempt progress
      trained: { atk: 0, hits: 0 }, // permanent stat gains from fills
      bars: {
        atk: { fills: [0, 0, 0, 0], prog: [0, 0, 0, 0], unlocked: 1 },
        speed: { fills: [0, 0, 0], prog: [0, 0, 0], unlocked: 1 },
      },
    },
    // v8: zones are bot-only — the player's verb is the Boss. No farm{}.
    gear: {
      weapon: null, armor: null, charm: null,
      stash: [],          // item = {slot, ip, plus, zone, name, lock?}
      autoSalvage: false, // salvage non-upgrades on drop instead of stashing
    },
  };
}
