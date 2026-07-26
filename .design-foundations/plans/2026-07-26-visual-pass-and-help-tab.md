# Design Plan: Visual pass + Help tab

**Status:** in-progress
**Started:** 2026-07-26
**Current Phase:** 2.5
**Track:** Standard
**Entry stage:** Design (JOURNEY.md and DESIGN.md both exist and are honored)
**Created:** 2026-07-26
**Phases:** 4 (Phase 2.5 inserted 2026-07-26)

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

## Phase 2.5: Visual DNA v4 — colour lanes + full-Maple construction

**Stage:** Design
**Model:** opus
**Doctrine:** `design-dna`, `color`, `techniques`, `ai-tells`, `checklists`
**Gate:** Full

**Added 2026-07-26 by user decision after reviewing Phase 1's v3 on real
pixels:** *"the UI itself is ok. maybe more stylised aesthetic is how i would
have preferred. adding colour where it could potentially add more flavour
could be nice as well."* v3 was accepted only provisionally; this phase spends
the revision BEFORE Phase 3 propagates a look the user is lukewarm on.

**Goal:** Push v3's construction to full MapleStory weight and open four
colour lanes, proved on one hero surface and one list surface.

**The amended colour rule.** DESIGN.md v3 states that `warn`/`alert`/`copper`
are functional-semantic accents that **never** enter identity roles, and that
gold is the sole signature. That rule is the direct cause of every surface
reading identical, and the user has now amended it. Colour may carry identity —
but every new hue must still attach to a MEANING the player can name. The rule
that survives: no hue is decorative. Four lanes, all user-selected:

1. **Rarity ramp promoted.** `rarity.js` is already multi-hue and currently
   only tints text. It becomes a real visual lane — item plates, stash cells,
   Armory cells, drop lines. Invents no new meaning.
2. **Per-Warden identity hue.** Each of the 10 Wardens owns a hue; the Boss
   tab re-tints per door (frame, `--floor-glow`, name plate). Makes a door
   feel like a place.
3. **Per-tab accent identity.** Each of the seven tabs owns an accent — tab
   chip, `.row.active` stripe, `h3` rule. Body text stays neutral; gold
   remains the client's own signature, not a tab's.
4. **Zone / IP power bands.** Grind zones and gear IP already carry a
   power-band concept with no colour; a cool→hot ramp makes progression
   visible at a glance on list surfaces.

**Construction: push hard.** Thick beveled frames, pronounced plates, gold
letter-glyph icon plates per section, corner ornament, chunky window chrome,
display type stepped up. **Letter glyphs and hand-made marks only — the
no-AI-generated-icons veto is unchanged and absolute.**

**Scope:**
- IN: DESIGN.md v4 (colour lanes + construction layer superseded); recomposed
  `internal/mocks/boss.html` (construction + Warden hue) and
  `internal/mocks/player.html` (rarity plates + tab accent + list stress test).
- OUT: the other five surfaces (Phase 3); copy relocation (already specified
  in Phase 2, applied in Phase 3).

**Constraints:** Every new hex passes AA on the dark ramp before it ships.
**Surface separation is an L\* question, not a ratio question** — this was
Phase 1's v2 failure, where WCAG's `+0.05` flare term made a 1.04:1 dark-on-dark
pair read as fine when it meant invisible. The state ladder (live / dormant /
locked) must still read apart, and colour identity must not become a fifth
channel that drowns it. No decay signifiers — ornament reads as ruin the
moment it looks damaged, and the server still works. JOURNEY.md's fact
ownership is untouched.

**Edge cases:** Seven tab accents plus ten Warden hues plus six rarity tiers
is a lot of hue on one dark ramp — the phase must state which lanes may
co-occur on one surface and which are mutually exclusive, or Phase 3 inherits
a clown car. The arena stays a labelled canvas placeholder, but the DNA must
say what it draws per Warden hue.

**Produces:** `internal/DESIGN.md` v4 + `internal/mocks/{boss,player}.html`

**Done when:**
- [ ] DW-2.5.1: DESIGN.md v4 specifies all four colour lanes as named tokens
      with the meaning each hue carries, and states the co-occurrence rule
      (which lanes may appear together on one surface).
- [ ] DW-2.5.2: Every new or changed hex passes AA on the dark ramp (≥4.5:1
      body, ≥3:1 non-text), verified by computed ratio; no previously-fixed
      pair regresses; surface pairs verified by L\* separation, not ratio.
- [ ] DW-2.5.3: The construction is materially heavier than v3 — judged on a
      side-by-side screenshot against the current `internal/mocks/shots/`,
      not asserted.
