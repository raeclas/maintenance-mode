// main.js — wiring: load → offline batch → loop → autosave; all UI sections.
import { newState } from "./state.js";
import { load, save, wipe, exportSave } from "./saveSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { bosses, getBoss } from "./bosses.js";
import { startPull, resolvePull, resolveFarm, pullDone, currentDepth, canPull, band, pullsToBreakEV, scarCap, cooldownMs, processIdleAttempts } from "./pull.js";
import { FLAGS, UNLOCKS, UTILITY, flagCost, utilityCost, buyFlag, buyUnlock, buyUtility, gmDmgMult, gmHasteMult, ticketYield, BREAK_TICKETS } from "./gm.js";
import { initBattle, renderBattle, notifyResult, notifyEnhance } from "./battle.js";
import { derive } from "./stats.js";
import * as bots from "./bots.js";
import * as farm from "./farm.js";
import { routeDrop, equipFromStash, contribution, salvage, scrapYield, salvageMatching, canReforge, reforgeCost, reforge, SLOTS, STASH_CAP } from "./gear.js";
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
function farmRecord() { return { pulls: 0, bestDepth: 1, scars: 1, broken: true, nearSaid: true }; }

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
  state.cooldownUntil = 0;
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
  state.frontierBoss = { pulls: 0, bestDepth: 0, scars: 0, broken: false, nearSaid: false };
  state.boss = state.frontierBoss;
  state.cooldownUntil = 0;
  refreshBoss();
  log(`— descending to ${next.name}, ${next.title}`);
  save(state);
}

const laneWord = lane => lane === "atk" ? "ATK" : lane === "speed" ? "haste" : "copper";

function log(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  $("log").prepend(div);
  while ($("log").children.length > 40) $("log").lastChild.remove();
}

let stashDirty = true;
let lastWallSel = ""; // wall-selector rebuild cache

function onDrop(item) {
  const rar = RARITY_BY_ID[item.rarity]?.name || item.rarity;
  const r = routeDrop(state, item); // filter: keep→stash, else→scrap (never auto-equip)
  stashDirty = true;
  const fate = r.kept ? "stashed" : `salvaged +${r.scrap.n} ${item.rarity} scrap`;
  log(`drop: ${rar} ${item.name} ${fmt(item.ip)}IP · ${fate}`);
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
    if (state.dungeon.auto) { // away-safe delving — copper only (gear is a live reward)
      const dps = derive(state).atk * derive(state).hitsPerSec;
      const sd = dungeon.safeDepth(dps);
      if (sd > 0) {
        const d0 = state.copper;
        let steps = Math.min(Math.floor(dt / dungeon.CLEAR_S), 200000); // clamp like live
        while (steps-- > 0) {
          if (dungeon.clearChance(state.dungeon.floor + 1, dps) >= 1) dungeon.descend(state, dps, () => 0.999);
          else dungeon.extract(state); // banks copper; gear discarded offline
        }
        if (state.dungeon.active) dungeon.extract(state);
        if (state.copper - d0 > 0) log(`offline delve (safe depth ${sd}): +${fmt(state.copper - d0)}c`);
      }
    }
    if (state.gm.idleProc && !state.boss.broken) {
      const r = processIdleAttempts(state, dt);
      if (r.attempts) log(`idle processing: ${r.attempts} attempts · best ${fmtDepth(r.best)} · +${fmt(r.tickets)} tickets`);
      if (r.broke) {
        log(`★ W${state.wall} BROKEN while you were away`);
        const piece = grantBreakPiece(state, state.wall);
        if (piece) log(`🏆 ${piece.name} recovered`);
      }
    }
    save(state);
  }
}

// ---- tabs ----
function showTab(id) {
  for (const pane of document.querySelectorAll(".tabpane")) {
    pane.style.display = pane.id === id ? "" : "none";
  }
  for (const btn of document.querySelectorAll("#tabs button")) {
    btn.classList.toggle("active", btn.dataset.tab === id);
  }
}
for (const btn of document.querySelectorAll("#tabs button")) {
  btn.addEventListener("click", () => showTab(btn.dataset.tab));
}

// ---- unlock reveal ----
function reveal() {
  for (const el of document.querySelectorAll(".game")) el.classList.remove("hidden");
}
if (state.unlocked) reveal();

// ---- pull ----
$("pullBtn").addEventListener("click", () => {
  if (!startPull(state, Date.now())) return;
  log(`attempt ${state.boss.pulls + 1} — enrage ${boss.windowS}s`);
});

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
  span.innerHTML = `<button data-d="-1">−</button><input type="number" min="0" step="1"><button data-d="1">+</button>${withCap ? `<button data-c>cap</button>` : ""}<button data-m>max</button><button data-z>0</button>`;
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

