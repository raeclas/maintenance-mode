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
const css = readFileSync(join(HERE, "boss.html"), "utf8")
  + readFileSync(join(HERE, "player.html"), "utf8");   // v4: two recomposed surfaces

const T = {};
for (const [, k, v] of css.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) T[k] = v;

const chan = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const unchan = v => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const toLin = hex => { const n = parseInt(hex.slice(1), 16);
  return [chan(n >> 16 & 255), chan(n >> 8 & 255), chan(n & 255)]; };
const lumOf = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const lum = hex => lumOf(toLin(hex));

/* v4: a lane's derived grounds are declared as `color-mix(in oklab, var(--a) N%,
   var(--b))` rather than as 17 more literal hexes — native CSS, and the
   derivation rule stays visible at the declaration site. That only works as
   EVIDENCE if the checker can resolve them, so it does: sRGB -> OKLab, mix,
   back. Same formula CSS itself uses. Without this the four new lanes would be
   asserted rather than computed, which is the one thing this file exists to
   prevent. */
const linToOklab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b);
  const m = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b);
  const s = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
  return [0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
          1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
          0.0259040371*l + 0.7827717662*m - 0.8086757660*s];
};
const oklabToHex = ([L, a, b]) => {
  const l = (L + 0.3963377774*a + 0.2158037573*b) ** 3;
  const m = (L - 0.1055613458*a - 0.0638541728*b) ** 3;
  const s = (L - 0.0894841775*a - 1.2914855480*b) ** 3;
  return "#" + [ 4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
                -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
                -0.0041960863*l - 0.7034186147*m + 1.7076147010*s]
    .map(v => Math.round(Math.min(1, Math.max(0, unchan(Math.min(1, Math.max(0, v))))) * 255)
      .toString(16).padStart(2, "0")).join("");
};
// Resolve `--x: var(--y)` aliases and `color-mix(in oklab, var(--a) N%, var(--b))`
// declarations to concrete hexes. Looped so a mix may reference an alias.
const ALIAS = /--([\w-]+)\s*:\s*var\(\s*--([\w-]+)\s*\)\s*;/g;
const MIX = /--([\w-]+)\s*:\s*color-mix\(\s*in oklab\s*,\s*var\(\s*--([\w-]+)\s*\)\s*([\d.]+)%\s*,\s*var\(\s*--([\w-]+)\s*\)\s*\)/g;
const DERIVED = new Set();
for (let pass = 0; pass < 4; pass++) {
  for (const [, k, v] of css.matchAll(ALIAS)) if (!T[k] && T[v]) { T[k] = T[v]; DERIVED.add(k); }
  for (const [, k, a, p, b] of css.matchAll(MIX)) {
    if (T[k] || !T[a] || !T[b]) continue;
    const A = linToOklab(toLin(T[a])), B = linToOklab(toLin(T[b])), t = +p / 100;
    T[k] = oklabToHex(A.map((v, i) => v * t + B[i] * (1 - t)));
    DERIVED.add(k);
  }
}

const ratio = (a, b) => { const [x, y] = [lum(T[a]), lum(T[b])].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// CIE L*. The v2 lesson, made printable: on a dark ramp the WCAG +0.05 flare
// term crushes every dark-on-dark RATIO toward 1.0, so surface separation is an
// L* question and only text is a ratio question. Both numbers now print.
const Lstar = hex => { const Y = lum(hex); return Y <= 216 / 24389 ? Y * 24389 / 27 : 116 * Math.cbrt(Y) - 16; };

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

// v4 lane members — DESIGN.md "# Visual DNA v4 ## The four colour lanes".
const RAR = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "origin"];
const W = ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8", "w9", "w10"];
const ACC = ["acc-boss", "acc-training", "acc-grind", "acc-player", "acc-delve",
  "acc-dungeon", "acc-help"];
