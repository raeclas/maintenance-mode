# Discovery + Design: Phase 2.5 — Visual DNA v4 (colour lanes + full-Maple construction)

## Artifacts Found / Current State

| Artifact | State |
|---|---|
| `internal/DESIGN.md` | v3, LOCKED. 2119 lines. Reading order: v3 → v2 (rejected) → v1 body (still law for colour/tokens/components). |
| `internal/JOURNEY.md` | Phase 2 complete — stays/moves rule, 22-row copy-relocation table, Help page spec, seven-tab IA. Untouched by this phase. |
| `internal/mocks/build.mjs` | 1599 lines. Single generator for six mocks. `TOKENS` + `TOKENS_V3` + `TOKENS_END` + `CSS` + `CSS_V3`; `CSS_V3` is Boss-only behind a `v3` flag. Self-asserts DW-6.1/6.2 (no hex / no rgb / no raw px outside `:root`, no external refs). |
| `internal/mocks/contrast.mjs` | 93 lines. Parses the `:root` that actually ships in `boss.html`, gates 49 pairs, exits non-zero on a miss. **Does NOT print L\*** despite DESIGN.md v2 claiming "both numbers are printed by `contrast.mjs`". |
| `internal/mocks/shoot.mjs` | CDP screenshotter, 375 + 1280, asserts no horizontal overflow at 375. |
| `internal/mocks/shots/boss-375.png` | The v3 render — the DW-2.5.3 baseline. |
| `rarity.js` (root) | 7 tiers (not 6): common / uncommon / rare / epic / legendary / mythic / origin, each with a `color`. Already mirrored into `build.mjs` as `--rar-*`. |
| `internal/mocks/tabrow-specimen.html` | Phase 2's DW-2.4 evidence: seven-tab row **re-fit to `repeat(4,1fr)`** (4+3), variant B chosen. `build.mjs` still ships six tabs at `repeat(3,1fr)`. |

## Gaps

1. **The rarity ramp is a text tint only.** `.rar-*` sets `color:` and nothing else. There is no plate, no edge, no ground — nothing that makes rarity a *visual* lane.
2. **`--rar-epic` and `--rar-mythic` have never been gated and both FAIL AA on `--field`** (4.15:1 and 4.00:1, computed). `contrast.mjs` has no rarity pairs at all — the whole lane is un-gated today. Promoting the lane to plates makes this a live defect, not a latent one.
3. **`contrast.mjs` prints no L\*.** DW-2.5.2 requires surface pairs verified by L\* separation; the tool as shipped cannot produce that evidence.
4. **No per-Warden or per-tab identity exists in any form** — `--floor-glow` is one fixed warm dark, every tab chip is the same gold.
5. **No power-band concept has a colour.** Zone rows print an IP range as plain text; stash rows print `IP 28,400` as plain text.
6. **The tab row is six wide at `repeat(3,1fr)`** — it contradicts Phase 2's own accepted specimen.
7. **`player.html` is still on the pre-v3 flat CSS** (`v3` flag not set), so it carries neither the carpentry nor the ramp respread.

## Gate Status

- **DESIGN.md locked?** Yes, at v3 — and this phase is *authorised by the plan* to supersede its colour and construction layers, exactly as v3 superseded v2. Token NAMES, semantic tiers, the dimension scale, the component inventory and the state-ladder mechanics all survive. **The surface-ramp respread and the L\*-not-ratio lesson are carried forward as law and are load-bearing in v4.** No lock is overridden without the plan's own authority, so no UPDATE_PLAN.
- **JOURNEY.md present?** Yes. Fact ownership untouched: this phase changes no string, no fact owner and no block position.
- **Prerequisites met?** Yes — v3 exists and is proven on `boss.html`; the baseline screenshots exist for the DW-2.5.3 comparison.

## DW Verification

