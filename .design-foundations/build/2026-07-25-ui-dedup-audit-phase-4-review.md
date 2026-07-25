# Design Review: Phase 4 - Component specs (internal/DESIGN.md)

## Rendered Evidence (Step 0)
- Screenshot: none — the artifact is a specification document (`internal/DESIGN.md` §`## Component specs` + `### Token tiers`), not a rendered page. No `.html`/mock file exists for this phase.
- Surface reviewed: `internal/DESIGN.md` lines 632–956 (`## Component specs` and its `### Token tiers` subsection), cross-checked against `index.html`, `main.js`, `style.css`, `battle.js`, `instance.js`, `bots.js`, and the locked Phase 3 sections (lines 1–629) of the same file, plus `internal/JOURNEY.md`.

## Assessment B — Deterministic Detector
- Command: not run.
- Exit: N/A (no rendered `.html` artifact this phase — this is the documented, explicit carve-out from the dispatch prompt, not a skipped-detector failure).
- Findings: N/A — no rendered artifact.
- Opened only after Assessment A findings were frozen: N/A (nothing to open).

## Triage
- Baseline (always-on): visual (design-dna/checklists) + usability were considered, but the artifact carries no rendered pixels to critique for typography/color/composition — findings here are structural/spec-level per the no-artifact path.
- Dispatched (per `## Doctrine`): `design-systems` (token tiers, atomic composition, Kholmatova functional/perceptual), `data-viz` (meter/marks-and-channels encoding, Munzner, Tufte), `interaction` (8-state lifecycle, locked/disabled, touch targets).
- Not applicable: `content-design` (no new copy authored this phase), `behavioral`/`deceptive-patterns` (no persuasion surface in scope), `journey` (JOURNEY.md is the input contract, not what's being produced this phase).
- Deferred: none — three dispatched pillars fully covered the artifact's scope.

## Cross-Pillar Findings (ONE ranked report)

| Severity | Pillar | Problem | Principle | Fix |
|----------|--------|---------|-----------|-----|
| Major | design-systems | The component tier defines `--meter-fill-level: #5a7a5a;` as a **raw hex literal**, not a reference to any semantic/alias token. No semantic color token for this green exists anywhere in the semantic tier (the Color tokens table lists gold/bone/dim/recede/faint/faintest/risk/warn/alert/copper/live/logline — none is `#5a7a5a`). The doc's own prose ("No new hex values except `--meter-level-fill`, and its value is unchanged") treats this as compliant, but it is precisely the pattern DW-4.1 bans: a component token must resolve to an alias token (`button-background: {color-text-primary}`), never jump straight to a global/raw value. | Semantic token tiers (`design-systems.md` §B: "Component tokens... let a component be restyled without touching the alias tier" — implies routing through the alias tier, not around it) | Promote `#5a7a5a` to a named alias token (e.g. `--utilization` or reuse/adjust `--live`) in the semantic tier, then have `--meter-fill-level` reference it, matching every other component-tier entry's pattern. |
| Major | design-systems | **No spacing/dimension token tier exists anywhere in the file.** DW-4.1 requires "Token tiers defined (primitive → semantic → component)" with components never citing raw values — but this applies only to color/type in practice. Every component spec in this section quotes raw px directly with zero primitive backing: Row's grid grammar (`130px 100px auto 1fr`, `style.css:265`), the Meter table's track heights (`2px cycle / 3px progress / 8px level`), the Allocation control's touch-target discussion (`padding: 4px 8px`), the Arena's border/padding (`8px 12px 10px`). Unlike every other open item in this document (which is candidly logged under "Open questions" or flagged `REQUIRED`), this gap is never named — the document's own rigor standard (name every gap, don't silently drop it) is not applied to itself here. | Global/semantic/component token tiers (`design-systems.md` §B: the worked example is explicitly `space-4: 1rem` alongside color — spacing is part of the primitive vocabulary, not an exception) | Either name a `--space-*` primitive/semantic tier (even a minimal 2–3-step scale covering the row-grid, padding, and track-height values already in use) and re-cite component specs against it, or explicitly log the omission as a scoped-out gap the way every other open item in this document already is. |
| Major | interaction | The **Meter / progress bar** spec — one of the 8 required shapes — has no `**States:**` section at all, unlike all other seven (Row, Rowlist, Chip, Arena, Allocation control, `.caption`, Tab button each have one, even where the honest answer is "none apply"). This isn't just a formatting gap: a real state is verifiably missing. `.rowlist .row.locked { opacity: var(--opacity-locked) }` (`style.css:298`) is a **parent** of the Cycle meter (`.rowBar`/`.rowFill`) in every Training-tier and Grind-zone row (confirmed: `main.js:792` toggles `.locked` on the same `.row` element that contains the `.rowFill` child built at `main.js:324`, and `main.js:841` does the same for zones). Opacity cascades visually to all descendants, so the Cycle meter measurably dims to 45% whenever its row is locked — a real, demonstrable interaction state the spec never names, breaking DW-4.3's explicit "including locked and disabled" requirement for this one shape. | 8-state interactive lifecycle (`interaction.md`: "Every interactive element must communicate its current state... the eight states... aren't nice-to-haves"; the doctrine's own detection checklist: an element that changes state without the spec naming it) | Add a `**States:**` block to the Meter spec naming at minimum: idle/live (full opacity), and locked (0.45 opacity, cascaded from the parent `.row.locked`, Cycle species only — Depletion/Progress/Level don't nest inside a lockable row). |
| Minor | design-systems | Token name mismatch inside the same document: the component tier block declares `--meter-fill-level` (`DESIGN.md:678`, and repeated correctly at `:784`), but the prose two paragraphs later refers to it as `` `--meter-level-fill` `` (`DESIGN.md:691`) — the two names don't match. Small, but a token-naming document should be internally exact, especially since this is the one token in the whole component tier that's flagged as new/exceptional and therefore gets extra scrutiny. | Governance / naming precision (`design-systems.md`: token tiers are the design decision layer, and a document whose entire purpose is naming tokens precisely should not contain two spellings of the same name) | Fix the prose reference at line 691 to `--meter-fill-level`. |

