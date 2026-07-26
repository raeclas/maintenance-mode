# JOURNEY.md

<!-- The structural and temporal design spec for Maintenance Mode. Pairs with
internal/DESIGN.md (visual tokens, produced Phase 3 — does not exist yet).
Produced by Phase 1 of .design-foundations/plans/2026-07-25-ui-dedup-audit.md.
Seed evidence: internal/UI-AUDIT.md (measured 375px capture, commit bcf4ecc,
reconciled at 82d2d99). Design constitution: internal/REMAKE-DESIGN.md. -->

## Job

**Job story:** When the MMO I used to play is still technically running —
maintenance mode, nobody home — and every raid wall the game ever built is
still standing with nobody left to open it, I want to climb the whole boss
ladder alone, using whatever automation the dead server lets me build, so I
can find out what's actually behind the last door.

**Functional job:** break each Warden's door in sequence, using build
decisions (gear, enhance, trophies, Armory) and bot automation (training,
zones, dungeons) to raise Combat Power until it clears the current wall's HP.

**Emotional job:** melancholy curiosity settling into quiet, earned triumph —
not a power-fantasy noise game. The target feeling is closer to "the last
person turning the lights on in an empty building and finding it still
works" than "number go up, fireworks."

**Social job:** minimal (single real player, by design — REMAKE-DESIGN.md
§10 "v1 must be fun with a single character, alone, on one ladder"), but the
game diegetically acknowledges the aloneness rather than hiding it: the
`PLAYERS ONLINE` counter, the ghost lobby, the W10 reveal ("PLAYERS ONLINE: 1.
That was always you"). The social job is closer to "I want the game to admit
what I already know" than "I want other players to see me."

**Switch interview (Moesta four forces):** grounded in `REMAKE-DESIGN.md`'s
opening post-mortem of the prior build (Enhancement Slave Idle) — the closest
thing this solo-dev project has to a real "old solution" a switch happened
from.

- **Push:** the old build drowned in breadth — 18 classes, 30 bosses, shallow
  systems, legibility 3/10 (its own post-mortem verdict). Numbers moved but
  players couldn't trace *why*.
- **Pull:** a boss-progression idle where every system feeds exactly one
  visible number (next wall's depth%), every wall has a face and a story
  reason to block you, and math is readable end to end (REMAKE-DESIGN.md §1
  pillars 1–3).
- **Anxiety:** does fewer systems + full legibility cost the old build's one
  genuine win — the Enhance gamble's heartbeat? (Answer already designed in:
  §5, instant resolution, no ceremony, but stakes stay real.)
- **Habit:** the instinct that produced six tabs each re-printing the same
  facts at the same visual weight is the OLD build's habit re-asserting
  itself inside the remake. This plan (all 6 phases) is the corrective; Phase
  1 names the habit precisely so Phases 2–6 can design against it.

**JTBD school used:** Moesta (Switch interview / four forces). Not mixed with
Christensen, Ulwick, or Klement vocabulary anywhere in this document.

---

## Journey

**Actor:** the player — in-fiction, the only remaining player on a dead MMO
server (single character, never reset, per the attachment law).

**Scenario:** log in, watch the current frontier Warden's HP drain against
Combat Power (an idle siege, not a click-to-attempt loop as of the
2026-07-25 rework — see `pull.js`), spend earned resources (copper, scrap,
Cache, bots) on whichever system currently raises Combat Power fastest,
occasionally break a wall and descend to the next door.

**Scope:** current-state, single-actor. No service blueprint needed — there
is exactly one human in this system; every other "actor" (bots, the anti-
cheat, the Wardens) is simulated content, not a second real user.

| Phase | Actions | Mindset | Emotion | Touchpoints | Opportunities |
|---|---|---|---|---|---|
| 1. Arrival | First pull resolves at ~0.004% (starting value, REMAKE-DESIGN.md §3). Everything but Boss is hidden. | "This is a joke — why bother?" | Low (deliberate — "the humiliation IS the tutorial") | Boss tab only | Vess's own `fail_hopeless` dialogue is the diegetic tutorial pointing at botting. No UI nagging needed. |
| 2. Bootstrapping | Training + Grind unlock (`state.unlocked` flips on first tick; Grind opens with Training). First bot swarm, first zone held. | "Oh — there's a whole automation game under this." | Rising (discovery) | Training, Grind | Currently the noisiest phase: 21 dead allocation clusters on locked rows (UI-AUDIT G3) greet a player who just unlocked the tab. Phase 2 must not let discovery excitement collide with a wall of inert controls. |
| 3. Build identity | Player tab unlocks on first drop (`features.grind && everDropped`). Gear, enhance, trophies, Armory become live decisions. | "Now I'm making choices, not just watching a bar." | Engaged, gambler's-heartbeat tension on Enhance | Player | Currently the tab is ~8 phone screens tall with live controls at ~60% scroll depth (UI-AUDIT) — the exact phase where engagement should peak is where the current UI most actively works against it. |
| 4. Depth + risk layers | Delve unlocks at CP≥100; Dungeon at bots.pop≥10. New spend surfaces for the swarm and the character's own passive depth engine. | "There's more to spend my power on, and some of it is a real bet (Dungeon attrition)." | High engagement, real risk tension on Dungeon | Delve, Dungeon | Delve is already "the structural model the others should follow" (UI-AUDIT) — one list, no dormant padding. Dungeon has the worst duplication in the game (three-statement problem). |
| 5. The loop | Ban Wave unlocks after the first wall clear. Player decides whether to reset the disposable bot stratum for a permanent damage multiplier. | "Is the √ payout worth the reset right now?" | Contemplative, strategic (not urgent — never scheduled) | Training (Ban Wave section) | This is the loyalty-loop entry point — see Decision model below. |
| 6. Endgame witness | W10 breaks; the login-screen reveal, `PLAYERS ONLINE: 1`. | Reflective | Peak — the intended emotional high point of the whole climb (peak-end rule, Kahneman) | Boss | Nothing to fix here structurally; the payoff already exists in the dialogue data (`bosses.js` w10.dialogue.break). This plan must not let de-duplication accidentally flatten this moment's weight. |

**Decision model:** loyalty loop (McKinsey 2009), not a funnel and not the
messy middle. There is no acquisition step and no competing product to
evaluate — it's a single already-installed idle game. What the loyalty loop
correctly describes is the REPEAT-SESSION structure from Phase 5 onward:
once the first wall breaks, each subsequent session skips any re-evaluation
of "should I keep doing this" and returns straight to "which spend decision
next" — the defining loyalty-loop behavior (bypass the evaluation stage).
Forcing Google's messy-middle model (built for purchase decisions among
competing brands) onto a single-product idle loop would be cargo-cult
per journey doctrine's own caveat — so it is deliberately not used here.

**Emotion curve:** Low at arrival (by design) → rising through Phases 2–3
(discovery, build identity) → sustained high with real tension through
Phase 4 (Dungeon risk) → periodic small peaks at every wall break → one
large peak at the Phase 6 reveal, landing on the peak-end rule (Kahneman —
users judge the experience by its peak and its ending, not the average, so
the W1 low + W10 high bracketing the whole climb is intentional structure,
not noise). The CURRENT UI works against the curve exactly where it should
be rising: Phase 3 (Player tab, 8 screens) and Phase 2 (Training/Grind,
21 dead controls) are where discovery/engagement should climb and where the
measured density is worst.

**Research basis:** UNGROUNDED as a formal emotion curve — no user
interviews were conducted (solo-dev project, one real player). It is
grounded instead in (a) the measured current-state UI (`internal/UI-AUDIT.md`)
and (b) real playtest verdicts already logged in `REMAKE-DESIGN.md` (e.g.
"linear +10% read as a vending machine," "rising per-level costs read as a
treadmill" — both direct quotes from prior playtesting of this exact
project). Flagged explicitly per journey doctrine (Watermark 2023: an
emotion curve without a named research basis is theater) rather than
presented as if interviews happened.

---

## IA

**Organization scheme:** task (Rosenfeld/Morville ambiguous scheme). Each
tab groups content by what the player is trying to DO — fight, train, farm,
build, delve, raid — not by content type or alphabetically.

**Structure type:** hub-and-spoke, with a sequential-unlock overlay. Once a
spoke is open it's freely selectable (true hub-and-spoke navigation), but
FIRST arrival at each spoke is gated by a strict, designed sequence — per
the plan's constraint, this is IA, not a bug to normalize.

**Sitemap:**

```
Hub (persistent chrome — not a tab; always visible once state.unlocked)
├── resource bar (Combat Power · bots · copper · scripts chips)
├── tab nav (7 buttons, "???" label pre-unlock — Help never locked)
├── activity log ("maintenance@dead-server:~$")
└── footer (export / wipe save)

Spokes (seven tabs — unlock condition in main.js checkUnlocks(), Help
always open — `.design-foundations/plans/2026-07-26-visual-pass-and-help-tab.md`
Phase 2):
├── Boss        [always open — entry point]
│   └── wall selector (local nav, appears once `maxWall>1` — i.e. after the first wall clear)
├── Training     [opens: state.unlocked — first login tick]
│   └── Ban Wave section (sub-panel inside Training, not a separate tab;
│       opens: cleared.length≥1 OR rebirths≥1)
├── Grind        [opens: features.training]
├── Player       [opens: features.grind AND state.everDropped]
├── Delve        [opens: features.player AND Combat Power ≥ 100]
├── Dungeon      [opens: features.delve AND bots.pop ≥ 10]
└── Help         [always open — reference only, no unlock gate; also reachable
                   via the resource bar's `?` button, which now switches to
                   this tab instead of opening `#helpModal` (retired — its one
                   piece of content, the Ban Wave judgement + bot-DPS-fraction
                   paragraph, relocates into Help's Training section, see
                   `## Phase 2: Help tab + copy relocation` below)]
```

One structural note the audit surfaced and this IA carries forward: a
seventh spoke, GM (the meta-currency spend surface), existed until `82d2d99`
retired it along with the ticket economy. A meta-currency redesign is
queued (per the plan's Assumptions) and would now be an EIGHTH spoke — Help
took the seventh slot this phase, additively, per the plan's own explicit
choice of a real tab over a `?`-triggered pane. Not a reason to treat the
seven-tab structure above as final forever, but it is the complete, correct
structure for this plan.

**Global navigation labels:** Boss · Training · Grind · Player · Delve ·
Dungeon · Help. A locked tab's button label is literally `???` (`renderTabs()` in
`main.js`) — a real, intentional state (progressive unlock, not a bug),
carried into DW-1.5's state column below as `locked`. **Help is never
`locked`** — meta/reference content with no gameplay gate, added as the
seventh tab by `.design-foundations/plans/2026-07-26-visual-pass-and-help-tab.md`
Phase 2 (page spec and states in `## Phase 2: Help tab + copy relocation`
below).

**Navigation model:** global nav only (the seven-button tab bar is the
entire navigation system, re-fit from six by Phase 2 of the plan above — see
that section for the grid re-fit and its rendered/measured evidence) plus
one piece of local/contextual nav: the wall selector
inside the Boss tab, which appears once `maxWall>1` (`main.js:738`) — i.e.
from the first wall clear onward — letting them switch which cleared Warden's
Farm status they're viewing. No breadcrumbs, no search (not applicable at this content scale —
Hick's law doesn't demand grouping seven items further; Miller/Cowan's ~4±1
is about working-memory load, not on-screen item count, per the doctrine's
own citation, restated here at the new count — seven visible tab buttons is
not a violation).

**Validation:** NOT VALIDATED by card sort or tree test (no second user to
sort cards with). The unlock ORDER is validated by design intent instead
(REMAKE-DESIGN.md's progressive-unlock-arc reasoning, §7 and the milestone
table in `main.js checkUnlocks()`), which this IA treats as authoritative
per the plan's explicit constraint — but the tab LABELS themselves have had
no independent validation. Flagged honestly rather than silently assumed.

---

## Fact ownership

Every fact currently rendered by the live game, traced to `index.html` +
`main.js` + the system modules (`stats.js`, `crits.js`, `battle.js`,
`bosses.js`, `gear.js`, `armory.js`, `trophies.js`, `dungeon.js`,
`affixes.js`, `rarity.js`, `enhance.js`, `bots.js`, `farm.js`, `instance.js`,
`rebirth.js`, `pull.js`). Grouped rows (zones, armory cells, training tiers,
trophy pips) are one ownership row each, annotated with their instance count
and state split — the same counting convention `internal/UI-AUDIT.md` used,
so DW-1.5's ~136-dormant-item finding stays traceable.

**State legend:** `live` = active and currently meaningful · `dormant` =
unlocked but idle/zero/unused right now · `locked` = the owning tab/feature
itself is not yet unlocked.

### Global chrome (not a tab — persistent, always visible once `state.unlocked`)

Chrome is allowed to echo an owned fact's headline value as a persistent
summary; that is NOT a second content copy, but every echo below is named
explicitly so Phase 2 doesn't let it grow its own breakdown.

| Fact | Owned by | State | Rendered at | Notes |
|---|---|---|---|---|
| Combat Power headline + rate | **Player tab** (see below) | live | resbar chip `#cpEl`/`#cpRate` | POINTER — chrome echo of the Player-owned CP total, not a second breakdown. Sampled over a ~1s window for the rate. |
| Free bots / capacity + creation rate | **Training tab** | live | resbar chip `#resBots`/`#resRate` | POINTER — echo of Training's population stat. |
| Copper total + rate | **Grind tab** (copper is earned there) | live | resbar chip `#copperEl`/`#copperRate` | POINTER — rate is computed live across all held zones. |
| Scripts + damage multiplier | **Training tab** (Ban Wave section) | dormant until 1st rebirth, then live | resbar chip `#scriptsEl`/`#scriptMultEl` (hidden until `scripts>0 or rebirths>0`) | POINTER — echo of `scriptMult()`, the guideline-5 term also folded into the Boss-tab drain. |
| Tab nav labels (7) | — (nav is the IA itself) | 2 live (Boss, Help) + up to 5 `locked` at game start, unlocking per ladder | `#tabs` | `locked` renders literally as `???`. **Help added Phase 2 (visual-pass-and-help-tab plan) — never `locked`.** |
| Activity log | — (event history, not live state) | live (rolling, capped 40 lines) | `#log` | Out of scope for fact-ownership dedup by design: the log's job IS to echo past events after the fact; it is not a second simultaneous render of current state. |
| `#helpBtn` (`?`) | — (nav shortcut, not content) | live | resource bar | **Retargeted Phase 2**: switches to the Help tab. Previously opened `#helpModal` (Ban Wave topic only) — that modal is retired; its content is now owned by Help's Training section, see `## Phase 2: Help tab + copy relocation`. |
| Footer (export/wipe) | — (dev/meta utility) | live | `#logHead`/footer | Not a game fact. |

### Boss tab (`battleSec`)

| Fact | State | Rendered at | Guideline-5 term? | Duplication |
|---|---|---|---|---|
| Boss name + title | live | `#bossName`/`#bossTitle` | no | — |
| Wall selector (per cleared wall) | live once `maxWall>1`, else absent | `#wallSelect` buttons | no | — |
| Canvas arena: boss HP bar (visual) + `%` label | live | `<canvas id="battle">` (canvas-only) | no | **DUP 1** — the canvas draws its own `%` label on the health bar (`battle.js drawBars`), and the DOM `#depth` span right below it draws the SAME `%` again, ~40px apart. Both compute `remain = state.boss.hp/boss.hp`. Confirmed identical value, two renders. |
| Canvas: damage-number floaters (`*`/`**` crit tiers), hero sprite, boss sprite w/ progressive cracks, BREACHED reveal | live during fighting | canvas-only | no | Canvas-only fact, flagged per plan's edge-case rule — cannot be styled by CSS, reviewable only via `npm run shots`. |
| Depth / remaining % (DOM) | live | `#depth` | no | See DUP 1 above — this IS the duplicate of the canvas's own label. |
| Time-to-breach text | live (frontier) / N/A (farming) | `#cooldown` | no | — |
| Crit breakdown line (`crit ×F — R%×M, super ×S%`) | live | `#projection` | **yes** — crit rate, crit mult, super-crit rate, super-crit mult (all 4 sub-terms of `critFactor()`) | Also referenced (not duplicated) as `critRate`/`critDmg` gear affixes, owned by Player tab. |
| Record line: `health X/Y · CP Z/s` | live (frontier) / replaced by farm-status text when broken | `#record` | Combat Power is a **pointer**, not owned here | Boss HP here is a numeric restatement of the same `%` shown twice above — a THIRD render of "how much HP is left," this time as raw numbers instead of a percentage. Not an exact literal duplicate (numbers vs percentage) but the same underlying fact rendered a third way in the same tab. |
| Cleared-wall monument list | live once ≥1 wall cleared | `#monument` | no | — |
| Descend button | live only when frontier broken & a next wall exists | `#descendBtn` | no | — |
| Boss dialogue line | live, milestone-only | `#dialogue` | no | — |

### Training tab (`botSec`)

