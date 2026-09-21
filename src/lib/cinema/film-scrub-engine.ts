/**
 * M2 cinema layer v2 — the full-film scrub engine (T2.1 rework).
 *
 * WHY THIS EXISTS (the two defects this engine eliminates):
 *  1. The old WebGL keyframe rung rendered every still UPSIDE-DOWN
 *     (UNPACK_FLIP_Y_WEBGL=false + a bottom-up clip-space UV mapping) and
 *     scrolled as a 4-photo slideshow. A native <video> element is
 *     composited by the browser itself: orientation is ALWAYS correct and
 *     the decoded motion is the real film — one continuous shot.
 *  2. The old Tier-B scrubber repainted a canvas at most every 80 ms with a
 *     1/24 s commit gate (<= 12 updates/s — visibly steppy). This engine
 *     issues AT MOST one seek per completed seek-cycle at up to every-frame
 *     cadence on a 60 fps source, with a damped time landing so scroll
 *     velocity translates into butter-smooth, reversible film motion.
 *
 * Platform laws kept from the §8.3 discipline:
 *  - muted + playsinline + NO audio track in the file (silent scrub);
 *  - one seek in flight at a time (a 'seeked' event arms the next one) —
 *    per-scroll seek storms are structurally impossible;
 *  - fastSeek() only for big discontinuous jumps (>= 1.5 s), exact
 *    currentTime for continuous scrub;
 *  - iOS Low-Power-Mode recovery: play() rejection during warmUp arms a
 *    first-gesture recovery (load + play + pause).
 */

export const FILM_SCRUB = {
  /** Damped-landing time constant, seconds — scroll → film-time easing. */
  TAU: 0.07,
  /** Skip seeking when the landed time is within half a frame of current. */
  EPSILON_SEC: 1 / 120,
  /** Jumps >= this many seconds use fastSeek (snap-ish, cheap). */
  FASTSEEK_JUMP_SEC: 1.5,
  /** Stale-seek guard: if 'seeked' never lands, re-arm after this. */
  SEEK_STALE_MS: 250,
  /** warmUp hard timeouts (metadata / playable) before declaring fatal. */
  META_TIMEOUT_MS: 12_000,
  PLAY_TIMEOUT_MS: 20_000,
} as const;

export interface FilmScrubEngineOptions {
  host: HTMLElement;
  videoUrl: string;
  posterUrl: string;
  /** First decoded frame is presentable — orchestrator fades the video in. */
  onFirstFrame?: () => void;
  onFatal?: (err: unknown) => void;
}

function once(el: EventTarget, ev: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(`cinema film: timed out waiting for "${ev}"`));
    }, timeoutMs);
    const ok = () => {
      cleanup();
      resolve();
    };
    const bad = () => {
      cleanup();
      reject(new Error("cinema film: element error event"));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      el.removeEventListener(ev, ok);
      el.removeEventListener("error", bad);
    };
    el.addEventListener(ev, ok, { once: true });
    el.addEventListener("error", bad, { once: true });
  });
}

export class FilmScrubEngine {
  #opts: FilmScrubEngineOptions;
  #video: HTMLVideoElement;
  #duration = 0;
  #targetSec = 0;
  #landedSec = 0;
  #seekInFlight = false;
  #staleTimer: number | null = null;
  #warmed = false;
  #suspended = false;
  #released = false;
  #firstFrameFired = false;
  #recoveryArm: (() => void) | null = null;
  #onSeeking: () => void;
  #onSeeked: () => void;
  #onError: () => void;

