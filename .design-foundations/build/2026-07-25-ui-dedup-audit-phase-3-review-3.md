# Design Review: Phase 3 - Last Warmth (DESIGN.md tokens)

## Rendered Evidence (Step 0)
- Screenshot: none — this phase's artifact is a token specification (`internal/DESIGN.md`), not a page. No `.html`/mock exists for this phase.
- Surface: `internal/DESIGN.md` (token spec), cross-checked line-by-line against the actual shipped source it claims to systematize: `style.css`, `main.js`, `battle.js`, `bots.js`, `state.js`, `instance.js`, `farm.js`, `trophies.js`, `rarity.js`, `index.html`. Every color/hue/contrast number quoted below was independently recomputed from the WCAG 2.x relative-luminance formula, not accepted on trust.

## Assessment B — Deterministic Detector
- Command: not run.
- Exit: N/A (no rendered artifact this phase — the dispatch prompt states detect.mjs is N/A here per the dual-blind section, not a failure).
- Findings: N/A — no rendered artifact.
- Opened only after Assessment A findings were frozen: N/A (nothing to open).

## Triage
- Baseline (always-on): visual (design-dna, foundations, archetypes, fonts, color, ai-tells — all six named in the dispatch's explicit `## Doctrine` list, all read) + usability (no interactive surface rendered this phase, so usability laws apply only at the level of "does the .locked tab/CTA contrast requirement serve operability," folded into the color findings below).
- Dispatched (per the prompt's explicit Doctrine list, not triage-inferred): design-dna, foundations, archetypes, fonts, color, ai-tells.
- Not applicable: data-viz (no charts), content-design (not in the dispatched list; this is a token spec, not product copy), journey/usability/behavioral/deceptive-patterns (not in the dispatched list).
- Deferred: none — six named doctrines is a small, fully-coverable set for a token-only artifact.

## Independent verification method
Recomputed relative luminance (`L = 0.2126R + 0.7152G + 0.0722B` on linearized sRGB channels) and contrast ratio `(L1+0.05)/(L2+0.05)` for every pair DESIGN.md cites, plus several it doesn't. Spot-check results: `--panel` L≈0.007137, `--inset` L≈0.008791 (both match DESIGN.md's stated values exactly). Every hex-pair contrast number DESIGN.md states — `recede`/`faint`/`faintest`/`warn`/`alert` vs `--panel`/`--inset`, `mythic` vs `--inset`, `on-gold` vs `--gold` (8.557≈8.56), `bone`↔`dim` (1.658≈1.66), `bone@1.0`↔`bone@0.5` (8.775→3.092≈8.78→3.09), `bone@0.5`↔`bone@0.45` (1.130≈1.13), and all six hue-angle claims (gold 44.8°≈45°, bone 36.9°≈37°, copper 31.2°≈31°, warn 11.6°≈12°, alert 9.7°≈10°, risk 212.0°≈212°, live 130.7°≈131°) — reproduce to within rounding. The `palette.mjs --seed "#c9a94b" --chroma muted --harmony mono --scheme dark` cross-reference was re-run directly: it solves to `oklch 0.75 0.118 90.4` / `accent-9: #cbb67c`, matching DESIGN.md's citation exactly. This document's math is unusually rigorous and I found no computational errors in anything it explicitly claims.

Two gaps surfaced by checking claims *against the source* that DESIGN.md's own contrast evidence section did not check, detailed below.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Critical | color | `#logHead` (style.css:133, the always-visible `maintenance@dead-server:~$` header, `--fs-micro` 9px) hardcodes `color: #4e7a5e`, entirely outside the token set. Computed against its actual render background (`body`'s `--bg` `#0b0c10`, since `#logHead` sits directly in `<main>` with no enclosing `.game` panel): **3.97:1 — fails WCAG 1.4.3's 4.5:1 body-text floor.** DESIGN.md's contrast evidence section claims "All pairs already passing, unchanged, verified against every background they actually render on" — this pair was never checked, is not in the `:root` block, is not in the six-hex adjustment list, and is not named as a gap anywhere in the document. | WCAG 1.4.3 (4.5:1 for real text); the review's own binding constraint ("Any existing hex that failed AA must be ADJUSTED, not waived") — this hex was neither adjusted nor even identified, so it was implicitly waived by omission | Add `--logline` (or fold into an existing token near `--dim`/`--recede`'s luminance) and repoint `#logHead`'s hardcoded `#4e7a5e` at it; recompute against `--bg` before locking |
| Major | design-dna / color | DW-3.3's "gold CTA" evidence cites `#pullBtn` as a currently-live interactive element needing contrast verification ("gold CTA (`#pullBtn`/`#descendBtn`) vs adjacent bg: 8.10–8.62:1 — DW-3.3"; also "`--on-gold`... `#pullBtn`, `#descendBtn:hover` both hardcode this today"). Grepped `index.html`, `main.js`, `bots.js`, `battle.js`, `trophies.js`, `rarity.js`: **`#pullBtn` does not exist anywhere in the shipped markup or wiring** — it is dead CSS from the retired pull-to-attempt mechanic (main.js's own comment: "fight is automatic now (idle battler) — no Attempt button"), the same category of dead code DESIGN.md correctly identifies and flags for `.ztable` two paragraphs earlier in the same document, but misses here (and for `#ticketGain`, `#tierAtk`/`#tierSpeed`, `#gmSec`/`#gmPanel`, `.tier-risk`/`.tier-nightmare` — all confirmed absent from every `.js`/`.html` file, present only in `style.css`) | The review's binding constraint: "Asserting as current fact something the source contradicts IS a finding... a shipped-fact claim on something absent from the code IS a finding" | Extend the `.ztable`-style dead-CSS callout to cover `#pullBtn`/`#ticketGain`/`#tierAtk`/`#tierSpeed`/`#gmSec`/`#gmPanel`/`.tier-risk`/`.tier-nightmare`; re-cite DW-3.3's gold-CTA evidence against `#descendBtn` alone (independently verified at 8.10:1, still comfortably clears the 3:1 floor, so the verdict itself doesn't change — only the evidentiary trail needs correcting) |
| Minor | fonts / ai-tells | The monospace register's footprint (DESIGN.md's own "Minor 2" correction: `section.game button` cascades mono to nearly every action button in every tab, plus every rowlist/chip/log/canvas readout) is large relative to the Georgia identity chrome. DESIGN.md reasons through this explicitly and defends it as the project's own inherited botter/admin register (grounded in `REMAKE-DESIGN.md` §16's three-register lexicon, not invented here) rather than a generic "hacker skin," and the base `body` element and section headers stay Georgia. I did not find a source contradiction, so this is a register judgment call, not a violation of the binding "no console/CLI aesthetic as the base layer" constraint — but it is worth a periodic re-check as more surface accretes mono treatment, since the margin between "data register" and "the whole product's skin" is a matter of degree that can erode silently over future phases | ai-tells.md: "Monospace font used as lazy shorthand for technical/developer aesthetic" (Typography Tells) — noted here as a register risk to monitor, not a present violation, since DESIGN.md names and justifies the specific split | No action required this phase; flag for the audit pass after Phase 4/6 apply the mono-button cascade to confirm Georgia chrome still visually dominates first-glance identity (tab bar, section headers, boss name) |

