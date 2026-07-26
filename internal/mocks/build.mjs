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
  --logline:#598368;
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
   VISUAL DNA v2 tokens — internal/DESIGN.md "## Visual DNA v2".
   Injected INTO the same :root block (a second :root would slip past the
   assertion's strip regex), and only on the surface Phase 1 recomposes.
   ───────────────────────────────────────────────────────────────────────── */
const TOKENS_V2 = `
  /* ── v2 material: three elevations, built not coloured ── */
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
  /* ── v2 display type: two steps ABOVE the existing --fs-hero (26px) ── */
  --fs-warden:36px;       /* the Warden's name — the identity, 1.38x over hero */
  --fs-colossal:52px;     /* the once-per-screen peak; the same 52px battle.js
                             already draws the BREACHED reveal at, so DOM and
                             canvas finally agree where the peak is */
  /* ── v2 display-tier spacing: the scale had nothing above 16px, which is why
        every block read as one texture. Append-only, same derivation rule ── */
  --space-9:24px; --space-10:32px;`;

const TOKENS_END = `
}`;

/* The one breakpoint. DESIGN.md names 560px as a real value belonging to a
   responsive tier it was not asked to build; reused, not invented. CSS cannot
   read a custom property in a media prelude, so the literal lives there. */
const BP = "@media (min-width:561px)";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--dim);font-family:Georgia,serif;
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
.chipVal{font-family:monospace;font-size:var(--fs-display);color:var(--chip-value)}
.chipVal b{color:var(--chip-value-emphasis)}
.chipLbl{font-size:var(--fs-micro);font-family:monospace;letter-spacing:.12em;
  color:var(--chip-label);text-transform:uppercase;margin-top:var(--chip-lbl-nudge)}
.copper,.copper b{color:var(--copper)}
.helpBtn{background:none;border:var(--border-hairline) solid var(--line);
  color:var(--dim);font-family:monospace;font-size:var(--fs-body);
  width:var(--touch-min);height:var(--touch-min);margin-left:auto}

/* ── tab nav. Six fixed destinations, all visible: wraps 3+3 on a phone
      rather than scrolling. The audit's 414px overflow was this row. ── */
#tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);
  margin-bottom:var(--space-6)}
#tabs button{background:var(--panel);border:var(--border-hairline) solid var(--line);
  color:var(--tab-idle);font-family:Georgia,serif;font-variant:small-caps;
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
.sub{color:var(--recede);font-size:var(--fs-label);font-family:monospace;
  font-style:italic;letter-spacing:0;text-transform:none;font-variant:normal;
  line-height:1.6;display:block;margin-top:var(--space-2)}
.rowName .sub{margin-top:0}

/* ── buttons ── */
button{background:var(--field);color:var(--bone);
  border:var(--border-hairline) solid var(--line);font-family:monospace;
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
  font-family:monospace;font-size:var(--fs-small);position:relative}
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
  border:var(--border-hairline) solid var(--line);font-family:monospace;
  padding:var(--alloc-input-pad);font-size:var(--fs-small);text-align:center}

/* ── Boss ── */
.bossPanel{text-align:center;margin:var(--space-6) 0 var(--space-4)}
#bossName{color:var(--gold);font-size:var(--fs-masthead);font-variant:small-caps}
#bossTitle{font-size:var(--fs-small);font-style:italic}
.wallLbl{font-family:monospace;font-size:var(--fs-label);color:var(--recede);
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
.canvasStub .k{font-family:monospace;font-size:var(--fs-label);color:var(--recede);
  letter-spacing:.12em;text-transform:uppercase}
.canvasStub .v{font-family:monospace;font-size:var(--fs-small);color:var(--faint);
  max-width:44ch;line-height:1.6}
.controls{display:flex;align-items:baseline;flex-wrap:wrap;
  gap:var(--space-3) var(--space-7);margin:var(--arena-controls-margin)}
#depth{color:var(--gold);font-size:var(--fs-hero);font-family:monospace}
.caption{font-family:monospace;font-size:var(--fs-small);color:var(--recede);
  line-height:1.6}
#projection{color:var(--gold)}
.progress{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);
  margin:var(--space-6) 0}
#monument{border:var(--border-hairline) solid var(--gold);color:var(--gold);
  text-align:center;font-variant:small-caps;letter-spacing:.12em;
  padding:var(--space-5);width:100%}
#descendBtn{display:block;width:100%;background:var(--panel);
  border:var(--border-hairline) solid var(--gold);color:var(--gold);
  font-family:Georgia,serif;font-variant:small-caps;letter-spacing:.1em;
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
.slotItem{font-size:var(--fs-small);font-family:monospace;color:var(--bone)}
.itemMeta{color:var(--dim)}
.affixList{display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-7);
  margin-top:var(--space-2)}
.affixItem{font-size:var(--fs-small);font-family:monospace;color:var(--dim)}
.muted{color:var(--faint);font-style:italic}
.enhInfo{font-size:var(--fs-label);font-family:monospace;color:var(--recede);
  line-height:1.6}
.slotControls{display:flex;flex-wrap:wrap;gap:var(--space-3) var(--space-7);
  margin-top:var(--space-3);align-items:center}
.toggleLine{font-size:var(--fs-small);font-family:monospace;color:var(--dim);
  display:block;margin:var(--space-4) 0;line-height:1.6}
.filterRow{display:flex;flex-wrap:wrap;align-items:center;
  gap:var(--space-3) var(--space-5);margin-bottom:var(--space-3)}