  constructor(opts: FilmScrubEngineOptions) {
    this.#opts = opts;
    const video = document.createElement("video");
    video.className = "cinema-video";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("disableremoteplayback", "");
    video.setAttribute("aria-hidden", "true");
    video.setAttribute("poster", opts.posterUrl);
    video.src = opts.videoUrl; // created ONLY when the film is actually on
    this.#video = video;

    // Seek-cycle discipline: 'seeked' re-arms the next seek. A stale guard
    // covers engines that skip events on same-time assignments.
    this.#onSeeking = () => {
      this.#seekInFlight = true;
    };
    this.#onSeeked = () => {
      this.#seekInFlight = false;
      if (this.#staleTimer !== null) {
        window.clearTimeout(this.#staleTimer);
        this.#staleTimer = null;
      }
      if (!this.#firstFrameFired && this.#video.readyState >= 2) {
        this.#firstFrameFired = true;
        this.#opts.onFirstFrame?.();
      }
    };
    this.#onError = () => {
      if (!this.#released) this.#opts.onFatal?.(new Error("cinema film: video element error"));
    };
    video.addEventListener("seeking", this.#onSeeking);
    video.addEventListener("seeked", this.#onSeeked);
    video.addEventListener("error", this.#onError);
  }

  /** Load metadata, prime the decoder, land on frame 0, mount into the stage. */
  async warmUp(): Promise<void> {
    if (this.#warmed || this.#released) return;
    const v = this.#video;
    try {
      await once(v, "loadedmetadata", FILM_SCRUB.META_TIMEOUT_MS);
      this.#duration = v.duration && Number.isFinite(v.duration) ? v.duration : 0;
      if (this.#duration <= 0) throw new Error("cinema film: non-finite duration");
      await once(v, "canplaythrough", FILM_SCRUB.PLAY_TIMEOUT_MS);
      // iOS Low-Power-Mode: a rejected play() means the decoder may refuse
      // seeks until a gesture — arm the standard recovery.
      try {
        await v.play();
        v.pause();
      } catch {
        this.#recoveryArm = () => {
          this.#recoveryArm = null;
          v.load();
          v.play()
            .then(() => v.pause())
            .catch(() => undefined);
        };
        window.addEventListener("pointerdown", this.#recoveryArm, { once: true, passive: true });
      }
      // Land exactly on frame 0 and wait for the decoder to present it —
      // the orchestrator fades the video in only after this completes.
      v.currentTime = 0;
      this.#seekInFlight = true;
      await once(v, "seeked", FILM_SCRUB.SEEK_STALE_MS * 4);
      this.#opts.host.appendChild(v);
      this.#warmed = true;
    } catch (err) {
      this.#opts.onFatal?.(err);
      throw err;
    }
  }

  /** Scroll progress 0..1 → film time target. */
  setProgress(p: number): void {
    const clamped = Math.min(1, Math.max(0, p));
    this.#targetSec = clamped * this.#duration;
  }

  /**
   * The ONE clock tick (gsap.ticker — same clock as Lenis/ScrollTrigger):
   * damped landing toward the target, then at most one guarded seek.
   */
  tick(_nowMs: number, dtSeconds: number): void {
    if (!this.#warmed || this.#suspended || this.#released) return;
    const dt = Math.min(Math.max(dtSeconds, 0.0001), 0.25);
    this.#landedSec += (this.#targetSec - this.#landedSec) * (1 - Math.exp(-dt / FILM_SCRUB.TAU));
    const v = this.#video;
    if (v.readyState < 2 || v.seeking || this.#seekInFlight) return;
    const delta = this.#landedSec - v.currentTime;
    if (Math.abs(delta) < FILM_SCRUB.EPSILON_SEC) return;
    // Arm the stale guard, then seek (fastSeek for discontinuous jumps).
    if (this.#staleTimer !== null) window.clearTimeout(this.#staleTimer);
    this.#staleTimer = window.setTimeout(() => {
      this.#seekInFlight = false;
      this.#staleTimer = null;
    }, FILM_SCRUB.SEEK_STALE_MS);
    this.#seekInFlight = true;
    if (Math.abs(delta) >= FILM_SCRUB.FASTSEEK_JUMP_SEC && typeof v.fastSeek === "function") {
      v.fastSeek(this.#landedSec);
    } else {
      v.currentTime = this.#landedSec;
    }
  }

  /** Video is presentable (first frame decoded) — orchestrator fades it in. */
  get isLive(): boolean {
    return this.#firstFrameFired;
  }

  get videoElement(): HTMLVideoElement {
    return this.#video;
  }

  suspend(): void {
    this.#suspended = true;
    this.#video.pause();
    this.#video.style.visibility = "hidden";
  }

  resume(): void {
    if (!this.#warmed || this.#released) return;
    this.#suspended = false;
    this.#video.style.visibility = "visible";
  }

  get isSuspended(): boolean {
    return this.#suspended;
  }

  /** Film off / unmount: free the decoder completely. */
  release(): void {
    this.#released = true;
    this.#suspended = true;
    if (this.#recoveryArm) window.removeEventListener("pointerdown", this.#recoveryArm);
    if (this.#staleTimer !== null) window.clearTimeout(this.#staleTimer);
    this.#staleTimer = null;
    const v = this.#video;
    v.removeEventListener("seeking", this.#onSeeking);
    v.removeEventListener("seeked", this.#onSeeked);
    v.removeEventListener("error", this.#onError);
    v.pause();
    v.removeAttribute("src");
    v.load();
    v.remove();
    this.#warmed = false;
  }
}