**The central constraint (live/dormant/locked distinguishable weights) — assessed on the merits, no finding.** DESIGN.md's account holds up under independent recomputation: color/lightness on this background reliably carries exactly one strong split (live vs. not-live: `bone`/`gold` sit 1.66–8.6:1 above `dim`; `dim`/`recede`/`faint` necessarily cluster within ~1.1:1 of each other because all three are real AA-passing text, verified true by the luminance-headroom math above). The doc is honest that dormant-vs-locked separation is weak by opacity alone (`bone@0.5` vs `bone@0.45` = 1.13:1, independently confirmed) and correctly does not lean on that channel alone: it identifies a real, source-verified redundant text-label channel (locked rows print `"locked · N/M fills of..."`; dormant cells print a real `"+0.00%"` zero-value with no such announcement — confirmed against `main.js:797` and `renderArmory()`) that separates the two states today, independent of color. It also correctly distinguishes VERIFIED-today claims from REQUIRED-not-shipped ones (the alloc-control lock-gating gap in `bots.js:116-122`/`main.js:296-309,325` is real and confirmed absent from source; the Grind struggling-vs-locked split at `main.js:841` is quoted verbatim and matches source exactly). This is the phase's most important job and it is handled with unusual rigor and honesty about its own limits.

## Requirement Fulfillment

### DW-3.1
PREMISE: `internal/DESIGN.md` exists with a token block present. (User-confirmation half handled outside this review.)
EVIDENCE: File exists; `### Corrected :root block (paste-ready for style.css)` section (lines 280–322) contains a complete, well-formed CSS custom-property block.
VERDICT: PASS

### DW-3.2
PREMISE: All text/background pairs pass WCAG AA on the DARK ramp (≥4.5:1 body, ≥3:1 large), verified by computed ratio. Light ramp waived (not a finding).
EVIDENCE: Every pair DESIGN.md itself lists was independently recomputed and passes (see method section above — `recede`/`faint`/`warn`/`alert`/`mythic` all clear 4.5:1 on both `--panel` and `--inset`; `faintest` correctly scoped to the non-text 3:1 floor only). However, `#logHead`'s hardcoded `#4e7a5e` on `--bg` computes to **3.97:1**, failing the 4.5:1 body-text floor, and is a real, always-rendered text element (the log header, `index.html:204`) that DESIGN.md's audit never examined — its own "all pairs... verified against every background they actually render on" claim is therefore not true of this pair.
VERDICT: FAIL

