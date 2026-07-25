// main.js — wiring: load → offline batch → loop → autosave; all UI sections.
import { newState } from "./state.js";
import { load, save, wipe, exportSave } from "./saveSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { bosses, getBoss } from "./bosses.js";
import { drain, farmTick, timeToKill } from "./pull.js";
import { FLAGS, UNLOCKS, UTILITY, flagCost, utilityCost, buyFlag, buyUnlock, buyUtility, gmDmgMult, gmHasteMult, ticketYield, BREAK_TICKETS } from "./gm.js";
import { initBattle, renderBattle, notifyBreak, notifyEnhance } from "./battle.js";
import { derive } from "./stats.js";
import { critFactor } from "./crits.js";
import * as bots from "./bots.js";
import * as farm from "./farm.js";
import { routeDrop, equipFromStash, contribution, salvage, scrapYield, salvageMatching, canReforge, reforgeCost, reforge, isUpgrade, SLOTS, STASH_CAP, NAMES } from "./gear.js";
import * as armory from "./armory.js";
import { RARITIES, RARITY_BY_ID } from "./rarity.js";
import { affixLabel } from "./affixes.js";
import { banWave, pendingScripts, scriptMult, totalFills } from "./rebirth.js";
import { grantBreakPiece, rollFarmDrop, bossHasSet, PARTS, pieceOf, ownedIdxs, ownsPiece, setComplete, setCount, SET_BONUS } from "./trophies.js";
import * as dungeon from "./dungeon.js";
import * as enh from "./enhance.js";
import { fmt, fmtDepth } from "./format.js";

const state = newState();
const loaded = load(state);
let boss = getBoss(state.wall); // reassigned by advanceWall on a break
window.__mm = { state, save: () => save(state) }; // dev hook

// ---- dev mode: ?dev in the URL. Time scale + shortcuts. Never saved. ----
const DEV = new URLSearchParams(location.search).has("dev");
let devScale = 1;

const $ = id => document.getElementById(id);

function say(event) {
  const line = boss.dialogue[event]?.[0];
  if (line) $("dialogue").textContent = `${boss.name}: “${line}”`;
}

// Wall progression: after a break, descend to the next Warden. The cleared
// wall is recorded forever (attachment law — the cleared list is the account's
// power language, §9). Boss record resets for the new wall; `boss` reassigns
// so every reader (say, band, pacing) picks up the new data.
// A cleared wall you're farming needs no fight-progress — it's just broken.
function farmRecord() { return { hp: 0, broken: true, nearSaid: true, farmCarry: 0 }; }

function refreshBoss() {
  boss = getBoss(state.wall);
  $("bossName").textContent = boss.name;
  $("bossTitle").textContent = boss.title;
  say(state.boss.broken ? "break" : "greet");
}

// Switch the active wall among 1..maxWall (fight the frontier, or farm a
// cleared Warden for its set). Frontier progress is preserved in frontierBoss.
function switchWall(w) {
  w = Math.max(1, Math.min(w, state.maxWall));
  if (w === state.wall) return;
  if (state.wall === state.maxWall) state.frontierBoss = state.boss; // stash frontier progress
  state.wall = w;
  state.boss = w === state.maxWall ? state.frontierBoss : farmRecord();
  refreshBoss();
  save(state);
}

// Descend: only from a BROKEN frontier. Records the clear + opens the next wall.
function advanceWall() {
  const cur = getBoss(state.wall);
  const next = getBoss(state.maxWall + 1);
  if (!state.boss.broken || state.wall !== state.maxWall || !next) return;
  const rec = `W${cur.wall} ${cur.name}`;
  if (!state.cleared.includes(rec)) state.cleared.push(rec);
  state.maxWall = next.wall;
  state.wall = next.wall;
  state.frontierBoss = { hp: next.hp, broken: false, nearSaid: false, farmCarry: 0 };
  state.boss = state.frontierBoss;
  refreshBoss();
  log(`— descending to ${next.name}, ${next.title}`);
  save(state);
}

// Warden breaks: dialogue, tickets, the guaranteed first set piece, the reveal.
// Shared by the live tick and the offline batch (function decl — hoisted).
function handleBreak() {
  const b = getBoss(state.wall);
  say("break");
  const y = Math.round(BREAK_TICKETS * dungeon.delveBonus(state, "ticket"));
  state.tickets += y;
  log(`★ W${state.wall} BREACHED — ${b.name} · +${fmt(y)} tickets`);
  const piece = grantBreakPiece(state, state.wall); // guaranteed first set piece
  if (piece) log(`🏆 ${piece.name} recovered · +${piece.pct}% ${laneWord(piece.lane)} — farm for the rest`);
  notifyBreak();
  save(state);
}

// Time-to-breach estimate: reads absurdly huge on arrival (the overwhelming
// gag), cascades down as Combat Power climbs. Capped so it reads "overwhelming"
// not "broken".
function ttkText(s) {
  if (s == null || !isFinite(s)) return "∞";
  const yr = 86400 * 365;
  if (s > yr) return `~${fmt(s / yr)}y — overwhelming`;
  if (s >= 86400) return `~${(s / 86400).toFixed(1)}d`;
  if (s >= 3600) return `~${(s / 3600).toFixed(1)}h`;
  if (s >= 60) return `~${(s / 60).toFixed(1)}m`;
  return `~${s.toFixed(0)}s`;
}

const laneWord = lane => lane === "atk" ? "ATK" : lane === "speed" ? "haste" : "copper";

// The log is the dead server's console: classify each line by event kind so
// it's scannable by type, and swap the emoji markers for terminal glyphs.
function log(msg) {
  let cls = "log-plain";
  if (msg.startsWith("★")) cls = "log-event";
  else if (msg.startsWith("🏆")) { cls = "log-loot"; msg = "◆ " + msg.slice(2).trimStart(); }
  else if (msg.startsWith("⚡")) { cls = "log-warn"; msg = "! " + msg.slice(1).trimStart(); }
  else if (/wiped|ban wave|banned/i.test(msg)) cls = "log-warn";
  else if (/^(drop:|salvaged|delve:|farmed|offline)/.test(msg)) cls = "log-dim";
  const div = document.createElement("div");
  div.className = "logline " + cls;
  div.textContent = msg;
  $("log").prepend(div);
  while ($("log").children.length > 40) $("log").lastChild.remove();
}

// state-in-form: a purchase you can afford reads LIVE (gold edge); can't →
// disabled+dim. Glanceable "what can I buy right now" across every panel.
function buyState(btn, ok) { btn.disabled = !ok; btn.classList.toggle("affordable", ok); }

// the character's raw DPS — drives the Delve's reach depth (hoisted: the
// offline batch calls it before the render helpers run)
function charDps() { const dd = derive(state); return dd.atk * dd.hitsPerSec; }

