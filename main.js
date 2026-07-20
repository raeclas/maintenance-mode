// main.js — wiring: load → loop → autosave; Pull button, dialogue, log.
import { newState } from "./state.js";
import { load, save, wipe } from "./saveSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { getBoss } from "./bosses.js";
import { startPull, resolvePull, pullDone, currentDepth, canPull, COOLDOWN_MS } from "./pull.js";
import { initBattle, renderBattle, notifyResult } from "./battle.js";

const state = newState();
load(state);
const boss = getBoss(state.wall);

const $ = id => document.getElementById(id);
const el = {
  battle: $("battle"), pullBtn: $("pullBtn"), cooldown: $("cooldown"),
  depth: $("depth"), bossName: $("bossName"), bossTitle: $("bossTitle"),
  record: $("record"), dialogue: $("dialogue"), log: $("log"),
  monument: $("monument"), wipeBtn: $("wipeBtn"),
};

function say(event, idx = state.boss.pulls) {
  const lines = boss.dialogue[event];
  const line = lines[Math.max(0, Math.min(idx, lines.length - 1))];
  el.dialogue.textContent = `${boss.name}: “${line}”`;
}

function log(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  el.log.prepend(div);
  while (el.log.children.length > 30) el.log.lastChild.remove();
}

el.pullBtn.addEventListener("click", () => {
  if (!startPull(state, Date.now())) return;
  say("pullStart");
  log(`— Pull ${state.boss.pulls + 1} begins. Enrage in ${boss.windowS}s.`);
});

el.wipeBtn.addEventListener("click", () => {
  if (confirm("Wipe this character's save? (dev button)")) { wipe(); location.reload(); }
});

let lastSave = 0;
function tick() {
  const now = Date.now();
  if (state.pull && pullDone(state, now)) {
    const depth = resolvePull(state, now);
    notifyResult(depth, state.boss.broken);
    if (state.boss.broken) {
      say("break");
      log(`★ W1 BROKEN — ${boss.name} steps aside. Pull ${state.boss.pulls}.`);
    } else {
      say(depth >= 0.95 ? "fail_near" : "fail_low", state.boss.pulls - 1); // pulls already incremented
      log(`Pull ${state.boss.pulls}: ${(depth * 100).toFixed(1)}% — enrage. Best ${(state.boss.bestDepth * 100).toFixed(1)}%.`);
    }
    save(state);
  }
  if (now - lastSave > 5000) { lastSave = now; save(state); }
}

function render() {
  const now = Date.now();
  renderBattle(state, now);

  if (state.pull) {
    el.depth.textContent = (Math.min(1, currentDepth(state, now)) * 100).toFixed(1) + "%";
    el.pullBtn.disabled = true;
    el.cooldown.textContent = `enrage in ${Math.max(0, (state.pull.endsAt - now) / 1000).toFixed(0)}s`;
  } else if (state.boss.broken) {
    el.depth.textContent = "100%";
    el.pullBtn.disabled = true;
    el.pullBtn.textContent = "THE DOOR STANDS OPEN";
    el.cooldown.textContent = "W2 — [content not yet installed on this realm]";
  } else if (!canPull(state, now)) {
    el.depth.textContent = (state.boss.bestDepth * 100).toFixed(1) + "%";
    el.pullBtn.disabled = true;
    el.cooldown.textContent = `retry in ${Math.ceil((state.cooldownUntil - now) / 1000)}s`;
  } else {
    el.depth.textContent = state.boss.pulls ? (state.boss.bestDepth * 100).toFixed(1) + "%" : "—";
    el.pullBtn.disabled = false;
    el.cooldown.textContent = state.boss.pulls ? "ready" : "";
  }

  el.record.textContent = state.boss.pulls
    ? `pulls ${state.boss.pulls} · best depth ${(state.boss.bestDepth * 100).toFixed(1)}%`
    : "no attempts recorded";
  el.monument.style.display = state.boss.broken ? "" : "none";
}

el.bossName.textContent = boss.name;
el.bossTitle.textContent = boss.title;
initBattle(el.battle);
say(state.boss.broken ? "break" : "greet");
startGameLoop(tick, render);
