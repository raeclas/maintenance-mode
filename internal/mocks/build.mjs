// build.mjs — emits internal/mocks/{boss,training,grind,player,delve,dungeon}.html
// and then ASSERTS the phase's token discipline on its own output.
//
// Why a generator instead of six hand-written files: DW-6.2 was extended
// (2026-07-26) to cover untokenized px precisely because "six independently-
// composed mocks are exactly where spacing drift would enter unnoticed". One
// shared CSS source makes that drift impossible by construction; the assertions
// below make it checkable rather than asserted.
//
//   node internal/mocks/build.mjs        # writes the six files, then checks them
//
// Exit non-zero if any emitted file carries a hex literal, an rgb()/rgba(), or
// a px length OUTSIDE the :root token block and the @media breakpoint preludes.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));

/* ─────────────────────────────────────────────────────────────────────────
   THE SAVE STATE these six mocks all render.
   One save, six tabs. Formula-derived values are computed from the source
   constants named beside them; the player's own totals are chosen.
   ───────────────────────────────────────────────────────────────────────── */
const S = `frontier W2 (Maren), W1 (Vess) cleared and farming · Combat Power
2,481,600/s (ATK 94,000.0 x hits/s 26.4) · copper 84,600c +4,650/s · bots
231/248, 16 free · rig ranks cap 10 / create 6 / power 3 / speed 4 · training
fills atk 30,276 + speed 12,160 = 42,436 (sqrt = 206 Scripts) · Delve ranks
reach 3 / yield 4 / overclock 4 / loot 2 / drill 2 · Dungeon difficulty 6,
deepest floor 12`;

/* ─────────────────────────────────────────────────────────────────────────
   TOKENS — every literal length and colour in these six files lives here.
   Colour + type + opacity + canvas: internal/DESIGN.md (Phase 3, LOCKED).
   Dimension scale + component tier: internal/DESIGN.md (Phase 4).
   Anything that is neither is named below as an explicit one-off with its
   source, per DW-6.2's "or be named as an honest one-off in a comment".
   ───────────────────────────────────────────────────────────────────────── */
const TOKENS = `
:root{
  /* ── Phase 3 semantic colour (internal/DESIGN.md, LOCKED :root block) ── */
  --gold:#c9a94b; --gold-dim:#9a8a5a; --on-gold:#0d0d10; --bone:#bcb2a2;
  --dim:#838a97; --recede:#87878f; --faint:#808086; --faintest:#64646a;
  /* SURFACE RAMP RESPREAD 2026-07-26 (Phase 1, review Major on DW-1.6).
     The four grounds below were compressed into ~3 L* of each other, so no
     amount of bevel could make a panel read as raised — bg->panel measured
     3.09 L*, which is under the perceptual floor for a surface step. They are
     respread across the full range the fixed text tokens allow, solved
     numerically (ceilings: panel bound by --alert at L*8.23, --bg by --logline
     at L*3.73, --field by --dim at L*13.94). bg->panel is now 5.17 L*.
     --inset was LIGHTER than --panel while being named "recessed"; corrected.
     Physical model, deepest first: well < bg < plate-foot < panel < field. */
  --bg:#08090e;      /* was #0b0c10 — L* 2.4 */
  --panel:#15161d;   /* was #13141a — L* 7.4, under the --alert ceiling */
  --inset:#131319;   /* was #17171c — L* 6.1, now genuinely recessed */
  --field:#22222a;   /* unchanged — already at the --dim ceiling */
  --well:#05060a;    /* was #101014 — L* 1.4, the deepest surface on screen */
  --line:#262a34; --line-soft:#1b1b22;
  --risk:#7aa4d4; --warn:#b26f5f; --alert:#d25b44; --copper:#d08a3e; --live:#6bbf7a;
  /* --logline (#598368) is RETIRED, Phase 3. It existed for exactly one
     element — #logHead, the shell prompt — and that element no longer exists.
     A token whose only consumer has been deleted is dead weight, and leaving it
     would leave contrast.mjs gating a pair nothing renders. The shipped
     style.css still carries the hardcoded #4e7a5e this token was minted to
     replace; that hex dies with the element at integration. */
  --level-muted:#5a7a5a;        /* Phase 4 semantic addition (was style.css:309) */
  /* rarity ramp — rarity.js named tokens; mythic carries DESIGN.md's AA fix */
  --rar-common:#b8b8b8; --rar-uncommon:#5fd35f; --rar-rare:#5a8bd6;
  --rar-epic:#b061d6; --rar-legendary:#e08a2e; --rar-mythic:#d85454;
  --rar-origin:#e8df8a;
  /* ── Phase 3 state ladder ── */
  --opacity-locked:.45;         /* locked rows ONLY — see the AA note in build.mjs */
  /* ── Phase 3 type scale ── */
  --fs-hero:26px; --fs-masthead:20px; --fs-display:16px; --fs-body:13px;
  --fs-small:11px; --fs-label:10px; --fs-micro:9px;
  /* The chrome face, as ONE seam rather than four scattered declarations.
     v1/v2 set Georgia at four separate sites (body, tab, CTA, .cta); v3
     supersedes the serif chrome, and a single token is the difference
     between one override and four. Data stays monospace either way — that
     register split is REMAKE-DESIGN.md §16's, not this pass's. */
  --font-body:Georgia,serif;
  /* THE DATA FACE. Was monospace at ~30 literal sites; DECIDED on rendered
     pixels this phase (DW-3.9) and now the UI face everywhere.

     The mono footprint was two prior reviews' unresolved watch item, and its
     defence was that it carries REMAKE-DESIGN.md §16's "botter's toolkit"
     register. Judged on internal/mocks/grind.html against
     internal/mocks/grind-mono.html, which is this token flipped back and
     nothing else, the defence does not hold: §16 is a NAMING register
     (multiclient, packet-replay script, tick-rate exploit, proxies) and it
     survives a font change completely intact. Column alignment does not need
     mono either — font-variant-numeric:tabular-nums is already set on body,
     and it holds in the UI face on both of the genuinely tabular blocks (the
     crit ledger and the 45-cell Armory grid; crops in shots/crops/). And mono
     costs real surface: Grind at 375px is 6,438px tall in mono against 5,734px
     here, 11% shorter, with the live row's stat no longer wrapping.

     The two mock-ANNOTATION classes (.mockNote, .stateLabel) keep the literal
     monospace deliberately: commentary about the mock should not be in the
     mock's own voice, and it is what lets the specimen change the surface
     without changing the text describing it. Full reasoning: DESIGN.md
     "## The data face (v4, Phase 3) — mono, decided on pixels". */
  --font-data:var(--font-ui);
  /* ── Phase 4 primitive dimension scale (derived from style.css's own px) ── */
  --border-hairline:1px;
  --space-1:2px; --space-2:3px; --space-3:4px; --space-4:6px;
  --space-5:8px; --space-6:10px; --space-7:12px; --space-8:16px;
  /* ── Phase 4 component tier ── */
  --row-name:var(--bone); --row-name-active:var(--gold); --row-gain:var(--faint);
  --row-stat:var(--bone); --row-stat-maxed:var(--gold);
  --row-col-name:130px; --row-col-gain:100px;
  --row-gap:var(--space-5); --row-gap-wrap:var(--space-3);
  --row-pad:var(--space-4) var(--space-3);
  --row-active-border:var(--space-2);
  --chip-value:var(--bone); --chip-value-emphasis:var(--gold); --chip-label:var(--dim);
  --chip-pad:var(--space-1) var(--space-8);
  --chip-group-pad:var(--space-2) var(--space-1);
  /* The arena HP meter — the door seam of light (DESIGN.md "The arena draws
     a door, not a stage"). Aliases of already-gated colours: no new hex enters
     the palette, and the canvas agrees with the DOM on what gold means. */
  --meter-fill-depletion:var(--gold);
  --meter-fill-depletion-crisis:var(--gold-bright);
  --meter-fill-cycle:var(--gold);      --meter-track-cycle:var(--space-1);
  --meter-fill-progress:var(--gold-dim); --meter-track-progress:var(--space-2);
  --meter-fill-progress-maxed:var(--gold);
  --meter-fill-level:var(--level-muted); --meter-track-level:var(--space-5);
  --meter-level-margin-top:var(--space-4); --meter-level-margin-bottom:var(--space-6);
  /* --alloc-control was var(--recede). CORRECTED 2026-07-26 (Phase 1): the alloc
     button's ground is --field, and --recede on --field measures 4.43:1 — a real
     WCAG 1.4.3 failure nobody had checked, because DESIGN.md's Phase 3 audit
     tested the text tiers against --bg/--panel/--inset and never against the
     raised-control ground. --dim clears 4.55:1 at the same site and still
     recedes against --alloc-value (gold), so the stated intent survives. */
  --alloc-control:var(--dim); --alloc-value:var(--gold);
  --alloc-pad:var(--space-3) var(--space-5); --alloc-gap:var(--space-2);
  --alloc-input-pad:var(--space-2) var(--space-3);
  --alloc-input-width:44px;
  --arena-pad:var(--space-5) var(--space-7) var(--space-6);
  --arena-margin:var(--space-5) 0;
  --arena-controls-margin:var(--space-5) 0 var(--space-3);
  --tab-idle:var(--dim); --tab-active:var(--gold); --tab-locked:var(--faintest);
  --afford-accent:var(--gold);
  /* ── honest one-offs (DW-6.2): each is a single non-scale value with a source ── */
  --tab-pad:7px;          /* DESIGN.md's own named one-off — style.css:167 */
  --chip-radius:5px;      /* DESIGN.md's own named one-off — style.css:194 */
  --chip-lbl-nudge:1px;   /* DESIGN.md's own named one-off — style.css:205 */
  --touch-min:44px;       /* WCAG 2.5.8 floor; DESIGN.md flags alloc buttons under it */
  --page-max:600px;       /* shipped page width — style.css:46 */
  --log-max-h:180px;      /* shipped log height — style.css:143 */
  --armory-zone-col:26px; /* shipped Armory zone column — style.css:396 */
  --stash-mark-col:14px;  /* shipped stash marker column — style.css:379 */
  --ip-dial:72px;         /* shipped IP dial width — style.css:487 */
  --armory-min:420px;     /* narrowest width at which a 3-column Armory row can
                             still print an entry NAME rather than an ellipsis;
                             below it the grid scrolls inside its own container
                             rather than truncating (the plan's own edge case) */`;

/* ─────────────────────────────────────────────────────────────────────────
   VISUAL DNA v3 tokens — internal/DESIGN.md "## Visual DNA v3".
   Injected INTO the same :root block (a second :root would slip past the
   assertion's strip regex), and only on the surface this pass recomposes.

   v3 is a DIRECTION CHANGE, not a refinement: the user rejected v2's Art
   Deco reading ("the early MMO UI vibe isn't there") and named MapleStory.
   NOT ONE COLOUR MOVES. The four material hexes below are v2's, unchanged
   and re-used for a different construction; everything v3 adds is a radius,
   a frame width and a font stack. That is why the contrast surface cannot
   regress by construction rather than by luck.
   ───────────────────────────────────────────────────────────────────────── */
const TOKENS_V3 = `
  /* ── carried forward from v2, values UNCHANGED, purpose re-pointed:
        v2 used these to LIGHT a flat plate; v3 uses them to BEVEL a frame.
        Same hexes, same gates, different carpentry. ── */
  --plate-foot:#101015;   /* a plate's foot. DARKER than --panel on purpose: the
                             gradient lights the TOP, so no text ever sits on a
                             ground lighter than the AA-verified --panel.
                             L* 4.8 — 2.6 L* below --panel (was 2.06) */
  --edge-lit:#413d37;     /* warm bevel highlight — light from above (ch09
                             hue-shifted highlights: warmer, never white).
                             L* 26: 18.6 L* above --panel. Was #2d2a26 at 10.8
                             L*, which is where the review's Major came from —
                             a 1px edge at 10 L* on a dark ramp is not a bevel,
                             it is a rumour. */
  --edge-shade:#020308;   /* cool bevel shade, L* 0.9. Tinted blue-black, never
                             pure #000 (ai-tells colour rule, still held) */
  --floor-glow:#17140d;   /* warm dark. Light under the door: the arena's floor
                             band only, never a text ground */
  /* ── display type: two steps ABOVE the existing --fs-hero (26px). Values
        unchanged from v2; what changed is that they are no longer set in a
        serif — see --font-ui. ── */
  --fs-warden:36px;       /* the Warden's name — the identity, 1.38x over hero */
  --fs-colossal:52px;     /* the once-per-screen peak; the same 52px battle.js
                             already draws the BREACHED reveal at, so DOM and
                             canvas finally agree where the peak is */
  /* ── display-tier spacing: the scale had nothing above 16px, which is why
        every block read as one texture. Append-only, same derivation rule ── */
  --space-9:24px; --space-10:32px;

  /* ══ v3 ADDITIONS — the whole of the direction change, in six values ══ */

  /* RADIUS. v2 carried an explicit no-radius rule, inherited from Swiss/Deco.
     v3 supersedes it: MapleStory is round, and a frame with square corners
     reads as a div with a border rather than as an object. Three steps, not
     one, because the window / the control / the socket are three different
     objects and a single radius is the shadcn-default tell. */
  --radius-window:8px;    /* the window frame — the biggest object on screen */
  --radius-control:5px;   /* buttons, tabs, chip plates. Matches --chip-radius,
                             which the shipped CSS already carries as its own
                             named one-off: the value was always here, it just
                             had no system to belong to */
  --radius-socket:3px;    /* wells, tracks, inputs — things CUT INTO a surface
                             read tighter than things sitting on one */

  /* THE FRAME. A hairline is a rule; 3px is a frame you could grab. Aliased
     onto the existing scale rather than minted as a new primitive. */
  --border-frame:var(--space-2);

  /* THE VOICE. Georgia leaves the chrome — it is the single most bookish
     thing on the page and it is what the user means by "the script".
     Tahoma is Matthew Carter's small-size screen face: narrow, large
     x-height, hinted for exactly the 10-13px band this UI lives in
     (chapter-03-typography.md's own medium-form argument — the same one
     that put Georgia here for prose, pointed at dense chrome instead).
     It is also, historically, the face early-2000s Windows game clients
     shipped their chrome in. System stack only: no webfont, no external
     reference. Arial/Helvetica are deliberately absent — both are on
     ai-tells.md's overused-font list, Tahoma and Verdana are not. */
  --font-ui:Tahoma,"Segoe UI",Verdana,sans-serif;
  --font-body:var(--font-ui);   /* the one seam: this override retires the
                                   serif at all four of its shipped sites */`;

/* ─────────────────────────────────────────────────────────────────────────
   VISUAL DNA v4 tokens — internal/DESIGN.md "## Visual DNA v4".

   v3 shipped a construction and moved NOT ONE HEX. The user's verdict on it
   was "acceptable for now… maybe more stylised aesthetic is how I would have
   preferred. adding colour where it could potentially add more flavour could
   be nice as well." v4 spends that revision, and it does so by AMENDING v3's
   own colour rule: warn/alert/copper were functional accents that could never
   enter an identity role, and gold was the sole signature. That rule is the
   direct cause of every surface reading identical. Colour may now carry
   identity — but NO HUE IS DECORATIVE: every hue attaches to a meaning the
   player can name, in one of exactly four lanes.

   Every lane member below is SOLVED, not picked: binary search in OKLCH for
   the lightness that yields relative luminance Y = 0.27, which is the value
   that clears 4.5:1 on --field, the lightest ground on the ramp. Equal
   luminance across a lane is chapter-08-color-science.md's own Critical
   requirement (qualitative categories must not carry unequal perceptual
   weight) AND the reason contrast.mjs can check 28 hues as one uniform gate.

   Derived grounds are color-mix(in oklab, ...) rather than 17 more literal
   hexes: native CSS, the derivation rule stays readable at the declaration
   site, and contrast.mjs resolves them so they stay COMPUTED, not asserted.
   ───────────────────────────────────────────────────────────────────────── */
