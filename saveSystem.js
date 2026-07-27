// saveSystem.js — 3-key durability pattern ported from ../FightingInc:
// primary, _bak (last-known-good, written once at startup so the autosave
// can never clobber it mid-session), _corrupt (quarantine for manual rescue).
import { newState } from "./state.js";
import { getBoss } from "./bosses.js";
import { SLOTS, newSignature } from "./gear.js";
import { SKILL_BY_ID } from "./skills.js";

const KEY = "mm_save";

// Persist everything except transients — new fields persist automatically.
export function serialize(state) {
  const { pull, ...rest } = state;
  return { ...rest, lastSeen: Date.now() }; // lastSeen = offline-progress hook (M5)
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(serialize(state)));
  } catch (e) {
    console.error("[save]", e); // quota / private mode — keep the game running
  }
}

export function validSave(s) {
  return !!s && typeof s === "object" && (s.v ?? 0) >= 1;
}

function parseSave(raw) {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    return validSave(s) ? s : null;
  } catch {
    return null;
  }
}

export function exportSave(state) {
  save(state); // export what's live, not a stale blob
  return localStorage.getItem(KEY);
}

export function importSave(text) {
  if (!parseSave(text)) return false;
  localStorage.setItem(KEY, text);
  return true;
}

// Applies a saved game onto live state. Returns the save object or null.
export function load(state) {
  let raw = localStorage.getItem(KEY);
  let s = parseSave(raw);
  if (raw && !s) {
    // corrupt/unusable primary: preserve for manual rescue, then fall back
    try { localStorage.setItem(KEY + "_corrupt", raw); } catch {}
    raw = localStorage.getItem(KEY + "_bak");
    s = parseSave(raw);
  }
  if (!s) return null;
  try { localStorage.setItem(KEY + "_bak", raw); } catch {}

  // normalize over factory defaults — one source of truth for the shape.
  // v1 saves (pre-bots) backfill cleanly: new fields come from newState().
  const d = newState();
  state.lastSeen = s.lastSeen ?? 0;
  state.unlocked = s.unlocked ?? (s.boss?.pulls > 0); // v1 save mid-siege: keep systems open
  // progressive unlocks. Old saves (no features) that were already unlocked
  // keep everything open — don't re-hide tabs a player already had.
  if (s.features && typeof s.features === "object") {
    const { gm, dungeon, ...feats } = s.features; // v13 retired GM; v14 cut the Dungeon
    state.features = { ...d.features, ...feats };
  } else if (state.unlocked) {
    state.features = { training: true, grind: true, player: true,
      delve: (s.dungeon?.best || 0) > 0 || (s.cleared?.length || 0) > 0,
      rebirth: (s.cleared?.length || 0) > 0 || (s.rebirths || 0) > 0 };
  }
  state.everDropped = s.everDropped ?? state.unlocked;
  state.copper = s.copper ?? 0;
  state.scripts = s.scripts ?? 0;   // v9 Ban Wave prestige currency
  state.rebirths = s.rebirths ?? 0;
  // v13: s.tickets and s.gm are deliberately NOT restored. Tickets had no sink
  // outside the GM tab, and the GM tab's own state (flags/unlocks/utility) is
  // meaningless without it. Both are dropped on load; the meta currency gets
  // redesigned from scratch. Nothing a player OWNS is affected — gear, scrap,
  // scripts, trophies, Armory, titles and wall progress all survive.
  state.failstacks = s.failstacks ?? 0;
  state.titles = Array.isArray(s.titles) ? s.titles : [];
  state.cleared = Array.isArray(s.cleared) ? s.cleared : []; // v9 wall monuments
  state.setPieces = (s.setPieces && typeof s.setPieces === "object" && !Array.isArray(s.setPieces)) ? s.setPieces : {}; // v9 boss Trophy sets
  state.armory = (s.armory && typeof s.armory === "object" && !Array.isArray(s.armory)) ? s.armory : {}; // v10 the Armory
  // wall model: maxWall = frontier; walls below it are farmable. Only the
  // frontier keeps fight-progress (frontierBoss); cleared walls are broken
  // farm records synthesized on switch. Old saves: maxWall = wall.
  // Siege model (v11): frontier is an HP pool. Old saves (scars/pulls) reset
  // the FIGHT only — hp seeds to the wall's full HP; walls already cleared stay
  // cleared, gear/story/trophies untouched (attachment guideline 8). A broken
  // frontier stays broken (hp 0). New saves carry hp/farmCarry through.
  state.maxWall = s.maxWall ?? s.wall ?? d.wall;
  const fullHp = getBoss(state.maxWall)?.hp ?? d.frontierBoss.hp;
  const sf = s.frontierBoss ?? s.boss ?? {};
  state.frontierBoss = {
    hp: sf.hp ?? (sf.broken ? 0 : fullHp),
    broken: !!sf.broken,
    nearSaid: sf.nearSaid ?? false,
    farmCarry: sf.farmCarry ?? 0,
  };
  state.wall = Math.min(s.wall ?? state.maxWall, state.maxWall);
  state.boss = state.wall === state.maxWall
    ? state.frontierBoss
    : { hp: 0, broken: true, nearSaid: true, farmCarry: 0 }; // farm a cleared wall
  // pre-v7 fields (assign/count/farmZone) handled below; enhTarget/enhCarry
  // are v16-retired (bot enhance squad cut) and must not spread back in.
  const { assign, count, farmZone, enhTarget, enhCarry, ...sBots } = s.bots || {};
  const oldBars = s.bots?.bars; // v≤4 bars were {lvl, prog}
  const v4Bars = oldBars?.atk?.lvl !== undefined;
  const v6Bars = !v4Bars && oldBars?.atk?.tier !== undefined; // v5/v6 single-active-tier bars
  const v6Alloc = s.bots?.alloc && !Array.isArray(s.bots.alloc.atk); // pre-v7 scalar alloc
  state.bots = {
    ...d.bots, ...sBots,
    alloc: v6Alloc || !s.bots?.alloc ? d.bots.alloc : {
      atk: [...d.bots.alloc.atk].map((_, i) => s.bots.alloc.atk[i] ?? 0),
      speed: [...d.bots.alloc.speed].map((_, i) => s.bots.alloc.speed?.[i] ?? 0),
      zones: [...d.bots.alloc.zones].map((_, i) => s.bots.alloc.zones?.[i] ?? 0),
    },
    trained: { ...d.bots.trained, ...(s.bots?.trained || {}) },
    bars: (v4Bars || v6Bars) ? structuredClone(d.bots.bars) : {
      // resize to the current tier count, preserving saved fills/prog/unlocked
      atk: { unlocked: oldBars?.atk?.unlocked ?? 1,
        fills: d.bots.bars.atk.fills.map((_, i) => oldBars?.atk?.fills?.[i] ?? 0),
        prog: d.bots.bars.atk.prog.map((_, i) => oldBars?.atk?.prog?.[i] ?? 0) },
      speed: { unlocked: oldBars?.speed?.unlocked ?? 1,
        fills: d.bots.bars.speed.fills.map((_, i) => oldBars?.speed?.fills?.[i] ?? 0),
        prog: d.bots.bars.speed.prog.map((_, i) => oldBars?.speed?.prog?.[i] ?? 0) },
    },
  };
  if (v4Bars) { // v4 → v5: quadratic bar levels become trained stats, tiers reset
    state.bots.trained.atk = 8 * (oldBars.atk.lvl || 0);
    state.bots.trained.hits = Math.min(3.0, 0.03 * Math.min(oldBars.speed?.lvl || 0, 100));
  }
  if (v6Bars) { // v5/v6 → v7: keep fill history + unlocks; prog becomes per-tier
    state.bots.bars.atk.fills = [...d.bots.bars.atk.fills].map((_, i) => oldBars.atk.fills?.[i] ?? 0);
    state.bots.bars.speed.fills = [...d.bots.bars.speed.fills].map((_, i) => oldBars.speed.fills?.[i] ?? 0);
    state.bots.bars.atk.unlocked = oldBars.atk.unlocked ?? 1;
    state.bots.bars.speed.unlocked = oldBars.speed.unlocked ?? 1;
  }
  if (v6Alloc && s.bots?.alloc) { // pre-v7 scalar alloc → vectors
    state.bots.alloc.atk[0] = s.bots.alloc.atk ?? 0;
    state.bots.alloc.speed[0] = s.bots.alloc.spd ?? 0;
    const fz = Math.min(farmZone ?? 0, state.bots.alloc.zones.length - 1);
    state.bots.alloc.zones[fz] = s.bots.alloc.farm ?? 0;
  }
  if (count !== undefined && s.bots?.pop === undefined) state.bots.pop = count; // v2 → v3
  if ((s.v ?? 0) <= 3 && s.bots?.alloc && v6Alloc) { // v3 alloc was % of pop → counts
    state.bots.alloc.atk[0] = Math.round((s.bots.alloc.atk ?? 0) / 100 * state.bots.pop);
    state.bots.alloc.speed[0] = Math.round((s.bots.alloc.spd ?? 0) / 100 * state.bots.pop);
    state.bots.alloc.zones[0] = Math.round((s.bots.alloc.farm ?? 0) / 100 * state.bots.pop);
  }
  // v14: the skill book. Ranks with no registry row are dropped (a retired
  // skill reads as never learned); pip/energy/timer fields backfill from
  // defaults so pre-skill saves start with an empty, valid book.
  state.skills = { ...d.skills, ...(s.skills || {}) };
  state.skills.ranks = (s.skills?.ranks && typeof s.skills.ranks === "object")
    ? Object.fromEntries(Object.entries(s.skills.ranks).filter(([id]) => SKILL_BY_ID[id]))
    : {};
  // v15: SIGNATURE gear. Pre-v15 items (equipped + stash) convert to scrap
  // by rarity, and the HIGHEST plus among them carries onto the new weapon —
  // enhance progress is never destroyed by a redesign (attachment law).
  // Signatures whose milestones a save has already passed re-grant on the
  // first checkUnlocks() tick, so migration itself grants only the carry.
  state.gear = { weapon: null, armor: null, charm: null };
  state.relics = s.relics || 0;
  state.scrap = { ...d.scrap, ...(s.scrap || {}) }; // v9 tiered scrap wallet
  if ((s.v ?? 0) >= 15) {
    // v15+ save: signatures restore as-is (rebuilt from SIG so a retuned
    // ip/scale applies to old saves too — only the plus is the player's)
    for (const sl of SLOTS) if (s.gear?.[sl]) state.gear[sl] = { ...newSignature(sl), plus: s.gear[sl].plus || 0 };
  } else if (s.gear) {
    // pre-v15: convert every owned item to scrap, carry the best plus
    const olds = [];
    for (const sl of SLOTS) if (s.gear[sl]) olds.push(s.gear[sl]);
    if (Array.isArray(s.gear.stash)) olds.push(...s.gear.stash);
    let bestPlus = 0;
    for (const it of olds) {
      const r = it.rarity || "common";
      state.scrap[r] = (state.scrap[r] || 0) + Math.max(1, Math.round(Math.sqrt(it.ip || 1)));
      bestPlus = Math.max(bestPlus, it.plus || 0);
    }
    if (olds.length) {
      state.gear.weapon = newSignature("weapon");
      state.gear.weapon.plus = Math.min(bestPlus, 20);
    }
  }
  // v13: the "support backlog" (+% tickets) node went with the ticket economy —
  // only ranks that still exist in the tree are carried over.
  const savedRanks = s.dungeon?.ranks || {};
  const ranks = { ...d.dungeon.ranks };
  for (const k of Object.keys(ranks)) if (savedRanks[k] != null) ranks[k] = savedRanks[k];
  state.dungeon = { cache: s.dungeon?.cache || 0, depthBest: s.dungeon?.depthBest || 0, ranks };
  // v14: the Dungeon/instance POC is cut. A save with a run mid-flight gets
  // its staffed bots handed back (nothing a player owns is eaten by a cut),
  // then the whole block is dropped.
  if (s.instance?.running && s.instance.staffed) {
    for (const n of Object.values(s.instance.staffed)) state.bots.pop += n || 0;
  }
  delete state.instance;
  delete state.farm; // v8: zones are bot-only, player parking is gone
  return s;
}

export function wipe() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(KEY + "_bak");     // reset must not resurrect
  localStorage.removeItem(KEY + "_corrupt");
}
