"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import {
  loadCinemaManifest,
  checkFilmBytes,
  type CinemaCaption,
  type CinemaManifest,
} from "@/lib/cinema/manifest";
import { FilmScrubEngine } from "@/lib/cinema/film-scrub-engine";
import { isDesktopViewport, prefersReducedMotion, saveDataOn } from "@/lib/cinema/fallback";
import { initSpine, disposeSpine, refreshAfterFonts, gsap, ScrollTrigger } from "@/lib/cinema/spine";
import { arDigits } from "@/lib/format";
import { CinemaPrologue } from "./cinema-prologue";
import { CinemaBar } from "./cinema-consent";

/**
 * M2 cinema layer v2 — the full-film orchestrator (T2.1 rework).
 *
 * THE RULING (user, verbatim intent): «تناسب الهيكلية الكاملة للموقع على
 * الفيديو بشكل كامل، وليس الفيديو على الهيكلية» — the site's structure is
 * built AROUND the video. One continuous H.264 film is the sticky stage; the
 * scroll runway scrubs its timeline 0→duration; the captions (العتبة/الباح/
 * النور) are time-windowed overlays ON the film; the match-cut hands over to
 * the funnel. No keyframe stills, no WebGL rung, no clipped chapter chain.
 *
 * Ladder: reduced-motion → statics (poster + captions in flow, zero JS
 * motion) · consent off / failure → poster rung (sticky stage, poster still,
 * zero video bytes) · desktop → film auto-on (the cinema IS the site) ·
 * touch / Save-Data → honest-MB door first. Fail-closed: the M1 hero
 * beneath stays intact for no-JS, boot, error, and off states.
 */

type Phase = "boot" | "off" | "error" | "statics" | "animated";
type Consent = "undecided" | "on" | "off";

const STORAGE_KEY = "nour-dimashq:cinema";
/** T2 Tier-B key — honored as a migration signal, never written again. */
const LEGACY_STORAGE_KEY = "nour-dimashq:cinema-tierb";

/* §7 copy — verbatim, v1 (pending owner approval). */
const PROLOGUE_TITLE = "نور دمشق";
const PROLOGUE_SUB = "وسيطٌ عقاري دمشقي يعمل كفيلم — والبيوت حقيقية";
const PROLOGUE_CUE = "تابع النزول";
const MATCHCUT_LINE = "وهنا تبدأ الحكاية التالية — بيوتٌ حقيقية بانتظارك.";

const CINEMA_ENABLED = process.env.NEXT_PUBLIC_CINEMA_ENABLED === "true";

/** Caption overlay — words pre-split at build time (Arabic shaping law). */
function CaptionOverlay({ caption }: { caption: CinemaCaption }) {
  const words = caption.text.split(" ").filter(Boolean);
  return (
    <div className="cinema-caption" data-caption-id={caption.id}>
      <h2 className="cinema-kicker">
        <bdi className="num">{arDigits(`0${caption.index}`)}</bdi>
        <span className="cinema-kicker-sep" aria-hidden="true">
          —
        </span>
        {caption.title}
      </h2>
      <p className="cinema-lede">
        {words.map((w, i) => (
          <span
            key={i}
            className="cw"
            style={{ transitionDelay: `${Math.min(i * 70, 560)}ms` }}
          >
            {w}
          </span>
        ))}
      </p>
    </div>
  );
}

