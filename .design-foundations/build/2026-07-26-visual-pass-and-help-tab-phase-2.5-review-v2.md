# Design Review: Phase 2.5 - Visual pass (DESIGN.md v4 colour lanes + construction weight)

## Rendered Evidence (Step 0)
- Screenshots read: `internal/mocks/shots/boss-1280.png`, `boss-375.png`, `player-1280.png`, `player-375.png`, `boss-1280-v3.png`, `boss-375-v3.png` (all six read directly, not described).
- Surface: `boss.html` (hero/detail surface, lane 2 proof) and `player.html` (list surface, lanes 1+3+4 proof), each at 375px and 1280px, plus the v3 baseline pair for the DW-2.5.3 side-by-side.

## Assessment B — Deterministic Detector
- Command: `node "C:/Users/Admin/.claude/plugins/cache/rtd/design-for-ai/4.2.0/scripts/detect.mjs" internal/mocks/boss.html internal/mocks/player.html > .design-foundations/build/2026-07-26-visual-pass-and-help-tab-phase-2.5-review-v2.detect.json`
- Exit: 0 (ran)
- Findings: 25 total — 24× `nested-cards` (high; `.glyph` spans and `.band` chips flagged as "card inside a card ancestor," across both files), 1× `em-dash-overuse` (medium; 8 em-dashes in `player.html` body copy)
- Opened only after Assessment A findings were frozen: YES

