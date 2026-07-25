# Discovery + Design: Phase 2 - Page specs, six tabs

## Artifacts Found / Current State

- `internal/JOURNEY.md` (Phase 1, committed `dd4e1da`): `## Job`, `## Journey`, `## IA`, `## Fact ownership`
  (per-tab tables + global chrome table), and the Combat Power product trace. This is the contract
  this phase enforces — every content block below cites a specific row in it.
- `internal/UI-AUDIT.md`: measured 375px findings — G1 (414px overflow), G2 (~136 dormant items at
  live weight), G3 (21 dead allocation controls), G4 (row grid breaks at phone width), G5 (buy-button
  width), G6 (Combat Power cross-tab dup, resolved in Phase 1), plus six per-tab write-ups (Boss
  cleanest; Training's back-reference chain; Grind's 10-row group-boundary dup; **Player at ~3060px /
  8 screens with live controls starting at ~60% scroll depth** — the single finding this phase has the
  most leverage over; Delve called out as "the structural model the others should follow"; Dungeon's
  three-statement problem).
- Live source read in full: `index.html` (211 lines, all six `<section class="tabpane">` blocks) and
  the relevant slices of `main.js` — `checkUnlocks()`/`renderTabs()`/`showTab()` (tab-unlock + nav
  wiring, lines 205-234), the wall-selector + siege-readout render block (lines 715-753), and
  `renderInstance()` (lines 959-1000, the idle/running branch for Dungeon).
- No `internal/DESIGN.md` yet (Phase 3 produces it) — no token values invented here, per plan
  constraint.

## Gaps

- The Player tab's DOM order (Titles → Combat Power → **Trophies (70 rows)** → Gear → Stash →
  **Armory (45 cells)**) interleaves two bulk-dormant blocks around the live decision surface. This is
  the direct cause of the audit's 60%-scroll-depth finding and the clearest phone-first violation in
  the game.
- The Dungeon tab's 6-line intro paragraph currently renders before `#instState`/`#instProject` and
  the duty-assignment controls — i.e., explanatory text sits above the primary decision, which is
  exactly what DW-2.3 forbids.
- Training and Grind already put their primary decision (Rig buttons; Zones list) first — no reorder
  needed there, only states to specify.
- Delve's block order is already correct (audit's own verdict) — this phase specifies it as-is.
- Boss tab's three-statement HP problem (canvas `%` label, DOM `#depth` `%`, and the Record line's
  numeric HP) is flagged by Phase 1 as an unresolved intra-tab duplication (`DUP 1`). Cutting it
  requires a component-level call (which surface owns the number) that belongs to Phase 4
  (component specs) / Phase 6 (composition), not this phase's IN scope (block *order* only) — carried
  forward here rather than silently resolved or silently dropped.
- Dungeon's duplications (needs-N-bots in two positions per duty row; difficulty stated 3×; the
  Boss-abilities/duty-row sentence overlap) are copy/component concerns (Phase 4/5), not block-order
  concerns — this phase specs the blocks that exist, without inventing a copy fix.

## Gate Status

- DESIGN.md: does not exist — not required for this phase (Phase 3 produces it). No token values
  appear anywhere below.
- JOURNEY.md: present and locked-in-content for Phases 1's sections (`## Job`, `## Journey`, `## IA`,
  `## Fact ownership`) — this phase is additive (`## Page specs` appended), does not rewrite those
  sections.
- Prerequisite (Phase 1 fact-ownership map): present, complete, reconciled to the audit's 136-dormant
  count. Confirmed sufficient to trace every content block below.

## DW Verification

