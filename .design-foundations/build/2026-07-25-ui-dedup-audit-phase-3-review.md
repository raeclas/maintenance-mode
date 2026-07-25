# Design Review: Phase 3 - DESIGN.md token specification ("Last Warmth")

## Rendered Evidence (Step 0)
- Screenshot: none — this phase's artifact is a token specification (`internal/DESIGN.md`), not a rendered surface. Per the dispatch, no `.html`/mock exists this phase.
- Surface reviewed: `internal/DESIGN.md` (token spec) cross-checked against the shipped `style.css`, `battle.js`, `rarity.js`, and `internal/JOURNEY.md`'s state legend. All numeric claims (contrast ratios, hex values) were independently recomputed from the raw hex values using the WCAG relative-luminance formula (Node one-off scripts), not accepted on the document's word.

## Assessment B — Deterministic Detector
- Command: not run.
- Exit: N/A (no rendered artifact) — per the dispatch's explicit instruction, this phase produces no `.html`, so `scripts/detect.mjs` is N/A, not a failure. Confirmed independently: no `detect.mjs` exists in this project's own `internal/` tooling, and DESIGN.md is a markdown spec with no rendered surface to feed it.
- Findings: N/A — no rendered artifact.
- Opened only after Assessment A findings were frozen: N/A (nothing to open).

