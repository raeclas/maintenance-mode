# ROADMAP / session handoff — updated 2026-07-22

## Where the build stands (staging = latest, `34c3dcc`)

Playable arc: intro attempt 0.0008% → unlock → bot swarm economy → W1
break EV 6.5d (sim-gated 4–7d). All on `staging` (Pages serves it);
`main` lags ~16 commits pending user approval — **fast-forward main once
the current staging build is approved.**

### Systems live
- **Boss:** Attempt (renamed from Pull), scars (cap 27% + GM ranks),
  projection band + "required power ×N", enrage/depth bars (absolute
  fill by user decision), milestone-only Vess dialogue, encounter
  scheduler + idle processing (GM unlocks), tickets on every resolve.
- **Enhance:** full §5 heartbeat — safe/risk/nightmare (+20), checkpoints
  +10/+15, failstacks (cap +15pts), safeguard ≤+15, compounding power
  1.12^plus, visual row flash feedback, titles +18+, bot enhance squad
  (target slot+plus, real odds/copper).
- **Bot swarm:** population flow (generator → capacity, bans drain),
  NGU per-bar allocation (allocMini: −/+/cap/max/0 on every bar),
  training tiers with constant cost/fill + 50/s ceilings + RATE MAX,
  bot-only zones (squad-DPS gates, chance drops 1/400/kill, per-zone
  detection), rig upgrades (multiclient/creator/script/overclock).
- **GM tab:** damage/haste overrides (era-priced, uncapped), scheduler +
  idle processing unlocks, utility ranks (session cap/idle timeout/
  lockout/scar cap).
- **Meta:** copper + tickets (hard two), lexicon (§16), feature-pass
  skill gates every feature, staging/main two-channel workflow,
  clarify-before-building rule in CLAUDE.md.

### Open playtest verdicts (user, on phone via Pages)
1. Bot-only Grind feel — deepest structural change yet, unvalidated.
2. GM flag value (damage/haste override pacing).
3. 50/s blur + solid-at-cap bars — satisfying or noisy?

## Next-session queue (in rough priority; each runs feature-pass first)

1. **Approve/iterate current staging build** → ff main.
2. **Ban Wave rebirth** (§7b — DESIGNED, not built). Resets bots/bars/
   copper; keeps gear/scars/story/rig ranks; pays Scripts (√ payout,
   bot-output multiplier + automation spends). Sim gate: optimal
   cadence ≥12h. The biggest missing loop.
3. **Spoofing lane** (old "mechanic ②"): per-bot ban mitigation stat —
   detection counterplay, risk-reward dial for hot zones. Fits rig
   (botter register).
4. **Boss dead-time option 3:** Overcharge — one timed button during the
   attempt window, ±10% depth, auto-fires at 80% when idle (§3).
5. **Depth milestones** (option 2, parked): one-time rewards at 0.1%/1%/
   10%/50%/90% per boss.
6. **W2 + twists/forensics/skills** (Slice 2 §13). IMPORTANT sim finding:
   power plateaus hard at gear saturation + enhance EV wall (90M breaks,
   180M never, at old economy) — W2 difficulty CANNOT be a bigger number;
   it needs the new tools (twists re-valuing lanes, skill loadout, next
   gear tier). Design with game-design skill + feature-pass.
7. **Reforge / item verbs** under Player tab (user mentioned; unspecced).
8. Mini-bosses/dungeons as Lifecycle sub-rungs (middle content).

## Known debts / notes
- Ticket yield curve (150×√depth) + flag pricing barely hold the
  tickets→power loop — re-check after any attempt-rate change.
- Render (rAF) freezes in hidden tabs; logic ticks on. Cosmetic, NGU
  does the same. Don't chase it as a bug again (cost a day twice).
- Two stale-reference crashes happened after big refactors — after any
  model change, grep for old identifiers before verifying in browser.
- `?dev` panel: speed ×1–×600, +copper, finish pull, clear cooldown.
- Sim strategy is EV-greedy; if a new mechanic adds decisions, extend
  the waterfall in internal/sim.js and keep gates: W1 break 4–7d,
  ×10 ≤1h, depth 1% ≤1d.
