# Design Review: Phase 5 - UI de-duplication microcopy (JOURNEY.md)

## Rendered Evidence (Step 0)
- Screenshot: none — this phase produces specification copy (the `## Page specs` microcopy tables in `internal/JOURNEY.md`), not a rendered surface. No live capture was substituted for pixels; the artifact is textual and was read in full.
- Surface reviewed: all six `## Page specs` entries (Boss, Training, Grind, Player, Delve, Dungeon) plus `### Shared chrome, log lines and locked-tab copy` and `### Lexicon audit (DW-5.4)` in `internal/JOURNEY.md` (lines 326–1119 of the file as currently modified in the working tree).

## Assessment B — Deterministic Detector
- Command: not run.
- Exit: N/A — no rendered `.html`/mock exists for this phase (the artifact is a Markdown spec). Per the dispatch's own dual-blind note, `scripts/detect.mjs` is N/A here, not a failure — this is the no-artifact carve-out, not a skipped detector.
- Findings: N/A — no rendered artifact.
- Opened only after Assessment A findings were frozen: N/A (nothing to open).

## Triage
- Baseline (always-on): usability (state/error-path adjudication) + the content-design doctrine dispatched for this phase (`content-design.md`, read from `C:/Users/Admin/.claude/plugins/cache/rtd/design-for-ai/4.2.0/references/content-design/content-design.md`).
- Dispatched: `content-design` (explicit doctrine for this phase — microcopy, error/empty-state formulas, plain language, voice/tone).
- Not applicable: `data-viz` (no charts/data encoding in this artifact), `behavioral`/`deceptive-patterns` (no conversion/persuasion surface — idle-game mechanic copy only), `journey` (structural IA was Phase 1/2's job, locked and untouched this phase per the git diff below), `design-systems`/visual pillars (no rendered surface, no tokens applied here).
- Deferred: none — the artifact is small enough (six page specs + shared chrome) to review in full against every DW item and against all 15 named source files.

## Verification method
Per the dispatch's "check that matters most," every numeric/formula claim in the six page specs was traced to its cited source line and its **arithmetic**, not just its citation's existence, was checked. Source files read in full: `bots.js`, `farm.js`, `dungeon.js`, `instance.js`, `enhance.js`, `gear.js`, `armory.js`, `trophies.js`, `rebirth.js`, `crits.js`, `bosses.js`, `battle.js`, `stats.js`, `pull.js`, `state.js`, `main.js`, `index.html`, `rarity.js`, `affixes.js`. Roughly 150 distinct cited constants/formulas/line numbers were cross-checked (capacity/create/power/speed curves, enhance odds tables, crit factor, Cache tree formulas, dungeon ban rate/wipe/floor timing, trophy set math, Armory rank cost/lane math, offline cap, and dozens of specific `main.js`/`index.html` line citations for "current copy this replaces"). The overwhelming majority matched exactly, including several very precise single-line citations (e.g. `battle.js:68`, `battle.js:135`, `battle.js:139`, `main.js:385`, `main.js:766`, `main.js:844`, `instance.js:120`, `instance.js:147`, `instance.js:159`) that were verified character-for-character against the live source. Two citation-accuracy nits surfaced (below); no invented numbers and no arithmetic mismatches were found.

Also verified: `git diff` shows `internal/DESIGN.md` unchanged since its creation commit (`b34fc60..HEAD` is empty) — the LOCKED constraint holds. `git diff --stat -- internal/JOURNEY.md` shows the phase's change is **433 insertions, 0 deletions** — purely additive; Phase 1/2 content (Job/Journey/IA/Fact-ownership) is untouched, satisfying "additive rather than a restructure of Phases 1-2."

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Minor | content-design | The Boss-tab wall-selector spec attaches "replaces the unexplained `⚑` glyph with a word" to the **frontier button** row, but `main.js:748` (`w < state.maxWall ? \`W${w} ${bw.name} ⚑\` : \`W${w} ${bw.name}\``) shows the `⚑` glyph is currently rendered on **cleared** wall buttons, and the frontier button currently renders with **no** glyph at all. The citation's before/after direction is reversed. | Traceability requirement of this review round: a citation must describe what the cited line actually does, not an approximation | Reattach the "replaces the `⚑` glyph" clause to the "cleared button" row instead of "frontier button"; the proposed final copy itself (`· fighting` / `· farming`) is unaffected and needs no change |
| Minor | content-design | `instance.js:19,22` is cited for `WIPE_AT = 0.25`, but that constant is declared at `instance.js:13`; lines 19 and 22 are a comment and `WIPE_KEEP = 0.4` respectively. The cited *value* (0.25) is correct — only the line pointer is off by six lines. | Same traceability requirement — "check the arithmetic too, not just the presence of a citation" | Correct the citation to `instance.js:13` |

No Critical or Major findings. No invented numbers were found anywhere in the six page specs or the shared-chrome section; every constant, growth rate, cap, and formula quoted in the copy traces to a real line producing that exact value.

## Requirement Fulfillment

### DW-5.1
PREMISE:  Every content block in all six page specs has final copy.
EVIDENCE: Cross-checked each tab's `**Content blocks (in order)**` list against its `**Microcopy (Phase 5)**` Final-copy table. Boss: blocks 1–6 (identity, wall selector, arena, siege readout, progress, story) each have rows. Training: blocks 1–5 (Rig, ATK scripts, SPEED scripts, Enhance squad, Ban Wave) each have rows, including every named state (`locked`, `empty`/dormant, `active`, `in-progress` N/A, `error`). Grind: its one block (Zones) has rows for every named row-state (locked/unmanned/can't-hold/held/held-at-cap/saturated). Player: blocks 1–6 (CP breakdown, Titles, Gear, Stash, Trophies, Armory) each have rows, including the densest coverage in the doc (enhance bands, reforge, stash filters). Delve: blocks 1–3 (state, Cache banked, Cache tree) covered. Dungeon: idle blocks 1–6 and running blocks 1–6 covered plus five dungeon log lines. Shared chrome (resbar, locked-tab titles, unlock announcements, global log lines, footer) is also fully covered in its own section.
VERDICT:  PASS