**Note on things that held up under verification (not findings, stated for calibration):** every cited `main.js`/`style.css`/`battle.js`/`instance.js` line range checked (allocMini `main.js:288-310`, training/zone row builders `main.js:317-328`/`344-354`, duty-row builder `main.js:477-497`, Cache-tree/journal row builders `main.js:465-469`/`500-504`, `bots.setAlloc` `bots.js:116-122`, `setParty` `main.js:484-488`, `el.disabled` `main.js:991`, zone-locked toggle `main.js:841`, `instance.js dutyUnlocked`/`MECHANICS` gate values, `drawBars()` `battle.js:124-141`, every hardcoded-hex citation in `style.css`) resolved exactly as claimed. The REQUIRED-vs-VERIFIED labeling discipline is accurate everywhere it was spot-checked, and the `git diff` against the prior commit confirms the Phase 3 sections were purely appended-to, not rewritten (327 insertions, 0 deletions, only after line 629). This is an unusually well-self-verified artifact; the findings above are the real gaps that survived that scrutiny, not a broad indictment of the document's care.

## Requirement Fulfillment

### DW-4.1
PREMISE:  Token tiers defined (primitive → semantic → component); every component spec references semantic tokens, never raw values.
EVIDENCE: The three-tier hierarchy (Global/`palette.mjs` → Semantic/`:root` → Component, `DESIGN.md:648-693`) is explicitly documented and 19 of 20 component tokens correctly resolve to `var(--semantic-token)`. However `--meter-fill-level: #5a7a5a` is a raw hex with no semantic-tier backing (finding above), and the entire spacing/dimension axis used throughout every component spec (grid columns, padding, track heights) has zero primitive/semantic tier at all — every dimension value in the spec is a raw px literal.
VERDICT:  FAIL

