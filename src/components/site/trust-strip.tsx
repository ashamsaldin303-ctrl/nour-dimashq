import { Archive, CalendarClock, ShieldCheck } from "lucide-react";

/** Trust strip (brief §4 section ②): three proof chips, verbatim copy. */
const CHIPS = [
  { icon: ShieldCheck, text: "تحقّق من السند قبل النشر" },
  { icon: CalendarClock, text: "أسعار بتاريخ اليوم" },
  { icon: Archive, text: "أرشيف مبيعات مؤرَّخ" },
] as const;

export function TrustStrip() {
  return (
    <section aria-label="لماذا نور دمشق" className="border-y border-stone-300/70 bg-stone-50/80">
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-3 md:px-8">
        {CHIPS.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-stone-800"
          >
            <Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
