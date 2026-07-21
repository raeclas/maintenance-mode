// sim.js — deterministic EV sim / balance drift tracker.
//
//   node internal/sim.js            print milestones, write baseline.json
//   node internal/sim.js --compare  diff vs baseline.json, exit 1 if any
//                                   milestone drifted more than 25%
//
// Imports the REAL game modules; computes nothing pull.js can compute.
// All randomness replaced with expected value (break chance is analytic).
// When growth systems land (enhance/gear/levels), this grows a plan[] of
// steps like ../FightingInc/internal/sim.js — pullUntilBroken never changes.
import fs from "node:fs";
import { newState } from "../state.js";
import { getBoss } from "../bosses.js";
import { expectedDepth, breakChance, pullsToBreakEV, SCAR_CAP, SCAR_RATE, COOLDOWN_MS } from "../pull.js";

const S = newState();
const boss = getBoss(S.wall);
const ev = expectedDepth(S.player, boss);
const n = pullsToBreakEV(S.player, boss, 0);
const pAtCap = breakChance(S.player, boss, SCAR_CAP);

const milestones = [];
// numbers live in desc: a balance edit shows as MISSING+NEW (counts as drift)
milestones.push({ t: 0, desc: `W1 EV fresh ${(ev * 100).toFixed(1)}%/pull, scars ${SCAR_RATE * 100}% rate / ${SCAR_CAP * 100}% cap, break at cap ${(pAtCap * 100).toFixed(1)}%` });
milestones.push({ t: Math.round(boss.windowS), desc: "W1 first pull resolved" });
milestones.push({
  t: Math.round(n * boss.windowS + (n - 1) * COOLDOWN_MS / 1000),
  desc: `W1 broken (EV, pull ${n})`,
});

function fmtT(t) {
  if (t < 60) return `${t}s`;
  if (t < 3600) return `${(t / 60).toFixed(1)}m`;
  if (t < 86400) return `${(t / 3600).toFixed(1)}h`;
  return `${(t / 86400).toFixed(1)}d`;
}

const compare = process.argv.includes("--compare");
const baseUrl = new URL("./baseline.json", import.meta.url);
if (!compare) {
  for (const m of milestones) console.log(`${fmtT(m.t).padStart(8)}  ${m.desc}`);
  fs.writeFileSync(baseUrl, JSON.stringify(milestones, null, 2));
  console.log("baseline.json written");
} else {
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
  for (const [key, t] of nowMap) {
    const old = baseMap.get(key);
    if (old === undefined) { console.log(`     NEW  ${key} @ ${fmtT(t)}`); drifted++; continue; }
    const pct = old === 0 ? 0 : ((t - old) / old) * 100;
    const flag = Math.abs(pct) > 25 ? " <<< DRIFT" : "";
    if (Math.abs(pct) > 1 || flag) {
      console.log(`${fmtT(t).padStart(8)}  ${key} (${pct.toFixed(0)}% vs baseline)${flag}`);
      if (flag) drifted++;
    }
  }
  for (const key of baseMap.keys()) {
    if (!nowMap.has(key)) { console.log(` MISSING  ${key}`); drifted++; }
  }
  console.log(drifted ? `${drifted} drifted` : "no significant drift");
  process.exit(drifted ? 1 : 0);
}