const TOKENS_V4 = `

  /* ══ LANE 1 — RARITY. Meaning: how many affixes an item rolled.
        rarity.js's shipped hues, promoted from a text tint to a real plate.
        Invents no new meaning — the ramp already existed, it just had no
        surface. Two hexes are LIFTED (required behaviour change #8): both
        were real WCAG 1.4.3 failures nobody had ever measured, because
        contrast.mjs had no rarity pair at all until this phase. Hue and
        chroma are preserved exactly; only lightness moves. ══ */
  --rar-epic:#bc6ce2;    /* was #b061d6 — 4.15:1 on --field, FAIL */
  --rar-mythic:#e86362;  /* was #d85454 — 4.00:1 on --field, FAIL */
  /* An item plate: the tier's own hue mixed into --plate-foot, which lands it
     between --panel and --field — a leaf RAISED out of the window body, which
     is what an equipped item is. --dim / --recede / --faint are BANNED on
     these grounds (4.04-4.63:1); a rarity plate carries --bone and its own
     tier ink, and its hierarchy comes from size and weight instead. */
  --rar-plate-common:color-mix(in oklab, var(--rar-common) 16%, var(--plate-foot));
  --rar-plate-uncommon:color-mix(in oklab, var(--rar-uncommon) 16%, var(--plate-foot));
  --rar-plate-rare:color-mix(in oklab, var(--rar-rare) 16%, var(--plate-foot));
  --rar-plate-epic:color-mix(in oklab, var(--rar-epic) 16%, var(--plate-foot));
  --rar-plate-legendary:color-mix(in oklab, var(--rar-legendary) 16%, var(--plate-foot));
  --rar-plate-mythic:color-mix(in oklab, var(--rar-mythic) 16%, var(--plate-foot));
  --rar-plate-origin:color-mix(in oklab, var(--rar-origin) 16%, var(--plate-foot));

  /* ══ LANE 2 — WARDEN. Meaning: WHICH DOOR YOU ARE AT.
        Ten doors, ten hues, on an even decagonal walk (36 deg apart, chroma
        .09 — the loudest lane, because it appears alone on its own surface).
        The walk starts 30 deg off gold so no door ever wears the client's own
        colour. Qualitative, not ordinal: a door is a PLACE, not a magnitude —
        magnitude is lane 4's job. Names: REMAKE-DESIGN.md's W1-W10 table. ══ */
  --w1:#859554;   /* Vess           — Warden of the First Door */
  --w2:#5a9b74;   /* Maren          — the Second Door (the frontier, this save) */
  --w3:#3a9c99;   /* Korrin         — the Third */
  --w4:#4a97b7;   /* Osei           — the Fourth */
  --w5:#728ec6;   /* Thale          — the Fifth */
  --w6:#9984c0;   /* Ilva           — the Sixth */
  --w7:#b57ca6;   /* Domar          — the Seventh */
  --w8:#c27a83;   /* Sef            — the Eighth */
  --w9:#be7f5f;   /* Yara           — the Ninth */
  --w10:#a88a4b;  /* The Last Warden— the Tenth */
  /* The client sets this to the door you are standing at. Everything on the
     Boss tab reads from it, so re-tinting a door is one assignment. */
  --w-active:var(--w2);
  /* SURFACES derived from the active door — checked by L* separation, never by
     ratio (DESIGN.md v2's lesson: the +0.05 flare term crushes dark-on-dark
     ratios toward 1.0, so 1.05:1 can be plainly visible). */
  --w-frame:color-mix(in oklab, var(--w-active) 24%, var(--line));
  --floor-glow:color-mix(in oklab, var(--w-active) 26%, var(--well));

  /* ══ LANE 3 — TAB ACCENT. Meaning: WHICH ROOM OF THE CLIENT YOU ARE IN.
        Hexagonal walk, chroma .05 — DELIBERATELY a third of the Warden lane's
        saturation. Chrome must never out-shout content: a dusty frame beside a
        saturated item name reads as a different CLASS of object, and that
        saturation tier is what keeps the lanes apart where their hues are
        close (--acc-player h260 sits 1 deg from --rar-rare h259; they share the
        Player tab and never share an element). Body text stays neutral. ══ */
  --acc-training:#689698;  /* the script console */
  --acc-grind:#7d9478;     /* copper, growth — the one green, on a named cue */
  --acc-player:#7c8fad;    /* you */
  --acc-delve:#9e86a3;     /* the descent */
  --acc-dungeon:#ad8483;   /* the difficulty ladder */
  --acc-help:#9f8b6c;      /* the manual — paper */
  /* Boss has no accent of its own: its room IS the door, so its accent is the
     Warden's hue. That is what makes Boss the one surface carrying exactly one
     identity hue rather than two. */
  --acc-boss:var(--w-active);
  /* --acc is the CURRENT surface's accent; each page sets it once on <main>. */
  --acc:var(--acc-boss);

  /* ══ LANE 4 — POWER BAND. Meaning: HOW DEEP / HOW STRONG.
        Grind zone depth and gear IP already carried a power-band concept with
        no colour. Five steps, cool -> hot, hue-only at constant luminance —
        NOT an HSL lightness ramp (chapter-08 High: perceptual lightness varies
        wildly across hues and the data gets misread).

        This lane renders as a FILLED CHIP, not as ink. That is the whole
        reason it does not collide with the three ink lanes: the chip ground
        sits at L* ~16.5 while every ink lane sits at L* 59, so band and accent
        are in different LUMINANCE tiers even where their hues are close. The
        bright hex only ever draws the chip's 2px lip. ══ */
  --band-1:#6890c4;  /* coldest — z1-z3   / the lowest IP band */
  --band-2:#399ba0;  /* z4-z6 */
  --band-3:#629b6e;  /* z7-z9 */
  --band-4:#a38c4a;  /* z10-z12 */
  --band-5:#c17d6b;  /* hottest — z13-z15 / the frontier IP band */
  --band-1-chip:color-mix(in oklab, var(--band-1) 30%, var(--well));
  --band-2-chip:color-mix(in oklab, var(--band-2) 30%, var(--well));
  --band-3-chip:color-mix(in oklab, var(--band-3) 30%, var(--well));
  --band-4-chip:color-mix(in oklab, var(--band-4) 30%, var(--well));
  --band-5-chip:color-mix(in oklab, var(--band-5) 30%, var(--well));

  /* ══ CONSTRUCTION PUSH — v3's carpentry, taken to full Maple weight ══ */
  --border-frame:var(--space-3);   /* 3px -> 4px. A frame you could grab. */
  --bevel:var(--space-1);          /* 1px hairline -> 2px. v3's own review Major
                                      was "a 1px edge at 10 L* is a rumour"; the
                                      same argument applies one step further. */
  --rivet:var(--space-3);          /* the corner mark's arm — 4px */
  --rivet-inset:var(--space-4);    /* how far in from the corner it sits */
  --glyph-plate:26px;              /* the letter-glyph plate. An honest one-off:
                                      2 x --fs-body + the plate's own bevel, the
                                      smallest square that holds a 16px cap and
                                      still clears nothing else on the row. */
  --fs-warden:40px;                /* was 36. 1.54x over --fs-hero, 1.30x under
                                      --fs-colossal — which stays 52px because
                                      battle.js draws the BREACHED reveal there
                                      and the DOM and canvas must agree. */
  /* The Armory's zone column held a bare "z15"; it now holds a band CHIP, and
     a chip has padding. Both shipped one-offs widen by the same 14px so the
     grid still fits its narrowest legible width. */
  --armory-zone-col:40px;
  --armory-min:434px;`;

const TOKENS_END = `
}`;

/* The one breakpoint. DESIGN.md names 560px as a real value belonging to a
   responsive tier it was not asked to build; reused, not invented. CSS cannot
   read a custom property in a media prelude, so the literal lives there. */
const BP = "@media (min-width:561px)";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--dim);font-family:var(--font-body);
  font-size:var(--fs-body);font-variant-numeric:tabular-nums;line-height:1.45;
  display:flex;justify-content:center;min-height:100vh}
main.client{width:100%;max-width:var(--page-max);
  padding:var(--space-7) var(--space-5) var(--space-8)}
b{font-weight:normal}

/* ── mock annotation. Dashed, monospace, never product copy. ── */
.mockNote{border:var(--border-hairline) dashed var(--recede);color:var(--recede);
  font-family:monospace;font-size:var(--fs-label);line-height:1.6;
  padding:var(--space-4) var(--space-5);margin-bottom:var(--space-6)}
.mockNote b{color:var(--bone)}
.mockNote code{color:var(--bone)}
.stateLabel{border:var(--border-hairline) dashed var(--recede);color:var(--recede);
  font-family:monospace;font-size:var(--fs-label);letter-spacing:.12em;
  text-transform:uppercase;padding:var(--space-2) var(--space-5);
  margin:var(--space-7) 0 var(--space-3);display:block}

/* ── global chrome ── */
#resbar{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;
  gap:var(--space-5);border-top:var(--border-hairline) solid var(--line);
  border-bottom:var(--border-hairline) solid var(--line);
  padding:var(--space-4) var(--space-3);margin-bottom:var(--space-7)}
.chipGroup{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;
  background:var(--panel);border:var(--border-hairline) solid var(--line);
  border-radius:var(--chip-radius);padding:var(--chip-group-pad)}
.chip{padding:var(--chip-pad);text-align:center;
  border-left:var(--border-hairline) solid var(--line)}
.chip:first-child{border-left:none}
.chipVal{font-family:var(--font-data);font-size:var(--fs-display);color:var(--chip-value)}
.chipVal b{color:var(--chip-value-emphasis)}
.chipLbl{font-size:var(--fs-micro);font-family:var(--font-data);letter-spacing:.12em;
  color:var(--chip-label);text-transform:uppercase;margin-top:var(--chip-lbl-nudge)}
.copper,.copper b{color:var(--copper)}
.helpBtn{background:none;border:var(--border-hairline) solid var(--line);
  color:var(--dim);font-family:var(--font-data);font-size:var(--fs-body);
  width:var(--touch-min);height:var(--touch-min);margin-left:auto}

/* ── tab nav. Six fixed destinations, all visible: wraps 3+3 on a phone
      rather than scrolling. The audit's 414px overflow was this row. ── */
#tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);
  margin-bottom:var(--space-6)}
#tabs button{background:var(--panel);border:var(--border-hairline) solid var(--line);
  color:var(--tab-idle);font-family:var(--font-body);font-variant:small-caps;
  letter-spacing:.08em;font-size:var(--fs-body);padding:var(--tab-pad);
  min-height:var(--touch-min)}
#tabs button.active{color:var(--tab-active);border-color:var(--gold)}
#tabs button.locked{color:var(--tab-locked);border-color:var(--line-soft);
  letter-spacing:.2em;cursor:default}

/* ── panels + headings ── */
section.game{border:var(--border-hairline) solid var(--line);background:var(--panel);
  padding:var(--space-6) var(--space-7);margin:var(--space-7) 0}
h3{font-size:var(--fs-small);font-variant:small-caps;letter-spacing:.1em;
  color:var(--gold-dim);border-top:var(--border-hairline) solid var(--line);
  padding-top:var(--space-5);margin:var(--space-6) 0 var(--space-4);font-weight:normal}
section.game>h3:first-child{border-top:none;padding-top:0;margin-top:var(--space-1)}
.sub{color:var(--recede);font-size:var(--fs-label);font-family:var(--font-data);
  font-style:italic;letter-spacing:0;text-transform:none;font-variant:normal;
  line-height:1.6;display:block;margin-top:var(--space-2)}
.rowName .sub{margin-top:0}

/* ── buttons ── */
button{background:var(--field);color:var(--bone);
  border:var(--border-hairline) solid var(--line);font-family:var(--font-data);
  font-size:var(--fs-small);padding:var(--space-3) var(--space-6);
  min-height:var(--touch-min);cursor:pointer;text-align:left}
button.affordable{border-color:var(--afford-accent);color:var(--afford-accent)}
/* A disabled control is NOT raised — it drops to the panel ground. That is the
   material language carrying a state, and it also fixes a real WCAG 1.4.3
   failure: --faint on --field measures 4.02:1, on --panel it clears 4.68:1. */
button:disabled{color:var(--faint);cursor:default;background:var(--panel)}
.rig{display:grid;gap:var(--space-5);grid-template-columns:1fr}
${BP}{.rig{grid-template-columns:1fr 1fr}}

/* ── Row: the one component for line items. Phone = 2 columns with alloc and
      stat on their own full-width lines; the four positional columns return
      above the breakpoint. ── */
.rowlist{border-top:var(--border-hairline) solid var(--line)}
.rowlist .row{display:grid;grid-template-columns:1.2fr minmax(0,1fr);column-gap:var(--row-gap);
  row-gap:var(--row-gap-wrap);align-items:center;padding:var(--row-pad);
  border-bottom:var(--border-hairline) solid var(--line-soft);
  border-left:var(--row-active-border) solid transparent;
  font-family:var(--font-data);font-size:var(--fs-small);position:relative}
.rowlist .row>.rowAlloc,.rowlist .row>.rowStat{grid-column:1/-1;min-width:0;
  overflow-wrap:anywhere}
.rowName{color:var(--row-name)}
.rowGain{color:var(--row-gain);text-align:right}
.rowStat{color:var(--row-stat)}
/* the ladder — three independent channels per state (edge / type / controls) */
.row.active{border-left-color:var(--gold)}
.row.active .rowName{color:var(--row-name-active)}
.row.dormant{border-left-color:var(--line-soft)}
.row.dormant .rowName{color:var(--dim)}
.row.dormant .rowStat{color:var(--faint)}
.row.struggling{border-left-color:var(--warn)}
.row.struggling .rowStat{color:var(--warn)}
.row.locked{opacity:var(--opacity-locked);cursor:default}
.row.locked .rowName{color:var(--dim)}
.row.locked .rowStat{color:var(--faint)}
.row.maxed .rowStat{color:var(--row-stat-maxed)}
.rowName,.rowGain{overflow-wrap:anywhere}
/* Above the breakpoint the name / gain / alloc columns return, with the Phase 4
   widths as MINIMA rather than fixed tracks. The stat keeps its own full-width
   line at every width: Phase 5 turned that cell from a token ("RATE MAX") into
   a sentence ("at the 50/s cap — more bots here do nothing, move them to
   another script"), and a 1fr sliver inside a 600px column shreds it. */
${BP}{
  .rowlist .row{grid-template-columns:minmax(var(--row-col-name),1.4fr)
    minmax(var(--row-col-gain),1fr) auto}
  .rowlist .row>.rowAlloc{grid-column:3}
}

/* ── Meters: three species, distinguished by FORM (track height, track colour,
      fill colour) exactly as the Phase 4 spec requires. ── */
.rowBar{position:absolute;left:0;right:0;bottom:0;height:var(--meter-track-cycle);
  background:transparent}
.rowFill{height:100%;background:var(--meter-fill-cycle)}
.barTrack{height:var(--meter-track-level);background:var(--field);
  margin:var(--meter-level-margin-top) 0 var(--meter-level-margin-bottom)}
.barFill{height:100%;background:var(--meter-fill-level)}
.amBar{height:var(--meter-track-progress);background:var(--line-soft);overflow:hidden}
.amBar>span{display:block;height:100%;background:var(--meter-fill-progress)}
.amCell.max .amBar>span{background:var(--meter-fill-progress-maxed)}

/* ── Allocation control. Absent entirely on a locked row (DESIGN.md's own
      REQUIRED change: a locked row must stop accepting input). ── */
.allocMini{display:inline-flex;align-items:center;gap:var(--alloc-gap);flex-wrap:wrap}
.allocMini button{padding:var(--alloc-pad);color:var(--alloc-control);
  border-color:var(--line-soft);min-width:var(--touch-min);text-align:center}
.allocMini input{width:var(--alloc-input-width);min-height:var(--touch-min);
  background:var(--inset);color:var(--alloc-value);
  border:var(--border-hairline) solid var(--line);font-family:var(--font-data);
  padding:var(--alloc-input-pad);font-size:var(--fs-small);text-align:center}

/* ── Boss ── */
.bossPanel{text-align:center;margin:var(--space-6) 0 var(--space-4)}
#bossName{color:var(--gold);font-size:var(--fs-masthead);font-variant:small-caps}
#bossTitle{font-size:var(--fs-small);font-style:italic}
.wallLbl{font-family:var(--font-data);font-size:var(--fs-label);color:var(--recede);
  letter-spacing:.12em;text-transform:uppercase;text-align:center;
  margin-bottom:var(--space-2)}
.wallScroll{overflow-x:auto;padding-bottom:var(--space-1)}
#wallSelect{display:flex;gap:var(--space-3);width:max-content;
  margin:0 auto var(--space-4)}
.wallBtn{white-space:nowrap;text-align:center}
.wallBtn.active{color:var(--gold);border-color:var(--gold);background:var(--line-soft)}
/* .arena (the bordered box) is GONE — v2 made the canvas region itself the
   well, so the wrapper had no styling left and was purely a nested box for
   detect.mjs to flag. DESIGN.md's Arena component spec already noted the class
   was a naming ambiguity doing nothing but "bordered panel". */
.canvasStub{background:var(--well);
  aspect-ratio:16/7;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:var(--space-3);text-align:center;padding:var(--space-6)}
.canvasStub .k{font-family:var(--font-data);font-size:var(--fs-label);color:var(--recede);
  letter-spacing:.12em;text-transform:uppercase}
.canvasStub .v{font-family:var(--font-data);font-size:var(--fs-small);color:var(--faint);
  max-width:44ch;line-height:1.6}
.controls{display:flex;align-items:baseline;flex-wrap:wrap;
  gap:var(--space-3) var(--space-7);margin:var(--arena-controls-margin)}
#depth{color:var(--gold);font-size:var(--fs-hero);font-family:var(--font-data)}
.caption{font-family:var(--font-data);font-size:var(--fs-small);color:var(--recede);
  line-height:1.6}
#projection{color:var(--gold)}
.progress{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);
  margin:var(--space-6) 0}
#monument{border:var(--border-hairline) solid var(--gold);color:var(--gold);
  text-align:center;font-variant:small-caps;letter-spacing:.12em;
  padding:var(--space-5);width:100%}
#descendBtn{display:block;width:100%;background:var(--panel);
  border:var(--border-hairline) solid var(--gold);color:var(--gold);
  font-family:var(--font-body);font-variant:small-caps;letter-spacing:.1em;
  font-size:var(--fs-display);padding:var(--space-6);margin:var(--space-5) 0;
  text-align:center}
#dialogue{border-left:var(--row-active-border) solid var(--gold);
  background:var(--panel);padding:var(--space-6) var(--space-7);font-style:italic;
  color:var(--bone);margin:var(--space-7) 0}

/* ── Player ── */
.slot{display:flex;flex-direction:column;gap:var(--space-3);
  border-left:var(--row-active-border) solid var(--line);
  border-top:var(--border-hairline) solid var(--line);
  padding:var(--space-5) var(--space-6);margin-top:var(--space-4);
  background:var(--inset)}
.slot.filled{border-left-color:var(--gold-dim)}
.slotName{font-variant:small-caps;color:var(--recede);font-size:var(--fs-small)}
.slotItem{font-size:var(--fs-small);font-family:var(--font-data);color:var(--bone)}
.itemMeta{color:var(--dim)}
.affixList{display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-7);
  margin-top:var(--space-2)}
.affixItem{font-size:var(--fs-small);font-family:var(--font-data);color:var(--dim)}
.muted{color:var(--faint);font-style:italic}
.enhInfo{font-size:var(--fs-label);font-family:var(--font-data);color:var(--recede);
  line-height:1.6}
.slotControls{display:flex;flex-wrap:wrap;gap:var(--space-3) var(--space-7);
  margin-top:var(--space-3);align-items:center}
.toggleLine{font-size:var(--fs-small);font-family:var(--font-data);color:var(--dim);
  display:block;margin:var(--space-4) 0;line-height:1.6}
.filterRow{display:flex;flex-wrap:wrap;align-items:center;
  gap:var(--space-3) var(--space-5);margin-bottom:var(--space-3)}
.filterLabel{font-size:var(--fs-small);color:var(--dim);font-family:var(--font-data)}
.ipDial{width:var(--ip-dial);min-height:var(--touch-min);background:var(--field);
  color:var(--gold);border:var(--border-hairline) solid var(--line);
  font-family:var(--font-data);padding:var(--alloc-input-pad);font-size:var(--fs-small)}
select{min-height:var(--touch-min);background:var(--field);color:var(--bone);
  border:var(--border-hairline) solid var(--line);font-family:var(--font-data);
  font-size:var(--fs-small);padding:var(--space-2) var(--space-3)}
.scrapWallet{font-size:var(--fs-small);color:var(--gold-dim);
  margin:var(--space-1) 0 var(--space-4);font-family:var(--font-data)}
.scrapPill{display:inline-block;border:var(--border-hairline) solid var(--line);
  padding:var(--space-1) var(--space-5);margin:0 var(--space-3) var(--space-3) 0;
  font-size:var(--fs-small);font-family:var(--font-data)}
#stashList{font-family:var(--font-data);font-size:var(--fs-small);margin-top:var(--space-4)}
.stashRow{display:grid;grid-template-columns:var(--stash-mark-col) 1fr auto;
  gap:0 var(--space-5);align-items:center;padding:var(--space-2) var(--space-4);
  border-left:var(--row-active-border) solid var(--line);
  border-bottom:var(--border-hairline) solid var(--line-soft)}
