// battle.js — canvas battle scene, render-only. No sound (hard veto). The
// fight is now an idle whittle: the Warden's health bar drains at Combat
// Power and the character auto-hits, streaming damage numbers. Crits pop as
// `*` / `**` in a MapleStory-style skin (outlined digits, pop + drift + fade).
import { hpFrac } from "./pull.js";
import { getBoss } from "./bosses.js";
import { fmt } from "./format.js";

// 16/10, not the old 16/7. A letterbox cannot hold a door and a standing
// figure — DESIGN.md changed the aperture ratio for exactly this scene.
const W = 560, H = 350;
const FLOOR = Math.round(H * 0.80);   // the floor line; the glow band is below it

/* A door is an OPENING IN A WALL. Widening the leaves to 94% of the frame was
   an attempt to stop the scene reading as "panels floating in black" and it
   made the real problem worse: at that size there is no wall left for the door
   to be an opening in, so the leaves ARE the background and nothing reads as
   architecture. The aperture comes back in, and the wall around it gets the
   frame — lintel, jambs, threshold — that says "opening".                   */
const APER = {
  w: Math.round(W * 0.58), cx: Math.round(W * 0.50), top: Math.round(H * 0.15),
};
const JAMB = Math.round(W * 0.042);   // the frame's thickness down each side
const LINTEL = Math.round(H * 0.085); // the beam over the opening
const DOOR = { w: APER.w, cx: APER.cx };            // the leaves fill the aperture
// The Warden stands in the RIGHT leaf, clear of the centre seam — the seam is
// the HP meter and must never be occluded by the thing it measures.
const GATE = { x: APER.cx + Math.round(W * 0.13), y: FLOOR };
const BOSS_H = Math.round(H * 0.60);  // the Warden nearly fills the opening
const HERO_H = Math.round(H * 0.18);  // the scale gap IS the story — never scaled up
const HERO = { x: Math.round(W * 0.22), y: FLOOR }; // in the doorway, opposite the Warden

let canvas = null, ctx = null;

/* ── the theme bridge ──────────────────────────────────────────────────────
   DESIGN.md says battle.js "consumes it through the existing theme() bridge".
   There was no such bridge — the canvas was still drawing v1 hexes while every
   other surface moved to v4, which is the real reason the arena looked foreign
   rather than merely plain. This is it: read the tokens off the document once,
   re-read when the door changes, so the canvas and the DOM cannot disagree
   about what --w-active or --gold mean.                                     */
// Every token the draw code calls must be listed here or `c()` returns the
// magenta fallback. `--panel` was drawn three times and listed zero times, so
// the door and both figures' shade sides rendered #ff00ff on staging for two
// commits — the fallback worked, nobody re-rendered the canvas to see it.
const TOKENS = ["--well", "--bg", "--panel", "--inset", "--field", "--line",
  "--line-soft", "--gold", "--gold-dim", "--gold-bright", "--bone",
  "--floor-glow", "--w-active", "--edge-lit", "--edge-shade",
  "--meter-fill-depletion", "--meter-fill-depletion-crisis", "--dmg-text",
  "--crit-gold", "--super-crit"];
let T = {};
export function refreshTheme() {
  if (typeof getComputedStyle !== "function") return;
  const cs = getComputedStyle(document.documentElement);
  for (const t of TOKENS) T[t] = cs.getPropertyValue(t).trim() || T[t] || "#000";
}
// Magenta, not #000. A black fallback is invisible on this ramp, so four
// tokens that were documented but never shipped rendered every damage number
// and the BREACHED reveal in silent black for two commits. A wrong colour you
// cannot miss beats a wrong colour that looks deliberate.
const c = t => {
  const v = T[t];
  if (!v) { console.warn(`battle.js: token ${t} is not defined in the stylesheet`); return "#ff00ff"; }
  return v;
};

const floaters = []; // {x, y, alpha, text, size, color, scale, vx}
let bossX = GATE.x;  // where the Warden actually is — see LOOKS `aside`
let lastHitAt = 0;
let shakeUntil = 0;
let flashUntil = 0;
let bossFlashUntil = 0;
let reveal = null; // {text, sub, color, until}

export function initBattle(el) {
  canvas = el;
  canvas.width = W;
  canvas.height = H;
  ctx = canvas.getContext("2d");
  refreshTheme();
}

// A floating text: spawns scaled up (pop) then settles, drifts up + sideways,
// fades. Outlined at draw time — the damage-skin look.
function spawnFloater(text, color, size = 15) {
  floaters.push({
    x: bossX - 42 + Math.random() * 84,   // Sef stands aside; the numbers follow him
    // Mid-torso, drifting up to the shoulders. Numbers belong ON the thing
    // being hit — but above this the drift carries them across the hood and
    // covers the eyes, which are the only face the Warden has.
    y: FLOOR - BOSS_H * 0.55 - Math.random() * 22,
    alpha: 1, text, color, size,
    scale: 1.4, vx: (Math.random() - 0.5) * 0.8,
  });
}

