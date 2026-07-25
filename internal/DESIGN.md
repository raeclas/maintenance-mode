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
