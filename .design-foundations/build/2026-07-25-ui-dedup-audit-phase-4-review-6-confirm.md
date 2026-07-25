# Design Review: Phase 4 - UI De-dup Audit — Review 6 (Confirmation Pass)

Scope: a narrow, targeted re-verification of four specific corrections in
`internal/DESIGN.md` (composed-selector token fix, two omitted property
categories, the rescoped exhaustiveness claim, and the stale-contradiction
sweep). This is a re-run of a confirmation pass that FAILED as Review 5 on
item 4. All other document sections are out of scope per the dispatch
prompt and were not re-reviewed.

## Rendered Evidence (Step 0)
- Screenshot: none — this is a specification-document review, not a
  rendered UI surface. `internal/DESIGN.md` itself states (line 2) that
  "nothing in this document is applied to shipped code yet," so there is no
  new rendered artifact for this phase to screenshot.
- Surface: `internal/DESIGN.md`, verified against `style.css` and
  `index.html`/`main.js` as source of truth, specifically the "Dimension
  tier" subsection (`Component specs` → `Token tiers`, roughly lines
  682–908) plus a full-document grep for the superseded token name and the
  word "exhaustive."

## Assessment B — Deterministic Detector
- Command: `node <plugin-cache>/design-for-ai/4.2.0/scripts/detect.mjs > .design-foundations/build/detect-phase4-review6.json`
  (no `.html`/mock artifact exists for this phase — `style.css`/`index.html`
  are pre-existing shipped files, not new output of this phase, and
  DESIGN.md itself is prose, not a rendered surface detect.mjs can scan).
- Exit: 3 — N/A (`"status": "na"`, `"naReason": "no html artifact supplied —
  nothing rendered yet (research/plan-only phase?)"`)
- Findings: N/A — no rendered artifact to scan.
- Opened only after Assessment A findings were frozen: YES.

## Triage
- Baseline: not applicable in the usual sense — this is a document
  confirmation review of four named corrections, not a rendered surface.
  No pillar doctrine beyond the one named in the dispatch prompt
  (`design-systems.md`, read in full) was loaded.
- Dispatched: none beyond the named doctrine — the task is a source-vs-spec
  fact check, not a cross-pillar critique of a rendered artifact.
- Not applicable: data-viz, content-design, journey, behavioral,
  deceptive-patterns, visual/AI-tells baseline — no rendered surface exists.
- Deferred: none — scope was already restricted to four items by the
  dispatch prompt.

## Item-by-Item Verification (against source)

### Item 1 — Composed-selector token fix

**(a) Cascade analysis correctness.** Verified against source:
- `style.css:258`: `.barTrack { height: 8px; background: var(--field); margin-top: 4px; }`
- `style.css:308`: `.popTrack { margin: 6px 0 10px; }`
- `index.html:92`: `<div class="barTrack popTrack"><div class="barFill" id="popFill"></div></div>` — confirmed the only instance of `.barTrack` in `index.html` (grepped; zero other matches).

Both selectors are single-class (specificity 0,0,1,0); `.popTrack` (line
308) is declared after `.barTrack` (line 258), and its `margin` shorthand
sets all four longhand sides, which wins over the earlier explicit
`margin-top: 4px` at equal specificity, per source order. `.barTrack`'s 4px
never paints; `.popTrack`'s 6px/0/10px does. Document's cascade analysis
(`internal/DESIGN.md:811-819`) matches source exactly.

**Citation fix confirmed applied.** Review 5 flagged `internal/DESIGN.md:812`
for citing `style.css:257` (off by one) for `.barTrack`'s rule. Current text
at line 812 now reads: `` `.barTrack { margin-top: 4px }` (`style.css:258`) ``
— the correct line. Fixed since Review 5.

**(b) Tokens now defined from rendered values.** `internal/DESIGN.md:862-864`:
```
--meter-level-margin-top: var(--space-4);    /* .popTrack margin top — 6px */
--meter-level-margin-bottom: var(--space-6); /* .popTrack margin bottom — 10px */
/* .popTrack's horizontal margin is 0 — no token, no scale step applies. */
```
`margin: 6px 0 10px` is CSS 3-value shorthand (top / left+right / bottom):
top=6px, sides=0, bottom=10px. Matches exactly. The Level-meter margin
tokens are derived from `.popTrack` (the value that renders), not the dead
`.barTrack` value.

**(c) Scale resolution.** `internal/DESIGN.md:696-699`:
```
--space-4: 6px;   /* (24×) row padding-vertical, common gaps */
--space-6: 10px;  /* (24×) arena padding-bottom, common component padding */
```
`--space-4` = 6px matches the verified margin-top; `--space-6` = 10px
matches the verified margin-bottom. Both are real, pre-existing scale
steps, not invented for this fix.