| DW-ID | Done-When Item | Status | Evidence |
|-------|---------------|--------|----------|
| DW-2.5.1 | Four colour lanes as named tokens with the meaning each hue carries + the co-occurrence rule | **COVERED** | `internal/DESIGN.md` `# Visual DNA v4` — `## The four colour lanes` (one table per lane, meaning column mandatory) and `## The co-occurrence rule`. Tokens applied: every lane member is a `:root` custom property resolvable by `contrast.mjs` in both rendered mocks. |
| DW-2.5.2 | Every new/changed hex passes AA; no regression; surfaces by L\* | **COVERED** | `node internal/mocks/contrast.mjs` exit 0. Extended this phase to (a) resolve `color-mix(in oklab, …)` tokens, (b) print **L\* beside every ratio**, (c) gate the 4 lanes. Pair count must GROW from 49 and no previously-passing pair may move. |
| DW-2.5.3 | Construction materially heavier than v3, judged side-by-side | **COVERED** | v3 render preserved as `shots/boss-375-v3.png` before the rebuild; `node internal/mocks/shoot.mjs` produces the v4 `boss-375.png`; both read back in this session. |
| DW-2.5.4 | Self-contained, no hard-coded hex, no untokenized px, no h-scroll at 375 | **COVERED** | `node internal/mocks/build.mjs` exit 0 (DW-6.1 + DW-6.2 self-assertions) and `shoot.mjs` exit 0 (scrollWidth ≤ 375). |
| DW-2.5.5 | live / dormant / locked still read apart on both mocks with lanes active | **COVERED** | The Grind specimen (real 15-row section, four states side by side) renders under v4 on `boss.html`; the stash / trophy / Armory ladders render on `player.html`. Read back from the 375px screenshots. |
| DW-2.5.6 | No AI-generated icon; every icon plate is a letter glyph or hand-made mark, and the mock says which | **COVERED** | `build.mjs`'s external-reference assertion proves no raster/`url()`/`<img>` exists at all; the mock note enumerates each mark and names it. |

**All items COVERED:** YES (6 DW-IDs in, 6 out)

## Design Decisions

### 1. The palette is *generated*, not picked — at equal WCAG luminance

Doctrine (`chapter-08-color-science.md`, Critical): qualitative categories must not carry unequal
perceptual weight. Every lane member is solved by binary search in OKLCH for the lightness that
yields **relative luminance Y = 0.27** — the value that clears 4.5:1 on `--field`, the lightest
ground on the ramp. Consequence: *every* lane hue clears *every* ground identically (4.79–4.84:1 on
`--field`, 6.14–6.20:1 on `--well`), so no hue dominates and DW-2.5.2 is one uniform check rather
than 28 individual judgement calls.

### 2. Chroma is the lane separator, not hue

Seven tabs + ten Wardens + seven rarities + five bands cannot all be ≥45° apart on one wheel —
that is arithmetic, not taste. So the lanes are separated on a *second* axis:

| Lane | Chroma | Why |
|---|---|---|
| Warden | .09 | Loudest — it is an identity, and it appears alone on its own surface |
| Rarity | shipped (high) | The drop is the moment; the convention is already the loudest thing in the genre |
| Power band | .09, but rendered as a **filled chip** (30% mix into `--well`, L\* ≈16.5) | Lands in a completely different *luminance* tier from every ink lane — that, not hue, is what stops it colliding |
| Tab accent | **.05** | Chrome must never out-shout content. A dusty frame beside a saturated item name reads as a different class of object. |

Honest limit, stated because the plan demanded the clown-car answer be numeric: `--acc-player`
(h260) sits 1° from `--rar-rare` (h259) and `--acc-grind` (h140) sits 3° from `--rar-uncommon`
(h143). They co-occur on Player. The mitigation is the chroma tier **plus** the co-occurrence rule
below — accent touches only chrome, rarity touches only items, and rarity additionally prints its
tier name as a word. Rotating the accent walk to maximise the gap was computed (+33°, min gap 9°)
and **rejected**: it buys 8° and destroys every accent's meaning.

### 3. The co-occurrence rule (the plan's named edge case)

**One chrome lane + at most one content lane per surface. Hard cap: two.**

