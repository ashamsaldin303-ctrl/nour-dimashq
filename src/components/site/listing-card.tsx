import Link from "next/link";
import { BedDouble, Layers, MessageCircle, Ruler } from "lucide-react";
import type { ListingCardData } from "@/lib/listings";
import { Num } from "./num";
import { PlaceholderTile } from "./placeholder-tile";
import { RESERVED_LABEL, SOLD_LABEL } from "@/lib/labels";

/**
 * ListingCard — works in both server trees (home signature row, PDP similar)
 * and the client explorer (listings index): pure render, no hooks.
 * Price triple law (NEVER-6): price + date stamp + «الليرة يومياً» + negotiable.
 * Badge law (AC-13): exactly one badge, priority verified > جديد > حصري;
 * reserved/sold render as a separate honest status chip.
 */
export function ListingCard({ listing }: { listing: ListingCardData }) {
  const hasPrice = listing.priceUsd !== null;

  return (
    <article
      data-listing-card
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-stone-300/70 bg-stone-50 shadow-1 transition-shadow duration-200 hover:shadow-2"
    >
      <div className="relative">
        <PlaceholderTile
          tileKey={listing.tileKey}
          top={listing.districtLabel}
          className="aspect-[4/3] w-full"
        />
        {listing.badgeLabel ? (
          <span className="absolute start-3 top-3 rounded-sm bg-gold-400 px-2 py-1 font-heading text-micro font-bold text-stone-900">
            {listing.badgeLabel}
          </span>
        ) : null}
        {listing.reserved ? (
          <span className="absolute end-3 top-3 rounded-sm bg-stone-900/85 px-2 py-1 font-heading text-micro font-bold text-stone-50">
            {RESERVED_LABEL}
          </span>
        ) : null}
        {listing.sold ? (
          <span className="absolute end-3 top-3 rounded-sm bg-stone-900/85 px-2 py-1 font-heading text-micro font-bold text-stone-50">
            {SOLD_LABEL}
          </span>
        ) : null}
        <span className="absolute bottom-3 end-3 rounded-sm bg-stone-900/70 px-2 py-1 text-micro text-stone-50">
          <Num>{listing.mediaCountLabel}</Num>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-caption font-bold text-gold-600">
            {listing.typeLabel} · {listing.districtLabel}
          </p>
          <h3 className="mt-1 font-heading text-body font-bold leading-snug text-stone-900">
            {listing.titleAr}
          </h3>
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-stone-700">
          <li className="flex items-center gap-1.5">
            <Ruler className="size-4 text-stone-500" aria-hidden="true" />
            <Num>{listing.areaLabel}</Num>
          </li>
          {listing.roomsLabel ? (
            <li className="flex items-center gap-1.5">
              <BedDouble className="size-4 text-stone-500" aria-hidden="true" />
              <Num>{listing.roomsLabel}</Num>
            </li>
          ) : null}
          {listing.floorLabel ? (
            <li className="flex items-center gap-1.5">
              <Layers className="size-4 text-stone-500" aria-hidden="true" />
              <Num>{listing.floorLabel}</Num>
            </li>
          ) : null}
        </ul>

        <div className="mt-auto border-t border-stone-200 pt-3">
          <div className="flex items-end justify-between gap-3">
            <p className="font-heading text-title font-bold text-stone-900">
              {hasPrice ? (
                <>
                  <Num>{listing.priceLabel}</Num> <span className="text-sm font-semibold">دولار</span>
                </>
              ) : (
                listing.priceLabel
              )}
            </p>
            <a
              href={listing.waHref}
              data-wa-property={listing.ref}
              data-wa-source="card"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`استفسر عن ${listing.titleAr} عبر واتساب`}
              className="relative z-20 flex size-11 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-stone-100 text-stone-800 transition-colors duration-200 hover:border-gold-500 hover:text-gold-600 active:scale-[0.96]"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-1 text-micro text-stone-600">
            {listing.priceDateLabel ? (
              <>
                تحديث <Num>{listing.priceDateLabel}</Num> ·{" "}
              </>
            ) : null}
            السعر بالليرة يُحدَّد يومياً{listing.negotiable ? " · قابل للتفاوض" : ""}
          </p>
        </div>
      </div>

      <Link
        href={`/ar/listings/${listing.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`تفاصيل ${listing.titleAr}`}
      />
    </article>
  );
}
