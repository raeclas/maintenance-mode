# UI audit — current state, measured 2026-07-25

Evidence for Phase 1 of `.design-foundations/plans/2026-07-25-ui-dedup-audit.md`.
Captured from the live game at **375px / 2× DPI, full page**, via
`npm run shots` (`internal/shot.mjs` — headless Edge over CDP, zero deps).
Re-run it after any UI change; the PNGs are gitignored.

Build audited: `bcf4ecc` on `staging`.

---

## The plan said six tabs. There are seven.

`GM` was omitted from the plan's surface list. It is a full tab with three
sections and fourteen purchasable rows, and it has the worst layout
inconsistency of any surface. The plan's Phase 2 and Phase 6 counts must be
seven, not six.

---

## Global

### G1. Horizontal overflow on every tab — 459px at a 375px viewport

Measured by the capture script on all seven tabs: `scrollWidth 459px > 375px`.
84px of overflow, so the whole page pans sideways on a phone. Cause is the
seven-button tab nav, which neither wraps nor scrolls; **`GM` is clipped at the
right edge on every screen**. The current build fails the plan's DW-6.3 before
any redesign work starts.

### G2. Dormant content renders at the same weight as live content

This, not duplication, is the larger half of the problem. Counted from the
captures:

| Surface | Rendered | State |
|---|---|---|
| Player → Trophies | 70 rows (10 doors × 7 pieces) | all unearned, every set 0/7 |
| Player → Armory | 45 cells (15 zones × 3 slots) | all rank 0, all "+0.00%" |
| Grind → zones | 10 of 15 | `[LOCKED]` |
| Training → tiers | 11 of 13 | `locked` |
| GM → rows | 10 of 14 | unaffordable at 40 tickets |

~136 items drawn at full detail to communicate nothing yet. Nothing in the
visual language separates "you have this" from "this exists and you don't".

### G3. 21 dead allocation controls

Every locked Training tier and locked Grind zone still renders a full
−/input/+/cap/⋯ cluster. It is the most repeated component in the game and the
majority of its instances are inert. It is also the densest component, so the
repetition is what makes those two tabs read as noise.

### G4. The row grid does not respond at phone width

`rowName / rowGain / rowAlloc / rowStat` holds on desktop and breaks at 375px:
the gain text floats right at a different vertical offset than the row name, the
allocation control wraps onto its own line, and the status line lands
left-aligned below it. One row becomes four misaligned fragments. Worst on
Dungeon, visible on Training, Grind and GM.

### G5. Buy buttons are the loudest element on every spend surface

Delve and GM stretch their cost buttons to ~470px for a two-word label
("20 Cache", "60 tickets"), so **price outshouts what you are buying**. Widths
are content-sized, so the column edge is ragged. GM then uses three different
button sizes for the same action across its three sections.

### G6. Cross-tab duplication of Combat Power

`23.2` renders in the top resource bar and again in the Player tab's chip
group. The exact class of fact the ownership map exists to settle.

---

## Per tab

### Boss
Cleanest surface. Canvas arena carries the fight; the readouts below it
(`100.0%`, time-to-breach, crit line, `health 300B / 300B · CP 23.2/s`) sit in
four separate lines at three weights. `100.0%` and the bar's own `100.0%` label
state the same number twice, ~40px apart.

### Training
13 tiers, 2 active. Every locked row prints its unlock condition as
`locked · 0/30.0k fills of combo macro` — naming the row directly above it, so
the list reads as a chain of back-references. Rig line still shows
**`lost to bans 0`**, permanently zero since Grind stopped banning (`4d41da7`) —
bans now only occur in the Dungeon, so the stat is vestigial here.

### Grind
15 zones, 1 manned. `[LOCKED] break W1` appears 5× and `[LOCKED] break W4` 5× —
ten rows carrying one of two facts, which is a group boundary, not per-row data.
`unmanned` appears 4×. Locked zones still render mob, HP, copper/kill and IP
band in full.

### Player
**~3060 CSS px tall — roughly 8 phone screens.** Trophies (70 rows) and Armory
(45 cells) dominate; the live controls (Combat Power chips, three gear slots,
stash) are ~15% of the height and start around 60% scroll depth. Empty stash and
three empty gear slots are the actual current state, and they are the hardest
things on the tab to find.

### Delve
The structural model the others should follow: one list, six nodes, no dormant
padding, everything actionable. Only flaw is G5 (button width) and `rank 0`
repeated six times on its own line.

### Dungeon
The three-statement problem, confirmed and worse at phone width:
1. The intro paragraph is **six lines and fills most of the first screen** before
   any control appears.
2. Each ability states its effect in the assign row, then again in Boss
   abilities.
3. `needs 2 bots` appears as its own column **and** inside
   `4 assigned, 2 needed — blocked` — same number, two positions, two
   alignments, per row, ×3.
4. Difficulty appears three times: the state line, the input, the helper text.
5. With an empty journal, Boss abilities is three identical rows of
   `Unknown — you haven't run into this one yet` — four lines of vertical space
   carrying zero information.

### GM
Three sections, **three different row layouts for the same "buy a thing"
action**: Account flags (name / gain / rank / full-width button), Admin tools
(narrow wrapped name / description / small square button), Utility
(name+delta / progress / full-width button). Name column is too narrow, so
`idle encounter processing` wraps to three lines. Affordability via button fill
is the one signal that works well.

---

## Not a design finding: four GM purchases are dead

Surfaced by the audit, but a correctness bug, not a layout one. The idle-battler
rework (`2aac2d2`) deleted attempts, cooldowns and scars. Four GM rows still
sell upgrades for them:

| Row | Cost | Sells |
|---|---|---|
| `scheduler` | 150 tickets | "auto-fires attempts on cooldown while online" |
| `idleProc` | 400 tickets | "attempts resolve while away (offline-clamped)" |
| `cooldown` | 40 base ×1.8, max 6 | "encounter lockout −5s" |
| `scar` | 200 base ×2.5, max 3 | "scar cap +1%" |

Verified: no gameplay code reads `gm.scheduler`, `gm.idleProc`, `gm.cooldown` or
`gm.scar`. The only reference outside `gm.js` is `main.js:376`, a toggle writing
`state.gm.schedulerOn`, which nothing consumes. Tickets spent here buy nothing.

Fix is a separate change from this audit — either retire the rows or repoint
them at the idle-battler (e.g. offline drain rate, farm cadence). Flagged, not
fixed.

---

## Capture manifest

`npm run shots` → `internal/shots/` (gitignored):
`boss-375` · `training-375` · `grind-375` · `player-375` · `delve-375` ·
`dungeon-375` · `gm-375` · `dungeon-running-375`

The script seeds state before capturing so no tab renders as an empty shell, and
reports `scrollWidth` per tab so overflow is measured rather than eyeballed.
It captures the canvas arena correctly, which closes the plan's "canvas cannot
be reviewed" gap — real pixels, no DOM dependency.
