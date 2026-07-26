# Design: Last Warmth

> **v4, 2026-07-26 — read `# Visual DNA v4` FIRST.** v4 supersedes v3's
> **colour rule** and **construction weight**, and — as of **Phase 3** — the
> **shell/terminal register** (retired entirely; see `## The chat window (v4,
> Phase 3)`) and the **monospace data face** (now the UI face; see `## The data
> face (v4, Phase 3)`). It supersedes nothing else. v3
> still owns the four constructions, the signature move, the type voice and the
> archetype, and it is still the section that explains WHY the client looks like
> a window. The v1 body and `# Visual DNA v2` remain superseded by v3.
>
> Everything not named in a supersede table — the semantic tiers, the dimension
> scale, the type-scale values, the component inventory, the state-ladder
> mechanics, the canvas token module, the motion budget, and the entire surface
> ramp — is carried forward unchanged and is still the contract.
>
> **Reading order:** `# Visual DNA v4` (current — colour + weight) →
> `# Visual DNA v3` (current — construction, type, archetype) →
> `# Visual DNA v2` (rejected, kept for the record and because v3 re-uses four
> of its tokens) → the v1 body (still the law for the base palette, the tokens
> and the components).

---

# Visual DNA v4

**Date:** 2026-07-26 · **Status:** proposed, evidence passing, awaiting the
user's look sign-off.
**Proved on:** `internal/mocks/boss.html` (hero surface, lane 2) and
`internal/mocks/player.html` (list surface, lanes 1 + 3 + 4) →
`internal/mocks/shots/{boss,player}-375.png`. The v3 renders are preserved as
`boss-375-v3.png` / `boss-1280-v3.png`; the pre-v4 Player render is
`player-375-v1.png`.
**Propagated (Phase 3) to all seven:** `training`, `grind` (where lane 4 is
proved), `delve`, `dungeon` and the new `help` surface, plus the shared chat
window. `grind-mono.html` is a specimen, not a surface — the font treatment
DW-3.9 rejected, kept as evidence.

## Why there is a v4

v3 was accepted only provisionally — *"acceptable for now"* — and on further
review the user said:

> *"the UI itself is ok. maybe more stylised aesthetic is how i would have
> preferred. adding colour where it could potentially add more flavour could be
> nice as well."*

Both halves are spent here, deliberately **before** the look propagates to the
remaining five surfaces, so the revision costs one surface pair rather than
seven.

**The diagnosis, stated plainly.** v3 did exactly what it set out to do and
moved not one hex — which was the right call for a construction pass and the
wrong end state. The reason every surface still reads identical is not the
carpentry, it is a rule written into v1 and carried through v2 and v3 unchanged:

> *`warn`/`alert`/`copper` are functional-semantic accents and **never** enter
> an identity role.* + *Gold is identity only.*

Under that rule the client has exactly **one** identity colour for **ten doors,
seven rooms, seven rarities and fifteen zones**. No amount of bevel fixes that,
because the problem is not depth — it is that nothing on screen is allowed to
be *about* anything.

## The amended colour rule

**Colour MAY carry identity.** That is the amendment, and the user made it
explicitly. What survives it is the part that was load-bearing all along:

> **No hue is decorative. Every hue attaches to a meaning the player can name,
> in exactly one of four lanes. A hue with no fact behind it is not allowed on
> screen.**

### What gold is now

Gold did not leave; it **changed job**. It stopped being *the* identity — which
is what forced it to stand in for every kind of importance at once — and became
**the client's own voice**:

| Gold still owns | Gold no longer owns |
|---|---|
| the letter-glyph plates on every window | the Warden's name (→ lane 2) |
| the primary action's fill (`#descendBtn`) | the active tab chip (→ lane 3) |
| a maxed / complete state (`.amCell.max`, `.pip.own`, `--row-stat-maxed`) | the live row's edge and name (→ lane 3) |
| the hero number and the log's event lines | the started trophy set's edge (→ lane 3) |
| the upgrade marker glyph in the stash | the stash upgrade row's edge (→ lane 1) |

That split is what lets a door and a room each own a hue without either of them
competing with gold: **gold is the client talking about itself; a lane hue is
the client talking about the world.**

## The four colour lanes

Every lane member is **solved, not picked**: binary search in OKLCH for the
lightness yielding relative luminance **Y = 0.27**, the value that clears 4.5:1
on `--field`, the lightest ground on the ramp. Consequence: every hue in every
lane clears every ground *identically* (4.79–4.84:1 on `--field`, 6.14–6.20:1
on `--well`). That is `chapter-08-color-science.md`'s Critical requirement —
qualitative categories must not carry unequal perceptual weight — and it is why
`contrast.mjs` can gate 28 new hues as one uniform check.

**Chroma, not hue, is the lane separator.** Seven tabs + ten Wardens + seven
rarities + five bands cannot all sit ≥45° apart on one wheel; that is
arithmetic. So the lanes separate on a second axis instead.

### Lane 1 — RARITY · *how many affixes an item rolled*

`rarity.js`'s shipped hues, promoted from a text tint to a real plate. **Invents
no new meaning** — the ramp already existed, it just had no surface.

| Token | Hex | Tier | Note |
|---|---|---|---|
| `--rar-common` | `#b8b8b8` | Common, 0 affixes | unchanged |
| `--rar-uncommon` | `#5fd35f` | Uncommon, 1 | unchanged |
| `--rar-rare` | `#5a8bd6` | Rare, 2 | unchanged |
| `--rar-epic` | `#bc6ce2` | Epic, 3 | **LIFTED** from `#b061d6` — 4.15:1 on `--field`, a real WCAG 1.4.3 failure |
| `--rar-legendary` | `#e08a2e` | Legendary, 4 | unchanged |
| `--rar-mythic` | `#e86362` | Mythic, 5 | **LIFTED** from `#d85454` — 4.00:1 on `--field` |
| `--rar-origin` | `#e8df8a` | Origin, 6 | unchanged |

Both lifts preserve OKLCH hue and chroma exactly and move only lightness. They
were invisible until now because **`contrast.mjs` had no rarity pair at all** —
the whole lane was un-gated. Required behaviour change **#8**.

**Construction.** An item is a raised **plate**:
`--rar-plate-<tier>: color-mix(in oklab, var(--rar-<tier>) 16%, var(--plate-foot))`,
a `--border-frame` edge in the pure hue, the item name in the hue, the meta line
in `--bone`. **An EMPTY slot is a socket, not a plate** — nothing is in it to
raise, and that is the material carrying the state exactly as a disabled control
does.

**Where it attaches:** equipped gear plates, stash rows, scrap pills, drop
loglines. **Item objects only, never chrome.**

> **`--dim` / `--recede` / `--faint` are BANNED on a rarity plate** (4.04–4.63:1
> there). Fixed by ROLE, not by value — the same call v2 made for `--recede` on
> `--field`. A rarity plate carries `--bone` and its own tier ink, and takes its
> hierarchy from size and weight instead. `contrast.mjs` records the ban.

### Lane 2 — WARDEN · *which door you are at*

Ten doors, ten hues, on an even **decagonal walk** (36° apart, chroma **.09** —
the loudest lane, because it appears alone on its own surface). The walk starts
30° off gold so no door ever wears the client's own colour. **Qualitative, not
ordinal**: a door is a *place*, not a magnitude — magnitude is lane 4's job.

| Token | Hex | Warden |
|---|---|---|
| `--w1` | `#859554` | Vess, Warden of the First Door |
| `--w2` | `#5a9b74` | Maren — the Second (the frontier in the mock's save) |
| `--w3` | `#3a9c99` | Korrin |
| `--w4` | `#4a97b7` | Osei |
| `--w5` | `#728ec6` | Thale |
| `--w6` | `#9984c0` | Ilva |
| `--w7` | `#b57ca6` | Domar |
| `--w8` | `#c27a83` | Sef |
| `--w9` | `#be7f5f` | Yara |
| `--w10` | `#a88a4b` | The Last Warden |

`--w-active` is set by the client to the door you are standing at; everything on
the Boss tab reads from it, so re-tinting a door is **one assignment**.

**Where it attaches:** the Warden's name (`--fs-warden`), the window frame
(`--w-frame: color-mix(in oklab, var(--w-active) 24%, var(--line))`), the
name-plate's closing groove, the active door chip, the Warden's own dialogue
edge, and the arena's floor seam + `--floor-glow`.

> **Ink and its own ground never share a hue.** A hue-tinted plate under its own
> hue costs that hue its contrast — measured at **3.87:1** for `--w2` on a 16%
> `--w2` plate. So the tint goes on the frame, the groove and the glow, and the
> name-plate ground stays neutral. This is a general rule, not a Warden one.

### Lane 3 — TAB ACCENT · *which room of the client you are in*

Hexagonal walk, chroma **.05** — deliberately a third of the Warden lane's
saturation. **Chrome must never out-shout content.**

| Token | Hex | Room | The meaning |
|---|---|---|---|
| `--acc-boss` | `= var(--w-active)` | Boss | Boss has no accent of its own: **its room IS the door** |
| `--acc-training` | `#689698` | Training | the script console |
| `--acc-grind` | `#7d9478` | Grind | copper, growth — the one green, on a named content cue |
| `--acc-player` | `#7c8fad` | Player | you |
| `--acc-delve` | `#9e86a3` | Delve | the descent |
| `--acc-dungeon` | `#ad8483` | Dungeon | the difficulty ladder |
| `--acc-help` | `#9f8b6c` | Help | the manual — paper |

Each surface declares `--acc` **once**, on `<main>`. Nothing downstream names a
specific hue, so re-skinning a room is one assignment.

**Lane 3 attaches in two places, and they are counted separately** (see
`## The co-occurrence rule` — this split is the amendment the Phase 2.5 review
forced, and it is the sentence v4 was missing):

| | Where | How many lane-3 hues are on screen |
|---|---|---|
| **The legend** (`#tabs` only) | the tab chip's 2px foot bar | **all seven, always, on every surface** |
| **The surface** (everything else) | the active chip's ink + border; the window frame tint; the `h3` title bar's closing groove; the live row's edge and name; the started trophy set's edge; the ranked Armory cell's edge | **exactly one** — the surface's own `--acc` |

**Chrome only. Body text stays neutral.**

### Lane 4 — POWER BAND · *how deep / how strong*

Five steps, cool → hot, **hue-only at constant luminance** — not an HSL
lightness ramp (`chapter-08`, High: perceptual lightness varies wildly across
hues and the data gets misread).

| Token | Hex | Band | Zones | Reads as |
|---|---|---|---|---|
| `--band-1` | `#6890c4` | coldest | z1–z3 | the shallow end |
| `--band-2` | `#399ba0` | | z4–z6 | |
| `--band-3` | `#629b6e` | | z7–z9 | |
| `--band-4` | `#a38c4a` | | z10–z12 | |
| `--band-5` | `#c17d6b` | hottest | z13–z15 | the frontier |

**This lane renders as a FILLED CHIP, not as ink**, and that is the whole reason
it does not collide with the three ink lanes: the chip ground
(`--band-N-chip: color-mix(in oklab, var(--band-N) 30%, var(--well))`) sits at
**L\* ≈16.5** while every ink lane sits at **L\* 59**. Band and accent are in
different **luminance tiers** even where their hues are close. The bright hex
only ever draws the chip's 2px lip.

**Where it attaches:** a zone row's IP range, a gear or stash item's IP figure,
the Armory's zone marker. **Only inside a chip. Never an edge, never a ground,
never ink.**

## The co-occurrence rule

**AMENDED 2026-07-26**, after the Phase 2.5 review measured the rendered mocks
against it and found the document wrong, not the pixels. The old rule read
*"one chrome lane + at most one content lane per surface, hard cap: two"* and
the Boss row read *"lane 2 only"* — while `boss-1280.png` plainly showed the
persistent tab row carrying all seven lane-3 foot bars at once. Two statements
in one document, one of them false. The amendment below picks the pixels,
because the seven-hue row is a **legend** — a fixed colour key for seven
destinations — and a legend is not identity competing on the surface. What the
old rule was actually protecting is stated properly here instead of implied,
and the legend is bounded so it cannot quietly grow into the thing the cap
exists to stop.

**Two tiers. They are counted separately, and only Tier B has a cap.**

### Tier A — the navigation legend

> **`#tabs`, and nothing else in the client, may show more than one hue of one
> lane at the same time.**

| Bound | Value | How a reader checks it |
|---|---|---|
| **Elements** | exactly one selector: `#tabs button` | grep `--acc-tab`. It is *set* on `#tabs button.t-*` and *read* in `#tabs button`'s box-shadow. Nowhere else, in any file. If a second selector ever sets or reads it, the bound is broken |
| **Lanes** | lane 3 only | no `--w*`, `--rar-*` or `--band-*` token may appear inside a `#tabs` rule |
| **Chroma** | ≤ **.05** — a third of lane 2's | the lane-3 table above is the whole legal set, and it is built at .05 |
| **Geometry** | the chip's **2px foot bar** only. Inactive chips keep `--dim` ink and a neutral border | colour identifies the *room*; the pressed construction and the ink still identify the *current* room, so the legend is an added channel, never a replacement for one |
| **Growth** | a second multi-hue persistent element is a **DESIGN.md amendment**, not an implementation choice | this row is the bound. Tier A is a closed set of one |

**The one alias, stated rather than discovered.** `--acc-boss` is a lane-3
token whose *value* is `var(--w-active)`. Lane membership is by **token**, not
by hex — so the legend carries seven lane-3 members, exactly one of which is
defined as an alias of lane 2. It is deliberate and it earns its keep: the Boss
foot bar tells you which door you are standing at from inside any other room.
No other lane-3 token may alias anything.

### Tier B — the surface

> **At most two lanes. Hard cap: two. Three lanes is a clown car.**

**How to count a surface's lanes — three steps, in order:**

1. **Skip `#tabs`.** It is Tier A, bounded above.
2. **Skip lane 4.** It renders only as a filled chip whose ground sits at
   **L\* ≈ 16.5** while every ink lane sits at **L\* 59** — a different
   luminance tier, not a competing ink. The bright band hex only ever draws the
   chip's 2px lip. *(This exemption used to be inferable from three separate
   sentences and stated as a rule nowhere; the Phase 2.5 review logged that as
   a Minor. It is a rule now.)*
3. **Count the distinct lanes colouring ink, edges, frames, grooves or plates**
   on everything that remains. That number is the surface's lane count, and it
   must be **≤ 2**.

Step 3 is what makes the table below true: **lane 3 contributes exactly one hue
to Tier B** — the surface's own `--acc`, declared once on `<main>`. The
seven-hue row lives in Tier A and is not counted here.

| Surface | Tier B lanes | Count | Why not more |
|---|---|---|---|
| **Boss** | lane 2 (`--acc` aliases `--w-active`) · lane 4 in the Zones specimen's chips, exempt by step 2 | **1** | Boss's accent **is** the Warden's hue, so it carries exactly one identity hue rather than two |
| **Player** | lane 3 (`--acc`) + lane 1 (items) · lane 4 in chips, exempt by step 2 | **2** | rarity and accent never share an element |
| **Grind** | lane 3 (`--acc`) · lane 4 in chips, exempt by step 2 | **1** | |
| **Training / Delve / Dungeon / Help** | lane 3 (`--acc`) | **1** | nothing on them has a rarity or a power band |

