"use client";

/**
 * M2 cinema layer — the prologue rung (§4): 100vh unpinned poster.
 * The M1 poster (fetchpriority law intact — M1's priority <Image> in the
 * hidden .cinema-m1-content remains the sole high-priority image; this rung
 * reuses the same URL from browser cache). Copy: §7 verbatim, v1.
 */

export interface CinemaPrologueProps {
  /** Prologue H1 (§7): «نور دمشق» */
  title: string;
  /** Prologue subline (§7) */
  sub: string;
  /** Scroll cue microcopy */
  cue: string;
}

export function CinemaPrologue({ title, sub, cue }: CinemaPrologueProps) {
  return (
    <div className="cinema-prologue">
      <div className="cinema-prologue-poster" aria-hidden="true" />
      <div className="cinema-prologue-scrim" aria-hidden="true" />
      <div className="cinema-prologue-copy">
        <h1 className="cinema-prologue-h1">{title}</h1>
        <p className="cinema-prologue-sub">{sub}</p>
        <p className="cinema-prologue-cue" aria-hidden="true">
          <svg className="cinema-cue-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
          <span>{cue}</span>
        </p>
      </div>
    </div>
  );
}
