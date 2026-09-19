import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontClass } from "@/lib/fonts";
import { AnalyticsInit } from "@/components/site/analytics-init";

/**
 * Arabic root layout (route group `(ar)`): server-set `lang="ar" dir="rtl"`
 * on every `/` + `/ar/**` route (brief §4 — NEVER client-side dir switching).
 * `<html>` appears only in root layouts (Next law); this project has two
 * root layouts: (ar) and (en) — the documented multiple-root-layouts pattern.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "نور دمشق — بيوت دمشقية مختارة، بسنود موثّقة",
    template: "%s | نور دمشق",
  },
  description:
    "مكتب عقاري دمشقي — نبيع البيت ونحفظ حكايته. كل عقار نفحص سنده قبل النشر، ونصوّره كما هو، والسعر بالدولار يُحدَّد بالليرة يومياً.",
  openGraph: {
    type: "website",
    siteName: "نور دمشق",
    locale: "ar_SY",
    images: [{ url: "/poster.webp", width: 1600, height: 900, alt: "نقش مشربية على حجر كلسي دمشقي" }],
  },
  alternates: {
    canonical: "/",
    languages: { ar: "/", en: "/en", "x-default": "/" },
  },
};

export const viewport: Viewport = {
  themeColor: "#EDE6D4",
  width: "device-width",
  initialScale: 1,
};

export default function ArRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={fontClass}>
      <body className="min-h-dvh flex flex-col bg-background text-foreground font-body">
        {children}
        <AnalyticsInit />
      </body>
    </html>
  );
}
