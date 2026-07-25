# Design Review: Phase 3 - Token spec / DESIGN.md (UI de-dup audit)

## Rendered Evidence (Step 0)
- Screenshot: none produced this phase — confirmed no rendered `.html` exists for
  this artifact; the deliverable is `internal/DESIGN.md`, a token specification.
- Surface reviewed: `internal/DESIGN.md` (token spec + contrast evidence) cross-checked
  against the shipped `style.css` (675 lines, read in full), `internal/JOURNEY.md`
  (fact-ownership table, state column), `battle.js`, `rarity.js`, `bots.js`,
  `trophies.js`, `main.js`, `index.html`. No screenshot exists to critique pixels
  directly; every claim below is verified against source, not visual impression.

## Assessment B — Deterministic Detector
- Command: not run — no rendered `.html`/mock exists this phase (confirmed:
  `internal/` contains only `.md`, `.js` source, no built page).
- Exit: N/A (no rendered artifact) — the no-artifact carve-out applies, per the
  dispatch prompt's own framing. Confirmed by attempting `node scripts/detect.mjs`
  with no args: the repo has no `scripts/detect.mjs` at all in this project, and
  regardless there is nothing for it to analyze this phase.
- Findings: N/A — no rendered artifact.
- Opened only after Assessment A findings were frozen: N/A (nothing to open).

## Triage
- Baseline (always-on): visual (design-dna, foundations, ai-tells) — applied to
  the token spec itself (fonts, color, composition claims), since a token
  document is where visual identity lives even absent a rendered page.
- Dispatched doctrine (per `## Doctrine`): design-dna, foundations, archetypes,
  fonts, color, ai-tells — all six read and applied.
- Not applicable: usability, journey, content-design, data-viz, behavioral,
  deceptive-patterns, design-systems, ai-native — not listed in this phase's
  Doctrine block; the artifact is a token spec, not an interaction surface or
  copy surface, so these were correctly withheld per the explicit Doctrine
  list (no doctrine loaded beyond what was named).
- Deferred: none — six doctrines is a small enough set that no capping was
  needed.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| **Critical** | color / central constraint | `--faintest` is applied to genuine small (10px, `--fs-label`) readable text in Trophy pips (`main.js:927`: `` `${own?"✓":"◈"} ${p.part} <b>+${p.pct}% ${laneWord(p.lane)}</b>` ``, where `p.part` is a real word — "Hinge", "Bolt", "Latch", etc., from `trophies.js:14-22`), rendered on `--inset` (`.trophySet { background: var(--inset) }`, style.css:606). Independently recomputed: `--faintest` (new, `#64646a`) vs `--inset` (`#17171c`) = **3.04:1** — I verified this myself with the WCAG relative-luminance formula and it matches DESIGN.md's own stated 3.04:1. DESIGN.md classifies this token as passing "the non-text 3:1 floor... not full body AA" (Color tokens table, `--faintest` row), but WCAG's non-text criterion (1.4.11) applies to icon/UI-component boundaries, not to text conveying information — and this pip's text is neither an icon nor "large text" (10px is far under the 18pt/14pt-bold large-text threshold). No `title`/tooltip attribute exists in the markup to supply a redundant channel despite `.pip { cursor: help }` (style.css:620) visually promising one. | WCAG 1.4.3 vs 1.4.11 (chapter-08-color-science.md's "pair color with a redundant cue" only applies once a redundant cue actually exists; color science's core contrast-science concern is exactly this: don't waive a real text-contrast requirement without one) | Either raise `--faintest` further so the Trophy-pip usage clears 4.5:1 against `--inset`, or split the token: keep `--faintest` at 3.13:1 for genuinely non-text/interactive uses (the `.locked` tab, DW-3.3-scoped), and introduce a separate token for the pip's readable label at ≥4.5:1. |
