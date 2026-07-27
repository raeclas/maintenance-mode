// shot.mjs — capture every tab at phone width, headless, zero dependencies.
//
// The browser MCP is not always available, and the Boss arena is canvas-drawn,
// so a DOM-based reviewer can never see it. This drives headless Edge directly
// over the DevTools Protocol instead: node 24 ships global fetch + WebSocket,
// so nothing needs installing and package.json stays empty.
//
//   npx serve -l 5601 .        # in one shell
//   npm run shots              # in another
//
// Output: internal/shots/<tab>-375.png, full-page, 2x DPI.
// Re-run after any UI change; the PNGs are gitignored (regenerable).
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const BROWSER = EDGE_CANDIDATES.find(p => existsSync(p));
const URL_ = process.env.SHOT_URL || "http://localhost:5601/?dev";
const PORT = 9222;
const OUT = process.argv[2] || join("internal", "shots");
const PROFILE = join(tmpdir(), `mm-shot-${Date.now()}`);

const WIDTH = 375, HEIGHT = 812, DSF = 2; // the width the design plan specs against

const TABS = [
  ["boss", "battleSec"], ["training", "botSec"], ["grind", "farmSec"],
  ["player", "gearSec"], ["delve", "dungeonSec"], ["help", "helpSec"],
];

// Seed enough state that every tab renders populated rather than as an empty
// shell — an audit of a blank save measures nothing.
const SEED = `(() => {
  const s = window.__mm.state;
  s.unlocked = true;
  Object.assign(s.features, {training:1, grind:1, player:1, delve:1, dungeon:1});
  s.bots.pop = 40; s.bots.powerRank = 5; s.bots.capRank = 4; s.bots.createRank = 3;
  s.copper = 50000; s.scrap.common = 120; s.scrap.rare = 30;
  s.bots.alloc.zones[0] = 6; s.bots.alloc.atk[0] = 4; s.bots.alloc.speed[0] = 3;
  s.dungeon.cache = 900;
  // Gear and stash, because DNA v4's rarity lane is only visible on items and
  // an empty Player tab audits nothing. One item per slot plus a spread across
  // the ramp, so every plate colour renders in one shot.
  const mk = (slot, name, rarity, ip, zone, plus = 0) =>
    ({ slot, name, rarity, ip, zone, plus, affixes: [] });
  s.gear.weapon = mk("weapon", "Sentry Halberd", "legendary", 11200, 5, 12);
  s.gear.armor  = mk("armor",  "Sentry Plate",   "rare",       8200, 5, 7);
  s.gear.stash = [
    mk("weapon", "Threshold Cleaver",     "epic",      18600, 6),
    mk("armor",  "Cinder Scale Coat",     "rare",       1450, 4),
    mk("charm",  "Salt Talisman",         "common",      380, 3),
    mk("weapon", "World-Edge Blade",      "origin",    94000, 15),
    mk("charm",  "Spire Ward",            "mythic",    41200, 14),
    mk("armor",  "Weaver-Silk Jerkin",    "uncommon",     95, 2),
  ];
  document.querySelectorAll('.game').forEach(el => el.classList.remove('hidden'));
  window.__mm.save();
  return 'seeded';
})()`;

let ws, nextId = 1;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = nextId++;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!BROWSER) throw new Error("no Edge/Chrome found — add its path to EDGE_CANDIDATES");
  mkdirSync(OUT, { recursive: true });

  const proc = spawn(BROWSER, [
    "--headless=new", `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`, "--hide-scrollbars",
    "--no-first-run", "--no-default-browser-check", "about:blank",
  ], { stdio: "ignore" });

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find(t => t.type === "page" && t.webSocketDebuggerUrl);
    } catch {}
  }
  if (!target) throw new Error("browser debugging endpoint never came up");

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r, { once: true }));
  ws.addEventListener("message", e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride",
    { width: WIDTH, height: HEIGHT, deviceScaleFactor: DSF, mobile: true });

  const evaluate = async expression => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(`${r.exceptionDetails.text} :: ${expression.slice(0, 80)}`);
    return r.result?.value;
  };

  const goto = async () => {
    await send("Page.navigate", { url: URL_ });
    for (let i = 0; i < 60; i++) {
      await sleep(250);
      if (await evaluate("!!window.__mm")) return;
    }
    throw new Error(`game never booted at ${URL_} — is 'npx serve -l 5601 .' running?`);
  };

  const shoot = async name => {
    await sleep(600); // let a couple of render frames land
    // A tall page (Help is ~3,500 CSS px of prose) can exceed the renderer's
    // max texture at 2x and fail the capture outright. Drop that ONE page to
    // 1x rather than losing it — and never let it abort the rest of the run.
    for (const dsf of [DSF, 1]) {
      try {
        if (dsf !== DSF) {
          await send("Emulation.setDeviceMetricsOverride",
            { width: WIDTH, height: HEIGHT, deviceScaleFactor: dsf, mobile: true });
          await sleep(300);
        }
        const { data } = await send("Page.captureScreenshot",
          { format: "png", captureBeyondViewport: true }); // full page, not just viewport
        writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, "base64"));
        console.log(`wrote ${join(OUT, `${name}.png`)}${dsf !== DSF ? `  (at ${dsf}x — too tall for ${DSF}x)` : ""}`);
        return;
      } catch (e) {
        if (dsf === 1) { console.log(`  ! ${name}: capture failed — ${e.message}`); return; }
      } finally {
        if (dsf !== DSF) await send("Emulation.setDeviceMetricsOverride",
          { width: WIDTH, height: HEIGHT, deviceScaleFactor: DSF, mobile: true });
      }
    }
  };

  // Overflow is a per-page fact worth reporting even when the PNG looks fine.
  const widthReport = async name => {
    const w = await evaluate("document.documentElement.scrollWidth");
    if (w > WIDTH) console.log(`  ! ${name}: scrollWidth ${w}px > ${WIDTH}px viewport (horizontal overflow)`);
  };

  await goto();
  console.log(await evaluate(SEED));
  await goto(); // reload so the seeded save is what boots

  for (const [name, sec] of TABS) {
    await evaluate(`document.querySelector('[data-tab="${sec}"]')?.click()`);
    await shoot(`${name}-375`);
    await widthReport(name);
  }

  ws.close();
  proc.kill();
  await sleep(300);
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
}

main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