.stashRow.upgrade{border-left-color:var(--gold-dim)}
.sMark{grid-column:1;grid-row:1;text-align:center;color:var(--gold)}
.stashRow.locked-item .sMark{color:var(--recede)}
.sName{grid-column:2;grid-row:1;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap}
.sAct{grid-column:3;grid-row:1;display:inline-flex;gap:var(--space-2)}
.sAct button{padding:var(--space-2) var(--space-4);font-size:var(--fs-label);
  text-align:center}
.sInfo{grid-column:2/-1;grid-row:2;color:var(--recede);font-size:var(--fs-label);
  overflow-wrap:anywhere}
.trophySet{padding:var(--space-4) var(--space-6);
  border-left:var(--row-active-border) solid var(--line);background:var(--inset);
  margin-bottom:var(--space-4)}
.trophySet.started{border-left-color:var(--gold-dim)}
.trophySet.complete{border-left-color:var(--gold)}
.trophySetHead{display:flex;justify-content:space-between;align-items:baseline;
  gap:var(--space-5);margin-bottom:var(--space-3)}
.trophySetName{color:var(--bone);font-size:var(--fs-small)}
.trophySet.dormant .trophySetName{color:var(--faint)}
.trophySetProg{font-family:var(--font-data);font-size:var(--fs-small);color:var(--dim)}
.trophySet.dormant .trophySetProg{color:var(--faint)}
details.trophySet>summary{cursor:pointer;color:var(--faint);
  padding:var(--space-2) 0;display:list-item}
details.trophySet>summary .trophySetProg{float:right}
details.trophySet>.pips{margin-top:var(--space-4)}
.pips{display:flex;flex-wrap:wrap;gap:var(--space-3)}
.pip{font-size:var(--fs-label);font-family:var(--font-data);
  padding:var(--space-1) var(--space-4);
  border:var(--border-hairline) solid var(--line-soft);color:var(--faint)}
.pip.own{color:var(--gold);border-color:var(--gold)}
.amScroll{overflow-x:auto}
#armoryGrid{display:flex;flex-direction:column;gap:var(--space-2);
  min-width:var(--armory-min)}
.amRow{display:grid;grid-template-columns:var(--armory-zone-col) repeat(3,1fr);
  gap:var(--space-3);align-items:stretch}
.amZone{font-family:var(--font-data);font-size:var(--fs-label);color:var(--recede);
  align-self:center;text-align:right}
.amCell{border:var(--border-hairline) solid var(--line);
  border-left:var(--space-1) solid var(--gold-dim);background:var(--panel);
  padding:var(--space-3) var(--space-4);display:flex;flex-direction:column;
  gap:var(--space-1);overflow:hidden}
.amCell.dormant{border-left-color:var(--line)}
.amCell.dormant .amName,.amCell.dormant .amRank{color:var(--faint)}
.amCell.max{border-left-color:var(--gold)}
.amName{font-size:var(--fs-label);color:var(--bone);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.amRank{font-family:var(--font-data);font-size:var(--fs-micro);color:var(--dim)}
.amCell.max .amRank{color:var(--gold)}
.rar-common{color:var(--rar-common)} .rar-uncommon{color:var(--rar-uncommon)}
.rar-rare{color:var(--rar-rare)} .rar-epic{color:var(--rar-epic)}
.rar-legendary{color:var(--rar-legendary)} .rar-mythic{color:var(--rar-mythic)}
.rar-origin{color:var(--rar-origin)}
#stacksHud{font-size:var(--fs-small);color:var(--warn);font-family:var(--font-data);
  font-variant:normal;letter-spacing:0;text-transform:none}

/* ── Delve / Dungeon ── */
#delveState,#delveCache{font-family:var(--font-data);font-size:var(--fs-body);
  color:var(--bone);margin-bottom:var(--space-1)}
#delveState b,#delveCache b{color:var(--gold)}
/* The Dungeon's run controls are grouped by proximity, not by a second frame.
   DESIGN.md already flagged that this tab reuses .arena purely for a bordered
   look; a panel inside a panel is a rule line doing no work. */
.runPanel{margin:var(--arena-margin)}
#instState{font-family:var(--font-data);font-size:var(--fs-body);color:var(--bone);
  line-height:1.6}
#instState b{color:var(--gold)}
.howItWorks p{font-size:var(--fs-small);font-family:var(--font-data);color:var(--bone);
  line-height:1.6;margin-bottom:var(--space-3)}
.runControls{display:flex;flex-wrap:wrap;align-items:center;
  gap:var(--space-3) var(--space-7);margin-bottom:var(--space-3)}
.runControls label{font-size:var(--fs-small);font-family:var(--font-data);color:var(--dim)}
.ctaRow{display:flex;flex-wrap:wrap;gap:var(--space-5);margin-top:var(--space-5)}
.cta{flex:1;background:var(--panel);border:var(--border-hairline) solid var(--gold);
  color:var(--gold);font-family:var(--font-body);font-variant:small-caps;
  letter-spacing:.1em;font-size:var(--fs-display);padding:var(--space-6);
  text-align:center}
.seg{display:inline-flex}
.seg button{text-align:center}
.seg button.active{color:var(--gold);border-color:var(--gold)}

/* ── THE CHAT WINDOW ──────────────────────────────────────────────────────
   Was: a shell prompt (index.html:204, emitted here) in a game that has no
   shell, naming the server as a dead one in shared chrome on every screen,
   behind a block cursor implying an input that does not exist. It survived
   four reviews because every one of them checked that the shell register was
   CONFINED and none asked whether it should exist. A confined premise error is
   still a premise error.

   Is now: the honest MMO furniture. A bottom-of-screen log in an MMO client is
   a chat panel. In a dead MMO it is also the saddest object on the screen —
   System carries the traffic while General sits empty, and "Players online: 1"
   finally has a home where it means the whole premise. The EMPTINESS does the
   storytelling the decay string was faking. That is ABSENCE, which is the
   target feeling; the broken prompt was DISREPAIR, which is banned.

   No unread badge, no notification dot, no count. That would be an obligation
   mechanic and the veto on those is standing.                              */
#chat{margin-top:var(--space-8)}
#chatHead{display:flex;align-items:center;flex-wrap:wrap;gap:var(--space-3);
  border-top:var(--border-hairline) solid var(--line);padding:var(--space-4) 0}
.chan{font-size:var(--fs-label);padding:var(--space-2) var(--space-6);
  color:var(--dim);text-align:center}
.chan.active{color:var(--bone)}
/* The counter the whole game is about, in the one place an MMO client puts it. */
#online{margin-left:auto;font-family:var(--font-data);font-size:var(--fs-micro);
  letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
#log{font-family:var(--font-data);font-size:var(--fs-small);max-height:var(--log-max-h);
  overflow-y:auto}
.logline{padding:var(--space-1) 0}
/* Quiet, not broken: the window around it is intact, lit and selectable, and
   the copy states the fact without narrating the silence. A sentence ABOUT the
   emptiness is the decay register coming back in as prose. */
.chatEmpty{color:var(--faint);font-style:italic;text-align:center;
  padding:var(--space-9) var(--space-5)}
.log-event{color:var(--gold)} .log-plain{color:var(--bone)}
.log-dim{color:var(--recede)} .log-warn{color:var(--warn)}
footer{text-align:center;margin-top:var(--space-8);font-family:var(--font-data);
  font-size:var(--fs-label);color:var(--faint)}
footer button{background:none;border:none;color:var(--faint);
  font-size:var(--fs-label);text-decoration:underline;text-align:center}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms !important;
    transition-duration:.01ms !important;scroll-behavior:auto !important}
}`;

/* ═════════════════════════════════════════════════════════════════════════
   VISUAL DNA v3 — MapleStory's CARPENTRY on this game's dark ramp.
   internal/DESIGN.md "## Visual DNA v3" is the spec; this is its execution.

   v2 modelled LIGHT (a lip, a gradient, a foot) and produced a tidy dark
   dashboard. v3 models CARPENTRY: a panel is a WINDOW with a thick bevelled
   frame and a title bar; anything you read FROM is a SOCKET cut into it;
   every control has a physical top surface you can press. Four constructions,
   applied everywhere, no exceptions — that is what makes it a language rather
   than a hero-tab trick.

   What did NOT travel from MapleStory: its colours. Maple's real UI is cream
   and tan and cheerful; this game is dark-only and its premise is melancholy.
   Remix rule 4 — colour and composition rarely both borrow — is the reason,
   and it is the same rule v2 honoured. NOT ONE HEX MOVES IN v3.

   Scoped to the Boss mock, because this pass's scope is one recomposed
   surface. Adds ZERO animation (the motion budget is untouched), ZERO raster
   assets, ZERO icons, ZERO external refs: every mark below is a border, a
   gradient, a radius or a hard-offset shadow. Nothing is worn, chipped,
   scanlined or distressed — the server works; only the players are gone.

   ponytail: two CSS strings instead of one until the look is signed off —
   the follow-up phase pastes this into CSS, drops the `v3` flag, and deletes
   the split.
   ═════════════════════════════════════════════════════════════════════════ */
const CSS_V3 = `
/* ── 0. THE VOICE ──────────────────────────────────────────────────────────
   --font-body now resolves to --font-ui, so the serif is retired at all four
   of its shipped sites from one token. What remains here is the WEIGHT and
   the SHADOW, which is the other half of what the user was reacting to.

   The shadow rule, stated so it is not applied by reflex: CHROME is shadowed,
   DATA is not. A hard 1px shadow under every glyph of an 11px monospace stat
   row fills its counters and destroys the even texture chapter-03's squint
   test is about. Titles, labels, controls and the identity get the shadow;
   rows, captions and the log do not.                                       */
b{font-weight:bold}
main.client{padding:var(--space-8) var(--space-5) var(--space-10)}

/* ── 1. THE WINDOW ─────────────────────────────────────────────────────────
   Every panel is an object with edges. A 3px frame, a real radius, a body
   that falls from --panel to --plate-foot, an OUTER BEVEL drawn as two
   opposed inset hairlines (warm --edge-lit at the top-left, cool
   --edge-shade at the bottom-right — light from above, hue-shifted, ch09),
   and a hard foot so the window sits ON the page instead of being part of it.

   No blur anywhere in this file: a blurred coloured shadow on a dark ground
   is the neon-glow tell AND reads as a screen in trouble. Offsets only.    */
section.game{
  border:var(--border-frame) solid var(--line);
  border-radius:var(--radius-window);
  background:linear-gradient(var(--panel),var(--plate-foot));
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-lit),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-shade),
    0 var(--space-1) 0 var(--edge-shade);
  padding:0 var(--space-7) var(--space-8);
  margin:var(--space-8) 0;
  overflow:hidden}

/* ── 2. THE TITLE BAR — the signature move ────────────────────────────────
   Every window wears its name on a raised strip full-bleed across its head,
   closed by a two-tone groove (dark line, then lit line — the oldest
   "something ends here" mark in interface carpentry).

   The string is ALWAYS the block's own existing heading. No copy is invented,
   no fact moves owner, no heading is duplicated: this is the same <h3> the
   spec already had, given the shape a client window's header has. The
   explainer sentence rides the plate under the name rather than being exiled
   below it, which keeps the header one object instead of two.              */
h3{
  background:linear-gradient(var(--field),var(--inset) var(--space-10));
  border:none;
  border-bottom:var(--border-hairline) solid var(--edge-shade);
  box-shadow:0 var(--border-hairline) 0 var(--edge-lit),
             inset 0 var(--border-hairline) 0 var(--edge-lit);
  margin:var(--space-9) calc(var(--space-7) * -1) var(--space-7);
  padding:var(--space-5) var(--space-7) var(--space-5);
  display:block;
  font-family:var(--font-ui);font-size:var(--fs-body);font-weight:bold;
  font-variant:normal;text-transform:uppercase;letter-spacing:.1em;
  color:var(--bone);
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade)}
section.game>h3:first-child{margin-top:0;border-top:none}
h3::before{content:none}          /* the v2 gold lozenge — superseded, gone */
h3 .sub{margin-top:var(--space-4);font-style:normal;color:var(--dim);
  letter-spacing:0;text-transform:none;font-weight:normal;
  font-size:var(--fs-small);text-shadow:none}

/* The Warden's name-plate is the SAME construction one size up. Block 1 of
   the JOURNEY spec keeps both its facts, its strings, its owner and its
   position; what changed is that the header of the Boss window is the boss,
   which is what a boss frame in an MMO client actually is.                 */
.frame{
  background:linear-gradient(var(--field),var(--inset) var(--space-10));
  border:none;
  border-bottom:var(--border-hairline) solid var(--edge-shade);
  box-shadow:0 var(--border-hairline) 0 var(--edge-lit),
             inset 0 var(--border-hairline) 0 var(--edge-lit);
  margin:0 calc(var(--space-7) * -1) var(--space-8);
  padding:var(--space-8) var(--space-7) var(--space-7)}
.bossPanel{margin:0;text-align:center}
#bossName{font-family:var(--font-ui);font-size:var(--fs-warden);
  font-weight:bold;font-variant:normal;letter-spacing:.04em;line-height:1.1;
  color:var(--gold);overflow-wrap:anywhere;
  text-shadow:0 var(--space-1) 0 var(--edge-shade)}
#bossTitle{font-family:var(--font-ui);font-size:var(--fs-small);
  font-style:normal;font-weight:bold;text-transform:uppercase;
  letter-spacing:.12em;color:var(--bone);margin-top:var(--space-4);
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade)}

/* ── 3. THE SOCKET — anything you read FROM is cut INTO the body ──────────
   The inverse bevel of the window: dark at the near (top-left) wall, lit on
   the far (bottom-right) wall, on the --well ground, which sits below page
   level. One blurred inner shadow is the only blur in the file and it is
   pointed INWARD, so it can never read as a glow.

   This is the rule that makes the language work on a surface with no hero:
   Training, Grind, Player and Delve are lists, and a list in a socket has
   depth without needing a frame or a display face.                         */
.rowlist,.canvasStub,#dialogue,#log{
  background:var(--well);
  border:var(--border-hairline) solid var(--edge-shade);
  border-radius:var(--radius-socket);
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) var(--space-2) var(--edge-shade),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-lit)}
.rowlist{margin:var(--space-5) 0 var(--space-7)}

/* ── 4. THE CONTROL — a button has a physical top surface ─────────────────
   Rounded, gloss-gradient, lit top-left / dark bottom-right, a hard foot to
   stand on, a bold shadowed label. PRESSED inverts the bevel, swaps the
   gradient and drops the foot — the button physically goes down. DISABLED
   loses the bevel AND the foot and flattens onto --panel, which is both the
   material carrying a state and the only ground where --faint clears AA.   */
section.game button,#tabs button,.helpBtn,.chan{
  font-family:var(--font-ui);font-weight:bold;
  border:var(--border-hairline) solid var(--edge-shade);
  border-radius:var(--radius-control);
  background:linear-gradient(var(--field),var(--panel));
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-lit),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-shade),
    0 var(--space-1) 0 var(--edge-shade);
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade);
  text-align:center}
section.game button:active,#tabs button:active,.helpBtn:active,.chan:active{
  background:linear-gradient(var(--panel),var(--field));
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-shade),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-lit);
  transform:translateY(var(--border-hairline))}
section.game button:disabled{
  background:var(--panel);box-shadow:none;border-color:var(--line-soft);
  text-shadow:none;color:var(--faint)}

/* A SELECTED control wears the pressed construction permanently — that is
   how an MMO client says "you are on this one", and it is a second,
   positional channel on top of the colour one. Gold enters here as an
   identity edge, never as a fill on chrome.                                */
#tabs button.active,.wallBtn.active{
  color:var(--gold);border-color:var(--gold);
  background:linear-gradient(var(--panel),var(--field));
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-shade),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-lit)}
#tabs{gap:var(--space-4);margin-bottom:var(--space-7)}
#tabs button{font-variant:normal;text-transform:uppercase;letter-spacing:.08em;
  font-size:var(--fs-small)}
#tabs button.locked{background:var(--panel);box-shadow:none;
  border-color:var(--line-soft);text-shadow:none}

/* ── 5. THE CHROME BAND ───────────────────────────────────────────────────
   The resource bar stays a flat band and the chip clusters are the raised
   objects inside it. Deliberately NOT a raised bar holding raised plates:
   a bevel inside a bevel is the nested-card tell and it is the one Maple
   habit that has to be left at the door.                                   */
#resbar{padding:var(--space-5) var(--space-3);margin-bottom:var(--space-7);
  border-color:var(--line)}
.chipGroup{border-radius:var(--radius-control);border-color:var(--edge-shade);
  background:linear-gradient(var(--field),var(--panel));
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-lit),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-shade),
    0 var(--space-1) 0 var(--edge-shade);
  padding:var(--space-4) var(--space-1)}
.chipVal{font-family:var(--font-ui);font-weight:bold;
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade)}
.chipLbl{font-family:var(--font-ui);font-weight:bold;letter-spacing:.08em;
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade)}
.chip{border-left-color:var(--edge-shade)}
.helpBtn{margin-left:auto}

/* ── 6. THE ARENA — a socket with light under the door ────────────────────
   The canvas region IS the socket; no wrapper boxes it. The floor band and
   its seam are background LAYERS, not borders, so no rectangle is ever drawn
   inside another rectangle. What the canvas should DRAW is DESIGN.md's
   Canvas scene spec; the DOM's job is to cut the aperture, not fake it.    */
.canvasStub{position:relative;aspect-ratio:16/10;margin:var(--space-7) 0 0;
  padding:var(--space-7)}
.canvasStub::after{content:"";position:absolute;left:0;right:0;bottom:0;
  height:24%;pointer-events:none;
  background:linear-gradient(var(--gold-dim),var(--gold-dim))
               0 100%/100% var(--border-hairline) no-repeat,
             linear-gradient(transparent,var(--floor-glow))}
.canvasStub .k,.canvasStub .v{position:relative;z-index:1}
.canvasStub .k{font-family:var(--font-ui);font-weight:bold;
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade)}

/* ── 7. THE SIEGE READOUT ─────────────────────────────────────────────────  */
.wallLbl{font-family:var(--font-ui);font-weight:bold;color:var(--recede);
  margin:var(--space-7) 0 var(--space-4);
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade)}
#wallSelect{gap:var(--space-4)}
.controls{border-top:var(--border-hairline) solid var(--edge-shade);
  box-shadow:0 var(--border-hairline) 0 var(--edge-lit) inset;
  padding-top:var(--space-7);margin:var(--space-8) 0 var(--space-5);
  gap:var(--space-4) var(--space-7)}
