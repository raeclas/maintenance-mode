# Design Review: Phase 3 - Visual pass propagation + Help tab

## Rendered Evidence (Step 0)
- Screenshots: `internal/mocks/shots/{training,grind,delve,dungeon,help}-375.png` and `-1280.png` (full-page), plus 2x detail crops in `internal/mocks/shots/crops/` (`training-top`, `grind-rows`, `grind-mono-rows`, `dungeon-duties`, `help-training`, `help-locked`, `armory-ui`, `armory-mono`, `ledger-ui`, `ledger-mono`, `chat-system`, `chat-general`). All read directly as images.
- Surface: all seven client mocks (`boss, training, grind, player, delve, dungeon, help`) at 375px (phone) and 1280px (desktop); `grind-mono.html` read as the rejected DW-3.9 comparison specimen.

## Assessment B — Deterministic Detector
- Command: `node "C:/Users/Admin/.claude/plugins/cache/rtd/design-for-ai/4.2.0/scripts/detect.mjs" internal/mocks/training.html internal/mocks/grind.html internal/mocks/delve.html internal/mocks/dungeon.html internal/mocks/help.html > .design-foundations/build/2026-07-26-visual-pass-and-help-tab-phase-3-review.detect.json`
- Exit: 0 (ran)
- Findings: 16 total — 15× `nested-cards` (all `internal/mocks/grind.html`, all on `<span class="band bN">` power-band chips inside zone rows) + 1× `em-dash-overuse` (`internal/mocks/dungeon.html`, "6 em-dashes in body copy")
- Opened only after Assessment A findings were frozen: YES

