import { MashrabiyaLayer } from "./mashrabiya";

/**
 * PlaceholderTile — the M1 sample imagery law (brief §6 media law):
 * NO fake rooms, ever. Every listing photo renders the brand motif tile
 * with the district label + «صورة العقار قادمة», until the owner's real
 * photography replaces them (swap path in CONTENT.md).
 * `tileKey` is either "placeholder:<district>" or a real /uploads path.
 */
export function PlaceholderTile({
  tileKey,
  top,
  sub = "صورة العقار قادمة",
  className = "",
}: {
  tileKey: string;
  top?: string;
  sub?: string;
  className?: string;
}) {
  const ariaLabel = top ? `${top} — ${sub}` : sub;
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`relative isolate overflow-hidden bg-stone-200 ${className}`}
    >
      <MashrabiyaLayer />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-stone-100/70 via-stone-100/20 to-stone-100/85"
      />
      <div className="relative flex h-full min-h-24 w-full flex-col items-center justify-center gap-1 p-4 text-center">
        {top ? (
          <span className="font-heading text-caption font-bold text-gold-600 md:text-sm">{top}</span>
        ) : null}
        <span className="text-micro text-stone-600">{sub}</span>
      </div>
    </div>
  );
}
