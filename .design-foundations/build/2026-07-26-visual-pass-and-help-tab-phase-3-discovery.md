# Discovery + Design: Phase 3 — Recompose the remaining surfaces

**Plan:** `.design-foundations/plans/2026-07-26-visual-pass-and-help-tab.md`
**Stage:** Design · **Gate:** Full · **Doctrine:** `usability`, `responsive`, `checklists`

---

## Artifacts Found / Current State

**The mocks are GENERATED.** `internal/mocks/build.mjs` (2,109 lines) emits six
HTML files and then asserts its own token discipline on them. Every edit this
phase makes goes into the generator, never into an emitted file.

| Artifact | State found |
|---|---|
| `internal/DESIGN.md` | v4, 2,629 lines. Four colour lanes, Tier A/B co-occurrence rule, construction at full Maple weight, 28 solved lane members. Status: *proposed, evidence passing, awaiting the user's look sign-off*. |
| `internal/JOURNEY.md` | 1,372 lines. Fact ownership, six page specs, the 22-row relocation table (`## Phase 2`), the full Help page spec + microcopy, the tab-row re-fit. |
| `internal/mocks/boss.html` | v4 (`v4:true`). Carries lane 2. Also carries `MATERIAL_SPECIMEN` — a full second render of the Grind Zones section as an annotation specimen. |
| `internal/mocks/player.html` | v4. Lanes 1 + 3 + 4. |
| `training / grind / delve / dungeon .html` | **v3 tokens only, no `v4` flag, no `t-*` room class.** They took `--font-body` and nothing else. |
| `help.html` | **Does not exist.** |
| `internal/mocks/contrast.mjs` | 190 gated pairs + 16 L\* surface pairs. Parses `boss.html` + `player.html` for the `:root` block. |
| `internal/mocks/shoot.mjs` | Headless Edge/Chrome via CDP. `NAMES` = the six existing mocks. Fails non-zero on scrollWidth > 375. |
| `index.html:204` | `<div id="logHead">maintenance@dead-server:~$ <span class="cursor">▮</span></div>` |
| `build.mjs:1320` | The same string, emitted into all six mocks by `log()`. |

