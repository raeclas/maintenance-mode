// test.js — flat node:assert harness (pattern: ../FightingInc/internal/test.js).
// Must stay green at every commit.
import assert from "node:assert/strict";

// localStorage shim for save tests
const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};

const { newState } = await import("../state.js");
const { bosses, getBoss } = await import("../bosses.js");
const pull = await import("../pull.js");
const saves = await import("../saveSystem.js");
const { derive } = await import("../stats.js");
const bots = await import("../bots.js");
const farm = await import("../farm.js");
const gear = await import("../gear.js");
const enh = await import("../enhance.js");

// Stats: formula lock at starting values (the intro beat number)
{
  const s = newState();
  const d = derive(s);
  assert.equal(d.atk, 10);
  assert.equal(d.hitsPerSec, 2.0);
  const b = getBoss(1);
  assert.equal(pull.expectedDepth(d, b), 20 * 30 / 120_000_000); // 0.0005% exactly
}

// Stats: gear + bars feed the one-line formula; speed hard cap
{
  const s = newState();
  s.bots.trained.atk = 80;
  s.bots.trained.hits = 99; // over lane cap → clamped to 5.0 total
  s.gear.weapon = { slot: "weapon", ip: 100, plus: 10, zone: 1, name: "t" }; // 100×1.12^10
  const d = derive(s);
  assert.ok(Math.abs(d.atk - (10 + 80 + 100 * Math.pow(1.12, 10))) < 1e-9);
  assert.equal(d.hitsPerSec, 5.0);
}

// Pull math: band endpoints + break chance edges (constants retuned)
{
  const s = newState();
  const b = getBoss(1);
  const d = derive(s);
  const ev = pull.expectedDepth(d, b);
  assert.ok(Math.abs(pull.rollDepth(d, b, () => 0) - ev * (1 - pull.VARIANCE)) < 1e-15);
  assert.ok(Math.abs(pull.rollDepth(d, b, () => 1) - ev * (1 + pull.VARIANCE)) < 1e-15);
  assert.equal(pull.breakChance(d, b, 0), 0);
  assert.equal(pull.breakChance({ atk: 1e9, hitsPerSec: 5 }, b, 0), 1);
  assert.equal(pull.pullsToBreakEV(d, b, 0), Infinity); // hopeless by design at start
}

// Resolve: hopeless pull → scars grow, cooldown; scars never exceed cap
{
  const s = newState();
  const t0 = 1_000_000;
  assert.ok(pull.startPull(s, t0, () => 0.5));
  const end = s.pull.endsAt;
  const fresh = s.pull.rolledFresh;
  const d = pull.resolvePull(s, end);
  assert.ok(d < 0.001 && !s.boss.broken);
  assert.ok(Math.abs(s.boss.scars - fresh * pull.SCAR_RATE) < 1e-15);
  assert.equal(s.cooldownUntil, end + pull.COOLDOWN_MS);
  s.boss.scars = pull.SCAR_CAP - 1e-9;
  s.cooldownUntil = 0;
  pull.startPull(s, end + 100_000, () => 0.5);
  pull.resolvePull(s, s.pull.endsAt);
  assert.equal(s.boss.scars, pull.SCAR_CAP);
}

// Resolve: overwhelming stats → break, no cooldown
{
  const s = newState();
  s.gear.weapon = { slot: "weapon", ip: 4_000_000, plus: 0, zone: 5, name: "t" };
  pull.startPull(s, 1_000_000, () => 0.5);
  assert.ok(!pull.pullDone(s, s.pull.startedAt + 5_000)); // rolled 2.0× → 100% mid-window
  assert.ok(pull.pullDone(s, s.pull.endsAt - 14_000));    // breaks early at 100%
  const d = pull.resolvePull(s, 1_005_000);
  assert.equal(d, 1);
  assert.ok(s.boss.broken);
  assert.equal(s.cooldownUntil, 0);
}