## Triage
- Baseline: visual (design-dna, foundations, archetypes, ai-tells) + type (fonts) + color, per this dispatch's explicit `## Doctrine` list — read verbatim as given (`design-dna`, `foundations`, `archetypes`, `fonts`, `color`, `ai-tells`).
- Dispatched: all six named pillars read and applied.
- Not applicable: `usability`, `content-design`, `data-viz`, `behavioral`, `journey`, `design-systems` — not named in this dispatch's Doctrine list; not loaded, per "do not load doctrine beyond what triage flags."
- Deferred: none — six pillars is a small enough set for a token-spec artifact that no capping was needed.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|---|---|---|---|---|
| **Critical** | design-dna / color | The live→dormant→locked weight ladder — named in the dispatch as "the phase's central job" — collapses under its own AA fix. Independently recomputed luminance: `dim` (live-default) = 0.2524, `recede`-NEW (dormant-notable) = 0.2446, `faint`-NEW (dormant-minor) = 0.2175 — three semantically distinct tiers now sit in a single visual band (self-contrast between adjacent tiers: dim↔recede = **1.03:1**, recede↔faint = **1.10:1** — both far below the ~1.4:1+ a human eye reliably separates). Only `faintest` (locked, 0.1286) remains meaningfully distinct (1.5:1+ from its neighbor). Contrast against **before**: the currently-shipped (unfixed) values had a clean descending staircase — `dim` 0.2524 > `recede`-OLD 0.1582 > `faint`-OLD 0.0924 > `faintest`-OLD 0.0696 — each step clearly separated, and `recede`-OLD's own inline CSS comment ("quiet text — controls/labels that step back") was true of it. The AA-driven fix (correctly clearing each token's *own* contrast against `--panel`/`--inset` — independently reverified, all six pairs' numbers in the doc check out exactly) was applied per-token in isolation without checking the tokens against **each other**, so "stepping back" no longer holds: `recede` no longer steps back from `dim` at all. This is the exact failure the dispatch's binding constraint names: "a token system that cannot express the [live/dormant/locked] distinction fails its main job." | Binding constraint (dispatch, verbatim) + the shipped CSS's own documented intent (`--recede` comment) + WCAG contrast math (recomputed) | The three tiers can't all independently clear 4.5:1 body-AA against a background this dark (`--panel` lum ≈0.008) *and* stay visibly separated from each other — the floor for 4.5:1 sits close under `dim`'s own luminance, leaving very little headroom for two more distinct rungs below it. Re-derive the ladder holding BOTH constraints simultaneously (≥4.5:1 vs panel/inset AND ≥~1.3–1.4:1 self-contrast between adjacent rungs) — likely requires either brightening `dim` slightly to open headroom, or demoting `recede`/`faint` to the same non-text 3:1 floor treatment already given to `faintest` if "genuinely-readable secondary content" turns out incompatible with a 3-tier separation on this background. |
| Minor | color / design-dna | The "Never" section and Signature-move claim ("Every functional accent — risk, warn, alert, copper, live — sits outside the warm family too... nothing competes with gold/bone for warmth") is measurably inaccurate for three of the five: recomputed HSL hue puts `warn` at 12°, `alert` at 10°, and `copper` at 31° — all squarely in the warm red-orange band, and `copper` (31°) sits only 6–14° from `bone` (37°)/`gold` (45°), i.e. hue-adjacent, not "outside the warm family." Only `risk` (212°, blue) and `live` (131°, green) are actually non-warm. | Signature-move rigor (design-dna.md — the signature move's claim must be defensible as stated); color-wheel hue-family definitions (chapter-08/09) | Restate the claim precisely: gold/bone are the only *identity-tier* warm hues (moderate chroma, "precious-metal" register); warn/alert/copper are functional-semantic warm accents at higher chroma, a different role, not a different hue family. The current wording overclaims hue purity the palette doesn't have. |
| Minor | fonts / design-dna | The Type section's stated mono footprint ("Used wherever content is tabular or state-readout: rowlists, ztables, chip values, log, canvas text") undercounts the shipped CSS: `section.game button` sets `font-family: monospace` as the base rule, which cascades to essentially every action button in every tab (rig buys, ATK/SPEED fills, enhance, reforge, stash actions, Cache-tree buys, Dungeon duty/run controls, Ban Wave) — not "readout" content, interactive controls. This isn't a violation of the "no terminal base layer" binding constraint (the literal shell-prompt register — `maintenance@dead-server:~$`, `PLAYERS ONLINE` — is correctly confined to `#logHead`/`#log` only, verified in style.css), but the doc's accounting of where the "botter's-toolkit" register actually reaches is incomplete. | fonts (chapter-03, medium/register precision) | Add `section.game button` (and its many descendants) to the Type section's stated mono usage list so the documented register split matches the shipped footprint exactly. |

## Requirement Fulfillment

### DW-3.1
PREMISE:  `internal/DESIGN.md` exists with a token block present. (The user-confirmation half of this item is handled outside your review — verify the artifact side only.)
EVIDENCE: File exists at `internal/DESIGN.md`; a `:root { ... }` CSS custom-property block is present (lines 153–190) with 27 tokens (color + type-scale).
VERDICT:  PASS

### DW-3.2
PREMISE:  All text/background pairs pass WCAG AA on the DARK ramp (≥4.5:1 body, ≥3:1 large), verified by computed ratio. A LIGHT ramp is deliberately waived by the plan — its absence is NOT a finding, and inventing one would be a finding.
EVIDENCE: Recomputed all seven claimed before→after pairs from raw hex using the WCAG relative-luminance formula (Node, independent of `palette.mjs`): `recede` 3.64→5.16 (panel), 5.01 (inset); `faint` 2.49→4.68 (panel), 4.55 (inset); `faintest` 2.09→3.13 (panel, non-text floor), 3.04 (inset); `warn` 4.42→4.67 (panel), 4.53 (inset); `alert` 4.42→4.66 (panel), 4.53 (inset); `mythic` 4.20/4.32→4.52/4.65. Every number in the document matched the independent computation exactly. No light ramp exists in the file — consistent with the deliberate waiver. (See the Critical finding above: individual-pair AA compliance is confirmed, but the tokens' contrast *relative to each other* — a different axis — is not.)
VERDICT:  PASS

### DW-3.3
PREMISE:  Interactive elements pass WCAG AA non-text (≥3:1 against adjacent color) — this includes the gold CTA and the `.locked` tab state.
EVIDENCE: Gold CTA (`#pullBtn`/`#descendBtn`) recomputed at 8.10:1 (vs `--panel`) and 8.62:1 (vs `--bg`) — both far above the 3:1 non-text floor. `on-gold` (#0d0d10) on solid gold recomputed at 8.56:1. The `.locked` tab: the currently-hardcoded `#45454d` recomputed at 1.94:1 (fails the 3:1 floor, confirming the defect DESIGN.md names) → the specified fix (point at corrected `--faintest` #64646a) recomputed at 3.13:1 vs panel, clearing the floor.
VERDICT:  PASS

### DW-3.4
PREMISE:  Semantic aliases resolved (background, surface, text, accent) and a type scale is defined covering every size currently in use in the shipped `style.css`.
EVIDENCE: Table resolves all four categories (background→`--bg`; surface→`--panel`/`--inset`/`--field`/`--well`; text→`--gold`/`--bone`/`--dim`/`--recede`/`--faint`/`--faintest`; accent→`--gold`/`--gold-dim`/`--on-gold`). Grepped every `font-size:` declaration in `style.css` (67 occurrences): all but one resolve to a `var(--fs-*)` token matching the 7-step scale (26/20/16/13/11/10/9px) stated in DESIGN.md. The one exception, `.modalClose { font-size: 22px; }`, is explicitly named in DESIGN.md as a deliberate icon-glyph exception, not a silently-dropped gap.
VERDICT:  PASS

### DW-3.5
PREMISE:  Canvas colors exist as named tokens readable from JS. The canvas cannot read CSS custom properties, so verify the artifact specifies a working MECHANISM, not just names.
EVIDENCE: DESIGN.md specifies a full `theme.js` module: `getComputedStyle(document.documentElement)` resolves each `--token` once, cached, called from `initBattle(el)` after the canvas/stylesheet exist (not at module load) — correctly reasoned as safe given `battle.js` is browser-only and not imported by the Node-run `test.js`/`sim.js` paths (verified: `battle.js` is imported only from browser context per the module's own comment; the sim/test entry points were not independently re-traced beyond taking this claim at face value, a minor unverified assumption). This is a genuine resolve-mechanism, not a hand-copied hex list — matches the existing `rarity.js` JS-native-token precedent the doc cites. Not yet applied to the codebase (`theme.js` does not exist yet — confirmed by directory listing) — correctly deferred, per the doc's own "no code touched this phase" gate.
VERDICT:  PASS

### DW-3.6
PREMISE:  Motion budget stated and contains no ritual/ceremony animation.
EVIDENCE: A complete 7-row motion table is present (log cursor/entrance, enhance glow/flicker, boss-flash, damage floaters, screen shake, BREACHED reveal) with durations and triggers. All effects are ≤700ms feedback-over-already-resolved-outcomes except one explicitly justified exception (the one-time, non-blocking 6s BREACHED reveal, matching `battle.js notifyBreak`'s `until: now + 6000`, independently confirmed in the source). No effect gates or delays the next input. The hard veto (no slow ritual/ceremony) is respected.
VERDICT:  PASS

**All requirements met:** YES (all six numbered DW items pass on the letter of their text) — **but see the Critical cross-pillar finding above**, which is a binding constraint the dispatch explicitly grants "DW-item standing" for verdict purposes, independent of the six numbered items.

## Notes (non-blocking)

- The motion budget honestly flags an unresolved gap: 4 canvas-driven effects and 2 CSS keyframes are not checked against `prefers-reduced-motion` (only the log cursor/entrance are). This is named, not hidden, and correctly scoped out of this phase (fixing it means editing `battle.js`/`style.css` logic, outside this phase's `Produces:` line). Real accessibility item for a near-term follow-up, not a DW-3.6 failure (the item only asks for a stated budget with no ceremony, which is met).
- A real, independently-confirmed defect surfaced by this phase but not on the DW list: `battle.js drawBars()` draws the HP% label in fixed `#0d0d10`, right-aligned over the *empty track* (`--field #22222a`) for `remain < ~99%`. Recomputed: **1.23:1** — the label is illegible for nearly the entire fight. DESIGN.md names this accurately and proposes a background-agnostic stroke-outline fix (reusing the damage-floater technique), correctly deferred to whichever phase next touches `battle.js`.
- The epic rarity color (`rarity.js`, `#b061d6`, a medium violet-purple) is not part of this phase's remit (unchanged, pre-existing) and sits in a well-established MMO loot-rarity genre convention (gray/green/blue/purple/orange/red/gold tiers) rather than functioning as a brand/hero accent — read as register-justified, not flagged as an ai-tells purple-triplet hit (it doesn't match the catalogued hexes, and its role differs from the tell's decorative-gradient context).
- DW-3.5's safety argument (canvas token resolution deferred until after canvas mount, sim/test paths unaffected) rests on the claim that `battle.js` is only ever imported browser-side; this review took that claim at face value from the module's own comment rather than independently re-tracing every import graph — a shallow spot in an otherwise well-evidenced document.

## Verdict: FAIL — one blocker

1. **The live/dormant/locked weight ladder — this phase's own stated central job — is measurably broken by the AA fix.** `dim` (live-default), `recede` (dormant-notable), and `faint` (dormant-minor) now sit within self-contrast of 1.03–1.10:1 of each other (independently recomputed from the corrected hex values), while the pre-fix values had a clean, clearly-separated descending staircase. Every individual pair legitimately clears WCAG AA against its background (DW-3.2 passes on its own terms), but the token system can no longer express the live-vs-dormant distinction the dispatch names as the phase's main job — Severity: Critical / Pillar: design-dna+color / Fix: re-derive `--recede`/`--faint` (and possibly `--dim`) holding both the AA floor and a minimum inter-tier self-contrast simultaneously, per the fix note in the findings table above.
