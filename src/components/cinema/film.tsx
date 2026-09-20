"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import {
  loadCinemaManifest,
  checkSceneBudgets,
  type CinemaManifest,
} from "@/lib/cinema/manifest";
import { KeyframeEngine } from "@/lib/cinema/keyframe-engine";
import { ScrubVideoEngine } from "@/lib/cinema/scrub-video-engine";
import { CssKeyframeEngine, webgl2Supported, isDesktopViewport, prefersReducedMotion } from "@/lib/cinema/fallback";
import { initSpine, disposeSpine, refreshAfterFonts, gsap } from "@/lib/cinema/spine";
import { ProgressStore, computeShift } from "@/lib/cinema/progress-store";
import { CinemaPrologue } from "./cinema-prologue";
import { CinemaChapter } from "./cinema-chapter";
import { CinemaBar } from "./cinema-consent";

/**
 * M2 cinema layer — the orchestrator (§4): consent -> spine -> engines ->
 * match-cut. Mounted inside the M1 hero slot ([data-cinema-slot="hero"]) via
 * the dynamic wrapper (zero cinema JS in the initial M1 bundle, AC-C9).
 *
 * Tier law: Tier A (keyframes + depth, zero video bytes) renders everywhere;
 * Tier B (three 720w all-intra clips) is desktop-only, behind the consent
 * door, demotable by env flag or the off-toggle. The M1 hero beneath stays
 * intact for no-JS, failure, and pre-activation states — fail-closed, never
 * broken.
 */

type Phase = "boot" | "off" | "error" | "statics" | "animated";
type Consent = "undecided" | "on" | "off";

const STORAGE_KEY = "nour-dimashq:cinema-tierb";

/* §7 copy — verbatim, v1 (pending owner approval). */
const PROLOGUE_TITLE = "نور دمشق";
const PROLOGUE_SUB = "وسيطٌ عقاري دمشقي يعمل كفيلم — والبيوت حقيقية";
const PROLOGUE_CUE = "تابع النزول";
const MATCHCUT_LINE = "وهنا تبدأ الحكاية التالية — بيوتٌ حقيقية بانتظارك.";

const TIER_B_ENV = process.env.NEXT_PUBLIC_CINEMA_TIER_B === "true";

