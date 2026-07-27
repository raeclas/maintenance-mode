// skills.js — the character's skill book (dead-game register: what the MMO's
// own skill window printed). Two lanes:
//   PASSIVES — procs on the character's attacks, rolled FOR REAL in the
//   logic tick (user verdict 2026-07-27: procs must actually proc). The
//   boss's health chunks with what lands; passiveMult() keeps the matching
//   EV for rate consumers (bots borrow it, projections/sim use it) — so
//   every skill buy still speeds the farm through the player coupling.
//   ACTIVES — press for a burst, spending a pip from ONE shared bank. Pips
//   recharge on a timer that ticks live AND offline (clamp law); a full
//   bank is the only place recharge is lost. Nothing decays, nothing
//   resets — absence banks bursts, it never costs them (no-obligation veto).
//
import { rollHit } from "./crits.js";

// Design contract (2026-07-27, "imba two-curve rule"): EV per copper starts
// ~0.25%/c and gently falls down the ladder; spike MAGNITUDE grows ~×4 per
// tier and is uncapped, while proc RATES and uptimes are band-capped. The
// player feels escalating brokenness; the faucet stays governed.
// All numbers are STARTING VALUES — playtest-tuned, sim restamps in-commit.

export const PIP_CAP = 5;       // C — THE USER'S DIAL. ×300s = zero-loss window (25min)
export const PIP_RECHARGE = 300; // seconds per pip
export const ENERGY_CAP = 300;  // Energy Burst bank (1 per hit)
export const COMBO_HITS = 30;   // hits per Combo Attack finisher
export const JUDG_PERIOD = 15;  // Judgment metronome, seconds
export const EMPOWER_RANKS = 3; // Empower: procs act this many ranks higher

// Per-rank effect values. r is the EFFECTIVE rank (Empower can lift it).
const fx = {
  powerStrike: r => 0.05 * r,                          // +atk fraction
  doubleChance: r => Math.min(0.30, 0.08 + 0.02 * (r - 1)), // band cap 30%
  judgMult: r => 6 + 5 * (r - 1),                      // × atk per beat
  frenzyWin: r => Math.min(10, 4 + (r - 1)),           // seconds, band cap
  frenzyHaste: () => 0.5,                              // +50% hits in window
  finBonus: r => 5 + 0.5 * (r - 1),                    // × atk on super crit
  comboFin: r => 10 + (r - 1),                         // finisher × atk
  comboShave: r => 5 * Math.min(3, r),                 // pip-recharge seconds per finisher, cap 15
  tranceWin: r => 8 + (r - 1),                         // seconds lit
  meteorMult: r => 15 + 3 * (r - 1),                   // × atk; RATE fixed 1%
  chaosChance: r => Math.min(0.06, 0.02 + 0.005 * (r - 1)),
  rageDur: r => 30 + 3 * (r - 1),
  mightMult: r => 2 + 0.1 * (r - 1),
  smashMult: r => 80 + 10 * (r - 1),
  focusDur: r => 15 + (r - 1),
  bladeBonus: r => 3 + 0.5 * (r - 1),                  // × atk rider per hit (30 hits)
  empowerDur: r => 20 + 2 * (r - 1),
  jackpot: r => 150 + 10 * (r - 1),                    // odds FIXED (guarantee heuristic)
  burstRate: r => 0.25 + 0.1 * (r - 1),                // × atk per Energy
  swClock: r => Math.max(900, 1800 - 60 * (r - 1)),    // Second Wind, banks exactly 1
};

// Wild Swing's lottery wheel (Geniewiz). Odds never improve; only the jackpot
// grows. The whiff at ×0 is deliberate drama — playtest owns it.
export const WILD_TABLE = [
  { p: 0.10, mult: r => fx.jackpot(r), label: "JACKPOT" },
  { p: 0.50, mult: () => 40, label: "" },
  { p: 0.30, mult: () => 10, label: "" },
  { p: 0.10, mult: () => 0, label: "WHIFF" },
];

