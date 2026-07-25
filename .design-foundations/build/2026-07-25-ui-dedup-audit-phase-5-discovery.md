# Discovery + Design: Phase 5 — Words

Produced by the BUILD pass of Phase 5 of
`.design-foundations/plans/2026-07-25-ui-dedup-audit.md`.
Doctrine loaded: `content-design`
(`references/content-design/content-design.md` + its Layer-B catalog
`references/content-design/references/microcopy-patterns.md`).

---

## Artifacts Found / Current State

| Input | State | What it gives Phase 5 |
|---|---|---|
| `internal/JOURNEY.md` `## Fact ownership` (Phase 1) | complete, committed `dd4e1da` | which tab owns which fact + its live/dormant/locked state — the pointer-vs-copy rule copy must obey |
| `internal/JOURNEY.md` `## Page specs` (Phase 2) | six entries, committed `7a1ac3d` | the structure copy is written INTO — blocks + states already ordered and named |
| `internal/DESIGN.md` (Phases 3+4) | LOCKED `3aff88d`, components `b34fc60` | read-only reference. Not edited this phase, not needed for copy beyond the register statement |
| `internal/UI-AUDIT.md` | measured `bcf4ecc`, reconciled `82d2d99` | the copy failures to fix, per tab |
| `internal/REMAKE-DESIGN.md` §16 | three-register lexicon | governs NAMES ONLY |
| Live source (17 modules + `index.html` + `main.js`) | read in full this pass | every rate, cap, cost, chance and unlock condition |

Current copy state, measured rather than assumed: **every string that
teaches a mechanic is either register-first, missing, or wrong.** The six
tabs currently carry ~120 distinct player-facing strings; the audit named
five copy defects; reading the source surfaced **eight more** (below).

## Gaps

### A. Copy defects that are factually WRONG against live source (new this pass)

| # | String | Where | Truth in source |
|---|---|---|---|
| A1 | `multiclient +4` | `main.js:766` | `capacity(b) = round(40 × 1.2^capRank)` (`bots.js:65-67`). Rank 0→1 is 40→48, i.e. **+8, and multiplicative**. The `+4` is inherited from a stale comment in `state.js:35` that the live function stopped matching. |
| A2 | `buried scripts · +5% train rate` | `dungeon.js:26` | `drill` multiplies the **gain per fill** (`bots.js:210-211`, `t.gain * drill`), not the fill rate. It buys +5% ATK/hits **per fill**, not +5% fills/s. |
| A3 | `DELVE — descend for copper; bank before you wipe.` | `main.js:212` | Describes the RETIRED Delve. The live Delve is an idle depth engine paying **Cache**, with no descend, no bank and no wipe (`dungeon.js:1-7`). |
| A4 | `[LOCKED] break W1` / `break W4` | `main.js:844` | `zoneUnlockClears` returns a **clear COUNT**, not a wall number (`farm.js:14`). The string reads as "break Wall 4"; it means "have 4 doors open". Numerically coincident on a linear ladder, semantically wrong. |
| A5 | `lost to bans {n}` called "permanently 0 / vestigial" | `main.js:772`, and `JOURNEY.md`'s own Training row | **The Phase 1 map is wrong here.** `state.bots.banned` is incremented live by `instance.js:147`. The stat is not vestigial — it is a live Dungeon counter mislabelled on the Training tab. Copy fix names the source instead of retiring the term (de-dup must not hide information). |
| A6 | `super ×5.0` | `main.js:758` | The super-crit **rate** (`BASE.superRate = 0.20`, `crits.js:10`) is never displayed anywhere. A guideline-5 term with no displayed home — the one thing Phase 1's DW-1.3 sweep missed because it traced `critFactor` as one term rather than its four sub-terms. |
| A7 | `{m.label} wasn't blocked — you're dealing {pen}% less damage` | `main.js:651` | `inst.mult *= r.mult` runs **every floor** (`instance.js:148`), so the penalty compounds per floor. The string implies a single one-time hit. |
| A8 | Speed soft-cap is invisible | `stats.js:25-27`, `main.js:812` | `softHits` compresses hits/s above `boss.speedKnee` (W1 = 5.0, rising to 70.0 at W10). `#barSpeedInfo` prints the **raw** trained figure, so past the knee the displayed number and the applied number diverge with nothing saying so. |

### B. Audit-named copy failures (seeded, all in scope)

