# Design: Last Warmth
**Date:** 2026-07-25 · **Status:** LOCKED — contrast evidence passing (see report below); direction confirmed by the user 2026-07-25, closing DW-3.1. The 5 required code changes below were deferred by the same decision to a single integration pass after Phase 6; nothing in this document is applied to shipped code yet.
**Archetype:** Ruler + Sage (stretch pairing, `archetypes.md`) · **Register:** restrained/data-dense structure · expressive at: BREACHED reveal, enhance feedback, maxed/complete states
**Grounding:** a 2000s MMO raid client's UI chrome (gold small-caps headers, gear-slot panels, boss-frames) + a mid-2000s botting-forum/sysadmin console (monospace stat rows, tabular numerics) — restated directly from `REMAKE-DESIGN.md` §16's own three-register lexicon, not invented for this pass
**DNA:** systematization pass, not a fresh divergent generation — see `## Why this isn't a diverge/critique/converge pass` below
**Composition:** existing, unchanged — dense stat rows (`.rowlist`, the Armory grid, Trophy pips), bordered panels (`section.game`), no cards, no radius, no shadows (already the correct "Data-Dense Professional" discipline for this content). **Dead-CSS list, extended per review round 3 (grepped every name below across `index.html` + every `.js` file — zero references, confirmed independently, not taken on the prior review's word):** `.ztable`, `#pullBtn` / `#pullBtn:disabled` (the retired pull-to-attempt mechanic), `#ticketGain`, `#tierAtk`/`#tierSpeed`, `#gmSec`/`#gmPanel` (the retired GM tab/ticket economy), `.tier-risk`/`.tier-nightmare` (found in this pass — not in the review's own list, but the same class of orphan). None of these render, so none carry a live contrast obligation, but their selectors and any hardcoded hex inside them are named here so this document never again cites one as a shipped fact (the exact error DW-3.3's gold-CTA citation made last round — corrected below).
**Pins:** none — this phase systematizes an already-shipped, already-approved look; nothing was pinned because nothing was dealt

## Direction

A working dead MMO's client, not a ruin and not a terminal. Cool blue-grey
neutrals read as cooling server metal; exactly two warm hues — gold and
bone — carry all the "still alive" signal in the entire palette. Georgia
serif small-caps chrome (the game's own UI voice) frames dense monospace
data rows (the botter's-toolkit/admin-console voice) wherever the content
is a stat table. The shell/terminal register (`maintenance@dead-server:~$`,
`PLAYERS ONLINE`) stays confined to the log and meta edges — it is not the
base layer.

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
  botter's-toolkit and admin-console register. **Corrected per review
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