#depth{font-family:var(--font-ui);font-weight:bold;letter-spacing:.02em;
  line-height:1;text-shadow:0 var(--space-1) 0 var(--edge-shade)}
/* The wall's peak moment. 52px, bold, the heaviest shadow on the page, and
   it owns its row rather than sitting flush-left in a baseline flex line.  */
#depth.breached{font-size:var(--fs-colossal);letter-spacing:.03em}
.controls:has(.breached){flex-direction:column;align-items:center;
  text-align:center}

/* ── 8. THE LEDGER — fixed terms read as a table, not as a sentence ───────
   Four fixed terms, so columns, not prose: a sentence forces the reader to
   parse "20% of those" to learn super-crit is conditional. The header is the
   window's own title-bar voice one step down; the rule above the product row
   is its OWN full-span element rather than per-cell borders, because a rule
   interrupted by column gaps reads as a broken line — the one thing this
   DNA must never do.                                                       */
.ledger{display:grid;grid-template-columns:1fr auto auto;
  column-gap:var(--space-7);margin-top:var(--space-6);
  font-size:var(--fs-small);font-family:var(--font-data)}
.ledger>*{padding:var(--space-2) 0}
.ledger .hd{grid-column:1/-1;font-family:var(--font-ui);font-weight:bold;
  font-variant:normal;text-transform:uppercase;letter-spacing:.12em;
  color:var(--bone);text-shadow:0 var(--border-hairline) 0 var(--edge-shade);
  border-bottom:var(--border-hairline) solid var(--line);
  margin-bottom:var(--space-2)}
.ledger .k{color:var(--faint)}
.ledger .v{color:var(--dim);text-align:right;font-variant-numeric:tabular-nums}
.ledger .rule{grid-column:1/-1;padding:0;height:0;
  border-top:var(--border-hairline) solid var(--line);margin-top:var(--space-2)}
.ledger .k.sum{padding-top:var(--space-4)}
.ledger .v.sum{padding-top:var(--space-4);color:var(--bone);font-weight:bold}
.ledger .v.sum.wide{grid-column:2/-1}

/* ── 9. THE PRIMARY ACTION ────────────────────────────────────────────────
   The one control on the tab that is not chrome. A solid gold face with dark
   text is the loudest thing an MMO client's button vocabulary has, and this
   button appears once per wall — the amplitude matches the moment. Gold as a
   FILL is reserved to this one element; everywhere else gold is an edge.   */
#descendBtn{display:block;width:100%;
  font-family:var(--font-ui);font-size:var(--fs-masthead);font-weight:bold;
  font-variant:normal;text-transform:uppercase;letter-spacing:.08em;
  color:var(--on-gold);
  background:linear-gradient(var(--gold),var(--gold-dim));
  border:var(--border-hairline) solid var(--gold);
  border-radius:var(--radius-control);
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--gold),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-shade),
    0 var(--space-1) 0 var(--edge-shade);
  text-shadow:none;
  padding:var(--space-7) var(--space-6);margin:var(--space-7) 0 var(--space-1)}
#descendBtn:active{background:linear-gradient(var(--gold-dim),var(--gold));
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-shade),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--gold)}

/* ── 10. THE STORY — recessed, so the voice sits behind the glass ─────────  */
#dialogue{border-left:var(--row-active-border) solid var(--gold-dim);
  font-size:var(--fs-display);line-height:1.55;color:var(--bone);
  padding:var(--space-7);margin:var(--space-8) 0 0}
#projection{color:var(--bone)}   /* gold on a sentence is why no other gold read */

/* ── 11. THE LADDER, UNFLATTENED ──────────────────────────────────────────
   The four state channels (edge colour, type colour, control presence,
   unlock text) are untouched. v2 added a fifth — material. v3 keeps that and
   the socket adds a sixth for free: a LIVE row is lifted out of the socket
   onto its own lit ground, a DORMANT row lies flat in it, and a LOCKED row
   is unlit — no groove highlight at all, which is the "visibly unlit
   window" a chunkier frame language is supposed to buy. Six channels, none
   lost, and every one of them still visible at 375px.

   The groove between rows is the two-tone list separator: each row's dark
   bottom border sits directly above the next row's lit top hairline.       */
.rowlist .row{border-bottom:var(--border-hairline) solid var(--edge-shade);
  box-shadow:inset 0 var(--border-hairline) 0 var(--line-soft)}
.rowlist .row:last-child{border-bottom:none}
.rowlist .row.active{background:linear-gradient(var(--inset),var(--well));
  box-shadow:inset 0 var(--border-hairline) 0 var(--edge-lit)}
.rowlist .row.locked{box-shadow:none}
.rowName{font-weight:bold}
/* The cycle meter is a channel cut along the row's foot, not a line drawn on
   it: a dark track with a lit fill, the same socket logic one pixel tall.  */
.rowBar{background:var(--edge-shade)}

/* ── 12. THE ALLOCATION CONTROL ───────────────────────────────────────────
   Mini plates around a socketed readout — the shape every MMO client uses
   for "spend some of this here". Absent entirely on a locked row, which is
   the ladder's control channel and stays exactly as specced.               */
.allocMini{gap:var(--space-3)}
.allocMini input{background:var(--well);border-radius:var(--radius-socket);
  border-color:var(--edge-shade);font-weight:bold;
  box-shadow:inset var(--border-hairline) var(--border-hairline) var(--space-2) var(--edge-shade),
             inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-lit)}

/* ── v4 base-CSS fallback ─────────────────────────────────────────────────
   The band chip's MARKUP is emitted by shared helpers, so it reaches the four
   surfaces this phase does not recompose. It degrades to plain mono text
   there rather than rendering as an unstyled artefact.                     */
.band{font-family:var(--font-data);color:var(--bone)}
`;

/* ═════════════════════════════════════════════════════════════════════════
   VISUAL DNA v4 — the four COLOUR LANES + v3's carpentry at full weight.
   internal/DESIGN.md "## Visual DNA v4" is the spec; this is its execution.

   v3 was accepted only provisionally: "the UI itself is ok. maybe more
   stylised aesthetic is how i would have preferred. adding colour where it
   could potentially add more flavour could be nice as well." Both halves of
   that are spent here, BEFORE the look propagates to the remaining surfaces.

   THE AMENDED COLOUR RULE. v3 said warn/alert/copper are functional accents
   that never enter an identity role, and gold is the sole signature. That
   rule is why every surface read identical, and it is now amended: colour MAY
   carry identity. What survives the amendment is the part that matters — NO
   HUE IS DECORATIVE. Every hue attaches to a meaning the player can name, in
   one of exactly four lanes, and the co-occurrence rule caps any one surface
   at two of them.

   WHAT GOLD IS NOW. Gold stopped being "the identity" and became THE CLIENT'S
   OWN VOICE: the letter-glyph plates, the primary action's fill, a maxed or
   complete state, the log's event lines. It is no longer any one tab's or any
   one door's — which is precisely what lets a door and a room each own a hue
   without either of them competing with it.

   THE LADDER IS UNTOUCHED. All six state channels survive (edge presence,
   type colour, control presence, unlock text, material lift, socket
   lit-ness). The only thing that changes is WHICH hue fills the "live" slot,
   and it changes per room, consistently. --warn still owns "struggling", and
   no accent is placed where it could be mistaken for it.

   Still ZERO animation, ZERO raster assets, ZERO external refs. Every mark
   below is a border, a gradient, a radius, a background layer or a
   hard-offset shadow. The one blurred shadow in the language still points
   inward. Nothing is worn, chipped, scanlined or distressed: the feeling is
   ABSENCE, not disrepair — the server works, only the players are gone.

   ponytail: still two CSS strings until the look is signed off — the
   follow-up phase pastes v3+v4 into CSS, drops the flags, deletes the split.
   ═════════════════════════════════════════════════════════════════════════ */
const CSS_V4 = `
/* ── 0. THE ROOM'S OWN COLOUR ──────────────────────────────────────────────
   Each surface declares its accent ONCE, on <main>. Everything downstream
   reads var(--acc), so re-skinning a tab is one assignment and no rule below
   names a specific hue. Boss's accent is the active Warden's hue, which is
   why Boss carries exactly one identity hue instead of two.

   Scoped to main. on purpose: the tab buttons wear the same .t-* classes, so
   an unscoped rule also set --acc on all seven of them — invisible today
   (nothing inside a button reads --acc) and a seven-hue trapdoor the moment
   anything did. Tier B's "exactly one lane-3 hue" is now true of the cascade
   and not only of the render.                                            */
main.t-boss{--acc:var(--acc-boss)}      main.t-training{--acc:var(--acc-training)}
main.t-grind{--acc:var(--acc-grind)}    main.t-player{--acc:var(--acc-player)}
main.t-delve{--acc:var(--acc-delve)}    main.t-dungeon{--acc:var(--acc-dungeon)}
main.t-help{--acc:var(--acc-help)}

/* ── 1. THE WINDOW, HEAVIER ────────────────────────────────────────────────
   v3's frame was 3px with a 1px bevel. The v3 review's own Major was that a
   1px edge at 10 L* "is not a bevel, it is a rumour"; the same argument taken
   one step further gives a 4px frame with a 2px bevel and a 2px foot. The
   frame itself is TINTED with the room's accent (24% into --line, L* ~29 —
   ~20 L* over --panel, and checked by L* separation rather than by ratio,
   because it is a surface).                                              */
section.game{
  border:var(--border-frame) solid var(--w-frame);
  box-shadow:
    inset var(--bevel) var(--bevel) 0 var(--edge-lit),
    inset calc(var(--bevel) * -1) calc(var(--bevel) * -1) 0 var(--edge-shade),
    0 var(--bevel) 0 var(--edge-shade);
  padding:0 var(--space-7) var(--space-9);
  margin:var(--space-9) 0}
.t-training section.game,.t-grind section.game,.t-player section.game,
.t-delve section.game,.t-dungeon section.game,.t-help section.game{
  border-color:color-mix(in oklab, var(--acc) 24%, var(--line))}

/* ── 2. THE TITLE BAR, AT FULL WEIGHT ─────────────────────────────────────
   v3's signature move, pushed: the label steps from --fs-body to --fs-display,
   the closing groove's lit line goes from 1px --edge-lit to 2px of the ROOM'S
   ACCENT, and the bar carries four CORNER RIVETS.

   The rivets are four background layers — a drawn mark, not a glyph, not an
   image, categorically not a generated icon. FOUR, always, symmetric, always
   complete: a missing or offset rivet reads as damage instantly, so the
   construction makes that unrepresentable rather than merely discouraged.
   This is the no-decay veto expressed as CSS.                            */
h3,.frame,#chatHead{
  --rv:linear-gradient(var(--edge-lit),var(--edge-lit));
  background:
    var(--rv) var(--rivet-inset) var(--rivet-inset)/var(--rivet) var(--rivet) no-repeat,
    var(--rv) right var(--rivet-inset) top var(--rivet-inset)/var(--rivet) var(--rivet) no-repeat,
    var(--rv) left var(--rivet-inset) bottom var(--rivet-inset)/var(--rivet) var(--rivet) no-repeat,
    var(--rv) right var(--rivet-inset) bottom var(--rivet-inset)/var(--rivet) var(--rivet) no-repeat,
    linear-gradient(var(--field),var(--inset) var(--space-10));
  border-bottom:var(--bevel) solid var(--edge-shade);
  box-shadow:0 var(--bevel) 0 var(--acc),
             inset 0 var(--bevel) 0 var(--edge-lit)}
h3{display:flex;flex-wrap:wrap;align-items:center;column-gap:var(--space-5);
  font-size:var(--fs-display);letter-spacing:.12em;
  padding:var(--space-5) var(--space-7);
  margin:var(--space-10) calc(var(--space-7) * -1) var(--space-8)}
h3 .sub,h3 .caption{flex-basis:100%;margin-top:var(--space-4)}

/* THE LETTER-GLYPH PLATE. The project's standing veto is on AI-GENERATED
   icons; letter glyphs and hand-made marks are the named exception, and this
   is the letter-glyph case: one capital in the UI face, on the CONTROL
   construction shrunk to a square. It is TYPE on a plate, so there is no
   raster, no path, no generated art anywhere in the file — build.mjs's own
   external-reference assertion proves that mechanically.

   It is also where gold's new job lives: the glyph plates are the client
   speaking in its own voice, on every window, in every room.             */
.glyph{display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:var(--glyph-plate);height:var(--glyph-plate);
  font-family:var(--font-ui);font-weight:bold;font-size:var(--fs-display);
  line-height:1;color:var(--gold);
  background:linear-gradient(var(--field),var(--panel));
  border:var(--border-hairline) solid var(--edge-shade);
  border-radius:var(--radius-control);
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-lit),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-shade),
    0 var(--border-hairline) 0 var(--edge-shade);
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade)}

/* ── 3. THE DOOR ──────────────────────────────────────────────────────────
   The Warden's name-plate is the same construction one size up, and the name
   is now set in the DOOR'S OWN HUE rather than in gold. That is the whole of
   lane 2 in one declaration: gold is the client, the hue is the place, and a
   door finally feels like somewhere rather than like the same panel with a
   different string in it.

   The plate GROUND stays neutral on purpose. A hue-tinted ground under its
   own hue costs that hue its contrast (3.87:1, measured) — so the tint goes
   on the frame, the groove and the floor glow, and the ink keeps a clean
   ground. Ink and its own ground never share a hue.                      */
.frame{padding:var(--space-9) var(--space-7) var(--space-8);
  margin:0 calc(var(--space-7) * -1) var(--space-9)}
/* THE NAMEPLATE. Lane 2 moved OFF the type and ONTO the plate: the frame, its
   rivets and the bevel carry the Warden's hue and the name goes back to gold.
   Ten doors still read apart, but gold keeps the most important string in the
   client, and ink still never shares a hue with its own ground — the same rule
   the frame/groove/floor-glow split already follows. Built from the h3/.frame
   construction rather than a new one. */
.nameplate{
  --rv:linear-gradient(var(--edge-lit),var(--edge-lit));
  background:
    var(--rv) var(--rivet-inset) var(--rivet-inset)/var(--rivet) var(--rivet) no-repeat,
    var(--rv) right var(--rivet-inset) top var(--rivet-inset)/var(--rivet) var(--rivet) no-repeat,
    var(--rv) left var(--rivet-inset) bottom var(--rivet-inset)/var(--rivet) var(--rivet) no-repeat,
    var(--rv) right var(--rivet-inset) bottom var(--rivet-inset)/var(--rivet) var(--rivet) no-repeat,
    linear-gradient(var(--field),var(--inset) var(--space-10));
  border:var(--border-hairline) solid var(--w-frame);
  border-radius:var(--radius-window);
  padding:var(--space-7) var(--space-7) var(--space-6);
  box-shadow:0 var(--bevel) 0 var(--w-active),
             inset 0 var(--bevel) 0 var(--edge-lit)}
#bossName{font-size:var(--fs-warden);color:var(--gold)}
.wallBtn.active{color:var(--w-active);border-color:var(--w-active)}

/* ── 4. THE TAB ROW — TIER A, the navigation legend ───────────────────────
   Re-fit to four columns per Phase 2's own accepted specimen (7 buttons lay
   out 4+3; repeat(3,1fr) left an orphan alone on a third row).

   Every chip carries a 2px inset bar in ITS OWN accent, so all seven rooms
   are legible in the row at once — but the INK stays --dim until a chip is
   active. Colour identifies the room; the pressed construction plus the ink
   still identify the current one, so the accent is an added channel and not a
   replacement for one.

   THIS IS THE WHOLE OF TIER A (DESIGN.md ## The co-occurrence rule, amended
   2026-07-26). #tabs is the ONLY element in the client permitted to show more
   than one hue of one lane at the same time, and it is bounded: lane 3 only,
   chroma <= .05, the 2px foot bar only, inactive ink stays --dim. --acc-tab is
   set and read here and NOWHERE ELSE — that grep is the check. A second
   multi-hue persistent element is an amendment to DESIGN.md, not a change made
   in this file.

   Everything OUTSIDE #tabs is Tier B and carries exactly ONE lane-3 hue: the
   surface's own --acc, set once on <main> in block 2 above. So Boss renders one
   identity hue on its surface (lane 2, via the --acc-boss alias) and the legend
   above it, which is what the amended per-surface table says.               */
#tabs{grid-template-columns:repeat(4,1fr)}
/* The accent bar is the FOOT of the chip only. Drawn as a corner inset it
   wrapped up the right-hand side and ate that edge's --edge-shade, which cost
   the chip its bevel — the accent would have been buying colour with depth. */
#tabs button{box-shadow:
  inset var(--border-hairline) var(--border-hairline) 0 var(--edge-lit),
  inset calc(var(--border-hairline) * -1) 0 0 var(--edge-shade),
  inset 0 calc(var(--space-1) * -1) 0 var(--acc-tab),
  0 var(--space-1) 0 var(--edge-shade)}
#tabs button.t-boss{--acc-tab:var(--acc-boss)}
#tabs button.t-training{--acc-tab:var(--acc-training)}
#tabs button.t-grind{--acc-tab:var(--acc-grind)}
#tabs button.t-player{--acc-tab:var(--acc-player)}
#tabs button.t-delve{--acc-tab:var(--acc-delve)}
#tabs button.t-dungeon{--acc-tab:var(--acc-dungeon)}
#tabs button.t-help{--acc-tab:var(--acc-help)}
#tabs button.active{color:var(--acc-tab);border-color:var(--acc-tab);
  background:linear-gradient(var(--panel),var(--field));
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-shade),
    inset calc(var(--border-hairline) * -1) 0 0 var(--edge-lit),
    inset 0 calc(var(--space-1) * -1) 0 var(--acc-tab)}

/* ── 5. LANE 1 ON THE SURFACE — an item is a PLATE in its own rarity ──────
   The tier hue was a text tint and nothing else. It is now a raised plate:
   the tier's own hue mixed 16% into --plate-foot, a 4px edge in the pure hue,
   the item name in the hue, and the meta line in --bone.

   --dim / --recede / --faint are BANNED on these grounds — they measure
   4.04-4.63:1 there. Fixed by ROLE, not by value (the same call v2 made for
   --recede on --field): the plate carries --bone, and its hierarchy comes
   from size and weight instead of from a quieter colour. contrast.mjs
   asserts the ban, and now FAILS if a banned pair ever starts passing.

   Every plate keeps its tier NAME printed beside it. Colour is never the only
   channel (chapter-08, Critical — ~10% of male users).                   */
