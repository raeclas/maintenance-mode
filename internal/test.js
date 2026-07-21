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
  assert.equal(pull.expectedDepth(s.player, b), 0.75); // 20 × 30 / 800
}

// Pull math: band endpoints via injected rng
{
  const s = newState();
  const b = getBoss(1);
  const ev = pull.expectedDepth(s.player, b);
  assert.ok(Math.abs(pull.rollDepth(s.player, b, () => 0) - ev * (1 - pull.VARIANCE)) < 1e-12);
  assert.ok(Math.abs(pull.rollDepth(s.player, b, () => 1) - ev * (1 + pull.VARIANCE)) < 1e-12);
}

// Break chance: 0 without scars, analytic with scars, 1 when overwhelming
{
  const b = getBoss(1);
  const P = newState().player;
  assert.equal(pull.breakChance(P, b, 0), 0); // hi = 81% — a fresh W1 pull can never break
  const { lo, hi } = pull.band(P, b, pull.SCAR_CAP); // 96%–108% at full scars
  assert.ok(Math.abs(pull.breakChance(P, b, pull.SCAR_CAP) - (hi - 1) / (hi - lo)) < 1e-12);
  assert.ok(Math.abs(pull.breakChance(P, b, pull.SCAR_CAP) - 2 / 3) < 1e-12);
  assert.equal(pull.breakChance({ atk: 1000, hitsPerSec: 2 }, b, 0), 1);
}

// EV forecast: W1 breaks on pull 5 at starting values; Infinity when hopeless
{
  const b = getBoss(1);
  assert.equal(pull.pullsToBreakEV(newState().player, b, 0), 5);
  assert.equal(pull.pullsToBreakEV(newState().player, b, pull.SCAR_CAP), 1);
  assert.equal(pull.pullsToBreakEV({ atk: 1, hitsPerSec: 1 }, b, 0), Infinity);
}

// Resolve: fail → scars grow by SCAR_RATE × fresh, capped; cooldown starts
{
  const s = newState();
  const t0 = 1_000_000;
  assert.ok(pull.startPull(s, t0, () => 0)); // fresh = 69%
  assert.ok(!pull.pullDone(s, t0 + 1000));
  const end = s.pull.endsAt;
  assert.equal(end, t0 + 30_000);
  assert.ok(pull.pullDone(s, end));
  const fresh = s.pull.rolledFresh;
  const d = pull.resolvePull(s, end);
  assert.ok(d < 1 && !s.boss.broken);
  assert.equal(s.boss.pulls, 1);
  assert.equal(s.boss.bestDepth, d);
  assert.ok(Math.abs(s.boss.scars - fresh * pull.SCAR_RATE) < 1e-12);
  assert.equal(s.cooldownUntil, end + pull.COOLDOWN_MS);
  // scars never exceed the cap
  s.boss.scars = pull.SCAR_CAP - 0.001;
  s.cooldownUntil = 0;
  pull.startPull(s, end + 100_000, () => 0);
  pull.resolvePull(s, s.pull.endsAt);
  assert.equal(s.boss.scars, pull.SCAR_CAP);
}

// Resolve: scars + high roll → break, no cooldown, ends before window
{
  const s = newState();
  s.boss.scars = pull.SCAR_CAP;
  pull.startPull(s, 1_000_000, () => 1); // total ≈ 27% + 81% = 108% → breaks early
  assert.ok(pull.pullDone(s, s.pull.endsAt - 100));
  const d = pull.resolvePull(s, s.pull.endsAt - 100);
  assert.equal(d, 1);
  assert.ok(s.boss.broken);
  assert.equal(s.cooldownUntil, 0);
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

// Save round-trip: fields preserved (scars included), transient pull excluded
{
  const s = newState();
  s.boss = { pulls: 3, bestDepth: 0.97, scars: 0.21, broken: false };
  s.cooldownUntil = 123456;
  s.pull = { startedAt: 1, endsAt: 2, rolledFresh: 0.7 };
  saves.save(s);
  assert.equal(JSON.parse(localStorage.getItem("mm_save")).pull, undefined);
  const s2 = newState();
  saves.load(s2);
  assert.deepEqual(s2.boss, { pulls: 3, bestDepth: 0.97, scars: 0.21, broken: false });
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
  assert.equal(s.boss.scars, 0);          // backfilled (pre-scars save)
  assert.equal(s.boss.broken, false);
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
