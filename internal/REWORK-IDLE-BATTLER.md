# Idle-Battler Rework — working design doc

Status: agreed direction, numbers not yet locked. Supersedes the current
Attempt/pull fight once slice 1 ships. Fold into REMAKE-DESIGN.md when stable.

## Why

The current fight is one `Attempt` button: it rolls a single depth number over
a window, sits through a 60s cooldown, and breaks at 100% via scars + luck. It
feels like dead waiting. Real progress happens off-screen in other tabs, and
the boss falls to lucky pulls instead of earned power. The player wants the
Warden's health to whittle down over time as every system scales, no lucky
pulls, with the engagement living in *managing the systems* — not twitch.

## The combat model

- **Warden = a big persistent HP pool.** It drains continuously at Combat
  Power. Damage never resets — the bar IS your progress, replacing scars.
  No fail state, no cooldown, no lucky pull.
- **Combat Power = the one aggregate every system feeds.** attack × hits/s ×
  crit factor × the existing multiplier buckets (GM, scripts, trophies,
  overclock, atk%). Renamed from "DPS" honestly: once crits make damage a
  distribution instead of a rate, CP is a rolled-up rating, and it's the
  in-fiction MMO term. One number, every term displayed, no hidden rating.
- **Crits — two tiers.** Cascading roll: 10% Crit, and of those 20% Super Crit.
  Crit ×2 shown as `n*`, Super Crit ×5 shown as `n**`. Folds into CP as one
  displayed factor (×1.16 at base). New scaling lanes that aren't +atk:
  crit rate, super-crit rate, crit damage.
- **Hit stream.** The character auto-attacks; each hit is a number
  (normal / `*` / `**`) chipping the bar. Hit rate = hits/s, so the speed lane
  becomes visible instead of just feeding a formula.
- **Active layer = management, not twitch.** You tune the CP machine
  (allocations, upgrades, research, gear); the boss bar is the payoff readout.
  Optional bridge: the boss tab surfaces your current CP bottleneck so watching
  the bar points you at what to go manage next.

## Pacing (approach; numbers are proposals to tune)

- **TTK = HP ÷ CP.** CP grows explosively (sim: ×10,000 in ~1.3h), so a fixed
  gargantuan HP still dies fast. Fixed HP alone won't make long fights.
- **Size HP to the curve.** Read projected CP-at-arrival per wall from the sim,
  set that wall's HP = arrival-CP × target time. Pacing holds regardless of how
  fast CP explodes. Over-scaling drops TTK below target (the reward);
  arriving underpowered drags.
- **Idle always progresses** — leave it running and it eventually kills;
  scaling is the accelerator, not the on-switch. Caps how gargantuan HP can be
  vs CP or idle feels dead.
- **Proposals:** big-number idle aesthetic (gargantuan HP + matching CP, suffix
  formatting K/M/B/T/…); ~a few days per wall, climbing gently toward the deep
  walls.

## Gear economy (split into two non-overlapping lanes)

- **Grind (bots farm zones) → fuel only.** Volume drops feed Armory ranks +
  scrap. Never equippable, auto-processed — kills the flood-management chore
  entirely. No filter/stash triage for grind loot.
- **Dungeons (new: active, instanced, MMO-style) → the only equippable gear.**
  6 slots now (up from weapon/armor/charm = 3). Stakes = the gear itself, which
  is why an active loop works here where the active Delve failed (its stakes
  were fungible copper). Meaningful decisions (push deeper for better gear vs
  bank the run), not busywork.
- **Wardens** stay the idle whittle + Trophy sets (existing permanent pieces).
- **Delve → Tower climb.** The idle depth engine + Cache tree, reframed as
  ascending floors. Mostly thematic.
- **Armory** survives: grind drops still carry a slot/zone identity to rank up;
  it just stops implying equippable gear.

## System map (post-rework)

| System | Role |
|---|---|
| Wardens (Boss) | idle battler — CP whittles a huge HP bar; main gate + Trophy sets |
| Training (Rig) | bots produce character stats → CP |
| Grind | bots farm zones → Armory/scrap fuel + copper |
| Tower (was Delve) | idle climb, Cache tree feeds systems |
| Dungeons | active instanced runs → 6-slot equippable gear |
| GM | account flags / server privileges |
| Armory | grind-fuel collection ranks (permanent) |
| Research + Momentum | management depth (later slice) |

## Build order (slices)

1. **Foundation — idle-battler boss + Combat Power + crits.** Everything hangs
   off CP draining a bar, so this is first. Rewrites pull.js + battle.js + the
   Boss tab UI; adds crit factor to stats.js + crit affixes; rewrites the sim
   and restamps baseline. Ships the new fight feel + the crit spikes.
2. **Dungeons + 6-slot gear.** New active instanced system; grind gear becomes
   fuel-only; equippable gear comes from dungeons; expand SLOTS 3 → 6.
3. **Research (synergy edges) + Momentum (breadth mult).** Management depth so
   there's always a next decision, no dead waiting.
4. **Tower reframe of Delve** + polish.

## Open numbers to lock before slice 1

- Magnitude aesthetic: big-number idle vs modest.
- Target TTK per wall + how it curves W1→W10.
- Arrival feel: "just long" grind-through vs "impossible at first, must out-scale".
- Crit base values (10% / 20%, ×2 / ×5) — starting proposal only.
- Offline drain clamp (reuse the current offline cap).
