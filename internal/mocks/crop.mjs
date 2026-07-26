// crop.mjs — clipped, 1:1 captures of a named element, for judging TYPE and
// MATERIAL at real size. The full-page shots in shots/ are 6000px tall and get
// downscaled to unreadability by any viewer, which is exactly the wrong
// instrument for "decide the font on the rendered pixels" (DW-3.9).
//
//   node internal/mocks/crop.mjs <file> <css-selector> <out-name> [width]
//
// Emits internal/mocks/shots/crops/<out-name>.png at deviceScaleFactor 2.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "shots", "crops");
const PORT = 9224;
const PROFILE = join(tmpdir(), `mm-crop-${Date.now()}`);
const JOBS = JSON.parse(process.argv[2]);   // [[file, selector, outName, width], ...]

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
  mkdirSync(OUT, { recursive: true });
  const proc = spawn(BROWSER, ["--headless=new", `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`, "--hide-scrollbars", "--allow-file-access-from-files",
    "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find(t => t.type === "page" && t.webSocketDebuggerUrl);
    } catch {}
  }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r, { once: true }));
  ws.addEventListener("message", e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id); pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  });
  await send("Page.enable"); await send("Runtime.enable");

  // `css` lets a job flip a token in the page before the clip is taken — which
  // is how the mono question gets checked against the two genuinely TABULAR
  // blocks (the crit ledger, the Armory grid) without shipping four more
  // specimen files for a question that only needs an answer.
  for (const [file, sel, name, width = 375, maxH = 0, css = ""] of JOBS) {
    await send("Emulation.setDeviceMetricsOverride",
      { width, height: 900, deviceScaleFactor: 2, mobile: width < 700 });
    await send("Page.navigate", { url: pathToFileURL(resolve(HERE, `${file}.html`)).href });
    await sleep(600);
    if (css) await send("Runtime.evaluate", { expression:
      `document.head.insertAdjacentHTML("beforeend",${JSON.stringify(`<style>${css}</style>`)})` });
    const r = await send("Runtime.evaluate", {
      expression: `(()=>{const e=document.querySelector(${JSON.stringify(sel)});
        if(!e)return null;const b=e.getBoundingClientRect();
        return {x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height};})()`,
      returnByValue: true });
    const clip = r.result?.value;
    if (!clip) { console.log(`MISS ${file} ${sel}`); continue; }
    if (maxH) clip.height = Math.min(clip.height, maxH);
    const { data } = await send("Page.captureScreenshot",
      { format: "png", captureBeyondViewport: true, clip: { ...clip, scale: 2 } });
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, "base64"));
    console.log(`ok   ${name}.png  ${Math.round(clip.width)}x${Math.round(clip.height)} @2x`);
  }
  ws.close(); proc.kill(); await sleep(300);
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
}
main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
