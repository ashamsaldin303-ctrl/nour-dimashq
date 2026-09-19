/**
 * Token-pair contrast audit (manual §11.1 gate 9).
 * Reads the exact hex values from the brief §5 token table and computes
 * WCAG 2.1 contrast ratios. Exit 1 if any floor is violated.
 * Floors: 4.5:1 body text · 3:1 large text (≥24px) + UI lines/badges.
 */
const TOKENS = {
  "stone-50": "#F5F0E4",
  "stone-100": "#EDE6D4",
  "stone-200": "#E2D9C2",
  "stone-300": "#CFC3A6",
  "stone-400": "#B3A583",
  "stone-500": "#97896B",
  "stone-600": "#7A6E55",
  "stone-700": "#5C5340",
  "stone-800": "#3E382B",
  "stone-900": "#262119",
  "gold-300": "#D9AE6B",
  "gold-400": "#C08A3E",
  "gold-500": "#9C6E2A",
  "gold-600": "#7A531B",
  "ok-600": "#4A6B3A",
  "ok-50": "#EAF0E4",
  "bad-600": "#A03D2E",
  "bad-50": "#F6E8E4",
};

function lum(hex) {
  const c = hex
    .slice(1)
    .match(/.{2}/g)
    .map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(fg, bg) {
  const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

const CHECKS = [
  ["stone-900", "stone-100", 4.5, "body text on page bg"],
  ["stone-900", "stone-50", 4.5, "body text on cards"],
  ["gold-600", "stone-100", 4.5, "accent text at body size (brief claims 4.6:1)"],
  ["gold-500", "stone-100", 3.0, "large text >=24px + UI lines (brief claims 3:1)"],
  ["stone-900", "gold-400", 3.0, "badge text on gold-400 (brief claims 5.4:1)"],
  ["stone-50", "gold-600", 4.5, "primary button text"],
  ["stone-50", "stone-900", 4.5, "dark panel text"],
  ["gold-300", "stone-900", 3.0, "on-dark accent"],
  ["stone-300", "stone-900", 3.0, "dark muted captions"],
  ["stone-700", "stone-100", 4.5, "secondary text"],
  ["ok-600", "ok-50", 4.5, "success text"],
  ["bad-600", "bad-50", 4.5, "danger text"],
  ["gold-600", "stone-200", 3.0, "focus ring on secondary surfaces"],
];

let fail = 0;
console.log("PAIR".padEnd(34), "RATIO", " FLOOR", " VERDICT  WHERE");
for (const [fg, bg, floor, where] of CHECKS) {
  const r = ratio(TOKENS[fg], TOKENS[bg]);
  const pass = r >= floor;
  if (!pass) fail++;
  console.log(
    `${fg} on ${bg}`.padEnd(34),
    r.toFixed(2).padStart(5),
    String(floor).padStart(6),
    pass ? "  PASS    " : "  FAIL    ",
    where,
  );
}
console.log(fail === 0 ? "\nALL PAIRS PASS" : `\n${fail} PAIRS FAIL`);
process.exit(fail === 0 ? 0 : 1);