// Bots: population flow — creation toward server capacity
{
  const s = newState();
  assert.equal(bots.capacity(s.bots), 8);
  bots.tick(s, 3600); // +2/h
  assert.ok(Math.abs(s.bots.pop - 4) < 0.01);
  bots.tick(s, 100 * 3600);
  assert.equal(s.bots.pop, 8); // capped
}

// Bots: training — parallel bars, constant cost per fill, per-bar rate cap
{
  const s = newState();
  s.bots.pop = 8; // at cap → no creation drift
  s.bots.alloc.atk = [4, 0, 0, 0];
  s.bots.alloc.speed = [0, 0, 0];
  const t1 = bots.TRAININGS.atk[0];
  bots.tick(s, 100); // 4 units/s × 100s = 400 units on tier 0 only
  const fills = s.bots.bars.atk.fills[0];
  assert.ok(fills > 0);
  assert.ok(Math.abs(s.bots.trained.atk - fills * t1.gain) < 1e-9);

  // parallel: two tiers tick simultaneously, each from its own squad
  const sp = newState();
  sp.bots.pop = 8;
  sp.bots.bars.atk.unlocked = 2;
  sp.bots.alloc.atk = [2, 6, 0, 0];
  sp.bots.alloc.speed = [0, 0, 0];
  bots.tick(sp, 1000);
  assert.ok(sp.bots.bars.atk.fills[0] > 0 && sp.bots.bars.atk.fills[1] > 0);

  // rate cap: a monster squad can't exceed MAX_FILLS_PER_S per bar
  const s2 = newState();
  s2.bots.pop = 8;
  s2.bots.powerRank = 1000; // absurd quality
  s2.bots.alloc.atk = [8, 0, 0, 0];
  s2.bots.alloc.speed = [0, 0, 0];
  bots.tick(s2, 100);
  assert.ok(s2.bots.bars.atk.fills[0] <= 100 * bots.MAX_FILLS_PER_S + 1);

  // capNeeded: exactly enough bots for the bar's ceiling
  const need = bots.capNeeded(s2.bots, "atk.0");
  assert.equal(need, Math.ceil(t1.cost * bots.MAX_FILLS_PER_S / (bots.botPower(s2.bots) * bots.botSpeed(s2.bots))));

  // tier unlock at UNLOCK_FILLS
  const s3 = newState();
  s3.bots.pop = 8;
  s3.bots.alloc.atk = [8, 0, 0, 0];
  s3.bots.alloc.speed = [0, 0, 0];
  s3.bots.bars.atk.fills[0] = bots.UNLOCK_FILLS - 1;
  bots.tick(s3, 60);
  assert.equal(s3.bots.bars.atk.unlocked, 2);

  // speed lane cap: gains stop at SPEED_TRAIN_CAP
  const s4 = newState();
  s4.bots.pop = 8;
  s4.bots.alloc.atk = [0, 0, 0, 0];
  s4.bots.alloc.speed = [8, 0, 0];
  s4.bots.trained.hits = bots.SPEED_TRAIN_CAP;
  bots.tick(s4, 10_000);
  assert.equal(s4.bots.trained.hits, bots.SPEED_TRAIN_CAP);
  assert.equal(s4.bots.bars.speed.fills[0], 0); // capped lane doesn't churn fills
}

// Bots: per-zone squads farm in parallel, bans drain per zone's detection
{
  const s = newState();
  s.bots.pop = 8;
  s.bots.alloc.atk = [0, 0, 0, 0];
  s.bots.alloc.speed = [0, 0, 0];
  s.bots.alloc.zones = [5, 3, 0, 0, 0];
  const z1 = farm.zones[0], z2 = farm.zones[1];
  const cps = bots.botZoneRates(s.bots, 0, 5).copperPerSec + bots.botZoneRates(s.bots, 1, 3).copperPerSec;
  const expBans = 5 * z1.detection + 3 * z2.detection; // per hour
  bots.tick(s, 3600);
  assert.ok(Math.abs(s.copper - cps * 3600) < cps * 3600 * 0.02);
  assert.ok(Math.abs(s.bots.banned - expBans) < expBans * 0.25);
  assert.ok(s.bots.pop > 7 && s.bots.pop <= 8); // generator refills most of it
  // zone kill rate caps at 50/s no matter the squad
  assert.ok(bots.botZoneRates(s.bots, 0, 1e6).kps === 50);
}