**(d) Horizontal 0 handling.** `internal/DESIGN.md:864` names the
horizontal 0 explicitly and states no token/scale step applies — consistent
with how the document treats every other zero-valued dimension elsewhere
(`min-width: 0`, `0 auto` margins, etc., line 784/791). Not a special-cased
dodge.

**Item 1 verdict: PASS.**

### Item 2 — Two previously-omitted property categories

Verified against source:
- `style.css:259`: `.barFill { height: 100%; background: var(--gold); width: 0; }`
- `style.css:300`: `.rowFill { height: 100%; background: var(--gold); width: 0; }`
- `style.css:299`: `.rowBar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: transparent; }`
- `main.js:324,350` confirm `.rowBar`/`.rowFill` are live, rendered markup
  (Training tiers and Grind zones), not dead CSS.

`internal/DESIGN.md:821-825` states: "Two further omissions from the same
round, resolved here: `width: 0` on `.rowFill`/`.barFill` (a meter's
zero-state origin, not a dimension needing a scale step), and the
`left`/`right`/`bottom: 0` inset properties on `.rowBar` (an edge-anchoring
property class the sweep had not enumerated at all; zero-valued, so no
scale step applies)."

Reasoning is sound: a scale step exists to name a non-zero authored value;
`0` needs no name regardless of which property carries it, and this is
applied consistently elsewhere in the same document (min-width:0, 0-auto
margins, height:100% all "zero/relative, exempt"). Not a dodge invented
only for this instance.

**Wording fix confirmed applied.** Review 5 flagged `internal/DESIGN.md:821`
for claiming the omissions were "now resolved in the table" when the
resolution actually lived in prose after the table, not as a table row.
Current text at line 821 now reads "resolved here" (not "in the table") —
accurately describing where the resolution lives. Fixed since Review 5.

**Item 2 verdict: PASS.**

### Item 3 — Scoping of the exhaustiveness claim

Current wording, `internal/DESIGN.md:798-809`:

> "Scope of this sweep — read this before trusting it as exhaustive. The
> table above walks every length-carrying property in every range this
> document cites, grouped by property rather than by an assumed value
> shape. That is what it proves, and no more. ... So this section claims
> coverage of the enumerated properties across the cited ranges, NOT that
> no untokenized length exists anywhere. Treat an untokenized value found
> later as expected, not as a contradiction."

Correctly narrowed: claims coverage of (a) enumerated properties (b) within
cited ranges — specific and checkable — and explicitly disclaims universal
coverage. Does not overcorrect into uselessness: it still asserts something
concrete (every length-carrying property, every cited range, walked once
per property name). Spot-checked several rows of the property-enumeration
table (width, height, margin-top, gap, border, border-radius) against
`style.css` and found the enumerated properties/ranges genuinely walked as
claimed.

**Item 3 verdict: PASS.**

### Item 4 — No stale contradictions left behind (the item that failed Review 5)

Grepped the whole document for the bare token name `--meter-level-margin`
(no `-top`/`-bottom` suffix) and for every occurrence of `.barTrack`/`4px`.
Two occurrences of the bare name survive:

1. **`internal/DESIGN.md:785`** (the round-3 property-enumeration table's
   `margin-top` row) — **this is the exact cell Review 5 failed on.**
   Current text:
   > "~~`.barTrack`'s 4px decomposes cleanly onto `--space-3` → **new**,
   > `--meter-level-margin`~~ — **SUPERSEDED by round 4:** that 4px never
   > renders. `.barTrack`'s only instance is `<div class="barTrack
   > popTrack">` (`index.html:92`) and `.popTrack`'s `margin: 6px 0 10px`
   > (`style.css:308`) wins the cascade, so the tokens are derived from the
   > rendered values instead: `--meter-level-margin-top` (`--space-4`) and
   > `--meter-level-margin-bottom` (`--space-6`). See the composed-selector
   > correction below."

   The stale claim is now struck through (markdown `~~...~~`) and
   immediately followed by an inline "SUPERSEDED by round 4" annotation with
   the corrected value and the corrected (plural) token names — the exact
   inline-correction convention Review 5 asked for, matching how every
   other corrected value in this document (the 7 hex nudges, the
   `recede`/`faint`/`faintest` reclassification) is marked. **Confirmed
   fixed.**

