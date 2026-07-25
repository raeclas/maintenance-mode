# Design Review: Phase 4 - UI de-duplication audit, component specs (round 3)

## Rendered Evidence (Step 0)
- Screenshot: none — this phase's artifact is `internal/DESIGN.md`'s `## Component specs`
  section and token tiers, not a page. No `.html`/mock exists for this phase.
- Surface reviewed: `internal/DESIGN.md` lines 1–1118 (full file, both the locked Phase 3
  sections for the git-diff/consistency check, and the new `## Component specs` section),
  cross-checked line-by-line against `style.css` (676 lines), `index.html` (211 lines),
  `main.js` (1034 lines, targeted ranges), `bots.js` (108-127), `battle.js` (115-170),
  and `internal/JOURNEY.md` / the plan doc for the forward-compat and edge-case claims.

## Assessment B — Deterministic Detector
- Command: not run.
- Exit: N/A (no rendered artifact this phase) — per the dispatch prompt's own carve-out;
  there is no `.html`/mock path to give `detect.mjs`, and per protocol this is structurally
  distinct from "ran and found 0," never a FAIL.
- Findings: N/A — no rendered artifact.
- Opened only after Assessment A findings were frozen: N/A (nothing to open).

## Triage
- Doctrine dispatched explicitly by the prompt's `## Doctrine` section: `design-systems`,
  `data-viz`, `interaction` — all three Read() from
  `references/design-systems/design-systems.md`, `skills/data-viz/SKILL.md`,
  `references/visual/interaction.md` before reviewing.
- No baseline visual/usability pixel audit applies — there is no rendered surface to look
  at; the artifact is markdown describing a token/component system, so the review is a
  source-fidelity audit against the doctrine's own rules (token tiers, atomic composition,
  marks/channels, 8-state lifecycle), not a pixel critique.
- Not applicable: `content-design`, `behavioral`, `journey`, `deceptive-patterns`,
  `ai-native` — no copy, no persuasion surface, no route-through-time, no rendered page to
  distinguish look from generic AI output (and the dispatch prompt's `## Doctrine` did not
  name any of these; per protocol, doctrine not named there is not loaded for this phase).
- Deferred: none — the surface (a single markdown section) is small enough that no pillar
  needed to be dropped for space.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|---|---|---|---|---|
