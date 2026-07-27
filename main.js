// main.js — wiring: load → offline batch → loop → autosave; all UI sections.
import { newState } from "./state.js";
import { load, save, wipe, exportSave } from "./saveSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { bosses, getBoss } from "./bosses.js";
import { drain, smite, farmTick, timeToKill } from "./pull.js";
import { initBattle, renderBattle, notifyBreak, notifyEnhance, notifySkill, refreshTheme } from "./battle.js";
import * as skills from "./skills.js";
import { derive } from "./stats.js";
import { critFactor } from "./crits.js";
import * as bots from "./bots.js";
import * as farm from "./farm.js";
import { routeDrop, equipFromStash, contribution, salvage, scrapYield, salvageMatching, canReforge, reforgeCost, reforge, isUpgrade, SLOTS, STASH_CAP, NAMES } from "./gear.js";
import * as armory from "./armory.js";
import { RARITIES, RARITY_BY_ID } from "./rarity.js";
import { affixLabel } from "./affixes.js";
import { banWave, pendingScripts, scriptMult, totalFills, depthMult } from "./rebirth.js";
import { grantBreakPiece, rollFarmDrop, bossHasSet, PARTS, pieceOf, ownedIdxs, ownsPiece, setComplete, setCount, SET_BONUS } from "./trophies.js";
import * as dungeon from "./dungeon.js";
import * as enh from "./enhance.js";
import { fmt, fmtDepth } from "./format.js";

const state = newState();
const loaded = load(state);
let boss = getBoss(state.wall); // reassigned by advanceWall on a break
// Dev hook. `refreshBoss` is exposed because the arena review harness
// (internal/arena.mjs) sets state.wall directly, and the door's hue only moves
// through setWardenHue() inside refreshBoss(). Without it every screenshot came
// out in --w2's green whatever door it claimed to be — the tool was lying, not
// the game.
window.__mm = { state, save: () => save(state), refreshBoss: () => refreshBoss() };

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

// DNA v4 lane 2: --w-active is the door you are standing at, and the whole
// Boss tab reads from it (nameplate frame and rivets, the arena floor glow,
// the wall picker). It was pinned to --w2 in the stylesheet and nothing ever
// moved it, so all ten Wardens rendered in Maren's green. One assignment.
function setWardenHue(wall) {
  const w = Math.max(1, Math.min(10, wall | 0)); // walls are 1-indexed; --w1..--w10
  document.documentElement.style.setProperty("--w-active", `var(--w${w})`);
  refreshTheme(); // the canvas reads --floor-glow and --w-active off the document
}

function refreshBoss() {
  boss = getBoss(state.wall);
  $("bossName").textContent = boss.name;
  $("bossTitle").textContent = boss.title;
  setWardenHue(state.wall);
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
  // The depth term is banked at the BREAK, so it is reported at the break. Left
  // to the Training tab it would be a reward the player discovers later, on a
  // surface they may not open for hours — which is the same as no reward.
  if (state.features.rebirth)
    log(`— every Ban Wave now pays ×${depthMult(state).toFixed(2)} (${state.maxWall - 1} doors cleared)`);
  save(state);
}