// Bots: offline batch ≡ live ticks (pure training, pop at cap → exact)
{
  const a = newState(), b2 = newState();
  for (const s of [a, b2]) {
    s.bots.pop = 8;
    s.bots.alloc.atk = [4, 0, 0, 0];
    s.bots.alloc.speed = [4, 0, 0];
    s.bots.powerRank = 2;
  }
  bots.tick(a, 43_200);                              // one 12h batch
  for (let i = 0; i < 720; i++) bots.tick(b2, 60);   // 12h of 60s ticks
  assert.equal(a.bots.trained.atk, b2.bots.trained.atk);
  assert.ok(Math.abs(a.bots.bars.atk.prog[0] - b2.bots.bars.atk.prog[0]) < 1e-6);
}

// Bots: rig purchases + alloc clamping
{
  const s = newState();
  s.copper = 10_000;
  assert.ok(bots.buy(s, "cap") && bots.capacity(s.bots) === 12);
  assert.ok(bots.buy(s, "create") && bots.createRate(s.bots) === 3);
  assert.ok(bots.buy(s, "power") && bots.botPower(s.bots) === 1.25);
  assert.ok(bots.buy(s, "speed") && bots.botSpeed(s.bots) === 1.2);
  s.copper = 0;
  assert.equal(bots.buy(s, "cap"), false);
  s.bots.pop = 10;
  s.bots.alloc.atk = [3, 0, 0, 0];
  s.bots.alloc.speed = [0, 0, 0];
  bots.setAlloc(s, "zones.2", 990); // hard-clamped to available bots
  assert.equal(s.bots.alloc.zones[2], 7);
  bots.setAlloc(s, "zones.2", -5); // clamped to 0, NaN-safe
  assert.equal(s.bots.alloc.zones[2], 0);
  assert.equal(bots.freeBots(s.bots), 7);
  // bans dragging pop below committed numbers: effScale shrinks everything
  s.bots.alloc.atk = [6, 0, 0, 0];
  s.bots.alloc.zones = [4, 0, 0, 0, 0];
  s.bots.pop = 5;
  assert.ok(bots.effScale(s.bots) === 0.5);
}

// Farm: kills/s = min(50, DPS/mobHP) — NGU-style universal rate ceiling
{
  const s = newState();
  s.gear.weapon = { slot: "weapon", ip: 1e6, plus: 0, zone: 5, name: "t" };
  const z = farm.zones[0];
  assert.equal(farm.killsPerSec(s, z), farm.KILL_CAP); // monster DPS → capped at 50
  assert.ok(farm.rateCard(s, z).capBound);
  const weak = newState(); // DPS 20 vs 50 HP → DPS-bound
  assert.equal(farm.killsPerSec(weak, z), (10 * 2) / 50);
  assert.ok(!farm.rateCard(weak, z).capBound);
  s.farm.zone = 0;
  const drops = [];
  farm.tick(s, 100, () => 0.5, it => drops.push(it));
  assert.equal(drops.length, Math.floor(50 * 100 / farm.DROP_PER_KILLS)); // capped kills → rolls
  assert.ok(s.copper === 5000 * z.copper);
  const s2 = newState();
  s2.farm.zone = 4; // gate 32k, DPS 20 → gated, nothing happens
  farm.tick(s2, 1000);
  assert.equal(s2.copper, 0);
}

