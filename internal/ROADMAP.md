# ROADMAP / session handoff — updated 2026-07-27 (FIRST REAL PLAYTEST)

## ⚠ START HERE — playtest verdict 2026-07-27

The user played the build on a phone. **This is the first hands-on verdict on
any of it**, and it outranks everything in the queue below. Their words:

> "Honest lack of actively managed content, just feels like waiting game but
> not the good kind."

That is the headline. Everything else is a contributing cause or a side note.

### P1. The opening is dead for ~40 minutes — FIX FIRST

Measured against the real modules, not guessed:

| | |
|---|---|
| starting bots | 8, at `botDps` **0.232** each |
| squad DPS on z1 | **1.86** against a 12 HP mob |
| observed rate | **0.155 kills/s — one kill every 6.5 seconds** |
| copper income | 0.77 c/s |
| first rig upgrade | 200c (`power`) — ~4.3 min of watching |
| the WHOLE rig | 200 + 300 + 500 + 800 = **1,800c ≈ 40 min** |

The zone row literally renders `0.15 kills/s`, which reads as broken rather
than as slow. The opening is one shopping list with no decisions in it.

**The sim cannot see this, and that is a durable lesson (see Hard-won rules).**
Its arithmetic is correct — `bots.js:224` and `internal/sim.js:93` use the same
formula — but every milestone it prints is a DESTINATION ("power ×10 at 40m",
"z2 held at 1.0h"). It has no readout for the observable rate at minute zero.
A previous session cited the sim as evidence for this exact defect; the sim
structurally could not have measured it.

### P2. Gear — normal mobs should stop dropping equippables

User: *"i said previously i didn't want normal mobs to drop gear anymore."*
Correct, and it is already logged as queue item 5 (**Dungeon 2c: grind-loot
demotion**) — grind drops become Armory/scrap fuel only, the Dungeon becomes
the equippable source. The live faucet is `DROP_CHANCE = 1/400` per kill in
`farm.js:5`.

It was sequenced LAST on purpose: *"it guts the stash grid and removes the only
gear source until dungeons tune"*, and the Dungeon is still an unplaytested POC.
**So do not pull the grind faucet alone.** Either tune dungeons first or ship
both in one slice — a gap where nothing drops is worse than either end state.

Note the rest of the gear overhaul HAS shipped and the user may not have
noticed: affixes roll on every drop (`gear.js:43`), rarity sets affix count, ip
sets tier, salvage→scrap and reforge are live (slices 1 and 2). What makes it
still read as "the old system" is scale — **3 slots, not 6** (queue item 4) and
no named boss loot (queue item 3).

### P3. Skills — the user's own suggestion for the headline problem

> "Add player skills, levelled with copper. Passive and active."
> "Possible to add non combat skills for additional management as well"

Not designed yet. Three things settled before anyone starts:

- **Copper-levelled dodges the trap that deleted Levels.** The 2026-07-21
  deletion was about XP as a pacing stat and per-level treadmill costs
  (REMAKE-DESIGN §7). A copper spend is a decision, not a treadmill. This is
  compatible with the post-mortem — do not reject it by reflex.
- **The nine-system budget is GONE (2026-07-27).** *"remove the system budget
  law, free to add systems for fun."* Skills do not have to justify their
  existence against a quota and nothing has to be deleted for them. What
  survives from guideline 7 is the useful half: a new system should OVERLAP the
  ones already there. Skills do — they ride `crits.js` `rollHit()` and the
  copper wallet the rig already spends from.
