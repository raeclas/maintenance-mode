# Discovery + Design: Phase 1 — Visual DNA v2 + Boss surface

Plan: `.design-foundations/plans/2026-07-26-visual-pass-and-help-tab.md`
Doctrine read: `design-dna`, `foundations`, `archetypes`, `fonts`, `color`,
`techniques`, `ai-tells`.

## Artifacts Found / Current State

| Artifact | State |
|---|---|
| `internal/DESIGN.md` | 1196 lines, **LOCKED** 2026-07-25. Phase 3 DNA/type/colour + Phase 4 component/dimension tiers. Contrast evidence passing. |
| `internal/JOURNEY.md` | 1119 lines. Boss page spec at §Page specs (6 content blocks, states, microcopy). Fact-ownership table per tab. |
| `internal/mocks/build.mjs` | One generator, six mocks, one shared `TOKENS` + `CSS` string. Asserts zero hex / zero rgb() / zero untokenized px / zero external refs outside `:root`. |
| `internal/mocks/shoot.mjs` | Zero-dep CDP capture at 375px + 1280px; exits non-zero on horizontal overflow at 375. |
| `internal/mocks/shots/boss-375.png` | The thing to beat. Read directly. |
| `internal/art/` | SDXL + pixel-art LoRA pipeline. **Not used** — see Design Decisions. |

**Read of `boss-375.png` (the honest diagnosis, confirmed first-hand):** every
container on the page is the same object — a rectangle, `--panel` fill, one
`--line` hairline, uniform padding. The resource bar, the tab row, the section,
the arena, the log and the two mock annotations are visually interchangeable.
`Maren` renders at `--fs-masthead` 20px, which is 1.5× the body size and *smaller
than the `92.4%` readout below it*, above a stub with more visual weight than the
identity it belongs to. There is no depth anywhere: no bevel, no elevation, no
material, no frame, no ornament, no display type. Gold is doing four unrelated
jobs at once (identity, hero number, an explanatory caption, a CTA), which is why
none of them reads as special.

## Gaps

1. **The DNA names an aesthetic the CSS never expresses.** DESIGN.md's archetype
   is Ruler + Sage. Per `archetypes.md` Part C, Ruler's *primary* families are
   **Art Deco / Luxury** and **Swiss**; Data-Dense Professional is a *stretch*.
   The shipped look is 100% Data-Dense Pro. Art Deco's own definition —
   "deep base + metallic accent · fine rules and frame ornaments · letterspaced
   caps · strict symmetry · generous vertical rhythm" — describes the intended
   product almost exactly, and *none* of it is implemented except the palette.
   The palette was already Art Deco; the composition never was. That is the whole
   gap, and it is why the last pass read as cleaner-not-different.
2. **No display tier.** The type scale tops out at 26px. There is no step at
   which a name can be a *title*.
3. **No material tier.** DESIGN.md's "Space, shape, depth" content is a spacing
   scale and a border width. Nothing states how a panel is *built*.
4. **No canvas spec.** JOURNEY names four things the canvas must convey; nothing
   says what it should look like. It is the hero element and the emptiest box.
5. **Boss has no rowlist**, so DW-1.5 (the ladder still reads apart) has no
   surface to prove itself on — see the Design Decisions for the resolution.

## Gate Status

- DESIGN.md present and LOCKED → this phase supersedes its DNA / type / material
  layers **explicitly and in writing**, per the plan's own instruction. Token
  names, semantic tiers, dimension scale, component inventory and state-ladder
  mechanics are carried forward unchanged. Nothing is silently overridden.
