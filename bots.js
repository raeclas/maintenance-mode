// bots.js — the Bot Farm (training). NGU triple: bar progress/s =
// bots assigned × bot power × bot speed. All three copper-improvable.
// Live tick and offline batch are the SAME function (clamp law).
// Starting values throughout — sim-tuned; test plans in REMAKE-DESIGN §7.

export const BAR_COST_C = 40;         // level L costs 40×L² progress units
export const BOT_BASE = 2;            // borrowed accounts
export const POWER_PER_RANK = 0.25;
export const SPEED_PER_RANK = 0.20;

export function botPower(bots) { return 1 + POWER_PER_RANK * bots.powerRank; }
export function botSpeed(bots) { return 1 + SPEED_PER_RANK * bots.speedRank; }

// Copper costs (exponential — copper can't runaway-compound the chain)
export function botCost(bots) { return Math.round(500 * Math.pow(8, bots.count - BOT_BASE)); }
export function powerCost(bots) { return Math.round(200 * Math.pow(2.2, bots.powerRank)); }
export function speedCost(bots) { return Math.round(300 * Math.pow(2.5, bots.speedRank)); }

export function buy(state, what) {
  const b = state.bots;
  const cost = what === "bot" ? botCost(b) : what === "power" ? powerCost(b) : speedCost(b);
  if (state.copper < cost) return false;
  state.copper -= cost;
  if (what === "bot") b.count++;
  else if (what === "power") b.powerRank++;
  else b.speedRank++;
  return true;
}

export function assigned(bots) { return bots.assign.atk + bots.assign.speed; }

export function setAssign(state, bar, n) {
  const b = state.bots;
  n = Math.max(0, Math.floor(n));
  const other = bar === "atk" ? b.assign.speed : b.assign.atk;
  b.assign[bar] = Math.min(n, b.count - other);
}

export function levelCost(lvl) { return BAR_COST_C * (lvl + 1) * (lvl + 1); }

// Advance both bars by dtS seconds. Same path live and offline (caller clamps dt).
export function tick(state, dtS) {
  const b = state.bots;
  const rate = botPower(b) * botSpeed(b);
  for (const bar of ["atk", "speed"]) {
    let units = b.assign[bar] * rate * dtS;
    const B = b.bars[bar];
    B.prog += units;
    while (B.prog >= levelCost(B.lvl)) {
      B.prog -= levelCost(B.lvl);
      B.lvl++;
    }
  }
}
