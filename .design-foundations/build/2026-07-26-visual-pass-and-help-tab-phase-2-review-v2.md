# Design Review: Phase 2 - Help tab + copy relocation (v2)

## Rendered Evidence (Step 0)
- Screenshot: `internal/mocks/shots/tabrow-specimen-375.png`
- .html mock: `internal/mocks/tabrow-specimen.html`
- Surface: a decision-proof specimen (not a full app screen) — two tab-row variants at 375px, each labeled with a dashed monospace evidence tag ("REJECTED"/"CHOSEN"), reusing DESIGN.md v3 button tokens verbatim. Cross-checked against the spec addition in `internal/JOURNEY.md` (`## Phase 2: Help tab + copy relocation`, lines 1132–1373 of the working copy) and the six live tab mocks (`boss.html`, `training.html`, `grind.html`, `player.html`, `delve.html`, `dungeon.html`).

## Assessment B — Deterministic Detector
- Command: `node "C:/Users/Admin/.claude/plugins/cache/rtd/design-for-ai/4.2.0/scripts/detect.mjs" internal/mocks/tabrow-specimen.html > .design-foundations/build/2026-07-26-visual-pass-and-help-tab-phase-2-review-v2.detect.json`
- Exit: 0 (ran)
- Findings: 0 (16 rules checked, `status: "ran"`, `counts.total: 0`)
- Opened only after Assessment A findings were frozen: YES

## Triage
- Baseline (always-on): visual + usability — both run.
- Dispatched (per the prompt's explicit `## Doctrine` list): `journey` (IA/page-spec/tab-bar re-fit), `content-design` (the relocated microcopy, voice/scannability), `usability` (Hick/Fitts/Miller citations, Nielsen #10 help & documentation).
- Not applicable: `data-viz` (no charts/data encoding on this surface), `behavioral`/`deceptive-patterns` (not a persuasion/conversion surface — Help is reference-only, no CTA to manipulate).
- Deferred: none — surface is small enough (a 2-variant tab-row specimen + one spec section) that all three dispatched pillars were applied in full.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Minor | content-design | The DW-2.3 "Tally" (`internal/JOURNEY.md`, line ~206) claims "21 relocations (2 Boss + 5 Training + 1 Grind + 6 Player + 2 Delve + 5 Dungeon)," but the Training relocation table immediately above it (lines 163–171) lists 6 distinct source rows — `#popFill` caption, `ATK scripts`, `SPEED scripts`, `Enhance squad`, the Ban Wave teaching line, and the retired `#helpModal` — not 5. Summing the table's own rows gives 22, not 21. The likely intent (Ban Wave + the retired modal fold into one Help paragraph, so they're counted as one relocation) is plausible but never stated, so the number offered as DW-2.3's own evidence doesn't reconcile with the table it's supposed to summarize. | Journey doctrine: "Journey maps are research, not decoration" (Watermark 2023) — an artifact offered as verification evidence has to actually verify; an unreconciled tally undercuts the citation's credibility even though (confirmed by row-by-row inspection below) no string is actually lost. | Either fix the arithmetic (22) or add one clause explaining the Ban Wave + retired-modal merge counts as a single relocation. |
| Note | usability | Chosen variant B (`repeat(4,1fr)`) still leaves its second row 3/4 full (Delve, Dungeon, Help; one empty grid cell trails Help) — not a fully rectangular grid. | Not a Fitts's-law or Hick's-law violation (button size/target area unaffected, no touch-target penalty) — noted only because JOURNEY's own rationale for rejecting variant A leans on "no orphan cell wider than its siblings," and B's trailing gap is the same shape of imperfection at a smaller scale. | No fix required — this is the ordinary "last row shorter" pattern (photo grids, app icon grids) and reads as balanced in the screenshot; recorded for completeness only. |

No Critical or Major findings survived verification.

## Requirement Fulfillment

### DW-2.1
PREMISE:  Every string currently on a live surface is classified: stays (decision-point information) or moves (general teaching).
EVIDENCE: Read all six live mocks directly (`boss.html`, `training.html`, `grind.html`, `player.html`, `delve.html`, `dungeon.html`) end-to-end via full-file grep for `<h3`, `class="sub"`, `<p>`, and related teaching-container patterns, then diffed every match against `JOURNEY.md`'s six per-tab relocation tables. Every teaching-class span found on every live surface (Boss: none remaining — already cut by Phase 1, confirmed via `#cooldown`/`#projection`/`#record` text at boss.html:826-840, which now read as short state captions, e.g. `At this rate the door breaks in 323 days.` / `Set pieces 1 of 7 — on the Player tab.`, with the crit ledger already a 3-row table, not prose; Training: `#popFill` caption, `ATK scripts`, `SPEED scripts`, `Enhance squad`, `Ban Wave` — all 5 present at training.html:460-581, all 5 in the relocation table; Grind: `Zones` at grind.html:449-453, in the table; Player: `Combat Power`, `Gear`, Reforge `<p class="sub">`, `Stash`, `Trophies`, `Armory` — all 6 present at player.html:452-624, all 6 in the table; Delve: `Delve`, `Cache tree` at delve.html:450-459, both in the table; Dungeon: `Assign bots`, the two `runPanel` helper `div.sub`s (difficulty + pull-out), `How it works`, `Boss abilities` at dungeon.html:462-515, all 5 in the table) has a matching row in `## Phase 2: Help tab + copy relocation`'s relocation tables. No orphan teaching string found on any of the six live surfaces.
VERDICT:  PASS