- **Tab accent** — chrome only: tab chip, window frame tint, `h3` groove, live-row edge/name. Every surface, always.
- **Warden hue** — Boss only, and it **is** Boss's tab accent (`--acc-boss: var(--w-active)`). Boss therefore never carries two identity hues.
- **Rarity** — item objects only: gear plates, stash rows, scrap pills, drop loglines. Never chrome.
- **Power band** — magnitude only, and only inside a filled chip: zone IP, gear/stash IP, Armory zone marker. Never an edge, never a ground, never ink elsewhere.
- **Mutually exclusive:** Warden ⟂ tab accent. Rarity ⟂ power band on the *same element* (they share a row but never a slot).

### 4. Colour is never the only channel

`chapter-08` Critical + the plan's own ladder constraint. Every lane keeps a redundant cue that
already existed: rarity prints its tier name; bands print the IP number; the ladder keeps all six
of its channels (edge presence, type colour, control presence, unlock text, material lift, socket
lit-ness) and the *hue* that fills the "live" slot is the only thing that changes. `--warn`
(struggling) stays untouched, and no tab accent is placed in the 0–40° band where it could be
confused with it, except Dungeon (h20) — which is the one tab with no struggling state.

### 5. Two shipped rarity hexes are lifted, hue preserved

`--rar-epic` `#b061d6` → `#bc6ce2` and `--rar-mythic` `#d85454` → `#e86362`: same OKLCH hue and
chroma, lightness raised to the lane's own luminance floor. Both were real WCAG 1.4.3 failures
(4.15:1, 4.00:1 on `--field`) that had never been checked. Required behaviour change **#8**,
mirroring how v2 handled `--alloc-control` and `button:disabled`.

### 6. Derived grounds are `color-mix(in oklab, …)`, not new hexes

Native CSS, no new primitives, and the derivation rule is visible at the declaration site. The
alternative was minting 17 more literal hexes to maintain. `contrast.mjs` gains a ~20-line oklab
mix resolver so every derived ground stays machine-checked rather than asserted.

### 7. Construction push — what actually gets heavier

Frame `--space-2` (3px) → `--space-3` (4px); bevel 1px hairline → `--space-1` (2px); **corner
rivets** (four `--edge-lit` squares as background layers — a drawn mark, symmetric and complete, so
it cannot read as damage); **gold letter-glyph plates** on every title bar (one letter in the UI
face on a control-construction plate — TYPE, not an icon); title bar to `--fs-display` with a
2px accent groove; `--fs-warden` 36 → 40 (keeps 1.54× over hero and 1.30× under the canvas-pinned
52px `--fs-colossal`).

### 8. Deviation, declared up front

The plan lists **Armory cells** under lane 1 (rarity). Armory entries are indexed by *zone*, not
by rarity — a rank-7 entry has no rarity to carry. Armory therefore takes **lane 4** (the zone
marker becomes a band chip) and keeps its existing rank edge. Rarity has no fact to attach to
there; attaching it anyway would have invented meaning, which lane 1's own charter forbids.

## Recommendation

**BUILD**

---

## Evidence, after production (the promises above, settled)

