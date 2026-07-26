# Discovery + Design: Visual DNA v3 — MapleStory construction on the dark ramp

**Date:** 2026-07-26 · **Mode:** full · **Surface:** `internal/mocks/boss.html`
(+ its embedded Grind rowlist specimen)

## Artifacts Found / Current State

| Artifact | State |
|---|---|
| `internal/DESIGN.md` | v1 (LOCKED, Phase 3/4) + `## Visual DNA v2` (Art Deco reading, proposed, **rejected by the user**) |
| `internal/JOURNEY.md` | fixed — fact ownership, block order, per-row state, copy strings. Not touched this pass |
| `internal/mocks/build.mjs` | generator for all six mocks. `TOKENS` + `CSS` shared; `TOKENS_V2` + `CSS_V2` injected on the Boss mock only, behind a `v2` flag on `page()` |
| `internal/mocks/boss.html` | the rejected render. Georgia small-caps chrome, thin gold rules, corner brackets, `no radius` |
| `internal/mocks/shots/boss-375.png` | the rejected state — **read before any work**, and preserved as `boss-375-deco.png` / `boss-1280-deco.png` before regeneration so the before/after survives |
| `internal/mocks/contrast.mjs` | 48/48 gated pairs PASS at baseline |
| `detect.mjs` (plugin) | 0 findings at baseline |

**What the rejected render actually looks like** (read off `boss-375.png`, not
assumed): every container is a flat rectangle with a 1px hairline; the only
depth cue is a 2px lit lip that reads as a hairline at phone scale; the boss
name is Georgia small-caps in gold inside four thin gold corner brackets; every
heading is letterspaced serif small-caps; nothing has a radius; nothing has a
title; nothing looks like an object you could pick up. It reads as a tidy,
slightly ceremonial dark dashboard — which is exactly the user's complaint.

## Gaps

1. **No window language at all.** The v2 "plate / well / leaf" model is a
   *lighting* model (a lip, a gradient, a foot). MapleStory's is a *carpentry*
   model (a thick frame with an outer bevel, a title bar, sockets cut into the
   body). v2 has no frame, no title bar, no socket, no radius, and no pressable
   control — four of the five things the direction asks for.
2. **The chrome type is the loudest wrong note.** Georgia small-caps is
   bookish by construction. It is set on `body`, `#tabs button`, `#descendBtn`,
   `.cta`, `h3` (via `font-variant:small-caps`) and `.ledger .hd` — i.e. every
   piece of furniture on the page.
3. **The archetype label is now doing damage, not work.** Ruler → Art Deco was
   a correct derivation from the wrong archetype; defending it would force the
   new direction through a label that produced the rejected look.
4. **The ornament vocabulary (gold lozenge, corner brackets, fading hairlines)
   has no home in a Maple register** and must be superseded rather than
   restyled.

## Gate Status

- **DESIGN.md present.** v1 is LOCKED and stays law: **not one colour token
  moves this pass** — the ramp, the text tiers, the functional accents, the
  rarity ramp, the opacity tokens, the type-scale values, the dimension scale
  and the component tier all carry forward. v2's DNA / material / type
  sections were *proposed*, never locked, and are the only thing superseded.
  No scope conflict → no UPDATE_PLAN.
- **JOURNEY.md present.** No copy, fact owner or block position changes.
- **Prerequisites met.** The generator, the contrast gate, the detector and the
  capture script all exist and pass at baseline.

## DW Verification

| DW-ID | Done-When Item | Status | Evidence |
|---|---|---|---|
| DW-A | Reads as an early-2000s MMO client, not a tidy dark dashboard | COVERED | Render at 375px vs the preserved `boss-375-deco.png`. The four construction changes (framed windows, title bars, sockets, glossy buttons) are visible at phone scale by design — 3px frames and 8px radii, not 1px lips |
| DW-B | Chrome no longer bookish; serif small-caps voice gone from furniture | COVERED | Zero `Georgia` / `font-variant:small-caps` declarations reach the Boss render — grep the emitted `boss.html`, and read the render |
| DW-C | Panels read as windows, wells as cut in, buttons as pressable | COVERED | Render at 375px. Frame + outer foot on `section.game`; blurred inner shadow + lit far wall on every socket; bevelled gradient + hard foot on every control, with the active/pressed construction actually drawn (active tab, active wall button) |
| DW-D | The Grind specimen looks designed under the new language | COVERED | Same shared `zonesSection` constant `grind.html` renders, in the Boss mock's specimen block; read on the render at native resolution |
| DW-E | contrast 48/48+, detect 0, build assertions, no 375px overflow | COVERED | `node internal/mocks/contrast.mjs` (exit 0), `node scripts/detect.mjs boss.html`, `node internal/mocks/build.mjs` (self-asserting), `node internal/mocks/shoot.mjs` (exits non-zero on overflow) |
| DW-F | State ladder still reads apart on the render | COVERED | The specimen renders live / dormant / struggling / locked side by side; verified on pixels, and the ladder gains a *sixth* channel (a locked row is visibly unlit — no socket sheen, no left edge) without losing one |