// Warden breaks: dialogue, the guaranteed first set piece, the reveal.
// Shared by the live tick and the offline batch (function decl — hoisted).
function handleBreak() {
  const b = getBoss(state.wall);
  say("break");
  log(`★ W${state.wall} BREACHED — ${b.name}`);
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
// `tag` optionally colours one run of the line: {before, text, rarity, after}.
function log(msg, tag) {
  let cls = "log-plain";
  if (msg.startsWith("★")) cls = "log-event";
  else if (msg.startsWith("🏆")) { cls = "log-loot"; msg = "◆ " + msg.slice(2).trimStart(); }
  else if (msg.startsWith("⚡")) { cls = "log-warn"; msg = "! " + msg.slice(1).trimStart(); }
  else if (/wiped|ban wave|banned/i.test(msg)) cls = "log-warn";
  else if (/^(drop:|salvaged|delve:|farmed|offline)/.test(msg)) cls = "log-dim";
  const div = document.createElement("div");
  div.className = "logline " + cls;
  div.textContent = msg;
  // DNA v4 lane 1 in the console: a drop names its item in the tier's hue.
  // Built as a node with textContent rather than innerHTML — item names ride
  // in on imported saves, so this line stays a non-injecting path.
  if (tag) {
    const span = document.createElement("span");
    span.className = "rar rar-" + tag.rarity;
    span.textContent = tag.text;
    div.textContent = "";
    div.append(tag.before, span, tag.after);
  }
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
// Measured damage window → the Boss tab's "avg DPS" readout. CP is the smooth
// EV rate; this is what actually LANDED (drain + skill bursts) over the last
// 30s, so casts visibly move the number. Falls back to EV CP while empty.
const DPS_WINDOW_MS = 30_000;
let dmgLog = []; // [tMs, dealt]
function recordDmg(dealt) { if (dealt > 0) dmgLog.push([Date.now(), dealt]); }
function measuredDps() {
  const now = Date.now();
  while (dmgLog.length && now - dmgLog[0][0] > DPS_WINDOW_MS) dmgLog.shift();
  if (!dmgLog.length) return 0;
  const spanS = Math.max(1, (now - dmgLog[0][0]) / 1000);
  return dmgLog.reduce((s, e) => s + e[1], 0) / spanS;
}
const zonePhase = [];            // per-zone accumulated kill phase (0..1 shown)

function onDrop(item) {
  state.everDropped = true; // gates the Player tab
  const rar = RARITY_BY_ID[item.rarity]?.name || item.rarity;
  const r = routeDrop(state, item); // filter: keep→stash, else→scrap (never auto-equip)
  stashDirty = true; armoryDirty = true;
  const fate = r.equipped ? "equipped" : r.kept ? "stashed" : `salvaged +${r.scrap.n} ${item.rarity} scrap`;
  log(`drop: ${rar} ${item.name} ${fmt(item.ip)}IP · ${fate}`, {
    before: "drop: ", text: `${rar} ${item.name}`,
    rarity: item.rarity, after: ` ${fmt(item.ip)}IP · ${fate}`,
  });
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
    { // skills: pips/Energy bank toward their caps, burst timers run out —
      // same tick as live, silent emitter (no floaters for an absent player).
      // A windup or Blade Dance that was running lands its damage here.
      const sk = skills.tick(state, dt, derive(state));
      if (sk.dmg > 0 && state.wall === state.maxWall && !state.boss.broken
          && smite(state, sk.dmg).broke) {
        log(`★ W${state.wall} BREACHED while you were away`);
        handleBreak();
      }
    }
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
        else if (r.dealt > 0) log(`offline: ${fmt(r.dealt)} health off ${getBoss(state.wall).name}`);
      } else if (state.boss.broken) {
        const fr = farmTick(state, dt);
        if (fr.rolls) log(`offline farm: ${fr.pieces.length} piece(s)`);
      }
    }
    save(state);
  }
}

// ---- tabs + progressive feature unlocks ----
const TAB_FEATURE = { botSec: "training", farmSec: "grind", gearSec: "player", dungeonSec: "delve" };
const TAB_NAME = { battleSec: "Boss", botSec: "Training", farmSec: "Grind", gearSec: "Player", dungeonSec: "Delve", helpSec: "Help" };
// Section id -> DNA v4 room name. Same keys as TAB_FEATURE plus battleSec,
// which has no feature gate because Boss is always open.
const TAB_ROOM = { battleSec: "boss", ...TAB_FEATURE, helpSec: "help" };
// A locked tab's milestone, named without spoiling what is behind it. One
// source for two consumers: the ??? tab button's tooltip and Help's gated
// blocks. JOURNEY.md has cited these as shipped since the page specs were
// written; they were specified and never actually wired up.
const TAB_LOCK = {
  botSec: "Unlocks as soon as the game starts.",
  farmSec: "Unlocks with Training.",
  gearSec: "Unlocks when your bots find their first piece of gear.",
  dungeonSec: "Unlocks at 100 Combat Power.",
};
const UNLOCK_MSG = {
  training: "TRAINING — the old bot farms. Run scripts, build a swarm.",
  grind: "GRIND — deploy the swarm on the leveling zones for copper + gear.",
  player: "PLAYER — your character. Manage gear, enhance, reforge, trophies.",
  delve: "DELVE — the character's own run. Descend for copper; bank before you wipe.",
  rebirth: "BAN WAVE — the anti-cheat notices the farm. Reset it for permanent Scripts.",
};
let tabsDirty = true;

function tabUnlocked(id) { const f = TAB_FEATURE[id]; return !f || state.features[f]; }
function showTab(id) {
  if (!tabUnlocked(id)) return; // ??? tabs are not enterable yet
  for (const pane of document.querySelectorAll(".tabpane")) pane.style.display = pane.id === id ? "" : "none";
  for (const btn of document.querySelectorAll("#tabs button")) btn.classList.toggle("active", btn.dataset.tab === id);
  // The room class carries DNA v4's per-tab accent lane (--acc). One class on
  // <main>, swapped per tab; every accent on the surface reads from it.
  const room = document.querySelector("main");
  for (const c of [...room.classList]) if (c.startsWith("t-")) room.classList.remove(c);
  room.classList.add(`t-${TAB_ROOM[id] || "boss"}`);
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
    if (!open) btn.title = TAB_LOCK[btn.dataset.tab] || "";
    else btn.removeAttribute("title");
  }
}

/* ── Help ──────────────────────────────────────────────────────────────────
   The 22 explanations the Phase 2 relocation table moved off the live tabs.
   A live surface keeps what you need AT the moment of a decision; everything
   that teaches a mechanic in general lives here. Copy is verbatim from
   internal/JOURNEY.md's Help page spec — edit it there first.
   A gated room prints its milestone string and nothing else, the same
   no-spoilers rule the tab bar follows, reusing the tab's own lock copy.  */
