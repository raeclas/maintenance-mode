# Design Review: Phase 2.5 — Visual Pass v4 (colour lanes + construction weight)

## Rendered Evidence (Step 0)
- Screenshots read: `internal/mocks/shots/boss-375.png`, `boss-1280.png`, `boss-1280-v3.png`, `player-375.png`.
- Surface: two self-contained HTML mocks (`internal/mocks/boss.html`, `internal/mocks/player.html`), each ~1,400–1,600 lines, embedding all seven tab destinations' shared token block plus a live-rendered Grind specimen inside `boss.html`.
- `boss-1280.png` vs `boss-1280-v3.png` read side by side for DW-2.5.3.

## Assessment B — Deterministic Detector
- Command: `node "C:/Users/Admin/.claude/plugins/cache/rtd/design-for-ai/4.2.0/scripts/detect.mjs" internal/mocks/boss.html internal/mocks/player.html > .design-foundations/build/detect.json`
- Exit: 0 (ran)
- Findings: 25 total — 24× `nested-cards` (high) across both files, 1× `em-dash-overuse` (medium) in `player.html`
- Opened only after Assessment A findings were frozen: YES

## Triage
- Baseline (always-on): visual (design-dna, checklists/ai-tells) + usability.
- Dispatched: `color` (chapter-08-color-science.md) — four new colour lanes, contrast/L* gating; `techniques`/design-dna material-construction rules — WINDOW/TITLE BAR/SOCKET/CONTROL carpentry, bevel-nesting rule.
- Not applicable: `data-viz` (no charts), `content-design` (copy is placeholder/dev annotation, not shipping product copy under active revision), `journey`/`behavioral` (no flow or conversion mechanic changed this phase), `deceptive-patterns` (no persuasion surface).
- Deferred: none — surface size was manageable within the baseline + color + construction scope.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Major | color / design-dna | The persistent `#tabs` nav renders **all seven lane-3 tab-accent hues simultaneously** (each button carries its own `--acc-tab` as a permanent 2px foot-bar, confirmed visually in `boss-1280.png` — distinct teal/olive/blue-grey/rose tints under TRAINING/GRIND/PLAYER/DUNGEON) on **every** surface, including Boss, whose own co-occurrence entry reads **"lane 2 only."** The Boss tab's own foot-bar (`--acc-tab:var(--acc-boss)` = `var(--w-active)`) additionally puts a lane-2 hue in that same nav row. DESIGN.md's Lane 3 spec states the intent plainly ("the tab chip's 2px foot bar (**all seven visible at once**)," line 184) but never reconciles it against `## The co-occurrence rule`'s own "Boss: lane 2 only" and "**Never more than two lanes on one surface** … Three lanes is a clown car" (lines 214–228, 398–401). As rendered, Boss carries lane 2 *and* six lane-3 members at once; Player/Grind/Training/etc. each additionally carry the *other six* tabs' lane-3 hues plus, via the Boss tab, a lane-2 hue — none of which the per-surface table accounts for. | DESIGN.md v4 §"The co-occurrence rule" (self-stated hard cap); the prompt's own edge case ("verify on the RENDERED mocks that the stated rule is actually obeyed — a surface carrying more lanes than its own rule permits is a failure") | Either scope the co-occurrence rule explicitly to the surface's *content area* and state the nav as an intentional, documented exception (a wayfinding legend, chroma-.05, is a defensible carve-out) — or dial the inactive tabs' foot-bars to a neutral/shared hue and reserve lane-3 identity for the active tab only. Whichever is chosen, DESIGN.md needs the sentence that currently doesn't exist. |
| Minor | color | DESIGN.md's own co-occurrence table lists **three** lane numbers for Player ("lane 3 (chrome) + lane 1 (items), **lane 4** in chips") directly under the sentence "**Hard cap: two.**" The document is internally consistent only if you infer — from repeated but separate language elsewhere ("this lane renders as a FILLED CHIP, not as ink … does not collide with the three ink lanes") — that lane 4 is implicitly exempt from the two-lane ink cap. That inference is never stated as a rule. | Nielsen #9 (documentation should match what it governs); internal consistency of the design contract | Add one sentence to the co-occurrence rule stating explicitly that lane 4 (chip-rendered, distinct luminance tier) doesn't count against the two-ink-lane cap. |
| Minor | design-dna / techniques | Detector `nested-cards` (24 hits, both files) fires mainly on `.band` chips (a SOCKET construction, its own inset bevel) sitting inside `.rowlist .row` (also a SOCKET) inside `section.game` (a WINDOW, its own full bevel), and on `.glyph` (a full CONTROL bevel: TL-lit/BR-shade + foot) sitting on the raised title-bar strip (`.frame`/`h3`) which itself sits inside the WINDOW's own bevel. DESIGN.md's own rule 2 ("Never nest a bevel inside a bevel … the nested-card tell") names an explicit exception only for a *flat* band holding raised chips (the resource bar); it does not extend that exception to a *socket* holding a chip, or to a *raised title strip* holding a raised glyph plate. Register-justified in intent (this is the MapleStory carpentry system, not a generic AI card-grid — none of the detector's other tells like purple-triplet, cyan-on-dark, or unmodified-shadcn fired), but the glyph-on-title-bar case is a plausible tension with the project's *own* stated rule, not just the generic AI-tell. | ai-tells.md "no bevel inside a bevel" register test; DESIGN.md's own Material rule 2 | Confirm intent: either extend the rule-2 exception to name chips-in-sockets and glyph-on-title-bar explicitly, or flatten one of the two nested bevels at those two sites. |
| Note | copy | Detector `em-dash-overuse` (8 in `player.html`) traces to the `.mockNote` dev-annotation blocks, which the file's own CSS comment marks "never product copy." Register-justified — not shipping UI text. | ai-tells.md copy-tell scope | No action; confirm the rule is copy-scoped to shipped strings in a future detector pass if it starts flagging real product copy. |
| Note | color | `rarity.js` (shipped, repo root) still carries the pre-lift `epic`/`mythic` hex (`#b061d6` 4.15:1, `#d85454` 4.00:1 — both real AA failures on `--field`). DESIGN.md's own "Open questions" section states this is deliberately deferred to a later integration pass, matching the posture of prior phases' deferred code changes — not a silent gap. | WCAG 1.4.3 | Carry the lift into `rarity.js` in the same pass that pastes `CSS_V4` into `style.css`. |

## Requirement Fulfillment

### DW-2.5.1
PREMISE:  DESIGN.md v4 specifies all four colour lanes as named tokens with the meaning each hue carries, and states the co-occurrence rule (which lanes may appear together on one surface). The four lanes are: (1) rarity ramp promoted to a visual lane, (2) per-Warden identity hue, (3) per-tab accent identity, (4) zone / IP power bands.
EVIDENCE: DESIGN.md `## The four colour lanes` (lines 85–249) names Lane 1 Rarity (`--rar-*`, meaning "how many affixes"), Lane 2 Warden (`--w1`–`--w10`, "which door"), Lane 3 Tab accent (`--acc-*`, "which room"), Lane 4 Power band (`--band-1`–`5`, "how deep/strong"), each with a hex table and a "Where it attaches" clause. `## The co-occurrence rule` (lines 214–228) gives a per-surface table and a stated hard cap ("One chrome lane + at most one content lane per surface. Hard cap: two"), reinforced in `## Never (v4)`.
VERDICT:  PASS

### DW-2.5.2
PREMISE:  Every new or changed hex passes AA on the dark ramp (≥4.5:1 body, ≥3:1 non-text), verified by computed ratio; no previously-fixed pair regresses; surface pairs verified by L* separation, not ratio.
EVIDENCE: Independently re-ran `node internal/mocks/contrast.mjs` — output ends `all 190 gated pairs + 16 L* surface pairs pass`; `grep -c "^FAIL"` and `grep -c "MISSING"` on the same run both return 0. `git diff internal/mocks/contrast.mjs` inspected: the diff only *adds* coverage (OKLab `color-mix`/`var()` resolution so derived tokens are computed rather than asserted, the four new lane blocks, the L*-separation SURFACES check, splitting BANNED into BANNED_FAILING/BANNED_BY_ROLE) — the AA floors (4.5 text / 3.0 non-text), the luminance formula, and every previously-gated pair are unchanged; nothing was loosened. `--rar-epic`/`--rar-mythic` in the mocks' `:root` are declared twice (old failing value, then the v4-lifted value later in the same block — CSS cascade means the lifted value wins), matching the checker's PASS result.
VERDICT:  PASS

### DW-2.5.3
PREMISE:  The construction is materially heavier than the previous version — judged on a side-by-side screenshot against the v3 baseline in `internal/mocks/shots/` (`boss-1280-v3.png` vs `boss-1280.png`), not asserted.
EVIDENCE: Read both PNGs side by side. v4 adds, visibly: four corner rivets on every title bar (small square marks, absent in v3), a gold letter-glyph "M" plate before the boss name (absent in v3), a visibly thicker frame with a two-tone bevel (v3's hairline read flat by comparison), the Warden's name and door frame now rendered in a saturated teal-green identity hue instead of v3's uniform gold, and distinctly tinted tab foot-bars in the nav row (v3's tabs were undifferentiated grey).
VERDICT:  PASS

### DW-2.5.4
PREMISE:  `boss.html` and `player.html` render self-contained, no hard-coded hex or untokenized px, no horizontal scroll at 375px.
EVIDENCE: `grep -n "<link\|<script src\|<img src\|http://\|https://\|url("` on both files returned zero matches — no external references. Hex search outside the `:root` block returned only HTML numeric character entities (`&#9646;` etc.), no CSS hex literals. Px search outside `:root`, filtered to actual rule bodies (not comments/media-breakpoint literals), returned zero untokenized declarations. `boss-375.png`/`player-375.png` show `.wallScroll`/`.amScroll` as intentionally contained horizontal-scroll sub-widgets (per DESIGN.md's own stated edge-case handling for the Armory grid); no page-level horizontal overflow visible.
VERDICT:  PASS

### DW-2.5.5
PREMISE:  live / dormant / locked still read apart on both rendered mocks, with the colour lanes active.
EVIDENCE: `boss.html`'s embedded Grind specimen (375px render) shows active (lifted ground, lane-3 accent edge + name), dormant (flat, neutral edge, dim name), struggling (`--warn` edge/stat), and locked (`--opacity-locked`, unlit, no control, literal "locked" text) rows side by side, all distinguishable by edge colour + type colour + control presence + text, independent of the lane-3 accent that additionally colours the live row. `player-375.png` shows the same ladder in Stash rows (upgrade edge vs plain), Trophy sets (started/complete/dormant), and Armory cells (dormant vs max), each with rarity/band lane colour active alongside the structural cues.
VERDICT:  PASS

### DW-2.5.6
PREMISE:  No AI-generated icon. Any icon plate is a letter glyph or a hand-made mark, and the mock says which.
EVIDENCE: `boss.html`'s `.mockNote` (rendered, not just source comment) states: "a gold letter-glyph plate (one capital in the UI face on a shrunken control plate — **TYPE on a plate, not an icon**; there is no raster, path or generated art anywhere in this file and `build.mjs` asserts it)." The only glyph markup found (`<span class="glyph" aria-hidden="true">M</span>`) is a single capital letter, styled as text on a CONTROL-construction plate — no `<img>`, `<svg>`, or background-image anywhere in either file.
VERDICT:  PASS

**All requirements met:** NO — see Edge case 1 below.

## Edge cases
- **Co-occurrence rule obeyed on the rendered mocks:** FAIL. See the Major finding above — the persistent tab nav renders more lanes on the Boss surface (and on every other surface) than each surface's own row in the co-occurrence table permits.
- **Canvas draws per Warden hue, stated in the DNA:** PASS. DESIGN.md `## Canvas scene spec (v4)` (lines 322–336) explicitly ties floor band, floor seam, boss sprite rim, damage-crack colour, hero sprite, crit numbers, and the BREACHED reveal each to a specific token/rule. `boss.html`'s `.canvasStub` is labelled a placeholder and its visible copy restates what should draw there per-Warden ("hero and boss sprites with progressive damage cracks … streaming crit-tier damage numbers").

## Additional constraints
- **No decay signifiers:** PASS. Grepped both files for crack/glitch/corrupt/broken/rust/worn/scanline language; the only "cracks" reference is the canvas spec's boss-creature battle damage (combat feedback on the enemy sprite, explicitly scoped away from the client chrome, which DESIGN.md's own veto keeps complete/symmetric — rivets are "always four, always symmetric, always complete").
- **Colour identity must not drown the state ladder:** PASS at the row level (six channels intact, verified on the Grind specimen and Player screenshot) — but the co-occurrence overreach in the Major finding above is the same failure mode one level up (chrome, not rows): the nav's seven simultaneous hues are exactly the kind of "fifth channel" pressure this constraint warns about, even though it doesn't yet reach the row ladder itself.
- **Dark ramp only, vanilla CSS:** PASS. All colour is CSS custom properties and native `color-mix(in oklab, …)`; no light-ramp values, no build step, no framework.

## Notes (non-blocking)
- The detector's 24 `nested-cards` hits are mostly the MapleStory plate/socket construction working as designed (not the generic AI card-grid tell — no purple-triplet, no cyan-on-dark, no unmodified-shadcn-radius hits anywhere in `detect.json`), with one genuine ambiguity (glyph-on-title-bar) flagged as Minor above.
- `internal/DESIGN.md` is 2,544 lines carrying v1–v4 superseded history in one file; useful for provenance but slows any future audit pass — consider archiving pre-v3 sections once v4 locks.

## Verdict: FAIL — blockers:
1. The co-occurrence rule stated in DESIGN.md v4 ("Boss: lane 2 only"; "Never more than two lanes on one surface … Three lanes is a clown car") is not obeyed on the rendered mocks: the persistent tab nav puts six-to-seven simultaneous lane-3 (and, via the Boss tab, lane-2) hues on every surface, including the one surface the rule claims carries exactly one identity hue. This is the edge case the review brief named with explicit FAIL standing.