- JOURNEY.md present → structural contract. Block order, fact ownership and the
  Phase 5 copy strings are reproduced verbatim; **no copy is edited, moved or
  deleted this phase** (that is Phase 2's job).
- Prerequisites met. BUILD.

## DW Verification

| DW-ID | Done-When Item | Status | Evidence that will prove it |
|-------|---------------|--------|-----------------------------|
| DW-1.1 | Material language stated so a second surface is buildable without seeing Boss | COVERED | DESIGN.md v2 `## Material and depth (v2)`: four named elevations (ground/plate/well/leaf), the three-layer plate construction, the frame rules, the ornament rules — all written as component-independent rules, then *exercised* on rows, chips, tabs and buttons in the mock, not only on the hero. |
| DW-1.2 | Display-scale ramp above caption/body; Boss identity uses it | COVERED | Two new steps `--fs-colossal: 52px` and `--fs-warden: 36px` above the existing `--fs-hero: 26px`; `#bossName` bound to `--fs-warden`, the BREACHED peak to `--fs-colossal`. Visible on the render. |
| DW-1.3 | Every changed hex re-passes AA; no previously-fixed pair regresses | COVERED | `node internal/mocks/contrast.mjs` — parses the shipped `:root` out of `boss.html` and computes every text pair against every surface it can render on (4.5:1) plus the non-text pairs (3.0:1). Exits non-zero on any miss. The seven previously-fixed hexes are unchanged and re-checked in the same run. |
| DW-1.4 | Self-contained; no hard-coded hex / untokenized px; no 375px h-scroll | COVERED | `node internal/mocks/build.mjs` (existing assertions, exit non-zero) + `node internal/mocks/shoot.mjs` (scrollWidth gate at 375px) + `node .../scripts/detect.mjs`. |
| DW-1.5 | live / dormant / locked still read apart on the rendered mock | COVERED | Boss carries no rowlist, so the ladder is rendered as a labelled **specimen strip** inside a `.mockNote` (mock annotation, the file's existing device — never product copy) with all four real states under the v2 material. Proves the new bevel/edge language did not eat a channel; also gives Phase 3 its reference. |
| DW-1.6 | Materially different, judged side-by-side, not asserted | COVERED | `shots/boss-375-before.png` preserved before regeneration; new `shots/boss-375.png` read back and compared directly. |

**All items COVERED:** YES (6 DW-IDs in, 6 out).

## Design Decisions

**No fresh diverge/critique/converge round.** `design-dna.md`'s five-candidate
pipeline assumes a design that does not exist. The plan's *Rejected approaches*
rules out re-running DNA generation: the register, the archetype and the palette
are twice-approved and are not the problem. What follows is a **remix** under
`design-dna.md` §Remix Rules, applied to the existing base.

**The remix.** Base family stays **Data-Dense Professional** — the content is
dense stat rows and it wins the content-pressure vote (`archetypes.md` Part C:
"dense tables/numbers → Data-Dense Pro"). It borrows **two axes from Art Deco /
Luxury** (Ruler's own primary family, so this is inside the archetype, not a
stretch):

- **Composition** — frame construction, fine rules, ornament, strict symmetry at
  the identity block against flush-left everywhere else.
- **Type voice** — a real display tier, letterspaced small-caps, generous
  vertical rhythm.

Colour strategy does **not** borrow (remix rule 4: colour + composition must not
both move, or the base unmoors). It stays exactly the locked palette. Dominant
axis: **composition** — that is where the tension lives and where the user's
"I expected more of a visual difference" actually points.

**Grounding (the collision).** *An Art Deco elevator-car door's brass inlay and
corner plates* + *a 2000s MMO raid client's boss frame*. Both are metal edges
around a thing you are watching; one has ornament discipline the other never had.
The direction that satisfies both is a frame that is precise, symmetrical and
complete — which is also the exact answer to the no-decay veto, because a
complete frame cannot read as a broken one.

**Signature move — the Warden's frame.** Exactly one bracketed gold frame per
surface, around the one thing the surface is about. Four gold corner brackets on
a hairline frame. The "one per surface" rule is what makes it a signature instead
of a texture: on Boss it goes around the Warden; on a list surface it goes around
nothing until that surface has a hero.

> **Revised during production.** The frame was first designed with its top rule
> broken for a letterspaced small-caps label set into the gap. Dropped: *any*
> label is a new string, and this phase is explicitly forbidden from writing copy
> (that is Phase 2's job). The brackets alone carry the move, need no words, and
> the revision removed a halo-masking hack at the same time.

**Six specific moves** (this is where the richness comes from):

1. **Panel material.** A `.plate` is three layers, not one rect: a vertical
   `--panel` → `--plate-foot` gradient (lighter at the top, so light comes from
   above and *no text ever sits on a lighter background than the verified
   `--panel`* — the AA-safe direction), a 1px warm `--edge-lit` inset top, a 1px
   cool `--edge-shade` inset bottom, and the `--line` outer hairline. A `.well`
   is the same construction inverted (shade on top, lit at the foot) — recessed.
2. **Frames.** Gold corner brackets, drawn in CSS from two `::before`/`::after`
   boxes with two borders each. Always four, always symmetric, always complete.
3. **Ornament.** A hairline rule with a centred gold lozenge — a rotated square,
   pure CSS, no glyph and no image. Replaces the naked `h3` top border.
4. **Display type.** `--fs-warden: 36px` for the Warden's name; `--fs-colossal:
   52px` for BREACHED — deliberately the same 52px the canvas already draws its
   BREACHED reveal at, so DOM and canvas finally agree on where the peak is.
5. **Gold discipline.** Gold becomes identity-only: the Warden's name, the one
   hero number, the CTA, the frame, the ornament, the active edge. `#projection`
   (a *caption*) loses gold and goes to `--bone`. Gold used less reads as gold
   used more.
6. **~~Roman door numerals~~ — designed, then cut.** A large gold `II` beside the
   name was the sixth move. Cut during production: JOURNEY already places the
   wall number in the wall selector (`W2 Maren · fighting`) and in the title
   ("Second Door"), so a third render would be exactly the kind of duplicate the
   previous plan spent six phases removing. The rhythm and spacing work
   (`--space-9`/`--space-10`) does the job it was there for.

**The canvas spec** (the phase's edge case — the arena stays a labelled
placeholder in the mock, but the DNA must say what it draws). Specified in full
in DESIGN.md v2 `## Canvas scene spec`: the arena draws **a door, not a stage**.
The depletion meter becomes the door's own vertical seam of light, the Warden is
a silhouette standing in front of it with the fracture lines drawn as *light
coming through* rather than chips taken out, and the player is a small silhouette
at the lower-left — the scale difference is the story. Light-through rather than
material-removed is the specific technique that keeps damage from reading as
decay.

**Art pipeline: not used.** `internal/art/` is permitted but nothing here needs a
raster. Every mark is CSS geometry or a letterform. Reaching for SDXL for a
corner bracket would be the expensive path to a worse, non-tokenizable result.

**Tools reused rather than rebuilt** (ponytail): `build.mjs` emits and asserts;
`shoot.mjs` captures and gates overflow; `detect.mjs` scans for tells. One new
25-line script, `contrast.mjs`, because DESIGN.md already established that
`palette.mjs` has no CLI path for checking two arbitrary existing hexes — and it
parses the *shipped* `:root` rather than keeping a second copy of the hexes.

**Scope containment.** The v2 tokens and CSS are appended **only to the Boss
page**, inside the same `:root` block, via `page({ v2: true })`. The other five
mocks emit byte-identical to before. Phase 3 promotes `CSS_V2` into the shared
`CSS` and deletes the split — marked with a `ponytail:` comment at the seam.

**Held vetoes, checked against this design:** no sound; no ceremony (the motion
budget is untouched — this phase adds zero animation); no generated icons (zero
raster assets, zero icon font, zero `<svg>`); no obligation mechanics; **no
decay** — no glitch, no corruption, no distress, no broken or asymmetric frame,
no scanline/CRT texture (considered and rejected: a scanline reads as a failing
monitor, which is the thing this game must never look like); dark ramp only.

## Recommendation

**BUILD.**

---

## Review response (round 2) — the Major on DW-1.6

The review's Major was correct and reproducible: the frame, ornament and display
type were visible; **the material system was not.** The cause was measurable, not
a matter of taste.

**Root cause.** I tuned the material to be subtle and it crossed into
imperceptible. `--edge-lit` sat 10.8 L\* over `--panel` at 1px, and — the real
problem — **the whole surface stack was compressed into ~3 L\***. `--bg` →
`--panel` measured **3.09 L\***, under the perceptual floor for a surface step.
No bevel can make a panel read as raised when the page and the panel are the same
colour. `--inset` was additionally *lighter* than `--panel` while being named
"recessed".

I had also been reading the wrong instrument. On a dark ramp the WCAG `+0.05`
flare term crushes every dark-on-dark ratio toward 1.0, so `1.04:1` looked
"fine" when it meant "invisible". **Surface separation is an L\* question; only
text is a ratio question.** `contrast.mjs` now prints both.

**Fixes, in order of how much they bought:**

1. **Respread the surface ramp** (`solve.mjs`, scratch): solved each ground's
   ceiling from its worst text token, then spread across the whole legal range.
   `bg→panel` **3.09 → 5.17 L\***; `edge-lit→panel` **10.8 → 18.6 L\***. Physical
   model fixed too: `well < bg < plate-foot < panel < field`.
2. **Lip to 2px** (`--space-1`). A 1px line at 10 L\* is a rumour.
3. **A rowlist is a well** — the rule that makes the language work without a
   hero. A list surface now gets three elevations from one component: plate,
   well cut into it, flat leaf rows, raised controls above.
4. **Deleted `.arena`** — once the canvas region became the well, the wrapper had
   no styling left and was purely a nested box (`detect.mjs` flagged it again).
   Deletion, not an override.
5. **Minor closed:** `.frame`'s duplicate 9th gradient layer removed.

**Evidence, on pixels rather than CSS.** Grind is the honest test — no hero, no
frame, no display type — so `boss.html` now renders **Grind's real 15-row
section** (the same shared `zonesSection` constant `grind.html` uses, not a
lookalike) as a labelled specimen, cropped at native resolution and compared
against the same section at `HEAD`. Plate lip, the well under the rowlist, and
visibly raised alloc controls all read.

**Cost:** the ramp respread lives in the shared `TOKENS`, so all six mocks
changed colour. That is deliberate — it is a correction to locked tokens and the
root cause; scoping it to one page would have been the symptom fix and would have
handed Phase 3 five surfaces built on a ramp already known to be too flat.
`CSS_V2` remains Boss-only.

**Constraints re-held:** 48/48 gated contrast pairs pass (every previously-fixed
pair moved 0.05–0.10 and none crossed its floor); `detect.mjs` 0 findings on all
six; no horizontal scroll at 375px; no copy, structure or fact ownership touched;
no animation added; no raster, no icon; `--edge-shade` is a tinted blue-black,
never `#000`; nothing distressed, chipped or asymmetric.