.filterLabel{font-size:var(--fs-small);color:var(--dim);font-family:monospace}
.ipDial{width:var(--ip-dial);min-height:var(--touch-min);background:var(--field);
  color:var(--gold);border:var(--border-hairline) solid var(--line);
  font-family:monospace;padding:var(--alloc-input-pad);font-size:var(--fs-small)}
select{min-height:var(--touch-min);background:var(--field);color:var(--bone);
  border:var(--border-hairline) solid var(--line);font-family:monospace;
  font-size:var(--fs-small);padding:var(--space-2) var(--space-3)}
.scrapWallet{font-size:var(--fs-small);color:var(--gold-dim);
  margin:var(--space-1) 0 var(--space-4);font-family:monospace}
.scrapPill{display:inline-block;border:var(--border-hairline) solid var(--line);
  padding:var(--space-1) var(--space-5);margin:0 var(--space-3) var(--space-3) 0;
  font-size:var(--fs-small);font-family:monospace}
#stashList{font-family:monospace;font-size:var(--fs-small);margin-top:var(--space-4)}
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
.trophySetProg{font-family:monospace;font-size:var(--fs-small);color:var(--dim)}
.trophySet.dormant .trophySetProg{color:var(--faint)}
details.trophySet>summary{cursor:pointer;color:var(--faint);
  padding:var(--space-2) 0;display:list-item}
details.trophySet>summary .trophySetProg{float:right}
details.trophySet>.pips{margin-top:var(--space-4)}
.pips{display:flex;flex-wrap:wrap;gap:var(--space-3)}
.pip{font-size:var(--fs-label);font-family:monospace;
  padding:var(--space-1) var(--space-4);
  border:var(--border-hairline) solid var(--line-soft);color:var(--faint)}
.pip.own{color:var(--gold);border-color:var(--gold)}
.amScroll{overflow-x:auto}
#armoryGrid{display:flex;flex-direction:column;gap:var(--space-2);
  min-width:var(--armory-min)}
.amRow{display:grid;grid-template-columns:var(--armory-zone-col) repeat(3,1fr);
  gap:var(--space-3);align-items:stretch}
.amZone{font-family:monospace;font-size:var(--fs-label);color:var(--recede);
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
.amRank{font-family:monospace;font-size:var(--fs-micro);color:var(--dim)}
.amCell.max .amRank{color:var(--gold)}
.rar-common{color:var(--rar-common)} .rar-uncommon{color:var(--rar-uncommon)}
.rar-rare{color:var(--rar-rare)} .rar-epic{color:var(--rar-epic)}
.rar-legendary{color:var(--rar-legendary)} .rar-mythic{color:var(--rar-mythic)}
.rar-origin{color:var(--rar-origin)}
#stacksHud{font-size:var(--fs-small);color:var(--warn);font-family:monospace;
  font-variant:normal;letter-spacing:0;text-transform:none}

/* ── Delve / Dungeon ── */
#delveState,#delveCache{font-family:monospace;font-size:var(--fs-body);
  color:var(--bone);margin-bottom:var(--space-1)}
#delveState b,#delveCache b{color:var(--gold)}
/* The Dungeon's run controls are grouped by proximity, not by a second frame.
   DESIGN.md already flagged that this tab reuses .arena purely for a bordered
   look; a panel inside a panel is a rule line doing no work. */
.runPanel{margin:var(--arena-margin)}
#instState{font-family:monospace;font-size:var(--fs-body);color:var(--bone);
  line-height:1.6}
#instState b{color:var(--gold)}
.howItWorks p{font-size:var(--fs-small);font-family:monospace;color:var(--bone);
  line-height:1.6;margin-bottom:var(--space-3)}
.runControls{display:flex;flex-wrap:wrap;align-items:center;
  gap:var(--space-3) var(--space-7);margin-bottom:var(--space-3)}
.runControls label{font-size:var(--fs-small);font-family:monospace;color:var(--dim)}
.ctaRow{display:flex;flex-wrap:wrap;gap:var(--space-5);margin-top:var(--space-5)}
.cta{flex:1;background:var(--panel);border:var(--border-hairline) solid var(--gold);
  color:var(--gold);font-family:Georgia,serif;font-variant:small-caps;
  letter-spacing:.1em;font-size:var(--fs-display);padding:var(--space-6);
  text-align:center}
.seg{display:inline-flex}
.seg button{text-align:center}
.seg button.active{color:var(--gold);border-color:var(--gold)}

/* ── the dead server's console ── */
#logHead{font-family:monospace;font-size:var(--fs-micro);letter-spacing:.04em;
  color:var(--logline);border-top:var(--border-hairline) solid var(--line);
  padding:var(--space-5) 0 var(--space-2)}
.cursor{color:var(--live);animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
#log{font-family:monospace;font-size:var(--fs-small);max-height:var(--log-max-h);
  overflow-y:auto}
.logline{padding:var(--space-1) 0}
.log-event{color:var(--gold)} .log-plain{color:var(--bone)}
.log-dim{color:var(--recede)} .log-warn{color:var(--warn)}
footer{text-align:center;margin-top:var(--space-8);font-family:monospace;
  font-size:var(--fs-label);color:var(--faint)}