| DW-ID | Done-When Item | Status | Evidence |
|-------|---------------|--------|----------|
| DW-2.1 | `## Page specs` has six complete entries, each with purpose, entry points, ordered content blocks, states, primary action, exit | COVERED | Artifact presence — read `internal/JOURNEY.md` after append and confirm six `###` entries each carrying all six fields. |
| DW-2.2 | Every content block traces to a fact this tab OWNS; no spec reproduces a fact owned elsewhere | COVERED | Each content block cites its exact Phase 1 fact-ownership row inline (tab name + row text); cross-tab facts (Combat Power on Boss; scriptMult nowhere per-tab) are marked POINTER, not listed as an owned block. Traceability verified by re-reading Phase 1's six per-tab tables against every block below before writing. |
| DW-2.3 | Each spec names its primary decision and places it above the fold at 375px | COVERED | Named explicitly per spec ("Primary decision" line) plus the ordering rationale. Two specs (Player, Dungeon) required an explicit reorder vs. current DOM order to satisfy this — documented as a Design Decision below, not silently assumed. |
| DW-2.4 | Locked, empty and in-progress states specified for every tab that has them | COVERED | Every spec's States block enumerates `locked` (if the tab gates on a feature flag), `empty`/dormant sub-states (if any content is unearned/idle at game start), and `in-progress` only where the game models a distinct running mode (Dungeon only, confirmed against `main.js` `i.running` branch — Delve and Training have no discrete run state and are marked N/A with the reason). |

**All items COVERED:** YES

## Design Decisions

- **Player tab reorder (Combat Power → Titles → Gear → Stash → Trophies → Armory).** Current DOM
  order sandwiches the live decision (Gear/Stash) between two bulk-dormant blocks (Trophies 70 rows,
  Armory 45 cells) — the direct cause of the audit's "live controls at 60% scroll depth" finding.
  Per `usability` (Fitts's law — the primary target should be reachable, not buried) and `journey`
  (phone-first altitude: the page-spec's job IS content-block order on a phone-only product), Trophies
  and Armory move to the tail as progress-display blocks; Gear and Stash — the tab's actual build
  decision — move up behind only the two small headline blocks. No fact is added, removed, or
  reassigned; this is pure reordering, which is this phase's entire IN-scope lever.
- **Dungeon tab reorder (state/projection/duties/run-controls before the intro paragraph).** The
  6-line static explainer currently precedes the primary action ("Send bots in"), which the audit
  already flagged as filling the first screen. Moved to sit after the actionable blocks, ahead of the
  Boss-abilities journal, so it still teaches the mechanic (Phase 5's job to shorten it) without
  blocking the decision (this phase's job to place it correctly). `surface` doctrine: on a
  glance-constrained phone read, the decision should be visible before the explanation, matching the
  file's own "constraints before composition" posture translated to page order.
  `usability`/Hick's law: the four run-controls (difficulty, pull-out floor, proxy, send) are staged
  together as one decision cluster rather than scattered, reducing the options a Dungeon-tab visit
  has to parse before acting.
- **Training, Grind, Delve: no reorder.** Their current top-to-bottom order already surfaces the
  primary decision first (Rig buttons; Zones list; Cache tree) — confirmed against `index.html` and
  the audit's own Delve verdict ("the structural model the others should follow"). Specified as-is.
- **Boss tab: order preserved, intra-tab HP duplication flagged not resolved.** Boss's five blocks
  (identity → wall selector → arena → siege readout → progress → dialogue) already read top-to-bottom
  in the natural viewing order; no phone-first violation. The canvas-%/DOM-%/Record-HP triple-render
  Phase 1 flagged (`DUP 1`) is real but its fix is a component-ownership call (Phase 4) — noted in
  the spec as a carried-forward flag, consistent with how Phase 1 itself left it unresolved rather than
  silently dropping or silently fixing it here.
- **Tools used:** none of `palette.mjs` / `prototype` apply to this phase — Phase 2 produces
  structural spec text (Markdown), not tokens or rendered pixels. No hand-rolled tool substitute was
  built; the existing Markdown JOURNEY.md format (Phase 1's own template) is reused for `## Page
  specs`, per the journey-stack.md page-spec template.

## Recommendation

BUILD
