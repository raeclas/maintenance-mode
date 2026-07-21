// format.js — number formatting for big idle numbers.
export function fmt(n) {
  if (n < 1000) return String(Math.round(n * 10) / 10);
  const units = ["k", "M", "B", "T", "Qa"];
  let u = -1;
  while (n >= 1000 && u < units.length - 1) { n /= 1000; u++; }
  return (n >= 100 ? n.toFixed(0) : n.toFixed(1)) + units[u];
}

// Depth as %, with enough precision to show tiny intro numbers honestly.
export function fmtDepth(d) {
  const pct = d * 100;
  if (pct >= 1) return pct.toFixed(1) + "%";
  if (pct >= 0.01) return pct.toFixed(2) + "%";
  return pct.toFixed(4) + "%";
}