.slot,.stashRow,.scrapPill{--rp:var(--panel);--ri:var(--line-soft)}
.r-common{--rp:var(--rar-plate-common);--ri:var(--rar-common)}
.r-uncommon{--rp:var(--rar-plate-uncommon);--ri:var(--rar-uncommon)}
.r-rare{--rp:var(--rar-plate-rare);--ri:var(--rar-rare)}
.r-epic{--rp:var(--rar-plate-epic);--ri:var(--rar-epic)}
.r-legendary{--rp:var(--rar-plate-legendary);--ri:var(--rar-legendary)}
.r-mythic{--rp:var(--rar-plate-mythic);--ri:var(--rar-mythic)}
.r-origin{--rp:var(--rar-plate-origin);--ri:var(--rar-origin)}
.slot{background:var(--rp);border-left:var(--border-frame) solid var(--ri);
  border-top:none;border-radius:var(--radius-control);
  padding:var(--space-6) var(--space-7);margin-top:var(--space-5);
  box-shadow:
    inset var(--border-hairline) var(--border-hairline) 0 var(--edge-lit),
    inset calc(var(--border-hairline) * -1) calc(var(--border-hairline) * -1) 0 var(--edge-shade),
    0 var(--space-1) 0 var(--edge-shade)}
.slot.filled{border-left-color:var(--ri)}
/* An EMPTY slot is a socket, not a plate — nothing is in it to raise. That is
   the material carrying the state, exactly as a disabled control does. */
.slot:not(.filled){background:var(--well);box-shadow:
  inset var(--border-hairline) var(--border-hairline) var(--space-2) var(--edge-shade);
  border-left-color:var(--line-soft)}
.slotName{color:var(--bone);font-weight:bold;letter-spacing:.1em;
  text-transform:uppercase;font-size:var(--fs-label);font-variant:normal}
.itemMeta,.enhInfo,.affixItem{color:var(--bone)}
.slotItem{font-size:var(--fs-body)}
.stashRow{background:var(--rp);border-left:var(--space-2) solid var(--ri);
  border-bottom:var(--border-hairline) solid var(--edge-shade);
  box-shadow:inset 0 var(--border-hairline) 0 var(--edge-lit);
  padding:var(--space-4) var(--space-5)}
.stashRow .sInfo{color:var(--bone)}
.scrapPill{background:var(--rp);color:var(--ri);border-color:var(--ri);
  border-radius:var(--radius-socket);font-weight:bold}
/* a drop logline names the item in its tier's hue — the same lane, in the
   client's own console, which is where a drop is actually announced */
.log-loot .rar{font-weight:bold}

/* ── 6. LANE 4 ON THE SURFACE — a heat block, not ink ─────────────────────
   The band is the one lane that is NOT ink, and that is deliberate: a filled
   chip at L* ~16.5 sits in a different luminance tier from every ink lane, so
   it cannot be mistaken for one even where the hues are close. Cut into the
   surface as a socket, with a 2px lip of the pure band hue, carrying the
   actual IP or zone number in --bone — the number is the redundant cue that
   keeps the ordering readable without the colour.                        */
.band{display:inline-block;background:var(--bc);color:var(--bone);
  border-radius:var(--radius-socket);padding:0 var(--space-4);
  font-size:var(--fs-label);letter-spacing:.04em;
  box-shadow:inset 0 var(--space-1) 0 var(--bl),
             inset var(--border-hairline) 0 var(--space-2) var(--edge-shade)}
.b1{--bc:var(--band-1-chip);--bl:var(--band-1)}
.b2{--bc:var(--band-2-chip);--bl:var(--band-2)}
.b3{--bc:var(--band-3-chip);--bl:var(--band-3)}
.b4{--bc:var(--band-4-chip);--bl:var(--band-4)}
.b5{--bc:var(--band-5-chip);--bl:var(--band-5)}
.amZone{text-align:center}

/* ── 7. LANE 3 ON THE LADDER — the room's colour, not a fifth channel ─────
   A live row's edge and name take the ROOM'S accent instead of gold. Nothing
   else about the ladder moves: dormant is still a neutral edge with a dim
   name, struggling is still --warn on both, locked still has NO edge, no
   control, --opacity-locked and the literal word "locked". Six channels, all
   six intact — the hue that fills the "live" slot is the only thing that
   changed, and within a room it is constant.

   --warn keeps "struggling" alone. No accent sits close enough to it to be
   confused: the one that comes nearest is --acc-dungeon, and Dungeon is the
   single tab with no struggling state.                                   */
.row.active{border-left:var(--border-frame) solid var(--acc)}
.row.active .rowName{color:var(--acc)}
/* The Warden's own line carries the Warden's own hue — the door is speaking. */
#dialogue{border-left-color:var(--w-active)}
/* Light under THIS door: the arena's floor seam takes the Warden's hue, so the
   canvas and the DOM agree on whose room it is. What the canvas draws with it
   is DESIGN.md "## Canvas scene spec (v4)". */
.canvasStub::after{background:
  linear-gradient(var(--w-active),var(--w-active)) 0 100%/100% var(--border-hairline) no-repeat,
  linear-gradient(transparent,var(--floor-glow))}
.trophySet.started{border-left-color:var(--acc)}
/* An UPGRADE is the client telling you something, and gold is the client's
   voice — but the gold already lives in the row's own marker glyph. Letting it
   also take the edge would cost the rarity lane its widest channel on the one
   row that most needs it, so the edge stays rarity's and the glyph stays gold.
   One fact, one slot. */
.stashRow.upgrade{border-left-color:var(--ri)}
/* border-color is a SHORTHAND and resets all four sides — it has to come
   BEFORE the accent edge or it silently eats it. It did, and the ranked
   Armory cells rendered with no accent at all until the render was read. */
.amCell{border-color:var(--edge-shade);border-radius:var(--radius-socket);
  border-left:var(--space-2) solid var(--acc)}
.amCell.dormant{border-left-color:var(--line-soft)}
/* MAXED stays gold. A completed thing is the client congratulating you, and
   that is gold's job now — so gold and the accent read as two different
   statements on the same row rather than as two shades of "on". */
.amCell.max{border-left-color:var(--gold)}
.pip.own{color:var(--gold);border-color:var(--gold)}

/* ── 8. THE CHAT WINDOW — the same four constructions, at the chrome tier ──
   A chat panel is a WINDOW with a TITLE BAR, two CONTROL plates and a SOCKET.
   Building it out of anything else would announce it as a foreign object,
   which is exactly the fault the shell prompt had. So it reuses the language
   whole: #chatHead joined the h3/.frame rule above (rivets for free), .chan
   joined the control rule, #log joined the socket rule.

   IT CARRIES NO LANE HUE, and that is deliberate rather than incidental. A
   section.game takes the room's --acc on its frame and its title-bar groove;
   the chat window takes --line and --edge-lit instead. Persistent chrome that
   re-tints per room would be a SECOND multi-hue element in the chrome, which
   is the thing DESIGN.md "## Never (v4)" closes Tier A against — a legend
   turning into wallpaper. Tier B lane counts on all seven surfaces are
   unchanged by this window's existence, which is the property "chrome must not
   acquire a lane budget of its own" actually asks for.                     */
#chat{
  border:var(--border-frame) solid var(--line);
  border-radius:var(--radius-window);
  background:linear-gradient(var(--panel),var(--plate-foot));
  box-shadow:
    inset var(--bevel) var(--bevel) 0 var(--edge-lit),
    inset calc(var(--bevel) * -1) calc(var(--bevel) * -1) 0 var(--edge-shade),
    0 var(--bevel) 0 var(--edge-shade);
  padding:0 var(--space-7) var(--space-7);
  margin:var(--space-9) 0 0;
  overflow:hidden}
#chatHead{border-top:none;
  margin:0 calc(var(--space-7) * -1) var(--space-7);
  padding:var(--space-4) var(--space-7);
  /* the groove closes NEUTRAL — see the tier note above */
  box-shadow:0 var(--bevel) 0 var(--edge-lit),
             inset 0 var(--bevel) 0 var(--edge-lit)}
.chan{min-height:var(--touch-min);padding:var(--space-2) var(--space-6)}
/* The selected channel wears the pressed construction permanently, the same
   way #tabs button.active does — position, not colour, says which one you are
   reading. Its ink is --bone, not an accent: this is chrome. */
.chan.active{color:var(--bone);border-color:var(--line);
  background:linear-gradient(var(--panel),var(--field));
  /* 2px, not the hairline the other pressed controls use: at --fs-label on a
     two-plate group a 1px inversion is v4's own "a rumour", and the channel you
     are reading has to be unambiguous from across the window. */
  box-shadow:
    inset var(--bevel) var(--bevel) 0 var(--edge-shade),
    inset calc(var(--bevel) * -1) calc(var(--bevel) * -1) 0 var(--edge-lit)}
#log{padding:var(--space-4) var(--space-5)}

/* ── 9. HELP — a second heading level, because an h3 IS a title bar ───────
   Six windows, one per room, each opening with the title bar and its gold
   letter-glyph plate. Topics inside cannot also be h3s: thirty title bars on
   one page is "everything equally prominent" (checklists Ch 7), so the topic
   is one level down — a small uppercase label behind a 2px accent edge, which
   is the room's own single lane-3 hue and adds no lane.                    */
.topic{border-left:var(--bevel) solid var(--acc);padding-left:var(--space-6);
  margin:var(--space-7) 0}
.topic h4{font-family:var(--font-ui);font-size:var(--fs-small);font-weight:bold;
  text-transform:uppercase;letter-spacing:.12em;color:var(--bone);
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade);
  margin-bottom:var(--space-3)}
.topic p{font-size:var(--fs-small);font-family:var(--font-data);color:var(--bone);
  line-height:1.65}
.topic p + p{margin-top:var(--space-5)}
/* A LOCKED Help block runs four ladder channels and NOT opacity: material
   (unlit — flat, no bevel, no foot), type colour, control presence (no topics
   at all), and the unlock text. --opacity-locked is deliberately absent —
   DESIGN.md's own Player note says genuine readable text takes --faint at full
   opacity so it holds AA, and a milestone string is genuine readable text. */
section.game.locked{background:var(--panel);box-shadow:none;
  border-color:var(--line-soft)}
/* The flat background drops all four rivets AT ONCE, which is the no-decay rule
   satisfied rather than broken: what it forbids is a MISSING or OFFSET rivet on
   a lit plate, i.e. asymmetry. An unlit plate has nothing for rivets to sit on,
   so they are complete-or-absent and never partial. */
section.game.locked h3{background:var(--inset);box-shadow:none;
  border-bottom-color:var(--line-soft);color:var(--faint);text-shadow:none}
section.game.locked .glyph{color:var(--faint);background:var(--panel);
  box-shadow:none;border-color:var(--line-soft)}
.lockMsg{color:var(--faint);font-style:italic;font-size:var(--fs-small);
  font-family:var(--font-data);padding:var(--space-3) 0 var(--space-5)}
`;

/* ─────────────────────────────────────────────────────────────────────────
   Shared chrome
   ───────────────────────────────────────────────────────────────────────── */
// SEVEN tabs, laid out 4+3 — Phase 2's own accepted specimen
// (internal/mocks/tabrow-specimen.html, variant B). Help was already the
// seventh spoke in JOURNEY.md's IA; this is the row catching up to it, and it
// is what lets lane 3 be proved at its real width rather than at 6/7 of it.
const TABS = [
  ["Boss", "boss"], ["Training", "training"], ["Grind", "grind"],
  ["Player", "player"], ["Delve", "delve"], ["Dungeon", "dungeon"], ["Help", "help"],
];

const tabs = active => `<nav id="tabs" aria-label="Main">` + TABS.map(([label, id]) =>
  `<button class="t-${id}${id === active ? " active" : ""}"${
    id === active ? ` aria-current="page"` : ""}>${label}</button>`
).join("") + `</nav>`;

// The letter-glyph plate. ONE capital, in the UI face, on a control plate —
// the project's veto is on AI-GENERATED icons and names letter glyphs as the
// exception. The letter is always the block's own initial, so it can never
// drift into meaning something the heading does not already say.
const g = letter => `<span class="glyph" aria-hidden="true">${letter}</span>`;

// A power-band chip (lane 4). The number rides INSIDE the chip, so the chip
// can never be the only carrier of the magnitude.
const band = (n, text) => `<span class="band b${n}">${text}</span>`;
const zoneBand = i => Math.min(5, Math.floor(i / 3) + 1);

// The resource bar echoes a headline only while you are NOT on the tab that
// owns it (see the Player mock's header comment). `skip` drops one chip.
const resbar = (skip = "") => `<header id="resbar">
  <div class="chipGroup">
    ${skip === "cp" ? "" : `<div class="chip"><div class="chipVal"><b>2,481,600</b></div>
      <div class="chipLbl">combat power &middot; +18,400/s</div></div>`}
    <div class="chip"><div class="chipVal"><b>16</b> / 248</div>
      <div class="chipLbl">bots free &middot; +240/h</div></div>
  </div>
  <div class="chipGroup">
    <div class="chip"><div class="chipVal copper"><b>84,600</b>c</div>
      <div class="chipLbl">copper &middot; +4,650/s</div></div>
  </div>
  <button class="helpBtn" title="Help">?</button>
</header>`;

// The System channel's traffic — the same four log lines the six mocks always
// carried, unchanged. Lane 1 reaches the console: a drop is announced in its
// own tier's hue, with the tier still spelled out beside it.
const LOG_LINES = [
  ["log-event", "&#9733; W1 BREACHED &mdash; Vess"],
  ["log-loot log-event", "&#9670; Vess's Latch dropped &middot; +4% speed"],
  ["log-loot log-plain", `drop: <span class="rar rar-epic">Epic Sentry Halberd</span> 11,200IP &middot; stashed`],
  ["log-dim", "While you were away (3h): +48,200 copper, 6 drops."],
];

// The client's chat window, in place of the retired shell prompt. Two
// channels; System carries the traffic, General is empty, and the emptiness is
// the storytelling — nobody is left to type in it. `Players online: 1` is the
// window's persistent counter, which is where an MMO client actually puts it
// and the one place the number means the whole premise.
const chat = (channel = "system") => `<div id="chat">
  <div id="chatHead">
    <button class="chan${channel === "system" ? " active" : ""}">System</button>
    <button class="chan${channel === "general" ? " active" : ""}">General</button>
    <span id="online">Players online: 1</span>
  </div>
  <div id="log">${channel === "system"
    ? LOG_LINES.map(([cls, t]) => `<div class="logline ${cls}">${t}</div>`).join("")
    : `<div class="chatEmpty">Nothing here.</div>`}</div>
</div>`;

const FOOTER = `<footer><button>export save</button> &middot; <button>wipe save (dev)</button></footer>`;

// Printed on every surface, because the chat window IS on every surface.
const CHATNOTE = `<b>Shared chrome, new this phase: the log is a chat window.</b>
  The shell prompt that used to head this block is gone from every surface and
  from <code>index.html</code>. It was wrong three ways &mdash; a shell inside a
  client that has no shell; it named the server a dead one, which is decay copy
  in a game whose premise is that the server WORKS; and its block cursor implied
  an input that does not exist. A bottom-of-screen log in an MMO client is a
  <b>chat panel</b>: <b>System</b> carries the traffic, <b>General</b> is empty, and
  <code>Players online: 1</code> finally has the place an MMO client actually
  puts it. The emptiness is the storytelling &mdash; that is ABSENCE, the
  target feeling, where the prompt was DISREPAIR, which is banned. It is built
  from the four existing constructions (window / title bar / control / socket)
  and carries <b>no lane hue</b>: neutral frame, neutral groove, because
  persistent chrome that re-tints per room would be a second multi-hue chrome
  element and Tier A is a closed set of one. No badge, no unread count &mdash;
  that would be an obligation mechanic.`;

// `chatChannel` picks which channel the page's own chat window opens on. Help
// opens on General so the empty state is demonstrated by the real chrome —
// a second chat window would duplicate #online and its ids on one page.
const page = ({ title, tab, note, body, skipChip, v3 = false, v4 = false,
  ladderExtra = "", fontOverride = "", chatChannel = "system" }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} &mdash; Maintenance Mode mock</title>
<!--
  Phase 3 mock, .design-foundations/plans/2026-07-26-visual-pass-and-help-tab.md
  Tokens : internal/DESIGN.md ## Visual DNA v4 (+ v3 construction, Phase 3/4 tiers)
  Blocks : internal/JOURNEY.md ## Page specs (order) + ## Fact ownership (state)
  Copy   : internal/JOURNEY.md Phase 5 microcopy, as cut by the Phase 2
           relocation table (teaching prose lives on the Help tab now)
  Save state rendered by all seven mocks:
  ${S.replace(/\n/g, "\n  ")}
  Self-contained: no external stylesheet, font, script or image.
  Generated by internal/mocks/build.mjs — edit that, not this file.
-->
<style>${TOKENS}${v3 || v4 ? TOKENS_V3 : ""}${v4 ? TOKENS_V4 : ""}${fontOverride}${TOKENS_END}${CSS}${v3 || v4 ? CSS_V3 : ""}${v4 ? CSS_V4 : ""}</style>
</head>
<body>
<main class="client${v4 ? ` t-${tab}` : ""}">
<div class="mockNote"><b>MOCK</b> &mdash; not the shipped client. ${note}
  <br><br>${CHATNOTE}</div>
${resbar(skipChip)}
${tabs(tab)}
${body}
<div class="mockNote">${LADDER}</div>
${ladderExtra}
${chat(chatChannel)}
${FOOTER}
</main>
</body>
</html>`;

/* ─────────────────────────────────────────────────────────────────────────
   Ladder key — the same sentence on every mock, so a reviewer reads the
   three states the same way on all six surfaces.
   ───────────────────────────────────────────────────────────────────────── */
const LADDER = `<b>State ladder</b> (this plan's whole point). <b>live</b>: a
4px left edge in <b>THIS ROOM'S accent</b> (v4 &mdash; gold left that slot and
became the client's own voice), name in the same accent, allocation control, a
filling bar, and the row lifted onto its own lit ground. <b>dormant</b>
(unlocked, idle): neutral left edge, dim name, faint stat, control present
reading 0, empty track, lying flat in the socket. <b>struggling</b>:
<code>--warn</code> edge and stat, which no accent is placed near.
<b>locked</b>: no left edge, unlit, whole row at
<code>--opacity-locked</code>, <b>no allocation control at all</b>, and the row
says the word "locked" and its unlock condition. Six independent channels
&mdash; edge, type, controls, unlock text, material lift, socket lit-ness.`;

// Files that draw a tab in two states repeat that tab's chrome once per state.
// That is one block rendered twice, not one fact printed twice.
const TWO_STATES = `Two states are drawn, each under its own dashed
<b>STATE</b> label; the repeated headings between them are the same block in a
different state, not a duplicated fact.`;

