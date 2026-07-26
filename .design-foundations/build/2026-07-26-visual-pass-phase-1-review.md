# Design Review: Phase 1 — Visual DNA v2 + Boss surface

## Rendered Evidence (Step 0)
- Screenshots read directly: `internal/mocks/shots/boss-375.png`, `boss-1280.png` (NEW) vs. `boss-375-before.png`, `boss-1280-before.png` (PREVIOUS).
- Surface: Boss tab mock, two states (frontier/fighting, frontier-broken), plus a mock-only "specimen" rowlist strip showing four row states under the v2 material.
- Source read directly: `internal/mocks/boss.html` (739 lines), `internal/DESIGN.md` (v2 sections, lines 27–420), `internal/JOURNEY.md` (Boss page spec + fact-ownership table).

## Assessment B — Deterministic Detector
- Command: `node "C:/Users/Admin/.claude/plugins/cache/rtd/design-for-ai/4.2.0/scripts/detect.mjs" internal/mocks/boss.html > .design-foundations/build/detect-phase1.json`
- Exit: 0 (ran)
- Findings: 0 (`"status":"ran","rules":16,"findings":[],"counts":{"total":0}`)
- Opened only after Assessment A findings were frozen: YES

## Triage
- Baseline (always-on): visual (design-dna/checklists) + usability.
- Dispatched (per `## Doctrine`, resolved via `pillar-taxonomy.md §5`): `design-dna`, `foundations`, `archetypes`, `fonts` (Georgia/mono register — carried forward, not re-litigated), `color` (AA re-verified independently), `techniques` (step-skipping, hierarchy-through-contrast), `ai-tells` (CHECKER mode + Fingerprint Addendum nested-card check).
- Not applicable: `data-viz` (no charts), `content-design` (no copy changed — verified against JOURNEY.md), `behavioral`/`deceptive-patterns` (no persuasion/conversion surface), `journey` (no new route — single-tab state comparison).
- Deferred: none — surface is small enough (one tab, two states) that the full doctrine list was tractable.

## Independent Verification Performed
- Ran `node internal/mocks/contrast.mjs` myself (not trusted from the plan): **45/45 gated pairs PASS**, including the seven previously-fixed pairs named in DW-1.3 — `--recede` (5.16–5.48 across grounds), `--faint` (4.55–4.98), `--faintest` (3.13/3.26), `--warn` (4.67), `--alert` (4.66), `--logline` (4.53). `rarity mythic` is not in `contrast.mjs`'s PAIRS array (it renders nowhere on the Boss tab), but I grepped its hex directly: `--rar-mythic:#d85454` in `boss.html` matches the value DESIGN.md records as passing (4.20→4.52 on `--inset`, 4.65 on `--panel`) — unmoved, so no regression.
- Ran `node internal/mocks/build.mjs` myself: exit 0, "no hex / no rgb / no raw px / no external refs" for all six mocks.
- Ran `node internal/mocks/shoot.mjs` myself: `scrollWidth 375px / viewport 375px` for `boss-375.png` — no horizontal overflow, independently confirmed (not just trusted from the discovery doc).
- Grepped `boss.html` myself for hex literals outside `:root` — only two hits, both HTML entities (`&#9646;`, `&#9733;`, `&#9670;`) in log copy, not colour values. No violation.
- Grepped for `.frame`/`.ornRule` usage: each appears exactly twice, both on the Warden identity block (once per rendered state) — confirms the "one frame per surface" rule is actually honored in the markup, not just stated in DESIGN.md.
- Read the CSS around `.canvasStub`/`.arena` directly: `.arena` carries the well bevel (`box-shadow` inset lit/shade); `.canvasStub` itself has **no** border and **no** box-shadow, only a background-layer floor glow — confirmed the nested-bevel tell DESIGN.md claims to have fixed is in fact not present in the shipped markup.
- Ran `git diff HEAD` on `training.html`, `grind.html`, `player.html`, `delve.html`, `dungeon.html` myself: each carries exactly the same two-hunk change (`--alloc-control` role fix, `button:disabled` background fix) with no other styling touched — the "only a two-line token role fix" claim for the other five mocks holds under independent diff, not just the plan's assertion.
- Checked for `<script>`/`animation`/`transition`: only the pre-existing log-prompt cursor blink (`@keyframes blink`, respects `prefers-reduced-motion`) — carried forward from before v2, not new ceremony.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Major | design-dna / techniques | The "material and depth" system — the plate/well gradient + 1px lit/shade bevel that DESIGN.md calls the actual gap being closed — is essentially imperceptible in both rendered screenshots. Comparing `boss-1280.png` against `boss-1280-before.png` pixel-for-pixel, `section.game` still reads as a flat panel; the only clearly visible new elements are the corner-bracket frame, the ornament lozenge, and the larger identity/BREACHED type. | Hierarchy must be perceivable through contrast/proportion, not just present in the CSS (`techniques.md` Ch 7: white space and contrast, not assertion, create hierarchy). A construction too subtle to see does not do the job DESIGN.md assigns it. | Either raise the bevel's contrast (a visibly warmer `--edge-lit` / cooler `--edge-shade`, or a slightly steeper gradient stop) so the "plate" reads as built, not flat — or be honest in DESIGN.md that the visible difference is currently carried by frame + type, not material, before Phase 3 relies on material alone to differentiate Training/Grind (which get no frame or display type, being hero-less). |
| Minor | design-dna | `.frame` (the identity wrapper) applies its own `panel→plate-foot` background gradient on top of a parent (`section.game`) that already carries the identical gradient — a redundant second application of the same construction, invisible in practice only because the colors match exactly. | Data-ink / needless-ink discipline (Tufte) — an unnecessary layer, even a harmless one, is still unaccounted-for. | Drop the 9th background layer on `.frame` (the fill gradient) and let it sit transparently on its parent's plate; keep only the border + corner-bracket layers. |
| Note | usability | Alloc buttons in the specimen rowlist render tightly at 375px (four to five controls per row: −, input, +, cap, …) — no overflow per `shoot.mjs`, but visually dense. | Fitts's law / touch-target crowding — flagged as a Note because the specimen block is a mock-only annotation, not shipped product surface, and no requirement in this phase's Done-When list covers it. | Not a phase-1 blocker; worth re-checking once Grind's real rowlist inherits this density at 375px in Phase 3. |