// ---- Dungeon delve: the character's active push-your-luck verb ----
let dungeonCdUntil = 0;
const charDps = () => { const dd = derive(state); return dd.atk * dd.hitsPerSec; };
function bankDelveGear(gear) { for (const it of gear) onDrop(it); } // route through the loot filter
$("descendBtn2").addEventListener("click", () => {
  if (Date.now() < dungeonCdUntil) return;
  const r = dungeon.descend(state, charDps());
  dungeonCdUntil = Date.now() + dungeon.CLEAR_S * 1000;
  if (r.cleared) log(`delve: floor ${r.floor} cleared · +${fmt(r.copper)}c${r.gear ? ` · ${r.gear.name}` : ""}`);
  else log(`delve: WIPED on floor ${r.wipedAt} — lost ${fmt(r.lost.copper)}c haul`);
  stashDirty = true;
  save(state);
});
$("extractBtn").addEventListener("click", () => {
  if (!state.dungeon.active) return;
  const out = dungeon.extract(state);
  bankDelveGear(out.gear);
  log(`delve: extracted floor ${out.floor} · banked +${fmt(out.copper)}c${out.gear.length ? ` + ${out.gear.length} gear` : ""}`);
  stashDirty = true;
  save(state);
});
$("autoDelve").addEventListener("change", () => { state.dungeon.auto = $("autoDelve").checked; });

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
$("keepRarity").addEventListener("change", () => { state.gear.keepRarity = $("keepRarity").value; });
$("keepIp").addEventListener("change", () => { state.gear.keepIp = Math.max(0, Math.floor(+$("keepIp").value) || 0); });
// manual bulk sweep — salvage all unlocked stash items ≤ chosen rarity
$("salvageMatch").addEventListener("click", () => {
  const { count, tally } = salvageMatching(state, $("salvageRarity").value);
  if (!count) return;
  stashDirty = true;
  const parts = Object.entries(tally).map(([r, n]) => `${n} ${r}`).join(", ");
  log(`salvaged ${count} items → ${parts} scrap`);
});

function renderStash() {
  stashDirty = false;
  const sorted = [...state.gear.stash].sort((a, b) => contribution(b) - contribution(a)).slice(0, 15);
  $("stashToggle").textContent = `stash (${state.gear.stash.length}/${STASH_CAP})`;
  const el = $("stashList");
  el.innerHTML = "";
  sorted.forEach(item => {
    const idx = state.gear.stash.indexOf(item);
    const rar = RARITY_BY_ID[item.rarity] || RARITIES[0];
    const affixes = (item.affixes || []).map(a => affixLabel(a)).join(" · ") || "—";
    const row = document.createElement("div");
    row.className = "stashRow";
    row.style.borderLeftColor = rar.color;
    row.innerHTML =
      `<span><span class="itemName" style="color:${rar.color}">${item.lock ? "🔒 " : ""}${item.name}</span>` +
        ` · ${item.slot} · IP ${fmt(item.ip)}${item.plus ? " +" + item.plus : ""}` +
        `<span class="affixLine">${affixes}</span></span>` +
      `<span><button class="eq">equip</button><button class="lk">${item.lock ? "unlock" : "lock"}</button>` +
        `<button class="sv" ${item.lock ? "disabled" : ""}>salvage +${scrapYield(item)}</button></span>`;
    row.querySelector(".eq").addEventListener("click", () => { equipFromStash(state, idx); delete pendingReforge[item.slot]; stashDirty = true; });
    row.querySelector(".lk").addEventListener("click", () => { item.lock = !item.lock; stashDirty = true; });
    row.querySelector(".sv").addEventListener("click", () => {
      state.gear.stash.splice(idx, 1);
      const s = salvage(state, item);
      log(`salvaged ${item.name} → +${s.n} ${s.rarity} scrap`);
      stashDirty = true;
    });
    el.appendChild(row);
  });
  if (state.gear.stash.length > 15) {
    const more = document.createElement("div");
    more.textContent = `…and ${state.gear.stash.length - 15} more`;
    el.appendChild(more);
  }
}

