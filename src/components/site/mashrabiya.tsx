/**
 * Brand motif (brief §5): a parametric mashrabiya lattice — geometric 8-point
 * star grid (two overlapping squares, one rotated 45°), stroke stone-300 /
 * gold-400. Used as: section dividers, placeholder tiles, and the star mark.
 * Implemented as a CSS data-URI background (crisp at any DPR, zero ids,
 * server-safe) — the same geometry as the hero poster lattice.
 */

const STAR_TILE = (stroke: string, size = 56) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 56 56'><g fill='none' stroke='${stroke}' stroke-width='1'><rect x='16' y='16' width='24' height='24'/><rect x='16' y='16' width='24' height='24' transform='rotate(45 28 28)'/></g></svg>`;

const uri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27")}")`;

export const MASHRABIYA_STONE = uri(STAR_TILE("%23CFC3A6"));
export const MASHRABIYA_GOLD = uri(STAR_TILE("%23C08A3E"));

/** Decorative lattice layer (absolute-positioned by the caller). */
export function MashrabiyaLayer({ gold = false, className = "" }: { gold?: boolean; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: gold ? MASHRABIYA_GOLD : MASHRABIYA_STONE, backgroundSize: "56px 56px" }}
    />
  );
}

/** Section divider: a short lattice strip that fades before both edges. */
export function MashrabiyaDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-6 w-full ${className}`}
      style={{
        backgroundImage: MASHRABIYA_GOLD,
        backgroundSize: "56px 56px",
        backgroundRepeat: "repeat-x",
        maskImage: "linear-gradient(to left, transparent, black 25%, black 75%, transparent)",
        WebkitMaskImage: "linear-gradient(to left, transparent, black 25%, black 75%, transparent)",
      }}
    />
  );
}

/** The brand mark: an 8-point star (squares + rotated square + gold core). */
export function StarMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none">
      <rect x="8.5" y="8.5" width="15" height="15" stroke="currentColor" strokeWidth="2" />
      <rect
        x="8.5"
        y="8.5"
        width="15"
        height="15"
        stroke="currentColor"
        strokeWidth="2"
        transform="rotate(45 16 16)"
      />
      <circle cx="16" cy="16" r="2.5" fill="var(--color-gold-400)" />
    </svg>
  );
}