let stashDirty = true;
let armoryDirty = true;
let lastWallSel = ""; // wall-selector rebuild cache
let lastRenderNow = Date.now();  // for per-frame dt (kill-cycle bar integrator)
let cpSample = null, cpSampleT = 0, cpRate = 0;  // Combat Power rate sampler (~1s window)
const zonePhase = [];            // per-zone accumulated kill phase (0..1 shown)

function onDrop(item) {
  state.everDropped = true; // gates the Player tab
  const rar = RARITY_BY_ID[item.rarity]?.name || item.rarity;
  const r = routeDrop(state, item); // filter: keep→stash, else→scrap (never auto-equip)
  stashDirty = true; armoryDirty = true;
  const fate = r.equipped ? "equipped" : r.kept ? "stashed" : `salvaged +${r.scrap.n} ${item.rarity} scrap`;
  log(`drop: ${rar} ${item.name} ${fmt(item.ip)}IP · ${fate}`);
  if (r.merge?.rankedUp) { // the Armory rank-up spike — every drop advances an entry, this crosses a threshold
    const m = r.merge;
    log(`ARMORY — ${m.name} rank ${m.from}→${m.to}, +${m.pct.toFixed(2)}% ${laneWord(m.lane)}`);
  }
  if (r.overflow) log(`stash full: salvaged ${r.overflow.item.name} +${r.overflow.scrap.n} ${r.overflow.scrap.rarity} scrap`);
}

// enhance feedback is visual: the slot row glows on success, flickers on fail
function flashSlot(slot, ok) {
  const el = slotEls[slot];
  if (!el) return;
  el.classList.remove("flash-ok", "flash-fail");
  void el.offsetWidth; // restart the animation
  el.classList.add(ok ? "flash-ok" : "flash-fail");
}

// shared milestone handling for manual clicks and bot attempts
function enhMilestones(item, r) {
  flashSlot(item.slot, r === "success");
  stashDirty = true;
  if (r !== "success") return;
  notifyEnhance(item.plus, true);
  if (item.plus >= 16) log(`[Server] a player has reached +${item.plus}. Players online: 1.`);
  const title = `+${item.plus}`;
  if (item.plus >= 18 && !state.titles.includes(title)) {
    state.titles.push(title);
    log(`★ title: ${title}`);
  }
}

// ---- offline batch: same tick functions, dt clamped exactly like live ----
if (loaded && state.unlocked && state.lastSeen) {
  const dt = Math.min((Date.now() - state.lastSeen) / 1000, farm.offlineCapS(state));
  if (dt > 60) {
    const c0 = state.copper;
    let drops = 0;
    // enh feedback stays silent offline (slot rows aren't built yet)
    bots.tick(state, dt, (kind, item) => { if (kind === "drop") { drops++; onDrop(item); } });
    log(`offline ${fmt(dt / 3600)}h: +${fmt(state.copper - c0)}c · ${drops} drops`);
    { // the Delve mines Cache idle — same rate as live, clamped by dt
      const gained = dungeon.cachePerSec(state, charDps()) * dt;
      state.dungeon.cache += gained;
      state.dungeon.depthBest = Math.max(state.dungeon.depthBest, dungeon.reachDepth(state, charDps()));
      if (gained > 0) log(`offline delve: +${fmt(gained)} Cache`);
    }
    { // the Warden whittles offline too (clamped by dt); broken walls farm
      if (!state.boss.broken && state.wall === state.maxWall) {
        const r = drain(state, dt);
        if (r.broke) { log(`★ W${state.wall} BREACHED while you were away`); handleBreak(); }
        else if (r.dealt > 0) log(`offline: ${fmt(r.dealt)} integrity off ${getBoss(state.wall).name}`);
      } else if (state.boss.broken) {
        const fr = farmTick(state, dt);
        if (fr.rolls) log(`offline farm: ${fr.pieces.length} piece(s) · +${fmt(fr.tickets)} tickets`);
      }
    }
    save(state);
  }
}

// ---- tabs + progressive feature unlocks ----
const TAB_FEATURE = { botSec: "training", farmSec: "grind", gearSec: "player", dungeonSec: "delve", gmSec: "gm" };
const TAB_NAME = { battleSec: "Boss", botSec: "Training", farmSec: "Grind", gearSec: "Player", dungeonSec: "Delve", gmSec: "GM" };
const UNLOCK_MSG = {
  training: "TRAINING — the old bot farms. Run scripts, build a swarm.",
  grind: "GRIND — deploy the swarm on the leveling zones for copper + gear.",
  player: "PLAYER — your character. Manage gear, enhance, reforge, trophies.",
  gm: "GM — leftover admin tools. Spend the support tickets nobody answers.",
  delve: "DELVE — the character's own run. Descend for copper; bank before you wipe.",
  rebirth: "BAN WAVE — the anti-cheat notices the farm. Reset it for permanent Scripts.",
};
let tabsDirty = true;

function tabUnlocked(id) { const f = TAB_FEATURE[id]; return !f || state.features[f]; }
function showTab(id) {
  if (!tabUnlocked(id)) return; // ??? tabs are not enterable yet
  for (const pane of document.querySelectorAll(".tabpane")) pane.style.display = pane.id === id ? "" : "none";
  for (const btn of document.querySelectorAll("#tabs button")) btn.classList.toggle("active", btn.dataset.tab === id);
}
for (const btn of document.querySelectorAll("#tabs button")) {
  btn.addEventListener("click", () => showTab(btn.dataset.tab));
}
function renderTabs() {
  tabsDirty = false;
  for (const btn of document.querySelectorAll("#tabs button")) {
    const open = tabUnlocked(btn.dataset.tab);
    btn.textContent = open ? TAB_NAME[btn.dataset.tab] : "???";
    btn.classList.toggle("locked", !open);
  }
}

// milestone triggers — the cadence of new toys (starting values, playtest-tuned)
function checkUnlocks() {
  const dps = charDps();
  const s = state, f = s.features;
  const cond = {
    training: s.unlocked,
    grind: f.training, // the bot-farm layer (train + deploy) opens together
    player: f.grind && s.everDropped,
    gm: f.training && s.tickets >= 30,
    delve: f.player && dps >= 100,
    rebirth: s.cleared.length >= 1 || s.rebirths >= 1,
  };
  for (const feat of Object.keys(cond)) {
    if (!f[feat] && cond[feat]) {
      f[feat] = true;
      tabsDirty = true;
      log(`★ NEW: ${UNLOCK_MSG[feat]}`);
    }
  }
}

// ---- unlock reveal ----
function reveal() {
  for (const el of document.querySelectorAll(".game")) el.classList.remove("hidden");
}
if (state.unlocked) reveal();

// ---- fight is automatic now (idle battler) — no Attempt button ----

$("wipeBtn").addEventListener("click", () => {
  if (confirm("Wipe this character's save? (dev button)")) { wipe(); location.reload(); }
});

