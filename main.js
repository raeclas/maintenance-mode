// main.js — wiring: load → offline batch → loop → autosave; all UI sections.
import { newState } from "./state.js";
import { load, save, wipe } from "./saveSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { getBoss } from "./bosses.js";
import { startPull, resolvePull, pullDone, currentDepth, canPull, band, pullsToBreakEV, SCAR_CAP } from "./pull.js";
import { initBattle, renderBattle, notifyResult } from "./battle.js";
import { derive } from "./stats.js";
import * as bots from "./bots.js";
import * as farm from "./farm.js";
import { autoEquip, equipFromStash, contribution, SLOTS } from "./gear.js";
import * as enh from "./enhance.js";
import { fmt, fmtDepth } from "./format.js";

const state = newState();
const loaded = load(state);
const boss = getBoss(state.wall);
window.__mm = { state, save: () => save(state) }; // dev hook

const $ = id => document.getElementById(id);

function say(event, idx = state.boss.pulls) {
  const lines = boss.dialogue[event];
  const line = lines[Math.max(0, Math.min(idx, lines.length - 1))];
  $("dialogue").textContent = `${boss.name}: “${line}”`;
}

function log(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  $("log").prepend(div);
  while ($("log").children.length > 40) $("log").lastChild.remove();
}

let stashDirty = true;

function onDrop(item) {
  const equipped = autoEquip(state, item);
  stashDirty = true;
  log(`drop: ${item.name} (IP ${fmt(item.ip)}) — ${equipped ? "equipped" : "stashed"}`);
}

// ---- offline batch: same tick functions, dt clamped exactly like live ----
if (loaded && state.unlocked && state.lastSeen) {
  const dt = Math.min((Date.now() - state.lastSeen) / 1000, farm.OFFLINE_CAP_S);
  if (dt > 60) {
    const c0 = state.copper;
    let drops = 0;
    bots.tick(state, dt);
    farm.tick(state, dt, Math.random, item => { drops++; onDrop(item); });
    log(`— While you were gone (${fmt(dt / 3600)}h): +${fmt(state.copper - c0)}c, ${drops} drops.`);
    save(state);
  }
}

// ---- unlock reveal ----
function reveal() {
  for (const el of document.querySelectorAll(".game")) el.classList.remove("hidden");
}
if (state.unlocked) reveal();

// ---- pull ----
$("pullBtn").addEventListener("click", () => {
  if (!startPull(state, Date.now())) return;
  say("pullStart");
  log(`— Pull ${state.boss.pulls + 1} begins. Enrage in ${boss.windowS}s.`);
});

$("wipeBtn").addEventListener("click", () => {
  if (confirm("Wipe this character's save? (dev button)")) { wipe(); location.reload(); }
});

// ---- bot farm ----
function buyLabel(what, cost) {
  return `${what} (${fmt(cost)}c)`;
}
$("buyCap").addEventListener("click", () => { if (bots.buy(state, "cap")) log("Cleared dead sessions. The server never noticed the extra logins."); });
$("buyCreate").addEventListener("click", () => { if (bots.buy(state, "create")) log("Generator tuned. The email server that verified accounts died in 2019."); });
$("buyPower").addEventListener("click", () => { if (bots.buy(state, "power")) log("Script quality up. The forum post had 4 replies, all bots."); });
$("buySpeed").addEventListener("click", () => { if (bots.buy(state, "speed")) log("New hardware. The fans sound like a raid boss."); });
for (const btn of document.querySelectorAll(".assign button")) {
  btn.addEventListener("click", () => {
    const track = btn.dataset.track;
    bots.setAlloc(state, track, state.bots.alloc[track] + Number(btn.dataset.d));
  });
}
for (const [i, z] of farm.zones.entries()) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = z.name;
  $("botZone").appendChild(opt);
}
$("botZone").addEventListener("change", () => { state.bots.farmZone = Number($("botZone").value); });

