// sim.js — deterministic EV progression sim / balance drift tracker.
//
//   node internal/sim.js            print milestones, write baseline.json
//   node internal/sim.js --compare  diff vs baseline.json, exit 1 on >25% drift
//
// Imports the REAL game modules; computes nothing they can compute.
// All randomness replaced with expected value: drops are EV carry with
// E[max] of uniform rolls, enhance uses birth-death hitting costs, pulls
// roll exactly EV. Bot plays 16h/day "waking" (1 EV pull/hour), idles 8h.
//
// HARD PACING GATES (exit 1 if violated — REMAKE-DESIGN §3b):
//   W1 broken (EV) within 4–7 days
//   first-session (1h) power ≥ ×10
//   day-1 best depth ≥ 1%
import fs from "node:fs";
import { newState } from "../state.js";
import { getBoss } from "../bosses.js";
import { expectedDepth, SCAR_CAP, SCAR_RATE } from "../pull.js";
import { derive } from "../stats.js";
import * as bots from "../bots.js";
import * as farm from "../farm.js";
import { contribution, SLOTS, SALVAGE_RATE } from "../gear.js";
import { cost as enhCost, evCostPerIpFrom, chance } from "../enhance.js";

const S = newState();
const boss = getBoss(S.wall);
const STEP = 600; // 10-min chunks
const MAX_S = 10 * 86400;
const ENH_TARGET = 16; // nightmare pushes; the copper-buffer rule self-limits where EV explodes

const dps = () => { const d = derive(S); return d.atk * d.hitsPerSec; };
const startDps = dps();

const milestones = [];
const seenM = new Set();
function mark(t, desc) {
  if (seenM.has(desc)) return;
  seenM.add(desc);
  milestones.push({ t: Math.round(t), desc });
}

// per-zone accumulated gear rolls (EV): E[max of n uniform] = lo + span·n/(n+1)
const rolls = farm.zones.map(() => 0);

function bestZone() {
  let zi = -1;
  farm.zones.forEach((z, i) => { if (dps() >= z.gate) zi = i; });
  return zi;
}

let t = 0;
let broken = false;
mark(30, `first pull ${(expectedDepth(derive(S), boss) * 100).toFixed(4)}% (intro beat)`);
mark(35, "systems unlock");
S.unlocked = true;

let botOutEarnSteps = 0, totalSteps = 0;
while (t < MAX_S && !broken) {
  t += STEP;
  totalSteps++;

  // --- swarm: 20% speed until cap, 40% atk, 40% farm best per-bot zone ---
  const speedDone = S.bots.bars.speed.lvl >= 100;
  S.bots.alloc.spd = speedDone ? 0 : 0.2 * S.bots.pop;
  S.bots.alloc.atk = (speedDone ? 0.6 : 0.4) * S.bots.pop;
  S.bots.alloc.farm = 0.4 * S.bots.pop;
  let bz = 0;
  farm.zones.forEach((zz, i) => {
    if (bots.botFarmRates(S.bots, i).perBotCopperSec > bots.botFarmRates(S.bots, bz).perBotCopperSec) bz = i;
  });
  S.bots.farmZone = bz;
  const botRates = bots.botFarmRates(S.bots, bz);
  bots.tick(S, STEP); // creation, training, farm mail, bans

  // --- player farms best gated zone (real rate card) ---
  const zi = bestZone();
  S.farm.zone = zi;
  const z = farm.zones[zi];
  const rc = farm.rateCard(S, z);
  S.copper += rc.copperPerSec * STEP;
  const dropsNow = (rc.dropsPerHour * STEP) / 3600;
  rolls[zi] += dropsNow;
  // salvage faucet: non-upgrade drops decompose (autoSalvage assumed on)
  S.copper += dropsNow * SALVAGE_RATE * (z.ipLo + z.ipHi) / 2;

  // main-character gate: the swarm must not out-earn your own parking
  if (botRates.copperPerSec > rc.copperPerSec) botOutEarnSteps++;

  // --- gear adoption: EV best roll so far in this zone. Adopt on RAW ip gain
  // (optimal play re-enhances; copper income covers the re-climb) ---
  for (const slot of SLOTS) {
    const n = rolls[zi] / SLOTS.length;
    if (n < 1) break;
    const expIp = Math.round(z.ipLo + (z.ipHi - z.ipLo) * (n / (n + 1)));
    const cur = S.gear[slot];
    if (!cur || expIp > cur.ip) {
      if (cur) S.gear.stash.push(cur);
      S.gear[slot] = { slot, ip: expIp, plus: 0, zone: zi + 1, name: "ev" };
    }
  }

  // --- spend copper: rig upgrades with ≤30min payback, then enhance to +10 ---
  const income = rc.copperPerSec + botRates.copperPerSec;
  for (;;) {
    const options = [
      ["cap", bots.capCost(S.bots)],
      ["create", bots.createCost(S.bots)],
      ["power", bots.powerCost(S.bots)],
      ["speed", bots.speedCost(S.bots)],
    ].sort((a, b) => a[1] - b[1]);
    const [what, price] = options[0];
    if (price <= S.copper && price <= income * 1800) bots.buy(S, what);
    else break;
  }
  for (;;) {
    let best = null;
    for (const slot of SLOTS) {
      const it = S.gear[slot];
      if (!it || it.plus >= ENH_TARGET) continue;
      const c = it.ip * evCostPerIpFrom(it.plus);
      if (!best || c < best.c) best = { it, c };
    }
    if (!best || S.copper < best.c * 2) break; // keep a buffer
    S.copper -= best.c;
    best.it.plus++;
  }

  // --- one EV pull per waking hour (16h/day) ---
  const waking = t % 86400 < 16 * 3600;
  if (waking && t % 3600 < STEP) {
    const fresh = expectedDepth(derive(S), boss);
    const total = S.boss.scars + fresh;
    S.boss.bestDepth = Math.max(S.boss.bestDepth, Math.min(total, 1));
    if (total >= 1) {
      broken = true;
      mark(t, "W1 broken (EV)");
    } else {
      S.boss.scars = Math.min(SCAR_CAP, S.boss.scars + fresh * SCAR_RATE);
      if (S.boss.scars >= SCAR_CAP) mark(t, "scars capped");
    }
  }

  if (process.env.SIMDBG && t % 21600 < STEP) {
    const d = derive(S);
    console.error(`t=${(t / 3600).toFixed(0)}h dps=${Math.round(dps())} atk=${Math.round(d.atk)} hits=${d.hitsPerSec.toFixed(2)} pop=${S.bots.pop.toFixed(1)} atkLvl=${S.bots.bars.atk.lvl} spdLvl=${S.bots.bars.speed.lvl} gearIp=${SLOTS.map(sl => S.gear[sl] ? `${S.gear[sl].ip}+${S.gear[sl].plus}` : "-").join(",")} cu=${Math.round(S.copper)} scars=${S.boss.scars.toFixed(2)}`);
  }

  // --- observation milestones ---
  const mult = dps() / startDps;
  for (const m of [10, 100, 1000, 10000]) if (mult >= m) mark(t, `power ×${m}`);
  farm.zones.forEach((zz, i) => { if (i > 0 && dps() >= zz.gate) mark(t, `${zz.id} unlocked (${zz.name})`); });
  for (const pct of [0.001, 0.01, 0.1, 0.5]) {
    if (S.boss.bestDepth >= pct) mark(t, `depth ${pct * 100}%`);
  }
}