**Copy relocation state: NOT ONE CUT HAS BEEN MADE.** Phase 2 produced the
contract; Phase 2.5 explicitly deferred applying it (`DESIGN.md ## Open
questions (v4)`: *"Copy is deliberately untouched… Cutting the teaching copy in
the same pass as the colour would have confounded the visual judgement"*). All
22 relocations are this phase's work.

### Rendered-string inventory (the Phase 2 method note, applied)

Phase 2's review failed once because a sweep walked the *tables* and not the
*strings*. So the inventory below was taken from `build.mjs`'s emitted bodies —
the tables are the intent, the generator is the inventory. Boss's two rows were
already hand-cut by Phase 1 (`.ledger` carries no prose; `#cooldown` broken
reads `Set pieces 1 of 7 — on the Player tab.`) and are confirmed clean.

| Surface | Cut sites in the generator | Notes |
|---|---|---|
| Training | 5 | `#popFill` caption (clause only), `ATK scripts` sub, `SPEED scripts` sub, `Enhance squad` sub, the Ban Wave `<p class="caption">` |
| Grind | 1 | `Zones` sub — also reaches the Boss specimen, which is being deleted (below) |
| Player | 6 | `Combat Power` sub, `Gear` sub, the Reforge `<p class="sub">`, `Stash` sub, `Trophies` sub, `Armory` sub |
| Delve | 2 | `Delve` sub, `Cache tree` sub |
| Dungeon | **7 edits for 5 rows** | `Assign bots` sub ×2 (idle + in-progress), `#instKeyInfo` sub, `#instBank` sub ×2, the whole `howItWorks` block, `Boss abilities` sub (flavor half stays) |

Rows that STAY, verified against the stays/moves rule rather than assumed:
Ban Wave's `— the anti-cheat notices the farm` (short flavor), `there's no wiki
and nobody to ask` (short flavor), the safeguard toggle's own label, the proxy
toggle's own label, every duty row's `−N% damage every floor it's unblocked`,
every per-attempt cost/chance/fallout line, every POINTER.

---

## Gaps

1. **Four surfaces are not on v4 at all** — no `v4` flag, no room class, so no
   accent, no rivets, no glyph plates, no heavier frame.
2. **Help does not exist.** It is the seventh tab in `TABS` and in the IA, and
   the tab row already renders its chip; the destination is a 404.
3. **The shell prompt is in shared chrome** — one generator line, six emitted
   files, plus `index.html` and two JOURNEY.md rows and one DESIGN.md
   `## Direction` paragraph that license it.
4. **`MATERIAL_SPECIMEN` is now stale AND wrong on pixels.** Phase 2.5 scoped
   `--acc` to `main.t-*` (correctly — the tab buttons wear the same classes).
   The specimen is `<div class="t-grind">`, which is *not* a `main`, so it
   inherits Boss's `--acc` and renders in the **Warden's** hue while its own
   annotation claims it proves *"lane 3 — Grind's accent"*. Doc and pixels
   disagree again, one level down.
5. **`--logline`** exists only to colour `#logHead`, the element being retired.
6. **The `LADDER` annotation** printed on every mock still says *"live: gold
   left edge"*. Under v4 live wears the room's accent. Stale on all seven.
7. **Help's own copy contains one duplicated fact.** JOURNEY's verbatim
   Difficulty copy ends *"If the party dies you keep 40% of what they found"* —
   the same sentence "How a run works" already owns three topics above it. On
   the live Dungeon tab those two strings lived in different blocks; relocating
   both to one page makes them adjacent.
8. **The mono question has no instrument.** `font-family:monospace` is written
   at ~30 literal sites, so there is no way to render the alternative without a
   token to flip.

---

## Gate Status

| Gate | Status |
|---|---|
| DESIGN.md present + locked? | Present, v4, evidence passing, awaiting look sign-off. **Honored as law.** This phase changes no token value and adds no hex. |
| JOURNEY.md present? | Yes. Fact ownership, relocation table and Help spec are all treated as the implementation contract. |
| Prerequisites met? | Yes — v4 exists and is proved on two surfaces; the relocation table and Help spec exist; the tab-row re-fit is measured. |
| Scope conflicts with the DESIGN.md lock? | **None.** The chat window is built entirely from v4's existing four constructions and existing tokens; zero new hexes. The two DESIGN.md edits this phase makes are the ones the plan's `**Produces:**` line explicitly commissions (the register section the log change supersedes, and the mono decision). |

---

## DW Verification

9 DW-IDs in the dispatch prompt; 9 rows below.

| DW-ID | Done-When Item | Status | Design execution evidence |
|---|---|---|---|
| DW-3.1 | Five surfaces render self-contained, no missing deps | COVERED | `node internal/mocks/build.mjs` — its DW-6.1 assertion greps every emitted file for `<link` / `<script` / `src=` / `url(` / `@import` / `http`, exit 0. Plus `shoot.mjs` navigating `file://` for each. |
| DW-3.2 | No hard-coded hex/rgb and no untokenized px in any mock | COVERED | Same run — the DW-6.2 assertion strips `:root`, comments and `@media` preludes and greps the remainder plus every inline `style=""`. Exit 0 required. |
| DW-3.3 | No mock scrolls horizontally at 375px | COVERED | `node internal/mocks/shoot.mjs` reports `document.documentElement.scrollWidth` per file at 375px and exits non-zero if any exceeds it. |
| DW-3.4 | No fact appears twice within a single mock | COVERED | Read of each emitted body after the cuts, against JOURNEY's fact-ownership table. Two known instances resolved by construction: `MATERIAL_SPECIMEN` deleted (it rendered the whole Zones section a second time inside `boss.html`), and Help's Difficulty topic loses the 40%-kept sentence that "How a run works" owns. |
| DW-3.5 | The state ladder reads apart on every list surface | COVERED | 375px renders of `grind` (four states side by side: active / struggling / dormant / locked), `training` (active / dormant / locked ×11), `dungeon` (active / struggling / locked), `delve`, plus `help`'s locked-block specimen. Ladder channels are also token-gated by `contrast.mjs`. |
| DW-3.6 | Review returns no Critical findings | COVERED | The blind REVIEW dispatch is the gate; this build's job is to leave it clean evidence — all three checkers green and the deviations declared here rather than discovered. |
| DW-3.7 | Shell prompt gone from every surface AND from `index.html` / `build.mjs`; no `dead-server`, no fake cursor | COVERED | `grep -rn "dead-server\|maintenance@\|9646\|▮\|class=\"cursor\"" *.html internal/mocks/*.html internal/mocks/build.mjs index.html` returns zero. |
| DW-3.8 | Chat window renders on all seven surfaces with its System and General states; empty state reads quiet not broken | COVERED | `grep -c 'id="chat"'` = 1 on each of seven emitted files. System state renders on all seven; the General empty state renders as a labelled specimen on `help.html`. Judged on `shots/help-375.png` / `-1280.png`. |
| DW-3.9 | Mono-vs-UI-font decided on rendered evidence; both rendered, one chosen, reason in DESIGN.md | COVERED | A `--font-data` token is introduced (default `monospace`) and `grind-uifont.html` is emitted from the identical body with `--font-data:var(--font-ui)`. Both screenshotted at 375 and 1280; the decision and its reason are written into DESIGN.md. |

**All items COVERED:** YES

---

## Design Decisions

### 1. The chat window — built from v4's existing vocabulary, zero new tokens

*Principle:* `checklists.md` §3 "It feels random/incoherent → establish a shape
language and repeat it". The client already has four constructions (WINDOW /
TITLE BAR / SOCKET / CONTROL). A chat panel is a window with a title bar, two
control plates and a socket. Building it from anything else would announce it
as a foreign object — which is precisely the fault the shell prompt had.

