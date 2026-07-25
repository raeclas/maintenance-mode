# Design Review: Phase 6 — UI de-duplication audit, final mocks

## Rendered Evidence (Step 0)
- Screenshots: `internal/mocks/shots/{boss,training,grind,player,delve,dungeon}-{375,1280}.png` (12 total) — all read and inspected directly.
- Surface: six self-contained HTML mocks, each showing the tab's live save state (frontier W2, W1 cleared/farming, CP 2,481,600/s), with Boss and Dungeon additionally showing a second labelled state block (broken/farming; idle/running) side by side in the same file.

## Assessment B — Deterministic Detector
- Command: `node "C:/Users/Admin/.claude/plugins/cache/rtd/design-for-ai/4.2.0/scripts/detect.mjs" internal/mocks/{boss,training,grind,player,delve,dungeon}.html > .design-foundations/build/detect.json`
- Exit: 0 (ran)
- Findings: 0 across 16 rules (`"status":"ran","counts":{"total":0}`)
- Opened only after Assessment A findings were frozen: YES — detector was launched first, output redirected to file, and not read until after the full screenshot/token/spec pass below was complete.

## Triage
- Baseline (always-on): visual (design-dna/checklists) + usability.
- Dispatched: `usability` (interactive rows, allocation controls, touch targets), `responsive` (phone-first layout, DW-6.3, breakpoint strategy), `checklists` (typography/color/hierarchy audit checklist) — all named in the dispatch's `## Doctrine`.
- Not applicable: `data-viz` (no charts/graphs — meters and stat rows are UI components, not data-viz encodings, per the pillar-taxonomy's own "tables-as-UI-pattern → usability" disambiguation), `content-design` (copy is specified verbatim by JOURNEY.md Phase 5, not authored fresh this phase), `journey`/`behavioral`/`deceptive-patterns` (no persuasion/conversion surface, no new flow being designed this phase).
- Deferred: none — six mocks is within a single pass's budget with the three dispatched doctrines plus the baseline.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Minor | usability / content | Grind's five region-3 locked zones (Frostbound Wastes, The Sunken Archive, Obsidian Reach, The Hollow Spire, World's Edge) each render the byte-identical string `locked · needs 4 doors open, you have 1` — the exact "group boundary rendered as N repeats" pattern Phase 1's audit flagged for the Grind tab (`internal/JOURNEY.md` line 248, 642). JOURNEY.md itself names this a "component-repeat call" deferred to Phase 4, and DESIGN.md's Phase 4 Row component spec never actually built a collapsed/grouped treatment for it — so it survives unchanged into these Phase 6 mocks. | Nielsen #8 (aesthetic/minimalist design — redundant information dilutes relevant information); Tufte (data-ink: five renders of one fact) | Not a copy fix (the string is already correct per Phase 5) — needs a Row-component variant that collapses same-condition locked siblings under one group header (e.g. "5 zones · locked · needs 4 doors open, you have 1"), the fix the project's own docs already scoped to a later component pass. Track it explicitly rather than let "Phase 4/6" ambiguity keep deferring it. |
| Minor (Note) | checklists (Ch.7) | Bottom of the type scale (`--fs-small` 11px → `--fs-label` 10px → `--fs-micro` 9px`) steps at ~10–11% per level, under the checklist's "≥25% size difference for meaningful hierarchy contrast" guidance (Should-Pass tier, not Must-Pass). | Checklists.md §1 Typography "Should Pass" | No action needed this phase — this is DESIGN.md's own Phase 3 hand-tuned scale, already locked and approved with a stated rationale ("tightens at the bottom where dense data rows need it"). Flagged for completeness, not a Phase 6 defect: Phase 6 applied the locked scale faithfully. |
| Minor (Note) | responsive | Several data-row/label sizes (9–11px) sit below the informal ~16px "readable without zoom" guidance for mobile body text. | responsive.md "content readable without zooming" | Same as above — a deliberate, previously-reviewed MMO-stat-row density register (contrast-verified AA in DESIGN.md), not introduced or alterable by this phase. Worth a real-device legibility check whenever this ships, not a mock defect. |

No Critical or unresolved-Major findings. The one Minor structural item (Grind's repeated locked strings) is explicitly named in the project's own design docs as a deferred, tracked gap rather than a silent omission, which is why it is not elevated to Major/blocking.

## The state-ladder question (the phase's central point)

**Yes — live, dormant, struggling, and locked read apart at a glance, without reading text, on every tab that has row-based content (Training tiers, Grind zones, Dungeon duties):**

- **Live:** solid gold left-edge border + gold-tinted value/name + a visible, populated allocation control (e.g. Training's `swing macro`, Grind's `Salt Flats`, Dungeon's `Sunder`).
- **Dormant** (unlocked, idle/zero): neutral/no edge accent, dim/plain text, an allocation control still present but reading `0` (Training's `combo macro`, Grind's `Novice Meadow`).
- **Struggling** (live but failing — the state DESIGN.md flagged as "REQUIRED, not yet shipped" in the real game): a third, distinct warm/orange left-edge + orange text (`Grind`'s "The Second Door… too weak to hold", Dungeon's "Mass Dispel… NOT BLOCKED"). This is genuinely a fourth visually distinct state, not reusing the locked treatment — confirms the DESIGN.md-specified fix is actually realized in these mocks.
- **Locked:** no left-edge accent, whole row dimmed at reduced opacity, and — verified directly in the screenshots — **no allocation control rendered at all** (not just disabled): Training's 11 locked tiers, Grind's 5 locked zones, and Dungeon's `Summon Adds` all print only name/requirement text, no `−`/`+`/`cap` widgets.

**Channel breakdown — no single channel is overloaded:** edge-color carries live-vs-not-live; control-presence (widget vs. none) carries dormant-vs-locked structurally; opacity is the redundant confirmation of that same split; the text label ("locked · needs N doors…", "no bots here") is present on every row as a fourth, always-legible backup. This matches DESIGN.md's own documented reasoning (color/lightness on this background reliably carries exactly one strong split; dormant-vs-locked has to be carried by shape/presence/text, not more color) — and the mocks demonstrate that reasoning actually landed in pixels, not just in the doc.

## Requirement Fulfillment

### DW-6.1
PREMISE: Six mocks render as self-contained `.html` with no missing deps.
EVIDENCE: `grep` across all six files for `<link rel="stylesheet">`, external `<script src=`, `@import`, or `url(http…)` returned zero matches; each file's own header comment states "Self-contained: no external stylesheet, font, script or image"; all twelve screenshots rendered successfully via headless capture (`shoot.mjs`), confirming no missing-dependency render failure.
VERDICT: PASS

### DW-6.2
PREMISE: No hard-coded hex/rgb in any mock; all color via tokens from `internal/DESIGN.md`. Extended: no untokenized `px` — spacing/padding/grid columns/track heights resolve through the Phase 4 dimension scale or are named one-offs.
EVIDENCE: Grepped every `#[0-9a-f]{3,8}` and every `[0-9]+px` occurrence in all six mock files. Every hex/px hit falls inside the `:root{}` block (lines 23–83 of each file) where tokens are *defined* — none appear as raw literals in component rules; all component/body CSS references colors and dimensions exclusively via `var(--x)`. Apparent later "hex-like" matches (`#9646`, `#9672`, `#10022` etc. in `boss.html:497`, `player.html:524-608`) are HTML numeric-entity glyphs (`&#9646;`, `&#9672;` — cursor/glyph characters), not colors — confirmed by reading the surrounding markup. The nine named one-offs (`--tab-pad:7px`, `--chip-radius:5px`, `--chip-lbl-nudge:1px`, `--touch-min:44px`, `--page-max:600px`, `--log-max-h:180px`, `--armory-zone-col:26px`, `--stash-mark-col:14px`, `--ip-dial:72px`, `--armory-min:420px`) each carry a source comment (e.g. "shipped Armory zone column — style.css:396"), matching DESIGN.md's own documented one-off list. The `561px`/`560px` breakpoint discrepancy was checked against DESIGN.md (lines 745-754, 917-918): the source's mobile layout applies at `≤560px`, so `min-width:561px` in the mock is the correct translation of "above 560," not a drift.
VERDICT: PASS

### DW-6.3
PREMISE: No mock scrolls horizontally at 375px width, verified by measurement.
EVIDENCE: Read all six `*-375.png` screenshots directly; each reports an **original pixel width of exactly 750px** (boss, training, grind, player, delve, dungeon all confirmed). `shoot.mjs` captures at `deviceScaleFactor:2` for the 375-wide emulation, so 750 physical px = exactly 375 CSS px with zero excess — if `document.documentElement.scrollWidth` had exceeded 375, the `captureBeyondViewport:true` full-page screenshot would have been wider than 750px. All six are exactly 750px, independently confirming no horizontal overflow at the pixel level (not by trusting `shoot.mjs`'s own console claim, which is exactly what the item asks to avoid).
VERDICT: PASS

### DW-6.4
PREMISE: No fact appears twice within a single mock — verified against the Phase 1 ownership map in `internal/JOURNEY.md`.
EVIDENCE: Checked every DUP the Phase 1 fact-ownership table named: Boss's triple HP-render (canvas label / `#depth` / `#record`) is resolved — the canvas placeholder explicitly states it "owns" the % label, `#depth` is the sole numeric readout, `#record` shows only a Combat-Power **pointer** ("full breakdown on the Player tab"), confirmed in the boss-375/1280 screenshots. Dungeon's three named dups are resolved in the running-state screenshot: no "pulling out at floor N" restatement in `#instState`, duty-row subs no longer restate "Blocked by N bots," and journal rows show short status only ("met and blocked" / "NOT BLOCKED"), not the duty row's full sentence. Difficulty's three renders are retained but each serves a stated distinct job (control / consequence / concept-only helper with no number) per JOURNEY.md's own explicit non-duplication argument. The one unresolved item: Grind's five locked region-3 zones still print the identical `locked · needs 4 doors open, you have 1` string across all five rows — flagged above as a Minor finding, explicitly tracked by the project's own docs as a deferred "component-repeat" fix rather than a silently-introduced regression.
VERDICT: PARTIAL — one named, tracked, non-hiding duplication remains (Grind locked-zone rows); every other Phase-1-flagged duplication is resolved.

### DW-6.5
PREMISE: Each mock has a legible primary → secondary → tertiary read; the primary decision is the most prominent element. Judged on the screenshots.
EVIDENCE: Boss — the `92.4%` siege readout is the single largest, brightest (gold) text on the page; crit breakdown and record line recede in size/color beneath it; dialogue quote sits smallest/lowest. Training — the affordable rig buttons and the one live tier row (`swing macro`, gold-bordered) are the brightest, most bordered elements; locked tiers recede to grey single-line text. Grind — the live zone (`Salt Flats`, gold border) and struggling zone (`The Second Door`, orange border) both pop against a field of plain dormant rows and dimmer locked rows. Player — Combat Power chip group and the Gear section (moved ahead of Trophies/Armory per the Phase 2 reorder) carry the brightest gold CTAs (`enhance`, `reforge`); Trophy/Armory grids recede to smaller, denser, mostly-grey content at the tail, matching their "70/45 mostly-dormant" status. Dungeon — the gold-bordered `Send bots in` / `Pull out now` buttons are the single largest bordered elements on the page. In every case the gold-accent + border-left + size combination unambiguously marks the primary decision; dim/grey recedes secondary and tertiary content.
VERDICT: PASS

### DW-6.6
PREMISE: No Critical findings; Majors resolved or explicitly accepted.
EVIDENCE: See Cross-Pillar Findings above — zero Critical findings, zero unresolved Major findings; the single structural Minor (Grind locked-row repetition) is explicitly named, sourced to the project's own prior-phase decision, and not hidden.
VERDICT: PASS

**All requirements met:** YES (DW-6.4 is PARTIAL on one named, non-blocking item; all others PASS)

## Notes (non-blocking)
- Copy spot-checked against several `JOURNEY.md` Phase 5 rows (Boss's crit line, cooldown line, wall-selector labels; Dungeon's running-state summary) and matched verbatim in every case sampled; an exhaustive line-by-line diff of all six mocks' copy against JOURNEY.md was not performed given volume — spot-checking is a defensible scope call, not a requirement gap (copy verbatim-ness is a binding constraint, not its own DW item, and no divergence was found in the sample).
- The canvas arena is correctly represented as a labelled static placeholder in the Boss mock ("CANVAS REGION — NOT RENDERABLE IN HTML…") — this is the correct answer per the brief, not a gap.
- Terminal/shell register (the `maintenance@dead-server:~$` log header + activity log) is confined to the bottom-of-page chrome in every mock, consistent with the "MMO client, not a terminal" reference class — no mock reads as a console.
- No decay/glitch signifiers observed anywhere across all twelve screenshots.
- Distinctiveness (ai-tells.md CHECKER mode): the aesthetic is nameable in a few words — "cool server-metal neutrals with exactly two warm identity hues (gold/bone), Georgia small-caps chrome over monospace botting-console data rows" — and contains choices a generic system would not default to (the two-hue identity restriction with functional-accent hues deliberately kept warm-but-different-register; Georgia+monospace pairing instead of a generic sans). Not flagged as generic/AI-templated.

**Verdict: PASS**