// ---- bot farm ----
function buyLabel(what, cost) {
  return `${what} (${fmt(cost)}c)`;
}
$("buyCap").addEventListener("click", () => bots.buy(state, "cap"));
$("buyCreate").addEventListener("click", () => bots.buy(state, "create"));
$("buyPower").addEventListener("click", () => bots.buy(state, "power"));
$("buySpeed").addEventListener("click", () => bots.buy(state, "speed"));
$("enhPlus").addEventListener("change", () => {
  state.bots.enhTarget.plus = Math.max(0, Math.min(enh.MAX_PLUS, Math.floor(Number($("enhPlus").value)) || 0));
});

// ---- allocMini: THE allocation control. −/input/+ · cap (exact bots to
// hit the bar's 50/s ceiling) · max (all free) · 0. One component, every bar.
const allocInputs = {}; // key → input element, synced in render
function getAlloc(key) {
  const [g, i] = key.split(".");
  return i === undefined ? state.bots.alloc[g] : state.bots.alloc[g][Number(i)];
}
function allocMini(key, withCap = true) {
  const span = document.createElement("span");
  span.className = "allocMini";
  // shows −/value/+ and cap inline; max/0 hide behind ⋯
  span.innerHTML = `<button data-d="-1">−</button><input type="number" min="0" step="1"><button data-d="1">+</button>` +
    `${withCap ? `<button data-c>cap</button>` : ""}` +
    `<button data-x class="allocX" title="more">⋯</button>` +
    `<span class="allocMore"><button data-m>max</button><button data-z>0</button></span>`;
  span.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    e.stopPropagation();
    if (btn.dataset.x !== undefined) { span.classList.toggle("expanded"); return; }
    if (btn.dataset.d) bots.setAlloc(state, key, getAlloc(key) + Number(btn.dataset.d));
    else if (btn.dataset.c !== undefined) bots.setAlloc(state, key, bots.capNeeded(state.bots, key, derive(state)));
    else if (btn.dataset.m !== undefined) bots.setAlloc(state, key, getAlloc(key) + Math.floor(bots.freeBots(state.bots)));
    else bots.setAlloc(state, key, 0);
  });
  const input = span.querySelector("input");
  input.addEventListener("change", () => bots.setAlloc(state, key, Number(input.value)));
  allocInputs[key] = input;
  return span;
}
$("enhLine").prepend(allocMini("enh", false));
// ---- training: every tier is its own bar with its own squad (NGU) ----
const tierRows = { atk: [], speed: [] };
for (const lane of ["atk", "speed"]) {
  const wrap = $(lane === "atk" ? "atkTiers" : "speedTiers");
  bots.TRAININGS[lane].forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML =
      `<span class="rowName">${t.name}</span>` +
      `<span class="rowGain">+${t.gain}${lane === "speed" ? " hits/s" : " ATK"}/fill</span>` +
      `<span class="rowAlloc"></span>` +
      `<span class="rowStat" id="ts_${lane}${i}"></span>` +
      `<div class="rowBar"><div class="rowFill" id="tf_${lane}${i}"></div></div>`;
    row.querySelector(".rowAlloc").appendChild(allocMini(`${lane}.${i}`));
    wrap.appendChild(row);
    tierRows[lane].push(row);
  });
}

// ---- enhance squad: segmented slot picker (no dropdowns) ----
for (const slot of SLOTS) {
  const btn = document.createElement("button");
  btn.textContent = slot;
  btn.dataset.slot = slot;
  btn.addEventListener("click", () => { state.bots.enhTarget.slot = slot; });
  $("enhSeg").appendChild(btn);
}

// ---- GM tab: account flags / admin tools ----
for (const type of Object.keys(FLAGS)) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<span class="rowName">${FLAGS[type].label}</span><span class="rowGain">${FLAGS[type].gain}/rank</span><span class="rowStat" id="gmfr_${type}"></span><button id="gmfb_${type}"></button>`;
  $("gmFlags").appendChild(row);
  row.querySelector("button").addEventListener("click", e => { e.stopPropagation(); buyFlag(state, type); });
}
for (const type of Object.keys(UNLOCKS)) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<span class="rowName">${UNLOCKS[type].label}</span><span class="rowGain">${UNLOCKS[type].desc}</span><span class="rowStat"></span><button id="gmub_${type}"></button>`;
  $("gmTools").appendChild(row);
  row.querySelector("button").addEventListener("click", e => { e.stopPropagation(); buyUnlock(state, type); });
}
for (const type of Object.keys(UTILITY)) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<span class="rowName">${UTILITY[type].label}</span><span class="rowGain"></span><span class="rowStat" id="gmur_${type}"></span><button id="gmub2_${type}"></button>`;
  $("gmTools").appendChild(row);
  row.querySelector("button").addEventListener("click", e => { e.stopPropagation(); buyUtility(state, type); });
}
for (const type of Object.keys(bots.PRIV)) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<span class="rowName">${bots.PRIV[type].label}</span><span class="rowGain">${bots.PRIV[type].gain}/rank</span><span class="rowStat" id="gmpr_${type}"></span><button id="gmpb_${type}"></button>`;
  $("gmPriv").appendChild(row);
  row.querySelector("button").addEventListener("click", e => { e.stopPropagation(); bots.buyPriv(state, type); });
}

// ---- scheduler toggle ----
$("schedToggle").addEventListener("change", () => { state.gm.schedulerOn = $("schedToggle").checked; });

// ---- farming: dense zone table, built once, cells updated in render ----
// ---- zones: bot-only, same row component as training ----
const zoneRows = farm.zones.map((z, i) => {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML =
    `<span class="rowName">${z.name}<div class="sub">${z.mob} · ${fmt(z.mobHp)} HP · det ${z.detection}/h</div></span>` +
    `<span class="rowGain">${fmt(z.copper)}c/kill<div class="sub">IP ${fmt(z.ipLo)}–${fmt(z.ipHi)}</div></span>` +
    `<span class="rowAlloc"></span>` +
    `<span class="rowStat" id="zs${i}"></span>` +
    `<div class="rowBar"><div class="rowFill" id="zf${i}"></div></div>`;
  row.querySelector(".rowAlloc").appendChild(allocMini(`zones.${i}`));
  $("zones").appendChild(row);
  return row;
});

