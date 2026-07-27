// gear.js — SIGNATURE gear (reworked 2026-07-27, user-blessed design).
// Gear is no longer churn: each slot holds ONE permanent named item, earned
// at a story milestone, that GROWS forever — enhance pushes its plus
// (§5 heartbeat, same object for life), and slice 2 adds rerollable mod
// lines. Nothing is ever replaced or destroyed: gear joins the character,
// the strongest form of the attachment law.
//
// Drops are EVENTS now, not objects: a drop rolls {slot, zone, rarity},
// merges into its Armory entry (as always) and pays tiered Scrap — fuel for
// the slice-2 reforge bench. Epic+ drops bank a RELIC (slice-3 currency,
// banked from day one so no playtest drop is retroactively wasted). There
// is no stash, no filter, no equip decision — and no flood, because there
// is nothing to pile up.
import { RARITIES, RARITY_BY_ID, RARITY_IDX, rollRarity } from "./rarity.js";
import { merge } from "./armory.js";

export const SLOTS = ["weapon", "armor", "charm"];

// Dead-game register; Armory entries are named by the zone that drops them.
export const NAMES = {
  weapon: ["Rusty Shortsword", "Ravine Pike", "Salt-Etched Saber", "Cinder Warblade", "Sentry Halberd",
    "Threshold Cleaver", "Nave Censer", "Undercroft Trident", "Long Dark Reaver", "Second Door Greatblade",
    "Frost Reaver", "Archive Halberd", "Obsidian Cleaver", "Spire Lance", "World-Edge Blade"],
  armor: ["Padded Vest", "Weaver-Silk Jerkin", "Salt-Crusted Cuirass", "Cinder Scale Coat", "Sentry Plate",
    "Threshold Carapace", "Nave Vestments", "Undercroft Wrap", "Long Dark Shroud", "Second Door Bulwark",
    "Frost Carapace", "Archive Plate", "Obsidian Scale", "Spire Ward", "World-Edge Aegis"],
  charm: ["Cracked Bead", "Weaver-Eye Charm", "Salt Talisman", "Ember Sigil", "Door Sentry Sigil",
    "Threshold Bead", "Nave Reliquary", "Undercroft Pearl", "Pale Eye", "Sealed Sigil",
    "Frost Bead", "Archive Seal", "Obsidian Eye", "Spire Sigil", "World-Edge Star"],
};

/* The three signatures. Each is the zone-1 quest reward — the newbie gear
   every 2006 MMO printed — and it never gets replaced: a +20 Rusty
   Shortsword at the Tenth Door is both the satire and the attachment.
     ip     the item's scalar: drives BOTH enhance cost (enhance.js cost())
            and its stat via contribution() — one number, two meanings, so
            an attempt is never free (≈15c at +0 vs the 20c entry skill,
            growing ×1.6 per plus: the early-game brake the user asked for)
     scale  maps contribution() into the slot's lane (displayed in derive):
            weapon → flat ATK, armor → flat hits/s, charm → +% copper
     arrive milestone id (main.js grants on it) + the story line printed  */
export const SIG = {
  weapon: { ip: 30, scale: 0.5, lane: "atk",
    arriveAt: "firstCopper",
    story: "Quest complete: 'A First Errand'. The server has held your reward for six years." },
  armor: { ip: 24, scale: 0.014, lane: "hits",
    arriveAt: "firstArmoryRank",
    story: "Quest complete: 'Collector's Habit'. Reward mailed. Nobody else ever finished it." },
  charm: { ip: 20, scale: 0.5, lane: "copperPct",
    arriveAt: "cp100",
    story: "Quest complete: 'Proof of Strength'. The reward chest creaks open on its own." },
};

export function newSignature(slot) {
  return { slot, ip: SIG[slot].ip, plus: 0, name: NAMES[slot][0] };
}