// ---- loop ----
let lastSave = 0;
let lastTick = Date.now();
function tick() {
  const now = Date.now();
  const dt = Math.min((now - lastTick) / 1000, farm.offlineCapS(state)) * devScale; // same clamp as offline
  lastTick = now;
  if (state.unlocked) {
    bots.tick(state, dt, (kind, item) => kind === "drop" ? onDrop(item) : enhMilestones(item, kind));
  }
  // encounter scheduler: auto-fire attempts on cooldown while online
  if (state.gm.scheduler && state.gm.schedulerOn && !state.boss.broken && !state.pull && canPull(state, now)) {
    startPull(state, now);
  }
  if (state.pull && pullDone(state, now)) {
    if (state.pull.farm) {
      // Farm status: re-fought a broken boss for its set. Kill = tickets +
      // a chance at a not-yet-owned piece; completing the set lights the bonus.
      const y = resolveFarm(state, now);
      const piece = rollFarmDrop(state, state.wall);
      if (piece) {
        log(`🏆 ${piece.name} dropped! +${piece.pct}% ${laneWord(piece.lane)} · +${fmt(y)} tickets`);
        if (setComplete(state, state.wall)) log(`★ ${boss.set.name} SET COMPLETE — ×${(1 + SET_BONUS).toFixed(2)} damage`);
      } else {
        log(`farmed ${boss.name}: no drop · +${fmt(y)} tickets`);
      }
      save(state);
    } else {
      const depth = resolvePull(state, now);
      notifyResult(depth, state.boss.broken);
      const yieldT = ticketYield(depth) + (state.boss.broken ? BREAK_TICKETS : 0);
      state.tickets += yieldT;
      if (state.boss.broken) {
        say("break");
        log(`★ W${state.wall} BROKEN — ${boss.name} · attempt ${state.boss.pulls} · +${fmt(yieldT)} tickets`);
        const piece = grantBreakPiece(state, state.wall); // guaranteed first set piece
        if (piece) log(`🏆 ${piece.name} recovered · +${piece.pct}% ${laneWord(piece.lane)} — re-Attempt to farm the rest`);
      } else {
        // milestone-only dialogue: intro fail, first near-miss. Silence otherwise.
        if (state.boss.pulls === 1) say("fail_hopeless");
        else if (depth >= 0.95 && !state.boss.nearSaid) { state.boss.nearSaid = true; say("fail_near"); }
        log(`attempt ${state.boss.pulls}: ${fmtDepth(depth)} · scars ${fmtDepth(state.boss.scars)} · +${yieldT} tickets`);
        if (!state.unlocked) {
          state.unlocked = true;
          reveal();
          log("— new panels: TRAINING · GRIND · PLAYER");
        }
      }
      save(state);
    }
  }
  { // auto-delve: safe-depth farming on the descend cadence (live)
    const dg = state.dungeon;
    if (dg.auto && now >= dungeonCdUntil) {
      const dps = charDps();
      if (dungeon.clearChance(dg.floor + 1, dps) >= 1 && dungeon.safeDepth(dps) > 0) {
        dungeon.descend(state, dps);
        dungeonCdUntil = now + dungeon.CLEAR_S * 1000;
      } else if (dg.active) {
        bankDelveGear(dungeon.extract(state).gear); // hit the safe ceiling → bank, loop next tick
        stashDirty = true;
      }
    }
  }
  if (now - lastSave > 5000) { lastSave = now; save(state); }
}