// Gear: roll bands, auto-equip stashes loser, lock/salvage discipline
{
  const s = newState();
  const item = gear.rollItem(farm.zones[0], 0, () => 0.999);
  assert.ok(item.ip <= 30 && item.ip >= 10);
  assert.ok(gear.autoEquip(s, { slot: "weapon", ip: 20, plus: 0, zone: 1, name: "a" }).equipped);
  assert.ok(!gear.autoEquip(s, { slot: "weapon", ip: 10, plus: 0, zone: 1, name: "b" }).equipped); // worse → stash
  assert.equal(s.gear.stash.length, 1);
  assert.ok(gear.autoEquip(s, { slot: "weapon", ip: 50, plus: 0, zone: 1, name: "c" }).equipped);
  assert.equal(s.gear.stash.length, 2); // old weapon stashed, never deleted below cap
  assert.ok(gear.equipFromStash(s, 0));
  assert.equal(s.gear.stash.length, 2); // swap, total conserved
  assert.ok(Math.abs(gear.contribution({ ip: 100, plus: 12 }) - 100 * Math.pow(1.12, 12)) < 1e-9);

  // autoSalvage: non-upgrade decomposes straight to copper
  s.gear.autoSalvage = true;
  const c0 = s.copper;
  const r = gear.autoEquip(s, { slot: "weapon", ip: 4, plus: 0, zone: 1, name: "d" });
  assert.ok(r.salvaged && !r.equipped);
  assert.equal(s.copper, c0 + gear.salvageValue({ ip: 4 }));
  assert.equal(s.gear.stash.length, 2); // never reached the stash
  s.gear.autoSalvage = false;

  // stash cap: overflow decomposes the WORST unlocked item; locked immune
  s.gear.stash = [];
  s.gear.stash.push({ slot: "charm", ip: 1, plus: 0, zone: 1, name: "worst", lock: true });
  for (let i = 0; i < gear.STASH_CAP - 1; i++) {
    s.gear.stash.push({ slot: "charm", ip: 100 + i, plus: 0, zone: 1, name: `f${i}` });
  }
  assert.equal(s.gear.stash.length, gear.STASH_CAP);
  const r2 = gear.autoEquip(s, { slot: "charm", ip: 2, plus: 0, zone: 1, name: "junk" }); // worse than equipped? no charm equipped → equips!
  assert.ok(r2.equipped); // first charm equips
  const r3 = gear.autoEquip(s, { slot: "charm", ip: 1.5, plus: 0, zone: 1, name: "junk2" }); // worse → stash → overflow
  assert.ok(!r3.equipped && r3.overflow);
  assert.equal(s.gear.stash.length, gear.STASH_CAP);
  assert.equal(r3.overflow.name, "junk2"); // junk2 itself is the worst unlocked
  assert.ok(s.gear.stash.some(it => it.name === "worst")); // locked ip-1 item survives
}

// Enhance: zones, checkpoint falls, failstacks, safeguard, cost gating
{
  const s = newState();
  const it = { slot: "weapon", ip: 100, plus: 0, zone: 1, name: "t" };
  s.copper = 1e9;
  assert.equal(enh.attempt(s, it, () => 0.99), "success"); // +0 is 100%
  assert.equal(it.plus, 1);
  assert.equal(s.failstacks, 0);
}
{
  const s = newState();
  const it = { slot: "weapon", ip: 100, plus: 2, zone: 1, name: "t" };
  s.copper = 1e9;
  enh.attempt(s, it, () => 0.999); // safe fail (80% at +2)
  assert.equal(it.plus, 2);        // safe zone: plus holds…
  assert.equal(s.failstacks, 1);   // …but the stack banks
  it.plus = 6;
  enh.attempt(s, it, () => 0.999); // risk fail
  assert.equal(it.plus, 5);        // −1
  assert.equal(s.failstacks, 2);

  // nightmare falls land on the checkpoint
  it.plus = 14;
  enh.attempt(s, it, () => 0.999);
  assert.equal(it.plus, 10);       // +14 fail → +10
  it.plus = 17;
  enh.attempt(s, it, () => 0.999);
  assert.equal(it.plus, 15);       // +17 fail → +15
  assert.equal(s.failstacks, 4);

  // stacks boost chance (capped) and success consumes the whole bank
  s.failstacks = 40;
  assert.ok(Math.abs(enh.chance(12, 40) - (0.15 + enh.STACK_CAP_PTS / 100)) < 1e-12); // capped at +15pts
  it.plus = 12;
  assert.equal(enh.attempt(s, it, () => 0.29), "success"); // 30% with capped stacks
  assert.equal(it.plus, 13);
  assert.equal(s.failstacks, 0); // bank spent

  // safeguard: 3× cost, fail keeps the plus; locked above +15
  it.plus = 8;
  const c8 = enh.cost(it), before = s.copper;
  enh.attempt(s, it, () => 0.999, true);
  assert.equal(it.plus, 8);                    // no drop
  assert.equal(before - s.copper, c8 * 3);     // 3× price
  assert.ok(enh.canSafeguard(14) && !enh.canSafeguard(15)); // +16 target = nightmare proper
  it.plus = 16;
  enh.attempt(s, it, () => 0.999, true);       // safeguard ignored above the lock
  assert.equal(it.plus, 15);                   // fell to checkpoint anyway

  it.plus = enh.MAX_PLUS;
  assert.equal(enh.attempt(s, it), "max");
  const poor = newState();
  assert.equal(enh.attempt(poor, { ip: 1e6, plus: 11 }, () => 0), "poor");
  assert.ok(enh.cost({ ip: 100, plus: 0 }) === 50); // 0.5 × ip
  assert.ok(enh.evCostPerIpFrom(9) > enh.evCostPerIpFrom(5));   // hitting cost climbs
  assert.ok(enh.evCostPerIpFrom(17) > enh.evCostPerIpFrom(12)); // deep nightmare explodes (falls re-climb from +15)
  // note: evCost(15) is CHEAP — +15 is a checkpoint, pushing +16 risks only copper
}