**All items COVERED:** YES · 6 DW-IDs in, 6 out.

## Design Decisions

### 1. The archetype is re-derived, not defended (`archetypes.md`)

v2 argued: archetype is Ruler + Sage → Ruler's primary families are Art Deco
and Swiss → implement Art Deco. The derivation was sound; the **premise** was
wrong. Ruler's core desire is *control and prestige* and its visual gravity is
*formal symmetry, serifs, luxury restraint* — that is a description of a bank,
not of a game client whose entire premise is that the room is empty and the
lights are still on.

The honest reading of this product's relationship with its audience
(`archetypes.md`, "the archetype belongs to the product's relationship with its
audience"): the client is the last friendly, familiar, still-maintained thing
in a dead world. That is **Everyman** — core desire *belonging*, voice
*friendly, unpretentious*, gravity *approachable, familiar layouts*. The
melancholy is not in the chrome; it comes from the fact that a warm, welcoming,
perfectly-working client has one player. A cold, formal chrome makes the game
*about* austerity; a friendly one makes it about absence. **Sage carries
forward unchanged** — the honest, fully-displayed numbers (project guideline 5)
are Sage's contribution and nothing about them changes.

**Archetype (v3): Everyman + Sage.** Everyman's primary families are Warm
Editorial and Playful Geometric; Playful Geometric is the one whose documented
position — *"chunky grotesque, mixed radius, geometric shapes as decoration
with purpose, sticker/badge elements"* — is the legal home of MapleStory's
construction. Warm Editorial is rejected on content pressure (dense
tables/numbers push away from editorial families).

### 2. The remix (`design-dna.md` §Remix Rules)

```
BASE       Data-Dense Professional   (content pressure: dense tables/numbers — unchanged from v1/v2)
BORROWS    Composition/material      from Playful Geometric (Everyman's own primary)
KEEPS      Colour strategy + Motion  from the base — unchanged, not renegotiated
DOMINANT   Composition — the window/socket/control language IS the identity
```

Remix rule 2 (borrow one or two axes) and rule 4 (colour and composition rarely
both borrow) are both honoured, and for the same reason v2 gave: the palette
was never the problem, and moving colour and composition together would unmoor
the base. Rule 3 (one axis dominates) — composition, again; what changed is
*which* family it borrows from, which is the whole of this pass.

### 3. Grounding — the collision (two references, `design-dna.md` §Ground)

> **MapleStory's window carpentry** (thick bevelled frames, title bars, sunken
> item sockets, glossy pressable buttons) **+ a Bloomberg terminal's tabular
> density** (fifteen rows of live numbers, tabular figures, no decoration
> inside the data).

Neither reference is drawn from the tells catalogue, so the collision does not
triangulate back to the centre. What satisfies both is a *toy-chunky window
frame around a dead-serious stat table* — a shape that does not exist as a
cluster: 2026 web UI has no title bars, and MapleStory has no Bloomberg tables.
That collision is also the game itself (satire shell, sincere numbers inside).

### 4. Type — the change the user actually asked for (`chapter-03-typography.md`)

**Georgia leaves the chrome entirely.** Not softened, not reduced — removed, so
DW-B is a grep, not an opinion.

Replacement: **Tahoma, "Segoe UI", Verdana, sans-serif** (a system stack — no
external font, per the constraint). This is a medium-form choice, not a taste
one, and it is the same argument `chapter-03-typography.md` uses to prefer
Georgia over Garamond, pointed at a different medium: Tahoma is Matthew
Carter's screen face for small sizes — narrow, large x-height, heavily hinted,
designed to stay legible and *even in texture* at 10–13px on a pixel grid,
which is precisely the size band this UI lives in. It is also, historically,
the face early-2000s Windows game clients actually shipped their chrome in. It
is not on `ai-tells.md`'s overused-font list (Arial and Helvetica are; Tahoma
and Verdana are not), so the choice is legible as a decision rather than a
default.

**The boss's name does not get a second face.** Considered and rejected: a
display face for the Warden would re-import exactly the bookish register the
user objected to, and MapleStory's own hierarchy is built from *size, weight
and shadow depth on one face*, never from a face swap. `--fs-warden` (36px)
and `--fs-colossal` (52px) survive unchanged as the display tier; the identity
reads because it is 3× the body size, bold, tracked, and carries a heavier hard
shadow than anything else on the page. Step-skipping for dominance
(`techniques.md` Ch 7) still does the work — it just no longer needs a serif.

