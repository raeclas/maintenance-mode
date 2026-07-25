# Design Plan: UI de-duplication audit — all six tabs

**Status:** in-progress
**Track:** Standard
**Entry stage:** Discover (neither DESIGN.md nor JOURNEY.md exists)
**Created:** 2026-07-25
**Started:** 2026-07-25
**Current Phase:** 4

**Pacing:** user-requested pause between every phase (context-size check
before continuing or clearing to resume next session). Resume with
`/design-for-ai:build .design-foundations/plans/2026-07-25-ui-dedup-audit.md`
— the execution log below is the resume point.

**Review-model override (user instruction, 2026-07-25):** REVIEW dispatches
run at `fable`, not the ladder's one-tier downgrade. Blind isolation
(requirements + artifact only, no intent framing) is unchanged.
**Phases:** 6

---

## Context

Maintenance Mode is a boss-progression idle game. The premise: a dead MMO is
still running in maintenance mode and you are the only player left. The UI is
that MMO's client. **Six** tab surfaces (Boss, Training, Grind, Player, Delve,
Dungeon) print the same information more than once and render nearly everything
at one visual weight, so each screen reads as a dense undifferentiated block.

**The current state has been measured, not assumed** — see `internal/UI-AUDIT.md`,
captured at 375px via `npm run shots`. Headlines: every tab overflows
horizontally (**414px at a 375px viewport**); ~136 dormant items render at full
weight (70 unearned trophy rows, 45 rank-0 Armory cells, 21 locked rows with
inert allocation controls); the Player tab is ~8 phone screens tall with its
live controls at 60% scroll depth.

**The audit already changed the product once.** It found a seventh tab (GM) the
plan had omitted, and reading it surfaced four purchases selling upgrades for
mechanics the idle-battler rework had deleted. `82d2d99` retired the GM tab and
the entire ticket economy in response, taking the count back to six. Overflow
only fell 459px → 414px, which proves the tab row is structurally too wide
rather than one tab too many.

The audit also reframed the problem. Duplication is the SMALLER half: the larger
half is that nothing in the visual language separates live content from dormant
content. Both causes trace to the same gap — no document says which surface owns
which fact, or which state a row is in. This plan produces the missing contract
— journey, IA, fact ownership, page specs, then design DNA, tokens, component
specs and microcopy — and composes all six tabs against it.

## Constraints

- Vanilla JS ES modules, hand-written CSS, no framework and no bundler. Output
  must be implementable in `style.css` plus the existing markup.
- **The artifact is a working MMO's game client, not a terminal.** The reference
  class is a 2000s MMO UI — panels, tabs, gear slots, stat rows, boss frames.
  Shell/terminal chrome (`maintenance@dead-server:~$`, the PLAYERS counter)
  belongs to ONE of the three registers, "the dying server", and lives at the
  edges: the log and the meta surfaces. It is not the look of the product. A DNA
  pass that produces a console or CLI aesthetic has misread the brief.
- **The server still works — do NOT design decay.** The game is running
  correctly and is competently maintained; the only thing missing is other
  players. No glitch art, no corrupted text, no broken or rotting frames, no
  ruin aesthetic. The feeling comes from ABSENCE, not disrepair: social surfaces
  with nobody in them, a queue counter that never moves, `PLAYERS ONLINE: 1`.
  The UI should look like software that works perfectly and is used by one
  person.
- The existing look is canon and is dead-MMO satire, not a default. The shipped
  token vocabulary, type scale and `.caption` role are the starting point to
  systematize, NOT replace. This is documentation and extension of an existing
  identity, not invention of a new one.
- Mobile-first: the user playtests on a phone via GitHub Pages. No horizontal
  scroll at phone width; wide content scrolls inside its own container.
- The boss arena (health bar + streaming damage numbers) is CANVAS-drawn. It can
  be specced and its colors tokenized for the canvas code to read, but it cannot
  be styled by CSS or mock-rendered as HTML. It CAN now be reviewed on real
  pixels: `npm run shots` (`internal/shot.mjs`) captures the live game headless
  at 375px and renders the canvas correctly, so the "canvas is unreviewable" gap
  is closed — use the real capture, not a stub, wherever the arena matters.
- UI copy is plain English that explains the mechanic. The project's three-
  register lexicon (`internal/REMAKE-DESIGN.md` §16) governs NAMES only, never
  instructions.
- **De-duplication must not hide information.** The project's design guideline 5
  requires every multiplier term to stay displayed and traceable. Cutting a
  repeat is in scope; cutting a term is not.
