# REMAKE DESIGN — "Maintenance Mode" (working title)

Ground-up remake of Enhancement Slave Idle. Full remake: core systems, art,
and names. The WC3 source is inspiration only — not a content library, not
law. Designed 2026-07-20/21 with the game-design skill (5-Component Filter,
Numbers Policy, Abuse Tests). Old build's post-mortem drives every rule here:
breadth killed it (18 classes, 30 bosses, shallow systems, legibility 3/10),
and its balance broke exactly where the sim had blind spots.

**All numbers in this doc are STARTING VALUES with test plans unless marked
otherwise. No number is sacred; every number is simmed.**

---

## 1. Premise & identity

**Mechanical premise (one sentence):** a single-character idle where every
system feeds exactly one visible number — next wall's depth% — and every boss
lives a three-stage lifecycle: frontier → farm → autokill.

**Fiction premise — The Last Server:** the game-world is a dead MMO, sunset
years ago, but the server was never shut down. It runs in maintenance mode:
spawn scripts fire, loot tables roll, bosses stand at their raid entrances.
Nobody comes. You log in. You climb the old progression ladder alone.

Tone: satirical MMO shell, sincere stories inside. Melancholy played
straight; jokes at the genre's expense, never at the bosses'. Every boss is a
named character with a story reason to block you — they have been Content for
years and have feelings about it. User brief: "every wall has a story that is
meaningful to the user."

The fiction makes the mechanics diegetic:
- Scars persist because the maintenance scripts that reset boss state are broken.
- Farm-status respawns: the spawn script still runs, and the boss knows it.
- Autokill: the worn-down boss eventually steps aside when you walk in.
- Ghost lobby: echo data replaying old players' glory. Frozen leaderboards.
- The enhancement NPC still works perfectly — RNG needs no maintenance.
- Unreleased expansion content sits on the test realm (authored expansions).
- No dailies: nobody is left to assign them. Offline-friendly: the server has
  waited years; it will wait for you.

## 2. Pillars

1. **The Wall Is the Game.** Progress unit = boss broken. Every feature must
   shorten or deepen the path to a wall, or it doesn't ship.
2. **Every Wall Has a Face.** Named boss, story beat, one mechanic twist,
   named reward. No filler bosses.
3. **Readable Math.** No hidden terms. Per-boss resolution shown and computed
   for the player (forensics + projection). Global formula stays one line.
4. **The Gamble Is the Heartbeat.** Enhance = emotional core. Stakes visible,
   resolution instant, decisions (not animations) carry tension.
5. **Respect Absence.** Offline-friendly. No dailies, no FOMO, no streaks,
   no calendar mechanics. Walls wait.
6. **Attachment Is the Spine.** Single character, never reset, never demoted,
   never destroyed — and the same law protects gear (no item destruction) and
   story (walls stay canon forever).

## 3. Core mechanic — the Pull

Player faces ONE frontier boss. Hits **Pull**. Attempt auto-runs inside a
fixed enrage window. Result: **depth%** = damage dealt ÷ boss HP.

`depth = DPS × window / bossHP` — break condition: reach 100%.

- **Enrage window** (not player death, not regen stall): depth moves every
  time power moves. Honest thermometer. Starting values: 30s at W1 scaling to
  ~3min at W8 (duration = gravitas dial, Maple lesson). Test: does a W8 pull
  feel like an event? If not, lengthen + add mid-fight beats.
- **Scars (pity as fiction):** each failed pull leaves permanent damage,
  capped at 25–30% of boss HP (starting value). The breaking pull must still
  be earned by power. Test plan: stuck-player time-to-break vs drama — if
  players report walls "falling over," lower cap; if rage-quits at walls,
  raise. Boss dialogue acknowledges accumulating wounds.
- **Forensics (the teacher):** post-pull report says WHY you stalled —
  "adds ate 31% of uptime; armor absorbed 22%; burst window missed by 4s."
  Every fail outputs the next prep decision. Skill lives in prep + reading,
  not reflexes (autobattler model: prep is the skill, the pull is the reveal).
