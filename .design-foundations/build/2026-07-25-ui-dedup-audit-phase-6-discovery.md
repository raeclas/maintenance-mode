# Discovery + Design: Phase 6 — Compose six tab mocks

Plan: `.design-foundations/plans/2026-07-25-ui-dedup-audit.md` · final phase.
Doctrine read: `usability` (`skills/usability/SKILL.md`), `responsive`
(`references/visual/responsive.md`), `checklists`
(`references/visual/checklists.md`).

## Artifacts Found / Current State

| Input | State |
|---|---|
| `internal/DESIGN.md` | Present, **LOCKED** (3aff88d). Token block, type scale, motion budget, canvas module, `## Component specs` + token tiers + dimension scale (b34fc60). |
| `internal/JOURNEY.md` | Present. `## Fact ownership` (every fact, one owner, a state), `## Page specs` (six entries, ordered blocks), Phase 5 microcopy (final strings + number sources) (f1120ed). |
| `internal/UI-AUDIT.md` | Present. Measured current state at 375px: 414px overflow, ~136 dormant-at-live-weight items, Player ~3060px tall. |
| `internal/mocks/` | **Does not exist.** Nothing to extend — this phase creates it. |
| `internal/shots/` | Seven PNGs of the CURRENT (unfixed) game at 375px — before-state reference. |
| `internal/shot.mjs` | Zero-dep headless-Edge CDP capture. Reusable pattern for capturing the mocks. |
| Browser MCP | **NOT AVAILABLE** in this agent's tool set (no `browser_connect`/`browser_navigate`/`browser_screenshot`). The `prototype` skill's graceful fallback applies — but the repo already owns a working headless capture path, so real pixels are still produced (see Design Decisions D8). |

## Gaps

1. **No mocks directory.** Everything is produced from scratch.
2. **The three contracts have never been rendered together.** Phases 1–5 are
   text. Every seam between them (a Phase 5 string inside a Phase 4 component
   at a Phase 3 token weight) is unverified until this phase.
3. **No screenshot exists anywhere in the plan.** This is the first phase where
   pixels exist at all.
4. **`internal/DESIGN.md` carries five REQUIRED-not-shipped behaviours** (pip
   recolor, alloc-control lock gating, Grind's struggling/locked split,
   `#logHead` token, rarity `mythic`). Mocks render the REQUIRED side — that is
   what a mock is for — and the deviation from live `style.css` is named.
5. **DESIGN.md's dimension tier documents its own non-exhaustiveness** ("a
   manual re-read cannot establish exhaustiveness about itself"). DW-6.2's
   extension exists precisely because of that, so the mock's px discipline is
   enforced by a **runnable check**, not by a re-read.

## Gate Status

- DESIGN.md locked: **YES** — treated as law. No token value re-derived, no
  new hex, no re-opened palette.
- JOURNEY.md present with page specs and final copy: **YES** — block ORDER and
  strings taken verbatim.
- Prerequisites (Phases 4 + 5 committed): **YES** (b34fc60, f1120ed).
- Recommendation: **BUILD**.

## DW Verification

| DW-ID | Done-When Item | Status | Evidence that will prove it |
|---|---|---|---|
| DW-6.1 | Six mocks render as self-contained `.html`, no missing deps | COVERED | Render evidence: six files exist and screenshot at 375px + 1280px via headless Edge (`internal/mocks/shoot.mjs`, the `internal/shot.mjs` CDP pattern). Zero `<link>`/`<script src>`/`url(` in output — asserted by `internal/mocks/build.mjs`. |
| DW-6.2 | No hard-coded hex/rgb; **extended:** no untokenized `px` | COVERED | Tokens-applied evidence: `build.mjs` strips the `:root` block and the `@media` preludes from each emitted file and asserts **zero** `#hex`, `rgb(`/`rgba(`, and zero `\d+px` in what remains. Every literal therefore lives in `:root` as a named token with a comment. Non-zero exit = build fails. |
| DW-6.3 | No horizontal scroll at 375px | COVERED | Render evidence: `shoot.mjs` reports `documentElement.scrollWidth` per file at a 375px viewport and fails loudly above 375. |
| DW-6.4 | No fact appears twice within a single mock | COVERED | Traced per mock against `## Fact ownership`; the one real intra-mock repeat (Combat Power: resbar chip + Player breakdown, audit G6) is resolved by design decision D3, not by argument. |
| DW-6.5 | Legible primary → secondary → tertiary read | COVERED | Render evidence: per-tab primary named in D5 below and visible in the 375px screenshot (squint test, `checklists.md` §7 Final Validation). |
| DW-6.6 | Review returns no Critical | COVERED | `node detect.mjs <file>` run on all six before handoff; findings fixed or named. Orchestrator dispatches the review. |

**All items COVERED:** YES (6 of 6 — matches the dispatch count).

## Design Decisions

