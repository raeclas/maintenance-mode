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
];

export function getBoss(wall) {
  return bosses.find(b => b.wall === wall);
}