- **Projection (the odometer):** pre-pull band, e.g. "est. 89–103%."
  Variance width is the drama dial: tight enough that progress is real, wide
  enough that near-threshold pulls carry genuine hope. Countable-daydream
  surfaced everywhere: "at current rate, wall breaks in ~2.1 days."
- **Ante (stakes):** consumables committed at pull start, spent win or lose.
- **Active contract:** pulls are player-triggered (active attempt), retry on
  short cooldown (starting value 60s; test: prep should happen between pulls,
  cooldown only long enough to make pulls deliberate, not punishing).
- **During-pull interaction:** watch + ONE timed button (burst cooldown /
  Overcharge release into vulnerability windows). Auto-fires at decent timing
  when unattended (active presence boosts, never obligates). Skill nudges
  depth ±10% (starting value).

**Undergeared flex:** clears below projection are surfaced and titled
("broke at projected 91%") — the prestige axis for judgment.

## 4. Build system — stat vector × skills × twists

The answer to "isn't this just a DPS check": checks are questions, builds are
answers. Depth comes from non-linear interactions, not more systems.

- **Stat vector (4 lanes, fixed):** ATK, Speed (hits/window), Crit, Pierce.
- **Skills:** loadout of 3 slots, pool grows one skill per wall broken
  (~7 by W8). Skills interact with twists and each other.
- **Twists:** ONE per boss. Twists re-value stats per wall (WAMI-validated:
  off-stats become the DPS stat).
- Legibility rule: per-boss math displayed and computed for the player.
  Readable ≠ trivial; readable = no hidden terms.

### First-8 wall matrix (validated: 8 distinct questions, no repeated answer)

| Wall | Twist | Re-values | Answer | Grants (tool for a FUTURE wall) |
|---|---|---|---|---|
| W1 | none (clean check) | baseline | learn the pull | Overcharge (bankable burst) |
| W2 | Armor: flat per-hit reduction; small hits → 0 | Speed↓↓ big-hits↑ | Heavy Blow + slow weapon | Cleave |
| W3 | Burst windows: real damage only in windows | Speed↑ timing↑ | Overcharge into window | Rhythm (steady flat damage) |
| W4 | Adds steal uptime | AoE↑ | Cleave + fast weapon | Execute (<30% HP bonus) |
| W5 | Regen floor: sustained DPS must clear heal rate | burst↓ sustain↑ | Rhythm + Speed (inverts W3) | Killer Instinct (crit spike) |
| W6 | Crit-immune | Crit↓↓ | shelve the new crit toy | Warcry (self-buff window) |
| W7 | Phase split: armor P1, windows P2 | balance↑ | mixed loadout | Siegebreaker (scars ×2) |
| W8 | Capstone: tightening enrage + cycling W2–W6 mini-phases | everything | broad kit + judgment | first keystone |

Design rules the matrix produced (binding):
1. **Tool before exam.** Each wall grants the answer to a FUTURE wall, never
   its own. Forensics point at the tool you already own.
2. **Boss drops its own nature.** Armor boss drops the slow crusher; window
   boss drops the quick blade. Gear = trophies that ARE the boss's mechanic;
   higher-tier walls re-ask old questions so old trophies stay relevant.
3. **The W5→W6 heel-turn is deliberate.** Game hands you the crit toy, next
   wall invalidates it: teaches loadout-swapping beats stat worship. Satire
   beat ("the boss got patched"). Must read as lesson, not scam — forensics
   call it out kindly. Playtest gate on this one.