- Hard vetoes hold: no sound, no ceremony or slow ritual animation, no
  AI-generated icons, no obligation mechanics. Any motion budget must not become
  ceremony.
- Artifacts live in `internal/` — the repo rule is that non-deployed work stays
  out of the served root (`CLAUDE.md`). This overrides the plugin's default of
  writing DESIGN.md / JOURNEY.md to the project root; dispatched agents must be
  given the `internal/` paths explicitly.

## Chosen approach

Fix the contract before the pixels. Phase 1 assigns every displayed fact to
exactly one owning surface — that map is what every later phase enforces, and it
is the only phase that addresses the actual cause. Phases 2–5 build the spec
layers (page structure, locked visual DNA, component machine, words) in
dependency order. Phase 6 composes all six tabs at once so the result is
consistent rather than six separately-drifting screens.

## Rejected approaches

- **Style-only pass.** Retokenizing and restyling without a fact-ownership map
  leaves the duplication intact — it would repaint the same repeated text.
- **Dungeon-only fix.** Cheapest, and it was offered, but the user chose all six
  in one pass; a per-tab fix also cannot produce a cross-tab ownership rule,
  which is where the duplication comes from.
- **Inventing a new visual identity.** The existing look is deliberate satire and
  was approved in a prior design-system pass. Phase 3 documents and systematizes
  it; it does not restart it.
- **Reading the product as a terminal.** The shell prompt and server lines are
  set dressing on one register, not the identity. Designing to "terminal" would
  throw away the MMO-client vocabulary — gear slots, boss frames, stat rows,
  tabs — that carries the premise.
- **Designing decay.** Glitch, corruption and ruin are the obvious read of
  "maintenance mode" and they are wrong here: the server runs fine. Breaking the
  UI on purpose would also undercut the joke, which depends on a game that still
  works being played by exactly one person.

## Assumptions

- Every fact currently displayed is worth displaying somewhere — this is a
  de-duplication pass, not a feature cut. Anything that should stop existing
  entirely is a separate decision the user makes, not a design finding.
- The tab set is stable for this plan, with one KNOWN exception: the meta
  currency is being redesigned (GM and tickets were retired in `82d2d99`), and
  it will likely arrive as a new surface. That is an ADDITIVE change — one more
  page spec, one more mock, reusing the tokens and components this plan
  produces. It is not a reason to hold the plan, but Phase 4's component specs
  should be written so a spend surface can be composed from them without new
  primitives. The old GM tab's one good idea — affordability signalled by button
  fill — is worth carrying forward.
- The Dungeon POC may still be cut after playtest; if it is, its page spec is
  dropped and the other five stand.
- Dark ramp only. The plugin's done-when vocabulary asks for dark AND light
  ramps verified; this game ships dark-only by design, so contrast items below
  are written against the dark ramp and the light-ramp requirement is
  deliberately waived. Recorded here so the reviewer does not read it as a miss.

---

## Phase 1: Journey, IA + fact ownership

**Stage:** Discover
**Model:** fable
**Doctrine:** `journey`, `usability`
**Gate:** Standard

**Goal:** Establish what job each tab does and assign every displayed fact to
exactly one owning surface.

**Scope:**
- IN: JTBD job story for the game loop; the tab ladder as IA (progressive
  unlock order is the navigation model); a complete inventory of every fact
  each of the six tabs currently displays; the ownership map assigning each
  fact one home.
- OUT: page-level structure (Phase 2); any visual decision (Phase 3+).

**Constraints:** The tab unlock ladder is a designed progression system, not
arbitrary nav — treat unlock order as part of the IA, not a bug to normalize.
Inventory must read the live markup and render code, not assume.
**`internal/UI-AUDIT.md` already carries the measured current state** (captured
at 375px from `bcf4ecc`): the duplication list, the dormant-content counts, the
overflow measurement and the per-tab findings. Start from it — do not re-derive
what has been measured. Extend it where the ownership map needs facts it does
not yet enumerate.

**Edge cases:** Facts that legitimately belong on two surfaces (Combat Power
drives both the Boss fight and the Player build) — the map must name ONE owner
and specify the other as a reference with a stated pointer, not a second copy.
Canvas-drawn facts are inventoried too, flagged as canvas-only.

**Produces:** `internal/JOURNEY.md` — `## Job`, `## Journey`, `## IA`, and
`## Fact ownership` (a table: fact → owning tab → where referenced).
**Depends on:** this plan | **Unlocks:** Phase 2