const HELP_ROOMS = [
  ["B", "Boss", "battleSec", [
    ["Crits", `Every hit has a chance to crit for extra damage, and a crit has its own
      chance to crit again — a super-crit — for even more. The Boss tab's Average row
      is what your damage actually multiplies by once both chances are folded in.`],
    ["Farming a cleared door", `Once a door is open, farming it rolls for the rest of
      that Warden's trophy set every 30 seconds — each roll a 25% chance to drop the
      next piece.`],
    ["Skills", `Skills are bought and levelled with copper — the same copper the rig
      wants, so every purchase is a choice between your character and your swarm.
      Passive skills fire on their own as you attack; everything they add is folded
      into the one "skills ×" number next to the Skills header. The list shows what
      you know plus the next two you could learn.`],
    ["Casting", `Active skills spend a pip. Pips recharge one every 5 minutes, whether
      the game is open or not, and store up to 5 — nothing is ever lost by being away
      unless the bank is already full. Casting is a bonus for being here, never a
      penalty for leaving. Energy Burst is the exception: it charges from your own
      hits instead of time, and Second Wind refills the whole pip bank on its own
      slower clock.`],
  ]],
  ["T", "Training", "botSec", [
    ["Bot pool", `The population bar is every bot you own, filled or not. The counter at
      the top of the screen is only the ones not assigned to any job.`],
    ["Scripts", `Put bots on a script to run it. Every fill it completes adds its stat —
      ATK or hits per second — permanently. Any one script tops out at 50 fills per
      second; the next script down unlocks once the one above it has enough fills.
      Speed has one more rule: past a threshold that rises with each deeper Warden,
      extra hits per second still count, just less.`],
    ["Enhance squad", `Bots that keep pressing enhance on one item for you. Same odds
      and the same copper cost as doing it yourself — they just never stop. The odds
      and the fallout are on the Player tab.`],
    ["Ban Wave", `Banking a Ban Wave resets your bots, your training and your copper to
      the start. Everything your character owns stays: gear, plusses, scrap, trophies,
      Armory ranks, titles and door progress. In exchange you bank √(training fills) as
      Scripts, and every Script permanently adds +1% damage. Scripts never reset.`,
      `Bank when the payout is worth the reset. Scripts are the square root of your
      training fills, so pushing twice as long pays well under twice the Scripts.`,
      `Every door you clear multiplies that payout, and the multiplier is permanent —
      a Ban Wave never takes it back. Breaking the next Warden before you bank is
      always worth more than banking first.`,
      `Your bots borrow your power — each one hits at 10% of your ATK and 10% of your
      hits per second. So more damage means a faster farm too, and every Ban Wave
      rebuilds quicker than the one before.`],
  ]],
  ["G", "Grind", "farmSec", [
    ["Zones", `Put bots on a zone. Their combined damage has to clear the zone's hold
      number or they earn nothing at all. A zone they can hold kills up to 50 mobs a
      second; every kill pays copper and has a 1-in-400 chance to drop a piece of gear.
      IP is the power band those drops roll in — deeper zones drop higher.`],
  ]],
  ["P", "Player", "gearSec", [
    ["Combat Power", `Your damage per second against the door: ATK multiplied by hits
      per second. "Haste" anywhere on the Player tab is a percentage added to hits per
      second. The Boss tab's "avg DPS" is what actually landed over the last 30
      seconds — crits, skills and casts included — so a burst you press shows up in
      it.`],
    ["Enhance", `Three slots. Enhancing raises an item's plus, and every plus multiplies
      its base power by 1.12. A failed attempt anywhere banks a failstack worth +1
      percentage point on your next attempt, up to +15; a success spends the whole
      bank.`],
    ["Reforge", `Reforge rerolls an item's affixes for scrap of its own rarity. It can't
      change the rarity or the IP — only which affixes it has and what they roll. You
      see the result before you decide whether to keep it.`],
    ["Stash", `Where kept drops land, up to 50. An item's rarity is how many affixes it
      rolled (Common 0, Origin 6) and its IP is how strong those affixes roll.
      Salvaging turns an item into scrap of its own rarity. Locking one protects it
      from auto-salvage, the bulk sweep and the stash-full clear-out.`],
    ["Trophies", `Each Warden has a 7-piece set. Breaking its door gives you the first
      piece; the rest come from farming that Warden on the Boss tab. A complete set
      multiplies your damage by 1.5.`],
    ["Armory", `Every drop is logged here against its own entry, one per item name,
      whether you keep it or scrap it. Rarer copies count for more: a Common is worth 1
      point, an Origin 13. The first rank costs 3 points and each rank after costs 60%
      more, up to rank 12. Weapons rank ATK, armor ranks haste, charms rank copper —
      and the ranks survive every Ban Wave.`],
  ]],
  ["D", "Delve", "dungeonSec", [
    ["How depth works", `Your character digs on their own down here, no input needed.
      Depth is however deep your Combat Power clears: floor 1 needs 10 damage per
      second and each floor after needs 70% more. Every extra floor pays 35% more
      Cache per second, and Cache is the buried server data you spend below.`],
    ["Cache tree", `Each row buys one rank. Every rank you buy raises that row's next
      price.`],
  ]],
];