| **Major** | central constraint / interaction | The claimed "Interactivity" redundant channel between dormant and locked ("locked rows are non-interactive... allocation controls don't respond") does not hold in the shipped code. `bots.setAlloc` (`bots.js:116-122`) has no lock-state check at all, and the `allocMini` click handler (`main.js:296-309`) is wired unconditionally for every row, locked or not (`main.js:325` for Training tiers, and the equivalent zone-row wiring). A genuinely locked Training tier or Grind zone's `−`/`+`/`cap`/`max`/`0` buttons remain fully clickable and silently write bot allocations into state — the only thing that stays inert is the *readout* (`"[LOCKED] break W#"`, or the rate staying 0), not the *input*. This weakens DESIGN.md's claimed dual-channel (text + interactivity) separation to effectively one channel (text only). | chapter-08-color-science.md: a claimed redundant cue must actually be present to be counted as a cue | Correct the claim in DESIGN.md to describe what's actually gated (the readout, not the input) — or, as a follow-up (not this phase, code is out of scope here), add `pointer-events: none` / a real disabled state to locked rows' alloc controls, which would also close a live gameplay bug (bots silently wasted on unreachable rows with zero feedback). |
| **Major** | central constraint | The shipped `.locked` CSS class is overloaded for Grind zones: `main.js:841` toggles it on `!unlocked \|\| (n > 0 && !zr.held)` — i.e., a genuinely locked (not-yet-reachable) zone AND a live, manned zone whose squad can't hold it both receive the identical opacity-.45/dim treatment. DESIGN.md's state table describes `.rowlist .row.locked` uniformly as "not yet reachable... prints its own unlock condition as text," but the manned-and-struggling branch instead prints `"squad DPS X/Y — can't hold"` (`main.js:848`) — a live, reachable, in-play state visually indistinguishable from an unreachable one. Training tiers do not have this overload (`main.js:787`, `locked = i >= B.unlocked`, purely structural) — this is specific to the 10 audited Grind-zone rows. | Central constraint: adjacent tiers must be distinguishable from each other | Give the "manned but can't hold" condition its own class/treatment (e.g., the existing `--warn` accent already used for "NOT BLOCKED" states elsewhere in the game) distinct from `.locked`'s dim/inert styling — a Phase 4/6 code concern, but the claim in DESIGN.md should be corrected now to not assert this is already cleanly verified for Grind. |
| Minor | ai-tells / craft | `.pip { cursor: help }` implies a tooltip on hover, but no `title` (or other) attribute is set anywhere in the pip markup (`main.js:927`) — the affordance signals information that isn't there. | ai-tells.md: decorative signifiers without the mechanism they promise read as an unfinished detail, not a defect of direction | Add a `title` attribute (piece name + boss + pct) to `.pip` spans, or drop `cursor: help` if no tooltip is planned — small, not blocking this phase. |

**Everything independently re-verified and found accurate** (not a finding, stated for
the record since the review protocol requires recomputing every ratio rather than
trusting the stated number): every one of DESIGN.md's ~20 stated contrast pairs —
`recede`/`faint`/`faintest`/`warn`/`alert` before/after, the rarity ramp (`mythic`
old/new plus all six untouched rarities), `bone@1.0` vs `bone@0.5` vs `bone@0.45`
(the Armory-dormant / Grind-Training-locked opacity signal), the full neighbor-contrast
table, `on-gold` on solid gold, and the `drawBars()` label defect (1.23:1) — matched
my independent WCAG relative-luminance recomputation to within rounding. The hue
deltas on every adjusted hex (`recede`, `faint`, `faintest`, `warn`, `alert`, `mythic`)
measured ≤0.4°, confirming the "lightness-only nudge, no new hue" claim. The type-scale
coverage claim was verified by grepping every `font-size` declaration in `style.css`:
all use one of the seven `--fs-*` tokens except the one DESIGN.md itself names as a
deliberate exception (`.modalClose`, 22px). This is an unusually rigorous document —
the two findings above are real, but they sit on top of an otherwise exactingly
verified contrast pass.

## Requirement Fulfillment

