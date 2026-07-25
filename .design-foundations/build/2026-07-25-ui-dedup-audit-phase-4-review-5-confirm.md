# Design Review: Phase 4 - UI De-dup Audit — Review 5 (Confirmation Pass)

Scope: a narrow, targeted verification of four specific corrections in
`internal/DESIGN.md` (composed-selector token fix, two omitted property
categories, the rescoped exhaustiveness claim, and stale-contradiction
sweep). All other document sections are explicitly out of scope per the
dispatch prompt and were not re-reviewed.

## Rendered Evidence (Step 0)
- Screenshot: none — this is a specification-document review, not a
  rendered UI surface. No `.html`/mock was supplied for this pass.
- Surface: `internal/DESIGN.md` (verified against `style.css` and
  `index.html` as source of truth), specifically the "Dimension tier"
  subsection (`Component specs` → `Token tiers`) spanning roughly lines
  682–908.

## Assessment B — Deterministic Detector
- Command: `node scripts/detect.mjs > .design-foundations/build/detect-phase4-review5.json`
  (no HTML artifact exists for this phase — nothing has been applied to
  shipped code yet, per DESIGN.md's own line 2: "nothing in this document
  is applied to shipped code yet").
- Exit: 3 — N/A (`"status": "na"`, `"naReason": "no html artifact supplied
  — nothing rendered yet (research/plan-only phase?)"`)
- Findings: N/A — no rendered artifact to scan.
- Opened only after Assessment A findings were frozen: YES (opened after
  freezing the findings below; confirmed exit 3/N/A, consistent with the
  no-artifact carve-out — not a skipped-detector FAIL).

## Triage
- Baseline: not applicable in the usual sense — this is a document
  confirmation review of four named corrections, not a rendered surface.
  No pillar doctrine beyond the one named in the dispatch prompt
  (`design-systems.md`, read in full) was loaded, per the review's own
  explicit narrow-scope instruction.
- Dispatched: none beyond the named doctrine — the task is a source-vs-spec
  fact check, not a cross-pillar critique of a rendered artifact.
- Not applicable: data-viz, content-design, journey, behavioral,
  deceptive-patterns, visual/AI-tells baseline — no rendered surface exists
  to apply them to.
- Deferred: none — scope was already restricted to four items by the
  dispatch prompt; nothing else was reviewed or deferred.

## Item-by-Item Verification (against source)

### Item 1 — Composed-selector token fix

**(a) Cascade analysis correctness.** Verified directly against source:
- `style.css:258`: `.barTrack { height: 8px; background: var(--field); margin-top: 4px; }`
- `style.css:308`: `.popTrack { margin: 6px 0 10px; }`
- `index.html:92`: `<div class="barTrack popTrack"><div class="barFill" id="popFill"></div></div>` — confirmed the ONLY instance of `.barTrack` in `index.html` (grepped project-wide; the class appears exactly once in `index.html` and exactly once in `style.css`).

Both selectors are single-class (specificity 0,0,1,0), so the tiebreak is
source order. `.popTrack` (line 308) is declared after `.barTrack` (line
258), and its `margin` shorthand sets `margin-top` implicitly, which wins
over the earlier explicit `margin-top: 4px` at equal specificity. The
document's cascade analysis is correct: `.barTrack`'s 4px never paints;
`.popTrack`'s 6px/0/10px does. Confirmed as **correct CSS**, not a
stylesheet bug.

**Minor citation slip found:** DESIGN.md:812 cites `.barTrack { margin-top: 4px }` as `style.css:257`. The actual line is `258` (line 257 is `.assignLine`). Doesn't affect the substance of the cascade analysis, but it is a real citation inaccuracy in a document whose entire round-3/4 discipline is "every hex/line traced to source, no hex left unexamined." Worth a one-line fix.

**(b) Tokens now defined from rendered values.** `internal/DESIGN.md:862-864`:
```
--meter-level-margin-top: var(--space-4);    /* .popTrack margin top — 6px */
--meter-level-margin-bottom: var(--space-6); /* .popTrack margin bottom — 10px */
/* .popTrack's horizontal margin is 0 — no token, no scale step applies. */
```
`margin: 6px 0 10px` is CSS 3-value shorthand: top=6px, left/right=0,
bottom=10px. This matches `--space-4`/`--space-6` exactly. Confirmed: the
document now derives its Level-meter margin tokens from the value that
actually renders (`.popTrack`), not the dead `.barTrack` value.

**(c) Scale resolution.** `internal/DESIGN.md:696-699` (primitive dimension scale):
```
--space-4: 6px;   /* (24×) row padding-vertical, common gaps */
--space-6: 10px;  /* (24×) arena padding-bottom, common component padding */
```
`--space-4` = 6px matches the verified margin-top; `--space-6` = 10px
matches the verified margin-bottom. Both resolve to real, already-declared
scale steps — not newly invented values for this fix.

**(d) Horizontal 0 handling.** `internal/DESIGN.md:864`: "`.popTrack`'s
horizontal margin is 0 — no token, no scale step applies." This is
consistent with how the document treats every other zero-valued dimension
elsewhere in the same sweep (`min-width: 0`, `max-width: 100%`, `0 auto`
margins — all "zero/relative, exempt" at line 791/784). Sensible, not a
special-cased dodge.

**Item 1 verdict: PASS**, with one cosmetic citation fix recommended (see Notes).

### Item 2 — Two previously-omitted property categories

Verified against source:
- `style.css:259`: `.barFill { height: 100%; background: var(--gold); width: 0; }`
- `style.css:300`: `.rowFill { height: 100%; background: var(--gold); width: 0; }`
- `style.css:299`: `.rowBar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: transparent; }`

`internal/DESIGN.md:821-825` states: "`width: 0` on `.rowFill`/`.barFill`
(a meter's zero-state origin, not a dimension needing a scale step), and
the `left`/`right`/`bottom: 0` inset properties on `.rowBar` (an
edge-anchoring property class the sweep had not enumerated at all;
zero-valued, so no scale step applies)."

The reasoning is sound, not a dodge: a scale step exists to give a
non-zero authored value a name; `0` requires no such name regardless of
which property carries it, and the document applies this same logic
consistently elsewhere (min-width:0, 0 auto margins, height:100% all
treated as "relative/zero, exempt"). This is not special-pleading invented
only for this instance.

**Caveat found:** the prose says these two omissions are "now resolved in
the table" (line 821), referring back to the round-3 property-enumeration
table (lines 779-796). But the table itself has no row for `.rowFill`/
`.barFill`'s `width: 0`, nor any row at all for `left`/`right`/`bottom`
(position/inset properties) — the table's `width` row only lists
`.allocMini input` 44px. The resolution actually lives in the prose
paragraph that follows the table, not inside the table. This is a wording
inaccuracy ("in the table" when it's really "in this document, just after
the table"), not a substantive gap — the categories are genuinely
accounted for and the reasoning holds. Flagged as Minor.

**Item 2 verdict: PASS**, with one wording inaccuracy noted (Minor, not blocking).

### Item 3 — Scoping of the exhaustiveness claim

Previous claim (per the dispatch prompt): total exhaustiveness of the
token sweep, falsified four times. Current wording,
`internal/DESIGN.md:798-809`:

> "Scope of this sweep — read this before trusting it as exhaustive. The
> table above walks every length-carrying property in every range this
> document cites, grouped by property rather than by an assumed value
> shape. That is what it proves, and no more. ... So this section claims
> coverage of the enumerated properties across the cited ranges, NOT that
> no untokenized length exists anywhere. Treat an untokenized value found
> later as expected, not as a contradiction."

This is correctly narrowed: it claims coverage of (a) enumerated
properties (b) within cited ranges — a specific, falsifiable, checkable
claim — and explicitly disclaims universal coverage ("NOT that no
untokenized length exists anywhere"). It does not overcorrect into
uselessness: it still asserts something concrete and useful (every
length-carrying property, in every cited range, was walked once per
property name), rather than degrading into "we tried our best, no
guarantees." The scoped claim is checkable — I independently spot-checked
several of the "third sweep" table rows against `style.css` (width,
height, margin-top, gap, border, border-radius) and found the enumerated
properties/ranges genuinely walked as claimed.

**Item 3 verdict: PASS.**

### Item 4 — No stale contradictions left behind

I checked every "exhaustive" claim in the document. Three surviving uses
of "exhaustive" (`internal/DESIGN.md:361`, `606`, `663`) all belong to the
**color hex audit**, a separate, already-passed, out-of-scope section per
the dispatch prompt — not re-reviewed, not counted here.

For the in-scope dimension/margin claim, I found **one real surviving
contradiction**:

`internal/DESIGN.md:785`, inside the round-3 property-enumeration table's
`margin-top` row (the one covering `.barTrack`/`.chipLbl`):

> "`.barTrack`'s 4px decomposes cleanly onto `--space-3` → **new**,
> `--meter-level-margin` (added above)."

This sentence, as written, still asserts — uncorrected, in place — that:
1. `.barTrack`'s `margin-top: 4px` is the value that decomposes onto the
   scale (it isn't — round 4 established the value never renders), and
2. the resulting token is a single `--meter-level-margin` at `--space-3`
   (it isn't — the actual, corrected component-tier block at lines
   862-863 defines two separate tokens, `--meter-level-margin-top` and
   `--meter-level-margin-bottom`, at `--space-4`/`--space-6`).

I grepped the whole document for `--meter-level-margin` (without a
`-top`/`-bottom` suffix): it appears at line 785 (this stale cell) and
line 811 (the "Composed-selector correction" heading, where it's
correctly used in past tense to describe the error being fixed). Line 785
is the only place where the bare, superseded token name and its false 4px
derivation are stated as a flat, unqualified fact rather than as history
being corrected.

The correction does exist elsewhere in the document (the "Composed-selector
correction (review round 4)" section at lines 811-819, and the "Sweep
result" recap at lines 899-901, which explicitly says "Round 4 then showed
`.barTrack`'s `margin-top` never renders at all... so the token was
re-derived"). But the table cell itself was never edited or annotated in
place — every other correction in this document (the 7 hex nudges, the
`recede`/`faint`/`faintest` reclassification, the exhaustiveness rewrite)
carries an inline marker ("was #6e6e78", "corrected per review round 3")
at the exact point of the original claim. This one cell does not, and a
reader who stops at the table (rather than continuing to the later prose)
would come away believing `--meter-level-margin` at `--space-3` is the
resolved, current token — which contradicts the actual `:root`/component
tier further down the same document.

**Item 4 verdict: FAIL** — a surviving sentence still asserts the
corrected-away claim, exactly the failure mode this item was checking for.

## Requirement Fulfillment

### DW-1 (composed-selector token fix)
PREMISE:  Verify the cascade analysis, that tokens are now defined from
rendered values, that they resolve to real scale steps, and that the
horizontal 0 is handled sensibly.
EVIDENCE: `style.css:258,308`, `index.html:92` confirm the cascade
exactly as described; `--meter-level-margin-top`/`-bottom` at
`internal/DESIGN.md:862-863` resolve to `--space-4`(6px)/`--space-6`(10px)
which match `.popTrack`'s real margin; horizontal 0 explicitly named and
exempted, consistent with the rest of the document.
VERDICT:  PASS (one cosmetic line-number citation slip noted, non-blocking)

### DW-2 (two omitted property categories)
PREMISE:  Verify the document now accounts for `width: 0` on
`.rowFill`/`.barFill` and the `left`/`right`/`bottom: 0` inset properties
on `.rowBar`, and that the zero-valued reasoning is sound, not a dodge.
EVIDENCE: `style.css:259,299,300` confirm both property sets exist as
described; `internal/DESIGN.md:821-825` states the zero-exempt reasoning,
consistent with identical treatment of other zero values elsewhere in the
document.
VERDICT:  PASS (the "now resolved in the table" phrasing is inaccurate —
the resolution is in prose after the table, not a table row — Minor,
non-blocking)

### DW-3 (scoping of the exhaustiveness claim)
PREMISE:  Verify the rewritten claim asserts only coverage of enumerated
properties across cited ranges, doesn't still imply total coverage, and
doesn't overcorrect into uselessness.
EVIDENCE: `internal/DESIGN.md:798-809` states the scoped claim explicitly
and distinguishes it from universal coverage; the claim remains specific
and checkable (verified several of its own table rows against `style.css`).
VERDICT:  PASS

### DW-4 (no stale contradictions left behind)
PREMISE:  Verify no surviving sentence still asserts `.barTrack`'s
margin-top decomposes onto the scale as a live value, and no earlier
"exhaustive" claim survives uncorrected.
EVIDENCE: `internal/DESIGN.md:785` still states, uncorrected in place,
that `.barTrack`'s 4px "decomposes cleanly onto `--space-3` → new,
`--meter-level-margin`" — both the value and the token name are
superseded by the round-4 fix at lines 862-863, and this specific cell
carries no inline correction marker unlike every other corrected claim in
the document. The "exhaustive" claims that do survive uncorrected
(lines 361/606/663) all belong to the out-of-scope color-hex audit, not
this item's target.
VERDICT:  FAIL

**All requirements met:** NO — DW-4 fails on a surviving, uncorrected
contradiction at `internal/DESIGN.md:785`.

## Notes (non-blocking)
- Citation slip: `internal/DESIGN.md:812` cites `style.css:257` for
  `.barTrack`'s `margin-top: 4px`; the correct line is `258`.
- Wording slip: `internal/DESIGN.md:821` says the `width:0`/inset-property
  omissions are "now resolved in the table" — they're resolved in the
  paragraph immediately after the table, not as table rows. Cosmetic.
- Out of scope, noted only: nothing outside the four named items was
  reviewed; no new issues surfaced elsewhere and none were sought.

## Issues (FAIL)
1. `internal/DESIGN.md:785` — the round-3 property-enumeration table's
   `margin-top` cell still asserts, without correction or annotation, that
   `.barTrack`'s `margin-top: 4px` "decomposes cleanly onto `--space-3`"
   into a token named `--meter-level-margin`. This is superseded by the
   round-4 fix two sections later (the value never renders; the real
   tokens are `--meter-level-margin-top`/`-bottom` at `--space-4`/
   `--space-6`, per lines 862-863). Severity: Major / Pillar: content
   accuracy (internal consistency) / Principle: a spec document's central
   claim (DW-4.1's token derivation) must not contradict itself across
   sections — the same standard this document holds its own hex-audit
   claims to. Fix: strike or annotate the line-785 cell in place, e.g.
   append "(superseded — see Composed-selector correction below: this 4px
   never renders; the live tokens are `--meter-level-margin-top`/
   `-bottom` at `--space-4`/`--space-6`)", matching the inline-correction
   convention used for every other fix in this document.

**Verdict: FAIL — blocker: `internal/DESIGN.md:785` still asserts the
corrected-away `.barTrack` margin-top/`--space-3`/`--meter-level-margin`
claim without in-place correction (DW-4).**
