import { BedDouble, Bath, Compass, Layers, Ruler } from "lucide-react";
import type { ListingDetail } from "@/lib/listings";
import { Num } from "./num";

/**
 * KeyFactsBar (brief §4 PDP ②): dual-currency price + date stamp + the
 * daily-SYP line (NEVER-6 triple), then equal-width icon tiles:
 * area / rooms / baths / floor / واجهة.
 */
export function KeyFactsBar({ detail }: { detail: ListingDetail }) {
  const { card } = detail;
  const hasPrice = card.priceUsd !== null;

  const tiles = [
    { icon: Ruler, label: "المساحة", value: card.areaLabel },
    { icon: BedDouble, label: "الغرف", value: card.roomsLabel },
    { icon: Bath, label: "الحمّامات", value: card.bathsLabel },
    { icon: Layers, label: "الطابق", value: card.floorLabel },
    { icon: Compass, label: "الواجهة", value: detail.direction ?? "—" },
  ].filter((t) => t.value !== "");

  return (
    <section aria-label="البيانات الأساسية" className="rounded-lg border border-stone-300/70 bg-stone-50 p-4 shadow-1 md:p-6">
      <div className="flex flex-col gap-2">
        <p className="font-heading text-h3 font-bold text-stone-900">
          {hasPrice ? (
            <>
              <Num>{card.priceLabel}</Num> <span className="text-body font-semibold">دولار</span>
            </>
          ) : (
            card.priceLabel
          )}
          {card.negotiable ? (
            <span className="ms-3 align-middle rounded-sm bg-stone-200 px-2 py-1 font-body text-micro font-bold text-stone-700">
              قابل للتفاوض
            </span>
          ) : null}
        </p>
        <p className="text-caption text-stone-700">
          {card.priceDateLabel ? (
            <>
              آخر تحديث للسعر: <Num>{card.priceDateLabel}</Num> ·{" "}
            </>
          ) : null}
          السعر بالليرة يُحدَّد يومياً
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map(({ icon: Icon, label, value }) => (
          <li
            key={label}
            className="flex flex-col items-center gap-1 rounded-md border border-stone-200 bg-stone-100 px-3 py-4 text-center"
          >
            <Icon className="size-5 text-gold-600" aria-hidden="true" />
            <span className="text-micro font-bold text-stone-600">{label}</span>
            <span className="text-sm font-bold text-stone-900">
              <Num>{value}</Num>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
