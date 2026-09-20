import type { TickingEngine } from "./scene-engine";
import { CINEMA_MOTION } from "./keyframe-engine";

/**
 * M2 cinema layer — the fallback ladder (§3 IN / §5):
 *   webglcontextlost -> CSS poster+crossfade rung
 *   no WebGL2        -> CSS push-in rung
 *   reduced-motion   -> keyframe stills (statics variant, no engines at all)
 * CSS-ONLY — zero canvas code in the rungs. The chapter timeline's own
 * `.media` scale tween provides the push-in; this engine crossfades A->B with
 * the same blend curve the WebGL shader uses (uFade 0.08 -> span [0.42,0.58]).
 */

export function webgl2Supported(): boolean {
  try {
    const c = document.createElement("canvas");
    return c.getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

/** Tier B law (AC-C5): never on touch / pointer:coarse / viewport < 1024. */
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

/** smoothstep — mirrors the shader's A->B blend so rungs match WebGL pacing. */
function blend(p: number): number {
  const lo = 0.5 - CINEMA_MOTION.uFade;
  const hi = 0.5 + CINEMA_MOTION.uFade;
  const t = Math.min(1, Math.max(0, (p - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

export interface CssKeyframeEngineOptions {
  host: HTMLElement;
  colorAUrl: string;
  colorBUrl: string;
}

export class CssKeyframeEngine implements TickingEngine {
  readonly kind = "css" as const;
  #host: HTMLElement;
  #rungA: HTMLDivElement;
  #rungB: HTMLDivElement;
  #uPTarget = 0;
  #uPLanded = 0;
  #suspended = false;
  #warmed = false;

  constructor(opts: CssKeyframeEngineOptions) {
    this.#host = opts.host;
    this.#rungA = document.createElement("div");
    this.#rungA.className = "cinema-rung";
    this.#rungA.style.backgroundImage = `url("${opts.colorAUrl}")`;
    this.#rungB = document.createElement("div");
    this.#rungB.className = "cinema-rung cinema-rung-b";
    this.#rungB.style.backgroundImage = `url("${opts.colorBUrl}")`;
    this.#rungB.style.opacity = "0";
  }

  async warmUp(): Promise<void> {
    if (this.#warmed) return;
    // Preload both images, then mount (browser cache covers the fetch).
    await Promise.all(
      [this.#rungA, this.#rungB].map(
        (r) =>
          new Promise<void>((res) => {
            const img = new Image();
            img.onload = () => res();
            img.onerror = () => res();
            img.src = (r.style.backgroundImage.match(/url\("?(.+?)"?\)/) ?? [])[1] ?? "";
          }),
      ),
    );
    this.#host.appendChild(this.#rungA);
    this.#host.appendChild(this.#rungB);
    this.#warmed = true;
    this.#suspended = false;
  }

  setProgress(p: number): void {
    this.#uPTarget = Math.min(1, Math.max(0, p));
  }

  tick(_nowMs: number, dtSeconds: number): void {
    if (!this.#warmed || this.#suspended) return;
    const dt = Math.min(Math.max(dtSeconds, 0.0001), 0.25);
    this.#uPLanded += (this.#uPTarget - this.#uPLanded) * (1 - Math.exp(-dt / CINEMA_MOTION.TAU));
    this.#rungB.style.opacity = blend(this.#uPLanded).toFixed(3);
  }

  draw(): void {
    this.#rungB.style.opacity = blend(this.#uPLanded).toFixed(3);
  }

  suspend(): void {
    this.#suspended = true;
    this.#rungA.style.visibility = "hidden";
    this.#rungB.style.visibility = "hidden";
  }

  resume(): void {
    if (!this.#warmed) return;
    this.#suspended = false;
    this.#rungA.style.visibility = "visible";
    this.#rungB.style.visibility = "visible";
  }

  release(): void {
    this.#rungA.remove();
    this.#rungB.remove();
    this.#warmed = false;
    this.#suspended = true;
  }
}
