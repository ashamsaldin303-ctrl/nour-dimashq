import { SkipLink } from "@/components/site/skip-link";
import { SiteHeader } from "@/components/site/site-header";
import { FooterOffice } from "@/components/site/footer-office";
import { ValuationForm } from "@/components/site/valuation-form";

/**
 * /ar/valuation (brief §4): capture seller leads in 3 steps.
 * Copy verbatim from brief §7.
 */

export const metadata = {
  title: "كم يساوي عقارك؟",
  description:
    "نجيب خلال ٢٤ ساعة بنطاق سعري تقريبي من صفقات حقيقية — مجاناً، والوعد الذي لا يستطيع أي منشور فيسبوك تقديمه.",
  alternates: { canonical: "/ar/valuation" },
};

export default function ValuationPage() {
  return (
    <>
      <SkipLink href="#form" label="تخطَّ إلى النموذج" />
      <SiteHeader active="valuation" />

      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
          <header>
            <p className="font-heading text-caption font-bold text-gold-600">تقييم مجاني</p>
            <h1 className="mt-2 text-h1 font-bold text-stone-900">كم يساوي عقارك؟</h1>
            <p className="mt-4 text-lead text-stone-700">
              نجيب خلال ٢٤ ساعة بنطاق سعري تقريبي من صفقات حقيقية — مجاناً، والوعد الذي
              لا يستطيع أي منشور فيسبوك تقديمه.
            </p>
          </header>

          <div id="form" className="mt-8 scroll-mt-24">
            <ValuationForm />
          </div>
        </div>
      </main>

      <FooterOffice />
    </>
  );
}