/* The registry — one row per skill, same idea as bots.RIG. `desc` is the
   player-facing effect line at rank r (plain English, UI-copy rule); `step`
   is what the next rank buys. maxRank only where a band cap lands.        */
export const SKILLS = [
  // ---- passives (cost order = reveal order) ----
  { id: "powerStrike", name: "Power Strike", kind: "passive", base: 20, growth: 1.5,
    desc: r => `+${Math.round(fx.powerStrike(r) * 100)}% ATK`, step: () => "+5% ATK" },
  { id: "doubleStrike", name: "Double Strike", kind: "passive", base: 60, growth: 1.6, maxRank: 12,
    desc: r => `${Math.round(fx.doubleChance(r) * 100)}% chance a hit lands twice`,
    step: r => fx.doubleChance(r + 1) > fx.doubleChance(r) ? "+2% chance" : "capped" },
  { id: "judgment", name: "Judgment", kind: "passive", base: 90, growth: 1.6,
    desc: r => `every ${JUDG_PERIOD}s, an automatic strike for ×${fx.judgMult(r)} ATK`,
    step: () => "+5× strike" },
  { id: "frenzy", name: "Frenzy", kind: "passive", base: 120, growth: 1.6, maxRank: 7,
    desc: r => `5% chance a hit grants +50% attack speed for ${fx.frenzyWin(r)}s`,
    step: r => fx.frenzyWin(r + 1) > fx.frenzyWin(r) ? "+1s window" : "capped" },
  { id: "finishingBlow", name: "Finishing Blow", kind: "passive", base: 250, growth: 1.7,
    desc: r => `every super crit triggers a bonus hit for ×${fx.finBonus(r).toFixed(1)} ATK`,
    step: () => "+0.5× bonus" },
  { id: "comboAttack", name: "Combo Attack", kind: "passive", base: 350, growth: 1.7,
    desc: r => `every ${COMBO_HITS} hits, a finisher for ×${fx.comboFin(r)} ATK; each finisher speeds the pip recharging by ${fx.comboShave(r)}s`,
    step: () => "+1× finisher" },
  { id: "battleTrance", name: "Battle Trance", kind: "passive", base: 450, growth: 1.7,
    desc: r => `1% chance a hit lights an ${fx.tranceWin(r)}s trance — every hit in it echoes for ×1 ATK`,
    step: () => "+1s trance" },
  { id: "meteor", name: "Meteor", kind: "passive", base: 600, growth: 1.7,
    desc: r => `1% chance a hit calls a meteor for ×${fx.meteorMult(r)} ATK`,
    step: () => "+3× meteor" },
  { id: "chaosStrike", name: "Chaos Strike", kind: "passive", base: 2000, growth: 1.8, maxRank: 9,
    desc: r => `${(fx.chaosChance(r) * 100).toFixed(1)}% chance a hit re-fires one of your other skills`,
    step: r => fx.chaosChance(r + 1) > fx.chaosChance(r) ? "+0.5% chance" : "capped" },
  // ---- actives ----
  { id: "rage", name: "Rage", kind: "active", base: 400, growth: 1.8,
    desc: r => `2× attack speed for ${fx.rageDur(r)}s`, step: () => "+3s" },
  { id: "might", name: "Might", kind: "active", base: 450, growth: 1.8,
    desc: r => `×${fx.mightMult(r).toFixed(1)} ATK for 30s`, step: () => "+0.1× ATK" },
  { id: "powerSmash", name: "Power Smash", kind: "active", base: 600, growth: 1.8,
    desc: r => `wind up for 6s, then one hit for ×${fx.smashMult(r)} ATK`, step: () => "+10×" },
  { id: "focus", name: "Focus", kind: "active", base: 800, growth: 1.8,
    desc: r => `every hit crits for ${fx.focusDur(r)}s`, step: () => "+1s" },
  { id: "bladeDance", name: "Blade Dance", kind: "active", base: 1000, growth: 1.8,
    desc: r => `your next ${COMBO_HITS} hits each carry a bonus slash of ×${fx.bladeBonus(r).toFixed(1)} ATK`,
    step: () => "+0.5× slash" },
  { id: "empower", name: "Empower", kind: "active", base: 1200, growth: 1.8,
    desc: r => `your passive skills act ${EMPOWER_RANKS} ranks higher for ${fx.empowerDur(r)}s`,
    step: () => "+2s" },
  { id: "wildSwing", name: "Wild Swing", kind: "active", base: 1500, growth: 1.8,
    desc: r => `one huge swing: 10% jackpot ×${fx.jackpot(r)} · 50% ×40 · 30% ×10 · 10% whiff`,
    step: () => "+10× jackpot" },
  { id: "energyBurst", name: "Energy Burst", kind: "active", base: 2500, growth: 1.8,
    desc: r => `costs no pip — every hit banks 1 Energy (max ${ENERGY_CAP}); release it all for ×${fx.burstRate(r).toFixed(2)} ATK per Energy`,
    step: () => "+0.1× per Energy" },
  { id: "secondWind", name: "Second Wind", kind: "active", base: 3000, growth: 1.8,
    desc: r => `refills every pip. Recharges on its own ${Math.round(fx.swClock(r) / 60)}min clock and stores one use`,
    step: r => fx.swClock(r + 1) < fx.swClock(r) ? "−1min clock" : "capped" },
];
export const SKILL_BY_ID = Object.fromEntries(SKILLS.map(s => [s.id, s]));
// Actives that spend a pip (Energy Burst spends Energy; Second Wind its bank).
const PIP_SPENDERS = new Set(["rage", "might", "powerSmash", "focus", "bladeDance", "empower", "wildSwing"]);