- [ ] DW-2.5.4: `boss.html` and `player.html` render self-contained, no
      hard-coded hex or untokenized px, no horizontal scroll at 375px.
- [ ] DW-2.5.5: live / dormant / locked still read apart on both rendered
      mocks, with the colour lanes active.
- [ ] DW-2.5.6: No AI-generated icon. Any icon plate is a letter glyph or a
      hand-made mark, and the mock says which.

---

## Phase 3: Recompose the remaining surfaces

**Stage:** Design
**Model:** opus
**Doctrine:** `usability`, `responsive`, `checklists`
**Gate:** Full

**Goal:** Apply the approved DNA and the copy relocation to the remaining five
surfaces.

**Scope:**
- IN: `training, grind, delve, dungeon, help` recomposed against DESIGN.md v4
  and the Phase 2 relocation. (Boss and Player are done in Phases 1 and 2.5.)
  Grind is where the zone / IP power-band lane gets proven.
- OUT: production integration (a separate task).

**Constraints:** Same as the previous plan's Phase 6 — self-contained HTML,
tokens only, no untokenized px, no horizontal scroll at 375px, no fact
duplicated within a surface.

**Edge cases:** List-heavy surfaces (Grind, Training) are the real test of a
material language — a treatment that only works on a hero surface has failed.
Dungeon still needs both idle and in-progress states.

**Produces:** `internal/mocks/{training,grind,delve,dungeon,help}.html`

**Done when:**
- [ ] DW-3.1: Five surfaces render self-contained, no missing deps.
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

### Phase 2.5: Visual DNA v4 — colour lanes + full-Maple construction (Gate: Full)
- [x] BUILD: DESIGN.md v4 + `boss.html` / `player.html` (2 attempts)
- [x] REVIEW: FAIL → PASS. First pass caught a real internal contradiction —
      the co-occurrence table said *"Boss: lane 2 only"* with a hard two-lane
      cap, while the persistent `#tabs` nav painted all seven lane-3 accents
      unconditionally on every surface, so Boss actually rendered seven hues.
      Doc and pixels disagreed and a Phase 3 agent could not tell which was
      authoritative. Resolved by amending the RULE, not the pixels: the
      seven-hue foot-bar row is a **legend** — one row, one position, identical
      everywhere, never adjacent to content, chroma ≤ .05. The `.05` choice had
      already encoded "chrome is a separate tier"; v4 just never wrote the
      consequence down. Deleting the row would have removed a real wayfinding
      channel to fix a documentation defect. Second pass PASS; detector clean;
      one Minor (Boss row missing its lane-4 note) fixed by the orchestrator.
- [x] Committed
Commit: `32f1189`
Summary: DESIGN.md v4 opens four colour lanes — rarity ramp promoted to a
visual lane, per-Warden identity hue, per-tab accent identity, zone/IP power
bands — with 28 lane members solved rather than picked (each binary-searched in
OKLCH to Y=0.27, the value that clears 4.5:1 on `--field`, so all 28 gate as one
check). Construction pushed to full Maple weight: `--border-frame` 3px→4px, a
new 2px `--bevel`, rivets, Warden name 36px→40px. Proved on `boss.html` (hero,
Warden hue) and `player.html` (list surface, rarity plates).

**Two live WCAG failures surfaced on the way:** `--rar-epic` at 4.15:1 and
`--rar-mythic` at 4.00:1 on `--field` — un-gated through three design passes
because `contrast.mjs` had no rarity pair in it at all. Lifted in v4 with hue
and chroma preserved; `rarity.js` itself is deliberately NOT yet touched, since
editing shipped code before the look is signed off would half-apply v4. Logged
as behaviour change #8.

**Coverage grew ~4×:** the checker went from 49 gated pairs to 190 + 16 L\*
surface pairs. Three distinctions were added to `contrast.mjs` — color-mix
resolution, L\*-separation gating for surfaces, and banned-and-failing vs
banned-by-role. The first run threw four FALSE failures because the old model
could not express "banned by role"; splitting the lists was the fix, not
loosening a gate. It now also genuinely asserts the banned-failing pairs, which
its own comment had always claimed and the code never did. Both review passes
independently re-ran it and confirmed the diff is additive.

**Root cause fixed one level down:** `.t-boss{--acc:…}` was unscoped and the tab
buttons wear the same `.t-*` classes, so it was silently setting seven different
`--acc` values on the seven chips — invisible today, a seven-hue trapdoor the
moment anything inside a button read `--acc`. Scoped to `main.t-*`. A doc-only
fix would have left it armed.

**State at pause:** `style.css`, `rarity.js` and `index.html` are untouched. The
DESIGN.md gate holds until the user confirms the direction on real pixels.