### DW-3.1
PREMISE:  `internal/DESIGN.md` exists with a token block present. (The user-confirmation half of this item is handled outside your review — verify the artifact side only.)
EVIDENCE: `internal/DESIGN.md` exists (505 lines, read in full) and contains a
complete, paste-ready `:root { ... }` CSS custom-property block (lines 246-288),
plus a canvas token module (`theme.js`, lines 353-376).
VERDICT:  PASS

### DW-3.2
PREMISE:  All text/background pairs pass WCAG AA on the DARK ramp (≥4.5:1 body, ≥3:1 large), verified by computed ratio. A LIGHT ramp is deliberately waived by the plan — its absence is NOT a finding, and inventing one would be a finding.
EVIDENCE: Independently recomputed every pair DESIGN.md lists and all matched its
stated numbers (see Cross-Pillar table note above). However, `--faintest` (`#64646a`)
against `--inset` (`#17171c`) = 3.04:1, applied to genuine 10px readable text in
Trophy pips (`main.js:927`, `trophies.js:14-22` — real words like "Hinge", "Bolt",
plus a "+N%" value, not large text, not an icon). This is neither ≥4.5:1 (body) nor
"large" text eligible for the 3:1 exception. DESIGN.md's own framing ("verified at
the non-text 3:1 floor... not full body AA") misapplies WCAG 1.4.11 (non-text/UI-component
contrast) to a genuine text-contrast case (1.4.3), and no tooltip exists to supply a
redundant channel (`cursor: help` with no `title` attribute anywhere in the markup).
VERDICT:  FAIL