| Fact | State | Rendered at | Guideline-5 term? | Duplication |
|---|---|---|---|---|
| Rig buttons (multiclient/capacity, account creator/generation, script version/power, overclock/speed) + cost | live, afford-gated | `.rig` buttons | no | — |
| Rig stats line: `script ×P · clock ×S · lost to bans N` | live | `#rigStats` | `botPower`/`botSpeed` feed `botDps`, a parallel (non-CP) product | ~~"lost to bans" is permanently 0 and vestigial~~ — **CORRECTED in Phase 5 (defect A5): the counter is LIVE.** `state.bots.banned` is incremented every floor by `instance.js:147`. The original note was right that Grind zones stopped banning (`4d41da7`) but wrong to conclude the figure is dead — the Dungeon feeds it. It is a real Dungeon stat mislabelled on the Training tab, so the fix is a relabel (`lost in the Dungeon {n}`), not a retirement. State: **live**, not dormant. |
| Population bar (`pop/capacity`) | live | `#popFill` | no | Related family to the resbar's `free/capacity`, but a different numerator (pop vs free) — not an exact duplicate. |
| ATK training tiers (×7: swing macro → tick-rate exploit) | 1 live, 6 `locked` at game start (`state.js:51` `bars.atk.unlocked:1` — verified against source, not inferred; unlock count grows with fills) | `#atkTiers` rows | trainedATK — **owned here**, the raw stat the CP product consumes | **DUP** (seeded from UI-AUDIT) — every locked row prints `locked · X/Y fills of {predecessor's name}`, naming the row directly above it, so the list reads as a back-reference chain. |
| ATK trained total (`trained +X ATK (+rate/s)`) | live | `#barAtkInfo` | **yes** — this line IS the trainedATK term's display | Owning render for the term; the CP formula (`derive()`) is a reference consumer, not a duplicate render. |
| SPEED training tiers (×6) | 1 live, 5 `locked` at game start (`state.js:52` `bars.speed.unlocked:1` — verified against source) | `#speedTiers` rows | trainedHits — **owned here** | Same back-reference duplication pattern as ATK tiers. |
| SPEED trained total | live | `#barSpeedInfo` | **yes** — the trainedHits term's display | — |
| Enhance squad (slot picker, target plus, alloc, info line) | live once a squad is assigned, else `dormant` (idle) | `#enhLine`/`#enhSeg`/`#botEnhInfo` | no (drives the enhance system's RNG, not a CP term) | — |
| Ban Wave section (payout preview, button, armed state) | `dormant`/hidden until `features.rebirth`, then live | `#banWaveSection` | scriptMult — **owned here** (see resbar pointer above) | — |

**Reconciliation (DW-1.5):** corrected training-tier counts give **6 locked ATK + 5 locked SPEED = 11 locked**, matching `internal/UI-AUDIT.md`'s own "Training → tiers | 11 of 13 | locked" line exactly (this document's earlier draft said 9, which silently diverged from the audit it's required to seed from). Combined with Trophies (70 dormant), Armory (45 dormant), and Grind zones (10 locked), the full dormant/locked-item total is **70 + 45 + 10 + 11 = 136** — an exact match to the audit's "~136" headline figure, not an approximation left at odds with it.

### Grind tab (`farmSec`)

| Fact | State | Rendered at | Guideline-5 term? | Duplication |
|---|---|---|---|---|
| Zones (×15: name, mob, HP, copper/kill, IP band, alloc, live stat, kill-cycle bar) | 5 live/dormant-by-allocation (region 1, open from start) + 10 `locked` (region 2 needs 1 clear, region 3 needs 4 clears) — matches UI-AUDIT's "10 of 15 locked" | `#zones` rows | Copper (the currency, and its rate) — **owned here**; the copper% multiplier TERMS (gear/trophy/Armory copper affixes) are owned by Player tab, referenced here only as their applied effect on `c/s` | **DUP** (seeded from UI-AUDIT) — `[LOCKED] break W1` appears 5× and `[LOCKED] break W4` 5× (ten rows carrying one of two facts — a group boundary rendered as ten repeats, not ten distinct facts). |
| Zone squad-DPS / saturation readout (`SAT ×N → +M bands`) | live only when a zone is held and over-farmed | inline in the zone's stat cell | Overkill Saturation term (`farm.js saturation`/`lootBias`) — **owned here** | — |

### Player tab (`gearSec`) — the Combat Power owner

| Fact | State | Rendered at | Guideline-5 term? | Duplication |
|---|---|---|---|---|
| **Combat Power total + atk + hits/s** | live | `#powerBreakdown` chip group | **THE canonical CP breakdown — owner of the whole product** | Referenced (pointer, not copy) at the resbar chip and the Boss-tab record line — see Global chrome and Boss tab tables above. Resolves DW-1.2's named conflict. |
| Titles earned | `dormant`/hidden until ≥1 title | `#titles` | no | — |
| Gear slots ×3 (weapon/armor/charm): name, rarity, IP, plus, item ATK contribution | live once a slot is filled, else `—` placeholder (dormant/empty) | `#slots` | gearAtk term (`contribution(item) = ip × 1.12^plus`) — **owned here** | — |
| Gear affixes per slot (up to item's rarity-count: atkFlat, atkPct, hits, haste, copper, critRate, critDmg, botsync, echo, bleed, momentum) | live per equipped affix | `.affixList` per slot | **yes — every one is a distinct guideline-5 term** feeding `derive()`'s atk/speed/farm accumulators or `crits.js` | — |
| Safeguard toggle | live | `#safeguard` checkbox | no | — |
| Enhance button + info (cost, chance, fallout) per slot | live | `#se_*`/`#sei_*` | no (enhance zone data, not a CP term) | — |
| Reforge bench (button, cost, candidate preview, keep/reroll/discard) | `dormant` until a candidate is rolled, else live | `.reforgeCand` per slot | no | — |
| Failstacks HUD | `dormant` at 0, live once ≥1 | `#stacksHud` | no (RNG-bank stat, not a CP term) | — |
| Trophy cabinet (10 boss sets × 7 pips) | Set-piece count varies by progress; at game start ALL 70 pips are `dormant` (unearned) | `#trophyCabinet` | trophy atkPct/hastePct/copperPct/dmgMult — **owned here**, per-pip | Matches UI-AUDIT's 70-row count exactly (10 doors × 7 pieces). |
| Trophy set-complete damage multiplier (`×N dmg`) | `dormant` until a full 7-piece set is owned | trophy set header, conditional | trophy `dmgMult` — **owned here** | — |
| Stash: scrap wallet (per-rarity pills) | `dormant`/"no scrap yet" until ≥1 rarity has scrap | `#scrapWallet` | no | — |
| Stash: auto-equip / auto-salvage filters (rarity + IP dials) | live | `#stashHead` | no | — |
| Stash list (up to 24 shown + "N more"): mark, name, rarity color, actions, slot/IP/plus/affixes | `dormant`/"stash empty" until ≥1 item, else live per item | `#stashList` | Affix values repeat the SAME term vocabulary as equipped-slot affixes — not a duplicate fact (different item instances), same term catalog by design | — |
| Armory header (`total rank · entries logged · +atkPct% ATK · +hastePct% haste · +copperPct% copper`) | `dormant` (all zero) until ≥1 drop merges into an entry | `#armorySub` | **yes — this line IS the aggregate armoryMods() term display** | — |
| Armory grid (15 zones × 3 slots = 45 cells: entry name, rank+pct+lane, fill bar) | At game start ALL 45 cells `dormant` (rank 0, "+0.00%") | `#armoryGrid` | Per-cell `entryPct()` feeds the header aggregate above — **owned here**, header is the rollup, not a duplicate | Matches UI-AUDIT's 45-cell count exactly. |

### Delve tab (`dungeonSec`)

| Fact | State | Rendered at | Guideline-5 term? | Duplication |
|---|---|---|---|---|
| Delve state line (`depth · deepest · Cache/s`) | live | `#delveState` | Delve "reach" contributes to `reachDepth()`, referenced by Player-owned CP only indirectly (depth is DPS-derived, not the other way) | — |
| Cache banked | live | `#delveCache` | no (Delve's own currency) | — |
| Cache tree (5 upgrade rows: deeper bore, cache sifter, recovered overclock, salvage beacon, buried scripts) | live, afford-gated per row | `#delveTree` | `overclock` row is a **guideline-5 term** — `delveBonus(state,"overclock")`, a `×(1+0.03×rank)` multiplier folded directly into the Boss-tab-consumed `atk` product | The row shows rank + gain-per-rank (`+3% ATK`), which lets the term be computed, but the CURRENT total multiplier (`1+0.03×rank`) is never spelled out as a single number anywhere — flagged as a minor legibility gap for Phase 2/5, not a duplication. |

### Dungeon tab (`instanceSec`)

| Fact | State | Rendered at | Guideline-5 term? | Duplication |
|---|---|---|---|---|
| Intro paragraph (static, 6 lines) | live (always shown) | `<p class="sub">` above `#instState` | no | UI-AUDIT: fills most of the first screen at 375px before any control appears. |
| Instance state line (running: floor/haul/damage%/bank-at · idle: difficulty/live-ability-count/bots-needed/deepest) | live | `#instState` | no | Restates `bankAt` while running — see the `#instBank` row below for that duplication. |
| Instance projection line (running: bots alive + ban rate · idle: projected floor) | live | `#instProject` | no | — |
| Duty rows ×3 (Sunder / Mass Dispel / Summon Adds): label + effect sentence, needed-bots readout, alloc control, assigned/needed stat | Gated by `dutyUnlocked` = `state.bots.powerRank >= m.gate` (`instance.js:37`); `powerRank:0` initially (`state.js:37`, verified). Sunder (`gate:0`) is live from the moment the Dungeon tab opens; Mass Dispel (`gate:3`) and Summon Adds (`gate:5`) stay `locked` until that many script-version ranks are bought — independent of when the tab itself unlocks. So: **1 live + 2 locked at minimum**, more open as `powerRank` climbs. | `#instDuties` rows | Mechanic `pen` (damage penalty %) is a displayed term, not a CP-product term (it's an Instance-local penalty on the instance's own `mult`, not `derive()`) | **DUP (seeded from UI-AUDIT, finding #3):** "needs N bots" appears once in the alloc-row gain column (`#idg_*`) AND again inside the stat column (`#ids_*`, "N assigned, N needed — blocked/NOT BLOCKED") — same number, two positions, per row, ×3 rows. |
| Difficulty (state-line number, input field, general helper text) | live | `#instState`, `#instKey`, `#instKeyInfo` | no | **DUP (seeded from UI-AUDIT, finding #4):** difficulty renders 3×: the idle state line spells the number, the input restates it, the helper text explains the concept generally (not the number itself, but the same fact rendered three ways in one screen). |
| Pull-out-at-floor setting (`bankAt`, "Pull out at floor") | live | `#instBank` input — value synced every render (`main.js:963`), written on change (`main.js:509-511`) | no | **DUP (not in UI-AUDIT — found in this pass):** while a run is active (`i.running`), `#instState` restates the same value inline — `"...pulling out at floor ${i.bankAt}"` (`main.js:968`). Same input-vs-readout shape as Difficulty above; not fixed by this phase, recorded so Phase 2 addresses both restatements together. |
| Proxy toggle (cost + effect) | live | `#instProxy` | no | — |
| Send/Pull-out buttons | live, state-gated | `#instStart`/`#instBankNow` | no | — |
| Boss abilities journal ×3 rows (unseen: "Unknown — you haven't run into this one yet" · seen: effect sentence + solved state) | `dormant`/all-unseen at game start (matches UI-AUDIT: "three identical rows of Unknown") | `#instJournal` | no | **DUP (seeded from UI-AUDIT, finding #2, confirmed by reading the two template strings in `main.js`):** once a mechanic is seen, the journal row (`#ijn_*`) prints "Assign {duty} bots to block it. Unblocked it costs you {pen}% damage" — near-verbatim the SAME sentence already shown in the duty row's sub-text (`Blocked by {duty} bots. Not blocked = −{pen}% damage`) the instant the tab opens, before the mechanic is even encountered. |

---

## Combat Power product — every guideline-5 term traced (DW-1.3)

Source: `stats.js derive()`. `CP = atk × hitsPerSec`.

| Term | Formula role | Currently displayed at |
|---|---|---|
| `BASE_ATK` (10) | additive constant inside atk | not separately broken out — fixed constant, no player lever, folded into the atk total shown on Player tab |
| `trainedATK` | additive inside atk | Training tab `#barAtkInfo` |
| `gearAtk` (Σ `ip × 1.12^plus` per slot) | additive inside atk | Player tab, per-slot item meta |
| gear `atkPct`/`atkFlat` affixes | multiplicative / additive inside atk | Player tab, per-slot affix list |
| trophy `atkPct` | multiplicative inside atk | Player tab, Trophy cabinet pips |
| `scriptMult` | multiplicative on atk | resbar scripts chip (pointer — Training/Ban Wave owns it) |
| trophy `dmgMult` (SET_BONUS) | multiplicative on atk | Player tab, Trophy set header (conditional on completion) |
| `delveBonus(overclock)` | multiplicative on atk | Delve tab, Cache tree row (rank + rate, not pre-multiplied — flagged gap above) |
| `critFactor(cs)` | multiplicative on atk | Boss tab `#projection` line |
| `BASE_HPS` (2.0) | additive constant inside hitsPerSec | not separately broken out, same as BASE_ATK |
| `trainedHits` | additive inside hitsPerSec (soft-capped by `speedKnee`) | Training tab `#barSpeedInfo` |
| gear `hits`/`haste` affixes | additive / multiplicative inside hitsPerSec | Player tab, per-slot affix list |
| trophy `hastePct` | multiplicative inside hitsPerSec | Player tab, Trophy cabinet pips |
| armory `atkPct`/`hastePct`/`copperPct` | multiplicative inside atk/hitsPerSec/copperMult | Player tab, Armory header (aggregate) + per-cell (`entryPct`) |
| gear/trophy/armory `copperPct` (feeds `copperMult`, not CP itself) | multiplier applied in `bots.js` zone-copper tick | components displayed on Player tab; the APPLIED multiplier is never spelled out on Grind (only the resulting `c/s` total shows) — flagged as a legibility gap for Phase 2/5, not a duplication |

Every term has at least one displayed home. No term is currently hidden —
Phase 1's job (proving nothing gets silently cut by later de-duplication
passes) is satisfied. The two flagged gaps (Delve overclock's un-multiplied
rank display; Grind's un-broken-out copper multiplier) are legibility
improvements for later phases, not ownership violations — noted here so
Phase 2/5 inherit them rather than rediscover them.

---

## Page specs

Produced by Phase 2 of `.design-foundations/plans/2026-07-25-ui-dedup-audit.md`.
Doctrine: `journey` (page-spec altitude, phone-first ordering), `usability`
(Fitts/Hick citations for placement decisions), `surface` (device-class block
order — loaded here for ORDER only, per the plan's override note; no pixel
values below, those are Phases 3/4/6).

**Scope discipline for this section:** every content block below names the
exact `## Fact ownership` row it traces to (tab + row text). A block marked
**POINTER** displays a fact owned by another tab (per Phase 1) and is not a
second copy — this mirrors the Global-chrome table's own POINTER convention.
No token values, no copy wording, no component pixel spec appear here —
those are Phases 3, 5, and 4/6 respectively. Two specs (Player, Dungeon)
reorder blocks versus the current DOM order; the rationale is in this
build's Design Decisions, not repeated per-spec.

Navigation shared by all six: global tab bar only (`## IA` — hub-and-spoke,
no breadcrumbs). Every tab's **entry point** is a tap on its nav button
(always available once unlocked); the moment a tab first unlocks, the
activity log also announces it (`UNLOCK_MSG`, `main.js`), which is the
actual discovery trigger per `## Journey` Phase 2 (Bootstrapping) — named
once here, not repeated per spec unless a tab needs a second entry path.
Every tab's **exit** is a tap to a different nav button — hub-and-spoke has
no forced "next page"; where a tab has an internal state transition instead
(Boss's Descend, Dungeon's run→idle), it is named as such, not as an exit.

### Boss

**Purpose:** Show the siege against the current Warden (or the farm status
of a cleared one) and let the player descend once it breaks.

**Entry points:** Default active tab on load (always open — `## IA`
sitemap, "always open — entry point"); also the only visible surface during
Arrival (`## Journey` Phase 1) before `state.unlocked` flips and the rest of
the chrome (resbar, tab nav) reveals — so for the very first pull, Boss IS
the entire app, not one tab among six.

**Primary decision:** Which wall to watch, and whether to descend once the
frontier is broken. Mostly observational (idle siege, not click-to-attempt)
with two real actions: switch to a cleared wall, or descend.

**Placement argument (375px):** both actions are nav-adjacent, not readout-
adjacent, so they sit in the top block group with the boss identity — above
the arena, which is the tallest element on the tab and would otherwise push
them off-screen. Descend is the higher-value and rarer action (once per wall)
and takes the larger target; the wall selector is a horizontal scroller in
its own container so an eventual ten walls cannot widen the page (Fitts's
law, 1954 — target size scaled to action value; the audit measured this tab
at 414px content on a 375px viewport, so anything that grows with progression
must scroll inside itself).

**Content blocks (in order):**
1. Boss identity — name + title. *Owns: Boss tab, "Boss name + title."*
2. Wall selector — local nav, appears once a wall has been cleared. *Owns:
   Boss tab, "Wall selector (per cleared wall)."*
3. Arena (canvas-only, cannot be styled by CSS) — must convey four things:
   the boss HP bar draining as a proportion, the hero/boss sprites with the
   boss's progressive damage cracks, streaming crit-tier damage numbers
   (`*`/`**`), and the BREACHED reveal at the moment the wall falls. *Owns:
   Boss tab, "Canvas arena: boss HP bar..." and "Canvas: damage-number
   floaters...".* No HTML structure specified — canvas-drawn, reviewable only
   via `npm run shots`. The BREACHED reveal is the journey's per-wall peak
   (see the emotion curve above) — de-duplication must not flatten it.
4. Siege readout — remaining %/BREACHED state, time-to-breach or farm
   status, the crit-factor breakdown line. *Owns: Boss tab, "Depth /
   remaining % (DOM)," "Time-to-breach text," "Crit breakdown line."* The
   Record line's HP figures are the SAME owning row but flagged by Phase 1
   as `DUP 1` against block 3's canvas label — carried forward unresolved
   (component-ownership call, Phase 4), not fixed by this reorder. The
   Record line's Combat Power figure is a **POINTER** to the Player-owned
   Combat Power total, not a second breakdown.
5. Progress — cleared-wall monument list, Descend button. *Owns: Boss tab,
   "Cleared-wall monument list," "Descend button."*
6. Story — boss dialogue line, milestone-triggered. *Owns: Boss tab, "Boss
   dialogue line."*

**States:**
- `locked`: N/A — Boss is always open, the one tab with no unlock gate.
- `empty`/pre-reveal: before `state.unlocked` flips (the Arrival phase),
  blocks 5 (monument/descend, both empty/hidden) and 6 read as absent; only
  1/3/4 render, and the surrounding chrome (resbar, tab nav) is itself
  hidden — this is a real, distinct first-contact state, not a bug.
  Wall selector (block 2) is absent until `maxWall > 1`.
- `active` (frontier, unbroken): full readout, no descend button.
- `active` (frontier, broken): depth reads "BREACHED," farm-status text
  replaces time-to-breach, descend button appears if a next wall exists.
- `active` (farming a cleared wall via wall selector): same as broken-farm
  above, for the selected wall instead of the frontier.
- `in-progress`: N/A — Boss has no discrete run mode; the siege is
  continuous, not started/stopped by the player.
- `error`: N/A — no player input on this tab; corrupted-save recovery
  happens once, globally, before any tab renders.

**Primary action:** Descend to the next door (when broken and a next wall
exists); otherwise switch which wall is displayed via the wall selector.

**Exit:** Tab switch (typically to Training/Grind/Player/Delve/Dungeon to
keep raising Combat Power). Descend is an internal state transition (new
Warden loads into the same tab), not an exit.

**Microcopy (Phase 5):**

*Explained-once register (DW-5.2) — one owner per mechanic on this tab:*

| Mechanic taught here | The ONE element that explains it | Elements that carry the value but do NOT re-explain |
|---|---|---|
| The siege (HP drains at Combat Power, no input) | `#cooldown` time-to-breach line | canvas bar, `#depth`, `#record` — all render the value, none explain the loop |
| Crits (rate → tier → expected multiplier) | `#projection` | canvas `*` / `**` floaters (visual instance of the same roll) |
| Farm status (what a broken door pays, and how often) | `#cooldown`, broken state | `#record` broken state carries flavor only; the SET side is explained on Player |
| What a Trophy set does | **not taught here — POINTER** to Player | `#cooldown` names the count `{n}/7` only |

| Block / state | Element | Final copy | Number source |
|---|---|---|---|
| 1 Boss identity | `#bossName` | `{boss.name}` — e.g. `Vess` | `bosses.js:8` — story canon, unchanged (attachment law 8) |
| 1 Boss identity | `#bossTitle` | `{boss.title}` — e.g. `Warden of the First Door` | `bosses.js:9` — unchanged |
| 2 Wall selector | group label (NEW — has none today) | `Doors you've opened` | — |
| 2 Wall selector | cleared-wall buttons (the `⚑` today) / frontier button | cleared: `W{n} {name} · cleared` · frontier: `W{n} {name} · fighting` | `main.js:748` — today the `⚑` glyph marks **cleared** walls (`w < state.maxWall`) and the frontier button carries no marker at all. Both get a word: the glyph is unexplained, and the frontier's unmarked state is unreadable as a state. |
| 2 Wall selector | cleared button | `W{n} {name} · farming` | as above |
| 3 Arena (canvas) | HP bar label | `{pct}%` — bare, no words | `battle.js:139`. Phase 1 `DUP 1` against `#depth` is a component-ownership call carried to Phase 4/6 — NOT resolved by copy |
| 3 Arena (canvas) | broken bar label | `BREACHED` | `battle.js:135` — unchanged |
| 3 Arena (canvas) | break reveal + subtitle | `BREACHED` / `THE DOOR OPENS` | `battle.js:68` — unchanged; the journey's per-wall peak, deliberately not flattened |
| 3 Arena (canvas) | damage floaters | `{dmg}`, `{dmg}*`, `{dmg}**` | `battle.js:44` — unchanged; `*`/`**` are decoded by block 4's crit line |
| 4 Siege readout | `#depth`, fighting | `{pct}%` | `main.js:725` |
| 4 Siege readout | `#depth`, broken | `BREACHED` | `main.js:718` |
| 4 Siege readout | `#cooldown`, fighting | `At this rate the door breaks in {ttk}.` | `pull.js:34` `timeToKill = hp / combatPower`. **`— overwhelming` is CUT** (`main.js:99`): flavor on the teaching line; the absurd number carries the gag alone |
| 4 Siege readout | `#cooldown`, broken, boss has a set | `Set pieces {n} of 7 — on the Player tab.` | `trophies.js:14-22` `PARTS.length = 7`. POINTER to the Player-owned set bonus. **Shortened 2026-07-26 on user instruction**: the roll interval (`pull.js:49` `FARM_INTERVAL = 30`) and drop chance (`trophies.js:24` `FARM_DROP_CHANCE = 0.25`) are the MECHANIC and move to the Help tab in Phase 2; `{n} of 7` is STATE and stays. This block was the clearest instance of the Phase 5 brief's over-application — a tutorial living in a HUD. |
| 4 Siege readout | `#cooldown`, broken, no set | `The door is open. Nothing left to farm here.` | `trophies.js:26` `bossHasSet` |
| 4 Siege readout | `#projection` | A stat GRID, not a sentence: `Crit / {rate}% / ×{critMult}` · `Super crit / {superRate}% / ×{superMult}` · `Average / ×{factor}` | `crits.js:30-32` `critFactor`; `crits.js:10` `BASE = {rate 0.10, superRate 0.20, critMult 2, superMult 5}`. **Surfaces `superRate`, which had no displayed home anywhere** (defect A6). **Reformatted 2026-07-26 on user instruction** — these are four fixed terms read as a table, so prose was the wrong container: a sentence forces the reader to parse "20% of those" to learn super-crit is conditional, where aligned columns show it. `Average ×{factor}` is kept as the product row because it is the term that actually multiplies damage (guideline 5); the prose that explained the mechanic moves to the Help tab in Phase 2. |
| 4 Siege readout | `#record`, fighting | `{hp} of {maxHp} health left · Combat Power {cp}/s — full breakdown on the Player tab` | `main.js:727`; `stats.js:52-55`. POINTER, not a second breakdown (resolves DW-1.2) |
| 4 Siege readout | `#record`, broken | `The door stands open.` | flavor, permitted — teaches nothing, sits beside a line that does |
| 5 Progress | `#monument` | `Doors you've broken: {list}` | `main.js:736` |
| 5 Progress | `#monument`, final wall | `Doors you've broken: … · W10 The Last Warden — final` | `main.js:734` |
| 5 Progress | `#descendBtn` | `Descend to the next door →` | `index.html:76` — already labels the outcome, unchanged |
| 6 Story | `#dialogue` | `{boss.name}: "{line}"` | `main.js:36`; lines from `bosses.js` `dialogue.{greet,fail_hopeless,fail_near,break}` — story canon, unchanged |
| state `empty`/pre-reveal | — | No new strings. `state.unlocked` flips on the first tick (`main.js:627`), so this state lasts one frame; it renders the `greet` line plus `—` placeholders. Named honestly rather than given copy no player can read. | `main.js:627`, `index.html:66` |
| state `locked` | — | N/A — Boss is the one tab with no unlock gate | `main.js:206` `TAB_FEATURE` has no `battleSec` key |
| state `active` (frontier, unbroken) | — | blocks 1/2/3/4 above, `#descendBtn` hidden | `main.js:732` |
| state `active` (frontier, broken) | — | broken strings above + `#descendBtn` shown | `main.js:732` |
| state `active` (farming a cleared wall) | — | same broken strings, for the selected wall | `main.js:60` |
| state `in-progress` | — | N/A — the siege is continuous, never started or stopped by the player | `pull.js:22` |
| state `error` | — | N/A — no player input on this tab. Corrupt-save recovery happens once, globally, before any tab renders | `saveSystem.js` |

### Training

**Purpose:** Spend copper on the bot rig and ATK/SPEED scripts that grow
the swarm and its raw stats; manage the enhance squad; eventually cash in
Ban Wave.

**Entry points:** Tab nav, once `state.unlocked` (first login tick) opens
the tab — the `UNLOCK_MSG.training` log line ("the old bot farms...") is the
discovery trigger per `## Journey` Phase 2.

**Primary decision:** Which of the four rig levers (capacity, account
creator, script version, overclock) to buy next, and which ATK/SPEED tier
to keep filling.

**Content blocks (in order):**
1. Rig — buy buttons (×4) + cost, rig stats line, population bar. *Owns:
   Training tab, "Rig buttons...", "Rig stats line...", "Population bar."*
2. ATK scripts — trained-total line + tier rowlist (×7). *Owns: Training
   tab, "ATK trained total," "ATK training tiers (×7...)."*
3. SPEED scripts — trained-total line + tier rowlist (×6). *Owns: Training
   tab, "SPEED trained total," "SPEED training tiers (×6)."*
4. Enhance squad — slot picker, target-plus input, allocation, info line.
   *Owns: Training tab, "Enhance squad (slot picker...)."*
5. Ban Wave — payout preview, button, armed state. *Owns: Training tab, "Ban
   Wave section..."* Last, since it is hidden entirely until
   `features.rebirth`.

No reorder from current DOM order — the primary decision (block 1) is
already first; only states below are new to this phase.

**States:**
- `locked`: whole tab, before `state.unlocked` — nav button renders `???`.
- `empty`/dormant: 6 of 7 ATK tiers and 5 of 6 SPEED tiers are `locked`
  sub-rows at game start (per Phase 1's reconciliation, 11 total); Enhance
  squad is dormant/idle until a squad is assigned; Ban Wave section is
  hidden until `features.rebirth`; the rig stats line's "lost to bans"
  figure is ~~permanently 0 (vestigial)~~ **live and rising — corrected in
  Phase 5 (defect A5), `instance.js:147` increments it every Dungeon floor.
  It is relabelled `lost in the Dungeon {n}`, not retired.**
- `active`: rig affordable-highlighted, at least one tier live, squad
  assigned.
- `in-progress`: N/A — Training has no discrete run; scripts/rig apply
  continuously, no started/stopped mode.
- `error`: N/A — no destructive or validating input on this tab (Ban Wave's
  confirm step is a two-tap arm/confirm, not an error path).

**Primary action:** Buy the next affordable rig lever or training fill.

**Exit:** Tab switch (typically to Grind to deploy the swarm just grown, or
Player once a squad starts dropping gear).

**Microcopy (Phase 5):**

*Explained-once register (DW-5.2) — one owner per mechanic on this tab:*

| Mechanic taught here | The ONE element that explains it | Elements that carry the value but do NOT re-explain |
|---|---|---|
| What a rig lever buys | each rig button's own label (one line, one lever) | `#rigStats` prints the resulting multipliers only |
| How a training script works (fill → gain → 50/s cap → unlock rule) | the `ATK scripts` `h3` sub | all 13 tier rows — they print counts and rates only. **The unlock rule moving here is what lets locked rows stop naming their predecessor** |
| Speed's soft cap | the `SPEED scripts` `h3` sub | `#barSpeedInfo` prints the raw trained figure only |
| What the enhance squad does | the `Enhance squad` `h3` sub | `#botEnhInfo` prints interval + cost, or a state |
| Ban Wave: what resets, what survives, what you get | `#banWaveInfo`, idle state | the button is a verb; the armed state is a confirmation, not a second explanation |
| When to Ban Wave (the √ judgement) | the help modal — the only fact the inline section does not carry | `#banWaveInfo` does not restate it |
| Enhance odds / cost / fallout | **not taught here — POINTER** to Player | `#botEnhInfo` names the copper-per-try only |

| Block / state | Element | Final copy | Number source |
|---|---|---|---|
| 1 Rig | `h3` | `Rig` | unchanged |
| 1 Rig | `#buyCap` | `multiclient · {cap} → {nextCap} bot slots · {cost}c` | `bots.js:65-67` `capacity = round(40 × 1.2^rank)` (rank 0 → 40, rank 1 → 48); `bots.js:80` `capCost = round(800 × 1.65^rank)`. **Replaces `multiclient +4`, which was wrong** — the live function is multiplicative and step 1 is +8 (defect A1, `main.js:766`) |
| 1 Rig | `#buyCreate` | `account creator · {rate} → {nextRate} bots per hour · {cost}c` | `bots.js:14,19,68` `createRate = 60 × (1 + 0.5×rank)` (60 → 90); `bots.js:81` `createCost = round(500 × 1.7^rank)` |
| 1 Rig | `#buyPower` | `script version · bot strength ×{p} → ×{nextP} · {cost}c` | `bots.js:17,61` `botPower = 1 + 0.25×rank`; `bots.js:82` `powerCost = round(200 × 1.6^rank)`. Also the Dungeon duty gate — the pointer lives on the Dungeon side, not repeated here |
| 1 Rig | `#buySpeed` | `overclock · bot speed ×{s} → ×{nextS} · {cost}c` | `bots.js:18,62` `botSpeed = 1 + 0.20×rank`; `bots.js:83` `speedCost = round(300 × 1.7^rank)` |
| 1 Rig | `#rigStats` | `bot strength ×{p} · bot speed ×{s} · lost in the Dungeon {n}` | `main.js:771-772`. **Relabelled, not retired**: `state.bots.banned` is incremented live by `instance.js:147`, so the counter is a real Dungeon stat mislabelled on this tab, not a vestigial zero (defect A5 — corrects this document's own Fact-ownership note) |
| 1 Rig | `#rigStats`, over-allocated (error) | `… · over-assigned by {n}% — you've put more bots on jobs than you own, so every job runs at {100−n}% until you free some or the swarm grows` | `bots.js:124-127` `effScale = pop / allocTotal` when over. **State D2: had no explanation at all** (`main.js:770` printed a bare `· short {n}%`) |
| 1 Rig | `#popFill` caption (NEW) | `{pop} of {cap} slots filled — this bar is every bot you own; the counter at the top of the screen is the ones not assigned to anything.` | `main.js:773` `pop/capacity`; `main.js:699` resbar shows `freeBots/capacity`. Different numerators — the one sentence that keeps the two bars from reading as the same fact |
| 2 ATK scripts | `h3` sub (the tab's teaching line) | `ATK scripts — put bots on a script to run it. Every fill it completes adds its ATK permanently. Any one script tops out at 50 fills per second, and the next script down unlocks once the one above it has enough fills.` | `bots.js:38` `MAX_FILLS_PER_S = 50`; `bots.js:205-214` fill loop and unlock check |
| 2 ATK scripts | `#barAtkInfo` | `+{atk} ATK trained so far · +{rate}/s right now` | `main.js:811` |
| 2 ATK scripts | row name | `{t.name}` — `swing macro` … `tick-rate exploit` | `bots.js:42-50`, §16 botter register — names only |
| 2 ATK scripts | row gain | `+{gain} ATK per fill` | `main.js:321`, `bots.js:42-50` |
| 2 ATK scripts | row stat, `locked` | `locked · {fills} / {needed} fills` | `main.js:797`; `bots.js:35-37` `unlockFills(i) = 10,000 × 3^i`. **The predecessor's name is CUT** — the header owns the rule, so the list stops reading as a chain of back-references (audit B6) |
| 2 ATK scripts | row stat, unmanned | `{fills} fills · no bots on it` | `main.js:801` |
| 2 ATK scripts | row stat, running | `{fills} fills · {rate} fills/s` | `main.js:799` |
| 2 ATK scripts | row stat, at cap | `{fills} fills · at the 50/s cap — more bots here do nothing, move them to another script` | `main.js:790,799`; `bots.js:38`. Replaces the bare `RATE MAX`; names the condition and the way out |
| 3 SPEED scripts | `h3` sub | `SPEED scripts — same as ATK, for hits per second. Past {knee} hits/s on this door the returns shrink: every point still counts, just less. Each deeper Warden raises that number.` | `stats.js:22,25-27` `softHits`, `SPEED_KNEE = 5.0`; `bosses.js` `speedKnee` 5.0 (W1) → 70.0 (W10). **Surfaces a term the UI applied but never displayed** (defect A8). "same as ATK" is the explicit non-repeat of block 2's rule |
| 3 SPEED scripts | `#barSpeedInfo` | `+{hits} hits/s trained so far · +{rate}/s right now` | `main.js:812` |
| 3 SPEED scripts | row gain | `+{gain} hits/s per fill` | `main.js:321`, `bots.js:51-58` |
| 3 SPEED scripts | row stats | identical strings to block 2 | `main.js:797-801` |
| 4 Enhance squad | `h3` sub (NEW) | `Enhance squad — bots that keep pressing enhance on one item for you. Same odds and the same copper cost as doing it yourself; they just never stop. Pick the slot and the plus to stop at. The odds and the fallout are on the Player tab.` | `bots.js:236-249` calls the same `enhance.attempt`; POINTER to the Player-owned odds table |
| 4 Enhance squad | slot picker | `weapon` · `armor` · `charm` | `gear.js:9` |
| 4 Enhance squad | target input label | `stop at +` | `index.html:103`; `enhance.js:10` `MAX_PLUS = 20` bounds it |
| 4 Enhance squad | `#botEnhInfo`, no bots (empty) | `no bots assigned — set a number on the left to start` | `main.js:830` |
| 4 Enhance squad | `#botEnhInfo`, empty slot (error) | `nothing equipped in that slot — equip something on the Player tab first` | `main.js:831`. POINTER + way out |
| 4 Enhance squad | `#botEnhInfo`, target reached | `stopped at +{plus} — raise the target to keep going` | `main.js:832` |
| 4 Enhance squad | `#botEnhInfo`, running | `one try every {interval}s · {cost}c each` | `bots.js:166-173` `interval = 30 × 1.3^plus / squad`; `enhance.js:43-46` `cost = round(0.5 × ip × 1.6^plus)` |
| 5 Ban Wave | `h3` + sub | `Ban Wave` `— the anti-cheat notices the farm` | `index.html:108` — flavor kept: it names the event and teaches nothing, so the teaching line below is unaffected |
| 5 Ban Wave | teaching line (NEW, sits above `#banWaveInfo`) | `Banking a Ban Wave resets your bots, your training and your copper to the start. Everything your character owns stays: gear, plusses, scrap, trophies, Armory ranks, titles and door progress. In exchange you bank √(training fills) as Scripts, and every Script permanently adds +1% damage. Scripts never reset.` | `rebirth.js:36-51` (`banWave` resets `pop`/`bars`/`trained`/`alloc`/`copper` only); `rebirth.js:20-22` `pendingScripts = floor(√totalFills)`; `rebirth.js:11` `SCRIPT_DMG = 0.01` |
| 5 Ban Wave | `#banWaveInfo`, idle | `+{n} Scripts ready, from {fills} training fills · {r} Ban Waves so far` | `main.js:708-709` |
| 5 Ban Wave | `#banWaveInfo`, nothing to bank (empty) | `No Scripts to bank yet — one training fill is worth one Script.` | `rebirth.js:20-22`: `floor(√1) = 1`. Names the condition and the way out |
| 5 Ban Wave | `#banWaveInfo`, armed (destructive confirm) | `Bank {n} Scripts and reset the farm? Tap again to confirm. This clears itself after 4 seconds.` | `main.js:410` `setTimeout(..., 4000)`. Yifrah destructive formula: specific consequence + permanence, no "Are you sure?" |
| 5 Ban Wave | `#banWaveBtn` | idle `Ban Wave` · armed `Confirm Ban Wave` | `main.js:711` |
| 5 Ban Wave | help modal (`HELP[banwave]`) — **rescoped, not duplicated** | `Bank when the payout is worth the reset. Scripts are the square root of your training fills, so pushing twice as long pays well under twice the Scripts.` / `Your bots borrow your power — each one hits at 10% of your ATK and 10% of your hits per second. So more damage means a faster farm too, and every Ban Wave rebuilds quicker than the one before.` | `rebirth.js:20`; `bots.js:24-25,71-75` `BOT_ATK_FRAC`/`BOT_SPD_FRAC = 0.10`. The four facts the current modal shares verbatim with the inline section (`main.js:431-435`) are **cut** — DW-5.2 |
| state `locked` (whole tab) | `#tabs` button `title` | `Unlocks as soon as the game starts.` | `main.js:241` `training: s.unlocked`; `main.js:627` flips on the first tick |
| state `empty`/dormant | tier rows | `locked · {fills} / {needed} fills` — 6 of 7 ATK + 5 of 6 SPEED at game start | `state.js:51-52` `unlocked: 1` |
| state `empty`/dormant | enhance squad | `no bots assigned — set a number on the left to start` | as block 4 |
| state `empty`/dormant | Ban Wave | section hidden entirely until `features.rebirth` | `main.js:702` |
| state `active` | — | affordable rig buttons, ≥1 tier running, squad assigned — strings as above | `main.js:126` `buyState` |
| state `in-progress` | — | N/A — scripts and rig apply continuously, no started/stopped mode | `bots.js:181` |
| state `error` | — | two real paths, both written above: over-allocation (`#rigStats`) and empty enhance slot (`#botEnhInfo`). Ban Wave's arm/confirm is a confirmation, not an error | `bots.js:124`, `main.js:831` |

### Grind

**Purpose:** Hold zones with bot squads to earn copper and roll gear drops.

**Entry points:** Tab nav, opens with Training (`grind: f.training` —
`## IA` sitemap). `UNLOCK_MSG.grind` ("deploy the swarm...") is the
discovery trigger.

**Primary decision:** Which zone(s) to allocate squad bots to.

**Content blocks (in order):**
1. Zones — rowlist (×15: name, mob, HP, copper/kill, IP band, allocation
   control, live stat, kill-cycle bar) and the per-zone saturation readout
   when a held zone is over-farmed. *Owns: Grind tab, "Zones (×15...)" and
   "Zone squad-DPS / saturation readout."*

Single block, already first (and only) — no reorder.

**States:**
- `locked`: whole tab, before `features.training`.
- `empty`/dormant: 10 of 15 zones are `[LOCKED]` at game start (region 2
  needs 1 clear, region 3 needs 4); an unlocked-but-unmanned zone still
  renders its mob/HP/copper/IP data in full (flagged by Phase 1/audit as a
  duplication of the lock-group boundary, not a per-zone state to design
  around here — that fix is a component-repeat call, Phase 4).
- `active`: at least one zone manned, squad DPS/saturation visible.
- `in-progress`: N/A — zones run continuously once manned; no start/stop
  run mode (contrast with Dungeon).
- `error`: N/A — allocation controls clamp at capacity, no invalid state.

**Primary action:** Increase allocation on the zone with the best
copper/DPS return right now.

**Exit:** Tab switch (typically to Player once drops accumulate, or back to
Training to grow the swarm further).

**Microcopy (Phase 5):**

*Explained-once register (DW-5.2) — one owner per mechanic on this tab:*

| Mechanic taught here | The ONE element that explains it | Elements that carry the value but do NOT re-explain |
|---|---|---|
| Hold a zone (combined damage vs the zone's gate) | the `Zones` `h3` sub | all 15 rows — the failing row states its two numbers, not the rule |
| Kill cap and copper per kill | the `Zones` `h3` sub | row gain column prints `{n}c/kill`; row stat prints the live rate |
| Drop chance | the `Zones` `h3` sub | no row repeats `1 in 400` |
| What IP means for a drop | the `Zones` `h3` sub, one clause | row sub prints the band `IP {lo}–{hi}` only. The gear-side meaning of IP is owned by Player's Stash — a different half, not a repeat |
| Overkill Saturation | the row stat that shows it (it only ever appears on a saturated row) | not in the header — it would be a rule for a state most rows never reach |
| Region unlock condition | the locked row stat | not in the header — it is per-region data, not a rule |

| Block / state | Element | Final copy | Number source |
|---|---|---|---|
| 1 Zones | `h3` sub (the tab's single teaching line) | `Zones — put bots on a zone. Their combined damage has to clear the zone's hold number or they earn nothing at all. A zone they can hold kills up to 50 mobs a second; every kill pays copper and has a 1-in-400 chance to drop a piece of gear. IP is the power band those drops roll in — deeper zones drop higher.` | `bots.js:145-156` `held = squadDps >= z.gate`; `farm.js:7` `KILL_CAP = 50`; `farm.js:5` `DROP_CHANCE = 1/400`; `farm.js:31-48` per-zone `ipLo`/`ipHi`. Replaces `index.html:117`'s `squads need enough combined DPS…` — same facts, no jargon, with the two numbers it was missing |
| 1 Zones | row name | `{z.name}` — `Novice Meadow` … `World's Edge` | `farm.js:31-48`, §16 dead-game register — names only |
| 1 Zones | row name sub | `{z.mob} · {hp} HP` | `main.js:346` |
| 1 Zones | row gain | `{n}c per kill` | `main.js:347` |
| 1 Zones | row gain sub | `IP {lo}–{hi}` | `main.js:347` |
| 1 Zones | row stat, `locked` | `locked · needs {n} doors open, you have {m}` | `farm.js:14` `zoneUnlockClears` returns a CLEAR COUNT (0 / 1 / 4), not a wall number. **Replaces `[LOCKED] break W1`, which reads as "break Wall 1" and means "have 1 door open"** (defect A4, `main.js:844`). Names the condition and the way out |
| 1 Zones | row stat, unmanned (empty) | `no bots here` | `main.js:846` |
| 1 Zones | row stat, can't hold (error) | `too weak to hold — {have} damage/s of the {need} this zone needs` | `main.js:848`; `bots.js:148`. Condition + way out (add bots, or raise Combat Power). DESIGN.md flags that this state is currently *styled* identically to `locked`; the copy distinguishes them in words regardless of how Phase 6 styles it |
| 1 Zones | row stat, held | `{k} kills/s · {c}c/s (×{mult})` | `main.js:852`; `bots.js:228` applies `player.copperMult`; `stats.js:55` `copperMult = 1 + (copperPct + tm.copperPct)/100`. **Closes the copper-multiplier legibility gap Phase 1 handed forward**, and fixes a real defect found on review 2026-07-26: `bots.js:154` computes `copperPerSec` as `kps × z.copper` — the BASE — while `copperMult` is applied separately at credit time, so `main.js:852` today prints a rate the player never actually banks. **`{c}` is the FINAL rate**, `×{mult}` trails it as the trace. User instruction: do not restate where the multiplier originates — the full product lives on the Player tab and in Help. Deliberate narrowing of design guideline 5's "traceable" clause at the row level; the terms stay displayed, just not on every zone row. |
| 1 Zones | row stat, held at cap | `{k} kills/s CAPPED · {c}c/s (×{mult})` | `farm.js:7` `KILL_CAP = 50`. Replaces the bare `· CAP`; user instruction 2026-07-26 — the cap value is the same 50 on every row, so naming it per row is noise |
| 1 Zones | row stat, saturated | `… · overkill ×{sat} → drops roll {n} band{s} higher (up to 3)` | `farm.js:21-22` `saturation = squadDps / (50 × mobHp)`, `lootBias = clamp(floor(log2(sat)), 0, 3)`. Replaces `SAT ×{n} → +{m} bands`; states the cap |
| 1 Zones | allocation control | `−` `+` `cap` `⋯` `max` `0`, `cap` tooltip `Exactly enough bots to hit this zone's 50 kills/s cap.` | `main.js:292-295`; `bots.js:130-139` `capNeeded`. The `cap` button is the one control whose label does not say what it does |
| state `locked` (whole tab) | `#tabs` button `title` | `Unlocks with Training.` | `main.js:242` `grind: f.training` |
| state `empty`/dormant | 10 of 15 zones | `locked · needs {n} doors open, you have {m}` — 5 rows at 1 door, 5 rows at 4 | `farm.js:14`; matches UI-AUDIT's `10 of 15 locked`. The ten rows still carry one of two facts — collapsing them into a group boundary is a Phase 4/6 component call, NOT a copy edit; the string is corrected here, the repetition is carried forward named |
| state `empty`/dormant | unlocked, unmanned zone | `no bots here` | `main.js:846` |
| state `active` | — | at least one zone held; strings as above | `main.js:840` |
| state `in-progress` | — | N/A — zones run continuously once manned; no start/stop run mode (contrast Dungeon) | `bots.js:223-233` |
| state `error` | — | one real path, written above: a manned zone below its gate (`too weak to hold`). Allocation clamps at capacity, so there is no invalid-input path | `bots.js:116-122` |

### Player

**Purpose:** Manage the character's build — gear, enhance, reforge,
trophies, Armory — the tab that owns Combat Power itself.

**Entry points:** Tab nav, opens on first drop (`player: f.grind &&
s.everDropped` — `## IA` sitemap). `UNLOCK_MSG.player` ("your character...")
is the discovery trigger; this is `## Journey` Phase 3, "Build identity,"
the phase the emotion curve calls out as where engagement should peak and
where the current UI (8 screens, live controls at 60% depth) most actively
works against it.

**Primary decision:** What to equip, enhance, or reforge across the three
gear slots.

**Content blocks (in order — REORDERED vs. current DOM, see Design
Decisions):**
1. Combat Power breakdown — total + atk + hits/s chip group. *Owns: Player
   tab, "Combat Power total + atk + hits/s"* — the canonical owning render;
   resolves DW-1.2, referenced (not duplicated) by the resbar chip and the
   Boss-tab record line.
2. Titles earned — hidden until ≥1. *Owns: Player tab, "Titles earned."*
   Kept adjacent to block 1 — both are small, non-actionable headline
   info; no scroll cost either position.
3. Gear — safeguard toggle, three slots (name/rarity/IP/plus/item-ATK,
   affix list, enhance button+info, reforge bench), failstacks HUD. *Owns:
   Player tab, "Gear slots ×3...", "Gear affixes per slot...", "Safeguard
   toggle," "Enhance button + info...", "Reforge bench...", "Failstacks
   HUD."* **This is the primary decision — moved ahead of Trophies/Armory.**
4. Stash — scrap wallet, auto-equip/auto-salvage filters, stash list (up to
   24 + "N more"). *Owns: Player tab, "Stash: scrap wallet," "Stash:
   auto-equip / auto-salvage filters," "Stash list...".* Placed immediately
   after Gear — it's the direct feeder into the gear decision (equip from
   stash).
5. Trophies — cabinet (10 sets × 7 pips), set-complete damage multiplier.
   *Owns: Player tab, "Trophy cabinet...", "Trophy set-complete damage
   multiplier."* Moved to the tail — a progress display, 70 of 70 pips
   unearned at game start.
6. Armory — header aggregate line, grid (15 zones × 3 slots = 45 cells).
   *Owns: Player tab, "Armory header...", "Armory grid...".* Last — a
   progress display, all 45 cells rank-0 at game start.

**States:**
- `locked`: whole tab, before `features.grind && everDropped`.
- `empty`/dormant: Titles hidden (0 earned); all three gear slots show a
  `—` placeholder (nothing equipped); scrap wallet reads "no scrap yet";
  stash reads "stash empty"; reforge bench dormant until a candidate rolls;
  failstacks HUD dormant at 0; Trophies all-unearned (70/70); Armory all
  rank-0 (45/45) — this is literally the audit's ~136-dormant-item finding,
  concentrated on this one tab (70 + 45 of the 136).
- `active`: at least one slot filled, stash populated, CP breakdown live
  (always live once the tab is unlocked, since `everDropped` is the unlock
  gate itself).
- `in-progress`: N/A — no discrete run mode; gear actions (enhance/reforge)
  resolve instantly (no ceremony, per the hard veto), not as a tracked run.
- `error`: N/A — no destructive confirmation beyond the safeguard toggle
  (a settings checkbox, not an error path).

**Primary action:** Enhance, reforge, or equip-from-stash on a gear slot.

**Exit:** Tab switch (typically to Boss to watch the Combat Power change
land, or back to Grind/Dungeon to farm more drops).

**Microcopy (Phase 5):**

*Explained-once register (DW-5.2) — one owner per mechanic on this tab. This
is the densest tab in the game, so the register is the load-bearing device:*

| Mechanic taught here | The ONE element that explains it | Elements that carry the value but do NOT re-explain |
|---|---|---|
| What Combat Power is (ATK × hits/s) | the `Combat Power` `h3` sub | the three chips are labels; every section below feeds it and none says so again |
| What "haste" means | the `Combat Power` `h3` sub, one clause | trophy pips, Armory cells and gear affixes all print `+{n}% haste` and none define it |
| Enhance: plus → power, failstacks | the `Gear` `h3` sub | `#stacksHud` prints the bank; each `#sei_*` prints that attempt's three numbers |
| Enhance odds and fallout per attempt | each slot's `#sei_*` (per-attempt data, not a rule) | the `Gear` sub does not list the odds table |
| Safeguard | the `safeguard` toggle's own label | `#sei_*` prints `(safeguard)` on the fallout clause only |
| Reforge | the `Reforge` line under the `Gear` `h3` | each `#rfi_*` prints its price; each `#rfc_*` prints the candidate |
| Rarity → affix count, IP → affix strength, locking, salvage | the `Stash` `h3` sub | stash rows print rarity, IP and affixes; no row defines them |
| What a Trophy set does | the `Trophies` `h3` sub | 70 pips print `{part} +{n}% {lane}` and nothing else |
| How trophy pieces are obtained | **not taught here — POINTER** to Boss | the `Trophies` sub says "farm that Warden on the Boss tab"; the roll RATE lives on Boss |
| Armory: merging, rank cost, lane per slot, the cap | the `Armory` `h3` sub | 45 cells print `R{n} · +{pct}% {lane}` and nothing else |

| Block / state | Element | Final copy | Number source |
|---|---|---|---|
| 1 Combat Power | `h3` + sub | `Combat Power` `— your damage per second against the door: ATK multiplied by hits per second. "Haste" anywhere on this tab is a percentage added to hits per second. Everything below feeds these two numbers.` | `stats.js:52-55` `atk`, `hitsPerSec`; `pull.js:15-18` `combatPower = atk × hitsPerSec`. Replaces `index.html:124`'s `— the factors your gear moves`. The last sentence is the anti-duplication device: no section below repeats "this raises ATK" |
| 1 Combat Power | chips | `combat power` · `ATK` · `hits/s` | `index.html:126-128` |
| 2 Titles | `#titles` | `Titles earned: {list}` | `main.js:916`; granted at `plus >= 18` (`main.js:169-173`) |
| 2 Titles | empty | hidden — `main.js:915` shows the block only at ≥1 title. No empty string, deliberately: the header would be the only content and the way to earn one is already stated by the enhance readout | `main.js:915` |
| 3 Gear | `h3` | `Gear` | unchanged |
| 3 Gear | `h3` sub (NEW — the enhance teaching line) | `Three slots. Enhancing raises an item's plus, and every plus multiplies its base power by 1.12. A failed attempt anywhere banks a failstack worth +1 percentage point on your next attempt, up to +15; a success spends the whole bank.` | `gear.js:26-28` `contribution = ip × 1.12^plus`; `enhance.js:11` `STACK_CAP_PTS = 15`; `enhance.js:25-27` `chance = base + min(stacks,15)/100`; `enhance.js:58` success zeroes `failstacks` |
| 3 Gear | `#stacksHud` | `· {n} failstacks, +{m}% on your next attempt` | `main.js:866-867` |
| 3 Gear | `#stacksHud` at 0 | hidden — the `h3` sub already states how the bank builds. Showing `0 failstacks` on every Player visit would be the exact per-row restatement DW-5.2 forbids | `main.js:866` |
| 3 Gear | `#safeguard` label | `safeguard · 3× the copper, but a failure doesn't cost you a plus. Only works while the item is +5 to +14 — it can't protect a push past +15.` | `enhance.js:40` `canSafeguard = k >= 5 && k < 15` — true for the attempts made FROM +5 through +14, i.e. the last one it covers is the attempt that reaches +15. Cost `enhance.js:45` `safeguard ? c * 3 : c`. Replaces `index.html:135`'s `up to +15 only`, which reads as though the attempt from +15 is covered |
| 3 Gear | slot label | `weapon` · `armor` · `charm` | `gear.js:9` |
| 3 Gear | `#si_*`, filled | `{item.name}` · `{Rarity}` · `IP {ip} +{plus} · {n} ATK` | `main.js:876-879` |
| 3 Gear | `#si_*`, empty | `empty — equip something from the Stash below` | `main.js:884`. **State D4: `—` was a dead end.** Condition + way out |
| 3 Gear | affix lines | `{affix.label({value})}` — e.g. `+42 ATK`, `+3.2% haste`; live affixes `+12.4% ATK — 1,240 bots` | `affixes.js:19-41,88-93`. Unchanged — already states value and provenance |
| 3 Gear | affix list, none | `no affixes — Common items roll none` | `main.js:881`; `rarity.js:7` `common.affixes = 0`. Teaches the rarity→affix link at the one place it bites |
| 3 Gear | `#se_*` button | `enhance` | `index.html`/`main.js:365` |
| 3 Gear | `#sei_*`, safe band | `+{k} → +{k+1} · {cost}c · {chance}% · a fail costs nothing` | `enhance.js:14,18-27,43-46`; `SAFE` = 100/90/80/70/60% for +0→+4 |
| 3 Gear | `#sei_*`, risk band | `+{k} → +{k+1} · {cost}c · {chance}% · a fail drops you back to +{k−1}` | `enhance.js:15` `RISK` = 45/40/35/30/25/20/20% for +5→+11; `enhance.js:64` `item.plus--`. Replaces `fail −1` with the number it lands on |
| 3 Gear | `#sei_*`, nightmare band | `+{k} → +{k+1} · {cost}c · {chance}% · a fail drops you to +{checkpoint}` | `enhance.js:16` `NIGHTMARE` = 15/12/9/7/5/3.5/2.5/1.5% for +12→+19; `enhance.js:36-38` `checkpointOf` = 15 / 10 / 0 |
| 3 Gear | `#sei_*`, safeguard on | `+{k} → +{k+1} · {cost}c · {chance}% · a fail costs nothing (safeguard)` | `main.js:892` |
| 3 Gear | `#sei_*`, at max (empty) | `+20 is as high as this goes.` | `enhance.js:10` `MAX_PLUS = 20`. **State D6: the string blanked with no explanation** |
| 3 Gear | `#sei_*`, no item | `equip an item to enhance it` | `main.js:889` |
| 3 Gear | enhance attempt fails on copper (error) | `not enough copper — this attempt costs {cost}c` | `enhance.js:53-54` returns `"poor"`; `main.js:378` returns silently today. **State D1: a real error path with no message at all.** Condition + way out |
| 3 Gear | Reforge teaching line (NEW, one per tab not per slot) | `Reforge rerolls an item's affixes for scrap of its own rarity. It can't change the rarity or the IP — only which affixes it has and what they roll. You see the result before you decide whether to keep it.` | `gear.js:132-155`; `reforge` returns a candidate without mutating the item |
| 3 Gear | `#rf_*` button | `reforge` | `main.js:366` |
| 3 Gear | `#rfi_*` | `{n} {rarity} scrap per roll` | `gear.js:142-144` `n = 2 × affixTier(ip)`; `affixes.js:55-61` |
| 3 Gear | `#rfi_*`, no affixes | `Common items have no affixes to reforge` | `gear.js:136-138`; `rarity.js:7` |
| 3 Gear | `#rfi_*`, can't afford (error) | `not enough {rarity} scrap — you need {n}, salvage {rarity} items to get it` | `main.js:904-905`. Condition + way out; replaces the silent disabled button and the log-only `reforge: not enough scrap` (`main.js:385`) |
| 3 Gear | `#rfc_*` candidate + buttons | `→ {affix} · {affix}` and `Keep these` · `Roll again` · `Discard` | `main.js:911`, `index.html`-built at `main.js:370`. Buttons label the outcome, not the mechanism |
| 4 Stash | `h3` + sub (NEW) | `Stash` `— where kept drops land, up to 50. An item's rarity is how many affixes it rolled (Common 0, Origin 6) and its IP is how strong those affixes roll. Salvaging turns an item into scrap of its own rarity. Locking one protects it from auto-salvage, the bulk sweep and the stash-full clear-out.` | `gear.js:47` `STASH_CAP = 50`; `rarity.js:6-14` affix counts 0→6; `affixes.js:57-61` `affixTier(ip)`; `gear.js:51-63` `scrapYield`; `gear.js:66-78,105,122` all three paths honour `lock` |
| 4 Stash | `#scrapWallet` pills | `{n} {rarity}` | `main.js:822` |
| 4 Stash | `#scrapWallet` empty | `no scrap yet — salvage a drop to get some` | `main.js:823`. Condition + way out |
| 4 Stash | `#autoEquip` label | `auto-equip a drop when it beats what's in the slot — the old item goes to the stash` | `gear.js:101-104`; `index.html:141`. `isUpgrade` is a strict `>` on base power (`gear.js:88-91`) |
| 4 Stash | `#autoFilter` label + dials | `auto-salvage drops below both floors — keep anything {rarity} or better AND at least {n} IP; everything else becomes scrap` | `gear.js:83-85` `meetsKeep` requires BOTH; `state.js:83-84` defaults `rare` / `0` |
| 4 Stash | `#stashToggle` | `stash ({n}/50)` | `main.js:554`; `gear.js:47` |
| 4 Stash | bulk-sweep row | `salvage every unlocked stash item at or below both — {rarity} or worse AND {n} IP or less. Leave IP at 0 to ignore it.` | `gear.js:117-130`; `main.js:541` passes `Infinity` when the IP dial is 0 — a real behaviour with no copy today |
| 4 Stash | `#salvageMatch` button | `Salvage matching items` | `index.html:154` |
| 4 Stash | stash row | `{mark} {name}` · `equip` `lock`/`unlock` `salvage +{n}` · `{slot} · IP {ip} +{plus} · {affixes}` | `main.js:566-569`. **`×{n}` becomes `salvage +{n}`** — the bare `×3` never said what it did |
| 4 Stash | row mark | `▲` upgrade over what's equipped · `L` locked | `main.js:566`. Decoded by the `h3` sub's lock clause and by `auto-equip`'s "beats what's in the slot" |
| 4 Stash | `#stashList` empty | `stash empty — drops land here` | `main.js:580`. Unchanged; already condition + way out |
| 4 Stash | overflow line | `…and {n} more (salvage to clear)` | `main.js:585`. Unchanged |
| 4 Stash | stash-full log (error) | `Stash full at 50 — salvaged your weakest unlocked item, {name}, for +{n} {rarity} scrap.` | `gear.js:66-78`; `main.js:150` |
| 5 Trophies | `h3` + sub | `Trophies` `— each Warden has a 7-piece set. Breaking its door gives you the first piece; the rest come from farming that Warden on the Boss tab. A complete set multiplies your damage by 1.5.` | `trophies.js:14-23` `PARTS.length = 7`, `SET_BONUS = 0.5` → ×1.5; `trophies.js:65-69` guaranteed break piece. POINTER to the Boss-owned farm roll (Boss states the rate, this states the reward — different halves, no overlap) |
| 5 Trophies | `#trophySet` | `{n}/10 sets complete` | `main.js:934` |
| 5 Trophies | set header | `{set.name}` `{have}/7` · complete adds `· ×1.50 damage` | `main.js:930-931`; `bosses.js` `set.name` per wall |
| 5 Trophies | pip, owned | `✓ {part} +{n}% {lane}` | `main.js:927`; `trophies.js:29-35` `pct = round(basePct × boss.set.mult)`, W1 mult 1.0 → W10 13.6 |
| 5 Trophies | pip, unowned | `◈ {part} +{n}% {lane}` | `main.js:927` — shows what it would be worth, so an unearned pip is still information |
| 5 Trophies | pip `title` (NEW) | owned `Recovered.` · unowned `Not recovered yet — farm {boss.name} for it.` | closes DESIGN.md required-change 3: `.pip` has `cursor: help` promising a tooltip that does not exist |
| 6 Armory | `h3` + sub | `Armory` `— every drop is logged here against its own entry, one per item name, whether you keep it or scrap it. Rarer copies count for more: a Common is worth 1 point, an Origin 13. The first rank costs 3 points and each rank after costs 60% more, up to rank 12. Weapons rank ATK, armor ranks haste, charms rank copper — and the ranks survive every Ban Wave.` | `armory.js:16` `MERGE_WEIGHT = [1, 1.5, 2.5, 4, 6, 9, 13]`; `armory.js:17,26-30` `pointsForRank`, `COST_BASE 3`, `COST_GROWTH 1.6`; `armory.js:15` `RMAX = 12`; `armory.js:20` `LANE`; `armory.js:47-58` merges before disposal; `rebirth.js:36-51` never touches `state.armory` |
| 6 Armory | `#armorySub` aggregate | `rank {n} across {m} entries · +{a}% ATK · +{h}% haste · +{c}% copper` | `main.js:597-598`; `armory.js:61-87` |
| 6 Armory | grid cell | `{item name}` · `R{n} · +{pct}% {lane}` | `main.js:609-612`; `armory.js:41-43` `entryPct = 0.25 × rank × (1 + 0.15 × (zone−1))` |
| 6 Armory | grid cell at rank 0 (dormant) | `R0 · +0.00% {lane}` — no per-cell sentence. 45 cells × an explanation is the exact anti-pattern this phase exists to kill; the `h3` sub carries it once | `main.js:609` |
| 6 Armory | grid cell at cap | `R12 ✦ · +{pct}% {lane}`, with the `h3` sub's `up to rank 12` decoding `✦` | `main.js:611`; `armory.js:15` |
| 6 Armory | row label | `z{n}` — terse by design; the rows are zones in the Grind tab's own order | `main.js:614` |
| state `locked` (whole tab) | `#tabs` button `title` | `Unlocks when your bots find their first piece of gear.` | `main.js:243` `player: f.grind && s.everDropped`; no content spoiler |
| state `empty`/dormant | — | three empty slots, empty stash, empty scrap wallet, 70 unearned pips, 45 rank-0 cells, hidden titles, hidden failstacks, dormant reforge bench — every one written above. This is 115 of the audit's 136 dormant items, concentrated here | `main.js:884,580,823,927,609,915,866` |
| state `active` | — | at least one slot filled; strings as above | `main.js:872` |
| state `in-progress` | — | N/A — enhance and reforge resolve instantly, no tracked run (hard veto: no ceremony) | `enhance.js:50-67` |
| state `error` | — | three real paths, all written above: enhance without copper (`#sei_*`), reforge without scrap (`#rfi_*`), stash overflow (log). The safeguard toggle is a setting, not an error path | `enhance.js:53`, `gear.js:151`, `gear.js:68` |

### Delve

**Purpose:** Spend the character's own passive depth-mining run on
upgrades that feed Cache and, via one row, the Combat Power product.

**Entry points:** Tab nav, opens once `features.player && Combat Power ≥
100` (`## IA` sitemap). `UNLOCK_MSG.delve` ("descend for copper...") is the
discovery trigger.

**Primary decision:** Which Cache-tree upgrade to buy next.

**Content blocks (in order):**
1. Delve state — depth, deepest, Cache/s. *Owns: Delve tab, "Delve state
   line (depth · deepest · Cache/s)."*
2. Cache banked. *Owns: Delve tab, "Cache banked."*
3. Cache tree — 5 afford-gated upgrade rows (deeper bore, cache sifter,
   recovered overclock, salvage beacon, buried scripts). *Owns: Delve tab,
   "Cache tree (5 upgrade rows...)."* The overclock row is a guideline-5
   term (feeds the Boss-tab-consumed atk product) whose current-total
   multiplier isn't spelled out as one number — a legibility gap Phase 1
   already flagged for later phases, not fixed by this spec.

No reorder — audit's own verdict names this tab "the structural model the
others should follow": one list, no dormant padding, everything actionable.

**States:**
- `locked`: whole tab, before `features.player && CP ≥ 100`.
- `empty`/dormant: N/A in the audit sense (no bulk unearned-content block
  like Trophies/Armory) — Cache simply starts at 0 and climbs, a numeric
  floor rather than a distinct empty UI state.
- `active`: default and only steady state once unlocked.
- `in-progress`: N/A — Delve is continuous passive accumulation, not a
  started/stopped run (unlike Dungeon).
- `error`: N/A — afford-gated buttons, no invalid input.

**Primary action:** Buy the next affordable Cache-tree row.

**Exit:** Tab switch (typically to Boss to see the overclock bonus land, or
Dungeon once bots.pop ≥ 10 unlocks it).

**Microcopy (Phase 5):**

*Explained-once register (DW-5.2) — one owner per mechanic on this tab:*

| Mechanic taught here | The ONE element that explains it | Elements that carry the value but do NOT re-explain |
|---|---|---|
| The delve runs itself, and depth follows Combat Power | the `Delve` `h3` sub | `#delveState` prints depth and deepest; no row repeats the rule |
| What Cache is and how fast it accrues | the `Delve` `h3` sub | `#delveCache` prints the balance; the sifter row prints its own per-rank gain |
| Prices rise per rank | the `Cache tree` `h3` sub | each button prints its own next price |
| What each node does | that node's own gain string, once | the rank readout prints the resulting total, not a second description |

| Block / state | Element | Final copy | Number source |
|---|---|---|---|
| 1 Delve state | `h3` + sub | `Delve` `— your character digs on their own down here, no input needed. Depth is however deep your Combat Power clears: floor 1 needs 10 damage per second and each floor after needs 70% more. Every extra floor pays 35% more Cache per second, and Cache is the buried server data you spend below.` | `dungeon.js:8` `DIFF_BASE = 10`, `DIFF_GROWTH = 1.7`; `dungeon.js:11-17` `diff`/`clearChance`/`safeDepth`; `dungeon.js:9,45-48` `CACHE_GROWTH = 1.35`. Replaces `index.html:164` — same premise, now with the three numbers it never stated |
| 1 Delve state | `#delveState` | `depth {n} · deepest ever {m} · {c} Cache/s` | `main.js:940`; `dungeon.js:43` `reachDepth = safeDepth(dps) + rank("reach")` |
| 2 Cache banked | `#delveCache` | `{n} Cache banked` | `main.js:941` |
| 3 Cache tree | `h3` + sub | `Cache tree` `— each row buys one rank. Every rank you buy raises that row's next price.` | `dungeon.js:30` `cost = round(base × mult^rank)`; the multiplier differs per row (1.7–2.0), so the copy states that prices rise without inventing a single shared figure |
| 3 Cache tree | `deeper bore` | `deeper bore · +1 depth per rank` | `dungeon.js:22` |
| 3 Cache tree | `cache sifter` | `cache sifter · +20% Cache per second per rank` | `dungeon.js:23`, `per: 0.20`; applied at `dungeon.js:47` |
| 3 Cache tree | `recovered overclock` | `recovered overclock · +3% ATK per rank` | `dungeon.js:24`, `per: 0.03`; applied at `stats.js:52` `delveBonus(state, "overclock")` |
| 3 Cache tree | `salvage beacon` | `salvage beacon · +4% chance of a gear drop per rank` | `dungeon.js:25`, `per: 0.04`; applied at `bots.js:229` on the drop count |
| 3 Cache tree | `buried scripts` | `buried scripts · +5% ATK and hits per training fill, per rank` | `dungeon.js:26`, `per: 0.05`; applied at `bots.js:210-211` `t.gain * drill`. **Replaces `+5% train rate`, which was wrong** — the node multiplies the gain per fill, not the fill rate (defect A2) |
| 3 Cache tree | rank readout | `rank {n} · ×{total} now` — e.g. `rank 4 · ×1.12 ATK now` | `dungeon.js:40` `delveBonus = 1 + per × rank`. **Closes the legibility gap Phase 1 handed forward**: the overclock row showed rank and per-rank gain but never the multiplier actually folded into Combat Power |
| 3 Cache tree | rank readout at 0 | `rank 0` — no `×1.00 now` clause; a multiplier of 1 is not information | `dungeon.js:29` |
| 3 Cache tree | buy button | `Buy · {n} Cache` | `main.js:946`. Adds the verb the price-only label was missing (audit G5 named the width; this names the action) |
| 3 Cache tree | buy button, unaffordable | same label, disabled and dimmed. No error string: this is an afford-gate, not an error, and the Cache balance sits two blocks above it in the same view | `main.js:947`, `main.js:126` `buyState` |
| state `locked` (whole tab) | `#tabs` button `title` | `Unlocks at 100 Combat Power.` | `main.js:244` `delve: f.player && dps >= 100`; names the milestone, not the Cache tree behind it |
| state `empty`/dormant | — | N/A in the audit's sense — no bulk unearned block. Cache simply reads `0 Cache banked` and climbs; `depth 0 · deepest ever 0` is a numeric floor, not a distinct empty UI | `state.js:58` |
| state `active` | — | default and only steady state once unlocked; strings as above | `main.js:938-949` |
| state `in-progress` | — | N/A — the delve accrues continuously, never started or stopped (contrast Dungeon) | `main.js:644-648` |
| state `error` | — | N/A — every button is afford-gated and there is no player input to validate | `dungeon.js:31-38` |

### Dungeon

**Purpose:** Send bots into a floor-by-floor dungeon run for gear; pull out
before attrition costs most of the run's loot.

**Entry points:** Tab nav, opens once `features.delve && bots.pop ≥ 10`
(`## IA` sitemap). `UNLOCK_MSG.dungeon` ("send bots in...") is the discovery
trigger.

**Primary decision:** Idle — how many bots to assign per duty, at what
difficulty, and when to send them in. Running — whether to pull out now.

**Content blocks (in order — REORDERED vs. current DOM, see Design
Decisions; distinct per state, per the plan's edge case):**

*Idle:*
1. Instance state summary — difficulty, abilities-to-block count,
   bots-needed, deepest floor reached. *Owns: Dungeon tab, "Instance state
   line (...idle: difficulty/live-ability-count/bots-needed/deepest)."*
2. Instance projection — projected floor for the currently-allocated
   squad. *Owns: Dungeon tab, "Instance projection line (...idle: projected
   floor)."*
3. Assign bots — duty rows ×3 (Sunder/Mass Dispel/Summon Adds: effect
   sentence, needed-bots readout, allocation control, assigned/needed
   stat). *Owns: Dungeon tab, "Duty rows ×3...".*
4. Run controls — difficulty input, pull-out-at-floor setting, proxy
   toggle, Send-bots-in button. *Owns: Dungeon tab, "Difficulty (...)",
   "Pull-out-at-floor setting...", "Proxy toggle...", "Send/Pull-out
   buttons."*
5. How it works — the static intro paragraph explaining the mechanic.
   *Owns: Dungeon tab, "Intro paragraph (static, 6 lines)."* **Moved below
   the action blocks** — it currently precedes them and the audit already
   named it as filling the first screen before any control appears; Phase
   5 shortens the copy, this phase only moves it out of the way of DW-2.3.
6. Boss abilities journal — ×3 rows, unseen/seen. *Owns: Dungeon tab, "Boss
   abilities journal ×3 rows...".*

*Running (in-progress — distinct per the plan's edge case):*
1. Instance state summary — floor, haul, damage % (pulling out at floor
   restated inline — same owning row, flagged `DUP` by Phase 1, carried
   forward). *Same row as idle block 1, different content.*
2. Instance projection — bots still alive, ban rate per floor. *Same row
   as idle block 2, different content.*
3. Assign bots — duty rows now read committed/surviving counts; allocation
   inputs disabled (`i.running` in `main.js`). *Same rows as idle block 3.*
4. Run controls — Send-bots-in hidden, Pull-out-now shown; difficulty and
   pull-out-floor inputs remain visible (pull-out floor stays live-editable
   mid-run per `main.js:509-511`). *Same rows as idle block 4.*
5. How it works — unchanged, same position.
6. Boss abilities journal — updates live as mechanics are encountered mid-run.

**States:**
- `locked`: whole tab, before `features.delve && bots.pop ≥ 10`.
- `empty`/first-visit idle: Boss-abilities journal is three identical
  "Unknown — you haven't run into this one yet" rows; deepest floor reads
  0; no bots assigned to any duty — a sub-case of `idle`, not a separate
  mode.
- `idle`: default pre-run state (block set above).
- `in-progress`/`running`: distinct content per block set above — the
  plan's named edge case, confirmed against `main.js renderInstance()`'s
  `i.running` branch.
- `error`: N/A — no invalid-input path; a dead run resolves via the wipe
  rule (keep `WIPE_KEEP`% of loot), which is a game-rule outcome, not a UI
  error state.

**Primary action:** Idle — "Send bots in." Running — "Pull out now (keep
loot)."

**Exit:** Tab switch. A run resolves on its own (wipe or manual pull-out)
back to the idle state on the same tab — not a forced exit.

**Microcopy (Phase 5):**

This is the tab the audit named as the three-statement problem, so the
register below is the phase's primary evidence: **three teaching locations,
each owning exactly one mechanic, and no row anywhere restating one.**

*Explained-once register (DW-5.2):*

| Mechanic taught here | The ONE element that explains it | What used to repeat it, and no longer does |
|---|---|---|
| The run loop: floors, attrition, the wipe, the 40% | the `How it works` block (3 lines) | nothing else mentions floors or the wipe rule |
| Blocking: a duty needs N bots, unblocked cuts damage, damage floor ends the run | the `Assign bots` block sub | **duty row subs drop `Blocked by {duty} bots.`** — they keep only their own penalty number. **Journal rows drop the whole sentence** (audit B2) |
| How many bots an ability needs right now | the duty row's gain column, once per row | **the stat column drops `, {need} needed`** — it keeps only the verdict (audit B3) |
| What difficulty changes | the `#instKeyInfo` helper, once | the input is the control; the state line is the consequence at the current value. Three renders, three different jobs (audit B4) |
| Pull-out floor | the `Pull out at floor` input's own helper | **the running state line drops `pulling out at floor {n}`** — the live input is inches away showing the same number (the `DUP` this document found in Phase 1) |
| What the journal is for | the `Boss abilities` block sub | journal rows carry status only, never effects |
| Where script version is bought | the gated duty row's own string, as a POINTER to Training | Training does not mention the Dungeon gate |
| Enhance / gear / copper | not taught here at all | — |

| Block / state | Element | Final copy | Number source |
|---|---|---|---|
| idle 1 · running 1 | `#instState`, idle | `At difficulty {key}: {n} ability/abilities to block, {m} bots needed on each. Deepest floor so far: {best}.` | `main.js:973-974`; `instance.js:34-35` `liveMechanics = MECHANICS.slice(0, min(key,3))`, `needPerMechanic = ceil(key/2)`. The consequence readout — not a second explanation of difficulty |
| idle 1 · running 1 | `#instState`, running | `Floor {n} · {haul} items so far · dealing {pct}% damage.` | `main.js:967-968`. **`· pulling out at floor {n}` is CUT** — restates the live input directly below it |
| idle 2 · running 2 | `#instProject`, idle, bots assigned | `Sending {n} bots. They should reach about floor {f} before too many are banned.` | `main.js:976`; `instance.js:72-84` `projectDepth` runs the same `resolveFloor` the live run does, so the projection cannot lie |
| idle 2 · running 2 | `#instProject`, idle, none assigned (empty) | `Assign bots to a duty below, then send them in.` | `main.js:977`. Condition + way out |
| idle 2 · running 2 | `#instProject`, idle, party larger than the swarm (error) | `You've assigned {n} bots but only have {m} — lower a duty, or wait for the swarm to grow.` | `instance.js:89-92` `canStart` needs `floor(pop) >= partyCost`. **State D3: rendered as a silent disabled button.** Condition + way out |
| idle 2 · running 2 | `#instProject`, running | `{n} bots still alive · about {pct}% of them get banned on the next floor.` | `main.js:969-970`; `instance.js:39-42` `banRate = min(0.5, 0.02 × key × 1.15^(floor−1) × (proxy ? 0.75 : 1))` |
| idle 3 · running 3 | `h3` `Assign bots` + sub (the block's single teaching line) | `Assign bots` `— each ability needs a set number of bots on it to be blocked. An ability you leave unblocked cuts your damage every floor it fires, and when your damage falls below 25% of normal the party dies. Bots you send are spent — you get back whoever survives.` | `instance.js:49-67` `resolveFloor`; `instance.js:148` `inst.mult *= r.mult` **per floor** (the penalty compounds — defect A7); `instance.js:13` `WIPE_AT = 0.25` (`:22` is `WIPE_KEEP = 0.4`); `instance.js:101,126` bots leave the pool and survivors rejoin. Replaces `index.html:182`'s one-line sub and absorbs what the duty rows used to repeat |
| idle 3 · running 3 | duty row name | `Sunder` · `Mass Dispel` · `Summon Adds` | `instance.js:26-30`, §16 dungeon register — names only |
| idle 3 · running 3 | duty row sub | `−{pen}% damage every floor it's unblocked` | `main.js:479`; `instance.js:27-29` `pen` = 0.12 / 0.10 / 0.15. **`Blocked by {duty} bots.` is CUT** — the block sub owns it |
| idle 3 · running 3 | duty row gain, live | `needs {n} bots` | `main.js:993`; `instance.js:35`. The ONLY place the need renders |
| idle 3 · running 3 | duty row gain, not live at this difficulty | `appears at difficulty {n} and up` | `instance.js:34` — mechanic at index `i` goes live at `key >= i+1`, so Sunder 1, Mass Dispel 2, Summon Adds 3. Replaces `doesn't appear at difficulty {key}`, which named the current value instead of the threshold |
| idle 3 · running 3 | duty row gain, script-gated (locked) | `needs script version {n} — buy it on the Training tab` | `main.js:994`; `instance.js:37` `dutyUnlocked = bots.powerRank >= m.gate`, gates 0 / 3 / 5. POINTER + way out; the current string names the requirement with no route to it |
| idle 3 · running 3 | duty row stat, idle | `{n} assigned — blocked` / `{n} assigned — NOT BLOCKED` | `main.js:995-997`. **`, {need} needed` is CUT** — killing the audit's finding #3 |
| idle 3 · running 3 | duty row stat, running | `{n} still alive — blocked` / `{n} still alive — NOT BLOCKED` | `main.js:996`; `instance.js:57` counts whole bodies only |
| idle 3 · running 3 | duty row stat, not live / gated | `{n} assigned` | `main.js:997` |
| idle 3 · running 3 | duty allocation, running | inputs disabled — `the party is locked once they're inside` as the control's `title` | `main.js:485,991` |
| idle 4 · running 4 | `#instKey` label | `Difficulty` | `index.html:187`. The control |
| idle 4 · running 4 | `#instKeyInfo` (the concept, once) | `Higher difficulty means more abilities to block, more bots on each, better loot — and bots banned faster. You set it; it never drops on its own. If the party dies you keep 40% of what they found.` | `instance.js:34-35,39-42`; `instance.js:120` loot bias `min(3, floor(key/3))`; `instance.js:22` `WIPE_KEEP = 0.4`. Replaces `main.js:979-980` |
| idle 4 · running 4 | `#instBank` label | `Pull out at floor` | `index.html:188` |
| idle 4 · running 4 | `#instBank` helper (NEW) | `Your bots come home with everything the moment they clear this floor. You can change it mid-run.` | `instance.js:159` `finish(state, 1)` keeps the whole haul; `main.js:509-511` writes on change while running |
| idle 4 · running 4 | `#instProxy` label | `Buy proxies · 250c per run, 25% fewer bots banned` | `instance.js:17-18` `PROXY_COST = 250`, `PROXY_CUT = 0.25`. Already exact — unchanged |
| idle 4 · running 4 | `#instStart` | `Send bots in` | `index.html:193`. Unchanged — labels the action |
| idle 4 · running 4 | `#instBankNow` | `Pull out now — keep all {haul} items` | `index.html:194`; `instance.js:113-131`. Replaces `Pull out now (keep loot)` with the count |
| idle 5 · running 5 | `h3` `How it works` + body (**replaces the 6-line intro**) | `Your bots fight down through the floors on their own, and each floor takes longer than the last.` / `Some of them get banned on every floor, faster the deeper they go. When too many abilities go unblocked, the party dies.` / `If they die you keep 40% of what they found. Pull out early and you keep all of it.` | `instance.js:11-12` `FLOOR_SECONDS = 6`, `FLOOR_GROWTH = 1.15`; `instance.js:14-16,39-42` ban rate grows 15% per floor; `instance.js:22` `WIPE_KEEP = 0.4`. 6 lines → 3; it owns the run loop and nothing else (audit B1) |
| idle 6 · running 6 | `h3` `Boss abilities` + sub | `Boss abilities` `— there's no wiki and nobody to ask. You find out what an ability does by running into it. What you learn here is permanent: it survives a Ban Wave.` | `instance.js:153-156` writes the journal on contact and marks it solved on a block; `rebirth.js:36-51` never touches `state.instance`. Flavor line kept — it teaches nothing, and the line under it does |
| idle 6 · running 6 | journal row, unseen (empty) | `Unknown — you haven't met this one yet` | `main.js:1002`. Honest: three unknowns IS the first-visit state. The block sub above now says what they will become |
| idle 6 · running 6 | journal row, seen, never blocked | `{label} — met on a run, never blocked` | `main.js:1005`. **The entire effect sentence is CUT** (`main.js:1001` currently reprints `Assign {duty} bots to block it. Unblocked it costs you {pen}% damage.`, near-verbatim the duty row's sub) — audit B2 and the plan's own edge case |
| idle 6 · running 6 | journal row, solved | `{label} — met and blocked` | `main.js:1004` |
| state `locked` (whole tab) | `#tabs` button `title` | `Unlocks once you have 10 bots.` | `main.js:245` `dungeon: f.delve && s.bots.pop >= 10`; names the milestone, not the mechanics behind it |
| state `empty`/first-visit idle | — | three `Unknown` journal rows, `Deepest floor so far: 0`, `Assign bots to a duty below, then send them in.` — all written above | `state.js:62-72` |
| state `idle` | — | idle block set above | `main.js:971-978` |
| state `in-progress`/`running` | — | running block set above | `main.js:966-970` |
| state `error` | — | two real paths, both written above: nothing assigned, and party larger than the swarm. A wipe is a game-rule outcome with its own log line, not a UI error | `instance.js:89-92` |

**Dungeon log lines (in scope — `main.js` tick):**

| Trigger | Final copy | Number source |
|---|---|---|
| run starts | `Sent {n} bots in at difficulty {key}.` | `main.js:515` |
| ability unanswered | `{label} went unblocked on floor {n} — another {pen}% off your damage.` | `main.js:651`; `instance.js:148` compounds per floor. **Replaces "you're dealing {pen}% less damage"**, which implied one flat hit (defect A7) |
| bots banned | `{n} bots banned on floor {f}.` | `main.js:652`; `instance.js:146` |
| wipe | `The party died on floor {n}. You kept {k} of {haul} items — 40% of the haul.` | `main.js:653`; `instance.js:158` `kept = floor(haul × 0.4)` |
| pull-out | `Pulled out at floor {n} with all {k} items.` | `main.js:654,520`; `instance.js:159` |

---

### Shared chrome, log lines and locked-tab copy

Produced by Phase 5 alongside the six specs. These strings are NOT owned by
any single tab — they are the global chrome and the activity log, which
`## Fact ownership` lists as POINTER echoes or as event history rather than
tab content. They sit here so no spec has to duplicate them, and so the
Phase 5 scope line "log lines, for all six tabs" has a home.

**Resource bar (POINTER echoes — a headline value each, never a breakdown):**

| Element | Final copy | Number source |
|---|---|---|
| `#cpEl` / `#cpRate` | `{n}` · `combat power · +{r}/s` | `main.js:668,676`. Breakdown is owned by Player |
| `#resBots` / `#resRate` | `{free} / {cap}` · `bots free · +{n}/h` | `main.js:699-700`; `bots.js:110-112` `freeBots = pop − allocTotal`. **`free` added to the label** — it is a different numerator from Training's population bar, and the two were indistinguishable |
| `#copperEl` / `#copperRate` | `{n}c` · `copper · +{r}/s` | `main.js:680,696` |
| `#scriptsEl` / `#scriptMultEl` | `{n}` · `scripts · ×{m} damage` | `main.js:685-686`; `rebirth.js:25-27` `scriptMult = 1 + 0.01 × scripts`. Hidden until the first Ban Wave (`main.js:682`) |
| `#helpBtn` | `?`, `title` = `Help` | `index.html:32` |

**Locked tab buttons (DW-5.3, and the plan's "no spoilers" edge case).**
`showTab` returns early for a locked tab (`main.js:220`), so pane copy would
never render — the unlock condition goes on the button's `title`. Each names
the milestone and nothing about the content behind it:

| Tab | Button label | `title` | Condition in source |
|---|---|---|---|
| Boss | `Boss` | — | always open (`main.js:206` has no `battleSec` key) |
| Training | `???` | `Unlocks as soon as the game starts.` | `main.js:241` |
| Grind | `???` | `Unlocks with Training.` | `main.js:242` |
| Player | `???` | `Unlocks when your bots find their first piece of gear.` | `main.js:243` |
| Delve | `???` | `Unlocks at 100 Combat Power.` | `main.js:244` |
| Dungeon | `???` | `Unlocks once you have 10 bots.` | `main.js:245` |

**Unlock announcements (`UNLOCK_MSG`, `main.js:208-215`).** Each is the
discovery trigger `## Page specs` names above, so each states what the new
tab lets you DO — register name first, plain consequence second:

| Key | Final copy | Note |
|---|---|---|
| `training` | `NEW: Training — run scripts on your bots to raise their ATK and speed.` | — |
| `grind` | `NEW: Grind — put bots on zones to earn copper and roll for gear.` | — |
| `player` | `NEW: Player — your character. Equip, enhance and reforge gear here.` | — |
| `delve` | `NEW: Delve — your character digs on their own for Cache. Spend it on upgrades that feed every other system.` | **Replaces `descend for copper; bank before you wipe`, which describes the RETIRED Delve** — the live one pays Cache and has no descend, bank or wipe (defect A3; `dungeon.js:1-7`) |
| `dungeon` | `NEW: Dungeon — send bots in for gear. They don't all come back.` | — |
| `rebirth` | `NEW: Ban Wave — reset your bots and training for permanent Scripts.` | — |

**Other global log lines:**

| Trigger | Final copy | Number source |
|---|---|---|
| offline catch-up | `While you were away ({h}h): +{c} copper, {n} drops.` | `main.js:184` |
| offline at the clamp | `While you were away ({h}h): +{c} copper, {n} drops. Offline progress caps at 12 hours.` | `farm.js:6` `OFFLINE_CAP_S = 12 × 3600`. **The cap was never stated anywhere** (state D7) |
| offline delve | `While you were away: +{n} Cache.` | `main.js:189` |
| offline siege | `While you were away: {n} health off {boss.name}.` | `main.js:195` |
| wall breaks | `★ W{n} BREACHED — {boss.name}` | `main.js:86`. Unchanged |
| break piece | `◆ {piece.name} recovered · +{pct}% {lane} — farm the door for the rest` | `main.js:88` |
| farm piece | `◆ {piece.name} dropped · +{pct}% {lane}` | `main.js:638` |
| set completes | `★ {set.name} SET COMPLETE — ×1.50 damage` | `main.js:639`; `trophies.js:23` |
| a drop lands | `drop: {Rarity} {name} {ip}IP · {equipped\|stashed\|salvaged +{n} {rarity} scrap}` | `main.js:144-145`. Unchanged |
| Armory rank-up | `ARMORY — {name} rank {from}→{to}, +{pct}% {lane}` | `main.js:148` |
| bulk salvage | `Salvaged {n} items → {tally} scrap.` | `main.js:545` |
| enhance milestone | `[Server] a player has reached +{plus}. Players online: 1.` | `main.js:168` at `plus >= 16`. Unchanged — this is the shell register at its one intended edge, and it is the game's whole premise in one line |
| title earned | `★ title: +{plus}` | `main.js:172` at `plus >= 18` |
| Ban Wave | `! Ban Wave #{n} — farm reset · banked +{s} Scripts (×{m} damage)` | `main.js:417`; `rebirth.js:25` |
| log header | `maintenance@dead-server:~$ ▮` | `index.html:204`. Unchanged — DESIGN.md confines the shell register to exactly here |

**Footer / meta:**

| Element | Final copy | Note |
|---|---|---|
| `#exportBtn` | `export save` | unchanged |
| export modal body | `Copied to clipboard — or select all below and copy:` | `main.js:458`. Unchanged |
| `#wipeBtn` | `wipe save (dev)` | unchanged |
| wipe confirm (destructive) | `Wipe this save? Your character, gear, trophies and door progress are all deleted permanently. This can't be undone.` | `main.js:266`. Yifrah destructive formula — specific loss + permanence, replacing `Wipe this character's save? (dev button)` |

---

### Lexicon audit (DW-5.4)

Every `REMAKE-DESIGN.md` §16 register name that survives into the copy
above, with the plain-English clause that defines it and where that clause
lives. The test (`content-design.md` §C4): could a reader with no visual
context act from the words alone? A name whose meaning is not on the same
line, or one stated pointer away, is a fail.

| Register name | Where the plain-English definition lives | The clause |
|---|---|---|
| multiclient | its own button | `{cap} → {nextCap} bot slots` |
| account creator | its own button | `{rate} → {nextRate} bots per hour` |
| script version | its own button | `bot strength ×{p} → ×{nextP}` |
| overclock (rig) | its own button | `bot speed ×{s} → ×{nextS}` |
| swing macro … tick-rate exploit | `ATK scripts` `h3` sub | `put bots on a script to run it; every fill it completes adds its ATK permanently` |
| autoclicker … hypervisor clock | `SPEED scripts` `h3` sub | `same as ATK, for hits per second` |
| Ban Wave | its section's teaching line | `resets your bots, your training and your copper… you bank √(training fills) as Scripts` |
| Scripts | same line | `every Script permanently adds +1% damage` |
| zone names, mob names | `Zones` `h3` sub | `put bots on a zone… every kill pays copper` |
| IP | `Zones` `h3` sub (band) + `Stash` `h3` sub (item) | `the power band those drops roll in` / `how strong those affixes roll` — two different halves, neither a repeat |
| plus | `Gear` `h3` sub | `every plus multiplies its base power by 1.12` |
| failstack | `Gear` `h3` sub | `worth +1 percentage point on your next attempt, up to +15` |
| safeguard | its own toggle label | `3× the copper, but a failure doesn't cost you a plus` |
| affix | `Stash` `h3` sub | `rarity is how many affixes it rolled (Common 0, Origin 6)` |
| scrap | `Stash` `h3` sub | `salvaging turns an item into scrap of its own rarity` |
| Reforge | its own teaching line | `rerolls an item's affixes for scrap of its own rarity` |
| Trophy / set / door parts | `Trophies` `h3` sub | `each Warden has a 7-piece set… a complete set multiplies your damage by 1.5` |
| Armory / entry / rank | `Armory` `h3` sub | `every drop is logged here against its own entry… each rank is a permanent bonus` |
| haste | `Combat Power` `h3` sub | `a percentage added to hits per second` |
| Delve / Cache | `Delve` `h3` sub | `your character digs on their own down here` / `the buried server data you spend below` |
| deeper bore, cache sifter, recovered overclock, salvage beacon, buried scripts | each row's own gain string | `+1 depth per rank`, `+20% Cache per second per rank`, … |
| instance / floor / haul | `How it works` block | `fight down through the floors… each floor takes longer than the last` |
| duty / blocked | `Assign bots` `h3` sub | `each ability needs a set number of bots on it to be blocked` |
| Sunder / Mass Dispel / Summon Adds | each row's own sub | `−{pen}% damage every floor it's unblocked` |
| key (difficulty) | the input is labelled `Difficulty` in plain English; `key` never reaches the player | the register name is deliberately not surfaced |
| wipe | `How it works` block | `when too many abilities go unblocked, the party dies` |
| journal | `Boss abilities` `h3` sub | `what you learn here is permanent` |
| proxy | its own toggle label | `250c per run, 25% fewer bots banned` |
| Warden / door / breach | boss title + the break log line | `Warden of the First Door` · `★ W1 BREACHED` |
| `maintenance@dead-server:~$` · `Players online: 1` | not defined, deliberately | the shell register at its two intended edges (DESIGN.md `## Direction`) — atmosphere, never an instruction. No control depends on reading it |

**Result:** every name that governs a control is defined on its own line or
one stated pointer away. The only undefined strings are the two shell-register
lines, which carry no instruction and gate no action.

---

## Phase 2: Help tab + copy relocation

Produced by Phase 2 of `.design-foundations/plans/2026-07-26-visual-pass-and-help-tab.md`.
Doctrine: `journey` (page-spec altitude, IA gating), `content-design`
(Redish scanning/plain-language, the reader's-state workflow), `usability`
(Hick's law citation restated at seven tabs, Nielsen #10 help & documentation).

**Why this section exists.** The previous plan's Phase 5 wrote plain-English
copy for every content block and, in doing so, put a teaching sentence on
nearly every one — the Boss tab prints `Crits ×1.16 average damage — 10.0%
of hits crit for ×2, and 20.0% of those crit again for ×5` beside the number
it already displays. That is a tutorial living in a HUD. This section moves
every *general* mechanic explanation off the six live tabs into a seventh,
Help, leaving numbers, controls and current-state readouts behind. Nothing
is deleted — several of the explanations being relocated correct a
genuinely wrong shipped label and have to survive somewhere; this section is
where they land.

### The stays/moves rule

Quoting the plan's own constraint: *"A live surface keeps any string a
player needs AT the moment of the decision; everything that teaches a
mechanic in general moves."* Operationalized against this document's own
"Explained-once register" tables (six of them, one per tab, each already
naming the ONE element that teaches each mechanic — the previous plan's own
inventory of exactly the strings this phase has to move):

- **MOVES:** every element named as "the tab's teaching line" / an `h3` sub
  in the six Explained-once registers — a repeatable "how X works" rule
  that doesn't depend on the player's current state (Redish, *Letting Go of
  the Words*, 2007: the reader scans for their current goal, not a general
  lesson).
- **STAYS:** every per-row cost/chance/state readout, every error
  condition+fix message (Yifrah's formula), every destructive-confirm
  message (states the consequence at the moment of the action — Ban Wave's
  armed-state string is the existing model for this and is untouched), and
  every POINTER to another tab's owned fact.
- **STAYS, short flavor:** a line that names an event but explains nothing
  (already an established convention in this document — Ban Wave's `— the
  anti-cheat notices the farm`, the Record line's broken-state flavor,
  Boss-abilities' `there's no wiki and nobody to ask` opener) is kept; only
  the mechanic-teaching clause riding alongside it moves.

### Relocation table (DW-2.1 / DW-2.3)

Every row below is one element from a tab's own Explained-once register (or,
for the two rows already flagged by Phase 1, its Final-copy table). "Stays
on the tab" states what (if anything) remains after the general clause is
cut; "New home" names the Help content block below. Nothing in this table
is a new judgement about IA, fact ownership or state — it only decides
where teaching prose physically renders.

**Boss** *(both already cut by Phase 1 hand-fixes; this phase only gives them a home)*

| Element (source line) | What moves | Stays on Boss | New home |
|---|---|---|---|
| `#cooldown`, broken-with-set (JOURNEY `Boss` spec, block 4) | Farm roll interval (30s) and drop chance (25%) | `Set pieces {n} of 7 — on the Player tab.` (state only) | Help → Boss § "Farming a cleared door" |
| `#projection` ledger (JOURNEY `Boss` spec, block 4) | The crit/super-crit mechanic explanation — chained chance, why "average" is the number that multiplies damage | The ledger itself: `Crit / {rate}% / ×{critMult}` · `Super crit / {superRate}% / ×{superMult}` · `Average / ×{factor}` (all four numbers, live) | Help → Boss § "Crits" |

**Training**

| Element | What moves | Stays on Training | New home |
|---|---|---|---|
| `#popFill` caption (JOURNEY Training spec, block 1 — **missed in the first pass, added on review**) | The differentiation clause only: "this bar is every bot you own; the counter at the top of the screen is the ones not assigned to anything" — a general fact about two chrome elements, true regardless of current numbers | The count itself: `{pop} of {cap} slots filled` (state, unchanged) | Help → Training § "Bot pool" |
| `ATK scripts` `h3` sub | "put bots on a script to run it; every fill adds ATK permanently; 50/s cap; the unlock rule" | bare `h3` heading `ATK scripts`, `#barAtkInfo` totals, per-row gain/stat (unchanged) | Help → Training § "Scripts" |
| `SPEED scripts` `h3` sub | "same as ATK, for hits/s; past the knee, returns shrink" | bare `h3` heading, `#barSpeedInfo` totals, per-row stats | Help → Training § "Scripts" (same block — ATK/SPEED share one explanation, as the original "same as ATK" line already intended) |
| `Enhance squad` `h3` sub | "bots that keep pressing enhance for you; same odds/cost; pick slot + target" | bare `h3` heading, slot picker, target input, `#botEnhInfo` state lines (already decision-point) | Help → Training § "Enhance squad" |
| Ban Wave teaching line (`main.js` render, above `#banWaveInfo`) | "resets bots/training/copper; gear/trophies/Armory/titles/door progress survive; banks √(fills) as Scripts; +1% damage per Script, permanent" | `h3` + flavor sub (`— the anti-cheat notices the farm`), `#banWaveInfo` live numbers, the armed-state destructive-confirm string (unchanged — already Yifrah-correct) | Help → Training § "Ban Wave" |
| `#helpModal` (`HELP[banwave]`, retired) | "when to bank (the √ judgement); bots borrow 10% ATK / 10% hits-per-second of the player's own stats" | — (button retargeted to the Help tab, see Global chrome table) | Help → Training § "Ban Wave" (same block, folded in — this is the content the modal already isolated as reference-only) |

**Grind**

| Element | What moves | Stays on Grind | New home |
|---|---|---|---|
| `Zones` `h3` sub | "put bots on a zone; combined damage must clear the hold number; 50 kills/s cap; 1-in-400 drop chance; IP is the power band" | bare `h3` heading, per-row name/mob/HP/copper/IP-band/state text (all decision-point, unchanged) | Help → Grind § "Zones" |

**Player**

| Element | What moves | Stays on Player | New home |
|---|---|---|---|
| `Combat Power` `h3` sub | "CP = ATK × hits/s; what haste means" | bare `h3` heading, the three chip labels (`combat power` / `ATK` / `hits/s`, self-labeling) | Help → Player § "Combat Power" |
| `Gear` `h3` sub (enhance) | "plus multiplies base power ×1.12; failstack mechanic, cap +15" | bare `h3` heading, safeguard toggle's own label, per-attempt `#sei_*` lines (cost/chance/fallout — decision-point) | Help → Player § "Enhance" |
| Reforge teaching line | "rerolls affixes for scrap of the same rarity; can't change rarity/IP; preview before committing" | `Reforge` label line, `#rfi_*` price, `#rfc_*` candidate + Keep/Roll again/Discard | Help → Player § "Reforge" |
| `Stash` `h3` sub | "rarity = affix count (Common 0 → Origin 6); IP = affix strength; salvage → scrap; lock protects from auto-salvage/sweep/overflow" | bare `h3` heading, stash rows (rarity/IP/affixes shown per item, unchanged) | Help → Player § "Stash" |
| `Trophies` `h3` sub | "each Warden has a 7-piece set; a complete set is ×1.5 damage; pieces come from farming (POINTER to Boss)" | bare `h3` heading, `{n}/10 sets complete`, per-set `{have}/7`, the live `×1.50 damage` on a completed set (all state) | Help → Player § "Trophies" |
| `Armory` `h3` sub | "every drop logs to its entry; rarity weights (Common 1 → Origin 13); rank cost formula; cap at rank 12; weapon/armor/charm lanes; survives Ban Wave" | bare `h3` heading, `#armorySub` aggregate, per-cell `R{n} · +{pct}%` | Help → Player § "Armory" |

**Delve**

| Element | What moves | Stays on Delve | New home |
|---|---|---|---|
| `Delve` `h3` sub | "digs on its own, no input; depth from Combat Power (floor 1 = 10 dps, +70%/floor); +35% Cache/s per floor" | bare `h3` heading, `#delveState` (depth/deepest/Cache-rate, live), `#delveCache` balance | Help → Delve § "How depth works" |
| `Cache tree` `h3` sub | "each row buys one rank; prices rise per rank" | bare `h3` heading, each row's own gain string + rank readout (decision-point, unchanged) | Help → Delve § "Cache tree" |

**Dungeon**

| Element | What moves | Stays on Dungeon | New home |
|---|---|---|---|
| `How it works` block (idle/running block 5, 3 lines) | The entire block — floors, attrition growth, the wipe rule, the 40%-kept rule | Nothing — the block is removed from the live tab entirely (its sole job was general teaching, per its own register row: "nothing else mentions floors or the wipe rule") | Help → Dungeon § "How a run works" |
| `Assign bots` `h3` sub | "each ability needs N bots to be blocked; unblocked cuts damage every floor; below 25% the party dies; bots are spent, survivors come home" | bare `h3` heading, per-duty `needs {n} bots`, `−{pen}% damage every floor it's unblocked`, `{n} assigned — blocked/NOT BLOCKED` (all decision-point) | Help → Dungeon § "Assigning bots" |
| `#instKeyInfo` (difficulty helper) | "higher difficulty = more abilities/more bots/better loot/faster bans; you set it, it never drops; wipe keeps 40%" | `#instKey` label `Difficulty`, the state-line's live consequence numbers (abilities to block, bots needed, deepest floor) | Help → Dungeon § "Difficulty" |
| `#instBank` helper (JOURNEY Dungeon spec, idle 4 · running 4 — **missed in the first pass, added on review**) | The whole sentence: "your bots come home with everything the moment they clear this floor; you can change it mid-run" — a general rule about the setting, true regardless of the floor it's currently set to, same class as the Difficulty helper above | `Pull out at floor` label + the input's own value (state) | Help → Dungeon § "Pull-out floor" |
| `Boss abilities` `h3` sub | "you learn an ability by running into it; what you learn is permanent, survives a Ban Wave" | flavor opener only: `there's no wiki and nobody to ask` | Help → Dungeon § "Boss abilities journal" |

**Tally (DW-2.3):** 22 relocations (2 Boss + 6 Training + 1 Grind + 6 Player +
2 Delve + 5 Dungeon), every one landing in exactly one of the 6 Help content
blocks below. No mechanic is dropped; no fact changes owner (a moved
sentence still describes the same tab's mechanic — it only changes which
tab renders it).

### Help

**Purpose:** Answer "how does X work?" for every mechanic in the game, once,
in one place — the general explanations the six live tabs no longer carry.

**Entry points:** Tab nav (always the seventh button, never `locked`); the
resource bar's `?` button, retargeted this phase to switch to this tab
instead of opening the retired `#helpModal`.

**Primary decision:** None — Help is reference only, no action resolves
here. (Matches the existing convention for a tab with no discrete run mode,
e.g. Delve's `in-progress: N/A`.)

**Content blocks (in order — mirrors the tab bar's own order, so the mental
model a player already has for "where do I find X" carries over unchanged,
Jakob's Law):**

1. **Boss** — Crits (the chained crit/super-crit chance and why "average" is
   the multiplying number); Farming a cleared door (roll interval, drop
   chance).
2. **Training** — Bot pool (population bar vs. the resource-bar free-bots
   counter); Scripts (fill → gain → 50/s cap → unlock rule, ATK and
   SPEED together); Enhance squad; Ban Wave (what resets, what survives, the
   √ formula, the permanent +1%/Script, the √-judgement, the bot-DPS
   fraction — the full retired-modal content folded in).
3. **Grind** — Zones (hold requirement, kill cap, drop chance, IP band).
4. **Player** — Combat Power (the ATK × hits/s definition, what haste
   means); Enhance (plus formula, failstacks); Reforge; Stash (rarity/IP/
   salvage/lock); Trophies (7-piece sets, the ×1.5 bonus, POINTER to Boss
   for farming); Armory (merge weights, rank-cost formula, the rank-12 cap,
   lane per slot type).
5. **Delve** — How depth works (the Combat-Power-to-depth formula, the
   Cache-per-floor rate); Cache tree (prices rise per rank).
6. **Dungeon** — How a run works (floors, attrition, the wipe, the 40%
   kept); Assigning bots (the blocking mechanic, the 25% wipe floor);
   Difficulty (what raising it changes); Pull-out floor (bots come home with
   everything at that floor, editable mid-run); Boss abilities journal (how
   discovery works, permanence across Ban Wave).

**States:** Each numbered block above is gated by the SAME unlock condition
as its tab (Design Decision 2, Phase 2 discovery) — reusing the exact
conditions already in `## IA`'s sitemap, not a new gate:

| Block | Gate | Locked-state copy |
|---|---|---|
| 1 Boss | none (always open) | never locked |
| 2 Training | `state.unlocked` | `Unlocks as soon as the game starts.` (existing string, `main.js:241`) |
| 3 Grind | `features.training` | `Unlocks with Training.` (existing string, `main.js:242`) |
| 4 Player | `features.grind && everDropped` | `Unlocks when your bots find their first piece of gear.` (existing string, `main.js:243`) |
| 5 Delve | `features.player && CP ≥ 100` | `Unlocks at 100 Combat Power.` (existing string, `main.js:244`) |
| 6 Dungeon | `features.delve && bots.pop ≥ 10` | `Unlocks once you have 10 bots.` (existing string, `main.js:245`) |

A locked block renders its milestone string only — the same "no spoilers"
rule the tab bar itself already follows (`## Page specs`' "Locked tab
buttons" table). This is not new copy: every locked-state string above is
reused verbatim from the tab button `title` it already ships.

**Primary action:** N/A — reference only, no button resolves anything here.

**Exit:** Tab switch (back to whichever tab prompted the lookup — Help has
no forced next page, hub-and-spoke like every other tab).

**Microcopy — final copy, assembled from the relocated sentences above
(reused verbatim where the sentence survives out of its original context;
lightly restitched where it assumed a specific rendered number beside it —
noted inline):**

| Block | Element | Final copy | Source |
|---|---|---|---|
| 1 Boss | `h3` "Crits" | `Every hit has a chance to crit for extra damage, and a crit has its own chance to crit again — a super-crit — for even more. The Boss tab's Average row is what your damage actually multiplies by once both chances are folded in.` | Restitched from the Boss `#projection` prose Phase 1 cut (`crits.js:30-32`, `BASE = {rate 0.10, superRate 0.20, critMult 2, superMult 5}`) — the base rates/multipliers are the general mechanic; the LIVE numbers stay on Boss's own ledger. |
| 1 Boss | `h3` "Farming a cleared door" | `Once a door is open, farming it rolls for the rest of that Warden's trophy set every 30 seconds — each roll a 25% chance to drop the next piece.` | `pull.js:49` `FARM_INTERVAL=30`; `trophies.js:24` `FARM_DROP_CHANCE=0.25`. Verbatim facts, prose form new (the original line was cut mid-sentence by Phase 1, not carried as a full sentence). |
| 2 Training | `h3` "Bot pool" | `The population bar is every bot you own, filled or not. The counter at the top of the screen is only the ones not assigned to any job.` | Restitched from the `#popFill` caption (missed in the first relocation pass — added on review), `main.js:773` `pop/capacity`; `main.js:699` resbar `freeBots/capacity`. The count itself (`{pop} of {cap} slots filled`) stays on Training. |
| 2 Training | `h3` "Scripts" | `Put bots on a script to run it. Every fill it completes adds its stat — ATK or hits per second — permanently. Any one script tops out at 50 fills per second; the next script down unlocks once the one above it has enough fills. Speed has one more rule: past a threshold that rises with each deeper Warden, extra hits per second still count, just less.` | Verbatim merge of the ATK and SPEED `h3` subs (`bots.js:38` `MAX_FILLS_PER_S=50`; `bots.js:205-214`; `stats.js:22,25-27` `softHits`/`SPEED_KNEE`; `bosses.js` `speedKnee` 5.0→70.0). |
| 2 Training | `h3` "Enhance squad" | `Bots that keep pressing enhance on one item for you. Same odds and the same copper cost as doing it yourself — they just never stop. The odds and the fallout are on the Player tab.` | Verbatim, `bots.js:236-249`. |
| 2 Training | `h3` "Ban Wave" | `Banking a Ban Wave resets your bots, your training and your copper to the start. Everything your character owns stays: gear, plusses, scrap, trophies, Armory ranks, titles and door progress. In exchange you bank √(training fills) as Scripts, and every Script permanently adds +1% damage. Scripts never reset.` `Bank when the payout is worth the reset. Scripts are the square root of your training fills, so pushing twice as long pays well under twice the Scripts.` `Your bots borrow your power — each one hits at 10% of your ATK and 10% of your hits per second. So more damage means a faster farm too, and every Ban Wave rebuilds quicker than the one before.` | Verbatim: paragraph 1 was the inline teaching line (`rebirth.js:36-51`, `:20-22`, `:11` `SCRIPT_DMG=0.01`); paragraphs 2–3 are the retired `#helpModal`'s content (`rebirth.js:20`; `bots.js:24-25,71-75` `BOT_ATK_FRAC`/`BOT_SPD_FRAC=0.10`). |
| 3 Grind | `h3` "Zones" | `Put bots on a zone. Their combined damage has to clear the zone's hold number or they earn nothing at all. A zone they can hold kills up to 50 mobs a second; every kill pays copper and has a 1-in-400 chance to drop a piece of gear. IP is the power band those drops roll in — deeper zones drop higher.` | Verbatim, `bots.js:145-156`, `farm.js:7,5,31-48`. |
| 4 Player | `h3` "Combat Power" | `Your damage per second against the door: ATK multiplied by hits per second. "Haste" anywhere on the Player tab is a percentage added to hits per second.` | Verbatim (minus the "everything below feeds these two numbers" clause, which only made sense inline), `stats.js:52-55`, `pull.js:15-18`. |
| 4 Player | `h3` "Enhance" | `Three slots. Enhancing raises an item's plus, and every plus multiplies its base power by 1.12. A failed attempt anywhere banks a failstack worth +1 percentage point on your next attempt, up to +15; a success spends the whole bank.` | Verbatim, `gear.js:26-28`, `enhance.js:11,25-27,58`. |
| 4 Player | `h3` "Reforge" | `Reforge rerolls an item's affixes for scrap of its own rarity. It can't change the rarity or the IP — only which affixes it has and what they roll. You see the result before you decide whether to keep it.` | Verbatim, `gear.js:132-155`. |
| 4 Player | `h3` "Stash" | `Where kept drops land, up to 50. An item's rarity is how many affixes it rolled (Common 0, Origin 6) and its IP is how strong those affixes roll. Salvaging turns an item into scrap of its own rarity. Locking one protects it from auto-salvage, the bulk sweep and the stash-full clear-out.` | Verbatim, `gear.js:47,51-63,66-78,105,122`, `rarity.js:6-14`, `affixes.js:57-61`. |
| 4 Player | `h3` "Trophies" | `Each Warden has a 7-piece set. Breaking its door gives you the first piece; the rest come from farming that Warden on the Boss tab. A complete set multiplies your damage by 1.5.` | Verbatim, `trophies.js:14-23,65-69`. POINTER to Boss unchanged. |
| 4 Player | `h3` "Armory" | `Every drop is logged here against its own entry, one per item name, whether you keep it or scrap it. Rarer copies count for more: a Common is worth 1 point, an Origin 13. The first rank costs 3 points and each rank after costs 60% more, up to rank 12. Weapons rank ATK, armor ranks haste, charms rank copper — and the ranks survive every Ban Wave.` | Verbatim, `armory.js:16,17,26-30,15,20`, `rebirth.js:36-51`. |
| 5 Delve | `h3` "How depth works" | `Your character digs on their own down here, no input needed. Depth is however deep your Combat Power clears: floor 1 needs 10 damage per second and each floor after needs 70% more. Every extra floor pays 35% more Cache per second, and Cache is the buried server data you spend below.` | Verbatim, `dungeon.js:8,9,11-17,45-48`. |
| 5 Delve | `h3` "Cache tree" | `Each row buys one rank. Every rank you buy raises that row's next price.` | Verbatim, `dungeon.js:30`. |
| 6 Dungeon | `h3` "How a run works" | `Your bots fight down through the floors on their own, and each floor takes longer than the last. Some of them get banned on every floor, faster the deeper they go. When too many abilities go unblocked, the party dies. If they die you keep 40% of what they found. Pull out early and you keep all of it.` | Verbatim, `instance.js:11-12,14-16,39-42,22`. |
| 6 Dungeon | `h3` "Assigning bots" | `Each ability needs a set number of bots on it to be blocked. An ability you leave unblocked cuts your damage every floor it fires, and when your damage falls below 25% of normal the party dies. Bots you send are spent — you get back whoever survives.` | Verbatim, `instance.js:49-67,13,148,101,126`. |
| 6 Dungeon | `h3` "Difficulty" | `Higher difficulty means more abilities to block, more bots on each, better loot — and bots banned faster. You set it; it never drops on its own. If the party dies you keep 40% of what they found.` | Verbatim, `instance.js:34-35,39-42,120,22`. |
| 6 Dungeon | `h3` "Pull-out floor" | `Your bots come home with everything the moment they clear the floor you set here. You can change it mid-run.` | Verbatim (missed in the first relocation pass — added on review), `#instBank` helper, `instance.js:159` `finish(state, 1)` keeps the whole haul; `main.js:509-511` writes on change while running. The `Pull out at floor` label and the input's own value stay on Dungeon. |
| 6 Dungeon | `h3` "Boss abilities journal" | `You find out what an ability does by running into it. What you learn here is permanent: it survives a Ban Wave.` | Restitched from the flavor-plus-fact original (`instance.js:153-156`; `rebirth.js:36-51` never touches `state.instance`) — the flavor half (`there's no wiki and nobody to ask`) stays on Dungeon per the stays/moves rule above. |
| locked block | (any) | The matching milestone string from `## Page specs`' "Locked tab buttons" table — reused verbatim, not restated here. | `main.js:241-245` |

### Tab row re-fit (DW-2.4)

Adding a seventh tab to `#tabs{display:grid;grid-template-columns:
repeat(3,1fr)}` (`internal/mocks/build.mjs`'s current shipped grid, "wraps
3+3 on a phone rather than scrolling") auto-places 7 children as 3+3+1 — one
button alone on a row two-thirds empty beside it. That is an *extension*,
not the *re-fit* the plan's own constraint asks for.

**Rendered and measured** in `internal/mocks/tabrow-specimen.html` (reuses
DESIGN.md v3 tokens verbatim — the same `--gold`/`--panel`/`--edge-lit`/
`--radius-control`/`--font-ui`/`--tab-pad`/`--touch-min` values `build.mjs`
already carries, zero new hex, zero new one-off px) at 375px via the same
headless-Chrome/CDP pattern `internal/mocks/shoot.mjs` uses for the six real
mocks. Two variants, same seven labels (Boss/Training/Grind/Player/Delve/
Dungeon/Help):

| Variant | Grid | Layout | `document.scrollWidth` at 375px | Button width | Text truncation |
|---|---|---|---|---|---|
| A — rejected | `repeat(3,1fr)` (unchanged, merely extended) | 3+3+1, orphaned 7th button | 375 (no overflow) | 117px | none |
| B — chosen | `repeat(4,1fr)` (re-fit) | 4+3, uniform | 375 (no overflow) | 87px | none |

Screenshot: `internal/mocks/shots/tabrow-specimen-375.png`. Neither variant
technically overflows — CSS Grid auto-wraps rather than forcing a scrollbar
— which is exactly why DW-2.4 has to be proven on the rendered shape, not
just the scrollWidth number: variant A passes the letter of "no horizontal
scroll" while failing the plan's explicit "re-fitted, not merely extended."
Variant B is the chosen re-fit: `repeat(4,1fr)` lays 7 buttons out 4+3, all
uniform width, 87px per button (well above the `--touch-min: 44px` floor
kept on button height), no text truncation on the longest labels
(`Training`, `Dungeon`), zero new colour or typography — a grid-track-count
change only, staying inside this phase's OUT-of-scope boundary on visual
styling. This is the CSS change Phase 3 carries into the six recomposed
mocks plus the new Help mock; Phase 2's job was to prove it fits before that
work is spent.