// Save v2 round-trip + v1 backfill + durability
{
  const s = newState();
  s.unlocked = true;
  s.copper = 1234;
  s.bots.pop = 4.5;
  s.bots.capRank = 1;
  s.bots.trained.atk = 56;
  s.bots.bars.atk = { fills: [50, 3, 0, 0], prog: [11, 4, 0, 0], unlocked: 2 };
  s.bots.alloc.atk = [2, 1, 0, 0];
  s.bots.alloc.zones = [0, 1, 0, 0, 0];
  s.tickets = 77;
  s.gm.scar = 2;
  s.gear.weapon = { slot: "weapon", ip: 55, plus: 3, zone: 1, name: "t" };
  s.gear.stash = [{ slot: "charm", ip: 5, plus: 0, zone: 1, name: "u" }];
  s.farm.zone = 1;
  s.boss = { pulls: 3, bestDepth: 0.01, scars: 0.005, broken: false, nearSaid: false };
  saves.save(s);
  assert.equal(JSON.parse(localStorage.getItem("mm_save")).pull, undefined);
  const s2 = newState();
  saves.load(s2);
  assert.deepEqual(s2.bots.bars.atk, { fills: [50, 3, 0, 0], prog: [11, 4, 0, 0], unlocked: 2 });
  assert.deepEqual(s2.bots.alloc.atk, [2, 1, 0, 0]);
  assert.deepEqual(s2.bots.alloc.zones, [0, 1, 0, 0, 0]);
  assert.equal(s2.bots.trained.atk, 56);
  assert.equal(s2.tickets, 77);
  assert.equal(s2.gm.scar, 2);
  assert.equal(s2.bots.pop, 4.5);
  assert.equal(s2.bots.capRank, 1);
  assert.equal(s2.copper, 1234);
  assert.equal(s2.gear.weapon.ip, 55);
  assert.equal(s2.gear.stash.length, 1);
  assert.equal(s2.farm.zone, 1);
  assert.deepEqual(s2.boss, s.boss);

  // v1 save (pre-bots, had player field): backfills, keeps siege progress, unlocks
  localStorage.setItem("mm_save", JSON.stringify({ v: 1, player: { atk: 10 }, boss: { pulls: 5, scars: 0.2 } }));
  const s3 = newState();
  saves.load(s3);
  assert.equal(s3.bots.pop, 2);
  assert.equal(s3.boss.scars, 0.2);
  assert.equal(s3.unlocked, true); // mid-siege v1 save keeps systems open

  // v2 save (discrete accounts): count → pop; alloc falls back to defaults
  localStorage.setItem("mm_save", JSON.stringify({ v: 2, bots: { count: 5, assign: { atk: 3, speed: 2 }, powerRank: 1 } }));
  const s5 = newState();
  saves.load(s5);
  assert.equal(s5.bots.pop, 5);
  assert.equal(s5.bots.powerRank, 1);
  assert.equal(s5.bots.assign, undefined); // v2 field dropped
  assert.deepEqual(s5.bots.alloc.atk, [1, 0, 0, 0]); // defaults

  // v4 save (quadratic bars): lvl converts to trained stats, tiers reset
  localStorage.setItem("mm_save", JSON.stringify({ v: 4, bots: { pop: 6, bars: { atk: { lvl: 20, prog: 5 }, speed: { lvl: 150, prog: 5 } } } }));
  const s7 = newState();
  saves.load(s7);
  assert.equal(s7.bots.trained.atk, 160);       // 8 × 20
  assert.equal(s7.bots.trained.hits, 3.0);      // 0.03 × min(150,100), capped
  assert.deepEqual(s7.bots.bars.atk.fills, [0, 0, 0, 0]); // fresh bar state

  // v6 save (scalar alloc + single-active-tier bars) → vectors, history kept
  localStorage.setItem("mm_save", JSON.stringify({
    v: 6,
    bots: {
      pop: 10, farmZone: 2,
      alloc: { atk: 3, spd: 2, farm: 4, enh: 1 },
      bars: { atk: { tier: 1, fills: [9, 1, 0, 0], prog: 5, unlocked: 2 }, speed: { tier: 0, fills: [2, 0, 0], prog: 1, unlocked: 1 } },
      trained: { atk: 12, hits: 0.5 },
    },
  }));
  const s6 = newState();
  saves.load(s6);
  assert.deepEqual(s6.bots.alloc.atk, [3, 0, 0, 0]);
  assert.deepEqual(s6.bots.alloc.speed, [2, 0, 0]);
  assert.deepEqual(s6.bots.alloc.zones, [0, 0, 4, 0, 0]); // farm squad landed on its old zone
  assert.equal(s6.bots.alloc.enh, 1);
  assert.deepEqual(s6.bots.bars.atk.fills, [9, 1, 0, 0]); // history kept
  assert.equal(s6.bots.bars.atk.unlocked, 2);
  assert.equal(s6.bots.trained.atk, 12);

  // durability: corrupt primary → quarantined, _bak restores
  saves.save(s);
  localStorage.setItem("mm_save_bak", localStorage.getItem("mm_save"));
  localStorage.setItem("mm_save", "{corrupt garbage");
  const s4 = newState();
  assert.ok(saves.load(s4));
  assert.equal(s4.copper, 1234);
  assert.equal(localStorage.getItem("mm_save_corrupt"), "{corrupt garbage");
  saves.wipe();
  assert.equal(localStorage.getItem("mm_save"), null);
  assert.equal(localStorage.getItem("mm_save_bak"), null);
  assert.equal(localStorage.getItem("mm_save_corrupt"), null);
  assert.equal(saves.validSave(null), false);
  assert.equal(saves.importSave("not json"), false);
}