**D1 — The state ladder is carried by STRUCTURE first, colour last.**
`usability` (Norman: signifiers over affordances) and `checklists.md` §2
("Red and green used as sole differentiators" → add redundant cues) both point
the same way, and DESIGN.md already proved colour can carry exactly **one**
strong split on this background. So each state gets three independent channels:

| State | Left edge | Type colour | Controls | Meter | Words |
|---|---|---|---|---|---|
| live (allocated) | gold 3px | `--gold` name / `--bone` stat | full alloc control | Cycle bar filling | live numbers |
| dormant (unlocked, idle) | `--line-soft` 3px | `--dim` name / `--faint` stat | control present, value `0` | empty track | `no bots here` |
| locked (unreachable) | none | `--faint`, whole row at `--opacity-locked` | **none — removed entirely** | none | `locked · <condition>` |
| struggling (Grind, live+failing) | `--warn` 3px | `--warn` stat, **full opacity** | full alloc control | empty track | `too weak to hold — …` |

The single loudest move is the third column: **a locked row renders no
allocation control at all.** That deletes the audit's G3 finding (21 inert
alloc clusters) outright, and it is DESIGN.md's own REQUIRED change #2 rendered
rather than merely specified.

**D2 — Contrast: opacity only where the component is genuinely inactive.**
Any token at `opacity: .45` over `--panel` composites to ≤2.7:1 — arithmetic,
not opinion (`--bone` at .45 → `#5F5B57` → 2.69:1). So:
- `--opacity-locked` is used **only** on locked rows, which carry zero
  interactive controls by D1 and are therefore *inactive user interface
  components* — WCAG 1.4.3's stated exemption. Nothing readable-and-operable
  sits under an opacity multiplier anywhere in these mocks.
- Dormant rows are interactive, so they never get an opacity multiplier; they
  recede via `--dim`/`--faint` (5.14:1 / 4.68:1, both AA) plus the neutral edge
  and the zeroed control.
- **Deviation, deliberate:** DESIGN.md's `.amCell.dim { opacity: .5 }` (45
  Armory cells) and any set-level dimming of Trophy blocks are replaced by
  `--faint` text + a neutral left border. `--bone` at .5 measures 3.09:1 on
  genuine `R0 · +0.00%` text. This is the same defect class DESIGN.md itself
  corrected for `.pip.miss` (`--faintest` → `--faint`), applied to the one
  place its own audit left on an opacity multiplier. Recorded as a deviation,
  not slipped in.

**D3 — Chrome echoes a headline only while you are NOT on the tab that owns
it.** `## Fact ownership` permits the resource bar to echo an owned headline
("that is NOT a second content copy"), but audit finding G6 is exactly that
echo landing beside its owner on the Player tab — the one place the echo really
does render the same number twice on one screen. The rule costs nothing
elsewhere (Training's population bar is `pop/cap` vs the bar's `free/cap`,
Grind never prints a copper total, Ban Wave prints *pending* Scripts not
banked), and on Player it removes the duplicate without deleting a fact: the
canonical breakdown is right there, larger. Applied to the CP chip on the
Player mock only, and stated in that file's header comment.

**D4 — Phone-first, and nothing hides.** `responsive.md`: min-width queries
only, no `display:none` amputation, content-driven breakpoints. One breakpoint
(`561px`) — DESIGN.md's own named out-of-scope value, reused rather than
invented. Below it the Row grid is `1fr auto` with alloc + stat on their own
full-width lines (the shipped mobile rule, kept); above it the four positional
columns return. The six-item tab bar **wraps to two rows of three** rather than
scrolling — six fixed destinations should all be visible (Hick's law is about
choice cost, not about hiding choices), and the audit's 414px overflow was the
tab bar refusing to wrap. Things that GROW with progression scroll inside their
own container instead: the wall selector (up to 10 doors) and the Armory grid.

