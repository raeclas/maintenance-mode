// arena.mjs — shoot the boss canvas at an arbitrary door and an arbitrary HP,
// then write a contact sheet of all of them.
//
// shot.mjs cannot do this job: it captures full pages at whatever HP the seeded
// save happens to sit at, and the arena is the one surface where the STATE is
// the thing under review — the envelope retracts with health, the seam shortens,
// the fracture lines open, and Sef's construction only exists under 15%. A fresh
// save is the most static the scene ever looks.
//
//   npx serve -l 5601 .        # in one shell
//   npm run arena              # in another
//
// Output: internal/shots/arena/w<n>.png + index.html (gitignored, regenerable).
// Open the index.html to review all ten doors side by side.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "shots", "arena");
const PORT = 9225;
const PROFILE = join(tmpdir(), `mm-arena-${Date.now()}`);
const HP = Number(process.env.ARENA_HP ?? 0.8);

// [label, wall, hpFraction]. Sef appears twice on purpose: his identity IS the
// difference between the two, and one frame of him proves nothing.
const JOBS = [
  ...Array.from({ length: 10 }, (_, i) => [`w${i + 1}`, i + 1, HP]),
  ["w8-crisis", 8, 0.06],
  ["w1-crisis", 1, 0.06],
];
const NOTE = {
  w1: "Vess — vein, warm. No envelope; lit from inside.",
  w2: "Maren — ring, tight arch behind the head. The seal.",
  w3: "Korrin — sweep, leading away from the door. Raid of forty.",
  w4: "Osei — ring, widest of the ten, unbroken, slowest pulse. The oldest.",
  w5: "Thale — vein, guttering. Vess's construction, nearly out.",
  w6: "Ilva — sweep, leading toward the door it protects.",
  w7: "Domar — ascent, held. Six years without moving.",
  w8: "Sef — NOTHING, and stood aside against the jamb. The betrayer.",
  w9: "Yara — drape. Silhouette, not light; hue along the train's edge.",
  w10: "The Last Warden — corona, full burst. The biggest of the ten.",
  "w8-crisis": "Sef under 15% — the envelope he was PROMISED, igniting.",
  "w1-crisis": "Vess under 15% — what a vein door looks like in crisis.",
};

const BROWSER = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].find(p => existsSync(p));

let ws, nextId = 1;
const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = nextId++; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!BROWSER) throw new Error("no Edge/Chrome found — add its path to BROWSER");
  mkdirSync(OUT, { recursive: true });
  const proc = spawn(BROWSER, ["--headless=new", `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`, "--hide-scrollbars",
    "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });

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
  const warns = new Set();
  ws.addEventListener("message", e => {
    const m = JSON.parse(e.data);
    // A token that is not in battle.js's TOKENS list renders MAGENTA and warns.
    // That shipped to staging once and stood for two commits, so this run fails
    // loudly on it rather than leaving it to whoever next looks at the pixels.
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "warning")
      for (const a of m.params.args) if (/token/.test(a.value || "")) warns.add(a.value);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id); pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  });
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride",
    { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

  const evaluate = async expression => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result?.value;
  };

  await send("Page.navigate", { url: "http://localhost:5601/?dev" });
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    if (await evaluate("!!window.__mm")) break;
  }
  if (!await evaluate("!!window.__mm"))
    throw new Error("game never booted — is 'npx serve -l 5601 .' running?");
  await evaluate(`(()=>{const s=window.__mm.state;s.unlocked=true;
    document.querySelectorAll('.game').forEach(e=>e.classList.remove('hidden'));
    window.__mm.save();return 1})()`);
  await evaluate(`document.querySelector('[data-tab="battleSec"]')?.click()`);

  const done = [];
  for (const [label, wall, hp] of JOBS) {
    // HP against the real boss table — carrying the previous wall's hp over
    // leaves remain at ~0, which silently shoots every door in crisis.
    // refreshBoss() is what moves --w-active to this door's hue. Skipping it
    // shot all ten doors in --w2's green while labelling them w1..w10.
    const info = await evaluate(`(async()=>{const {getBoss}=await import('/bosses.js');
      const s=window.__mm.state;s.wall=${wall};s.maxWall=${wall};s.boss.broken=false;
      const b=getBoss(${wall});s.boss.hp=Math.max(1,Math.round(b.hp*${hp}));
      window.__mm.refreshBoss();
      return b.name+' · '+getComputedStyle(document.documentElement)
        .getPropertyValue('--w-active').trim()})()`);
    await sleep(500);   // let the hue lane re-tint and a few frames land
    const clip = await evaluate(`(()=>{const e=document.querySelector('#battle');
      const b=e.getBoundingClientRect();
      return {x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height};})()`);
    const { data } = await send("Page.captureScreenshot",
      { format: "png", captureBeyondViewport: true, clip: { ...clip, scale: 3 } });
    writeFileSync(join(OUT, `${label}.png`), Buffer.from(data, "base64"));
    console.log(`ok   ${label}.png  ${info}  hp ${Math.round(hp * 100)}%`);
    done.push([label, info, hp]);
  }

  const rows = done.map(([label, name, hp]) => `  <figure>
    <img src="${label}.png" alt="${label}">
    <figcaption><b>${label}</b> · ${name} · hp ${Math.round(hp * 100)}%<br>
      <span>${NOTE[label] || ""}</span></figcaption>
  </figure>`).join("\n");
  writeFileSync(join(OUT, "index.html"), `<!doctype html>
<title>Arena — ten doors</title>
<style>
  body{background:#08090e;color:#bcb2a2;font:13px Tahoma,sans-serif;margin:0;padding:24px}
  h1{font-size:20px;color:#c9a94b;margin:0 0 4px}
  p.sub{color:#838a97;margin:0 0 24px}
  figure{margin:0 0 28px;max-width:960px}
  img{width:100%;display:block;border:1px solid #262a34;image-rendering:pixelated}
  figcaption{padding:6px 0;line-height:1.5}
  b{color:#c9a94b}
  figcaption span{color:#838a97}
</style>
<h1>Arena — ten doors</h1>
<p class="sub">Regenerate with <code>npm run arena</code> (needs <code>npx serve -l 5601 .</code>).
  Set the HP with <code>ARENA_HP=0.5 npm run arena</code>.</p>
${rows}
`);
  console.log(`\nwrote ${join(OUT, "index.html")} — open it to review all ten`);
  if (warns.size) {
    console.log("\nFAILED: undefined canvas tokens (these render MAGENTA):");
    for (const w of warns) console.log(`  ${w}`);
  }
  ws.close(); proc.kill(); await sleep(300);
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
  if (warns.size) process.exit(1);
}
main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
