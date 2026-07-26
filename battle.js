// battle.js — canvas battle scene, render-only. No sound (hard veto). The
// fight is now an idle whittle: the Warden's health bar drains at Combat
// Power and the character auto-hits, streaming damage numbers. Crits pop as
// `*` / `**` in a MapleStory-style skin (outlined digits, pop + drift + fade).
import { hpFrac } from "./pull.js";
import { getBoss } from "./bosses.js";
import { derive } from "./stats.js";
import { critStats, rollHit } from "./crits.js";
import { fmt } from "./format.js";

const W = 560, H = 260;
const GATE = { x: 420, y: 175 };  // boss stands here
const HERO = { x: 110, y: 185 };

let canvas = null, ctx = null;

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
}

// A floating text: spawns scaled up (pop) then settles, drifts up + sideways,
// fades. Outlined at draw time — the damage-skin look.
function spawnFloater(text, color, size = 15) {
  floaters.push({
    x: GATE.x - 45 + Math.random() * 90,
    y: GATE.y - 70 - Math.random() * 30,
    alpha: 1, text, color, size,
    scale: 1.4, vx: (Math.random() - 0.5) * 0.8,
  });
}

// One streamed hit → its damage-skin styling by crit tier.
function spawnHit(dmg, tier, now) {
  const suffix = tier === 2 ? "**" : tier === 1 ? "*" : "";
  const color = tier === 2 ? "#ff9a3c" : tier === 1 ? "#ffd54a" : "#e8dcc0";
  const size = tier === 2 ? 27 : tier === 1 ? 20 : 15;
  spawnFloater(fmt(dmg) + suffix, color, size);
  if (tier === 2) { // super crit: a small burst, like the break specks
    shakeUntil = Math.max(shakeUntil, now + 120);
    flashUntil = Math.max(flashUntil, now + 90);
    for (let i = 0; i < 5; i++) spawnFloater("✦", "#ffd54a", 9 + Math.random() * 8);
  }
}

// Enhance feel: shake/flash scaled to the band (+18 lands like a boss kill).
export function notifyEnhance(plus, success) {
  const now = performance.now();
  if (!success) return;
  const nightmare = plus >= 13, risk = plus >= 6;
  if (risk) shakeUntil = now + (nightmare ? 500 : 220);
  if (nightmare) flashUntil = now + 120;
  spawnFloater(`+${plus}`, nightmare ? "#ffd700" : "#e8dcc0", nightmare ? 26 : 18);
}

// Called by main.js when a Warden breaks — the one loud frame.
export function notifyBreak() {
  const now = performance.now();
  reveal = { text: "BREACHED", sub: "THE DOOR OPENS", color: "#ffd700", until: now + 6000 };
  shakeUntil = now + 600;
  flashUntil = now + 160;
  for (let i = 0; i < 26; i++) spawnFloater("✦", "#ffd700", 12 + Math.random() * 16);
}

function drawGate(open) {
  ctx.fillStyle = "#2a2a33";
  ctx.fillRect(GATE.x - 70, GATE.y - 140, 22, 160);
  ctx.fillRect(GATE.x + 48, GATE.y - 140, 22, 160);
  ctx.fillRect(GATE.x - 78, GATE.y - 152, 156, 18);
  ctx.fillStyle = open ? "#3d3a26" : "#15151a";
  ctx.fillRect(GATE.x - 48, GATE.y - 134, 96, 154);
  if (open) {
    ctx.fillStyle = "#c9a94b";
    ctx.globalAlpha = 0.25;
    ctx.fillRect(GATE.x - 6, GATE.y - 134, 12, 154);
    ctx.globalAlpha = 1;
  }
}

// goneFrac 0..1 → progressive cracks as integrity falls.
function drawBoss(now, broken, goneFrac) {
  const x = broken ? GATE.x - 96 : GATE.x;
  const lit = now < bossFlashUntil;
  ctx.fillStyle = lit ? "#8a7a5a" : "#5a5346";
  ctx.fillRect(x - 18, GATE.y - 96, 36, 96);
  ctx.fillRect(x - 26, GATE.y - 88, 52, 14);
  ctx.fillStyle = lit ? "#a89a78" : "#6e6656";
  ctx.fillRect(x - 12, GATE.y - 118, 24, 24);
  ctx.fillStyle = "#c9a94b";
  ctx.fillRect(x - 7, GATE.y - 110, 5, 3);
  ctx.fillRect(x + 2, GATE.y - 110, 5, 3);
  if (!broken) { ctx.fillStyle = "#3a3a44"; ctx.fillRect(x + 20, GATE.y - 126, 8, 126); }
  ctx.fillStyle = "#31201e"; // cracks deepen as HP drops
  const cracks = Math.floor(goneFrac / 0.2);
  const spots = [[-14, -80, 3, 26], [6, -60, 3, 34], [-4, -40, 3, 22], [12, -92, 3, 20]];
  for (let i = 0; i < Math.min(cracks, spots.length); i++) {
    const [dx, dy, w, h] = spots[i];
    ctx.fillRect(x + dx, GATE.y + dy, w, h);
  }
}

function drawHero(now, fighting) {
  const lunge = fighting ? Math.sin(now / 120) * 5 : 0;
  const x = HERO.x + lunge;
  ctx.fillStyle = "#4a5a6e";
  ctx.fillRect(x - 12, HERO.y - 58, 24, 58);
  ctx.fillStyle = "#c9b89a";
  ctx.fillRect(x - 9, HERO.y - 74, 18, 16);
  ctx.fillStyle = "#9aa4b2";
  ctx.fillRect(x + 12, HERO.y - 66, 5, 44);
}

// The Warden's health bar — remaining HP, draining at Combat Power. Unlabelled
// while alive (a bar under a boss reads as health); only BREACHED is spelled out.
function drawBars(state) {
  const boss = getBoss(state.wall);
  const full = boss?.hp || 1;
  const remain = state.boss.broken ? 0 : Math.max(0, Math.min(1, (state.boss.hp || 0) / full));
  ctx.fillStyle = "#22222a";
  ctx.fillRect(20, H - 30, W - 40, 14);
  ctx.fillStyle = remain <= 0 ? "#3d3a26" : remain < 0.15 ? "#ffd700" : "#c9a94b";
  ctx.fillRect(20, H - 30, (W - 40) * remain, 14);
  // The in-bar text is GONE, and the contrast defect went with it.
  //
  // It drew "{n}%" right-aligned at the bar's right end in #0d0d10. The fill
  // grows from the LEFT, so for all but the first few percent of a fight that
  // text sat on the empty #22222a track: 1.23:1, illegible, on the hero
  // element of the hero tab. BREACHED had the same problem — at remain 0 the
  // fill has no width, so it too rendered near-black on the track.
  //
  // Recolouring is the wrong fix twice over. No single colour clears both
  // grounds the label can land on (dark-on-gold and light-on-track are
  // opposite requirements), and #depth in the DOM already prints BOTH strings
  // verbatim — main.js:872 "BREACHED", main.js:879 the same percentage. So
  // this was a duplicated fact as well as an unreadable one, and JOURNEY.md
  // gives every fact exactly one owner. The bar is the picture; #depth is the
  // number. That is also what this function's own comment always claimed.
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

  ctx.fillStyle = "#101014";
  ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.fillStyle = "#17171d";
  ctx.fillRect(-20, GATE.y, W + 40, H - GATE.y + 20);

  drawGate(state.boss.broken);
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
    ctx.strokeStyle = "#0b0c10";
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  drawBars(state);

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
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.globalAlpha = 1;
  }
}