- **`#chat` = WINDOW.** 4px frame, radius, bevel, hard foot.
- **`#chatHead` = TITLE BAR.** Joins the `h3,.frame` rule, so it gets the four
  corner rivets for free (v4 rule: four, always, symmetric — the no-decay veto
  expressed as CSS).
- **`.chan` = CONTROL.** Two plates, System and General; the active one wears
  the pressed construction permanently, exactly as `#tabs button.active` does.
- **`#log` = SOCKET.** Joins `.rowlist,.canvasStub,#dialogue`.

**The chat carries NO lane hue.** Its frame is `--line` and its title-bar
groove is `--edge-lit`, both neutral, where a `section.game` takes the room's
`--acc`. That is a deliberate override of the shared rule and the reason is
stated at the declaration site: chrome is a tier of its own, and a persistent
element that changes hue per room is the second multi-hue chrome element
DESIGN.md's `## Never (v4)` closes Tier A against. Tier B lane counts are
unchanged on all seven surfaces.

Contrast surface cannot regress **by construction**: every ink the chat uses
(`--bone`, `--dim`, `--faint`, `--gold`, `--recede`, `--warn`) on every ground
it uses (`--field`, `--inset`, `--well`, `--panel`) is already in
`contrast.mjs`'s gated set. No hex is added.

### 2. Chat copy — the emptiness does the work, the copy does not narrate it

`Players online: 1` moves out of a rare log line and becomes the window's
persistent online counter, which is the honest MMO furniture for it and the one
place where the number means the whole premise. System carries the four
existing log lines. General renders `Nothing here.` in `--faint` italic.

