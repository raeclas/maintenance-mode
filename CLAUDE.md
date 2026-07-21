# Maintenance Mode (working title)

Boss-progression idle game. Ground-up remake of Enhancement Slave Idle
(sibling repo `../FightingInc` — reference library only, its numbers are
NOT spec). **The design constitution is [internal/REMAKE-DESIGN.md](internal/REMAKE-DESIGN.md) —
read it before designing or building anything.**

Premise: a dead MMO still running in maintenance mode; you are the only
player. Satire shell, sincere boss stories inside.

## Non-negotiable laws (from the old build's post-mortem)

**Hard vetoes (user-stated, never re-propose):**
- NO sound. NO enhance ceremony / slow ritual animations.
- NO AI-generated skill icons (gold letter glyphs or hand-made only).
- NO obligation mechanics: dailies, streaks, FOMO, calendar events, lockouts.

**Design laws:**
1. Every guarantee is an abuse vector — band-cap or era-price anything that
   bypasses RNG.
2. Model every faucet in the sim OR gate it (cooldown/cap). New faucet =
   sim re-run in the same commit.
3. Batch/offline paths clamp exactly like live paths.
4. Never couple XP (or any pacing stat) to currency.
5. No multiplier soup — per-boss math displayed, no hidden terms.
6. Stat lanes keep identities; twists re-value lanes, never merge them.
7. Depth = meaningful overlap of few systems. **Nine-system budget: adding a
   tenth requires deleting one.** (2026-07-21: Levels deleted, Bot Farm in.)
8. Attachment is the spine: never reset, demote, or destroy the character,
   gear, or story canon. (Narrow amendment 2026-07-21: the bot stratum is
   born-disposable — Ban Wave rebirth resets bots/bars/copper ONLY.)
9. Improvable-stat rule: every mechanic ships with ≥1 meaningful stat the
   loop can improve, or it doesn't ship.

**Discipline:**
- BEFORE any change: restate what the user asked for and confirm the
  intended scope with them — especially when the request is ambiguous.
  Never expand scope on interpretation (2026-07-22: "battle bars" meant
  the Grind bars; an unrequested boss-bar redesign shipped from the
  misread). Clarify first, build second.
- Two-channel workflow (user playtests on mobile via GitHub Pages):
  push every change to `staging` (Pages serves this branch — the playtest
  channel). NEVER advance `main` until the user approves that change;
  on approval, fast-forward main to the approved commit.
- Sim-first: deterministic EV bot + baseline.json drift tracker from the
  first gameplay commit. `npm test` + `npm run sim` must stay green;
  intended balance shifts restamp baseline in the same commit.
- Save durability: versioned saves, last-known-good backup, corrupt
  quarantine (port the old repo's saveSystem pattern).
- Vanilla JS ES modules, no framework, no bundler. Game files at root,
  non-deployed work in `internal/`.
- Design process uses `~/.claude/skills/game-design` (5-Component Filter,
  Numbers Policy: starting value + test plan, Abuse Tests at design time).
- **Every player-facing feature runs `.claude/skills/feature-pass` BEFORE
  code**: meaning gate (what decision changes), placement gate (domain +
  attachment point declared), naming gate (one register per system, from
  the lexicon), feedback gate (how it's felt). Post the FEATURE PASS block
  in chat first.

## Dev

- Preview: `.claude/launch.json` — "game" on port 5601, "game-test" on 5602.
- Art pipeline: `internal/art/` (SDXL + nerijs/pixel-art-xl LoRA on the
  user's RTX 4070S; recreate `.venv` on first use; old repo's
  `internal/art/.venv` has the working env to mirror). New game = new art +
  new names; old manifest prompts deliberately not carried.
- Build order: Slice 1 = W1–W3 + Pull + enhance (safe/risk zones) + parking
  + sim/tests. See REMAKE-DESIGN.md §13.
