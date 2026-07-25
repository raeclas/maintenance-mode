# Discovery + Design: Phase 3 - Design DNA + tokens + type + color

## Artifacts Found / Current State

- `style.css` already ships a named, semantic-leaning token block (`--gold`,
  `--bone`, `--dim`, `--recede`, `--faint`, `--faintest`, `--bg`, `--panel`,
  `--inset`, `--field`, `--well`, `--line`, `--line-soft`, five functional
  accents, and a 7-step type scale `--fs-hero`…`--fs-micro`). This is not a
  blank slate — it's a system that was never verified or fully named, per
  the plan's framing ("NAMES, COMPLETES and VERIFIES," not replaces).
- No `internal/DESIGN.md` exists yet — this phase creates it.
- `internal/JOURNEY.md` (Phases 1-2) exists and is the structural contract:
  the state legend (`live` / `dormant` / `locked`) this phase's token system
  must express is defined there, not invented here.
- `battle.js` draws the only canvas surface. It hardcodes ~20 hex literals
  inline — none read from `style.css`, confirming the plan's edge case
  (canvas cannot read CSS custom properties) is real, not hypothetical.
- `rarity.js` already hand-names 7 rarity colors as JS constants — an
  existing precedent for "colors JS needs as real values," predating this
  phase.

## Gaps

1. Three neutral weight tokens (`--recede`, `--faint`, `--faintest`) and two
   functional accents (`--warn`, `--alert`) fail WCAG AA at their real,
   shipped usage sites (see contrast evidence below) — not hypothetical,
   measured against the exact backgrounds they render on in `style.css`.
2. One rarity color (`mythic`, `rarity.js`) fails AA as text.
3. Four canvas-only colors that encode real game state (crit tiers, the
   sub-15%-HP threshold, the BREACHED reveal) exist only as magic hex
   literals in `battle.js`, with no named token and no mechanism for canvas
   to ever read `style.css`'s tokens.
4. **A live defect surfaced by this pass, not by the plan:** `battle.js`
   `drawBars()` draws the HP% label in a fixed near-black (`#0d0d10`)
   right-aligned at the bar's far edge. That position sits over the *empty
   track* (`#22222a`) for any `remain < ~99%` — i.e. almost always — where
   the pair measures **1.23:1**, nowhere near AA. The label is only
   legible at exactly full HP. This wasn't in the audit or DW list; it's
   exactly the class of gap the build phase is supposed to surface non-DW
   evidence for (see Validation Coverage below).
