# ROADMAP / session handoff — updated 2026-07-25 (2nd pass)

## Where the build stands (staging = latest, `4d41da7`)

Playable arc: intro attempt 0.0008% → unlock → bot swarm economy → gear/
Armory ranks → Warden health whittles down at Combat Power → Dungeon runs
spend the swarm for loot. W1 breaks at **11.8h (sim EV)**; sim flags it as
slightly under the 12h–2d target — deep Wardens stretch far longer.

All on `staging` (Pages serves it); **`main` lags 57 commits** pending user
approval — fast-forward main once the current staging build is approved.

Tabs, in unlock order: **Boss · Training · Grind · Player · Delve · Dungeon
· GM**.

**Next session: the UI de-duplication audit.** The design plan is written and
CHECK-passed at `.design-foundations/plans/2026-07-25-ui-dedup-audit.md`
(6 phases, Standard track, `design-for-ai` plugin). Resume with:

```
/design-for-ai:mock .design-foundations/plans/2026-07-25-ui-dedup-audit.md
```

That renders a cheap prototype and gates on user sign-off before
`/design-for-ai:build` executes the phases. Do NOT run `build` first — it
needs the mock's go/no-go.

Three deviations from the plugin's defaults are recorded in the plan and must
be honored by every dispatch:
1. **Artifacts live in `internal/`**, not the project root (repo rule: the root
   is the Pages web root). The plugin's agents check root by default — if one
   finds no DESIGN.md there it drops to greyscale wireframe mode while the real
   locked token file sits in `internal/`. Pass the paths explicitly.
2. **Dark ramp only** — the light-ramp contrast requirement is deliberately
   waived; the game ships dark-only.
3. **The canvas arena is spec-only** — it cannot be CSS-styled, HTML-mocked, or
   seen by a DOM-based reviewer. OPEN DECISION: whether Phase 6 also screenshots
   the real running game and hands that PNG to the review agent, so the arena
   gets critiqued on actual pixels instead of a stub. Needs the browser MCP.

**Visual brief — two corrections the user made during planning, both now in
memory and in the plan's Constraints:** the UI is a **working 2000s MMO game
client**, NOT a terminal (shell chrome is one register, living at the edges in
the log and meta surfaces), and NOT a ruin (the server runs fine and is
competently maintained — the only thing missing is other players). The feeling
comes from absence, not decay. No glitch, corruption, or broken frames.

### Systems live
- **Boss (idle battler, reworked `2aac2d2`):** the Warden is a persistent HP
  pool draining continuously at Combat Power. No Attempt button, no cooldown,
  no scars, no lucky pull — those are retired. Unlabelled health bar + big %,
  "time to breach" estimate (overwhelming → improving), always-on hit stream
  with MapleStory-style outlined damage numbers. Break → door opens → Descend.
  Broken walls farm set pieces on a timer. Offline drain clamped to live rate.
  (`18a76ea`: the in-bar INTEGRITY label is gone; BREACHED still prints, since
  that is a state and not a label. Readouts say "health".)
- **Dungeon (POC `4d41da7`, UNVALIDATED):** the wall is never HP — a run ends
  when a boss ability goes UNANSWERED, because attrition ate the bots that
  were answering it. You assign bots per ability, pick a difficulty ("key")
  and a pull-out floor, and send them in; they are SPENT, survivors return.
  Three abilities, each re-valuing a lane (Sunder→speed, Mass Dispel→gear,
  Summon Adds→atk). Journal fills itself in: meeting an ability logs it,
  answering it solves it, permanently. Difficulty never depletes on failure.
  Dying is a 60% loot penalty, not a wipe-out. Consumable: proxy rotation
  (250c/run, −25% ban rate) — the long-parked spoofing lane's home.
  Design doc: internal/DUNGEON-MECHANICS.md.
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
- **Bot swarm:** population flow (generator → capacity), NGU per-bar
  allocation (−/+/cap/max/0), training tiers with constant cost/fill + 50/s
  ceilings + RATE MAX, bot-only Grind zones (squad-DPS gates, chance drops
  1/400/kill), rig upgrades (multiclient/creator/script/overclock).
  **Grinding no longer bans anything** (`4d41da7`) — zone detection is gone
  entirely, so zone choice is pure throughput and the Dungeon is the swarm's
  only sink. The account-creator rank's job changed from treading water
  against bans to refilling between dungeon runs.
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

### Verification state (2026-07-25, 2nd pass)
- `npm test` green · `npm run sim` green (W1 11.8h, baseline restamped)
- Baseline drift this pass: two intermediate milestones moved one 600s bucket
  (power ×100, W1 90%). Cause is RNG-sequence shift from the affix pool going
  9→8 when Ban Counter was retired, NOT a balance change. W1 break unmoved.
- Live browser boot smoke-tested clean, zero console errors. Confirmed
  rendering: health bar, falling time-to-breach, canvas damage stream, rarity
  drops + auto-salvage, tab ladder, and a full Dungeon run (assign → send →
  attrition → abilities unblocked → party died floor 10 → 40% loot kept).

