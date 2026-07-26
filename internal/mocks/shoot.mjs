// shoot.mjs — screenshot the seven mocks (plus one specimen) at phone and
// desktop width and report each one's scrollWidth, headless, zero deps.
//
// The browser MCP is not available in this environment; internal/shot.mjs
// already proved the CDP path works here, so this is that pattern pointed at
// file:// instead of the dev server. Same reason as shot.mjs: real pixels beat
// "no screenshot was captured".
//
//   node internal/mocks/shoot.mjs
//
// Output: internal/mocks/shots/<tab>-375.png and <tab>-1280.png, full page.
// Exits non-zero if any mock's scrollWidth exceeds 375 at phone width (DW-3.3).
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "shots");
// Seven surfaces (Help is new in Phase 3) plus one specimen: grind-mono is
// grind.html with --font-data flipped back to monospace, i.e. the treatment
// DW-3.9 REJECTED, kept so the decision can be re-checked on pixels.
const NAMES = ["boss", "training", "grind", "player", "delve", "dungeon", "help",
  "grind-mono"];
const WIDTHS = [[375, 812, 2], [1280, 900, 1]];
const PORT = 9223;
const PROFILE = join(tmpdir(), `mm-mockshot-${Date.now()}`);

const BROWSER = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].find(p => existsSync(p));

let ws, nextId = 1;
const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = nextId++;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!BROWSER) throw new Error("no Edge/Chrome found");
  mkdirSync(OUT, { recursive: true });

  const proc = spawn(BROWSER, [
    "--headless=new", `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`, "--hide-scrollbars",
    "--allow-file-access-from-files",
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

  let overflow = 0;
  for (const [w, h, dsf] of WIDTHS) {
    await send("Emulation.setDeviceMetricsOverride",
      { width: w, height: h, deviceScaleFactor: dsf, mobile: w < 700 });
    for (const name of NAMES) {
      const url = pathToFileURL(resolve(HERE, `${name}.html`)).href;
      await send("Page.navigate", { url });
      await sleep(700);
      const r = await send("Runtime.evaluate", {
        expression: "document.documentElement.scrollWidth", returnByValue: true });
      const sw = r.result?.value;
      const { data } = await send("Page.captureScreenshot",
        { format: "png", captureBeyondViewport: true });
      writeFileSync(join(OUT, `${name}-${w}.png`), Buffer.from(data, "base64"));
      const bad = w === 375 && sw > w;
      if (bad) overflow++;
      console.log(`${bad ? "!! " : "ok "}${name}-${w}.png  scrollWidth ${sw}px / viewport ${w}px`);
    }
  }

  ws.close();
  proc.kill();
  await sleep(300);
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
  if (overflow) { console.error(`\nDW-3.3 FAILED: ${overflow} mock(s) overflow at 375px`); process.exit(1); }
  console.log(`\nDW-3.3: no horizontal overflow at 375px on any mock`);
}

main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