**Done when:**
- [ ] DW-1.1: `internal/JOURNEY.md` exists with `## Job`, `## Journey` and `## IA`
      sections populated; JTBD school named and not mixed.
- [ ] DW-1.2: `## Fact ownership` lists every fact displayed across all six
      tabs, each with exactly one owning tab; no fact has two owners. Combat
      Power (currently on both the resource bar and the Player tab) is resolved.
- [ ] DW-1.3: Every currently-displayed guideline-5 term (each multiplier/term in
      the Combat Power product) appears in the ownership table — the map proves
      nothing gets hidden by later cuts.
- [ ] DW-1.4: Every duplication in the current UI is listed with its locations
      (seeded from `internal/UI-AUDIT.md`, extended where that audit is silent).
- [ ] DW-1.5: Every row/cell has a declared STATE in the map — live, dormant
      (unlocked but idle), or locked. The audit found ~136 dormant items drawn
      at live weight; the ownership map must record state, not just ownership,
      or Phase 2 has nothing to differentiate on.

---

## Phase 2: Page specs, six tabs

**Stage:** Discover
**Model:** sonnet
**Doctrine:** `journey`, `usability`, `surface`
**Gate:** Standard

**Goal:** Specify each tab's structure around the single decision it owns,
phone-first.

**Scope:**
- IN: one page spec per tab (six) — purpose, entry points, content blocks in order,
  states (empty / locked / active / error), primary action, exit.
- OUT: copy wording (Phase 5); token values (Phase 3).

**Constraints:** Phone-first ordering — the primary decision must be reachable
without scrolling past explanatory text. Content blocks cite the fact-ownership
map; a block may only contain facts that tab owns.

**Doctrine override note:** `surface` is a Design-stage visual sub-topic and
pillar-taxonomy §2 routes device-class layout OUT of `journey`'s scope. It is
cited here deliberately: a page spec's output is the ORDER of content blocks,
and on a phone-only product that order IS the device-class decision — deferring
it to a Design phase would mean specifying a structure that then gets
re-ordered. `surface` is loaded here for block ordering only; all pixel-level
device work stays in Phases 3 and 6.

**Edge cases:** Locked tabs render as `???` before unlock — that is a real state
and needs a spec. The Boss tab contains the canvas arena: its spec names the
region and what it must convey, without HTML structure. Tabs with a live run in
progress (Dungeon) have a distinct in-progress state from their idle state.

**Produces:** `internal/JOURNEY.md` `## Page specs` — six complete entries.
**Depends on:** Phase 1 | **Unlocks:** Phase 3

**Done when:**
- [ ] DW-2.1: `## Page specs` has six complete entries (one per tab), each with
      purpose, entry points, ordered content blocks, states, primary action, exit.
- [ ] DW-2.2: Every content block in every spec traces to a fact this tab OWNS in
      the Phase 1 map; no spec reproduces a fact owned elsewhere.
- [ ] DW-2.3: Each spec names its primary decision and places it above the fold at
      phone width (375px reference).
- [ ] DW-2.4: Locked, empty and in-progress states are specified for every tab
      that has them.

---

## Phase 3: Design DNA + tokens + type + color

**Stage:** Design
**Model:** fable
**Doctrine:** `design-dna`, `foundations`, `archetypes`, `fonts`, `color`, `ai-tells`
**Gate:** Full

**Goal:** Systematize the existing MMO-client aesthetic into a locked token
contract that covers every surface, including the canvas.

**Scope:**
- IN: register, archetype, personality; the semantic token block; type scale;
  the dark palette verified for contrast; a motion budget; canvas color tokens.
- OUT: component composition (Phase 4); per-page application (Phase 6).

**Constraints:** Start from the shipped `style.css` tokens — this phase names,
completes and verifies them, it does not replace the look. The archetype work
must land on a WORKING MMO client: a game UI that functions correctly and has
one player, not a console and not a ruin. `ai-tells` is loaded to guard against
three failure modes — sanding the character into a generic dark dashboard,
over-correcting into CLI/hacker pastiche, and reaching for decay signifiers
(glitch, corruption, broken frames) the premise does not support. The motion
budget must be compatible with the no-ceremony veto: state-change feedback only,
no ritual.

**Edge cases:** Colors currently used by canvas code must become tokens the JS
can read, not CSS-only custom properties. Any existing hex that fails AA gets
adjusted, not waived — and the adjustment must preserve the character.