footer button{background:none;border:none;color:var(--faint);
  font-size:var(--fs-label);text-decoration:underline;text-align:center}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms !important;
    transition-duration:.01ms !important;scroll-behavior:auto !important}
}`;

/* ═════════════════════════════════════════════════════════════════════════
   VISUAL DNA v2 — material, frame, ornament, display type.
   internal/DESIGN.md "## Visual DNA v2" is the spec; this is its execution.

   Scoped to the Boss mock, because Phase 1's scope is one recomposed surface
   and the other five must emit byte-identical. Adds ZERO animation (the motion
   budget is untouched), ZERO raster assets, ZERO icons, ZERO external refs:
   every mark below is a gradient, a border or a rotated square.

   ponytail: two CSS strings instead of one until the look is signed off —
   Phase 3 pastes this into CSS, drops the `v2` flag, and deletes the split.
   ═════════════════════════════════════════════════════════════════════════ */
const CSS_V2 = `
/* ── 1. MATERIAL ───────────────────────────────────────────────────────────
   Three elevations. Each is a CONSTRUCTION, not a colour — which is what
   makes it reproducible on a surface nobody has drawn yet.

   PLATE  (raised)   : 2px warm --edge-lit lip, gradient falling from --panel
                       to --plate-foot, 1px cool --edge-shade foot, --line
                       hairline frame. Sits 5.2 L* above the page.
   WELL   (recessed) : the --well ground (BELOW page level) with a 2px lit foot
                       — light from above falls on the far wall of a recess,
                       and the near wall is already the darkest thing on
                       screen, so there is nothing left to shade it with.
   LEAF   (flat)     : no bevel, no gradient. Lives IN a well or ON a plate;
                       separated by hairlines alone. Density surfaces stay
                       leaves — that is what keeps a 15-row list readable.

   The lip is --space-1 (2px), not 1px. A 1px edge at 10 L* was the review's
   Major: present in the CSS, invisible on the render. 2px at 18.6 L* reads. */
section.game{
  background:linear-gradient(var(--panel),var(--plate-foot));
  box-shadow:inset 0 var(--space-1) 0 var(--edge-lit),
             inset 0 calc(var(--border-hairline) * -1) 0 var(--edge-shade);
  padding:var(--space-9) var(--space-7) var(--space-10);
  margin:var(--space-9) 0}

/* WELL. Used by the arena, the dialogue, and — the point of this pass — every
   ROWLIST, so a list-heavy surface gets its depth from the list itself rather
   than from a frame it does not have. */
.canvasStub,#dialogue,.rowlist{background:var(--well);
  box-shadow:inset 0 calc(var(--space-1) * -1) 0 var(--edge-lit)}
.rowlist{border-top:var(--border-hairline) solid var(--edge-shade);
  margin:var(--space-5) 0 var(--space-6)}

/* Controls are small plates: same lit-top/dark-foot rule, one step brighter.
   Scoped — the footer's export/wipe are text links, not controls, and must not
   inherit a raise. A DISABLED control loses its raise entirely: the material
   itself carries the state, and --faint only clears AA off the --field ground. */
section.game button,.helpBtn,.chipGroup{
  background:linear-gradient(var(--field),var(--panel));
  box-shadow:inset 0 var(--space-1) 0 var(--edge-lit),
             inset 0 calc(var(--border-hairline) * -1) 0 var(--edge-shade)}
section.game button:disabled{background:var(--panel);box-shadow:none}

/* ── 2. FRAME — the signature move ─────────────────────────────────────────
   Four gold corner brackets on a hairline frame, EXACTLY ONE PER SURFACE,
   around the one thing the surface is about. Eight background layers, no
   extra markup, no icon, no image.

   The no-decay rule lives here: a frame is always four corners, always
   symmetric, always complete. A missing or broken bracket would read as
   damage instantly, so the construction makes it unrepresentable.

   No fill layer. A frame is a frame — it sits transparently on its parent's
   plate. The 9th panel->plate-foot gradient this rule used to carry was a
   second application of the construction its own parent already had (review
   Minor): invisible only because the colours matched, and a bevel-inside-a-
   bevel by the letter of material rule 2.                                  */
.frame{position:relative;--br:linear-gradient(var(--gold),var(--gold));
  border:var(--border-hairline) solid var(--line);
  padding:var(--space-10) var(--space-7) var(--space-9);
  background:
    var(--br) 0 0/var(--space-9) var(--space-1) no-repeat,
    var(--br) 0 0/var(--space-1) var(--space-9) no-repeat,
    var(--br) 100% 0/var(--space-9) var(--space-1) no-repeat,
    var(--br) 100% 0/var(--space-1) var(--space-9) no-repeat,
    var(--br) 0 100%/var(--space-9) var(--space-1) no-repeat,
    var(--br) 0 100%/var(--space-1) var(--space-9) no-repeat,
    var(--br) 100% 100%/var(--space-9) var(--space-1) no-repeat,
    var(--br) 100% 100%/var(--space-1) var(--space-9) no-repeat}

/* ── 3. ORNAMENT ──────────────────────────────────────────────────────────
   A hairline that fades in from nothing, a gold lozenge, a hairline that
   fades out. The lozenge is a rotated square — a drawn mark, not a glyph and
   not a generated icon. Used to CLOSE an identity block and to open a
   section heading; never as filler between arbitrary elements.             */
.ornRule{display:flex;align-items:center;justify-content:center;
  gap:var(--space-5);margin:var(--space-6) 0 0}
.ornRule::before,.ornRule::after{content:"";height:var(--border-hairline);width:35%}
.ornRule::before{background:linear-gradient(90deg,transparent,var(--gold-dim))}
.ornRule::after{background:linear-gradient(90deg,var(--gold-dim),transparent)}
.ornRule i{flex:none;width:var(--space-4);height:var(--space-4);
  transform:rotate(45deg);background:var(--gold)}

/* Section headings inherit the ornament: the lozenge leads, the rule runs out
   to the right. Replaces the naked border-top. */
h3{border-top:none;padding-top:0;display:flex;flex-wrap:wrap;align-items:center;
  gap:var(--space-5);margin:var(--space-10) 0 var(--space-5);
  font-size:var(--fs-body);letter-spacing:.16em;color:var(--gold-dim)}
