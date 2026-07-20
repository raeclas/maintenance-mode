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

// Pull math: formula lock at starting values
{
  const s = newState();
  const b = getBoss(1);
  assert.equal(pull.dps(s.player), 20);
  assert.equal(pull.expectedDepth(s.player, b), 0.96); // 20 × 30 / 625
}

// Pull math: band endpoints via injected rng
{
  const s = newState();
  const b = getBoss(1);
  const ev = pull.expectedDepth(s.player, b);
  assert.ok(Math.abs(pull.rollDepth(s.player, b, () => 0) - ev * (1 - pull.VARIANCE)) < 1e-12);
  assert.ok(Math.abs(pull.rollDepth(s.player, b, () => 1) - ev * (1 + pull.VARIANCE)) < 1e-12);
}

// Pull math: analytic break chance matches the band, incl. 0/1 edges
{
  const b = getBoss(1);
  const ev = pull.expectedDepth(newState().player, b);
  const lo = ev * (1 - pull.VARIANCE), hi = ev * (1 + pull.VARIANCE);
  assert.ok(Math.abs(pull.breakChance(newState().player, b) - (hi - 1) / (hi - lo)) < 1e-12);
  assert.equal(pull.breakChance({ atk: 1, hitsPerSec: 1 }, b), 0);   // hopeless
  assert.equal(pull.breakChance({ atk: 1000, hitsPerSec: 2 }, b), 1); // overwhelming
}

// Resolve: forced low roll → fail, pulls++, cooldown; forced high roll → break
{
  const s = newState();
  const t0 = 1_000_000;
  assert.ok(pull.startPull(s, t0, () => 0));
  assert.ok(!pull.pullDone(s, t0 + 1000));
  const end = s.pull.endsAt;
  assert.equal(end, t0 + 30_000);
  assert.ok(pull.pullDone(s, end));
  const d = pull.resolvePull(s, end);
  assert.ok(d < 1 && !s.boss.broken);
  assert.equal(s.boss.pulls, 1);
  assert.equal(s.boss.bestDepth, d);
  assert.equal(s.cooldownUntil, end + pull.COOLDOWN_MS);
}
{
  const s = newState();
  const t0 = 1_000_000;
  pull.startPull(s, t0, () => 1); // rolledTotal ≈ 1.0368 → breaks early at 100%
  assert.ok(pull.pullDone(s, s.pull.endsAt - 100)); // done before window ends
  const d = pull.resolvePull(s, s.pull.endsAt - 100);
  assert.equal(d, 1);
  assert.ok(s.boss.broken);
  assert.equal(s.cooldownUntil, 0); // break starts no cooldown
}

// Gating: canPull false mid-pull / under cooldown / when broken
{
  const s = newState();
  assert.ok(pull.canPull(s, 0));
  pull.startPull(s, 0, () => 0);
  assert.ok(!pull.canPull(s, 10)); // mid-pull
  pull.resolvePull(s, 30_000);
  assert.ok(!pull.canPull(s, 30_001));                    // cooldown
  assert.ok(pull.canPull(s, 30_000 + pull.COOLDOWN_MS));  // cooldown over
  s.boss.broken = true;
  assert.ok(!pull.canPull(s, 10_000_000)); // broken
}

// Save round-trip: fields preserved, transient pull excluded
{
  const s = newState();
  s.boss = { pulls: 3, bestDepth: 0.97, broken: false };
  s.cooldownUntil = 123456;
  s.pull = { startedAt: 1, endsAt: 2, rolledTotal: 0.9 };
  saves.save(s);
  assert.equal(JSON.parse(localStorage.getItem("mm_save")).pull, undefined);
  const s2 = newState();
  saves.load(s2);
  assert.deepEqual(s2.boss, { pulls: 3, bestDepth: 0.97, broken: false });
  assert.equal(s2.cooldownUntil, 123456);
  assert.equal(s2.pull, null);
}

// Durability: corrupt primary → quarantined, _bak restores
{
  const good = localStorage.getItem("mm_save"); // from previous block's save
  localStorage.setItem("mm_save_bak", good);
  localStorage.setItem("mm_save", "{corrupt garbage");
  const s = newState();
  assert.ok(saves.load(s));
  assert.equal(s.boss.pulls, 3); // restored from _bak
  assert.equal(localStorage.getItem("mm_save_corrupt"), "{corrupt garbage");
  saves.wipe();
  assert.equal(localStorage.getItem("mm_save"), null);
  assert.equal(localStorage.getItem("mm_save_bak"), null);
  assert.equal(localStorage.getItem("mm_save_corrupt"), null);
}

// Normalize: missing fields backfilled from factory; garbage rejected
{
  localStorage.setItem("mm_save", JSON.stringify({ v: 1, boss: { pulls: 5 } }));
  const s = newState();
  saves.load(s);
  assert.equal(s.player.hitsPerSec, 2.0); // backfilled
  assert.equal(s.boss.pulls, 5);
  assert.equal(s.boss.broken, false);     // backfilled
  saves.wipe();
  assert.equal(saves.validSave(null), false);
  assert.equal(saves.validSave({ v: 0 }), false);
  assert.equal(saves.importSave("not json"), false);
}

// Dialogue completeness: every event key the UI emits has ≥1 non-empty line
{
  for (const b of bosses) {
    for (const key of ["greet", "pullStart", "fail_low", "fail_near", "break"]) {
      assert.ok(Array.isArray(b.dialogue[key]) && b.dialogue[key].length >= 1, `${b.id} ${key}`);
      for (const line of b.dialogue[key]) assert.ok(line.trim().length > 0, `${b.id} ${key} empty line`);
    }
  }
}

console.log("all checks passed");
