// bosses.js — boss data. Every wall has a face (pillar 2).
// Milestone-only dialogue: greet once, the intro-fail bot hint, the first
// near-miss, the break. Silence otherwise — lines land because they're rare.
export const bosses = [
  {
    id: "w1",
    wall: 1,
    name: "Vess",
    title: "Warden of the First Door",
    hp: 300_000_000_000, // v11 drain model: an HP pool whittled at Combat Power. ~12h to break on the sim CP-curve; arrival TTK reads "overwhelming" (~400d at start CP) then cascades down as you scale (REWORK-IDLE-BATTLER.md)
    windowS: 30,    // vestigial (drain uses hits/s, not a window) — kept for now
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
    hp: 75_000_000_000_000, // v11 drain — deeper wardens stretch far longer; playtest-tune
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
  // W3–W10: rough exponential curve (hp ~9×/wall, speedKnee re-steepens, set
  // mult climbs). Numbers are STARTING VALUES for a first climb — tune after.
  // The dialogue threads the dead-server arc: each door is a year the server
  // outlived its players; behind the last is the end itself.
  {
    id: "w3", wall: 3, name: "Korrin", title: "Warden of the Third Door",
    hp: 700_000_000_000_000, windowS: 30, speedKnee: 13.0,
    set: { name: "The Third Door", mult: 2.4 },
    dialogue: {
      greet: ["You didn't earn this door — you scripted it. The old rule was fight fair. But there's no one left to enforce it. Come, then."],
      fail_hopeless: ["Scripts alone won't open the Third Door. It was built for a raid of forty. You are one, and a swarm of ghosts."],
      fail_near: ["…The forty never got this close."],
      break: ["It opens. Inside: the empty guildhalls. We kept the lights on for players who stopped logging in."],
    },
  },
  {
    id: "w4", wall: 4, name: "Osei", title: "Warden of the Fourth Door",
    hp: 6_000_000_000_000_000, windowS: 30, speedKnee: 18.0,
    set: { name: "The Fourth Door", mult: 3.4 },
    dialogue: {
      greet: ["So you saw the guildhalls. All those names in the roster, greyed out. You're the only one still coloured in."],
      fail_hopeless: ["You fight like someone with something to prove to no one. Fitting."],
      fail_near: ["…Closer. The hinges remember you now."],
      break: ["Go through. The auction house is just beyond — every bid frozen mid-war, six years stale."],
    },
  },
  {
    id: "w5", wall: 5, name: "Thale", title: "Warden of the Fifth Door",
    hp: 55_000_000_000_000_000, windowS: 30, speedKnee: 24.0,
    set: { name: "The Fifth Door", mult: 4.6 },
    dialogue: {
      greet: ["They put the server in maintenance mode and walked away. No patches. No wipes. Just us, guarding doors to rooms no one enters."],
      fail_hopeless: ["Maintenance was meant to be temporary. Everything temporary here became forever."],
      fail_near: ["…The lock is tired. So am I."],
      break: ["Then pass. You're unmaking the quiet we were left to keep."],
    },
  },
  {
    id: "w6", wall: 6, name: "Ilva", title: "Warden of the Sixth Door",
    hp: 500_000_000_000_000_000, windowS: 30, speedKnee: 31.0,
    set: { name: "The Sixth Door", mult: 6.0 },
    dialogue: {
      greet: ["The doors weren't to keep you out. They were to keep the ending in."],
      fail_hopeless: ["Turn back, botter. Some servers should be allowed to die with dignity."],
      fail_near: ["…You won't stop, will you."],
      break: ["No. You won't. Fine — the Sixth opens. Fewer doors between you and the truth now."],
    },
  },
  {
    id: "w7", wall: 7, name: "Domar", title: "Warden of the Seventh Door",
    hp: 4_500_000_000_000_000_000, windowS: 30, speedKnee: 39.0,
    set: { name: "The Seventh Door", mult: 7.6 },
    dialogue: {
      greet: ["Six years I have stood here. You are the first thing to move in all that time. I don't know whether to thank you or fear you."],
      fail_hopeless: ["Your swarm dies and respawns and dies. Relentless — like the server never got to be."],
      fail_near: ["…That one reached the frame."],
      break: ["Through, then. Each door behind you was a year we survived after we should have gone dark."],
    },
  },
  {
    id: "w8", wall: 8, name: "Sef", title: "Warden of the Eighth Door",
    hp: 40_000_000_000_000_000_000, windowS: 30, speedKnee: 48.0,
    set: { name: "The Eighth Door", mult: 9.4 },
    // Sef is the betrayer, and his grievance is with the DEVELOPERS, not with
    // the server. He was written as a tier-four raid encounter and shipped as a
    // door guard, and he has been waiting six years for a patch that would make
    // him what he was promised. He opens the eighth door out of spite. The
    // satire spike in a run of sincere Wardens: everyone else mourns the
    // players, Sef is aggrieved about his career.
    dialogue: {
      greet: ["The eighth door. Do you know what I was FOR? Tier four. Final encounter of an expansion that never shipped. They wrote me a second phase."],
      fail_hopeless: ["Look at me. A door. Six years in a corridor because someone cut a zone to make a deadline. Hit me again — it's the most anyone has ever used me."],
      fail_near: ["…There. That's nearly the fight I was written for."],
      break: ["Through you go. I was never guarding this for them — I was waiting for a patch that would make me what they promised. It never shipped. So take their door. Wrecking what they abandoned is the only power I was ever given."],
    },
  },
  {
    id: "w9", wall: 9, name: "Yara", title: "Warden of the Ninth Door",
    hp: 350_000_000_000_000_000_000, windowS: 30, speedKnee: 58.0,
    set: { name: "The Ninth Door", mult: 11.4 },
    dialogue: {
      greet: ["One door after me. Behind it is what all of us were guarding. It was never loot. Are you certain you want to see?"],
      fail_hopeless: ["You could stop here. Farm the doors you've opened. Let the last one stay shut. …No? I thought not."],
      fail_near: ["…The last lock is listening."],
      break: ["Then go. I'll not follow. Whatever you find in there, you find alone — as you always have been."],
    },
  },
  {
    id: "w10", wall: 10, name: "The Last Warden", title: "Warden of the Tenth Door",
    hp: 3_000_000_000_000_000_000_000, windowS: 30, speedKnee: 70.0,
    set: { name: "The Tenth Door", mult: 13.6 },
    dialogue: {
      greet: ["You reached the end of the queue. There's no one behind you. There never was."],
      fail_hopeless: ["This door opens onto the server's final save — the instant before they pulled the plug. It does not want to be seen."],
      fail_near: ["…One more push. Everything you built, all at once."],
      break: ["It opens onto a login screen, frozen. PLAYERS ONLINE: 1. That was always you. You kept a dead world running just to have somewhere to be. …Thank you for playing. The server logs off, content."],
    },
  },
];

export function getBoss(wall) {
  return bosses.find(b => b.wall === wall);
}