| DW-ID | Evidence produced | Result |
|-------|-------------------|--------|
| DW-2.5.1 | `internal/DESIGN.md` `# Visual DNA v4` — four lane tables each with a mandatory meaning column, `## The co-occurrence rule` with a per-surface table + the mutual exclusions + the numeric honest limit. Tokens applied: 28 lane members + 12 derived grounds live in the `:root` of both mocks and are resolved by `contrast.mjs`. | **PASS** |
| DW-2.5.2 | `node internal/mocks/contrast.mjs` → **exit 0**, `all 190 gated pairs + 16 L* surface pairs pass`, 206 PASS / 0 FAIL. Was 49 pairs. No previously-passing pair moved. Two live AA failures (`--rar-epic` 4.15:1, `--rar-mythic` 4.00:1) found and fixed. | **PASS** |
| DW-2.5.3 | `shots/boss-1280-v3.png` (baseline) vs `shots/boss-1280.png` (v4), both read back at native size. v3: one grey texture, hairline frames indistinguishable from the page, six grey chips, a flat grey Zones block. v4: 4px tinted frames, gold glyph plates, corner rivets, a 40px Warden name in the door's own hue, seven accented chips, a 15-row cold→hot band ramp. | **PASS** |
| DW-2.5.4 | `node internal/mocks/build.mjs` → exit 0, all 6 files `no hex / no rgb / no raw px / no external refs`. `node internal/mocks/shoot.mjs` → exit 0, `no horizontal overflow at 375px on any mock`. | **PASS** |
| DW-2.5.5 | Native-resolution crop of the Grind specimen's tail read back: **dormant** neutral edge + dim name + control reading 0; **struggling** `--warn` 4px edge + `--warn` stat at full opacity; **locked** no edge at all, `--opacity-locked`, no control, the word "locked" + condition. Distinct from the live row's accent green. On Player: filled plate vs empty socket, ranked vs dormant vs maxed Armory cell. | **PASS** |
| DW-2.5.6 | `build.mjs`'s external-reference assertion (`<link`/`<script`/`src=`/`url(`/`@import`/`http`) returns zero matches on every file — there is no raster or fetched asset to be generated. The only marks are the **letter-glyph plate** (one capital in the UI face on a control plate — TYPE) and the **corner rivet** (four background-layer squares — a drawn mark). Both mocks' notes name each mark and say which it is. | **PASS** |

### Two defects the render caught that no gate would have

1. **`border-color` is a shorthand.** `.amCell{border-left-color:var(--acc); … border-color:var(--edge-shade)}` silently reset all four sides, so every ranked Armory cell shipped with no accent edge. Contrast passed, build passed, overflow passed — only reading the pixels found it. Fixed by ordering the shorthand first.
2. **The stash upgrade row lost its rarity edge to gold.** `.stashRow.upgrade{border-left-color:var(--gold-dim)}` out-specifies `.stashRow`, so the one row that most needs the rarity lane was the one row without it. Fixed by giving the edge to rarity and leaving the upgrade signal on its own gold marker glyph — one fact, one slot.

### Deviations from the discovery design

- **Armory takes lane 4, not lane 1** — declared up front in Design Decision 8; the plan listed it under rarity, but an Armory entry is zone-indexed and has no rarity to carry.
- **The tab row went to seven at `repeat(4,1fr)`** in the shared chrome, so it reaches all six mocks rather than only the two recomposed ones. Lane 3 could not be proved at its real width otherwise, and Phase 2 had already specified and accepted this exact row. Recorded as required behaviour change #9.
- **`contrast.mjs` gained three distinctions it did not have** (color-mix resolution, L\* separation gating, banned-and-failing vs banned-by-role). The first run produced four false failures purely because the old model could not express "banned by role"; splitting the lists was the fix, not loosening a gate.

---

# Critical fix — the co-occurrence rule did not match the rendered pixels

**Date:** 2026-07-26 · targeted repair of existing artifacts, no fresh build.
**Source:** `.design-foundations/build/2026-07-26-visual-pass-and-help-tab-phase-2.5-review.md`, Major finding + Edge case 1 (FAIL).

## The finding, restated

DESIGN.md v4 made two statements about the same pixels and one of them was
false. `## The co-occurrence rule` said **"Boss: lane 2 only"** under a stated
hard cap of two lanes per surface ("Three lanes is a clown car"). Lane 3's own
spec said the tab foot bar shows **"all seven visible at once"**. On
`boss-1280.png` the second one is what renders — `#tabs button.t-*{--acc-tab:…}`
is unconditional, so six lane-3 hues plus the Boss chip's lane-2 alias sit in
the nav row of *every* surface, Boss included. A Phase 3 agent reading only
DESIGN.md could not tell which sentence to implement.

## Route taken: (a) — amend the rule to match the pixels

