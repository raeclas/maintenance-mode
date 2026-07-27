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
const { derive, softHits } = await import("../stats.js");
const bots = await import("../bots.js");
const farm = await import("../farm.js");
const gear = await import("../gear.js");
const rarity = await import("../rarity.js");
const affixes = await import("../affixes.js");
const rebirth = await import("../rebirth.js");
const trophies = await import("../trophies.js");
const dungeon = await import("../dungeon.js");
const enh = await import("../enhance.js");
const armory = await import("../armory.js");
const crits = await import("../crits.js");
const inst = await import("../instance.js");
const seq = (...v) => { let i = 0; return () => v[i++ % v.length]; }; // scripted rng

// Stats: formula lock — base CP folds in the ×1.16 crit factor
{
  const s = newState();
  const d = derive(s);
  assert.ok(Math.abs(d.atk - 10 * crits.critFactor(crits.BASE)) < 1e-9); // 11.6
  assert.equal(d.hitsPerSec, 2.0);
  // arrival is overwhelming: time-to-breach is enormous at base CP
  assert.ok(pull.timeToKill(s) > 86400 * 100); // > 100 days
}

// Stats: gear + bars feed the one-line formula; speed SOFT cap (no hard cap)
{
  const s = newState();
  s.bots.trained.atk = 80;
  s.bots.trained.hits = 99; // raw 101 hits — soft cap, NOT clamped to 5.0
  s.gear.weapon = { slot: "weapon", ip: 100, plus: 10, zone: 1, name: "t" }; // 100×1.12^10
  const d = derive(s);
  assert.ok(Math.abs(d.atk - (10 + 80 + 100 * Math.pow(1.12, 10)) * crits.critFactor(crits.critStats(s))) < 1e-6);
  // above the knee (5.0), diminishing but well past the old 5.0 wall
  assert.ok(Math.abs(d.hitsPerSec - softHits(2.0 + 99)) < 1e-9);
  assert.ok(d.hitsPerSec > 5.0); // the point: never hard-capped
}

// Crits: two-tier cascade folds into the CP factor; rollHit tiers
{
  const cs = { rate: 0.10, superRate: 0.20, critMult: 2, superMult: 5 };
  assert.ok(Math.abs(crits.critFactor(cs) - 1.16) < 1e-12);
  assert.equal(crits.rollHit(100, cs, () => 0.99).tier, 0);        // no crit
  assert.equal(crits.rollHit(100, cs, seq(0.05, 0.99)).tier, 1);   // crit, no super
  assert.equal(crits.rollHit(100, cs, seq(0.05, 0.05)).tier, 2);   // crit + super
}

// Crit affixes raise critStats (the improvable stat behind the chase)
{
  const s = newState();
  s.gear.weapon = { slot: "weapon", ip: 100, plus: 0, zone: 1, name: "t",
    affixes: [{ id: "critRate", tier: 1, value: 15 }, { id: "critDmg", tier: 1, value: 50 }] };
  const cs = crits.critStats(s);
  assert.ok(Math.abs(cs.rate - 0.25) < 1e-9);     // 0.10 + 0.15
  assert.ok(Math.abs(cs.critMult - 2.5) < 1e-9);  // 2 + 0.50
  assert.ok(Math.abs(cs.superMult - 5.5) < 1e-9);
}

// Drain: HP falls at Combat Power; break at 0, clamped
{
  const s = newState();
  const cp = pull.combatPower(s);
  const before = s.boss.hp;
  const r = pull.drain(s, 10);
  assert.ok(Math.abs(r.dealt - cp * 10) < 1e-3);
  assert.ok(Math.abs(s.boss.hp - (before - cp * 10)) < 1e-3);
  assert.ok(!r.broke && !s.boss.broken);
  s.boss.hp = cp * 5;                       // enough time → break
  const r2 = pull.drain(s, 100);
  assert.equal(s.boss.hp, 0);
  assert.ok(r2.broke && s.boss.broken);
  assert.ok(Math.abs(r2.dealt - cp * 5) < 1e-3); // only what remained
}

// Broken Warden: no drain; farmTick rolls set pieces on the interval
{
  const s = newState();
  s.boss.broken = true;
  assert.equal(pull.drain(s, 100).dealt, 0);
  const f = pull.farmTick(s, pull.FARM_INTERVAL * 3 + 1); // 3 farm kills
  assert.equal(f.rolls, 3);
}

// timeToKill: hp / CP; null when broken
{
  const s = newState();
  assert.ok(Math.abs(pull.timeToKill(s) - s.boss.hp / pull.combatPower(s)) < 1e-3);
  s.boss.broken = true;
  assert.equal(pull.timeToKill(s), null);
}

// Bots: population flow — creation toward server capacity
{
  const s = newState();
  assert.equal(bots.capacity(s.bots), bots.CAP_BASE); // 40
  bots.tick(s, 100 * 3600);
  assert.equal(s.bots.pop, bots.CAP_BASE); // fills to cap
  assert.ok(bots.createRate(s.bots) >= 60); // fast base generation — no dead-wait
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
  const need = bots.capNeeded(s2.bots, "atk.0", derive(s2));
  assert.equal(need, Math.ceil(t1.cost * bots.MAX_FILLS_PER_S / (bots.botPower(s2.bots) * bots.botSpeed(s2.bots))));

  // tier unlock at UNLOCK_FILLS
  const s3 = newState();
  s3.bots.pop = 8;
  s3.bots.alloc.atk = [8, 0, 0, 0];
  s3.bots.alloc.speed = [0, 0, 0];
  s3.bots.bars.atk.fills[0] = bots.UNLOCK_FILLS - 1;
  bots.tick(s3, 60);
  assert.equal(s3.bots.bars.atk.unlocked, 2);

  // speed lane: NO hard cap — training keeps gaining past the old 5.0 wall
  const s4 = newState();
  s4.bots.pop = 8;
  s4.bots.alloc.atk = [0, 0, 0, 0];
  s4.bots.alloc.speed = [8, 0, 0];
  s4.bots.trained.hits = 3.0; // already at the old cap
  bots.tick(s4, 10_000);
  assert.ok(s4.bots.trained.hits > 3.0);       // keeps climbing, never capped
  assert.ok(s4.bots.bars.speed.fills[0] > 0);  // lane still churns fills
}

