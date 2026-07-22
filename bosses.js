// bosses.js — boss data. Every wall has a face (pillar 2).
// Milestone-only dialogue: greet once, the intro-fail bot hint, the first
// near-miss, the break. Silence otherwise — lines land because they're rare.
export const bosses = [
  {
    id: "w1",
    wall: 1,
    name: "Vess",
    title: "Warden of the First Door",
    hp: 80_000_000, // starting value: first pull ≈ 0.00075% — W1 is the long wall; break needs nightmare pushes (§3b, §5)
    windowS: 30,    // starting value: W1 enrage window (duration = gravitas dial)
    speedKnee: 5.0, // hits/s where speed's returns start diminishing (= old cap; harder walls raise this to re-value speed)
    set: { name: "The First Door", mult: 1.0 }, // 7-piece set, farmed from Vess
    dialogue: {
      greet: [
        "A login. A real one. Six years, and the queue counter finally moved.",
      ],
      fail_hopeless: [
        "0.0008%. Listen, friend: nobody beat this game bare-handed. The old players ran bot farms. The tools are still on the forums — and nobody is left to ban you.",
      ],
      fail_near: [
        "…That one reached the hinges.",
      ],
      break: [
        "So it opens. Go in. Someone should finally see what we were guarding.",
      ],
    },
  },
  {
    id: "w2",
    wall: 2,
    name: "Maren",
    title: "Warden of the Second Door",
    hp: 20_000_000_000, // starting value — player now has R2 gear + rebirth; heavy playtest tune
    windowS: 30,
    speedKnee: 9.0, // re-steepens speed: past 5 hits/s pays full value again on this wall
    set: { name: "The Second Door", mult: 1.6 }, // deeper Warden → stronger set
    dialogue: {
      greet: [
        "You came through Vess's door. Few ever did. Fewer still came looking for the second.",
      ],
      fail_hopeless: [
        "The First Door fell to old tools. This one was sealed after the exploits were catalogued — it expects your scripts. Bring more than you did for Vess.",
      ],
      fail_near: [
        "…The seal remembers that pressure now.",
      ],
      break: [
        "Then go deeper. I kept this door for the players who never arrived. You're years too late — but you came.",
      ],
    },
  },
];

export function getBoss(wall) {
  return bosses.find(b => b.wall === wall);
}
