# ROADMAP / session handoff — updated 2026-07-26

## SESSION HANDOFF 2026-07-26 — design plans done, GAME CODE UNTOUCHED

**Read this first. The most important fact: none of the last two sessions'
design work has been applied to the game.** Load `index.html` today and you
get the old UI. Everything below is specification and mocks in `internal/`.
`npm test` is green precisely because no game file was edited.

`staging` is **17 commits ahead of `origin/staging` (unpushed)**; `main` is
untouched and still awaits approval. Nothing was pushed because it is all
non-deployed `internal/` work.

### What got built

**Plan 1 — `.design-foundations/plans/2026-07-25-ui-dedup-audit.md` — COMPLETE
(6 phases, commits `dd4e1da` → `97044fe`).** Produced the contract the UI never
had:
- `internal/JOURNEY.md` — JTBD job story, the tab ladder as IA, a
  fact-ownership table where every displayed fact has exactly ONE owner and a
  declared STATE (live / dormant / locked), six page specs, and final copy.
- `internal/DESIGN.md` — token block, type scale, motion budget, component
  specs, a dimension scale derived from the shipped CSS.
- `internal/mocks/*.html` — six surfaces, plus `build.mjs` (emits all six from
  one CSS source and ASSERTS no hex / no rgb / no untokenized px / no external
  refs, exiting non-zero), `shoot.mjs` (headless capture, zero-dep CDP) and
  `contrast.mjs` (49 gated pairs).
- Result: horizontal overflow **414px → 375px**; the ~136 dormant-at-live-
  weight items now read apart; a locked row draws NO allocation control, taking
  21 inert alloc clusters to zero.

**Plan 2 — `.design-foundations/plans/2026-07-26-visual-pass-and-help-tab.md`
— Phase 1 of 3 done, Phases 2 and 3 NOT STARTED.** Plan 1 explicitly forbade
inventing a visual identity, so its output was tidier but looked the same, and
the user rejected it as not beautiful. Phase 1 did the excluded part:
- v2 (Art Deco, from a Ruler archetype) — **rejected twice**: "the script and
  styling irks me, the early MMO UI vibe isn't there".
