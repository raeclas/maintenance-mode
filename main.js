// main.js — wiring: load → offline batch → loop → autosave; all UI sections.
import { newState } from "./state.js";
import { load, save, wipe, exportSave } from "./saveSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { bosses, getBoss } from "./bosses.js";
import { smite, farmTick, timeToKill } from "./pull.js";
import { initBattle, renderBattle, notifyBreak, notifyEnhance, notifySkill, notifyHit, refreshTheme } from "./battle.js";
import * as skills from "./skills.js";
import { derive } from "./stats.js";
import { critFactor } from "./crits.js";
import * as bots from "./bots.js";
import * as farm from "./farm.js";
import { resolveDrop, laneValue, contribution, SIG, newSignature, SLOTS, NAMES } from "./gear.js";
import * as armory from "./armory.js";
import { RARITIES, RARITY_BY_ID } from "./rarity.js";
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

let armoryDirty = true;
let lastWallSel = ""; // wall-selector rebuild cache
let lastRenderNow = Date.now();  // for per-frame dt (kill-cycle bar integrator)
let cpSample = null, cpSampleT = 0, cpRate = 0;  // Combat Power rate sampler (~1s window)
// Measured damage window → the Boss tab's "avg DPM" readout. CP is the smooth
// EV rate; this is what actually LANDED (drain + skill bursts) over the last
// 60s, so casts visibly move the number. Per-minute over a minute-long window,
// and the DISPLAYED value refreshes on a 2s hold — a live per-frame readout
// fluttered enough to be distracting (playtest 2026-07-27).
const DPS_WINDOW_MS = 60_000;
const DPM_HOLD_MS = 2_000;
let dmgLog = []; // [tMs, dealt]
let dpmShown = 0, dpmShownT = 0;
function recordDmg(dealt) { if (dealt > 0) dmgLog.push([Date.now(), dealt]); }
function measuredDps() {
  const now = Date.now();
  while (dmgLog.length && now - dmgLog[0][0] > DPS_WINDOW_MS) dmgLog.shift();
  if (!dmgLog.length) return 0;
  const spanS = Math.max(1, (now - dmgLog[0][0]) / 1000);
  return dmgLog.reduce((s, e) => s + e[1], 0) / spanS;
}
function shownDpm(fallbackDps) {
  const now = Date.now();
  if (now - dpmShownT >= DPM_HOLD_MS) {
    dpmShownT = now;
    dpmShown = (measuredDps() || fallbackDps) * 60;
  }
  return dpmShown;
}
const zonePhase = [];            // per-zone accumulated kill phase (0..1 shown)