### DW-3.3
PREMISE:  Interactive elements pass WCAG AA non-text (≥3:1 against adjacent color) — this includes the gold CTA and the `.locked` tab state.
EVIDENCE: Gold CTA (`#pullBtn`/`#descendBtn`, `#c9a94b`) vs `--panel` (`#13141a`) =
8.10:1, independently recomputed, matches DESIGN.md's stated 8.10-8.62:1 range.
`.locked` tab: current shipped hex `#45454d` vs `--panel` = 1.94:1 (fails, confirmed) —
DESIGN.md's specified fix (route the selector to `var(--faintest)`, `#64646a`) yields
3.13:1 against `--panel`, independently recomputed and matching. This usage of
`--faintest` is legitimately scoped as a non-text/interactive-element check per this
DW item itself (a tab button's border/state, not a text-contrast case), so the 3:1
floor correctly applies here — unlike the Trophy-pip usage flagged under DW-3.2.
VERDICT:  PASS

### DW-3.4
PREMISE:  Semantic aliases resolved (background, surface, text, accent) and a type scale is defined covering every size currently in use in the shipped `style.css`.
EVIDENCE: DESIGN.md's Color tokens table names background (`--bg`), three surface
tiers (`--panel`/`--inset`/`--field`/`--well`), border, and multiple text/accent
tiers by role. Grepped every `font-size` declaration in `style.css` (68 matches):
every one resolves to one of the seven `--fs-*` custom properties except
`.modalClose { font-size: 22px }` (style.css:572), which DESIGN.md explicitly names
as a deliberate icon-scale exception, not a gap. Full coverage confirmed.
VERDICT:  PASS

### DW-3.5
PREMISE:  Canvas colors exist as named tokens readable from JS. The canvas cannot read CSS custom properties, so verify the artifact specifies a working MECHANISM, not just names.
EVIDENCE: DESIGN.md specifies a `theme.js` module (lines 353-376) that resolves
`getComputedStyle(document.documentElement)` once and caches the result — a standard,
correct workaround for canvas 2D's inability to resolve `var(--x)` at the `fillStyle`/
`strokeStyle` call site. Confirmed `style.css` is linked synchronously in `<head>`
(`index.html:7`, before `<body>`), so a `getComputedStyle` call inside `initBattle(el)`
(called after the canvas element exists, per `battle.js:24-29`) will resolve real
values, not fallbacks. Not yet wired into `battle.js` (which still hardcodes hexes
directly, e.g. `#c9a94b`, `#ffd700`) — consistent with DESIGN.md's own disclosure
that no code was touched this phase.
VERDICT:  PASS

### DW-3.6
PREMISE:  Motion budget stated and contains no ritual/ceremony animation.
EVIDENCE: DESIGN.md's Motion budget table (lines 412-421) lists every animation in
the game, cross-checked against `style.css` keyframes (`flashOk` 0.7s / `flashFail`
0.45s, lines 348-358, matching exactly) and `battle.js` (shake/flash/reveal timings,
matching exactly). Everything is ≤700ms except the disclosed one-time, non-blocking
6000ms BREACHED reveal, explicitly named as the sole exception with its rationale
stated. No effect gates or delays input; Enhance already resolves instantly per the
hard veto. `prefers-reduced-motion` coverage gaps (4 canvas effects, 2 CSS keyframes)
are honestly flagged as "not checked" rather than silently omitted or falsely claimed
covered.
VERDICT:  PASS

**All requirements met:** NO — DW-3.2 fails on the Trophy-pip contrast pair.

## Notes (non-blocking)
- The `drawBars()` HP-label contrast defect (fixed `#0d0d10` on `#22222a` empty
  track = 1.23:1, independently recomputed and matching DESIGN.md's own 1.23:1
  claim) is self-disclosed by the artifact, not fixed this phase, and comes with a
  specified fix reusing an existing pattern — appropriately non-blocking since it's
  transparently flagged rather than hidden.
- `prefers-reduced-motion` gaps on 4 canvas effects + 2 CSS keyframes are honestly
  named as open, not silently dropped.
- The "why no code touched this phase" framing is internally consistent with the
  design-dna.md gate ("do not write or modify UI code until DESIGN.md is confirmed")
  and this phase's own scope.
- Archetype/family framing (Ruler + Sage stretch pairing → Data-Dense Professional
  discipline with Georgia identity chrome) checks out against `archetypes.md` Part C:
  Data-Dense Pro is a listed stretch family for both Ruler and Sage, and Terminal is
  a listed Sage stretch family — legitimizing the mono-as-data-register choice
  without it reading as a base-layer terminal skin (the binding "no CLI/terminal
  aesthetic as the base layer" constraint holds: mono is scoped to stat
  rows/log/canvas/buttons, Georgia carries all identity chrome).
- Distinctiveness (ai-tells CHECKER mode): the direction is named specifically
  ("Last Warmth"), uses no purple-indigo-violet triplet, no cyan-on-dark, no Inter/
  Roboto/system-ui, no pure `#000`/`#fff` (confirmed — every hex in the `:root` block
  is a tinted near-black or desaturated tone). This is a systematization pass of an
  already-shipped, non-generic look, correctly scoped per this phase's own brief
  (not a fresh divergent generation) — no distinctiveness finding.

## Verdict: FAIL

Blockers:
1. **DW-3.2** — `--faintest` on `--inset` (3.04:1) fails WCAG's 4.5:1 body-text
   requirement for the genuine, readable 10px text it carries in the 70 Trophy pips
   (piece name + percentage) — the single largest group in the audited ~136-item
   state ladder this phase exists to fix. DESIGN.md's "non-text 3:1 floor" framing
   misapplies WCAG 1.4.11 to text content that isn't large and isn't an icon.
2. Two Major findings on the central constraint's claimed mechanisms (Grind zones'
   `.locked` class conflating locked-vs-struggling states; the "allocation controls
   don't respond" interactivity claim not holding against `bots.js`/`main.js`) should
   be corrected in DESIGN.md's text even though they don't independently trigger a
   contrast-based FAIL — they overstate what the shipped code actually verifies for
   the central constraint's redundant-channel argument.

Everything else in this artifact — the semantic alias table, the type-scale coverage,
the canvas-token mechanism, the motion budget, the six other adjusted hexes, and the
overall aesthetic direction — is accurately specified and independently verified.
