// saveSystem.js — 3-key durability pattern ported from ../FightingInc:
// primary, _bak (last-known-good, written once at startup so the autosave
// can never clobber it mid-session), _corrupt (quarantine for manual rescue).
import { newState } from "./state.js";

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
  state.copper = s.copper ?? 0;
  state.tickets = s.tickets ?? 0;
  state.scripts = s.scripts ?? 0;   // v9 Ban Wave prestige currency
  state.rebirths = s.rebirths ?? 0;
  state.gm = { ...d.gm, ...(s.gm || {}) };
  state.failstacks = s.failstacks ?? 0;
  state.titles = Array.isArray(s.titles) ? s.titles : [];
  state.cleared = Array.isArray(s.cleared) ? s.cleared : []; // v9 wall monuments
  state.setPieces = (s.setPieces && typeof s.setPieces === "object" && !Array.isArray(s.setPieces)) ? s.setPieces : {}; // v9 boss Trophy sets
  // wall model: maxWall = frontier; walls below it are farmable. Only the
  // frontier keeps fight-progress (frontierBoss); cleared walls are broken
  // farm records synthesized on switch. Old saves: maxWall = wall.
  state.maxWall = s.maxWall ?? s.wall ?? d.wall;
  state.frontierBoss = { ...d.frontierBoss, ...(s.frontierBoss ?? s.boss ?? {}) };
  state.wall = Math.min(s.wall ?? state.maxWall, state.maxWall);
  state.boss = state.wall === state.maxWall
    ? state.frontierBoss
    : { pulls: 0, bestDepth: 1, scars: 1, broken: true, nearSaid: true }; // farm a cleared wall
  state.cooldownUntil = s.cooldownUntil ?? 0;
  state.pull = null; // reload mid-pull drops the pull — nothing gained until resolve
  const { assign, count, farmZone, ...sBots } = s.bots || {}; // pre-v7 fields handled below
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
      enh: s.bots.alloc.enh ?? 0,
    },
    trained: { ...d.bots.trained, ...(s.bots?.trained || {}) },
    bars: (v4Bars || v6Bars) ? structuredClone(d.bots.bars) : {
      atk: { ...d.bots.bars.atk, ...(oldBars?.atk || {}) },
      speed: { ...d.bots.bars.speed, ...(oldBars?.speed || {}) },
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
    state.bots.alloc.enh = s.bots.alloc.enh ?? 0;
  }
  if (count !== undefined && s.bots?.pop === undefined) state.bots.pop = count; // v2 → v3
  if ((s.v ?? 0) <= 3 && s.bots?.alloc && v6Alloc) { // v3 alloc was % of pop → counts
    state.bots.alloc.atk[0] = Math.round((s.bots.alloc.atk ?? 0) / 100 * state.bots.pop);
    state.bots.alloc.speed[0] = Math.round((s.bots.alloc.spd ?? 0) / 100 * state.bots.pop);
    state.bots.alloc.zones[0] = Math.round((s.bots.alloc.farm ?? 0) / 100 * state.bots.pop);
  }
  state.gear = { ...d.gear, ...(s.gear || {}) };
  if (!Array.isArray(state.gear.stash)) state.gear.stash = [];
  state.scrap = { ...d.scrap, ...(s.scrap || {}) }; // v9 tiered scrap wallet
  state.dungeon = { ...d.dungeon, ...(s.dungeon || {}), haul: { copper: s.dungeon?.haul?.copper || 0 } };
  delete state.farm; // v8: zones are bot-only, player parking is gone
  return s;
}

export function wipe() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(KEY + "_bak");     // reset must not resurrect
  localStorage.removeItem(KEY + "_corrupt");
}