// ---- gear: build slot rows once ----
const slotEls = {};
let pendingReforge = {}; // transient per-slot candidate affixes (preview-then-commit)
for (const slot of SLOTS) {
  const div = document.createElement("div");
  div.className = "slot";
  div.innerHTML = `<div class="slotName">${slot}</div>
    <div class="slotItem" id="si_${slot}">—</div>
    <div class="slotControls">
      <span class="ctlGroup"><button id="se_${slot}">enhance</button><span class="enhInfo" id="sei_${slot}"></span></span>
      <span class="ctlGroup"><button id="rf_${slot}">reforge</button><span class="enhInfo" id="rfi_${slot}"></span></span>
    </div>
    <div class="reforgeCand" id="rfc_${slot}" style="display:none">
      <span id="rfcl_${slot}"></span>
      <span class="ctlGroup"><button id="rfk_${slot}">keep</button><button id="rfr_${slot}">reroll</button><button id="rfd_${slot}">discard</button></span>
    </div>`;
  $("slots").appendChild(div);
  slotEls[slot] = div;
  $(`se_${slot}`).addEventListener("click", () => {
    const item = state.gear[slot];
    if (!item) return;
    const r = enh.attempt(state, item, Math.random, $("safeguard").checked);
    if (r === "poor" || r === "max") return; // button state explains itself
    enhMilestones(item, r); // feedback is the row flash, not log spam
  });
  // reforge bench: roll a candidate (spends scrap), preview, commit or discard
  const rollCand = () => {
    const item = state.gear[slot];
    const cand = reforge(state, item, Math.random);
    if (!cand) { log("reforge: not enough scrap"); return; }
    pendingReforge[slot] = cand;
    flashSlot(slot, true);
  };
  $(`rf_${slot}`).addEventListener("click", rollCand);
  $(`rfr_${slot}`).addEventListener("click", rollCand);
  $(`rfk_${slot}`).addEventListener("click", () => {
    const item = state.gear[slot], cand = pendingReforge[slot];
    if (!item || !cand) return;
    item.affixes = cand;
    delete pendingReforge[slot];
    log(`reforged ${item.name}`);
    flashSlot(slot, true);
  });
  $(`rfd_${slot}`).addEventListener("click", () => { delete pendingReforge[slot]; });
}

// Ban Wave — armed two-click confirm (irreversible reset of the bot stratum)
let banArmed = false;
let banTimer = 0;
$("banWaveBtn").addEventListener("click", () => {
  if (!banArmed) {
    if (pendingScripts(state) <= 0) return;
    banArmed = true;
    clearTimeout(banTimer);
    banTimer = setTimeout(() => { banArmed = false; }, 4000); // disarm if not confirmed
    return;
  }
  banArmed = false;
  clearTimeout(banTimer);
  const gained = banWave(state);
  if (gained > 0) {
    log(`⚡ Ban Wave #${fmt(state.rebirths)} — farm reset · banked +${fmt(gained)} scripts (×${scriptMult(state).toFixed(2)} damage)`);
    if (state.rebirths === 1) openHelp("banwave"); // first-time explainer popup
  }
  stashDirty = true;
  save(state);
});

// Help menu — a modal that doubles as the first-time explainer popup. Topics
// are data; add an entry to grow it. openHelp(id) scrolls to that topic.
const HELP = [
  {
    id: "banwave",
    title: "Ban Wave",
    body: [
      "The anti-cheat finally notices your farm and bans the bots.",
      "You LOSE the disposable bot layer — bots, training progress and copper reset to a fresh start.",
      "You KEEP everything your character owns: gear, plusses, scrap, tickets, GM perks, scars, titles and boss progress. None of it ever resets.",
      "In return you bank <b>Scripts</b> = √(training fills this run). Every Script permanently adds <b>+1% damage</b>, and Scripts never reset.",
      "Because your bots borrow your power, more damage means a faster farm too — so each Ban Wave you rebuild quicker and climb higher than before.",
      "Bank when the √ payout is worth the reset: pushing twice as long pays less than twice the Scripts.",
    ],
  },
];
function openHelp(topicId) {
  $("helpTitle").textContent = "Help";
  $("helpContent").innerHTML = HELP.map(h =>
    `<section class="helpTopic" id="help_${h.id}"><h3>${h.title}</h3>${h.body.map(p => `<p>${p}</p>`).join("")}</section>`
  ).join("");
  $("helpModal").style.display = "";
  if (topicId) $(`help_${topicId}`)?.scrollIntoView();
}
function closeHelp() { $("helpModal").style.display = "none"; }
$("helpBtn").addEventListener("click", () => openHelp());
$("helpClose").addEventListener("click", closeHelp);
$("helpModal").addEventListener("click", e => { if (e.target === $("helpModal")) closeHelp(); });
$("descendBtn").addEventListener("click", advanceWall);
$("wallSelect").addEventListener("click", e => { const w = e.target.dataset?.wall; if (w) switchWall(Number(w)); });
$("exportBtn").addEventListener("click", () => {
  const text = exportSave(state);
  try { navigator.clipboard?.writeText(text); } catch {}
  $("helpTitle").textContent = "Export save";
  $("helpContent").innerHTML = `<p>Copied to clipboard — or select all below and copy:</p><textarea readonly class="exportBox" onclick="this.select()">${text.replace(/</g, "&lt;")}</textarea>`;
  $("helpModal").style.display = "";
});

