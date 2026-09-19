import { Suspense } from "react";
import { SkipLink } from "@/components/site/skip-link";
import { SiteHeader } from "@/components/site/site-header";
import { FooterOffice } from "@/components/site/footer-office";
import { ListingsExplorer } from "@/components/site/listings-explorer";
import { FiltersSkeleton } from "@/components/site/filter-bar";
import { getActiveListings } from "@/lib/listings";

/**
 * Listings index (brief §4): static shell + client-side filtering.
 * One job: let a buyer filter & compare in ≤3 taps.
 */

export const metadata = {
  title: "العقارات",
  description:
    "فهرس عقارات مكتب نور دمشق — فلتر بالحي والنوع والسعر والمواصفات. الأسعار بالدولار بتاريخ اليوم، والرابط قابل للمشاركة.",
  alternates: { canonical: "/ar/listings" },
};

export default async function ListingsPage() {
  const listings = await getActiveListings();

  return (
    <>
      <SkipLink href="#results" label="تخطَّ إلى النتائج" />
      <SiteHeader active="listings" />

      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
          <header className="max-w-2xl">
            <p className="font-heading text-caption font-bold text-gold-600">فهرس العقارات</p>
            <h1 className="mt-2 text-h2 font-bold text-stone-900">عقارات المكتب</h1>
            <p className="mt-3 text-lead text-stone-700">
              فلتر بالحي والنوع والسعر والمواصفات — رابط النتائج قابل للمشاركة.
            </p>
          </header>

          <div id="results" className="mt-8 scroll-mt-24">
            <Suspense fallback={<FiltersSkeleton />}>
              <ListingsExplorer listings={listings} />
            </Suspense>
          </div>
        </div>
      </main>

      <FooterOffice />
    </>
  );
}