**Produces:** `internal/DESIGN.md` **locked** — token block, type scale, motion
budget, canvas token set.
**Depends on:** Phase 2 | **Unlocks:** Phases 4, 5

**Done when:**
- [ ] DW-3.1: `internal/DESIGN.md` exists and is locked (token block present,
      direction confirmed by the user).
- [ ] DW-3.2: All text/background pairs pass WCAG AA on the DARK ramp (≥4.5:1
      body, ≥3:1 large), verified via `palette.mjs` or computed ratio. Light ramp
      deliberately waived (see Assumptions).
- [ ] DW-3.3: Interactive elements pass WCAG AA non-text (≥3:1 against adjacent
      color) — this includes the gold CTA and the `.locked` tab state.
- [ ] DW-3.4: Semantic aliases resolved (background, surface, text, accent) and a
      type scale is defined covering every size currently in use.
- [ ] DW-3.5: Canvas colors exist as named tokens readable from JS.
- [ ] DW-3.6: Motion budget stated and contains no ritual/ceremony animation.

---

## Phase 4: Design system — components + meters

**Stage:** Design
**Model:** fable
**Doctrine:** `design-systems`, `data-viz`, `interaction`
**Gate:** Full

**Goal:** Turn the locked look into a component machine covering every repeated
UI shape in the game.

**Scope:**
- IN: token tiers (primitive → semantic → component); specs for row, rowlist,
  chip/KPI cluster, meter/progress bar, arena, allocation control, `.caption`,
  tab button; interaction states for each (idle, hover, active, disabled, locked).
- OUT: page composition (Phase 6); copy (Phase 5).

**Constraints:** Components must be derivable from the existing markup — this is
a specification of what the game already renders, tightened, not a new library.
The resource bar is a KPI row and the fill bars are meters; `data-viz` governs
their encoding so a bar's length always means the same thing.

**Edge cases:** The allocation control (−/input/+/cap/max/0) is the densest
component and is repeated dozens of times per screen — it needs a spec that
survives repetition without becoming visual noise. Bars that animate per-kill
must not read as the same object as bars that fill monotonically.

**Produces:** `internal/DESIGN.md` `## Component specs` + token tiers.
**Depends on:** Phase 3 | **Unlocks:** Phase 6

**Done when:**
- [ ] DW-4.1: Token tiers defined; every component spec references semantic tokens,
      never raw values.
- [ ] DW-4.2: A spec exists for each repeated shape: row, rowlist, chip/KPI, meter,
      arena, allocation control, caption, tab button.
- [ ] DW-4.3: Each component spec states its interaction states including locked
      and disabled.
- [ ] DW-4.4: Meter encoding is consistent — bar length means one thing across
      training, zones, boss health and dungeon progress, or the differences are
      explicitly distinguished by form.

---

## Phase 5: Words

**Stage:** Design
**Model:** sonnet
**Doctrine:** `content-design`
**Gate:** Standard

**Goal:** Write plain-English microcopy for every page spec so each screen
teaches its own mechanic without repeating itself.

**Scope:**
- IN: labels, helper text, empty/locked/error states, button copy, log lines,
  for all six tabs.
- OUT: layout and tokens.

**Constraints:** Plain English that says what you do and what happens. The
lexicon governs NAMES only — a mechanic explanation never sacrifices clarity for
register. Numbers and consequences are spelled out ("you keep 40% of the loot",
not "the haul is mostly lost"). Flavor is permitted only where it costs no
clarity, and never on the line that teaches the mechanic.

**Edge cases:** A mechanic explained in a section header must not be re-explained
per row — the Dungeon tab's current failure. Locked-state copy must say what
unlocks the tab without spoiling the content.

**Produces:** `internal/JOURNEY.md` page specs updated with final microcopy.
**Depends on:** Phase 3 | **Unlocks:** Phase 6

**Done when:**
- [ ] DW-5.1: Every content block in all six page specs has final copy.
- [ ] DW-5.2: No mechanic is explained more than once within a single tab.
- [ ] DW-5.3: Every empty, locked and error state has copy naming the condition
      and the way out.
- [ ] DW-5.4: Copy passes a plain-English read: no string requires knowing the
      lexicon to understand what the control does.

---

## Phase 6: Compose six tab mocks

**Stage:** Design
**Model:** sonnet
**Doctrine:** `usability`, `responsive`, `checklists`
**Gate:** Full

**Goal:** Render all six tab surfaces against the specs, tokens and copy.

**Scope:**
- IN: six self-contained mock HTML files at phone and desktop width.
- OUT: production integration into `main.js` / `style.css` (a separate build
  task once the direction is signed off).

