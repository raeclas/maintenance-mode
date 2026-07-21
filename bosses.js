// bosses.js — boss data. Every wall has a face (pillar 2): named character,
// story reason to block you, dialogue per event. Lines are picked by
// escalation index (pulls so far), clamped to the last line — write arrays
// in rising emotional order.
export const bosses = [
  {
    id: "w1",
    wall: 1,
    name: "Vess",
    title: "Warden of the First Door",
    hp: 15_000_000, // starting value: first pull = 0.004% — W1 is the long wall (§3b)
    windowS: 30,    // starting value: W1 enrage window (duration = gravitas dial)
    dialogue: {
      greet: [
        "A login. A real one. I watched the queue counter for six years — it never moved. Come closer, player. Let me see what woke you.",
        "Back again. The greeting script fires whether I want it to or not. I want it to.",
        "You keep logging in. Do you know how rare that makes you?",
        "I stopped counting my years at this door. I have started counting your pulls.",
      ],
      pullStart: [
        "Come, then. The window is open.",
        "Again. Good. Show me what the farm has bought you.",
        "The enrage timer is the only clock still right on this server. Race it.",
        "I hold this door. That is all I have left. Come take it seriously.",
      ],
      // depth < 1%: the intro-beat tier. Line 0 is the unlock moment.
      fail_hopeless: [
        "0.004%. I felt… a tickle. Listen. I want breaking this door to MEAN something, so hear me as a friend: nobody beat this game with their own two hands. Nobody. The old players ran bot farms — trained round the clock, farmed while they slept. The tools are still on the forums. Nobody is left to ban you. Go.",
        "Still a rounding error. But a bigger rounding error. The scripts are running, then?",
        "I can see the account list from here. Six 'players' online tonight. I know what they are. I don't mind — it's almost lively.",
        "Your little farm grinds day and night now. I stand here and feel the number creep. It's the most attention I've had in years.",
      ],
      fail_low: [
        "Now THAT was damage. Single digits! You're a real raider now — the old kind. Keep going.",
        "The timer always wins the middle rounds. It's not personal. It's scripted.",
        "You're learning where I'm thick. I can tell.",
        "These cracks you keep leaving — the repair script was supposed to close them. It hasn't run in years.",
        "I don't heal anymore. Did you know that? Every mark you make, I keep. Come look at your work.",
        "Again the enrage bell, again the door stands. But it stands wounded, and we both know it.",
      ],
      fail_near: [
        "…That one reached the hinges. Do not do that again.",
        "No. No — it held. It held. Check the combat log if you doubt me.",
        "I felt daylight through the crack. Close it. Go rest. Come back and try.",
        "You are one good minute away from ending my whole purpose. Take it.",
      ],
      break: [
        "So it opens. Six years, and the first door opens — for one player and their army of ghosts, in an empty world. Go in. Someone should finally see what we were guarding.",
      ],
    },
  },
];

export function getBoss(wall) {
  return bosses.find(b => b.wall === wall);
}