export function Film() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>(CINEMA_ENABLED ? "boot" : "off");
  const [manifest, setManifest] = useState<CinemaManifest | null>(null);
  const [consent, setConsent] = useState<Consent>("undecided");
  const [desktop, setDesktop] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [videoOn, setVideoOn] = useState(false);

  const consentRef = useRef<Consent>("undecided");
  const desktopRef = useRef(false);
  const activateRef = useRef<((on: boolean) => void) | null>(null);
  const liveBadgeRef = useRef(false);

  /* ------------------------------------------------------------------ boot */
  useEffect(() => {
    if (!CINEMA_ENABLED) return; // phase is already "off" from initial state
    let alive = true;
    void (async () => {
      /* consent restore (async context — localStorage may throw in private mode) */
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        const restored: Consent | null =
          saved === "on" || saved === "off"
            ? saved
            : legacy === "on" || legacy === "off"
              ? legacy
              : null;
        if (restored) {
          consentRef.current = restored;
          setConsent(restored);
        }
      } catch {
        /* private mode — treat as undecided */
      }
      try {
        const m = await loadCinemaManifest();
        await checkFilmBytes(m); // honest-MB guard (HEAD only, zero video bytes)
        if (!alive) return;
        setManifest(m);
        if (prefersReducedMotion()) {
          setPhase("statics"); // reduced-motion rung: no engine, no rAF (AC-C6)
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

  /* --------------------------------------------------- desktop viewport (door law) */
  useEffect(() => {
    const update = () => {
      const d = isDesktopViewport();
      desktopRef.current = d;
      setDesktop(d);
    };
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

  /* ------------------------------------------- the animated machine (one film) */
  useEffect(() => {
    if (phase !== "animated" || !manifest) return;
    const root = rootRef.current;
    const runway = runwayRef.current;
    const host = hostRef.current;
    if (!root || !runway || !host) return;

    const lenis = initSpine(); // the ONE clock (Lenis + ScrollTrigger + engine)
    const durationSec = manifest.film.durationSec;
    const captionEls = manifest.captions.map((c) =>
      root.querySelector<HTMLElement>(`[data-caption-id="${c.id}"]`),
    );

    let engine: FilmScrubEngine | null = null;

    const startVideo = (): void => {
      if (engine || consentRef.current !== "on") return;
      engine = new FilmScrubEngine({
        host,
        videoUrl: manifest.film.src,
        posterUrl: manifest.film.poster,
        onFirstFrame: () => {
          host.classList.add("is-live"); // CSS fades the film over the poster
          setVideoOn(true);
          if (!liveBadgeRef.current) {
            liveBadgeRef.current = true;
            console.info("cinema:film live");
          }
        },
        onFatal: (err) => {
          console.warn(
            "cinema:film demoted to poster rung —",
            err instanceof Error ? err.message : String(err),
          );
          stopVideo();
        },
      });
      engine.warmUp().catch(() => stopVideo());
    };

    const stopVideo = (): void => {
      engine?.release();
      engine = null;
      host.classList.remove("is-live");
      setVideoOn(false);
    };

    activateRef.current = (on: boolean) => {
      if (on) startVideo();
      else stopVideo();
    };

    /* The scrub timeline: runway progress → film time + caption windows.
       Sticky owns the pin (no ScrollTrigger pin spacer) — the stage holds
       while the runway scrolls; captions are deterministic window toggles,
       fully reversible in both scroll directions. */
    const st = ScrollTrigger.create({
      trigger: runway,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        engine?.setProgress(p);
        const t = p * durationSec;
        for (let i = 0; i < manifest.captions.length; i++) {
          const c = manifest.captions[i]!;
          captionEls[i]?.classList.toggle("is-in", t >= c.fromSec && t <= c.toSec);
        }
      },
    });

    const onTick = (time: number, deltaTime: number): void => {
      engine?.tick(time * 1000, deltaTime / 1000);
    };
    gsap.ticker.add(onTick);

    refreshAfterFonts(); // Cairo/Kufi load → re-measure triggers

    return () => {
      gsap.ticker.remove(onTick);
      st.kill();
      engine?.release();
      engine = null;
      activateRef.current = null;
      disposeSpine();
    };
  }, [phase, manifest]);

  /* --------------------------- auto-start law: desktop default is the film */
  useEffect(() => {
    if (phase !== "animated" || !manifest) return;
    const auto =
      consent === "on" || (consent === "undecided" && desktop && !saveDataOn());
    if (auto) activateRef.current?.(true);
  }, [phase, manifest, consent, desktop]);

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
    activateRef.current?.(accept);
  };

  /* Door law: offered ONLY where the bytes are the user's to spend —
     touch/small viewport, or Save-Data anywhere. Desktop default: auto-on. */
  const doorOpen =
    phase === "animated" && !!manifest && consent === "undecided" && (!desktop || saveDataOn());

  /* -------------------------------------------------------------- render */
  if (phase === "boot" || phase === "off" || phase === "error" || !manifest) {
    return null;
  }

  return (
    <div className="cinema-root" ref={rootRef}>
      <CinemaPrologue title={PROLOGUE_TITLE} sub={PROLOGUE_SUB} cue={PROLOGUE_CUE} />
      {phase === "statics" ? (
        /* reduced-motion rung: the film told as a static storyboard */
        <section className="cinema-statics" aria-label="فيلم نور دمشق">
          <div className="cinema-statics-media">
            <Image
              src={manifest.film.poster}
              alt=""
              fill
              sizes="100vw"
              loading="lazy"
              className="object-cover"
            />
            <div className="cinema-stage-scrim" aria-hidden="true" />
          </div>
          <div className="cinema-statics-list">
            {manifest.captions.map((c) => (
              <div key={c.id} className="cinema-static">
                <h2 className="cinema-kicker">
                  <bdi className="num">{arDigits(`0${c.index}`)}</bdi>
                  <span className="cinema-kicker-sep" aria-hidden="true">
                    —
                  </span>
                  {c.title}
                </h2>
                <p className="cinema-static-text">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* the full film: sticky stage + scroll runway (structure ON video) */
        <div
          className="cinema-runway"
          ref={runwayRef}
          style={{ "--cinema-runway": manifest.film.runwayVh } as React.CSSProperties}
        >
          <div className="cinema-stage" role="region" aria-label="فيلم نور دمشق — دارٌ دمشقية">
            <div className="cinema-stage-media" ref={hostRef}>
              <Image
                src={manifest.film.poster}
                alt=""
                fill
                sizes="100vw"
                loading="lazy"
                className="cinema-stage-poster object-cover"
              />
              {/* FilmScrubEngine mounts <video class="cinema-video"> here —
                  faded in over this same-frame poster only when frame 0 is
                  decoded (is-live), so the first paint is never a flash. */}
            </div>
            <div className="cinema-stage-scrim" aria-hidden="true" />
            <div className="cinema-captions">
              {manifest.captions.map((c) => (
                <CaptionOverlay key={c.id} caption={c} />
              ))}
            </div>
          </div>
        </div>
      )}
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
        mbTotal={manifest.film.sizeMb}
        onAccept={() => decide(true)}
        onDecline={() => decide(false)}
        videoOn={videoOn}
        onToggleOff={() => decide(false)}
      />
    </div>
  );
}
