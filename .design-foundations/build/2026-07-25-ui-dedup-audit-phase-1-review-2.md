# Design Review: Phase 1 - UI De-duplication Audit (JOURNEY.md)

## Rendered Evidence (Step 0)
- Screenshot: none — this phase produces a specification document (`internal/JOURNEY.md`), not a rendered surface. Per the dispatch prompt, no browser render was expected.
- Surface: `internal/JOURNEY.md` (Job / Journey / IA / Fact ownership / Combat Power term trace), verified against `internal/UI-AUDIT.md` and the live source (`index.html`, `main.js`, `state.js`, `stats.js`, `crits.js`, `battle.js`, `instance.js`, `dungeon.js`, `trophies.js`, `farm.js`, `armory.js`, `gear.js`).

## Assessment B — Deterministic Detector
- Command: not run — no rendered `.html`/mock exists for this phase (spec-only artifact).
- Exit: N/A (no rendered artifact) — this is the documented no-artifact carve-out, not a failure.
- Findings: N/A — no rendered artifact
- Opened only after Assessment A findings were frozen: N/A (nothing to open)

## Triage
- Baseline (always-on): visual + usability — N/A in the pixel sense (no rendered surface); usability doctrine applied instead to the IA/nav claims made in the document (Hick's law, Miller/Cowan citation correctness).
- Dispatched: `journey` (JTBD school, journey map swim lanes, IA/sitemap, loyalty loop, theater-risk flagging — all directly requested by the DW items and squarely journey's domain).
- Not applicable: `data-viz`, `content-design`, `behavioral`, `deceptive-patterns`, `design-systems`, `ai-native` — no charts, no persuasion/conversion surface, no token system, no product copy being authored (the document is an internal spec, not player-facing copy).
- Deferred: none — the surface is a single markdown document; the two dispatched doctrines (journey, usability) were fully applied without a cap.

## Cross-Pillar Findings (ONE ranked report)

Assessment A (fresh critique) traced every claim in JOURNEY.md against `internal/UI-AUDIT.md` and the live source files. Spot-checked and CONFIRMED accurate against source: `state.js` bars.atk/speed.unlocked (line 51-52), `bots.powerRank:0` gate logic in `instance.js` (`dutyUnlocked`, gates 0/3/5), `main.js checkUnlocks()` unlock conditions for all six features, the Boss-tab triple-render of boss-HP-remaining (`battle.js drawBars` canvas fillText + `main.js` `#depth` + `#record`), the Dungeon duty-row/journal near-verbatim sentence duplication (`main.js` lines 479 vs 1001), the `#instBank` restatement while running (`main.js` lines 963, 968), the 70/45/10/11=136 dormant-item arithmetic (`trophies.js` 10 doors × `PARTS.length`=7, `farm.js` 10-of-15 zone gating at `zoneUnlockClears`), the 4-term `critFactor()` breakdown (`crits.js`), and the Combat Power term trace against `stats.js derive()` (every term in the formula has exactly one displayed home). No fabricated or unverifiable claim was found — this is unusually high grounding rigor for a spec document.

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Minor | journey | The IA section's sitemap prose states the wall selector "appears only once **>1 wall cleared**", but `main.js` gates it on `state.maxWall > 1` (line 738) — and `maxWall` increments to 2 the moment the *first* wall is cleared, so the real trigger is "≥1 wall cleared," not "more than one." The Fact-ownership table two sections later states the correct variable (`maxWall>1`) without the misleading gloss, so the document contradicts itself between the IA narrative and the ownership table. | Nielsen #1, match between system and the real world (1994) — internal terminology must describe the actual trigger consistently across a spec, not just once | Reword the sitemap line to "once the first wall is cleared (`maxWall>1`)" so it agrees with the Fact-ownership table's own phrasing |
| Minor (note, non-blocking) | journey | Several citations name the law but drop the year/originator the doctrine's own citation rule asks for ("Hick's law doesn't demand grouping six items further" and "peak-end rule, Kahneman" appear without a year, unlike the document's own McKinsey 2009 / Watermark 2023 / Moesta citations elsewhere in the same file). | Journey doctrine rule: "Cite the principle... names its source with originator/year where it has one" | Add "(Hick–Hyman 1952)" and "(Kahneman, 1999)" where those laws are invoked, matching the citation discipline used elsewhere in the same document |

No Critical or Major findings survived verification. The document's own internal self-corrections (e.g., explicitly flagging that an earlier draft undercounted the training-tier lock total as 9 instead of 11, and reconciling to the audit's 136 headline) and its explicit theater-risk flags (Watermark 2023 on the emotion curve, "NOT VALIDATED by card sort or tree test" on the IA) are exactly the honest-citation behavior the journey doctrine asks for, not defects.

## Requirement Fulfillment