h3::before{content:"";flex:none;width:var(--space-4);height:var(--space-4);
  transform:rotate(45deg);background:var(--gold-dim)}
h3 .sub{flex-basis:100%}

/* ── 4. DISPLAY TYPE ──────────────────────────────────────────────────────
   Gold text is engraved, never lit: a 1px offset in --edge-shade reads as
   metal cut into a plate. A glow would read as neon-on-dark (an AI tell) and
   as a screen in trouble (decay). Offset down, never out.                  */
#bossName{font-size:var(--fs-warden);letter-spacing:.07em;line-height:1.1;
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade);overflow-wrap:anywhere}
#bossTitle{font-size:var(--fs-body);color:var(--bone);margin-top:var(--space-4);
  letter-spacing:.02em}
.bossPanel{margin:0}
#depth{letter-spacing:.03em;line-height:1;
  text-shadow:0 var(--border-hairline) 0 var(--edge-shade)}
/* The peak. Georgia at 52px is exactly what battle.js already draws the canvas
   BREACHED reveal at, so the DOM and the canvas agree on where the peak is.
   Copy is Phase 5's, unchanged, including its case. */
#depth.breached{font-size:var(--fs-colossal);font-family:Georgia,serif;
  letter-spacing:.05em}

/* ── 5. GOLD DISCIPLINE ───────────────────────────────────────────────────
   Gold is identity only: the Warden's name, the one hero number, the frame,
   the ornament, the active edge, the primary action. It is NOT a body or
   caption colour — #projection carried gold on a sentence, which is the
   single reason none of the other four golds read as special.              */
#projection{color:var(--bone)}
.wallLbl{color:var(--recede);margin-bottom:var(--space-5)}

/* ── 6. THE ARENA — a well, with light under the door ─────────────────────
   The one pictorial hint in the DOM: a warm band at the floor line and a
   gold-dim seam beneath it. Everything else about the scene is the canvas
   spec in DESIGN.md; the DOM's job is to frame the aperture, not fake it.  */
/* The arena is now a pure layout wrapper — no border, no fill. The canvas
   region IS the well; a bordered box around a well is the redundant rule line
   Tufte tells you to delete AND the nested-box shape detect.mjs flags. One
   nesting level: section plate -> canvas well. */
.canvasStub{position:relative;aspect-ratio:16/10;margin:var(--space-8) 0 0}
/* The floor line is a background LAYER, not a border. A bordered box inside a
   bordered box is both the rule line Tufte tells you to delete and the
   nested-card tell detect.mjs flags (ai-tells.md: Fable 5's #1 default, 6/6).
   The arena is the well; the canvas is its floor — one box, not two. */
.canvasStub::after{content:"";position:absolute;left:0;right:0;bottom:0;height:24%;
  pointer-events:none;
  background:linear-gradient(var(--gold-dim),var(--gold-dim))
               0 100%/100% var(--border-hairline) no-repeat,
             linear-gradient(transparent,var(--floor-glow))}
.canvasStub .k,.canvasStub .v{position:relative;z-index:1}
.controls{border-top:var(--border-hairline) solid var(--line);
  padding-top:var(--space-7);margin:var(--space-8) 0 var(--space-5);
  gap:var(--space-4) var(--space-7)}
/* BREACHED is the wall's peak moment — centre it and let it own the row
   rather than sitting flush-left in a baseline flex line. */
.controls:has(.breached){flex-direction:column;align-items:center;
  text-align:center}

/* ── 7. NAV + WALL SELECTOR — a seam, not a border swap ───────────────────
   An MMO client's active tab is lit along its top edge. That is a second,
   positional channel on top of the existing colour one.                    */
#tabs button{letter-spacing:.14em;font-size:var(--fs-small)}
#tabs button.active{box-shadow:inset 0 var(--space-1) 0 var(--gold),
  inset 0 calc(var(--border-hairline) * -1) 0 var(--edge-shade)}
.wallBtn.active{box-shadow:inset 0 var(--space-1) 0 var(--gold),
  inset 0 calc(var(--border-hairline) * -1) 0 var(--edge-shade)}

/* ── 8. PRIMARY ACTION — the deco double rule ─────────────────────────────
   Gold hairline, a gap of ground, a second gold-dim rule inside it. Two
   concentric rules is the oldest "this one matters" mark there is, and it
   distinguishes the CTA from the frame without spending a second frame.    */
#descendBtn{background:var(--panel);font-size:var(--fs-masthead);
  letter-spacing:.18em;padding:var(--space-9) var(--space-6);
  margin:var(--space-8) 0 0;
  box-shadow:inset 0 0 0 var(--space-3) var(--panel),
             inset 0 0 0 var(--space-4) var(--gold-dim)}

/* ── 9. STORY — recessed, so the voice sits behind the glass ──────────────  */
#dialogue{border-left-color:var(--gold-dim);
  font-size:var(--fs-display);line-height:1.6;color:var(--bone);
  padding:var(--space-9) var(--space-7);margin:var(--space-9) 0 0}

/* ── 10. THE LADDER, UNFLATTENED ──────────────────────────────────────────
   The four state channels (edge colour, type colour, control presence,
   unlock text) are untouched. Material adds a FIFTH: only a live row carries
   the lit top edge. Richer look, one more channel, none lost.              */
.rowlist .row.active{box-shadow:inset 0 var(--border-hairline) 0 var(--edge-lit)}

/* ── 11. CHROME BAND ──────────────────────────────────────────────────────  */
#resbar{padding:var(--space-5) var(--space-3);margin-bottom:var(--space-9);
  box-shadow:inset 0 calc(var(--border-hairline) * -1) 0 var(--gold-dim)}
