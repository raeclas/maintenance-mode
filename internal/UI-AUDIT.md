# UI audit — current state, measured 2026-07-25

Evidence for Phase 1 of `.design-foundations/plans/2026-07-25-ui-dedup-audit.md`.
Captured from the live game at **375px / 2× DPI, full page**, via
`npm run shots` (`internal/shot.mjs` — headless Edge over CDP, zero deps).
Re-run it after any UI change; the PNGs are gitignored.

Audited at `bcf4ecc`; **reconciled at `82d2d99`** after the GM tab and the
ticket economy were retired (see below).

---

## What the audit changed before the design work even started

The capture found a seventh tab the plan had omitted — `GM` — and reading it
surfaced four purchases selling upgrades for mechanics the idle-battler rework
had already deleted. That escalated past a design finding, and `82d2d99`
retired the GM tab and the whole ticket economy outright, pending a
meta-currency redesign.

**So the surface count went six → seven → back to six.** Boss, Training, Grind,
Player, Delve, Dungeon. The GM findings below are kept as a record of why the
tab was cut, marked RETIRED — they are not work items.

A new surface will arrive when the meta currency is redesigned. Expect to add
one page spec then rather than re-running the whole plan.

---

## Global

### G1. Horizontal overflow on every tab — 414px at a 375px viewport

Measured by the capture script on every tab. It was `459px` with seven tabs;
retiring GM brought it to **`414px`, still 39px over**. So this was never a
"one tab too many" problem — the tab nav neither wraps nor scrolls, and six
buttons don't fit either. The whole page pans sideways on a phone, and the
build fails the plan's DW-6.3 before any redesign work starts.

### G2. Dormant content renders at the same weight as live content

This, not duplication, is the larger half of the problem. Counted from the
captures:

| Surface | Rendered | State |
|---|---|---|
| Player → Trophies | 70 rows (10 doors × 7 pieces) | all unearned, every set 0/7 |
| Player → Armory | 45 cells (15 zones × 3 slots) | all rank 0, all "+0.00%" |
| Grind → zones | 10 of 15 | `[LOCKED]` |
| Training → tiers | 11 of 13 | `locked` |

~136 items drawn at full detail to communicate nothing yet. Nothing in the
visual language separates "you have this" from "this exists and you don't".
(GM contributed 10 more before it was retired; the 136 above excludes it.)

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
Dungeon, visible on Training and Grind.

### G5. Buy buttons are the loudest element on a spend surface

Delve stretches its cost buttons to ~470px for a two-word label ("20 Cache"),
so **price outshouts what you are buying**, and content-sized widths leave the
column edge ragged. Delve is the only spend surface left now that GM is gone —
but the same component will be reused by whatever the meta currency becomes, so
the spec matters more than the single current instance.

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

### GM — RETIRED in `82d2d99`
Kept as the record of why the tab was cut, not as work.

Three sections, **three different row layouts for the same "buy a thing"
action**: Account flags (name / gain / rank / full-width button), Admin tools
(narrow wrapped name / description / small square button), Utility
(name+delta / progress / full-width button). Name column too narrow, so
`idle encounter processing` wrapped to three lines. Affordability via button
fill was the one signal that worked well — worth carrying into the meta-currency
redesign.

What actually killed it: four purchases sold upgrades for mechanics the
idle-battler rework (`2aac2d2`) had already deleted — `scheduler` (150 tickets,
"auto-fires attempts on cooldown"), `idleProc` (400, "attempts resolve while
away"), `cooldown` ("encounter lockout −5s") and `scar` ("scar cap +1%"). No
gameplay code read `gm.scheduler`, `gm.idleProc`, `gm.cooldown` or `gm.scar`, so
tickets spent there bought nothing. Since tickets had no sink outside GM, the
tab and the currency were retired together.

**Carry into the redesign:** affordability-by-button-fill worked; one row
grammar per action, not three; and the currency needs a sink that exists before
the faucet ships.

---

## Capture manifest

`npm run shots` → `internal/shots/` (gitignored):
`boss-375` · `training-375` · `grind-375` · `player-375` · `delve-375` ·
`dungeon-375` · `dungeon-running-375`

The script seeds state before capturing so no tab renders as an empty shell, and
reports `scrollWidth` per tab so overflow is measured rather than eyeballed.
It captures the canvas arena correctly, which closes the plan's "canvas cannot
be reviewed" gap — real pixels, no DOM dependency.