### DW-1.1
PREMISE:  `internal/JOURNEY.md` exists with `## Job`, `## Journey` and `## IA` sections populated; JTBD school named and not mixed.
EVIDENCE: File exists at the given path. `## Job` (lines 9-55) contains a full job story + Moesta four-forces switch interview. `## Journey` (lines 58-113) contains actor/scenario/scope, a 6-phase swim-lane table, decision model (loyalty loop), and an emotion curve. `## IA` (lines 116-176) contains organization scheme, structure type, sitemap, nav labels, nav model, and validation status. Line 53-54 states explicitly: "**JTBD school used:** Moesta (Switch interview / four forces). Not mixed with Christensen, Ulwick, or Klement vocabulary anywhere in this document." — verified true by scanning the whole file; no Christensen/Ulwick/Klement terms appear.
VERDICT:  PASS

### DW-1.2
PREMISE:  `## Fact ownership` lists every fact displayed across all six tabs, each with exactly one owning tab; no fact has two owners. Combat Power (currently on both the resource bar and the Player tab) is resolved.
EVIDENCE: `## Fact ownership` (line 180 onward) has one table per tab (Global chrome, Boss, Training, Grind, Player, Delve, Dungeon) plus a dedicated Combat Power term trace. Combat Power is resolved explicitly: Player tab `#powerBreakdown` (verified in `index.html` lines 125-129 and `main.js` line 677) is named "THE canonical CP breakdown — owner of the whole product," while the resbar chip (`#cpEl`, verified `main.js` line 668) and the Boss-tab `#record` line (verified `main.js` line 727) are each explicitly labeled "POINTER" / "pointer, not owned here." No other fact in the tables carries two owning-tab labels.
VERDICT:  PASS

### DW-1.3
PREMISE:  Every currently-displayed guideline-5 term (each multiplier/term in the Combat Power product) appears in the ownership table — the map proves nothing gets hidden by later cuts.
EVIDENCE: Cross-checked the "Combat Power product" table (line 295-322) term-by-term against `stats.js derive()` (line 31-56): `BASE_ATK`, `trainedATK`, `gearAtk`, gear `atkPct`/`atkFlat`, trophy `atkPct`, `scriptMult`, trophy `dmgMult`, `delveBonus(overclock)`, `critFactor(cs)` (atk side) and `BASE_HPS`, `trainedHits`, gear `hits`/`haste`, trophy `hastePct`, armory `atkPct`/`hastePct`/`copperPct` (hitsPerSec/copper side) — every term in the live formula has a row with a displayed location. The document's own closing line states "Every term has at least one displayed home. No term is currently hidden" and this was independently confirmed against source, not just asserted.
VERDICT:  PASS

### DW-1.4
PREMISE:  Every duplication in the current UI is listed with its locations (seeded from `internal/UI-AUDIT.md`, extended where that audit is silent).
EVIDENCE: All UI-AUDIT-seeded duplications are carried forward: Boss-tab `%` twice (canvas + `#depth`, DUP 1) plus the `#record` HP-numbers as a third render; Training's back-reference chain on locked tiers; Grind's ten `[LOCKED] break W1/W4` rows; Dungeon's duty-row/journal sentence repeat, "needs N bots" double-render, and 3× difficulty restatement — all confirmed against `main.js` source lines. The document also extends beyond the audit exactly as required: it flags a NEW duplication the audit did not catch — `#instBank` restated inline in `#instState` while a run is active (verified `main.js` lines 963, 968) — explicitly labeled "(not in UI-AUDIT — found in this pass)."
VERDICT:  PASS

### DW-1.5
PREMISE:  Every row/cell has a declared STATE in the map — live, dormant (unlocked but idle), or locked. The audit found ~136 dormant items drawn at live weight; the ownership map must record state, not just ownership.
EVIDENCE: Every row across all seven tables (Global chrome + 6 tabs) carries a State column value (`live`, `dormant`, `locked`, or a conditional like "dormant until 1st rebirth, then live"). The reconciliation note (line 242) shows the arithmetic: 6 locked ATK tiers + 5 locked SPEED tiers = 11 (verified against `state.js` lines 51-52: `bars.atk.unlocked:1` of 7 tiers = 6 locked, `bars.speed.unlocked:1` of 6 tiers = 5 locked) + 70 dormant Trophy pips (verified: 10 bosses with `set:` in `bosses.js` × `PARTS.length`=7 in `trophies.js`) + 45 dormant Armory cells (15 zones × 3 slots, verified `gear.js` SLOTS and `farm.js` zones) + 10 locked Grind zones (verified `zoneUnlockClears` gates zones 5-9 at 1 clear, zones 10-14 at 4 clears) = 136, an exact match to the audit's headline figure, independently re-derived from source rather than copied.
VERDICT:  PASS

**All requirements met:** YES

## Notes (non-blocking)
- Minor sitemap/ownership-table wording inconsistency on the wall-selector unlock threshold (">1 wall cleared" vs. the correct `maxWall>1` / "first wall cleared") — see findings table.
- A few well-known UX laws are cited by name without year/originator, inconsistent with the document's own otherwise-strong citation discipline elsewhere (McKinsey 2009, Watermark 2023, Moesta) — see findings table.
- Two legibility gaps are flagged by the document itself as deliberately out of scope for this phase (Delve's un-multiplied overclock rank display; Grind's un-broken-out copper multiplier) — these are correctly deferred to Phase 2/5 per the plan's stated boundary, not omissions.
- No Assessment B detector run was possible or expected — this phase produces no `.html`; the N/A carve-out applies cleanly.

## Verdict: PASS