/* ── ENDLESS ENHANCE (2026-07-27, user-directed MapleStory-shaped rework) ──
   No MAX_PLUS. The +0→+20 arc repeats forever in ERAS (enhance.js keys odds
   on plus % 20). Landmarks at era×20 + {5,10,15,17,20} are floors (you never
   fall below one — attachment law) AND paydays: each multiplies the lane
   (pattern below) and grants a BUNDLE of effects (MILESTONES registry).
   Everything derives from `plus` — zero new save state.                    */
export const ERA_LEN = 20;
export const ERA_MULT = 250; // each era's gate multiplies the lane ×250 (starting value)
const PATTERN = [[20, 250], [17, 50], [15, 10], [10, 3], [5, 1.5]]; // within-era lane mults

export function eraOf(plus) { return Math.floor(plus / ERA_LEN); }

// Landmark lane multiplier — stateless. +20 weapon ≈ ×2,400 its +0 lane
// (with the 1.12^plus), each era ≈ ×250 the last: idle epochs, not nudges.
export function tierMult(plus) {
  const k = plus % ERA_LEN;
  let pat = 1;
  for (const [at, m] of PATTERN) if (k >= at) { pat = m; break; }
  return Math.pow(ERA_MULT, eraOf(plus)) * pat;
}

// Largest landmark ≤ plus (the floor a fail can land on). 0 if none reached.
export function landmarkBelow(plus) {
  for (let p = plus; p >= 0; p--) if (isLandmark(p)) return p;
  return 0;
}
export function isLandmark(plus) {
  const k = plus % ERA_LEN;
  return plus > 0 && (k === 5 || k === 10 || k === 15 || k === 17 || k === 0);
}
export function nextLandmark(plus) {
  for (let p = plus + 1; ; p++) if (isLandmark(p)) return p;
}

// Base item power scalar (compounding per plus; landmarks multiply on top).
export function contribution(item) {
  return item.ip * Math.pow(1.12, item.plus) * tierMult(item.plus);
}

// The slot's displayed lane value at the item's current plus.
export function laneValue(item) {
  return contribution(item) * SIG[item.slot].scale;
}

/* ── the milestone BUNDLE registry ─────────────────────────────────────────
   One row per landmark per slot (era 0–2 bespoke; deeper gates fall back to
   a generic ×10 lane-stat bundle). Effect stats and their aggregation rule:
     add  — additive numbers (percent points, seconds, counts). Track meta
            multipliers (metaX) and the set-wide meta scale THESE rows only.
     mult — multipliers, combined by product. Never meta-scaled (no
            double-exponential runaway).
   All values are STARTING VALUES — playtest dials, the user tweaks freely. */
const ADD = new Set(["atkPct", "hitsPct", "copperPct", "critRate", "critDmg",
  "dropRatePct", "smitePct", "frenzyAddS", "tranceAddS", "pipCap",
  "pipRechargeAdd", "comboHitsAdd", "failstackPerFail", "failstackFloor",
  "failstackAtkPct", "judgEcho"]);
// The meta milestones ("all % values ×N") scale ONLY percentage rows —
// counts, seconds and rule switches stay literal.
const META = new Set(["atkPct", "hitsPct", "copperPct", "critRate", "critDmg",
  "dropRatePct", "smitePct", "failstackAtkPct"]);
