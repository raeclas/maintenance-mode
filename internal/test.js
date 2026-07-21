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
  assert.equal(pull.expectedDepth(d, b), 20 * 30 / 15_000_000); // 0.004% exactly
}

// Stats: gear + bars feed the one-line formula; speed hard cap
{
  const s = newState();
  s.bots.bars.atk.lvl = 10;                       // +80
  s.bots.bars.speed.lvl = 250;                    // capped at 100 → +3.0
  s.gear.weapon = { slot: "weapon", ip: 100, plus: 10, zone: 1, name: "t" }; // 200
  const d = derive(s);
  assert.equal(d.atk, 10 + 80 + 200);
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
  s.gear.weapon = { slot: "weapon", ip: 500_000, plus: 0, zone: 5, name: "t" };
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

// Bots: training scales with pop × power × speed via alloc counts
{
  const s = newState();
  s.bots.pop = 8; // at cap → no creation drift
  s.bots.alloc = { atk: 8, spd: 0, farm: 0 };
  bots.tick(s, 100); // 8 × 1.0 × 1.0 × 100 = 800 units
  let units = 800, lvl = 0;
  while (units >= bots.levelCost(lvl)) units -= bots.levelCost(lvl++);
  assert.equal(s.bots.bars.atk.lvl, lvl);
  assert.ok(Math.abs(s.bots.bars.atk.prog - units) < 1e-6);
}

// Bots: farming mails copper, bans at zone detection, creation refills
{
  const s = newState();
  s.bots.pop = 8;
  s.bots.alloc = { atk: 0, spd: 0, farm: 99 }; // over-allocated → effAlloc clamps to pop
  s.bots.farmZone = 0;
  const z1 = farm.zones[0];
  const perBot = Math.min(2, bots.botDps(s.bots) / z1.mobHp) * z1.copper; // c/s
  const expBans = 8 * z1.detection; // per hour
  bots.tick(s, 3600);
  assert.ok(Math.abs(s.copper - 8 * perBot * 3600) < 8 * perBot * 3600 * 0.01);
  assert.ok(Math.abs(s.bots.banned - expBans) < expBans * 0.2);
  assert.ok(s.bots.pop > 7.5 && s.bots.pop <= 8); // generator refills most of it
}

// Bots: offline batch ≡ live ticks (pure training, pop at cap → exact)
{
  const a = newState(), b2 = newState();
  for (const s of [a, b2]) {
    s.bots.pop = 8;
    s.bots.alloc = { atk: 4, spd: 4, farm: 0 };
    s.bots.powerRank = 2;
  }
  bots.tick(a, 43_200);                              // one 12h batch
  for (let i = 0; i < 720; i++) bots.tick(b2, 60);   // 12h of 60s ticks
  assert.equal(a.bots.bars.atk.lvl, b2.bots.bars.atk.lvl);
  assert.ok(Math.abs(a.bots.bars.atk.prog - b2.bots.bars.atk.prog) < 1e-6);
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
  bots.setAlloc(s, "farm", 990); // any number allowed; effAlloc scales to pop
  const eff = bots.effAlloc(s.bots);
  assert.ok(eff.atk + eff.spd + eff.farm <= s.bots.pop + 1e-9);
  assert.ok(eff.scale < 1);
  bots.setAlloc(s, "farm", -5); // clamped to 0, NaN-safe
  assert.equal(s.bots.alloc.farm, 0);
}

// Farm: kills/s = min(hits/s, DPS/mobHP) — SPD caps throughput, ATK one-shots
{
  const s = newState();
  s.gear.weapon = { slot: "weapon", ip: 1e6, plus: 0, zone: 5, name: "t" };
  const z = farm.zones[0];
  assert.equal(farm.killsPerSec(s, z), 2.0); // one-shotting → speed-bound at hits/s
  s.bots.bars.speed.lvl = 100;
  assert.equal(farm.killsPerSec(s, z), 5.0); // trained speed raises the farm cap
  assert.ok(farm.rateCard(s, z).speedBound);
  const weak = newState(); // ATK 10 vs 50 HP → damage-bound
  assert.equal(farm.killsPerSec(weak, z), (10 * 2) / 50);
  assert.ok(!farm.rateCard(weak, z).speedBound);
  s.bots.bars.speed.lvl = 0;
  s.farm.zone = 0;
  const drops = [];
  farm.tick(s, 100, () => 0.5, it => drops.push(it));
  assert.equal(drops.length, 1); // 200 kills / 200 per drop = exactly 1
  assert.ok(s.copper === 200 * z.copper);
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
  assert.ok(Math.abs(gear.contribution({ ip: 100, plus: 12 }) - 220) < 1e-9);

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

// Enhance: safe fail holds, risk fail −1, cost gating, max ceiling
{
  const s = newState();
  const it = { slot: "weapon", ip: 100, plus: 0, zone: 1, name: "t" };
  s.copper = 1e9;
  assert.equal(enh.attempt(s, it, () => 0.99), "success"); // +0 is 100%
  assert.equal(it.plus, 1);
}
{
  const s = newState();
  const it = { slot: "weapon", ip: 100, plus: 2, zone: 1, name: "t" };
  s.copper = 1e9;
  enh.attempt(s, it, () => 0.999); // safe fail (80% at +2)
  assert.equal(it.plus, 2);        // safe zone: holds
  it.plus = 6;
  enh.attempt(s, it, () => 0.999); // risk fail (40% at +6)
  assert.equal(it.plus, 5);        // −1
  it.plus = enh.MAX_PLUS;
  assert.equal(enh.attempt(s, it), "max");
  const poor = newState();
  assert.equal(enh.attempt(poor, { ip: 1e6, plus: 11 }, () => 0), "poor");
  assert.ok(enh.cost({ ip: 100, plus: 0 }) === 50); // 0.5 × ip
  assert.ok(enh.evCostPerIpFrom(9) > enh.evCostPerIpFrom(5)); // hitting cost climbs
}

// Save v2 round-trip + v1 backfill + durability
{
  const s = newState();
  s.unlocked = true;
  s.copper = 1234;
  s.bots.pop = 4.5;
  s.bots.capRank = 1;
  s.bots.bars.atk = { lvl: 7, prog: 11 };
  s.gear.weapon = { slot: "weapon", ip: 55, plus: 3, zone: 1, name: "t" };
  s.gear.stash = [{ slot: "charm", ip: 5, plus: 0, zone: 1, name: "u" }];
  s.farm.zone = 1;
  s.boss = { pulls: 3, bestDepth: 0.01, scars: 0.005, broken: false };
  saves.save(s);
  assert.equal(JSON.parse(localStorage.getItem("mm_save")).pull, undefined);
  const s2 = newState();
  saves.load(s2);
  assert.deepEqual(s2.bots.bars.atk, { lvl: 7, prog: 11 });
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
  assert.deepEqual(s5.bots.alloc, { atk: 1, spd: 1, farm: 0 }); // defaults

  // v3 save (alloc was % of pop) → counts
  localStorage.setItem("mm_save", JSON.stringify({ v: 3, bots: { pop: 10, alloc: { atk: 50, spd: 30, farm: 20 } } }));
  const s6 = newState();
  saves.load(s6);
  assert.deepEqual(s6.bots.alloc, { atk: 5, spd: 3, farm: 2 });

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

// Dialogue completeness: every event key the UI emits has ≥1 non-empty line
{
  for (const b of bosses) {
    for (const key of ["greet", "pullStart", "fail_hopeless", "fail_low", "fail_near", "break"]) {
      assert.ok(Array.isArray(b.dialogue[key]) && b.dialogue[key].length >= 1, `${b.id} ${key}`);
      for (const line of b.dialogue[key]) assert.ok(line.trim().length > 0, `${b.id} ${key} empty line`);
    }
  }
}

console.log("all checks passed");
