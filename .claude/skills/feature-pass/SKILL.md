---
name: feature-pass
description: Mandatory gate before building ANY player-facing feature, mechanic, upgrade, currency, or UI element in this game. Run it when adding, renaming, or relocating anything the player sees. Prevents stat-dribble upgrades, orphaned UI, and register-soup naming.
---

# Feature pass — the four gates

Run every gate BEFORE writing code. If a gate fails, redesign or take it
back to the user — do not ship around it. Post the gate answers in the
conversation before building, so the user can veto placement/name early.

## Gate 1 — Meaning: what decision does it change?

State in one sentence which player decision this feature changes, creates,
or deepens. "Number goes up" is not a decision.

- An upgrade must unlock a **verb** (new action, new automation rule, new
  target) or bend a **tradeoff** (make an existing choice harder/richer).
- If the honest answer is "it nudges a dial the player already ignores,"
  the feature is filler — redesign or cut (YAGNI applies to content).
- Litmus: would a player mention it when describing their plan for the
  next hour? If never, it fails.

## Gate 2 — Placement: where does it live, and what does it extend?

Declare BEFORE coding:
- **Domain owner:** Boss / Training / Grind / Player. The domain that owns
  the DECISION owns the feature — not the domain where the resource comes
  from. (Tickets are earned at the Boss; spends that improve bots belong
  in Training.)
- **Attachment point:** which EXISTING element it extends (a table gets a
  column, a row gets a control, a chip gets a value). New floating
  sections are a smell; a feature with no natural home means the IA is
  wrong or the feature is — stop and discuss.
- One feature may split across domains if its spends/decisions do
  (per-domain rows, not one orphan panel).

## Gate 3 — Naming: one register per system, from the lexicon

The game speaks exactly three registers. Every system's player-facing
nouns come from ONE of them:

| Register | Voice | Owns |
|---|---|---|
| **The dead game** (in-world MMO vocabulary a 2000s MMO would print) | zones, mobs, bosses, gear, titles, raids, attempts, scars | Boss fight, zones, gear/enhance, titles |
| **The botter's toolkit** (grubby, practical forum-speak) | accounts, scripts, rig, farm, spoofing, mail | bots, training, automation |
| **The dying server** (admin/ops decay) | sessions, tickets, GM tools, patches, logs | meta currency, GM perks, shell UI (PLAYERS counter, server lines) |

Rules:
- Never mix registers inside one system's labels.
- New names get checked against the canonical table in
  REMAKE-DESIGN.md §16 (add it there in the same commit — the doc is the
  source of truth, this table is just the register guide).
- No proper-noun fantasy filler ("Meadow of Beginnings") and no
  programmer jargon ("kernel hook") unless the register genuinely owns it
  and a 2006 forum poster would say it.
- Read the name aloud as a player sentence: "I'm parking at ___",
  "I bought ___". If it sounds generated, it is.

## Gate 4 — Feedback: how is it FELT?

Name the concrete feedback the player gets when the feature fires: a
number that visibly moves, a bar, a row flash, a shake. Log lines are the
weakest form and never the only one. (No sound — hard veto. No ceremony.)

## Output before building

Post this block in chat, get no objection, then build:

```
FEATURE PASS: <name>
meaning:   <the decision it changes>
placement: <domain> — extends <existing element>
names:     <register> — <the exact player-facing strings>
feedback:  <what visibly moves>
```

Existing violations to burn down when touched (do not copy their style):
GM panel location (Boss tab orphan), perk set (stat dribbles), zone/tier
names (register soup), "session slots"/"script quality" register mixing.