### DW-5.2
PREMISE:  No mechanic is explained more than once within a single tab.
EVIDENCE: Every tab spec opens an explicit "Explained-once register" table naming the ONE element that teaches each mechanic and which elements "carry the value but do NOT re-explain." Verified this against the Final-copy rows themselves, e.g.: Training's ATK-tier "predecessor's name is CUT" (locked rows now say `locked · {fills}/{needed} fills` with no back-reference, confirmed against `main.js:797`); Dungeon's duty-row sub drops `Blocked by {duty} bots.` (kept only in the `Assign bots` h3 sub) and the journal row drops the whole effect sentence (confirmed against `main.js:479` current text vs. the proposed cut, and `main.js:1001` current duplicate vs. proposed `main.js:1005` non-duplicate); Player's "haste" is defined once in the Combat Power sub and not re-defined at Trophy pips, Armory cells, or gear affixes despite all three printing `+{n}% haste` values.
VERDICT:  PASS

### DW-5.3
PREMISE:  Every empty, locked and error state has copy naming the condition and the way out.
EVIDENCE: Sampled every error path across all six tabs: enhance-fails-on-copper ("not enough copper — this attempt costs {cost}c"), reforge-can't-afford ("not enough {rarity} scrap — you need {n}, salvage {rarity} items to get it"), over-allocation ("over-assigned by {n}% — ... until you free some or the swarm grows"), empty enhance slot ("nothing equipped in that slot — equip something on the Player tab first"), zone can't hold ("too weak to hold — {have} damage/s of the {need} this zone needs"), dungeon party-exceeds-swarm ("You've assigned {n} bots but only have {m} — lower a duty, or wait for the swarm to grow") — each states condition + fix per Yifrah's error-message formula. All five locked-tab titles name their unlock condition without spoiling content (`main.js:241-245`). Two deliberately-hidden "empty" widgets (Titles at 0, `#stacksHud` at 0 failstacks) carry no on-widget string, but the document explicitly reasons this is to avoid the exact DW-5.2 restatement violation, and the condition/way-out is stated once elsewhere in the same view (the enhance readout, the Gear `h3` sub) — noted below, not a violation.
VERDICT:  PASS

### DW-5.4
PREMISE:  Copy passes a plain-English read: no string requires knowing the lexicon to understand what the control does.
EVIDENCE: The `### Lexicon audit (DW-5.4)` table names every `REMAKE-DESIGN.md` §16 register term that survives into the copy, with the plain-English clause and its location. Spot-checked several: "multiclient" → "{cap} → {nextCap} bot slots" on its own button; "failstack" → "worth +1 percentage point on your next attempt, up to +15" on the Gear sub; "key (difficulty)" → deliberately never surfaced, the input is labeled "Difficulty" instead. The two shell-register lines (`maintenance@dead-server:~$`, `Players online: 1`) are explicitly carved out as atmosphere that gates no action, consistent with the binding constraint that shell-voice stays confined to those two edges.
VERDICT:  PASS

**All requirements met:** YES

## Notes (non-blocking)
- No screenshot/rendered surface exists for this phase (spec-copy phase, not a rendered one) — this is the documented no-artifact carve-out per the dispatch, not a coverage gap requiring a re-run.
- Two widgets (Player-tab Titles at 0 earned, `#stacksHud` at 0 failstacks) render no string at all rather than an explicit empty-state sentence. The document reasons this avoids restating information the `h3` sub already carries (DW-5.2), and the condition/way-out is present once in the same view — a defensible trade-off, not a DW-5.3 violation, but worth the build phase double-checking these two spots read as *intentionally* blank rather than broken when the actual DOM ships.
- `state.js` carries stale explanatory comments for bot-rig math (`capacity = 8 + 4×rank`, `generator: 2/h × (1 + 0.5×rank)`) that do **not** match the live formulas in `bots.js` (`capacity = round(40 × 1.2^rank)`, `createRate = 60 × (1 + 0.5×rank)`). This is not a JOURNEY.md defect — the copy correctly cites and uses the real `bots.js` formulas, not the stale `state.js` comments — but it's a latent trap for a future pass that greps the wrong file for these numbers.
- The two Minor citation-line nits above do not affect any player-facing string; they only affect the traceability of the design document's own justification text.

## Verdict: PASS