**The design call.** The seven-hue row is a **legend**: a fixed colour key for
seven destinations, in one row, in one position, identical on every surface,
never adjacent to content, at chroma **.05** — a third of lane 2's. A legend is
not identity competing on a surface any more than a map's key competes with the
map. That reading is not invented after the fact: the .05 chroma choice and the
"chrome must never out-shout content" line already encoded it — v4 simply never
wrote the consequence down. Route (b) (neutral inactive feet) would have bought
consistency by deleting the at-a-glance "which tab is which" affordance, which
is a real wayfinding channel, to fix a documentation defect.

**What stops this being a hand-waved exception.** The review's warning has
teeth — seven simultaneous hues *are* the fifth-channel pressure the cap
exists to resist — so the carve-out is named and bounded rather than excused:

| Guard | Where |
|---|---|
| The tier is named (**Tier A — the navigation legend**) and is a **closed set of exactly one selector**, `#tabs button` | DESIGN.md `## The co-occurrence rule` |
| Bounded on four axes: lane 3 only · chroma ≤ .05 · the 2px foot bar only · inactive ink stays `--dim` | same |
| Each bound carries a **How a reader checks it** column — the `--acc-tab` grep is the mechanical test | same |
| **Growth is an amendment, not an implementation choice** — a second multi-hue persistent element requires editing DESIGN.md | same, plus a new `## Never (v4)` entry |
| The `--acc-boss` = `var(--w-active)` alias is stated as deliberate, singular, and justified (lane membership is by **token**, not by hex) | same |

**And the cap is restated so it is TRUE and countable.** Tier B (everything that
is not `#tabs`) keeps the hard cap of two, now with a three-step counting
procedure a reader can run against a screenshot: skip `#tabs`; skip lane 4
(chip-rendered at L\* ≈16.5 against every ink lane's L\* 59 — a different
luminance tier); count the distinct lanes colouring ink, edges, frames, grooves
or plates on the remainder. The sentence v4 was missing is now explicit:
**lane 3 contributes exactly one hue to Tier B — the surface's own `--acc`.**
Under that procedure the per-surface table reads Boss **1**, Player **2**,
Grind **1**, Training/Delve/Dungeon/Help **1** — and that is what the mocks
render.

## Root-cause fix in the pixels (one line, not a repaint)

