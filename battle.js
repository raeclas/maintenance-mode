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
const FLOOR = Math.round(H * 0.76);   // the floor line; the glow band is below it
const DOOR = { w: Math.round(W * 0.60), cx: Math.round(W * 0.52) };
const GATE = { x: DOOR.cx + Math.round(W * 0.11), y: FLOOR }; // the Warden stands in front of the door
const HERO = { x: Math.round(W * 0.16), y: FLOOR };

let canvas = null, ctx = null;

/* ── the theme bridge ──────────────────────────────────────────────────────
   DESIGN.md says battle.js "consumes it through the existing theme() bridge".
   There was no such bridge — the canvas was still drawing v1 hexes while every
   other surface moved to v4, which is the real reason the arena looked foreign
   rather than merely plain. This is it: read the tokens off the document once,
   re-read when the door changes, so the canvas and the DOM cannot disagree
   about what --w-active or --gold mean.                                     */
const TOKENS = ["--well", "--bg", "--field", "--line", "--gold", "--gold-dim",
  "--gold-bright", "--bone", "--floor-glow", "--w-active", "--edge-lit",
  "--meter-fill-depletion", "--meter-fill-depletion-crisis", "--dmg-text",
  "--crit-gold", "--super-crit"];
let T = {};
export function refreshTheme() {
  if (typeof getComputedStyle !== "function") return;
  const cs = getComputedStyle(document.documentElement);
  for (const t of TOKENS) T[t] = cs.getPropertyValue(t).trim() || T[t] || "#000";
}
const c = t => T[t] || "#000";

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
    x: GATE.x - 45 + Math.random() * 90,
    y: FLOOR - H * 0.60 - Math.random() * 26,
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

// The door leaf, floor to top edge, with the HP meter as its own seam of light.
// `remain` 1..0 — the seam is full height at 100% and shortens from the TOP
// down, so the light going out IS the health draining. `open` parts the leaf.
function drawDoor(open, remain) {
  const half = DOOR.w / 2, top = 0, h = FLOOR - top;
  const part = open ? Math.round(DOOR.w * 0.14) : 0; // BREACHED: the leaf parts

  if (open) { // the well behind the door floods with light
    ctx.fillStyle = c("--gold-bright");
    ctx.globalAlpha = 0.22;
    ctx.fillRect(DOOR.cx - half, top, DOOR.w, h);
    ctx.globalAlpha = 1;
  }

  for (const dir of [-1, 1]) { // two leaves, parting outward when open
    const x = dir < 0 ? DOOR.cx - half - part : DOOR.cx + part;
    ctx.fillStyle = c("--field");
    ctx.fillRect(x, top, half, h);
    ctx.strokeStyle = c("--line");
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, top + 0.5, half - 1, h - 1);
    // two vertical inlay rules per leaf — the door's only ornament
    ctx.fillStyle = c("--gold-dim");
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + Math.round(half * 0.30), Math.round(h * 0.10), 1, Math.round(h * 0.80));
    ctx.fillRect(x + Math.round(half * 0.70), Math.round(h * 0.10), 1, Math.round(h * 0.80));
    ctx.globalAlpha = 1;
  }

  if (!open && remain > 0) { // the seam of light — this is the HP meter
    const crisis = remain < 0.15;
    const lit = Math.round(h * remain);
    ctx.fillStyle = c(crisis ? "--meter-fill-depletion-crisis" : "--meter-fill-depletion");
    ctx.fillRect(DOOR.cx - 2, FLOOR - lit, 4, lit);
    ctx.globalAlpha = crisis ? 0.30 : 0.18;   // bloom either side of the seam
    ctx.fillRect(DOOR.cx - 7, FLOOR - lit, 14, lit);
    ctx.globalAlpha = 1;
  }
}

