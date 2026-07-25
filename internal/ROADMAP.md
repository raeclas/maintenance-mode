# ROADMAP / session handoff — updated 2026-07-25

## Where the build stands (staging = latest, `2aac2d2`)

Playable arc: intro attempt 0.0008% → unlock → bot swarm economy → gear/
Armory ranks → Warden integrity whittles down at Combat Power. W1 breaks at
**11.8h (sim EV)**; sim flags it as slightly under the 12h–2d target — deep
Wardens stretch far longer.

All on `staging` (Pages serves it); **`main` lags 54 commits** pending user
approval — fast-forward main once the current staging build is approved.

Tabs, in unlock order: **Boss · Training · Grind · Player · Delve · GM**.

### Systems live
- **Boss (idle battler, reworked `2aac2d2`):** the Warden is a persistent HP
  pool draining continuously at Combat Power. No Attempt button, no cooldown,
  no scars, no lucky pull — those are retired. INTEGRITY bar + integrity %,
  "time to breach" estimate (overwhelming → improving), always-on hit stream
  with MapleStory-style outlined damage numbers. Break → door opens → Descend.
  Broken walls farm set pieces on a timer. Offline drain clamped to live rate.
- **Crits:** two-tier cascade — 10% crit ×2, of those 20% super crit ×5 —
  rolled into ONE displayed CP factor (×1.16 base). `n*` gold, `n**` orange.
  critRate/critDmg affixes feed it (lane `"crit"`).
- **Gear:** 7 rarities Common..Origin, standardized drop odds across zones
  (zones scale ip base only); rarity = affix COUNT, ip = affix TIER. Lanes are
  code, affixes are data. Salvage → tiered Scrap; Reforge bench rerolls affixes
  (ip-capped, non-destructive). Stash is a scannable slot-grouped grid with
  gold ▲ upgrade markers. Auto-equip exists as a GM-gated module (60 tickets),
  toggleable — early agency preserved.
- **Armory (`8408bba`):** every named item (slot × zone) is an entry; every
  drop MERGES in (rarer copies weigh more). Geometric thresholds rank the entry
  up and grant a permanent displayed lane passive (weapon→atk, armor→haste,
  charm→copper). Band-capped RMAX=12, survives Ban Wave, fed by bot drops so
  playtest-gated not sim-gated. This is the "gear is never useless" answer.
- **Enhance:** full §5 heartbeat — safe/risk/nightmare (+20), checkpoints
  +10/+15, failstacks (cap +15pts), safeguard ≤+15, compounding 1.12^plus,
  row-flash feedback, titles +18+, bot enhance squad.
- **Bot swarm:** population flow (generator → capacity, bans drain), NGU
  per-bar allocation (−/+/cap/max/0), training tiers with constant cost/fill +
  50/s ceilings + RATE MAX, bot-only Grind zones (squad-DPS gates, chance drops
  1/400/kill, per-zone detection), rig upgrades (multiclient/creator/script/
  overclock).
- **Delve:** idle depth engine — reachDepth = safeDepth(build DPS) + Reach
  ranks, mines Cache/sec. Cache tree (era-priced) feeds EVERY system: deeper
  bore · cache sifter · recovered overclock (+%ATK) · salvage beacon (+%drops)
  · buried scripts (+%train) · support backlog (+%tickets). Idle + offline.
  Deliberately not sim-modelled (ranks 0 → bonus 1.0, conservative).
- **Ban Wave rebirth (`rebirth.js`, wired in main.js):** BUILT. Resets bots/
  bars/copper only; gear/Armory/scars-era canon/story/rig ranks survive.
- **GM tab:** damage/haste overrides (era-priced, uncapped), idle-processing
  unlocks, auto-equip module, utility ranks.
- **Design system (stages 1–3, COMPLETE):** semantic token vocabulary, enforced
  `--fs-*` type scale, every color var-ified, unified CTA buttons, `.caption`
  role for status readouts.
- **Meta:** copper + tickets + scrap + Cache, lexicon (§16), feature-pass skill
  gates every feature, staging/main two-channel workflow, clarify-before-
  building rule in CLAUDE.md.

### Verification state (2026-07-25)
- `npm test` green · `npm run sim` green (W1 11.8h, baseline stamped, no drift)
- Live browser boot smoke-tested clean, zero console errors: integrity bar,
  falling time-to-breach, canvas damage stream, rarity drops + auto-salvage,
  tab-unlock ladder all confirmed rendering.

### Open playtest verdicts (user, on phone via Pages)
1. **Idle-battler fight feel** — biggest change in the build, unvalidated on
   mobile. Does the whittle read as progress, or as dead waiting?
2. Armory rank-up spike — is that the "hit a new number" moment it's meant to be?
3. W1 at 11.8h — too short? HP is the compensating lever.
4. Bot-only Grind feel; GM flag pacing; 50/s blur bars.

## Next-session queue (in rough priority; each runs feature-pass first)

1. **Approve/iterate current staging build** → ff main (54 commits waiting).
2. **Idle-battler slice 2: Dungeons + 6-slot gear** (REWORK-IDLE-BATTLER.md
   §build order). Splits the gear economy into two non-overlapping lanes:
   Grind drops become FUEL only (Armory + scrap, never equippable, no triage
   chore); Dungeons become the only equippable source via active instanced
   runs. Expands SLOTS 3 → 6. The active loop works here because the stakes
   are the gear itself, not fungible copper (which is why active Delve failed).
3. **Idle-battler slice 3: Research (synergy edges) + Momentum (breadth mult)**
   — management depth so there's always a next decision.
4. **Idle-battler slice 4: Tower reframe of Delve** (mostly thematic) + polish.
5. **Spoofing lane:** per-bot ban mitigation stat — detection counterplay,
   risk-reward dial for hot zones. Fits the rig/botter register.
6. **Depth milestones** (parked): one-time rewards at boss-progress thresholds.
7. **W2 + twists/forensics/skills.** IMPORTANT sim finding that still holds:
   power plateaus at gear saturation + the enhance EV wall, so W2 difficulty
   CANNOT be a bigger number — it needs new tools (twists re-valuing lanes,
   skill loadout, next gear tier).
8. Mini-bosses as Lifecycle sub-rungs (middle content).

## Known debts / notes
- W1 EV 11.8h sits just under the 12h–2d gate. Intentional-ish (deep Wardens
  stretch), but it's the first number to revisit after any CP-faucet change.
- Nine-system budget (guideline 7) is TIGHT: Boss, Training, Grind, Gear/
  Enhance, Armory, Delve, GM, Rebirth, Trophies. **Dungeons in slice 2 needs
  a deletion or a merge** — most likely Delve folding into the Tower reframe.
- Ticket yield curve + flag pricing barely hold the tickets→power loop.
- Render (rAF) freezes in hidden tabs; logic ticks on. Cosmetic, NGU does the
  same. Don't chase it as a bug again (cost a day twice).
- Stale-reference crashes have happened twice after big refactors — after any
  model change, grep for old identifiers before verifying in browser.
- Damage numbers are CANVAS-drawn, not DOM — they won't appear in an
  accessibility-tree read. Screenshot to verify them.
- Dev servers: use the preview tool, not a bare `npx serve`. An orphaned
  `serve -l 5601 .` survived a crashed session and blocked the port until
  killed (2026-07-25).
- `?dev` panel: speed ×1–×600, +10k copper, finish pull, clear cooldown.
- Sim strategy is EV-greedy; if a new mechanic adds decisions, extend the
  waterfall in internal/sim.js and keep the gates.