### Open playtest verdicts (user, on phone via Pages)
1. **Dungeon feel** — brand new, entirely unvalidated. Does spending bots for
   depth feel like a real decision, or like a tax?
2. **Idle-battler fight feel** — does the whittle read as progress or as dead
   waiting?
3. Armory rank-up spike — is it the "hit a new number" moment it's meant to be?
4. W1 at 11.8h — too short? HP is the compensating lever.
5. Grind with zero ban pressure — does removing the risk dial make zone choice
   feel flat, or just clean?
6. GM flag pacing; 50/s blur bars.

## Next-session queue (in rough priority; each runs feature-pass first)

0. **UI visual audit with the `design-for-ai` plugin** — the user's stated
   next step. Do this before more feature work.
1. **Playtest the Dungeon POC**, then iterate or cut. Everything below assumes
   it survives.
2. **Approve/iterate current staging build** → ff main (57 commits waiting).
3. **Dungeon 2a-2: named boss loot.** Per-boss Armory entries so running THAT
   boss means something ("I'm running the Nave for a charm"). The single
   biggest missing piece — right now dungeon loot is generic rolls.
4. **Dungeon 2b: 6 slots.** SLOTS 3 → 6 (helm · gloves · boots); Player grid
   and Armory columns widen.
5. **Dungeon 2c: grind-loot demotion.** Grind drops become Armory/scrap fuel
   only, Dungeon becomes the equippable source. **Deliberately last** — it
   guts the stash grid and removes the only gear source until dungeons tune.
6. **Offline instance progress.** A run currently cancels on reload and hands
   the bots back; there is no offline model. Must clamp exactly like the live
   path if built.
7. **Research (synergy edges) + Momentum (breadth mult)** — management depth.
8. **Tower reframe of Delve** (mostly thematic) + polish.
9. **Depth milestones** (parked): one-time rewards at boss-progress thresholds.
10. **W2 + twists/forensics/skills.** IMPORTANT sim finding that still holds:
    power plateaus at gear saturation + the enhance EV wall, so W2 difficulty
    CANNOT be a bigger number — it needs new tools. Dungeon abilities are now
    the intended vehicle for exactly this (each re-values a lane).
11. Mini-bosses as Lifecycle sub-rungs (middle content).

(Spoofing lane is DONE as of `4d41da7` — it became the Dungeon's proxy-rotation
consumable, which is where ban mitigation finally has a reason to exist.)

## Known debts / notes
- **The design guidelines are HEURISTICS, not law.** Do not turn one into a
  gate the user has to clear before work starts, and do not call them "law N".
  Only the hard vetoes are firm (no sound, no enhance ceremony, no AI skill
  icons, no obligation mechanics). System count currently sits at ten with
  Dungeons in, by explicit user decision — cut nothing until playtest says
  which system is dead.
- **DEAD AFFIX: `momentum`** (affixes.js) reads `state.dungeon.active`, which
  the Delve idle rework deleted. It always resolves to +0% haste and always
  displays "idle", while still occupying a roll slot. Either repoint it at the
  Dungeon (`state.instance.running` is the obvious target) or retire the row
  like Ban Counter was.
- At ×600 dev speed the Dungeon's log lines (ability unblocked, bots banned,
  party died) get flushed out of the log by Grind drop spam. Suggests the
  Dungeon wants its own feedback surface rather than sharing the log — judge
  it during the visual audit.
- W1 EV 11.8h sits just under the 12h–2d gate. Intentional-ish (deep Wardens
  stretch), but it's the first number to revisit after any CP-faucet change.
- Ticket yield curve + flag pricing barely hold the tickets→power loop.
- Render (rAF) freezes in hidden tabs; logic ticks on. Cosmetic, NGU does the
  same. Don't chase it as a bug again (cost a day twice).
- Stale-reference crashes have happened twice after big refactors — after any
  model change, grep for old identifiers before verifying in browser.
- Damage numbers and the boss health bar are CANVAS-drawn, not DOM — they
  won't appear in an accessibility-tree read. Screenshot to verify them. This
  matters for the visual audit: a DOM-only tool sees nothing inside the arena.
- UI copy rule (user, 2026-07-25): player-facing strings are **plain English**
  that say what you do and what happens. Flavor does not do instruction's job.
  "every live mechanic needs bots on its duty, or it goes unanswered" was
  rejected as AI slop; "Each boss ability needs a certain number of bots
  assigned to block it" replaced it.
- Dev servers: use the preview tool, not a bare `npx serve`. An orphaned
  `serve -l 5601 .` survived a crashed session and blocked the port until
  killed (2026-07-25).
- `?dev` panel: speed ×1–×600, +10k copper, finish pull, clear cooldown.
- Sim strategy is EV-greedy; if a new mechanic adds decisions, extend the
  waterfall in internal/sim.js and keep the gates.