### DW-2.2
PREMISE:  A Help page spec exists with structure, states and final copy.
EVIDENCE: `JOURNEY.md`'s `### Help` section (working copy ~line 212 onward) has Purpose, Entry points, Primary decision, 6 ordered content blocks (mirroring tab order, cites Jakob's Law), a States table (one row per block, each gated by the same unlock condition as its live tab, with verbatim-reused locked-state copy), Primary action, Exit, and a full Microcopy/final-copy table (22 rows: 21 `h3` block copy strings + the shared locked-block copy convention) with a cited numeric source per row (e.g. `crits.js:30-32`, `bots.js:24-25,71-75`).
VERDICT:  PASS

### DW-2.3
PREMISE:  No explanation is lost — every moved string has a home.
EVIDENCE: Row-by-row check of all six relocation tables against the Help content-block list and the Help final-copy table: every one of the 22 distinct source elements found on the live surfaces (see DW-2.1 evidence) maps to a named Help § block and has a corresponding final-copy row. One exception is deliberate and stated inline, not lost: the Combat Power `h3` sub's "Everything below feeds these two numbers" clause is explicitly dropped (JOURNEY.md final-copy table, Player row 1: "minus the 'everything below feeds these two numbers' clause, which only made sense inline") because it's a spatial/deictic pointer tied to the live tab's physical layout, not a mechanic explanation — it has no meaning on a differently-ordered Help page. The one arithmetic inconsistency found (DW-2.3's own "Tally" undercounts Training by one row against its own table, see Cross-Pillar Findings) does not correspond to an actually-missing string — verified by inspection, not assumed.
VERDICT:  PASS

### DW-2.4
PREMISE:  The seven-tab row fits 375px with no horizontal scroll.
EVIDENCE: `internal/mocks/shots/tabrow-specimen-375.png`, rendered at 375px viewport width. Variant A (`repeat(3,1fr)`, rejected) and Variant B (`repeat(4,1fr)`, chosen) both render with zero horizontal overflow — no scrollbar, no clipped button, no truncated label text (`Training` and `Dungeon` are the longest labels and render in full in both variants per the pixels). Variant B (the chosen layout, per JOURNEY.md's "Tab row re-fit (DW-2.4)" section) lays 7 buttons out 4+3 at 87px/button, comfortably above the `--touch-min: 44px` floor kept on button height (visually confirmed: buttons are noticeably taller than wide in the screenshot).
VERDICT:  PASS

**All requirements met:** YES

## Notes (non-blocking)
- Both edge cases verified handled: (1) "A locked tab's unlock condition is state, not teaching — it stays" — confirmed: the Help States table's locked-block copy is explicitly reused verbatim from the existing tab-button `title` strings (`main.js:241-245`), never treated as teaching prose subject to relocation or rewrite. (2) "The Help tab must be reachable from the existing `?` button" — confirmed at the spec level: JOURNEY.md's Global chrome table states `#helpBtn` is "Retargeted Phase 2: switches to the Help tab," and all six live mocks already render the `?` button (`class="helpBtn" title="Help"`) at the expected resource-bar position, ready for that retarget. (Phase 2 is spec-only per its own scope note — the actual JS retarget and Help HTML are Phase 3's job; this is consistent with the prompt's framing of this as a Phase 2 review.)
- The tab-row specimen is explicitly a decision-proof artifact (dashed monospace evidence labels, "REJECTED"/"CHOSEN" annotations), not a polished game screen — judged accordingly. It reuses DESIGN.md v3 tokens with zero new hex/px per its own header comment, which is the correct register for this artifact type; the distinctiveness criterion was not applied as a hard gate here since there is no new aesthetic surface being introduced, only a grid-track-count decision on an already-established button system.
- Minor: see the Tally arithmetic note above (Cross-Pillar Findings) — worth a one-line fix in JOURNEY.md but does not affect the substance of DW-2.3.

**Verdict: PASS**
