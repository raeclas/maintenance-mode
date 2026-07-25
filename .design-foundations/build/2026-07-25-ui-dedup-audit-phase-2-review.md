# Design Review: Phase 2 - JOURNEY.md Page specs (UI de-dup audit)

## Rendered Evidence (Step 0)
- Screenshot: none — this phase produces a specification document, not a rendered surface.
- Surface: the `## Page specs` section of `internal/JOURNEY.md` (lines 326-674), reviewed against the `## Fact ownership` section of the same file (Phase 1, lines 180-322) and live source (`index.html`, `main.js`, `state.js`, `instance.js`, `farm.js`, `battle.js`).

## Assessment B — Deterministic Detector
- Command: not run.
- Exit: N/A (no rendered artifact — this phase ships a spec document, no `.html`/mock exists).
- Findings: N/A — no rendered artifact.
- Opened only after Assessment A findings were frozen: N/A (nothing to open).

## Triage
- Baseline (always-on): N/A for visual pixels — no rendered surface exists. Usability baseline applied at the citation/reasoning level (heuristic + UX-law grounding of the page-spec content), per the dispatch's named doctrine.
- Dispatched (per dispatch's `## Doctrine`): `journey` (page-spec altitude, IA, content-block ordering), `usability` (Fitts/Hick citation obligations for placement), `surface` (device-class block-order reasoning only, no tokens).
- Not applicable: `design-dna`/`checklists`/AI-tells (no visual pixels to judge), `content-design` (no player-facing copy is being authored in this phase), `data-viz`, `behavioral`/`deceptive-patterns` (no persuasion/conversion surface here).
- Deferred: none — the dispatch capped doctrine to exactly these three, and the artifact's scope (a page-spec section, no visual or copy content) doesn't surface signals for any other pillar.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Major | usability / journey | The Page-specs header (line 330) explicitly claims doctrine load "`usability` (Fitts/Hick citations for placement decisions)" — but not one Fitts or Hick citation appears anywhere in the ~350 lines of actual page-spec content (lines 326-674). Every reorder rationale (Player's Gear moved ahead of Trophies/Armory; Dungeon's intro paragraph moved after the action blocks) is argued from `UI-AUDIT.md` evidence alone, never from the named laws. | journey.md's own standing rule: "Cite usability laws down... Fitts's law (Fitts 1954) grounds CTA placement and target sizing... cite them by name and source, never re-derive." | Add the citation where each reorder decision is made — e.g. "Gear moved to block 3 (Fitts's law: primary target proximity to top-of-scroll on a phone)" — one line per reordered spec is enough; doesn't need pixel values. |
| Major | journey (page spec / edge case) | The Boss-tab Arena content block (line 372-377) is cited as owning `## Fact ownership`'s canvas row, which explicitly lists **four** canvas-only facts: damage-number floaters, hero sprite, boss sprite w/ cracks, and **BREACHED reveal** (line 219). The block's own "must convey three things" list omits BREACHED reveal entirely — and no other part of the Boss spec (including its States section, which only covers the DOM `#depth` text reading "BREACHED") describes the canvas's own reveal moment (`battle.js:68,135` — text "BREACHED" + sub "THE DOOR OPENS" + gold color, distinct from the DOM span). | Journey doctrine's page-spec format ("document... content blocks") + the binding constraint that a spec must not drop a previously-displayed term with no pointer. | Add a fourth conveyance item to the Arena block: "the BREACHED reveal moment (text + color treatment) at frontier break" — or explicitly redirect it to the Siege-readout block as a pointer if it's being deliberately merged with the DOM BREACHED text. |
| Minor | journey | Every per-tab spec restates the locked→`???` render only for Training ("nav button renders `???`"); Grind/Player/Delve/Dungeon's `locked` state lines just say "whole tab, before [condition]" without repeating the `???` label. This is likely intentional (the convention is established once, globally, in `## IA` at line 158-160, and the Page-specs preamble explicitly licenses naming shared conventions once rather than per-spec) — flagged as a minor consistency wrinkle, not a missed requirement, since the global convention does cover all six tabs. | Nielsen #4 consistency (documentation, not UI) | Optional: add one clause to the Page-specs preamble explicitly extending the "named once" convention to the `???` locked-render, the way it already does for entry/exit, so a future reader doesn't have to cross-reference `## IA` to confirm Grind/Player/Delve/Dungeon inherit it too. |

## Requirement Fulfillment

### DW-2.1
PREMISE:  `## Page specs` has six complete entries (one per tab), each with purpose, entry points, ordered content blocks, states, primary action, exit.
EVIDENCE: All six tabs (Boss, Training, Grind, Player, Delve, Dungeon) have a spec with all six required fields present and labeled: **Purpose**, **Entry points**, numbered **Content blocks (in order)**, a **States** list (locked/empty/active/in-progress/error, each addressed or explicitly N/A with a reason), **Primary action**, and **Exit**. Verified line-by-line for each of the six sections (lines 353-674).
VERDICT:  PASS

### DW-2.2
PREMISE:  Every content block in every spec traces to a fact this tab OWNS in the Phase 1 fact-ownership map; no spec reproduces a fact owned elsewhere.
EVIDENCE: Cross-checked every content block's `*Owns: [tab], "[row text]"*` citation against the literal fact-ownership rows (lines 195-291) for all six tabs — every citation matches an actual row text and the correct owning tab, with no content block asserting ownership of a fact the ownership table assigns elsewhere. Every cross-tab reference is explicitly labeled **POINTER** (e.g. Boss's Record-line CP figure → Player, resbar chips → their respective owning tabs) rather than silently repeated. One completeness gap survives from the Major finding above (Boss Arena block under-describes what it's cited as owning — BREACHED reveal) but this is an *incompleteness within a correctly-owned block*, not a mis-attribution or a reproduction of another tab's fact — the specific thing DW-2.2 tests for.
VERDICT:  PASS

### DW-2.3
PREMISE:  Each spec names its primary decision and places it above the fold at phone width (375px reference).
EVIDENCE: All six specs have an explicit bolded **Primary decision:** line. Placement reasoning tied to phone-width/scroll evidence is present for 5 of 6: Training ("the primary decision (block 1) is already first"), Grind ("Single block, already first (and only)"), Delve ("No reorder... audit's own verdict names this tab 'the structural model the others should follow'"), Player ("moved ahead of Trophies/Armory... This is the primary decision"), Dungeon ("Moved below the action blocks... this phase only moves it out of the way of DW-2.3"). Boss's primary-decision elements (wall selector = block 2, descend = block 5 of 6) have no explicit fold-placement reasoning — the spec orders content but never argues the descend button lands above the fold, and (per the Major finding above) never invokes Fitts's law by name anywhere, despite the section header promising it.
VERDICT:  PARTIAL — satisfied for 5/6 tabs with explicit reasoning; Boss's placement is plausible (arena+readout sit at position 3-4 of 6 on what the audit calls the "cleanest" tab) but unargued, and the doctrine-promised Fitts/Hick citation is absent everywhere.

### DW-2.4
PREMISE:  Locked, empty and in-progress states are specified for every tab that has them.
EVIDENCE: Every tab's States section lists `locked`, `empty`/dormant, `active`, `in-progress`, and `error`, with N/A entries carrying a stated reason (e.g. Boss: "`locked`: N/A — Boss is always open, the one tab with no unlock gate"; Delve: "`in-progress`: N/A — Delve is continuous passive accumulation, not a started/stopped run"). Dungeon — the one tab with a genuine running/idle split — specifies fully distinct idle and running content-block sets (lines 619-654) and a distinct `in-progress`/`running` state entry (line 662-664), cross-checked against `main.js renderInstance()`'s `i.running` branch (confirmed at `main.js:961-984`).
VERDICT:  PASS

**All requirements met:** NO (DW-2.3 is PARTIAL)

## Edge cases
- **Locked tabs render as `???` before unlock:** Handled. The `???` render is established once in `## IA` (line 158-160) and every tab's `locked` state entry in Page specs references its own unlock condition, correctly inheriting the shared convention (Training even restates it explicitly). PASS.
- **Boss tab canvas arena — name the region, state what it must convey, no HTML structure:** Mostly handled. The Arena block (lines 372-377) names the region and explicitly excludes HTML structure ("No HTML structure specified — canvas-drawn, reviewable only via `npm run shots`"), and describes 3 of the 4 facts the ownership table attributes to this canvas region. The 4th (BREACHED reveal) is dropped from the block's own conveyance list and never picked up elsewhere in the Boss spec — see the Major finding above. Treated as **substantially handled with a flagged completeness gap**, not a hard FAIL, since the region is correctly named, correctly scoped away from HTML, and 3/4 of its owned facts are present.
- **Dungeon: distinct in-progress state from idle:** Handled cleanly — verified against `main.js` `i.running` branch; content blocks and state list are fully separated between idle and running (lines 619-664). PASS.

## Notes (non-blocking)
- Every unlock condition cited in the specs (`state.unlocked`, `features.training`, `features.grind && everDropped`, `dps >= 100` for Delve, `features.delve && bots.pop >= 10` for Dungeon, `cleared.length>=1 || rebirths>=1` for rebirth) was checked against `main.js checkUnlocks()` (lines 237-255) and matches exactly.
- The duty-gate values cited for Dungeon (Sunder gate:0, Mass Dispel gate:3, Summon Adds gate:5) were checked against `instance.js` (lines 27-29, 37) and match exactly, including the line-number citations in the artifact.
- The `main.js` line citations for the wall selector (`:738`), the `#instBank` sync (`:963`), the bankAt clamp (`:509-511`), and the running-state inline restatement (`:968`) were all verified against source and are accurate.
- The 136-item dormant/locked reconciliation (70 Trophy + 45 Armory + 10 Grind + 11 Training) sums correctly and matches `UI-AUDIT.md`'s independently-measured "~136" headline.
- No token values, pixel measurements, or copy wording were invented anywhere in the Page specs section — correctly deferred to Phases 3/4/5/6 as the dispatch requires.
- This is a document-only review; there is no coverage gap to note beyond the intrinsic absence of a rendered surface for this phase (expected and explicitly carved out by the dispatch).

**Verdict: PASS** — no DW item has zero supporting evidence, no listed edge case is unhandled (the Boss-arena gap is a completeness flag within a substantially-handled edge case, not an unhandled one), and no Critical experience-breaking violation was found. DW-2.3 is PARTIAL rather than a clean PASS, and two Major findings (the missing Fitts/Hick citations, the Boss-arena BREACHED omission) should be addressed before/alongside Phase 4 (where the Boss canvas duplication is already slated for resolution) — but neither rises to a blocking FAIL under the stated Verdict Rules.
