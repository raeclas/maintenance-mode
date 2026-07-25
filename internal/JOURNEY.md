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
├── tab nav (6 buttons, "???" label pre-unlock)
├── help modal
├── activity log ("maintenance@dead-server:~$")
└── footer (export / wipe save)

Spokes (six tabs — unlock condition in main.js checkUnlocks()):
├── Boss        [always open — entry point]
│   └── wall selector (local nav, appears once `maxWall>1` — i.e. after the first wall clear)
├── Training     [opens: state.unlocked — first login tick]
│   └── Ban Wave section (sub-panel inside Training, not a 7th tab;
│       opens: cleared.length≥1 OR rebirths≥1)
├── Grind        [opens: features.training]
├── Player       [opens: features.grind AND state.everDropped]
├── Delve        [opens: features.player AND Combat Power ≥ 100]
└── Dungeon      [opens: features.delve AND bots.pop ≥ 10]
```

One structural note the audit surfaced and this IA carries forward: a
seventh spoke, GM (the meta-currency spend surface), existed until `82d2d99`
retired it along with the ticket economy. A meta-currency redesign is
queued (per the plan's Assumptions) and will re-add ONE spoke to this
sitemap, additively, once designed — not a reason to treat the six-tab
structure above as final forever, but it is the complete, correct structure
for this plan.

**Global navigation labels:** Boss · Training · Grind · Player · Delve ·
Dungeon. A locked tab's button label is literally `???` (`renderTabs()` in
`main.js`) — a real, intentional state (progressive unlock, not a bug),
carried into DW-1.5's state column below as `locked`.

**Navigation model:** global nav only (the six-button tab bar is the entire
navigation system) plus one piece of local/contextual nav: the wall selector
inside the Boss tab, which appears once `maxWall>1` (`main.js:738`) — i.e.
from the first wall clear onward — letting them switch which cleared Warden's
Farm status they're viewing. No breadcrumbs, no search (not applicable at this content scale —
Hick's law doesn't demand grouping six items further; Miller/Cowan's ~4±1 is
about working-memory load, not on-screen item count, per the doctrine's own
citation — six visible tab buttons is not a violation).

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
| Tab nav labels (6) | — (nav is the IA itself) | 1 live (Boss) + up to 5 `locked` at game start, unlocking per ladder | `#tabs` | `locked` renders literally as `???`. |
| Activity log | — (event history, not live state) | live (rolling, capped 40 lines) | `#log` | Out of scope for fact-ownership dedup by design: the log's job IS to echo past events after the fact; it is not a second simultaneous render of current state. |
| Help modal (Ban Wave topic) | **Training tab** | live once available | `#helpModal` | On-demand reference, not a duplicate render (not shown unless opened). |
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
| Rig stats line: `script ×P · clock ×S · lost to bans N` | live | `#rigStats` | `botPower`/`botSpeed` feed `botDps`, a parallel (non-CP) product | "lost to bans" is **permanently 0 and vestigial** — Grind zones stopped banning bots (`4d41da7`); only the Dungeon bans now. State: `dormant` (structurally, forever, until this line is retired or repointed — flagged for Phase 5 copy work, not fixed here per this phase's OUT-of-scope boundary). |
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
  figure is permanently 0 (vestigial, flagged for Phase 5 copy — not a
  structural state, noted so it isn't mistaken for a bug in Phase 6).
- `active`: rig affordable-highlighted, at least one tier live, squad
  assigned.
- `in-progress`: N/A — Training has no discrete run; scripts/rig apply
  continuously, no started/stopped mode.
- `error`: N/A — no destructive or validating input on this tab (Ban Wave's
  confirm step is a two-tap arm/confirm, not an error path).

**Primary action:** Buy the next affordable rig lever or training fill.

**Exit:** Tab switch (typically to Grind to deploy the swarm just grown, or
Player once a squad starts dropping gear).

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