**Constraints:** Self-contained HTML, no external deps. Tokens only — no
hard-coded hex. The Boss mock stubs the canvas region with a static placeholder
and a note; those pixels cannot be verified by the reviewer.

**Edge cases:** Phone width (375px) must not scroll horizontally; wide rows
scroll inside their own container. The Dungeon mock must show both idle and
in-progress states, since they differ structurally.

**Produces:** `internal/mocks/{boss,training,grind,player,delve,dungeon}.html`
**Depends on:** Phases 4, 5 | **Unlocks:** — (final phase)

**Done when:**
- [ ] DW-6.1: Six mocks render as self-contained `.html` with no missing deps.
- [ ] DW-6.2: No hard-coded hex/rgb in any mock; all color via tokens from
      `internal/DESIGN.md`.
- [ ] DW-6.3: No mock scrolls horizontally at 375px width.
- [ ] DW-6.4: No fact appears twice within a single mock — verified against the
      Phase 1 ownership map.
- [ ] DW-6.5: Each mock has a legible primary → secondary → tertiary read; the
      primary decision is the most prominent element.
- [ ] DW-6.6: design-review-agent cross-pillar synthesis returns no Critical
      findings; Majors resolved or explicitly accepted.

---

## Verification plan

| # | Check | Phase | Type |
|---|-------|-------|------|
| 1 | JOURNEY.md Job/Journey/IA populated | 1 | artifact presence |
| 2 | Every fact has exactly one owner | 1 | artifact presence |
| 3 | **Dirty:** a fact assigned two owners → rejected, one named owner + pointer | 1 | boundary |
| 4 | Six complete page specs | 2 | artifact presence |
| 5 | **Dirty:** a spec reproduces a fact owned by another tab → flagged | 2 | boundary |
| 6 | DESIGN.md locked with token block | 3 | artifact presence |
| 7 | Dark-ramp contrast AA on all text pairs | 3 | contrast |
| 8 | **Dirty:** an existing hex fails AA → adjusted, not waived | 3 | contrast |
| 9 | Interactive/non-text contrast ≥3:1 incl. locked tabs | 3 | contrast |
| 10 | Token tiers + component specs complete | 4 | token coverage |
| 11 | **Dirty:** a component spec using a raw value → rejected | 4 | token coverage |
| 12 | Microcopy complete for all blocks and states | 5 | artifact presence |
| 13 | **Dirty:** a mechanic explained twice in one tab → flagged | 5 | heuristic |
| 14 | Six mocks render | 6 | artifact presence |
| 15 | No hard-coded hex in mocks | 6 | token coverage |
| 16 | No horizontal scroll at 375px | 6 | responsive |
| 17 | **Dirty:** DESIGN.md missing at mock time → wireframe mode flagged | 6 | gate violation |
| 18 | Review synthesis: no Critical | 6 | heuristic |

**Verification level:** standard — every DW item is observable from the produced
artifact; contrast and token items are tool-verifiable; the canvas region is
explicitly exempt and noted rather than silently passed.

---

## Decision log

| Decision | Rationale |
|----------|-----------|
| Fact-ownership map as Phase 1 output | The duplication's cause is an undocumented ownership rule, not styling. Everything downstream enforces this map. |
| Artifacts in `internal/`, not root | Repo rule: non-deployed work stays out of the served root. Costs explicit path-passing to the plugin's agents. |
| Merged DNA with type + color into one phase | The palette and type scale already exist and were approved; this is documentation plus verification, not two separate inventions. |
| Dark ramp only | The game ships dark-only. Verifying a light ramp nobody will use is theater. |
| Canvas is spec-only | It cannot be styled by CSS or reviewed from the DOM. Named now so the reviewer does not pass it silently. |
| All six tabs in one pass | User's explicit choice over a Dungeon-first rollout. |
| Full visual pass | User's explicit choice, made with the caveat that it revisits the recently-shipped design-system stages. |
| Six tabs → seven → six again | The plan omitted GM; the audit found it; reading it surfaced four purchases for deleted mechanics, so `82d2d99` retired the tab and the ticket economy entirely. Net: back to six, and a meta-currency redesign is queued. |
| Audit measured before Phase 1 runs | `internal/shot.mjs` made real captures cheap, so the current state is measured (overflow, dormant-item counts, per-tab findings) instead of assumed. Phase 1 starts from evidence. |
| DW-1.5 added (row STATE, not just ownership) | The audit's biggest finding was dormant content at live weight — ~136 items. Ownership alone would not have given Phase 2 anything to differentiate on. |
| Phase 4 raised to Full gate / fable | CHECK finding: it defines the cross-tab component seams every later phase consumes, which the plan command classes as a multi-surface Design phase introducing new seams. |
| `surface` kept on Phase 2 with an override note | CHECK finding: it is a Design-stage doctrine on a Discover phase. Kept because block ORDER is the device-class decision on a phone-only product, and justified in-phase rather than silently. |