// ---- Delve: idle depth engine — Cache upgrade tree buttons (built once) ----
for (const key of Object.keys(dungeon.UPGRADES)) {
  const u = dungeon.UPGRADES[key];
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<span class="rowName">${u.label}</span><span class="rowGain">${u.gain}/rank</span><span class="rowStat" id="dur_${key}"></span><button id="dub_${key}"></button>`;
  $("delveTree").appendChild(row);
  row.querySelector("button").addEventListener("click", () => { dungeon.buy(state, key); });
}

$("stashToggle").addEventListener("click", () => {
  const l = $("stashList");
  l.style.display = l.style.display === "none" ? "" : "none";
});
// rarity dropdowns are built from the data (add a tier → it shows up here)
for (const sel of [$("keepRarity"), $("salvageRarity")]) {
  sel.innerHTML = RARITIES.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
}
$("salvageRarity").value = "uncommon"; // default sweep target

// loot filter dials (passive, on-drop) — keep at/above rarity AND ip
$("autoFilter").addEventListener("change", () => { state.gear.autoFilter = $("autoFilter").checked; });
$("autoEquip").addEventListener("change", () => { state.gear.autoEquip = $("autoEquip").checked; });
$("keepRarity").addEventListener("change", () => { state.gear.keepRarity = $("keepRarity").value; });
$("keepIp").addEventListener("change", () => { state.gear.keepIp = Math.max(0, Math.floor(+$("keepIp").value) || 0); });
// manual bulk sweep — salvage all unlocked stash items ≤ rarity AND ≤ ip (0 ip = ignore ip)
$("salvageMatch").addEventListener("click", () => {
  const ip = Math.floor(+$("salvageIp").value) || 0;
  const { count, tally } = salvageMatching(state, $("salvageRarity").value, ip > 0 ? ip : Infinity);
  if (!count) return;
  stashDirty = true;
  const parts = Object.entries(tally).map(([r, n]) => `${n} ${r}`).join(", ");
  log(`salvaged ${count} items → ${parts} scrap`);
});

function renderStash() {
  stashDirty = false;
  // group by slot, best-first — same-slot items cluster so comparison is easy
  const sorted = [...state.gear.stash]
    .sort((a, b) => a.slot.localeCompare(b.slot) || contribution(b) - contribution(a))
    .slice(0, 24);
  $("stashToggle").textContent = `stash (${state.gear.stash.length}/${STASH_CAP})`;
  const el = $("stashList");
  el.innerHTML = "";
  for (const item of sorted) {
    const idx = state.gear.stash.indexOf(item);
    const rar = RARITY_BY_ID[item.rarity] || RARITIES[0];
    const up = isUpgrade(state, item); // strict upgrade over what's equipped in the slot
    const affixes = (item.affixes || []).map(a => affixLabel(a, state)).join(" · ");
    const row = document.createElement("div");
    row.className = "stashRow" + (up ? " upgrade" : "") + (item.lock ? " locked" : "");
    row.style.borderLeftColor = up ? "var(--gold)" : rar.color;
    row.innerHTML =
      `<span class="sMark">${up ? "▲" : item.lock ? "L" : ""}</span>` +
      `<span class="sName" style="color:${rar.color}">${item.name}</span>` +
      `<span class="sAct"><button class="eq">equip</button><button class="lk">${item.lock ? "unlock" : "lock"}</button><button class="sv" ${item.lock ? "disabled" : ""}>×${scrapYield(item)}</button></span>` +
      `<span class="sInfo">${item.slot} · IP ${fmt(item.ip)}${item.plus ? ` +${item.plus}` : ""}${affixes ? ` · ${affixes}` : ""}</span>`;
    row.querySelector(".eq").addEventListener("click", () => { equipFromStash(state, idx); delete pendingReforge[item.slot]; stashDirty = true; });
    row.querySelector(".lk").addEventListener("click", () => { item.lock = !item.lock; stashDirty = true; });
    row.querySelector(".sv").addEventListener("click", () => {
      state.gear.stash.splice(idx, 1);
      const s = salvage(state, item);
      log(`salvaged ${item.name} → +${s.n} ${s.rarity} scrap`);
      stashDirty = true;
    });
    el.appendChild(row);
  }
  if (!state.gear.stash.length) el.innerHTML = `<div class="muted" style="padding:6px 4px">stash empty — drops land here</div>`;
  else if (state.gear.stash.length > 24) {
    const more = document.createElement("div");
    more.className = "muted";
    more.style.padding = "4px";
    more.textContent = `…and ${state.gear.stash.length - 24} more (salvage to clear)`;
    el.appendChild(more);
  }
}

// The Armory grid: zone rows × 3 slot cells. Each cell shows the entry's rank,
// its lane passive, and a fill bar to the next rank. Dim at rank 0. Lane totals
// (the displayed law-5 terms) ride in the header. Re-rendered only on drops.
function renderArmory() {
  armoryDirty = false;
  const mods = armory.armoryMods(state);
  const st = armory.armoryStats(state);
  $("armorySub").innerHTML = `— <b>${st.totalRank}</b> total rank · ${st.logged} entries · ` +
    `<span class="sat">+${mods.atkPct.toFixed(1)}% ATK · +${mods.hastePct.toFixed(1)}% haste · +${mods.copperPct.toFixed(1)}% copper</span>`;
  let html = "";
  for (let z = 1; z <= farm.zones.length; z++) {
    let cells = "";
    for (const slot of SLOTS) {
      const pts = state.armory[`${slot}:${z}`] || 0;
      const rank = armory.rankOf(pts);
      const cur = armory.pointsForRank(rank), next = armory.pointsForRank(rank + 1);
      const fill = rank >= armory.RMAX ? 1 : (pts - cur) / (next - cur);
      const pct = armory.entryPct(slot, z, rank);
      const name = NAMES[slot][z - 1];
      cells += `<div class="amCell${rank > 0 ? "" : " dim"}${rank >= armory.RMAX ? " max" : ""}" title="${name}">` +
        `<span class="amName">${name}</span>` +
        `<span class="amRank">R${rank}${rank >= armory.RMAX ? " ✦" : ""} · +${pct.toFixed(2)}% ${laneWord(armory.LANE[slot])}</span>` +
        `<span class="amBar"><span style="width:${(fill * 100).toFixed(0)}%"></span></span></div>`;
    }
    html += `<div class="amRow"><span class="amZone">z${z}</span>${cells}</div>`;
  }
  $("armoryGrid").innerHTML = html;
}

// ---- loop ----
let lastSave = 0;
let lastTick = Date.now();
function tick() {
  const now = Date.now();
  const dt = Math.min((now - lastTick) / 1000, farm.offlineCapS(state)) * devScale; // same clamp as offline
  lastTick = now;
  // intro beat: the first login flips systems on + drops the bot-farm hint
  if (!state.unlocked) { state.unlocked = true; reveal(); say("fail_hopeless"); }
  if (state.unlocked) {
    bots.tick(state, dt, (kind, item) => kind === "drop" ? onDrop(item) : enhMilestones(item, kind));
  }
  // Siege: the frontier Warden whittles at Combat Power; broken walls farm set
  // pieces on a timer (Farm status). No pulls, no cooldown — the fight is live.
  if (!state.boss.broken && state.wall === state.maxWall) {
    if (drain(state, dt).broke) handleBreak();
  } else if (state.boss.broken) {
    const f = farmTick(state, dt);
    for (const piece of f.pieces) {
      log(`🏆 ${piece.name} dropped! +${piece.pct}% ${laneWord(piece.lane)}`);
      if (setComplete(state, state.wall)) log(`★ ${boss.set.name} SET COMPLETE — ×${(1 + SET_BONUS).toFixed(2)} damage`);
    }
    if (f.rolls && !f.pieces.length) log(`farmed ${boss.name}: +${fmt(f.tickets)} tickets`);
    if (f.rolls) save(state);
  }
  { // the Delve mines Cache idle — reach depth tracks the build's power
    const g = charDps();
    state.dungeon.cache += dungeon.cachePerSec(state, g) * dt;
    state.dungeon.depthBest = Math.max(state.dungeon.depthBest, dungeon.reachDepth(state, g));
  }
  if (state.unlocked) checkUnlocks();
  if (now - lastSave > 5000) { lastSave = now; save(state); }
}

function render() {
  const now = Date.now();
  const frameDt = Math.min(0.25, (now - lastRenderNow) / 1000); // clamp tab-switch/idle gaps
  lastRenderNow = now;
  if (tabsDirty) renderTabs();
  renderBattle(state, now);
  const d = derive(state);
  const dps = d.atk * d.hitsPerSec;
  $("cpEl").textContent = fmt(dps);
  // Combat Power rate: measured over a ~1s window — catches all continuous
  // growth (training now, farm later) without re-deriving each faucet.
  if (cpSample === null) { cpSample = dps; cpSampleT = now; }
  else if (now - cpSampleT >= 1000) {
    cpRate = (dps - cpSample) / ((now - cpSampleT) / 1000);
    cpSample = dps; cpSampleT = now;
  }
  $("cpRate").textContent = cpRate > 0 ? `+${fmt(cpRate)}/s` : "—";
  $("cpElP").textContent = fmt(dps); // Player-tab breakdown: total + its factors (law 5)
  $("atkEl").textContent = fmt(d.atk);
  $("hpsEl").textContent = d.hitsPerSec.toFixed(2);
  $("gmEl").textContent = (gmDmgMult(state) * gmHasteMult(state)).toFixed(2);
  $("copperEl").textContent = fmt(state.copper);
  $("ticketsEl").textContent = fmt(state.tickets);
  { // scripts chip appears once the first Ban Wave has been earned
    const show = (state.scripts || 0) > 0 || (state.rebirths || 0) > 0;
    $("scriptChip").style.display = show ? "" : "none";
    if (show) {
      $("scriptsEl").textContent = fmt(state.scripts);
      $("scriptMultEl").textContent = scriptMult(state).toFixed(2);
    }
  }
  { // copper rate: numbers should always be visibly going somewhere
    let cps = 0;
    const sc = bots.effScale(state.bots);
    farm.zones.forEach((z, i) => {
      const n = (state.bots.alloc.zones[i] || 0) * sc;
      if (n > 0) cps += bots.botZoneRates(state.bots, i, n, d).copperPerSec;
    });
    $("copperRate").textContent = cps > 0 ? `+${fmt(cps)}/s` : "—";
  }
  { // NGU-style ticker: FREE bots (unallocated) vs capacity — allocation drains it
    $("resBots").textContent = `${bots.freeBots(state.bots).toFixed(1)} / ${bots.capacity(state.bots, state.gm.cap)}`;
    $("resRate").textContent = `+${bots.createRate(state.bots).toFixed(1)}`;
  }
  $("banWaveSection").style.display = state.features.rebirth ? "" : "none";
  if (state.features.rebirth) { // Ban Wave panel: payout preview + what survives
    const pend = pendingScripts(state);
    const btn = $("banWaveBtn");
    $("banWaveInfo").innerHTML = banArmed
      ? `<span class="warn">wipes bots · training · copper. Keeps gear, scrap, tickets, scripts, story. Bank <b>+${fmt(pend)}</b> scripts?</span>`
      : `<b>+${fmt(pend)}</b> scripts ready (from ${fmt(totalFills(state))} training fills)` +
        ` · <b>${fmt(state.rebirths || 0)}</b> done`;
    btn.disabled = pend <= 0 && !banArmed;
    btn.textContent = banArmed ? "confirm Ban Wave" : "Ban Wave";
    btn.classList.toggle("armed", banArmed);
  }

  // Siege readout: integrity remaining + time-to-breach estimate + CP/s
  {
    $("ticketGain").textContent = "";
    if (state.boss.broken) {
      $("depth").textContent = "BREACHED";
      $("cooldown").textContent = bossHasSet(state.wall)
        ? `set ${setCount(state, state.wall)}/${PARTS.length} · farming for pieces`
        : "farming for tickets";
      $("record").textContent = "the door stands open";
    } else {
      const remain = boss.hp ? (state.boss.hp || 0) / boss.hp : 1;
      $("depth").textContent = `${(remain * 100).toFixed(1)}%`;
      $("cooldown").textContent = `time to breach: ${ttkText(timeToKill(state))}`;
      $("record").textContent = `integrity ${fmt(state.boss.hp)} / ${fmt(boss.hp)} · CP ${fmt(dps)}/s`;
    }
  }
  { // wall progression + wall selector (switch to a cleared wall to farm it)
    const next = getBoss(state.maxWall + 1);
    $("descendBtn").style.display = (state.wall === state.maxWall && state.boss.broken && next) ? "" : "none";
    const cleared = state.cleared.slice();
    if (state.wall === state.maxWall && state.boss.broken && !next) cleared.push(`W${state.wall} ${boss.name} — final`);
    $("monument").style.display = cleared.length ? "" : "none";
    $("monument").textContent = cleared.length ? `Broken: ${cleared.join(" · ")}` : "";
    const sel = `${state.maxWall}:${state.wall}`;
    if (state.maxWall > 1) {
      $("wallSelect").style.display = "";
      if (sel !== lastWallSel) {
        lastWallSel = sel;
        $("wallSelect").innerHTML = "";
        for (let w = 1; w <= state.maxWall; w++) {
          const bw = getBoss(w);
          const btn = document.createElement("button");
          btn.dataset.wall = w;
          btn.className = "wallBtn" + (w === state.wall ? " active" : "");
          btn.textContent = w < state.maxWall ? `W${w} ${bw.name} ⚑` : `W${w} ${bw.name}`;
          $("wallSelect").appendChild(btn);
        }
      }
    } else { $("wallSelect").style.display = "none"; lastWallSel = ""; }
  }

  { // Combat Power crit breakdown — a displayed term (guideline 5)
    const cf = critFactor(d.crit);
    $("projection").textContent = state.boss.broken ? "" :
      `crit ×${cf.toFixed(2)} — ${(d.crit.rate * 100).toFixed(0)}% ×${d.crit.critMult.toFixed(1)}, super ×${d.crit.superMult.toFixed(1)}`;
  }

  // GM tab
  for (const type of Object.keys(FLAGS)) {
    $(`gmfr_${type}`).textContent = `rank ${state.gm[type]}`;
    const btn = $(`gmfb_${type}`);
    btn.textContent = `${fmt(flagCost(type, state.gm[type]))} tickets`;
    buyState(btn, state.tickets >= flagCost(type, state.gm[type]));
  }
  for (const type of Object.keys(UNLOCKS)) {
    const btn = $(`gmub_${type}`);
    const owned = !!state.gm[type];
    btn.textContent = owned ? "INSTALLED" : `${fmt(UNLOCKS[type].cost)} tickets`;
    buyState(btn, !owned && state.tickets >= UNLOCKS[type].cost);
  }
  for (const type of Object.keys(UTILITY)) {
    const rank = state.gm[type];
    const maxed = rank >= UTILITY[type].max;
    $(`gmur_${type}`).textContent = `${rank}/${UTILITY[type].max}`;
    const btn = $(`gmub2_${type}`);
    btn.textContent = maxed ? "MAX" : `${fmt(utilityCost(type, rank))} tickets`;
    buyState(btn, !maxed && state.tickets >= utilityCost(type, rank));
  }
  for (const type of Object.keys(bots.PRIV)) {
    const cost = bots.privCost(state.bots, type);
    $(`gmpr_${type}`).textContent = `rank ${bots.privRank(state.bots, type)}`;
    const btn = $(`gmpb_${type}`);
    btn.textContent = `${fmt(cost)} tickets`;
    buyState(btn, state.tickets >= cost);
  }

  $("schedLine").style.display = "none"; // scheduler retired — the fight is always live

  if (!state.unlocked) return;

  // bot farm
  const b = state.bots;
  // rig labels speak the BOTTER register; "session" stays the GM panel's word
  const rig = [["buyCap", `multiclient +${4}`, bots.capCost(b)], ["buyCreate", "account creator +", bots.createCost(b)],
    ["buyPower", "script version +", bots.powerCost(b)], ["buySpeed", "overclock +", bots.speedCost(b)]];
  for (const [id, label, cost] of rig) { $(id).textContent = buyLabel(label, cost); buyState($(id), state.copper >= cost); }
  const scale = bots.effScale(b);
  const scaled = scale < 0.995 ? ` · short ${((1 - scale) * 100).toFixed(0)}% (bans)` : "";
  $("rigStats").textContent =
    `script ×${bots.botPower(b).toFixed(2)} · clock ×${bots.botSpeed(b).toFixed(2)} · banned ${Math.floor(b.banned)}${scaled}`;
  $("popFill").style.width = `${Math.min(100, (b.pop / bots.capacity(b, state.gm.cap)) * 100)}%`;
  const quality = bots.botPower(b) * bots.botSpeed(b);

  // allocation inputs: sync every bar's number unless being edited
  for (const [key, input] of Object.entries(allocInputs)) {
    if (document.activeElement !== input) input.value = getAlloc(key);
  }

  for (const bar of ["atk", "speed"]) {
    const B = b.bars[bar];
    const tiers = bots.TRAININGS[bar];
    let laneRate = 0;
    tiers.forEach((t, i) => {
      const row = tierRows[bar][i];
      const locked = i >= B.unlocked;
      const squad = (b.alloc[bar][i] || 0) * scale;
      const rate = locked ? 0 : Math.min(squad * quality, t.cost * bots.MAX_FILLS_PER_S) / t.cost;
      const maxed = !locked && squad > 0 && squad * quality >= t.cost * bots.MAX_FILLS_PER_S;
      laneRate += rate * t.gain;
      row.classList.toggle("locked", locked);
      row.classList.toggle("active", !locked && squad > 0);
      row.classList.toggle("maxed", maxed); // capped → distinct "done" state
      const stat = $(`ts_${bar}${i}`);
      if (locked) {
        stat.textContent = `locked · ${fmt(B.fills[i - 1] || 0)}/${fmt(bots.unlockFills(i - 1))} fills of ${tiers[i - 1].name}`;
      } else if (squad > 0) {
        stat.textContent = `${fmt(B.fills[i] || 0)} fills · ${maxed ? "RATE MAX" : rate.toFixed(2) + " fills/s"}`;
      } else {
        stat.textContent = `${fmt(B.fills[i] || 0)} fills`;
      }
      // fast bars strobe against the frame rate — render solid instead
      const tfEl = $(`tf_${bar}${i}`);
      if (locked || squad <= 0) tfEl.style.width = "0";
      else if (rate >= 10) tfEl.style.width = "100%"; // at/near cap: solid
      else tfEl.style.width = `${Math.min(100, ((B.prog[i] || 0) / t.cost) * 100)}%`;
    });
    const el = bar === "atk" ? "Atk" : "Speed";
    const trained = bar === "atk"
      ? `trained +${b.trained.atk < 1000 ? b.trained.atk.toFixed(2) : fmt(b.trained.atk)} ATK (+${laneRate.toFixed(3)}/s)`
      : `trained +${b.trained.hits.toFixed(4)} hits/s (+${laneRate.toFixed(5)}/s)`;
    $(`bar${el}Info`).textContent = trained;
  }
  $("autoEquipLine").style.display = state.gm.autoequip ? "" : "none"; // appears once the module is unlocked
  $("autoEquip").checked = state.gear.autoEquip !== false;
  $("autoFilter").checked = state.gear.autoFilter !== false;
  if (document.activeElement !== $("keepRarity")) $("keepRarity").value = state.gear.keepRarity;
  if (document.activeElement !== $("keepIp")) $("keepIp").value = state.gear.keepIp;
  const owned = RARITIES.filter(r => (state.scrap[r.id] || 0) > 0);
  $("scrapWallet").innerHTML = owned.length
    ? owned.map(r => `<span class="scrapPill" style="border-color:${r.color};color:${r.color}">${fmt(state.scrap[r.id])} ${r.name.toLowerCase()}</span>`).join("")
    : `<span class="muted">no scrap yet — salvage drops to earn it</span>`;

  // bot enhance squad
  for (const btn of $("enhSeg").children) btn.classList.toggle("active", btn.dataset.slot === b.enhTarget.slot);
  if (document.activeElement !== $("enhPlus")) $("enhPlus").value = b.enhTarget.plus;
  const tItem = state.gear[b.enhTarget.slot];
  const iv = tItem ? bots.enhInterval(b, tItem.plus) : Infinity;
  $("botEnhInfo").textContent = b.alloc.enh <= 0 ? "idle"
    : !tItem ? "no item in slot"
    : tItem.plus >= b.enhTarget.plus ? `done: +${tItem.plus}`
    : `try every ${iv === Infinity ? "—" : fmt(iv)}s · ${fmt(enh.cost(tItem))}c/try`;

  // zones — unlocked by boss progress; stat shows the squad's ACTUAL kill rate
  farm.zones.forEach((z, i) => {
    const unlocked = farm.zoneUnlocked(state.cleared.length, i);
    const n = (state.bots.alloc.zones[i] || 0) * scale;
    const zr = unlocked ? bots.botZoneRates(state.bots, i, n, d) : { held: false, kps: 0 };
    zoneRows[i].classList.toggle("active", unlocked && n > 0 && zr.held);
    zoneRows[i].classList.toggle("locked", !unlocked || (n > 0 && !zr.held));
    const stat = $(`zs${i}`);
    if (!unlocked) {
      stat.textContent = `[LOCKED] break W${farm.zoneUnlockClears(i)}`;
    } else if (n <= 0) {
      stat.textContent = "unmanned";
    } else if (!zr.held) {
      stat.textContent = `squad DPS ${fmt(zr.squadDps)} / ${fmt(z.gate)} — can't hold`;
    } else {
      const sat = farm.saturation(zr.squadDps, z.mobHp), bias = farm.lootBias(sat);
      const satTerm = bias > 0 ? ` · <span class="sat">SAT ×${sat.toFixed(1)} → +${bias} bands</span>` : "";
      stat.innerHTML = `${zr.kps.toFixed(2)} kills/s${zr.kps >= farm.KILL_CAP ? " · CAP" : ""} · ${fmt(zr.copperPerSec)}c/s · ${zr.bansPerHour.toFixed(2)} bans/h${satTerm}`;
    }
    // kill-cycle bar: integrate phase incrementally (speed = kps, one fill per
    // kill). NOT frac(now×kps) — that spins wildly whenever kps drifts (pop
    // growth), because now≈1.8e9 amplifies any d(kps)/dt.
    const zfEl = $(`zf${i}`);
    if (n > 0 && zr.kps > 0) {
      zonePhase[i] = ((zonePhase[i] || 0) + zr.kps * frameDt) % 1;
      zfEl.style.width = zr.kps >= 10 ? "100%" : `${zonePhase[i] * 100}%`;
    } else { zonePhase[i] = 0; zfEl.style.width = "0"; }
  });

  // gear
  const sg = $("safeguard").checked;
  $("stacksHud").textContent = state.failstacks
    ? `· failstacks ${state.failstacks} (+${Math.min(state.failstacks, enh.STACK_CAP_PTS)}% next success)`
    : "";
  for (const slot of SLOTS) {
    const item = state.gear[slot];
    const si = $(`si_${slot}`);
    if (item) {
      const rar = RARITY_BY_ID[item.rarity] || RARITIES[0];
      const lines = (item.affixes || []).map(a => `<div class="affixItem">${affixLabel(a, state)}</div>`).join("");
      si.innerHTML =
        `<div class="itemHeader">` +
          `<span class="itemName" style="color:${rar.color}">${item.name}</span>` +
          `<span class="rarityTag" style="color:${rar.color}">${rar.name}</span>` +
          `<span class="itemMeta">IP ${fmt(item.ip)}${item.plus ? ` +${item.plus}` : ""} · ${fmt(contribution(item))} ATK</span>` +
        `</div>` +
        (lines ? `<div class="affixList">${lines}</div>` : `<div class="affixList muted">no affixes</div>`);
      slotEls[slot].style.borderLeftColor = rar.color;
    } else {
      si.textContent = "—";
      slotEls[slot].style.borderLeftColor = "";
    }
    si.className = "slotItem" + (item ? ` tier-${enh.zone(item.plus)}` : "");
    const btn = $(`se_${slot}`);
    btn.disabled = !item || item.plus >= enh.MAX_PLUS;
    if (item && item.plus < enh.MAX_PLUS) {
      const useSg = sg && enh.canSafeguard(item.plus);
      const fall = useSg ? "no drop (safeguard)"
        : enh.isNightmare(item.plus) ? `fail → +${enh.checkpointOf(item.plus)}`
        : enh.isRisk(item.plus) ? "fail −1" : "fail safe";
      $(`sei_${slot}`).textContent =
        `+${item.plus}→+${item.plus + 1} · ${fmt(enh.cost(item, useSg))}c · ${(enh.chance(item.plus, state.failstacks) * 100).toFixed(1)}% · ${fall}`;
    } else {
      $(`sei_${slot}`).textContent = "";
    }
    // reforge bench: cost readout, afford-gating, candidate preview
    const rf = $(`rf_${slot}`);
    const canRf = canReforge(item);
    const cost = canRf ? reforgeCost(item) : null;
    const afford = cost && (state.scrap[cost.rarity] || 0) >= cost.n;
    rf.disabled = !canRf || !afford;
    $(`rfi_${slot}`).textContent = !item ? "" : !canRf ? "no affixes" : `${cost.n} ${cost.rarity} scrap/roll`;
    const cand = pendingReforge[slot];
    const rfc = $(`rfc_${slot}`);
    if (item && cand) {
      rfc.style.display = "";
      $(`rfcl_${slot}`).innerHTML = `→ ${cand.map(a => affixLabel(a, state)).join(" · ")}`;
      $(`rfr_${slot}`).disabled = !afford;
    } else rfc.style.display = "none";
  }
  $("titles").style.display = state.titles.length ? "" : "none";
  $("titles").textContent = state.titles.length ? `Titles: ${state.titles.join(" · ")}` : "";

  { // Trophy cabinet: one 7-piece set per Warden. Owned pieces glow; unowned
    // are silhouettes. Break for the first, farm the boss for the rest.
    const walls = bosses.filter(b => b.set).map(b => b.wall);
    let done = 0;
    const html = walls.map(w => {
      const bw = getBoss(w), have = setCount(state, w), complete = setComplete(state, w);
      if (complete) done++;
      const pips = PARTS.map((_, i) => {
        const p = pieceOf(w, i), own = ownsPiece(state, w, i);
        return `<span class="pip ${own ? "own" : "miss"}">${own ? "✓" : "◈"} ${p.part} <b>+${p.pct}% ${laneWord(p.lane)}</b></span>`;
      }).join("");
      return `<div class="trophySet ${complete ? "complete" : ""}">` +
        `<div class="trophySetHead"><span class="trophySetName">${bw.set.name}</span>` +
        `<span class="trophySetProg">${have}/${PARTS.length}${complete ? ` · ×${(1 + SET_BONUS).toFixed(2)} dmg` : ""}</span></div>` +
        `<div class="pips">${pips}</div></div>`;
    }).join("");
    $("trophySet").textContent = walls.length ? `${done}/${walls.length} sets complete` : "";
    $("trophyCabinet").innerHTML = html;
  }

  { // delve panel — idle depth engine + the Cache upgrade tree
    const dps = charDps(), depth = dungeon.reachDepth(state, dps);
    $("delveState").innerHTML = `depth <b>${fmt(depth)}</b> · deepest <b>${fmt(state.dungeon.depthBest)}</b> · <span class="sat">${fmt(dungeon.cachePerSec(state, dps))} Cache/s</span>`;
    $("delveCache").innerHTML = `<b>${fmt(state.dungeon.cache)}</b> Cache banked`;
    for (const key of Object.keys(dungeon.UPGRADES)) {
      const c = dungeon.cost(state, key);
      $(`dur_${key}`).textContent = `rank ${dungeon.rank(state, key)}`;
      const btn = $(`dub_${key}`);
      btn.textContent = `${fmt(c)} Cache`;
      buyState(btn, state.dungeon.cache >= c);
    }
  }

  if (stashDirty) renderStash();
  if (armoryDirty) renderArmory();
}

