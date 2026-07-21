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
  state.gm = { ...d.gm, ...(s.gm || {}) };
  state.failstacks = s.failstacks ?? 0;
  state.titles = Array.isArray(s.titles) ? s.titles : [];
  state.wall = s.wall ?? d.wall;
  state.boss = { ...d.boss, ...(s.boss || {}) };
  state.cooldownUntil = s.cooldownUntil ?? 0;
  state.pull = null; // reload mid-pull drops the pull — nothing gained until resolve
  const { assign, count, ...sBots } = s.bots || {}; // v2 fields dropped below
  const oldBars = s.bots?.bars; // v≤4 bars were {lvl, prog}
  const v4Bars = oldBars?.atk?.lvl !== undefined;
  state.bots = {
    ...d.bots, ...sBots,
    alloc: { ...d.bots.alloc, ...(s.bots?.alloc || {}) },
    trained: { ...d.bots.trained, ...(s.bots?.trained || {}) },
    bars: v4Bars ? d.bots.bars : {
      atk: { ...d.bots.bars.atk, ...(oldBars?.atk || {}) },
      speed: { ...d.bots.bars.speed, ...(oldBars?.speed || {}) },
    },
  };
  if (v4Bars) { // v4 → v5: quadratic bar levels become trained stats, tiers reset
    state.bots.trained.atk = 8 * (oldBars.atk.lvl || 0);
    state.bots.trained.hits = Math.min(3.0, 0.03 * Math.min(oldBars.speed?.lvl || 0, 100));
  }
  if (count !== undefined && s.bots?.pop === undefined) state.bots.pop = count; // v2 → v3
  if ((s.v ?? 0) <= 3 && s.bots?.alloc) { // v3 alloc was % of pop → convert to counts
    for (const k of ["atk", "spd", "farm"]) {
      state.bots.alloc[k] = Math.round((s.bots.alloc[k] ?? 0) / 100 * state.bots.pop);
    }
  }
  state.gear = { ...d.gear, ...(s.gear || {}) };
  if (!Array.isArray(state.gear.stash)) state.gear.stash = [];
  state.farm = { ...d.farm, ...(s.farm || {}) };
  return s;
}

export function wipe() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(KEY + "_bak");     // reset must not resurrect
  localStorage.removeItem(KEY + "_corrupt");
}
