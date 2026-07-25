# Design Review: Phase 1 - UI De-duplication Audit (JOURNEY.md)

## Rendered Evidence (Step 0)
- Screenshot: none — this phase produces a specification document (`internal/JOURNEY.md`), not a rendered surface. No-artifact carve-out applies.
- Surface: `internal/JOURNEY.md` (Job / Journey / IA / Fact ownership / CP-term trace), cross-checked against `internal/UI-AUDIT.md` and the live source (`index.html`, `main.js`, `stats.js`, `crits.js`, `bots.js`, `state.js`).

## Assessment B — Deterministic Detector
- Command: not run — no rendered `.html`/mock exists for this phase (spec-level artifact only).
- Exit: 3 N/A (no rendered artifact)
- Findings: N/A — no rendered artifact
- Opened only after Assessment A findings were frozen: N/A (detector not run)

## Triage
- Baseline (always-on): visual/usability baseline narrowed to **usability-as-cited-by-journey** only — there is no rendered surface to audit for typography/color/composition, so the visual half of the baseline is not applicable; the usability half applies to the extent JOURNEY.md cites usability laws (Hick's, Miller/Cowan) in its IA section.
- Dispatched: `journey` (per dispatch `## Doctrine`) — JOURNEY.md is exactly the journey pillar's output artifact (JTBD, journey map, IA, sitemap). `usability` (per dispatch `## Doctrine`) — cited down into the IA section for nav-option and chunking judgments.
- Not applicable: `data-viz`, `content-design`, `behavioral`, `deceptive-patterns`, `design-systems`, `ai-native`, and the visual/`design-dna`/`ai-tells` baseline — no chart, no real product copy under review, no persuasion surface, no rendered pixels to judge for genericness. This is a structural/textual artifact.
- Deferred: none — surface is a single markdown document, no capping needed.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Critical | journey | Dungeon tab's `#instBank` field ("Pull out at floor") is a live, player-set numeric fact — `state.instance.bankAt`, read/written in `main.js:509-511,963` — that is completely absent from the Dungeon tab's fact-ownership table. Worse, `main.js:968` restates the same value in `#instState` ("...pulling out at floor ${i.bankAt}") whenever a run is active — a live input-vs-readout duplication of exactly the shape the Difficulty row *is* captured for (`#instKey`/`#instKeyInfo`), but this one is untraced anywhere in the map, and `UI-AUDIT.md` is silent on it too. | Journey doctrine "JOURNEY.md is the output artifact... carries the spec that visual tokens alone can't encode" — an ownership map that omits a rendered, stateful fact fails its own purpose; dispatch instruction explicitly: "a rendered fact absent from the map is a finding" | Add an `instBank` row to the Dungeon table (owner: Dungeon tab; state: live; DUP with `#instState`'s "pulling out at floor" restatement, following the same pattern already used for Difficulty) |
| Critical | journey | Training tab's declared tier state counts are wrong. JOURNEY.md states "ATK training tiers (×7) — 2 live, 5 locked" and "SPEED training tiers (×6) — 2 live, 4 locked" (9 locked total). Ground truth (`state.js:51-52`: `bars.atk.unlocked:1`, `bars.speed.unlocked:1`; unlock logic `bots.js:212`) puts only tier index 0 unlocked per lane at game start — i.e. 1 not-locked tier per lane, 6 locked ATK + 5 locked SPEED = **11 locked**, exactly matching `UI-AUDIT.md`'s own G2 table ("Training → tiers \| 11 of 13 \| locked") that this document is required to seed from (DW-1.4). JOURNEY.md's own numbers (9 locked) silently diverge from the ~136-dormant-item anchor figure DW-1.5 exists to reconcile (70 + 45 + 10 + 11 = 136; 70 + 45 + 10 + 9 = 134). | Journey/usability doctrine: a journey map / IA artifact is "research, not decoration" (Watermark 2023) — an inaccurate state count defeats the artifact's stated job of proving nothing is silently mis-tracked | Correct the two Training rows to "1 live, 6 locked" (ATK) and "1 live, 5 locked" (SPEED), reconciling to the audit's 11-of-13 and the ~136 total |
| Minor | journey | Delve's Cache-tree overclock row and Grind's un-broken-out `copperMult` are both flagged in-document as "legibility gaps for Phase 2/5, not a duplication" — correct call, but the JOURNEY doctrine's Hick's-law/chunking citations aren't invoked for either, even though both are exactly a chunking/legibility question (a multi-step-derived number the player can't read as one figure) | Miller/Cowan ~4±1 chunking (cited elsewhere in this same doc's IA section) | When Phase 2/5 picks this up, cite the chunking law explicitly rather than leaving it as an unsourced "gap" note |

## Requirement Fulfillment

### DW-1.1
PREMISE:  `internal/JOURNEY.md` exists with `## Job`, `## Journey` and `## IA` sections populated; JTBD school named and not mixed.
EVIDENCE: All three headers present and populated (`## Job` lines 9-55, `## Journey` lines 58-113, `## IA` lines 116-176). JTBD school explicitly named: "**JTBD school used:** Moesta (Switch interview / four forces). Not mixed with Christensen, Ulwick, or Klement vocabulary anywhere in this document" (lines 53-55) — verified no Christensen/Ulwick/Klement terms appear elsewhere in the document.
VERDICT:  PASS

### DW-1.2
PREMISE:  `## Fact ownership` lists every fact displayed across all six tabs, each with exactly one owning tab; no fact has two owners. Combat Power (currently on both the resource bar and the Player tab) is resolved.
EVIDENCE: `## Fact ownership` section (lines 180-288) covers Global chrome + all 6 tabs, each fact row carrying a single "Owned by"/owner designation, with cross-tab echoes explicitly marked POINTER (not a second copy) — e.g. Combat Power row: "**Player tab** ... POINTER — chrome echo of the Player-owned CP total, not a second breakdown" (line 203), and the Player-tab CP row cross-references back: "Resolves DW-1.2's named conflict" (line 253). However, spot-checking against source (`main.js:509-511,963,968`) found `#instBank` ("Pull out at floor," `state.instance.bankAt`) — a live, player-set, rendered fact — with no ownership row anywhere in the Dungeon table. This is a rendered fact the map does not account for, which the dispatch's own spot-check clause treats as a finding.
VERDICT:  FAIL

### DW-1.3
PREMISE:  Every currently-displayed guideline-5 term (each multiplier/term in the Combat Power product) appears in the ownership table — the map proves nothing gets hidden by later cuts.
EVIDENCE: Traced `stats.js derive()` (lines 31-56) term-by-term against the `## Combat Power product` table (lines 292-319): `BASE_ATK`, `trainedATK`, `gearAtk`, gear `atkPct`/`atkFlat`, trophy `atkPct`, `scriptMult`, trophy `dmgMult`, `delveBonus(overclock)`, `critFactor(cs)`, `BASE_HPS`, `trainedHits`, gear `hits`/`haste`, trophy `hastePct`, armory `atkPct`/`hastePct`/`copperPct`, and `copperPct`→`copperMult` are all present with a displayed-location citation. Cross-checked `crits.js critFactor()`/`critStats()` (lines 14-32) against the claimed "4 sub-terms" (rate, superRate, critMult, superMult) at `#projection` — matches exactly. No `derive()` term found missing from the table.
VERDICT:  PASS

### DW-1.4
PREMISE:  Every duplication in the current UI is listed with its locations (seeded from `internal/UI-AUDIT.md`, extended where that audit is silent).
EVIDENCE: All UI-AUDIT-seeded duplications are carried forward with explicit "seeded from UI-AUDIT" citations: Boss's canvas-vs-DOM `%` (DUP 1, line 218) plus the third HP restatement in `#record` (line 223); Training's tier back-reference chain (line 235); Grind's `[LOCKED] break W1/W4` ×5 rows (line 246); Dungeon's duty "needs N bots" ×3 (finding #3, line 284), Difficulty ×3 (finding #4, line 285), and journal-vs-duty-row sentence duplication (finding #2, line 288, confirmed independently by reading both template strings in `main.js`). However, the `#instBank`/`#instState` "pulling out at floor" duplication (found by spot-checking `main.js:509-511,963,968` against the source) is a real duplication the audit is silent on and that DW-1.4 explicitly requires this document to catch by extension — it is not listed anywhere.
VERDICT:  FAIL

### DW-1.5
PREMISE:  Every row/cell has a declared STATE in the map — live, dormant (unlocked but idle), or locked. The audit found ~136 dormant items drawn at live weight; the ownership map must record state, not just ownership.
EVIDENCE: Every row across all 6 tab tables carries a State column value (live/dormant/locked), and counted groups (Trophies 70, Armory 45, Grind zones 10-of-15-locked) exactly match `UI-AUDIT.md`'s G2 figures. But the Training tab's declared counts ("2 live, 5 locked" ATK; "2 live, 4 locked" SPEED — 9 locked total) contradict both `state.js:51-52` (`bars.atk.unlocked:1`, `bars.speed.unlocked:1`, meaning only 1 tier per lane is not-locked) and `UI-AUDIT.md`'s own line "Training → tiers \| 11 of 13 \| locked." The correct split is 6 locked ATK + 5 locked SPEED = 11, not 9. This state declaration is measurably wrong and silently breaks the ~136-item reconciliation the requirement names as its acceptance bar (70+45+10+11=136 vs. the document's own 70+45+10+9=134).
VERDICT:  FAIL

**All requirements met:** NO

## Notes (non-blocking)
- Both listed edge cases are handled correctly: (1) Combat Power is named to one owner (Player tab) with the resbar and Boss-tab echoes explicitly marked as pointers, not copies (lines 203, 253); (2) canvas-drawn facts are inventoried and flagged canvas-only (Boss tab table, lines 218-219: "canvas-only", explicitly noted as unreviewable except via `npm run shots`).
- The document is honest about its own evidentiary limits in a way the journey doctrine specifically asks for: the emotion curve is flagged "UNGROUNDED as a formal emotion curve... Watermark 2023" rather than presented as researched (lines 104-112), and the IA's tab labels are flagged "NOT VALIDATED by card sort or tree test" (lines 171-176). Both are correct, doctrine-compliant disclosures, not gaps.
- JTBD, loyalty-loop, and IA citations (Moesta, McKinsey 2009, Rosenfeld/Morville, Hick's law, Miller/Cowan revised to Cowan, Kahneman peak-end) are all correctly sourced and used in-register — no unsourced structural claims found in Job/Journey/IA.

## Issues (if FAIL)
1. `#instBank` ("Pull out at floor," Dungeon tab) — a live, stateful, rendered fact with its own restatement duplication — is entirely absent from the fact-ownership map. — Critical / journey / "a rendered fact absent from the map is a finding" (dispatch spot-check clause) / Add an ownership row + duplication note mirroring the Difficulty row's pattern.
2. Training tab tier live/locked counts (declared 2 live/9 locked) contradict both `state.js` ground truth and `UI-AUDIT.md`'s own 11-of-13-locked figure, breaking the ~136-item reconciliation DW-1.5 is graded against. — Critical / journey / journey maps are "research, not decoration" (Watermark 2023) / Correct to 1 live/6 locked (ATK), 1 live/5 locked (SPEED).

**Verdict: FAIL — DW-1.2, DW-1.4, DW-1.5 blocked by the two Critical findings above (missing `#instBank` fact/duplication; incorrect Training tier state counts contradicting the seed audit's own headline figure).**
