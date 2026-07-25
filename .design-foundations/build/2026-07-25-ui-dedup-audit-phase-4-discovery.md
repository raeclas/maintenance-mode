# Discovery + Design: Phase 4 - Design system — components + meters

## Artifacts Found / Current State

- `internal/DESIGN.md` — **LOCKED**, user-confirmed 2026-07-25. Carries the full
  semantic token set (`--gold`, `--bone`, `--dim`, `--recede`, `--faint`,
  `--faintest`, `--panel`/`--inset`/`--field`/`--well`, `--line`/`--line-soft`,
  functional accents, the `--fs-*` type scale, `--opacity-dormant`/
  `--opacity-locked`, canvas tokens via `theme.js`). No component tier exists
  yet — this phase adds it. DESIGN.md's own "Required behavior changes" list
  (5 items, none applied) and its VERIFIED/REQUIRED convention are the model
  this phase's component states follow.
- `internal/JOURNEY.md` — IA + six page specs (Phase 2), fact-ownership table
  (Phase 1) naming every duplication and its state (live/dormant/locked).
- No component-spec artifact exists before this phase — `## Component specs`
  is new.
- Live markup read in full: `index.html` (211 lines), `main.js` (1034 lines),
  `style.css` (675 lines), plus `bots.js` (alloc/setAlloc), `battle.js` (boss
  HP canvas bar), `farm.js` (zone data), `instance.js` (dungeon run model) —
  every component below is traced to an actual selector or id in these files,
  not invented.

## Gaps

1. **No `data-viz` attribute exists anywhere in the codebase today** (grepped;
   zero hits outside planning docs). The plan expects `data-viz` to govern
   meter encoding — this phase specifies the vocabulary and which selector
   each value applies to; wiring the literal attribute into `index.html` is a
   markup change out of this phase's `Produces:` line (DESIGN.md only).
2. **Two independent allocation-control implementations exist**, not one:
   `allocMini()` (`main.js:288-310`, used by Training tiers, Grind zones,
   Enhance squad) and a hand-rolled inline variant for Dungeon duty rows
   (`main.js:479-497`) that skips the cap button and the ⋯ max/0 collapse.
   Both are "the allocation control" conceptually (the plan's edge case
   names it once), but they are two literal implementations. Documented as
   one component with two current instantiations, not silently merged (no
   code touched this phase).
3. **A second, previously undocumented interactivity gap**, same species as
   DESIGN.md's known one: `bots.js setAlloc` / `main.js` `allocMini` wiring
   has no lock check (already named in DESIGN.md). Reading the Dungeon duty
   row's OWN alloc control (`main.js:479-497`) found a parallel bug: `setParty()`
   (`main.js:484-488`) guards only `state.instance.running`, never
   `inst.dutyUnlocked(state, m)` — so a duty gated behind a script-version
   rank (`main.js:991`: the `<input>` correctly gets `.disabled = i.running ||
   !open`) still has its −/+/max/0 **buttons** fully clickable and able to
   write `state.instance.party[m.duty]` while the row visibly reads "needs
   script version N+". Same defect class, different file/component instance.
   Not on the DW list — surfaced by verifying claims against source, per this
   phase's own instruction. Flagged as REQUIRED, not applied (no code touched).