*Rejected:* narrating the silence (`General has been quiet for a long time`).
The plan is explicit that the emptiness is the storytelling; a sentence
*about* the emptiness is the decay register sneaking back in as prose. The
empty state reads quiet because the window around it is intact, lit and
working — Nielsen #1 visibility of system status, satisfied by a channel that
is plainly selectable and plainly empty. No badge, no unread count, no
notification: an unread counter would be an obligation mechanic (standing hard
veto).

### 3. Delete `MATERIAL_SPECIMEN` rather than repair it

The specimen existed because `grind.html` did not carry the language yet. It
does now — that is this phase. Deleting it fixes gap 4 (its annotation claims a
hue the cascade no longer gives it), removes a second full render of the Zones
section from inside `boss.html` (a DW-3.4 exposure), and is a smaller diff than
inventing a `.room` scoping class to make a preview of a page that now exists.
`boss.html` keeps its lane count of 1.

### 4. Help's construction — the DNA's own signature, one level deep

Six `section.game` windows, one per room, in tab-bar order (Jakob's law — the
spec's own argument). Each opens with the title bar carrying its gold
letter-glyph plate and the room name. Topics inside are `.topic` blocks: a
small uppercase `h4` in `--bone` behind a 2px `--acc` edge, then the copy.
Reason for a fourth heading level rather than reusing `h3`: an `h3` *is* the
title bar in this DNA, so six sections × five topics would render thirty
title bars and destroy the hierarchy (`checklists.md` Ch 7 — "Making everything
equally prominent"). One new small rule buys a real two-level structure.

**A locked Help block uses four ladder channels and NOT opacity.** Material
(unlit — flat `--panel`, no bevel, no foot), type colour (`--faint`), control
presence (no topics at all), unlock text (the milestone string, reused verbatim
from the tab button `title` it already ships). `--opacity-locked` is
deliberately not used here: DESIGN.md's own Player note establishes that
genuine readable text takes `--faint` at full opacity so it holds AA, and a
milestone string is genuine readable text.

### 5. The mono question gets an instrument before it gets an answer

`--font-data` (default `monospace`) replaces the ~30 literal `monospace`
declarations that style *product* text. The two *annotation* classes
(`.mockNote`, `.stateLabel`) keep the literal, so the specimen changes the
surface and not the commentary. `grind-uifont.html` is the same generator
output with one token flipped. Grind is the right specimen: 15 rows, four
states, numeric columns — the hardest case for a proportional face and the
easiest place to see whether mono is doing register work or just texture.

The answer is deferred to the render, per the user's explicit instruction.

### 6. Copy relocation — one correction to JOURNEY's verbatim Help copy

Cutting `If the party dies you keep 40% of what they found.` from the
Difficulty topic. Not a scope change and not a new judgement: JOURNEY's own
one-owner discipline assigns the wipe/40% rule to `How a run works`, and the
sentence only survived into a second row because the two strings lived on
different blocks of the live tab. Declared here rather than silently applied.

---

## Deviations declared before production

| # | Deviation | Why |
|---|---|---|
| 1 | `player.html` gets its six copy cuts even though the plan's IN list names five surfaces | The phase's Goal is *"apply DNA v4 and the Phase 2 copy relocation"*, and `**Produces:**` already regenerates `player.html` for the chat chrome. Leaving 6 of 22 relocations unapplied would put the same six explanations on Player *and* on Help simultaneously — the exact tutorial-in-a-HUD this plan exists to remove. |
| 2 | `MATERIAL_SPECIMEN` deleted from `boss.html` | §3 above. |
| 3 | `--logline` token retired | Its only consumer is `#logHead`, which is retired. Its `contrast.mjs` pair goes with it, otherwise the checker reports `MISSING`. |
| 4 | `LADDER` annotation text corrected (`gold left edge` → `the room's accent`) | It has been false on every v4 surface since Phase 2.5 and is printed on all seven. |
| 5 | Help Difficulty topic loses one sentence | §6 above. |
| 6 | `contrast.mjs` now parses all seven mocks | It exists to read the CSS that actually shipped; two of seven is no longer that. |

---

## Recommendation

**BUILD**