export function skillState() {
  return {
    ranks: {},          // id → rank (absent/0 = not learned)
    pips: 0, pipT: 0,   // banked pips + recharge progress (s)
    energy: 0,
    comboT: 0,          // hits accumulated toward the next finisher
    judgT: 0,           // Judgment metronome accumulator
    swT: 0, swBank: 0,  // Second Wind clock + stored use (max 1)
    hitCarry: 0,        // fractional swings carried between ticks (the roller)
    frenzyT: 0,         // Frenzy window remaining (s) — fight-local, real
    tranceT: 0,         // Battle Trance window remaining (s)
    // live burst timers, in REMAINING SECONDS — decremented by the same tick
    // live and offline, so the clamp law holds by construction
    rage: 0, might: 0, focus: 0, empower: 0, windup: 0, bladeHits: 0,
  };
}

export const rank = (state, id) => state.skills?.ranks?.[id] || 0;
export function cost(state, id) {
  const s = SKILL_BY_ID[id];
  if (!s) return Infinity; // retired id — reads "never affordable", like rigCost
  const r = rank(state, id);
  if (s.maxRank && r >= s.maxRank) return Infinity;
  return Math.round(s.base * Math.pow(s.growth, r));
}
export function buy(state, id) {
  const c = cost(state, id);
  if (state.copper < c) return false;
  state.copper -= c;
  state.skills.ranks[id] = rank(state, id) + 1;
  return true;
}

// Effective rank: Empower lifts every PROC passive (not the entry buff, not
// actives) by EMPOWER_RANKS while it runs. Band caps still bind — fx clamps.
export function effRank(state, id) {
  const r = rank(state, id);
  if (!r) return 0;
  const s = SKILL_BY_ID[id];
  if (s.kind === "passive" && id !== "powerStrike" && (state.skills?.empower || 0) > 0) {
    const lifted = r + EMPOWER_RANKS;
    return s.maxRank ? Math.min(s.maxRank, lifted) : lifted;
  }
  return r;
}