## Requirement Fulfillment

### DW-1.1
PREMISE: `internal/DESIGN.md` v2 states the material language — how a panel is built, what makes a frame, what carries depth — in terms a SECOND surface could be built from without seeing the Boss tab. Judge this as a working spec: could a list-heavy tab (Grind, Training) be composed from it?
EVIDENCE: DESIGN.md `## Material and depth (v2)` states three elevations (plate/well/leaf) as CSS constructions (gradient direction + inset box-shadow pairs), not colours, plus five reproducibility rules. `boss.html` exercises this on component-level selectors, not just the hero: `section.game` (plate), `.arena`/`#dialogue` (well), `.rowlist .row` (leaf, only `.row.active` gains the lit edge per rule 5) — all selectors that exist identically on Training/Grind's own rowlists today. Verified directly in the CSS (lines 438–579), not asserted.
VERDICT: PASS

### DW-1.2
PREMISE: A display-scale type ramp exists above the previous caption/body sizes, and the Boss identity uses it.
EVIDENCE: `--fs-warden:36px` and `--fs-colossal:52px` appended above the prior top step `--fs-hero:26px` (confirmed in `:root`, lines 98–102). `#bossName{font-size:var(--fs-warden)...}` (line 503) and `#depth.breached{font-size:var(--fs-colossal)...}` (line 513). Visible on the render: "MAREN" and "BREACHED" are both clearly larger than any other text on the page in `boss-1280.png`.
VERDICT: PASS

### DW-1.3
PREMISE: Every changed hex re-passes AA on the dark ramp (≥4.5:1 body, ≥3:1 non-text); no previously-fixed pair regresses (`--recede`, `--faint`, `--faintest`, `--warn`, `--alert`, rarity `mythic`, `--logline`).
EVIDENCE: I ran `node internal/mocks/contrast.mjs` myself: 45/45 gated pairs PASS, banned pairings (`recede`/`faint` on `--field`) correctly stay unused and are only printed for the record. All seven named pairs individually confirmed passing in the console output (see Independent Verification above). `--rar-mythic` not covered by `contrast.mjs`'s PAIRS array (not rendered on Boss), so I verified it by direct hex comparison against DESIGN.md's recorded value — unchanged, no regression.
VERDICT: PASS

### DW-1.4
PREMISE: `boss.html` renders self-contained, no hard-coded hex or untokenized px, no horizontal scroll at 375px — verified by grepping the emitted file and measuring the screenshot, not by trusting a build script's assertion.
EVIDENCE: Grepped `boss.html` myself for `#[0-9a-fA-F]{3,6}` outside `:root` — zero colour hits (only HTML entity codes in log copy). Ran `build.mjs` myself — exit 0, "no hex / no rgb / no raw px / no external refs." Ran `shoot.mjs` myself — `scrollWidth 375px / viewport 375px`, no overflow. All three checks re-run independently, not taken on the scripts' word alone.
VERDICT: PASS

