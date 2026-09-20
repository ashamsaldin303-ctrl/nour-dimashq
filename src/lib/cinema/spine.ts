import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * M2 cinema layer — the one-clock spine (integration brief §8.4 VERBATIM).
 *
 *   const lenis = new Lenis({ lerp: 0.09, syncTouch: false, respectReducedMotion: true });
 *   lenis.on("scroll", ScrollTrigger.update);
 *   gsap.ticker.add((time) => { lenis.raf(time * 1000); }); // seconds -> ms
 *   gsap.ticker.lagSmoothing(0);                            // no catch-up pauses
 *
 * `lagSmoothing(0)` is mandatory — default lag compensation would pause the
 * shared ticker after a long frame and desynchronize Lenis from ScrollTrigger
 * exactly when a heavy seek lands. NO `scrollerProxy` (Lenis keeps the native
 * scrollbar; sticky, keyboard, find-in-page keep working). This one rAF loop
 * drives Lenis, ScrollTrigger, the ProgressStore, and both engines.
 */

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let spineTicker: ((time: number) => void) | null = null;

export function initSpine(): Lenis {
  if (lenis) return lenis;
  const instance = new Lenis({
    lerp: 0.09,
    syncTouch: false,
    respectReducedMotion: true,
  });
  instance.on("scroll", ScrollTrigger.update);
  spineTicker = (time: number) => {
    instance.raf(time * 1000); // seconds -> ms
  };
  gsap.ticker.add(spineTicker);
  gsap.ticker.lagSmoothing(0);
  lenis = instance;
  return instance;
}

export function getSpine(): Lenis | null {
  return lenis;
}

export function disposeSpine(): void {
  if (spineTicker) {
    gsap.ticker.remove(spineTicker);
    spineTicker = null;
  }
  lenis?.destroy();
  lenis = null;
}

/** After Cairo/Kufi load, triggers must re-measure (§8.4 hard rules). */
export function refreshAfterFonts(): void {
  if (typeof document === "undefined") return;
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);
}

export { gsap, ScrollTrigger };
