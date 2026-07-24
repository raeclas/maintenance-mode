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
// PACING NOTES (diagnostic only — printed, never exit 1). The economy is
// bot-driven now and bot balance is playtest-owned ("I am the sim"), so the
// old hard gates can't judge the coupled curve. Kept as reference readouts:
//   W1 broken (EV) within 4–7 days
//   first-session (1h) power ≥ ×10
//   day-1 best depth ≥ 1%
import fs from "node:fs";
import { newState } from "../state.js";
import { getBoss } from "../bosses.js";
import { expectedDepth, scarCap, cooldownMs, SCAR_RATE } from "../pull.js";
import { ticketYield, buyFlag, buyUnlock, buyUtility, flagCost } from "../gm.js";
import { derive, SPEED_KNEE, BASE_HPS } from "../stats.js";
import * as bots from "../bots.js";
import * as farm from "../farm.js";
import { contribution, SLOTS } from "../gear.js";
import { AFFIXES, affixTier } from "../affixes.js";

// EV gear model: optimal play keeps DAMAGE rolls, so credit the equipped EV
// item a Rare's worth of atk affixes (atkFlat + atkPct) at mid tier value.
// ponytail: coarse — ignores haste/copper rolls and roll variance; gear feeds
// player DPS so this is sim-relevant, restamp baseline + playtest to tune.
function evAffixes(ip) {
  const t = affixTier(ip);
  return ["atkFlat", "atkPct"].map(id => {
    const a = AFFIXES[id];
    const mid = a.ipFrac != null ? a.ipFrac * ip : a.base + a.per * (t - 1);
    return { id, tier: t, value: a.round ? Math.round(mid) : +mid.toFixed(2) };
  });
}
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

let t = 0;
let broken = false;
let attemptCarry = 0;
mark(30, `first attempt ${(expectedDepth(derive(S), boss) * 100).toFixed(4)}% (intro beat)`);
mark(35, "systems unlock");
S.unlocked = true;