## Triage
- Baseline (always-on): visual (design-dna + checklists / ai-tells CHECKER) + usability (Nielsen's 10)
- Dispatched: `data-viz`-adjacent judgment for the Lane-4 power-band chips and rarity plates (numeric ranges encoded by hue+chip, close enough to data-viz to warrant the same colour-encoding scrutiny); `content-design` for the relocated Help copy and the em-dash detector hit; `journey` for the fact-ownership/state-ladder contract (this document's own organizing principle) and the idle/in-progress Dungeon requirement; `responsive` for the 375px no-scroll requirement
- Not applicable: `behavioral`/`deceptive-patterns` — no persuasion/conversion surface here (idle-game admin/status screens, not pricing/signup/upsell)
- Deferred: none — surface set (5 required mocks + 2 reference surfaces) was small enough to review in full

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Major | journey / usability | `internal/mocks/help.html` renders the chat window's persistent `#online` fact ("Players online: 1") **twice** in the live DOM — once in a mid-page demo block for the General/empty state (line ~1466) and once in the normal bottom-of-page chrome for the System state (line ~1474) — with duplicate `id="chat"`, `id="chatHead"`, `id="online"`, `id="log"` across the two blocks. JOURNEY.md's own "Shared chrome: the chat window" table names `#online` a single, persistent, owned fact; this document's whole discipline (and DW-3.4 verbatim) is one fact, one location. | This project's own fact-ownership discipline (JOURNEY.md §Fact ownership) + Nielsen #4 consistency/standards + WCAG 4.1.1-class duplicate-id defect | Show the General/empty state as a single toggled instance (e.g. make Help's own persistent chat default to General, or swap the demo block for an annotated crop) rather than rendering two live `#chat` widgets on one page |
| Minor (register-justified) | detector / design-dna | `nested-cards`, 15× in `internal/mocks/grind.html`, all on `<span class="band bN">`. Evidence: `"<span class=\"band b1\"> is a card inside a card ancestor"` (e.g. line 1328). | ai-tells.md nested-cards heuristic (generic box-in-box chrome) | Register-justified: this is DESIGN.md v4 Lane 4 by design — "renders as a FILLED CHIP... at L*≈16.5 while every ink lane sits at L* 59," a deliberate, documented, solved-in-OKLCH data badge inside a list row, not decorative nesting. Visually confirmed on `grind-rows.png`: a compact bordered pill carrying a real IP-range number, not a redundant card shell. No action needed; if the detector's false-positive rate on legitimate chip-in-row patterns becomes a recurring cost, consider excluding single-line `<span>` chips from the rule. |
| Minor (register-justified) | detector / content-design | `em-dash-overuse`, `internal/mocks/dungeon.html`, evidence: `"6 em-dashes in body copy"`. | ai-tells.md em-dash heuristic (LLM prose crutch) | Register-justified: every instance found (`"3 assigned — blocked"`, `"2 assigned — NOT BLOCKED"`, `"needs script version 5 — buy it on the Training tab"`, `"there's no wiki and nobody to ask"`, `"Unknown — you haven't met this one yet"`, `"Pull out now — keep all 14 items"`) is the same deliberate "label — consequence" microcopy convention JOURNEY.md documents and traces to a pre-existing precedent (Ban Wave's `— the anti-cheat notices the farm`), not varied prose. Consistent house style, not a crutch. No action needed. |
| Note | usability / no-decay | `style.css` (shipped, not a mock) still contains the pre-Phase-3 `.cursor` rule, `@keyframes blink`, the `#logHead` rule (with its hardcoded `#4e7a5e`), and a `/* dead-server theme */` header comment. None of it renders (the `<span class="cursor">` that consumed `.cursor` is already gone from `index.html`), so no pixel or contrast regression exists. DESIGN.md's own "Required behaviour changes #10" explicitly names this dead CSS and defers its deletion to "the integration task," and DW-3.7 scopes only to `index.html` / `build.mjs`, so this is not a DW-3.7 violation — flagged here only because the edge-case wording ("no dead-server string... survives anywhere") is broad enough to warrant naming it for the next pass. | No-decay veto (CLAUDE.md hard veto) + dead-code hygiene | Delete `.cursor`, `@keyframes blink`, `#logHead`, the `.cursor` reference in the `prefers-reduced-motion` block, and the header comment in the already-planned style.css integration pass |

## Requirement Fulfillment

### DW-3.1
PREMISE:  Five surfaces (`training, grind, delve, dungeon, help`) render self-contained, no missing deps.
EVIDENCE: `grep` for `<link>`, `<script src=`, `<img>`, and `http(s)://` across all five files returned zero matches — each file is one self-contained `<style>`+markup document. All five render correctly at 375px and 1280px per the screenshots.
VERDICT:  PASS

### DW-3.2
PREMISE:  No hard-coded hex/rgb and no untokenized px in any mock.
EVIDENCE: Every `#hex` occurrence in `grind.html` (representative; same `:root` structure across all five) is inside a `--token: #hex` custom-property definition — none appear as a literal value on a rendered property (verified by pattern-matching property declarations against hex, and separately confirming zero `color`/`background`/`border-color` etc. use a literal hex). Every `px` occurrence is either inside a `--space-N` / `--fs-*` / `--armory-*` / `--alloc-*` token definition or a `@media (min-width:561px)` breakpoint (CSS media queries cannot reference custom properties, so a literal breakpoint value is unavoidable, not an "untokenized" style value).
VERDICT:  PASS

### DW-3.3
PREMISE:  No mock scrolls horizontally at 375px.
EVIDENCE: All five 375px screenshots render full-width content with no visible clipped/overflowing rows. The one wide-content case in the whole mock set — the Armory grid's `min-width:var(--armory-min)` (434px) — lives only in `player.html` (not one of the five required surfaces) inside `.amScroll{overflow-x:auto}`, a deliberately contained internal scroll region, not a page-level horizontal scroll. None of the five required surfaces reference `.amScroll` or `armory-min` in markup.
VERDICT:  PASS

### DW-3.4
PREMISE:  No fact appears twice within a single mock.
EVIDENCE: `training.html`, `grind.html`, `delve.html`, `dungeon.html` each render the live `#online` chat fact exactly once (all other occurrences of the string are inside `.mockNote` documentation prose, which DESIGN.md explicitly carves out as commentary rather than the mock's own voice). `help.html` renders it **twice** as two separate live `<div id="chat">...<span id="online">Players online: 1</span>...</div>` blocks (grep-confirmed at lines ~1466 and ~1474), once for the required General/empty demonstration and once in the normal bottom chrome.
VERDICT:  FAIL — `help.html` duplicates the chat window's owned fact (and its element ids) within the single document.

### DW-3.5
PREMISE:  The state ladder (live / dormant / locked) reads apart on every list surface.
EVIDENCE: `training.html` (`training-top.png`, `crops/training-top.png`): live "swing macro" carries a teal (`--acc-training`) left edge and name-ink, on a lifted ground, against dormant "combo macro" (neutral edge, dim name) and locked "cancel-weave script" (unlit, faded, no control). `grind.html` (`crops/grind-rows.png`): live "Salt Flats" (green `--acc-grind` edge/name) sits beside dormant "Cinder Steppe" (neutral) and, lower in the full render, locked zones (`--opacity-locked`, "locked · needs 4 doors open"). `dungeon.html` (`crops/dungeon-duties.png`) additionally verifies the adjacent live/struggling pair DESIGN.md's own Phase-3 correction discusses: Sunder (live, accent name / neutral stat) sits directly beside Mass Dispel (struggling, neutral name / `--warn` stat + "NOT BLOCKED"), and Summon Adds (locked, no edge, no control, greyed) is a third, clearly distinct row directly below. `delve.html`'s Cache Tree intentionally carries no per-row state ladder — JOURNEY.md's own Delve spec states dormant/locked are "N/A" at the row level for that tab (afford-gated buy rows only), so its absence there is spec-correct, not a gap.
VERDICT:  PASS

### DW-3.6
PREMISE:  No Critical findings.
EVIDENCE: Every finding surfaced by both assessments (the help.html duplicate-fact defect, and the two register-justified detector hits) is Major or Minor under the severity model in `## Cross-Pillar Findings` above; nothing rises to "breaks the experience."
VERDICT:  PASS

### DW-3.7
PREMISE:  The shell prompt is gone from every surface AND from `index.html` / `internal/mocks/build.mjs`; no `dead-server` string and no fake cursor survives anywhere in the rendered chrome. Verify by grepping the repo, not by reading a claim.
EVIDENCE: `git diff -- index.html` shows the ENTIRE working-tree change is one line: `<div id="logHead">maintenance@dead-server:~$ <span class="cursor">▮</span></div>` replaced by `<div id="logHead">System &middot; <span id="online">Players online: 1</span></div>` plus an explanatory comment — nothing else in the file changed. `grep -rniE "dead-server|maintenance@|cursor" internal/mocks/*.html index.html style.css` finds the literal string only inside HTML/JS comments and CSS rule/property names (`cursor:pointer` — the CSS property, unrelated) across every one of the seven mocks and `build.mjs`; no live element or visible text contains it. `style.css` still contains the dead, never-rendered `.cursor`/`#logHead`/`@keyframes blink` rules and a comment header, but DESIGN.md's own "Required behaviour changes #10" names this and defers it to the integration pass, and it is explicitly out of this item's stated scope (`index.html` / `build.mjs`) — logged as a Note above, not a violation of this item.
VERDICT:  PASS

### DW-3.8
PREMISE:  The chat window renders on all seven surfaces with its System and General states, and its empty state reads as quiet rather than broken — judged on the rendered pixels.
EVIDENCE: `grep -c 'id="chat"'` confirms one `#chat` instance on `boss/training/grind/player/delve/dungeon.html` (each showing both `System`/`General` channel buttons, System active and populated by default — confirmed on `boss-375.png`, `training-375.png`, `delve-375.png`, `dungeon-375.png`) and two instances on `help.html` (one demonstrating General/empty, one the normal System/populated chrome). The empty-state crop (`help.html` mid-page block) renders `Nothing here.` in `--faint` italic inside an intact, lit, bordered socket — no narration of the emptiness, no broken/missing chrome — reading as quiet per DESIGN.md's own stated intent, confirmed visually.
VERDICT:  PASS — the two states are demonstrably present and legible on the rendered pixels; the *construction* used to show both on `help.html` is the separate DW-3.4 defect above, not a DW-3.8 failure.

### DW-3.9
PREMISE:  The mono-vs-UI-font question is decided on rendered evidence — both treatments rendered, one chosen, the reason recorded in DESIGN.md.
EVIDENCE: `internal/mocks/grind.html` (UI face) and `internal/mocks/grind-mono.html` (rejected specimen) are byte-identical apart from `--font-data`. Side-by-side crops (`grind-rows.png` vs `grind-mono-rows.png`, `armory-ui.png`/`armory-mono.png`) confirm both actually rendered and both hold tabular alignment. `internal/DESIGN.md`'s `## The data face (v4, Phase 3)` records the decision (UI face wins) and three concrete, evidenced reasons (register defence doesn't hold under inspection, `tabular-nums` already handles alignment without mono, and mono costs 11% more vertical height at 375px — 6,438px vs 5,734px).
VERDICT:  PASS

**All requirements met:** NO — DW-3.4 fails on `help.html`'s duplicated chat-window fact/ids.

## Notes (non-blocking)
- `node internal/mocks/contrast.mjs` was re-run independently rather than trusting the file's own exit code: it printed `all 189 gated pairs + 16 L* surface pairs pass`, matching DESIGN.md's claim exactly. The `git diff` on `contrast.mjs` shows the 190→189 pair-count change is solely the `["logline","bg"]` pair retiring alongside `--logline` (confirmed dead — grepped, zero live consumers across all seven mocks, only comment references), with substantial NEW coverage added (rarity, Warden, tab-accent and power-band lanes, plus L*-separation surface checks) rather than any existing pair being loosened or dropped.
- No obligation-mechanic language found near the chat window (`grep` for badge/unread/notification/dot near `#chat` returns only documentation text confirming their absence — `"No unread badge, no notification dot, no count. That would be an obligation..."`).
- No decay signifiers (`broken`, `glitch`, `corrupt`, `ruin`, `decay`, `dead`) found in any rendered (non-comment) text across the five required surfaces — every hit is inside an HTML/CSS comment or a `.mockNote`/`.stateLabel` annotation block.
- Chat window carries zero lane hues in its CSS (`#chat`, `#chatHead`, `.chan` use only `--line`/`--edge-lit`/`--edge-shade`/`--bone`/`--panel`/`--field`) — confirmed by reading the rule block directly, satisfying the "chrome must not acquire a lane budget of its own" edge case.
- Spot-checked the copy-relocation table (JOURNEY.md's 22-row list): `help.html`'s Training block carries Bot Pool / Scripts / Enhance Squad / Ban Wave verbatim-equivalent explanations (`crops/help-training.png`), matching the relocation table's "New home" column; `training.html`'s live tab correspondingly carries only the bare headings + state readouts, with the general teaching clauses absent. Not exhaustively checked against all 22 rows.
- The Armory grid crop (`armory-ui.png`) shows a maxed item ("Padded Vest", R12) correctly in gold per DESIGN.md's "gold owns a maxed/complete state," distinct from the blue-lavender `--acc-player` left edge every other row carries — no lane collision observed.

## Issues (if FAIL)
1. `internal/mocks/help.html` renders the chat window's owned fact (`#online` → "Players online: 1") and its containing ids twice in one document — Major / journey+usability / fact-ownership discipline + Nielsen #4 + WCAG duplicate-id / Fix: collapse the General/empty demonstration into the page's one persistent chat instance (default it to General on Help) or replace the second live widget with a static annotated crop, rather than instantiating a second `#chat`.

**Verdict: FAIL — blocker: DW-3.4 (help.html duplicates the chat window's `#online` fact and element ids within a single mock).**