function renderHelp() {
  $("helpSec").innerHTML = HELP_ROOMS.map(([glyph, room, tab, topics]) => {
    const head = `<h3><span class="glyph" aria-hidden="true">${glyph}</span>${room}</h3>`;
    if (!tabUnlocked(tab)) {
      return `<section class="game locked">${head}<p class="lockMsg">${TAB_LOCK[tab]}</p></section>`;
    }
    const body = topics.map(([name, ...paras]) =>
      `<div class="topic"><h4>${name}</h4>${paras.map(p => `<p>${p}</p>`).join("")}</div>`).join("");
    return `<section class="game">${head}${body}</section>`;
  }).join("");
}

// milestone triggers — the cadence of new toys (starting values, playtest-tuned)
function checkUnlocks() {
  const dps = charDps();
  const s = state, f = s.features;
  const cond = {
    training: s.unlocked,
    grind: f.training, // the bot-farm layer (train + deploy) opens together
    player: f.grind && s.everDropped,
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

// The chat window's two channels. General never gains a line — that is the
// point of it, so this only swaps which pane shows. No unread state is
// tracked, deliberately: a badge on an empty channel would be an obligation
// mechanic pointing at nothing.
for (const btn of document.querySelectorAll(".chan")) {
  btn.addEventListener("click", () => {
    const system = btn.dataset.chan === "system";
    $("log").style.display = system ? "" : "none";
    $("chatGeneral").style.display = system ? "none" : "";
    for (const b of document.querySelectorAll(".chan")) b.classList.toggle("active", b === btn);
  });
}

$("wipeBtn").addEventListener("click", () => {
  if (confirm("Wipe this character's save? (dev button)")) { wipe(); location.reload(); }
});

// ---- bot farm ----
// Rig rows, built once from the registry. Same row grammar as the script
// ladders, the zone list and the duty board — a rig upgrade is a row that
// costs copper, so it reads as the same instrument rather than a new one.
const rigBtns = {};
for (const u of bots.RIG) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML =
    `<span class="rowName">${u.name}<div class="sub" id="rigAt_${u.id}"></div></span>` +
    `<span class="rowGain" id="rigStep_${u.id}"></span>` +
    `<span class="rowStat" id="rigRank_${u.id}"></span>` +
    `<button id="rigBuy_${u.id}"></button>`;
  $("rig").appendChild(row);
  rigBtns[u.id] = row.querySelector("button");
  rigBtns[u.id].addEventListener("click", () => bots.buy(state, u.id));
}

// ---- the skill book (Boss tab) ----
// Rows are the rig's row grammar; the ladder reveals progressively (NGU-style):
// every learned skill plus the next TWO unlearned by cost, nothing else — the
// book grows as you buy instead of dumping 18 rows on minute one.
let skillsSig = "";       // visible-set signature; rebuild rows when it moves
const skillBtns = {};     // id → level-up button
const castBtns = {};      // id → hotbar cast button
const skillsByCost = [...skills.SKILLS].sort((a, b) => a.base - b.base);

function visibleSkills() {
  const out = [];
  let unlearned = 0;
  for (const s of skillsByCost) {
    if (skills.rank(state, s.id) > 0) out.push(s);
    else if (unlearned < 2) { out.push(s); unlearned++; }
  }
  return out;
}

function castSkill(id) {
  const d = derive(state);
  const r = skills.cast(state, id, d);
  if (!r) return;
  if (r.dmg !== undefined && state.wall === state.maxWall && !state.boss.broken) {
    const hit = smite(state, r.dmg);
    recordDmg(hit.dealt);
    if (hit.broke) handleBreak();
  }
  if (id === "wildSwing") {
    if (r.mult === 0) notifySkill("WHIFF", "--bone", 20);
    else notifySkill(`${r.label ? r.label + " " : ""}${fmt(r.dmg)}`,
      r.mult >= 100 ? "--super-crit" : "--crit-gold", r.mult >= 100 ? 34 : 24, r.mult >= 100);
  } else if (id === "energyBurst") {
    notifySkill(`${fmt(r.dmg)} BURST`, "--gold-bright", 26, true);
  } else if (id === "powerSmash") {
    notifySkill("winding up…", "--bone", 14);
  } else {
    notifySkill(skills.SKILL_BY_ID[id].name.toUpperCase(), "--crit-gold", 16);
  }
}

// Tick events → arena feedback. Judgment/finisher damage is EV-folded into
// CP, so the floater prints the beat's worth without double-dealing it.
function onSkillEvent(ev) {
  if (ev.type === "smash") notifySkill(`${fmt(ev.dmg)} SMASH`, "--super-crit", 30, true);
  else if (ev.type === "finisher") notifySkill(`COMBO ×${ev.mult}`, "--crit-gold", 20);
  else if (ev.type === "judgment") notifySkill(`⚖ ×${ev.mult}`, "--gold-bright", 18);
}

function buildSkillRows() {
  const vis = visibleSkills();
  skillsSig = vis.map(s => s.id + skills.rank(state, s.id)).join();
  $("skillRows").innerHTML = "";
  $("hotbar").innerHTML = "";
  for (const s of vis) {
    const r = skills.rank(state, s.id);
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML =
      `<span class="rowName">${s.name}<div class="sub" id="skDesc_${s.id}"></div></span>` +
      `<span class="rowGain" id="skStep_${s.id}"></span>` +
      `<span class="rowStat" id="skRank_${s.id}"></span>` +
      `<button id="skBuy_${s.id}"></button>`;
    $("skillRows").appendChild(row);
    skillBtns[s.id] = row.querySelector("button");
    skillBtns[s.id].addEventListener("click", () => {
      if (skills.buy(state, s.id)) buildSkillRows(); // a buy can reveal the next rung
    });
    if (s.kind === "active" && r > 0) {
      const b = document.createElement("button");
      b.id = `cast_${s.id}`;
      b.textContent = s.name;
      b.addEventListener("click", () => castSkill(s.id));
      $("hotbar").appendChild(b);
      castBtns[s.id] = b;
    } else delete castBtns[s.id];
  }
  for (const id of Object.keys(castBtns)) if (!skills.rank(state, id)) delete castBtns[id];
  $("hotbar").style.display = $("hotbar").children.length ? "" : "none";
}

function fmtClock(sec) {
  const m = Math.floor(sec / 60), ss = Math.ceil(sec % 60);
  return `${m}:${String(ss === 60 ? 0 : ss).padStart(2, "0")}`;
}

function renderSkills(d) {
  const k = state.skills;
  $("skillsMultEl").textContent = d.skills?.mult > 1 ? `skills ×${d.skills.mult.toFixed(2)}` : "";
  for (const s of visibleSkills()) {
    if (!skillBtns[s.id]) { buildSkillRows(); break; }
  }
  for (const s of skillsByCost) {
    const btn = skillBtns[s.id];
    if (!btn || !btn.isConnected) continue;
    const r = skills.rank(state, s.id);
    const c = skills.cost(state, s.id);
    $(`skDesc_${s.id}`).textContent = s.desc(Math.max(1, r));
    $(`skStep_${s.id}`).textContent = c === Infinity ? "" : `${s.step(Math.max(1, r))}/rank`;
    $(`skRank_${s.id}`).textContent = r ? `rank ${r}` : s.kind === "active" ? "active · 1 pip" : "";
    btn.textContent = c === Infinity ? "MAX" : r ? `${fmt(c)}c` : `learn ${fmt(c)}c`;
    buyState(btn, c !== Infinity && state.copper >= c);
  }
  // hotbar states mirror cast()'s own guards — a disabled button is the truth
  for (const [id, b] of Object.entries(castBtns)) {
    let ok = true, note = "";
    if (id === "energyBurst") { ok = k.energy >= 1; note = ` ${Math.floor(k.energy)}⚡`; }
    else if (id === "secondWind") { ok = k.swBank >= 1 && k.pips < skills.PIP_CAP; note = k.swBank ? " ready" : ` ${fmtClock(skills.fxValues.swClock(skills.rank(state, id)) - k.swT)}`; }
    else {
      ok = k.pips >= 1;
      if (id === "powerSmash" && k.windup > 0) { ok = false; note = ` ${k.windup.toFixed(1)}s`; }
      else if (id === "bladeDance" && k.bladeHits > 0) { ok = false; note = ` ${Math.ceil(k.bladeHits)} hits`; }
      else if (k[id] > 0) { ok = false; note = ` ${Math.ceil(k[id])}s`; }
    }
    b.textContent = skills.SKILL_BY_ID[id].name + note;
    buyState(b, ok);
  }
  const anyActive = Object.keys(castBtns).length > 0;
  $("pipRow").style.display = anyActive ? "" : "none";
  if (anyActive) {
    const pips = "◆".repeat(k.pips) + "◇".repeat(skills.PIP_CAP - k.pips);
    const next = k.pips >= skills.PIP_CAP ? "bank full" : `next ${fmtClock(skills.PIP_RECHARGE - k.pipT)}`;
    const combo = skills.rank(state, "comboAttack") ? ` · combo ${Math.floor(k.comboT)}/${skills.COMBO_HITS}` : "";
    const energy = skills.rank(state, "energyBurst") ? ` · Energy ${Math.floor(k.energy)}/${skills.ENERGY_CAP}` : "";
    $("pipRow").textContent = `pips ${pips} · ${next}${combo}${energy}`;
  }
}
buildSkillRows();
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
  // Every control inline. max/0 used to hide behind a ⋯ expander, which added
  // a whole extra row of buttons on toggle and broke the layout at 375px —
  // and it was a disclosure state protecting nothing. Six short controls fit.
  span.innerHTML = `<button data-d="-1">−</button><input type="number" min="0" step="1"><button data-d="1">+</button>` +
    `${withCap ? `<button data-c>cap</button>` : ""}` +
    `<button data-m>max</button><button data-z>0</button>`;
  span.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    e.stopPropagation();
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

// ---- farming: dense zone table, built once, cells updated in render ----
// DNA v4 lane 4: the IP power band, cold to hot in groups of three zones.
// The chip's ground is a --well mix, a whole luminance tier below the ink
// lanes, so a band never competes with a rarity or accent hue.
const bandOf = i => Math.min(5, Math.floor(i / 3) + 1);
// DNA v4 lane 1 on a gear slot: `filled` picks the raised plate, `r-<rarity>`
// supplies its ground and edge. Pass null to empty the slot back out.
function setSlotRarity(el, rarityId) {
  for (const c of [...el.classList]) if (c.startsWith("r-")) el.classList.remove(c);
  el.classList.toggle("filled", !!rarityId);
  if (rarityId) el.classList.add(`r-${rarityId}`);
}
// ---- zones: bot-only, same row component as training ----
const zoneRows = farm.zones.map((z, i) => {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML =
    `<span class="rowName">${z.name}<div class="sub">${z.mob} · ${fmt(z.mobHp)} HP</div></span>` +
    `<span class="rowGain">${fmt(z.copper)}c/kill<div class="sub"><span class="band b${bandOf(i)}">IP ${fmt(z.ipLo)}–${fmt(z.ipHi)}</span></div></span>` +
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
    // Was a modal that opened itself on the first Ban Wave. The explanation
    // lives on the Help tab now, and yanking the player out of the thing they
    // just did to read a manual is the ceremony this project vetoes. A pointer
    // in the log does the job — POINTERs are a live-surface convention here.
    if (state.rebirths === 1) log("Ban Wave explained on the Help tab.");
  }
  stashDirty = true;
  save(state);
});