// One streamed hit → its damage-skin styling by crit tier.
function spawnHit(dmg, tier, now) {
  const suffix = tier === 2 ? "**" : tier === 1 ? "*" : "";
  const color = c(tier === 2 ? "--super-crit" : tier === 1 ? "--crit-gold" : "--dmg-text");
  const size = tier === 2 ? 27 : tier === 1 ? 20 : 15;
  spawnFloater(fmt(dmg) + suffix, color, size);
  if (tier === 2) { // super crit: a small burst, like the break specks
    shakeUntil = Math.max(shakeUntil, now + 120);
    flashUntil = Math.max(flashUntil, now + 90);
    for (let i = 0; i < 5; i++) spawnFloater("✦", c("--crit-gold"), 9 + Math.random() * 8);
  }
}

// Enhance feel: shake/flash scaled to the band (+18 lands like a boss kill).
export function notifyEnhance(plus, success) {
  const now = performance.now();
  if (!success) return;
  const nightmare = plus >= 13, risk = plus >= 6;
  if (risk) shakeUntil = now + (nightmare ? 500 : 220);
  if (nightmare) flashUntil = now + 120;
  spawnFloater(`+${plus}`, c(nightmare ? "--gold-bright" : "--dmg-text"), nightmare ? 26 : 18);
}

// A REAL rolled hit from the logic tick (the skills.js roller). The stream
// stopped rolling its own dice 2026-07-27 — every number drawn here landed.
export function notifyHit(dmg, tier) {
  spawnHit(dmg, tier, performance.now());
  bossFlashUntil = performance.now() + 70;
}

// Skill feedback from main.js (casts, Judgment beats, combo finishers). Same
// damage-skin floaters as the hit stream; token names come from TOKENS.
export function notifySkill(text, token = "--dmg-text", size = 20, shake = false) {
  const now = performance.now();
  spawnFloater(text, c(token), size);
  if (shake) {
    shakeUntil = Math.max(shakeUntil, now + 200);
    flashUntil = Math.max(flashUntil, now + 100);
  }
}

// Called by main.js when a Warden breaks — the one loud frame.
export function notifyBreak() {
  const now = performance.now();
  reveal = { text: "BREACHED", sub: "THE DOOR OPENS", color: c("--gold-bright"), until: now + 6000 };
  shakeUntil = now + 600;
  flashUntil = now + 160;
  for (let i = 0; i < 26; i++) spawnFloater("✦", c("--gold-bright"), 12 + Math.random() * 16);
}

/* A plate with the bevel pair the DOM already uses for every raised surface:
   --edge-lit along the top (light comes from above), --edge-shade along the
   bottom. This is the whole reason the frame reads as proud of the leaves and
   the leaves read as set back into it — one construction language, canvas and
   DOM. `lightSide` -1/1/0 puts the vertical lit edge on the seam side.        */
function plate(x, y, w, h, lightSide = 0) {
  ctx.fillStyle = c("--field");
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = c("--edge-lit");
  ctx.fillRect(x, y, w, 1);
  if (lightSide) ctx.fillRect(lightSide < 0 ? x : x + w - 1, y, 1, h);
  ctx.fillStyle = c("--edge-shade");
  ctx.fillRect(x, y + h - 1, w, 1);
}