### DW-1.5
PREMISE: live / dormant / locked still read apart on the rendered mock.
EVIDENCE: The specimen rowlist (`boss-1280.png`, lower third) shows four distinct row states: `.row.active` (Salt Flats) — gold left edge + lit top edge + full bar; `.row.dormant` (Cinder Steppe) — neutral edge, empty track, "no bots here"; `.row.struggling` (The Second Door) — warn-coloured edge, "too weak to hold" text; `.row.locked` (Frostbound Wastes) — `--opacity-locked` on the whole row, no allocation control, "locked · needs 4 doors open." Four states, three independent channels (edge colour, control presence, text) all visibly distinct in the render, plus material's new fifth channel (only `.active` carries the lit edge, confirmed at CSS line 579).
VERDICT: PASS

### DW-1.6
PREMISE: The look is MATERIALLY DIFFERENT from the previous version — judged on a side-by-side of `boss-375.png` against `boss-375-before.png`. Say honestly whether a reasonable person would call this a different-looking product or the same product tidied. Name what actually changed and whether it is surface decoration or a structural change in the visual language.
EVIDENCE: Comparing all four screenshots directly. What is genuinely new and visible: (1) four gold corner brackets framing the Warden's identity — a device that did not exist before in any form; (2) a rotated-square gold ornament with a fading hairline, replacing the previous plain dot divider; (3) "MAREN" and "BREACHED" rendering dramatically larger (36px/52px vs. the previous 20px cap) with an engraved (not glowing) text-shadow; (4) `#projection` demoted from gold to bone, so gold now reads rarer. What is claimed but not visibly registering: the plate/well gradient-and-bevel system — `section.game`, the tab row, the stat chips still read, to the eye, as the same flat single-tone rectangles as before; the 1px lit/shade bevel and the panel→plate-foot gradient are too subtle to distinguish from the previous flat fill at either 375px or 1280px. A reasonable person would notice and could describe the corner brackets and the much bigger boss name/BREACHED text ("it has this gold picture-frame corner thing now, and the name is way bigger") — that is a real, if narrow, visual difference, concentrated entirely at the identity block and the BREACHED peak. Everywhere else on the page (chips, tabs, wall selector, rows), the look reads as the same flat panel-and-hairline system as the previous version. This is closer to a distinctive **ornamental addition at one focal point** than a **structural change in the visual language across the surface** — which matters directly for Phase 3, since Training/Grind get no frame and no display type (both are hero-only per the spec) and would inherit only the imperceptible bevel.
VERDICT: PARTIAL

**All requirements met:** NO (DW-1.6 is PARTIAL — see Notes; this is a judgment call the item itself asks for honestly, not a spec violation, and does not on its own meet the Verdict Rules' bar for FAIL: no DW item lacks evidence, no contrast/token/edge-case requirement is violated, and the frame + display-type change is a real, nameable, visible distinctive element, so the distinctiveness criterion is not failed either).

## Notes (non-blocking)
- The corner-bracket frame and 36px/52px display type are confirmed present in exactly the two places DESIGN.md specifies (the Warden identity, the BREACHED peak) and nowhere else — the "one frame per surface" and "gold is identity-only" rules are honored in the actual markup, not just stated.
- No decay/ruin tell found: no broken, offset, or partial bracket; no scanline, grain, or glow on gold; the engraved `text-shadow` (1px, `--edge-shade`, offset down) reads as cut metal, not a failing screen.
- No hard-veto violation: no `<script>` beyond the pre-existing reduced-motion-respecting log cursor blink; no generated icons (every mark is a CSS gradient, border, or rotated square); no sound; no new ceremony.
- The claim that the other five mocks got only a two-line token/behavior fix holds under my own `git diff` — confirmed identical two-hunk diff across `training.html`, `grind.html`, `player.html`, `delve.html`, `dungeon.html`.
- Fingerprint Addendum check (ai-tells.md): the nested-bevel/nested-card risk this project's own comments flag as its #1 historical AI default is specifically and correctly avoided at the one place it was previously caught (`.canvasStub` carries no border/box-shadow of its own).

## Issues (if FAIL)
N/A — no FAIL-triggering condition met.

**Verdict: PASS — Major note on DW-1.6/material perceptibility carried into Notes; no blocker.**