**D5 — One dominant element per tab** (`checklists.md` Composition, "Must
Pass: dominant element exists"):

| Tab | Primary (dominant) | Secondary | Tertiary |
|---|---|---|---|
| Boss | the arena + the `--fs-hero` gold depth readout; the gold `Descend` CTA in the broken variant | siege readout lines | monument, dialogue |
| Training | the four rig buy buttons (affordable = gold) | ATK/SPEED script rowlists | Ban Wave, enhance squad |
| Grind | the manned zone rows and their alloc controls | unmanned zones | the locked-region block |
| Player | the three gear slots + enhance buttons | CP chips, stash | Trophies, Armory (tail) |
| Delve | the five Cache-tree buy rows | depth/Cache state | — |
| Dungeon | `Send bots in` / `Pull out now` | duty rows | how-it-works, journal |

**D6 — Copy is quoted, not written.** Every player-facing string is a Phase 5
row instantiated against ONE shared save state (documented in `build.mjs` and
in each file's header comment). Formula-derived values (costs, gains, unlock
thresholds, gates, caps, crit factor, ban rate) are computed from source
constants; the player's own totals are chosen. Mock-only annotations are
visually quarantined in a dashed `MOCK NOTE` block so they can never be read as
product copy.

**D7 — The Boss canvas is a labelled placeholder, and the Boss mock shows two
states.** The arena is a bordered `--well` region at a fixed aspect ratio with
an explicit "canvas region — not renderable in HTML" label. No fake arena. The
Boss tab's specced primary action (`Descend`) only exists in the broken state,
so the mock renders the fighting state in full and appends a second, labelled
`frontier broken` block — the same device the plan already mandates for
Dungeon, applied for the same reason.

**D8 — Tooling: reuse, don't reinvent.** Two small files carry the evidence:
`internal/mocks/build.mjs` (one shared CSS source → six files, then the DW-6.2
assertions — six independently hand-copied token blocks is precisely the drift
DW-6.2 was extended to catch) and `internal/mocks/shoot.mjs` (the `shot.mjs`
CDP pattern pointed at `file://`, two widths, with the scrollWidth report that
proves DW-6.3).

## Recommendation

**BUILD.**

---

## Production addendum — what the pixels changed (written after building)

Design notes above are what was planned; these are the decisions production
forced, recorded rather than folded in silently.

**P1 — Three intra-mock duplications that the text phases could not see.**
DW-6.4 was checked by walking each rendered surface against `## Fact ownership`.
Three real repeats surfaced, none of which the audit could have caught (it was
captured on a save with zero cleared walls and a default rig):
- **Boss, remaining HP rendered three ways.** Phase 1 named it `DUP 1`, Phase 2
  carried it forward, Phase 4 left it. Resolved here as an ownership call: the
  canvas keeps the bar and **drops its own `%` label** — which also retires the
  1.23:1 `drawBars()` legibility defect DESIGN.md found — the DOM readout keeps
  the number, and the record line keeps only its Combat Power pointer clause.
  No term is hidden: the proportion, the rate and the time-to-breach all remain.
- **Boss, the cleared-door list rendered twice.** The wall selector and the
  monument print the same list of opened doors, and both appear under exactly
  the same condition (`maxWall > 1`). The monument is cut; the selector carries
  it and is also the control (one target, two jobs).
- **Training, each rig lever's current value rendered twice.** Every rig button
  prints `current → next`; `#rigStats` then restated two of those four current
  values. The line keeps only the fact it uniquely owns
  (`lost in the Dungeon 47`).

All three are clause-level cuts of repeated values, never of a
guideline-5 term. No new copy was written.

**P2 — Deviations from the letter of the contracts, each with its reason.**
1. `.amCell.dim { opacity: .5 }` and any set-level dimming of Trophy blocks →
   `--faint` text + a neutral left border (D2's arithmetic).
2. The Row's fourth column: Phase 5 turned the stat cell from a token
   (`RATE MAX`) into a sentence, and a `1fr` sliver inside a 600px column
   shreds it. The stat keeps its own full-width line at every width; the Phase 4
   `--row-col-name` / `--row-col-gain` widths become minima rather than fixed
   tracks so long gains wrap instead of squeezing the name.
3. The Dungeon's `.arena` wrapper is dropped (grouping by proximity instead) and
   the Boss canvas stub loses its border — a bordered box inside a bordered box
   is the rule line `checklists.md` tells you to delete. This also cleared all
   seven `nested-cards` findings `detect.mjs` reported on the first build.
4. An un-started Trophy set collapses to its own header (`<details>`). The
   summary is the set-header copy Phase 5 already wrote and the pip values are
   one tap away, so nothing is invented and nothing is lost.
5. The Armory grid scrolls inside its own container below `--armory-min` rather
   than ellipsing entry names — the plan's own "wide rows scroll inside their
   own container" edge case, applied where truncation would otherwise hide the
   entry name the Armory is keyed on.

**P3 — Not exercised by this save state.** All six tabs are unlocked at the
chosen save, so the `???` locked TAB state does not appear. It is specified in
DESIGN.md (`--tab-locked`) and Phase 5 (per-tab `title` strings) and is styled in
the mocks' CSS, but rendering it would need a save state that contradicts the
other five files. The locked STATE itself is exercised heavily at row level
(9 Training tiers, 5 Grind zones, 1 Dungeon duty).

## Evidence log

| Check | Command | Result |
|---|---|---|
| DW-6.1 self-contained + rendered | `node internal/mocks/build.mjs`; `node internal/mocks/shoot.mjs` | 6/6 emitted, 12 screenshots, zero external references |
| DW-6.2 no hex / rgb / raw px | `node internal/mocks/build.mjs` (asserts, exits non-zero on failure) | `all 6 files pass` |
| DW-6.3 no horizontal scroll at 375px | `node internal/mocks/shoot.mjs` | `scrollWidth 375px / viewport 375px` on all six |
| DW-6.6 pre-review detector | `node .../scripts/detect.mjs internal/mocks/*.html` | 7 findings on the first build → **0** after P2.3 |
