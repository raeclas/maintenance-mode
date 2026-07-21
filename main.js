// main.js — wiring: load → offline batch → loop → autosave; all UI sections.
import { newState } from "./state.js";
import { load, save, wipe } from "./saveSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { getBoss } from "./bosses.js";
import { startPull, resolvePull, pullDone, currentDepth, canPull, band, pullsToBreakEV, SCAR_CAP } from "./pull.js";
import { initBattle, renderBattle, notifyResult, notifyEnhance } from "./battle.js";
import { derive } from "./stats.js";
import * as bots from "./bots.js";
import * as farm from "./farm.js";
import { autoEquip, equipFromStash, contribution, salvage, salvageValue, SLOTS, STASH_CAP } from "./gear.js";
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
  const r = autoEquip(state, item);
  stashDirty = true;
  const fate = r.equipped ? "equipped" : r.salvaged ? `salvaged +${fmt(salvageValue(item))}c` : "stashed";
  log(`drop: ${item.name} ${fmt(item.ip)}IP · ${fate}`);
  if (r.overflow) log(`stash full: salvaged ${r.overflow.name} +${fmt(salvageValue(r.overflow))}c`);
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
  const dt = Math.min((Date.now() - state.lastSeen) / 1000, farm.OFFLINE_CAP_S);
  if (dt > 60) {
    const c0 = state.copper;
    let drops = 0;
    bots.tick(state, dt);
    farm.tick(state, dt, Math.random, item => { drops++; onDrop(item); });
    log(`offline ${fmt(dt / 3600)}h: +${fmt(state.copper - c0)}c · ${drops} drops`);
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
for (const [track, id] of [["atk", "allocAtk"], ["spd", "allocSpd"], ["farm", "allocFarm"], ["enh", "allocEnh"]]) {
  $(id).addEventListener("change", () => bots.setAlloc(state, track, Number($(id).value)));
}
for (const slot of SLOTS) {
  const opt = document.createElement("option");
  opt.value = slot;
  opt.textContent = slot;
  $("enhSlot").appendChild(opt);
}
$("enhSlot").addEventListener("change", () => { state.bots.enhTarget.slot = $("enhSlot").value; });
$("enhPlus").addEventListener("change", () => {
  state.bots.enhTarget.plus = Math.max(0, Math.min(enh.MAX_PLUS, Math.floor(Number($("enhPlus").value)) || 0));
});
// ITRTG-style allocation: ± steps and % presets per track
for (const row of document.querySelectorAll(".assign[data-track]")) {
  row.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const track = row.dataset.track;
    const b = state.bots;
    if (btn.dataset.d !== undefined) {
      bots.setAlloc(state, track, b.alloc[track] + Number(btn.dataset.d));
    } else if (btn.dataset.p === "max") {
      const others = Object.keys(b.alloc).filter(k => k !== track).reduce((s, k) => s + b.alloc[k], 0);
      bots.setAlloc(state, track, Math.max(0, Math.floor(b.pop) - others));
    } else {
      bots.setAlloc(state, track, Math.round(b.pop * Number(btn.dataset.p) / 100));
    }
  });
}
for (const [i, z] of farm.zones.entries()) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = z.name;
  $("botZone").appendChild(opt);
}
$("botZone").addEventListener("change", () => { state.bots.farmZone = Number($("botZone").value); });

// ---- farming: dense zone table, built once, cells updated in render ----
$("zones").innerHTML = `<table class="ztable"><thead><tr>
  <th class="tl">zone</th><th>gate</th><th>c/s</th><th>drops/h</th><th>kills/s</th><th class="tl">bound</th><th></th>
</tr></thead><tbody>${farm.zones.map((z, i) => `<tr id="zrow${i}">
  <td class="tl">${z.name}<div class="sub">${z.mob} · ${fmt(z.mobHp)} HP</div></td>
  <td>${fmt(z.gate)}</td><td id="zc${i}">—</td><td id="zd${i}">—</td><td id="zk${i}">—</td>
  <td class="tl" id="zb${i}">—</td><td><button id="zp${i}">park</button></td>