- **Taxonomy, from the user 2026-07-27** — three kinds, and they are not equal:
  1. **Trigger/proc (passive)** — on attack, a chance to fire an effect. THE
     STRONG ONE. `rollHit()` is already a per-hit roll returning a tier, and
     `battle.js` already renders tiers as sized, coloured, shaking numbers, so
     a proc has machinery AND a display home. Gives the idle loop texture with
     zero input, which is the direct answer to "waiting game, not the good
     kind".
  2. **Active (input)** — WANTED. Press a skill for a burst: "2x attack speed
     for 30s, 300s cooldown", summon meteor, and so on. Requires the player to
     be there, which is the POINT — the headline complaint was a lack of
     actively managed content.
     **[CORRECTED 2026-07-27.]** An earlier note in this file claimed actives
     were legal only in the Delve's push-your-luck shape, on the grounds that a
     cooldown you service is an obligation mechanic. That over-applied the hard
     veto, which names dailies, streaks, FOMO, calendar events and lockouts —
     CALENDAR and SESSION obligations. A cooldown burst is none of them: it
     does not decay, reset a streak, or care when you log in. Do not re-derive
     the stricter reading.
     The real question is narrow and numeric: **how big is the gap between a
     player who babysits the cooldown and one who does not?** Too wide and an
     idle game becomes a phone-checking game. Cleanest answer is to let the
     cooldown tick OFFLINE and bank charges up to a cap — absence then costs
     nothing, you just return with bursts saved, and the active is a bonus for
     being there rather than a penalty for not.
  3. **Direct buff (passive)** — the trap. The rig already IS this (`script
     version` +0.25 power/rank, `overclock` +0.20 speed/rank, bought with
     copper). A copper-bought +X% is a stat dribble, which is what feature-pass
     gate 1 exists to kill. Useful only as a CHEAP ENTRY TIER that leads to
     the procs.
- **Skill copper competes with the RIG — same wallet.** Settled, stop asking.
  Every purchase forks between more swarm and more character; that fork is the
  management layer being asked for, and it costs no new currency.
- **Skills may BE the P1 fix.** The opening is dead because the first purchase
  is 200c at 0.77 c/s. An entry tier around ~20c puts a real decision inside
  the first 30 seconds. One change fixes the dead opening and adds the managed
  content — scope procs + entry tier first, actives as a second slice once
  procs have been felt.
- **OPEN QUESTION, unanswered, and it decides the whole shape:** what does
  skill copper COMPETE with? A fourth thing to buy alongside the rig is another
  menu. Skills drawing on the SAME copper the rig wants makes every purchase a
  fork — which is the "actively managed" feeling being asked for.
- Hard veto still applies: no obligation mechanics. An active skill must not
  punish you for not clicking.

### P3/P1 SHIPPED 2026-07-27 — the skill book (skills.js), full 18-skill design

The whole book from the approved design (9 passives incl. the 20c entry, 9
actives on ONE shared pip pool) is in the game and on staging. Key facts:

- **PIP_CAP = 5 in skills.js is THE USER'S DIAL** (they asked to own this
  number). 5 × 300s = 25min zero-loss window. One constant.