// Bots: per-zone squads, squad-DPS gates, chance drops. Grinding NEVER bans —
// the Dungeon is the swarm's only sink.
{
  const s = newState();
  s.bots.pop = 8;
  s.bots.alloc.atk = [0, 0, 0, 0];
  s.bots.alloc.speed = [0, 0, 0];
  s.bots.alloc.zones = [5, 3, 0, 0, 0];
  const z1 = farm.zones[0];
  const p = derive(s); // squad DPS = n × botDps(b, player)
  const perBot = bots.botDps(s.bots, p);
  // z2 gate 120: 3 bots can't clear it (per-bot DPS ≪ gate) → squad can't hold
  const r2 = bots.botZoneRates(s.bots, 1, 3, p);
  assert.ok(3 * perBot < farm.zones[1].gate);
  assert.ok(!r2.held && r2.kps === 0);
  assert.equal(bots.gateNeeded(s.bots, 1, p), Math.ceil(farm.zones[1].gate / perBot));
  const r1 = bots.botZoneRates(s.bots, 0, 5, p); // held: gate 0
  assert.ok(r1.held);
  const pop0 = s.bots.pop;
  const drops = [];
  bots.tick(s, 3600, (kind, item) => { if (kind === "drop") drops.push(item); }, () => 0.99);
  assert.ok(Math.abs(s.copper - r1.copperPerSec * 3600) < r1.copperPerSec * 3600 * 0.02);
  assert.equal(s.bots.banned, 0);        // an hour of grinding costs zero accounts
  assert.ok(s.bots.pop >= pop0);         // the swarm only grows out here
  // rng 0.99: only whole expected drops materialize — np/chunk = 5×60/400 = 0.75 → 0
  assert.equal(drops.length, 0);
  const s2 = newState();
  s2.bots.pop = 8;
  s2.bots.alloc.atk = [0, 0, 0, 0];
  s2.bots.alloc.speed = [0, 0, 0];
  s2.bots.alloc.zones = [5, 0, 0, 0, 0];
  const drops2 = [];
  bots.tick(s2, 3600, (kind, item) => { if (kind === "drop") drops2.push(item); }, () => 0);
  assert.equal(drops2.length, 60); // rng 0 → remainder always lands: 1 per 60s chunk
  assert.ok(drops2[0].ip >= z1.ipLo && drops2[0].ip <= z1.ipHi);
  // zone kill rate caps at 50/s no matter the squad
  assert.ok(bots.botZoneRates(s.bots, 0, 1e6, p).kps === 50);
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
  assert.ok(bots.buy(s, "cap") && bots.capacity(s.bots) === Math.round(bots.CAP_BASE * bots.CAP_GROWTH));
  assert.ok(bots.buy(s, "create") && bots.createRate(s.bots) === bots.CREATE_PER_H * 1.5);
  assert.ok(bots.buy(s, "power") && bots.botPower(s.bots) === 1.25);
  assert.ok(bots.buy(s, "speed") && bots.botSpeed(s.bots) === 1.2);
  s.copper = 0;
  assert.equal(bots.buy(s, "cap"), false);
  s.bots.pop = 10;
  s.bots.alloc.atk = [3, 0, 0, 0];
  s.bots.alloc.speed = [0, 0, 0];
  // The script ladders take allocation on their UNLOCKED tiers and refuse it
  // on locked ones. Untested until 2026-07-26, when the lock gate read the
  // bars from bots.atk instead of bots.bars.atk and silently rejected every
  // training allocation in the game — the Training tab stopped taking input
  // and every existing assertion still passed.
  s.bots.alloc.atk = [0, 0, 0, 0, 0, 0, 0];
  bots.setAlloc(s, "atk.0", 2);            // tier 0 ships unlocked
  assert.equal(s.bots.alloc.atk[0], 2);
  bots.setAlloc(s, "atk.3", 2);            // tier 3 is not unlocked yet
  assert.equal(s.bots.alloc.atk[3], 0);
  s.bots.bars.atk.unlocked = 4;            // unlock it, same call now lands
  bots.setAlloc(s, "atk.3", 2);
  assert.equal(s.bots.alloc.atk[3], 2);
  s.bots.alloc.atk = [3, 0, 0, 0, 0, 0, 0];

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

// Zone gating: unlocked by BOSS progress, not squad DPS (coupling killed the
// DPS gate). Region 1 always; region 2 after W1; region 3 after W4.
{
  assert.ok(farm.zoneUnlocked(0, 0));    // z1 open from the start
  assert.ok(!farm.zoneUnlocked(0, 5));   // z6 locked until a wall falls
  assert.ok(farm.zoneUnlocked(1, 5));    // z6 opens after W1
  assert.ok(!farm.zoneUnlocked(3, 10));  // z11 needs 4 clears
  assert.ok(farm.zoneUnlocked(4, 14));   // z15 opens after W4
}

// Overkill Saturation: surplus squad DPS past the kill-cap biases loot QUALITY
{
  assert.equal(farm.lootBias(0.5), 0);   // below the cap → no bias
  assert.equal(farm.lootBias(1), 0);
  assert.equal(farm.lootBias(2), 1);     // 2× over → +1 band
  assert.equal(farm.lootBias(8), 3);     // 8× → +3
  assert.equal(farm.lootBias(1e6), 3);   // log-capped at 3 (top rarities stay events)
  assert.equal(farm.saturation(100, 1), 100 / (farm.KILL_CAP * 1));
  // bias pulls the ip roll toward the band top
  const z = farm.zones[0];
  assert.ok(gear.rollItem(z, 0, () => 0.5, 3).ip > gear.rollItem(z, 0, () => 0.5, 0).ip);
}

// Farm: zones are bot-only data now — no player kill functions (v8)

// Gear v9: rarity + affixes on roll; loot filter (never auto-equips);
// salvage → tiered scrap; bulk sweep; stash overflow → scrap; lock discipline
{
  const s = newState();
  // rollItem: ip in band, a rarity, affix count = rarity's slot count
  const item = gear.rollItem(farm.zones[0], 0, () => 0.5);
  assert.ok(item.ip <= 30 && item.ip >= 10);
  assert.ok(rarity.RARITY_BY_ID[item.rarity]);
  assert.equal(item.affixes.length, rarity.RARITY_BY_ID[item.rarity].affixes);
  assert.ok(Math.abs(gear.contribution({ ip: 100, plus: 12 }) - 100 * Math.pow(1.12, 12)) < 1e-9);

  // meetsKeep: BOTH floors — a low-ip Origin fails the ip floor (law: standardized
  // rarity means old zones spit high-rarity junk)
  assert.ok(gear.meetsKeep({ rarity: "epic", ip: 500 }, "rare", 100));
  assert.ok(!gear.meetsKeep({ rarity: "origin", ip: 20 }, "rare", 100));   // ip too low
  assert.ok(!gear.meetsKeep({ rarity: "common", ip: 9999 }, "rare", 100)); // rarity too low

  // routeDrop NEVER equips: a keeper goes to stash, junk salvages to scrap
  s.gear.keepRarity = "rare"; s.gear.keepIp = 0;
  const keep = gear.routeDrop(s, { slot: "weapon", ip: 40, plus: 0, rarity: "epic", affixes: [], name: "k" });
  assert.ok(keep.kept && !s.gear.weapon);            // stashed, not worn
  assert.equal(s.gear.stash.length, 1);
  const junk = gear.routeDrop(s, { slot: "weapon", ip: 40, plus: 0, rarity: "common", affixes: [], name: "j" });
  assert.ok(!junk.kept && junk.scrap.n > 0);         // salvaged to scrap
  assert.equal(s.scrap.common, junk.scrap.n);
  assert.equal(s.gear.stash.length, 1);              // junk never hit the stash

  // auto-filter OFF: everything is kept (no auto-salvage), even junk
  s.gear.autoFilter = false;
  const kept2 = gear.routeDrop(s, { slot: "weapon", ip: 5, plus: 0, rarity: "common", affixes: [], name: "j2" });
  assert.ok(kept2.kept);
  assert.equal(s.gear.stash.length, 2);
  s.gear.autoFilter = true;

  // auto-equip is opt-in (v13: GM gate retired, defaults OFF — agency by default)
  const off = newState();
  assert.equal(off.gear.autoEquip, false);
  assert.ok(!gear.routeDrop(off, { slot: "weapon", ip: 100, plus: 0, rarity: "common", affixes: [], name: "x" }).equipped);

  // toggled ON: strict upgrades equip, replaced gear → stash (attachment)
  const ae = newState();
  ae.gear.autoEquip = true;
  assert.ok(gear.routeDrop(ae, { slot: "weapon", ip: 100, plus: 0, rarity: "common", affixes: [], name: "a" }).equipped);
  const up = gear.routeDrop(ae, { slot: "weapon", ip: 200, plus: 0, rarity: "common", affixes: [], name: "b" });
  assert.ok(up.equipped && ae.gear.weapon.name === "b");        // higher ip equips
  assert.ok(ae.gear.stash.some(it => it.name === "a"));        // old one preserved in stash
  assert.ok(!gear.routeDrop(ae, { slot: "weapon", ip: 50, plus: 0, rarity: "common", affixes: [], name: "c" }).equipped); // worse → not equipped
  // no module → never auto-equips (agency default)
  assert.ok(!gear.routeDrop(newState(), { slot: "weapon", ip: 999, plus: 0, rarity: "epic", affixes: [], name: "d" }).equipped);

  // scrap yield is tiered: higher rarity at equal ip yields more
  assert.ok(gear.scrapYield({ rarity: "legendary", ip: 100 }) > gear.scrapYield({ rarity: "common", ip: 100 }));

  // manual equip conserves items (swap, never delete)
  s.gear.stash = [{ slot: "weapon", ip: 20, plus: 0, rarity: "rare", affixes: [], name: "a" }];
  assert.ok(gear.equipFromStash(s, 0));
  assert.equal(s.gear.weapon.name, "a");
  assert.equal(s.gear.stash.length, 0);

  // bulk sweep: salvage all unlocked ≤ chosen rarity; locked + higher survive
  s.gear.stash = [
    { slot: "charm", ip: 10, plus: 0, rarity: "common", affixes: [], name: "c1" },
    { slot: "charm", ip: 10, plus: 0, rarity: "uncommon", affixes: [], name: "u1", lock: true },
    { slot: "charm", ip: 10, plus: 0, rarity: "epic", affixes: [], name: "e1" },
  ];
  const sweep = gear.salvageMatching(s, "uncommon"); // ≤ uncommon, but u1 is locked
  assert.equal(sweep.count, 1);                       // only c1
  assert.equal(s.gear.stash.length, 2);              // locked u1 + epic e1 remain
  assert.ok(s.gear.stash.some(it => it.name === "u1") && s.gear.stash.some(it => it.name === "e1"));

  // manual sweep respects the ip axis too (≤ rarity AND ≤ ip) — aligned with the filter
  s.gear.stash = [
    { slot: "charm", ip: 100, plus: 0, rarity: "common", affixes: [], name: "lowip" },
    { slot: "charm", ip: 9999, plus: 0, rarity: "common", affixes: [], name: "highip" },
  ];
  const sw = gear.salvageMatching(s, "rare", 500);   // common ≤ rare, but only ip ≤ 500
  assert.equal(sw.count, 1);
  assert.ok(s.gear.stash.some(it => it.name === "highip")); // high-ip common survives the ip cap

  // stash cap: overflow salvages the WORST unlocked item → scrap; locked immune
  s.gear.stash = [{ slot: "charm", ip: 1, plus: 0, rarity: "common", affixes: [], name: "worst", lock: true }];
  for (let i = 0; i < gear.STASH_CAP - 1; i++) {
    s.gear.stash.push({ slot: "charm", ip: 100 + i, plus: 0, rarity: "common", affixes: [], name: `f${i}` });
  }
  assert.equal(s.gear.stash.length, gear.STASH_CAP);
  const over = gear.routeDrop(s, { slot: "charm", ip: 200, plus: 0, rarity: "rare", affixes: [], name: "new" });
  assert.ok(over.kept && over.overflow);             // kept (rare≥rare), pushed cap over → worst salvaged
  assert.equal(s.gear.stash.length, gear.STASH_CAP);
  assert.ok(s.gear.stash.some(it => it.name === "worst")); // locked ip-1 survives the cull

  // affix registry maps every affix to a known lane (data/code boundary).
  // "crit" is read by crits.js, not derive()'s atk/speed/farm loop.
  for (const id of affixes.AFFIX_IDS) {
    assert.ok(["atk", "speed", "farm", "crit"].includes(affixes.AFFIXES[id].lane));
  }

  // LIVE affixes: contribution = rolled rate × state quantity, hard-capped
  const sl = newState();
  sl.gear.weapon = { slot: "weapon", ip: 100, plus: 0, rarity: "rare",
    affixes: [{ id: "botsync", tier: 1, value: 0.4 }], name: "t" }; // +0.4% ATK / 100 bots
  sl.bots.pop = 0;
  const atk0 = derive(sl).atk;
  sl.bots.pop = 5000;                                   // 0.4 × 50 = +20% ATK
  assert.ok(derive(sl).atk > atk0);                    // scales with the swarm
  assert.equal(affixes.liveValue({ id: "botsync", value: 0.4 }, sl), 20);
  sl.bots.pop = 1e9;                                    // way over
  assert.equal(affixes.liveValue({ id: "botsync", value: 0.4 }, sl), 40); // capped (law 1)
  assert.equal(affixes.liveValue({ id: "atkPct", value: 12 }, sl), 12);   // static affix unchanged

  // Reforge bench: spends OWN-rarity scrap, rerolls affixes, ip/rarity fixed,
  // preview-then-commit (candidate does NOT mutate the item)
  const sr = newState();
  const rItem = { slot: "weapon", ip: 100, plus: 0, rarity: "rare", affixes: [{ id: "copper", tier: 3, value: 20 }], name: "rf" };
  sr.gear.weapon = rItem;
  assert.ok(gear.canReforge(rItem));
  assert.ok(!gear.canReforge({ rarity: "common", ip: 100 })); // commons: nothing to roll
  const rc = gear.reforgeCost(rItem);                          // rare scrap, tier-3 ip=100
  assert.equal(rc.rarity, "rare");
  assert.ok(gear.reforge(sr, rItem) === null);                 // no scrap → refused, no mutation
  assert.deepEqual(rItem.affixes, [{ id: "copper", tier: 3, value: 20 }]);
  sr.scrap.rare = rc.n * 2;
  const cand = gear.reforge(sr, rItem);                        // spends scrap, returns candidate
  assert.equal(sr.scrap.rare, rc.n);                           // one roll deducted
  assert.equal(cand.length, rarity.RARITY_BY_ID.rare.affixes); // affix COUNT held (=2)
  assert.deepEqual(rItem.affixes, [{ id: "copper", tier: 3, value: 20 }]); // NOT committed yet
  rItem.affixes = cand;                                        // caller commits
  assert.equal(rItem.affixes.length, 2);
  // affixes actually move derive()'s lanes
  const s2 = newState();
  s2.gear.weapon = { slot: "weapon", ip: 100, plus: 0, rarity: "rare",
    affixes: [{ id: "atkFlat", tier: 3, value: 50 }, { id: "hits", tier: 3, value: 0.5 }], name: "t" };
  const d0 = derive(newState()), d1 = derive(s2);
  assert.ok(d1.atk > d0.atk + 100);          // base ip + flat atk affix
  assert.ok(d1.hitsPerSec > d0.hitsPerSec);  // hits affix lifts speed
}

// Ban Wave (rebirth): √ payout, player-damage mult, disposable-stratum reset,
// attachment (gear/rig ranks survive), allocation strategy persists
{
  const s = newState();
  s.bots.bars.atk.fills = [100, 0, 0, 0];
  s.bots.bars.speed.fills = [44, 0, 0];         // 144 fills → √ = 12 scripts
  assert.equal(rebirth.totalFills(s), 144);
  assert.equal(rebirth.pendingScripts(s), 12);

  // √ starves spam: doubling fills pays far less than double
  const sm = newState(); sm.bots.bars.atk.fills = [288, 0, 0, 0];
  assert.ok(rebirth.pendingScripts(sm) < 2 * rebirth.pendingScripts(s));

  // Depth multiplies the payout, and W1 is exactly 1.0 — a fresh account must
  // pay precisely what it paid before this term existed.
  assert.equal(rebirth.depthMult(newState()), 1);
  const d3 = newState();
  d3.bots.bars.atk.fills = [100, 0, 0, 0];
  d3.bots.bars.speed.fills = [44, 0, 0];
  d3.maxWall = 3;                                // two doors cleared
  assert.ok(Math.abs(rebirth.depthMult(d3) - rebirth.DEPTH_PER_DOOR ** 2) < 1e-9);
  assert.equal(rebirth.pendingScripts(d3),
    Math.floor(12 * rebirth.DEPTH_PER_DOOR ** 2));
  assert.ok(rebirth.pendingScripts(d3) > rebirth.pendingScripts(s)); // depth pays

  // Depth is NOT farmable: a Ban Wave must not move it. That is what keeps the
  // §7b spam gate intact now that the payout has a second term.
  const dm = rebirth.depthMult(d3);
  rebirth.banWave(d3);
  assert.equal(rebirth.depthMult(d3), dm);
  assert.equal(d3.maxWall, 3);                   // the ladder survives the reset

  // scriptMult is a displayed damage term; derive() scales with it
  s.scripts = 50;
  assert.ok(Math.abs(rebirth.scriptMult(s) - 1.5) < 1e-9);
  s.gear.weapon = { slot: "weapon", ip: 100, plus: 0, rarity: "common", affixes: [], name: "t" };
  const before = derive({ ...s, scripts: 0 }).atk;
  const after = derive(s).atk;
  assert.ok(Math.abs(after - before * 1.5) < 1e-6); // +50% damage from 50 scripts

  // set up things that MUST survive, and a farm that must reset
  s.scripts = 0; // fresh count for the bank math
  s.copper = 5000;
  s.bots.powerRank = 7;                         // rig rank persists
  s.bots.pop = 40; s.bots.trained.atk = 500; s.bots.trained.hits = 2;
  s.bots.alloc.atk = [10, 5, 0, 0]; s.bots.alloc.zones = [3, 2, 0, 0, 0]; s.bots.alloc.enh = 4;
  s.gear.stash = [{ slot: "charm", ip: 9, plus: 0, rarity: "rare", affixes: [], name: "keep" }];

  const gained = rebirth.banWave(s);
  assert.equal(gained, 12);
  assert.equal(s.scripts, 12);                  // banked
  assert.equal(s.rebirths, 1);
  // disposable stratum wiped
  assert.equal(s.copper, 0);
  assert.equal(s.bots.pop, newState().bots.pop);
  assert.equal(s.bots.trained.atk, 0);
  assert.equal(s.bots.bars.atk.fills.reduce((a, b) => a + b, 0), 0);
  // attachment: gear + rig ranks survive
  assert.equal(s.bots.powerRank, 7);
  assert.equal(s.gear.stash.length, 1);
  // allocation resets to a fresh character's seed — NOT the persisted over-
  // allocation (the bug: tier-0 rows kept 15 bots against a pop of 2)
  assert.deepEqual(s.bots.alloc, newState().bots.alloc);
  assert.equal(bots.allocTotal(s.bots), 2); // just the two seed bots

  // no free scripts: a fresh state can't Ban Wave for nothing
  assert.equal(rebirth.banWave(newState()), 0);
}

// Wall progression: W2 exists, is a distinct wall, harder + re-steepened speed
{
  const w1 = getBoss(1), w2 = getBoss(2);
  assert.ok(w1 && w2 && w2.wall === 2);
  assert.ok(w2.hp > w1.hp);                 // a bigger wall (now that the tools exist)
  assert.ok(w2.speedKnee > w1.speedKnee);   // speed re-steepens on the harder wall
  assert.ok(w2.dialogue.greet && w2.dialogue.break); // has its own face (pillar 2)
  assert.deepEqual(newState().cleared, []); // cleared-list monument starts empty
  // walls climb to W10 with a monotonic hp + speedKnee curve; each has a set
  for (let w = 1; w < 10; w++) {
    const a = getBoss(w), b = getBoss(w + 1);
    assert.ok(a && b && b.hp > a.hp && b.speedKnee > a.speedKnee);
    assert.ok(b.set && b.set.mult > a.set.mult && b.dialogue.greet && b.dialogue.break);
  }
  assert.equal(getBoss(11), undefined);     // W10 is the final door
}

// Wall model: switch back to a cleared wall to farm it. maxWall = frontier;
// walls below it load as broken farm records; the frontier keeps its progress.
{
  localStorage.setItem("mm_save", JSON.stringify({
    v: 9, unlocked: true, wall: 1, maxWall: 2,
    frontierBoss: { pulls: 7, bestDepth: 0.4, scars: 0.3, broken: false, nearSaid: true },
  }));
  const s = newState();
  saves.load(s);
  assert.equal(s.maxWall, 2);
  assert.equal(s.wall, 1);                          // viewing the cleared wall
  assert.equal(s.boss.broken, true);                // W1 is a broken farm target
  assert.equal(s.frontierBoss.hp, getBoss(2).hp);   // W2 fight reset to full (old scars discarded)
  assert.equal(s.frontierBoss.broken, false);
  // at the frontier, boss IS the frontier record
  localStorage.setItem("mm_save", JSON.stringify({
    v: 9, unlocked: true, wall: 2, maxWall: 2,
    frontierBoss: { pulls: 7, bestDepth: 0.4, scars: 0.3, broken: false, nearSaid: true },
  }));
  const s2 = newState();
  saves.load(s2);
  assert.equal(s2.boss.hp, getBoss(2).hp);
  assert.equal(s2.boss.broken, false);
}

// Boss Trophy SETS: 7-piece per boss, break gives one, farm drops the rest,
// full set → bonus, permanent boost, survives Ban Wave
{
  const s = newState();
  assert.deepEqual(s.setPieces, {});
  assert.equal(trophies.PARTS.length, 7);

  // break grants exactly one guaranteed piece of the wall's set
  const first = trophies.grantBreakPiece(s, 1);
  assert.ok(first && first.wall === 1);
  assert.equal(trophies.setCount(s, 1), 1);
  assert.ok(!trophies.setComplete(s, 1));

  // a piece boosts its lane in derive (scaled by the boss's set mult)
  const base = newState();
  const p0 = trophies.pieceOf(1, 0); // Hinge, atk lane
  base.setPieces = { 1: [0] };
  if (p0.lane === "atk") assert.ok(derive(base).atk > derive(newState()).atk);

  // farm drops fill the rest; grant all 7 → set complete + ×1.5 damage bonus
  for (let i = 0; i < 7; i++) trophies.grantBreakPiece(s, 1); // idempotent top-up to full
  assert.equal(trophies.setCount(s, 1), 7);
  assert.ok(trophies.setComplete(s, 1));
  const noBonus = { ...newState(), setPieces: { 1: [0] } };
  const withBonus = { ...newState(), setPieces: { 1: [0, 1, 2, 3, 4, 5, 6] } };
  assert.ok(derive(withBonus).atk > derive(noBonus).atk); // set bonus + more pieces

  // rollFarmDrop only grants unowned pieces; deterministic rng that always hits
  const s2 = newState();
  const got = trophies.rollFarmDrop(s2, 1, () => 0); // 0 < FARM_DROP_CHANCE → drops
  assert.ok(got && trophies.setCount(s2, 1) === 1);

  // survives Ban Wave (attachment — the cabinet is untouchable)
  s.bots.bars.atk.fills = [100, 0, 0, 0];
  rebirth.banWave(s);
  assert.equal(trophies.setCount(s, 1), 7);
  assert.ok(trophies.setComplete(s, 1));
}

// Delve: idle depth engine — depth follows build DPS (+ Reach); deeper = more
// Cache; the tree feeds every system (delveBonus); costs rise per rank
{
  const s = newState();
  const dps = 1000;
  // depth = deepest certain-clear floor, driven by DPS
  const d = dungeon.reachDepth(s, dps);
  assert.ok(d >= 1 && dungeon.clearChance(d, dps) === 1 && dungeon.clearChance(d + 1, dps) < 1);
  assert.ok(dungeon.reachDepth(s, 10 * dps) > d);              // stronger build → deeper
  assert.ok(dungeon.cachePerSec(s, 10 * dps) > dungeon.cachePerSec(s, dps)); // deeper → more Cache

  // Reach upgrade digs past raw power; every node has a rising Cache cost
  s.dungeon.cache = 1e6;
  const c0 = dungeon.cost(s, "reach");
  assert.ok(dungeon.buy(s, "reach"));
  assert.equal(dungeon.reachDepth(s, dps), d + 1);            // +1 depth
  assert.ok(dungeon.cost(s, "reach") > c0);                   // next rank costs more
  assert.ok(s.dungeon.cache < 1e6);                           // Cache spent

  // system-feeding nodes contribute a multiplier (delveBonus); rank 0 = 1×
  const fresh = newState();
  for (const key of ["overclock", "loot", "drill"]) assert.equal(dungeon.delveBonus(fresh, key), 1);
  s.dungeon.cache = 1e9;
  dungeon.buy(s, "overclock");
  assert.ok(dungeon.delveBonus(s, "overclock") > 1);         // overclock now lifts ATK
  assert.equal(dungeon.buy(newState(), "reach"), false);     // no Cache → can't buy
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

// Progressive unlocks: fresh state hides all tabs; a genuinely OLD save (no
// features field) that was already unlocked keeps its tabs (don't re-hide).
{
  assert.equal(newState().features.training, false);
  assert.equal(newState().features.rebirth, false);
  localStorage.setItem("mm_save", JSON.stringify({ v: 8, unlocked: true, boss: { pulls: 3 }, cleared: ["W1 Vess"] }));
  const s = newState();
  saves.load(s);
  assert.equal(s.features.training, true);  // backfilled
  assert.equal(s.features.player, true);
  assert.equal(s.features.rebirth, true);   // had a cleared wall → rebirth stays open
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
  s.gear.weapon = { slot: "weapon", ip: 55, plus: 3, zone: 1, name: "t" };
  s.gear.stash = [{ slot: "charm", ip: 5, plus: 0, zone: 1, name: "u" }];
  s.boss = { hp: 123_000_000, broken: false, nearSaid: false, farmCarry: 0 };
  s.frontierBoss = s.boss; // invariant: at the frontier, boss IS frontierBoss
  saves.save(s);
  assert.equal(JSON.parse(localStorage.getItem("mm_save")).pull, undefined);
  const s2 = newState();
  saves.load(s2);
  assert.deepEqual(s2.bots.bars.atk, { fills: [50, 3, 0, 0, 0, 0, 0], prog: [11, 4, 0, 0, 0, 0, 0], unlocked: 2 });
  assert.deepEqual(s2.bots.alloc.atk, [2, 1, 0, 0, 0, 0, 0]);
  assert.deepEqual(s2.bots.alloc.zones, [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(s2.bots.trained.atk, 56);
  assert.equal(s2.bots.pop, 4.5);
  assert.equal(s2.bots.capRank, 1);
  assert.equal(s2.copper, 1234);
  assert.equal(s2.gear.weapon.ip, 55);
  assert.equal(s2.gear.stash.length, 1);
  assert.deepEqual(s2.boss, s.boss);

  // v1 save (pre-bots, had player field): backfills, keeps siege progress, unlocks
  localStorage.setItem("mm_save", JSON.stringify({ v: 1, player: { atk: 10 }, boss: { pulls: 5, scars: 0.2 } }));
  const s3 = newState();
  saves.load(s3);
  assert.equal(s3.bots.pop, newState().bots.pop); // backfills to the current seed pop
  assert.equal(s3.boss.hp, getBoss(1).hp); // old scars discarded, fight reset to full
  assert.equal(s3.boss.broken, false);
  assert.equal(s3.unlocked, true); // mid-siege v1 save keeps systems open

  // v2 save (discrete accounts): count → pop; alloc falls back to defaults
  localStorage.setItem("mm_save", JSON.stringify({ v: 2, bots: { count: 5, assign: { atk: 3, speed: 2 }, powerRank: 1 } }));
  const s5 = newState();
  saves.load(s5);
  assert.equal(s5.bots.pop, 5);
  assert.equal(s5.bots.powerRank, 1);
  assert.equal(s5.bots.assign, undefined); // v2 field dropped
  assert.deepEqual(s5.bots.alloc.atk, [1, 0, 0, 0, 0, 0, 0]); // defaults

  // v4 save (quadratic bars): lvl converts to trained stats, tiers reset
  localStorage.setItem("mm_save", JSON.stringify({ v: 4, bots: { pop: 6, bars: { atk: { lvl: 20, prog: 5 }, speed: { lvl: 150, prog: 5 } } } }));
  const s7 = newState();
  saves.load(s7);
  assert.equal(s7.bots.trained.atk, 160);       // 8 × 20
  assert.equal(s7.bots.trained.hits, 3.0);      // 0.03 × min(150,100), capped
  assert.deepEqual(s7.bots.bars.atk.fills, [0, 0, 0, 0, 0, 0, 0]); // fresh bar state

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
  assert.deepEqual(s6.bots.alloc.atk, [3, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(s6.bots.alloc.speed, [2, 0, 0, 0, 0, 0]);
  assert.deepEqual(s6.bots.alloc.zones, [0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // farm squad landed on its old zone
  assert.equal(s6.bots.alloc.enh, 1);
  assert.deepEqual(s6.bots.bars.atk.fills, [9, 1, 0, 0, 0, 0, 0]); // history kept
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

// Offline: the Warden whittles at CP (clamped by dt); broken walls farm
{
  const s = newState();
  const cp = pull.combatPower(s);
  const r = pull.processIdle(s, 100);
  assert.ok(!r.broke && Math.abs(r.dealt - cp * 100) < 1e-3);
  assert.ok(s.boss.hp < getBoss(1).hp);
  s.boss.broken = true; // broken → farm branch, no drain
  const r2 = pull.processIdle(s, pull.FARM_INTERVAL + 1);
  assert.equal(r2.dealt, 0);
  assert.ok(r2.farm.rolls >= 1);
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

// Armory: merge accrues points; a common ranks up on the 3rd copy (rank1 = 3pts)
{
  const s = newState();
  const item = { slot: "weapon", zone: 1, rarity: "common", ip: 40, plus: 0, name: "t", affixes: [] };
  assert.equal(armory.merge(s, item), null); // 1pt → rank 0
  assert.equal(armory.merge(s, item), null); // 2pt → rank 0
  const up = armory.merge(s, item);           // 3pt → rank 1
  assert.ok(up && up.rankedUp && up.from === 0 && up.to === 1);
  assert.equal(up.lane, "atk"); // weapon lane
  assert.equal(s.armory["weapon:1"], 3);
}

// Armory: rarer copies weigh more — one epic (weight 4 ≥ 3) ranks up immediately
{
  const s = newState();
  const up = armory.merge(s, { slot: "charm", zone: 2, rarity: "epic", ip: 200, plus: 0, name: "c", affixes: [] });
  assert.ok(up && up.to === 1 && up.lane === "farm"); // charm → farm lane
  assert.equal(s.armory["charm:2"], armory.MERGE_WEIGHT[rarity.RARITY_IDX.epic]);
}

// Armory: rank is band-capped at RMAX (law 1 — bounded guarantee)
{
  assert.equal(armory.rankOf(1e12), armory.RMAX);
  assert.equal(armory.rankOf(armory.pointsForRank(2)), 2); // rankOf inverts pointsForRank
}

// Armory: armoryMods aggregates each entry into its slot's lane, displayed
{
  const s = newState();
  s.armory["weapon:1"] = armory.pointsForRank(2);  // atk lane
  s.armory["armor:3"] = armory.pointsForRank(1);   // speed lane
  s.armory["charm:1"] = armory.pointsForRank(1);   // farm lane
  const m = armory.armoryMods(s);
  assert.ok(Math.abs(m.atkPct - armory.entryPct("weapon", 1, 2)) < 1e-9);
  assert.ok(Math.abs(m.hastePct - armory.entryPct("armor", 3, 1)) < 1e-9);
  assert.ok(Math.abs(m.copperPct - armory.entryPct("charm", 1, 1)) < 1e-9);
}

// Armory: derive() folds the atk-lane passive in (feeds combat power)
{
  const s = newState();
  const base = derive(s).atk;
  s.armory["weapon:1"] = armory.pointsForRank(4); // rank 4 atk passive
  assert.ok(derive(s).atk > base);
}

// Armory: routeDrop merges every drop (even auto-salvaged junk) + attaches result
{
  const s = newState();
  s.gear.autoFilter = true; s.gear.keepRarity = "legendary"; s.gear.keepIp = 9e9; // filter salvages this common
  const item = { slot: "weapon", zone: 1, rarity: "common", ip: 40, plus: 0, name: "t", affixes: [] };
  const r = gear.routeDrop(s, item);
  assert.equal(r.kept, false);              // junk → salvaged
  assert.ok("merge" in r);                  // …but still merged into the Armory
  assert.equal(s.armory["weapon:1"], 1);
}

// Armory: old saves backfill an empty map; a populated map round-trips
{
  const s = newState();
  const raw = { v: 9, boss: { pulls: 3 }, unlocked: true }; // pre-v10, no armory field
  localStorage.setItem("mm_save", JSON.stringify(raw));
  saves.load(s);
  assert.deepEqual(s.armory, {});
  s.armory["weapon:1"] = 12;
  saves.save(s);
  const s2 = newState();
  saves.load(s2);
  assert.equal(s2.armory["weapon:1"], 12);
  localStorage.removeItem("mm_save"); localStorage.removeItem("mm_save_bak");
}

// Dungeon: coverage is the wall — staffed duties answer, short ones don't
{
  const need = inst.needPerMechanic(3); // ceil(3/2) = 2
  assert.equal(need, 2);
  const covered = inst.resolveFloor({ interrupt: 2, dispel: 2, adds: 2 }, 3, 1, false);
  assert.equal(covered.unanswered.length, 0);
  assert.equal(covered.mult, 1);
  const short = inst.resolveFloor({ interrupt: 2, dispel: 0, adds: 2 }, 3, 1, false);
  assert.deepEqual(short.unanswered.map(m => m.id), ["dispel"]);
  assert.ok(Math.abs(short.mult - 0.90) < 1e-9); // one −10% mechanic
}

// Dungeon: key gates how many mechanics are live at all
{
  assert.equal(inst.liveMechanics(1).length, 1);
  assert.equal(inst.liveMechanics(3).length, 3);
  assert.equal(inst.liveMechanics(99).length, inst.MECHANICS.length); // never exceeds the pool
}

// Dungeon: attrition eats the party, proxy shaves the rate, cap holds
{
  const r = inst.resolveFloor({ interrupt: 10, dispel: 10, adds: 10 }, 1, 1, false);
  assert.ok(r.lost.interrupt > 0);                       // bots are SPENT, always
  assert.ok(inst.banRate(5, 3, true) < inst.banRate(5, 3, false)); // proxy mitigates
  assert.ok(inst.banRate(20, 40, false) <= inst.BAN_CAP);          // never runaway
  const empty = inst.resolveFloor({ interrupt: 0, dispel: 0, adds: 0 }, 1, 1, false);
  assert.equal(empty.lost.interrupt, 0);                 // can't ban what isn't there
}

// Dungeon: attrition must not strip a WHOLE bot on floor 1 (regression — ceil()
// rounding made every run collapse to unanswered on the first floor)
{
  const s = newState();
  s.bots.pop = 40;
  s.instance.key = 3;
  s.instance.bankAt = 99;
  s.instance.party = { interrupt: 2, dispel: 2, adds: 2 }; // exactly the need
  inst.start(s);
  const ev = inst.tick(s, 1e6, inst.floorTime(1) + 0.01); // resolve floor 1 only
  assert.equal(ev.unanswered.length, 0, "a fully-staffed party must clear floor 1 answered");
  assert.ok(s.instance.mult === 1);
  assert.ok(inst.projectDepth(s) > 1, "and it must reach past floor 1");
}

// Dungeon: sacrifice buys depth — more bots is deeper, and it's deterministic
{
  const s = newState();
  s.instance.key = 1;
  s.instance.party = { interrupt: 1, dispel: 0, adds: 0 };
  const shallow = inst.projectDepth(s);
  s.instance.party = { interrupt: 12, dispel: 0, adds: 0 };
  const deep = inst.projectDepth(s);
  assert.ok(deep > shallow, "burning more accounts must reach deeper");
  assert.equal(inst.projectDepth(s), deep); // no RNG — the projection can't lie
}

// Dungeon: the run — bots leave the pool, survivors come back, haul banks
{
  const s = newState();
  s.bots.pop = 20;
  s.instance.key = 1;
  s.instance.bankAt = 2;
  s.instance.party = { interrupt: 6, dispel: 0, adds: 0 };
  assert.ok(inst.start(s));
  assert.equal(s.bots.pop, 14);          // committed bots are out of the swarm
  assert.ok(s.instance.running);
  const before = s.bots.banned;
  inst.tick(s, 1e6, 60);                 // huge CP: blows through both floors
  assert.equal(s.instance.running, false);
  assert.ok(s.bots.banned > before);     // attrition fed the one ban ledger
  assert.ok(s.bots.pop > 14 && s.bots.pop < 20); // survivors returned, dead ones didn't
  assert.equal(s.instance.staffed, null);
}

// Dungeon: dying is a loot PENALTY, not a wipe-out — you keep WIPE_KEEP of it
{
  const s = newState();
  s.bots.pop = 40;
  s.instance.key = 3;
  s.instance.bankAt = 99;                 // never pulls out — this run must die
  s.instance.party = { interrupt: 3, dispel: 3, adds: 3 };
  inst.start(s);
  const ev = inst.tick(s, 1e6, 600);
  assert.ok(ev.wiped);
  assert.ok(ev.items.length > 0, "a dead party still comes home with something");
  assert.ok(ev.lost > 0, "but it drops most of the haul");
  assert.ok(ev.items.length < ev.items.length + ev.lost);
  assert.ok(s.instance.best > 0, "depth reached counts even on a loss");
}

// Grind: the Ban Counter affix is gone, and old items carrying it load clean
{
  assert.equal(affixes.AFFIXES.bancount, undefined);
  assert.ok(!affixes.AFFIX_IDS.includes("bancount"));
  const s = newState();
  localStorage.setItem("mm_save", JSON.stringify({
    v: 11, unlocked: true, boss: { hp: 5 },
    gear: { weapon: { slot: "weapon", ip: 100, plus: 0, rarity: "rare", zone: 1, name: "x",
      affixes: [{ id: "bancount", tier: 1, value: 2 }, { id: "atkPct", tier: 1, value: 5 }] }, stash: [] },
  }));
  saves.load(s);
  assert.deepEqual(s.gear.weapon.affixes.map(a => a.id), ["atkPct"]); // retired row stripped
  localStorage.removeItem("mm_save"); localStorage.removeItem("mm_save_bak");
}

// Dungeon: the journal writes itself on a wipe and is permanent knowledge
{
  const s = newState();
  s.bots.pop = 40;
  s.instance.key = 3;                    // all three live, none staffed
  s.instance.bankAt = 99;
  s.instance.party = { interrupt: 1, dispel: 0, adds: 0 };
  inst.start(s);
  inst.tick(s, 1e6, 120);
  assert.ok(s.instance.journal.dispel?.seen, "a wipe teaches the mechanic that beat you");
  assert.equal(s.instance.journal.dispel.solved, false);
  assert.equal(s.instance.running, false); // penalty stack wiped the party
  // knowledge survives a save round-trip (attachment law)
  saves.save(s);
  const s2 = newState();
  saves.load(s2);
  assert.ok(s2.instance.journal.dispel.seen);
  localStorage.removeItem("mm_save"); localStorage.removeItem("mm_save_bak");
}

// Dungeon: a run in progress never survives a reload with the bots eaten
{
  const s = newState();
  s.bots.pop = 20;
  s.instance.party = { interrupt: 5, dispel: 0, adds: 0 };
  inst.start(s);
  assert.equal(s.bots.pop, 15);
  saves.save(s);
  const s2 = newState();
  saves.load(s2);
  assert.equal(s2.instance.running, false);
  assert.equal(s2.bots.pop, 20); // staffed bots handed back, not lost to a reload
  localStorage.removeItem("mm_save"); localStorage.removeItem("mm_save_bak");
}

// Dungeon: old saves backfill the instance block cleanly
{
  const s = newState();
  localStorage.setItem("mm_save", JSON.stringify({ v: 11, boss: { hp: 5 }, unlocked: true }));
  saves.load(s);
  assert.equal(s.instance.key, 1);
  assert.deepEqual(s.instance.journal, {});
  assert.equal(s.instance.running, false);
  localStorage.removeItem("mm_save"); localStorage.removeItem("mm_save_bak");
}

const skills = await import("../skills.js");

// Skills: cost curve, band caps, buy gating
{
  const s = newState();
  assert.equal(skills.cost(s, "powerStrike"), 20);
  s.copper = 19;
  assert.equal(skills.buy(s, "powerStrike"), false); // can't afford
  s.copper = 1e9;
  assert.equal(skills.buy(s, "powerStrike"), true);
  assert.equal(skills.cost(s, "powerStrike"), 30);   // 20 × 1.5
  // Double Strike band cap: chance stops at 30%, cost goes Infinity at maxRank
  for (let i = 0; i < 12; i++) skills.buy(s, "doubleStrike");
  assert.equal(skills.cost(s, "doubleStrike"), Infinity);
  assert.ok(Math.abs(skills.fxValues.doubleChance(12) - 0.30) < 1e-9);
  assert.ok(Math.abs(skills.fxValues.doubleChance(99) - 0.30) < 1e-9); // Empower can't burst the cap
}

// Skills: the EV fold is the crit pattern — one displayed term, exact math
{
  const s = newState();
  const base = derive(s);
  s.copper = 20;
  skills.buy(s, "powerStrike");
  const d = derive(s);
  assert.ok(Math.abs(d.atk / base.atk - 1.05) < 1e-9); // +5% ATK, nothing else
  assert.equal(d.skills.terms.length, 1);              // and it is DISPLAYED
}

// Actives: Focus forces every hit to crit, Rage doubles the hit rate
{
  const s = newState();
  s.skills.ranks.focus = 1;
  s.skills.focus = 10; // seconds remaining
  const d = derive(s);
  const cfAll = 1 + 1 * (2 - 1) + 1 * 0.2 * (5 - 2); // 2.6
  assert.ok(Math.abs(d.atk - 10 * cfAll) < 1e-9);
  s.skills.focus = 0;
  s.skills.ranks.rage = 1;
  s.skills.rage = 30;
  assert.equal(derive(s).hitsPerSec, 4.0);
}

// Pips: spend-gated casts, no restack, recharge banks to the cap and stalls
{
  const s = newState();
  s.copper = 1e9;
  skills.buy(s, "rage");
  const d = derive(s);
  assert.equal(skills.cast(s, "rage", d), null);      // no pip yet
  skills.tick(s, skills.PIP_RECHARGE, d);             // one pip banks
  assert.equal(s.skills.pips, 1);
  assert.ok(skills.cast(s, "rage", d));               // spends it
  assert.equal(s.skills.pips, 0);
  assert.ok(s.skills.rage > 0);
  assert.equal(skills.cast(s, "rage", d), null);      // restack blocked
  // offline banking: a huge absence fills the bank EXACTLY to the cap
  skills.tick(s, 86400 * 30, d);
  assert.equal(s.skills.pips, skills.PIP_CAP);
  assert.equal(s.skills.pipT, 0);                     // full bank = recharge stalls
  assert.equal(s.skills.rage, 0);                     // the burst expired on its timer
}

// Power Smash winds up through the same tick and lands real damage
{
  const s = newState();
  s.copper = 1e9;
  skills.buy(s, "powerSmash");
  const d = derive(s);
  skills.tick(s, skills.PIP_RECHARGE, d);
  assert.ok(skills.cast(s, "powerSmash", d));
  assert.ok(s.skills.windup > 0);
  const events = [];
  const r = skills.tick(s, 6, d, e => events.push(e));
  assert.ok(Math.abs(r.dmg - 80 * d.atk) < 1e-6);
  assert.equal(events.filter(e => e.type === "smash").length, 1);
}

// Wild Swing: odds fixed, scripted rng hits the jackpot and the whiff
{
  const s = newState();
  s.copper = 1e9;
  skills.buy(s, "wildSwing");
  const d = derive(s);
  skills.tick(s, skills.PIP_RECHARGE * 2, d);
  assert.ok(Math.abs(skills.cast(s, "wildSwing", d, () => 0.05).dmg - 150 * d.atk) < 1e-6);
  assert.equal(skills.cast(s, "wildSwing", d, () => 0.95).dmg, 0); // WHIFF
}

// Combo Attack: finishers emit and shave the pip recharge (the real coupling)
{
  const s = newState();
  s.copper = 1e9;
  skills.buy(s, "comboAttack");
  skills.buy(s, "rage"); // a pip spender, so the recharge is live
  const d = derive(s);
  const events = [];
  skills.tick(s, 15, d, e => events.push(e)); // 2 hits/s × 15s = 30 hits
  assert.equal(events.filter(e => e.type === "finisher").length, 1);
  assert.ok(Math.abs(s.skills.pipT - (15 + 5)) < 1e-6); // 15s elapsed + 5s shave
}

// Second Wind: its own clock, banks exactly 1, refills the whole pip bank
{
  const s = newState();
  s.copper = 1e9;
  skills.buy(s, "secondWind");
  skills.buy(s, "rage");
  const d = derive(s);
  skills.tick(s, 86400, d);                 // clock fills, bank caps at 1
  assert.equal(s.skills.swBank, 1);
  s.skills.pips = 0;
  assert.ok(skills.cast(s, "secondWind", d));
  assert.equal(s.skills.pips, skills.PIP_CAP);
  assert.equal(s.skills.swBank, 0);
}

// Ban Wave: the skill book is character canon — ranks and pips survive
{
  const s = newState();
  s.copper = 1e9;
  skills.buy(s, "powerStrike");
  skills.buy(s, "rage");
  s.skills.pips = 3;
  s.bots.bars.atk.fills[0] = 100;
  rebirth.banWave(s);
  assert.equal(skills.rank(s, "powerStrike"), 1);
  assert.equal(s.skills.pips, 3);
  assert.equal(s.copper, 0); // the wallet resets, the book does not
}

// Saves: ranks round-trip; a retired skill id is dropped on load
{
  const s = newState();
  s.unlocked = true;
  s.copper = 100;
  s.skills.ranks.powerStrike = 2;
  s.skills.ranks.ghostOfARetiredSkill = 5;
  saves.save(s);
  const s2 = newState();
  saves.load(s2);
  assert.equal(skills.rank(s2, "powerStrike"), 2);
  assert.equal(skills.rank(s2, "ghostOfARetiredSkill"), 0);
  localStorage.removeItem("mm_save"); localStorage.removeItem("mm_save_bak");
}

// Skill bursts share drain's break transition (smite)
{
  const s = newState();
  s.boss.hp = 50;
  const r = pull.smite(s, 100);
  assert.equal(r.dealt, 50);
  assert.equal(r.broke, true);
  assert.equal(s.boss.broken, true);
  assert.equal(pull.smite(s, 100).dealt, 0); // broken Wardens take nothing
}

console.log("all checks passed");
