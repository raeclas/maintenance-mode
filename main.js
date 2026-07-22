// main.js — wiring: load → offline batch → loop → autosave; all UI sections.
import { newState } from "./state.js";
import { load, save, wipe } from "./saveSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { getBoss } from "./bosses.js";
import { startPull, resolvePull, pullDone, currentDepth, canPull, band, pullsToBreakEV, scarCap, cooldownMs, processIdleAttempts } from "./pull.js";
import { FLAGS, UNLOCKS, UTILITY, flagCost, utilityCost, buyFlag, buyUnlock, buyUtility, gmDmgMult, gmHasteMult, ticketYield, BREAK_TICKETS } from "./gm.js";
import { initBattle, renderBattle, notifyResult, notifyEnhance } from "./battle.js";
import { derive } from "./stats.js";
import * as bots from "./bots.js";
import * as farm from "./farm.js";
import { routeDrop, equipFromStash, contribution, salvage, scrapYield, salvageMatching, SLOTS, STASH_CAP } from "./gear.js";
import { RARITIES, RARITY_BY_ID } from "./rarity.js";
import { affixLabel } from "./affixes.js";
import * as enh from "./enhance.js";
import { fmt, fmtDepth } from "./format.js";

const state = newState();
const loaded = load(state);
const boss = getBoss(state.wall);
window.__mm = { state, save: () => save(state) }; // dev hook

// ---- dev mode: ?dev in the URL. Time scale + shortcuts. Never saved. ----
const DEV = new URLSearchParams(location.search).has("dev");
let devScale = 1;

const $ = id => document.getElementById(id);

function say(event) {
  const line = boss.dialogue[event]?.[0];
  if (line) $("dialogue").textContent = `${boss.name}: “${line}”`;
}

function log(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  $("log").prepend(div);
  while ($("log").children.length > 40) $("log").lastChild.remove();
}

let stashDirty = true;

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
    if (state.gm.idleProc && !state.boss.broken) {
      const r = processIdleAttempts(state, dt);
      if (r.attempts) log(`idle processing: ${r.attempts} attempts · best ${fmtDepth(r.best)} · +${fmt(r.tickets)} tickets`);
      if (r.broke) log(`★ W1 BROKEN while you were away`);
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
for (const slot of SLOTS) {
  const div = document.createElement("div");
  div.className = "slot";
  div.innerHTML = `<div class="slotName">${slot}</div><div class="slotItem" id="si_${slot}">—</div>
    <button id="se_${slot}">enhance</button><span class="enhInfo" id="sei_${slot}"></span>`;
  $("slots").appendChild(div);
  slotEls[slot] = div;
  div.querySelector("button").addEventListener("click", () => {
    const item = state.gear[slot];
    if (!item) return;
    const r = enh.attempt(state, item, Math.random, $("safeguard").checked);
    if (r === "poor" || r === "max") return; // button state explains itself
    enhMilestones(item, r); // feedback is the row flash, not log spam
  });
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
    row.innerHTML =
      `<span><span class="itemName" style="color:${rar.color}">${item.lock ? "🔒 " : ""}${item.name}</span>` +
        ` · ${item.slot} · IP ${fmt(item.ip)}${item.plus ? " +" + item.plus : ""}` +
        `<span class="affixLine">${affixes}</span></span>` +
      `<span><button class="eq">equip</button><button class="lk">${item.lock ? "unlock" : "lock"}</button>` +
        `<button class="sv" ${item.lock ? "disabled" : ""}>salvage +${scrapYield(item)}</button></span>`;
    row.querySelector(".eq").addEventListener("click", () => { equipFromStash(state, idx); stashDirty = true; });
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
    const depth = resolvePull(state, now);
    notifyResult(depth, state.boss.broken);
    const yieldT = ticketYield(depth) + (state.boss.broken ? BREAK_TICKETS : 0);
    state.tickets += yieldT;
    if (state.boss.broken) {
      say("break");
      log(`★ W1 BROKEN — attempt ${state.boss.pulls} · +${fmt(yieldT)} tickets`);
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

  // pull row
  const pb = $("pullBtn");
  $("ticketGain").textContent = "";
  if (state.pull) {
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
  } else if (state.boss.broken) {
    $("depth").textContent = "100%";
    pb.disabled = true;
    pb.textContent = "THE DOOR STANDS OPEN";
    $("cooldown").textContent = "W2 — [content not yet installed on this realm]";
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
  $("monument").style.display = state.boss.broken ? "" : "none";

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
  $("scrapWallet").textContent = RARITIES
    .filter(r => (state.scrap[r.id] || 0) > 0)
    .map(r => `${fmt(state.scrap[r.id])} ${r.name.toLowerCase()}`).join(" · ") || "no scrap yet";

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
      const affixes = (item.affixes || []).map(a => affixLabel(a)).join(" · ");
      si.innerHTML =
        `<span class="itemName" style="color:${rar.color}">${item.name}</span>` +
        ` · IP ${fmt(item.ip)} ${item.plus ? `+${item.plus}` : ""} → ${fmt(contribution(item))} ATK` +
        (affixes ? `<span class="affixLine">${affixes}</span>` : "");
    } else si.textContent = "—";
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