/* ─────────────────────────────────────────────────────────────────────────
   Row helpers
   ───────────────────────────────────────────────────────────────────────── */
// Extras are the power controls. A row with nothing on it shows only the two
// buttons that can change that (the shipped component already collapses cap /
// max / 0 behind the same idea); a locked row is passed no control at all.
const alloc = (v, extras = ["cap", "&ctdot;"]) => `<span class="allocMini">
  <button>&minus;</button><input value="${v}" readonly>
  <button>+</button>${extras.map(e => `<button>${e}</button>`).join("")}
</span>`;

const row = ({ cls = "", name, sub = "", gain = "", gainSub = "", allocHtml = "", stat, fill = null }) =>
  `<div class="row${cls ? " " + cls : ""}">
    <div class="rowName">${name}${sub ? `<span class="sub">${sub}</span>` : ""}</div>
    <div class="rowGain">${gain}${gainSub ? `<span class="sub">${gainSub}</span>` : ""}</div>
    ${allocHtml ? `<div class="rowAlloc">${allocHtml}</div>` : `<div class="rowAlloc"></div>`}
    <div class="rowStat">${stat}</div>
    ${fill === null ? "" : `<div class="rowBar"><div class="rowFill" style="width:${fill}%"></div></div>`}
  </div>`;

/* ─────────────────────────────────────────────────────────────────────────
   3. GRIND — data hoisted ABOVE the Boss section so the Boss mock's material
   specimen can render THE ACTUAL GRIND FRAGMENT rather than a lookalike.
   Grind is the honest test of a material language: no hero, no frame, no
   display type. If the language cannot make Grind look built, it is a
   boss-tab trick. Same array, same helper, same section — used twice.
   ───────────────────────────────────────────────────────────────────────── */
const ZONES = [
  ["Novice Meadow", "Training Slime", "12", "5", "10&ndash;30"],
  ["Webbed Ravine", "Ravine Weaver", "60", "20", "40&ndash;120"],
  ["Salt Flats", "Salt Strider", "250", "75", "150&ndash;450"],
  ["Cinder Steppe", "Steppe Charger", "700", "300", "600&ndash;1,800"],
  ["The Doorstep", "Door Sentry", "1,500", "2,250", "4,500&ndash;13,500"],
  ["The Threshold", "Threshold Husk", "5,000", "7,000", "13,500&ndash;40,500"],
  ["Ashen Nave", "Nave Revenant", "16,000", "21,000", "40,500&ndash;121,500"],
  ["Flooded Undercroft", "Undercroft Lurker", "52,000", "65,000", "121,500&ndash;364,500"],
  ["The Long Dark", "Pale Sentinel", "170,000", "200,000", "364,500&ndash;1,093,500"],
  ["The Second Door", "Sealed Warden", "550,000", "620,000", "1,093,500&ndash;3,280,500"],
  ["Frostbound Wastes", "Wastes Wight", "1,650,000", "1,860,000", "3,280,500&ndash;9,841,500"],
  ["The Sunken Archive", "Archive Colossus", "5,000,000", "5,600,000", "9,841,500&ndash;29,524,500"],
  ["Obsidian Reach", "Reach Devourer", "15,000,000", "17,000,000", "29,524,500&ndash;88,573,500"],
  ["The Hollow Spire", "Spire Revenant", "45,000,000", "50,000,000", "88,573,500&ndash;265,720,500"],
  ["World's Edge", "Edge Sentinel", "135,000,000", "150,000,000", "265,720,500&ndash;797,161,500"],
];
const zoneRow = (z, i) => {
  const [name, mob, hp, copper, ip] = z;
  // lane 4: the zone's IP range is the power band, and the band chip carries
  // the range itself — colour orders the list, the number states it.
  const common = { name, sub: `${mob} &middot; ${hp} HP`, gain: `${copper}c per kill`,
    gainSub: band(zoneBand(i), `IP ${ip}`) };
  if (i >= 10) return row({ ...common, cls: "locked", stat: "locked &middot; needs 4 doors open, you have 1" });
  if (i === 2) return row({ ...common, cls: "active", allocHtml: alloc(20),
    stat: "50 kills/s CAPPED &middot; 5,766c/s (&times;1.24) &middot; overkill &times;125.1", fill: 100 });
  if (i === 9) return row({ ...common, cls: "struggling", allocHtml: alloc(15),
    stat: "too weak to hold &mdash; 1,172,556 damage/s of the 1,700,000 this zone needs", fill: 0 });
  return row({ ...common, cls: "dormant", allocHtml: alloc(0, []), stat: "no bots here", fill: 0 });
};

// RELOCATED (Phase 2 table, Grind row): the Zones h3 sub taught the hold
// number, the 50 kills/s cap, the 1-in-400 drop chance and what an IP band is.
// All four are general mechanics, none of them change with state, and all four
// now live at Help -> Grind -> "Zones". The heading is bare; every per-row
// number the decision actually needs is untouched.
const zonesSection = `<section class="game">
  <h3>${g("Z")}Zones</h3>
  <div class="rowlist">${ZONES.map(zoneRow).join("")}</div>
</section>`;

/* ─────────────────────────────────────────────────────────────────────────
   1. BOSS
   ───────────────────────────────────────────────────────────────────────── */
// Block 1 of the JOURNEY spec, recomposed as the hero it is: the Warden IS the
// Boss window's title bar. Same two facts, same two strings, same owner, same
// first position — a name that renders at --fs-warden on the window's own
// name-plate is the SAME fact as a name that renders at caption size, so
// nothing moved between owners.
// The v2 gold lozenge (.ornRule) is GONE, not restyled: Art Deco ornament has
// no home in a Maple register, and the name-plate's own groove already closes
// the block.
const warden = `<div class="frame">
    <div class="bossPanel">
      ${g("M")}
      <div class="nameplate">
        <div id="bossName">Maren</div>
        <div id="bossTitle">Warden of the Second Door</div>
      </div>
    </div>
  </div>`;

const wallSelect = second => `<div class="wallLbl">Doors you've opened</div>
  <div class="wallScroll"><div id="wallSelect">
    <button class="wallBtn">W1 Vess &middot; farming</button>
    <button class="wallBtn active">W2 Maren &middot; ${second}</button>
  </div></div>`;

/* DELETED, Phase 3 — MATERIAL_SPECIMEN.
   It existed for one reason: to preview Grind's rowlist under the new
   carpentry BEFORE grind.html carried it. grind.html carries it now, which is
   this phase, so the specimen is a preview of a page you can open.

   It also had to go on two counts of its own. (a) Phase 2.5 correctly scoped
   `--acc` to `main.t-*` so the tab buttons could not silently set it — and the
   specimen was a `<div class="t-grind">`, not a `main`, so it inherited BOSS's
   accent while its own annotation claimed it proved "lane 3, Grind's accent".
   Doc and pixels disagreed one level down from the disagreement Phase 2.5 was
   fixing. (b) It rendered the whole Zones section a second time inside
   boss.html, which is a standing DW-3.4 exposure for a block that no longer
   earns it. Deleting is a smaller diff than inventing a scoping class to fix a
   preview of a page that now exists.

*/

const boss = page({
  title: "Boss", tab: "boss", v4: true,
  note: `Boss tab, recomposed against <b>DESIGN.md's Visual DNA v4</b> &mdash;
    v3's MapleStory construction taken to full weight, plus the amended colour
    rule. Not one string, fact owner or block position changed. <b>Construction:</b>
    the frame goes 3px&rarr;4px on a 2px bevel, every title bar carries four
    <b>corner rivets</b> (four background layers &mdash; a drawn mark, always
    four, always symmetric, always complete, because a missing one would read
    as damage and the server is fine) and a <b>gold letter-glyph plate</b>
    (one capital in the UI face on a shrunken control plate &mdash; <b>TYPE on a
    plate, not an icon</b>; there is no raster, path or generated art anywhere
    in this file and <code>build.mjs</code> asserts it), the title label steps
    to 16px and the Warden's name to 40px. <b>Colour:</b> this surface carries
    <b>exactly one</b> hue lane &mdash; <b>lane 2, the Warden</b>. Maren owns
    <code>--w2</code>; it sets her name, the window frame, the name-plate's
    closing groove, the active door chip and the arena's floor glow. Boss has
    no tab accent of its own because <b>its room is the door</b>. Gold did not
    leave, it changed job: it is now <b>the client's own voice</b> &mdash; the
    glyph plates, the Descend fill, the log's event lines. The arena is
    CANVAS-drawn, so block 3 is a labelled placeholder &mdash; deliberately not
    a fake arena; what it should DRAW <i>per Warden hue</i> is specced in
    DESIGN.md <code>## Canvas scene spec (v4)</code>.
    ${TWO_STATES} The second is <b>frontier broken</b>, the only state in which
    this tab's specced primary action, Descend, exists.`,
  body: `<section class="game">
  ${warden}

  ${wallSelect("fighting")}

    <div class="canvasStub">
      <div class="k">canvas region &mdash; not renderable in HTML</div>
      <div class="v">Boss HP bar draining as a proportion, <b>with no % label of
      its own</b> &mdash; the readout below owns that number (Phase 1's DUP 1,
      resolved here) &middot; hero and boss sprites with progressive damage
      cracks &middot; streaming crit-tier damage numbers (* / **) &middot; the
      BREACHED reveal when the wall falls. Reviewable only from a live capture
      (<b>npm run shots</b>).</div>
    </div>
    <div class="controls">
      <span id="depth">92.4%</span>
      <span class="caption">At this rate the door breaks in 323 days.</span>
    </div>
    <div id="projection" class="ledger">
      <span class="hd">Crits</span>
      <span class="k">Crit</span><span class="v">10%</span><span class="v">&times;2</span>
      <span class="k">Super crit</span><span class="v">20%</span><span class="v">&times;5</span>
      <span class="rule"></span>
      <span class="k sum">Average damage</span><span class="v sum wide">&times;1.16</span>
    </div>

  <div class="progress">
    <div class="caption">Combat Power 2,481,600/s &mdash; full breakdown on the
      Player tab</div>
  </div>

  <div id="dialogue">Maren: "You came through Vess's door. Few ever did. Fewer
    still came looking for the second."</div>
</section>

<div class="stateLabel">state &mdash; frontier broken (the only state with a Descend action)</div>
<section class="game">
  ${warden}

  ${wallSelect("farming")}

    <div class="controls">
      <span id="depth" class="breached">BREACHED</span>
      <span class="caption">Set pieces 1 of 7 &mdash; on the Player tab.</span>
    </div>
  <div class="progress">
    <div class="caption">The door stands open.</div>
    <button id="descendBtn">Descend to the next door &rarr;</button>
  </div>
</section>`,
});

/* ─────────────────────────────────────────────────────────────────────────
   2. TRAINING
   ───────────────────────────────────────────────────────────────────────── */
const atkTiers = [
  { name: "swing macro", gain: "+0.0005 ATK per fill", state: "active", alloc: 100,
    stat: "30,276 fills &middot; at the 50/s cap &mdash; more bots here do nothing, move them to another script", fill: 100 },
  { name: "combo macro", gain: "+0.005 ATK per fill", state: "dormant", alloc: 0,
    stat: "0 fills &middot; no bots on it", fill: 0 },
  { name: "cancel-weave script", gain: "+0.045 ATK per fill", state: "locked", stat: "locked &middot; 0 / 30,000 fills" },
  { name: "frame-perfect script", gain: "+0.35 ATK per fill", state: "locked", stat: "locked &middot; 0 / 90,000 fills" },
  { name: "packet-replay script", gain: "+2.8 ATK per fill", state: "locked", stat: "locked &middot; 0 / 270,000 fills" },
  { name: "netcode desync", gain: "+22 ATK per fill", state: "locked", stat: "locked &middot; 0 / 810,000 fills" },
  { name: "tick-rate exploit", gain: "+175 ATK per fill", state: "locked", stat: "locked &middot; 0 / 2,430,000 fills" },
];
const speedTiers = [
  { name: "autoclicker", gain: "+0.00001 hits/s per fill", state: "active", alloc: 60,
    stat: "12,160 fills &middot; 31.2 fills/s", fill: 62 },
  { name: "turbo clicker", gain: "+0.0001 hits/s per fill", state: "dormant", alloc: 0,
    stat: "0 fills &middot; no bots on it", fill: 0 },
  { name: "no-delay hack", gain: "+0.0009 hits/s per fill", state: "locked", stat: "locked &middot; 0 / 30,000 fills" },
  { name: "input injector", gain: "+0.007 hits/s per fill", state: "locked", stat: "locked &middot; 0 / 90,000 fills" },
  { name: "kernel clicker", gain: "+0.055 hits/s per fill", state: "locked", stat: "locked &middot; 0 / 270,000 fills" },
  { name: "hypervisor clock", gain: "+0.42 hits/s per fill", state: "locked", stat: "locked &middot; 0 / 810,000 fills" },
];
const tierRow = t => row({
  cls: t.state, name: t.name, gain: t.gain,
  allocHtml: t.state === "locked" ? "" : alloc(t.alloc, t.state === "dormant" ? [] : undefined),
  stat: t.stat, fill: t.state === "locked" ? null : t.fill,
});

const training = page({
  title: "Training", tab: "training", v4: true,
  note: `Training tab, recomposed against <b>DESIGN.md's Visual DNA v4</b> and cut
    to the <b>Phase 2 relocation table</b>. 9 of 13 script tiers are locked and not
    one of them draws an allocation control &mdash; the audit counted 21 inert
    clusters across this tab and Grind. The rig stats line keeps only the one fact
    the four rig buttons do not already carry: each button prints its lever's
    current value on the left of its own <code>&rarr;</code>.
    <b>Colour:</b> <b>one</b> Tier-B lane &mdash; lane 3, Training's accent
    (<code>--acc-training</code>, the script console), on chrome only: the window
    frames, the title-bar grooves, and the live row's edge and name. Nothing on
    this tab has a rarity or a power band.
    <b>Copy:</b> five relocations land here &mdash; the population bar's
    differentiation clause, the ATK sub, the SPEED sub, the Enhance squad sub and
    the Ban Wave teaching paragraph. Every heading is bare and every number,
    price, cap and state readout is untouched. <b>The unlock rule moved with the
    ATK sub</b>, so read the locked rows as the ladder alone: no edge, unlit, no
    control, and the word "locked" with its own condition. The two short flavor
    lines stay by the rule's own carve-out (<code>&mdash; the anti-cheat notices
    the farm</code>).`,
  body: `<section class="game">
  <h3>${g("R")}Rig</h3>
  ${/* Rig rows, matching the shipped client: the four buys are generated from
        bots.RIG there, so adding or removing one is a single registry entry.
        Rows rather than buttons because the effect used to be visible only as
        an aggregate below, and the spend has to be comparable ACROSS upgrades:
        what one rank of script version buys against one rank of overclock, at
        their prices. Same row grammar as the ladders, zones and duty board. */""}
  <div class="rowlist">
    ${[["multiclient", "248 slots", "+50 slots", 4, "119,647c", false],
       ["account creator", "240/h", "+30/h", 3, "12,069c", true],
       ["script version", "script &times;1.75", "+0.25 script", 5, "819c", true],
       ["overclock", "clock &times;1.80", "+0.20 clock", 4, "2,506c", true]]
      .map(([name, at, step, rank, cost, afford]) => `<div class="row">
      <span class="rowName">${name}<div class="sub">${at}</div></span>
      <span class="rowGain">${step}/rank</span>
      <span class="rowStat">rank ${rank}</span>
      <button${afford ? ` class="affordable"` : ""}>${cost}</button>
    </div>`).join("")}
  </div>
  <div class="sub">lost to bans 47</div>
  <div class="barTrack"><div class="barFill" style="width:93%"></div></div>
  ${/* RELOCATED (Phase 2 table, Training/#popFill row): only the differentiation
        clause moves — "this bar is every bot you own; the counter at the top of
        the screen is the ones not assigned to anything" is a general fact about
        two chrome elements, true whatever the numbers are. Help -> Training ->
        "Bot pool". The count itself is state and stays. */""}
  <div class="sub">231 of 248 slots filled</div>

  ${/* RELOCATED: the ATK sub (fill -> gain, the 50/s cap, the unlock rule) and
        the SPEED sub (same-as-ATK, the knee) merge into one Help topic, which
        is what the original "same as ATK" line already intended.
        Help -> Training -> "Scripts". */""}
  <h3>${g("A")}ATK scripts</h3>
  <div class="caption">+16.65 ATK trained so far &middot; +0.0275/s right now</div>
  <div class="rowlist">${atkTiers.map(tierRow).join("")}</div>

  <h3>${g("S")}SPEED scripts</h3>
  <div class="caption">+0.13 hits/s trained so far &middot; +0.00034/s right now</div>
  <div class="rowlist">${speedTiers.map(tierRow).join("")}</div>

  ${/* RELOCATED: Help -> Training -> "Enhance squad". The POINTER ("the odds and
        the fallout are on the Player tab") travels WITH the explanation rather
        than staying behind, because out of its teaching sentence it would be a
        bare cross-reference to nothing. */""}
  <h3>${g("E")}Enhance squad</h3>
  <div class="runControls">
    <span class="seg"><button>weapon</button><button class="active">armor</button><button>charm</button></span>
    <label>stop at + <input class="ipDial" value="15" readonly></label>
  </div>
  <div class="caption">one try every 9.4s &middot; 83,215c each</div>

  ${/* RELOCATED: the teaching paragraph (what resets, what survives, the root
        formula, the permanent +1%) -> Help -> Training -> "Ban Wave", folded in
        with the retired #helpModal's own two paragraphs. The flavor sub STAYS
        by the stays/moves rule's explicit carve-out: it names an event and
        explains nothing. The armed-state destructive confirm is untouched. */""}
  <h3>${g("B")}Ban Wave<span class="sub">&mdash; the anti-cheat notices the farm</span></h3>
  <div class="runControls">
    <span class="caption">+206 Scripts ready, from 42,436 training fills &middot; 0 Ban Waves so far</span>
  </div>
  <div class="ctaRow"><button class="cta">Ban Wave</button></div>
</section>`,
});

