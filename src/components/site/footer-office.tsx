import { MapPin, MessageCircle, Phone } from "lucide-react";
import { office } from "@/lib/office";
import { waLink } from "@/lib/wa";
import { StarMark } from "./mashrabiya";
import { Num } from "./num";

/**
 * FooterOffice — on every route (brief §7): office name, license slot,
 * 011 landline slot, WhatsApp CTA, daily-SYP-rate line. `mt-auto` keeps it
 * pinned to the viewport bottom on short pages (sticky footer law).
 */
export function FooterOffice() {
  return (
    <footer className="mt-auto border-t border-stone-300/70 bg-stone-200/60">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <StarMark className="size-6 text-gold-600" />
              <p className="font-heading text-title font-bold text-stone-900">
                مكتب نور دمشق العقاري — دمشق
              </p>
            </div>
            <p className="mt-3 text-sm text-stone-700">
              الأسعار بالدولار والسعر بالليرة يُحدَّد يومياً بتاريخ آخر تحديث.
            </p>
            {office.license ? (
              <p className="mt-1 text-sm text-stone-700">
                ترخيص: <Num>{office.license}</Num>
              </p>
            ) : null}
            {office.address ? (
              <p className="mt-4 flex items-start gap-2 text-sm text-stone-700">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                <span>{office.address}</span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-start gap-3">
            {office.landline ? (
              <a
                href={`tel:${office.landline}`}
                className="flex min-h-11 items-center gap-2 text-sm font-semibold text-stone-800 hover:text-stone-900"
              >
                <Phone className="size-4 text-gold-600" aria-hidden="true" />
                <Num>{office.landline}</Num>
              </a>
            ) : null}
            <a
              href={waLink("OFFICE", "استفسار عام", "direct")}
              data-wa-property="OFFICE"
              data-wa-source="direct"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-bold text-stone-50 transition-transform duration-200 active:scale-[0.98]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              راسلنا عبر واتساب
            </a>
          </div>
        </div>

        <p className="mt-8 border-t border-stone-300/70 pt-4 text-micro text-stone-600">
          © ٢٠٢٦ مكتب نور دمشق العقاري — جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
