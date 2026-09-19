"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  isAnalyticsEnabled,
  navigationBaselineMs,
  trackTimeToFirstListing,
  trackWaClick,
} from "@/lib/analytics";
import type { WaSource } from "@/lib/wa";

/**
 * AnalyticsInit — mounts exactly the two product events (brief §8):
 *  1. whatsapp_click on every wa.me link (event delegation, reads data-attrs)
 *  2. time_to_first_listing once, when the first [data-listing-card] intersects
 * NEXT_PUBLIC_GA4_ID unset -> no scripts load at all (no-op logger).
 */
export function AnalyticsInit() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href*="wa.me/"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      trackWaClick(
        anchor.dataset.waProperty ?? "unknown",
        (anchor.dataset.waSource as WaSource | undefined) ?? "direct",
      );
    };
    document.addEventListener("click", onClick);

    let io: IntersectionObserver | null = null;
    const first = document.querySelector<HTMLElement>("[data-listing-card]");
    if (first) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) {
            io?.disconnect();
            trackTimeToFirstListing(performance.now() - navigationBaselineMs());
          }
        },
        { threshold: 0.25 },
      );
      io.observe(first);
    }

    return () => {
      document.removeEventListener("click", onClick);
      io?.disconnect();
    };
  }, []);

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  if (!isAnalyticsEnabled() || !ga4Id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${ga4Id}');
        `}
      </Script>
    </>
  );
}
