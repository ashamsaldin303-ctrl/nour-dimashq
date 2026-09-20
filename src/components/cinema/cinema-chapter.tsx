"use client";

import { arDigits } from "@/lib/format";

/**
 * M2 cinema layer — the pinned chapter shell (§4): media surface (engines
 * mount here) + captions. Presentational only; the film orchestrator owns
 * engines, timelines, and the warm window. Captions split into WORD spans at
 * build time (Arabic shaping law — NEVER per-character, §5/NEVER #6).
 */

export interface CinemaChapterProps {
  /** 0-based chapter index. */
  index: number;
  title: string;
  caption?: string;
  /** Statics variant (reduced-motion): render the A keyframe still, no engine. */
  stillUrl?: string;
  /** Callback ref for the engine host (.media) element. */
  mediaRef: (el: HTMLDivElement | null) => void;
}

export function CinemaChapter({ index, title, caption, stillUrl, mediaRef }: CinemaChapterProps) {
  const n = index + 1;
  const words = (caption ?? "").split(" ").filter(Boolean);
  return (
    <section className={`chapter chapter-${n}`} data-chapter={n} aria-label={title}>
      <div className="cinema-media media" ref={mediaRef} aria-hidden="true">
        {stillUrl ? (
          // Statics rung: keyframe still (reduced-motion ladder — no rAF, no canvas)
          <img className="cinema-still" src={stillUrl} alt="" loading="lazy" decoding="async" />
        ) : null}
      </div>
      <div className="cinema-scrim" aria-hidden="true" />
      <div className="cinema-chapter-copy">
        <h2 className="cinema-kicker">
          <bdi className="num">{arDigits(`0${n}`)}</bdi>
          <span className="cinema-kicker-sep" aria-hidden="true">
            —
          </span>
          {title}
        </h2>
        {words.length > 0 ? (
          <p className="cinema-lede lede">
            {words.map((w, i) => (
              <span key={i} className="cw">
                {w}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </section>
  );
}
