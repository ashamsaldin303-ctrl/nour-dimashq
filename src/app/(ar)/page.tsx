import Link from "next/link";
import { ArrowLeft, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkipLink } from "@/components/site/skip-link";
import { SiteHeader } from "@/components/site/site-header";
import { FooterOffice } from "@/components/site/footer-office";
import { SectionHeading } from "@/components/site/section-heading";
import { PosterHero } from "@/components/site/poster-hero";
import { TrustStrip } from "@/components/site/trust-strip";
import { ListingCard } from "@/components/site/listing-card";
import { MashrabiyaDivider, StarMark } from "@/components/site/mashrabiya";
import { getSignatureListings } from "@/lib/listings";

/**
 * Home (brief §4, route `/`, job: convince in 5 seconds this office is
 * verifiable, then hand off). Sections in order:
 * hero → trust strip → signature collection → verification teaser →
 * founder snippet → footer.
 */

export const metadata = {
  title: "نور دمشق — بيوت دمشقية مختارة، بسنود موثّقة",
  description:
    "مكتب عقاري دمشقي — نبيع البيت ونحفظ حكايته. كل عقار نفحص سنده قبل النشر، ونصوّره كما هو، والسعر بالدولار يُحدَّد بالليرة يومياً.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const signature = await getSignatureListings();

  return (
    <>
      <SkipLink href="#properties" label="تخطَّ إلى العقارات" />
      <SiteHeader active="home" />

      <main id="main" className="flex-1">
        <PosterHero />
        <TrustStrip />

        <section id="properties" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
          <SectionHeading
            kicker="مجموعة منتقاة"
            title="عقارات اختارها المكتب بعناية"
            sub="كل عقار هنا فُحص سنده أو اطُّلع عليه قبل النشر — والأسعار بتاريخ اليوم."
          />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {signature.map((listing) => (
              <ListingCard key={listing.ref} listing={listing} />
            ))}
          </div>
          <div className="mt-8">
            <Button
              asChild
              variant="outline"
              className="h-12 border-stone-600/50 px-6 text-base font-bold text-stone-900 hover:bg-stone-200 hover:text-stone-900 active:scale-[0.98]"
            >
              <Link href="/ar/listings">
                كل العقارات
                <ArrowLeft className="ms-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>

        <MashrabiyaDivider />

        {/* Verification teaser — dark basalt panel (the page's one bold axis) */}
        <section aria-labelledby="verification-teaser" className="bg-stone-900">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1fr_1.2fr] md:items-center md:px-8 md:py-24">
            <div>
              <p className="font-heading text-caption font-bold text-gold-300">عقار موثّق</p>
              <h2 id="verification-teaser" className="mt-2 text-h2 font-bold text-stone-50">
                نفحص السند قبل أن تدفع فلساً واحداً
              </h2>
              <p className="mt-3 text-lead text-stone-300">
                نفحص سند الملكية مقابل السجل العقاري، ونراجع تاريخ الملكية ومساحة العقار،
                ونسلّمك تقريراً مصوّراً — قبل أن تدفع على العقار فلساً واحداً.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="cta-primary h-12 px-6 text-base active:scale-[0.98]">
                  <Link href="/ar/verification">كيف نتحقق؟</Link>
                </Button>
              </div>
            </div>
            <ul className="grid gap-3">
              {["مطابقة السند مقابل السجل العقاري", "مراجعة تاريخ الملكية وسلسلة الانتقال", "التحقق من مساحة العقار الفعلية"].map(
                (check) => (
                  <li
                    key={check}
                    className="flex items-center gap-3 rounded-md border border-stone-700 bg-stone-800/60 px-4 py-3 text-body font-semibold text-stone-100"
                  >
                    <FileSearch className="size-5 shrink-0 text-gold-300" aria-hidden="true" />
                    {check}
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>

        {/* Founder snippet (brief §4 section ⑤): 2 sentences + link */}
        <section aria-labelledby="founder-snippet" className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="max-w-3xl border-s-4 border-gold-500 ps-6">
            <StarMark className="size-8 text-gold-500" />
            <h2 id="founder-snippet" className="sr-only">
              من نحن
            </h2>
            <blockquote className="mt-4 text-lead font-medium leading-loose text-stone-800">
              «نور دمشق ليس موقعاً يعرض إعلانات — بل مكتباً دمشقياً صغيراً يختار البيوت التي
              يستحقها هذا البلد، ويتحقق من كل سند قبل أن يراه أحد. اسمنا وترخيصنا وأرقام
              مبيعاتنا أمامك، لأن الثقة هنا تُورَّث ولا تُشترى.»
            </blockquote>
            <Link
              href="/ar/about"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-body font-bold text-gold-600 transition-colors hover:text-gold-500"
            >
              تعرّف على المكتب
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <FooterOffice />
    </>
  );
}
