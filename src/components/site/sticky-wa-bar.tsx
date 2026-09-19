import { MessageCircle } from "lucide-react";
import type { ListingDetail } from "@/lib/listings";
import { Num } from "./num";

/**
 * StickyWaBar (brief §4 PDP ⑨): always-visible conversion bar, z-40 per the
 * z ladder, respects the mobile safe area. The funnel's front door.
 */
export function StickyWaBar({ detail }: { detail: ListingDetail }) {
  const { card } = detail;
  const sold = card.sold;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-700 bg-stone-900/97 text-stone-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <p className="min-w-0">
          <span className="block truncate font-heading text-title font-bold">
            {card.priceUsd !== null ? (
              <>
                <Num>{card.priceLabel}</Num> <span className="text-sm font-semibold">دولار</span>
              </>
            ) : (
              card.priceLabel
            )}
          </span>
          <span className="block text-micro text-stone-300">
            <Num>{card.ref}</Num> · السعر بالليرة يُحدَّد يومياً
            {card.priceDateLabel ? (
              <>
                {" "}
                · تحديث <Num>{card.priceDateLabel}</Num>
              </>
            ) : null}
          </span>
        </p>
        <a
          href={detail.waHrefPdp}
          data-wa-property={card.ref}
          data-wa-source="pdp"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-primary flex h-12 shrink-0 items-center gap-2 rounded-md bg-gold-600 px-6 text-base font-bold text-stone-50 transition-transform duration-200 active:scale-[0.98]"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          {sold ? "استفسر عن عقار مشابه" : "احجز معاينة — واتساب"}
        </a>
      </div>
    </div>
  );
}