main.client{padding:var(--space-9) var(--space-5) var(--space-10)}
`;

/* ─────────────────────────────────────────────────────────────────────────
   Shared chrome
   ───────────────────────────────────────────────────────────────────────── */
const TABS = [
  ["Boss", "boss"], ["Training", "training"], ["Grind", "grind"],
  ["Player", "player"], ["Delve", "delve"], ["Dungeon", "dungeon"],
];

const tabs = active => `<nav id="tabs" aria-label="Main">` + TABS.map(([label, id]) =>
  `<button${id === active ? ` class="active" aria-current="page"` : ""}>${label}</button>`
).join("") + `</nav>`;

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

const log = lines => `<div id="logHead">maintenance@dead-server:~$ <span class="cursor">&#9646;</span></div>
<div id="log">${lines.map(([cls, t]) => `<div class="logline ${cls}">${t}</div>`).join("")}</div>
<footer><button>export save</button> &middot; <button>wipe save (dev)</button></footer>`;

const page = ({ title, tab, note, body, skipChip, v2 = false, ladderExtra = "" }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} &mdash; Maintenance Mode mock</title>
<!--
  Phase 6 mock, .design-foundations/plans/2026-07-25-ui-dedup-audit.md
  Tokens : internal/DESIGN.md (Phase 3 LOCKED + Phase 4 component/dimension tiers)
  Blocks : internal/JOURNEY.md ## Page specs (order) + ## Fact ownership (state)
  Copy   : internal/JOURNEY.md Phase 5 microcopy, verbatim
  Save state rendered by all six mocks:
  ${S.replace(/\n/g, "\n  ")}
  Self-contained: no external stylesheet, font, script or image.
  Generated by internal/mocks/build.mjs — edit that, not this file.
-->
<style>${TOKENS}${v2 ? TOKENS_V2 : ""}${TOKENS_END}${CSS}${v2 ? CSS_V2 : ""}</style>
</head>
<body>
<main class="client">
<div class="mockNote"><b>MOCK</b> &mdash; not the shipped client. ${note}</div>
${resbar(skipChip)}
${tabs(tab)}
${body}
<div class="mockNote">${LADDER}</div>
${ladderExtra}
${log([
  ["log-event", "&#9733; W1 BREACHED &mdash; Vess"],
  ["log-loot log-event", "&#9670; Vess's Latch dropped &middot; +4% speed"],
  ["log-plain", "drop: Epic Sentry Halberd 11,200IP &middot; stashed"],
  ["log-dim", "While you were away (3h): +48,200 copper, 6 drops."],
])}
</main>
</body>
</html>`;

/* ─────────────────────────────────────────────────────────────────────────
   Ladder key — the same sentence on every mock, so a reviewer reads the
   three states the same way on all six surfaces.
   ───────────────────────────────────────────────────────────────────────── */
const LADDER = `<b>State ladder</b> (this plan's whole point). <b>live</b>: gold
left edge, bone name, allocation control, a filling bar. <b>dormant</b> (unlocked,
idle): neutral left edge, dim name, faint stat, control present reading 0, empty
track. <b>locked</b>: no left edge, whole row at <code>--opacity-locked</code>,
<b>no allocation control at all</b>, and the row says the word "locked" and its
unlock condition. Three independent channels per state &mdash; edge, type, controls.`;

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
  const common = { name, sub: `${mob} &middot; ${hp} HP`, gain: `${copper}c per kill`, gainSub: `IP ${ip}` };
  if (i >= 10) return row({ ...common, cls: "locked", stat: "locked &middot; needs 4 doors open, you have 1" });
  if (i === 2) return row({ ...common, cls: "active", allocHtml: alloc(20),
    stat: "50 kills/s CAPPED &middot; 5,766c/s (&times;1.24) &middot; overkill &times;125.1", fill: 100 });
  if (i === 9) return row({ ...common, cls: "struggling", allocHtml: alloc(15),
    stat: "too weak to hold &mdash; 1,172,556 damage/s of the 1,700,000 this zone needs", fill: 0 });
  return row({ ...common, cls: "dormant", allocHtml: alloc(0, []), stat: "no bots here", fill: 0 });
};

const zonesSection = `<section class="game">
  <h3>Zones<span class="sub">&mdash; put bots on a zone. Their combined damage
    has to clear the zone's hold number or they earn nothing at all. A zone they
    can hold kills up to 50 mobs a second; every kill pays copper and has a
    1-in-400 chance to drop a piece of gear. IP is the power band those drops
    roll in &mdash; deeper zones drop higher.</span></h3>
  <div class="rowlist">${ZONES.map(zoneRow).join("")}</div>
</section>`;

/* ─────────────────────────────────────────────────────────────────────────
   1. BOSS
   ───────────────────────────────────────────────────────────────────────── */
// Block 1 of the JOURNEY spec, recomposed as the hero it is: the Warden's
// frame. Same two facts, same two strings, same owner — a name that renders at
// --fs-warden inside a bracketed frame is the SAME fact as a name that renders
// at caption size, so nothing moved between owners.
const warden = `<div class="frame">
    <div class="bossPanel">
      <div id="bossName">Maren</div>
      <div id="bossTitle">Warden of the Second Door</div>
      <div class="ornRule"><i aria-hidden="true"></i></div>
    </div>
  </div>`;

const wallSelect = second => `<div class="wallLbl">Doors you've opened</div>
  <div class="wallScroll"><div id="wallSelect">
    <button class="wallBtn">W1 Vess &middot; farming</button>
    <button class="wallBtn active">W2 Maren &middot; ${second}</button>
  </div></div>`;