milestones.sort((a, b) => a.t - b.t);

function fmtT(t) {
  if (t < 60) return `${t}s`;
  if (t < 3600) return `${(t / 60).toFixed(1)}m`;
  if (t < 86400) return `${(t / 3600).toFixed(1)}h`;
  return `${(t / 86400).toFixed(1)}d`;
}

// --- pacing gates ---
const gates = [];
const breakM = milestones.find(m => m.desc === "W1 broken (EV)");
if (!breakM) gates.push("GATE FAIL: W1 never breaks within 10d");
else if (breakM.t < 4 * 86400 || breakM.t > 7 * 86400) gates.push(`GATE FAIL: W1 breaks at ${fmtT(breakM.t)} (window 4d–7d)`);
const x10 = milestones.find(m => m.desc === "power ×10");
if (!x10 || x10.t > 3600) gates.push(`GATE FAIL: power ×10 at ${x10 ? fmtT(x10.t) : "never"} (want ≤1h)`);
const d1 = milestones.find(m => m.desc === "depth 1%");
if (!d1 || d1.t > 86400) gates.push(`GATE FAIL: depth 1% at ${d1 ? fmtT(d1.t) : "never"} (want ≤1d)`);
if (botOutEarnSteps / totalSteps > 0.1) gates.push(`GATE FAIL: bot swarm out-earns the player in ${(botOutEarnSteps / totalSteps * 100).toFixed(0)}% of steps (main-character law, want ≤10%)`);

const compare = process.argv.includes("--compare");
const baseUrl = new URL("./baseline.json", import.meta.url);
if (!compare) {
  for (const m of milestones) console.log(`${fmtT(m.t).padStart(8)}  ${m.desc}`);
  for (const g of gates) console.error(g);
  if (gates.length) process.exit(1);
  fs.writeFileSync(baseUrl, JSON.stringify(milestones, null, 2));
  console.log("baseline.json written");
} else {
  if (gates.length) { for (const g of gates) console.error(g); process.exit(1); }
  const base = JSON.parse(fs.readFileSync(baseUrl));
  const keyed = list => { // "desc#N" so repeated descs stay distinct
    const seen = {}, out = new Map();
    for (const m of list) {
      const n = seen[m.desc] = (seen[m.desc] || 0) + 1;
      out.set(`${m.desc}#${n}`, m.t);
    }
    return out;
  };
  const baseMap = keyed(base), nowMap = keyed(milestones);
  let drifted = 0;
  for (const [key, tt] of nowMap) {
    const old = baseMap.get(key);
    if (old === undefined) { console.log(`     NEW  ${key} @ ${fmtT(tt)}`); drifted++; continue; }
    const pct = old === 0 ? 0 : ((tt - old) / old) * 100;
    const flag = Math.abs(pct) > 25 ? " <<< DRIFT" : "";
    if (Math.abs(pct) > 1 || flag) {
      console.log(`${fmtT(tt).padStart(8)}  ${key} (${pct.toFixed(0)}% vs baseline)${flag}`);
      if (flag) drifted++;
    }
  }
  for (const key of baseMap.keys()) {
    if (!nowMap.has(key)) { console.log(` MISSING  ${key}`); drifted++; }
  }
  console.log(drifted ? `${drifted} drifted` : "no significant drift");
  process.exit(drifted ? 1 : 0);
}
