import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontClass } from "@/lib/fonts";
import { AnalyticsInit } from "@/components/site/analytics-init";

/** English root layout (route group `(en)`): server-set `lang="en" dir="ltr"` for /en. */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nour Dimashq — Verified Damascus real estate",
    template: "%s | Nour Dimashq",
  },
  description:
    "Verified Damascus real estate — bought from abroad, without the guesswork. Deed checks, POA mechanics, milestone payments.",
  openGraph: {
    type: "website",
    siteName: "Nour Dimashq",
    locale: "en",
    images: [{ url: "/poster.webp", width: 1600, height: 900, alt: "Mashrabiya lattice pattern on Damascus limestone" }],
  },
  alternates: {
    canonical: "/en",
    languages: { ar: "/", en: "/en", "x-default": "/" },
  },
};

export const viewport: Viewport = {
  themeColor: "#EDE6D4",
  width: "device-width",
  initialScale: 1,
};

export default function EnRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={fontClass}>
      <body className="min-h-dvh flex flex-col bg-background text-foreground font-body">
        {children}
        <AnalyticsInit />
      </body>
    </html>
  );
}