// A drop is an EVENT (v15): Armory points + Scrap fuel, Epic+ banks a Relic.
// Flood rule: ordinary drops never log — the only log events are Armory
// rank-ups (the spike) and Relics (rare enough to stay events).
function onDrop(drop) {
  state.everDropped = true; // gates the Player tab
  const r = resolveDrop(state, drop);
  armoryDirty = true;
  if (r.relic) {
    const rar = RARITY_BY_ID[drop.rarity]?.name || drop.rarity;
    log(`RELIC — ${rar} ${drop.name} crystallizes into a Relic (${fmt(state.relics)} banked)`, {
      before: "RELIC — ", text: `${rar} ${drop.name}`,
      rarity: drop.rarity, after: ` crystallizes into a Relic (${fmt(state.relics)} banked)`,
    });
  }
  if (r.merge?.rankedUp) { // the Armory rank-up spike
    const m = r.merge;
    log(`ARMORY — ${m.name} rank ${m.from}→${m.to}, +${m.pct.toFixed(2)}% ${laneWord(m.lane)}`);
  }
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
    { // skills + the whittle: the roller IS the character's damage now.
      // A 12h batch blows past ROLL_CAP, so almost all of it resolves at
      // EV inside skills.tick — the offline clamp, same function as live.
      // Silent emitter: no floaters for an absent player.
      const sk = skills.tick(state, dt, derive(state));
      if (sk.dmg > 0 && state.wall === state.maxWall && !state.boss.broken) {
        const hit = smite(state, sk.dmg);
        if (hit.broke) {
          log(`★ W${state.wall} BREACHED while you were away`);
          handleBreak();
        } else if (hit.dealt > 0) {
          log(`offline: ${fmt(hit.dealt)} health off ${getBoss(state.wall).name}`);
        }
      }
    }
    { // the Delve mines Cache idle — same rate as live, clamped by dt
      const gained = dungeon.cachePerSec(state, charDps()) * dt;
      state.dungeon.cache += gained;
      state.dungeon.depthBest = Math.max(state.dungeon.depthBest, dungeon.reachDepth(state, charDps()));
      if (gained > 0) log(`offline delve: +${fmt(gained)} Cache`);
    }
    { // broken walls farm offline (the whittle landed above, via the roller)
      if (state.boss.broken) {
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
  gearSec: "Unlocks with your first quest reward.",
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
      Passive skills really fire as you attack: every proc you see in the arena is
      damage that actually landed. The list shows what you know plus the next two
      you could learn.`],
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
      second; every kill pays copper and has a 1-in-400 chance at a drop. Drops feed
      your Armory entry for that zone and break down into scrap on the spot — you
      never have to sort them. Epic or better drops crystallize into Relics.`],
  ]],
  ["P", "Player", "gearSec", [
    ["Combat Power", `Your damage per second against the door: ATK multiplied by hits
      per second. "Haste" anywhere on the Player tab is a percentage added to hits per
      second. The Boss tab's "avg DPM" is the damage that actually landed over the
      last minute — crits, skills and casts included — so a burst you press shows up
      in it.`],
    ["Your gear", `Three items, and they're yours for life — quest rewards the dead
      server has been holding. They are never replaced and never destroyed; they only
      grow. The weapon adds ATK, the armor adds hits per second, the charm adds
      copper income. Two more rewards wait behind milestones you haven't hit yet.`],
    ["Enhance", `Enhancing raises an item's plus, and every plus multiplies its power
      by 1.12. A failed attempt anywhere banks a failstack worth +1 percentage point
      on your next attempt, up to +15; a success spends the whole bank.`],
    ["Materials", `Every bot drop breaks down into scrap of its rarity, automatically.
      Scrap has no use yet — a workbench for it is coming. Epic or better drops also
      crystallize into Relics, which will feed that same bench.`],
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
  // Signature arrivals (v15): the dead server's quest system still runs, and
  // you are the only player left to claim the rewards. Each grant is a story
  // beat; the item is permanent from that moment (attachment law).
  const sigCond = {
    weapon: s.copper >= 10 || s.rebirths > 0, // first earnings ("A First Errand")
    armor: Object.values(s.armory || {}).some(pts => armory.rankOf(pts) >= 1),
    charm: dps >= 100,
  };
  for (const slot of SLOTS) {
    if (!s.gear[slot] && sigCond[slot]) {
      s.gear[slot] = newSignature(slot);
      log(`★ ${SIG[slot].story}`);
      log(`obtained: ${s.gear[slot].name} — it's yours for good. Enhance it on the Player tab.`);
    }
  }
  const cond = {
    training: s.unlocked,
    grind: f.training, // the bot-farm layer (train + deploy) opens together
    player: f.grind && (!!s.gear.weapon || s.everDropped),
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

// Tick events → arena feedback. Every number here is REAL damage that just
// landed (the roller). Plain hits are rate-limited to keep the stream at the
// old visual density — the damage counts either way, only the floater is
// skipped.
let lastHitFloatAt = 0;
function onSkillEvent(ev) {
  if (ev.type === "hit") {
    const now = performance.now();
    if (now - lastHitFloatAt > 90) { lastHitFloatAt = now; notifyHit(ev.dmg, ev.tier); }
  }
  else if (ev.type === "meteor") notifySkill(`☄ ${fmt(ev.dmg)}`, "--super-crit", 30, true);
  else if (ev.type === "smash") notifySkill(`${fmt(ev.dmg)} SMASH`, "--super-crit", 30, true);
  else if (ev.type === "combo") notifySkill(`COMBO ${fmt(ev.dmg)}`, "--crit-gold", 20);
  else if (ev.type === "judgment") notifySkill(`⚖ ${fmt(ev.dmg)}`, "--gold-bright", 18);
  else if (ev.type === "finishing") notifySkill(`${fmt(ev.dmg)}!`, "--crit-gold", 18);
  else if (ev.type === "chaos") notifySkill(`CHAOS ${fmt(ev.dmg)}`, "--gold-bright", 16);
  else if (ev.type === "frenzy") notifySkill("FRENZY", "--crit-gold", 14);
  else if (ev.type === "trance") notifySkill("TRANCE", "--gold-bright", 14);
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
  // (the "skills ×N" EV aggregate is gone — procs roll for real now, and the
  // user was rightly not a fan of an expected-value readout posing as power)
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
    `<span class="rowGain">${fmt(z.copper)}c/kill</span>` +
    `<span class="rowAlloc"></span>` +
    `<span class="rowStat" id="zs${i}"></span>` +
    `<div class="rowBar"><div class="rowFill" id="zf${i}"></div></div>`;
  row.querySelector(".rowAlloc").appendChild(allocMini(`zones.${i}`));
  $("zones").appendChild(row);
  return row;
});

// ---- gear: signature cards, built once (v15) ----
// One permanent named item per slot. The card shows its lane value and the
// enhance bench; before its milestone it shows what will earn it (Help-free
// teaching: the hint IS the empty state).
const SLOT_HINT = {
  weapon: "Reward waiting — earn your first copper.",
  armor: "Reward waiting — rank up any Armory entry.",
  charm: "Reward waiting — reach 100 Combat Power.",
};
const slotEls = {};
for (const slot of SLOTS) {
  const div = document.createElement("div");
  div.className = "slot";
  div.innerHTML = `<div class="slotName">${slot}</div>
    <div class="slotItem" id="si_${slot}">—</div>
    <div class="slotControls">
      <span class="ctlGroup"><button id="se_${slot}">enhance</button><span class="enhInfo" id="sei_${slot}"></span></span>
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

// (Stash, loot filter, bulk salvage and the reforge bench are GONE in v15 —
// drops are events, signatures are permanent. The scrap wallet stays: it is
// the slice-2 reforge-bench fuel, accruing from every drop.)

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
  { // the fight: skills.tick is THE damage path now — every swing, crit and
    // proc rolled for real (plus pips/Energy/combo/timers). smite() lands it.
    const sk = skills.tick(state, dt, derive(state), onSkillEvent);
    if (sk.dmg > 0 && state.wall === state.maxWall && !state.boss.broken) {
      const hit = smite(state, sk.dmg);
      recordDmg(hit.dealt);
      if (hit.broke) handleBreak();
    }
  }
  // Broken walls farm set pieces on a timer (Farm status).
  if (state.boss.broken) {
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
      // EV CP stands in until the 60s window has data (boot, tab return)
      $("record").textContent = `health ${fmt(state.boss.hp)} / ${fmt(boss.hp)} · avg DPM ${fmt(shownDpm(dps))}`;
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
  const owned = RARITIES.filter(r => (state.scrap[r.id] || 0) > 0);
  $("scrapWallet").innerHTML = (owned.length
    ? owned.map(r => `<span class="scrapPill r-${r.id}">${fmt(state.scrap[r.id])} ${r.name.toLowerCase()}</span>`).join("")
    : `<span class="muted">no scrap yet — your bots' drops break down into it</span>`)
    + (state.relics > 0 ? ` <span class="scrapPill r-epic">${fmt(state.relics)} Relic${state.relics === 1 ? "" : "s"}</span>` : "");

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
      const laneTxt = SIG[slot].lane === "atk" ? `+${fmt(laneValue(item))} ATK`
        : SIG[slot].lane === "hits" ? `+${laneValue(item).toFixed(2)} hits/s`
        : `+${laneValue(item).toFixed(1)}% copper`;
      si.innerHTML =
        `<div class="itemHeader">` +
          `<span class="itemName rar-rare">${item.name}</span>` +
          `<span class="itemMeta">+${item.plus} · ${laneTxt}</span>` +
        `</div>`;
      setSlotRarity(slotEls[slot], "rare");
    } else {
      si.innerHTML = `<span class="muted">${SLOT_HINT[slot]}</span>`;
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