function render() {
  const now = Date.now();
  renderBattle(state, now);
  const d = derive(state);
  const dps = d.atk * d.hitsPerSec;

  $("dpsEl").textContent = fmt(dps);
  $("atkEl").textContent = fmt(d.atk);
  $("hpsEl").textContent = d.hitsPerSec.toFixed(2);
  $("gmEl").textContent = (gmDmgMult(state) * gmHasteMult(state)).toFixed(2);
  { // odometer weld: projection visible next to the stats that move it
    const w = band(d, boss, state.boss.scars);
    $("projMini").textContent = state.boss.broken ? "100%" : `${fmtDepth(w.lo)}–${fmtDepth(w.hi)}`;
  }
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
  { // Ban Wave panel: payout preview + what survives (attachment reassurance)
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

  // pull row
  const pb = $("pullBtn");
  pb.textContent = "Attempt"; // farm states relabel to "Farm" below
  $("ticketGain").textContent = "";
  if (state.pull && state.pull.farm) {
    $("depth").textContent = "OPEN";
    pb.disabled = true;
    pb.textContent = "Farm";
    $("cooldown").textContent = `farming ${boss.name}… ${Math.max(0, (state.pull.endsAt - now) / 1000).toFixed(0)}s`;
  } else if (state.pull) {
    const dCur = Math.min(1, currentDepth(state, now));
    $("depth").textContent = fmtDepth(dCur);
    pb.disabled = true;
    $("cooldown").textContent = `enrage in ${Math.max(0, (state.pull.endsAt - now) / 1000).toFixed(0)}s`;
    // live incident payout: base = tickets at current depth, (+bonus) = the
    // rest filling as depth climbs to this attempt's pre-rolled final depth
    const dEnd = Math.min(1, state.boss.scars + state.pull.rolledFresh);
    const base = ticketYield(dCur);
    const total = ticketYield(dEnd) + (dEnd >= 1 ? BREAK_TICKETS : 0);
    const bonus = Math.max(0, total - base);
    $("ticketGain").textContent = `tickets ${fmt(base)}${bonus > 0 ? ` (+${fmt(bonus)})` : ""}`;
  } else if (state.boss.broken && !canPull(state, now)) {
    // farming, on cooldown between attempts
    $("depth").textContent = "OPEN";
    pb.disabled = true;
    pb.textContent = "Farm";
    $("cooldown").textContent = `farm again in ${Math.ceil((state.cooldownUntil - now) / 1000)}s`;
  } else if (state.boss.broken) {
    // Farm status: the door stands open — re-Attempt for set pieces
    $("depth").textContent = "OPEN";
    pb.disabled = false;
    pb.textContent = "Farm";
    $("cooldown").textContent = bossHasSet(state.wall)
      ? `set ${setCount(state, state.wall)}/${PARTS.length} · farm for pieces`
      : "farm for tickets";
  } else if (!canPull(state, now)) {
    $("depth").textContent = fmtDepth(state.boss.bestDepth);
    pb.disabled = true;
    $("cooldown").textContent = `retry in ${Math.ceil((state.cooldownUntil - now) / 1000)}s`;
  } else {
    $("depth").textContent = state.boss.pulls ? fmtDepth(state.boss.bestDepth) : "—";
    pb.disabled = false;
    $("cooldown").textContent = state.boss.pulls ? "ready" : "";
  }

  $("record").textContent = state.boss.pulls
    ? `attempts ${state.boss.pulls} · best ${fmtDepth(state.boss.bestDepth)} · scars ${fmtDepth(state.boss.scars)}`
    : "no attempts recorded";
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

  if (state.boss.broken || state.pull) {
    $("projection").textContent = "";
  } else {
    const cap = scarCap(state);
    const { lo, hi } = band(d, boss, state.boss.scars);
    const n = pullsToBreakEV(d, boss, state.boss.scars, cap);
    if (n === Infinity) {
      const reqDps = ((1 - Math.max(state.boss.scars, cap)) * boss.hp) / boss.windowS;
      $("projection").textContent = `projection: ${fmtDepth(lo)}–${fmtDepth(hi)} · required power: ~×${fmt(reqDps / dps)} current`;
    } else {
      $("projection").textContent = `projection: ${fmtDepth(lo)}–${fmtDepth(hi)} · breaks in ~${n} attempt${n > 1 ? "s" : ""}`;
    }
  }

  // GM tab
  for (const type of Object.keys(FLAGS)) {
    $(`gmfr_${type}`).textContent = `rank ${state.gm[type]}`;
    const btn = $(`gmfb_${type}`);
    btn.textContent = `${fmt(flagCost(type, state.gm[type]))} tickets`;
    btn.disabled = state.tickets < flagCost(type, state.gm[type]);
  }
  for (const type of Object.keys(UNLOCKS)) {
    const btn = $(`gmub_${type}`);
    const owned = !!state.gm[type];
    btn.textContent = owned ? "INSTALLED" : `${fmt(UNLOCKS[type].cost)} tickets`;
    btn.disabled = owned || state.tickets < UNLOCKS[type].cost;
  }
  for (const type of Object.keys(UTILITY)) {
    const rank = state.gm[type];
    const maxed = rank >= UTILITY[type].max;
    $(`gmur_${type}`).textContent = `${rank}/${UTILITY[type].max}`;
    const btn = $(`gmub2_${type}`);
    btn.textContent = maxed ? "MAX" : `${fmt(utilityCost(type, rank))} tickets`;
    btn.disabled = maxed || state.tickets < utilityCost(type, rank);
  }
  for (const type of Object.keys(bots.PRIV)) {
    const cost = bots.privCost(state.bots, type);
    $(`gmpr_${type}`).textContent = `rank ${bots.privRank(state.bots, type)}`;
    const btn = $(`gmpb_${type}`);
    btn.textContent = `${fmt(cost)} tickets`;
    btn.disabled = state.tickets < cost;
  }

  // encounter scheduler line (Boss screen)
  $("schedLine").style.display = state.gm.scheduler ? "" : "none";
  if (state.gm.scheduler) {
    $("schedToggle").checked = state.gm.schedulerOn;
    $("schedInfo").textContent = state.gm.schedulerOn && !state.boss.broken
      ? (state.pull ? "running" : `next in ${Math.max(0, Math.ceil((state.cooldownUntil - now) / 1000))}s`)
      : "";
  }

  if (!state.unlocked) return;

  // bot farm
  const b = state.bots;
  // rig labels speak the BOTTER register; "session" stays the GM panel's word
  $("buyCap").textContent = buyLabel(`multiclient +${4}`, bots.capCost(b));
  $("buyCreate").textContent = buyLabel("account creator +", bots.createCost(b));
  $("buyPower").textContent = buyLabel("script version +", bots.powerCost(b));
  $("buySpeed").textContent = buyLabel("overclock +", bots.speedCost(b));
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
      laneRate += rate * t.gain;
      row.classList.toggle("locked", locked);
      row.classList.toggle("active", !locked && squad > 0);
      const stat = $(`ts_${bar}${i}`);
      if (locked) {
        stat.textContent = `locked · ${fmt(B.fills[i - 1] || 0)}/${fmt(bots.UNLOCK_FILLS)} fills of ${tiers[i - 1].name}`;
      } else if (squad > 0) {
        const maxed = squad * quality >= t.cost * bots.MAX_FILLS_PER_S;
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

  // zones — bot squads only; stat shows the squad's ACTUAL kill rate
  farm.zones.forEach((z, i) => {
    const n = (state.bots.alloc.zones[i] || 0) * scale;
    const zr = bots.botZoneRates(state.bots, i, n, d);
    zoneRows[i].classList.toggle("active", n > 0 && zr.held);
    zoneRows[i].classList.toggle("locked", n > 0 && !zr.held);
    const stat = $(`zs${i}`);
    if (n <= 0) {
      stat.textContent = z.gate > 0 ? `needs squad DPS ${fmt(z.gate)} (${bots.gateNeeded(state.bots, i, d)} bots)` : "unmanned";
    } else if (!zr.held) {
      stat.textContent = `squad DPS ${fmt(zr.squadDps)} / ${fmt(z.gate)} — can't hold`;
    } else {
      stat.textContent = `${zr.kps.toFixed(2)} kills/s${zr.kps >= farm.KILL_CAP ? " · CAP" : ""} · ${fmt(zr.copperPerSec)}c/s · ${zr.bansPerHour.toFixed(2)} bans/h`;
    }
    // kill-cycle bar (training-bar logic); solid at/near cap — fast cycles strobe
    const zfEl = $(`zf${i}`);
    if (n > 0 && zr.kps > 0) zfEl.style.width = zr.kps >= 10 ? "100%" : `${((now / 1000) * zr.kps % 1) * 100}%`;
    else zfEl.style.width = "0";
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
      const lines = (item.affixes || []).map(a => `<div class="affixItem">${affixLabel(a)}</div>`).join("");
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
      $(`rfcl_${slot}`).innerHTML = `→ ${cand.map(a => affixLabel(a)).join(" · ")}`;
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

  { // delve panel
    const dg = state.dungeon, dps = charDps();
    const nextN = dg.floor + 1, chance = dungeon.clearChance(nextN, dps);
    $("delveState").innerHTML = dg.active
      ? `on floor <b>${dg.floor}</b> · descend to ${nextN}: <b>${(chance * 100).toFixed(0)}%</b> clear (diff ${fmt(dungeon.diff(nextN))} vs your ${fmt(Math.round(dps))} DPS)`
      : `idle · safe depth <b>${dungeon.safeDepth(dps)}</b> · deepest ever <b>${dg.best || 0}</b>`;
    $("delveHaul").textContent = dg.active
      ? `haul: ${fmt(dg.haul.copper)}c${dg.haul.gear.length ? ` + ${dg.haul.gear.length} gear` : ""} — extract to keep it`
      : "";
    const cd = Math.max(0, dungeonCdUntil - now);
    $("descendBtn2").disabled = cd > 0;
    $("descendBtn2").textContent = dg.active ? "Descend" : "Enter";
    $("extractBtn").disabled = !dg.active;
    $("delveCd").textContent = cd > 0 ? `${(cd / 1000).toFixed(1)}s` : "";
    if (document.activeElement !== $("autoDelve")) $("autoDelve").checked = dg.auto;
  }

  if (stashDirty) renderStash();
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
  panel.querySelector("#devFinish").addEventListener("click", () => { if (state.pull) state.pull.endsAt = Date.now(); });
  panel.querySelector("#devCd").addEventListener("click", () => { state.cooldownUntil = 0; });
}

$("bossName").textContent = boss.name;
$("bossTitle").textContent = boss.title;
initBattle($("battle"));
say(state.boss.broken ? "break" : "greet");
startGameLoop(tick, render);