### DW-3.3
PREMISE: Interactive elements pass WCAG AA non-text (≥3:1 against adjacent color) — this includes the gold CTA and the `.locked` tab state.
EVIDENCE: `.locked` tab: original hardcoded `#45454d` on `--panel` independently recomputed at 1.94:1 (fail); the specified fix (repoint to `--faintest`) recomputes at 3.13:1 (pass, correctly scoped as a non-text/UI-component use under WCAG 1.4.11). Gold CTA: the one live gold CTA in the shipped game, `#descendBtn`, independently recomputes at 8.10:1 against `--panel` — clears the 3:1 floor with wide margin. (DESIGN.md's own evidentiary citation additionally and incorrectly leans on `#pullBtn`, which is dead code absent from the shipped markup — see the Major finding above — but this does not change the verdict for the actual live CTA.)
VERDICT: PASS

### DW-3.4
PREMISE: Semantic aliases resolved (background, surface, text, accent) and a type scale is defined covering every size currently in use in the shipped `style.css`.
EVIDENCE: Color tokens table resolves background (`--bg`), surface (`--panel`/`--inset`/`--field`/`--well`), text (`--gold`/`--bone`/`--dim`/`--recede`/`--faint`/`--faintest`), and accent (`--risk`/`--warn`/`--alert`/`--copper`/`--live`) roles explicitly. Grepped every `font-size:` declaration in `style.css`: all use `var(--fs-*)` tokens except one literal, `.modalClose { font-size: 22px; }` (line 572), which DESIGN.md explicitly names as a deliberate icon-scale exception, not a gap. Canvas type scale (battle.js `ctx.font` calls: 10/12/15/20/27/52px, plus 18/26px in `notifyEnhance`) matches DESIGN.md's separate canvas scale table exactly, value-for-value.
VERDICT: PASS

### DW-3.5
PREMISE: Canvas colors exist as named tokens readable from JS. The canvas cannot read CSS custom properties, so verify the artifact specifies a working MECHANISM, not just names.
EVIDENCE: DESIGN.md's `theme.js` module reads CSS custom properties once via `getComputedStyle(document.documentElement)` at `initBattle()` time (after canvas + stylesheet exist) and freezes the result — a real, working pattern for the canvas/CSS-custom-property gap (canvas 2D `fillStyle` genuinely cannot resolve `var(--x)`, confirmed). Verified `theme.js` does not yet exist (Glob: no match) and that only `main.js` imports `battle.js` (grepped for `import.*battle` across the repo) — consistent with the document's own "no code touched this phase" framing; the mechanism is specified, not fabricated-as-already-working.
VERDICT: PASS

### DW-3.6
PREMISE: Motion budget stated and contains no ritual/ceremony animation.
EVIDENCE: Motion budget table enumerates every CSS keyframe (`blink` 1.1s loop, `logIn` .3s, `flashOk` .7s, `flashFail` .45s — all confirmed present in `style.css`) and every canvas-driven effect (boss-flash, damage floater, screen shake, BREACHED reveal — all confirmed present in `battle.js`). The `prefers-reduced-motion` query (`style.css:152`) is confirmed to cover only `.cursor`/`.logline`, and DESIGN.md correctly flags the other six effects as an unchecked gap rather than hiding it. No effect gates input; enhance resolves synchronously (confirmed in `main.js`'s `enh.attempt`/`enhMilestones` call sites — feedback plays after an already-resolved outcome), satisfying the hard veto against ceremony.
VERDICT: PASS

**All requirements met:** NO (DW-3.2 fails)

## Notes (non-blocking)
- The monospace-footprint register question (Minor finding above) is worth a lightweight recheck once Phase 4/6 apply the token set broadly, but is not itself a violation this phase.
- `.modal { background: rgba(0,0,0,.72); }` is a literal black used as a translucent backdrop scrim, not a token or a text/surface color — outside the scope of the "no pure #000/#fff" tells check (which concerns surface/text tokens), not flagged.
- `#devPanel`'s border/text colors are gated behind the `?dev` URL flag (developer-only surface) and independently pass AA against its actual background regardless; lower priority than the two findings above.

## Issues (if FAIL)
1. `#logHead` (`style.css:133`) hardcodes `#4e7a5e`, which computes to 3.97:1 against its actual render background (`--bg`) — below the 4.5:1 WCAG 1.4.3 floor for real, always-visible body text, and entirely absent from DESIGN.md's contrast audit despite the document's explicit claim that every pair was checked against every background it renders on. — Critical / color / WCAG 1.4.3 / Add a token near `--dim`/`--recede`'s luminance and repoint the selector.
2. DW-3.3's gold-CTA evidentiary citation treats `#pullBtn` (confirmed dead code, absent from `index.html`/`main.js`) as a live interactive element requiring verification, the same class of error the document itself correctly avoids for `.ztable`. Does not flip the DW-3.3 verdict (the real CTA, `#descendBtn`, independently passes at 8.10:1), but is a factual-accuracy defect the review was explicitly asked to check for. — Major / design-dna / source-fidelity / Extend the dead-CSS callout and re-cite the gold-CTA evidence against `#descendBtn` alone.

**Verdict: FAIL — blocker: DW-3.2 (uncovered, failing `#logHead` text/background pair, 3.97:1 < 4.5:1).**