// ---- farming: build zone cards once ----
const zoneEls = farm.zones.map((z, i) => {
  const div = document.createElement("div");
  div.className = "zone";
  div.innerHTML = `<div class="zoneName">${z.name}</div>
    <div class="zoneMob">${z.mob} · HP ${fmt(z.mobHp)} · gate ${fmt(z.gate)} DPS</div>
    <div class="zoneRates" id="zr${i}"></div>
    <button id="zp${i}">park</button>`;
  $("zones").appendChild(div);
  div.querySelector("button").addEventListener("click", () => {
    state.farm.zone = state.farm.zone === i ? null : i;
  });
  return div;
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
    const before = band(derive(state), boss, state.boss.scars);
    const r = enh.attempt(state, item);
    if (r === "poor") { log("Not enough copper."); return; }
    if (r === "max") { log(`${item.name} is at +${enh.MAX_PLUS} — the risk zone ends here (for now).`); return; }
    const after = band(derive(state), boss, state.boss.scars);
    if (r === "success") {
      log(`ENHANCE ✦ ${item.name} +${item.plus} — projection ${fmtDepth(before.lo)}–${fmtDepth(before.hi)} → ${fmtDepth(after.lo)}–${fmtDepth(after.hi)}`);
    } else {
      log(`enhance fail — ${item.name} ${enh.isRisk(item.plus) || item.plus >= 5 ? `slips to +${item.plus}` : `holds at +${item.plus}`}`);
    }
    stashDirty = true;
  });
}

$("stashToggle").addEventListener("click", () => {
  const l = $("stashList");
  l.style.display = l.style.display === "none" ? "" : "none";
});

function renderStash() {
  stashDirty = false;
  const list = [...state.gear.stash].sort((a, b) => contribution(b) - contribution(a)).slice(0, 10);
  $("stashToggle").textContent = `stash (${state.gear.stash.length})`;
  const el = $("stashList");
  el.innerHTML = "";
  list.forEach(item => {
    const idx = state.gear.stash.indexOf(item);
    const row = document.createElement("div");
    row.innerHTML = `<span>${item.name} · ${item.slot} · IP ${fmt(item.ip)}${item.plus ? " +" + item.plus : ""}</span> <button>equip</button>`;
    row.querySelector("button").addEventListener("click", () => { equipFromStash(state, idx); stashDirty = true; });
    el.appendChild(row);
  });
  if (state.gear.stash.length > 10) {
    const more = document.createElement("div");
    more.textContent = `…and ${state.gear.stash.length - 10} more (nothing is ever deleted)`;
    el.appendChild(more);
  }
}