const grind = page({
  title: "Grind", tab: "grind", v4: true,
  note: `Grind tab under <b>DESIGN.md's Visual DNA v4</b> &mdash; and the surface
    where <b>lane 4, the power band</b>, is proved. All 15 zones, four states side
    by side: <b>Salt Flats</b> live and held, <b>The Second Door</b> live and
    failing (DESIGN.md's REQUIRED struggling state, which the shipped build still
    renders identically to locked), eight dormant zones, five locked zones with no
    controls at all.
    <b>Two hue lanes, which is the co-occurrence cap:</b> <b>lane 3</b> (Grind's
    accent &mdash; window frame, title-bar groove, the live row's edge and name)
    and <b>lane 4</b> (every zone's IP range in a filled heat chip, cold at z1,
    hot at z15). They cannot compete: the chip ground sits at <b>L* ~16.5</b>
    while the accent ink sits at <b>L* 59</b> &mdash; different luminance tiers,
    which is what separates them, not their hues. Every chip prints the IP range
    inside it, so the ordering survives with the colour removed.
    <b>The state ladder is the thing to check here</b> &mdash; live wears the
    ROOM's colour now instead of gold, and dormant / struggling / locked must
    still read apart at 375px. <code>--warn</code> still owns struggling alone.
    <b>Copy:</b> one relocation &mdash; the Zones sub (hold number, 50 kills/s
    cap, 1-in-400 drop chance, what an IP band is) is now Help &rarr; Grind.
    Every per-row number a bot-placement decision needs is still on the row.`,
  body: zonesSection,
});


/* ─────────────────────────────────────────────────────────────────────────
   4. PLAYER
   ───────────────────────────────────────────────────────────────────────── */
const PARTS = [
  ["Hinge", "atk", 4], ["Bolt", "atk", 4], ["Latch", "speed", 4], ["Keyward", "speed", 4],
  ["Lintel", "atk", 5], ["Threshold", "farm", 8], ["Frame", "atk", 5],
];
const SETS = [
  ["The First Door", 1.0, [0, 2, 5]], ["The Second Door", 1.6, []], ["The Third Door", 2.4, []],
  ["The Fourth Door", 3.4, []], ["The Fifth Door", 4.6, []], ["The Sixth Door", 6.0, []],
  ["The Seventh Door", 7.6, []], ["The Eighth Door", 9.4, []], ["The Ninth Door", 11.4, []],
  ["The Tenth Door", 13.6, []],
];
// A set you have started renders open. A set with nothing in it collapses to
// its own header — progressive disclosure, and the summary is the header copy
// Phase 5 already wrote, so nothing is invented and nothing is lost: the
// "what it would be worth" pip values are one tap away, not deleted.
const trophySet = ([name, mult, owned], i) => {
  const pips = PARTS.map(([part, lane, pct], p) => {
    const v = Math.max(1, Math.round(pct * mult));
    const has = owned.includes(p);
    return `<span class="pip${has ? " own" : ""}" title="${has ? "Recovered." :
      `Not recovered yet — farm ${i === 0 ? "Vess" : "that Warden"} for it.`}">${
      has ? "&check;" : "&#9672;"} ${part} +${v}% ${lane}</span>`;
  }).join("");
  if (owned.length) return `<div class="trophySet started">
    <div class="trophySetHead">
      <span class="trophySetName">${name}</span>
      <span class="trophySetProg">${owned.length}/7</span>
    </div>
    <div class="pips">${pips}</div>
  </div>`;
  return `<details class="trophySet dormant"${i === 1 ? " open" : ""}>
    <summary><span class="trophySetName">${name}</span>
      <span class="trophySetProg">0/7</span></summary>
    <div class="pips">${pips}</div>
  </details>`;
};

const AM_NAMES = {
  weapon: ["Rusty Shortsword", "Ravine Pike", "Salt-Etched Saber", "Cinder Warblade", "Sentry Halberd",
    "Threshold Cleaver", "Nave Censer", "Undercroft Trident", "Long Dark Reaver", "Second Door Greatblade",
    "Frost Reaver", "Archive Halberd", "Obsidian Cleaver", "Spire Lance", "World-Edge Blade"],
  armor: ["Padded Vest", "Weaver-Silk Jerkin", "Salt-Crusted Cuirass", "Cinder Scale Coat", "Sentry Plate",
    "Threshold Carapace", "Nave Vestments", "Undercroft Wrap", "Long Dark Shroud", "Second Door Bulwark",
    "Frost Carapace", "Archive Plate", "Obsidian Scale", "Spire Ward", "World-Edge Aegis"],
  charm: ["Cracked Bead", "Weaver-Eye Charm", "Salt Talisman", "Ember Sigil", "Door Sentry Sigil",
    "Threshold Bead", "Nave Reliquary", "Undercroft Pearl", "Pale Eye", "Sealed Sigil",
    "Frost Bead", "Archive Seal", "Obsidian Eye", "Spire Sigil", "World-Edge Star"],
};
const LANE = { weapon: "ATK", armor: "haste", charm: "copper" };
// rank map: "slot:zoneIndex" -> rank. entryPct = 0.25 x rank x (1 + 0.15 x (zone-1))
const RANKS = { "weapon:0": 4, "armor:0": 12, "charm:0": 2, "weapon:1": 3, "armor:1": 2,
  "weapon:2": 2, "armor:3": 1, "weapon:4": 1, "armor:4": 1, "weapon:5": 1 };
const amCell = (slot, zi) => {
  const rank = RANKS[`${slot}:${zi}`] || 0;
  const pct = (0.25 * rank * (1 + 0.15 * zi)).toFixed(2);
  const max = rank === 12;
  const cls = max ? "max" : rank === 0 ? "dormant" : "";
  return `<div class="amCell${cls ? " " + cls : ""}">
    <span class="amName">${AM_NAMES[slot][zi]}</span>
    <span class="amRank">R${rank}${max ? " &#10022;" : ""} &middot; +${pct}% ${LANE[slot]}</span>
    <div class="amBar"><span style="width:${max ? 100 : rank * 8}%"></span></div>
  </div>`;
};
// The Armory row is indexed by ZONE, not by rarity — a rank-7 entry has no
// rarity to carry, so lane 1 has no fact to attach to here and lane 4 does:
// the zone marker becomes the power band. (Deviation from the plan's "Armory
// cells" under lane 1, declared in the discovery file. Attaching rarity anyway
// would have invented meaning, which lane 1's own charter forbids.)
const armory = Array.from({ length: 15 }, (_, zi) => `<div class="amRow">
  <span class="amZone">${band(zoneBand(zi), `z${zi + 1}`)}</span>
  ${amCell("weapon", zi)}${amCell("armor", zi)}${amCell("charm", zi)}
</div>`).join("");

const player = page({
  title: "Player", tab: "player", skipChip: "cp", v4: true,
  note: `Player tab under <b>DESIGN.md's Visual DNA v4</b>, and the LIST-SURFACE
    stress test: no hero, no display type, three item plates + a stash + 70
    trophy pips + a 45-cell Armory. Block order and copy are unchanged from the
    Phase 2 spec &mdash; gear and stash first, trophies and armory at the tail,
    an un-started set collapsed to its own header.
    <b>Two hue lanes, which is the co-occurrence cap:</b> <b>lane 3</b> (Player's
    accent on chrome only &mdash; window frames, title-bar grooves, the started
    trophy set's edge, the ranked Armory cell's edge) and <b>lane 1</b> (rarity,
    on item objects only &mdash; each equipped item is now a raised <b>plate</b>
    tinted with its own tier, with a 4px edge and its name in the tier hue;
    stash rows, scrap pills and the drop logline take the same lane). They never
    share an element, which is what keeps them apart even though
    <code>--acc-player</code> sits 1&deg; from <code>--rar-rare</code> on the
    wheel &mdash; the accent is a third of rarity's chroma, and every item still
    prints its tier as a WORD. <b>Lane 4</b> appears only inside filled chips:
    every IP figure and every Armory zone marker. <b>An empty slot is a socket,
    not a plate</b> &mdash; the material carries that state.
    <b>The resource bar carries no Combat Power chip here</b> &mdash; the chrome
    echoes a headline only while you are not on the tab that owns it. Dormant
    pips and rank-0 Armory cells use <code>--faint</code> at full opacity, not
    an opacity multiplier: this is genuine readable text, so it holds AA.
    <code>--dim</code>/<code>--recede</code>/<code>--faint</code> are BANNED on
    a rarity plate (4.04&ndash;4.63:1 there) &mdash; the plates carry
    <code>--bone</code> and take their hierarchy from size and weight instead.
    <b>Copy, new in Phase 3:</b> the <b>six Player relocations</b> are applied
    here too, though this tab was built in Phase 2.5. Leaving them would have put
    the same six explanations on Player <i>and</i> on Help at once, which is the
    tutorial-in-a-HUD this plan exists to remove. Every heading is bare; the
    safeguard toggle keeps its own label, every enhance line keeps its cost,
    chance and fallout, every scrap price stays, and the failstack HUD stays
    because it is state.`,
  body: `<section class="game">
  ${/* RELOCATED (Phase 2 table, Player rows). Six subs leave this tab; the three
        self-labelling chips, every price, chance, fallout and count stay. */""}
  <h3>${g("C")}Combat Power</h3>
  <div class="chipGroup" id="powerBreakdown">
    <div class="chip"><div class="chipVal"><b>2,481,600</b></div><div class="chipLbl">combat power</div></div>
    <div class="chip"><div class="chipVal"><b>94,000.0</b></div><div class="chipLbl">ATK</div></div>
    <div class="chip"><div class="chipVal"><b>26.4</b></div><div class="chipLbl">hits/s</div></div>
  </div>

  <h3>${g("G")}Gear <span id="stacksHud">&middot; 6 failstacks, +6% on your next attempt</span></h3>
  <label class="toggleLine"><input type="checkbox"> safeguard &middot; 3&times; the
    copper, but a failure doesn't cost you a plus. Only works while the item is
    +5 to +14 &mdash; it can't protect a push past +15.</label>

  <div class="slot filled r-legendary">
    <span class="slotName">weapon</span>
    <div class="slotItem"><span class="rar-legendary">Sentry Halberd</span>
      <span class="itemMeta">&middot; Legendary &middot; IP ${band(3, "9,400")} +12 &middot; 36,660 ATK</span></div>
    <div class="affixList">
      <span class="affixItem">+752 ATK</span><span class="affixItem">+14% ATK</span>
      <span class="affixItem">+9% haste</span>
      <span class="affixItem">+0.9% ATK &mdash; 231 bots</span>
    </div>
    <div class="slotControls">
      <button>enhance</button>
      <span class="enhInfo">+12 &rarr; +13 &middot; 1,322,909c &middot; 15% &middot; a fail drops you to +10</span>
    </div>
    <div class="slotControls">
      <button>reforge</button>
      <span class="enhInfo">6 Legendary scrap per roll</span>
    </div>
  </div>

  <div class="slot filled r-rare">
    <span class="slotName">armor</span>
    <div class="slotItem"><span class="rar-rare">Sentry Plate</span>
      <span class="itemMeta">&middot; Rare &middot; IP ${band(3, "6,200")} +7 &middot; 13,708 ATK</span></div>
    <div class="affixList">
      <span class="affixItem">+2.4 hits/s</span><span class="affixItem">+11% haste</span>
    </div>
    <div class="slotControls">
      <button>enhance</button>
      <span class="enhInfo">+7 &rarr; +8 &middot; 83,215c &middot; 35% &middot; a fail drops you back to +6</span>
    </div>
    <div class="slotControls">
      <button>reforge</button>
      <span class="enhInfo">not enough Rare scrap &mdash; you need 6, salvage Rare items to get it</span>
    </div>
  </div>

  <div class="slot">
    <span class="slotName">charm</span>
    <div class="slotItem muted">empty &mdash; equip something from the Stash below</div>
    <div class="slotControls">
      <button disabled>enhance</button>
      <span class="enhInfo">equip an item to enhance it</span>
    </div>
  </div>

  ${/* RELOCATED: the Reforge teaching line -> Help -> Player -> "Reforge". Each
        slot's own Reforge button and its scrap price stay put. */""}

  <h3>${g("S")}Stash</h3>
  <div class="scrapWallet">
    <span class="scrapPill r-common">124 Common</span>
    <span class="scrapPill r-rare">38 Rare</span>
    <span class="scrapPill r-epic">9 Epic</span>
  </div>
  <label class="toggleLine"><input type="checkbox" checked> auto-equip a drop when
    it beats what's in the slot &mdash; the old item goes to the stash</label>
  <div class="filterRow">
    <label class="filterLabel"><input type="checkbox" checked> auto-salvage drops
      below both floors &mdash; keep anything</label>
    <select><option>Rare</option></select>
    <span class="filterLabel">or better AND at least</span>
    <input class="ipDial" value="0" readonly>
    <span class="filterLabel">IP; everything else becomes scrap</span>
  </div>
  <div class="filterRow">
    <button>stash (12/50)</button>
    <span class="filterLabel">salvage every unlocked stash item at or below both &mdash;</span>
    <select><option>Common</option></select>
    <span class="filterLabel">or worse AND</span>
    <input class="ipDial" value="0" readonly>
    <span class="filterLabel">IP or less. Leave IP at 0 to ignore it.</span>
    <button>Salvage matching items</button>
  </div>
  <div id="stashList">
    <div class="stashRow upgrade r-epic">
      <span class="sMark">&#9650;</span>
      <span class="sName rar-epic">Threshold Cleaver</span>
      <span class="sAct"><button>equip</button><button>lock</button><button>salvage +6</button></span>
      <span class="sInfo">weapon &middot; IP ${band(5, "28,400")} +0 &middot; +2,272 ATK &middot; +16% ATK &middot; +5% crit rate</span>
    </div>
    <div class="stashRow locked-item r-rare">
      <span class="sMark">L</span>
      <span class="sName rar-rare">Cinder Scale Coat</span>
      <span class="sAct"><button>equip</button><button>unlock</button><button>salvage +3</button></span>
      <span class="sInfo">armor &middot; IP ${band(2, "1,450")} +0 &middot; +6% haste &middot; +0.5 hits/s</span>
    </div>
    <div class="stashRow r-common">
      <span class="sMark"></span>
      <span class="sName rar-common">Salt Talisman</span>
      <span class="sAct"><button>equip</button><button>lock</button><button>salvage +1</button></span>
      <span class="sInfo">charm &middot; IP ${band(1, "300")} +0 &middot; no affixes &mdash; Common items roll none</span>
    </div>
    <div class="stashRow r-origin">
      <span class="sMark"></span>
      <span class="sName rar-origin">World-Edge Blade</span>
      <span class="sAct"><button>equip</button><button>lock</button><button>salvage +13</button></span>
      <span class="sInfo">weapon &middot; IP ${band(5, "94,000")} +0 &middot; six affixes &mdash; Origin rolls the most there are</span>
    </div>
    <div class="stashRow r-mythic">
      <span class="sMark"></span>
      <span class="sName rar-mythic">Spire Ward</span>
      <span class="sAct"><button>equip</button><button>lock</button><button>salvage +9</button></span>
      <span class="sInfo">armor &middot; IP ${band(4, "41,200")} +0 &middot; +18% haste &middot; +2.1 hits/s &middot; +7% boss damage</span>
    </div>
    <div class="sub">&hellip;and 7 more (salvage to clear)</div>
  </div>

  <h3>${g("T")}Trophies <span class="caption">0/10 sets complete</span></h3>
  ${SETS.map(trophySet).join("")}

  <h3>${g("A")}Armory</h3>
  <div class="caption">rank 29 across 10 entries &middot; +3.35% ATK &middot;
    +4.34% haste &middot; +0.50% copper</div>
  <div class="amScroll"><div id="armoryGrid">${armory}</div></div>
</section>`,
});

/* ─────────────────────────────────────────────────────────────────────────
   5. DELVE
   ───────────────────────────────────────────────────────────────────────── */
const TREE = [
  ["deeper bore", "+1 depth per rank", "rank 3", "Buy &middot; 160 Cache"],
  ["cache sifter", "+20% Cache per second per rank", "rank 4 &middot; &times;1.80 Cache/s now", "Buy &middot; 157 Cache"],
  ["recovered overclock", "+3% ATK per rank", "rank 4 &middot; &times;1.12 ATK now", "Buy &middot; 251 Cache"],
  ["salvage beacon", "+4% chance of a gear drop per rank", "rank 2 &middot; &times;1.08 drops now", "Buy &middot; 144 Cache"],
  ["buried scripts", "+5% ATK and hits per training fill, per rank", "rank 2 &middot; &times;1.10 now", "Buy &middot; 72 Cache"],
];
const delve = page({
  title: "Delve", tab: "delve", v4: true,
  note: `Delve tab under <b>DESIGN.md's Visual DNA v4</b>. The audit named this the
    structural model the others should follow, so nothing is reordered. Two things
    carried from Phase 5 stay: every buy button carries the verb (G5 was a bare
    price stretched across the row) and every rank readout prints the multiplier
    actually folded into Combat Power, not just its per-rank gain.
    <b>Colour:</b> <b>one</b> Tier-B lane &mdash; lane 3, Delve's accent
    (<code>--acc-delve</code>, the descent), on chrome only. A Cache-tree row
    deliberately takes <b>no</b> live edge: a purchase is not an allocation, so an
    accent edge would mark every row and discriminate nothing. Affordability is
    the button's own job.
    <b>Copy:</b> two relocations &mdash; the Delve sub (the depth formula, the
    Cache-per-floor rate) and the Cache tree sub (prices rise per rank) are now
    Help &rarr; Delve. The live depth, deepest-ever, Cache/s and balance stay.`,
  body: `<section class="game">
  ${/* RELOCATED: Help -> Delve -> "How depth works" and "Cache tree". */""}
  <h3>${g("D")}Delve</h3>
  <div id="delveState">depth <b>27</b> &middot; deepest ever 27 &middot; <b>2,974</b> Cache/s</div>
  <div id="delveCache"><b>8,420</b> Cache banked</div>

  <h3>${g("C")}Cache tree</h3>
  <div class="rowlist">
    ${/* No .active edge here: a Cache-tree row is a purchase, not an allocation,
          so the gold edge would mark every row and discriminate nothing. The
          affordability signal is the button. */""}
    ${TREE.map(([name, gain, rank, buy]) => row({
      name, gain, stat: rank,
      allocHtml: `<button class="affordable">${buy}</button>`,
    })).join("")}
  </div>
</section>`,
});

/* ─────────────────────────────────────────────────────────────────────────
   6. DUNGEON — idle and in-progress, which differ structurally
   ───────────────────────────────────────────────────────────────────────── */
const dutyRows = running => [
  { name: "Sunder", sub: "&minus;12% damage every floor it's unblocked", gain: "needs 3 bots",
    cls: "active", alloc: 3, stat: running ? "2 still alive &mdash; blocked" : "3 assigned &mdash; blocked" },
  { name: "Mass Dispel", sub: "&minus;10% damage every floor it's unblocked", gain: "needs 3 bots",
    cls: "struggling", alloc: 2, stat: running ? "1 still alive &mdash; NOT BLOCKED" : "2 assigned &mdash; NOT BLOCKED" },
  { name: "Summon Adds", sub: "&minus;15% damage every floor it's unblocked",
    gain: "needs script version 5 &mdash; buy it on the Training tab",
    cls: "locked", stat: "0 assigned" },
].map(d => row({
  cls: d.cls, name: d.name, sub: d.sub, gain: d.gain,
  allocHtml: d.cls === "locked" ? "" : alloc(d.alloc, ["max", "0"]),
  stat: d.stat,
})).join("");