while (t < MAX_S && !broken) {
  t += STEP;

  // --- NGU waterfall: cap each bar in order, spill surplus to the next.
  // 40% of pop to zones (best HELD per-bot copper first — a squad must
  // clear the zone's gate DPS to farm it at all), rest to training
  // (2:1 atk:speed until the speed lane caps).
  {
    const B = S.bots;
    const P = derive(S); // zone squad DPS borrows player power
    const total = Math.floor(B.pop);
    // optimal play stops speed at the knee — past it returns diminish (soft
    // cap in stats.js), so copper/farm/atk win. Not a hard cap: just where a
    // greedy bot rationally stops. Harder walls raise the knee → sim invests more.
    const speedDone = B.trained.hits >= SPEED_KNEE - BASE_HPS;
    // training only gets what its unlocked bars can actually use (their
    // 50/s caps); everything else farms — NGU-optimal late game
    let trainWant = 0;
    for (let i = 0; i < B.bars.atk.unlocked; i++) trainWant += bots.capNeeded(B, `atk.${i}`, P);
    if (!speedDone) for (let i = 0; i < B.bars.speed.unlocked; i++) trainWant += bots.capNeeded(B, `speed.${i}`, P);
    // once the speed lane caps (late signal), copper outweighs training —
    // shift the swarm to the zones
    let trainBudget = Math.min(trainWant, Math.floor(total * (speedDone ? 0.25 : 0.6)));
    let farmBudget = total - trainBudget;

    B.alloc.zones.fill(0);
    const zOrder = farm.zones
      .map((z, i) => ({ i, per: (bots.botDps(B, P) / z.mobHp) * z.copper }))
      .filter(o => farm.zoneUnlocked(S.cleared?.length, o.i)) // only boss-unlocked zones
      .sort((x, y) => y.per - x.per);
    for (const o of zOrder) {
      const need = bots.gateNeeded(B, o.i, P);
      if (farmBudget < Math.max(1, need)) continue; // can't hold the gate
      const n = Math.min(farmBudget, Math.max(need, bots.capNeeded(B, `zones.${o.i}`, P)));
      B.alloc.zones[o.i] = Math.min(n, bots.capNeeded(B, `zones.${o.i}`, P));
      farmBudget -= B.alloc.zones[o.i];
    }
    trainBudget += farmBudget; // zone caps all hit → surplus trains

    let atkBudget = speedDone ? trainBudget : Math.floor(trainBudget * 0.67);
    let spdBudget = trainBudget - (speedDone ? trainBudget : atkBudget);
    B.alloc.atk.fill(0);
    for (let i = 0; i < B.bars.atk.unlocked; i++) {
      const n = Math.min(atkBudget, bots.capNeeded(B, `atk.${i}`, P));
      B.alloc.atk[i] = n;
      atkBudget -= n;
    }
    if (atkBudget > 0) B.alloc.atk[B.bars.atk.unlocked - 1] += atkBudget; // dump surplus
    B.alloc.speed.fill(0);
    if (!speedDone) {
      for (let i = 0; i < B.bars.speed.unlocked; i++) {
        const n = Math.min(spdBudget, bots.capNeeded(B, `speed.${i}`, P));
        B.alloc.speed[i] = n;
        spdBudget -= n;
      }
      if (spdBudget > 0) B.alloc.speed[B.bars.speed.unlocked - 1] += spdBudget;
    }
    B.alloc.enh = 0;
  }
  // deterministic EV in the sim: bot ticks use midpoint rng so chance
  // drops land at expected count and rolls are ignored (gear is EV'd below)
  bots.tick(S, STEP, () => {}, () => 0.5);

  // --- gear + salvage: EV of the swarm's chance drops, per zone ---
  let income = 0;
  farm.zones.forEach((z, i) => {
    const n = S.bots.alloc.zones[i];
    if (n <= 0 || !farm.zoneUnlocked(S.cleared?.length, i)) return;
    const zr = bots.botZoneRates(S.bots, i, n, derive(S));
    income += zr.copperPerSec;
    const dropsNow = zr.kps * STEP * farm.DROP_CHANCE;
    rolls[i] += dropsNow;
    // salvage yields SCRAP now; the character's copper is the dungeon delve
    // (playtest-gated, not modelled here — sim stays a conservative lower bound)
  });
  // adoption: EV best roll per slot from the RICHEST farmed zone. Adopt on
  // RAW ip gain (optimal play re-enhances; income covers the re-climb)
  let bestZi = -1;
  farm.zones.forEach((z, i) => { if (rolls[i] >= SLOTS.length && (bestZi < 0 || z.ipHi > farm.zones[bestZi].ipHi)) bestZi = i; });
  if (bestZi >= 0) {
    const z = farm.zones[bestZi];
    for (const slot of SLOTS) {
      const n = rolls[bestZi] / SLOTS.length;
      const expIp = Math.round(z.ipLo + (z.ipHi - z.ipLo) * (n / (n + 1)));
      const cur = S.gear[slot];
      if (!cur || expIp > cur.ip) {
        if (cur) S.gear.stash.push(cur);
        S.gear[slot] = { slot, ip: expIp, plus: 0, zone: bestZi + 1, name: "ev", rarity: "rare", affixes: evAffixes(expIp) };
      }
    }
  }

  // --- spend copper: rig upgrades with ≤30min payback, then enhance to +10 ---
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

  // --- attempts: hourly by hand; on cooldown once the scheduler is
  // installed (waking 16h/day); idleProc extends to sleep hours ---
  const waking = t % 86400 < 16 * 3600;
  const cycleS = cooldownMs(S) / 1000 + boss.windowS;
  let attempts = 0;
  if (waking) attempts = S.gm.scheduler ? attemptCarry + STEP / cycleS : (t % 3600 < STEP ? 1 : 0);
  else if (S.gm.idleProc) attempts = attemptCarry + STEP / cycleS;
  attemptCarry = attempts % 1;
  attempts = Math.floor(attempts);
  while (attempts-- > 0 && !broken) {
    const fresh = expectedDepth(derive(S), boss);
    const total = S.boss.scars + fresh;
    S.boss.bestDepth = Math.max(S.boss.bestDepth, Math.min(total, 1));
    S.tickets += ticketYield(Math.min(total, 1));
    if (total >= 1) {
      broken = true;
      mark(t, "W1 broken (EV)");
    } else {
      S.boss.scars = Math.min(scarCap(S), S.boss.scars + fresh * SCAR_RATE);
      if (S.boss.scars >= scarCap(S)) mark(t, "scars capped");
    }
  }
  // GM spends: unlocks first (verbs), then scar cap + session cap, then flags
  buyUnlock(S, "scheduler");
  buyUnlock(S, "idleProc");
  for (;;) { if (!buyUtility(S, "scar") && !buyUtility(S, "cap")) break; }
  for (;;) {
    const next = flagCost("dmg", S.gm.dmg) <= flagCost("haste", S.gm.haste) ? "dmg" : "haste";
    if (!buyFlag(S, next)) break;
  }

  if (process.env.SIMDBG && t % 21600 < STEP) {
    const d = derive(S);
    console.error(`t=${(t / 3600).toFixed(0)}h dps=${Math.round(dps())} atk=${Math.round(d.atk)} hits=${d.hitsPerSec.toFixed(2)} pop=${S.bots.pop.toFixed(1)} trainedAtk=${Math.round(S.bots.trained.atk)} gearIp=${SLOTS.map(sl => S.gear[sl] ? `${S.gear[sl].ip}+${S.gear[sl].plus}` : "-").join(",")} cu=${Math.round(S.copper)} tix=${Math.round(S.tickets)} scars=${S.boss.scars.toFixed(2)}`);
  }

  // --- observation milestones ---
  const mult = dps() / startDps;
  for (const m of [10, 100, 1000, 10000]) if (mult >= m) mark(t, `power ×${m}`);
  farm.zones.forEach((zz, i) => {
    if (i > 0 && S.bots.alloc.zones[i] > 0 && bots.botZoneRates(S.bots, i, S.bots.alloc.zones[i], derive(S)).held) {
      mark(t, `${zz.id} held (${zz.name})`);
    }
  });
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

// --- pacing notes (diagnostic — printed as warnings, never fatal) ---
const gates = [];
const breakM = milestones.find(m => m.desc === "W1 broken (EV)");
if (!breakM) gates.push("PACING NOTE: W1 never breaks within 10d");
else if (breakM.t < 4 * 86400 || breakM.t > 7 * 86400) gates.push(`PACING NOTE: W1 breaks at ${fmtT(breakM.t)} (target 4d–7d)`);
const x10 = milestones.find(m => m.desc === "power ×10");
if (!x10 || x10.t > 3600) gates.push(`PACING NOTE: power ×10 at ${x10 ? fmtT(x10.t) : "never"} (target ≤1h)`);
const d1 = milestones.find(m => m.desc === "depth 1%");
if (!d1 || d1.t > 86400) gates.push(`PACING NOTE: depth 1% at ${d1 ? fmtT(d1.t) : "never"} (target ≤1d)`);
// (main-character income gate retired 2026-07-22: zones are bot-only by
// design — the player's verb is the Boss, the swarm IS the economy)

const compare = process.argv.includes("--compare");
const baseUrl = new URL("./baseline.json", import.meta.url);
if (!compare) {
  for (const m of milestones) console.log(`${fmtT(m.t).padStart(8)}  ${m.desc}`);
  for (const g of gates) console.error(g); // diagnostic warnings, non-fatal
  fs.writeFileSync(baseUrl, JSON.stringify(milestones, null, 2));
  console.log("baseline.json written");
} else {
  for (const g of gates) console.error(g); // diagnostic warnings, non-fatal
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
