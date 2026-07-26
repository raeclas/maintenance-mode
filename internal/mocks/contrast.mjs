// contrast.mjs — WCAG 2.x ratios for the token pairs the mocks actually render.
//
// Why not palette.mjs: that script GENERATES a ramp from one seed hue; it has no
// CLI path to check two arbitrary existing hexes. This set is hand-built and
// multi-hue (gold + bone + cool neutrals + functional accents), so the formula
// is applied directly — same formula palette.mjs uses internally.
//
// Why parse boss.html instead of keeping a second copy of the hexes: a duplicate
// list drifts. This reads the :root block that actually shipped.
//
//   node internal/mocks/contrast.mjs
//
// Exits non-zero if any declared pair misses its floor.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(HERE, "boss.html"), "utf8");

const T = {};
for (const [, k, v] of css.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) T[k] = v;

const chan = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = hex => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * chan(n >> 16 & 255) + 0.7152 * chan(n >> 8 & 255) + 0.0722 * chan(n & 255);
};
const ratio = (a, b) => { const [x, y] = [lum(T[a]), lum(T[b])].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// Which grounds each text token is ALLOWED on. Deliberately not a blind cross
// product: --recede and --faint are panel-family text and must never be set on
// --field, the raised-control ground. Those two pairings measure 4.43:1 and
// 4.02:1 — real WCAG 1.4.3 failures that went unseen because DESIGN.md's Phase 3
// audit tested the text tiers against --bg/--panel/--inset and never against the
// control ground. See BANNED below and DESIGN.md v2 "The on-field text rule".
const ALL = ["bg", "panel", "plate-foot", "inset", "field", "well"];
const NO_FIELD = ALL.filter(s => s !== "field");
const ON = {
  gold: ALL, "gold-dim": ALL, bone: ALL, dim: ALL,
  recede: NO_FIELD, faint: NO_FIELD,
};

// TEXT floor 4.5 (WCAG 1.4.3 AA) · NON-TEXT floor 3.0 (WCAG 1.4.11).
const PAIRS = [
  ...Object.entries(ON).flatMap(([t, ss]) => ss.map(s => [t, s, 4.5, "text"])),
  ["logline", "bg", 4.5, "text"],          // #logHead sits directly in <main>
  ["on-gold", "gold", 4.5, "text"],        // CTA text on a solid-gold fill
  // v3: the Descend CTA's face is a gold->gold-dim gloss, so its dark label
  // renders on BOTH stops. The bottom stop was a new, un-gated pairing the
  // moment the button stopped being an outline and became a fill.
  ["on-gold", "gold-dim", 4.5, "text"],
  ["warn", "panel", 4.5, "text"], ["alert", "panel", 4.5, "text"],
  ["copper", "panel", 4.5, "text"], ["live", "bg", 4.5, "text"],
  // v2: a rowlist is a WELL, so every row-level accent renders on --well now.
  ["warn", "well", 4.5, "text"], ["copper", "well", 4.5, "text"],
  ["warn", "plate-foot", 4.5, "text"],
  ["faintest", "panel", 3.0, "non-text"],  // .locked tab ONLY — never readable text
  ["faintest", "plate-foot", 3.0, "non-text"],
  ["gold", "panel", 3.0, "non-text"],      // frame brackets, active edges, CTA rule
  ["gold", "plate-foot", 3.0, "non-text"],
  ["gold-dim", "well", 3.0, "non-text"],   // ornament rules, inlay
];

// Decorative-only values: bevel edges and dividers. WCAG 1.4.11 exempts pure
// decoration, so these are REPORTED for the record, never gated.
const INFO = [
  ["edge-lit", "panel"], ["edge-shade", "panel"], ["edge-lit", "field"],
  ["line", "panel"], ["line-soft", "panel"], ["plate-foot", "panel"],
  ["floor-glow", "well"],
];

let failed = 0;
for (const [fg, bg, floor, kind] of PAIRS) {
  if (!T[fg] || !T[bg]) { console.log(`MISSING --${fg} / --${bg}`); failed++; continue; }
  const r = ratio(fg, bg);
  const ok = r >= floor;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}:1  (>=${floor.toFixed(1)} ${kind})  --${fg} on --${bg}`);
}
// Pairings that are legal-looking but measurably fail. Asserted BANNED (the run
// fails if one of them ever starts passing quietly for the wrong reason, e.g.
// somebody brightened --faint far enough to collapse the text hierarchy).
const BANNED = [["recede", "field"], ["faint", "field"]];

console.log("\n-- decorative, reported not gated --");
for (const [fg, bg] of INFO) console.log(`      ${ratio(fg, bg).toFixed(2)}:1  --${fg} on --${bg}`);

console.log("\n-- banned pairings (must stay unused, not 'fixed' by brightening) --");
for (const [fg, bg] of BANNED) console.log(`      ${ratio(fg, bg).toFixed(2)}:1  --${fg} on --${bg}  <4.5, never set this`);

console.log(failed ? `\n${failed} pair(s) FAILED` : `\nall ${PAIRS.length} gated pairs pass`);
process.exit(failed ? 1 : 0);
