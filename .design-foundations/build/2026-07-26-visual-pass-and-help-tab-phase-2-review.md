# Design Review: Phase 2 - Help tab + copy relocation

## Rendered Evidence (Step 0)
- Screenshot: `internal/mocks/shots/tabrow-specimen-375.png` (375px capture, variant A rejected + variant B chosen, both rendered)
- .html / mock: `internal/mocks/tabrow-specimen.html` — a structural evidence specimen (DW-2.4 only), not a finished production surface: two `<nav>` grids, same seven labels, dashed `stateLabel` markers, tokens reused verbatim from `internal/mocks/build.mjs` (verified: `--gold`, `--dim`, `--bg`, `--panel`, `--field`, `--line`, `--radius-control`, `--touch-min`, `--tab-pad`, `--font-ui` all match `build.mjs` byte-for-byte).
- Surface: the tab-row re-fit specimen (pixels) + `internal/JOURNEY.md`'s Phase 2 section (spec: relocation table, Help page spec, IA/global-chrome edits) cross-checked against the six live mocks (`boss/training/grind/player/delve/dungeon.html`) for classification completeness.

## Assessment B — Deterministic Detector
- Command: `node "C:/Users/Admin/.claude/plugins/cache/rtd/design-for-ai/4.2.0/scripts/detect.mjs" internal/mocks/tabrow-specimen.html > .design-foundations/build/detect.json`
- Exit: 0 (ran)
- Findings: 0 (16 rules checked, no hits)
- Opened only after Assessment A findings were frozen: YES

