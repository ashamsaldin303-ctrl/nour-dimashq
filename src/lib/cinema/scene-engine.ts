import type { CinemaScene } from "./manifest";
import { KeyframeEngine } from "./keyframe-engine";
import { CssKeyframeEngine } from "./fallback";
import type { ScrubVideoEngine } from "./scrub-video-engine";

/**
 * M2 cinema layer — the SceneEngine contract (integration brief §8.1 VERBATIM).
 * Every chapter media surface implements exactly these five verbs; the film
 * orchestrator drives warm/progress/draw windows and releases distant engines.
 */
export interface SceneEngine {
  warmUp(): Promise<void>; // fetch/decode keyframes or prime the decoder
  setProgress(p: number): void; // 0..1 target — never seek/draw here
  draw(): void; // called by the ticker, only if landed p moved
  suspend(): void; // offscreen: stop rAF, keep warm assets
  release(): void; // 2+ chapters away: free VRAM/decoders
}

/** Ticker entry shared by both engine families (one clock, §8.4). */
export interface TickingEngine extends SceneEngine {
  /** gsap.ticker callback — dt in seconds, shift = clamped velocity+pointer feed. */
  tick(nowMs: number, dtSeconds: number, shift: readonly [number, number]): void;
}

/** Anything that can render a chapter: WebGL keyframes, CSS rung, scrub video. */
export type AnyEngine = KeyframeEngine | CssKeyframeEngine | ScrubVideoEngine;

export type EngineKind = "keyframe" | "css" | "video";

export interface EngineContext {
  scene: CinemaScene;
  /** Host element the engine may attach DOM surfaces to (canvases, rungs). */
  host: HTMLElement;
  /** Fires when WebGL dies at runtime (contextlost ladder rung, NEVER #14). */
  onContextLost?: () => void;
}

export type EngineFactory = (ctx: EngineContext) => AnyEngine;

/**
 * Engine registry — chapters declare their engine from the manifest
 * (`scene.engine`, currently `keyframe` only); capability resolution picks
 * the concrete class: WebGL2 → KeyframeEngine, otherwise the CSS rung.
 * `video` is the Tier B upgrade (consent-gated, desktop-only, §8.3).
 */
export const engineRegistry: Record<EngineKind, EngineFactory> = {
  keyframe: (ctx) =>
    new KeyframeEngine({
      host: ctx.host,
      colorAUrl: ctx.scene.keyframes.A,
      colorBUrl: ctx.scene.keyframes.B,
      depthAUrl: ctx.scene.depth?.A,
      depthBUrl: ctx.scene.depth?.B,
      onContextLost: ctx.onContextLost,
    }),
  css: (ctx) =>
    new CssKeyframeEngine({
      host: ctx.host,
      colorAUrl: ctx.scene.keyframes.A,
      colorBUrl: ctx.scene.keyframes.B,
    }),
  video: (ctx) => {
    throw new Error("video engine requires its clip src — construct ScrubVideoEngine directly");
  },
};
