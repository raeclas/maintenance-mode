# Dungeons — mechanics as the wall

Status: design agreed in principle 2026-07-25, numbers are starting values.
Fold into REMAKE-DESIGN.md once slice 2a ships and playtests.

## The thesis

Every other system gates on a number going up. If dungeons do that too they
are a fourth tab of the same verb. So: **in a dungeon you never fail for being
weak — you fail because a mechanic went unanswered.** The permanent ratchet is
knowledge + allocation, not damage.

No wiki, no guild, nobody to ask. You are rediscovering raid knowledge alone,
six years after everyone left. The journal writing itself IS the premise made
mechanical — that's the feature's emotional core, not decoration.

Interaction lives BETWEEN runs, not during. Nothing to click mid-instance.
The instance is the readout; the party board is the game. (This is what killed
the old active Delve — descend/extract every 2s was cadence, not decision.)

## The loop

1. Set duties on the party board, set a bank floor, start the instance.
2. It advances unattended. Character CP clears floors; mechanics fire on cast
   timers and are answered by staffed duties.
3. An unanswered mechanic applies a **displayed, compounding penalty** — it
   doesn't insta-wipe, it degrades you until the floor becomes unwinnable.
4. Wipe → haul lost, and the log names exactly what beat you:
   `Nave Revenant cast Mass Dispel 3× — unanswered. wiped floor 2.`
5. That writes a **journal entry, permanently**:
   `Mass Dispel — answered by DISPEL duty (script v3+)`
6. Staff the duty, re-run, clear. Entry goes gold: **solved forever**. Auto-
   answers in every future instance as long as the duty stays staffed.
7. Raise the key. New mechanic appears. Wipe. Learn. Repeat.

Failure teaches; it never destroys anything owned (attachment holds — haul is
unbanked loot, not gear you have).

## Why the cost is real — attrition, not just opportunity

Duties draw from `state.bots.pop` through a new `alloc.duties` array, the same
allocation grammar as zones/training (−/+/cap/max rows). That alone is
opportunity cost: a bot on duty is a bot not farming and not training.

But the real cost is **attrition — bots are CONSUMED by the run.** Every floor,
staffed bots get detected and banned at a rate scaling with key and depth. They
do not come back. You feed accounts into the instance and the party thins as
you descend.

This is the engine WoW lost when it sanded off downtime: **you arrive at the
boss depleted.** And it unifies the two failure sources into one wall — as bots
burn, coverage decays, until a mechanic goes unanswered because there is nobody
left to answer it. Depth is bounded by how many accounts you are willing to
burn, not by a health bar.

Canon-legal by the guideline 8 amendment: the bot stratum is born-disposable.
Nothing owned is destroyed — no gear, no story, no Armory rank. Only accounts,
which the generator makes more of.

**Sacrifice buys depth, never a dice roll.** More bots burned = provably deeper,
computed and DISPLAYED before you commit ("this party clears to ~floor 9").
Buying a win *chance* would rebuild the −EV click-gamble that killed the old
active Delve. Push-your-luck comes from the haul you might lose, not from odds.

## Consumables — the spoofing lane, finally with a home

The resource half of the sacrifice. Pre-run purchases, spent per instance,
that trade economy for depth:

| Consumable | Cost | Effect |
|---|---|---|
| proxy rotation | copper | −25% ban rate for the run |
| spoofed hardware IDs | copper (era-priced) | delays first detection by 2 floors |
| cached loot table | scrap | +1 haul rarity band |

This absorbs roadmap queue item "spoofing lane — per-bot ban mitigation stat,"
which has been parked with no natural home since 2026-07-22. It has one now:
mitigation only matters where bans are a live cost, and instances are the only
place bans are a cost you chose. Botter register throughout, so it reads right
next to the dead-game dungeon nouns without mixing inside one label.

## Mechanics (3 to start)

Each names a lane it re-values — this is the twist vehicle REMAKE-DESIGN wants
for W2 ("difficulty CANNOT be a bigger number").

| Mechanic | Duty | Unanswered penalty (per cast, compounding) | Re-values |
|---|---|---|---|
| Sunder | INTERRUPT | −12% effective CP for the floor | speed lane |
| Mass Dispel | DISPEL | strips affix bonuses for 20s | affix/gear lanes |
| Summon Adds | ADDS | −15% CP goes to soaking adds | raw atk lane |

Duty gate: a bot can only cover a duty at `bots.powerRank >= g` (script
version). Starting gates: INTERRUPT g0 · DISPEL g3 · ADDS g5. Coverage need
scales `ceil(key / 2)` bots per live mechanic.

## Key levels

- `key` is player-chosen, starts 1, **never depletes on failure.** Depleting is
  punishment-on-a-clock; pushing must stay free (obligation veto).
- Each key level: +1 to the live-mechanic count (capped at the pool), +1 to
  coverage need every 2 levels, and lifts the haul rarity floor one band.