// ---- loop ----
let lastSave = 0;
let lastTick = Date.now();
function tick() {
  const now = Date.now();
  const dt = Math.min((now - lastTick) / 1000, farm.OFFLINE_CAP_S); // same clamp as offline
  lastTick = now;
  if (state.unlocked) {
    bots.tick(state, dt);
    farm.tick(state, dt, Math.random, onDrop);
  }
  if (state.pull && pullDone(state, now)) {
    const depth = resolvePull(state, now);
    notifyResult(depth, state.boss.broken);
    if (state.boss.broken) {
      say("break");
      log(`★ W1 BROKEN — ${boss.name} steps aside. Pull ${state.boss.pulls}.`);
    } else {
      const tier = depth < 0.01 ? "fail_hopeless" : depth >= 0.95 ? "fail_near" : "fail_low";
      say(tier, state.boss.pulls - 1);
      log(`Pull ${state.boss.pulls}: ${fmtDepth(depth)} — enrage. Scars ${fmtDepth(state.boss.scars)}.`);
      if (!state.unlocked) {
        state.unlocked = true;
        reveal();
        log("— New panels flicker on: BOT FARM · FARMING · GEAR. The forum tools still work.");
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
  $("copperEl").textContent = fmt(state.copper);
  $("playerCount").textContent = state.unlocked ? 1 + Math.round(state.bots.pop) : 1;

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
    ? `pulls ${state.boss.pulls} · best ${fmtDepth(state.boss.bestDepth)} · scars ${fmtDepth(state.boss.scars)}`
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
      $("projection").textContent = `projection: ${fmtDepth(lo)}–${fmtDepth(hi)} · breaks in ~${n} pull${n > 1 ? "s" : ""}`;
    }
  }

  if (!state.unlocked) return;

  // bot farm
  const b = state.bots;
  $("buyCap").textContent = buyLabel(`session slots +${4}`, bots.capCost(b));
  $("buyCreate").textContent = buyLabel("generator +", bots.createCost(b));
  $("buyPower").textContent = buyLabel("script quality +", bots.powerCost(b));
  $("buySpeed").textContent = buyLabel("hardware +", bots.speedCost(b));
  const idle = 100 - b.alloc.atk - b.alloc.spd - b.alloc.farm;
  $("rigLine").textContent =
    `${b.pop.toFixed(1)} / ${bots.capacity(b)} bots · +${bots.createRate(b).toFixed(1)}/h · power ×${bots.botPower(b).toFixed(2)} · speed ×${bots.botSpeed(b).toFixed(2)} · idle ${idle}% · banned ever: ${Math.floor(b.banned)}`;
  const quality = bots.botPower(b) * bots.botSpeed(b);
  for (const [bar, track, el] of [["atk", "atk", "Atk"], ["speed", "spd", "Speed"]]) {
    const B = b.bars[bar];
    $(`alloc${el === "Atk" ? "Atk" : "Spd"}`).textContent = b.alloc[track] + "%";
    const gain = bar === "atk" ? "+8 ATK/lvl" : "+0.03 hits/lvl";
    const capped = bar === "speed" && B.lvl >= 100 ? " (CAP)" : "";
    $(`bar${el}Info`).textContent = `lvl ${B.lvl}${capped} · ${(b.pop * b.alloc[track] / 100 * quality).toFixed(1)}/s · ${gain}`;
    $(`bar${el}Fill`).style.width = `${Math.min(100, (B.prog / bots.levelCost(B.lvl)) * 100)}%`;
  }
  $("allocFarm").textContent = b.alloc.farm + "%";
  const bf = bots.botFarmRates(b, b.farmZone);
  $("botFarmInfo").textContent = b.alloc.farm > 0
    ? `${fmt(bf.copperPerSec)}c/s mailed · ${bf.bansPerHour.toFixed(2)} bans/h (bot DPS ${fmt(bots.botDps(b))})`
    : `bot DPS ${fmt(bots.botDps(b))} · safe in lobbies`;

  // farming
  farm.zones.forEach((z, i) => {
    const rc = farm.rateCard(state, z);
    $(`zr${i}`).textContent = rc.locked
      ? `locked — need ${fmt(z.gate)} DPS`
      : `${rc.copperPerSec >= 0.1 ? fmt(rc.copperPerSec) : rc.copperPerSec.toFixed(2)}c/s · ${rc.kps.toFixed(2)} kills/s · ${rc.dropsPerHour.toFixed(1)} drops/h`;
    const btn = $(`zp${i}`);
    btn.disabled = rc.locked;
    btn.textContent = state.farm.zone === i ? "parked ✓" : "park";
    zoneEls[i].classList.toggle("active", state.farm.zone === i);
  });

  // gear
  for (const slot of SLOTS) {
    const item = state.gear[slot];
    $(`si_${slot}`).textContent = item
      ? `${item.name} · IP ${fmt(item.ip)} ${item.plus ? `+${item.plus}` : ""} → ${fmt(contribution(item))} ATK`
      : "—";
    const btn = $(`se_${slot}`);
    btn.disabled = !item || item.plus >= enh.MAX_PLUS;
    $(`sei_${slot}`).textContent = item && item.plus < enh.MAX_PLUS
      ? `+${item.plus}→+${item.plus + 1} · ${fmt(enh.cost(item))}c · ${Math.round(enh.chance(item.plus) * 100)}%${enh.isRisk(item.plus) ? " · fail −1" : ""}`
      : "";
  }
  if (stashDirty) renderStash();
}

$("bossName").textContent = boss.name;
$("bossTitle").textContent = boss.title;
initBattle($("battle"));
say(state.boss.broken ? "break" : "greet");
startGameLoop(tick, render);