| # | Failure | Fix location |
|---|---|---|
| B1 | Dungeon intro paragraph is 6 lines, fills the first screen | rewritten to 3 short lines, owns the run loop + the 40% wipe rule and nothing else |
| B2 | Each Dungeon ability states its effect in the assign row **and** again in Boss abilities | journal rows lose the effect sentence entirely; they carry only met/blocked status |
| B3 | `needs N bots` renders in the gain column **and** inside the stat column | need lives in the gain column only; stat carries the verdict only |
| B4 | Difficulty renders 3× | split into three DIFFERENT jobs: the control (input), the concept (helper, stated once), the consequence (state line) |
| B5 | Empty journal = three identical `Unknown` rows | copy unchanged in shape (it is honestly three unknowns), but the header now says what the journal is FOR and that it survives a Ban Wave |
| B6 | Training locked rows name the row above them, producing a back-reference chain | the unlock RULE moves to the section header; rows print `locked · {n} / {m} fills` with no predecessor name |

### C. Gaps Phase 1/2 explicitly handed forward to Phase 5

| # | Gap | Resolution |
|---|---|---|
| C1 | Delve `overclock` shows rank + per-rank gain, never the current total multiplier | every Cache-tree row's rank readout becomes `rank {n} · ×{total} now` |
| C2 | Grind never spells out the applied copper multiplier | the held-zone stat appends `(×{copperMult} from gear, trophies and Armory)` |
| C3 | `.pip` has `cursor: help` promising a tooltip that does not exist (`DESIGN.md` required-change 3) | pip `title` strings written here |

### D. Real states with NO copy at all today (DW-5.3 blockers)

| # | State | Condition in source |
|---|---|---|
| D1 | Enhance attempt fails for lack of copper | `enhance.js:54` returns `"poor"`; `main.js:379` returns silently — no message, no disabled button |
| D2 | Bot over-allocation | `bots.effScale < 1` prints `· short {n}%` with no explanation of cause or fix |
| D3 | Dungeon send blocked | `inst.canStart` false for two different reasons (no bots assigned / party larger than pop) — both render as a silent disabled button |
| D4 | Empty gear slot | renders `—`, a dead end |
| D5 | Locked tab | renders `???` with no unlock condition anywhere |
| D6 | Enhance at max | button disables, info string blanks — no statement that +20 is the ceiling |
| D7 | Offline earnings clamp | `OFFLINE_CAP_S = 12h` (`farm.js:6`) is never stated |

## Gate Status