// The help MODAL is retired. Its one topic — Ban Wave — is now Help's Training
// block, and its two reference-only paragraphs (the √ judgement, and bots
// borrowing 10% of your ATK and hits per second) were folded in there
// verbatim; that content was always reference, which is what the Help tab is
// for. The modal element survives only as the export-save container below.
function closeHelp() { $("helpModal").style.display = "none"; }
// The ? in the resource bar is the Help tab's second entry point.
$("helpBtn").addEventListener("click", () => showTab("helpSec"));
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
  // G5: the buy button goes in .rowAlloc, like every other row's control. As a
  // bare 4th grid child it landed in the 1fr track and stretched to ~470px for a
  // two-word label, so the PRICE outshouted what you were buying. The mocks have
  // specified `allocHtml: <button class="affordable">` for a Cache-tree row
  // since the design pass — buyState() already sets that class.
  row.innerHTML = `<span class="rowName">${u.label}</span><span class="rowGain">${u.gain}/rank</span>` +
    `<span class="rowAlloc"><button id="dub_${key}"></button></span>` +
    `<span class="rowStat" id="dur_${key}"></span>`;
  $("delveTree").appendChild(row);
  row.querySelector("button").addEventListener("click", () => { dungeon.buy(state, key); });
}

// (Dungeon/instance party board CUT 2026-07-27 — the POC never earned a
// playtest verdict better than "there for the sake of being there". The
// swarm's sink question reopens; see ROADMAP.)

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
    // DNA v4 lane 1: the r-<rarity> class carries both the plate ground (--rp)
    // and the ink (--ri). The border colour and name colour used to be set
    // inline here; inline wins over the class, so the plate would never show.
    row.className = "stashRow r-" + rar.id + (up ? " upgrade" : "") + (item.lock ? " locked" : "");
    row.innerHTML =
      `<span class="sMark">${up ? "▲" : item.lock ? "L" : ""}</span>` +
      `<span class="sName rar-${rar.id}">${item.name}</span>` +
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
  // G2: a locked zone drops nothing, so its three entries can never rank — they
  // were 30 identical "R0 · +0.00%" cells with a full progress bar each,
  // sitting at the same weight as entries actually being fed. Reuses
  // farm.zoneUnlocked, the same predicate the Grind tab gates on, so the two
  // surfaces cannot disagree about which zones exist.
  const clears = (state.cleared || []).length;
  let html = "";
  for (let z = 1; z <= farm.zones.length; z++) {
    // Playtest 2026-07-27: a locked zone is not rendered AT ALL. Collapsing it
    // to a one-line condition was still ten lines of "you can't have this",
    // and the user's verdict was that it clutters. The Grind tab already shows
    // the zone ladder and its unlock condition — the Armory does not need to
    // repeat it, it only needs to list what you can actually rank.
    if (!farm.zoneUnlocked(clears, z - 1)) continue;
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
  { // the skill book: pips recharge, combo/Energy accrue, burst timers run,
    // real burst damage (windup, Blade Dance riders) lands via smite()
    const sk = skills.tick(state, dt, derive(state), onSkillEvent);
    if (sk.dmg > 0 && state.wall === state.maxWall && !state.boss.broken) {
      const hit = smite(state, sk.dmg);
      recordDmg(hit.dealt);
      if (hit.broke) handleBreak();
    }
  }
  // Siege: the frontier Warden whittles at Combat Power; broken walls farm set
  // pieces on a timer (Farm status). No pulls, no cooldown — the fight is live.
  if (!state.boss.broken && state.wall === state.maxWall) {
    const dr = drain(state, dt);
    recordDmg(dr.dealt);
    if (dr.broke) handleBreak();
  } else if (state.boss.broken) {
    const f = farmTick(state, dt);
    for (const piece of f.pieces) {
      log(`🏆 ${piece.name} dropped! +${piece.pct}% ${laneWord(piece.lane)}`);
      if (setComplete(state, state.wall)) log(`★ ${boss.set.name} SET COMPLETE — ×${(1 + SET_BONUS).toFixed(2)} damage`);
    }
    if (f.rolls && !f.pieces.length) log(`farmed ${boss.name}`);
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
  // Help's gated blocks track the same unlocks the tab row does, so one dirty
  // flag drives both — a room opens in the manual the moment its tab does.
  if (tabsDirty) { renderTabs(); renderHelp(); }
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
  renderSkills(d);
  $("cpRate").textContent = cpRate > 0 ? `+${fmt(cpRate)}/s` : "—";
  $("cpElP").textContent = fmt(dps); // Player-tab breakdown: total + its factors (law 5)
  $("atkEl").textContent = fmt(d.atk);
  $("hpsEl").textContent = d.hitsPerSec.toFixed(2);
  $("copperEl").textContent = fmt(state.copper);
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
    $("resBots").textContent = `${bots.freeBots(state.bots).toFixed(1)} / ${bots.capacity(state.bots)}`;
    $("resRate").textContent = `+${bots.createRate(state.bots).toFixed(1)}`;
  }
  $("banWaveSection").style.display = state.features.rebirth ? "" : "none";
  if (state.features.rebirth) { // Ban Wave panel: payout preview + what survives
    const pend = pendingScripts(state);
    const btn = $("banWaveBtn");
    // Law 5: show the whole product, not the result. The payout is now two
    // terms and the player must be able to trace both — the depth term is the
    // entire reason to break a door before banking, so hiding it inside one
    // number would hide the decision it exists to create.
    const doors = Math.max(0, (state.maxWall || 1) - 1);
    const depthTxt = doors > 0
      ? ` × <b>${depthMult(state).toFixed(2)}</b> for ${doors} door${doors > 1 ? "s" : ""} cleared`
      : "";
    $("banWaveInfo").innerHTML = banArmed
      ? `<span class="warn">wipes bots · training · copper. Keeps gear, scrap, scripts, story. Bank <b>+${fmt(pend)}</b> scripts?</span>`
      : `<b>+${fmt(pend)}</b> scripts ready (from ${fmt(totalFills(state))} training fills${depthTxt})` +
        ` · <b>${fmt(state.rebirths || 0)}</b> done`;
    btn.disabled = pend <= 0 && !banArmed;
    btn.textContent = banArmed ? "confirm Ban Wave" : "Ban Wave";
    btn.classList.toggle("armed", banArmed);
  }

  // Siege readout: health remaining + time-to-breach estimate + CP/s
  {
    if (state.boss.broken) {
      $("depth").textContent = "BREACHED";
      $("cooldown").textContent = bossHasSet(state.wall)
        ? `set ${setCount(state, state.wall)}/${PARTS.length} · farming for pieces`
        : "farming for set pieces";
      $("record").textContent = "the door stands open";
    } else {
      const remain = boss.hp ? (state.boss.hp || 0) / boss.hp : 1;
      $("depth").textContent = `${(remain * 100).toFixed(1)}%`;
      $("cooldown").textContent = `time to breach: ${ttkText(timeToKill(state))}`;
      // measured avg (crits, skills AND casts folded in — it's what landed);
      // EV CP stands in until the 30s window has data (boot, tab return)
      const md = measuredDps();
      $("record").textContent = `health ${fmt(state.boss.hp)} / ${fmt(boss.hp)} · avg DPS ${fmt(md || dps)}`;
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

  if (!state.unlocked) return;

  // bot farm
  const b = state.bots;
  // Rig rows: current value, what the next rank adds, rank, price. The gain
  // used to be visible only as an aggregate in rigStats, so you could not
  // compare one rank of power against one rank of speed at their prices.
  for (const u of bots.RIG) {
    const cost = bots.rigCost(b, u.id);
    $(`rigAt_${u.id}`).textContent = u.at(b);
    $(`rigStep_${u.id}`).textContent = `${u.step(b)}/rank`;
    $(`rigRank_${u.id}`).textContent = `rank ${bots.rigRank(b, u.id)}`;
    rigBtns[u.id].textContent = `${fmt(cost)}c`;
    buyState(rigBtns[u.id], state.copper >= cost);
  }
  // script and clock now live on their own rig rows, so repeating them here
  // was the same fact printed twice on one surface. What is left is the only
  // thing this line ever owned: attrition, and the shortfall when committed
  // bots exceed the population bans have left you.
  const scale = bots.effScale(b);
  const scaled = scale < 0.995 ? ` · short ${((1 - scale) * 100).toFixed(0)}%` : "";
  $("rigStats").textContent = `lost to bans ${Math.floor(b.banned)}${scaled}`;
  $("popFill").style.width = `${Math.min(100, (b.pop / bots.capacity(b)) * 100)}%`;
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
  $("autoEquipLine").style.display = ""; // v13: auto-equip is always available (its GM gate is retired)
  $("autoEquip").checked = state.gear.autoEquip !== false;
  $("autoFilter").checked = state.gear.autoFilter !== false;
  if (document.activeElement !== $("keepRarity")) $("keepRarity").value = state.gear.keepRarity;
  if (document.activeElement !== $("keepIp")) $("keepIp").value = state.gear.keepIp;
  const owned = RARITIES.filter(r => (state.scrap[r.id] || 0) > 0);
  $("scrapWallet").innerHTML = owned.length
    ? owned.map(r => `<span class="scrapPill r-${r.id}">${fmt(state.scrap[r.id])} ${r.name.toLowerCase()}</span>`).join("")
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
    // Three states, not two. A zone you cannot reach and a zone you are
    // actively failing to hold used to share `locked` and its 0.45 dim, so a
    // live squad losing money looked exactly like content you have not
    // unlocked. `struggling` is live-and-failing: full opacity, --warn edge.
    zoneRows[i].classList.toggle("locked", !unlocked);
    zoneRows[i].classList.toggle("struggling", unlocked && n > 0 && !zr.held);
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
      // The copper multiplier rides as its own visible term. The rate is the
      // final banked number now, and guideline 5 wants the whole product shown,
      // not a total with a factor folded invisibly into it.
      const multTerm = zr.copperMult > 1.005 ? ` (×${zr.copperMult.toFixed(2)})` : "";
      stat.innerHTML = `${zr.kps.toFixed(2)} kills/s${zr.kps >= farm.KILL_CAP ? " · CAP" : ""} · ${fmt(zr.copperPerSec)}c/s${multTerm}${satTerm}`;
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
          `<span class="itemName rar-${rar.id}">${item.name}</span>` +
          `<span class="rarityTag rar-${rar.id}">${rar.name}</span>` +
          `<span class="itemMeta">IP ${fmt(item.ip)}${item.plus ? ` +${item.plus}` : ""} · ${fmt(contribution(item))} ATK</span>` +
        `</div>` +
        (lines ? `<div class="affixList">${lines}</div>` : `<div class="affixList muted">no affixes</div>`);
      // lane 1 again: the plate is class-driven, so the inline border colour
      // that used to live here has to go or it out-specifies --ri.
      setSlotRarity(slotEls[slot], rar.id);
    } else {
      si.textContent = "—";
      setSlotRarity(slotEls[slot], null);
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
    /* G2: a set you own nothing from COLLAPSES. All ten walls drew all seven
       pieces regardless of progress, so a fresh account rendered 70 pips — 63
       of them for Wardens it had never met — and the cabinet read as a wall of
       identical unearned rows rather than as a collection.

       This is the mocks' own design, not a new one: build.mjs has specified
       `details.trophySet.dormant` since the design pass, and the shipped build
       had drifted from its own contract. A native <details> costs one line
       closed, still lets the player open it to see what the set contains, and
       needs no JS — the disclosure is the platform's.

       Keyed on pieces OWNED rather than on wall reached, which also covers the
       door you have broken but not yet farmed. */
    const walls = bosses.filter(b => b.set).map(b => b.wall);
    let done = 0;
    const html = walls.map(w => {
      const bw = getBoss(w), have = setCount(state, w), complete = setComplete(state, w);
      if (complete) done++;
      const pips = PARTS.map((_, i) => {
        const p = pieceOf(w, i), own = ownsPiece(state, w, i);
        return `<span class="pip ${own ? "own" : "miss"}">${own ? "✓" : "◈"} ${p.part} <b>+${p.pct}% ${laneWord(p.lane)}</b></span>`;
      }).join("");
      if (have === 0) {
        return `<details class="trophySet dormant">` +
          `<summary><span class="trophySetName">${bw.set.name}</span>` +
          `<span class="trophySetProg">0/${PARTS.length}</span></summary>` +
          `<div class="pips">${pips}</div></details>`;
      }
      return `<div class="trophySet ${complete ? "complete" : "started"}">` +
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
setWardenHue(state.wall);
initBattle($("battle"));
say(state.boss.broken ? "break" : "greet");
startGameLoop(tick, render);
