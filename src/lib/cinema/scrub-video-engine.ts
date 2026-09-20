import type { SceneEngine, TickingEngine } from "./scene-engine";

/**
 * M2 cinema layer — Tier B scrub engine (integration brief §8.3 VERBATIM).
 * Hidden <video> as a decoder + canvas repaint; the guards ARE the engine:
 *   (1) commit threshold 1/fps (~42 ms @24) — async seeks pile into a
 *       seeking/seeked storm if issued per scroll event;
 *   (2) >= 80 ms between seeks, last target wins;
 *   (3) fastSeek() when present, currentTime fallback;
 *   (4) requestVideoFrameCallback repaint companion where available.
 * Platform laws: muted + playsinline + no audio track; <= 2 warm videos at
 * any moment (enforced by the film orchestrator's warm window); iOS
 * Low-Power-Mode recovery = play() rejection during warmUp -> recover on
 * first gesture: video.load(); video.play().then(() => video.pause()).
 */

function once(el: EventTarget, ev: string): Promise<Event> {
  return new Promise((res) => el.addEventListener(ev, res, { once: true }));
}

/** cover-fit drawImage — the verbatim repaint primitive. */
export function drawImageCover(ctx: CanvasRenderingContext2D, video: HTMLVideoElement): void {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  if (!cw || !ch || video.readyState < 2 || !video.videoWidth) return;
  const scale = Math.max(cw / video.videoWidth, ch / video.videoHeight);
  const w = video.videoWidth * scale;
  const h = video.videoHeight * scale;
  ctx.drawImage(video, (cw - w) / 2, (ch - h) / 2, w, h);
}

export interface ScrubVideoEngineOptions {
  host: HTMLElement;
  clipUrl: string;
  onFirstRepaint?: () => void;
  onFatal?: (err: unknown) => void;
}

export class ScrubVideoEngine implements TickingEngine {
  readonly kind = "video" as const;
  #video: HTMLVideoElement;
  #ctx: CanvasRenderingContext2D;
  #target = 0;
  #lastSeek = 0;
  #lastFrame = -1;
  #suspended = false;
  #warmed = false;
  #rvfcRegistered = false;
  #firstRepaintFired = false;
  #opts: ScrubVideoEngineOptions;
  /** iOS LPM recovery — armed by warmUp rejection, fired on first gesture. */
  #recoveryArm: (() => void) | null = null;

  static FPS = 24; // hero cadence ruling

  constructor(opts: ScrubVideoEngineOptions) {
    this.#opts = opts;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.setAttribute("disableremoteplayback", "");
    video.setAttribute("aria-hidden", "true");
    video.style.display = "none";
    video.src = opts.clipUrl; // created ONLY post-consent (NEVER #2, AC-C3/C10)
    this.#video = video;

    const canvas = document.createElement("canvas");
    canvas.className = "cinema-canvas cinema-canvas-video";
    canvas.setAttribute("aria-hidden", "true");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("cinema video: 2d context unavailable");
    this.#ctx = ctx;
    this.#canvasEl = canvas;
    this.#onResize = this.#onResizeImpl.bind(this);
  }

  #canvasEl: HTMLCanvasElement;
  #onResize: () => void;

  #onResizeImpl(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.#canvasEl.width = Math.round(window.innerWidth * dpr);
    this.#canvasEl.height = Math.round(window.innerHeight * dpr);
    this.repaint();
  }

  async warmUp(): Promise<void> {
    if (this.#warmed) return;
    const v = this.#video; // muted, playsinline, preload="auto", hidden
    try {
      await once(v, "loadedmetadata");
      try {
        await v.play();
        v.pause();
      } catch {
        // iOS Low-Power-Mode: recover on first gesture (§8.3 platform rules)
        this.#recoveryArm = () => {
          this.#recoveryArm = null;
          v.load();
          v.play()
            .then(() => v.pause())
            .catch(() => undefined);
        };
        window.addEventListener("pointerdown", this.#recoveryArm, { once: true, passive: true });
      }
      // rVFC repaint companion — register once per seek cycle; repaint exactly
      // when the decoder presents (mediaTime in the callback).
      if ("requestVideoFrameCallback" in v && !this.#rvfcRegistered) {
        this.#rvfcRegistered = true;
        const onFrame = (_now: number, meta: VideoFrameCallbackMetadata): void => {
          if (meta.presentedFrames !== this.#lastFrame) {
            this.#lastFrame = meta.presentedFrames;
            this.repaint();
          }
          if (!this.#suspended) v.requestVideoFrameCallback(onFrame);
        };
        v.requestVideoFrameCallback(onFrame);
      }
      this.#opts.host.appendChild(this.#video);
      this.#opts.host.appendChild(this.#canvasEl);
      window.addEventListener("resize", this.#onResize);
      this.#warmed = true;
    } catch (err) {
      this.#opts.onFatal?.(err);
      throw err;
    }
  }

  setProgress(p: number): void {
    this.#target = p * (this.#video.duration || 1);
  }

  tick(now: number): void {
    if (!this.#warmed || this.#suspended) return;
    this.repaint(); // ALWAYS repaint last decoded frame
    const v = this.#video;
    if (v.readyState < 2) return; // HAVE_CURRENT_DATA gate
    const dt = Math.abs(this.#target - v.currentTime);
    if (dt < 1 / ScrubVideoEngine.FPS) return; // commit threshold: 1/fps (~42 ms)
    if (now - this.#lastSeek < 80) return; // throttle: last-seek-wins, ~80 ms
    this.#lastSeek = now;
    if (typeof v.fastSeek === "function") {
      v.fastSeek(this.#target);
    } else {
      v.currentTime = this.#target;
    }
  }

  repaint(): void {
    drawImageCover(this.#ctx, this.#video);
    if (!this.#firstRepaintFired && this.#video.readyState >= 2) {
      this.#firstRepaintFired = true;
      this.#opts.onFirstRepaint?.();
    }
  }

  draw(): void {
    this.repaint();
  }

  suspend(): void {
    this.#suspended = true;
    this.#video.pause();
    this.#canvasEl.style.visibility = "hidden";
  }

  resume(): void {
    if (!this.#warmed) return;
    this.#suspended = false;
    this.#canvasEl.style.visibility = "visible";
  }

  get isSuspended(): boolean {
    return this.#suspended;
  }

  /** 2+ chapters away or demotion: free the decoder + canvas. */
  release(): void {
    this.#suspended = true;
    if (this.#recoveryArm) window.removeEventListener("pointerdown", this.#recoveryArm);
    window.removeEventListener("resize", this.#onResize);
    const v = this.#video;
    v.pause();
    v.removeAttribute("src");
    v.load();
    v.remove();
    this.#canvasEl.remove();
    this.#warmed = false;
  }
}
