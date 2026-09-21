/**
 * M2 cinema layer v2 — capability probes (the fallback ladder's senses).
 *
 * The ladder (T2.1 full-film architecture):
 *   reduced-motion → statics variant (poster + captions in flow, no engine)
 *   consent off    → poster rung (sticky stage, poster still, no video bytes)
 *   video failure  → poster rung (fail-closed — the M1 hero stays intact)
 *   desktop        → the film plays automatically (the cinema IS the site)
 *   touch / saveData → honest-MB door first, then the film on acceptance
 */

/** Desktop law: fine pointer AND viewport >= 1024 — else the door appears. */
export function isDesktopViewport(): boolean {
  if (typeof window === "undefined") return false;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const wide = window.innerWidth >= 1024;
  return fine && wide;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Data-saver on (Save-Data: on) — treat like touch: door before any MB. */
export function saveDataOn(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
  return conn?.saveData === true;
}