## Triage
- Baseline (always-on): visual + usability — applied to the tab-row specimen pixels.
- Dispatched: `journey` (IA/nav re-fit, page-spec altitude), `content-design` (relocation table's stays/moves classification, reader's-state scanning), `usability` (Hick's law at seven tabs, Fitts's law on touch targets, Nielsen #10 help & documentation) — all three named in the dispatch's `## Doctrine` and confirmed relevant: this phase is exactly an IA/copy-relocation spec, no charts, no conversion mechanics.
- Not applicable: `data-viz` (no charts/data encoding), `behavioral`/`deceptive-patterns` (no persuasion/conversion surface).
- Deferred: none — surface small enough (one 96-line specimen + one spec document) that no pillar needed capping.
- Distinctiveness criterion: N/A-weighted, not skipped. `tabrow-specimen.html` is explicitly an internal proof artifact (dashed `STATE` labels, `DW-2.4 EVIDENCE` headers) reusing existing v3 tokens under an explicit OUT-of-scope boundary on visual styling ("Scope — OUT: visual styling (inherits Phase 1's DNA)", plan Phase 2). Judging it for a nameable aesthetic direction would be inventing a requirement the plan explicitly excludes from this phase; noted, not failed.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Major | content-design / journey | `internal/mocks/dungeon.html:500-501` and `:584-585` render `"Your bots come home with everything the moment they clear this floor. You can change it mid-run."` — a general mechanic explanation (not tied to any of the player's current numbers) — but this string is absent from JOURNEY.md's Dungeon relocation table (which lists only 4 items: "How it works" block, "Assign bots" sub, `#instKeyInfo`, "Boss abilities" sub) and absent from the Help→Dungeon final-copy table. Phase 1's own fact-ownership table for this exact row (`## Fact ownership` → Dungeon → "Pull-out-at-floor setting") explicitly says *"not fixed by this phase, recorded so Phase 2 addresses both restatements together"* [with the Difficulty helper] — Phase 2 addressed Difficulty but not this one. | Redish scanning/reader's-state (content-design workflow step A.2: identify what the reader needs at this moment vs. general teaching) — an unclassified string means DW-2.1's "every string is classified" is not met | Add a Dungeon relocation-table row for this string (moves → Help § "How a run works" or a new "Pulling out" sub-block) or explicitly justify it as STAYS (e.g. short-flavor exemption) — either way, give it a row |
| Major | content-design | `internal/mocks/training.html:460-461` renders `"231 of 248 slots filled — this bar is every bot you own; the counter at the top of the screen is the ones not assigned to anything."` — a general explanation of the relationship between the population bar and the resbar's free-bots chip. Not present in JOURNEY.md's Training relocation table (4 rows: ATK scripts, SPEED scripts, Enhance squad, Ban Wave) nor in Help's Training content blocks. | Redish (*Letting Go of the Words*, 2007): a clause explaining what two numbers mean relative to each other, independent of the player's current decision, is general teaching, the same category the relocation table exists to catch | Add a Training relocation-table row (moves → Help § "Scripts"/"Rig", or a new sub-block) or justify STAYS explicitly |
| Note | usability | The tab-row specimen's variant B (`repeat(4,1fr)`) is well-argued and evidenced: 87px buttons, all above the 44px `--touch-min` floor, `document.scrollWidth: 375` at 375px, no text truncation on the longest labels. Rendered screenshot confirms 4+3 layout, no visible scrollbar. | Fitts's law (1954) — touch target ≥44px kept; Hick's law restated at 7 items, correctly not over-applied (7 is not a violation per Miller/Cowan, which governs memory load not on-screen count) | No fix needed — this is a clean pass, noted for completeness |
| Note | detector | 0 findings across 16 rules on the specimen file. Consistent with a bare token-reused structural fixture — no gradient/purple-triplet/generic-AI surface to flag. | ai-tells.md (Impeccable-ported ruleset) | N/A |

## Requirement Fulfillment

### DW-2.1
PREMISE:  "Every string currently on a live surface is classified: stays (decision-point information) or moves (general teaching)."
EVIDENCE: The relocation table classifies 19 register-derived strings across all six tabs, each traced to source line numbers and cross-checked verbatim against the live mock HTML (Boss `#projection`/`#cooldown` — matches; Training ATK/SPEED/Enhance/Ban Wave subs — match; Grind Zones sub — matches; Player Combat Power/Gear/Reforge/Stash/Trophies/Armory subs — match; Delve Delve/Cache-tree subs — match). However, two live-surface strings were found NOT present in any relocation-table row or Help final-copy table: `dungeon.html:500-501,584-585` (bankAt/"come home with everything" sub — explicitly flagged by Phase 1 for Phase 2 to handle) and `training.html:460-461` (population-bar sub explaining bar-vs-chip relationship).
VERDICT:  PARTIAL — the classification method and majority of the work is sound and traceable, but "every string" is not met; two concrete counterexamples found on the actual live mocks.

### DW-2.2
PREMISE:  "A Help page spec exists with structure, states and final copy."
EVIDENCE: `internal/JOURNEY.md` lines 1246-1332: Purpose, Entry points (tab nav + `?` button), Primary decision (none, reference-only), Content blocks (6, one per tab, ordered to mirror the tab bar — Jakob's Law cited), States table (each block gated to its tab's existing unlock condition, locked-copy reused verbatim from `main.js:241-245`), Primary action, Exit, and a full Microcopy/final-copy table (19 rows + the locked-block row) with sourced verbatim/restitched provenance for every line.
VERDICT:  PASS

### DW-2.3
PREMISE:  "No explanation is lost — every moved string has a home."
EVIDENCE: The Tally (JOURNEY.md line 1240) reconciles 19 relocations (2 Boss + 4 Training + 1 Grind + 6 Player + 2 Delve + 4 Dungeon) against the 6 Help content blocks, and the Final-copy table gives each one prose. Cross-checked: every row in the relocation table does have a corresponding Help final-copy entry. The two strings flagged under DW-2.1 (not currently classified) have not been deleted from the live surfaces — they are still fully rendered on `dungeon.html`/`training.html` today — so no explanation has actually been lost yet; the risk is that Phase 3, which implements "the Phase 2 relocation" against these exact mocks, has no instruction for what to do with them, which could silently drop them at that point.
VERDICT:  PASS (with the DW-2.1 gap noted as a forward risk, not a present loss)

### DW-2.4
PREMISE:  "The seven-tab row fits 375px with no horizontal scroll."
EVIDENCE: `tabrow-specimen.html` renders two variants at 375px (screenshot: `tabrow-specimen-375.png`). Variant A (`repeat(3,1fr)`, rejected): 3+3+1 layout, orphaned 7th button, `scrollWidth:375` (no overflow, but visually an unfitted extension). Variant B (`repeat(4,1fr)`, chosen): 4+3 layout, uniform 87px buttons, `scrollWidth:375`, no truncation on "Training"/"Dungeon" (longest labels), button height holds the 44px `--touch-min` floor. Screenshot confirms both variants render with no visible horizontal scrollbar and Variant B lays out evenly.
VERDICT:  PASS

**All requirements met:** NO — DW-2.1 is PARTIAL (two unclassified live-surface strings found; see Cross-Pillar Findings).

## Notes (non-blocking)
- The distinctiveness/AI-tells criterion was not applied as a pass/fail gate to `tabrow-specimen.html` because the plan explicitly scopes visual styling OUT of this phase (inherits Phase 1's DNA) and the file is self-labeled internal evidence, not a shipped surface — flagged rather than silently skipped, per protocol.
- The relocation table's internal arithmetic (19 = 2+4+1+6+2+4, matching the Tally) is correct and was independently re-summed against the table rows during this review — no discrepancy found there.
- Boss tab's mock file (`boss.html`) has since been recomposed for visual DNA v3 (a later, parallel Phase 1 track) and now carries an appended "specimen" section reusing Grind's rowlist for material-language proof — clearly labeled as such and out of scope for this Phase 2 review; not a Boss-tab content addition.
- Six live mocks (training/grind/player/delve/dungeon) still render the full un-relocated teaching prose verbatim — this is expected and correctly scoped to Phase 3 ("Produces: `internal/mocks/{training,grind,player,delve,dungeon,help}.html`" — recomposition against "the Phase 2 relocation"), not a Phase 2 defect.

## Issues (if FAIL)
1. DW-2.1 not fully met — two live-surface strings (`dungeon.html` bankAt sub, `training.html` population-bar sub) are unclassified by the relocation table, one of them explicitly flagged by Phase 1 for Phase 2 to resolve. — Major / content-design+journey / Redish reader's-state, DW-2.1's own "every string" wording / Fix: add both as relocation-table rows (moves → Help, with a named sub-block) or explicit STAYS justifications, updating the Tally count accordingly.

**Verdict: FAIL — blocker: DW-2.1 (two unclassified live-surface strings; see Issues).**