// Boss has no rowlist, so the state ladder has no surface here to prove itself
// on. It is drawn in the ANNOTATION layer instead — dashed, labelled, using
// Grind's own verbatim rows — so the reviewer can check on real pixels that a
// richer material language did not flatten a channel. Never product copy.
const MATERIAL_SPECIMEN = `
<div class="stateLabel">specimen &mdash; grind's real rowlist under v2 material
  (not a boss-tab block)</div>
<div class="mockNote"><b>Grind is the honest test of a material language</b> &mdash;
  no hero, no frame, no display type, 15 rows. This is <b>the same section, the same
  rows and the same copy <code>grind.html</code> renders</b>: one shared constant used
  twice, not a lookalike. What has to read here is <b>depth, without a single
  hero-only treatment</b>. The section is a <b>plate</b> (2px lit lip, gradient
  falling to <code>--plate-foot</code>); the rowlist is a <b>well</b> cut below page
  level with a lit foot; the rows are flat <b>leaves</b> in it; the alloc controls are
  small raised plates. If this reads flat, the language has failed and Phase 3 would
  have inherited the failure on five surfaces.</div>
${zonesSection}`;

const boss = page({
  title: "Boss", tab: "boss", v2: true, ladderExtra: MATERIAL_SPECIMEN,
  note: `Boss tab, recomposed against <b>DESIGN.md's Visual DNA v2</b>. Not one
    string, fact owner or block position changed &mdash; what changed is the
    material (three built elevations instead of one flat rect), the frame (the
    signature move: four gold corner brackets, once per surface, around the
    Warden), the ornament, and a display type tier that finally puts the
    identity above the readout. The arena is CANVAS-drawn, so block 3 is a
    labelled placeholder &mdash; deliberately not a fake arena; what the canvas
    should DRAW is specced in DESIGN.md <code>## Canvas scene spec</code>.
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
    <div id="projection" class="caption">Crits &times;1.16 average damage &mdash;
      10.0% of hits crit for &times;2, and 20.0% of those crit again for &times;5.</div>

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
  title: "Training", tab: "training",
  note: `Training tab. 9 of 13 script tiers are locked and not one of them draws
    an allocation control &mdash; the audit counted 21 inert clusters across this
    tab and Grind. The unlock rule now lives in the section header, which is why
    no locked row names its predecessor any more. The rig stats line keeps only
    the one fact the four rig buttons do not already carry: each button prints
    its lever's current value on the left of its own <code>&rarr;</code>.`,
  body: `<section class="game">
  <h3>Rig</h3>
  <div class="rig">
    <button>multiclient &middot; 248 &rarr; 297 bot slots &middot; 119,647c</button>
    <button class="affordable">account creator &middot; 240 &rarr; 270 bots per hour &middot; 12,069c</button>
    <button class="affordable">script version &middot; bot strength &times;1.75 &rarr; &times;2.00 &middot; 819c</button>
    <button class="affordable">overclock &middot; bot speed &times;1.80 &rarr; &times;2.00 &middot; 2,506c</button>
  </div>
  <div class="sub">lost in the Dungeon 47</div>
  <div class="barTrack"><div class="barFill" style="width:93%"></div></div>
  <div class="sub">231 of 248 slots filled &mdash; this bar is every bot you own;
    the counter at the top of the screen is the ones not assigned to anything.</div>

  <h3>ATK scripts<span class="sub">&mdash; put bots on a script to run it. Every
    fill it completes adds its ATK permanently. Any one script tops out at 50
    fills per second, and the next script down unlocks once the one above it has
    enough fills.</span></h3>
  <div class="caption">+16.65 ATK trained so far &middot; +0.0275/s right now</div>
  <div class="rowlist">${atkTiers.map(tierRow).join("")}</div>

  <h3>SPEED scripts<span class="sub">&mdash; same as ATK, for hits per second.
    Past 9 hits/s on this door the returns shrink: every point still counts, just
    less. Each deeper Warden raises that number.</span></h3>
  <div class="caption">+0.13 hits/s trained so far &middot; +0.00034/s right now</div>
  <div class="rowlist">${speedTiers.map(tierRow).join("")}</div>

  <h3>Enhance squad<span class="sub">&mdash; bots that keep pressing enhance on
    one item for you. Same odds and the same copper cost as doing it yourself;
    they just never stop. Pick the slot and the plus to stop at. The odds and the
    fallout are on the Player tab.</span></h3>
  <div class="runControls">
    <span class="seg"><button>weapon</button><button class="active">armor</button><button>charm</button></span>
    <label>stop at + <input class="ipDial" value="15" readonly></label>
  </div>
  <div class="caption">one try every 9.4s &middot; 83,215c each</div>

  <h3>Ban Wave<span class="sub">&mdash; the anti-cheat notices the farm</span></h3>
  <p class="caption">Banking a Ban Wave resets your bots, your training and your
    copper to the start. Everything your character owns stays: gear, plusses,
    scrap, trophies, Armory ranks, titles and door progress. In exchange you bank
    &radic;(training fills) as Scripts, and every Script permanently adds +1%
    damage. Scripts never reset.</p>
  <div class="runControls">
    <span class="caption">+206 Scripts ready, from 42,436 training fills &middot; 0 Ban Waves so far</span>
  </div>
  <div class="ctaRow"><button class="cta">Ban Wave</button></div>
</section>`,
});

