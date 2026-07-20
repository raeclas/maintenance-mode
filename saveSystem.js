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

  // normalize over factory defaults — one source of truth for the shape
  const d = newState();
  state.lastSeen = s.lastSeen ?? 0;
  state.player = { ...d.player, ...(s.player || {}) };
  state.wall = s.wall ?? d.wall;
  state.boss = { ...d.boss, ...(s.boss || {}) };
  state.cooldownUntil = s.cooldownUntil ?? 0;
  state.pull = null; // reload mid-pull drops the pull — nothing gained until resolve
  return s;
}

export function wipe() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(KEY + "_bak");     // reset must not resurrect
  localStorage.removeItem(KEY + "_corrupt");
}