// GM tab: flags (era-priced, uncapped), unlocks (one-time), utility (rank caps)
{
  const gm = await import("../gm.js");
  const s = newState();
  s.tickets = 1e9;

  // utility: hard rank caps (law 1)
  while (gm.buyUtility(s, "scar"));
  assert.equal(s.gm.scar, gm.UTILITY.scar.max);
  assert.ok(Math.abs(pull.scarCap(s) - (pull.SCAR_CAP + 0.03)) < 1e-12);
  while (gm.buyUtility(s, "cooldown"));
  assert.equal(pull.cooldownMs(s), 30_000); // 60s − 6×5s
  while (gm.buyUtility(s, "offline"));
  assert.equal(farm.offlineCapS(s), (12 + 6) * 3600);
  while (gm.buyUtility(s, "cap"));
  assert.equal(bots.capacity(s.bots, s.gm.cap), 8 + 20); // +2 × 10 ranks

  // flags: uncapped, era-priced, multipliers displayed in derive
  assert.ok(gm.buyFlag(s, "dmg") && s.gm.dmg === 1);
  assert.equal(gm.flagCost("dmg", 10), Math.round(60 * Math.pow(2, 10)));
  s.gm.dmg = 5; s.gm.haste = 5;
  assert.ok(Math.abs(gm.gmDmgMult(s) - 1.2) < 1e-12);
  assert.ok(Math.abs(gm.gmHasteMult(s) - 1.1) < 1e-12);
  const base = newState();
  const withGm = newState();
  withGm.gm.dmg = 5; withGm.gm.haste = 5;
  assert.ok(Math.abs(derive(withGm).atk - derive(base).atk * 1.2) < 1e-9);
  assert.ok(Math.abs(derive(withGm).hitsPerSec - derive(base).hitsPerSec * 1.1) < 1e-9);

  // unlocks: one-time
  assert.ok(gm.buyUnlock(s, "scheduler"));
  assert.equal(gm.buyUnlock(s, "scheduler"), false); // already installed
  assert.ok(gm.buyUnlock(s, "idleProc"));

  const poor = newState();
  assert.equal(gm.buyFlag(poor, "dmg"), false);
  assert.equal(gm.buyUnlock(poor, "scheduler"), false);
  assert.equal(gm.ticketYield(0.0000001), 1); // hopeless attempts still pay 1
  assert.equal(gm.ticketYield(0.25), 75);     // 150 × √0.25
}