/* ── proc EV, for RATE consumers only ──────────────────────────────────────
   The LIVE fight rolls every proc for real (tick below) — this EV exists for
   the consumers that need a smooth rate: bot DPS borrowing (player coupling),
   Delve depth, time-to-breach projections, and the sim (which replaces all
   randomness with EV by design). E[roller] == this by construction; if you
   change a proc, change BOTH or the projections lie.
   Uptime procs (Frenzy, Trance) use renewal-process uptime x/(1+x) with an
   internal cooldown (no retrigger inside a window). Power Strike is NOT here
   — it's a deterministic buff and lives in derive()'s core product.        */
export function passiveMult(state, hits, cs, cf) {
  if (!state.skills) return { mult: 1, terms: [] };
  const terms = [];
  const add = (id, name, m) => { if (m > 1) terms.push({ id, name, x: m }); };
  const h = Math.max(0.1, hits);

  const rDS = effRank(state, "doubleStrike");
  if (rDS) add("doubleStrike", "Double Strike", 1 + fx.doubleChance(rDS));
  const rJ = effRank(state, "judgment");
  if (rJ) add("judgment", "Judgment", 1 + fx.judgMult(rJ) / (JUDG_PERIOD * h * cf));
  const rF = effRank(state, "frenzy");
  if (rF) {
    const x = 0.05 * h * fx.frenzyWin(rF);
    add("frenzy", "Frenzy", 1 + fx.frenzyHaste() * (x / (1 + x)));
  }
  const rFB = effRank(state, "finishingBlow");
  if (rFB) add("finishingBlow", "Finishing Blow", 1 + (cs.rate * cs.superRate * fx.finBonus(rFB)) / cf);
  const rC = effRank(state, "comboAttack");
  if (rC) add("comboAttack", "Combo Attack", 1 + fx.comboFin(rC) / (COMBO_HITS * cf));
  const rT = effRank(state, "battleTrance");
  if (rT) {
    const x = 0.01 * h * fx.tranceWin(rT);
    add("battleTrance", "Battle Trance", 1 + (x / (1 + x)) / cf);
  }
  const rM = effRank(state, "meteor");
  if (rM) add("meteor", "Meteor", 1 + (0.01 * fx.meteorMult(rM)) / cf);
  const rCh = effRank(state, "chaosStrike");
  if (rCh && terms.length) {
    // re-fires ONE random other proc: EV = chance × mean per-hit add of the rest
    const procs = terms.filter(t => t.id !== "powerStrike");
    if (procs.length) {
      const mean = procs.reduce((s, t) => s + (t.x - 1), 0) / procs.length;
      add("chaosStrike", "Chaos Strike", 1 + fx.chaosChance(rCh) * mean);
    }
  }
  return { mult: terms.reduce((m, t) => m * t.x, 1), terms };
}

// Deterministic skill buffs (no RNG, no EV) — multiplied into derive()'s core
// ATK product. Currently just Power Strike.
export function coreMult(state) {
  const r = rank(state, "powerStrike");
  return r ? 1 + fx.powerStrike(r) : 1;
}

// Live burst modifiers for derive(). allCrit: Focus forces every hit to tier
// ≥1 — derive sets cs.rate = 1 so the CP factor and the stream both surge.
export function activeMods(state) {
  const k = state.skills;
  if (!k) return { atkMult: 1, hitsMult: 1, allCrit: false };
  return {
    atkMult: k.might > 0 ? fx.mightMult(rank(state, "might")) : 1,
    hitsMult: k.rage > 0 ? 2 : 1,
    allCrit: k.focus > 0,
  };
}

/* ── the shared tick: live and offline are the SAME function ──────────────
   d = derive(state), emit(ev) receives display events, rng is injectable
   for tests. Returns { dmg } — the character's REAL damage this tick.

   THE ROLLER (2026-07-27, by user verdict — "passives should actually
   proc"): every swing is rolled for real here in the LOGIC tick — crit
   tier, Double Strike, Meteor, Trance echoes, Chaos, the Combo counter,
   Judgment's beat, Blade Dance riders. The boss's health chunks with what
   actually lands; nothing is smoothed. Swings past ROLL_CAP per tick
   (offline batches, ×600 dev speed) resolve at EV instead — same clamp
   philosophy as every offline path, and E[roller] == the EV by
   construction (see passiveMult).                                        */