4. **`.arena` is used for two functionally different things**: the Boss tab's
   canvas fight scene (`index.html:63-70`) and the Dungeon tab's plain
   run-controls block (`index.html:185-196`, difficulty/pull-out inputs +
   proxy toggle + start/pull-out buttons — no canvas, no combat readout).
   Perceptually identical (bordered inset panel), functionally divergent
   (Kholmatova's functional/perceptual lens, `design-systems` doctrine) — named
   here as a component-boundary ambiguity, not renamed (would be a CSS/markup
   change, out of scope).
5. **Meter species are already visually distinct in the shipped CSS**, but the
   distinction is accidental, not documented or attribute-driven: canvas
   depletion bar (boss HP), row-underline cycle bar (`.rowBar`/`.rowFill` —
   training tiers + zone kill-cycles), Armory progress-to-rank bar (`.amBar`),
   and the population level bar (`.barTrack`/`.barFill`, overridden to a
   muted green for `#popFill` specifically) each use a different track
   height/color and fill color today (verified below). Nothing forces this
   to stay true as new meters are added — the gap is the missing declarative
   rule (`data-viz`), not a currently-broken pixel.
6. **Dungeon has no bar meter at all** — floor/haul/damage% render as text
   only (`$("instState").innerHTML`, `main.js:966-970`), with the damage-%
   figure color-swapped (`warn`/`sat`) rather than bar-encoded. Relevant to
   DW-4.4: there is no fourth bar to conflict with the other three; the
   done-when item is satisfied by confirming this (not inventing a new bar)
   and specifying what form a future Dungeon meter must take if one ships.
7. **One raw hex has no semantic-token backing**: `.popTrack .barFill {
   background: #5a7a5a; }` (`style.css:309`). DESIGN.md's own Phase 3 audit
   already checked its contrast (row 309 of the hardcoded-color audit table:
   3.28:1 vs `--field`, PASS as a non-text/UI-component fill) but left it as
   a literal since Phase 3's job was contrast, not token completeness. DW-4.1
   requires every component spec to cite a semantic token, never a raw value
   — this phase names a new component-tier token for it (see below), reusing
   Phase 3's own contrast finding rather than re-deriving it.

## Gate Status

- DESIGN.md: **LOCKED**, confirmed. Treated as law — no locked value is
  edited; only append-only additions (new component tier + one new token,
  `--meter-level-fill`, filling a gap Phase 3 itself flagged as unaudited-
  for-tokenization, not reopening a locked decision).
- JOURNEY.md: present, Phases 1-2 complete. Page specs (Phase 2) are read for
  which components appear on which tab, but page composition itself stays
  out of scope (Phase 6).
- Prerequisites met: locked DESIGN.md ✓, JOURNEY.md IA + page specs ✓.

## DW Verification

| DW-ID | Done-When Item | Status | Evidence |
|-------|---------------|--------|----------|
| DW-4.1 | Token tiers defined; every component spec references semantic tokens, never raw values | COVERED | Three-tier table (global → semantic → component) in `## Component specs`; every component's tokens resolve to an existing DESIGN.md `:root` name, except one new component token (`--meter-level-fill`) whose value is unchanged and already contrast-verified by Phase 3's own audit (row 309) — cited, not re-derived. |
| DW-4.2 | A spec exists for each repeated shape: row, rowlist, chip/KPI, meter, arena, allocation control, caption, tab button | COVERED | Eight named subsections, each citing the exact selector/id it's derived from (`.rowlist .row`, `.chipGroup`/`.chip`, the four meter selectors, `.arena`, `.allocMini` + the Dungeon duty-row variant, `.caption`, `#tabs button`). |
| DW-4.3 | Each component spec states its interaction states including locked and disabled | COVERED | Per-component state table using the applicable subset of the 8-state model (`interaction` doctrine): idle/hover/active/disabled/locked where they exist in this synchronous, no-network game; states that don't apply (loading/error/success — no async calls) are marked N/A with why, matching JOURNEY.md's own convention rather than fabricated. |
| DW-4.4 | Meter encoding is consistent — bar length means one thing across training, zones, boss health and dungeon progress, or the differences are explicitly distinguished by form | COVERED | Meter species table: 4 shipped meter instances (canvas depletion, row cycle, Armory progress, population level) verified today to already differ by track height/color/fill color/medium (cited CSS lines); Dungeon confirmed to have no bar (text-only) so nothing conflicts; a `data-viz` vocabulary (`depletion`/`cycle`/`progress`/`level`) is specified as the REQUIRED declarative layer that makes the (currently accidental) distinction explicit and durable for future meters. |

**All items COVERED:** YES

## Design Decisions

- **Token tier 3 (component) is additive, not a renaming pass.** DESIGN.md's
  own note ("the existing primitives already carry semantic names... no new
  abstraction for a role these tokens already fill") already collapsed what
  would normally be tier-1/tier-2 (global/alias) into one layer. This phase
  adds tier 3 (component-scoped tokens: `--row-*`, `--meter-*`, `--chip-*`,
  `--alloc-*`, `--tab-*`) mapping onto that existing semantic layer — per
  `design-systems.md` §B, "component tokens let a component be restyled
  without touching the alias tier." Kept small: only where a component
  actually needs a role no semantic token names directly (e.g., the meter
  species distinction), not one token per CSS property.
- **Reuse over invention.** Every component spec cites the markup that
  already renders it; no new component is proposed. The one new token
  (`--meter-level-fill`) reuses an already-shipped, already-contrast-checked
  value rather than picking a new hue.
- **VERIFIED/REQUIRED convention carried forward from DESIGN.md**, not
  reinvented — keeps Phase 4 legible against Phase 3's own language and
  prevents restating an unshipped behavior as current fact (the error named
  explicitly in this phase's dispatch prompt).
- **Forward-compatibility for the meta-currency spend surface**: the buy-
  button + `.affordable` state (`section.game button.affordable`, driven by
  `buyState()` in `main.js:126`) is specified as the reusable affordability
  signal — already used by Training's rig buttons and Delve's Cache-tree
  buttons, both spend surfaces. A future meta-currency panel composes from
  the same row/chip/button/allocation-control specs with zero new primitives,
  which is what the plan's forward-compatibility requirement asks for. The
  retired GM tab's fill-based affordability idea (UI-AUDIT.md) is named as
  the thing to remember, not resurrected as new code — the current shipped
  mechanism (border+text recolor, binary) is what's specified as VERIFIED;
  a true proportional "fill" treatment would be a design change, not a spec
  correction, and is out of this phase's scope.
- **Meter encoding**: chose to document the 4 shipped species as already
  distinguished (verified against source) rather than claim a defect exists
  where the pixels already differ — the actual gap is that the difference is
  accidental (no attribute names it), which is what `data-viz` fixes. This
  avoids the DESIGN.md-review class of error (asserting a problem or a fix
  where the code already does the right thing, or the inverse).

## Recommendation

BUILD.
