// gameLoop.js — pattern ported from ../FightingInc/gameLoop.js.
// Logic on setInterval with wall-clock time (keeps firing in background
// tabs); requestAnimationFrame is rendering only. A throw in render would
// kill the rAF chain permanently; a throw in tick aborts that tick's
// autosave. Guard both; log each distinct error once.
const seen = new Set();
function guard(fn, label) {
  return () => {
    try { fn(); } catch (e) {
      const key = String(e);
      if (!seen.has(key)) { seen.add(key); console.error(`[${label}]`, e); }
    }
  };
}

export function startGameLoop(tick, render, logicIntervalMs = 250) {
  setInterval(guard(tick, "tick"), logicIntervalMs);

  const safeRender = guard(render, "render");
  (function frame() {
    safeRender();
    requestAnimationFrame(frame);
  })();
}