## Triage
- Baseline (always-on): visual + usability.
- Dispatched (per dispatch prompt's `## Doctrine`): `design-dna` (Read `references/visual/design-dna.md`), `color` (Read `references/visual/chapter-08-color-science.md`), `ai-tells` (Read `references/visual/ai-tells.md`), `checklists` (Read `references/visual/checklists.md`) — all four Read in full or to sufficient depth before critique. `techniques` (`references/visual/techniques.md`) Read at table-of-contents/structure level; its content is a technique-reference restatement of the same chapters `checklists.md` already condenses into pass/fail form (proportions, composition, hierarchy, color science/theory), so no additional distinct checklist items were found beyond what `checklists.md` already supplied — noted here rather than silently skipped.
- Not applicable: `content-design` doctrine not separately dispatched — the only copy on the rendered surfaces is the mock's own internal explainer/annotation prose (explicitly out of scope this phase per `DESIGN.md`'s "Copy is deliberately untouched" note), not shipped player-facing microcopy.
- Deferred: none beyond the `techniques` note above.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|---|---|---|---|---|
| Minor | detector + design-dna | Detector flags 24 `nested-cards` hits (`.glyph` title-bar plates, `.band` IP chips). Verified independently in the CSS, not taken on the document's word: `.glyph` (boss.html:959-969) carries the genuine opposed-bevel signature (inset top-left `--edge-lit` + inset bottom-right `--edge-shade` + a hard offset foot) and its ancestor `h3,.frame` (boss.html:933-943) has only a top inset hairline + a bottom groove — no opposed corner pair, no foot — matching DESIGN.md's own definition of a "flat carrier," not a bevel. `.band` (boss.html:1089-1093) uses two *inset* shadows only (a socket signature, not a raised one) inside a `.rowlist` socket row. Neither site is "raised directly inside raised," which is the actual thing the project's own construction rule (v3 rule 2, restated 2026-07-26) bans; the detector's generic card-in-card heuristic has no visibility into the raised/sunk distinction this design language makes. | `ai-tells.md` Checkable Signatures (nested-cards, Fable 5's #1 measured default) — register-justified per this review's own synthesis rule | No action required; the adjudication is evidence-grounded, not merely asserted. Worth a one-line pointer from `ai-tells.md`'s nested-cards rule to DESIGN.md's raised/sunk distinction so a future reviewer doesn't have to re-derive this from the CSS each time. |
| Minor | detector + content-design | 8 em-dashes flagged in `player.html`'s body copy (`em-dash-overuse`, medium). The flagged copy is the mock's own internal explainer/annotation prose ("MOCK — not the shipped client…" style text), which `DESIGN.md`'s v4 Open Questions section states is deliberately untouched this phase and scheduled for a Phase 3 copy relocation to Help. | `ai-tells.md` Copy/Content Tells | Out of scope for Phase 2.5; re-check when Phase 3's copy pass lands. |
| Minor | design-dna / color | The co-occurrence Tier B table's Boss row ("lane 2 · Count 1") is silent about lane 4 even though the Zones specimen block rendered on `boss.html` visibly shows band-chip colour (lane 4). The universal step-2 exemption ("skip lane 4" applies to every surface, not just the rows that mention it) resolves this without a pixel violation — I independently confirmed no extra lane leaks onto Boss's Tier B count — but the table is inconsistent in *documenting* which surfaces render lane-4 chips (Player/Grind spell it out, Boss doesn't), which is exactly the kind of gap DW-2.5.1's "not too vague to check" bar is meant to catch. | Nielsen #4 consistency (a rule's own presentation should be internally consistent) | Add the same "· lane 4 in chips, exempt by step 2" annotation to the Boss row for consistency with Player/Grind. |
| Note | (repo-wide, not this phase's surface) | `rarity.js` at the repo root still ships the pre-fix Epic (`#b061d6`, 4.15:1 on `--field`) and Mythic (`#d85454`, 4.00:1) hexes that DESIGN.md v4 itself identifies as real WCAG 1.4.3 failures. The AA-passing lift (`#bc6ce2` / `#e86362`) exists only in the mocks' token layer (`build.mjs`'s emitted `:root`), not in the shipped game file. | WCAG 1.4.3 | Explicitly deferred by DESIGN.md's own "not yet applied to style.css or rarity.js" posture, matching v2/v3's precedent — not a DW-2.5.2 failure (that item gates the mocks' own hexes, which pass), but a live gap to close in the integration phase. |

## Requirement Fulfillment

### DW-2.5.1
PREMISE: DESIGN.md v4 specifies all four colour lanes as named tokens with the meaning each hue carries, and states the co-occurrence rule (which lanes may appear together on one surface). The four lanes are: (1) rarity ramp promoted to a visual lane, (2) per-Warden identity hue, (3) per-tab accent identity, (4) zone / IP power bands. The stated rule must match what the mocks actually render — a rule the surfaces disobey is a failure, and so is a rule too vague to check.
EVIDENCE: `DESIGN.md` "## The four colour lanes" names and tables all four (Lane 1 RARITY `--rar-*`, Lane 2 WARDEN `--w1..--w10`, Lane 3 TAB ACCENT `--acc-*`, Lane 4 POWER BAND `--band-*`), each with its meaning and where it attaches. "## The co-occurrence rule" gives a checkable, non-vague procedure (Tier A: exactly one selector `#tabs button`, chroma ≤.05, 2px foot bar only; Tier B: a named 3-step counting method, hard cap 2, a per-surface table). I independently verified this against the pixels rather than the document's own claim: `grep -n -- "--acc-tab" internal/mocks/boss.html internal/mocks/player.html` shows the token is set and read exclusively inside `#tabs button*` rules in both files (Tier A bound holds). `grep -n 'id="bossName"\|id="dialogue"\|class="wallBtn'` against `player.html`'s body returns zero matches, confirming lane 2 (Warden hue), though defined in the shared CSS token block, renders on no element in `player.html` — matching the stated Tier B count of 2 (lane 3 + lane 1) with no lane-2 leak. `--border-frame`/rarity/band tokens are scoped as documented.
VERDICT: PASS (see Minor finding above re: table completeness on the Boss row, which does not change the pixel-level result)

### DW-2.5.2
PREMISE: Every new or changed hex passes AA on the dark ramp (≥4.5:1 body, ≥3:1 non-text), verified by computed ratio; no previously-fixed pair regresses; surface pairs verified by L* separation, not ratio.
EVIDENCE: Independently re-ran `node internal/mocks/contrast.mjs` (not just read the log DESIGN.md quotes): output ends `all 190 gated pairs + 16 L* surface pairs pass`, zero `FAIL` lines, exit 0. Read `git diff internal/mocks/contrast.mjs` line-by-line: every change is additive/strengthening — new OKLCH `color-mix`/`var()` resolution so derived tokens stay computed rather than asserted, new lane `PAIRS` (rarity/Warden/accent/band), a new `SURFACES` L*-separation gate (4.0 L* floor), and the `recede`/`faint`-on-`--field` ban converted from a decorative print (never actually asserted in the prior version, despite its comment claiming otherwise) into a genuinely asserted failure. No existing `PAIRS` entry was removed or had its floor lowered.
VERDICT: PASS

### DW-2.5.3
PREMISE: The construction is materially heavier than the previous version — judged on a side-by-side screenshot against the v3 baseline (`internal/mocks/shots/boss-1280-v3.png` vs `boss-1280.png`), not asserted.
EVIDENCE: Read both screenshots directly. v4's Boss panel shows a visibly thicker, greenish-tinted (Warden hue) window frame vs. v3's thin neutral 3px frame; four corner-rivet marks on the title bar (absent in v3); a larger Warden name in the door's own hue (v3: smaller, gold). Token diff confirms this is a measured change, not an illusion: `--border-frame` moves from `var(--space-2)` (3px, v3) to `var(--space-3)` (4px, v4; boss.html:259); a new `--bevel:var(--space-1)` (2px) token replaces v3's 1px hairline; `#bossName` grows from `--fs-warden:36px` to `40px` and switches ink from gold to `var(--w-active)` (boss.html:673-674, 985). The v3 tab row (boss-1280-v3.png) has no per-tab colour underline; v4's does (all seven `--acc-*` foot bars visible).
VERDICT: PASS

### DW-2.5.4
PREMISE: `boss.html` and `player.html` render self-contained, no hard-coded hex or untokenized px, no horizontal scroll at 375px.
EVIDENCE: `node internal/mocks/build.mjs` regenerates all six files and self-checks each for hex outside `:root`, `rgb()` outside `:root`, untokenized px, and external references (`<link`, `<script`, `src=`, `url(`, `@import`, `http(s)://`); output: `ok boss.html … no hex / no rgb / no raw px / no external refs`, `ok player.html …`, exit 0, `DW-6.1 + DW-6.2: all 6 files pass`. Independently grepped both mocks for `#[0-9a-fA-F]{6}` — every hit falls inside the `:root` token block; grepped for `<img`, `<svg`, `url(`, `background-image` — zero matches in either file. At 375px, `boss-375.png`/`player-375.png` show full-width content with no visible horizontal cutoff; `*{box-sizing:border-box}` is global, and the only two `overflow-x:auto` regions (`.wallScroll`, `.amScroll`) are deliberate widget-level scroll containers for wide rows, not page-level overflow.
VERDICT: PASS

### DW-2.5.5
PREMISE: live / dormant / locked still read apart on both rendered mocks, with the colour lanes active.
EVIDENCE: The Zones list rendered on both mocks shows three visibly distinct row treatments: live/active rows carry a filled, coloured IP-band chip plus visible +/− controls and a non-zero count; dormant rows read "no bots here" in dim text with a control reading 0; locked rows ("Frostbound Spires," "The Sunken Archive," "Obsidian Breach," "The Hollow Spire," "World's Edge") are visibly desaturated, show no controls, and print the literal word "locked" with the unlock condition ("needs N doors open, you have M"). This matches DESIGN.md's stated six-channel ladder (edge presence, type colour, control presence, unlock text, material lift, socket lit-ness) with lane hues layered on as an additional, non-replacing channel.
VERDICT: PASS (exact per-pixel hue values per state were not separately measured at the delivered screenshot resolution — noted under Notes, not a failure, since the non-colour channels alone already keep the states legible)

### DW-2.5.6
PREMISE: No AI-generated icon. Any icon plate is a letter glyph or hand-made mark, and the mock says which.
EVIDENCE: Grepped both mocks for `<img`, `<svg`, `url(` — zero matches. The only icon-like element is `<span class="glyph" aria-hidden="true">M</span>` (and similarly for other blocks) — a literal capital letter styled via CSS gradient/border/radius/shadow, not an image or path. The four corner marks are CSS `background` layers (`linear-gradient(--edge-lit,--edge-lit)` positioned per corner), not a raster asset. The mock's own on-page copy states which construction each is ("a gold letter-glyph plate," "corner rivets (four background layers — a drawn mark…)" — boss.html body copy, ~lines 1148-1150).
VERDICT: PASS

**All requirements met:** YES

## Notes (non-blocking)
- Screenshot resolution (the delivered PNGs, read at their native scale) is sufficient to confirm structure, token application, and state differentiation, but not fine per-pixel hue-boundary measurement (e.g. distinguishing a 3° hue gap between an accent and a rarity colour by eye). Objective claims in this review (contrast, token scoping, DOM presence) were verified computationally or via grep, not by eyeballing colour swatches; the few claims that rest on visual impression alone are flagged as such above.
- `rarity.js`'s un-lifted Epic/Mythic hexes (see findings table) are a real, already-acknowledged gap between design intent and shipped code, deferred by the document's own stated posture rather than newly discovered here.
- The Boss/Player co-occurrence table inconsistency (Minor finding above) is documentation polish, not a rendered defect — worth a one-line fix before the pattern is copied into the remaining four surfaces' phases.

## Issues (if FAIL)
None — no blocking issues found.

**Verdict: PASS**