| Critical | design-systems | The document's own "second sweep" claims exhaustive value-by-value verification of every dimension inside every `style.css` range its component specs cite (187-205, 258-259, 262, 263-299, 274-291, 296, 299-300, 309, 408-410, 437-449). Two raw px values sit inside those exact ranges, unaddressed by any token or named-exception: `.chipLbl { ... margin-top: 1px; }` (`style.css:205`, inside the Chip/KPI spec's own cited 187-205) and `.barTrack { height: 8px; background: var(--field); margin-top: 4px; }` (`style.css:258`, inside the Meter spec's own cited 258-259, 309). Neither margin-top value appears anywhere in the component-tier CSS block (`--chip-*`, `--meter-track-level`, etc.) and neither is named as a genuine one-off the way `#tabs button`'s `7px` or `.chipGroup`'s `border-radius: 5px` are. `1px` additionally does not decompose onto the stated dimension scale (`--space-1` is 2px, the floor) — by the document's own rule ("a genuine one-off... decompose[s] onto the existing scale" is a finding when true, and an off-scale value must be named), this is exactly the class of defect the document claims to have eliminated. | DW-4.1 (token tiers must back every dimension value cited; "a value silently left untokenized is not [acceptable]") — a spec whose own cited ranges contain untokenized/unnamed px values fails this item, and the document's explicit exhaustiveness claim is falsified by direct counter-example. | Add both values to the sweep: name `.chipLbl`'s `margin-top: 1px` as a genuine one-off (parallel to `#tabs button`'s `7px`) since it doesn't decompose onto the scale, and give `.barTrack`'s `margin-top: 4px` a component name (it does decompose onto `--space-3`) or explicitly fold it into an existing token's comment the way `--row-pad` documents both axes of a shorthand. |
| Minor | data-viz | Row's States table states the `active` trigger uniformly as "squad/allocation > 0 on this row," but the shipped code applies two different predicates: training tiers toggle `.active` on `!locked && squad > 0` (`main.js:793`), while Grind zones toggle it on `unlocked && n > 0 && zr.held` (`main.js:840`) — zones additionally require the DPS hold-gate. The fuller truth is stated correctly elsewhere in the same document (the "struggling" state discussion), so this isn't a fabricated claim, just an imprecise unification in the States table itself. | Internal consistency (two sections of the artifact stating slightly different accounts of the same trigger) / Munzner marks-and-channels (the encoding condition should be stated precisely per instance, not averaged). | Add a one-line qualifier to the Row States table's `active` row: "training: `squad>0`; zones: `squad>0 && held` (see struggling, below)." |
| Note | interaction | The allocation control's touch target (`.allocMini button { padding: 4px 8px; font-size: 11px }`, computing to roughly 21-24px tall) sits well under the WCAG 2.5.8 44×44px floor, on the single most-repeated interactive control in the game, on a mobile-first playtest surface. Already self-disclosed by the document as "worth a follow-up, not a fix here" — not a silent gap. | Fitts's law / WCAG 2.5.8 (interaction doctrine, Touch target) | Non-blocking per the document's own scope call; flagged for whoever next touches `.allocMini` CSS. |
| Note | interaction | Tab button's `locked` state is visually and textually signaled (`???` label, suppressed hover) but carries no `aria-disabled`/`disabled` attribute — a locked tab stays focusable and silently no-ops on click. Already self-disclosed in the document as "flagged for a future accessibility pass, not fixed here." | Interaction doctrine — disabled elements should explain themselves to assistive tech, not only sighted users | Non-blocking; add `aria-disabled="true"` when `showTab` gates a locked tab, in whichever phase next touches `main.js`'s tab wiring. |

## Requirement Fulfillment

### DW-4.1
PREMISE: Token tiers defined (primitive → semantic → component); every component spec references semantic tokens, never raw values. This covers DIMENSION values (spacing, padding, grid columns, track heights) as well as color — a spec whose px values have no tier backing fails this item. A genuine one-off named honestly as an exception is acceptable; a value silently left untokenized is not.
EVIDENCE: The three-tier hierarchy is present and correctly structured (global → semantic → component, `internal/DESIGN.md:648-660`), and the primitive dimension scale is genuinely derived from `style.css`'s own px-literal frequency — independently re-counted via `grep -oE '[0-9]+(\.[0-9]+)?px' style.css | sort | uniq -c`: 1px×40, 2px×17, 3px×18, 4px×33, 6px×24, 8px×32, 10px×24, 12px×10 — every count matches the document's claimed occurrences exactly. The `border-radius` claim ("only two declarations in the whole stylesheet: `5px` and `0`") is independently verified (`grep -n border-radius style.css` returns exactly those two lines, 194 and 304). The `7px` one-off claim, however, undercounts: `grep -n 7px style.css` returns three sites (`style.css:167` `#tabs button`, `:392` `.stashRow button`, `:618` `.pip`) — the document names only the first. And two dimension values sit inside the document's own explicitly-cited ranges with no token and no exception name: `style.css:205` (`.chipLbl { margin-top: 1px; }`, inside the cited 187-205) and `style.css:258` (`.barTrack { ... margin-top: 4px; }`, inside the cited 258-259). The component-tier CSS block (`DESIGN.md:769-816`) has no entry for either.
VERDICT: FAIL

### DW-4.2
PREMISE: A spec exists for each repeated shape: row, rowlist, chip/KPI, meter, arena, allocation control, caption, tab button.
EVIDENCE: All eight appear as their own headed subsections in `## Component specs`: Row (`DESIGN.md:832`), Rowlist (`:872`), Chip / KPI cluster (`:881`), Meter / progress bar (`:908`), Arena (`:978`), Allocation control (`:1005`), `.caption` (`:1052`), Tab button (`:1080`). Cross-checked each against the markup it claims to derive from: Row's four-arity table was verified against `main.js:317-328` (training), `:342-354` (zones), `:463-469` (Cache-tree, 3-slot + buy button, confirmed no `.rowAlloc` wrapper), `:476-497` (Dungeon duty rows, confirmed inline −/+/max/0 with no `.allocMini`/no cap/no `⋯`), and `:500-504` (journal rows, confirmed 2-slot readout-only) — every arity claim matched the actual generated markup exactly. Dungeon's claimed absence of a fifth meter species was verified against `main.js:966-970` (floor/haul/damage% render as text with `.warn`/`.sat` swap, no bar element).
VERDICT: PASS

### DW-4.3
PREMISE: Each component spec states its interaction states including locked and disabled.
EVIDENCE: Row's States table has explicit `locked` and `disabled` rows (the latter stating "N/A as a distinct visual state today... a row is either normal or `.locked`," an honest account, not a gap silently skipped). Meter's States table has an explicit `hover/active/disabled` row stating N/A with cause ("no bar itself is clickable"). Allocation control's States table has explicit `disabled` and `locked` rows, the latter correctly labelled REQUIRED and cross-verified against `bots.js:116-122` (`setAlloc` has no lock check at all in the shipped code — confirmed by direct read) and `main.js:484-488` (`setParty` checks only `state.instance.running`, never `dutyUnlocked` — confirmed by direct read). Tab button's States table has explicit `locked` and `disabled` rows. Rowlist, Chip/KPI, `.caption`, and Arena state plainly that they carry no states of their own and explain why (pure layout wrapper; pure readout; pure text; delegates to occupant) rather than omitting the topic.
VERDICT: PASS

### DW-4.4
PREMISE: Meter encoding is consistent — bar length means one thing across training, zones, boss health and dungeon progress, or the differences are explicitly distinguished by form.
EVIDENCE: Four species are named (Depletion, Cycle, Progress-to-rank, Level) with an explicit table of what actually differs today: track height (`--space-1`/`--space-2`/`--space-5`/canvas), track color/visibility (transparent / `--line-soft` / `--field` / `--field`), fill color, and rendering medium (canvas vs. DOM) — independently verified against `style.css:258-259,299-300,309,408-410` (all track-height/color values match exactly). Cycle (training + zone kill-cycle) and Progress (Armory rank) are correctly identified as the same species used consistently for two different content types, not a conflation — the "maxed" color-swap claim was cross-checked and the document itself catches a subtlety here (`.rowlist .row.maxed .rowFill` is a no-op, since `.rowFill` is unconditionally gold; the real maxed tell is the bar going solid via the `rate>=10` strobe-avoidance branch at `main.js:806`, confirmed present). Dungeon is confirmed to have no meter at all (verified above, DW-4.2). The required `data-viz="depletion|cycle|progress|level"` attribute is correctly labelled REQUIRED — `grep -rn data-viz` across every game file returns zero matches, confirming it is a proposal, not an overclaimed fact.
VERDICT: PASS

**All requirements met:** NO

## Notes (non-blocking)

- **Phase 3 lock integrity — verified, not just asserted.** `git diff HEAD -- internal/DESIGN.md` shows 489 insertions, 0 deletions, and the diff hunk starts exactly at the line after the Phase 3 close ("...anything downstream builds against it.") — the change is purely additive; no locked Phase 3 sentence was altered. This satisfies the binding constraint directly.
- **Live/dormant/locked ladder carrier — verified.** The ladder is carried by row/cell opacity (`--opacity-dormant`/`--opacity-locked`) plus a text channel (unlock-condition sentences, real-zero-value text), never by the `recede`/`faint`/`faintest` text-color tokens, which the document explicitly (and correctly) reclassifies as a general secondary/tertiary text hierarchy rather than a state ladder. Consistent with the binding constraint.
- **Dead-CSS list — verified.** `grep -rn "tier-risk|tier-nightmare|ztable|pullBtn|ticketGain|tierAtk|tierSpeed|gmSec|gmPanel" index.html main.js` returns zero matches — every selector the document calls dead is in fact absent from the live markup.
- **`battle.js drawBars()` contrast defect — verified as described.** `ctx.fillStyle = "#0d0d10"` (line 132/137) draws the HP% label over the empty track (`--field #22222a`) for the entire fight except at exactly full HP — matches the document's claim precisely; correctly filed as a surfaced-but-not-DW-item defect, not silently absorbed into the contrast-evidence "all passing" table.
- **Forward-compatibility (meta-currency spend surface) — partially demonstrated.** Tab button and Affordability compose cleanly for a seventh nav entry and binary afford/can't-afford buy rows (no new primitive needed, verified against `section.game button` + `.affordable`/`buyState()` at `main.js:126`). The plan's own assumption additionally flagged the old GM tab's *proportional-fill* affordability idea as "worth carrying forward" — the current spec does not cover that variant and says so explicitly ("a literal fill-style treatment would be a design change... named so Phase 6 or the meta-currency redesign can pick it up deliberately"). This is an honest, disclosed scope boundary, not a hidden gap — noted here because the review brief asked the composability claim be judged on its merits, and the claim holds only for the binary case.
- **`7px` undercounted, but low stakes.** The two additional `7px` sites (`.stashRow button`, `.pip`) are outside every range the component specs actually cite (stash rows and Trophy pips aren't among the eight DW-4.2 shapes), so they don't independently falsify the sweep claim the way the two `margin-top` values do — listed here as a completeness gap in the document's own "grepped every 7px" language, not a DW-standing violation on its own.

## Verdict: FAIL — DW-4.1

**Blocker:** The document's central, repeatedly-restated claim this round — an exhaustive, value-by-value sweep of every dimension inside every `style.css` range its component specs cite — is falsified by two concrete counter-examples found inside those exact cited ranges (`style.css:205` `.chipLbl { margin-top: 1px; }` inside the cited 187-205; `style.css:258` `.barTrack { margin-top: 4px; }` inside the cited 258-259). Neither value is tokenized in the component tier nor named as an honest exception the way `#tabs button`'s `7px` and `.chipGroup`'s `border-radius: 5px` are. This is precisely the defect class DW-4.1 exists to catch ("a value silently left untokenized is not [acceptable]"), and it sits inside ranges the document itself singles out as fully verified — the exact standard the review brief asked to be checked by re-doing the sweep independently.

All other requirements (DW-4.2, DW-4.3, DW-4.4) pass on direct source verification, and the Phase 3 lock, the dead-CSS list, the REQUIRED/VERIFIED labelling discipline, and the `data-viz` forward-spec are all independently confirmed accurate against `style.css`/`index.html`/`main.js`/`bots.js`/`battle.js`. The fix is narrow: name or token the two missed margin values, matching the discipline the rest of the document already holds itself to.
