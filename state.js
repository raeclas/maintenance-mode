// state.js — single source of truth for the save shape.
// saveSystem normalizes over these defaults; the sim imports it too.
import { getBoss } from "./bosses.js";
import { skillState } from "./skills.js";
export function newState() {
  return {
    v: 15,
    lastSeen: 0,
    unlocked: false, // flips on first pull resolve — the intro beat reveal
    // progressive feature unlocks (NGU/ITRTG-style ??? tabs). Boss is always
    // open; the rest light up on milestones — the game's visible ladder.
    features: { training: false, grind: false, player: false, delve: false, rebirth: false },
    everDropped: false, // a gear drop has happened (gates the Player tab)
    copper: 0,
    // v13: tickets + the GM tab are RETIRED pending a meta-currency redesign.
    // The old GM sold four upgrades for mechanics the idle-battler rework had
    // already deleted, and tickets had no sink outside that tab.
    scripts: 0,    // Ban Wave prestige currency — permanent +damage, survives rebirth
    rebirths: 0,   // lifetime Ban Waves (log/flavor)
    failstacks: 0, // Luck's mechanical body — every fail banks +1%, success spends the bank
    titles: [],    // earned forever (attachment law): "+18" etc.
    cleared: [],   // broken walls, permanent monument (attachment): "W1 Vess" …
    setPieces: {}, // boss Trophy sets: { [wall]: [owned part indices] } (permanent)
    armory: {},    // the Armory: { "slot:zone": mergePoints } — gear collection ranks (permanent)
    wall: 1,       // the wall you're currently AT (fight the frontier, or farm a cleared one)
    maxWall: 1,    // deepest wall unlocked — you can switch among walls 1..maxWall
    // Siege: the Warden is an HP pool drained at Combat Power. hp = remaining;
    // broken → Farm status (timed set-piece rolls). No pulls/scars/cooldown.
    boss: { hp: getBoss(1).hp, broken: false, nearSaid: false, farmCarry: 0 }, // active wall's fight
    frontierBoss: { hp: getBoss(1).hp, broken: false, nearSaid: false, farmCarry: 0 }, // maxWall's persisted fight
    // Bot Farm: population FLOW. Generator fills toward server capacity;
    // farming bots get banned at zone detection rates. Alloc = % of pop.
    bots: {
      pop: 8,         // live bot accounts (float — it's a stream); a working swarm from minute one
      banned: 0,      // lifetime bans (log flavor)
      capRank: 0,     // session slots: capacity = 8 + 4×rank
      createRank: 0,  // generator: 2/h × (1 + 0.5×rank)
      powerRank: 0,   // script quality: power = 1 + 0.25×rank
      speedRank: 0,   // hardware: speed = 1 + 0.20×rank
      // NGU model: every bar takes its OWN allocation and all bars run in
      // parallel. Max a bar's rate → surplus belongs on the next bar.
      alloc: {
        atk: [1, 0, 0, 0, 0, 0, 0],   // per ATK training tier (7)
        speed: [1, 0, 0, 0, 0, 0],    // per SPEED training tier (6)
        zones: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // bots per zone (3 regions × 5)
      },
      trained: { atk: 0, hits: 0 }, // permanent stat gains from fills
      bars: {
        atk: { fills: [0, 0, 0, 0, 0, 0, 0], prog: [0, 0, 0, 0, 0, 0, 0], unlocked: 1 },
        speed: { fills: [0, 0, 0, 0, 0, 0], prog: [0, 0, 0, 0, 0, 0], unlocked: 1 },
      },
    },
    // v14: the skill book — character canon, survives Ban Wave like rig ranks.
    // Pip timers/counters live inside and tick the same path live + offline.
    skills: skillState(),
    // v9: gear = rarity + rolled affixes. Salvage → tiered Scrap (reforge fuel).
    scrap: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0, origin: 0 },
    // Delve — idle depth engine + Cache upgrade tree (feeds every system)
    dungeon: { cache: 0, depthBest: 0, ranks: { reach: 0, yield: 0, overclock: 0, loot: 0, drill: 0 } },
    // (v14: the Dungeon/instance POC is CUT — it never earned its playtest.
    // saveSystem hands any staffed bots back and drops the block on load.)
    // v15: SIGNATURE gear — one permanent named item per slot, granted at
    // story milestones (gear.js SIG), grown forever by enhance. No stash,
    // no filter, no objects from drops: drops pay Scrap + Armory points,
    // Epic+ banks a Relic (slice-3 currency).
    gear: { weapon: null, armor: null, charm: null },
    relics: 0,
  };
}
