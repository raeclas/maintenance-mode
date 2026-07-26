# Design Plan: Visual pass + Help tab

**Status:** in-progress
**Started:** 2026-07-26
**Current Phase:** 3
**Track:** Standard
**Entry stage:** Design (JOURNEY.md and DESIGN.md both exist and are honored)
**Created:** 2026-07-26
**Phases:** 3

**Review-model:** REVIEW dispatches run at `fable` (carried over from the
previous plan's user instruction). Blind isolation unchanged.
**Pacing:** pause between phases (carried over).

---

## Context

The six-phase UI de-duplication plan (`2026-07-25-ui-dedup-audit.md`) closed
2026-07-26. It delivered exactly what it scoped: fact ownership, page specs, a
verified token contract, component specs, plain-English copy, and six mocks
where live / dormant / locked finally read apart. Horizontal overflow went
414px → 375px. That plan's own *Rejected approaches* section ruled out
inventing a new visual identity, and Phase 3's brief instructed the agent in
bold not to replace the look.

So the result is tidier, and it does not look new. On review of the rendered
mocks the user reported two things:

1. **Too much explanatory copy on live surfaces.** Phase 5's brief ("plain
   English that says what you do and what happens; numbers and consequences
   spelled out") produced a teaching sentence on nearly every content block.
   The Boss tab prints `Crits ×1.16 average damage — 10.0% of hits crit for
   ×2, and 20.0% of those crit again for ×5` beside the number it is already
   displaying. That is a tutorial living in a HUD.
2. **The visual result is not beautiful, only cleaner.** Accurate. The mocks
   honor the 2000s-MMO reference class STRUCTURALLY — tabs, panels, stat rows
   — and not at all VISUALLY. Every surface is a flat rectangle with a
   hairline border. No frames, no depth, no material, no ornament, no
   imagery, no display-scale typography. `Maren / Warden of the Second Door`
   in gold serif is the best thing on the Boss tab and renders near caption
   size, above a placeholder, in a panel identical to the log's.

This plan does the thing the last one deliberately excluded.

## Constraints

Everything the previous plan established is INPUT, not up for renegotiation:

- `internal/JOURNEY.md` is the structural contract — fact ownership (one
  owner per fact), per-row state, block order. A visual pass does not get to
  reintroduce a duplicate or move a fact between owners.
- The live / dormant / locked ladder must stay legible. It currently reads on
  four channels (edge colour, control presence, opacity, unlock text). A
  richer look must not flatten it — this was the previous plan's entire
  reason for existing.
- No horizontal scroll at 375px. The tab row is the widest element on screen
  and this plan ADDS a seventh tab, so the row must be re-fitted, not merely
  extended.
- **`internal/DESIGN.md` is currently LOCKED.** This plan supersedes its DNA,
  type and material layers deliberately, producing a v2. The token NAMES,
  the semantic tiers, the dimension scale, the component inventory and the
  state-ladder mechanics survive; the aesthetic they express is what changes.
  Any hex that changes must re-pass AA on the dark ramp — the previous plan
  fixed seven failing pairs and none may regress.
- Hard vetoes (user taste, standing): **no sound; no ceremony or slow ritual
  animation; NO AI-GENERATED ICONS — gold letter glyphs or hand-made only; no
  obligation mechanics.** The motion budget stays state-change feedback only.
- **The server still works — do NOT design decay.** No glitch, corruption,
  broken frames or ruin. The feeling is ABSENCE, not disrepair. A richer
  visual language makes this HARDER to hold, not easier: ornament reads as
  "ruin" the moment it looks damaged. The client is well-maintained and has
  one user.
- Dark ramp only.
- Vanilla CSS, no framework, no bundler, implementable in `style.css`.
- The repo has a working art pipeline (`internal/art/`, SDXL + pixel-art
  LoRA on the user's RTX 4070S). Hand-made or pipeline art is permitted;
  generated ICONS specifically are not.

## Chosen approach

Aesthetics first on one surface, then propagate. Phase 1 revises the DNA and
proves it on the Boss tab only — the hero surface, and the one whose current
flatness the user reacted to most. The user signs off on real pixels before
Phase 3 spends effort on six more. Phase 2 is independent of that sign-off
and can run in parallel: it moves the teaching copy off the live surfaces
into a Help tab and re-fits the tab row for seven.

## Rejected approaches

- **Restyling all seven surfaces in one shot.** This is what the user chose
  when asked, but the sequencing above delivers the same scope while making
  the "not what I hoped for" outcome cheap to discover instead of expensive.
  Nothing is cut.
- **Re-running the DNA generation from scratch.** The register, archetype
  (Ruler + Sage) and the gold/bone-in-cool-neutrals palette are not the
  problem — their EXPRESSION is. Diverging on identity would throw away a
  direction the user has twice approved.
- **Adding richness via imagery alone.** Boss art would raise the Boss tab
  and do nothing for Training or Grind. The material/depth/type work has to
  carry surfaces that are inherently lists.
- **Dropping the copy rather than relocating it.** The previous plan proved
  several explanations correct a genuinely wrong shipped label; the words are
  right, the placement is not.

## Assumptions

- The seventh tab is a real tab in the row, per the user's explicit choice
  over a `?`-triggered pane. The existing `?` button in the resource bar
  becomes its entry point too.
- Boss is the right proving surface. If the user would rather judge the
  direction on a list-heavy tab (Grind or Training is the harder test of a
  material language), Phase 1's target swaps with no other change.

---

## Phase 1: Visual DNA v2 + Boss surface

**Stage:** Design
**Model:** opus
**Doctrine:** `design-dna`, `foundations`, `archetypes`, `fonts`, `color`, `techniques`, `ai-tells`
**Gate:** Full

**Goal:** Make the client beautiful without changing what it says, and prove
it on the Boss tab.

**Scope:**
- IN: material and depth language for panels and frames; a display-scale type
  ramp; ornament and edge treatment; the boss-frame hero treatment; gold
  discipline; any hex changes needed, re-verified for AA; one recomposed
  `internal/mocks/boss.html`.
- OUT: the other six surfaces (Phase 3); copy relocation (Phase 2).

**Constraints:** The state ladder must survive intact — verify on the rendered
mock that live / dormant / locked still read apart. No decay signifiers. No
generated icons. Structure and facts come from JOURNEY.md unchanged.

**Edge cases:** The arena is canvas-drawn and stays a labelled placeholder in
the mock, but the DNA must specify what the canvas should draw — it is the
hero element and currently the emptiest box on the page. Ornament must not
read as damage.

**Produces:** `internal/DESIGN.md` v2 (DNA/material/type sections superseded,
token names and component inventory preserved) + `internal/mocks/boss.html`.

**Done when:**
- [ ] DW-1.1: DESIGN.md v2 states the material language — how a panel is
      built, what makes a frame, what carries depth — in terms a second
      surface could be built from without seeing the Boss tab.
- [ ] DW-1.2: A display-scale type ramp exists above the current caption/body
      sizes, and the Boss identity uses it.
- [ ] DW-1.3: Every changed hex re-passes AA on the dark ramp (≥4.5:1 body,
      ≥3:1 non-text), verified by computed ratio. No previously-fixed pair
      regresses.
- [ ] DW-1.4: `boss.html` renders self-contained, no hard-coded hex or
      untokenized px, no horizontal scroll at 375px.
- [ ] DW-1.5: live / dormant / locked still read apart on the rendered mock.
- [ ] DW-1.6: The look is materially different from the previous mock —
      judged on a side-by-side screenshot against `internal/mocks/shots/`,
      not asserted.

---

## Phase 2: Help tab + copy relocation

**Stage:** Design
**Model:** sonnet
**Doctrine:** `journey`, `content-design`, `usability`
**Gate:** Standard

**Goal:** Move every teaching explanation off the live surfaces into a Help
tab, leaving numbers, controls and state behind.

**Scope:**
- IN: a Help page spec + microcopy in JOURNEY.md; the seven-tab row re-fit at
  375px; a per-tab list of which strings move and which stay.
- OUT: visual styling (inherits Phase 1's DNA).

**Constraints:** Relocation, not deletion — several current explanations
correct a genuinely wrong shipped label and must survive somewhere. A live
surface keeps any string a player needs AT the moment of the decision;
everything that teaches a mechanic in general moves. The tab row must re-fit
for seven without horizontal scroll.

**Edge cases:** A locked tab's unlock condition is state, not teaching — it
stays. The Help tab must be reachable from the existing `?` button.

**Produces:** `internal/JOURNEY.md` — Help page spec + a relocation table.

**Done when:**
- [ ] DW-2.1: Every string currently on a live surface is classified: stays
      (decision-point information) or moves (general teaching).
- [ ] DW-2.2: A Help page spec exists with structure, states and final copy.
- [ ] DW-2.3: No explanation is lost — every moved string has a home.
- [ ] DW-2.4: The seven-tab row fits 375px with no horizontal scroll.

---

## Phase 3: Recompose the remaining surfaces

**Stage:** Design
**Model:** opus
**Doctrine:** `usability`, `responsive`, `checklists`
**Gate:** Full

**Goal:** Apply the approved DNA and the copy relocation to the other six
surfaces.

**Scope:**
- IN: `training, grind, player, delve, dungeon, help` recomposed against
  DESIGN.md v2 and the Phase 2 relocation.
- OUT: production integration (a separate task).

**Constraints:** Same as the previous plan's Phase 6 — self-contained HTML,
tokens only, no untokenized px, no horizontal scroll at 375px, no fact
duplicated within a surface.

**Edge cases:** List-heavy surfaces (Grind, Training) are the real test of a
material language — a treatment that only works on a hero surface has failed.
Dungeon still needs both idle and in-progress states.

**Produces:** `internal/mocks/{training,grind,player,delve,dungeon,help}.html`

**Done when:**
- [ ] DW-3.1: Six surfaces render self-contained, no missing deps.
- [ ] DW-3.2: No hard-coded hex/rgb and no untokenized px in any mock.
- [ ] DW-3.3: No mock scrolls horizontally at 375px.
- [ ] DW-3.4: No fact appears twice within a single mock.
- [ ] DW-3.5: The state ladder reads apart on every list surface.
- [ ] DW-3.6: Review returns no Critical findings.

---

## Execution log

### Phase 1: Visual DNA + Boss surface (Gate: Full)
- [x] BUILD v2 (Art Deco reading of Ruler+Sage) — commit `9bc43b4`
- [x] REVIEW v2: PASS with one Major — the material/depth layer was
      imperceptible, and since frame + display type are hero-only, the five
      list surfaces would have inherited only the invisible half. Closed:
      the whole surface stack was compressed into ~3 L\* (`bg→panel` 3.09,
      under the perceptual floor), `--inset` was *lighter* than `--panel`
      while named "recessed", and the instrument was wrong — WCAG's `+0.05`
      flare term crushes dark-on-dark ratios toward 1.0, so a 1.04:1 surface
      pair read as fine when it meant invisible. **Surface separation is an
      L\* question; only text is a ratio question.** Ramp respread to 5.17 L\*.
- [x] USER REJECTED v2: *"something about the script and styling irks me
      still — the early MMO UI vibe isn't there."*
- [x] Copy fixes from the same review pass — commits `eba1698`, `9e2f394`,
      `3b3f681`. Four blocks hand-fixed, all one root cause: Phase 5 of the
      previous plan wrote PROSE for content that is TABLES, because its brief
      said "spell out numbers and consequences". Also surfaced a real defect
      — `bots.js:154` computes `copperPerSec` as base, `copperMult` is applied
      at credit time, so the shipped game prints a copper rate the player
      never banks (integration-pass item #8).
- [x] BUILD v3 (MapleStory construction on the dark ramp) — commit `066b5ec`
- [x] USER: **"acceptable for now"** — qualified acceptance, NOT sign-off.
      Treat the direction as provisional; revisit before it is spent on all
      six surfaces if the user's read changes.

**Why v3 works where v2 did not:** the archetype was re-derived rather than
defended. Ruler's documented gravity — deep tones, formal symmetry, serifs,
luxury restraint — describes a bank, and it produced a look rejected twice.
**Everyman + Sage** is the honest read: this client's relationship with its
last player is belonging, not prestige, and a warm perfectly-working client
with nobody in it is a sadder object than a cold austere one. Everyman's
Playful Geometric family legitimately supplies the chunky rounded
construction; Data-Dense Professional stays the base because the content is
still tables; Sage keeps the fully-displayed numbers.

**State at pause:** only `boss.html` carries v3. The other five took a single
`--font-body` token line and nothing else. The Grind specimen inside
`boss.html` is the list-surface preview.

**Carried forward, recorded not hidden:** Maple's alternating row stripes are
skipped — on this ramp the only legal alternation is ~1 L\*, invisible, and
brightening the ground to make it visible would open un-gated accent pairs
for a stripe nobody can perceive.

### Phase 2: Help tab + copy relocation (Gate: Standard)
- [x] BUILD: Discovery + design + production complete (2 attempts)
- [x] REVIEW: FAIL → PASS. First pass caught DW-2.1 incomplete — two teaching
      strings on live surfaces were never classified (`dungeon.html` `#instBank`
      helper, `training.html` `#popFill` caption). Root cause: the sweep walked
      only the six "Explained-once register" tables, and both misses existed
      only as `(NEW)` rows in the Final-copy tables, so they were never in the
      inventory being swept. Re-swept by reading the rendered HTML of all six
      mocks directly; nothing further found. Second pass PASS, detector 0/16,
      one Minor (tally arithmetic) fixed by the orchestrator.
- [x] Committed
Commit: `b2d6b17`
Summary: JOURNEY.md now carries a stays/moves rule, a 22-row relocation table
covering every teaching string on all six live tabs, and a full Help page spec
(6 gated content blocks, states, final copy); the seven-tab row is re-fitted at
375px as `repeat(4,1fr)` 4+3 — measured `scrollWidth = 375`, 87px buttons, 44px
touch target — and the existing `?` button is retargeted to the Help tab.

**Method note for Phase 3:** the relocation tables are the implementation
contract, and they were leaky once. Phase 3 implements against the RENDERED
strings, treating the tables as the intent and the mocks as the inventory.
