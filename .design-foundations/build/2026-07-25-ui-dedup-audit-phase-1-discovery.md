# Discovery + Design: Phase 1 - Journey, IA + fact ownership

## Artifacts Found / Current State

- `internal/JOURNEY.md` — does not exist. Confirmed (`ls` exit 2).
- `internal/DESIGN.md` / root `DESIGN.md` — does not exist. Confirmed. Phase 3 produces it; not a Phase-1 prerequisite.
- `internal/UI-AUDIT.md` — exists, measured 2026-07-25 at 375px via `npm run shots`. Read first per plan constraint; used as the seed for DW-1.4 and the state column (DW-1.5) rather than re-derived.
- `internal/REMAKE-DESIGN.md` — the design constitution. Read for the one-line DPS/Combat Power formula (§3b), the enhance heartbeat (§5), the system inventory (§6), the lexicon (§16), and the post-mortem framing used as the JTBD "push" force (no real user interviews exist for this solo-dev project — the constitution's post-mortem of the prior build is the closest thing to grounded research).
- Live source read in full: `index.html`, `main.js` (1034 lines — carries nearly all render logic for every tab), `stats.js`, `crits.js`, `battle.js` (canvas), `bosses.js`, `gear.js`, `armory.js`, `trophies.js`, `dungeon.js`, `affixes.js`, `rarity.js`, `enhance.js`, `bots.js`, `farm.js`, `instance.js`, `rebirth.js`, `pull.js`. This is every module that either renders a fact or supplies a formula term feeding the Combat Power product — the inventory in `## Fact ownership` is traced to this reading, not assumed.

## Gaps

- No document previously assigned a single owning surface to any fact. Combat Power alone renders in 3 places (resource-bar chip, Player tab chip group, Boss tab record line) — the audit only flagged 2 of these; the fact-ownership pass below adds the third.
- No JTBD, journey map, or IA existed for this project at any altitude.
- The tab unlock ladder existed only as code (`TAB_FEATURE`, `checkUnlocks()` in `main.js`) — never written down as an IA artifact.

## Gate Status

- DESIGN.md: absent — expected; Phase 3 produces it. Not required to start Phase 1 (journey/IA doctrine does not depend on visual tokens).
- JOURNEY.md: absent — this phase produces it.
- Prerequisites: none. Phase 1 is the first phase of the plan; nothing upstream to block on.

## DW Verification

| DW-ID | Done-When Item | Status | Evidence |
|-------|---------------|--------|----------|
| DW-1.1 | JOURNEY.md exists with `## Job`, `## Journey`, `## IA` populated; JTBD school named, not mixed | COVERED | `internal/JOURNEY.md` produced below with all three sections; JTBD school = Moesta Switch interview (four forces), named once in `## Job` and not mixed with Christensen/Ulwick/Klement vocabulary |
| DW-1.2 | `## Fact ownership` lists every fact across all six tabs, one owner each; Combat Power resolved | COVERED | Full inventory traced to `main.js` + `index.html` + the 8 system modules read above, organized as one table per tab plus a Global Chrome table; Combat Power's 3 render sites (resbar / Player / Boss) resolved to a single owner (Player tab) with the other two named as pointers |
| DW-1.3 | Every guideline-5 term in the Combat Power product appears in the ownership table | COVERED | `stats.js` `derive()` read line-by-line; all 9 multiplicative/additive terms (trainedATK, gearAtk, gear atkPct, trophy atkPct, scriptMult, trophy dmgMult, delve overclock, critFactor, armory atkPct — plus the parallel speed-lane terms) traced to their current display location(s) in the Player-tab table, cross-referenced from Boss/Training/Delve where they're set or referenced |
| DW-1.4 | Every duplication listed with locations, seeded from UI-AUDIT.md, extended where silent | COVERED | UI-AUDIT's G6 (Combat Power), Boss 100.0%×2, Training back-reference chain, Grind LOCKED-break repetition, Dungeon 3-statement problem all carried forward; extended with 2 duplications the audit didn't enumerate (Combat Power's 3rd render site; the Dungeon ability-effect sentence duplicated verbatim between the assign row and the journal row, confirmed by diffing the two template strings in `main.js`) |
| DW-1.5 | Every row/cell has a declared state: live / dormant / locked | COVERED | State column present on every table row; grouped/repeated rows (zones, armory cells, trophy pips, training tiers) carry the audit's counted split (e.g. "10/15 locked, rest live/dormant by allocation") rather than 136 individual rows, consistent with how UI-AUDIT.md itself counted |

**All items COVERED:** YES

## Design Decisions

- **JTBD school: Moesta Switch interview (four forces)** — chosen because it's "the most immediately actionable for a product team" per `journey.md` §Rules, and because this project already has a natural "old solution" to switch from: the prior build (Enhancement Slave Idle), whose post-mortem is written into `REMAKE-DESIGN.md`'s opening paragraph. Using Moesta lets the push/pull/anxiety/habit forces cite that post-mortem directly instead of inventing an ungrounded persona. Not mixed with Christensen/Ulwick/Klement vocabulary anywhere in the artifact.
- **IA structure: hub-and-spoke with a sequential-unlock overlay**, organization scheme = task (Rosenfeld/Morville ambiguous scheme — each tab groups by what the player is trying to DO: fight, train, farm, build, delve, raid). The plan's constraint says treat unlock order as designed progression, not a bug — so the sitemap encodes the ladder as a real edge (each spoke's open condition), not a flat list of six equal buttons.
- **Decision model: loyalty loop only, framed honestly** — this product has no acquisition funnel or messy middle (single free idle game, no competing options to evaluate). Forcing Google's messy-middle model here would be cargo-cult (journey doctrine explicitly warns against this). The loyalty loop (McKinsey 2009) is cited only for what it actually describes: after the first wall break, sessions skip re-evaluation and route straight back into spend-decisions — that's a real loyalty-loop pattern, not a funnel one.
- **Emotion curve marked UNGROUNDED** — no user interviews exist (this is a solo-dev, single-playtester project). Journey doctrine (Watermark 2023: 83% of CX pros can't make maps drive change) requires flagging this honestly rather than dressing up a guess as research. The curve is grounded instead in `REMAKE-DESIGN.md`'s cited playtest verdicts (e.g. "linear +10% read as a vending machine", "rising per-level costs read as a treadmill") and the deliberate design intent behind W1's humiliation beat — named as such, not silently presented as interview data.
- **Combat Power ownership: Player tab**, not Boss and not the resource bar. Rationale: Combat Power is a *derived build output* — its factors (atk, hits/s, and every term that composes them: gear IP, affixes, trophy pieces, Armory ranks, crit factor, script multiplier) are things the player *changes* on the Player tab. The Boss tab *consumes* CP operationally (it's the drain rate against boss HP) but doesn't let the player act on any of its factors from there. The resource bar is global chrome, not a tab — its chip is documented as the always-visible headline echo of the Player-owned number, which is legitimate chrome behavior (a persistent summary, not a second content copy) rather than a violation, but it's still named explicitly so Phase 2 knows not to let it grow a second breakdown.
- **Tool used, not hand-rolled:** no `palette.mjs` or `prototype` run this phase — Phase 1 produces no visual tokens or renderable mock (that's Phases 3 and 6 respectively). This phase's only artifact is the JOURNEY.md text spec.

## Recommendation

BUILD