5. The type scale has one out-of-scale literal (`.modalClose` at 22px) and
   a fully separate, untokenized canvas type scale (4 hardcoded px sizes in
   `battle.js`) that DW-3.4's "every size currently in use" technically
   reaches, addressed via the canvas token module rather than forcing
   canvas onto the DOM scale (different rendering surface, different math —
   canvas units aren't CSS px once the element is scaled by its container).

## Gate Status

- DESIGN.md: does not exist yet — this phase creates and (pending user
  confirmation, relayed by the orchestrator) locks it.
- JOURNEY.md: present, Phases 1-2 complete, state legend available to
  build against.
- Prerequisite check: satisfied — nothing downstream (Phase 4 component
  composition, Phase 6 page application) has started, so there is no
  drift to reconcile.

## DW Verification

| DW-ID | Done-When Item | Status | Evidence |
|---|---|---|---|
| DW-3.1 | DESIGN.md exists and is locked | COVERED | `internal/DESIGN.md` written with full token block + passing contrast report; Status field left as pending — direction confirmation is the orchestrator's step per this build's own instructions, not mine to self-certify |
| DW-3.2 | All text/background pairs pass WCAG AA on the dark ramp | COVERED | Computed WCAG contrast ratios (relative-luminance formula, identical math to `palette.mjs`'s internal `contrast()`) for every token against every background it actually renders on in `style.css`/`rarity.js`; 6 failing pairs found and adjusted, all now ≥4.5:1 (body) — full before/after table in DESIGN.md |
| DW-3.3 | Interactive elements pass WCAG AA non-text (≥3:1) — gold CTA + `.locked` tab | COVERED | Gold CTA (`#pullBtn`/`#descendBtn`) measured 8.1–8.6:1 (already passing, untouched); `.locked` tab's hardcoded `#45454d` measured 1.94:1 on `--panel` — FAIL — resolved by pointing it at the corrected `--faintest` (3.13:1), specified in DESIGN.md as a one-line CSS-selector fix for whoever next touches `style.css` |
| DW-3.4 | Semantic aliases resolved + type scale covers every size in use | COVERED | Background/surface/text/accent role table mapping every existing token to its semantic job (no new indirection layer added — the existing names already carry semantic meaning, per ponytail: don't add a token tier nothing asked for); type scale table for the 7 DOM sizes + the `.modalClose` icon-scale exception named; canvas type sizes handled under DW-3.5's token module |
| DW-3.5 | Canvas colors exist as named tokens readable from JS | COVERED | Mechanism specified precisely: a `theme.js` module resolving `getComputedStyle(document.documentElement)` once (inside `initBattle()`, after the canvas element and stylesheet both exist — verified safe: `battle.js` is imported only by `main.js`, never by `internal/test.js` or `internal/sim.js`, so this doesn't touch the Node-run sim/test path). 4 new semantic canvas tokens named (`--gold-bright`, `--crit-gold`, `--super-crit`, `--dmg-text`) for the hexes that encode real game state; illustrative sprite-shading hexes (gate/hero/boss shading) centralized under one `SCENE` constant rather than individually tokenized — DW-3.5 asks for state-bearing color to be named, not every decorative pixel |
| DW-3.6 | Motion budget stated, no ritual/ceremony | COVERED | Full inventory of every CSS keyframe + canvas-driven motion effect in `style.css`/`battle.js` with duration, trigger, and reduced-motion status; verified against the hard veto — nothing exceeds ~700ms except the one-time, non-blocking 6s BREACHED reveal; a real gap flagged (canvas motion doesn't check `prefers-reduced-motion`, only the 2 CSS keyframes do) — named as an open item for whichever phase next touches `battle.js`, not silently fixed or silently dropped |

**All items COVERED:** YES

## Design Decisions

**Scope call — the design-dna pipeline (diverge/critique/converge/dealer) was not run.** The phase brief is explicit that this is systematization of an *already-approved* look ("approved in a prior design-system pass... This phase NAMES, COMPLETES and VERIFIES them. It does NOT replace the look"), which overrides `design-dna.md`'s default greenfield process. Running five fresh dealt candidates against a shipped, working, already-loved aesthetic would violate the phase's own explicit constraint and the project's attachment-law heuristic (CLAUDE.md guideline 8). What's produced below is the DNA *documentation* the doctrine calls for (grounding, archetype, register, signature, axes), derived from what's already shipped, not a fresh divergent search.

**Archetype:** Ruler (deep tones + gold/metallic, formal symmetry, serifs, luxury restraint) crossed with Sage (muted palette, technical type, data-led layouts, no decoration) — `archetypes.md` lists Data-Dense Professional as a *stretch* family for Ruler, which is exactly the shape of this UI: formal gold/serif authority for identity chrome, dense mono data-rows for stat readouts. Confirmed against `archetypes.md`'s content-pressure table: "dense tables/numbers" pushes toward Data-Dense Pro/Terminal/Swiss — matches the stat-heavy rowlist/ztable content this game is mostly made of.

**Grounding (two named references, per `design-dna.md`):** a 2000s MMO raid client's UI chrome (WoW/EverQuest-era gold small-caps headers, gear-slot panels, boss-frames) + a mid-2000s botting-forum/sysadmin console (monospace stat rows, tabular numerics, dashed dev-panel borders). This is not invented for this pass — it's a direct restatement of `REMAKE-DESIGN.md` §16's own three-register lexicon ("the dead game" + "the botter's toolkit"), which the shipped CSS already executes. The third register named there, "the dying server" (admin/ops decay, shell chrome), is deliberately confined to the log and meta edges per the phase's explicit constraint — it is not a base layer of the DNA.

**Register:** structure register is restrained/formal/data-dense (panels, tabs, stat rows, rowlists all hold the calm baseline). Expressive moments (amplitude stays modest — this is a product surface, not a brand surface): (1) the BREACHED reveal — the journey's per-wall peak, canvas-only, gold flash + large display type, held 6s, non-blocking; (2) enhance success/nightmare feedback — glow + shake scaled to the band; (3) "maxed"/"complete" states turning solid gold (`amCell.max`, `trophySet.complete`, `.affordable`) — the visual reward for finishing a grind.

**Signature move:** the game's own top-of-file comment already names it — "gold = the last warmth left in the machine; bone = live output (still alive)." Exactly two warm hues (gold, bone) exist inside an otherwise entirely cool blue-grey neutral system. That warm-in-cold split is the "dead server, one player, it still works" premise made literal as color temperature — not decoration, a structural rule (confirmed: every other token in the ramp, including all five functional accents, sits in the blue-grey-to-muted-earth family; nothing competes with gold/bone for warmth).

**Where an existing tool replaced hand-rolled work:** `palette.mjs` was run once (`--seed "#c9a94b" --chroma muted --harmony mono --scheme dark`) as a cross-reference, not a generator — its own solved accent-9 for gold's hue (90.4°) landed at `#cbb67c`, confirming the shipped `--gold` (`#c9a94b`, higher chroma/richer) sits in the correct, coherently-solved neighborhood for its hue rather than being an arbitrary pick. Since `palette.mjs`'s CLI only derives a *fresh* ramp from one seed hue, it cannot check the existing multi-hue token set's actual pairs against each other (that's not what it's built to do) — the per-pair verification in DESIGN.md uses the identical WCAG relative-luminance/contrast formula `palette.mjs` uses internally, applied directly to the real shipped hex values and their real shipped backgrounds, which is the only way to check *this* token set.

**Why no code was touched this phase:** DESIGN.md's own gate (`design-dna.md` §14: "Do not write or modify any UI code until the user confirms DESIGN.md") and this phase's `Produces:` line (only `internal/DESIGN.md`) both point the same direction. The corrected token values, the canvas token module, and the label-contrast fix are all specified in DESIGN.md precisely enough to apply verbatim — that application is Phase 4 (component composition) / Phase 6 (page application) work, or a direct follow-up once the user confirms direction.

## Recommendation

BUILD