- v3 (`066b5ec`) — **MapleStory construction on the dark ramp**: chunky rounded
  windows, title bars, sockets cut in with inner shadow, glossy pressable
  plates, compact bold sans with a hard shadow. Archetype re-derived to
  **Everyman + Sage** (Ruler's documented gravity describes a bank).
- User verdict: **"acceptable for now"** — provisional, NOT sign-off. Only
  `internal/mocks/boss.html` carries v3; the other five took a single
  `--font-body` token line. The Grind specimen inside `boss.html` is the
  list-surface preview. **Re-check the direction before spending it on five
  more surfaces.**

### THE QUEUE — integration pass, 8 code changes, none applied

The user deferred all of these to ONE pass after the design work. Six are
specified in `internal/DESIGN.md`'s "Required behavior changes"; all eight are
real defects in the SHIPPED game, independent of any redesign:

1. **`battle.js drawBars()`** draws the boss HP label in near-black over the
   empty track — **1.23:1**, unreadable for most of every fight.
2. **`bots.js:154` copper is BASE, not final.** `copperPerSec = kps × z.copper`;
   `player.copperMult` is applied separately at credit time (`bots.js:228`), so
   `main.js:852` prints a rate the player never banks (~4,650 shown vs ~5,766
   actual). Show the final with the multiplier trailing.
3. **Locked rows accept allocation input and silently discard it** — no lock
   gate in `bots.setAlloc` (`bots.js:116-122`) or the wiring (`main.js:296-309`).
4. **`setParty()` (`main.js:484-488`) checks `running` but never
   `dutyUnlocked`** — Dungeon duty buttons stay clickable while their sibling
   `<input>` correctly disables.
5. **Grind's `.locked` class (`main.js:841`) conflates two states** — genuinely
   locked zones and live manned zones that can't hold get identical treatment.
   Split into `locked` and a `struggling` class at full opacity with `--warn`.
6. **`style.css:133` `#logHead`** hardcodes `#4e7a5e` = 3.97:1, outside the
   token set. → `--logline`.
7. **`.pip.miss`** uses `--faintest` (3.04:1) on genuine 10px text. → `--faint`.
   Also `cursor: help` promises a tooltip that does not exist.
8. **`rarity.js` `mythic`** `#d64a4a` → `#d85454` (4.20 → 4.52:1).

Dead CSS confirmed by grep, safe to delete: `.ztable`, `#pullBtn`,
`#ticketGain`, `#tierAtk`/`#tierSpeed`, `#gmSec`/`#gmPanel`,
`.tier-risk`/`.tier-nightmare`.

### Then: Plan 2 Phase 2 (Help tab) and Phase 3 (recompose)

Phase 2 is a **7th tab in the row** (user's explicit choice over a `?` pane —
the row must re-fit for seven at 375px). It moves every mechanic explanation
off the live surfaces. The rule established this session: **fixed terms →
ledger table, state → short line, mechanic explanation → Help.** Four blocks
were already hand-fixed this way (`eba1698`, `9e2f394`, `3b3f681`); the rest of
every surface still needs the sweep. Phase 3 then recomposes the five
remaining surfaces plus Help in v3.

### Hard-won rules from this session — do not re-derive

- **Surface separation is an L\* question; only text is a ratio question.**
  WCAG's `+0.05` flare term crushes dark-on-dark ratios toward 1.0, so an
  invisible surface pair reads as an acceptable 1.04:1. The whole ramp was
  compressed into ~3 L\* and `--inset` was *lighter* than `--panel` while named
  "recessed". Use `internal/mocks/contrast.mjs`, which prints both.
- **Ornament fails toward "ruin" by default.** A rule with a gap in it (a
  per-cell `border-top` interrupted by a grid column-gap) reads as damage,
  which the no-decay constraint forbids. Full-span rule elements instead.
- **A manual token sweep cannot establish its own exhaustiveness.** Four review
  rounds each falsified a prior "exhaustive" claim in a new place: no dimension
  tier → values outside the shape being looked for → a whole property
  (`margin-top`) → a composed selector. `build.mjs`'s assertions are the
  durable answer; DW-6.2 was extended to cover px because of this.
- The copy pass's brief ("spell out numbers and consequences") **over-applied**
  and produced a tutorial in every HUD. See the ledger rule above.

## Where the build stands (game code as of `4d41da7` — unchanged since)

Playable arc: intro attempt 0.0008% → unlock → bot swarm economy → gear/
Armory ranks → Warden health whittles down at Combat Power → Dungeon runs
spend the swarm for loot. W1 breaks at **11.8h (sim EV)**; sim flags it as
slightly under the 12h–2d target — deep Wardens stretch far longer.

All on `staging` (Pages serves it); **`main` lags 57 commits** pending user
approval — fast-forward main once the current staging build is approved.

Tabs, in unlock order: **Boss · Training · Grind · Player · Delve · Dungeon**.
(GM retired in `82d2d99` — see below.)

### RETIRED in `82d2d99`: the GM tab + the whole ticket economy
The UI audit found four GM purchases selling upgrades for mechanics the
idle-battler rework had already deleted (`scheduler`, `idleProc`, encounter
lockout, scar cap) — tickets spent on them bought nothing. Tickets had no sink
outside GM, so both went together. **The meta currency is being redesigned from
scratch; that work is unstarted.**

Consequences now live in the build:
- Wall breaks and farm ticks no longer pay tickets. Farming a broken Warden is
  purely a set-piece roll.
- `gm.cap` no longer widens bot capacity; `gm.offline` no longer extends the
  offline clamp. Server privileges (`tPower/tSpeed/tGen/tCap`) are gone.
- **Auto-equip lost its GM gate and now defaults OFF** — a plain opt-in toggle
  in the gear filter. Deliberate: "no auto-equip, agency to build" is a locked
  decision, and inheriting it for free would have silently reversed it.
- The Delve's "support backlog" node (+% tickets) is gone; save migration
  carries over only ranks the tree still has.
- Sim unaffected: W1 still 11.8h, `baseline.json` unchanged.

**Next session: execute Phase 1 of the UI de-duplication plan.** The plan is
written, CHECK-passed and reconciled at
`.design-foundations/plans/2026-07-25-ui-dedup-audit.md` (6 phases, Standard
track, `design-for-ai` plugin). The current state is already MEASURED — see
`internal/UI-AUDIT.md`; Phase 1 starts from it rather than re-deriving it.

Phase 1 produces `internal/JOURNEY.md`: Job, Journey, IA, and the fact-ownership
map (every displayed fact → exactly one owning tab, plus each row's STATE —
live / dormant / locked, which is DW-1.5 and the audit's biggest finding).

`npm run shots` re-captures all six tabs + the Dungeon mid-run at 375px
whenever you need current pixels.

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

0. **UI de-dup plan, Phase 1** (see above). Audit is DONE; the plan is
   reconciled and ready to execute.
0b. **Meta-currency redesign** — GM and tickets are retired and nothing replaces
   them yet. Boss breaks currently pay no meta reward at all, so this is a real
   hole in the reward loop, not just a missing tab. Carry forward from the dead
   GM: affordability signalled by button fill, ONE row grammar per action, and
   a sink that exists before the faucet ships.
1. **Playtest the Dungeon POC**, then iterate or cut. Everything below assumes
   it survives.
2. **Approve/iterate current staging build** → ff main (60+ commits waiting,
   none of it playtested — Armory, design-system stages, the idle-battler
   rework, the Dungeon POC, ban-free Grind, and now the GM/ticket removal).
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
  like Ban Counter was. **Still outstanding.**
- **Stale element references are the recurring failure mode.** Removing markup
  while leaving a `$("id")` lookup in the render throws, and the guard in
  gameLoop swallows it — so everything below that line silently stops updating.
  It happened again in `82d2d99` (`ticketGain` blanked the whole Boss readout).
  After any markup removal, run this cross-check:
  `python` over `index.html` ids vs every `$("...")` in `main.js`. Zero
  mismatches is the bar.
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