/* RELOCATED, WHOLE BLOCK: `How it works` is gone from the live tab. Its own
   register row said its sole job was general teaching — "nothing else mentions
   floors or the wipe rule" — so there is nothing left after the teaching is
   cut. It is now Help -> Dungeon -> "How a run works", verbatim. */

// RELOCATED (Boss abilities): only the flavor OPENER stays, by the stays/moves
// rule's short-flavor carve-out. It names the situation and explains no
// mechanic. How discovery works and that it survives a Ban Wave are now
// Help -> Dungeon -> "Boss abilities journal".
const journal = `<h3>${g("B")}Boss abilities<span class="sub">&mdash; there's no
  wiki and nobody to ask.</span></h3>
<div class="rowlist">
  ${row({ cls: "active", name: "Sunder", stat: "met and blocked" })}
  ${row({ name: "Mass Dispel", stat: "met on a run, never blocked" })}
  ${row({ cls: "dormant", name: "Summon Adds", stat: "Unknown &mdash; you haven't met this one yet" })}
</div>`;

const dungeon = page({
  title: "Dungeon", tab: "dungeon", v4: true,
  note: `Dungeon tab under <b>DESIGN.md's Visual DNA v4</b>. ${TWO_STATES}
    <b>Colour:</b> <b>one</b> Tier-B lane &mdash; lane 3, Dungeon's accent
    (<code>--acc-dungeon</code>, the difficulty ladder). It is the accent that
    sits nearest <code>--warn</code> on the wheel, and this is the surface where
    that has to be checked: <b>Sunder</b> is live (accent edge, accent name) and
    <b>Mass Dispel</b> is struggling (<code>--warn</code> edge, <code>--warn</code>
    stat) two rows apart. They must not read as the same statement.
    <b>Copy:</b> five relocations, seven cut sites &mdash; the <b>whole</b>
    <code>How it works</code> block is gone (its own register row said its only
    job was general teaching, so nothing remains once the teaching is cut), the
    <code>Assign bots</code> sub and the pull-out-floor helper are cut from
    <b>both</b> states, the difficulty helper is cut, and <code>Boss
    abilities</code> keeps only its flavor opener. What stays is every number the
    decision needs: each duty's own <code>&minus;N% damage every floor it's
    unblocked</code>, the needed-bot count, the assigned/blocked state, both
    input values, the proxy toggle's own price, and the live projections.`,
  body: `<div class="stateLabel">state &mdash; idle</div>
<section class="game">
  <h3>${g("D")}Dungeon</h3>
  <div id="instState">At difficulty <b>6</b>: 3 abilities to block, 3 bots needed
    on each. Deepest floor so far: 12.</div>
  <div class="caption">Sending 5 bots. They should reach about floor 6 before too
    many are banned.</div>

  ${/* RELOCATED: Help -> Dungeon -> "Assigning bots". Cut from BOTH states. */""}
  <h3>${g("A")}Assign bots</h3>
  <div class="rowlist">${dutyRows(false)}</div>

  <div class="runPanel">
    <div class="runControls">
      <label>Difficulty <input class="ipDial" value="6" readonly></label>
      <label>Pull out at floor <input class="ipDial" value="9" readonly></label>
    </div>
    ${/* RELOCATED: the difficulty helper -> Help -> Dungeon -> "Difficulty",
          and the pull-out-floor helper -> Help -> Dungeon -> "Pull-out floor".
          Both are general rules about a setting, true whatever it is set to.
          The labels and the live values stay. */""}
    <label class="toggleLine"><input type="checkbox" checked> Buy proxies &middot;
      250c per run, 25% fewer bots banned</label>
    <div class="ctaRow"><button class="cta">Send bots in</button></div>
  </div>

  ${journal}
</section>

<div class="stateLabel">state &mdash; in progress</div>
<section class="game">
  <h3>${g("D")}Dungeon</h3>
  <div id="instState">Floor <b>7</b> &middot; 14 items so far &middot; dealing
    <b>53%</b> damage.</div>
  <div class="caption">3 bots still alive &middot; about 21% of them get banned on
    the next floor.</div>

  <h3>${g("A")}Assign bots</h3>
  <div class="rowlist">${dutyRows(true)}</div>

  <div class="runPanel">
    <div class="runControls">
      <label>Difficulty <input class="ipDial" value="6" readonly disabled></label>
      <label>Pull out at floor <input class="ipDial" value="9" readonly></label>
    </div>
    <div class="ctaRow"><button class="cta">Pull out now &mdash; keep all 14 items</button></div>
  </div>
</section>`,
});

/* ─────────────────────────────────────────────────────────────────────────
   7. HELP — a NEW surface. internal/JOURNEY.md "### Help" is the spec; every
   string below is that spec's Final-copy column, verbatim, and this is where
   all 22 relocated explanations land.

   Construction: six windows, one per room, in TAB-BAR ORDER — the spec's own
   Jakob's-law argument, so "where do I find X" carries over from a mental
   model the player already has. An h3 IS a title bar in this DNA, so topics
   cannot also be h3s (six sections x five topics = thirty title bars, which is
   "everything equally prominent"). They are one level down instead: a small
   uppercase h4 behind a 2px accent edge.
   ───────────────────────────────────────────────────────────────────────── */
const topic = (name, ...paras) => `<div class="topic"><h4>${name}</h4>${
  paras.map(p => `<p>${p}</p>`).join("")}</div>`;

const helpRoom = (glyph, room, topics) => `<section class="game">
  <h3>${g(glyph)}${room}</h3>
  ${topics}
</section>`;

// A gated block renders its milestone string and nothing else — the same "no
// spoilers" rule the tab bar itself follows, and the string is reused verbatim
// from the tab button `title` that already ships (main.js:241-245).
const helpLocked = (glyph, room, msg) => `<section class="game locked">
  <h3>${g(glyph)}${room}</h3>
  <p class="lockMsg">${msg}</p>
</section>`;

const help = page({
  title: "Help", tab: "help", v4: true,
  note: `<b>Help &mdash; a NEW surface</b>, built from
    <code>internal/JOURNEY.md</code>'s Phase 2 page spec. This is where the
    <b>22 relocated explanations</b> land: every general "how X works" rule the
    six live tabs used to print beside the number it was already displaying.
    Reference only &mdash; <b>no action resolves here</b>, so there is no
    primary action and no control that changes state.
    <b>Six blocks in tab-bar order</b>, which is the spec's own Jakob's-law
    argument: the mental model for "where do I find X" carries over unchanged.
    Each block is a <b>window</b> with the room's name on its <b>title bar</b>
    and its <b>gold letter-glyph plate</b>; topics inside are one level down
    (a small uppercase label behind a 2px accent edge) because an
    <code>h3</code> <i>is</i> a title bar in this DNA and thirty of them would
    be no hierarchy at all.
    <b>Colour:</b> <b>one</b> Tier-B lane &mdash; lane 3, Help's accent
    (<code>--acc-help</code>, the manual, paper). Nothing here has a rarity, a
    Warden or a power band.
    <b>One deviation from the spec's verbatim copy, declared:</b> the
    <b>Difficulty</b> topic drops its closing sentence &mdash; the one restating
    what a wipe pays out &mdash; because <b>How a run works</b>, three topics
    above it, already owns the wipe rule.
    On the live Dungeon tab those two strings sat in different blocks; landing
    them both on one page made the duplication adjacent, and one fact keeps one
    owner.
    ${TWO_STATES} The second is a <b>gated</b> block: the ladder without an
    opacity multiplier &mdash; unlit material, <code>--faint</code> type, no
    topics at all, and the milestone string reused verbatim from the tab
    button's own <code>title</code>. Genuine readable text keeps full opacity so
    it holds AA. Below that, the <b>General</b> channel of the chat window,
    which is the state you cannot see while System has traffic.`,
  body: `${helpRoom("B", "Boss", [
    topic("Crits", `Every hit has a chance to crit for extra damage, and a crit
      has its own chance to crit again &mdash; a super-crit &mdash; for even
      more. The Boss tab's Average row is what your damage actually multiplies
      by once both chances are folded in.`),
    topic("Farming a cleared door", `Once a door is open, farming it rolls for
      the rest of that Warden's trophy set every 30 seconds &mdash; each roll a
      25% chance to drop the next piece.`),
  ].join(""))}

${helpRoom("T", "Training", [
    topic("Bot pool", `The population bar is every bot you own, filled or not.
      The counter at the top of the screen is only the ones not assigned to any
      job.`),
    topic("Scripts", `Put bots on a script to run it. Every fill it completes
      adds its stat &mdash; ATK or hits per second &mdash; permanently. Any one
      script tops out at 50 fills per second; the next script down unlocks once
      the one above it has enough fills. Speed has one more rule: past a
      threshold that rises with each deeper Warden, extra hits per second still
      count, just less.`),
    topic("Enhance squad", `Bots that keep pressing enhance on one item for you.
      Same odds and the same copper cost as doing it yourself &mdash; they just
      never stop. The odds and the fallout are on the Player tab.`),
    topic("Ban Wave",
      `Banking a Ban Wave resets your bots, your training and your copper to the
       start. Everything your character owns stays: gear, plusses, scrap,
       trophies, Armory ranks, titles and door progress. In exchange you bank
       &radic;(training fills) as Scripts, and every Script permanently adds +1%
       damage. Scripts never reset.`,
      `Bank when the payout is worth the reset. Scripts are the square root of
       your training fills, so pushing twice as long pays well under twice the
       Scripts.`,
      `Your bots borrow your power &mdash; each one hits at 10% of your ATK and
       10% of your hits per second. So more damage means a faster farm too, and
       every Ban Wave rebuilds quicker than the one before.`),
  ].join(""))}

${helpRoom("G", "Grind", [
    topic("Zones", `Put bots on a zone. Their combined damage has to clear the
      zone's hold number or they earn nothing at all. A zone they can hold kills
      up to 50 mobs a second; every kill pays copper and has a 1-in-400 chance
      to drop a piece of gear. IP is the power band those drops roll in &mdash;
      deeper zones drop higher.`),
  ].join(""))}

${helpRoom("P", "Player", [
    topic("Combat Power", `Your damage per second against the door: ATK
      multiplied by hits per second. "Haste" anywhere on the Player tab is a
      percentage added to hits per second.`),
    topic("Enhance", `Three slots. Enhancing raises an item's plus, and every
      plus multiplies its base power by 1.12. A failed attempt anywhere banks a
      failstack worth +1 percentage point on your next attempt, up to +15; a
      success spends the whole bank.`),
    topic("Reforge", `Reforge rerolls an item's affixes for scrap of its own
      rarity. It can't change the rarity or the IP &mdash; only which affixes it
      has and what they roll. You see the result before you decide whether to
      keep it.`),
    topic("Stash", `Where kept drops land, up to 50. An item's rarity is how
      many affixes it rolled (Common 0, Origin 6) and its IP is how strong those
      affixes roll. Salvaging turns an item into scrap of its own rarity.
      Locking one protects it from auto-salvage, the bulk sweep and the
      stash-full clear-out.`),
    topic("Trophies", `Each Warden has a 7-piece set. Breaking its door gives
      you the first piece; the rest come from farming that Warden on the Boss
      tab. A complete set multiplies your damage by 1.5.`),
    topic("Armory", `Every drop is logged here against its own entry, one per
      item name, whether you keep it or scrap it. Rarer copies count for more: a
      Common is worth 1 point, an Origin 13. The first rank costs 3 points and
      each rank after costs 60% more, up to rank 12. Weapons rank ATK, armor
      ranks haste, charms rank copper &mdash; and the ranks survive every Ban
      Wave.`),
  ].join(""))}

${helpRoom("D", "Delve", [
    topic("How depth works", `Your character digs on their own down here, no
      input needed. Depth is however deep your Combat Power clears: floor 1
      needs 10 damage per second and each floor after needs 70% more. Every
      extra floor pays 35% more Cache per second, and Cache is the buried server
      data you spend below.`),
    topic("Cache tree", `Each row buys one rank. Every rank you buy raises that
      row's next price.`),
  ].join(""))}

${helpRoom("D", "Dungeon", [
    topic("How a run works", `Your bots fight down through the floors on their
      own, and each floor takes longer than the last. Some of them get banned on
      every floor, faster the deeper they go. When too many abilities go
      unblocked, the party dies. If they die you keep 40% of what they found.
      Pull out early and you keep all of it.`),
    topic("Assigning bots", `Each ability needs a set number of bots on it to be
      blocked. An ability you leave unblocked cuts your damage every floor it
      fires, and when your damage falls below 25% of normal the party dies. Bots
      you send are spent &mdash; you get back whoever survives.`),
    // DEVIATION, declared in the mock note and the discovery file: JOURNEY's
    // verbatim copy ends this topic with "If the party dies you keep 40% of
    // what they found" — the sentence "How a run works" already owns three
    // topics up. One fact, one owner.
    topic("Difficulty", `Higher difficulty means more abilities to block, more
      bots on each, better loot &mdash; and bots banned faster. You set it; it
      never drops on its own.`),
    topic("Pull-out floor", `Your bots come home with everything the moment they
      clear the floor you set here. You can change it mid-run.`),
    topic("Boss abilities journal", `You find out what an ability does by
      running into it. What you learn here is permanent: it survives a Ban
      Wave.`),
  ].join(""))}

<div class="stateLabel">state &mdash; gated (a block whose tab has not unlocked yet)</div>
${helpLocked("P", "Player", "Unlocks when your bots find their first piece of gear.")}
${helpLocked("D", "Delve", "Unlocks at 100 Combat Power.")}
${helpLocked("D", "Dungeon", "Unlocks once you have 10 bots.")}`,
  // Help's own chat opens on General rather than rendering a second window
  // below the page's: one #online, one set of ids, and the empty state is
  // demonstrated by the live chrome instead of by a copy of it.
  chatChannel: "general",
  ladderExtra: `<div class="stateLabel">state &mdash; the chat window's General
    channel (empty; System is the state every other mock renders). This page's
    own chat window, below, is the specimen &mdash; it opens on General.</div>
  <div class="mockNote"><b>The empty state is the point.</b> System carries
    drops, kills and offline gains; General has nobody in it. It has to read
    <b>quiet</b>, not <b>broken</b> &mdash; so the window around it is intact
    and lit, the channel plate is plainly selectable, and the copy states the
    fact without narrating the silence. A sentence <i>about</i> the emptiness
    would be the decay register coming back as prose, and the whole reason the
    shell prompt had to go is that it faked this feeling instead of earning
    it.</div>`,
});

/* ─────────────────────────────────────────────────────────────────────────
   Emit + check
   ───────────────────────────────────────────────────────────────────────── */
/* DW-3.9's EVIDENCE, kept rather than deleted. The user's call was "render it
   both ways and judge on the rendered surfaces"; this is the treatment that
   LOST, preserved so the decision can be re-checked instead of taken on
   trust. One token differs from grind.html — --font-data back to monospace —
   and nothing else. Grind is the right specimen: 15 rows, four states, numeric
   columns, no hero. A specimen, not an eighth surface, like
   tabrow-specimen.html before it. */
const grindMono = page({
  title: "Grind (monospace specimen)", tab: "grind", v4: true,
  fontOverride: "\n  --font-data:monospace;",
  note: `<b>SPECIMEN, not a surface &mdash; and the treatment that was
    REJECTED.</b> This is <code>grind.html</code>'s body with exactly one token
    changed back: <code>--font-data</code> returns to <code>monospace</code>.
    Everything else is byte-identical. It exists so DW-3.9's decision can be
    re-checked on pixels instead of taken on trust &mdash; compare against
    <code>shots/grind-375.png</code>. Three things decided it: the "botter's
    toolkit" register is a <b>naming</b> register and survives the font change
    intact; column alignment does not need mono, because
    <code>font-variant-numeric:tabular-nums</code> is already on
    <code>body</code> and holds in the UI face on both genuinely tabular blocks;
    and this page is <b>6,438px</b> tall at 375px against the UI face's
    <b>5,734px</b>, with the live row's stat line wrapping where the other does
    not. Reasoning in full: DESIGN.md <code>## The data face (v4, Phase 3)</code>.`,
  body: zonesSection,
});

const FILES = { boss, training, grind, player, delve, dungeon, help,
  "grind-mono": grindMono };
mkdirSync(OUT, { recursive: true });

let failed = 0;
for (const [name, html] of Object.entries(FILES)) {
  const path = join(OUT, `${name}.html`);
  writeFileSync(path, html);

  // DW-6.2: every declaration that actually styles something — the <style>
  // block plus every inline style="" attribute — minus the :root token block,
  // minus CSS comments, minus the @media preludes (a breakpoint is a viewport
  // threshold, not a spacing value; DESIGN.md scopes it to a tier it did not
  // build). Anything raw left in there is a real token leak.
  const styled = [
    (html.match(/<style>([\s\S]*?)<\/style>/) || ["", ""])[1]
      .replace(/:root\{[\s\S]*?\n\}/, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/@media[^{]*\{/g, "{"),
    ...(html.match(/style="[^"]*"/g) || []),
  ].join("\n");
  const hex = styled.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const rgb = styled.match(/rgba?\(/g) || [];
  const px = styled.match(/\b\d+(\.\d+)?px\b/g) || [];

  // DW-6.1: self-contained — nothing anywhere in the file may reach outside it.
  const ext = html.replace(/<!--[\s\S]*?-->/g, "")
    .match(/(<link\b|<script\b|\ssrc=|url\(|@import|https?:\/\/)/g) || [];

  const problems = [
    hex.length && `hex outside :root: ${[...new Set(hex)].join(", ")}`,
    rgb.length && `rgb()/rgba() outside :root: ${rgb.length}`,
    px.length && `untokenized px: ${[...new Set(px)].join(", ")}`,
    ext.length && `external reference: ${[...new Set(ext)].join(", ")}`,
  ].filter(Boolean);

  if (problems.length) { failed++; console.log(`FAIL ${name}.html\n  ${problems.join("\n  ")}`); }
  else console.log(`ok   ${name}.html  (${(html.length / 1024).toFixed(1)}kB, no hex / no rgb / no raw px / no external refs)`);
}

console.log(failed ? `\nDW-3.2: ${failed} file(s) FAILED`
  : `\nDW-3.1 + DW-3.2: all ${Object.keys(FILES).length} files pass`);
process.exit(failed ? 1 : 0);
