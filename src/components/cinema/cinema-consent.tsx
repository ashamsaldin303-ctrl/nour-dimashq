"use client";

import { Button } from "@/components/ui/button";
import { arDigits } from "@/lib/format";

/**
 * M2 cinema layer v2 — the consent door + the persistent film bar (§3/§7).
 *
 * Laws honored here:
 *  - NEVER #9 / AC-C4: the MB label is COMPUTED from manifest
 *    `film.sizeMb` in Arabic-Indic numerals — no typed literal.
 *  - AC-C13: the AI disclosure badge is visible on BOTH the film (bar) and
 *    the door (chip inside the card) — always.
 *  - Door law (T2.1): desktop auto-runs the film (the cinema IS the site);
 *    the door appears ONLY where the bytes are the user's to spend —
 *    touch/small viewport or Save-Data.
 *  - a11y (AC-C11): a labelled region, real buttons, visible focus, and a
 *    scrim-safe text container — no modal focus-trap games.
 */

/** Honest MB label: 4.35 -> "٤٫٤" (Arabic-Indic digits + decimal sep). */
export function formatMbArabic(mb: number): string {
  return arDigits(mb.toFixed(1).replace(".", "٫"));
}

export interface CinemaBarProps {
  /** Film is intersecting the viewport (bar hides below the film). */
  visible: boolean;
  disclosure: string;
  /** Offer the cinematic version (desktop + enabled + undecided). */
  doorOpen: boolean;
  mbTotal: number;
  onAccept: () => void;
  onDecline: () => void;
  /** Tier B video is currently on -> persistent off-toggle. */
  videoOn: boolean;
  onToggleOff: () => void;
}

export function CinemaBar({
  visible,
  disclosure,
  doorOpen,
  mbTotal,
  onAccept,
  onDecline,
  videoOn,
  onToggleOff,
}: CinemaBarProps) {
  return (
    <div className="cinema-bar" data-cinema-visible={visible ? "on" : "off"}>
      <div className="cinema-bar-row">
        {/* disclosure badge — on the film, always (AC-C13) */}
        <span className="cinema-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v3" />
            <path d="M12 18v3" />
            <path d="M3 12h3" />
            <path d="M18 12h3" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          {disclosure}
        </span>
        {videoOn ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cinema-off h-9 border-stone-300/60 bg-stone-50/90 px-4 text-sm font-bold text-stone-900 hover:bg-stone-200 hover:text-stone-900"
            onClick={onToggleOff}
          >
            إيقاف السينما
          </Button>
        ) : null}
      </div>
      {doorOpen ? (
        <div className="cinema-door" role="region" aria-labelledby="cinema-door-title">
          <div className="cinema-door-head">
            <h2 id="cinema-door-title" className="cinema-door-title">
              النسخة السينمائية
            </h2>
            {/* disclosure chip — on the door, always (AC-C13) */}
            <span className="cinema-badge cinema-badge-chip">{disclosure}</span>
          </div>
          <p className="cinema-door-body">
            فيلمٌ كامل يتحرك مع التمرير بحجم ≈{" "}
            <bdi className="num">{formatMbArabic(mbTotal)}</bdi> ميغابايت. الصور مولّدة بالذكاء
            الاصطناعي لأغراض الأجواء فقط.
          </p>
          <div className="cinema-door-actions">
            <Button type="button" className="cta-primary h-11 px-6 text-base active:scale-[0.98]" onClick={onAccept}>
              شغّل الفيلم
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 border-stone-300/60 bg-stone-50/80 px-6 text-base font-bold text-stone-900 hover:bg-stone-50 hover:text-stone-900 active:scale-[0.98]"
              onClick={onDecline}
            >
              البقاء على النسخة الخفيفة
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