2. **`internal/DESIGN.md:811`** ("Composed-selector correction (review
   round 4)" heading) — uses the bare name only in past tense, to name what
   was wrong: "`--meter-level-margin` was derived from `.barTrack {
   margin-top: 4px }`... but `.barTrack` never renders alone." This is the
   correction itself, not a surviving assertion. Compliant.

No other location in the document uses the bare `--meter-level-margin`
name. The `:root`/component-tier block (lines 862-863) and the "Level"
meter table row (line 999) both use only the corrected plural names or omit
margin entirely.

**Checked the narrative "Sweep result" recap** (`internal/DESIGN.md:895-902`,
same paragraph flagged as borderline last round): "That found the two
`margin-top`s: `.barTrack`'s decomposes onto the existing scale,
`.chipLbl`'s does not... (Round 4 then showed `.barTrack`'s `margin-top`
never renders at all — `.popTrack` overrides it by cascade — so the token
was re-derived from the values that actually paint; see the
composed-selector correction above.)" This narrates round-3's own (now
superseded) conclusion and immediately corrects it in the same sentence
group via the parenthetical — a visible pointer to the correction, not a
standalone unqualified claim. Consistent with the rest of the document's
convention of narrating what a prior round believed before correcting it.

**Checked the "Meter / progress bar" component table** (line 999, the
`Level` species row) for any residual margin claim: it names only
`.barTrack`/`.barFill`, `.popTrack` override for Track/Fill, cites
`style.css:258-259, 309`, and makes no claim about margin values at all —
no contradiction.

**Checked all surviving "exhaustive" claims:** three uses at
`internal/DESIGN.md:361, 606, 663` all belong to the color hex audit (a
separate, out-of-scope, previously-passed section per the dispatch prompt)
— not the dimension/margin sweep this item targets, and not re-litigated
here.

**Item 4 verdict: PASS.** The single surviving stale cell that failed
Review 5 (`internal/DESIGN.md:785`) now carries an in-place strikethrough
plus a "SUPERSEDED by round 4" pointer to the correct values and token
names. No other surviving sentence, table cell, or summary line asserts the
corrected-away claim or names the superseded singular token as current.

## Requirement Fulfillment

### DW-1 (composed-selector token fix)
PREMISE:  Verify the cascade analysis, that tokens are now defined from
rendered values, that they resolve to real scale steps, and that the
horizontal 0 is handled sensibly.
EVIDENCE: `style.css:258,308`, `index.html:92` confirm the cascade exactly
as described; `--meter-level-margin-top`/`-bottom`
(`internal/DESIGN.md:862-863`) resolve to `--space-4`(6px)/`--space-6`(10px),
matching `.popTrack`'s real margin; horizontal 0 explicitly named and
exempted; the prior citation slip (`style.css:257`→`258`) is fixed.
VERDICT:  PASS

### DW-2 (two omitted property categories)
PREMISE:  Verify the document now accounts for `width: 0` on
`.rowFill`/`.barFill` and the `left`/`right`/`bottom: 0` inset properties on
`.rowBar`, and that the zero-valued reasoning is sound, not a dodge.
EVIDENCE: `style.css:259,299,300` confirm both property sets exist as
described; `internal/DESIGN.md:821-825` states the zero-exempt reasoning,
consistent with identical treatment elsewhere; the prior "now resolved in
the table" mis-statement is fixed to "resolved here."
VERDICT:  PASS

### DW-3 (scoping of the exhaustiveness claim)
PREMISE:  Verify the rewritten claim asserts only coverage of enumerated
properties across cited ranges, doesn't still imply total coverage, and
doesn't overcorrect into uselessness.
EVIDENCE: `internal/DESIGN.md:798-809` states the scoped claim explicitly
and distinguishes it from universal coverage; spot-checked several of its
own table rows against `style.css` and confirmed the claim holds.
VERDICT:  PASS

### DW-4 (no stale contradictions left behind)
PREMISE:  Verify no surviving sentence, table cell, or summary line still
asserts `.barTrack`'s margin-top decomposes onto the scale as a live
rendered value, or still names `--meter-level-margin` (singular) as
current.
EVIDENCE: `internal/DESIGN.md:785` (the cell that failed Review 5) now
carries a strikethrough + "SUPERSEDED by round 4" inline correction with
the right values and token names; the only other bare-name occurrence
(line 811) is correction-framing, past tense; the "Sweep result" recap
(895-902) corrects inline via parenthetical; no other location asserts the
stale claim.
VERDICT:  PASS

**All requirements met:** YES

## Notes (non-blocking)
- Out of scope, noted only: nothing outside the four named items was
  reviewed; no new issues surfaced elsewhere and none were sought.

**Verdict: PASS — all four items confirmed correct against source; the
Review 5 blocker at `internal/DESIGN.md:785` is fixed with an in-place
strikethrough + superseded-pointer, matching this document's own
inline-correction convention used everywhere else.**