---

## Execution log

### Phase 3: Design DNA + tokens + type + color (Gate: Full)
- [x] BUILD: Discovery + design + production complete
- [x] REVIEW: fail -> PASS (4 attempts). R1: the AA fixes, applied per-token
      in isolation, collapsed the live/dormant/locked ladder into one band —
      the build agent argued this down with evidence (the tokens flagged were
      a secondary-text hierarchy; the real ladder is row opacity) and was
      right. R2: `--faintest` at 3.04:1 carrying real 10px Trophy-pip text
      (1.4.11 floor cited where 1.4.3 applies); two claims the source
      contradicted. R3: `#logHead`'s hardcoded `#4e7a5e` at 3.97:1, missed by
      a sweep that claimed to be exhaustive; a dead selector cited as the gold
      CTA. R4: PASS, 2 Minors fixed by the orchestrator before commit.
- [x] User confirmed direction (DW-3.1) — DESIGN.md LOCKED 2026-07-25.
- [x] Committed
Commit: 3aff88d
Decision: the 5 required code changes are deferred by user decision to ONE
integration pass AFTER Phase 6, not applied mid-plan. Phase 6's mocks are
therefore the first place these tokens render.
Summary: Phase 3 delivered `internal/DESIGN.md`, LOCKED — DNA "Last Warmth"
documented from the shipped look rather than invented, the semantic token
block, type scale, state-change-only motion budget, and a `theme.js` bridge
giving the canvas the same tokens as CSS. Seven hexes adjusted to clear AA on
the dark ramp, all lightness-only (hue deltas <0.4°). The state ladder is now
evidenced in both directions (each tier vs its background AND vs its
neighbours) — the check whose absence let R1's collapse through. Five live
code defects were found and specified: the boss HP label at 1.23:1, locked
rows accepting and silently wasting input, and Grind showing two different
states identically.

### Phase 2: Page specs, six tabs (Gate: Standard)
- [x] BUILD: Discovery + design + production complete
- [x] REVIEW: PASS. Two Minors fixed by the orchestrator before commit —
      the Boss arena's conveyance list had dropped the BREACHED reveal
      (the journey's per-wall emotional peak), and Boss was the one spec
      not arguing its own above-fold placement.
- [x] Committed
Commit: 7a1ac3d
Summary: Phase 2 delivered `## Page specs` in `internal/JOURNEY.md` — six
entries, each built around the one decision its tab owns, with every content
block citing the Phase 1 ownership row it draws from. Two reorders against
the shipped DOM target measured audit findings (Player's dormant trophy/armory
mass moved off the critical path; Dungeon's intro moved below its controls).
Intra-tab duplicate renders are carried forward to Phase 4 as component-
ownership calls, named rather than silently patched.

### Phase 1: Journey, IA + fact ownership (Gate: Standard)
- [x] BUILD: Discovery + design + production complete
- [x] REVIEW: fail -> PASS (2 attempts). First pass returned 2 Critical:
      the Dungeon `#instBank` fact + its duplication were missing from the
      map, and the Training tier state counts contradicted `state.js:51-52`.
      Both fixed; re-review spot-checked every quantitative claim against
      live source and passed all 5 DW items. One Minor (wall-selector prose
      contradicted its own table row) fixed by the orchestrator before commit.
- [x] Committed
Commit: dd4e1da
Deviation: the re-review ran without the `sonnet` model override (Sonnet was
unavailable upstream, blocking all dispatch), so it inherited Opus. This
upgrades reviewer capability rather than weakening it; blind-reviewer
isolation was preserved — the reviewer got requirements + artifact only.
Summary: Phase 1 delivered `internal/JOURNEY.md` — JTBD job story, journey,
the tab-unlock ladder as IA, and a fact-ownership table where every displayed
fact across the six tabs has exactly one owner, a state (live/dormant/locked)
and pointers instead of copies. Combat Power resolved to the Player tab (it
rendered in three places, not two). Dormant count reconciled to exactly 136.
The design now has the contract Phases 2-6 enforce.
