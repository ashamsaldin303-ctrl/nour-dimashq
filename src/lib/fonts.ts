import { Cairo, Noto_Kufi_Arabic } from "next/font/google";

/**
 * Font contract (brief §2): self-hosted via next/font — NEVER <link> to
 * fonts.googleapis.com, NEVER runtime CDN fonts (Damascus latency law).
 * Subsets: arabic + latin. display: swap (LCP-safe with metric fallbacks).
 */

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-kufi",
  display: "swap",
});

export const fontClass = `${cairo.variable} ${kufi.variable}`;
