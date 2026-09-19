import Link from "next/link";
import { Archive, ArrowLeft } from "lucide-react";
import { SkipLink } from "@/components/site/skip-link";
import { SiteHeader } from "@/components/site/site-header";
import { FooterOffice } from "@/components/site/footer-office";
import { PlaceholderTile } from "@/components/site/placeholder-tile";
import { Num } from "@/components/site/num";
import { SOLD_LABEL } from "@/lib/labels";
import { getSoldListings, type SoldProofData } from "@/lib/listings";

/**
 * /ar/sold (brief §4 + §7 verbatim): prove activity with dated evidence.
 * NEVER-12: sold listings are never deleted — they flip into dated proof
 * cards here. Sections: ① H1 «تم البيع» + honesty line ② proof grid.
 */

export const metadata = {
  title: "تم البيع",
  description:
    "كل عقار نبيعه يتحوّل إلى إثبات مؤرَّخ — لأن السوق الذي يحكم بالسمعة يستحق أرشيفاً صادقاً.",
  alternates: { canonical: "/ar/sold" },
};

/**
 * ProofCard — dated proof that a sale actually happened: original photo tile,
 * «تم البيع» chip, original price, sold date, ref chip, type·district line.
 * Kept local to this page per T1.5+T1.6 scope (the inventory name
 * `ProofCard` stays reserved for the shared component set).
 */
function ProofCard({ listing }: { listing: SoldProofData }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-stone-300/70 bg-stone-50 shadow-1">
      <div className="relative">
        <PlaceholderTile
          tileKey={listing.tileKey}
          top={listing.districtLabel}
          className="aspect-[4/3] w-full"
        />
        <span className="absolute end-3 top-3 rounded-sm bg-stone-900/85 px-2 py-1 font-heading text-micro font-bold text-stone-50">
          {SOLD_LABEL}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-caption font-bold text-gold-600">
            {listing.typeLabel} · {listing.districtLabel}
          </p>
          <span className="shrink-0 rounded-sm bg-stone-200 px-2 py-1 font-heading text-micro font-bold text-stone-800">
            <Num>{listing.ref}</Num>
          </span>
        </div>

        <div className="mt-auto space-y-2 border-t border-stone-200 pt-3">
          <p className="font-heading text-title font-bold text-stone-900">
            بيعت بـ <Num>{listing.soldPriceLabel}</Num>{" "}
            <span className="text-sm font-semibold">دولار</span>
          </p>
          <p className="text-sm text-stone-700">
            تاريخ البيع: <Num>{listing.soldDateLabel}</Num>
          </p>
        </div>
      </div>
    </article>
  );
}

export default async function SoldPage() {
  const sold = await getSoldListings();

  return (
    <>
      <SkipLink href="#main" label="تخطَّ إلى المحتوى" />
      <SiteHeader active="sold" />

      <main id="main" className="flex-1">
        <section
          aria-labelledby="sold-heading"
          className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
        >
          <h1 id="sold-heading" className="text-h1 font-bold text-stone-900">
            تم البيع
          </h1>
          <p className="mt-4 max-w-3xl text-lead text-stone-700">
            كل عقار نبيعه يتحوّل إلى إثبات مؤرَّخ — لأن السوق الذي يحكم بالسمعة
            يستحق أرشيفاً صادقاً.
          </p>

          {sold.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-center md:p-12">
              <Archive className="mx-auto size-6 text-gold-600" aria-hidden="true" />
              <p className="mt-4 text-body font-bold text-stone-900">لا مبيعات مؤرَّخة بعد</p>
              <p className="mt-2 text-sm text-stone-700">
                عندما نُبرم أول صفقة ستظهر هنا بتاريخها وسعرها وسندها — هذا الأرشيف
                وعدٌ مكتوب، لا صفحة تسويق.
              </p>
              <Link
                href="/ar/listings"
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md border border-stone-300 bg-stone-100 px-6 text-base font-bold text-stone-900 transition-colors duration-200 hover:border-gold-500 hover:text-gold-600 active:scale-[0.98]"
              >
                تصفّح العقارات المتاحة
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sold.map((listing) => (
                <ProofCard key={listing.ref} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </main>

      <FooterOffice />
    </>
  );
}