const grind = page({
  title: "Grind", tab: "grind",
  note: `Grind tab, all 15 zones, four states side by side: <b>Salt Flats</b>
    live and held, <b>The Second Door</b> live and failing (DESIGN.md's REQUIRED
    struggling state, which the shipped build still renders identically to
    locked), eight dormant zones, five locked zones with no controls at all.`,
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
const armory = Array.from({ length: 15 }, (_, zi) => `<div class="amRow">
  <span class="amZone">z${zi + 1}</span>
  ${amCell("weapon", zi)}${amCell("armor", zi)}${amCell("charm", zi)}
</div>`).join("");

const player = page({
  title: "Player", tab: "player", skipChip: "cp",
  note: `Player tab, reordered per the Phase 2 spec: gear and stash first,
    trophies and armory (115 of the audit's 136 dormant items) at the tail, and
    an un-started trophy set collapses to its own header. <b>The resource bar
    carries no Combat Power chip here</b> &mdash; the chrome echoes a headline
    only while you are not on the tab that owns it, which is the one place audit
    finding G6 actually bites. Dormant pips and rank-0 Armory cells use
    <code>--faint</code> at full opacity, not an opacity multiplier: this is
    genuine readable text, so it holds AA.`,
  body: `<section class="game">
  <h3>Combat Power<span class="sub">&mdash; your damage per second against the
    door: ATK multiplied by hits per second. "Haste" anywhere on this tab is a
    percentage added to hits per second. Everything below feeds these two
    numbers.</span></h3>
  <div class="chipGroup" id="powerBreakdown">
    <div class="chip"><div class="chipVal"><b>2,481,600</b></div><div class="chipLbl">combat power</div></div>
    <div class="chip"><div class="chipVal"><b>94,000.0</b></div><div class="chipLbl">ATK</div></div>
    <div class="chip"><div class="chipVal"><b>26.4</b></div><div class="chipLbl">hits/s</div></div>
  </div>

  <h3>Gear <span id="stacksHud">&middot; 6 failstacks, +6% on your next attempt</span>
    <span class="sub">&mdash; three slots. Enhancing raises an item's plus, and
    every plus multiplies its base power by 1.12. A failed attempt anywhere banks
    a failstack worth +1 percentage point on your next attempt, up to +15; a
    success spends the whole bank.</span></h3>
  <label class="toggleLine"><input type="checkbox"> safeguard &middot; 3&times; the
    copper, but a failure doesn't cost you a plus. Only works while the item is
    +5 to +14 &mdash; it can't protect a push past +15.</label>

  <div class="slot filled">
    <span class="slotName">weapon</span>
    <div class="slotItem"><span class="rar-legendary">Sentry Halberd</span>
      <span class="itemMeta">&middot; Legendary &middot; IP 9,400 +12 &middot; 36,660 ATK</span></div>
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

  <div class="slot filled">
    <span class="slotName">armor</span>
    <div class="slotItem"><span class="rar-rare">Sentry Plate</span>
      <span class="itemMeta">&middot; Rare &middot; IP 6,200 +7 &middot; 13,708 ATK</span></div>
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

  <p class="sub">Reforge rerolls an item's affixes for scrap of its own rarity. It
    can't change the rarity or the IP &mdash; only which affixes it has and what
    they roll. You see the result before you decide whether to keep it.</p>

  <h3>Stash<span class="sub">&mdash; where kept drops land, up to 50. An item's
    rarity is how many affixes it rolled (Common 0, Origin 6) and its IP is how
    strong those affixes roll. Salvaging turns an item into scrap of its own
    rarity. Locking one protects it from auto-salvage, the bulk sweep and the
    stash-full clear-out.</span></h3>
  <div class="scrapWallet">
    <span class="scrapPill rar-common">124 Common</span>
    <span class="scrapPill rar-rare">38 Rare</span>
    <span class="scrapPill rar-epic">9 Epic</span>
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
    <div class="stashRow upgrade">
      <span class="sMark">&#9650;</span>
      <span class="sName rar-epic">Threshold Cleaver</span>
      <span class="sAct"><button>equip</button><button>lock</button><button>salvage +6</button></span>
      <span class="sInfo">weapon &middot; IP 28,400 +0 &middot; +2,272 ATK &middot; +16% ATK &middot; +5% crit rate</span>
    </div>
    <div class="stashRow locked-item">
      <span class="sMark">L</span>
      <span class="sName rar-rare">Cinder Scale Coat</span>
      <span class="sAct"><button>equip</button><button>unlock</button><button>salvage +3</button></span>
      <span class="sInfo">armor &middot; IP 1,450 +0 &middot; +6% haste &middot; +0.5 hits/s</span>
    </div>
    <div class="stashRow">
      <span class="sMark"></span>
      <span class="sName rar-common">Salt Talisman</span>
      <span class="sAct"><button>equip</button><button>lock</button><button>salvage +1</button></span>
      <span class="sInfo">charm &middot; IP 300 +0 &middot; no affixes &mdash; Common items roll none</span>
    </div>
    <div class="sub">&hellip;and 9 more (salvage to clear)</div>
  </div>

  <h3>Trophies <span class="caption">0/10 sets complete</span>
    <span class="sub">&mdash; each Warden has a 7-piece set. Breaking its door
    gives you the first piece; the rest come from farming that Warden on the Boss
    tab. A complete set multiplies your damage by 1.5.</span></h3>
  ${SETS.map(trophySet).join("")}

  <h3>Armory<span class="sub">&mdash; every drop is logged here against its own
    entry, one per item name, whether you keep it or scrap it. Rarer copies count
    for more: a Common is worth 1 point, an Origin 13. The first rank costs 3
    points and each rank after costs 60% more, up to rank 12. Weapons rank ATK,
    armor ranks haste, charms rank copper &mdash; and the ranks survive every Ban
    Wave.</span></h3>
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
  title: "Delve", tab: "delve",
  note: `Delve tab. The audit named this the structural model the others should
    follow, so nothing is reordered. Two things change, both from Phase 5: every
    buy button carries the verb (G5 was a bare price stretched across the row)
    and every rank readout prints the multiplier actually folded into Combat
    Power, not just its per-rank gain.`,
  body: `<section class="game">
  <h3>Delve<span class="sub">&mdash; your character digs on their own down here,
    no input needed. Depth is however deep your Combat Power clears: floor 1
    needs 10 damage per second and each floor after needs 70% more. Every extra
    floor pays 35% more Cache per second, and Cache is the buried server data you
    spend below.</span></h3>
  <div id="delveState">depth <b>27</b> &middot; deepest ever 27 &middot; <b>2,974</b> Cache/s</div>
  <div id="delveCache"><b>8,420</b> Cache banked</div>

  <h3>Cache tree<span class="sub">&mdash; each row buys one rank. Every rank you
    buy raises that row's next price.</span></h3>
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

const howItWorks = `<h3>How it works</h3>
<div class="howItWorks">
  <p>Your bots fight down through the floors on their own, and each floor takes longer than the last.</p>
  <p>Some of them get banned on every floor, faster the deeper they go. When too many abilities go unblocked, the party dies.</p>
  <p>If they die you keep 40% of what they found. Pull out early and you keep all of it.</p>
</div>`;

const journal = `<h3>Boss abilities<span class="sub">&mdash; there's no wiki and
  nobody to ask. You find out what an ability does by running into it. What you
  learn here is permanent: it survives a Ban Wave.</span></h3>
<div class="rowlist">
  ${row({ cls: "active", name: "Sunder", stat: "met and blocked" })}
  ${row({ name: "Mass Dispel", stat: "met on a run, never blocked" })}
  ${row({ cls: "dormant", name: "Summon Adds", stat: "Unknown &mdash; you haven't met this one yet" })}
</div>`;

const dungeon = page({
  title: "Dungeon", tab: "dungeon",
  note: `Dungeon tab. ${TWO_STATES} The audit's three-statement problem is
    answered by three teaching locations owning one mechanic each: <b>Assign
    bots</b> owns blocking, <b>Difficulty</b> owns what difficulty changes,
    <b>How it works</b> owns the run loop. No duty row restates the block rule,
    no stat column restates the needed count, no journal row restates an effect,
    and the running state line no longer restates the pull-out floor two rows
    below it. The intro that filled the first screen is now three lines,
    <b>below</b> the controls.`,
  body: `<div class="stateLabel">state &mdash; idle</div>
<section class="game">
  <h3>Dungeon</h3>
  <div id="instState">At difficulty <b>6</b>: 3 abilities to block, 3 bots needed
    on each. Deepest floor so far: 12.</div>
  <div class="caption">Sending 5 bots. They should reach about floor 6 before too
    many are banned.</div>

  <h3>Assign bots<span class="sub">&mdash; each ability needs a set number of bots
    on it to be blocked. An ability you leave unblocked cuts your damage every
    floor it fires, and when your damage falls below 25% of normal the party
    dies. Bots you send are spent &mdash; you get back whoever survives.</span></h3>
  <div class="rowlist">${dutyRows(false)}</div>

  <div class="runPanel">
    <div class="runControls">
      <label>Difficulty <input class="ipDial" value="6" readonly></label>
      <label>Pull out at floor <input class="ipDial" value="9" readonly></label>
    </div>
    <div class="sub">Higher difficulty means more abilities to block, more bots on
      each, better loot &mdash; and bots banned faster. You set it; it never drops
      on its own. If the party dies you keep 40% of what they found.</div>
    <div class="sub">Your bots come home with everything the moment they clear this
      floor. You can change it mid-run.</div>
    <label class="toggleLine"><input type="checkbox" checked> Buy proxies &middot;
      250c per run, 25% fewer bots banned</label>
    <div class="ctaRow"><button class="cta">Send bots in</button></div>
  </div>

  ${howItWorks}
  ${journal}
</section>

<div class="stateLabel">state &mdash; in progress</div>
<section class="game">
  <h3>Dungeon</h3>
  <div id="instState">Floor <b>7</b> &middot; 14 items so far &middot; dealing
    <b>53%</b> damage.</div>
  <div class="caption">3 bots still alive &middot; about 21% of them get banned on
    the next floor.</div>

  <h3>Assign bots<span class="sub">&mdash; each ability needs a set number of bots
    on it to be blocked. An ability you leave unblocked cuts your damage every
    floor it fires, and when your damage falls below 25% of normal the party
    dies. Bots you send are spent &mdash; you get back whoever survives.</span></h3>
  <div class="rowlist">${dutyRows(true)}</div>

  <div class="runPanel">
    <div class="runControls">
      <label>Difficulty <input class="ipDial" value="6" readonly disabled></label>
      <label>Pull out at floor <input class="ipDial" value="9" readonly></label>
    </div>
    <div class="sub">Your bots come home with everything the moment they clear this
      floor. You can change it mid-run.</div>
    <div class="ctaRow"><button class="cta">Pull out now &mdash; keep all 14 items</button></div>
  </div>
</section>`,
});

/* ─────────────────────────────────────────────────────────────────────────
   Emit + check
   ───────────────────────────────────────────────────────────────────────── */
const FILES = { boss, training, grind, player, delve, dungeon };
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

console.log(failed ? `\nDW-6.2: ${failed} file(s) FAILED` : `\nDW-6.1 + DW-6.2: all 6 files pass`);
process.exit(failed ? 1 : 0);