export const MILESTONES = {
  weapon: [
    { at: 5, fx: [["critRate", 5, "+5% crit chance"], ["atkPct", 10, "+10% ATK"]] },
    { at: 10, fx: [["critDmg", 50, "+50% crit damage"], ["atkPct", 25, "+25% ATK"]], rename: true },
    { at: 15, fx: [["atkPct", 100, "+100% ATK"], ["critRate", 10, "+10% crit chance"],
      ["failstackAtkPct", 2, "banked failstacks give +2% ATK each"]] },
    { at: 17, fx: [["superX", 3, "max-tier crits ×3 damage"], ["smitePct", 50, "+50% boss damage"]] },
    { at: 20, fx: [["critDmg", 300, "+300% crit damage"], ["autoCritNth", 10, "every 10th swing auto-crits at max tier"],
      ["smiteX", 3, "boss damage ×3"]], rename: true, title: true },
    { at: 40, fx: [["judgEcho", 1, "Judgment beats twice"], ["autoCritNth", 5, "auto-crit every 5th swing"],
      ["metaX", 2, "ALL weapon milestone % values ×2"]], rename: true, title: true },
    { at: 60, fx: [["echoX", 2, "every swing echoes — all damage ×2"], ["smiteX", 10, "boss damage ×10"],
      ["critRate", 25, "+25% crit chance"]], rename: true, title: true },
  ],
  armor: [
    { at: 5, fx: [["hitsPct", 10, "+10% hits/s"], ["frenzyAddS", 2, "Frenzy windows +2s"]] },
    { at: 10, fx: [["hitsPct", 25, "+25% hits/s"], ["tranceAddS", 5, "Battle Trance +5s"]], rename: true },
    { at: 15, fx: [["hitsPct", 50, "+50% hits/s"], ["energyCapX", 2, "Energy cap ×2"],
      ["pipRechargeAdd", -60, "pips recharge 60s faster"]] },
    { at: 17, fx: [["rageX", 2, "Rage windows ×2"], ["comboHitsAdd", -10, "Combo finisher at 20 hits"]] },
    { at: 20, fx: [["pipCap", 1, "+1 pip cap"], ["pipRechargeAdd", -60, "pips recharge 60s faster"],
      ["frenzyHasteX", 2, "Frenzy haste ×2"], ["offlineX", 1.5, "offline time counts ×1.5"]], rename: true, title: true },
    { at: 40, fx: [["pipCap", 2, "+2 pip cap"], ["swClockX", 0.5, "Second Wind clock halved"],
      ["castRefundNth", 4, "every 4th cast refunds its pip"], ["metaX", 2, "ALL armor milestone % values ×2"]], rename: true, title: true },
    { at: 60, fx: [["buffDurX", 2, "all buff windows ×2 duration"], ["offlineX", 2, "offline time ×2"],
      ["kneeX", 2, "speed soft-cap threshold ×2"]], rename: true, title: true },
  ],
  charm: [
    { at: 5, fx: [["copperPct", 25, "+25% copper"], ["dropRatePct", 10, "+10% drop rate"]] },
    { at: 10, fx: [["copperPct", 50, "+50% copper"], ["failstackPerFail", 1, "fails bank +1 extra point"]], rename: true },
    { at: 15, fx: [["copperPct", 100, "+100% copper"], ["dropRatePct", 50, "+50% drop rate"],
      ["scrapX", 2, "scrap gains ×2"]] },
    { at: 17, fx: [["enhCostX", 0.75, "enhance costs −25%"], ["relicMinRare", 1, "Relics from Rare drops up"]] },
    { at: 20, fx: [["copperX", 3, "copper ×3"], ["rarityReroll", 1, "drops roll rarity twice, keep best"],
      ["trainX", 2, "training gains ×2"]], rename: true, title: true },
    { at: 40, fx: [["enhCostX", 0.5, "enhance costs −50%"], ["cacheX", 3, "Cache/s ×3"],
      ["failstackFloor", 5, "failstacks keep a floor of 5"], ["botCapX", 2, "bot capacity ×2"]], rename: true, title: true },
    { at: 60, fx: [["copperX", 10, "copper ×10"], ["wildJackX", 5, "Wild Swing jackpots ×5"],
      ["relicX", 2, "Relics bank ×2"], ["metaX", 2, "ALL charm milestone % values ×2"]], rename: true, title: true },
  ],
};