const BAND = ["band-1", "band-2", "band-3", "band-4", "band-5"];

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

  /* ══ v4: THE FOUR COLOUR LANES ═════════════════════════════════════════
     Every lane member is solved for the SAME relative luminance (Y=0.27),
     which is the value that clears 4.5:1 on --field — the lightest ground on
     the ramp. That is why each block below is one uniform check instead of 28
     individual judgement calls, and it is also chapter-08's own requirement
     that qualitative categories carry equal perceptual weight.             */

  // LANE 1 — RARITY. Shipped tiers, promoted from a text tint to plates. The
  // whole lane was UNGATED until now, and gating it immediately surfaced two
  // real WCAG 1.4.3 failures: --rar-epic 4.15:1 and --rar-mythic 4.00:1 on
  // --field. Both are lifted in build.mjs (hue and chroma preserved, lightness
  // raised to the lane floor) — required behaviour change #8.
  ...RAR.flatMap(r => ALL.map(s => [`rar-${r}`, s, 4.5, "text"])),
  ...RAR.flatMap(r => [
    [`rar-${r}`, `rar-plate-${r}`, 4.5, "text"],   // the tier name ON its own plate
    ["bone", `rar-plate-${r}`, 4.5, "text"],       // the meta line
    ["gold", `rar-plate-${r}`, 3.0, "non-text"],   // a maxed / locked marker
  ]),

  // LANE 2 — WARDEN. Ten doors, ten hues. The name and the title render as
  // TEXT on the name-plate's own two gradient stops (--field -> --inset), so
  // both stops are gated; the frame tint and the floor glow are SURFACES and
  // are checked by L* below, never by ratio.
  ...W.flatMap(w => ["field", "inset", "panel", "well"].map(s => [w, s, 4.5, "text"])),

  // LANE 3 — TAB ACCENT. Ink on the chip (--field ground) and on a live row's
  // name (--inset / --well, since a rowlist is a socket). The 2px accent bar
  // under every chip is non-text on --panel.
  ...ACC.flatMap(a => [
    [a, "field", 4.5, "text"], [a, "inset", 4.5, "text"], [a, "well", 4.5, "text"],
    [a, "panel", 3.0, "non-text"],
  ]),

  // LANE 4 — POWER BAND. Rendered as a FILLED CHIP, which is what puts this
  // lane in a different luminance tier from the three ink lanes and is the
  // real reason it does not collide with them. So: the number is --bone ON the
  // chip ground, and the bright hex only ever draws the chip's 2px lip.
  ...BAND.flatMap(b => [
    ["bone", `${b}-chip`, 4.5, "text"],
    [b, `${b}-chip`, 3.0, "non-text"],
  ]),
];

// Decorative-only values: bevel edges and dividers. WCAG 1.4.11 exempts pure
// decoration, so these are REPORTED for the record, never gated.
const INFO = [
  ["edge-lit", "panel"], ["edge-shade", "panel"], ["edge-lit", "field"],
  ["line", "panel"], ["line-soft", "panel"], ["plate-foot", "panel"],
  ["floor-glow", "well"],
];

/* SURFACES — gated by L* SEPARATION, never by ratio. This is DESIGN.md v2's
   hard-won lesson made executable: --plate-foot on --panel is 1.05:1 and
   plainly visible, because the WCAG +0.05 flare term crushes every dark-on-dark
   ratio toward 1.0. v2 respread the ramp when --bg -> --panel measured 3.09 L*
   and called that "under the perceptual floor"; the floor is set at 4 L* here,
   just under the 5.17 the respread actually achieved.

   Only pairs that must read as TWO DIFFERENT OBJECTS belong here. A gradient's
   two stops are one object and are listed under FALL below — gating them would
   assert that a window body should look like a step, which is the opposite of
   what "a gradient lights the TOP" means. */
