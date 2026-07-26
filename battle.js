// battle.js — canvas battle scene, render-only. No sound (hard veto). The
// fight is now an idle whittle: the Warden's health bar drains at Combat
// Power and the character auto-hits, streaming damage numbers. Crits pop as
// `*` / `**` in a MapleStory-style skin (outlined digits, pop + drift + fade).
import { hpFrac } from "./pull.js";
import { getBoss } from "./bosses.js";
import { derive } from "./stats.js";
import { critStats, rollHit } from "./crits.js";
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
    x: GATE.x - 42 + Math.random() * 84,
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

  if (!open && remain > 0) { // the seam of light — this is the HP meter
    const crisis = remain < 0.15;
    const lit = Math.round(h * remain);
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

// goneFrac 0..1 opens fracture lines of LIGHT through the silhouette — never
// chips or notches. Light-through reads as "something is giving way";
// material-removed reads as "this is broken", and nothing here is broken.
function drawBoss(now, broken, goneFrac) {
  const hgt = BOSS_H;
  const u = Math.round(hgt * 0.42);
  const x = broken ? GATE.x - Math.round(DOOR.w * 0.42) : GATE.x;
  const top = FLOOR - hgt;
  const lit = now < bossFlashUntil;
  const body = trace(WARDEN, x, FLOOR, u, hgt);

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
  ctx.restore();

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
  drawBoss(now, state.boss.broken, goneFrac);
  drawHero(now, fighting);

  // damage stream: auto-hits at the character's hit rate, each rolls a crit tier
  if (fighting) {
    const d = derive(state);
    const interval = Math.max(90, 1000 / d.hitsPerSec);
    if (now - lastHitAt > interval) {
      lastHitAt = now;
      const cs = d.crit || critStats(state);
      const { dmg, tier } = rollHit(d.atk, cs);
      spawnHit(dmg, tier, now);
      bossFlashUntil = now + 70;
    }
  }

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