**The hard 1px drop shadow** is the second half of the voice: `0 1px 0
--edge-shade` on chrome (title bars, control labels, tabs, the name, hero
numbers, chip values). Deliberately **not** applied to dense body or stat rows
— at 11px mono a shadow under every glyph fills the counters and destroys the
even texture the same chapter's squint test is about. Chrome is shadowed;
data is clean. That split is also the register split doing visible work.

**Monospace stays for data.** It is the project's own second register
(`REMAKE-DESIGN.md` §16 — the botter's-toolkit voice), it carries the tabular
figures the content needs, and it is not what the user meant by "script": the
complaint names the serif chrome, which is the part being removed.

### 5. Material — four constructions replace v2's three elevations

v2's model was *lighting* (a lip, a gradient, a foot). v3's is *carpentry*.
Stated as constructions so a surface nobody has drawn yet can be built:

| Construction | What it is | How it is built |
|---|---|---|
| **WINDOW** | a panel is an object with edges | 3px `--line` frame, `--radius-window`, `--panel`→`--plate-foot` body, inner 1px `--edge-lit` at top-left + 1px `--edge-shade` at bottom-right (the outer bevel), and a hard `--edge-shade` foot below it |
| **TITLE BAR** | every window wears its name | a raised gradient strip full-bleed across the window head, `--field`→`--inset`, bold tracked caps with the hard shadow, closed by a two-tone groove (`--edge-shade` over `--edge-lit`) |
| **SOCKET** | anything you read *from* is cut *into* the body | `--well` ground, 1px `--edge-shade` cut edge, `--radius-socket`, blurred inner `--edge-shade` at top-left and a lit `--edge-lit` far wall at bottom-right |
| **CONTROL** | a button has a physical top surface | `--radius-control`, `--field`→`--panel` gloss, lit top-left / dark bottom-right bevel, a hard foot, bold shadowed label; **pressed** inverts the bevel and drops the foot; **disabled** loses the bevel and the foot entirely and flattens to `--panel` |

Light still comes from above and is still warm
(`chapter-09-color-theory.md`'s hue-shifted highlights — `--edge-lit` is warm,
`--edge-shade` is a cool blue-black, never `#000`).

### 6. Zero new colours — the lazy path is also the safe one

Every construction above is built from tokens that already exist and are
already gated: `--line`, `--edge-lit`, `--edge-shade`, `--panel`,
`--plate-foot`, `--field`, `--inset`, `--well`, `--gold`. **No hex is added,
moved or removed**, which is why contrast cannot regress by construction rather
than by luck. The only new tokens are three radii and one frame width — the
no-radius rule is what the direction supersedes, so radius is the one thing
that genuinely has to be named:

```css
--radius-window:8px; --radius-control:5px; --radius-socket:3px;
--border-frame:var(--space-2);   /* 3px — a frame, not a hairline */
--font-ui:Tahoma,"Segoe UI",Verdana,sans-serif;
```

Rejected on the way: alternating row stripes (a real MapleStory list device).
On this ramp the only legal alternation is ~1 L\* — invisible — and the
brighter options (`--inset`) would have opened un-gated accent-on-ground pairs
for a stripe nobody can see. The socket's groove separators do the same job for
free. Skipped; revisit only if the render reads flat.

### 7. Where the ladder gains, not loses

The four state channels (edge colour, type colour, control presence, unlock
text) are untouched. v2 added a fifth (only a live row carries a lit edge).
v3 keeps it and the chunkier language adds a sixth for free: **an unlit
window/row.** A locked row sits at `--opacity-locked` *inside a socket*, so it
loses the socket's sheen as well as its edge — the "visibly unlit window" the
brief asked for. This is verified on the render, not assumed.

### 8. Vetoes, checked one at a time

- **No sound, no ceremony, no obligation** — v3 adds zero animation. The whole
  language is material; motion budget untouched.
- **No AI-generated icons, no raster assets** — every mark is a border, a
  gradient, a radius or a box-shadow. The Art Deco lozenge (a rotated square)
  is *removed*, not replaced with anything.
- **No decay** — the risk in a chunkier register is a "worn metal" instinct:
  bevels that chip, frames that break, grain. None is used. Every frame is
  complete, every bevel is symmetric, no texture overlay exists. A friendly
  maintained window is *easier* to keep decay-free than a solemn one, which is
  a point in the direction's favour.
- **Dark ramp only** — no cream, no tan; the borrowed axis is composition, and
  remix rule 4 is the reason colour did not travel with it.
- **No glow** — the hard shadow is offset, never blurred outward, so the
  neon-on-dark tell (and the `dark-glow` detector rule) stays untripped.

## Recommendation

**BUILD.**