// Set thresholds — TOTAL plus across the three signatures, cumulative.
// Era 2+ repeats the pattern at +60 totals with values ×10 (generic).
export const SET_TIERS = [
  { total: 30, fx: [["atkX", 2, "×2 ATK"], ["hitsPct", 25, "+25% hits/s"], ["copperPct", 50, "+50% copper"]] },
  { total: 45, fx: [["atkX", 5, "×5 ATK"], ["failstackPerFail", 2, "fails bank +2 extra points"], ["pipCap", 1, "+1 pip cap"]] },
  { total: 51, fx: [["atkX", 10, "×10 ATK"], ["pipRechargeAdd", -60, "pips recharge 60s faster"], ["enhCostX", 0.75, "enhance costs −25%"]] },
  { total: 60, fx: [["atkX", 25, "×25 ATK"], ["copperX", 2, "copper ×2"], ["setMetaX", 1.5, "all milestone % values ×1.5"]] },
];

export function setTotal(state) {
  return SLOTS.reduce((s, sl) => s + (state.gear?.[sl]?.plus || 0), 0);
}

// Name ladder: each rename milestone swaps the item's leading word. Display-
// only (tierName) — the saved name never mutates. Dead-game register.
export const TIER_ADJ = ["Honed", "Gleaming", "Ascendant", "Radiant", "Mythic", "Eternal", "Transcendent"];
export function renameCount(slot, plus) {
  return (MILESTONES[slot] || []).filter(m => m.rename && plus >= m.at).length
    + Math.max(0, Math.floor(plus / ERA_LEN) - 3); // deep generic gates keep renaming
}
export function tierName(item) {
  const n = renameCount(item.slot, item.plus);
  if (!n) return item.name;
  const noun = item.name.split(" ").slice(1).join(" ") || item.name;
  const adj = TIER_ADJ[Math.min(n, TIER_ADJ.length) - 1];
  const suffix = n > TIER_ADJ.length ? ` ${"I".repeat(n - TIER_ADJ.length + 1)}` : "";
  return `${adj} ${noun}${suffix}`;
}

/* gearFx — THE aggregator. Flat mods object from all reached milestones +
   set tiers; every consumer (derive, crits, skills, enhance, pull, bots,
   dungeon, offline) reads THIS. New effect = one registry row + one
   consumer line. Track metaX scales that item's `add` rows; set-wide
   setMetaX scales every item's `add` rows (mult rows never meta-scaled). */
export function gearFx(state) {
  const G = { atkPct: 0, hitsPct: 0, copperPct: 0, critRate: 0, critDmg: 0,
    dropRatePct: 0, smitePct: 0, frenzyAddS: 0, tranceAddS: 0, pipCap: 0,
    pipRechargeAdd: 0, comboHitsAdd: 0, failstackPerFail: 0, failstackFloor: 0,
    failstackAtkPct: 0, judgEcho: 0,
    atkX: 1, echoX: 1, smiteX: 1, superX: 1, copperX: 1, scrapX: 1, trainX: 1,
    botCapX: 1, cacheX: 1, offlineX: 1, enhCostX: 1, wildJackX: 1, rageX: 1,
    frenzyHasteX: 1, energyCapX: 1, swClockX: 1, buffDurX: 1, kneeX: 1,
    relicX: 1, rarityReroll: 0, relicMinRare: 0, autoCritNth: 0, castRefundNth: 0 };
  if (!state.gear) return G;
  // set-wide meta first (scales add rows of every track)
  const total = setTotal(state);
  let setMeta = 1;
  for (const t of SET_TIERS) if (total >= t.total) for (const [stat, val] of t.fx) if (stat === "setMetaX") setMeta = val;
  const fold = (rows, meta) => {
    for (const [stat, val] of rows) {
      if (stat === "metaX" || stat === "setMetaX") continue;
      if (ADD.has(stat)) {
        if (stat === "failstackFloor") G[stat] = Math.max(G[stat], val); // a floor, not a sum
        else G[stat] += val * (META.has(stat) ? meta : 1);
      } else if (stat === "autoCritNth" || stat === "castRefundNth") {
        G[stat] = G[stat] ? Math.min(G[stat], val) : val; // best (smallest) N wins
      } else if (stat === "rarityReroll" || stat === "relicMinRare") {
        G[stat] += val;
      } else {
        G[stat] *= val; // mult rows: product, never meta-scaled
      }
    }
  };
  for (const slot of SLOTS) {
    const it = state.gear[slot];
    if (!it) continue;
    const rows = (MILESTONES[slot] || []).filter(m => it.plus >= m.at);
    const meta = rows.reduce((m, r) => m * (r.fx.find(f => f[0] === "metaX")?.[1] || 1), 1) * setMeta;
    for (const m of rows) fold(m.fx, meta);
    // deep generic gates (era 4+): the slot's lane family ×10 per gate
    for (let g = 4; g * ERA_LEN <= it.plus; g++) {
      fold([[slot === "weapon" ? "atkX" : slot === "armor" ? "hitsPct" : "copperX",
        slot === "armor" ? 100 : 10, "deep gate"]], 1);
    }
  }
  for (const t of SET_TIERS) if (total >= t.total) fold(t.fx, setMeta);
  // era-2+ set tiers: same pattern at +60 totals, ×10 values (generic)
  for (let e = 1; e < 10; e++) {
    if (total >= 30 + 60 * e) fold([["atkX", 2 * Math.pow(10, e), "deep set"]], 1);
    else break;
  }
  return G;
}