// The doorway: an aperture cut in the wall, framed by two jambs and a lintel,
// with the two leaves recessed inside it and the HP meter as their centre seam
// of light. `remain` 1..0 — the seam is full height at 100% and shortens from
// the TOP down, so the light going out IS the health draining.
function drawDoor(open, remain) {
  const half = DOOR.w / 2, top = APER.top, h = FLOOR - top;
  const part = open ? Math.round(DOOR.w * 0.14) : 0; // BREACHED: the leaves part
  const L = APER.cx - half, R = APER.cx + half;

  if (open) { // the well behind the door floods with light
    ctx.fillStyle = c("--gold-bright");
    ctx.globalAlpha = 0.22;
    ctx.fillRect(L, top, DOOR.w, h);
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.beginPath();       // the leaves live INSIDE the opening. Unclipped, the
  ctx.rect(L, top, DOOR.w, h);  // parting leaves slid out over the wall.
  ctx.clip();
  for (const dir of [-1, 1]) { // two leaves, parting outward when open
    const x = dir < 0 ? L - part : APER.cx + part;
    // Three steps on the ramp's own gated separations: --bg wall (L* 2.5)
    // < --panel leaf (L* 7.4) < --field frame and figures (L* 13.5). The leaf
    // is the RECESS, so it is the darkest surface of the three — the door was
    // --field once, which put it above the figures and turned every one of
    // them into a silhouette. That inversion is what read as "shadowy".
    ctx.fillStyle = c("--panel");
    ctx.fillRect(x, top, half, h);
    // the leaf's own inner shadow at the head, under the lintel
    const cast = ctx.createLinearGradient(0, top, 0, top + LINTEL * 0.8);
    cast.addColorStop(0, c("--edge-shade"));
    cast.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cast;
    ctx.fillRect(x, top, half, LINTEL * 0.8);
    // two vertical inlay rules per leaf — the door's only ornament
    ctx.fillStyle = c("--gold-dim");
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + Math.round(half * 0.30), top + Math.round(h * 0.08), 1, Math.round(h * 0.84));
    ctx.fillRect(x + Math.round(half * 0.70), top + Math.round(h * 0.08), 1, Math.round(h * 0.84));
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  const crisis = remain < 0.15;
  const lit = !open && remain > 0 ? Math.round(h * remain) : 0;
  if (lit) { // the seam of light — this is the HP meter
    ctx.fillStyle = c(crisis ? "--meter-fill-depletion-crisis" : "--meter-fill-depletion");
    ctx.fillRect(APER.cx - 2, FLOOR - lit, 4, lit);
    ctx.globalAlpha = crisis ? 0.30 : 0.18;   // bloom either side of the seam
    ctx.fillRect(APER.cx - 7, FLOOR - lit, 14, lit);
    ctx.globalAlpha = 1;
  }

  // The frame, drawn OVER the leaves so it reads as in front of them. Each
  // jamb's lit edge faces the seam, which is the only light source in the room.
  plate(L - JAMB, top - 1, JAMB, FLOOR - top + 1, 1);
  plate(R, top - 1, JAMB, FLOOR - top + 1, -1);
  plate(L - JAMB, top - LINTEL, DOOR.w + JAMB * 2, LINTEL);
  // the threshold: the frame's foot, catching the spill under the door
  plate(L - JAMB * 2, FLOOR, DOOR.w + JAMB * 4, Math.round(H * 0.022));

  /* Light escaping the TOP of the seam, drawn after the frame so it washes the
     lintel rather than being painted over by it.

     The seam already reached the full height of the opening, but it stopped
     dead against the lintel's --edge-shade line with nothing above it, so even
     at 100% it read as "not going all the way up". The floor end got a spill
     wedge and the head end got nothing. A light column has two ends.

     It tracks the seam's top wherever that is, so as health drains the escape
     travels down with it and the terminus is always a falloff instead of a
     chop. */
  if (lit) {
    const topY = FLOOR - lit, reach = LINTEL * 1.15;
    const esc = ctx.createLinearGradient(0, topY, 0, topY - reach);
    esc.addColorStop(0, c(crisis ? "--meter-fill-depletion-crisis" : "--meter-fill-depletion"));
    esc.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (crisis ? 0.55 : 0.42) * remain;
    ctx.fillStyle = esc;
    ctx.fillRect(APER.cx - 10, topY - reach, 20, reach);
    ctx.restore();
  }
}

/* Silhouettes, not stacked rectangles.

   Both figures were built as three or four `fillRect`s, which is why the
   verdict was "my character is a block" — it was, literally. A profile is
   given here as a point list in body units (x across, y UP from the feet, both
   0..1-ish) and traced as one path. Points are snapped to whole pixels: this
   canvas is `image-rendering: pixelated` and a half-pixel edge on a dark ramp
   is a grey smear, not an edge.

   Body units let the same profile hold at 63px (hero) and 210px (Warden). */
function trace(pts, x, feet, u, h) {
  const p = new Path2D();
  pts.forEach(([px, py], i) => {
    const X = Math.round(x + px * u), Y = Math.round(feet - py * h);
    i ? p.lineTo(X, Y) : p.moveTo(X, Y);
  });
  p.closePath();
  return p;
}

/* The Warden. Front-facing and asymmetric: ONE oversized pauldron on the far
   side and a hood that leans toward the light. The heavy side is placed away
   from the seam so the meter is never occluded, and the near profile stays
   clean for the rim. The skirt flares to the floor rather than splitting into
   legs — monumental reads better than bipedal at this scale, and it is one
   fewer thing for the sprite pass to have to beat.                          */
const WARDEN = [
  [-0.06, 1.00], [0.16, 0.94], [0.14, 0.86], [0.30, 0.84],  // hood + right collar
  [0.86, 0.74], [0.80, 0.56], [0.60, 0.52],                 // the pauldron
  [0.62, 0.20], [0.52, 0.16], [0.46, 0.34], [0.40, 0.50],   // the hanging arm
  [0.42, 0.00], [-0.44, 0.00],                              // the skirt, hem to hem
  [-0.34, 0.44], [-0.30, 0.62], [-0.40, 0.74],              // near side, waist to shoulder
  [-0.26, 0.84], [-0.14, 0.86], [-0.16, 0.94],              // near collar + hood
];

/* Yara, the ninth door. Her identity is the silhouette rather than the light:
   a trailing mass — hair, fabric, both at once — sweeping off the FAR side and
   pooling on the floor. Far side deliberately: the near side has to stay clear
   of the centre seam, which is the HP meter.

   Honest ceiling on this channel: at 192px and near-black, hair versus cloak is
   not distinguishable and there is no face. What reads is a tall figure with a
   long asymmetric train. That is genuinely all a canvas silhouette can carry —
   and it is the reason a portrait is where "who she is" actually belongs. */
const WARDEN_DRAPE = [
  // A rounded crown offset to the far side — mass piled to one side, not the
  // symmetrical point every other Warden wears. Yara sharing the hood cone made
  // her read as the same creature in a longer coat.
  [-0.10, 0.99], [0.10, 1.00], [0.22, 0.94], [0.20, 0.85], [0.36, 0.80],
  [0.62, 0.84], [0.52, 0.66], [0.46, 0.50],                 // the train's shoulder
  [0.60, 0.34], [0.86, 0.16], [0.96, 0.04],                 // sweeping out and down
  [0.70, 0.00], [-0.26, 0.00],                              // pooled on the floor, to the hem
  [-0.30, 0.30], [-0.26, 0.54], [-0.34, 0.72],              // near side — kept narrow
  [-0.22, 0.82], [-0.18, 0.87], [-0.20, 0.95],
];

/* The envelope — the Warden's aura, and the thing every boss reference had
   that this arena did not. In all of them the figure is a near-black mass and
   ALL the light and hue lives in a spread 2-3x its size around it. The figure
   was never the missing piece; the envelope was.

   It carries state, so it is not decoration: the spread RETRACTS as the door
   is worn down (the same language as the seam — light going out IS health
   draining), and FLARES under 15% where the seam already goes -crisis. That
   makes boss progress readable at arm's length, which a 4px seam and 1.5px
   fracture lines are not. On BREACHED it goes out entirely: the envelope is
   the Warden's presence, and the gold flood through the open door is what
   replaces it.

   `lighter` for the whole thing, which is not a style choice — additive light
   can only ever ADD, so the envelope can never hide the HP seam it crosses or
   darken the wall it spills onto. It also happens to be how light works.

   `--w-active` is the door's own colour, so every construction below comes out
   in the hue of the door you are standing at, for free. */

/* ── per-Warden identity ───────────────────────────────────────────────────
   Ten doors were reading as ten ROOMS rather than ten bosses, and the reason
   is structural, not cosmetic: DESIGN.md's lane 2 is "WARDEN — which door you
   are at", explicitly "qualitative, not ordinal: a door is a PLACE, not a
   magnitude". The hue lane says WHERE you are. Nothing in the system ever said
   WHO is standing there. This is that missing channel.

   Six constructions, taken from the user's boss references as GEOMETRY rather
   than as art, spread over ten doors:

     sweep   asymmetric swept wings, one side leading    martial, directional
     ascent  narrow blades biased steeply upward         rising, held
     corona  a full burst, all round and long            overwhelming
     ring    an arc, or a closed circle, behind the head sealed, ancient
     vein    NO envelope — the mass is lit from INSIDE   contained
     drape   NO envelope — a trailing silhouette carries it (see WARDEN_DRAPE)

   `vein` and `drape` are the load-bearing ones. Without a construction that is
   the ABSENCE of an envelope, all ten doors are a light show and none of them
   lands.                                                                    */
const FANS = {
  // Angles are biased AWAY from vertical: a 16/10 aperture is wider than it is
  // tall, so a spread that reaches up gets guillotined by the top edge and one
  // that reaches out fills the frame. corona deliberately runs past 90° so it
  // wraps under the figure and becomes a burst rather than a pair of wings.
  sweep:  [[34, 1.00], [52, 0.88], [70, 0.70], [88, 0.46]],
  ascent: [[14, 0.84], [26, 1.00], [38, 0.94], [50, 0.72], [62, 0.48]],
  corona: [[20, 0.92], [42, 1.00], [64, 0.96], [86, 0.86], [108, 0.70], [130, 0.50]],
};
const ROOT = 9;   // half-width at the blade root. 4px was a hair, not a wing.
// Where the envelope hangs from, as a fraction of body height above the feet.
const ORIGIN = { sweep: 0.22, ascent: 0.22, ring: 0.42, corona: 0.42 };
const STILL = typeof matchMedia === "function"
  && matchMedia("(prefers-reduced-motion: reduce)").matches;

const LOOKS = {
  // Vess greets you and points you at the bot forums. The first door should not
  // spend the whole budget — quiet, warm, lit from within.
  w1:  { kind: "vein",   heat: 0.55 },
  // "This one was sealed after the exploits were catalogued." A ring IS a seal:
  // tight, closed, high-contrast.
  // `at` overrides where the ring hangs. A ring this small centred on the torso
  // is almost entirely BEHIND the figure — all that escaped was a stray hook off
  // one hip. A tight ring has to sit behind the HEAD to read at all, where it
  // becomes the halo-as-seal; only a ring as big as Osei's can afford the torso.
  w2:  { kind: "ring",   scale: 0.72, arc: 0.55, at: 0.10 },
  // "It was built for a raid of forty." The enforcer.
  w3:  { kind: "sweep",  scale: 1.00, bias: 1 },
  // Osei is the OLDEST — the only Warden who remembers the roster coloured in
  // and the auction house mid-war. Age is carried by scale, tempo and
  // WHOLENESS: the widest envelope of the ten, the only unbroken circle, the
  // slowest pulse. Never by wear. The no-decay rule is hard, and "the oldest is
  // the most INTACT, because it predates the dying" is the reading that argues
  // for the server still working rather than against it.
  w4:  { kind: "ring",   scale: 1.34, arc: 1, pulse: 0.30 },
  // "Everything temporary here became forever." Vess's construction, guttering.
  // One number apart, seven doors apart.
  // 0.20 was indistinguishable from Sef's nothing, and two doors reading as
  // "no light" costs Sef the signal his whole identity rests on. An ember, not
  // an absence: clearly dimmer than Vess, clearly still lit.
  w5:  { kind: "vein",   heat: 0.34 },
  // "Some servers should be allowed to die with dignity." Hostile and
  // defensive, so the sweep leads on the side facing the door it is protecting.
  w6:  { kind: "sweep",  scale: 0.92, bias: -1 },
  // "Six years I have stood here." Blades held, not thrown.
  w7:  { kind: "ascent", scale: 0.86 },
  // Sef was written as a tier-four raid encounter and shipped as a door guard.
  // He is the ONLY Warden with no envelope at all, which in a set of ten light
  // shows is the loudest signal available. He also stands ASIDE — far enough to
  // lean on the right jamb, which is both the clearest view of the HP seam in
  // the whole climb and a man visibly not doing his job. Under 15% it ignites
  // into the envelope he was PROMISED: cut content at full size, for the only
  // fight anyone ever gave him.
  w8:  { kind: "cut",    aside: 0.05, flare: "corona", scale: 1.30 },
  // Yara offers you the way out, which makes her structurally the temptress.
  // Her identity is in the silhouette rather than in light — and no envelope.
  w9:  { kind: "drape" },
  // The end. A small dark figure inside a vast light.
  w10: { kind: "corona", scale: 1.52 },
};
const LOOK_OF = id => LOOKS[id] || LOOKS.w3;   // a new wall draws SOMETHING

// One blade fan serves sweep, ascent and corona — they differ only in their
// angle table. `bias` makes one wing lead, which is what separates a posed
// silhouette from a symmetrical one.
function blades(ox, oy, R, fan, bias, alpha) {
  ctx.fillStyle = c("--w-active");
  ctx.globalAlpha = alpha;
  for (const dir of [-1, 1]) {
    const side = !bias || dir === bias ? 1 : 0.58;
    for (const [deg, len] of fan) {
      const a = deg * Math.PI / 180, L = R * len * side;
      const sn = Math.sin(a), cs = Math.cos(a);
      ctx.beginPath();                              // root edge, swept to the tip
      ctx.moveTo(ox + dir * cs * ROOT, oy + sn * ROOT);
      ctx.quadraticCurveTo(
        ox + dir * (sn * L * 0.6 + cs * L * 0.18), oy - cs * L * 0.6 + sn * L * 0.18,
        ox + dir * sn * L, oy - cs * L);
      ctx.lineTo(ox - dir * cs * ROOT, oy - sn * ROOT);
      ctx.fill();
    }
  }
}

/* `arc` 1 = a closed circle (Osei, the oldest and the only whole one); below 1
   it is an arc of that fraction of a turn, centred straight up.

   An ELLIPSE, not a circle. Osei's ring has to be the widest envelope of the
   ten to carry "oldest", and a circle that wide does not fit a 16/10 frame —
   at scale 1.34 the top third was cut off flat at y=0, which reads as a bug
   rather than as scale. Squashed, it stays the widest thing in the arena and
   still fits, and a halo behind a standing figure wants to be oval anyway. */
function ringEnv(ox, oy, R, arc, flat, alpha) {
  ctx.strokeStyle = c("--w-active");
  ctx.globalAlpha = alpha;
  ctx.lineWidth = Math.max(2, R * 0.055);
  ctx.beginPath();
  const ry = R * flat;
  if (arc >= 1) ctx.ellipse(ox, oy, R, ry, 0, 0, Math.PI * 2);
  else ctx.ellipse(ox, oy, R, ry, 0, -Math.PI / 2 - Math.PI * arc, -Math.PI / 2 + Math.PI * arc);
  ctx.stroke();
}

function drawEnvelope(now, look, x, top, hgt, spread, crisis) {
  let kind = look.kind;
  if (kind === "cut") {
    if (!crisis) return;      // Sef is not defending this door…
    kind = look.flare;        // …until the last 15% of it.
  }
  if (kind === "vein" || kind === "drape") return;   // these are carried by the figure
  const beat = STILL ? 1 : 1 + 0.04 * Math.sin(now * (look.pulse ?? 1) / 700);
  // Wings come off the BACK, so they hang from the shoulders. A ring or a burst
  // surrounds the whole figure, so it centres on the torso — pinned at shoulder
  // height instead, both of them ran off the top of the frame while leaving
  // dead space under the hem.
  const ox = x, oy = Math.round(top + hgt * (look.at ?? ORIGIN[kind] ?? 0.22));
  const R = hgt * 0.54 * (look.scale ?? 1) * spread * beat;
  if (R < 6) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const bloom = ctx.createRadialGradient(ox, oy, 0, ox, oy, R * 1.05);
  bloom.addColorStop(0, c("--w-active"));            // the haze it all sits in
  bloom.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = (crisis ? 0.42 : 0.28) * spread;
  ctx.fillStyle = bloom;
  ctx.fillRect(ox - R * 1.1, oy - R * 1.1, R * 2.2, R * 2.2);
  // Low alpha on purpose. Additive fills COMPOUND where blades overlap, so the
  // hot core near the shoulders comes free from the geometry — at 0.32 each the
  // overlaps clipped to solid and the wings read as foliage, not light.
  const alpha = crisis ? 0.30 : 0.20;
  if (kind === "ring") ringEnv(ox, oy, R, look.arc ?? 1, look.flat ?? 0.78, alpha);
  else blades(ox, oy, R, FANS[kind] || FANS.sweep, look.bias ?? 0, alpha);
  ctx.restore();
}

// goneFrac 0..1 opens fracture lines of LIGHT through the silhouette — never
// chips or notches. Light-through reads as "something is giving way";
// material-removed reads as "this is broken", and nothing here is broken.
function drawBoss(now, broken, goneFrac, id) {
  const look = LOOK_OF(id);
  const hgt = BOSS_H;
  const u = Math.round(hgt * 0.42);
  const x = broken ? GATE.x - Math.round(DOOR.w * 0.42)
    : GATE.x + Math.round(W * (look.aside ?? 0));
  const top = FLOOR - hgt;
  const lit = now < bossFlashUntil;
  const body = trace(look.kind === "drape" ? WARDEN_DRAPE : WARDEN, x, FLOOR, u, hgt);
  bossX = x;

  // Envelope first: the figure silhouettes against its own aura.
  const crisis = goneFrac > 0.85;
  if (!broken) drawEnvelope(now, look, x, top, hgt, crisis ? 1.10 : 0.45 + 0.55 * (1 - goneFrac), crisis);

  // LIT, not backlit — an object standing in the room, --field over the
  // --panel leaf behind it. The lighting treatment is the same as before; it
  // is now clipped to a profile instead of painted onto a box.
  ctx.fillStyle = c("--field");
  ctx.fill(body);
  // A contour all the way round in --line (L* 17.1). Without it the shade side
  // is --panel against a --panel leaf and the far half of the silhouette
  // dissolves into the door. This is a MATERIAL edge, not a highlight, so it
  // does not violate the one-light-source rule the rim below obeys.
  ctx.strokeStyle = c("--line");
  ctx.lineWidth = 1;
  ctx.stroke(body);

  ctx.save();
  ctx.clip(body);
  ctx.fillStyle = c("--panel");                    // shade side, away from the seam
  ctx.fillRect(x + u * 0.16, top, u * 1.2, hgt);
  // The floor light climbing the body has to ADD light. Painted normally it
  // subtracted it: --floor-glow is L* 6.4 and the body is L* 13.5, so the
  // "glow" was a darker rectangle over the figure's lit half and the Warden
  // got dimmer the closer it stood to the light.
  const wash = ctx.createLinearGradient(0, FLOOR - hgt * 0.55, 0, FLOOR);
  wash.addColorStop(0, "rgba(0,0,0,0)");
  wash.addColorStop(1, c("--floor-glow"));
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = wash;
  ctx.fillRect(x - u, FLOOR - hgt * 0.55, u * 2, hgt * 0.55);
  // VEIN: no envelope at all — the mass is lit from INSIDE instead. At 192px
  // individual veins are noise, so this is a hot core rather than linework: what
  // reads is a figure glowing from within. Dims with the door's health like
  // every other construction, so it still carries state.
  if (look.kind === "vein") {
    const cy = top + hgt * 0.55;
    const core = ctx.createRadialGradient(x, cy, 0, x, cy, u * 1.6);
    core.addColorStop(0, c("--w-active"));
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = look.heat * (0.45 + 0.55 * (1 - goneFrac));
    ctx.fillStyle = core;
    ctx.fillRect(x - u * 1.8, top, u * 3.6, hgt);
  }
  ctx.restore();

  // DRAPE has no envelope, and left at that Yara was the only Warden in ten
  // with no light of her own at all — which reads as unfinished rather than as
  // deliberate. Her hue runs along the train's outer edge instead: light
  // catching fabric. It is her own light, exactly as an envelope would be, so
  // it is not a second room light source.
  if (look.kind === "drape") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + u * 0.2, top, u * 1.4, hgt);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = c("--w-active");
    ctx.globalAlpha = 0.45 * (0.5 + 0.5 * (1 - goneFrac));
    ctx.lineWidth = 3;
    ctx.stroke(body);
    ctx.restore();
  }

  // Rim on the seam side only: stroke the whole profile, clipped to the near
  // half. One light source in the room means one lit edge — and it is beside
  // the figure, not under it, so the hem is left out of the clip.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - u * 1.2, top - 4, u * 1.2, hgt - 2);
  ctx.clip();
  ctx.strokeStyle = lit ? c("--gold-bright") : c("--gold-dim");
  ctx.globalAlpha = lit ? 0.95 : 0.55;
  ctx.lineWidth = 2;
  ctx.stroke(body);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Two lit eyes in the door's own hue. The spec said "flat dark mass", and
  // taken literally that is a void with no character — the sprite this
  // replaced at least looked back at you.
  ctx.fillStyle = c("--w-active");
  ctx.fillRect(Math.round(x - u * 0.10), Math.round(top + hgt * 0.10), Math.round(u * 0.11), 3);
  ctx.fillRect(Math.round(x + u * 0.04), Math.round(top + hgt * 0.10), Math.round(u * 0.11), 3);

  // fractures of light — one more opens per 20% of health gone
  const n = Math.min(4, Math.floor(goneFrac / 0.2));
  const seams = [[0.18, 0.30], [0.46, 0.38], [0.30, 0.22], [0.66, 0.26]];
  ctx.save();
  ctx.clip(body);
  ctx.fillStyle = c(goneFrac > 0.85 ? "--gold-bright" : "--gold");
  for (let i = 0; i < n; i++) {
    const [fy, fh] = seams[i];
    ctx.globalAlpha = 0.30 + 0.12 * i;
    ctx.fillRect(x - u * 0.32 + i * u * 0.20, top + hgt * fy, 1.5, hgt * fh);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/* The player, ~18% of frame height. The scale gap against the Warden is the
   story, so the figure is never scaled up — which means the silhouette has to
   do its work in 63 pixels. Two legs with a gap between them, and a polearm
   taller than the figure: at this size the weapon is what says "a person",
   and it is the only part that breaks the head's outline against the wall. */
const HERO_BODY = [
  [-0.10, 1.00], [0.18, 0.96], [0.20, 0.82],                // head
  [0.40, 0.76], [0.44, 0.44], [0.30, 0.42], [0.26, 0.30],   // weapon arm + hip
  [0.30, 0.00], [0.08, 0.00], [0.04, 0.26], [-0.06, 0.00],  // legs, with the gap
  [-0.28, 0.00], [-0.24, 0.34], [-0.38, 0.42], [-0.34, 0.72],
  [-0.18, 0.80], [-0.20, 0.96],
];

function drawHero(now, fighting) {
  const hgt = HERO_H;
  const u = Math.round(hgt * 0.62);
  const lunge = fighting ? Math.sin(now / 120) * 3 : 0;
  const x = Math.round(HERO.x + lunge), top = FLOOR - hgt;
  const body = trace(HERO_BODY, x, FLOOR, u, hgt);

  ctx.fillStyle = c("--field");                    // lit, same language as the Warden
  ctx.fill(body);
  ctx.strokeStyle = c("--line");                   // material contour, as the Warden
  ctx.lineWidth = 1;
  ctx.stroke(body);
  ctx.save();
  ctx.clip(body);
  ctx.fillStyle = c("--panel");                    // shade side, away from the door
  ctx.fillRect(x - u, top, u * 1.15, hgt);
  ctx.restore();

  // the polearm: held in the near hand, angled toward the door
  ctx.strokeStyle = c("--bone");
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(Math.round(x + u * 0.42), FLOOR);
  ctx.lineTo(Math.round(x + u * 0.62), Math.round(top - hgt * 0.34));
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.save();                                      // rim on the door-facing side
  ctx.beginPath();
  ctx.rect(x + u * 0.10, top - 4, u, hgt - 1);
  ctx.clip();
  ctx.strokeStyle = c("--bone");
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 2;
  ctx.stroke(body);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function renderBattle(state) {
  if (!ctx) return;
  const now = performance.now();
  const boss = getBoss(state.wall);
  const fighting = !state.boss.broken && state.wall === state.maxWall;
  const goneFrac = boss?.hp ? 1 - Math.max(0, (state.boss.hp || 0) / boss.hp) : (state.boss.broken ? 1 : 0);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (now < shakeUntil) {
    const a = (shakeUntil - now) / 600;
    ctx.setTransform(1, 0, 0, 1, (Math.random() - 0.5) * 14 * a, (Math.random() - 0.5) * 10 * a);
  }

  // Ground: the well, with a warm band rising off the floor line — light
  // escaping under the door. --floor-glow is derived from the active Warden,
  // so each door lights its own room.
  // The room sits on --bg, not --well. --well is the deepest surface in the
  // whole client, and putting the whole scene on it left nothing for a lit
  // figure to sit against — everything was the floor of the value range.
  ctx.fillStyle = c("--bg");
  ctx.fillRect(-20, -20, W + 40, H + 40);
  // The wall the door is cut into: one full-span course above the lintel.
  // Full-span because a rule WITH A GAP in it reads as damage, and nothing in
  // this server is damaged.
  ctx.fillStyle = c("--line-soft");
  ctx.fillRect(-20, Math.round(APER.top - LINTEL - H * 0.035), W + 40, 1);
  // Light POOLS at the floor line and falls off both ways. Filling the whole
  // area below FLOOR with --floor-glow made a flat olive slab that read as
  // carpet, not light — a gradient in each direction is the fix.
  const up = ctx.createLinearGradient(0, FLOOR - H * 0.24, 0, FLOOR);
  up.addColorStop(0, "rgba(0,0,0,0)");
  up.addColorStop(1, c("--floor-glow"));
  ctx.fillStyle = up;
  ctx.fillRect(-20, FLOOR - H * 0.24, W + 40, H * 0.24);
  const down = ctx.createLinearGradient(0, FLOOR, 0, H);
  down.addColorStop(0, c("--floor-glow"));
  down.addColorStop(1, c("--bg"));
  ctx.fillStyle = down;
  ctx.fillRect(-20, FLOOR, W + 40, H - FLOOR + 20);
  ctx.fillStyle = c("--w-active");            // the floor seam: whose room this is
  ctx.globalAlpha = 0.5;
  ctx.fillRect(-20, FLOOR, W + 40, 1);
  ctx.globalAlpha = 1;

  const remain = state.boss.broken ? 0
    : Math.max(0, Math.min(1, (state.boss.hp || 0) / (boss?.hp || 1)));
  drawDoor(state.boss.broken, remain);
  // The seam throws light ONTO the floor — a wedge widening toward the viewer.
  // This is what makes the seam a light source rather than a painted stripe,
  // and it is the one cue that says there is somewhere behind the door.
  if (remain > 0 || state.boss.broken) {
    const spread = W * (state.boss.broken ? 0.42 : 0.13);
    const fall = ctx.createLinearGradient(0, FLOOR, 0, H);
    fall.addColorStop(0, c(state.boss.broken ? "--gold-bright"
      : remain < 0.15 ? "--meter-fill-depletion-crisis" : "--meter-fill-depletion"));
    fall.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fall;
    ctx.globalAlpha = state.boss.broken ? 0.30 : 0.13;
    ctx.beginPath();
    ctx.moveTo(APER.cx - 8, FLOOR);
    ctx.lineTo(APER.cx + 8, FLOOR);
    ctx.lineTo(APER.cx + spread, H);
    ctx.lineTo(APER.cx - spread, H);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  drawBoss(now, state.boss.broken, goneFrac, boss?.id);
  drawHero(now, fighting);

  // The damage stream arrives from the LOGIC tick now (main.js forwards the
  // roller's real hits through notifyHit/notifySkill) — the canvas rolls
  // nothing itself. `fighting` still gates poses and the boss flash.

  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.y -= 0.7;
    f.x += f.vx;
    f.scale += (1 - f.scale) * 0.2; // settle the pop toward 1×
    f.alpha -= 0.014;
    if (f.alpha <= 0) { floaters.splice(i, 1); continue; }
    ctx.globalAlpha = f.alpha;
    ctx.font = `bold ${(f.size * f.scale).toFixed(1)}px monospace`;
    ctx.textAlign = "center";
    ctx.lineWidth = 3;                 // outlined-digit damage skin
    ctx.strokeStyle = c("--well");
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;


  if (reveal && now < reveal.until) {
    ctx.fillStyle = reveal.color;
    ctx.font = "bold 52px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(reveal.text, W / 2, H / 2 - 10);
    ctx.font = "12px monospace";
    ctx.fillText(reveal.sub, W / 2, H / 2 + 14);
  }

  if (now < flashUntil) {
    ctx.globalAlpha = (flashUntil - now) / 160 * 0.5;
    ctx.fillStyle = c("--gold-bright");
    ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.globalAlpha = 1;
  }
}
