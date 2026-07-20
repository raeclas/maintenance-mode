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
    hp: 625,      // starting value: EV depth 96% at starting player stats
    windowS: 30,  // starting value: W1 enrage window (duration = gravitas dial)
    dialogue: {
      greet: [
        "A login. A real one. I watched the queue counter for six years — it never moved. Come closer, player. Let me see what woke you.",
        "Back again. The greeting script fires whether I want it to or not. I want it to.",
        "You keep logging in. Do you know how rare that makes you?",
        "I stopped counting my years at this door. I have started counting your pulls.",
      ],
      pullStart: [
        "Come, then. The window is open.",
        "Again. Good. Show me the first one wasn't luck.",
        "The enrage timer is the only clock still right on this server. Race it.",
        "I hold this door. That is all I have left. Come take it seriously.",
      ],
      fail_low: [
        "That's it? This door has held against worse silence.",
        "The timer always wins the early rounds. It's not personal. It's scripted.",
        "You're learning where I'm thick. I can tell.",
        "Six years of standing still. You'll need more than that.",
        "The wall holds. Rest. It isn't going anywhere. Neither am I.",
        "Again the enrage bell, again the door stands. And yet you'll be back — I've started relying on it.",
      ],
      fail_near: [
        "…That one reached the hinges. Do not do that again.",
        "No. No — it held. It held. Check the combat log if you doubt me.",
        "I felt daylight through the crack. Close it. Go rest. Come back and try.",
        "You are one good minute away from ending my whole purpose. Take it.",
      ],
      break: [
        "So it opens. Six years, and the first door opens — for one player, in an empty world. Go in. Someone should finally see what we were guarding.",
      ],
    },
  },
];

export function getBoss(wall) {
  return bosses.find(b => b.wall === wall);
}
