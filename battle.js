// battle.js — canvas battle scene, render-only. No sound (hard veto), no
// ceremony: the 30s window IS the ritual, the break is one loud frame.
import { currentDepth, pullFrac } from "./pull.js";
import { getBoss } from "./bosses.js";
import { derive } from "./stats.js";
import { fmt } from "./format.js";

const W = 560, H = 260;
const GATE = { x: 420, y: 175 };  // boss stands here
const HERO = { x: 110, y: 185 };

let canvas = null, ctx = null;

const floaters = []; // {x, y, alpha, text, size, color}
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

function spawnFloater(text, color, size = 15) {
  floaters.push({
    x: GATE.x - 45 + Math.random() * 90,
    y: GATE.y - 70 - Math.random() * 30,
    alpha: 1, text, color, size,
  });
}

// Called by main.js when a pull resolves.
export function notifyResult(depth, broken) {
  const now = performance.now();
  if (broken) {
    reveal = { text: "100%", sub: "THE DOOR OPENS", color: "#ffd700", until: now + 6000 };
    shakeUntil = now + 600;
    flashUntil = now + 160;
    for (let i = 0; i < 26; i++) spawnFloater("✦", "#ffd700", 12 + Math.random() * 16);
  } else {
    const near = depth >= 0.95;
    reveal = {
      text: (depth * 100).toFixed(1) + "%",
      sub: near ? "SO CLOSE" : "enrage — the wall holds",
      color: near ? "#ff9a5a" : "#8a8a92",
      until: now + 4500,
    };
  }
}

function drawGate(open) {
  // two pillars + lintel; doorway dark when shut, faint light when open
  ctx.fillStyle = "#2a2a33";
  ctx.fillRect(GATE.x - 70, GATE.y - 140, 22, 160);
  ctx.fillRect(GATE.x + 48, GATE.y - 140, 22, 160);
  ctx.fillRect(GATE.x - 78, GATE.y - 152, 156, 18);
  ctx.fillStyle = open ? "#3d3a26" : "#15151a";
  ctx.fillRect(GATE.x - 48, GATE.y - 134, 96, 154);
  if (open) { // thin light seam from beyond the door
    ctx.fillStyle = "#c9a94b";
    ctx.globalAlpha = 0.25;
    ctx.fillRect(GATE.x - 6, GATE.y - 134, 12, 154);
    ctx.globalAlpha = 1;
  }
}

function drawBoss(now, broken, scars) {
  // Vess: tall blocky warden. Broken = stepped aside, stands by the pillar.
  const x = broken ? GATE.x - 96 : GATE.x;
  const lit = now < bossFlashUntil;
  ctx.fillStyle = lit ? "#8a7a5a" : "#5a5346";
  ctx.fillRect(x - 18, GATE.y - 96, 36, 96);              // body
  ctx.fillRect(x - 26, GATE.y - 88, 52, 14);              // pauldrons
  ctx.fillStyle = lit ? "#a89a78" : "#6e6656";
  ctx.fillRect(x - 12, GATE.y - 118, 24, 24);             // helm
  ctx.fillStyle = "#c9a94b";
  ctx.fillRect(x - 7, GATE.y - 110, 5, 3);                // eyes
  ctx.fillRect(x + 2, GATE.y - 110, 5, 3);
  if (!broken) { ctx.fillStyle = "#3a3a44"; ctx.fillRect(x + 20, GATE.y - 126, 8, 126); } // halberd
  // scars: permanent cracks, one per ~7% (maintenance scripts never repair them)
  ctx.fillStyle = "#31201e";
  const cracks = Math.floor(scars / 0.07);
  const spots = [[-14, -80, 3, 26], [6, -60, 3, 34], [-4, -40, 3, 22], [12, -92, 3, 20]];
  for (let i = 0; i < Math.min(cracks, spots.length); i++) {
    const [dx, dy, w, h] = spots[i];
    ctx.fillRect(x + dx, GATE.y + dy, w, h);
  }
}

function drawHero(now, pulling) {
  const lunge = pulling ? Math.sin(now / 120) * 5 : 0;
  const x = HERO.x + lunge;
  ctx.fillStyle = "#4a5a6e";
  ctx.fillRect(x - 12, HERO.y - 58, 24, 58);              // body
  ctx.fillStyle = "#c9b89a";
  ctx.fillRect(x - 9, HERO.y - 74, 18, 16);               // head
  ctx.fillStyle = "#9aa4b2";
  ctx.fillRect(x + 12, HERO.y - 66, 5, 44);               // sword
}

function drawBars(state, now) {
  const p = state.pull;
  const scars = state.boss.scars;
  if (!p && scars <= 0) return;
  const depth = Math.min(1, currentDepth(state, now));
  if (p) { // window timer (top bar) drains; depth (bottom bar) races it
    const frac = pullFrac(state, now);
    ctx.fillStyle = "#22222a";
    ctx.fillRect(20, H - 44, W - 40, 8);
    ctx.fillStyle = "#6e5a5a";
    ctx.fillRect(20, H - 44, (W - 40) * (1 - frac), 8);
    ctx.fillStyle = "#8a8a92";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("ENRAGE", 24, H - 47);
  }
  ctx.fillStyle = "#22222a";
  ctx.fillRect(20, H - 30, W - 40, 14);
  ctx.fillStyle = "#6e3a32"; // scars: permanent segment, dark old blood
  ctx.fillRect(20, H - 30, (W - 40) * Math.min(scars, depth), 14);
  if (p) {
    ctx.fillStyle = depth >= 0.95 ? "#ffd700" : "#c9a94b";
    ctx.fillRect(20 + (W - 40) * scars, H - 30, (W - 40) * (depth - scars), 14);
  }
  ctx.fillStyle = "#0d0d10";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "left";
  ctx.fillText(p ? "DEPTH" : "SCARS", 24, H - 19);
}

export function renderBattle(state, wallNow) {
  if (!ctx) return;
  const now = performance.now();
  const boss = getBoss(state.wall);
  const pulling = !!state.pull;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (now < shakeUntil) {
    const a = (shakeUntil - now) / 600;
    ctx.setTransform(1, 0, 0, 1, (Math.random() - 0.5) * 14 * a, (Math.random() - 0.5) * 10 * a);
  }

  ctx.fillStyle = "#101014";
  ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.fillStyle = "#17171d"; // floor
  ctx.fillRect(-20, GATE.y, W + 40, H - GATE.y + 20);

  drawGate(state.boss.broken);
  drawBoss(now, state.boss.broken, state.boss.scars);
  drawHero(now, pulling);

  // damage fountain: spawn at hit cadence; final 5s escalates (rate + size)
  if (pulling) {
    const d = derive(state);
    const msLeft = state.pull.endsAt - wallNow;
    const finale = msLeft < 5000;
    const interval = Math.max(120, 1000 / d.hitsPerSec) / (finale ? 2 : 1);
    if (now - lastHitAt > interval) {
      lastHitAt = now;
      const dmg = d.atk * (0.85 + Math.random() * 0.3);
      spawnFloater(fmt(dmg), finale ? "#ffd700" : "#e8dcc0", finale ? 21 : 15);
      bossFlashUntil = now + 70;
    }
  }

  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.y -= 0.7;
    f.alpha -= 0.014;
    if (f.alpha <= 0) { floaters.splice(i, 1); continue; }
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle = f.color;
    ctx.font = `bold ${f.size}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  drawBars(state, wallNow);

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
