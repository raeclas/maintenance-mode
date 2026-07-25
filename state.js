// state.js — single source of truth for the save shape.
// saveSystem normalizes over these defaults; the sim imports it too.
import { getBoss } from "./bosses.js";
export function newState() {
  return {
    v: 13,
    lastSeen: 0,
    unlocked: false, // flips on first pull resolve — the intro beat reveal
    // progressive feature unlocks (NGU/ITRTG-style ??? tabs). Boss is always
    // open; the rest light up on milestones — the game's visible ladder.
    features: { training: false, grind: false, player: false, delve: false, dungeon: false, rebirth: false },
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
        enh: 0,
      },
      enhTarget: { slot: "weapon", plus: 10 }, // bots enhance this item toward this plus
      enhCarry: 0, // fractional attempt progress
      trained: { atk: 0, hits: 0 }, // permanent stat gains from fills
      bars: {
        atk: { fills: [0, 0, 0, 0, 0, 0, 0], prog: [0, 0, 0, 0, 0, 0, 0], unlocked: 1 },
        speed: { fills: [0, 0, 0, 0, 0, 0], prog: [0, 0, 0, 0, 0, 0], unlocked: 1 },
      },
    },
    // v9: gear = rarity + rolled affixes. Salvage → tiered Scrap (reforge fuel).
    scrap: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0, origin: 0 },
    // Delve — idle depth engine + Cache upgrade tree (feeds every system)
    dungeon: { cache: 0, depthBest: 0, ranks: { reach: 0, yield: 0, overclock: 0, loot: 0, drill: 0 } },
    // v12: Dungeons (POC) — bots are SPENT to answer boss mechanics; the run
    // ends when attrition leaves a mechanic unanswered. journal is permanent
    // knowledge (survives Ban Wave — attachment law).
    instance: {
      key: 1,
      party: { interrupt: 0, dispel: 0, adds: 0 }, // bots you commit per duty
      proxy: false,      // proxy rotation consumable, bought per run
      bankAt: 5,         // auto-bank floor — set before you commit
      running: false,
      floor: 0, haul: 0, mult: 1, carry: 0,
      staffed: null,     // live party during a run (survivors rejoin pop)
      best: 0,
      journal: {},       // { [mechId]: {seen, solved} } — permanent
    },
    // v8: zones are bot-only — the player's verb is the Boss. No farm{}.
    gear: {
      weapon: null, armor: null, charm: null,
      stash: [],            // item = {slot, ip, plus, rarity, affixes[], zone, name, lock?}
      // v13: the GM module that used to gate auto-equip is retired, so this is
      // now a plain opt-in toggle in the gear filter. Defaults OFF — building
      // the character by hand is the locked design decision; auto-equip is
      // relief you choose, never the default.
      autoEquip: false,
      autoFilter: true,     // loot filter on: auto-salvage drops below the floors
      keepRarity: "rare",   // loot filter: keep drops at/above this rarity AND
      keepIp: 0,            //   at/above this ip; everything else auto-salvages
    },
  };
}