- Push-your-luck lives in the **haul**, not the key: deeper floors accumulate,
  banking secures, wiping loses the unbanked.

## Numbers (starting values + test plan)

| Knob | Start | Test |
|---|---|---|
| floor HP | `40 × 1.35^floor` × arrival CP | first clear ~90s at key 1 |
| boss floor | every 5th | named drop cadence feels earned, not routine |
| cast timer | 12s | 3 casts before a floor ends = penalty is felt, not fatal |
| coverage need | `ceil(key/2)` bots/mechanic | key 10 should hurt the zone economy |
| ban rate/floor | `2% × key × 1.15^floor` of staffed | a key-1 run costs a few bots, key 10 costs a swarm |
| projected depth | shown pre-run from party + consumables | the number you commit against — must be honest |
| bank floor default | 3 | new player banks something before the first wipe |
| haul rarity floor | key band | key 1 ≈ Uncommon, key 10 ≈ Legendary |

All tuned by playtest, not sim (below).

## Sim stance

Instances depend on bots, and the bot lane is playtest-gated by standing
decision (bot-lane-no-sim) — the user is the sim for bots. The sim therefore
ignores instances entirely (key 0, no haul), a conservative lower bound, same
posture as Delve. `npm test` still covers the deterministic parts: coverage
resolution, penalty compounding, journal writes, key scaling, save migration.

## Abuse tests (design time)

- **Cover everything with one bot each?** No — coverage need scales with key,
  and attrition eats the staff mid-run, so trivializing high keys costs the
  whole swarm and then some.
- **Dump the entire swarm into one run?** Capacity caps the pool and the
  generator caps refill rate, so a max-burn run costs real hours of economy.
  Ban rate scaling means the marginal bot buys less depth than the last —
  diminishing, no infinite-depth exploit.
- **Consumables as a guarantee bypass?** They are era-priced and per-run
  (guideline 1 — no permanent guarantee). Proxy rotation reduces a rate, it
  never zeroes it.
- **Farm instances for bots?** Instances never GRANT bots. One-way sink only.
- **Offline instance farming?** Offline continues only the CURRENT run, clamped
  by `offlineCapS()` exactly like the live path (guideline 3 — batch clamps
  like live). No offline run chaining.
- **Infinite key for infinite loot?** Haul rarity floor is banded per key and
  the floor HP curve outruns CP, so the wall arrives on its own.
- **Bank at floor 1 forever for free loot?** Haul value is exponential in
  depth; banking at 1 is strictly worse than not running.
- **Bot starvation to push key** is a legitimate tradeoff, not an abuse — it is
  the intended decision.

## Placement / naming / feedback

- New **Dungeon** tab beside Delve (Delve keeps depth/Cache; no name overlap).
  New state key `state.instance` — `state.dungeon` is already Delve's.
- Register: the dead game — Dungeon · instance · floor · boss · mechanic ·
  duty · journal · haul · bank · wipe · key. Add to REMAKE-DESIGN §16 in the
  build commit.
- Feedback: mechanic fires → answering bot flashes on the party board, the
  mechanic name pulses green (answered) / red (unanswered) with the penalty
  number attached; wipe → haul greys and drains; journal entry types itself in;
  solved entries go permanently gold.
- Improvable stats: key level, duty capacity (pop), script rank gates, and one
  new Cache rank ("support backlog" sibling) granting a free duty slot — so
  Delve feeds Dungeon and the two aren't strangers.

## Slice order

- **2a-1 — the loop.** `instance.js` + state + one dungeon + 3 mechanics +
  duties + attrition + journal + key + haul/bank + tab UI + tests. Ships the
  feel. Consumables land here too — attrition without mitigation is just a
  tax, and the two are the same decision.
- **2a-2 — named boss loot.** Per-boss Armory entries so running THAT boss
  means something ("I'm running the Nave for a charm").
- **2b — 6 slots.** SLOTS 3 → 6 (helm · gloves · boots), Player grid + Armory
  columns widen.
- **2c — grind loot demotion.** Grind drops become Armory/scrap fuel only,
  instances become the equippable source. **Deliberately last** — it guts the
  stash grid and removes the only gear source until instances are tuned.

## Open

- Does an unanswered mechanic ever hard-wipe, or only degrade? (Degrade-only
  is the current call — legible, no feel-bad snap.)
- Manual "bank now" button while watching, or bank floor only? (Leaning: both,
  the button is the active-play reward.)
- Second dungeon before or after 6 slots.
- Do banned-in-instance bots count toward `bots.banned` lifetime (and so feed
  the Ban Counter affix)? Leaning yes — one ban ledger, and it makes the
  instance visibly the same fiction as zone detection.
- Does Ban Wave rebirth interact? Bots reset anyway, so probably nothing to do,
  but the journal must survive it (knowledge is permanent — attachment law).