// The Warden: a flat dark mass standing IN FRONT of the door, ~55% of frame
// height, rim-lit on the side facing the floor glow. goneFrac 0..1 opens
// fracture lines of LIGHT through the silhouette — never chips or notches.
// Light-through reads as "something is giving way"; material-removed reads as
// "this is broken", and nothing in this game is broken.
function drawBoss(now, broken, goneFrac) {
  const hgt = Math.round(H * 0.55);
  const wid = Math.round(hgt * 0.42);
  const x = broken ? GATE.x - Math.round(DOOR.w * 0.42) : GATE.x;
  const top = FLOOR - hgt;
  const lit = now < bossFlashUntil;

  ctx.fillStyle = c("--bg");                       // the mass
  ctx.fillRect(x - wid / 2, top, wid, hgt);
  ctx.fillRect(x - wid * 0.78, top + hgt * 0.10, wid * 1.56, hgt * 0.10); // shoulders
  ctx.fillStyle = c("--bg");
  ctx.fillRect(x - wid * 0.30, top - hgt * 0.13, wid * 0.60, hgt * 0.13);  // head

  // rim light on the floor-glow side (screen left), warmed by the door's hue
  ctx.fillStyle = lit ? c("--gold") : c("--gold-dim");
  ctx.globalAlpha = lit ? 0.9 : 0.55;
  ctx.fillRect(x - wid / 2, top, 2, hgt);
  ctx.fillRect(x - wid * 0.30, top - hgt * 0.13, 2, hgt * 0.13);
  ctx.globalAlpha = 1;

  // Two lit eyes. The spec says "flat dark mass", and taken literally that is
  // a void with no character — the sprite this replaced at least looked back
  // at you. Two pixels of the door's own hue is the whole fix, and it stays
  // inside the silhouette language: light through the mass, never detail on it.
  ctx.fillStyle = c("--w-active");
  ctx.fillRect(x - wid * 0.20, top - hgt * 0.075, wid * 0.13, 3);
  ctx.fillRect(x + wid * 0.07, top - hgt * 0.075, wid * 0.13, 3);

  // fractures of light — one more opens per 20% of health gone
  const n = Math.min(4, Math.floor(goneFrac / 0.2));
  const seams = [[0.18, 0.30], [0.46, 0.38], [0.30, 0.22], [0.66, 0.26]];
  ctx.fillStyle = c(goneFrac > 0.85 ? "--gold-bright" : "--gold");
  for (let i = 0; i < n; i++) {
    const [fy, fh] = seams[i];
    ctx.globalAlpha = 0.30 + 0.12 * i;
    ctx.fillRect(x - wid * 0.32 + i * wid * 0.20, top + hgt * fy, 1.5, hgt * fh);
  }
  ctx.globalAlpha = 1;
}

// The player: the same flat-mass language at ~18% of frame height. The scale
// difference against the Warden is the story, so it is never scaled up.
function drawHero(now, fighting) {
  const hgt = Math.round(H * 0.18);
  const wid = Math.round(hgt * 0.42);
  const lunge = fighting ? Math.sin(now / 120) * 3 : 0;
  const x = HERO.x + lunge, top = FLOOR - hgt;

  ctx.fillStyle = c("--bg");
  ctx.fillRect(x - wid / 2, top, wid, hgt);
  ctx.fillRect(x - wid * 0.34, top - hgt * 0.20, wid * 0.68, hgt * 0.20); // head

  ctx.fillStyle = c("--bone");   // rim on the side facing the door
  ctx.globalAlpha = 0.7;
  ctx.fillRect(x + wid / 2 - 2, top, 2, hgt);
  ctx.fillRect(x + wid * 0.34 - 2, top - hgt * 0.20, 2, hgt * 0.20);
  ctx.globalAlpha = 1;
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
  ctx.fillStyle = c("--well");
  ctx.fillRect(-20, -20, W + 40, H + 40);
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
  down.addColorStop(1, c("--well"));
  ctx.fillStyle = down;
  ctx.fillRect(-20, FLOOR, W + 40, H - FLOOR + 20);
  ctx.fillStyle = c("--w-active");            // the floor seam: whose room this is
  ctx.globalAlpha = 0.5;
  ctx.fillRect(-20, FLOOR, W + 40, 1);
  ctx.globalAlpha = 1;

  const remain = state.boss.broken ? 0
    : Math.max(0, Math.min(1, (state.boss.hp || 0) / (boss?.hp || 1)));
  drawDoor(state.boss.broken, remain);
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
