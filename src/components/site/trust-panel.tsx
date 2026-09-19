import Link from "next/link";
import { FileCheck2, FileSearch, ShieldQuestion } from "lucide-react";
import type { VerificationChecks } from "@/lib/listings";
import { Num } from "./num";

/**
 * TrustPanel (brief §4 PDP ③): verification status + what was checked + date,
 * or the honest «غير موثّق». This panel is the moat — never overstate.
 */
export function TrustPanel({ verification }: { verification: VerificationChecks }) {
  if (verification.level === "verified") {
    return (
      <section
        aria-label="حالة التوثيق"
        className="rounded-lg border border-ok-600/40 bg-ok-50 p-4 md:p-6"
      >
        <div className="flex items-start gap-3">
          <FileCheck2 className="mt-1 size-6 shrink-0 text-ok-600" aria-hidden="true" />
          <div>
            <h2 className="font-heading text-title font-bold text-stone-900">
              عقار موثّق
              {verification.dateLabel ? (
                <span className="ms-2 font-body text-caption font-semibold text-stone-700">
                  بتاريخ <Num>{verification.dateLabel}</Num>
                </span>
              ) : null}
            </h2>
            <p className="mt-1 text-sm text-stone-800">{verification.summary}</p>
            <ul className="mt-3 flex flex-col gap-1">
              {verification.checks.map((check) => (
                <li key={check} className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-ok-600" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (verification.level === "deed_checked") {
    return (
      <section
        aria-label="حالة التوثيق"
        className="rounded-lg border border-gold-500/40 bg-stone-50 p-4 md:p-6"
      >
        <div className="flex items-start gap-3">
          <FileSearch className="mt-1 size-6 shrink-0 text-gold-600" aria-hidden="true" />
          <div>
            <h2 className="font-heading text-title font-bold text-stone-900">
              سند مُطّلَع عليه
              {verification.dateLabel ? (
                <span className="ms-2 font-body text-caption font-semibold text-stone-700">
                  بتاريخ <Num>{verification.dateLabel}</Num>
                </span>
              ) : null}
            </h2>
            <p className="mt-1 text-sm text-stone-800">{verification.summary}</p>
            <Link
              href="/ar/verification"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-gold-600 hover:text-gold-500"
            >
              اطلب التوثيق الكامل مقابل السجل العقاري
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="حالة التوثيق"
      className="rounded-lg border border-stone-300/70 bg-stone-100 p-4 md:p-6"
    >
      <div className="flex items-start gap-3">
        <ShieldQuestion className="mt-1 size-6 shrink-0 text-stone-600" aria-hidden="true" />
        <div>
          <h2 className="font-heading text-title font-bold text-stone-900">غير موثّق بعد</h2>
          <p className="mt-1 text-sm text-stone-800">{verification.summary}</p>
          <Link
            href="/ar/verification"
            className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-gold-600 hover:text-gold-500"
          >
            كيف نوثّق العقار؟
          </Link>
        </div>
      </div>
    </section>
  );
}