// Idle encounter processing: clamped attempts, real rolls, tickets flow
{
  const s = newState();
  s.gm.idleProc = true;
  s.gear.weapon = { slot: "weapon", ip: 500, plus: 0, zone: 1, name: "t" };
  const t0 = s.tickets;
  const r = pull.processIdleAttempts(s, 4 * 3600, () => 0.5); // 4h, EV rolls
  assert.ok(r.attempts >= 1 && r.attempts <= Math.floor(4 * 3600 / (60 + 30)));
  assert.equal(s.boss.pulls, r.attempts);
  assert.ok(s.tickets > t0);
  assert.ok(s.boss.scars > 0);
}

// Dialogue completeness: every event key the UI emits has ≥1 non-empty line
{
  for (const b of bosses) {
    for (const key of ["greet", "fail_hopeless", "fail_near", "break"]) {
      assert.ok(Array.isArray(b.dialogue[key]) && b.dialogue[key].length >= 1, `${b.id} ${key}`);
      for (const line of b.dialogue[key]) assert.ok(line.trim().length > 0, `${b.id} ${key} empty line`);
    }
  }
}

// Bot enhance: real odds/copper, exponential time per plus, stops at target
{
  const s = newState();
  s.bots.pop = 8;
  s.bots.alloc.atk = [0, 0, 0, 0];
  s.bots.alloc.speed = [0, 0, 0];
  s.bots.alloc.enh = 8;
  s.bots.enhTarget = { slot: "weapon", plus: 5 };
  s.gear.weapon = { slot: "weapon", ip: 100, plus: 0, zone: 1, name: "t" };
  s.copper = 1e9;
  // interval at +0: 30 × 1.3^0 / 8 = 3.75s; Σ to +5 ≈ 33.9s with always-success rng
  bots.tick(s, 40, () => {}, () => 0);
  assert.equal(s.gear.weapon.plus, 5);
  const c = s.copper;
  bots.tick(s, 600, () => {}, () => 0); // at target → no further attempts, no spend
  assert.equal(s.gear.weapon.plus, 5);
  assert.equal(s.copper, c);
  // broke: attempts stop cleanly instead of looping
  s.bots.enhTarget.plus = 12;
  s.copper = 0;
  bots.tick(s, 600, () => {}, () => 0);
  assert.equal(s.gear.weapon.plus, 5);
}

console.log("all checks passed");