- **DESIGN.md locked?** YES — `internal/DESIGN.md` line 2, LOCKED 2026-07-25, user-confirmed. **Not edited this phase** (the plan's `Produces:` forbids it; nothing in this phase needs a token change).
- **JOURNEY.md present?** YES — Phases 1+2 complete. Phase 5 appends only; no Phase 1 or Phase 2 content is restructured, reordered or deleted.
- **Prerequisites met?** YES. Phase 5 depends on Phase 3 (locked) per the plan; Phases 1, 2 and 4 are all committed.
- **Scope conflicts?** NONE. No copy decision below requires a locked DESIGN.md value to change.

## DW Verification

| DW-ID | Done-When Item | Status | Design execution evidence |
|---|---|---|---|
| DW-5.1 | Every content block in all six page specs has final copy | **COVERED** | A per-spec `**Microcopy (Phase 5)**` table whose `Block` column enumerates every numbered content block **and** every state from that spec's own `**States:**` list. Evidence = block-count parity: Boss 6 blocks + 7 states, Training 5 + 5, Grind 1 + 5, Player 6 + 5, Delve 3 + 5, Dungeon 6 idle / 6 running + 6 states — each row carries a literal final string or a template with its variables named. |
| DW-5.2 | No mechanic is explained more than once within a single tab | **COVERED** | A per-spec *Explained-once register* table: one row per mechanic taught on that tab, naming the SINGLE element that owns the explanation, plus an explicit "does not restate" column for the elements that previously repeated it. Verifiable by reading down the owner column for a duplicate. B1–B6 above are the specific repeats this kills. |
| DW-5.3 | Every empty, locked and error state has copy naming the condition and the way out | **COVERED** | Every `empty` / `locked` / `error` state row in the six specs' `**States:**` lists gets a string, and each such string is checked against the two-part test (names the condition · names the way out). D1–D7 are the seven states that had no copy at all; all seven are written. Locked-tab copy is written as `title` strings on the `???` buttons, since the pane is unreachable (`main.js:220`). |
| DW-5.4 | Copy passes a plain-English read: no string requires knowing the lexicon to understand what the control does | **COVERED** | A *Lexicon audit* table listing every §16 register name that survives into the copy, with the plain-English clause that defines it and where that clause lives. Test applied per doctrine's content-first check (`content-design.md` §C4): can a reader with no visual context act from the words alone? Any name whose definition is not adjacent or one pointer away is a fail. |

**All items COVERED:** YES (4 of 4 — matches the 4 DW-IDs in the dispatch prompt).

## Design Decisions

1. **Name/instruction split is the phase's whole method.** The lexicon
   (`REMAKE-DESIGN.md` §16) supplies the NOUN; plain English supplies the
   VERB and the consequence, on the same line, always in that order.
   `multiclient · 40 → 48 bot slots · 800c` keeps the 2006-botting-forum
   name and still tells a first-time reader exactly what the button buys.
   This satisfies both the standing user preference and the doctrine's
   own jargon anti-pattern ("domain terms get one-time plain-language
   definition" — `microcopy-patterns.md` Anti-patterns).

2. **Section headers own the mechanic; rows own only their own numbers.**
   This is the single structural device that closes DW-5.2, and it is
   applied identically on all six tabs, not just the Dungeon where the
   audit found it. Concretely it is what lets the Training locked row
   drop `fills of {predecessor}` (B6) and the Dungeon journal row drop
   its effect sentence (B2). Cited: Redish — front-load the shared fact,
   write for the scanner, not the leisure reader.

3. **A repeated VALUE is not a repeated EXPLANATION.** Difficulty renders
   three times on the Dungeon tab and will still render three times after
   this phase — as a control, a consequence and a concept. Only the
   concept is copy this phase may collapse, and it is collapsed to one
   place. Structural value de-dup (canvas `%` vs `#depth`, `needs N bots`
   positioning) belongs to Phases 4/6 and is carried forward NAMED, not
   silently fixed here. `needs N bots` is the one exception: it is the
   same STRING in two positions, so deleting one is a copy edit.

4. **Every rate, cap, cost and chance is written as a template with its
   source formula, never as a hardcoded example value.** A page spec that
   says "70.0%" pins one instance; `{chance}%` sourced to
   `enhance.js:25` pins the contract. This also makes the numbers
   auditable against source in Phase 6 rather than re-derived.

5. **Errors follow Yifrah cause+fix, and never blame.** All seven
   no-copy states (D1–D7) are written as `[what happened] + [how to fix
   it]`, no exclamation marks, no "Oops", no dead ends. Example, D2:
   `over-assigned by 20% — every job runs at 80% until you free bots or
   the swarm grows`.

6. **Locked-tab copy goes on the `title`, not in the pane.** `showTab`
   returns early for a locked tab (`main.js:220`), so pane copy would
   never render. Each `???` button gets a one-sentence unlock condition
   that names the milestone and NOTHING about the content behind it —
   `Unlocks at 100 Combat Power.`, not `Unlocks the Cache tree at 100
   Combat Power.` (the plan's own edge case).

7. **Flavor is kept, and quarantined.** Three flavor strings survive
   because they cost no clarity and sit on lines that teach nothing:
   `The door stands open.` (Boss, broken state), `— the anti-cheat
   notices the farm` (Ban Wave header), `There's no wiki and nobody to
   ask.` (Dungeon journal). One flavor string is CUT because it sat on
   the teaching line: `— overwhelming` on the time-to-breach readout
   (`main.js:99`). The absurd number carries the gag on its own.

8. **The help modal is re-scoped, not deleted.** Its current body
   restates the Ban Wave section's facts verbatim — a within-tab
   duplicate under DW-5.2 even though it is on-demand. It keeps only the
   two things the inline section has no room for: the √-timing judgement
   call and the bots-borrow-your-power synergy.

9. **No obligation copy, verified.** No string below implies a window, a
   streak, a schedule or a missed opportunity. Ban Wave copy is
   deliberately written as a standing choice (`Bank when the payout is
   worth the reset`), never as something to do now. Checked against the
   `deceptive-patterns` urgency ban-list by inspection, though that
   doctrine is not loaded this phase.

10. **Register guard.** No string uses glitch, corruption, decay or
    failure voice. The shell register (`maintenance@dead-server:~$`,
    `PLAYERS ONLINE: 1`) stays exactly where DESIGN.md put it — the log
    header and the W10 dialogue — and is not extended.

## Recommendation

**BUILD.**

All four DW items are COVERED with named evidence, both gates pass, and
no requirement needs a locked value changed. The eight source-truth
defects (A1–A8) are fixed inside the copy rather than escalated, because
each is a wrong STRING, which is exactly this phase's `Produces:`. They
are recorded above so the code-integration pass after Phase 6 applies
them knowingly rather than treating them as new.
</content>
</invoke>