if (DEV) {
  const panel = document.createElement("div");
  panel.id = "devPanel";
  panel.innerHTML = `<b>DEV</b> speed:
    <button data-s="1">×1</button><button data-s="10">×10</button><button data-s="60">×60</button><button data-s="600">×600</button>
    <button id="devCopper">+10k copper</button>
    <button id="devFinish">finish pull</button>
    <button id="devCd">clear cooldown</button>
    <span id="devScaleLbl">×1</span>`;
  document.querySelector("main").prepend(panel);
  for (const btn of panel.querySelectorAll("button[data-s]")) {
    btn.addEventListener("click", () => {
      devScale = Number(btn.dataset.s);
      document.getElementById("devScaleLbl").textContent = "×" + devScale;
    });
  }
  panel.querySelector("#devCopper").addEventListener("click", () => { state.copper += 10_000; });
  panel.querySelector("#devFinish").addEventListener("click", () => { state.boss.hp = 0; }); // instabreach
  panel.querySelector("#devCd").addEventListener("click", () => { if (!state.boss.broken) state.boss.hp = Math.max(0, state.boss.hp - getBoss(state.wall).hp * 0.1); }); // chip 10%
}

$("bossName").textContent = boss.name;
$("bossTitle").textContent = boss.title;
initBattle($("battle"));
say(state.boss.broken ? "break" : "greet");
startGameLoop(tick, render);