export const ROLL_CAP = 2000; // rolled swings per tick before EV takes over

export function tick(state, dt, d, emit = () => {}, rng = Math.random) {
  const k = state.skills;
  if (!k) return { dmg: 0 };
  let dmg = 0;

  // pip recharge — stalls only at a full bank (the one designed loss)
  if (SKILLS.some(s => s.kind === "active" && PIP_SPENDERS.has(s.id) && rank(state, s.id) > 0)) {
    if (k.pips < PIP_CAP) {
      k.pipT += dt;
      while (k.pipT >= PIP_RECHARGE && k.pips < PIP_CAP) { k.pipT -= PIP_RECHARGE; k.pips++; }
      if (k.pips >= PIP_CAP) k.pipT = 0;
    }
  }
  if (rank(state, "secondWind") && k.swBank < 1) {
    k.swT += dt;
    if (k.swT >= fx.swClock(rank(state, "secondWind"))) { k.swT = 0; k.swBank = 1; }
  }
  if (k.windup > 0) {
    k.windup -= dt;
    if (k.windup <= 0) {
      k.windup = 0;
      const hit = fx.smashMult(rank(state, "powerSmash")) * d.atkCore;
      dmg += hit;
      emit({ type: "smash", dmg: hit });
    }
  }
  for (const t of ["rage", "might", "focus", "empower"]) k[t] = Math.max(0, k[t] - dt);
  k.frenzyT = Math.max(0, k.frenzyT - dt);
  k.tranceT = Math.max(0, k.tranceT - dt);

  // ---- the swing roller ----
  const atk = d.atkCore, cs = d.crit;
  // Frenzy's window is fight-local: it speeds the CHARACTER's swings here,
  // while rate consumers (bots, projections) see its EV via passiveMult.
  k.hitCarry += d.hitsPerSec * (k.frenzyT > 0 ? 1 + fx.frenzyHaste() : 1) * dt;
  let swings = Math.floor(k.hitCarry);
  k.hitCarry -= swings;
  if (swings > ROLL_CAP) { // batch overflow resolves at per-swing EV
    dmg += (swings - ROLL_CAP) * d.atk;
    // banked resources still accrue for the un-rolled swings
    if (rank(state, "energyBurst")) k.energy = Math.min(ENERGY_CAP, k.energy + (swings - ROLL_CAP));
    if (rank(state, "comboAttack")) k.comboT = (k.comboT + (swings - ROLL_CAP)) % COMBO_HITS;
    swings = ROLL_CAP;
  }
  const rDS = effRank(state, "doubleStrike");
  const rFB = effRank(state, "finishingBlow");
  const rF = effRank(state, "frenzy");
  const rT = effRank(state, "battleTrance");
  const rM = effRank(state, "meteor");
  const rCh = effRank(state, "chaosStrike");
  const rC = rank(state, "comboAttack");
  const swing = () => { // one rolled hit + its riders; returns damage, emits spectacle
    let out = 0;
    const h = rollHit(atk, cs, rng);
    out += h.dmg;
    emit({ type: "hit", dmg: h.dmg, tier: h.tier });
    if (h.tier === 2 && rFB) {
      const bonus = fx.finBonus(rFB) * atk;
      out += bonus;
      emit({ type: "finishing", dmg: bonus });
    }
    if (k.tranceT > 0) out += atk; // every hit in a lit trance echoes ×1
    return out;
  };
  for (let i = 0; i < swings; i++) {
    dmg += swing();
    if (rDS && rng() < fx.doubleChance(rDS)) dmg += swing(); // the double is a full second hit
    if (rM && rng() < 0.01) {
      const hit = fx.meteorMult(rM) * atk;
      dmg += hit;
      emit({ type: "meteor", dmg: hit });
    }
    if (rF && k.frenzyT <= 0 && rng() < 0.05) { // ICD: no retrigger while lit
      k.frenzyT = fx.frenzyWin(rF);
      emit({ type: "frenzy", dur: k.frenzyT });
    }
    if (rT && k.tranceT <= 0 && rng() < 0.01) {
      k.tranceT = fx.tranceWin(rT);
      emit({ type: "trance", dur: k.tranceT });
    }
    if (rCh && rng() < fx.chaosChance(rCh)) { // re-fires one owned proc at random
      const owned = [rDS && "double", rM && "meteor", rFB && "finishing"].filter(Boolean);
      if (owned.length) {
        const pick = owned[Math.floor(rng() * owned.length)];
        const hit = pick === "double" ? rollHit(atk, cs, rng).dmg
          : pick === "meteor" ? fx.meteorMult(rM) * atk
          : fx.finBonus(rFB) * atk;
        dmg += hit;
        emit({ type: "chaos", dmg: hit });
      }
    }
    if (rank(state, "energyBurst")) k.energy = Math.min(ENERGY_CAP, k.energy + 1);
    if (k.bladeHits > 0) {
      k.bladeHits--;
      dmg += fx.bladeBonus(rank(state, "bladeDance")) * atk;
    }
    if (rC) {
      k.comboT++;
      if (k.comboT >= COMBO_HITS) {
        k.comboT = 0;
        const hit = fx.comboFin(effRank(state, "comboAttack")) * atk;
        dmg += hit;
        if (k.pips < PIP_CAP) k.pipT += fx.comboShave(rC); // the pip shave
        emit({ type: "combo", dmg: hit });
      }
    }
  }
  if (rank(state, "judgment")) {
    k.judgT += dt;
    while (k.judgT >= JUDG_PERIOD) { // deterministic beat, REAL damage
      k.judgT -= JUDG_PERIOD;
      const hit = fx.judgMult(effRank(state, "judgment")) * atk;
      dmg += hit;
      emit({ type: "judgment", dmg: hit });
    }
  }
  return { dmg };
}