const LSEP = 4.0;
const SURFACES = [
  ["panel", "bg"],              // a window against the page
  ["field", "panel"],           // a control against the window it sits on
  ["w-frame", "panel"],         // the Warden's tinted window frame
  ["floor-glow", "well"],       // light under the door, per Warden
  ...RAR.map(r => [`rar-plate-${r}`, "panel"]),   // an item plate is raised, and tinted
  ...BAND.map(b => [`${b}-chip`, "well"]),        // a heat block cut into the socket
];
// Gradient stops inside ONE object. Reported so the numbers are on the record
// and nobody re-adds them to SURFACES: these are meant to be a soft fall, not
// a perceptible step, and 2-3 L* is the correct size for that.
const FALL = [["panel", "plate-foot"], ["plate-foot", "well"], ["field", "inset"]];

let failed = 0;
for (const [fg, bg, floor, kind] of PAIRS) {
  if (!T[fg] || !T[bg]) { console.log(`MISSING --${fg} / --${bg}`); failed++; continue; }
  const r = ratio(fg, bg);
  const ok = r >= floor;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}:1  (>=${floor.toFixed(1)} ${kind})  L* ${Lstar(T[fg]).toFixed(1)} on ${Lstar(T[bg]).toFixed(1)}   --${fg} on --${bg}`);
}
console.log("\n-- surface pairs: gated by L* SEPARATION, not ratio (the v2 lesson) --");
for (const [a, b] of SURFACES) {
  if (!T[a] || !T[b]) { console.log(`MISSING --${a} / --${b}`); failed++; continue; }
  const d = Math.abs(Lstar(T[a]) - Lstar(T[b])), ok = d >= LSEP;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${d.toFixed(2)} L*  (>=${LSEP.toFixed(1)})  --${a} vs --${b}   [ratio would read ${ratio(a, b).toFixed(2)}:1 — why this is not a ratio check]`);
}
// Two different kinds of ban, which v4 had to separate because it added the
// second kind:
//
//   BANNED_FAILING — pairings that LOOK legal and measurably fail. Asserted:
//     the run fails if one ever starts passing, because that means somebody
//     brightened a token instead of changing a role, and the ban silently
//     stopped protecting anything.
//   BANNED_BY_ROLE — pairings barred by the DESIGN.md role rule regardless of
//     what they measure. A rarity plate carries --bone and its own tier ink;
//     its hierarchy comes from size and weight. Some of these measure ABOVE
//     4.5 on the darker plates, which is exactly why they cannot be asserted
//     as failures — the rule is about role, not about the number.
const BANNED_FAILING = [["recede", "field"], ["faint", "field"]];
const BANNED_BY_ROLE = RAR.flatMap(r =>
  [["dim", `rar-plate-${r}`], ["recede", `rar-plate-${r}`], ["faint", `rar-plate-${r}`]]);

console.log("\n-- gradient stops inside ONE object: a soft fall, deliberately NOT a step --");
for (const [a, b] of FALL) console.log(`      ${Math.abs(Lstar(T[a]) - Lstar(T[b])).toFixed(2)} L*  --${a} -> --${b}`);

console.log("\n-- decorative, reported not gated --");
for (const [fg, bg] of INFO) console.log(`      ${ratio(fg, bg).toFixed(2)}:1  --${fg} on --${bg}`);

console.log("\n-- banned + FAILING (must stay below 4.5, never 'fixed' by brightening) --");
for (const [fg, bg] of BANNED_FAILING) {
  const r = ratio(fg, bg);
  if (r >= 4.5) { failed++; console.log(`FAIL  ${r.toFixed(2)}:1  --${fg} on --${bg}  <- now passes; a token was moved instead of a role`); }
  else console.log(`      ${r.toFixed(2)}:1  --${fg} on --${bg}  <4.5, never set this`);
}
console.log("\n-- banned by ROLE (a rarity plate carries --bone + its tier ink, whatever these measure) --");
for (const [fg, bg] of BANNED_BY_ROLE)
  console.log(`      ${ratio(fg, bg).toFixed(2)}:1  --${fg} on --${bg}`);

console.log(failed ? `\n${failed} pair(s) FAILED`
  : `\nall ${PAIRS.length} gated pairs + ${SURFACES.length} L* surface pairs pass`);
process.exit(failed ? 1 : 0);