4. **Brute force always exists.** Answers are efficiency multipliers (~2–3×
   depth), never permission. Overgear + scars can bulldoze any wall (except
   W2's honest armor floor). Build skill = speed, not access.

## 5. Enhance — the heartbeat

Per-item pluses +0→+20. Each plus = +10% item ATK, additive per plus, shown
on the item. Instant resolution — no ceremony, ever (hard veto).

| Zone | Range | Success (starting) | Fail consequence |
|---|---|---|---|
| Safe | +0→+5 | 100%→60% | nothing (copper spent) |
| Risk | +6→+12 | 45%→20% | −1 plus |
| Nightmare | +13→+20 | 15%→1.5% | drop to checkpoint |

- **Checkpoints** at +10 and +15. A +17 fail lands on +15. Stakes real,
  grief bounded. **Nothing is ever destroyed** (attachment law; Starforce's
  boom is the genre's most-hated moment — we take tension, refuse trauma).
- **Failstacks:** every fail anywhere = +1 stack = +1% success. Success
  consumes the whole bank. Decision: burn the 22-stack on +14 or bank it for
  +18. Stack management = prep-skill inside the heartbeat. Visible HUD stat
  (this is Luck's mechanical body). **Cap: stacks add max +15 absolute
  percentage points** — Nightmare can never approach guarantee.
- **Safeguard:** +6→+15 only, 3× copper, fail costs no plus. Locked above
  +15: no purchasable mercy in Nightmare. (Lesson 1: anything bypassing RNG
  is band-capped by design law.)
- **Costs:** copper scales per plus; Nightmare adds boss materials from
  farm-status kills — bossing funds the gamble, the gamble breaks the next
  boss.
- **Odometer weld:** enhance panel shows wall projection live
  ("+15→+16: projection 84–97% → 89–103%"). Every gamble is denominated in
  wall depth.
- Feel: success floater + shake scaled to band (+18 lands like a boss kill);
  fail = terse feed line + stack counter visibly ticks (consolation on
  screen). Ghost lobby reacts to +16 and above. Titles at +18/+19/+20.

Test plans: sim time-to-+15 vs W5–6 pacing; time-to-+18 vs W8. Playtest
metric: a +18 attempt must produce visible hesitation before the click — if
players click instantly, raise the material ante, not fail severity.

## 6. System inventory (the whole v1 game — nine systems)

| System | Job | One-line rule |
|---|---|---|
| Pull | the event | timed window, depth%, one twist per boss |
| Scars | pity | failed pulls persist damage, capped |
| Forensics | skill loop | every fail explains itself |
| Enhance | heartbeat | zones + checkpoints + failstacks |
| Gear | power lane | boss drops its nature; ONE effect per item max |
| Feats | bonus pool | all achievements/collection feed one visible pool |
| Levels | unlock arc | finite, kills-only XP, verbs not stats |
| Farm/parking | idle half | chosen spot, visible rate cards, multi-track |
| Lifecycle | endgame gravity | frontier → farm → autokill |

Currencies: **copper + boss materials. Hard cap two.** GS = derived display
number (gear + enhance + feats), never a stored stat.

## 7. Levels — the finite unlock arc

- Cap ~20–30 (starting value). XP from kills only, fixed total curve —
  faucet finite by construction. Never a damage term.
- Every level unlocks something concrete: tabs, skill slots, features, early
  walls. Levels ARE progressive reveal.
- At cap the game says it out loud: "Welcome to endgame. Nobody asks your
  level now — what's your GS?" Then paragon levels accumulate (post-cap,
  banked for future layer use; capped faucet, no current spend).

## 8. Idle layer

- **Parking verb:** choose farm spot; explicit AFK rate cards (copper vs
  materials vs collection chase). Decision density lives in the parking.
- **Multi-track hours:** every parked hour ticks 3–4 legible tracks (copper,
  materials, collection/feats, chase drops). No wasted hour (Maple lesson 3).
- **Lottery under the flow:** rare chase drops roll while parked.
- **Offline:** wall-clock delta, hard cap (starting value 12h), and offline
  batches clamp EXACTLY like live paths — per-kill caps, no once-sampled ×
  millions (old-build lesson, non-negotiable).
- **Active contract:** presence boosts (pull timing, minigame-free), absence
  never punished.
- Juice budget: battle scene must be watchable — fountaining numbers, mob
  pops, boss phases. The grind must feel good to look at (Maple lesson 1).

## 9. Boss lifecycle (the biggest structural import of the research tour)

Every wall lives three stages; the story rides the lifecycle:

1. **Frontier** — the Pull, scars, forensics, drama. Boss defiant.
2. **Farm status** — respawn timer (no lockout, no calendar), drops materials
   + one rare chase item. Boss resigned ("the script brings me back").
3. **Autokill** — stats cross its threshold, dies on sight, income passive,
   monument on the ladder. Boss steps aside; dialogue nods.

Yesterday's wall becomes today's infrastructure (AD principle worn by
bosses). Cleared-list = the account's power language (NGU boss-number
lesson); per-wall titles.

## 10. Endgame & layers (reserved, not built in v1)

**Six layer-principles (binding law for any future layer):**
1. New layers change rules, not numbers (new verbs, never just multipliers).
2. Each layer recontextualizes the one below (old endgame → farmable
   resource).
3. Automation of the past is progression (what was manual becomes managed).
4. Walls/gates should be diegetic where possible.
5. Layers arrive at exhaustion — designed only after the layer below is
   proven and FELT exhausted.
6. **Attachment is the spine: no layer resets, demotes, or replaces the
   character.** Automation = subordinates. Alts = guild members, never
   replacements. (AD gets away with layer-eating because nothing is loved;
   we substitute attachment for abstraction — Clicker Heroes' Transcendence
   backlash is the cautionary proof.)

**Converged blend (sketches only, design at exhaustion):**
- Spine: wall ladder + authored **Expansions** (content releases skinned as
  the MMO joke — found on the test realm; not a prestige mechanic).
- Repeatable layer candidate: **Keystones** — born-disposable speedrun
  remixes of beaten walls with affixes and escalating key levels; permanent
  choice-rich upgrade sink. (M+ = Clicker Heroes ascension inside an MMO:
  disposable stratum by design, story never reset.)
- Alternative shape logged: capstone-wall breaks AS layer triggers (ITRTG
  fusion: boss victory = layer transition).
- Reserved strata above: **Guild** (roster/alts as subordinate automation
  under your continuing main — IdleOn-validated fantasy) → **GM** (admin
  rights on the empty server; endgame satire rung).
- Cheap Melvor imports: completion log folded into feats (v1); creation
  modes (Hardcore/Ironman) reserved for the alt era.
- v1 must be fun with a single character, alone, on one ladder (user law).

## 11. Cut list & hard vetoes

**Hard vetoes (user-stated; never re-propose):**
- NO sound. NO enhance ceremony / slow ritual animations.
- NO AI-generated skill icons (gold letter glyphs or hand-made only).
- NO obligation mechanics: dailies, streaks, FOMO, calendar events, weekly
  lockouts.

**Deliberately not carried from the old build** (named to prevent
re-accretion): 18 classes (classless v1), 30-boss breadth, souls, evolution
tickets, jars, gathering (mining/fishing), macro workshop, legion board (its
fantasy returns later as the Guild stratum), item-mastery per-item mults,
zone lattice (farm spots hang off walls instead), multi-tier currency
display as economy (copper stays one denomination), XP-from-copper coupling,
regen walls as the primary gate (demoted to one twist flavor), confirmation
tickets and ALL flat-cost RNG bypasses.

**Old-build carry-overs (assets, not spec):** art pipeline
(internal/art/, SDXL + pixel-art LoRA, $0), sim/test discipline, save
durability patterns, decompiled data as reference for magnitudes only.

## 12. Sim-first & abuse discipline (the seven lessons, encoded)

Deterministic EV bot + baseline.json drift tracker from DAY ONE of the build.

1. Every guarantee is an abuse vector → band-cap or era-price anything that
   bypasses RNG (failstack cap, safeguard lockout, no ticket analogues).
2. Sim blind spots become the meta → model EVERY faucet or gate it
   (cooldown/cap) so it can't outrun the model. New faucet = sim re-run in
   the same commit.
3. Batch/offline paths clamp like live paths (per-kill caps).
4. Never couple XP or any pacing stat to currency.
5. One readable resolution — no multiplier soup; per-boss math displayed.
6. Stat lanes need identities — utility never competes with boss-drop raw
   power; twists re-value lanes, they don't merge them.
7. Depth = meaningful overlap of few systems, not more systems. Nine systems
   is the v1 budget; adding a tenth requires deleting one.

Per-system abuse tests are written IN THIS DOC at design time (see §3 scars
cap, §5 stack cap + checkpoint camping, §7 finite XP, §8 offline clamps).
The old build died by a skipped abuse test; the remake doesn't skip them.

## 13. Build milestones

- **Slice 1 (prove the spine):** one character, W1–W3, Pull + depth +
  scars + forensics + projection, enhance zones (safe/risk only), parking
  with rate cards, sim + tests green from first commit. Playable stub, feel
  pass on the Pull.
- **Slice 2:** W4–W8, full skill pool + loadout, Nightmare zone +
  failstacks + safeguard, lifecycle (farm status + autokill), feats pool,
  level arc, ghost-lobby feed.
- **Slice 3+:** keystones, expansions, guild stratum — each gated on the
  previous layer FEELING exhausted, per layer-principle 5.
- Location (new repo vs subfolder) still user's call — decide at Slice 1
  start.

## 14. Open questions

- Name: "Maintenance Mode" working title; alternatives (Last Server, Gear
  Check) parked.
- Gear slot count: 3 assumed (weapon + 2) — validate in Slice 1.
- Burst-button auto-timing quality when unattended (starting value: fires at
  80% optimal; test vs active advantage target ±10%).
- Scar decay on Expansion? (Probably never — scars are canon.)
- Paragon spend target (banked until Guild stratum designs it).
- Wall pacing curve: time-per-wall targets need sim before numbers go in.

## 15. Appendix — reference survey (what we took, what we refused)

| Game | Archetype | Took | Refused |
|---|---|---|---|
| Antimatter Dimensions | layered resets | 5 layer-principles; layers-eat-the-game | layer-eating (nothing loved there; everything loved here) |
| Clicker Heroes | reset + permanent sink | disposable-stratum insight; choice-rich sink; ascend-timing decision | Transcendence-style deletion of loved things |
| Melvor Idle | no-reset breadth | completion log; creation modes (later); offline-respect proof | 20-lane breadth machine |
| IdleOn | roster breadth | roster-as-automation (Guild stratum); parking verb; rate cards; active-boost contract; humor delivery | multiplier soup; system-per-world accretion; obligation + P2W friction |
| MapleStory (grind) | — | countable-daydream odometer; multi-track hours; lottery-under-flow; juice budget | obligation hours |
| MapleStory (bossing) | — | boss-list as power language; paycheck loop; duration=gravitas; near-miss drama; jackpot tail | weekly lockouts; reflex gate (relocated to prep/forensics) |
| Idle Obelisk Miner | chip-wall | scar persistence (capped); armor as binary gate; fight-as-prepared-event | full persistence (kills threshold drama) |
| NGU Idle | two-tier bossing | titan lifecycle (manual→farm→autokill); boss-list metric; joke bosses with teeth | tape-measure boss spam (our walls are all events) |
| ITRTG | boss-gated prestige | boss-victory-as-layer-transition (logged option); allocation-as-prep | training-stat resets |
| WAMI | per-boss gimmicks | stat re-valuation per boss; async background fights; subordinate dungeons (Guild) | — |
| BDO / Starforce / DFO | enhance cultures | failstacks; checkpoint floors; safeguard pricing | item destruction (boom); pity-less tails |

---

### Definition of Done (game-design skill) — status

- [x] 5-Component Filter evaluated (Pull §3, Enhance §5)
- [x] State transitions defined where stateful (lifecycle §9, zones §5)
- [x] Edge cases: offline clamps §8, stuck-player path §3/§4 rule 4
- [x] ≥2 feedback channels per significant action (visual + text + shake;
      sound vetoed)
- [x] Abuse tests written at design time (§12 + inline)
- [x] Numbers per policy: starting values + test plans throughout
- [ ] Playtest scripts — written at Slice 1 build time