### DW-4.2
PREMISE:  A spec exists for each repeated shape: row, rowlist, chip/KPI, meter, arena, allocation control, caption, tab button.
EVIDENCE: All 8 subsections are present (`### Row`, `### Rowlist`, `### Chip / KPI cluster`, `### Meter / progress bar`, `### Arena`, `### Allocation control`, `` ### `.caption` ``, `### Tab button`), each traced to a specific selector/id/class confirmed live in `index.html`/`main.js`/`style.css` (spot-checked and confirmed for all 8).
VERDICT:  PASS

### DW-4.3
PREMISE:  Each component spec states its interaction states including locked and disabled.
EVIDENCE: Row, Rowlist, Chip, Arena, Allocation control, `.caption`, and Tab button all carry an explicit `**States:**` treatment (including explicit "N/A" reasoning where a state doesn't apply, e.g. Chip: "no hover/active/disabled/locked"). Meter/progress bar has no States section at all, and specifically omits the verified locked-opacity cascade onto the Cycle species (finding above) — one of the 8 required shapes fails this item.
VERDICT:  FAIL

### DW-4.4
PREMISE:  Meter encoding is consistent — bar length means one thing across training, zones, boss health and dungeon progress, or the differences are explicitly distinguished by form.
EVIDENCE: The four shipped species (Depletion/canvas one-shot drain, Cycle/repeating per-work-unit pulse, Progress-to-rank/session-long climb, Level/utilization-vs-growing-capacity) are verified — not merely asserted — to differ by medium (canvas vs. DOM, confirmed in `battle.js:124-141` vs. `style.css:299-300`), track height (2/3/8px), track visibility/color, and fill color, plus each has a distinct verified semantic (one-shot vs. repeating vs. cumulative vs. moving-target). Dungeon is confirmed to have no meter today (`main.js:966-970`, text-only with `.warn`/`.sat` swap). A forward-compat rule (`data-viz` attribute, one of 4 named species) is specified so a future 5th meter can't collide by accident.
VERDICT:  PASS

**All requirements met:** NO — DW-4.1 and DW-4.3 each carry a concrete, source-verified violation.

## Notes (non-blocking)
- No screenshot/rendered surface exists for this phase (expected — this is a spec-only phase); nothing here required pixel evidence, so this is not a coverage gap in the review-protocol sense, just a fact about the artifact type.
- The allocation-control spec (judged on the specific merits question) does not overclaim: it candidly states the touch-target gap (11px mono buttons, ~24-28px computed height vs. WCAG 2.5.8's 44×44px) as an unresolved finding rather than asserting the repetition is noise-free. This holds up as evidence-based, not an assertion.
- The forward-compatibility claim (new meta-currency spend surface composes from existing specs) is reasonably supported for structural composition (Row's 3-slot Cache-tree arity, Tab button, `section.game button.affordable`) but doesn't address whether the new currency will need its own color identity (distinct from the retired ticket `--risk` reuse) — out of Phase 4's component-composition scope, but worth flagging for whoever designs that currency's token.
- `--faintest` used as the `.locked` tab's text `color` (not `border-color`, despite Phase 3's "border/state" framing) was checked against WCAG 1.4.3's exemption for text in inactive UI components — the locked tab qualifies as inactive, so the classification, while imprecisely worded in Phase 3, doesn't produce a wrong outcome and isn't reported as a finding here.

## Issues (if FAIL)
1. Component tier's `--meter-fill-level` hardcodes a raw hex instead of resolving through the semantic tier — Major / design-systems / three-tier token discipline / promote to a named alias token.
2. No spacing/dimension token tier exists anywhere; every component spec quotes raw px for layout dimensions with no primitive/semantic backing, and the gap is never logged — Major / design-systems / token tiers / name a minimal space-* tier or log the scoped-out gap explicitly.
3. Meter/progress bar spec has no interaction-states section and omits the verified locked-opacity cascade onto the Cycle species — Major / interaction / 8-state lifecycle / add a States block naming idle and locked.

**Verdict: FAIL — blockers: DW-4.1 raw-value violations (meter-tier hex + absent spacing-token tier), DW-4.3 Meter spec missing states.**
