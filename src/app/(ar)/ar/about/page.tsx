import Link from "next/link";
import { BadgeCheck, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkipLink } from "@/components/site/skip-link";
import { SiteHeader } from "@/components/site/site-header";
import { FooterOffice } from "@/components/site/footer-office";
import { SectionHeading } from "@/components/site/section-heading";
import { StarMark } from "@/components/site/mashrabiya";
import { Num } from "@/components/site/num";
import { TO_OBTAIN_NOTE, office } from "@/lib/office";
import { waLink } from "@/lib/wa";

/**
 * /ar/about (brief §4 + §7 verbatim): the founder vow.
 * Sections: ① vow H1 + 2 paragraphs ② identity [TO-OBTAIN] slots card
 * ③ office address card + lazy OSM map (SHOULD) ④ CTA pair.
 */

export const metadata = {
  title: "من نحن",
  description:
    "نور دمشق ليس موقعاً يعرض إعلانات — بل مكتباً دمشقياً صغيراً يختار البيوت التي يستحقها هذا البلد، ويتحقق من كل سند قبل أن يراه أحد.",
  alternates: { canonical: "/ar/about" },
};

export default function AboutPage() {
  return (
    <>
      <SkipLink href="#main" label="تخطَّ إلى المحتوى" />
      <SiteHeader active="about" />

      <main id="main" className="flex-1">
        {/* ① the vow — H1 + two paragraphs (brief §7 verbatim) */}
        <section
          aria-labelledby="about-heading"
          className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
        >
          <div className="max-w-3xl border-s-4 border-gold-500 ps-6">
            <StarMark className="size-8 text-gold-500" />
            <h1 id="about-heading" className="mt-4 text-h1 font-bold text-stone-900">
              نبيع البيت ونحفظ حكايته
            </h1>
            <p className="mt-6 text-lead text-stone-800">
              نور دمشق ليس موقعاً يعرض إعلانات — بل مكتباً دمشقياً صغيراً يختار البيوت
              التي يستحقها هذا البلد، ويتحقق من كل سند قبل أن يراه أحد. اسمنا وترخيصنا
              وأرقام مبيعاتنا أمامك، لأن الثقة هنا تُورَّث ولا تُشترى.
            </p>
            <p className="mt-4 text-lead text-stone-800">
              إن كنت تشتري من الخارج: نجهّز لك التوكيل والتحقق والتسليم المرحلي، ونتابع
              معك حتى القيد. وإن كنت تبيع: نعطيك سعراً صادقاً بالدولار لا رقماً للمجاملة.
            </p>
          </div>
        </section>

        {/* ② identity slots — [TO-OBTAIN] env fields render the neutral note */}
        <section
          aria-labelledby="about-identity"
          className="border-y border-stone-300/70 bg-stone-50/80"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <SectionHeading id="about-identity" kicker="الشفافية" title="بيانات المكتب" />
            <div className="mt-8 rounded-lg border border-stone-300/70 bg-stone-50 p-4 shadow-1 md:p-6">
              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="border-s-2 border-gold-400 ps-4">
                  <dt className="flex items-center gap-2 font-heading text-caption font-bold text-gold-600">
                    <BadgeCheck className="size-4" aria-hidden="true" />
                    ترخيص المكتب
                  </dt>
                  <dd className="mt-2 text-body font-semibold text-stone-900">
                    {office.license ? (
                      <Num>{office.license}</Num>
                    ) : (
                      <span className="font-normal text-stone-600">{TO_OBTAIN_NOTE}</span>
                    )}
                  </dd>
                </div>
                <div className="border-s-2 border-gold-400 ps-4">
                  <dt className="flex items-center gap-2 font-heading text-caption font-bold text-gold-600">
                    <User className="size-4" aria-hidden="true" />
                    المؤسس
                  </dt>
                  <dd className="mt-2 text-body font-semibold text-stone-900">
                    {office.founderName ?? (
                      <span className="font-normal text-stone-600">{TO_OBTAIN_NOTE}</span>
                    )}
                  </dd>
                </div>
                <div className="border-s-2 border-gold-400 ps-4">
                  <dt className="flex items-center gap-2 font-heading text-caption font-bold text-gold-600">
                    <Phone className="size-4" aria-hidden="true" />
                    هاتف المكتب
                  </dt>
                  <dd className="mt-2 text-body font-semibold text-stone-900">
                    {office.landline ? (
                      <Num>{office.landline}</Num>
                    ) : (
                      <span className="font-normal text-stone-600">{TO_OBTAIN_NOTE}</span>
                    )}
                  </dd>
                </div>
                <div className="border-s-2 border-gold-400 ps-4">
                  <dt className="flex items-center gap-2 font-heading text-caption font-bold text-gold-600">
                    <MapPin className="size-4" aria-hidden="true" />
                    العنوان
                  </dt>
                  <dd className="mt-2 text-body font-semibold text-stone-900">
                    {office.address ?? (
                      <span className="font-normal text-stone-600">{TO_OBTAIN_NOTE}</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ③ address card + lazy OSM map (brief §3 SHOULD — general Damascus view) */}
        <section
          aria-labelledby="about-location"
          className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
        >
          <SectionHeading id="about-location" kicker="الموقع" title="العنوان" />
          <div className="mt-8 rounded-lg border border-stone-300/70 bg-stone-50 p-4 shadow-1 md:p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-gold-600" aria-hidden="true" />
              <p className="text-body font-bold text-stone-900">
                {office.address ?? TO_OBTAIN_NOTE}
              </p>
            </div>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=36.2685%2C33.4985%2C36.3200%2C33.5300&layer=mapnik"
              loading="lazy"
              title="خريطة دمشق — موقع المكتب"
              className="mt-4 h-64 w-full rounded-md border border-stone-300/70"
            />
            <p className="mt-3 text-caption text-stone-600">
              دمشق — الخريطة لأغراض التوجيه العام
            </p>
          </div>
        </section>

        {/* ④ CTA pair: valuation funnel + WhatsApp */}
        <section
          aria-labelledby="about-cta"
          className="border-t border-stone-300/70 bg-stone-50/80"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
              <SectionHeading id="about-cta" title="تواصل مع المكتب" />
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="cta-primary h-12 px-6 text-base active:scale-[0.98]"
                >
                  <Link href="/ar/valuation">كم يساوي عقارك؟</Link>
                </Button>
                <a
                  href={waLink("OFFICE", "استفسار عام", "direct")}
                  data-wa-property="OFFICE"
                  data-wa-source="direct"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-stone-900 px-6 text-base font-bold text-stone-50 transition-transform duration-200 active:scale-[0.98]"
                >
                  <MessageCircle className="size-5" aria-hidden="true" />
                  راسلنا عبر واتساب
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterOffice />
    </>
  );
}