- ~~Passive EV folds into derive() as the displayed "skills ×" term~~
  **[CORRECTED same day, user verdict: "passives should actually proc."]**
  The EV fold shipped first and the user was not a fan once told the procs
  were theater. Now: skills.tick is a REAL per-swing roller (crit tier,
  every proc, riders, Judgment's beat) — the boss's health chunks with what
  lands; battle.js draws only real numbers forwarded from the logic tick.
  passiveMult() KEEPS the matching EV for rate consumers (bot borrowing,
  Delve, time-to-breach, sim) — E[roller] == EV by construction; change a
  proc, change both. Overflow past ROLL_CAP (offline batches, ×600 dev)
  resolves at EV — the clamp. The "skills ×" header readout is deleted.
- Actives are REAL effects (Rage/Might/Focus/Empower timers, windup, riders);
  burst damage lands through pull.js smite() — one break transition for every
  damage path. Sim buys PASSIVES only (actives are timing feel — sim is a
  lower bound, per the hard-won rule).
- **W1 HP 300e9 → 25e12 (×83), W2–W10 rescaled by the same factor.** The
  EV-greedy skill stack had collapsed W1 to 2.7h; HP is the sanctioned lever.
  Sim W1 break back at 11.8h, baseline restamped in the same commit.
- UI: Boss tab, rig row grammar, learned + next-two reveal ladder, hotbar +
  pip row. Wild Swing whiff is ×0 (drama — playtest owns it).
- NOT DONE: mock generator (build.mjs) has no skills section yet — design
  contract debt. Rakshasa prompt-minigame parked pending user confirmation.

### CUT 2026-07-27 — the Dungeon (instance.js), by user verdict

*"iffy on the dungeon … obstructive and just there for the sake of being
there."* The POC never earned a better verdict, and cutting was always the
sanctioned outcome ("playtest, then iterate or cut"). Removed whole:
module, tab, party board, journal, proxy consumable, momentum affix (dead
since the Delve rework — always +0%). Saves with a run mid-flight hand the
staffed bots back on load, then the block drops.

Consequences now open:
- **The swarm has no sink again.** Bots exist for training + zones only;
  Ban Wave is the only pressure. Fine for now — reopen only if the farm
  feels aimless in play.
- **Gear queue items 3/4/5 (named boss loot · 6 slots · grind demotion)
  are MOOT in their dungeon-shaped form.** Superseded by the gear-collapse
  direction (below), pending the user's sign-off on flood + enhance
  balance.
- Dungeon 2a/2b/2c, offline instance progress (queue 6), and the
  DUNGEON-MECHANICS.md doc are historical.

### Fixed during the playtest

- Locked Armory zones z6–z15 are no longer rendered at all (`2028ff8`). They
  had been collapsed to one line each earlier the same session; the user's
  verdict was that even that clutters. Grind already shows the zone ladder.

---


## SESSION HANDOFF 2026-07-26 — the design work is now IN THE GAME

**Read this first.** The previous version of this file opened by saying none
of the design work had been applied and that `npm test` was green precisely
because no game file had been edited. **That is no longer true and has not
been since `426cf70`.** Load `index.html` today and you get DNA v4: seven
tabs, colour lanes, the chat window, and the teaching copy gone from the
live surfaces.

`staging` carries everything and is pushed. **`main` is still unmerged and
awaiting the user's approval** — fast-forward it once the current staging
build is signed off (two-channel rule: never advance `main` unasked).

### Both design plans are COMPLETE

- **Plan 1** — `.design-foundations/plans/2026-07-25-ui-dedup-audit.md`.
  Produced the contract the UI never had: `internal/JOURNEY.md`
  (fact ownership, per-row state, page specs), `internal/DESIGN.md`, and six
  mocks with `build.mjs` / `shoot.mjs` / `contrast.mjs`. Overflow 414px → 375px.
- **Plan 2** — `.design-foundations/plans/2026-07-26-visual-pass-and-help-tab.md`,
  4 phases (a Phase 2.5 was inserted mid-flight). Visual DNA v4, the Help tab,
  the copy relocation, and the chat window. All committed, all reviewed.

### Then it was INTEGRATED — six commits, game code

| Commit | What |
|---|---|
| `426cf70` | v4 token set into `style.css`; 37 monospace + 4 Georgia sites retired; `rarity.js` AA fixes |
| `dcc4bff` | v4 construction layer (frames, bevels, rivets, tab accents) + markup hooks |
| `55734e8` | rarity plates and IP power bands wired into `main.js` |
| `2295fe6` | the chat window — System / General, no badge |
| `dd883bb` | Help as the seventh tab; the help modal retired |
| `78e900a` | teaching copy cut off the live surfaces |

Tabs, in unlock order: **Boss · Training · Grind · Player · Delve · Dungeon ·
Help**. The row is a 4-column grid (4+3 at 375px) — it was `display:flex` with
`flex:1` buttons, which cannot shrink below their content and forced every
page to 434px.

`npm test` and `npm run sim` green throughout, `baseline.json` unchanged — no
gameplay code moved in any of the six.

### THE QUEUE — CLOSED. All 8 integration defects are fixed.

`#6` and `#8` closed during the integration pass; the other six in `a85c8d1`.
Kept here as the record of what they were, because several were long-lived and
the reasoning is worth not re-deriving.

1. **Boss HP label, 1.23:1** — `battle.js` drew the percentage right-aligned at
   the bar's right end in `#0d0d10` while the fill grows from the LEFT, so it
   sat on the empty `#22222a` track for most of a fight. **Deleted rather than
   recoloured:** no single colour clears both grounds it can land on, and
   `#depth` already prints both that percentage and `BREACHED` verbatim
   (`main.js:872`, `:879`). It was a duplicated fact as well as an unreadable
   one. The bar is the picture, `#depth` is the number.
2. **Copper rate was BASE, not final** — `copperMult` was applied at credit
   time, so the client printed a rate the player never banked. Folded into
   `botZoneRates`; the Grind row shows the multiplier as its own trailing term.
   No baseline drift: the sim consumed the same base figure, but its EV gear
   model rolls only `atkFlat`/`atkPct`, so `copperMult` is always 1 there.
   **The sim's copper income is a lower bound by construction.**
3. **`setAlloc` had no lock gate** — locked rows took input and silently
   discarded it. Gated in `setAlloc` itself, so every path (± / cap / max /
   zero / typed input, and any future caller) is covered by one guard.
4. **`setParty` ignored `dutyUnlocked`** — same defect in the Dungeon; the
   `<input>` disabled itself while the buttons wrote through. Gated the setter.
5. **Grind conflated `locked` with live-and-failing** — both got 0.45 dim, so a
   squad losing money looked like unreachable content. Split out `struggling`
   (full opacity, `--warn`). DESIGN.md had specified it; the CSS lived in the
   mock's base block and had never been ported.
6. **`#logHead` `#4e7a5e`** (3.97:1) — closed by deleting the element with the
   shell prompt.
7. **`.pip.miss`** `--faintest` (3.04:1) on 10px text → `--faint` (4.68:1), and
   `cursor: help` dropped — it promised a tooltip `main.js` never renders.
8. **`rarity.js` mythic** — closed; epic AND mythic lifted to their v4 values.

**Dead CSS deleted** in the same commit: `#pullBtn`, `#ticketGain`, `#gmSec`,
`#gmPanel`, `#tierAtk`, `#tierSpeed`, `.ztable`.

**Two corrections to the old "confirmed by grep, safe to delete" list — it was
wrong, and in an instructive way.** `.tier-risk` and `.tier-nightmare` are
LIVE: `main.js` builds them as `` `tier-${enh.zone(item.plus)}` ``, so a grep
for the literal class name cannot see them. And `.ztable .sub, .sub` is a
shared selector — `.sub` is used everywhere, so only the `.ztable` half went.
**Composed class names and shared selectors are exactly what a literal grep
misses**; the same failure mode as the copy sweep that walked a table instead
of the rendered output.


### DONE 2026-07-26 — the arena's art pass (items 1 and 3; item 2 reframed)

Shipped across four commits on `staging`. **Read the v5 canvas spec in
DESIGN.md, not the description below** — the below is what the work looked like
before it was done, kept for the reasoning.

1. **The shadowy read** — fixed. But the real defect was found first: `--panel`
   was called three times in `battle.js` and listed zero times in `TOKENS`, so
   the door and both figures' shade sides had been rendering **#ff00ff magenta**
   on staging since `8657911`. The fallback worked exactly as designed; nobody
   re-rendered the canvas to look. `npm run arena` now fails the run on any
   undefined canvas token.
3. **Composition** — fixed, and the diagnosis inverted. Widening the leaves was
   the *cause*, not the cure: at 94% of the frame there is no wall left for the
   door to be an opening in. The aperture is back to 58% with a lintel, jambs
   and a threshold.
2. **"The Warden needs real art" — reframed, and the sprite question is
   PARKED.** The user supplied five usable boss references (MapleStory + DFO).
   In every one the figure is a near-black mass and ALL the light and hue lives
   in an envelope 2–3× its size around it. **The figure was never the missing
   piece; the envelope was** — and a static 64px sprite cannot radiate, retract
   with HP, or flare at crisis, so the envelope had to be code regardless of how
   the sprite question resolves. Ten identities now ship as six code
   constructions with zero art pipeline. **No SDXL download was started.**

**PARKED 2026-07-26 by the user — do not re-propose unprompted.** Identity art
(slot 2): a portrait in the Agram-Delezie register beside the nameplate. The
user chose "both, battle first"; battle shipped, and slot 2 was then parked. It
is the one piece that genuinely needs the art decision reopened, because a
painted full-value portrait is exactly what code cannot do — which also means
picking it up implies the ~7GB SDXL pull and GPU time. **Wait to be asked.**

### The original NEXT UP entry (2026-07-26, before the work)

The arena was brought onto DNA v4 in `6774331` and the user's verdict was
**"looks good, however aesthetically not a fan of the shadowy aesthetic"** and
**"I would like the boss to be cooler — I know that needs actual art."** Both
are open work, not defects.

1. **Lose the shadowy read.** Every figure is currently a flat `--bg` mass with
   a 2px rim, which is what DESIGN.md's canvas section literally specifies
   ("flat dark mass with a rim-light"). Rendered, it makes the arena a set of
   voids on a dim ground. The spec is the thing to change here, not just the
   code — silhouette-plus-rim was chosen on paper and has now been seen. Likely
   direction: light the figures rather than backlight them, so the Warden is an
   OBJECT in the room instead of a hole in it, and lift the ground off `--well`
   so there is something for a lit figure to sit against.
2. **The Warden needs real art.** A 10-Warden sprite set, one per door, is the
   ask. `internal/art/` has the working pipeline (SDXL + `nerijs/pixel-art-xl`
   LoRA, the user's RTX 4070S; recreate `.venv` on first use and mirror the old
   repo's working env). **The no-AI-generated-ICONS veto does NOT cover scene
   or character art** — it names icons specifically, and hand-made or pipeline
   art is explicitly permitted. New game means new art and new names; the old
   manifest prompts are deliberately not carried over.
   Constraints that still bind: dark ramp, no decay/ruin signifiers (the server
   works), and each Warden has an assigned hue (`--w1`..`--w10`) the sprite
   should sit with rather than fight.
3. **Composition, still open from the same commit:** the scene reads more as
   "panels with a lit seam" than as a door, and the space either side of the
   leaves is dead. Widening the leaves to fill the frame is the cheap fix; real
   art may make it moot, so sequence this after (2).

### Open with the user, not with the code

- ~~Maren/Vess renders GREEN, not gold~~ — **RESOLVED `c92fe37`.** The user
  chose the third option: lane 2 moved off the type and onto the nameplate, so
  the plate carries the door's hue and the name is gold again. The same commit
  fixed `--w-active` being pinned to `var(--w2)` with nothing ever moving it —
  all ten Wardens had been rendering in Maren's green.
- **The arena art pass** — see NEXT UP above.
- **`main` is unmerged.** Waiting on a playtest.

### Hard-won rules from these sessions — do not re-derive

- **The sim measures DESTINATIONS, not the observable rate. It cannot judge
  feel, and citing it as if it could is a real failure mode.** Every milestone
  it prints is an arrival ("power ×10 at 40m", "W1 broken at 11.8h"). Nothing
  in it reports what the player is watching at minute zero — which on
  2026-07-27 was 0.155 kills/s, a mob dying every 6.5 seconds. The arithmetic
  agreed with the game exactly and the conclusion was still unreachable. If a
  question is "does this feel bad", the sim is not evidence; the phone is. See
  also `bot-lane-no-sim`: the user is the sim for anything bot-driven.
- **Surface separation is an L\* question; only text is a ratio question.**
  WCAG's `+0.05` flare term crushes dark-on-dark ratios toward 1.0, so an
  invisible surface pair reads as an acceptable 1.04:1. Use
  `internal/mocks/contrast.mjs`, which prints both.
- **Ornament fails toward "ruin" by default.** A rule with a gap in it reads as
  damage, which the no-decay constraint forbids. Full-span rule elements.
- **A manual sweep cannot establish its own exhaustiveness.** Four review
  rounds each falsified a prior "exhaustive" claim in a new place. The Phase 2
  copy sweep walked JOURNEY's register tables and missed two strings that
  existed only in its final-copy tables. **Sweep the RENDERED output; treat the
  tables as intent and the pixels as inventory.** `build.mjs`'s assertions are
  the durable version of this.
- **The mocks are generated.** Edit `internal/mocks/build.mjs`, never the
  emitted `.html`. The mocks are the design contract and must not drift from
  what ships — when you change shipped CSS, change the generator too.
- **Not every relocation row has a shipped counterpart.** Several describe copy
  that only ever existed as `(NEW)` rows in JOURNEY's final-copy tables. Check
  before "cutting" something that was never there.
- The copy pass's brief ("spell out numbers and consequences") **over-applied**
  and produced a tutorial in every HUD. Fixed terms → ledger table, state →
  short line, mechanic explanation → Help.

## Where the build stands (game code as of `a85c8d1`)

Playable arc: intro attempt 0.0008% → unlock → bot swarm economy → gear/
Armory ranks → Warden health whittles down at Combat Power → Dungeon runs
spend the swarm for loot. W1 breaks at **11.8h (sim EV)**; sim flags it as
slightly under the 12h–2d target — deep Wardens stretch far longer.

All on `staging` (Pages serves it); **`main` lags 96 commits** pending user
approval — fast-forward main once the current staging build is approved.

Tabs, in unlock order: **Boss · Training · Grind · Player · Delve · Dungeon ·
Help**. (GM retired in `82d2d99` — see below; Help added `dd883bb`.)

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

**Both UI plans are done and integrated — see the handoff at the top of this
file for what shipped and what is still open.** `internal/UI-AUDIT.md` is the
pre-plan measurement and is now historical.

`npm run shots` re-captures all seven tabs + the Dungeon mid-run at 375px
whenever you need current pixels. Help is ~3,500 CSS px of prose and falls
back to 1x capture; that is expected, not a failure.

Three deviations from the `design-for-ai` plugin's defaults are recorded in
both plans and must be honored by every dispatch:
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

**REORDERED 2026-07-27 by playtest. P1/P2/P3 at the top of this file come
first — the items below were written before anyone had played the build.**

P1. **The dead opening** (see top). Cheapest fix, biggest felt change, and it
    blocks judging anything else.
P3. **Skills**, combat + non-combat, copper-levelled. Answer the "what does it
    compete with" question before designing.
P2. **Grind-loot demotion + dungeon tuning, as ONE slice.** Not separately.

0. **UI de-dup plan, Phase 1** — G1 was already fixed by the design-system
   pass; **G2/G3 shipped `748bf2a`, G4/G5 shipped `8fb3982`**. Only **G6**
   remains (Combat Power renders in both the resource bar and the Player chip
   group). JOURNEY.md:269 already rules the Player tab the owner and the
   resbar a POINTER, so this is a code fix to match a settled decision, not a
   design question.
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

## Future gameplay — a meta reset after W10 (user-raised 2026-07-26)

The user wants a meta reset behind the Tenth Door. **Logged, not designed** —
REMAKE-DESIGN.md §10 principle 5 says layers arrive at exhaustion, and nothing
is exhausted: W1 breaks at 11.8h in the sim and W2–W10 are still explicitly
rough starting values.

This shape is already sanctioned. REMAKE-DESIGN.md:394 logs it as the
"alternative shape": *capstone-wall breaks AS layer triggers (ITRTG fusion: boss
victory = layer transition)*. So the question is never "may we", it is "as
what".

Three constraints it inherits, all from §10, none negotiable:

1. **Principle 1 — new layers change RULES, not numbers.** A reset that pays a
   multiplier is out, and specifically it is a duplicate: Ban Wave already owns
   that slot. `scripts` is a permanent +player-damage term, and because bot squad
   DPS is player-coupled it lifts the boss fight and the farm together. A second
   multiplier reset would be the same system with a different noun.
2. **Principle 6 — no layer resets, demotes or replaces the character.** Ban
   Wave is legal only because it wipes the born-disposable bot stratum and
   nothing else (guideline 8's 2026-07-21 amendment). A W10 reset needs an
   equally narrow, equally diegetic target — and there is no second disposable
   stratum yet.
3. **Principle 4 — walls should be diegetic.** "New Game+" is not; something the
   dead server does to itself is.

**One concrete conflict to resolve before any of this is buildable.** W10's break
line currently *ends the story*: "It opens onto a login screen, frozen. PLAYERS
ONLINE: 1. That was always you. … Thank you for playing. The server logs off,
content." You cannot log the server off content and then hand the player a fresh
ladder. Either that line changes, or the reset is diegetically something other
than "keep going" — **the server refusing to stay off** is the version that keeps
the ending intact and earns the reset, rather than retconning it.

Also unresolved: what the ten Wardens are on a second pass. Guideline 8 forbids
destroying story canon, and eight of them have now been characterised — Sef's
grievance and Osei's age are canon as of this session. Re-fighting them as
if nothing happened is the trap.

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
