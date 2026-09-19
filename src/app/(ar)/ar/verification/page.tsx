import { FileSearch, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SkipLink } from "@/components/site/skip-link";
import { SiteHeader } from "@/components/site/site-header";
import { FooterOffice } from "@/components/site/footer-office";
import { SectionHeading } from "@/components/site/section-heading";
import { MashrabiyaDivider } from "@/components/site/mashrabiya";
import { Num } from "@/components/site/num";
import { arDigits } from "@/lib/format";
import { waLink } from "@/lib/wa";

/**
 * /ar/verification (brief §4 + §7 verbatim): sell the deed-check service.
 * Sections: ① H1 + lede + what is checked ② 5-step process timeline
 * ③ fee line ④ wa.me CTA «أريد توثيق عقار» ⑤ FAQ (3 items).
 */

export const metadata = {
  title: "عقار موثّق",
  description:
    "نفحص سند الملكية مقابل السجل العقاري، ونراجع تاريخ الملكية ومساحة العقار، ونسلّمك تقريراً مصوّراً — قبل أن تدفع على العقار فلساً واحداً.",
  alternates: { canonical: "/ar/verification" },
};

/** What the deed check covers — mirrors verificationPanel() in lib/listings. */
const CHECKS = [
  "مطابقة سند الملكية مقابل السجل العقاري",
  "مراجعة تاريخ الملكية وسلسلة الانتقال",
  "التحقق من مساحة العقار الفعلية",
] as const;

/** 5-step process (brief §7 verbatim). */
const STEPS = [
  "تواصل واتساب",
  "اتفاق الرسوم",
  "طلب السجل العقاري (ميدانياً)",
  "تقرير مصوّر يصلك في المحادثة",
  "شارة عقار موثّق إذا وكّلتنا البيع",
] as const;

export default function VerificationPage() {
  return (
    <>
      <SkipLink href="#main" label="تخطَّ إلى المحتوى" />
      <SiteHeader active="verification" />

      <main id="main" className="flex-1">
        {/* ① H1 + lede + what is checked */}
        <section
          aria-labelledby="verification-heading"
          className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
        >
          <h1 id="verification-heading" className="text-h1 font-bold text-stone-900">
            عقار موثّق
          </h1>
          <p className="mt-4 max-w-3xl text-lead text-stone-700">
            نفحص سند الملكية مقابل السجل العقاري، ونراجع تاريخ الملكية ومساحة العقار،
            ونسلّمك تقريراً مصوّراً — قبل أن تدفع على العقار فلساً واحداً.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {CHECKS.map((check) => (
              <li
                key={check}
                className="flex items-start gap-3 rounded-md border border-stone-300/70 bg-stone-50 p-4 text-sm font-semibold text-stone-800 shadow-1"
              >
                <FileSearch className="mt-1 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                {check}
              </li>
            ))}
          </ul>
        </section>

        <MashrabiyaDivider />

        {/* ② 5-step process timeline (vertical, numbered, gold accents) */}
        <section
          aria-labelledby="verification-steps"
          className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
        >
          <SectionHeading id="verification-steps" kicker="الخدمة" title="خطوات التوثيق" />
          <ol className="mt-8 max-w-3xl">
            {STEPS.map((step, index) => {
              const isLast = index === STEPS.length - 1;
              return (
                <li key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-900 font-heading text-title font-bold text-gold-300">
                      <Num>{arDigits(index + 1)}</Num>
                    </span>
                    {isLast ? null : (
                      <span aria-hidden="true" className="w-px flex-1 bg-gold-400" />
                    )}
                  </div>
                  <div className={`flex min-h-12 flex-1 items-center ${isLast ? "" : "pb-6"}`}>
                    <p className="text-body font-semibold text-stone-900">{step}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ③ fee line + ④ wa.me CTA */}
        <section
          aria-labelledby="verification-fee"
          className="border-y border-stone-300/70 bg-stone-50/80"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-2xl rounded-lg border border-gold-500/60 bg-stone-50 p-6 text-center shadow-2 md:p-8">
              <h2
                id="verification-fee"
                className="font-heading text-caption font-bold text-gold-600"
              >
                رسوم الخدمة
              </h2>
              <p className="mt-3 text-h2 font-bold text-stone-900">
                <Num>٥٠–١٥٠</Num> دولاراً حسب العقار
              </p>
              <a
                href={waLink("VER", "توثيق عقار", "direct")}
                data-wa-property="VER"
                data-wa-source="direct"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-stone-900 px-6 text-base font-bold text-stone-50 transition-transform duration-200 active:scale-[0.98]"
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                أريد توثيق عقار
              </a>
            </div>
          </div>
        </section>

        {/* ⑤ FAQ — exactly 3 items */}
        <section
          aria-labelledby="verification-faq"
          className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
        >
          <SectionHeading id="verification-faq" title="أسئلة شائعة" />
          <Accordion
            type="single"
            collapsible
            className="mt-8 rounded-lg border border-stone-300/70 bg-stone-50 px-4 shadow-1 md:px-6"
          >
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-start text-body font-semibold text-stone-900">
                هل التحقق إلزامي للنشر؟
              </AccordionTrigger>
              <AccordionContent className="text-sm text-stone-700">
                لا — لكن كل عقار موثّق يباع أسرع.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-start text-body font-semibold text-stone-900">
                هل تفحصون عقارات غير معروضة عندكم؟
              </AccordionTrigger>
              <AccordionContent className="text-sm text-stone-700">
                نعم — الخدمة لأي عقار في دمشق.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-start text-body font-semibold text-stone-900">
                كم يستغرق؟
              </AccordionTrigger>
              <AccordionContent className="text-sm text-stone-700">
                من <Num>٢</Num> إلى <Num>٣</Num> أسابيع بحسب السجل.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <FooterOffice />
    </>
  );
}