**Mutually exclusive:** Warden ⟂ tab accent (Boss's accent is the Warden).
Rarity ⟂ power band **on the same element** — they share a stash row but never a
slot: rarity owns the name and the edge, the band owns the IP chip.

### The honest limit, stated numerically

Because the wheel is finite, some accent hues sit close to some rarity hues:

| Accent | Nearest rarity | Gap |
|---|---|---|
| `--acc-player` (h260) | `--rar-rare` (h259) | **1°** |
| `--acc-grind` (h140) | `--rar-uncommon` (h143) | **3°** |
| `--acc-delve` (h320) | `--rar-epic` (h314) | **6°** |
| `--acc-dungeon` (h20) | `--rar-mythic` (h23) | **3°** |

Player is the surface where the first two actually co-occur. Three things keep
them apart, and they are the reason the rule above is written as it is:

1. **Chroma tier** — the accent is a third of rarity's saturation.
2. **Element class** — the accent touches only chrome; rarity touches only items. They never share an element.
3. **The word** — every item prints its tier name (`· Legendary ·`) beside the hue.

Rotating the accent walk to maximise the minimum gap **was computed** (+33°,
raising the worst gap to 9°) and **rejected**: it buys 8° and destroys every
accent's meaning, which is the only thing that makes a hue legal here at all.

## Colour is never the only channel

`chapter-08-color-science.md`, Critical (~10% of male users). Every lane keeps a
redundant cue that already existed and was not invented for this:

| Lane | Redundant cue |
|---|---|
| Rarity | the tier name is printed as a word on every plate, row and pill |
| Warden | the door's name and title are the largest type on the surface |
| Tab accent | the pressed construction and the ink both still mark the current tab |
| Power band | the IP number or zone index rides **inside** the chip |

## The state ladder under v4 — six channels, none lost

The plan that produced the ladder is the reason this section exists at all, and
nothing in it moves. All six channels survive: **edge presence, type colour,
control presence, unlock text, material lift, socket lit-ness.** The only thing
that changed is **which hue fills the "live" slot**, and within a room it is
constant.

| State | Under v4 |
|---|---|
| **live** | lifted onto its own `--inset` → `--well` ground, **`--border-frame` edge in the ROOM'S accent**, name in the accent, controls present, filling bar (still `--gold`) |
| **dormant** | flat in the socket, neutral edge, dim name, faint stat, control present reading 0, empty track |
| **struggling** (Grind only) | flat, full opacity, **`--warn` edge and `--warn` stat — unchanged** |
| **locked** | `--opacity-locked`, **unlit**, no edge, no control at all, and the row prints the word "locked" with its unlock condition |

`--warn` still owns `struggling` alone.

> **CORRECTED 2026-07-26 (Phase 3), on the rendered Dungeon surface.** v4 said:
> *"No accent is placed where it could be mistaken for it: the nearest is
> `--acc-dungeon`, and Dungeon is the single tab with no struggling state."*
> **The second clause is false.** `dungeon.html` renders **Mass Dispel** as
> `.row.struggling` and always has, two rows under **Sunder**, which is `.active`
> and therefore wears `--acc-dungeon`. So the closest accent/`--warn` pair in the
> whole palette (8° apart) is not merely possible — it is **on screen, adjacent,
> on the one surface v4 claimed it could not be.** The document was excusing the
> pair with a fact the mocks contradict, which is the same class of defect the
> Phase 2.5 review caught in the co-occurrence rule.

**The real separation, verified on `shots/crops/dungeon-duties.png` rather than
argued:** the two states never colour the same SLOT, and three channels part
them.

| | live (Sunder) | struggling (Mass Dispel) |
|---|---|---|
| **which slot is coloured** | the **name** (accent); stat is `--bone` | the **stat** (`--warn`); name is `--bone` |
| **material** | lifted onto its own `--inset` → `--well` ground | flat in the socket |
| **the word** | `3 assigned — blocked` | `2 assigned — NOT BLOCKED` |

That is the same three-part argument this document already uses for the 1° gap
between `--acc-player` and `--rar-rare` — **chroma tier, element class, and the
word** — and it is true here. The old sentence reached for a fourth reason that
was not. The pair stays; the excuse is replaced with the check.

Verified on the 375px renders — Grind draws all four states side by side with
both of its lanes active, Training draws live / dormant / locked ×11, and
Dungeon draws the adjacency above.

## Construction (v4) — v3's carpentry at full weight

v3's four constructions (WINDOW / TITLE BAR / SOCKET / CONTROL) and all seven of
its reproducibility rules are **carried forward unchanged**. What changes is
amplitude:

| | v3 | v4 |
|---|---|---|
| Window frame | `--border-frame` = 3px, in `--line` | **4px**, in the room's tinted `--w-frame` |
| Bevel | 1px hairline | **`--bevel` = 2px** — v3's own review Major was "a 1px edge at 10 L\* is a rumour"; the same argument, one step on |
| Title bar label | `--fs-body` (13px) | **`--fs-display` (16px)** |
| Title bar groove | 1px `--edge-lit` | **2px of the room's accent** |
| Warden's name | `--fs-warden` 36px, gold | **40px**, in the door's own hue |
| Corner mark | none | **four rivets per title bar** |
| Section mark | none | **a gold letter-glyph plate per title bar** |

### The corner rivet

Four `--edge-lit` squares drawn as **background layers** (v3 material rule 5:
partial edges are background layers, not borders), inset `--rivet-inset` from
each corner of every title bar.

> **Four, always. Symmetric, always. Complete, always.** A missing, thinner or
> offset rivet reads as damage instantly, so the construction makes that
> *unrepresentable* rather than merely discouraged. This is the no-decay veto
> expressed as CSS, and it is the same discipline v2's corner-bracket frame had.

### The letter-glyph plate

**One capital, in the UI face, on the CONTROL construction shrunk to a square**
(`--glyph-plate`), in `--gold`. The letter is always the block's own initial, so
it cannot drift into meaning something the heading does not already say.

> **This is TYPE on a plate, not an icon.** The project's standing veto is on
> *AI-generated* icons and names letter glyphs and hand-made marks as the
> exception. There is no raster, no path and no generated art anywhere in the
> emitted files, and `build.mjs`'s external-reference assertion proves it
> mechanically rather than by claim.

## The chat window (v4, Phase 3) — the shell register, retired

**Added 2026-07-26 by user decision.** This section **supersedes** the shell/
terminal carve-out wherever this document grants it: the v1 `## Direction`
sentence *"The shell/terminal register (`maintenance@dead-server:~$`, `PLAYERS
ONLINE`) stays confined to the log and meta edges"*, and the
`### Hardcoded-color audit` row for `#logHead`.

**What the user said:** *"i want to strongly reconsider the log aesthetic
especially this line as it doesnt really fit."*

**Why it had to go — three faults, not one:**

1. **A terminal inside an MMO client.** Nothing else in the game is a shell. The
   player never types a command; there is no shell. It was set dressing
   imitating an interface.
2. **It named the server a dead one.** The premise is the exact opposite — the
   server WORKS, it is in maintenance mode, the players left. This document bans
   decay signifiers, and that one sat in shared chrome on every screen.
3. **The block cursor implied an input.** There is none.

**Why four reviews missed it.** Every one of them checked that the shell
register was CONFINED. None asked whether it should exist. **A confined premise
error is still a premise error**, and "it is only at the edges" is not a defence
of a thing that should not be there at all.

**The replacement: the honest MMO furniture.** A bottom-of-screen log in an MMO
client is a **chat panel**. In a dead MMO it is also the saddest object on the
screen — **System** carries the traffic (drops, kills, offline gains) while
**General** sits empty, and `Players online: 1` finally has the place an MMO
client actually puts an online counter. **The emptiness does the storytelling
the decay string was faking.** That is ABSENCE, which is the target feeling; the
prompt was DISREPAIR, which is banned.

| Part | Construction | Token |
|---|---|---|
| `#chat` | WINDOW | `--border-frame` frame in **`--line`**, `--radius-window`, `--bevel`, hard foot |
| `#chatHead` | TITLE BAR (joins the `h3,.frame` rule, so the four rivets come for free) | groove in **`--edge-lit`** |
| `.chan` ×2 | CONTROL; the active one wears the pressed construction permanently, at `--bevel` weight | ink `--bone` active / `--dim` idle |
| `#log` | SOCKET (joins `.rowlist,.canvasStub,#dialogue`) | `--well` |
| `.chatEmpty` | — | `--faint`, italic |

**It carries NO lane hue, and that is a rule rather than an omission.** A
`section.game` takes the room's `--acc` on its frame and its title-bar groove;
the chat window takes `--line` and `--edge-lit`. Persistent chrome that
re-tints per room would be a **second multi-hue element in the chrome**, which
`## Never (v4)` closes Tier A against — a legend turning into wallpaper. Tier B
lane counts on all seven surfaces are unchanged by this window's existence,
which is what *"chrome must not acquire a lane budget of its own"* actually
asks for.

**Zero new hexes.** Every ink it uses on every ground it uses was already in
`contrast.mjs`'s gated set, so the contrast surface cannot regress by
construction rather than by luck. `--logline` (`#598368`) is **retired** — its
only consumer was `#logHead`, and its gated pair went with it (190 → 189).

**The empty state must read quiet, not broken.** Copy: `Nothing here.` The
window around it is intact, lit and selectable; the copy states the fact and
does **not narrate the silence**. A sentence *about* the emptiness would be the
decay register coming back as prose, which is the fault being fixed.
**No badge, no unread count, no notification dot** — that is an obligation
mechanic and the veto on those is standing.

## The data face (v4, Phase 3) — mono, decided on pixels

**Decided 2026-07-26 on the user's explicit instruction** — *"render it both
ways and judge on the rendered surfaces"* — closing a watch item two prior
reviews raised and neither resolved. **The data face is now the UI face**
(`--font-data: var(--font-ui)`); monospace survives only on the mock's own
annotation classes.

The ~30 literal `font-family: monospace` declarations became one token,
`--font-data`, precisely so the alternative could be rendered at all.

**Evidence:** `internal/mocks/grind.html` (UI face) against
`internal/mocks/grind-mono.html` (**the rejected treatment, kept**) — one token
apart, byte-identical otherwise. Full-page renders at `shots/grind-375.png` and
`shots/grind-mono-375.png`; 1:1 detail crops at `shots/crops/grind-rows.png` vs
`grind-mono-rows.png`, `ledger-ui.png` vs `ledger-mono.png`, `armory-ui.png` vs
`armory-mono.png`. The crops matter: a 6,000px full-page shot downscales the
type to unreadability, which is the wrong instrument for a type decision, so
`internal/mocks/crop.mjs` was added to take clipped captures at 2x.
(`shots/` is gitignored, as it has been since the first mock phase.)

**Why the UI face won — three findings, in order of weight:**

1. **The register defence does not survive inspection.** Mono was held to carry
   `REMAKE-DESIGN.md` §16's *"botter's toolkit"*. But §16 is a **naming**
   register — multiclient, account creator, script version, overclock,
   autoclicker, packet-replay script, tick-rate exploit, proxies — and every one
   of those words is still on the surface. The register was never in the font.
2. **Column alignment never needed mono.** `font-variant-numeric: tabular-nums`
   is already set on `body` and Tahoma honours it. Verified on the two blocks
   that are genuinely tabular — the crit ledger and the 45-cell Armory grid —
   both hold their columns in the UI face (`ledger-ui.png`, `armory-ui.png`).
3. **Mono cost real surface.** Grind at 375px: **6,438px** tall in mono,
   **5,734px** in the UI face — **11% shorter**, and the live row's stat line
   stops wrapping. On a phone-first surface with 15 rows that is a measurable
   price paid for texture.

And the argument that closes it: *"the client reads like a terminal"* is the
same complaint one level up that produced the chat-window change. Retiring the
shell prompt while every stat row still rendered in a console face would have
fixed the symptom and left the cause.

**What keeps monospace, deliberately:** `.mockNote` and `.stateLabel`, the two
mock-annotation classes. Commentary about a mock should not be in the mock's own
voice, and holding them literal is what let the specimen change the surface
without changing the text describing it.

## Canvas scene spec (v4) — what the arena draws per Warden hue

The arena stays a labelled canvas placeholder in the mock (it is CANVAS-drawn;
faking it in HTML would be a lie about what the surface is). v3's Canvas scene
spec is carried forward, with the Warden lane added:

| Element | Token | What the hue does |
|---|---|---|
| floor band | `--floor-glow` (= 26% `--w-active` into `--well`) | light under **this** door — the room's own warmth, cool at Korrin's door and warm at Yara's |
| floor seam | `--w-active` | the one hairline that says where the floor is; matches the DOM's frame so canvas and DOM agree whose room it is |
| boss sprite rim / silhouette edge | `--w-active` | the Warden reads as belonging to the door, not as a sprite pasted into it |
| damage cracks on the boss | `--w-active` at the crack's lit edge | progressive damage stays in the door's own key rather than importing a second hue |
| hero sprite | unchanged — `--bone` / neutral | **you are not the door.** The player never takes a Warden hue; that separation is the point of the lane |
| crit-tier damage numbers | unchanged — `--gold` / `--bone` | numbers are the client speaking, so they stay in gold's family |
| `BREACHED` reveal | unchanged — `--fs-colossal` 52px, `--gold` | the peak is the client's own moment, not the door's |

## Required behaviour changes (v4)

v1's five, v2's #6 and v3's #7 all still stand. Added:

8. **`rarity.js`'s `epic` and `mythic` colours are real WCAG 1.4.3 failures.**
   `#b061d6` → `#bc6ce2` and `#d85454` → `#e86362` (4.15:1 and 4.00:1 on
   `--field`). OKLCH hue and chroma preserved; lightness only. Applied in the
   mocks' tokens, not yet in `rarity.js` — same posture as v2's
   `--alloc-control` and `button:disabled` fixes.
9. **The tab row is seven wide at `repeat(4,1fr)`.** Applied in the mocks this
   phase, matching Phase 2's own accepted specimen
   (`internal/mocks/tabrow-specimen.html`, variant B) and JOURNEY.md's IA.
10. **The shell prompt is deleted, and three things die with it** (Phase 3 —
    see `## The chat window (v4, Phase 3)`). `index.html:204`'s prompt string
    and its `<span class="cursor">` are **already removed this phase**, since
    DW-3.7 scopes that one edit into the design pass. Still pending the
    integration task: `style.css`'s `#logHead` rule — including its hardcoded
    `#4e7a5e`, the last un-tokenized colour a prior review raised as Critical —
    plus `.cursor`, `@keyframes blink`, and the `.cursor` reference inside the
    `prefers-reduced-motion` rule, which become **dead CSS** the moment the
    element goes. Named here so the next pass deletes them rather than
    rediscovering them; `.cursor` joins the dead-CSS list in the v1 body.
11. **`--font-data` replaces ~30 literal `font-family: monospace` declarations,
    and resolves to the UI face** (Phase 3 — see `## The data face (v4, Phase
    3)`). In `style.css` this is one token plus a sweep of the same ~30 sites.
    `.mockNote` / `.stateLabel` are mock-only and do not exist in the shipped
    stylesheet.

## Contrast evidence (v4) — computed, not asserted

`node internal/mocks/contrast.mjs`, extended this phase to (a) resolve
`color-mix(in oklab, …)` and `var()` alias tokens so every derived ground stays
**computed rather than asserted**, (b) print **L\* beside every ratio**, and
(c) gate the four lanes and a set of surface pairs by **L\* separation**.

```
all 189 gated pairs + 16 L* surface pairs pass       (was 49 — coverage GREW ~4x)
```

**Phase 3 update:** the checker now parses **all seven** surfaces, not two — it
exists to read the CSS that actually shipped, and two of seven stopped being
that once the other five were recomposed. The count moved 190 → 189 for exactly
one reason: `--logline`'s pair retired with `#logHead`. **No pair was loosened
and no pair moved.** The chat window and the Help surface added **zero** hexes,
so both are covered by pairs that were already gated.

Not one previously-passing pair moved. The growth is entirely new coverage: the
rarity lane had **zero** gated pairs before this phase, which is exactly how two
live AA failures survived three design passes.

The file now distinguishes three kinds of check, which v4 forced apart:

| Kind | Instrument | Why |
|---|---|---|
| text | ratio ≥ 4.5:1 | WCAG 1.4.3 |
| informational non-text (edges, chip lips) | ratio ≥ 3.0:1 | WCAG 1.4.11 |
| **surfaces** (grounds, frames, plates, chips) | **L\* separation ≥ 4.0** | the v2 lesson: the `+0.05` flare term crushes dark-on-dark ratios toward 1.0, so `--rar-plate-origin` on `--panel` reads 1.29:1 and is plainly visible at 10.4 L\* apart |

Two further distinctions the file did not previously have:

- **Gradient stops inside one object** (`--panel` → `--plate-foot`, 2.6 L\*) are
  reported under `FALL`, never gated. They are meant to be a soft fall, not a
  perceptible step; gating them would assert that a window body should look like
  a staircase, which is the opposite of "a gradient lights the TOP".
- **Banned-and-failing** vs **banned-by-role**. The first (`--recede`/`--faint`
  on `--field`) is now genuinely *asserted* — the run fails if one ever starts
  passing, which is the check the comment always claimed and the code never
  made. The second (the quiet tiers on a rarity plate) is a role rule that some
  plates measure *above* 4.5 on, so it is reported, not asserted. Conflating
  them produced four false failures on the first run of this phase.

## Never (v4)

Carried forward from v3 in full, **minus one amendment**, plus three:

- **AMENDED — "no icon of any kind".** v3 banned every mark. v4 permits exactly
  one: a **letter glyph in the UI face on a plate**. Still no raster, no path,
  no drawn symbol, and above all **nothing generated**. The project veto is
  unchanged and absolute.
- **No hue without a fact.** A colour that does not attach to a named meaning in
  one of the four lanes does not go on screen. This is the whole of the amended
  rule, and it is the entry that stops v4 becoming decoration.
- **Never more than two lanes in Tier B of one surface.** Counted by the
  three-step procedure in `## The co-occurrence rule` (skip `#tabs`, skip
  lane 4, count the rest). A hard cap, not a guideline. Three lanes is a clown
  car.
- **Never a second multi-hue element in the persistent chrome.** Tier A is a
  closed set of exactly one: `#tabs button`'s 2px foot bar. A second element
  showing several hues of one lane at once turns a legend into wallpaper, and
  that is precisely the failure the Tier B cap is for. Adding one is an
  amendment to this document, not an implementation choice.
- **Never let a lane hue replace a state channel.** Colour identity is an
  ADDITIONAL channel. If removing every hue from a surface would make its states
  ambiguous, the surface is wrong — not the palette.
- **No hue-tinted ground under its own hue.** Measured at 3.87:1. Tint the
  frame, the groove and the glow; leave the ink a clean ground.

## Open questions (v4)

- **The rarity ramp's own luminances are uneven** — `--rar-uncommon` sits at
  L\* 76 while `--rar-legendary` sits at L\* 65, so a lower tier is *brighter*
  than a higher one and the plate grounds inherit that spread (L\* 12.8–17.8).
  These are shipped game hexes and lane 1's charter is to invent no new meaning,
  so only the two AA failures were touched. **Rebalancing the full ramp to a
  monotone luminance ladder is a real improvement and a separate decision** —
  it changes a colour players already recognise.
- **`CSS_V3` and `CSS_V4` are still two strings behind two flags**, now scoped
  to Boss and Player. The follow-up phase pastes both into `CSS`, drops the
  flags and deletes the split. Marked with a `ponytail:` comment at the seam.
- **Nothing here is applied to `style.css` or `rarity.js` yet.** v4 inherits
  v1/v2/v3's position: the DESIGN.md gate holds until the user confirms the
  direction on real pixels.
- **Copy is deliberately untouched.** Phase 2 specified a 22-row copy
  relocation and Phase 3 applies it. Cutting the teaching copy in the same pass
  as the colour would have confounded the visual judgement, which is why the
  mocks still carry their full explainer subs.

---

**Date:** 2026-07-25 · **Status:** LOCKED — contrast evidence passing (see report below); direction confirmed by the user 2026-07-25, closing DW-3.1. The 5 required code changes below were deferred by the same decision to a single integration pass after Phase 6; nothing in this document is applied to shipped code yet.
**Archetype:** ~~Ruler + Sage~~ → **SUPERSEDED by v3: Everyman + Sage** (see `# Visual DNA v3 ## The archetype, re-derived rather than defended` — the Ruler reading produced the look the user rejected, so it was re-derived rather than defended) · **Register:** restrained/data-dense structure · expressive at: BREACHED reveal, enhance feedback, maxed/complete states
**Grounding:** a 2000s MMO raid client's UI chrome (gold small-caps headers, gear-slot panels, boss-frames) + a mid-2000s botting-forum/sysadmin console (monospace stat rows, tabular numerics) — restated directly from `REMAKE-DESIGN.md` §16's own three-register lexicon, not invented for this pass
**DNA:** systematization pass, not a fresh divergent generation — see `## Why this isn't a diverge/critique/converge pass` below
**Composition:** existing, unchanged — dense stat rows (`.rowlist`, the Armory grid, Trophy pips), bordered panels (`section.game`), no cards, no radius, no shadows (already the correct "Data-Dense Professional" discipline for this content). **The "no radius, no shadows" half of that line is SUPERSEDED by v3** (`## Radius (v3)`, `## Material (v3)`); the Data-Dense Professional base and the density discipline are carried forward. **Dead-CSS list, extended per review round 3 (grepped every name below across `index.html` + every `.js` file — zero references, confirmed independently, not taken on the prior review's word):** `.ztable`, `#pullBtn` / `#pullBtn:disabled` (the retired pull-to-attempt mechanic), `#ticketGain`, `#tierAtk`/`#tierSpeed`, `#gmSec`/`#gmPanel` (the retired GM tab/ticket economy), `.tier-risk`/`.tier-nightmare` (found in this pass — not in the review's own list, but the same class of orphan). None of these render, so none carry a live contrast obligation, but their selectors and any hardcoded hex inside them are named here so this document never again cites one as a shipped fact (the exact error DW-3.3's gold-CTA citation made last round — corrected below).
**Pins:** none — this phase systematizes an already-shipped, already-approved look; nothing was pinned because nothing was dealt

---

# Visual DNA v3

> **PARTIALLY SUPERSEDED 2026-07-26 by `# Visual DNA v4`.** Three things below
> are superseded and nothing else is: (1) **`## Gold discipline (v3)`** and the
> v2 seven-item gold list it carries forward — see `# Visual DNA v4 ## What gold
> is now`; (2) the **weights** in `## Material (v3)` (frame 3px, 1px bevel) and
> the `--fs-warden` value in `## Type (v3)` — see `## Construction (v4)`; (3)
> the `## Never (v3)` entry **"no icon of any kind"**, amended to permit a
> letter glyph on a plate. Everything else in this section — the archetype, the
> remix, the four constructions, the seven reproducibility rules, the signature
> move, the type voice, the radius scale, the state ladder's channel model and
> the ramp it inherits from v2 — is **current and still the contract.**

**Date:** 2026-07-26 · **Status:** current for construction, type and
archetype; colour rule and construction weights superseded by v4.
**This is a DIRECTION CHANGE, not a refinement.**
**Proved on:** `internal/mocks/boss.html` → `internal/mocks/shots/boss-375.png`.
The rejected v2 render is preserved as `boss-375-deco.png` /
`boss-1280-deco.png`; the pre-v2 render remains `boss-375-before.png`.

## Why there is a v3

v2 was shown to the user and rejected: *"there's something about the script and
styling that irks me still. the early MMO UI vibe isn't there."* Asked which
early-MMO house style to aim at, the answer was **MapleStory**.

That is not a whim, it is a correction: MapleStory is already this project's
stated reference for the gear/enhance chase. The UI matching the mechanics is
the point, and v2's UI was matching a hotel lobby instead.

**The diagnosis, stated plainly.** v2 modelled *light* — a lit lip, a gradient,
a foot, a corner bracket. Light is the weakest depth cue on a dark ramp, and
every one of v2's marks was one pixel wide. What MapleStory models is
*carpentry*: a panel is a physical object with a thick frame you could grab, a
name-plate at the top, sockets cut into its face, and buttons with a top
surface. None of that existed in v2, and no amount of gold hairline was going to
produce it.

## The archetype, re-derived rather than defended

v2's chain was: archetype is **Ruler** + Sage → Ruler's primary families are Art
Deco and Swiss → implement Art Deco. The chain is valid. The **premise** is
wrong, and defending it would force the new direction through the label that
produced the rejected look.

Ruler's core desire is *control and prestige*; its documented visual gravity is
*"deep tones + gold/metallic, formal symmetry, serifs, luxury restraint"*
(`archetypes.md` Part A). Read that back against the product: a game client
whose entire premise is that the room is empty and the lights are still on. The
archetype belongs to *the product's relationship with its audience*
(`archetypes.md`'s own selection heuristic), and this client's relationship with
its one remaining player is not prestige. It is **belonging** — the last
friendly, familiar, still-maintained thing in a dead world. That is
**Everyman**: voice *friendly, unpretentious*; gravity *approachable
mid-contrast colour, familiar layouts*.

This is also the sharper reading of the premise. A cold, formal chrome makes the
game *about austerity*. A warm, welcoming, perfectly-working client with one
player in it makes the game about **absence** — which is the stated feeling, and
the one the no-decay veto exists to protect.

**Sage carries forward unchanged.** The honest, fully-displayed numbers
(guideline 5: every term is DISPLAYED) are Sage's contribution and nothing about
them moves.

> **Archetype (v3): Everyman + Sage.** Register: restrained/data-dense
> structure · expressive at: the Warden's name-plate, the BREACHED peak, the
> Descend action, enhance feedback, maxed/complete states.

Everyman's primary families are Warm Editorial and **Playful Geometric**.
Playful Geometric is the legal home of the borrowed axis — its documented
position is *"chunky grotesque… mixed radius… geometric shapes as decoration
with purpose, sticker/badge elements"*, which is MapleStory's construction
described in `archetypes.md`'s own vocabulary. Warm Editorial is rejected on
content pressure: dense tables and numbers push *away* from editorial families
(`archetypes.md` Part C, content-type table).

## The remix (`design-dna.md` §Remix Rules)

```
BASE       Data-Dense Professional   (content pressure: dense tables/numbers — unchanged since v1)
BORROWS    Composition / material    from Playful Geometric (Everyman's own primary)
KEEPS      Colour strategy + Motion  from the base — unchanged, not renegotiated
DOMINANT   Composition — the window / socket / control language IS the identity
```

Rule 2 (borrow one or two axes) and rule 4 (colour and composition rarely both
borrow) both hold, for the reason v2 already gave and v3 inherits: **the palette
was never the problem.** Rule 3 (one axis dominates) — composition again. What
changed between v2 and v3 is not *which axis* carries the identity, it is *which
family that axis borrows from*. That is the whole of the pass.

**Grounding (v3) — the collision:**

> **MapleStory's window carpentry** (thick bevelled frames, title bars, sunken
> item sockets, glossy pressable buttons) **+ a Bloomberg terminal's tabular
> density** (fifteen rows of live numbers, tabular figures, no decoration inside
> the data).

Neither reference is itself a catalogued AI-tell aesthetic, so the collision
does not triangulate back to the distributional centre. What satisfies both is a
*toy-chunky window frame around a dead-serious stat table* — a shape with no
cluster in the training data, because 2026 web UI has no title bars and
MapleStory has no Bloomberg tables. It is also the game itself: satire shell,
sincere numbers inside.

**What deliberately did NOT travel from MapleStory: its colours.** Maple's real
UI is cream, tan and cheerful. This game is dark-only by design and its premise
is melancholy. The construction and the chunkiness travelled; the palette did
not. **Not one hex moves in v3.**

## What v3 supersedes and what it carries forward

| Section | Status under v3 |
|---|---|
| `## Direction (v2)` / the v1 `## Direction` | **Superseded** — see `## Direction (v3)`. |
| `## Signature move (v2)` — the Warden's gold corner-bracket frame | **Superseded.** See `## Signature move (v3)`. Art Deco corner brackets have no home in a Maple register; they are removed, not restyled. |
| `## Material and depth (v2)` — the three elevations (plate / well / leaf) | **Superseded** by `## Material (v3)` — four constructions. The *surface-ramp respread* inside that section (the `well < bg < plate-foot < panel < field` L\* table and its reasoning) is **carried forward unchanged and is still law** — v3 depends on it more than v2 did. |
| `## Material and depth (v2)` §Ornament — the gold lozenge, the fading hairline rule | **Superseded — deleted, not replaced.** Ornament is Deco vocabulary. v3's equivalent is the title bar, which is structure rather than decoration. |
| `## Material and depth (v2)` §Rhythm — `--space-9` / `--space-10` | **Carried forward unchanged.** |
| `## Type (v2)` — the display tier `--fs-warden` / `--fs-colossal` | **Values carried forward unchanged.** What is superseded is the FACE they are set in (Georgia → the UI sans) and the "engraved" treatment (→ hard 1px shadow). |
| the v1 `## Type` — the Georgia / mono register split | **Half superseded.** Georgia leaves the chrome entirely. The mono side is **carried forward unchanged**. |
| `## Gold discipline (v2)` — the 7-item list of what may be gold | **Carried forward, with one amendment**: the primary action may now be a gold *fill*, not only gold ink. Everything else is unchanged, including `#projection` staying `--bone`. |
| the v1 `## Never` "no radius / no shadows" composition line | **Superseded.** MapleStory is round and beveled; see `## Radius (v3)`. |
| `## Colour tokens` — every hex, the semantic table, the ladder maths, the contrast evidence | **Carried forward unchanged. Not one hex moved in v2 and not one moves in v3.** |
| `## Colour tokens (v2 additions)` — `--plate-foot`, `--edge-lit`, `--edge-shade`, `--floor-glow` | **Carried forward unchanged in VALUE, re-pointed in PURPOSE**: v2 used them to light a flat plate, v3 uses them to bevel a frame. Same hexes, same gates. |
| `## Canvas scene spec` | **Carried forward**, with one amendment noted under `## Required behaviour changes (v3)`. |
| `## Motion budget` | **Carried forward unchanged. v3 adds zero animation**, exactly as v2 did. The no-ceremony veto is why richness here is material, never motion. |
| `## Component specs` (token tiers, dimension scale, Row / Rowlist / Chip / Meter / Arena / Allocation / `.caption` / Tab / Affordability) | **Carried forward unchanged.** v3 restyles these components; it renames, merges and removes nothing. |
| `## Never (v2 additions)` | **Amended** — see `## Never (v3)`. Three v2 entries are dropped as Deco-specific; the rest hold, and two are added. |

## Direction (v3)

The client is a **window**, and it was built to be used by people. Its panels
have thick frames with a real outer bevel and rounded corners; each one wears
its name on a plate across the top; anything you read from is cut into the
surface as a socket; anything you press has a physical top you can see going
down. It is chunky, tactile, friendly and *maintained* — the way a game client
made in 2003 for a mass audience was friendly, because it had to be legible to
everyone at once.

**The melancholy is not in the chrome; it is in the room.** A warm, welcoming,
perfectly-functioning client with exactly one player in it is sadder than a cold
one, and it is the only reading that honours both the premise and the no-decay
veto. **The feeling is absence, never disrepair.** Nothing is worn, chipped,
scanlined, grained or broken. Every frame is complete and every bevel is
symmetric. The server is fine.

The dense stat rows keep their Bloomberg discipline — the content is tables and
it still wins that vote. What changed is the furniture around them.

## Signature move (v3)

**The title bar. Every window wears its name.**

A raised gradient strip runs full-bleed across the head of every window,
carrying that block's name in bold tracked caps with a hard 1px shadow, closed
by a two-tone groove: a dark line, then a lit line. One per window, always at
the top, never anywhere else.

**The string is always the block's own existing heading.** No copy is invented,
no fact changes owner, no heading is duplicated — this is the `h3` the page spec
already had, given the shape a client window's header actually has. The
explainer sentence rides the plate under the name rather than being exiled below
it, so the header stays one object instead of two.

**The Warden's name-plate is the same construction, one size up.** On the Boss
tab, block 1 of the JOURNEY spec *is* the window's title bar: the boss's name at
`--fs-warden` over the title at `--fs-small`, on the same raised plate, closed
by the same groove. Both facts, both strings, the same owner, the same first
position — what changed is that the header of the Boss window is the boss, which
is what a boss frame in an MMO client is.

Why this and not the frame itself: a frame is the *language*, and a language
cannot be a signature. The title bar is the one specific, memorable decision a
template would never contain — nobody has put a title bar on a web panel since
about 2006, and it is the single strongest "this is a client, not a page" signal
available without a raster asset.

## Material (v3) — four constructions

Written as constructions, not as colours, so a surface nobody has drawn yet can
be built from it. **Light still comes from above and is still warm**
(`chapter-09-color-theory.md`: hue-shifted highlights and shadows — `--edge-lit`
is warm, `--edge-shade` is a cool blue-black, never `#000`).

| Construction | What it is | How it is built |
|---|---|---|
| **WINDOW** | a panel is an object with edges | `--border-frame` (3px) `--line` frame · `--radius-window` · `--panel` → `--plate-foot` body · **outer bevel** = two opposed inset hairlines, warm `--edge-lit` at the top-left and cool `--edge-shade` at the bottom-right · a hard `--edge-shade` foot below it so the window sits ON the page |
| **TITLE BAR** | a window wears its name | `--field` → `--inset` strip, full-bleed across the head · lit inset hairline at the top · closed by a groove: `--edge-shade` border-bottom over an `--edge-lit` outset hairline · label bold, tracked, uppercase, hard 1px shadow |
| **SOCKET** | anything you read FROM is cut INTO the body | `--well` ground · `--border-hairline` `--edge-shade` cut edge · `--radius-socket` · a blurred inner `--edge-shade` at the near (top-left) wall and a lit `--edge-lit` far (bottom-right) wall |
| **CONTROL** | a button has a physical top surface | `--radius-control` · `--field` → `--panel` gloss · lit top-left / dark bottom-right bevel · a hard foot to stand on · bold shadowed label. **Pressed** inverts the bevel, swaps the gradient and drops the foot. **Disabled** loses the bevel AND the foot and flattens onto `--panel` |

### The rules that make it reproducible

1. **Raised or sunk, never flat.** Every surface is one of the four above.
   Rows inside a socket are the one exception and that is the point: a leaf in a
   socket is what keeps a 15-row list readable.
2. **Never nest a bevel inside a bevel.** Carried forward from v2, and it is the
   one Maple habit left at the door — Maple nests raised-in-raised freely, and
   it is the nested-card tell (`ai-tells.md`: Fable 5's #1 measured default,
   6/6). The resource bar is therefore a *flat* band holding raised chip plates,
   not a raised bar holding raised plates.

   **Restated precisely, 2026-07-26** — v3 wrote this rule loosely enough that
   it forbade constructions v3's own mocks render, which the Phase 2.5 review
   caught as a Minor (the deterministic detector's 24 `nested-cards` hits). The
   ban is on **raised directly inside raised**. "Bevel" here means the complete
   raised signature — the opposed pair (warm `--edge-lit` top-left + cool
   `--edge-shade` bottom-right) *plus* a hard foot. A strip with only a lit top
   hairline and a closing groove is not that, and neither is a flat leaf.

   | Nesting | Legal? | The site on the rendered mocks |
   |---|---|---|
   | raised in **sunk** | yes | a CONTROL in a SOCKET; a `.band` chip inside a `.rowlist` row |
   | **sunk** in raised | yes | a `.rowlist` SOCKET cut into the WINDOW body |
   | raised on a **flat** carrier | yes | the resource bar's chips; the `.glyph` plate on the `h3` title-bar strip (a strip has no opposed pair and no foot, so it is a carrier, not a bevel) |
   | flat leaf in either | yes | rule 1's stated exception — rows in a socket |
   | **raised directly in raised** | **NO** | none, and that is the rule |

   Both sites the detector flagged — chip-in-socket and glyph-on-title-bar —
   are adjudicated **legal** here, on the record, rather than left as a silent
   mismatch between the document and the pixels.
3. **No blur except inward.** There is exactly one blurred shadow in the whole
   language — the socket's inner shadow — and it points into the surface. An
   outward blurred coloured shadow on a dark ground is the neon-glow tell AND
   reads as a screen in trouble, which is the one thing this client must never
   look like. Everything else is a hard offset.
4. **A gradient always lights the TOP.** Carried forward from v2 unchanged, and
   still a legibility rule wearing a lighting rule: no text ever lands on a
   ground lighter than the AA-verified one.
5. **Edges that are partial are background layers, not borders.** Carried
   forward from v2. Borders are for complete rectangles only. This is what keeps
   rule 2 satisfiable and it is why the arena's floor band is a layer.
6. **A rowlist is a socket.** The rule that makes the language work on a surface
   with no hero. Training, Grind, Player and Delve are lists; a list cut into
   the window body has depth without needing a frame or a display face.
   **Verified on pixels, not asserted:** `boss.html` renders Grind's real 15-row
   section — the same shared constant `grind.html` uses, not a lookalike — as a
   labelled specimen.
7. **A wrapper with no styling left is deleted, not overridden.** Carried
   forward from v2 (`.arena` is still gone).

### Radius (v3) — the rule v2 had backwards

v1 and v2 both carried an explicit **no-radius** rule, inherited from Swiss and
Deco. v3 supersedes it: MapleStory is round, and a square-cornered frame reads
as a `div` with a border rather than as an object.

```css
--radius-window:8px;   /* the window frame — the biggest object on screen */
--radius-control:5px;  /* buttons, tabs, chip plates */
--radius-socket:3px;   /* wells, tracks, inputs */
```

**Three steps, not one.** A single global radius is the unmodified-shadcn-token
signature (`ai-tells.md` Checkable Signatures); three is a statement that the
window, the control and the socket are three different objects. `5px` is not
invented — it is `--chip-radius`, a value the shipped CSS already carried as its
own named one-off. It always existed; it just had no system to belong to.

### Colour tokens (v3 additions)

**No colour token is added, moved or removed.** The complete v3 token delta:

```css
--radius-window:8px; --radius-control:5px; --radius-socket:3px;
--border-frame:var(--space-2);  /* 3px — a frame, not a hairline. Aliased onto
                                   the existing scale, not a new primitive */
--font-ui:Tahoma,"Segoe UI",Verdana,sans-serif;
--font-body:var(--font-ui);     /* the one seam that retires the serif */
```

That is the entire direction change in six values, which is precisely why the
contrast surface cannot regress: there is no new colour for it to regress
through.

## Type (v3) — the change the user actually asked for

**Georgia leaves the chrome. Not softened — removed**, so the claim is a
measurement rather than an opinion: the rendered `boss.html` computes **0
elements with a Georgia stack and 0 elements with `font-variant: small-caps`**.

**Replacement: `Tahoma, "Segoe UI", Verdana, sans-serif`** — a system stack, no
webfont, no external reference. This is a medium-form choice, not a taste one,
and it is the same argument `chapter-03-typography.md` uses to prefer Georgia
over Garamond, pointed at a different medium: Tahoma is Matthew Carter's
small-size screen face — narrow, large x-height, heavily hinted, designed to
stay legible and even in texture at 10–13px on a pixel grid, which is exactly
the band this UI lives in. It is also, historically, the face early-2000s
Windows game clients shipped their chrome in. **Arial and Helvetica are
deliberately absent from the stack** — both are on `ai-tells.md`'s overused-font
list; Tahoma and Verdana are not.

**The boss's name does not get a second face.** Considered and rejected: a
display face for the Warden would re-import the exact bookish register the user
objected to, and MapleStory's own hierarchy is built from *size, weight and
shadow depth on one face*, never from a face swap. `--fs-warden` (36px) and
`--fs-colossal` (52px) survive unchanged; the identity reads because it is ~3×
body size, bold, tracked, and carries the heaviest shadow on the page.
Step-skipping for dominance (`techniques.md` Ch 7) still does the work — it just
no longer needs a serif to do it.

**The hard shadow, and where it is banned.** Chrome carries
`text-shadow: 0 1px 0 var(--edge-shade)`; the identity and the hero number carry
`0 2px 0`. **Data does not carry it at all.** A hard shadow under every glyph of
an 11px monospace stat row fills its counters and destroys the even texture the
squint test is about (`chapter-03-typography.md`). Titles, labels, controls and
the identity are shadowed; rows, captions and the log are clean. That split is
the register split doing visible work.

**Monospace is carried forward unchanged** for the data register — it is
`REMAKE-DESIGN.md` §16's botter's-toolkit voice, it carries the tabular figures
the content needs, and it is not what the user meant by "the script": the
complaint names the serif chrome, which is the part that left.

**Weight.** `b { font-weight: bold }` — v1 neutered `<b>` to normal, which meant
the resource bar's own headline numbers had no weight channel at all. Under a
bold-small-type voice that was the wrong default.

## Gold discipline (v3) — one amendment

The v2 list of the seven things allowed to be gold is carried forward verbatim,
with one change: **the primary action may be a gold FILL, not only gold ink.**

`#descendBtn` is a solid `--gold` → `--gold-dim` gloss carrying `--on-gold`
text. It is the loudest thing this button vocabulary has, it appears once per
wall, and the amplitude matches the moment (`design-dna.md`: expressive moments
are per-moment dial positions, not a global cap). **Gold as a fill is reserved
to this one element**; everywhere else — the active tab, the active wall button,
the live row's edge, the Warden's name — gold stays an edge or ink. That
scarcity is what makes the fill legible as the peak.

`#projection` stays `--bone`, unchanged from v2. A sentence in gold is still the
reason no other gold would read as special.

### Contrast evidence (v3) — computed, not asserted

`node internal/mocks/contrast.mjs` parses the `:root` that actually ships in
`boss.html`, computes every allowed text/ground pair at 4.5:1 and every non-text
pair at 3.0:1, and exits non-zero on any miss.

```
all 49 gated pairs pass          (was 48 — coverage GREW, nothing regressed)
```

The one added pair is the one new pairing v3 introduces: the Descend CTA stopped
being an outline and became a fill, so its dark label now renders on **both**
stops of a `--gold` → `--gold-dim` gloss. The bottom stop was un-gated the
moment that happened.

```
PASS  8.56:1  (>=4.5 text)  --on-gold on --gold
PASS  5.69:1  (>=4.5 text)  --on-gold on --gold-dim      <- NEW
```

Every other pair is byte-identical to v2's report, because every hex is.
The two banned pairings (`--recede` / `--faint` on `--field`) are still printed
on every run so they cannot be quietly "fixed" by brightening a token instead of
changing a role.

## The state ladder under v3 — six channels, none lost

The four channels the ladder shipped with (edge colour, type colour, control
presence, unlock text) are untouched. v2 added a fifth (material: only a live
row carries a lit edge). v3 keeps that and the socket adds a sixth for free:

| State | What it looks like in a socket |
|---|---|
| **live** | lifted OUT of the socket onto its own `--inset` → `--well` ground, 3px `--gold` left edge, gold name, controls present, filling bar |
| **dormant** | lying flat in the socket, neutral edge, dim name, faint stat, control present reading 0, empty track |
| **struggling** (Grind only) | flat, full opacity, `--warn` left edge and `--warn` stat — live and failing, which is neither dormant nor locked |
| **locked** | `--opacity-locked` AND **unlit** — no groove highlight at all, no left edge, no control, and the row prints the word "locked" with its unlock condition |

"A locked window is visibly unlit" is the thing the brief predicted a chunkier
frame language would buy, and it is verified on the render at 375px rather than
assumed: the four states are drawn side by side in the Grind specimen.

## Required behaviour changes (v3)

Carried forward: v1's five and v2's #6 all still stand — they are colour and
role fixes, independent of which look wins.

7. **`battle.js`'s BREACHED reveal is still drawn in 52px Georgia.** v2 justified
   `--fs-colossal` partly by matching it. With the serif retired from the DOM,
   the canvas is now the only Georgia left in the product and the DOM and canvas
   would disagree on the face while agreeing on the size. The canvas reveal
   should move to the same UI stack. Size unchanged, copy unchanged, timing
   unchanged — face only.

## Never (v3)

Carried forward from v1 and v2, minus the three entries that were Deco-specific
(the corner-frame symmetry rule, the one-frame-per-surface rule, and the
ornament-as-filler rule — all three governed marks that no longer exist), plus:

- **No cream, tan or warm-light ground.** MapleStory's own palette is the one
  thing deliberately not borrowed. Remix rule 4 is the reason; the dark ramp is
  the law.
- **No worn metal.** The instinct a chunkier, more physical register invites is
  wear: chipped bevels, scratched plates, rust in the grooves, a frame with a
  corner missing. All of it is banned by the no-decay veto, and the ban is
  *sharper* here than it was in v2 because a chunky object is easier to
  distress than a hairline is. Bevels are complete; grooves are clean.
- **No glow on anything, ever** (carried forward). Hard offsets only; the single
  blurred shadow in the language points inward.
- **No texture, grain, scanline or CRT overlay** (carried forward).
- **No bevel inside a bevel** (carried forward) — the nested-card tell, and the
  one MapleStory habit not imported.
- **No raster asset and no icon of any kind**, generated or otherwise (carried
  forward, and load-bearing here: MapleStory leans hard on icon art and that
  route is closed. Every mark in v3 is a border, a gradient, a radius or a
  hard-offset shadow).
- **No animation added.** v3, like v2, adds zero. Motion stays state-change
  feedback only.
- **No single global radius.** Three steps or it is the shadcn-default tell.

## Open questions (v3)

- **The other five surfaces have the ramp and the font seam but not the v3
  construction.** `CSS_V3` is still Boss-only, behind the `v3` flag in
  `build.mjs`, exactly as `CSS_V2` was — so `grind.html` shows what the tokens
  alone buy and `boss.html`'s specimen shows what the tokens **plus** the
  carpentry buy. The gap between those two renders is the remaining work: paste
  `CSS_V3` into `CSS`, drop the flag, delete the split. Marked with a
  `ponytail:` comment at the seam.
- **Nothing here is applied to `style.css` yet.** v3 inherits v1/v2's position:
  the DESIGN.md gate holds until the user confirms the direction on real pixels.
- **Alternating row stripes were considered and skipped.** A real MapleStory
  list device, but on this ramp the only legal alternation is ~1 L\* (invisible)
  and the brighter options would open un-gated accent-on-ground pairs for a
  stripe nobody can see. The socket's groove separators do the job for free.
  Revisit only if the render reads flat — it does not.

---

# Visual DNA v2

> **SUPERSEDED 2026-07-26 by `# Visual DNA v3`** — the user rejected this
> direction on the render (*"the early MMO UI vibe isn't there"*). Kept in full
> for the record, and because v3 re-uses four of its tokens (`--plate-foot`,
> `--edge-lit`, `--edge-shade`, `--floor-glow`) unchanged in value, and inherits
> its surface-ramp respread unchanged as law. The v3 supersede table above says
> exactly which paragraphs below still hold.

**Date:** 2026-07-26 · **Status:** REJECTED (superseded by v3).
**Was proved on:** `internal/mocks/boss.html`, whose v2 render is preserved as
`internal/mocks/shots/boss-375-deco.png` / `boss-1280-deco.png` (the pre-v2
render is `boss-375-before.png`). `boss-375.png` is now the v3 render.

## Why there is a v2 at all

The previous plan delivered exactly what it scoped and deliberately excluded
changing the look. The user saw the result and said it is cleaner but not
beautiful — *"I was expecting more of a visual difference."* That verdict is
correct, and the cause is nameable:

**The archetype's own primary family was never implemented.** DESIGN.md's
archetype is Ruler + Sage. Per `archetypes.md` Part C, Ruler's *primary*
families are **Art Deco / Luxury** and **Swiss**; Data-Dense Professional is a
*stretch* family. The shipped look was 100% Data-Dense Pro. Art Deco's own
definition — *"deep base + metallic accent · fine rules and frame ornaments ·
letterspaced caps · strict symmetry · generous vertical rhythm"* — describes the
intended product almost exactly, and none of it existed except the palette.
**The palette was already Art Deco; the composition never was.** Every container
on the page was the same object: a rectangle, one `--panel` fill, one `--line`
hairline, uniform padding. There was no depth, no frame, no ornament, no display
type, and no spacing step above 16px — which is why six structurally different
blocks read as one texture.

## What v2 supersedes and what it carries forward

| Section below | Status under v2 |
|---|---|
| `## Direction` | **Superseded** — see `## Direction (v2)`. Same feeling, different expression. |
| `## Signature move` | **Superseded** — the gold/bone role split is *retained verbatim as a colour rule* but is no longer the signature; see `## Signature move (v2)`. |
| `## Expressive moments` | **Amended** — the three moments stand; a fourth (the Warden's identity) is added. |
| `## Type` — the scale table | **Extended, not replaced.** All seven `--fs-*` steps keep their names and values. Two steps are ADDED above the top. |
| `## Type` — Georgia / mono register split | **Carried forward unchanged.** Still correct, still defended by `chapter-03-typography.md`'s own worked example. |
| `## Color tokens` — every hex, the semantic table, the ladder maths, the neighbour-contrast evidence | **Carried forward unchanged. Not one existing hex moved.** Four new tokens are appended. |
| `## Color tokens` — the live/dormant/locked model + the 5 required behaviour changes | **Carried forward unchanged**, plus one *new* required change (below). |
| The `:root` block | **Appended to**, never edited. |
| `## Canvas token module` | **Carried forward unchanged**; v2 adds `## Canvas scene spec`, which says what to DRAW with those tokens. It did not previously exist. |
| `## Motion budget` | **Carried forward unchanged. v2 adds zero animation.** The hard veto on ceremony is why richness here is material, not motion. |
| `## Component specs` (token tiers, dimension scale, Row / Rowlist / Chip / Meter / Arena / Allocation / `.caption` / Tab / Affordability) | **Carried forward unchanged.** v2 restyles these components; it renames, merges and removes nothing. |
| `## Never` | **Extended** — see `## Never (v2 additions)`. |

## Direction (v2)

The client is a maintained instrument, not a document. Its surfaces are made of
something: plates with a lit top edge and a dark foot, wells you look down into,
and a single gold frame around the thing that matters. Gold is the metal in the
chrome, not the ink in the text. The dense stat rows keep their Bloomberg
discipline — the content is tables and it wins that vote — but the identity, the
peaks and the primary actions are set with the ceremony an MMO raid client
actually had. **The feeling is absence, never disrepair:** the frames are
complete, the rules are straight, the metal is clean. Nobody else is online; the
server is fine.

**The remix** (`design-dna.md` §Remix Rules):

```
BASE       Data-Dense Professional   (content pressure: dense tables/numbers)
BORROWS    Composition + Type voice  from Art Deco / Luxury (Ruler's own primary)
KEEPS      Colour strategy + Motion  from the base — unchanged, not renegotiated
DOMINANT   Composition — the frame/material/rule language is where the identity lives
```

Remix rule 4 is honoured: colour strategy does **not** borrow. Moving colour and
composition together would unmoor the base, and the palette is not the problem.

**Grounding (v2):** *an Art Deco elevator-car door's brass inlay and corner
plates* + *a 2000s MMO raid client's boss frame*. Both are metal edges around
something you are watching; one has ornament discipline the other never had. The
direction that satisfies both is a frame that is precise, symmetrical and
**complete** — which is also the mechanical answer to the no-decay veto, because
a complete frame cannot read as a broken one.

## Signature move (v2)

**The Warden's frame.** Four gold corner brackets on a hairline frame, with
**exactly one frame per surface**, drawn around the one thing that surface is
about. On Boss it is the Warden's identity. On a surface with no hero it is drawn
around nothing — the discipline is what makes it a signature instead of a
texture, and "one per surface" is the rule a second designer needs.

Construction: eight background layers (a horizontal arm and a vertical arm per
corner), no extra markup, no pseudo-element, no image, no icon.

```css
.frame{position:relative;--br:linear-gradient(var(--gold),var(--gold));
  border:var(--border-hairline) solid var(--line);
  padding:var(--space-10) var(--space-7) var(--space-9);
  background:
    var(--br) 0 0/var(--space-9) var(--space-1) no-repeat,
    var(--br) 0 0/var(--space-1) var(--space-9) no-repeat,
    var(--br) 100% 0/var(--space-9) var(--space-1) no-repeat,
    var(--br) 100% 0/var(--space-1) var(--space-9) no-repeat,
    var(--br) 0 100%/var(--space-9) var(--space-1) no-repeat,
    var(--br) 0 100%/var(--space-1) var(--space-9) no-repeat,
    var(--br) 100% 100%/var(--space-9) var(--space-1) no-repeat,
    var(--br) 100% 100%/var(--space-1) var(--space-9) no-repeat}
```

**No fill layer.** A frame is a frame — it sits transparently on its parent's
plate. This rule originally carried a 9th `--panel` → `--plate-foot` gradient
layer, which was a second application of the construction its own parent already
had: invisible only because the colours matched, and a bevel-inside-a-bevel by
the letter of material rule 2. Removed (review Minor).

**The frame is always four corners, always symmetric, always complete.** A
missing, thinner, or offset bracket reads as damage instantly — so the
construction makes that unrepresentable rather than merely discouraged.

The v1 signature (gold/bone are the only identity-tier warms; `warn`/`alert`/
`copper` are functional accents that never enter an identity role) is **retained
in full as a colour rule** under `## Gold discipline (v2)`. It stopped being the
*signature* because a rule about which hue goes where is not a move a viewer can
see; the frame is.

## Material and depth (v2) — the language, stated so a second surface can be built from it

This is the section that did not exist. It is written as three constructions,
not as three colours, so a surface nobody has drawn yet can be built from it.

**Light comes from above. Always.** Highlights are warm, shadows are cool
(`chapter-09-color-theory.md`, hue-shifted shadows and highlights — never a
black or white overlay).

### First: the surface ramp had to be respread

*Corrected after the Phase 1 review's Major.* The first version of this section
was correct in construction and invisible in practice, for a measurable reason:
**the four grounds were compressed into ~3 L\* of each other.** `--bg` → `--panel`
measured **3.09 L\***, which is under the perceptual floor for a surface step. No
bevel can make a panel read as raised when the panel and the page are the same
colour to the eye. `--inset` was also *lighter* than `--panel` while being named
"recessed" — a latent inversion nobody had caught.

The ramp is respread across the full range the **fixed text tokens** allow. The
ceilings are not taste, they are solved: each ground can only be as light as its
worst text token permits at 4.5:1.

| Ground | Ceiling | Bound by | Chosen | L\* |
|---|---|---|---|---|
| `--well` | — (darker is always safe) | — | `#05060a` | 1.4 |
| `--bg` | L\* 3.73 | `--logline` | `#08090e` | 2.4 |
| `--plate-foot` | L\* 8.52 | `--faint` | `#101015` | 4.8 |
| `--inset` | L\* 8.52 | `--faint` | `#131319` | 6.1 |
| `--panel` | L\* 8.23 | `--alert` | `#15161d` | 7.4 |
| `--field` | L\* 13.94 | `--dim` | `#22222a` (unchanged) | 13.5 |

**Physical model, deepest first: `well < bg < plate-foot < panel < field`.** A
well is cut *below* page level; a plate sits *above* it; a control sits above
that. Result: `--bg` → `--panel` goes **3.09 → 5.17 L\***, and `--edge-lit` →
`--panel` goes **10.8 → 18.6 L\***.

> **The lesson for anyone extending this:** on a dark ramp, WCAG contrast
> *ratio* is the wrong instrument for judging whether two surfaces look
> different — the `+0.05` flare term crushes every ratio between dark grounds
> toward 1.0 (`--plate-foot` on `--panel` is 1.05:1 and clearly visible).
> **Judge surface separation in L\*, and gate text in ratio.** Both numbers are
> printed by `contrast.mjs`.

### The three elevations

| Elevation | What it is | Construction | Used for |
|---|---|---|---|
| **Plate** (raised) | Something sitting ON the page | **2px** warm `--edge-lit` lip at the top, vertical gradient `--panel` → `--plate-foot`, `1px` cool `--edge-shade` inset at the bottom, `--line` hairline frame | `section.game`, and (one step brighter, `--field` → `--panel`) every control: buttons, tabs, chip groups |
| **Well** (recessed) | Something the client is looking INTO or reading FROM | the `--well` ground (below page level) with a **2px** `--edge-lit` inset at the **foot** | **every rowlist**, the canvas region, the dialogue block |
| **Leaf** (flat) | Something living IN a well or ON a plate | no bevel, no gradient, no second border. Separated from its siblings by hairlines alone | rows, Armory cells, trophy sets, stash rows — every density surface |

```css
/* PLATE */  background:linear-gradient(var(--panel),var(--plate-foot));
             box-shadow:inset 0 var(--space-1) 0 var(--edge-lit),
                        inset 0 calc(var(--border-hairline) * -1) 0 var(--edge-shade);
/* WELL  */  background:var(--well);
             box-shadow:inset 0 calc(var(--space-1) * -1) 0 var(--edge-lit);
/* LEAF  */  /* nothing. That is the point. */
```

**The lip is `--space-1` (2px), not 1px.** A 1px edge at 10 L\* was the review's
Major: present in the CSS, absent from the render.

**Why the well has no top shade.** For a recess lit from above, the near (top)
inner wall is occluded and the far (bottom) inner wall catches light. The well
ground is already the darkest surface on screen, so there is nothing left to
shade the top with — the darkness *is* the shadow. Only the lit foot is drawn.
This is why the well construction is not simply "the plate, inverted."

### The rules that make it reproducible

1. **A gradient always lights the TOP.** `--plate-foot` is *darker* than
   `--panel`, never lighter. This is a legibility rule disguised as a lighting
   rule: it guarantees no text ever sits on a ground lighter than the
   AA-verified `--panel`, so a plate can be introduced anywhere without
   re-deriving contrast. A "lit from below" plate is illegal.
2. **Never nest a bevel inside a bevel.** A plate holds leaves; a well holds
   content. Two beveled boxes inside each other is the nested-card tell
   (`ai-tells.md`: Fable 5's #1 measured default, 6/6) and Tufte's redundant
   rule line at the same time. `detect.mjs` catches it — it caught exactly this
   during Phase 1, on `.canvasStub`, and the fix was to delete the inner border,
   not to keep it.
3. **Edges are drawn as background layers, not borders,** whenever the mark is
   partial (a corner bracket, a floor line, a seam). Borders are for complete
   rectangles only. This is what keeps rule 2 satisfiable.
4. **A disabled control is not raised.** It drops to a flat `--panel` ground and
   loses its bevel. The material carries the state — and it is also the only way
   `--faint` clears AA on a control (see `## The on-field text rule`).
5. **A live row carries the lit top edge; a dormant, struggling or locked row
   does not.** Material is a *fifth* state channel added on top of the four the
   ladder already had. It may never replace one.
6. **A rowlist is a well.** This is the rule that makes the language work on a
   hero-less surface. Training, Grind, Delve and Dungeon have no frame and no
   display type — their depth comes from the list being visibly *cut into* the
   plate, with flat leaf rows inside it and raised controls sitting above it.
   Three elevations in one component, no ornament required. **Verified on
   pixels, not asserted:** `boss.html` renders Grind's real 15-row section — the
   same shared constant `grind.html` uses, not a lookalike — as a labelled
   specimen, cropped at native resolution for the review.
7. **A wrapper with no styling left is deleted, not overridden.** `.arena` was a
   bordered box around the canvas; once the canvas region itself became the
   well, the wrapper had nothing to do but be a nested box for `detect.mjs` to
   flag. It is gone from the markup, and `.arena .controls` became `.controls`.
   (DESIGN.md's own Arena component spec had already flagged the class as a
   naming ambiguity that only ever meant "bordered panel".)

### Ornament

A hairline that fades in from nothing, a gold lozenge, a hairline that fades
out. The lozenge is a **rotated square** — a drawn mark, not a glyph, not a font
character, and categorically not a generated icon.

```css
.ornRule{display:flex;align-items:center;justify-content:center;gap:var(--space-5)}
.ornRule::before,.ornRule::after{content:"";height:var(--border-hairline);width:35%}
.ornRule::before{background:linear-gradient(90deg,transparent,var(--gold-dim))}
.ornRule::after {background:linear-gradient(90deg,var(--gold-dim),transparent)}
.ornRule i{flex:none;width:var(--space-4);height:var(--space-4);
  transform:rotate(45deg);background:var(--gold)}
```

**Where ornament is allowed:** closing an identity block (centred, both arms),
and opening a section heading (`h3`, lozenge leading, no arms — the heading text
is the rule). **Nowhere else.** Ornament between arbitrary elements is filler,
and filler is the thing that starts reading as ruin.

### Rhythm

The dimension scale had nothing above `--space-8` (16px), which is the second
reason every block read as one texture: a 600px column with a 16px maximum gap
has no way to say "these two things are far apart." Two steps are appended, by
the same derivation rule (what the layout actually needs, named honestly):

```css
--space-9:24px;   /* block padding, frame bracket arm, section rhythm */
--space-10:32px;  /* the outer breath: section padding-bottom, heading lead-in */
```

## Type (v2) — the display tier

The seven existing steps keep their names, values and uses. **Two are appended
above the top, and nothing below moves.**

| Token | Px | Ratio to next step | Used for | Status |
|---|---|---|---|---|
| `--fs-colossal` | **52** | 1.44× | the once-per-screen peak: `BREACHED` | **NEW** |
| `--fs-warden` | **36** | 1.38× | the Warden's name — the identity | **NEW** |
| `--fs-hero` | 26 | 1.30× | the one big number per view | unchanged |
| `--fs-masthead` | 20 | 1.25× | primary action label (was: boss name) | unchanged value, re-pointed |
| `--fs-display` | 16 | 1.23× | section `h2`, story/dialogue | unchanged |
| `--fs-body` | 13 | 1.18× | body text, `h3` | unchanged |
| `--fs-small` | 11 | 1.10× | captions, mono stat rows, control labels | unchanged |
| `--fs-label` | 10 | 1.11× | chip labels, micro-headers | unchanged |
| `--fs-micro` | 9 | — | log header chrome | unchanged |

The two new steps use **larger ratios (1.44×, 1.38×) than the existing scale's
1.1–1.3×** on purpose — step-skipping for dominance (`techniques.md`, Ch 7: "jump
steps in the scale when adjacent sizes look too similar"). A 20px name above a
26px number is not a hierarchy; it is an inversion, and it was the single most
visible defect in the pre-v2 render.

`--fs-colossal` is **52px because `battle.js` already draws the canvas BREACHED
reveal at 52px Georgia.** The DOM and the canvas now agree on where the peak is,
which they previously did not.

**Display treatment.** Gold display text is **engraved, never lit**:
`text-shadow:0 var(--border-hairline) 0 var(--edge-shade)` — a 1px offset down,
reading as metal cut into a plate. **A glow is banned**: it is the neon-on-dark
AI tell (`ai-tells.md`) and it reads as a screen in trouble, which is the one
thing this client must never look like. Offset down, never out.

Tracking: `.07em` on `--fs-warden`, `.18em` on the primary action, `.14em` on tab
labels — letterspaced caps are Art Deco's own label device and the existing
small-caps chrome already used the technique at smaller sizes.

## Gold discipline (v2)

Gold is **identity only**. The complete list of things allowed to be gold:

1. the Warden's name, 2. the one hero number per view, 3. the frame's brackets,
4. the ornament lozenge, 5. an active edge (tab seam, active row, active wall),
6. the primary action, 7. a maxed / complete state (the v1 expressive moment).

Everything else is `--bone`, `--dim` or `--recede`. **`#projection` — a
*sentence* — carried `--gold` and is the single reason none of the other four
golds read as special.** It is now `--bone`. Gold used less reads as gold used
more; this costs nothing and buys the whole frame.

The v1 role split is retained verbatim: `warn`/`alert`/`copper` are
functional-semantic accents and **never** enter roles 1–7 above.

## The on-field text rule (a real AA failure this pass surfaced)

Not on the done-when list; found by computing every text token against every
ground it can actually render on rather than only against `--bg`/`--panel`/
`--inset`, which is all the Phase 3 audit checked.

```
--recede on --field : 4.43:1  FAIL   (WCAG 1.4.3, 4.5:1)
--faint  on --field : 4.02:1  FAIL
```

Both were live: `--alloc-control` resolved to `--recede` on the alloc buttons,
and `button:disabled` set `--faint`, both over `--field` — the raised-control
ground, which is lighter than every ground the audit tested. The rule:

> **`--recede` and `--faint` are panel-family text and may never be set on
> `--field`.** On a control ground the quiet colour is `--dim` (4.55:1).

**Fixed by role, not by value** — brightening `--faint` enough to clear 4.5:1 on
`--field` requires luminance ≥0.249, which is `--dim`'s own 0.252, collapsing the
text hierarchy entirely. So:

- **REQUIRED (applied in the mocks, not yet in `style.css`):**
  `--alloc-control: var(--recede)` → `var(--dim)`. Still recedes against
  `--alloc-value` (gold), so the stated intent survives.
- **REQUIRED (applied in the mocks, not yet in `style.css`):**
  `button:disabled` gains `background: var(--panel)` and loses its bevel — the
  material rule 4 above. `--faint` on `--panel` clears 4.68:1.

This is required behaviour change **#6**, appended to the five already listed
under `## Color tokens`.

## Colour tokens (v2 additions)

**No TEXT token moved.** Four grounds were respread (see the ramp table above)
and four tokens appended:

```css
/* CHANGED — the four grounds, respread. Every text token is unmoved; these are
   backgrounds only, and every pair is re-gated below. */
--bg:#08090e;          /* was #0b0c10 */
--panel:#15161d;       /* was #13141a */
--inset:#131319;       /* was #17171c — was LIGHTER than --panel while named
                          "recessed"; corrected */
--well:#05060a;        /* was #101014 */
/* --field:#22222a unchanged — already sat at its --dim ceiling */

/* NEW */
--plate-foot:#101015;  /* a plate's foot — DARKER than --panel by construction */
--edge-lit:#413d37;    /* warm bevel lip (hue ~30deg), L* 26 — 18.6 L* over panel */
--edge-shade:#020308;  /* cool bevel shade, L* 0.9 — tinted, never pure #000 */
--floor-glow:#17140d;  /* warm dark: light under the door. Canvas floor band ONLY,
                          never a text ground */
--fs-warden:36px; --fs-colossal:52px;
--space-9:24px;   --space-10:32px;
```

`--edge-lit`/`--edge-shade`/`--floor-glow` are decorative bevel and atmosphere —
WCAG 1.4.11 does not apply (the same precedent this file already set for `--line`
and `--line-soft`). Reported anyway: `--edge-lit` on `--panel` 1.67:1 (was 1.29),
`--edge-shade` on `--panel` 1.14:1, `--floor-glow` on `--well` 1.10:1.

`--plate-foot` **is** a text ground and is gated at 4.5:1 for every text token.

### Contrast evidence (v2) — computed, not asserted

`node internal/mocks/contrast.mjs` — parses the `:root` that actually shipped in
`boss.html` (rather than keeping a second, driftable copy of the hexes),
computes every allowed text/ground pair at 4.5:1 and every non-text pair at
3.0:1, and **exits non-zero on any miss**. Result: **48/48 gated pairs PASS.**

```
Every text token on every ground it can render on — all PASS:
  --bg          gold 8.77  gold-dim 5.83  bone 9.50  dim 5.73  recede 5.58  faint 5.07
  --panel       gold 7.95  gold-dim 5.29  bone 8.61  dim 5.19  recede 5.06  faint 4.59
  --plate-foot  gold 8.37  gold-dim 5.56  bone 9.06  dim 5.46  recede 5.32  faint 4.83
  --inset       gold 8.16  gold-dim 5.43  bone 8.84  dim 5.33  recede 5.19  faint 4.71
  --well        gold 8.93  gold-dim 5.94  bone 9.67  dim 5.83  recede 5.68  faint 5.16
  --field       gold 6.96  gold-dim 4.63  bone 7.54  dim 4.55   (recede/faint BANNED)

  Every previously-fixed pair, re-measured, none regressed:
  recede@panel 5.06  faint@panel 4.59  faintest@panel 3.07 (non-text 3.0 floor)
  warn@panel 4.58    alert@panel 4.57  logline@bg 4.61     --rar-mythic unmoved

  v2 additions — a rowlist is a well, so row accents now render on --well:
  warn@well 5.14   copper@well 7.12   warn@plate-foot 4.82

Banned pairings, printed every run so they cannot be quietly "fixed" by
brightening a token instead of changing the role:
  recede on --field 4.43   faint on --field 4.02
```

**Every previously-fixed pair moved by 0.05–0.10 and none crossed its floor.**
`--faintest` on `--panel` is the tightest at 3.07:1 (was 3.13) — it is the
`.locked` tab only, at the non-text 3.0 floor, and `contrast.mjs` gates it on
every run, so any future drift fails the build rather than shipping.

## Canvas scene spec — what the arena should DRAW

The arena stays a labelled placeholder in the mock (it is canvas, not CSS), but
it is the hero element of the hero tab and it was the emptiest box on the page.
`JOURNEY.md` says what it must *convey*; this says what it should *look like*.
`battle.js` consumes it through the existing `theme()` bridge — no new token
mechanism.

**The arena draws a door, not a stage.** Back to front:

| Layer | What | Drawn with |
|---|---|---|
| Ground | `--well`, with a warm band rising from the floor line — light escaping under the door | `--well` → `--floor-glow` vertical gradient, bottom ~24% |
| The door | a tall leaf occupying the centre ~60% of the frame, floor to top edge, with two vertical inlay rules — an Art Deco door leaf | `--field` fill, `--line` edge, `--gold-dim` inlay |
| **The HP meter** | **the door's own vertical seam of light**, full height at 100%, shortening from the top down as HP drains. Same Depletion semantics as today (one-shot per wall, never refills mid-fight) — only the FORM changes | `--meter-fill-depletion`, swapping to `--meter-fill-depletion-crisis` under 15%, when the floor band also doubles |
| The Warden | a silhouette standing **in front of** the door, ~55% of frame height, flat dark mass with a rim-light on the side facing the floor glow | `--bg` mass, `--gold-dim` rim |
| The player | a small silhouette at the lower-left, ~18% of frame height. **The scale difference is the story** | `--bg` mass, `--bone` rim |
| Damage | crit-tier floaters rising from the Warden's midline | the existing `--dmg-text`/`--crit-gold`/`--super-crit` canvas tokens, unchanged |
| BREACHED | the door leaf parts by ~14% of its width; the well behind it fills with light; `--fs-colossal` Georgia over it | `--gold-bright`, the existing 6s non-blocking reveal, unchanged |

**The no-decay rule, mechanically:** the Warden's progressive damage is drawn as
**fracture lines of LIGHT coming through the silhouette**, never as chips,
notches or missing material. Light-through reads as "something is giving way";
material-removed reads as "this is broken." Nothing in the client's own chrome —
frames, rules, plates — ever fractures at all. Damage happens to the Warden. The
client is fine.

**No ornament inside the canvas.** The frame around the aperture carries the
ornament; the canvas is the one place this design is allowed to be pictorial, and
mixing the two makes both look like decoration.

**Aperture ratio changed 16/7 → 16/10.** A letterbox cannot hold a door and a
standing figure. This is a DOM change (`.canvasStub`) and a canvas-sizing note,
not a semantics change.

**IMPLEMENTED 2026-07-26, with four deviations found on the rendered canvas.**
This section was written against mocks and had never been run; `battle.js` was
still drawing v1 hexes, which is the real reason the arena looked foreign.
Two things it cites did not exist and were built: the `theme()` bridge (it
reads the tokens off the document, so canvas and DOM cannot disagree), and
`--meter-fill-depletion` / `-crisis` (aliases of `--gold` / `--gold-bright`,
so no new hex entered the palette).

1. **The floor glow is a gradient in BOTH directions, not a fill below the
   line.** Filling everything under `FLOOR` with `--floor-glow` made a flat
   olive slab that read as carpet. Light pools at the seam and falls off.
2. **The Warden stands off the door's centre**, not on it — centred, the mass
   completely occluded the seam of light, hiding the HP meter behind the thing
   whose HP it is.
3. **The Warden has two lit eyes** in `--w-active`. "Flat dark mass" taken
   literally is a void with no character; the sprite this replaced at least
   looked back at you. Two pixels of the door's own hue, still light-through
   rather than detail-on-the-mass.
4. **Floaters spawn above the silhouette**, not at its midline — inside the
   mass their outline (`--well`) had nothing to separate them from.

**Still open on taste:** the composition reads more as "panels with a lit seam"
than as a door, and the areas outside the leaves are dead. Not a spec failure —
a judgement the user has not made yet.

**The aperture IS the well.** `.canvasStub` carries the well construction
directly; the `.arena` wrapper that used to box it is deleted (material rule 7).
One nesting level: section plate → canvas well. The floor band and the gold-dim
floor line are background *layers* on the well, not borders (material rule 3).

## Expressive moments (v2)

The three v1 moments stand unchanged (BREACHED reveal, enhance feedback,
maxed/complete states). One is added:

- **The Warden's identity** — the framed name at `--fs-warden`, the ornament
  closing it. Amplitude: the highest on any non-transient surface, because it is
  the only permanent thing on the tab that is about a *person* rather than a
  number. It is a static moment, not an animated one: **v2 adds zero motion.**

## Never (v2 additions)

Carried forward in full, plus:

- **No glow on gold, ever** — display gold is engraved (1px offset down in
  `--edge-shade`). A glow is the neon-on-dark tell and it reads as a failing
  screen.
- **No texture, grain, scanline or CRT overlay.** Considered explicitly and
  rejected: a scanline reads as a monitor in trouble, and grain reads as dust.
  The material comes from bevel and frame, which are signs of *maintenance*.
- **No asymmetric, partial or "weathered" frame.** Four corners, complete.
- **No second frame on a surface.** One per surface or it is texture.
- **No bevel inside a bevel** (rule 2 above) — the nested-card tell.
- **No ornament as filler** between arbitrary elements.
- **No raster asset and no icon of any kind**, generated or otherwise. Every mark
  in v2 is a gradient, a border, a rotated square or a letterform. `internal/art/`
  was available and deliberately not used: nothing here needs a bitmap, and a
  bitmap corner bracket would be worse, heavier and untokenizable.
- **No lit-from-below plate** (rule 1 above) — it is a legibility failure wearing
  a lighting mistake.

## Open questions (v2)

- **The other five surfaces have the new ramp but not the v2 construction.** The
  surface respread lives in the shared `TOKENS` (it is a correction to locked
  tokens and a root cause, so scoping it to one page would have been a symptom
  fix); `CSS_V2` — the lip, the well, the frame, the ornament, the display type
  — is still Boss-only. So `grind.html` today shows what the ramp alone buys and
  `boss.html`'s specimen shows what the ramp **plus** the construction buys; the
  gap between those two renders is exactly Phase 3's remaining work. Phase 3
  pastes `CSS_V2` into the shared `CSS`, drops the `v2` flag, and deletes the
  split. Marked with a `ponytail:` comment at the seam.
- **Nothing here is applied to `style.css` yet.** v2 inherits v1's position: the
  DESIGN.md gate holds until the user confirms the direction on real pixels. The
  CSS above is paste-ready.
- **Required behaviour change #6** (the on-field text rule) is a genuine live AA
  failure in the shipped `style.css`, independent of whether the look is
  approved. It should ship even if v2 does not.

---

## Direction

A working dead MMO's client, not a ruin and not a terminal. Cool blue-grey
neutrals read as cooling server metal; exactly two warm hues — gold and
bone — carry all the "still alive" signal in the entire palette. Georgia
serif small-caps chrome (the game's own UI voice) frames dense monospace
data rows (the botter's-toolkit/admin-console voice) wherever the content
is a stat table. ~~The shell/terminal register (`maintenance@dead-server:~$`,
`PLAYERS ONLINE`) stays confined to the log and meta edges — it is not the
base layer.~~

> **SUPERSEDED by v4 Phase 3 — `## The chat window (v4, Phase 3)`.** The shell
> register is **retired, not re-confined**: the prompt is gone from every
> surface and from `index.html`, and the log is an MMO chat window. Four
> reviews checked that the register was confined; none asked whether it should
> exist. `Players online: 1` survives as the chat window's online counter,
> which is the one place in an MMO client where that number belongs.
> **The Georgia/monospace split in the sentence above is also superseded** —
> Georgia left the chrome in v3, and monospace left the data in Phase 3
> (`## The data face (v4, Phase 3)`).

## Signature move

**Corrected per review (Minor 1) — the original wording overclaimed hue
purity the palette doesn't have.** Independently recomputed hue: `warn`
(12°), `alert` (10°), and `copper` (31°) are all in the warm red-orange
band — `copper` sits only 6–14° from `bone` (37°)/`gold` (45°), hue-adjacent,
not "outside the warm family." Only `risk` (212°, blue) and `live` (131°,
green) are actually non-warm. The accurate claim is about **role and
chroma-register, not hue-family membership**: `--gold`/`--bone` are the
only **identity-tier** warm tones — moderate chroma, the restrained
"precious-metal/live-output" register that reads as *the machine's own
warmth*. `warn`/`alert`/`copper` are **functional-semantic** accents that
happen to land warm (danger/currency conventions push that way) but sit at
a different, more saturated register and never appear in the identity roles
(headings, hero numbers, CTA) that gold/bone own exclusively. The signature
is that split — two roles, not two hue families — one for "the machine is
alive," one for "pay attention to this specific number," and the two never
trade places.

## Expressive moments

- **BREACHED reveal** (canvas, `battle.js notifyBreak`) — the journey's
  per-wall emotional peak. Gold flash + 52px display-serif reveal text,
  held 6s, non-blocking (the fight scene keeps rendering underneath).
- **Enhance feedback** (canvas, `notifyEnhance` + CSS `.flash-ok`/`.flash-fail`)
  — glow/shake scaled to the enhance band (+13 and up reads like a mini
  boss-kill). Feedback on an already-instantly-resolved outcome, never a
  delay before resolution (hard veto: no ceremony).
- **Maxed / complete states** (`amCell.max`, `trophySet.complete`,
  `button.affordable`, `.row.maxed`) — turning solid gold is the visual
  payoff for finishing a grind lane.

Everywhere else holds the restrained structure register: panels, tabs,
rowlists, the Armory grid, Trophy pips.

## Why this isn't a diverge/critique/converge pass

`design-dna.md`'s default process (ground → 5 candidates → critique → converge
→ gate) assumes a design that doesn't exist yet. This phase's brief is
explicit that the opposite is true here: the look is shipped, was already
approved in a prior design-system pass, and the phase's job is to **name,
complete, and verify** the existing token set, not replace it. Running a
fresh divergent search against an already-loved, working aesthetic would
violate both the phase's own constraint and the project's attachment
heuristic (`CLAUDE.md` guideline 8: never demote or replace what's loved).
What follows is the DNA documentation the doctrine asks every design to
carry (grounding, archetype, register, signature, axes) — derived from what
ships today, verified where it was previously just asserted.

## Type

- **Display / heading / identity:** Georgia (`font-family: Georgia, serif`)
  — the game's own MMO-client register. Screen-optimized transitional
  serif (vertical axis, sharp serifs, large x-height) — already the
  correct choice per `chapter-03-typography.md`'s own worked example
  (Georgia over Garamond for exactly this reason); nothing to change.
- **Data / stat rows / controls / log / canvas:** `monospace` — the
  botter's-toolkit and admin-console register.
  > **SUPERSEDED by v4 Phase 3 — `## The data face (v4, Phase 3)`.** Decided on
  > rendered pixels: the data face is now `--font-data`, resolving to the UI
  > face. The register lives in §16's NAMES, not in the font; tabular columns
  > are held by `font-variant-numeric: tabular-nums`, not by the font; and mono
  > cost 11% of the surface height on the 15-row Grind list. The paragraph
  > below is kept because its accounting of *where* mono reached is the
  > inventory the token replaced.

  **Corrected per review
  (Minor 2)** — this covers more than readout content: `section.game
  button` sets `font-family: monospace` as its base rule, which cascades to
  essentially every action button in every tab (rig buys, ATK/SPEED fills,
  enhance, reforge, stash actions, Cache-tree buys, Dungeon duty/run
  controls, Ban Wave) — interactive controls, not only rowlists/chip
  values/log/canvas text. The register split is still accurate (Georgia =
  identity chrome, mono = the botter/admin voice) — the mono side's actual
  footprint is just larger than originally stated.
- **Scale** (hand-tuned descending steps, not a single fixed ratio —
  tightens at the bottom where dense data rows need it):

| Token | Px | Ratio to next step | Used for |
|---|---|---|---|
| `--fs-hero` | 26 | 1.30× | the one big number per view (depth/HP hero readout) |
| `--fs-masthead` | 20 | 1.25× | boss name identity |
| `--fs-display` | 16 | 1.23× | CTA + section `h2` headers (small-caps serif) |
| `--fs-body` | 13 | 1.18× | default body text (Georgia) |
| `--fs-small` | 11 | 1.10× | captions, most mono stat rows, control labels |
| `--fs-label` | 10 | 1.11× | chip labels, micro-headers |
| `--fs-micro` | 9 | — | log header chrome |

**Named exception:** `.modalClose` (22px, the `×` glyph) sits outside this
scale deliberately — it's an icon-scale glyph, not body content, the same
category as a button icon rather than a type-scale step. Not a gap.

**Canvas type** is a separate scale (different rendering surface — canvas
units aren't CSS px once the element is scaled by its container) — see
`## Canvas token module` below.

## Color tokens

**Semantic aliases (DW-3.4) — the existing primitives already carry
semantic names; this table states the resolution rather than adding a
redundant indirection tier (ponytail: no new abstraction for a role these
tokens already fill):**

| Role | Token(s) | Hex | Notes |
|---|---|---|---|
| background | `--bg` | `#0b0c10` | page canvas |
| surface | `--panel` | `#13141a` | `section.game` panels, tab buttons |
| surface (recessed) | `--inset` | `#17171c` | slot / trophy / delve tiles |
| surface (control) | `--field` | `#22222a` | inputs, buttons, tracks |
| surface (deep) | `--well` | `#101014` | canvas arena bg, export box |
| border | `--line` / `--line-soft` | `#262a34` / `#1b1b22` | hairline dividers (decorative — WCAG non-text contrast doesn't apply to dividers, left as-is) |
| text — live, emphasis / accent | `--gold` | `#c9a94b` | hero numbers, headings, CTA |
| accent (recessed) | `--gold-dim` | `#9a8a5a` | `h3` sub-headings |
| accent-on-solid | `--on-gold` **[NEW]** | `#0d0d10` | text drawn on a solid-gold fill. **Corrected per review round 3:** only `#descendBtn:hover` hardcodes this on a live element today — `#pullBtn` also hardcodes it but is confirmed dead CSS (retired pull-to-attempt mechanic, absent from `index.html`/`main.js`), so it's named for completeness, not cited as a second live usage |
| text — live, default | `--dim` | `#838a97` | default body color |
| text — live, primary output | `--bone` | `#bcb2a2` | "live output, kept warm on purpose" |
| text — secondary, notable **(not a state tier — see below)** | `--recede` | `#87878f` **(was `#6e6e78`)** | captions, quiet control labels, flavor/help text — renders identically at every game state |
| text — secondary, minor **(not a state tier — see below)** | `--faint` | `#808086` **(was `#55555e`)** | hints, muted values, projected/secondary numbers, **Trophy-pip labels (corrected per review — see below)** — renders identically at every game state |
| non-text / UI-component, inactive only | `--faintest` | `#64646a` **(was `#4a4a52`)** | **Scope corrected per review — the `.locked` tab ONLY.** Verified at the 3:1 non-text floor (WCAG 1.4.11, DW-3.3) — legitimate for a tab's border/state, illegitimate for any genuine readable text (see the Trophy-pip fix below, the exact mistake this token made last round) |

**The live/dormant/locked weight ladder (the phase's central job) —
corrected per review (Blocker).** The previous version of this section
badged `recede`="dormant-notable" and `faint`="dormant-minor" and expected
all three of `dim`/`recede`/`faint` to be simultaneously (a) independently
≥4.5:1 against `--panel`/`--inset` and (b) visibly separated from each
other. Both individually true, but incompatible together on this
background — proven, not asserted:

```
panel luminance ≈ 0.0071 · inset luminance ≈ 0.0088 (the harder bg)
AA-4.5 floor luminance (vs inset)           ≈ 0.2145
dim's own luminance (unchanged)              = 0.2524   (only 0.038 of headroom above the floor)
```

That ~0.038 of headroom is not enough room for two more AA-passing rungs
each ≥1.3–1.4:1 from its neighbor below `dim` — recomputed, the corrected
`recede`/`faint` land at luminance 0.2446/0.2175, giving **dim↔recede
1.03:1** and **recede↔faint 1.10:1** (both far under 1.3). **The "brighten
`dim`" escape hatch was tried and rejected, not skipped:** opening enough
headroom for two full 1.4×-spaced rungs below `dim` while it stays ≥AA
requires moving `dim` to luminance ≈0.48 — at which point **bone↔dim**
(currently a real, if modest, 1.66:1) collapses to **1.06:1**, because
`bone` (`#bcb2a2`) sits only that much brighter itself. Brightening `dim`
doesn't create headroom, it moves the same collapse one rung up into
`bone`. **Conclusion: color/lightness on this dark a background reliably
carries exactly one strong split — live vs. not-live — not three
independent rungs.** `bone`/`gold` (live-emphasis) sit a real 1.66–8.6:1
above `dim` (live-default); `dim`, `recede`, `faint` necessarily cluster
within ~1.1:1 of each other because all three are genuinely-read text that
must clear AA on this background, full stop — and that clustering is
harmless, because **`recede`/`faint` were never a dormant/locked rung to
begin with.** They're a general secondary/tertiary text-weight hierarchy
(captions, hints, control labels — `.caption`, `.slotName`, `.filterHint`,
`.rowGain`) that renders identically at every game state; relabeling them
"dormant" in the previous pass was the actual error, not their contrast
values (which remain a legitimate, needed AA fix, unrelated to the state
ladder).

**So what actually carries live vs. dormant vs. locked?** Traced against
the real ~136-item breakdown (`JOURNEY.md`'s reconciliation: Trophies 70,
Armory 45, Grind zones 10 locked, Training tiers 11 locked) — the shipped
CSS mostly already answers this, at the *row/cell* level, not the
text-color level. **Two rows below are corrected per review — marked
`VERIFIED` (true today, checked against source) vs. `REQUIRED — not yet
shipped` (the spec's requirement, source contradicts it today, labelled so
Phase 4/6/integration cannot mistake it for current fact):**

| State | Mechanism | Where | Status |
|---|---|---|---|
| live | full opacity, normal token colors | everywhere else | VERIFIED |
| dormant (unlocked, idle/zero) | `opacity: 0.5` on the whole cell | `.amCell.dim` (Armory, 45 cells) | VERIFIED — bone content at 1.0→0.5 opacity over `--panel`: **8.78:1 → 3.09:1**, a real 2.84:1 step down from live |
| dormant, unearned (collectible) | text color **`--faint`** (corrected per review — was wrongly `--faintest`, see Trophy-pip fix below) | `.pip.miss` (Trophy, 70 pips) | VERIFIED once the one-line selector fix below ships — currently still `--faintest` in `style.css`, which is the DW-3.2 blocker this round |
| locked (not yet reachable) — **readout only** | `opacity: 0.45` on the whole row; the row prints its unlock condition as text (`"locked · 0/30.0k fills of..."`) | `.rowlist .row.locked` (Training 11 + Grind 10 = 21 rows) | VERIFIED (the dim/text part) |
| locked (not yet reachable) — **input** | allocation controls (`−`/`+`/`cap`/`max`/`0`) stop responding | same rows | **REQUIRED — not yet shipped.** `bots.setAlloc` (`bots.js:116-122`) and the `allocMini` click wiring (`main.js:296-309`, applied unconditionally at `main.js:325`) have no lock-state check today — a locked row's controls are fully clickable and silently write allocations. See "Required behavior changes" below. |
| Grind-specific: manned, live, **can't hold** (squad too small) | **REQUIRED — not yet shipped.** Currently reuses `.locked`'s own opacity-.45 dim treatment (`main.js:841`: `toggle("locked", !unlocked \|\| (n>0 && !zr.held))`), making a live, in-play, failing zone visually identical to an unreachable one. Must get its own class at full opacity + `--warn` text (the accent already used for "NOT BLOCKED" elsewhere) — it is neither dormant nor locked, it's live-and-failing. | Grind zones only (Training's lock condition is purely structural, `main.js:787`, not affected) | **REQUIRED — not yet shipped** |

**Naming what was unnamed (DW-3.4 — these are the actual state tokens,
opacity was previously invisible in the token block):**

```
--opacity-dormant: 0.5;   /* Armory rank-0 cells — unlocked, just zero */
--opacity-locked: 0.45;   /* Training/Grind not-yet-unlocked rows */
```

**Dormant-vs-locked's own color/opacity separation is deliberately weak —
verified, not hidden.** Recomputed: bone@0.5 vs bone@0.45 = only **1.13:1**,
the same tight-clustering reality as the text tiers, for the same reason
(limited luminance budget on this background). That's fine PROVIDED a
stronger, redundant, non-color channel actually exists
(`chapter-08-color-science.md`: pair color with shape/text/position rather
than leaning on color alone for a distinction it can't carry) — **corrected
per review, this round states plainly what's real today vs. what's spec
only:**

- **Text label — VERIFIED, real today.** Locked rows print their unlock
  condition as a sentence (`"locked · N/M fills of..."`); dormant cells
  print a real zero-value (`"+0.00%"`) with no "locked" announcement.
  Unambiguous regardless of color, and true in the shipped code right now
  — this channel alone is sufficient to distinguish dormant from locked
  today, independent of the interactivity claim below.
- **Interactivity — REQUIRED, not yet shipped.** The previous round claimed
  "locked rows are non-interactive... allocation controls don't respond."
  **That's false against the shipped code** — `bots.setAlloc`
  (`bots.js:116-122`) and the `allocMini` wiring (`main.js:296-309`,
  `main.js:325`) gate nothing; a locked row's `−`/`+`/`cap`/`max`/`0`
  buttons are fully clickable and silently write bot allocations into
  state today. Only the *readout* is inert, not the *input*. This is
  listed as a required fix, not a currently-true redundant cue — and it's
  also a live gameplay bug independent of this design pass (bots can be
  silently wasted on an unreachable row with zero feedback).

**So: dormant-vs-locked separation holds TODAY on the text-label channel
alone** — real, unambiguous, verified against source. The interactivity
channel and the Grind struggling-state split are **specified as required
behavior**, not asserted as shipped fact, so Phase 4/6/integration can pick
them up without this document having overstated what already works.

`faintest` is now scoped exclusively to the `.locked` tab (DW-3.3,
non-text/UI-component) — the Trophy-pip misuse that triggered this round's
blocker is fixed below, not carried forward.

**Neighbor-contrast evidence (unchanged in value from last round — no hex
moved, only which content binds to which token, so nothing here needed
re-deriving):**

```
bone   ↔ dim               1.66:1   (live-emphasis vs live-default — both "live," no separation required, real anyway)
gold   ↔ bone               1.08:1   (both live-emphasis-tier; not a state pair)
dim    ↔ recede              1.03:1   (both real AA text, not a state pair — see reclassification above)
recede ↔ faint               1.10:1   (ditto)
faint  ↔ faintest             1.50:1   (readable-floor vs. locked-non-text-floor — a real step; unaffected by the pip fix, since neither hex changed)
bone@live(1.0) ↔ bone@dormant(.5)   2.84:1   (the actual live/dormant row-level signal)
bone@dormant(.5) ↔ bone@locked(.45)  1.13:1   (weak by color alone — carried by the text-label channel instead, see above)
```

**Required behavior changes (specified here, none shipped, none applied
this phase — no code touched, per this phase's scope):**

1. `style.css`: `.pip.miss { color: var(--faintest); }` → `color:
   var(--faint);` — fixes review round 2's DW-3.2 blocker (see Contrast
   evidence below).
2. `main.js`/`bots.js`: gate `bots.setAlloc` (or the `allocMini` click
   handlers) on the row's locked state so a locked row's allocation
   controls stop accepting input — makes the interactivity claim true and
   closes a live silent-waste bug.
3. `main.js:841`: split Grind's `.locked` toggle into two independent
   conditions — `locked` (`!unlocked`, dim/opacity-.45, unchanged) and a
   new `struggling` (or similarly named) class for `unlocked && n>0 &&
   !zr.held`, styled at full opacity with `--warn` text, not dimmed. Add a
   `title`/tooltip to `.pip` (Minor, review 2) while touching this area,
   since `cursor: help` currently promises one that isn't there.
4. `style.css:133`: `#logHead { color: #4e7a5e; }` → `color:
   var(--logline);` — fixes THIS round's DW-3.2 blocker (see the
   Hardcoded-color audit and Contrast evidence below).
5. `rarity.js`: `mythic` `#d64a4a` → `#d85454` — the one rarity hex that
   fails as text (4.20:1 → 4.52:1 against its actual render surfaces).
   Listed here because it lives outside `style.css` and would otherwise be
   the one corrected value with no home in this checklist (review 4, Minor).

**Functional accents (unchanged except `--warn`/`--alert`, both real text
colors that measured just under AA at their actual usage sites):**

| Token | Hex | Notes |
|---|---|---|
| `--risk` | `#7aa4d4` | cool blue — risk zone reference |
| `--warn` | `#b26f5f` **(was `#b06a5a`)** | failstacks HUD, log warnings, dev panel |
| `--alert` | `#d25b44` **(was `#d0553e`)** | Ban Wave armed-confirm state |
| `--copper` | `#d08a3e` | copper economy |
| `--live` | `#6bbf7a` | scripts / live cursor |

**Rarity ramp (`rarity.js` — already JS-native named tokens, the existing
precedent this phase's canvas mechanism follows):** one hex fails as text —
`mythic` `#d64a4a` → **`#d85454`** (was 4.20–4.32:1 against its actual
render surfaces, now 4.52–4.95:1). All six other rarities (`common`,
`uncommon`, `rare`, `epic`, `legendary`, `origin`) already clear AA and are
unchanged.

### Corrected `:root` block (paste-ready for `style.css`)

```css
:root {
  --gold: #c9a94b;
  --gold-dim: #9a8a5a;
  --on-gold: #0d0d10;        /* NEW — text on solid-gold fills, was hardcoded twice */
  --bone: #bcb2a2;
  --dim: #838a97;
  --recede: #87878f;         /* was #6e6e78 — 3.64:1 on --panel, now 5.16:1 */
  --faint: #808086;          /* was #55555e — 2.49:1 on --panel, now 4.68:1 */
  --faintest: #64646a;       /* was #4a4a52 — 2.09:1 on --panel, now 3.13:1 */
  --bg: #0b0c10;
  --panel: #13141a;
  --inset: #17171c;
  --field: #22222a;
  --well: #101014;
  --line: #262a34;
  --line-soft: #1b1b22;
  --risk: #7aa4d4;
  --warn: #b26f5f;           /* was #b06a5a — 4.42:1 on --panel, now 4.67:1 */
  --alert: #d25b44;          /* was #d0553e — 4.42:1 on --panel, now 4.66:1 */
  --copper: #d08a3e;
  --live: #6bbf7a;
  --logline: #598368;        /* NEW, review round 3 — was #4e7a5e hardcoded
                                 on #logHead, 3.97:1 on --bg (FAIL); this
                                 clears 4.53:1, terminal-green register kept */
  /* state ladder (row/cell level) — the actual live/dormant/locked
     mechanism; named here for the first time, values unchanged from
     shipped (style.css:298,403), see Color tokens above for the math */
  --opacity-dormant: 0.5;
  --opacity-locked: 0.45;
  /* canvas-only semantic tokens (DW-3.5) — see Canvas token module */
  --gold-bright: #ffd700;
  --crit-gold: #ffd54a;
  --super-crit: #ff9a3c;
  --dmg-text: #e8dcc0;
  --fs-hero: 26px;
  --fs-masthead: 20px;
  --fs-display: 16px;
  --fs-body: 13px;
  --fs-small: 11px;
  --fs-label: 10px;
  --fs-micro: 9px;
}
```

Also required as one-line selector fixes (not `:root` values):

1. `#tabs button.locked { color: #45454d; ... }` → `color:
   var(--faintest);` — the hardcoded value measured 1.94:1 on `--panel`
   (below even the 3:1 floor DW-3.3 sets for it); pointing it at the
   corrected `--faintest` clears 3.13:1. Legitimate non-text/UI-component
   use (DW-3.3).
2. **`.pip.miss { color: var(--faintest); }` → `color: var(--faint);`**
   — fixes review round 2's DW-3.2 blocker: `--faintest` measured 3.04:1 on
   `--inset`, applied to genuine 10px readable text (piece names + `+N%`
   in the 70 Trophy pips) — a real WCAG 1.4.3 failure, not a 1.4.11
   non-text case. `--faint` (already AA-verified, unchanged hex) clears
   4.55:1 on `--inset` / 4.68:1 on `--panel` at the same usage site — see
   Contrast evidence below.
3. **`#logHead { color: #4e7a5e; ... }` → `color: var(--logline);`** —
   fixes THIS round's DW-3.2 blocker: `#logHead` (the always-visible
   `maintenance@dead-server:~$` header, `index.html:204`, `--fs-micro`
   9px) sits directly in `<main>` with no enclosing panel, so its real
   background is `--bg`. `#4e7a5e` on `--bg` measures **3.97:1** — fails
   the 4.5:1 body-text floor and was entirely outside the token set,
   contradicting this document's own "verified against every background"
   claim (the exact defect review round 3 caught). `--logline` (`#598368`)
   clears **4.53:1** on `--bg` — a small, hue-preserving lightness nudge,
   same technique as the other six adjusted hexes; still recognizably the
   terminal-green register accent, just legible.

### Hardcoded-color audit (exhaustive — every hex literal in `style.css`
outside the `:root` block, per review round 3's demand that the sweep be
complete, not spot-checked)

Grepped `style.css` for every `#`-hex literal outside lines 4–23 (the
`:root` block itself). Ten hits, each traced to source and a verdict —
**no hex is left unexamined this time:**

| Line | Selector | Hex | Live? | Verdict |
|---|---|---|---|---|
| 77 | `#pullBtn` | `color: #0d0d10` | **Dead** — `#pullBtn` confirmed absent from `index.html`/`main.js` (retired pull-to-attempt mechanic) | No live obligation; named for completeness |
| 86 | `#pullBtn:disabled` | `background: #3a3a44` | **Dead**, same element | No live obligation |
| 133 | `#logHead` | `color: #4e7a5e` | **Live**, always-visible | **FAIL (3.97:1 vs `--bg`) — fixed above, this round's blocker** |
| 309 | `.popTrack .barFill` | `background: #5a7a5a` | **Live** — the bots population bar (`#popFill`, `index.html:92`), confirmed rendered in the Training tab | **PASS as-is** — 3.28:1 vs `--field` (its track), clears the ≥3:1 non-text/UI-component floor (it's a progress-bar fill, not text) |
| 413 | `#devPanel` | `border: 1px dashed #6e3a32` | **Live**, but gated behind the `?dev` URL flag (developer-only surface, noted lower-priority by review round 2) | Decorative border, same precedent as `--line`/`--line-soft` hairlines (WCAG non-text contrast doesn't apply to dividers) — not a text color, no fix needed |
| 427 | `#devPanel button` | `border: 1px solid #6e3a32` | Same as above | Decorative border, same exemption. (The button's own text uses `var(--warn)`, already a verified token — not a literal) |
| 494 | `.reforgeCand` | `background: #1c1c22` | **Live** — the gear reforge bench, confirmed in `JOURNEY.md`'s Player-tab spec | **PASS as-is** — the only text drawn on it (`--bone`) measures 8.10:1, comfortably clear |
| 598 | `#descendBtn:hover` | `color: #0d0d10` | **Live** — the one real gold CTA (see DW-3.3 correction above) | Already named as `--on-gold` (`#0d0d10`, unchanged) in the `:root` block above; 8.56:1 on solid gold, PASS |
| 660–661 | `#tabs button.locked` | `color: #45454d` | **Live** | **FAIL (1.94:1) — fixed last round via selector fix 1 above (`--faintest`, 3.13:1)** |

**Also swept for non-hex hardcoded color (rgba/named colors) for the same
completeness demand:** six `rgba()` literals exist (`.tier-nightmare`
text-shadow glow, `flashOk`/`flashFail` keyframe tints, `.stashRow.upgrade`
and `.amCell.max` background washes, `.modal` backdrop scrim) — all are
translucent decorative overlays (glow, flash-feedback tint, a background
wash under already-AA-passing text, or a modal scrim), none are the sole
carrier of text/UI-component contrast, so none trigger a WCAG 1.4.3/1.4.11
obligation. `.tier-nightmare`/`.tier-risk` are additionally dead CSS (see
the dead-CSS list above) — the rgba glow inside `.tier-nightmare` never
renders regardless.

**Result: one real failure (`#logHead`, fixed above), everything else
checked and either already passing or exempt for a stated reason (dead
code or decorative non-text). Nothing left unaudited.**

### Contrast evidence (WCAG 2.x, computed — not asserted)

Same relative-luminance/contrast formula `palette.mjs` uses internally
(`palette.mjs` itself only *generates* a fresh ramp from one seed hue — it
has no CLI path to check two arbitrary existing hexes against each other,
so verifying this specific hand-built multi-hue token set needed the
formula applied directly; cross-referenced against `palette.mjs`'s own
solved output below).

**Before → after, every failing pair (target 4.5:1 body / 3:1 non-text):**

```
recede   on --panel : 3.64:1 → 5.16:1   PASS   (also 5.01:1 on --inset, the harder bg)
faint    on --panel : 2.49:1 → 4.68:1   PASS   (also 4.55:1 on --inset, and 4.98:1 on --bg where #wipeBtn renders it directly — review 4, Minor)
faintest on --panel : 2.09:1 → 3.13:1   PASS   (non-text floor ONLY — legitimate for the .locked tab; also 3.04:1 on --inset)
warn     on --panel : 4.42:1 → 4.67:1   PASS   (also 4.53:1 on --inset)
alert    on --panel : 4.42:1 → 4.66:1   PASS   (also 4.52:1 on --inset)
mythic   on --inset : 4.20:1 → 4.52:1   PASS   (also 4.65:1 on --panel)
locked-tab (#45454d) on --panel : 1.94:1 → 3.13:1  PASS  (via --faintest, non-text/UI-component use — see selector fix 1 above)
```

**Blocker fix, review round 2 — Trophy pip text (`.pip.miss`, real 10px text, was wrongly on `--faintest`):**

```
pip label  on --inset : (was --faintest) 3.04:1 FAIL  →  (--faint) 4.55:1  PASS  (body-AA, WCAG 1.4.3)
pip label  on --panel : (was --faintest) 3.13:1 FAIL* →  (--faint) 4.68:1  PASS
  * 3.13:1 was never actually adequate here either — it only ever cleared
    the non-text 3:1 floor, which doesn't apply to this genuine-text case;
    both numbers were a floor-mismatch, not a borderline pass.
```

**Blocker fix, THIS round — `#logHead` (the always-visible log header, entirely outside the token set until now):**

```
logHead on --bg : #4e7a5e 3.97:1 FAIL  →  var(--logline) #598368 4.53:1 PASS  (body-AA, WCAG 1.4.3)
```

**All pairs already passing, unchanged, verified against every background
they actually render on (`--bg` / `--panel` / `--inset`):**

```
dim      : 5.14–5.63:1   bone     : 8.53–9.33:1   gold      : 7.88–8.62:1
gold-dim : 5.24–5.73:1   risk     : 6.88–7.53:1   copper    : 6.28–6.88:1
live     : 7.96–8.71:1   rar-common/uncommon/rare/epic/legendary/origin : 4.70–13.44:1
gold CTA (#descendBtn — the ONLY live CTA; #pullBtn is dead, see dead-CSS list) vs --panel : 8.10:1 (non-text, ≥3:1 target — DW-3.3)
on-gold #0d0d10 on solid gold : 8.56:1
```

**Cross-reference:** `palette.mjs --seed "#c9a94b" --chroma muted --harmony
mono --scheme dark` solves gold's own hue (90.4°) to `accent-9: #cbb67c` —
confirms `--gold` (`#c9a94b`) sits in the correctly-solved neighborhood for
its hue, just richer/higher-chroma (an authored choice, not a default).

**A real defect this pass surfaced, not on the DW list:** `battle.js
drawBars()` draws the HP% label in fixed `#0d0d10`, right-aligned at the
bar's far edge. That position sits over the *empty track* (`--field
#22222a`) for any `remain < ~99%` — i.e. almost the entire fight —
measuring **1.23:1**. The label is only legible at exactly full HP.
**Fix (specified for whoever next touches `battle.js`, not applied this
phase — see `## Why no code was touched this phase`):** stop keying the
label's fill to a fixed on-gold color and use the same stroke-outlined
light-text technique the damage floaters already use two functions away
(`ctx.strokeStyle = well; ctx.lineWidth = 3; ctx.strokeText(...);
ctx.fillStyle = dmgText; ctx.fillText(...)`) — background-agnostic by
construction, reuses an existing pattern, no new mechanism.

## Canvas token module (DW-3.5 mechanism)

Canvas 2D's `fillStyle`/`strokeStyle` cannot resolve `var(--x)` — there's
no element context for the custom-property cascade to resolve against at
that call site. The fix is a small bridge module, **not** a hand-duplicated
hex list (that drifts from `style.css` the first time either file changes):

```js
// theme.js — resolves style.css's custom properties ONCE, so canvas code
// (battle.js) reads the SAME values the DOM does, never a hand-copied
// duplicate. Dark-ramp only (no light/dark runtime switch in this game),
// so a single resolve is correct — no per-frame re-read needed.
let cached = null;
export function theme() {
  if (cached) return cached;
  const css = getComputedStyle(document.documentElement);
  const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  cached = Object.freeze({
    gold: v("--gold", "#c9a94b"),
    onGold: v("--on-gold", "#0d0d10"),
    bone: v("--bone", "#bcb2a2"),
    field: v("--field", "#22222a"),
    well: v("--well", "#101014"),
    goldBright: v("--gold-bright", "#ffd700"),   // sub-15% HP / nightmare enhance / BREACHED
    critGold: v("--crit-gold", "#ffd54a"),        // crit-tier `*` damage + sparkle burst
    superCrit: v("--super-crit", "#ff9a3c"),      // super-crit-tier `**` damage
    dmgText: v("--dmg-text", "#e8dcc0"),          // normal-tier damage number
  });
  return cached;
}
```

Call `theme()` from inside `initBattle(el)` (after the canvas element and
stylesheet both exist), not at module load — confirmed safe: `battle.js`
is imported only by `main.js` (browser-only); `internal/test.js` and
`internal/sim.js` (the Node-run `npm test`/`npm run sim` paths) never
import it, so a `document`/`getComputedStyle` call here can't break the
sim/test suite the way a module-top-level call risked doing.

**What gets tokenized vs. what doesn't:** the 4 new tokens above are the
canvas hexes that *encode game state* (crit tiers, the HP-crisis threshold,
the breach reveal) — exactly what CLAUDE.md guideline 5 means by "every
term is displayed," these are displayed state, not decoration. The
illustrative sprite-shading hexes (gate timbers, hero silhouette, boss
crack colors — none tied to a state threshold) are left as literals but
centralized under one `SCENE` constant in the same module for
maintainability, not individually promoted to CSS custom properties — that
would be gold-plating past what DW-3.5 asks for (state-bearing color,
not every decorative pixel).

**Canvas type scale** (separate from the DOM scale — canvas units aren't
CSS px once the element is scaled by its container by `width: 100%`):

| Use | Px (canvas units) |
|---|---|
| Bar %/BREACHED label | 10 (bold) |
| Reveal subtitle | 12 |
| Normal-tier damage number | 15 |
| Crit-tier (`*`) damage number | 20 |
| Super-crit-tier (`**`) damage number | 27 |
| Enhance feedback (+N, non-nightmare) | 18 |
| Enhance feedback (+N, nightmare band) | 26 |
| BREACHED reveal display | 52 (Georgia) |

## Motion budget (DW-3.6)

| Effect | Duration | Trigger | Reduced-motion |
|---|---|---|---|
| Log cursor blink | 1.1s loop | ambient (log present) | respected (`@media (prefers-reduced-motion: reduce)`, style.css:152) |
| Log line entrance | 0.3s ease-out | new log line | respected (same query) |
| Enhance success glow (`.flash-ok`) | 0.7s | enhance resolves (success) | **not checked** — gap, flagged below |
| Enhance fail flicker (`.flash-fail`) | 0.45s | enhance resolves (fail) | **not checked** — gap |
| Boss-flash tint (canvas) | 70–160ms | each auto-hit lands | **not checked** — gap |
| Damage floater pop/drift/fade (canvas) | ~700ms | each auto-hit | **not checked** — gap |
| Screen shake (canvas) | 90–600ms, scaled to band/break severity | enhance (risk+ bands), wall break | **not checked** — gap |
| BREACHED reveal (canvas) | 6000ms, one-time per wall | wall break | **not checked** — gap; also the one named exception to the ≤700ms budget (see below) |

**The rule:** nothing exceeds ~700ms of feedback motion except the
one-time, non-blocking 6s BREACHED reveal (the journey's per-wall peak —
`JOURNEY.md` names it explicitly as the moment de-duplication must not
flatten). No effect delays or gates the next input; enhance already
resolves instantly (hard veto: no ceremony) — every listed effect is
feedback laid over an already-resolved outcome, never a wait before one.

**Gap, named not fixed:** the 4 canvas-driven effects and the 2 CSS
keyframes not already covered by the `prefers-reduced-motion` query don't
check it. Fixing this means editing `battle.js`/`style.css` logic, which
this phase's `Produces:` line (DESIGN.md only) and the DESIGN.md gate both
put out of scope for this pass — flagged here so Phase 4/6 (or a direct
follow-up once the user confirms direction) doesn't lose it the way the
plan's own flagged legibility gaps (Delve's un-multiplied overclock,
Grind's un-broken-out copper multiplier) were carried forward in
`JOURNEY.md` rather than silently dropped.

## Never (this project's tells at risk)

- No functional accent (`warn`/`alert`/`copper` — all measurably warm-hued,
  see Signature move) may migrate into an identity role (heading, hero
  number, CTA) — gold/bone's exclusivity in those three roles is the
  signature, not raw hue-family purity.
- No CLI/terminal aesthetic as the base layer — mono type is the *data*
  register (stat rows, log, canvas), not a "hacker" skin over the whole
  product. The shell/`PLAYERS ONLINE` register stays at the edges.
- No glitch art, corrupted text, or decay signifiers anywhere — the brief
  is explicit the server works correctly; absence (a queue that never
  moves) carries the feeling, not disrepair.
- No pure `#000`/`#fff` — confirmed: every token here is a tinted near-black
  or a desaturated warm/cool tone, none are pure black/white (`ai-tells.md`
  color tells).
- No slow ritual/ceremony animation on Enhance or anywhere else (hard veto)
  — verified against the full motion inventory above; nothing gates input.

## Why no code was touched this phase

`design-dna.md`'s gate ("Do not write or modify any UI code until the user
confirms DESIGN.md") and this phase's own `Produces:` line (only
`internal/DESIGN.md`) both point the same direction. The corrected
`:root` block, the `theme.js` module, the three selector fixes (`.locked`
tab, `.pip.miss`, `#logHead`), the required behavior changes (alloc-control
gating, Grind's struggling/locked split), and the `drawBars()` label fix
are all specified above precisely enough to apply verbatim once the user
confirms direction — that application is Phase 4 (component composition) /
Phase 6 (page application) work, or a direct follow-up commit.

## Open questions

- The canvas motion / `prefers-reduced-motion` gap (above) — a real
  accessibility item, not blocking this phase's contrast-verified lock,
  but not yet assigned to a phase either.
- The two legibility gaps `JOURNEY.md` already flagged (Delve's
  un-multiplied overclock rate, Grind's un-broken-out copper multiplier)
  are content/copy work, not token work — untouched here, carried forward
  as JOURNEY.md already does.

## What the user is being asked to confirm

1. **Direction:** "Last Warmth" as the named DNA — the warm-gold/bone-in-
   cool-neutral signature, the Ruler+Sage archetype framing, and the
   register split (structure calm, three named expressive moments) as an
   accurate account of the *existing* look, not a new one.
2. **The 7 hex adjustments** (`--recede`, `--faint`, `--faintest`, `--warn`,
   `--alert`, rarity `mythic`, and `--logline` new this round) — all small,
   character-preserving lightness nudges to clear AA, not palette changes.
   `--logline` is a brand-new named token (was a hardcoded `#4e7a5e` outside
   the token set entirely, missed until an exhaustive audit this round —
   see the Hardcoded-color audit table).
3. **The corrected live/dormant/locked model:** color/lightness reliably
   carries one strong split (live vs. not-live); dormant-vs-locked is
   carried by the text-label channel alone TODAY (verified) — interactivity
   is a required fix, not yet true (`bots.js`/`main.js` gate nothing on a
   locked row's alloc controls). `--opacity-dormant`/`--opacity-locked` are
   newly named (values unchanged from shipped CSS). Confirm this account
   and the three required behavior changes (alloc-control gating, Grind's
   struggling-vs-locked class split, the `.pip.miss`→`--faint` recolor).
4. **The `drawBars()` label-contrast defect** — confirm it's worth fixing
   (it's a real, currently-shipped legibility failure on the fight's
   central number) and which phase picks it up.
5. **Whether `theme.js` + the `:root`/selector edits + the three required
   behavior changes get applied now** (a small, low-risk follow-up commit)
   or wait for Phase 4/6.

Contrast evidence passes, so this file is marked `locked` above per this
build's instructions — but per the DESIGN.md gate (`design-dna.md` §14),
no downstream phase (Phase 4 component composition, Phase 6 page
application) should start until the user has actually confirmed the five
items above; if the user asks for changes, this file gets revised before
anything downstream builds against it.

---

## Component specs

Produced by Phase 4 of `.design-foundations/plans/2026-07-25-ui-dedup-audit.md`.
Doctrine: `design-systems` (token tiers, atomic composition, Kholmatova's
functional-vs-perceptual lens), `data-viz` (meter/marks-and-channels
encoding, Few's KPI hierarchy, Gestalt grouping), `interaction` (the 8-state
lifecycle, focus/touch-target rules). Every component below is derived from
a selector, id, or class that already renders in `index.html`/`main.js`/
`style.css` — this is a specification of the existing markup, tightened, not
a new library, per the phase's own constraint. **VERIFIED** = true today,
checked against source. **REQUIRED** = specified, not yet shipped — carrying
forward DESIGN.md's own convention rather than restating an unshipped
behavior as fact (the exact error the Phase 3 reviews caught repeatedly).
No code is touched this phase — `Produces:` is this file only, same
boundary Phase 3 held.

### Token tiers

**Global** (`palette.mjs` output, resolved directly into semantic names —
Phase 3's own call, not reopened) → **Semantic** (this file's `:root` above:
`--gold`/`--bone`/`--dim`/`--recede`/`--faint`/`--faintest`, `--panel`/
`--inset`/`--field`/`--well`, `--line`/`--line-soft`, `--risk`/`--warn`/
`--alert`/`--copper`/`--live`, `--fs-*`, `--opacity-dormant`/
`--opacity-locked`, the canvas token module) → **Component** (new, this
phase): scope-specific names for roles a component needs that the semantic
tier doesn't name directly. Per `design-systems.md` §B, "component tokens
let a component be restyled without touching the alias tier" — kept to
roles that actually recur or need disambiguating, not one name per CSS
property (the tier boundary is a design decision, not a rename pass).

**Semantic addition, this phase.** One color has no semantic-tier name yet:
`.popTrack .barFill`'s `#5a7a5a` (`style.css:309`). Phase 3's audit checked
its contrast (row 309: 3.28:1 vs `--field`, PASS — ≥3:1 non-text/UI-component
floor) but named no token for it, since Phase 3's sweep was contrast, not
token completeness. Rather than let the component tier cite that hex
directly (which is exactly the raw-value jump DW-4.1 forbids — a component
token must resolve through the alias/semantic tier, never around it), it
gets a semantic parent here, appended to the semantic layer, same append-
only footing as `--logline` in Phase 3:

```css
/* semantic tier — one addition, this phase. Unchanged value, newly named. */
--level-muted: #5a7a5a;  /* a muted-green "gauge" register — distinct from
                             --live (#6bbf7a, the brighter live/scripts
                             green); used for utilization/level meters, not
                             an activity indicator. Value = style.css:309,
                             contrast already verified (Phase 3 audit row
                             309, cited above, not re-derived). */
```

**Dimension tier, this phase (the missing half of DW-4.1).** Color got a
semantic tier in Phase 3; spacing/dimension never did, and every component
spec below was about to cite raw px for grid columns, padding, and track
heights with no backing at all — the same violation DW-4.1 bans, just on a
different axis. Derived from what `style.css` already uses (grepped every
`px` literal, ranked by frequency — not a freshly invented scale): eight
values account for the overwhelming majority of every gap/padding/track
declaration in the file (occurrence counts in parentheses):

```css
/* primitive dimension scale — derived from style.css's own most-used values */
--border-hairline: 1px;  /* every border/divider in the file (40 occurrences) */
--space-1: 2px;   /* (17×) tightest gaps, Cycle-meter track height */
--space-2: 3px;   /* (18×) Progress-meter track height, small gaps */
--space-3: 4px;   /* (33×) the base padding/gap unit — most common value in the file */
--space-4: 6px;   /* (24×) row padding-vertical, common gaps */
--space-5: 8px;   /* (32×) row grid-gap, alloc padding-horizontal, Level-meter track height */
--space-6: 10px;  /* (24×) arena padding-bottom, common component padding */
--space-7: 12px;  /* (10×) arena padding-sides */
--space-8: 16px;  /* (5×) chip padding-horizontal, resbar gap */
```

No separate semantic-alias layer for dimension — same collapse Phase 3 made
for color ("no new abstraction for a role these tokens already fill"):
component tokens below reference `--space-N` directly, since the scale steps
are already fine-grained enough that an intent-named middle layer
(`--gap-row: var(--space-5)`) would rename, not decide, anything new.

**Corrected — round-2 review, Minor 2:** `.arena`'s `padding: 8px 12px 10px`
was wrongly listed as a one-off in the prior round. It isn't: 8/12/10
decompose cleanly onto three existing steps (`--space-5`/`--space-7`/
`--space-6`, used as `--arena-pad` below) — asymmetric padding is still
fully on-scale padding, not an exception. **The one genuine one-off** (same
precedent as this file's own `.modalClose` type-scale exception, and the
only value that's actually off-scale, not merely asymmetric): `#tabs
button`'s `padding: 7px` (`style.css:167`) — 7 is not one of the eight
primitive steps.

**Second sweep, round-2 review — every value inside every range this
document already cites, not just the ones the first pass had in mind:**

- `.chipGroup { padding: 3px 2px; border-radius: 5px; }` (`style.css:194-195`
  — inside the Chip/KPI spec's own cited `style.css:187-205`). The padding
  decomposes onto the scale (`--space-2`/`--space-1`, → `--chip-group-pad`
  below). The radius does not: grepped every `border-radius` in the file —
  `5px` (here) and `0` (`.seg button`, a reset, not a scale member) are the
  *only* two declarations in the whole stylesheet. A single, non-recurring
  radius doesn't earn a primitive (minting `--radius-sm` for one use would
  imply a radius scale that doesn't exist) — named as a genuine one-off
  instead, same class as `#tabs button`'s `7px`.
- `.allocMini`/`.allocMore { gap: 3px; }` (`style.css:274, 280`) and
  `.allocMini input { width: 44px; padding: 3px 4px; }` (`style.css:284,
  289` — all inside the Allocation control spec's own cited `style.css:
  274-291`). Gap and padding decompose onto the scale (`--alloc-gap`,
  `--alloc-input-pad` below). The `44px` width does not decompose (it's a
  fixed control width, not a spacing gap) and is single-use — named as
  `--alloc-input-width` in the component tier (a component-scoped size
  token, same category as `--row-col-name`/`--row-col-gain` below, not a
  spacing-scale member).
- `.rowlist .row.active { border-left: 3px solid var(--gold); padding-left:
  8px; }` (`style.css:296` — inside Row's own cited `style.css:263-299`).
  Both decompose onto the scale (`--space-2`, `--space-5` → `--row-active-
  border`, `--row-active-pad-left` below).
- The mobile media query (`style.css:437-449`, cited in Row's Grammar
  paragraph): `column-gap: 8px` (reuses `--row-gap`, same value as desktop's
  `gap: 8px`) and `row-gap: 4px` (new — `--row-gap-wrap` below, the vertical
  gap that only exists once alloc/stat wrap onto their own lines). The
  `560px` breakpoint itself is a **named, out-of-scope exception**: it's a
  viewport threshold, not a spacing/padding/track value, appears exactly
  once in the file, and belongs to a responsive/breakpoint tier this phase
  wasn't asked to build (`design-systems` doctrine's dimension example is
  spacing, not breakpoints) — named here so it isn't silently absorbed into
  a scale it was never part of.
- `.arena { margin: 8px 0; }` and `.arena .controls { margin: 8px 0 4px; }`
  (`style.css:55, 57` — inside Arena's own cited `style.css:55-57`). Both
  decompose onto the scale (`--arena-margin`, `--arena-controls-margin`
  below).
- Two inline `style="width:4em"` attributes (`main.js:481`, the Dungeon
  duty-row alloc input; `index.html:187-188`, the Difficulty and Pull-out-
  at-floor inputs — the latter inside Arena's own cited `index.html:185-
  196`) recur identically 3×, but in `em`, a different unit family from the
  px-based `--space-N` scale (relative to the control's own font-size, not
  the layout rhythm). Named here rather than pulled onto the px scale or
  silently passed over — a genuine, real, recurring value, just not a
  dimension-tier member.

**Third sweep, round-3 review — enumerated by property, not by the value
types the first two sweeps happened to be looking for.** Two rounds of
review each caught a real miss and each then found another: round 1 missed
the dimension tier entirely; round 2's own sweep caught padding/gap/width/
margin-shorthand/border-left but missed plain `margin-top` specifically —
the blind spot was a property, not a range. The fix for a blind spot in
"which properties count" is to stop scanning by expected value-shape and
instead walk every declaration, in every cited range, grouped by CSS
property, so nothing can hide behind an unfamiliar property name a second
time:

| Property | Every occurrence inside a cited range | Resolution |
|---|---|---|
| `width` | `.allocMini input` 44px (`274-291`) | `--alloc-input-width` (one-off size, named above) |
| `height` | `.rowBar` 2px, `.amBar` 3px, `.barTrack` 8px (`299`,`408`,`258`); `.rowFill`/`.amBar>span`/`.barFill` 100% (`300`,`409`,`259`) | fixed values → `--meter-track-*`; `100%` is relative, exempt (no fixed length to tokenize) |
| `padding` (incl. `-left`) | row `6px 4px` (`268`); `.allocMini button` `4px 8px` (`277`); `.allocMini input` `3px 4px` (`289`); `.row.active` `padding-left` `8px` (`296`); `.chipGroup` `3px 2px` (`195`); `.chip` `2px 16px` (`198`); `.arena` `8px 12px 10px` (`55`); `#tabs button` `7px` (`167`) | all decompose onto `--space-N` and are tokenized, **except** `#tabs button`'s `7px` — the one genuinely off-scale value, named as a one-off |
| `margin` (incl. `-top`) | `.arena` `8px 0` (`55`); `.arena .controls` `8px 0 4px` (`57`); `.arena #battle` `0 auto` (`56`) | tokenized (`--arena-margin`, `--arena-controls-margin`) or zero/keyword, exempt |
| `margin-top` (isolated — **round-2's blind spot, walked separately this round**) | `.barTrack` 4px (`258`); `.chipLbl` 1px (`205`) | ~~`.barTrack`'s 4px decomposes cleanly onto `--space-3` → **new**, `--meter-level-margin`~~ — **SUPERSEDED by round 4:** that 4px never renders. `.barTrack`'s only instance is `<div class="barTrack popTrack">` (`index.html:92`) and `.popTrack`'s `margin: 6px 0 10px` (`style.css:308`) wins the cascade, so the tokens are derived from the rendered values instead: `--meter-level-margin-top` (`--space-4`) and `--meter-level-margin-bottom` (`--space-6`). See the composed-selector correction below. `.chipLbl`'s 1px does **not** decompose — the scale's smallest spacing step is `--space-1` (2px), and reusing `--border-hairline` (also 1px) would misapply a token scoped to border/divider strokes to an unrelated optical margin nudge (the exact category error `design-systems.md`'s functional-vs-perceptual lens warns against — same value, different role). Single occurrence in every range this document cites (`.slotItem .affixLine`'s own `margin-top: 1px`, `style.css:471`, is real but outside every cited range, so out of this sweep's scope). **Named as a third genuine one-off**, same class as `#tabs button`'s `7px` and `.chipGroup`'s `border-radius: 5px`. |
| `gap` (incl. `column-`/`row-`) | row `8px` (`266`); `.allocMini`/`.allocMore` `3px` (`274`,`280`); mobile `column-gap: 8px` / `row-gap: 4px` (`440`,`441`) | tokenized (`--row-gap`, `--alloc-gap`, `--row-gap-wrap`) |
| `border` (shorthand width) / `border-left` | every 1px border/divider (`262`,`269`,`287`,`193`,`200`,`55`,`161`) | `--border-hairline`, except `.row.active`'s `border-left: 3px` (`296`) — a deliberate thicker accent stripe → `--row-active-border` |
| `border-radius` | `.chipGroup` 5px (`194`) | named one-off — the only non-zero radius in the file (grepped) |
| `grid-template-columns` | row `130px 100px auto 1fr` (`265`); mobile `1fr auto` (`439`) | fixed columns → `--row-col-name`/`--row-col-gain`; `auto`/`1fr` are keywords, not lengths |
| `flex` | `#tabs button { flex: 1 }` (`159`) | unitless grow-factor, not a length — no token applicable |
| `min-width` / `max-width` | `.rowAlloc`/`.rowStat` `min-width: 0` (`446`); `.arena #battle` `max-width: 100%` (`56`) | zero/relative, exempt |
| `letter-spacing` | `.chipLbl` `.12em` (`205`); `#tabs button` `.08em` (`165`); `.locked` `.2em` (`660`); `.sub` `0` (`341`) | **out of this tier's scope, named not dropped**: em-based typographic tracking is a Phase 3 Type/register decision (small-caps chrome voice), not a spacing/layout rhythm value — re-auditing it would reopen locked Phase 3 content, which this phase doesn't do |
| `font-size` | every cited rule that sets it | already Phase 3's `--fs-*` type scale — a different, already-governed tier, not re-derived here |
| `opacity` | `.row.locked { opacity: .45 }` (`298`) | already Phase 3's `--opacity-locked` — not a raw value, not this tier's job |
| `color`/`background`/`border-color` | throughout every cited range | already the semantic color tier (Phase 3 + this phase's one addition, `--level-muted`) — a different property class entirely, not a dimension |
| non-dimension keywords (`display`, `position`, `cursor`, `text-align`, `overflow-wrap`, `align-items`, `justify-content`, `flex-wrap`, `text-transform`, `font-variant`, `font-style`, `font-weight`, `font-family`) | throughout | no length value of any kind — nothing to tokenize |

**Scope of this sweep — read this before trusting it as exhaustive.** The
table above walks every length-carrying property in every range this
document cites, grouped by property rather than by an assumed value shape.
That is what it proves, and no more. Four review rounds each falsified a
prior claim of full exhaustiveness, in a new place each time: no dimension
tier at all, then values outside the shape being looked for, then a whole
property (`margin-top`), then a composed selector (below). The pattern is
that a manual re-read cannot establish exhaustiveness about itself — each
sweep is bounded by the blind spot it is unaware of. So this section claims
coverage of the enumerated properties across the cited ranges, NOT that no
untokenized length exists anywhere. Treat an untokenized value found later
as expected, not as a contradiction.

**Composed-selector correction (review round 4).** `--meter-level-margin`
was derived from `.barTrack { margin-top: 4px }` (`style.css:258`), but
`.barTrack` never renders alone — its only instance is
`<div class="barTrack popTrack">` (`index.html:92`), and `.popTrack`'s own
`margin: 6px 0 10px` (`style.css:308`) is declared later, so it wins the
cascade. The 4px never paints. Corrected below: the token now carries the
value that actually renders, and the shorthand's three parts are named.
This is correct CSS behaving correctly — the defect was in the spec naming
a dead value, not in the stylesheet.

Two further omissions from the same round, resolved here:
`width: 0` on `.rowFill`/`.barFill` (a meter's zero-state origin, not a
dimension needing a scale step), and the `left`/`right`/`bottom: 0` inset
properties on `.rowBar` (an edge-anchoring property class the sweep had not
enumerated at all; zero-valued, so no scale step applies).

```css
/* component tier — maps onto the semantic + dimension tiers above (DW-4.1).
   Additive to :root; not applied to style.css this phase (no code touched). */
--row-name: var(--bone);              /* .rowName */
--row-name-active: var(--gold);       /* .row.active .rowName */
--row-gain: var(--faint);             /* .rowGain — reference/potential value, recedes */
--row-stat: var(--bone);              /* .rowStat — live output */
--row-stat-maxed: var(--gold);        /* .row.maxed .rowStat */
--row-col-name: 130px;                /* .rowlist .row grid col 1 — content width, not a rhythm step */
--row-col-gain: 100px;                /* .rowlist .row grid col 2 */
--row-gap: var(--space-5);            /* .rowlist .row { gap: 8px }; reused for the mobile
                                          media query's column-gap: 8px (style.css:440) — same value */
--row-gap-wrap: var(--space-3);       /* mobile-only row-gap: 4px (style.css:441), between
                                          alloc/stat once they wrap onto their own lines */
--row-pad: var(--space-4) var(--space-3); /* .rowlist .row { padding: 6px 4px } */
--row-active-border: var(--space-2);      /* .row.active { border-left: 3px solid ... } */
--row-active-pad-left: var(--space-5);    /* .row.active { padding-left: 8px } */
--chip-value: var(--bone);            /* .chipVal */
--chip-value-emphasis: var(--gold);   /* .chipVal b */
--chip-label: var(--dim);             /* .chipLbl */
--chip-pad: var(--space-1) var(--space-8); /* .chip { padding: 2px 16px } */
--chip-group-pad: var(--space-2) var(--space-1); /* .chipGroup { padding: 3px 2px } */
--meter-fill-depletion: var(--gold);              /* canvas boss HP bar, normal */
--meter-fill-depletion-crisis: var(--gold-bright); /* canvas boss HP bar, <15% — reuses the existing DW-3.5 canvas token */
--meter-fill-cycle: var(--gold);                  /* .rowFill — training-tier / zone kill-cycle pulse */
--meter-track-cycle: var(--space-1);              /* .rowBar { height: 2px } */
--meter-fill-progress: var(--gold-dim);           /* .amBar>span — Armory rank progress */
--meter-fill-progress-maxed: var(--gold);         /* .amCell.max .amBar>span */
--meter-track-progress: var(--space-2);           /* .amBar { height: 3px } */
--meter-fill-level: var(--level-muted);           /* .popTrack .barFill — now resolves through the
                                                      semantic tier above, not a raw hex (DW-4.1 fix) */
--meter-track-level: var(--space-5);              /* .barTrack { height: 8px } */
/* Level meter margin — the rendered value comes from .popTrack (style.css:308),
   which overrides .barTrack's margin-top: 4px by cascade order. See the
   composed-selector correction in the sweep section. */
--meter-level-margin-top: var(--space-4);         /* .popTrack margin top    — 6px */
--meter-level-margin-bottom: var(--space-6);      /* .popTrack margin bottom — 10px */
/* .popTrack's horizontal margin is 0 — no token, no scale step applies. */
--alloc-control: var(--recede);   /* .allocMini button/input chrome — recedes so the fed number reads louder */
--alloc-value: var(--gold);       /* .allocMini input text */
--alloc-pad: var(--space-3) var(--space-5); /* .allocMini button { padding: 4px 8px } */
--alloc-gap: var(--space-2);          /* .allocMini, .allocMore { gap: 3px } */
--alloc-input-pad: var(--space-2) var(--space-3); /* .allocMini input { padding: 3px 4px } */
--alloc-input-width: 44px;            /* .allocMini input { width: 44px } — a fixed control size,
                                          not a rhythm step (like --row-col-*); single-use, and the
                                          one dimension in this component that already clears
                                          WCAG 2.5.8's 44px minimum — see the touch-target note below */
--arena-pad: var(--space-5) var(--space-7) var(--space-6); /* .arena { padding: 8px 12px 10px } — asymmetric, still fully on-scale (round-2 correction) */
--arena-margin: var(--space-5) 0;             /* .arena { margin: 8px 0 } */
--arena-controls-margin: var(--space-5) 0 var(--space-3); /* .arena .controls { margin: 8px 0 4px } */
--tab-idle: var(--dim);
--tab-active: var(--gold);
--tab-locked: var(--faintest);    /* REQUIRED — style.css:660 still hardcodes #45454d; this is DESIGN.md's own selector-fix #1, not yet applied */
--afford-accent: var(--gold);     /* section.game button.affordable — the reusable spend-surface affordability signal */
```

No raw hex or raw px sits in the component tier anymore: `--meter-fill-level`
resolves through `--level-muted` (semantic), and every dimension resolves
through `--space-N`/`--border-hairline` (primitive) or is named as an
explicit, honest one-off — the same disclosure standard this file already
holds itself to elsewhere.

**Sweep result (round-2 review, corrected by round-3):** round 2's sweep
checked every cited range for the value *shapes* it had in mind (padding,
gap, width, margin shorthand, border-left) and missed a plain `margin-top`
in two of those same ranges (`.chipLbl`, `style.css:205`; `.barTrack`,
`style.css:258`) — a property-name blind spot, not a range it failed to
open. Round 2's claim of exhaustiveness is corrected here rather than left
standing. **Sweep result (round-3 review, property-enumerated — see the
table above):** every declaration in every cited range is now walked once
per CSS *property* rather than per expected value-shape. That found the two
`margin-top`s: `.barTrack`'s decomposes onto the existing scale, `.chipLbl`'s
does not and is named as a third genuine one-off. (Round 4 then showed
`.barTrack`'s `margin-top` never renders at all — `.popTrack` overrides it by
cascade — so the token was re-derived from the values that actually paint;
see the composed-selector correction above.) **Three true one-offs survive this sweep** (`#tabs
button`'s `7px`, `.chipGroup`'s `border-radius: 5px`, `.chipLbl`'s
`margin-top: 1px`) plus one true out-of-scope value (the `560px`
breakpoint) and one different-unit-family value (`4em`, ×3, three inline
`style` attributes) — every one of them named, none silently dropped, and
the enumeration is now checkable by property rather than by re-trusting
this document's own prior claim of completeness.

### Row

**Selectors:** `.rowlist .row` (`style.css:263-299`), built by `main.js` in
four places: training tiers (`main.js:317-328`), zones (`main.js:344-354`),
Dungeon duty rows (`main.js:479-497`), Dungeon journal rows (`main.js:501-504`),
and Delve's Cache-tree rows (`main.js:465-469`).

**Grammar:** one CSS grid, four positional columns (`130px 100px auto 1fr`
desktop; `1fr auto` + full-width wrap for the last two at ≤560px,
`style.css:437-449`) — **not four named slots**, since the grid has no
`grid-template-areas`. What actually fills each column varies by row
purpose, observed at four arities in the shipped markup:

| Arity | Columns filled | Used by |
|---|---|---|
| 4-slot + bottom fill bar | name / gain / **`.allocMini` alloc** / stat + `.rowBar`/`.rowFill` | Training tiers, Grind zones |
| 4-slot, no bar, bespoke alloc | name (+ nested `.sub` effect text) / gain / **inline −/+/max/0** (not `.allocMini`) / stat | Dungeon duty rows |
| 3-slot, no bar, action button | name / gain / stat *(3rd column)* / **buy button** *(4th column, not wrapped in `.rowAlloc`)* | Delve Cache-tree rows |
| 2-slot, readout only | name / stat *(2nd column)* — no gain, no alloc, no bar | Dungeon journal rows |

The 3- and 2-slot rows still render correctly because the grid is column-
position-based, not name-based — worth knowing before extending the grammar
(a future 5th field would need a 5th positional column, not a new "named
slot"). Row is genuinely one component at four honest arities, not four
components — same conclusion the codebase itself reached (`main.js:475`:
"Duty rows mirror the training/zone row grammar so the board reads as the
same instrument").

**States:**

| State | Trigger | Visual | Status |
|---|---|---|---|
| idle | default | `--row-name` on name, `--row-stat` on stat | VERIFIED |
| hover | N/A at the row level | rows aren't themselves clickable; hover lives on the child button/input (`section.game button:hover:not(:disabled)`) | VERIFIED (hover is a child-control state, not a row state) |
| active | squad/allocation > 0 on this row | `.row.active`: 3px gold left border + `--row-name-active` | VERIFIED |
| maxed | rate at/above cap (training) or rank at cap (implied) | `.row.maxed`: `--row-stat-maxed` on the stat text. **Corrected, round-2 review:** the fill does NOT change color on maxed for a Cycle bar — `.rowFill` is unconditionally `--gold` in every state (`style.css:300`), and `.rowlist .row.maxed .rowFill { background: var(--gold); }` (`style.css:666`) just restates the same value, a no-op. What actually reads as "maxed" for the bar itself is the Meter spec's own **Progress** species swapping fill color at `.amCell.max` — a different species, not this one. Cycle's own visual tell at 100% is the bar sitting solid/full-width (via the `rate >= 10` strobe-avoidance branch, `main.js:806`), not a color change — see the Meter spec's States table, which is the accurate account. | VERIFIED |
| disabled | N/A as a distinct visual state today | see "locked" — the codebase has no separate disabled-but-visible row state; a row is either normal or `.locked` | — |
| locked | tab feature/tier/zone not yet reached | `.row.locked`: `opacity: var(--opacity-locked)` (.45) + `cursor: default`. Readout prints the unlock condition as text (VERIFIED: `"locked · N/M fills of..."`, training only). **REQUIRED, not shipped**: the row's alloc control must stop accepting input on lock — it doesn't (`bots.js:116-122`, `main.js:296-309`, already named in this file's Color tokens section). **Also REQUIRED, found this pass**: Dungeon's duty-row alloc buttons have the same gap independently — `setParty()` (`main.js:484-488`) guards only `state.instance.running`, never `inst.dutyUnlocked(state, m)`, so a duty gated behind a script-version rank still accepts −/+/max/0 clicks even though its `<input>` correctly shows `disabled` (`main.js:991`). Two separate implementations, same defect class. |
| struggling (Grind-only) | zone manned, live, squad DPS below the hold gate | **REQUIRED, not shipped** — currently reuses `.locked`'s dim treatment (`main.js:841`), making a live-and-failing zone look identical to an unreachable one. Already named in this file's Color tokens section; repeated here because it's a Row state, not a color fact. |

### Rowlist

**Selector:** `.rowlist` (`style.css:262`) — `border-top: 1px solid
var(--line)`; each child `.row` supplies its own `border-bottom: 1px solid
var(--line-soft)`, so the list reads as one hairline-divided block, not N
bordered boxes. No separate rowlist-level interaction state — it's a pure
layout wrapper; its only "state" is how many rows it holds (1 for Delve's
tree-of-5, up to 15 for zones), which does not change its own styling.

### Chip / KPI cluster

**Selectors:** `.chipGroup` + `.chip` (`style.css:187-205`), reused in
exactly two places: the resource bar (`#resbar`, two separate `.chipGroup`s —
CP+bots, then copper+scripts — `index.html:11-33`) and the Player tab's
Combat Power breakdown (`#powerBreakdown`, one `.chipGroup` of three chips —
`index.html:125-129`). This is the KPI-row pattern (`data-viz` doctrine,
Few's *Information Dashboard Design*): a labeled current value with an
adjacent rate, grouped by relatedness (Gestalt proximity — CP+bots share a
group because both are "what the swarm is doing," copper+scripts share the
other because both are currency-adjacent).

**Anatomy:** `.chipVal` (`--chip-value` default, nested `<b>` → `--chip-
value-emphasis`) over `.chipLbl` (`--chip-label`, uppercase, micro caption
size). Every chip in every group uses identical type size — there is no
visual-prominence hierarchy distinguishing Combat Power (the tab's canonical
owned stat, JOURNEY.md) from a secondary chip in the same group. Flagged as
a data-viz observation (Few: "the single most important metric is the most
visually prominent"), not a DW item — the grouping already carries some of
that weight (CP chip is first, in its own group), so this is a minor,
past-the-floor note for whoever composes pages in Phase 6, not a defect.

**States:** chips are pure readouts — no hover/active/disabled/locked.
The one state that exists is **visibility**: `#scriptChip` is `display:none`
until `state.scripts > 0 or state.rebirths > 0` (dormant→live pointer,
already named in JOURNEY.md's Global-chrome table). VERIFIED.

### Meter / progress bar

Four meter instances ship today; **Dungeon has none** (floor/haul/damage%
render as text only, `main.js:966-970` — the damage-% figure swaps between
`.warn`/`.sat` text color rather than a bar). DW-4.4 is satisfied by
confirming there is no fifth bar to conflict with the other four, and by
specifying the form a future Dungeon meter must take if one ships (below).

| Species | Selector | Track | Fill | Semantics |
|---|---|---|---|---|
| **Depletion** | canvas `drawBars()` (`battle.js:124-141`) | `--field` (`#22222a`, matches exactly) | `--meter-fill-depletion` normal, `--meter-fill-depletion-crisis` below 15%, static dark when broken | One-shot per wall: drains full→0 exactly once, never refills mid-fight. Resets to full only when a NEW wall begins (a different boss object, not a resumption of the same bar) — VERIFIED. |
| **Cycle** | `.rowBar`/`.rowFill` (`style.css:299-300`) | transparent (no visible track) | `--meter-fill-cycle` | Pulses 0→100% per work-unit (one training fill, one kill), then resets — a *repeating pulse*, not a session-long progress bar. Training tiers and zone kill-cycles both use this, correctly, since both ARE the same species (a unit-of-work cycle), not a conflation. |
| **Progress-to-rank** | `.amBar > span` (`style.css:408-410`) | `--line-soft` | `--meter-fill-progress`, swapping to `--meter-fill-progress-maxed` at `.amCell.max` | Climbs toward the next Armory rank threshold across the whole run; resets only on a rank-up (minutes-to-hours cadence), not per-tick. |
| **Level** | `.barTrack`/`.barFill`, `.popTrack` override (`style.css:258-259, 309`) | `--field` | `--meter-fill-level` → `var(--level-muted)` (`#5a7a5a`, semantic addition this phase — see Token tiers) | Utilization gauge: `pop / capacity`. Capacity itself grows, so 100% is a moving target this bar is not designed to "complete" — a level gauge, not a completion gauge. |

**Verified today, not just asserted:** the four species already differ by
track height (`--space-1` cycle / `--space-2` progress / `--space-5` level /
~5% of canvas height for depletion), track color/visibility (transparent /
`--line-soft` / `--field` / `--field`), and fill color (gold / gold-dim /
muted green / gold-with-crisis-swap) — plus the depletion bar renders on a
wholly separate medium (canvas, not DOM). **They do not currently read as
the same object.**

**States:**

| State | Applies to | Trigger | Visual | Status |
|---|---|---|---|---|
| idle / live | all four species | default | full opacity, species fill color per the table above | VERIFIED |
| locked (inherited) | **Cycle only** | the meter's parent `.row` carries `.locked` | dims to `var(--opacity-locked)` (.45) — **not a meter-owned rule**, it cascades from the parent row: `.rowlist .row.locked { opacity: var(--opacity-locked); }` (`style.css:298`) has no `.rowFill`/`.rowBar` exclusion, so the child meter dims with everything else in the row. Confirmed live in both instantiations: `main.js:792` toggles `.locked` on the same `.row` element whose `.rowFill` child is built at `main.js:324` (training tiers), and `main.js:841` does the same for zone rows. | VERIFIED — the cascade is real and unconditional, not a REQUIRED gap; it's just never named until now. |
| struggling (inherited) | **Cycle only, Grind zones** | zone manned, live, squad DPS below the hold gate | **REQUIRED, not shipped** — currently reads as `.locked`'s same 0.45 dim (`main.js:841`, already named under Row's own struggling state above), so a live-and-failing zone's Cycle meter is visually indistinguishable from a genuinely locked one's. Once Row's struggling class ships, its meter inherits full opacity + the row's `--warn` accent automatically — no separate meter-level fix needed, since the dimming is inherited, not meter-owned. | REQUIRED (tracks Row's own struggling fix, not a new defect) |
| maxed | **Progress only** | Armory cell at max rank | fill swaps `--meter-fill-progress` → `--meter-fill-progress-maxed` (`.amCell.max .amBar>span`) | VERIFIED |
| crisis | **Depletion only** | boss HP < 15% | fill swaps `--meter-fill-depletion` → `--meter-fill-depletion-crisis` | VERIFIED |
| depleted | **Depletion only** | wall broken | fill goes static-dark; rect draws at zero width (`remain` forced to 0), so this state is technically live but visually unpainted — see the minor observation below | VERIFIED (paints, but zero-width) |
| hover / active / disabled | all four species | N/A | meters are non-interactive readouts; no bar itself is clickable, hoverable, or focusable in any instance | N/A — no interactive surface exists on any meter |

Cycle is the only species that visibly participates in the locked/struggling
ladder, because it's the only one that lives *inside* a `.row` that can
itself be locked — Progress (Armory cells), Level (population), and
Depletion (canvas, its own document) have no lockable parent to inherit
from, so "locked"/"struggling" don't apply to them; that's a structural fact
about where each meter sits, not an inconsistency between them.

**The actual gap:** none of this is declared. It happened to fall out of
four independent implementations, so nothing stops a fifth meter from
picking colors/heights that collide with an existing species by accident.
**REQUIRED — not shipped:** a `data-viz` attribute naming the species
explicitly, so the distinction is a rule, not a coincidence:

```html
<!-- REQUIRED, not yet in index.html/main.js/style.css — grepped: zero matches
     in the game code today; the attribute exists only in this plan's own
     planning docs, not in a single rendered element. -->
<canvas id="battle" data-viz="depletion">
<div class="rowBar" data-viz="cycle">
<div class="amBar" data-viz="progress">
<div class="barTrack popTrack" data-viz="level">
```

If a Dungeon meter ships later (e.g., a floor-progress or attrition bar), it
must declare one of these four `data-viz` values rather than inventing a
fifth undocumented species — floor count is progress-to-a-target-this-run
(closest to **progress**, though it resets every run rather than per-rank,
so it would need its own row in this table if it ships, not silent reuse).

**Minor observation, not a DW item:** `drawBars()`'s `remain<=0` fill color
(`#3d3a26`) paints a zero-width rect whenever it fires (`remain` is forced
to exactly 0 the same tick the boss is marked broken, and the drawn width is
`(W-40) * remain`) — effectively unpainted in practice. Noted for whoever
next touches `battle.js`, not a defect blocking this phase.

### Arena

**Selector:** `.arena` (`style.css:55-57`) — bordered inset panel (`border:
1px solid var(--line); background: var(--panel); padding: 8px 12px 10px`).
Used in two places that are **perceptually identical but functionally
different** (Kholmatova's functional-vs-perceptual lens, `design-systems`
doctrine):

- **Boss tab** (`index.html:63-70`): hosts the actual canvas fight scene —
  `<canvas id="battle">` + a `.controls` row (`#depth` hero readout +
  `#cooldown` caption) + `#projection` caption below. This is "the arena" in
  the literal sense the name implies.
- **Dungeon tab** (`index.html:185-196`): reuses the same class purely for
  its bordered-panel visual treatment around a plain control cluster —
  difficulty input, pull-out-at-floor input, proxy toggle, Send/Pull-out
  buttons. No canvas, no combat readout, no depletion meter.

This is a naming ambiguity, not a bug — both renders are correct, bordered
panels are the right visual treatment for both. Flagged so a future reader
doesn't assume `.arena` implies "has a canvas" everywhere it appears. Not
renamed this phase (a CSS/markup change, out of the `Produces:` boundary).

**States:** N/A as a single component — the Boss-tab occupant's states are
the meter's (above) and the Boss page spec's (JOURNEY.md); the Dungeon-tab
occupant's states are the allocation-control and buy-button states (below).
`.arena` itself contributes only the panel chrome, which has no state.

### Allocation control

The densest, most-repeated component (per the plan's own edge case) — and,
verified this pass, **two distinct implementations**, not one:

1. **`.allocMini`** (`main.js:288-310`, `style.css:274-291`) — `−`/input/`+`
   inline, a `cap` button (bots needed to hit the bar's rate ceiling), and a
   `⋯` toggle (`.allocX`) that reveals `max`/`0` behind `.allocMore`
   (collapsed by default — `style.css:280-282`). Used by Training tiers,
   Grind zones, and the Enhance squad's alloc (`withCap=false` variant, no
   cap button). This is the full-featured instance.
2. **Dungeon duty-row alloc** (`main.js:479-497`) — a hand-rolled `−`/input/
   `+`/`max`/`0` cluster with **no cap button and no `⋯` collapse**, living
   directly in `.rowAlloc` rather than wrapped in its own `.allocMini` span.
   Conceptually the same control (assign N of a finite resource to a row),
   implemented separately.

Both instances recede visually (`--alloc-control` on chrome, buttons/input
border) so the fed number (`--alloc-value`, gold) reads louder than its own
controls — the stated design intent in `style.css:275-276` ("alloc controls
recede... so the numbers they feed read louder"), confirmed as the same
principle in both implementations even though the code isn't shared.

**States:**

| State | `.allocMini` | Dungeon duty variant | Status |
|---|---|---|---|
| idle | recede-colored buttons/input | same (inherits `section.game button`) | VERIFIED |
| hover | `section.game button:hover:not(:disabled)` → gold border/text | same | VERIFIED |
| active (expanded) | `.allocMini.expanded` reveals `max`/`0`, `.allocX` turns gold | N/A — no collapse; `max`/`0` always visible | VERIFIED (the two implementations genuinely differ here, not a bug — the duty variant has fewer actions so nothing to collapse) |
| disabled | N/A — no HTML `disabled` state exists on any control here | the `<input>` gets `.disabled = i.running \|\| !open` (`main.js:991`) — but see locked, below | partially VERIFIED |
| locked | **REQUIRED, not shipped** — `bots.setAlloc` (`bots.js:116-122`) and the click wiring (`main.js:296-309`) apply unconditionally; a locked row's buttons write allocations silently | **REQUIRED, not shipped** — `setParty()` (`main.js:484-488`) checks `running` but never `inst.dutyUnlocked(state, m)`; the buttons stay clickable even though the sibling `<input>` correctly disables | Same defect class, two independent code paths — both named here so a single future fix pass can close both, not just the one this file already knew about. |

**Touch target, `interaction` doctrine (WCAG 2.5.8, 44×44px minimum):**
`.allocMini button { padding: 4px 8px; font-size: var(--fs-small) }` (11px
mono) computes well under 44×44 — likely near 24-28px tall including
padding. This is a real gap on a project whose primary playtest surface is
mobile (`CLAUDE.md`: "user playtests on mobile via GitHub Pages"), on the
single most-repeated interactive component in the game. Worth noting the
one dimension in this component that already clears the 44px floor is the
**input**, not the buttons either side of it (`--alloc-input-width: 44px`,
`style.css:284`) — coincidence, not a deliberate touch-target choice (the
value matches the training-tier `.allocMini input`'s own width need, not
WCAG), but it means the gap is specifically in the buttons, not the whole
control. Flagged as a finding this pass surfaced (not a DW item) — worth a
follow-up, not a fix here (no code touched this phase).

### `.caption`

**Selector:** `.caption` (`style.css:53`) — `font-family: monospace;
font-size: var(--fs-small); color: var(--recede)`. Applied to exactly four
elements: `#cooldown`, `#projection`, `#record` (Boss tab), `#instProject`
(Dungeon tab) — grepped, no other `class="caption"` exists in `index.html`.
This is the **secondary-status-text role**: not the hero number, not a
label, but the sentence explaining what the hero number means right now.

Two elements override the default color for emphasis while keeping the
class: `#projection { color: var(--gold) }` (the crit-breakdown line reads
as a highlighted caption, not a re-themed one) — the base class still
supplies the family/size, only color escalates. This is the correct pattern
per `design-systems`' component tier (override one property, inherit the
rest), not a reason to fork a second class.

**Distinct sibling role, not to be confused:** `.sub`/`.ztable .sub`
(`style.css:334-342`) is a **different** secondary-text role — mono
*italic*, `--fs-label` (smaller), used for flavor/help sentences (zone
descriptions, rig-line help text) rather than live status. `.caption` (fs-
small, non-italic, live status) and `.sub` (fs-label, italic, static
flavor/help) are both real, both already-shipped, and answer different
questions ("what's happening right now" vs "what does this mechanic do") —
noted here so Phase 5 (copy) doesn't merge them into one register by
accident.

**States:** none — pure text, no interaction.

### Tab button

**Selector:** `#tabs button` (`style.css:158-171`, `main.js:224-234`).

| State | Trigger | Visual | Status |
|---|---|---|---|
| idle | unlocked, not active | `--tab-idle` text, `--line` border | VERIFIED |
| hover | pointer over an unlocked button | `#tabs button:hover { color: gold }` | VERIFIED |
| active | current tab | `.active`: `--tab-active` text + border | VERIFIED |
| locked | feature not yet unlocked | label literally reads `???` (`renderTabs()`, `main.js:227-234`); `.locked` styling; hover suppressed back to the locked color via `#tabs button.locked:hover` so no false affordance | VERIFIED, except the color value itself — **REQUIRED**: `style.css:660` still hardcodes `#45454d` (1.94:1, fails even the 3:1 non-text floor) instead of `--tab-locked`/`--faintest` (3.13:1) — this file's own selector-fix #1, not yet applied. |
| disabled | N/A as an HTML attribute | every tab button has a click listener attached unconditionally (`main.js:224-226`); `showTab()` no-ops the click for a locked tab (`tabUnlocked()` guard, `main.js:219-220`) rather than the button being genuinely non-interactive | **Gap, not a DW item:** a locked tab is focusable and "clickable" (silently does nothing) rather than carrying `aria-disabled`/`disabled` — the `interaction` doctrine's rule that a disabled control should explain itself isn't violated (the `???` label + suppressed hover already signal "not available"), but it isn't marked non-interactive to assistive tech either. Flagged for a future accessibility pass, not fixed here. |

**Forward-compatibility (the plan's own requirement):** a seventh tab for
the redesigned meta currency composes from this exact spec — idle/hover/
active/locked need no new states, and its buy buttons compose from
`section.game button` + `.affordable` (`--afford-accent`, below), the same
signal Training's rig and Delve's Cache tree already use. No new primitive
needed for either the nav entry or its spend rows.

### Affordability (spend-surface signal, carried forward from GM)

**Selector:** `section.game button.affordable` (`style.css:664`) + the
`buyState(btn, ok)` helper (`main.js:126`) that toggles it. **VERIFIED**
today as border+text recolor (gold border/text when affordable, `--faint`
text + `disabled` when not) — a binary signal, not a proportional fill.
UI-AUDIT.md's retired-GM note ("affordability via button fill was the one
signal that worked well") describes a **different, dead implementation**
(GM's own CSS/markup, removed at `82d2d99`) — it is not resurrected here.
What's carried forward is the *principle* (a buy button visibly signals
affordability, not just enabled/disabled), and the current shipped
mechanism already satisfies it with `--afford-accent`. A literal fill-style
treatment would be a design change, not a spec correction — out of this
phase's scope; named so Phase 6 or the meta-currency redesign can pick it
up deliberately rather than reinvent the binary version by default.

**States:** afford (`.affordable`, gold) / can't-afford (`disabled`,
`--faint` text, `section.game button:disabled`). No hover on disabled
buttons (`:hover:not(:disabled)` already excludes it) — VERIFIED.