</tr>`).join("")}</tbody></table>`;
farm.zones.forEach((z, i) => {
  $(`zp${i}`).addEventListener("click", () => {
    state.farm.zone = state.farm.zone === i ? null : i;
  });
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
$("autoSalvage").addEventListener("change", () => { state.gear.autoSalvage = $("autoSalvage").checked; });
$("salvageAll").addEventListener("click", () => {
  const keep = [], goners = [];
  for (const it of state.gear.stash) (it.lock ? keep : goners).push(it);
  if (!goners.length) return;
  let total = 0;
  for (const it of goners) total += salvage(state, it);
  state.gear.stash = keep;
  stashDirty = true;
  log(`salvaged ${goners.length} items +${fmt(total)}c`);
});

function renderStash() {
  stashDirty = false;
  const sorted = [...state.gear.stash].sort((a, b) => contribution(b) - contribution(a)).slice(0, 15);
  $("stashToggle").textContent = `stash (${state.gear.stash.length}/${STASH_CAP})`;
  const el = $("stashList");
  el.innerHTML = "";
  sorted.forEach(item => {
    const idx = state.gear.stash.indexOf(item);
    const row = document.createElement("div");
    row.innerHTML = `<span>${item.lock ? "🔒 " : ""}${item.name} · ${item.slot} · IP ${fmt(item.ip)}${item.plus ? " +" + item.plus : ""}</span>` +
      `<span><button class="eq">equip</button><button class="lk">${item.lock ? "unlock" : "lock"}</button><button class="sv" ${item.lock ? "disabled" : ""}>salvage +${fmt(salvageValue(item))}c</button></span>`;
    row.querySelector(".eq").addEventListener("click", () => { equipFromStash(state, idx); stashDirty = true; });
    row.querySelector(".lk").addEventListener("click", () => { item.lock = !item.lock; stashDirty = true; });
    row.querySelector(".sv").addEventListener("click", () => {
      state.gear.stash.splice(idx, 1);
      log(`salvaged ${item.name} (+${fmt(salvage(state, item))}c)`);
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
  const dt = Math.min((now - lastTick) / 1000, farm.OFFLINE_CAP_S) * devScale; // same clamp as offline
  lastTick = now;
  if (state.unlocked) {
    bots.tick(state, dt, (r, item) => enhMilestones(item, r));
    farm.tick(state, dt, Math.random, onDrop);
  }
  if (state.pull && pullDone(state, now)) {
    const depth = resolvePull(state, now);
    notifyResult(depth, state.boss.broken);
    if (state.boss.broken) {
      say("break");
      log(`★ W1 BROKEN — attempt ${state.boss.pulls}`);
    } else {
      // milestone-only dialogue: intro fail, first near-miss. Silence otherwise.
      if (state.boss.pulls === 1) say("fail_hopeless");
      else if (depth >= 0.95 && !state.boss.nearSaid) { state.boss.nearSaid = true; say("fail_near"); }
      log(`attempt ${state.boss.pulls}: ${fmtDepth(depth)} · scars ${fmtDepth(state.boss.scars)}`);
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
  { // odometer weld: projection visible next to the stats that move it
    const w = band(d, boss, state.boss.scars);
    $("projMini").textContent = state.boss.broken ? "100%" : `${fmtDepth(w.lo)}–${fmtDepth(w.hi)}`;
  }
  $("copperEl").textContent = fmt(state.copper);
  $("resBots").textContent = `${state.bots.pop.toFixed(1)}/${bots.capacity(state.bots)} (+${bots.createRate(state.bots).toFixed(1)}/h)`;

  // pull row
  const pb = $("pullBtn");
  if (state.pull) {
    $("depth").textContent = fmtDepth(Math.min(1, currentDepth(state, now)));
    pb.disabled = true;
    $("cooldown").textContent = `enrage in ${Math.max(0, (state.pull.endsAt - now) / 1000).toFixed(0)}s`;
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
    const { lo, hi } = band(d, boss, state.boss.scars);
    const n = pullsToBreakEV(d, boss, state.boss.scars);
    if (n === Infinity) {
      const reqDps = ((1 - Math.max(state.boss.scars, SCAR_CAP)) * boss.hp) / boss.windowS;
      $("projection").textContent = `projection: ${fmtDepth(lo)}–${fmtDepth(hi)} · required power: ~×${fmt(reqDps / dps)} current`;
    } else {
      $("projection").textContent = `projection: ${fmtDepth(lo)}–${fmtDepth(hi)} · breaks in ~${n} attempt${n > 1 ? "s" : ""}`;
    }
  }

  if (!state.unlocked) return;

  // bot farm
  const b = state.bots;
  $("buyCap").textContent = buyLabel(`session slots +${4}`, bots.capCost(b));
  $("buyCreate").textContent = buyLabel("generator +", bots.createCost(b));
  $("buyPower").textContent = buyLabel("script quality +", bots.powerCost(b));
  $("buySpeed").textContent = buyLabel("hardware +", bots.speedCost(b));
  const eff = bots.effAlloc(b);
  const idle = Math.max(0, b.pop - eff.atk - eff.spd - eff.farm - eff.enh);
  const scaled = eff.scale < 0.995 ? ` · over-allocated ×${eff.scale.toFixed(2)}` : "";
  $("resRig").textContent =
    `power ×${bots.botPower(b).toFixed(2)} · speed ×${bots.botSpeed(b).toFixed(2)} · idle ${idle.toFixed(1)} · banned ${Math.floor(b.banned)}${scaled}`;
  $("popFill").style.width = `${Math.min(100, (b.pop / bots.capacity(b)) * 100)}%`;
  const quality = bots.botPower(b) * bots.botSpeed(b);
  for (const [bar, track, el] of [["atk", "atk", "Atk"], ["speed", "spd", "Speed"]]) {
    const B = b.bars[bar];
    const input = $(`alloc${track === "atk" ? "Atk" : "Spd"}`);
    if (document.activeElement !== input) input.value = b.alloc[track];
    const gain = bar === "atk" ? "+8 ATK/lvl" : "+0.03 hits/lvl";
    const capped = bar === "speed" && B.lvl >= 100 ? " (CAP)" : "";
    $(`bar${el}Info`).textContent = `lvl ${B.lvl}${capped} · ${(eff[track] * quality).toFixed(1)}/s · ${gain}`;
    $(`bar${el}Fill`).style.width = `${Math.min(100, (B.prog / bots.levelCost(B.lvl)) * 100)}%`;
  }
  if (document.activeElement !== $("allocFarm")) $("allocFarm").value = b.alloc.farm;
  $("autoSalvage").checked = state.gear.autoSalvage;
  const bf = bots.botFarmRates(b, b.farmZone);
  $("botFarmInfo").textContent = eff.farm > 0
    ? `${fmt(bf.copperPerSec)}c/s · ${bf.bansPerHour.toFixed(2)} bans/h · bot DPS ${fmt(bots.botDps(b))}`
    : `bot DPS ${fmt(bots.botDps(b))} · idle`;

  // bot enhance squad
  if (document.activeElement !== $("allocEnh")) $("allocEnh").value = b.alloc.enh;
  if (document.activeElement !== $("enhSlot")) $("enhSlot").value = b.enhTarget.slot;
  if (document.activeElement !== $("enhPlus")) $("enhPlus").value = b.enhTarget.plus;
  const tItem = state.gear[b.enhTarget.slot];
  const iv = tItem ? bots.enhInterval(b, tItem.plus) : Infinity;
  $("botEnhInfo").textContent = eff.enh <= 0 ? "idle"
    : !tItem ? "no item in slot"
    : tItem.plus >= b.enhTarget.plus ? `done: +${tItem.plus}`
    : `try every ${iv === Infinity ? "—" : fmt(iv)}s · ${fmt(enh.cost(tItem))}c/try`;

  // farming table — numbers in columns, binding stat named
  farm.zones.forEach((z, i) => {
    const rc = farm.rateCard(state, z);
    const row = $(`zrow${i}`);
    row.classList.toggle("locked", rc.locked);
    row.classList.toggle("active", state.farm.zone === i);
    if (rc.locked) {
      $(`zc${i}`).textContent = $(`zd${i}`).textContent = $(`zk${i}`).textContent = "—";
      $(`zb${i}`).textContent = "locked";
    } else {
      $(`zc${i}`).textContent = rc.copperPerSec >= 0.1 ? fmt(rc.copperPerSec) : rc.copperPerSec.toFixed(2);
      $(`zd${i}`).textContent = rc.dropsPerHour.toFixed(1);
      $(`zk${i}`).textContent = rc.kps.toFixed(2);
      $(`zb${i}`).textContent = rc.speedBound ? "SPD (one-shot)" : `ATK · 1-shot @${fmt(rc.oneShotAtk)}`;
    }
    const btn = $(`zp${i}`);
    btn.disabled = rc.locked;
    btn.textContent = state.farm.zone === i ? "✓" : "park";
  });

  // gear
  const sg = $("safeguard").checked;
  $("stacksHud").textContent = state.failstacks
    ? `· failstacks ${state.failstacks} (+${Math.min(state.failstacks, enh.STACK_CAP_PTS)}% next success)`
    : "";
  for (const slot of SLOTS) {
    const item = state.gear[slot];
    const si = $(`si_${slot}`);
    si.textContent = item
      ? `${item.name} · IP ${fmt(item.ip)} ${item.plus ? `+${item.plus}` : ""} → ${fmt(contribution(item))} ATK`
      : "—";
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