// Milestone proximity for the stakes card: the next landmark on this item
// and its bundle labels (lane jump + effects).
export function nextMilestone(item) {
  const p = nextLandmark(item.plus);
  const row = (MILESTONES[item.slot] || []).find(m => m.at === p);
  const laneJump = tierMult(p) / tierMult(item.plus);
  return { at: p, laneJump, labels: row ? row.fx.filter(f => f[0] !== "metaX").map(f => f[2]) : [] };
}

// ---- drops as events ----
// Rarity is standardized (same odds everywhere); Overkill Saturation bias
// gives keep-best-of-(1+bias) rarity rolls — over-farming pays quality.
export function rollDrop(zoneIdx, rng = Math.random, bias = 0) {
  const slot = SLOTS[Math.floor(rng() * SLOTS.length)];
  let rarity = rollRarity(rng);
  for (let k = 0; k < bias; k++) { const r2 = rollRarity(rng); if (RARITY_IDX[r2.id] > RARITY_IDX[rarity.id]) rarity = r2; }
  return { slot, zone: zoneIdx + 1, name: NAMES[slot][zoneIdx], rarity: rarity.id };
}

// Scrap paid per drop event, by rarity (deeper zones pay MORE drops, not
// bigger ones — volume is the zone axis, rarity is the quality axis).
// Starting values; the scrap wallet is slice-2 reforge fuel.
export function fuelYield(rarityId) {
  const ri = RARITY_IDX[rarityId] ?? 0;
  return { rarity: rarityId, n: 1 + ri * ri };
}

// Epic and above banks a Relic — the slice-3 mod-line currency. Banked (not
// dropped on the floor) from the first commit so nothing is wasted later.
// The charm's milestones widen the gate (relicMinRare) and multiply the
// bank (relicX).
export const RELIC_MIN = "epic";
export function isRelic(rarityId, G = null) {
  const min = (RARITY_IDX[RELIC_MIN] ?? 99) - (G?.relicMinRare || 0);
  return (RARITY_IDX[rarityId] ?? 0) >= min;
}

// Resolve one drop event: Armory merge + scrap fuel (+ relic bank).
// Returns { merge, scrap, relic } for the caller's feedback.
export function resolveDrop(state, drop) {
  const G = gearFx(state);
  const merged = merge(state, drop);
  const scrap = fuelYield(drop.rarity);
  scrap.n = Math.round(scrap.n * G.scrapX); // charm +15: scrap gains ×2
  state.scrap[scrap.rarity] = (state.scrap[scrap.rarity] || 0) + scrap.n;
  let relic = false;
  if (isRelic(drop.rarity, G)) {
    state.relics = (state.relics || 0) + G.relicX;
    relic = true;
  }
  return { merge: merged, scrap, relic };
}