// Press an active. Returns null (can't) or an event for the caller to land:
// { spent, dmg?, label?, ... }. Buff casts while the same buff runs are
// blocked — stacking DIFFERENT windows is the sequencing game, restacking
// the same one is not.
export function cast(state, id, d, rng = Math.random) {
  const k = state.skills, r = rank(state, id);
  if (!k || !r) return null;
  if (PIP_SPENDERS.has(id)) {
    if (k.pips < 1) return null;
    const dur = { rage: fx.rageDur, might: () => 30, focus: fx.focusDur, empower: fx.empowerDur };
    if (dur[id]) {
      if (k[id] > 0) return null;
      k.pips--;
      k[id] = dur[id](r);
      return { spent: "pip" };
    }
    if (id === "bladeDance") {
      if (k.bladeHits > 0) return null;
      k.pips--;
      k.bladeHits = COMBO_HITS;
      return { spent: "pip" };
    }
    if (id === "powerSmash") {
      if (k.windup > 0) return null;
      k.pips--;
      k.windup = 6;
      return { spent: "pip", windup: 6 };
    }
    if (id === "wildSwing") {
      k.pips--;
      let roll = rng(), out = WILD_TABLE[WILD_TABLE.length - 1];
      for (const o of WILD_TABLE) { if (roll < o.p) { out = o; break; } roll -= o.p; }
      return { spent: "pip", dmg: out.mult(r) * d.atkCore, label: out.label, mult: out.mult(r) };
    }
  }
  if (id === "energyBurst") {
    if (k.energy < 1) return null;
    const hit = k.energy * fx.burstRate(r) * d.atkCore;
    const spent = Math.floor(k.energy);
    k.energy = 0;
    return { spent: "energy", energy: spent, dmg: hit };
  }
  if (id === "secondWind") {
    if (k.swBank < 1 || k.pips >= PIP_CAP) return null;
    k.swBank = 0;
    k.pips = PIP_CAP;
    k.pipT = 0;
    return { spent: "bank" };
  }
  return null;
}

export const fxValues = fx; // tests + UI peek at the per-rank curves
