"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { DISTRICTS, LISTING_TYPES } from "@/lib/schemas";
import type { District, ListingType } from "@/lib/schemas";
import { DISTRICT_LABELS, TYPE_LABELS } from "@/lib/labels";
import { waLink } from "@/lib/wa";

/**
 * ValuationForm (brief §4 `/ar/valuation`): 3 screens, ONE question each —
 * district -> type -> phone. Honeypot + server Zod; success hands off to
 * WhatsApp. State matrix: default/loading/error(422/429/network)/success.
 */

type Status = "idle" | "loading" | "success" | "invalid-phone" | "rate-limited" | "network-error";

const PHONE_RE = /^\+?[0-9]{8,15}$/;

function normalizePhone(raw: string): string {
  const t = raw.replace(/[\s-]/g, "");
  if (t.startsWith("+")) return t;
  if (t.startsWith("00")) return `+${t.slice(2)}`;
  if (t.startsWith("963")) return `+${t}`;
  // local Syrian digits + the displayed +963 prefix chip
  return `+963${t.replace(/^0+/, "")}`;
}

export function ValuationForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [district, setDistrict] = useState<District | null>(null);
  const [type, setType] = useState<ListingType | null>(null);
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const phoneValid = PHONE_RE.test(normalizePhone(phone));
  const canSubmit = phoneValid && status !== "loading";

  async function submit() {
    if (!canSubmit) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "valuation",
          district: district ?? undefined,
          type: type ?? undefined,
          phone: normalizePhone(phone),
          honeypot,
        }),
      });
      if (res.status === 429) {
        setStatus("rate-limited");
        return;
      }
      if (res.status === 422) {
        setStatus("invalid-phone");
        return;
      }
      if (!res.ok) {
        setStatus("network-error");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("network-error");
    }
  }

  /* ---------- success: the direct WhatsApp handoff ---------- */
  if (status === "success") {
    return (
      <div className="relative overflow-hidden rounded-lg border border-ok-600/40 bg-ok-50 p-6 text-center shadow-1 md:p-8">
        <CheckCircle2 className="mx-auto size-12 text-ok-600" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-h3 font-bold text-stone-900">
          شكراً — سيتواصل معك المكتب خلال ٢٤ ساعة
        </h2>
        <p className="mt-2 text-body text-stone-800">استعجل؟ راسلنا مباشرة:</p>
        <a
          href={waLink("VALUATION", district ? `حي ${DISTRICT_LABELS[district]}` : "دمشق", "valuation")}
          data-wa-property="VALUATION"
          data-wa-source="valuation"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-primary mx-auto mt-6 flex h-12 w-fit items-center gap-2 rounded-md bg-gold-600 px-6 text-base font-bold text-stone-50 transition-transform duration-200 active:scale-[0.98]"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          راسلنا مباشرة — واتساب
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-300/70 bg-stone-50 p-4 shadow-1 md:p-8">
      {/* progress */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-bold text-stone-700" aria-live="polite">
          الخطوة <span className="num">{"٣"[0] ? ["١", "٢", "٣"][step - 1] : ""}</span> من <span className="num">٣</span>
        </p>
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            className="flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-bold text-gold-600 transition-colors hover:text-gold-500"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
            السابق
          </button>
        ) : null}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${i <= step ? "bg-gold-500" : "bg-stone-300"}`}
          />
        ))}
      </div>

      {/* step 1: district */}
      {step === 1 ? (
        <fieldset className="mt-6">
          <legend className="font-heading text-title font-bold text-stone-900">الحي</legend>
          <p className="mt-1 text-caption text-stone-700">أين يقع العقار؟</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DISTRICTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDistrict(d);
                  setStep(2);
                }}
                aria-pressed={district === d}
                className={`flex min-h-14 items-center justify-center rounded-md border px-4 text-body font-bold transition-colors duration-200 active:scale-[0.98] ${
                  district === d
                    ? "border-stone-900 bg-stone-900 text-stone-50"
                    : "border-stone-300 bg-stone-100 text-stone-900 hover:border-stone-500"
                }`}
              >
                {DISTRICT_LABELS[d]}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* step 2: type */}
      {step === 2 ? (
        <fieldset className="mt-6">
          <legend className="font-heading text-title font-bold text-stone-900">نوع العقار</legend>
          <p className="mt-1 text-caption text-stone-700">ما نوع العقار المطلوب تقييمه؟</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LISTING_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setStep(3);
                }}
                aria-pressed={type === t}
                className={`flex min-h-14 items-center justify-center rounded-md border px-3 text-sm font-bold transition-colors duration-200 active:scale-[0.98] ${
                  type === t
                    ? "border-stone-900 bg-stone-900 text-stone-50"
                    : "border-stone-300 bg-stone-100 text-stone-900 hover:border-stone-500"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* step 3: phone */}
      {step === 3 ? (
        <fieldset className="mt-6">
          <legend className="font-heading text-title font-bold text-stone-900">رقم هاتفك</legend>
          <p className="mt-1 text-caption text-stone-700">
            نجيب خلال ٢٤ ساعة بنطاق سعري تقريبي من صفقات حقيقية — مجاناً.
          </p>

          {/* honeypot — invisible to humans */}
          <input
            type="text"
            name="company"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <div className="mt-4 flex items-stretch gap-2" dir="ltr">
            <span className="flex min-h-12 items-center rounded-md border border-stone-300 bg-stone-200 px-3 text-body font-bold text-stone-700">
              +963
            </span>
            <input
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (status === "invalid-phone") setStatus("idle");
              }}
              placeholder="991 234 567"
              aria-label="رقم الهاتف مع رمز الدولة"
              aria-invalid={status === "invalid-phone"}
              aria-describedby="phone-help phone-error"
              className="min-h-12 flex-1 rounded-md border border-input bg-white px-4 text-base font-semibold text-stone-900 placeholder:text-stone-500"
            />
          </div>
          <p id="phone-help" className="mt-2 text-micro text-stone-600">
            أدخل الرقم مع رمز الدولة (مثال: <span className="num">+963991234567</span>) — أو أي رقم خارجي.
          </p>

          {status === "invalid-phone" ? (
            <p id="phone-error" role="alert" className="mt-2 rounded-sm bg-bad-50 px-3 py-2 text-caption font-semibold text-bad-600">
              رقم الهاتف غير صالح — تحقق من الأرقام ورمز الدولة ثم أعد الإرسال.
            </p>
          ) : null}
          {status === "rate-limited" ? (
            <p role="alert" className="mt-2 rounded-sm bg-bad-50 px-3 py-2 text-caption font-semibold text-bad-600">
              محاولات كثيرة — انتظر دقيقة، أو راسلنا مباشرة عبر واتساب.
            </p>
          ) : null}
          {status === "network-error" ? (
            <p role="alert" className="mt-2 rounded-sm bg-bad-50 px-3 py-2 text-caption font-semibold text-bad-600">
              تعذّر الاتصال — تحقق من الشبكة وحاول مجدداً.
            </p>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="cta-primary mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gold-600 text-base font-bold text-stone-50 transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {status === "loading" ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-5 animate-spin rounded-full border-2 border-stone-50/40 border-t-stone-50"
                />
                جارٍ الإرسال…
              </>
            ) : (
              <>
                أرسل الطلب
                <ArrowLeft className="size-4" aria-hidden="true" />
              </>
            )}
          </button>

          <p className="mt-4 text-caption text-stone-700">
            رقمك يبقى معنا — لا رسائل جماعية ولا مشاركة مع أي طرف.
          </p>
        </fieldset>
      ) : null}
    </div>
  );
}
