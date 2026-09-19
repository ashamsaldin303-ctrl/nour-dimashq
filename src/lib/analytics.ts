import type { WaSource } from "./wa";

/**
 * GA4 analytics — exactly TWO product events, never more (brief §8, NEVER-14):
 *   1. whatsapp_click        { property_id, source }   — on every wa.me click
 *   2. time_to_first_listing { value_ms }              — once, when the first
 *        ListingCard enters viewport (navigation entry baseline)
 *
 * NEXT_PUBLIC_GA4_ID unset = no-op logger (no script, no network).
 */

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function isAnalyticsEnabled(): boolean {
  return Boolean(GA4_ID);
}

export function trackWaClick(propertyId: string, source: WaSource): void {
  const payload = { property_id: propertyId, source };
  if (GA4_ID && typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "whatsapp_click", payload);
  } else {
    // unset = no-op logger (brief §8): debug-level, never an error, never blocks
    console.debug("[analytics:noop] whatsapp_click", payload);
  }
}

let timeToFirstFired = false;

export function trackTimeToFirstListing(valueMs: number): void {
  if (timeToFirstFired) return;
  timeToFirstFired = true;
  const payload = { value_ms: Math.max(0, Math.round(valueMs)) };
  if (GA4_ID && typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "time_to_first_listing", payload);
  } else {
    console.debug("[analytics:noop] time_to_first_listing", payload);
  }
}

/** Baseline for time_to_first_listing: performance navigation entry start. */
export function navigationBaselineMs(): number {
  if (typeof performance === "undefined" || !performance.getEntriesByType) return 0;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return nav ? nav.startTime : 0;
}