The tab buttons wear the same `.t-*` classes as `<main>`, so `.t-boss{--acc:…}`
was also setting `--acc` on all seven chips. Invisible today (nothing inside a
button reads `--acc`) and a seven-hue trapdoor the moment anything did — the
exact shape of the defect being fixed. Scoped to `main.t-*` in `build.mjs`, so
Tier B's "exactly one lane-3 hue" is true of the cascade and not only of the
render. No visual delta; `player-375.png` confirms the surface accent still
resolves (Player's frames and active chip read blue-grey, not Boss teal).

## Minor / Note items — decided explicitly

| Item | Decision |
|---|---|
| **Minor (color)** — lane 4's exemption from the two-ink-lane cap was inferable from three separate sentences and stated as a rule nowhere | **FIXED.** It is now step 2 of the counting procedure, with the L\* 16.5 vs 59 luminance-tier reason attached |
| **Minor (design-dna)** — detector's 24 `nested-cards` hits: Material rule 2 ("never nest a bevel inside a bevel") forbids constructions v3's own mocks render (chip-in-socket, glyph-on-title-bar) | **FIXED, doc side.** Same defect class as the Critical: a rule its own pixels disobey. Rule 2 now defines "bevel" precisely (the opposed `--edge-lit`/`--edge-shade` pair **plus** a hard foot) and carries a legality table — raised-in-sunk, sunk-in-raised, and raised-on-a-flat-carrier are legal; **raised directly in raised** is the ban. Both flagged sites are adjudicated legal on the record. No pixels moved: the construction was right, the sentence was loose |
| **Note (copy)** — `em-dash-overuse` ×8 in `player.html` | **DECLINED.** All eight are in `.mockNote` dev-annotation blocks the file's own CSS marks "never product copy". The tell is scoped to shipped strings; these are scaffolding that does not ship |
| **Note (color)** — `rarity.js` still carries the pre-lift `epic`/`mythic` hex | **DECLINED for this phase.** Not a silent gap: DESIGN.md `## Open questions (v4)` and required behaviour change #8 both log it, and this phase's whole posture (v1/v2/v3's too) is that no shipped code is touched until the look is signed off. Carrying it now would half-apply v4 to production while the DESIGN.md gate is still open. It rides the single integration pass with `CSS_V4` |
| **Note (process)** — DESIGN.md is 2,544 lines carrying v1–v4 history | **DECLINED.** Archiving superseded sections is a provenance decision, not a defect, and doing it in a repair pass would churn the exact document a reviewer is diffing. Worth doing once v4 locks |

## Re-validation — design execution evidence, all re-run after the fix

| Evidence | Command | Result |
|---|---|---|
| Tokens applied | `node internal/mocks/build.mjs` | **exit 0** — all 6 files `no hex / no rgb / no raw px / no external refs`; `DW-6.1 + DW-6.2: all 6 files pass` |
| Contrast | `node internal/mocks/contrast.mjs` | **exit 0** — `all 190 gated pairs + 16 L* surface pairs pass`; `grep -c "^FAIL"` = **0**, `grep -c "MISSING"` = **0**. Identical to the reviewer's independent run — nothing regressed, nothing loosened |
| Render | `node internal/mocks/shoot.mjs` | **exit 0** — 12 screenshots re-written; `DW-6.3: no horizontal overflow at 375px on any mock` |

### All six DW items re-verified on the re-rendered pixels

| DW-ID | Status | Evidence after the fix |
|-------|--------|------------------------|
| **DW-2.5.1** | **PASS** (was the failing item) | Four lane tables unchanged. `## The co-occurrence rule` is rewritten into Tier A (bounded legend, five bounds each with a check) + Tier B (hard cap two, three-step counting procedure, per-surface counts). Lane 3's "Where it attaches" is split into legend/surface rows. `## Never (v4)` restates the cap in the procedure's terms and adds the Tier-A-growth ban. Read against `boss-1280.png`: Tier B = lane 2 only, legend = seven lane-3 feet — **the document and the pixels now say the same thing**, and the rule is checkable from DESIGN.md alone |
| **DW-2.5.2** | **PASS** | `contrast.mjs` exit 0, 190 + 16 pairs, 0 FAIL / 0 MISSING. No hex changed this pass — the repair was a rule, a comment and a selector scope. Anchored evidence intact, not one pair moved |
| **DW-2.5.3** | **PASS** | `shots/boss-1280-v3.png` vs the freshly re-rendered `shots/boss-1280.png`, read side by side: v4 still carries the four corner rivets per title bar, the gold letter-glyph "M" plate, the 4px two-tone tinted frame, the 40px Warden name in the door's own teal, and the tinted tab feet — all absent or flat in v3 |
| **DW-2.5.4** | **PASS** | `build.mjs` exit 0 on all six files; `shoot.mjs` exit 0, `scrollWidth 375px / viewport 375px` on all six phone renders |
| **DW-2.5.5** | **PASS** | Re-read `boss-1280.png` Grind specimen and `player-375.png`. Six channels intact: live (lifted, accent edge + name), dormant (flat, neutral edge, dim name, control at 0), struggling (`--warn` edge + stat), locked (`--opacity-locked`, unlit, no control, the word "locked" + condition). Player shows the same ladder in Stash rows, Trophy sets and Armory cells with lanes 1 + 4 active. Colour identity did not drown it |
| **DW-2.5.6** | **PASS** | Unchanged and re-asserted by the fresh build: zero external references on all six files, so there is no fetched or generated asset. The only marks remain the letter-glyph plate (TYPE on a plate) and the corner rivet (background-layer squares); both mocks' rendered notes name which is which |

**Verdict: the Critical is closed.** All six DW items COVERED with passing
design execution evidence; DESIGN.md's lock honored (no locked token value
changed — a rule was corrected to describe the tokens already locked); evidence
anchoring intact (190 + 16 pairs, the same set the reviewer ran).