export function Film() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>("boot");
  const [manifest, setManifest] = useState<CinemaManifest | null>(null);
  const [consent, setConsent] = useState<Consent>("undecided");
  const [desktop, setDesktop] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [videoOn, setVideoOn] = useState(false);

  /* Engine machinery refs — one machine, re-configured in place. */
  const mediaElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const enginesRef = useRef<(KeyframeEngine | CssKeyframeEngine)[]>([]);
  const videoRef = useRef<(ScrubVideoEngine | null)[]>([]);
  const warmedRef = useRef<Set<number>>(new Set());
  const activeChapterRef = useRef(0);
  const pointerRef = useRef<[number, number]>([0, 0]);
  const consentRef = useRef<Consent>("undecided");
  const badgesRef = useRef({ tierA: false, gated: false, video: false });
  const activateVideoTierRef = useRef<((on: boolean) => void) | null>(null);

  /* ------------------------------------------------------------------ boot */
  useEffect(() => {
    let alive = true;
    if (process.env.NEXT_PUBLIC_CINEMA_ENABLED !== "true") {
      setPhase("off");
      return;
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "on" || saved === "off") {
        setConsent(saved);
        consentRef.current = saved;
      }
    } catch {
      /* private mode — treat as undecided */
    }
    void (async () => {
      try {
        const m = await loadCinemaManifest();
        await checkSceneBudgets(m); // runtime byte guard (§6)
        if (!alive) return;
        setManifest(m);
        if (prefersReducedMotion()) {
          // reduced-motion ladder rung: keyframe stills, no rAF loop (AC-C6)
          setPhase("statics");
          console.info("cinema:static");
          return;
        }
        setPhase("animated");
      } catch (err) {
        console.error("cinema: off —", err instanceof Error ? err.message : String(err));
        if (alive) setPhase("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* --------------------------------------------------- desktop viewport (AC-C5) */
  useEffect(() => {
    const update = () => setDesktop(isDesktopViewport());
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ------------------------------------------------- takeover attr + bar IO */
  useEffect(() => {
    if (phase !== "statics" && phase !== "animated") return;
    const root = rootRef.current;
    if (!root) return;
    const host = root.closest<HTMLElement>('[data-cinema-slot="hero"]');
    host?.setAttribute("data-cinema-active", "on");
    const io = new IntersectionObserver(
      (entries) => setBarVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      host?.removeAttribute("data-cinema-active");
    };
  }, [phase]);

  /* --------------------------------------------------- the animated machine */
  useEffect(() => {
    if (phase !== "animated" || !manifest) return;
    const root = rootRef.current;
    if (!root) return;
    const scenes = manifest.scenes;
    const store = new ProgressStore();
    const lenis = initSpine();
    const useGL = webgl2Supported();
    const tierBEligible = () =>
      TIER_B_ENV && manifest.consent.tierB.enabled && isDesktopViewport() && !prefersReducedMotion();

    const fireTierABadge = () => {
      if (!badgesRef.current.tierA) {
        badgesRef.current.tierA = true;
        console.info("cinema:tierA ok");
      }
    };

    const buildCssEngine = (j: number): CssKeyframeEngine => {
      const hostEl = mediaElsRef.current[j];
      const scene = scenes[j]!;
      return new CssKeyframeEngine({
        host: hostEl!,
        colorAUrl: scene.keyframes.A,
        colorBUrl: scene.keyframes.B,
      });
    };

    /** One engine failed (warm/compile) -> CSS rung for that chapter. */
    const demoteChapterToCss = (j: number, why: unknown): void => {
      console.warn(`cinema: chapter ${j + 1} -> CSS rung (${why instanceof Error ? why.message : String(why)})`);
      enginesRef.current[j]?.release();
      warmedRef.current.delete(j);
      const css = buildCssEngine(j);
      enginesRef.current[j] = css;
      warmedRef.current.add(j);
      void css
        .warmUp()
        .then(() => {
          css.resume();
          fireTierABadge();
        })
        .catch(() => undefined);
    };

    /* engines: WebGL2 keyframes (or CSS rung when GL is unavailable) */
    enginesRef.current = scenes.map((scene, j) => {
      const hostEl = mediaElsRef.current[j];
      if (!hostEl) return new CssKeyframeEngine({ host: root, colorAUrl: scene.keyframes.A, colorBUrl: scene.keyframes.B });
      if (useGL) {
        return new KeyframeEngine({
          host: hostEl,
          colorAUrl: scene.keyframes.A,
          colorBUrl: scene.keyframes.B,
          depthAUrl: scene.depth?.A,
          depthBUrl: scene.depth?.B,
          onFirstDraw: fireTierABadge,
          onContextLost: () => demoteChapterToCss(j, new Error("webglcontextlost")),
        });
      }
      return new CssKeyframeEngine({ host: hostEl, colorAUrl: scene.keyframes.A, colorBUrl: scene.keyframes.B });
    });

    /** Warm/suspend/release window around the active chapter (§8.1 laws). */
    const applyWarmWindow = (active: number): void => {
      const wantVideo = consentRef.current === "on" && tierBEligible();
      for (let j = 0; j < scenes.length; j++) {
        const dist = Math.abs(j - active);
        const engine = enginesRef.current[j];
        const video = videoRef.current[j];
        if (dist <= 1) {
          if (video && !video.isSuspended) {
            engine?.suspend(); // Tier B is the surface; keyframes stay warm beneath
          } else if (engine) {
            engine.resume();
            if (!warmedRef.current.has(j)) {
              warmedRef.current.add(j);
              void engine
                .warmUp()
                .then(() => {
                  engine.resume();
                  fireTierABadge();
                })
                .catch((err: unknown) => demoteChapterToCss(j, err));
            }
          }
        } else {
          engine?.suspend();
          if (dist >= 2) {
            // 2+ chapters away: free VRAM/decoders (§8.1 release law)
            engine?.release();
            warmedRef.current.delete(j);
          }
        }
        /* Tier B window: <= 2 warm videos at any moment (structural: dist<=1) */
        if (wantVideo && dist <= 1 && !videoRef.current[j] && manifest.consent.tierB.chain[j]) {
          const hostEl = mediaElsRef.current[j];
          const clip = manifest.consent.tierB.chain[j]!;
          if (hostEl) {
            const ve = new ScrubVideoEngine({
              host: hostEl,
              clipUrl: clip,
              onFatal: () => {
                videoRef.current[j]?.release();
                videoRef.current[j] = null;
                enginesRef.current[j]?.resume();
              },
            });
            videoRef.current[j] = ve;
            void ve
              .warmUp()
              .then(() => {
                ve.resume();
                enginesRef.current[j]?.suspend();
                setVideoOn(true);
                if (!badgesRef.current.video) {
                  badgesRef.current.video = true;
                  console.info("cinema:tierB on");
                }
              })
              .catch(() => {
                videoRef.current[j] = null;
                enginesRef.current[j]?.resume();
              });
          }
        } else if (videoRef.current[j] && dist >= 2) {
          videoRef.current[j]!.release();
          videoRef.current[j] = null;
        }
      }
    };

    const releaseAllVideos = (): void => {
      for (let j = 0; j < videoRef.current.length; j++) {
        videoRef.current[j]?.release();
        videoRef.current[j] = null;
      }
      for (const e of enginesRef.current) e?.resume();
      setVideoOn(false);
    };

    activateVideoTierRef.current = (on: boolean) => {
      if (on) applyWarmWindow(activeChapterRef.current);
      else releaseAllVideos();
    };

    /* Timelines: pinned chapter scrub, one clock, matchMedia variants.
       The third condition is the catch-all: environments reporting
       `pointer: none` (headless/AT) must still get the pinned film —
       scrub falls to the gentler touch value there. */
    const chapterEls = scenes.map((_, i) => root.querySelector<HTMLElement>(`.chapter-${i + 1}`));
    const mm = gsap.matchMedia();
    mm.add(
      { fine: "(pointer: fine)", coarse: "(pointer: coarse)", none: "(pointer: none)" },
      (ctx) => {
        const scrub = ctx.conditions?.fine ? 0.9 : 0.5; // wheel 0.8–1 · touch ~0.5
        const tls = chapterEls.map((el, i) => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el!,
              start: "top top",
              end: "+=100%", // 1 viewport-height of pinned scrub (film math §8.4)
              pin: true, // never animate the pinned element itself — children only
              pinSpacing: true,
              anticipatePin: 1, // pre-unpins 1 tick: no flash on fast scroll
              invalidateOnRefresh: true,
              scrub,
              onUpdate: (self) => {
                store.setChapter(i, self.progress);
                enginesRef.current[i]?.setProgress(self.progress);
                videoRef.current[i]?.setProgress(self.progress);
              },
            },
          });
          const mediaEl = el?.querySelector(".media");
          const words = el?.querySelectorAll(".cw");
          const lede = el?.querySelector(".lede");
          if (mediaEl) tl.fromTo(mediaEl, { scale: 1.06 }, { scale: 1.0, ease: "none" }, 0);
          if (words && words.length > 0) {
            tl.from(words, { yPercent: 120, stagger: 0.08, ease: "power2.out" }, 0.1);
          }
          if (lede) tl.to(lede, { autoAlpha: 0, y: -40 }, 0.75);
          return tl;
        });
        return () => {
          for (const t of tls) {
            t.scrollTrigger?.kill();
            t.kill();
          }
        };
      },
    );

    /* The ONE ticker: engines tick from the same clock as Lenis (§8.4). */
    const onTick = (time: number, deltaTime: number): void => {
      const dt = Math.min(Math.max(deltaTime / 1000, 0.0001), 0.25);
      const shift = computeShift(lenis.velocity ?? 0, pointerRef.current);
      const active = activeChapterRef.current;
      for (let j = 0; j < scenes.length; j++) {
        if (Math.abs(j - active) > 1) continue;
        enginesRef.current[j]?.tick(time * 1000, dt, shift);
        videoRef.current[j]?.tick(time * 1000);
      }
    };
    gsap.ticker.add(onTick);

    /* Pointer parallax feed (desktop only, |x|+|y| <= 0.02 law in computeShift). */
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointer = (e: PointerEvent): void => {
      pointerRef.current = [
        e.clientX / window.innerWidth - 0.5,
        e.clientY / window.innerHeight - 0.5,
      ];
    };
    if (finePointer) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    /* AC-C5: demote Tier B if the viewport stops being desktop. */
    const onResizeDemote = (): void => {
      if (!isDesktopViewport() && videoRef.current.some(Boolean)) {
        releaseAllVideos();
      }
    };
    window.addEventListener("resize", onResizeDemote, { passive: true });

    /* Warm the first window (chapter 0 + 1). */
    applyWarmWindow(0);

    /* Chapter tracking drives the warm window. */
    const unsubscribe = store.subscribe((s) => {
      if (s.chapter !== activeChapterRef.current) {
        activeChapterRef.current = s.chapter;
        applyWarmWindow(s.chapter);
      }
    });

    refreshAfterFonts(); // Cairo/Kufi load -> re-measure triggers

    return () => {
      unsubscribe();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResizeDemote);
      gsap.ticker.remove(onTick);
      mm.revert();
      for (const v of videoRef.current) v?.release();
      videoRef.current = [];
      for (const e of enginesRef.current) e?.release();
      enginesRef.current = [];
      warmedRef.current.clear();
      activateVideoTierRef.current = null;
      disposeSpine();
    };
  }, [phase, manifest]);

  /* ------------------------------------------------------------ consent UX */
  const decide = (accept: boolean): void => {
    const next: Consent = accept ? "on" : "off";
    setConsent(next);
    consentRef.current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* persistence unavailable — runtime choice only */
    }
    activateVideoTierRef.current?.(accept);
  };

  const doorOpen =
    phase === "animated" &&
    !!manifest?.consent.tierB.enabled &&
    TIER_B_ENV &&
    consent === "undecided" &&
    desktop;

  useEffect(() => {
    if (doorOpen && !badgesRef.current.gated) {
      badgesRef.current.gated = true;
      console.info("cinema:tierB gated");
    }
  }, [doorOpen]);

  /* -------------------------------------------------------------- render */
  if (phase === "boot" || phase === "off" || phase === "error" || !manifest) {
    return null;
  }

  return (
    <div className="cinema-root" ref={rootRef}>
      <CinemaPrologue title={PROLOGUE_TITLE} sub={PROLOGUE_SUB} cue={PROLOGUE_CUE} />
      {manifest.scenes.map((scene, i) => (
        <CinemaChapter
          key={scene.id}
          index={i}
          title={scene.title}
          caption={scene.caption}
          stillUrl={phase === "statics" ? scene.keyframes.A : undefined}
          mediaRef={(el) => {
            mediaElsRef.current[i] = el;
          }}
        />
      ))}
      {/* match-cut: the film hands the visitor to the funnel (§1/§7) */}
      <div className="cinema-matchcut">
        <Link href={manifest.film.matchCutTo} className="cinema-matchcut-link">
          <span>{MATCHCUT_LINE}</span>
          <ArrowDown className="size-5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
      <CinemaBar
        visible={barVisible}
        disclosure={manifest.disclosure}
        doorOpen={doorOpen}
        mbTotal={manifest.consent.tierB.clipsMbTotal}
        onAccept={() => decide(true)}
        onDecline={() => decide(false)}
        videoOn={videoOn}
        onToggleOff={() => decide(false)}
      />
    </div>
  );
}
