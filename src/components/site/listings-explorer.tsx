"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ListingCardData } from "@/lib/listings";
import {
  DISTRICTS,
  FEATURES,
  LISTING_TYPES,
  parsePriceParam,
  serializePriceParam,
} from "@/lib/schemas";
import type { District, Feature, ListingType } from "@/lib/schemas";
import { countLabel } from "@/lib/format";
import { waLink } from "@/lib/wa";
import { ListingCard } from "./listing-card";
import { MashrabiyaLayer } from "./mashrabiya";
import { Num } from "./num";
import { EMPTY_FILTERS, FilterBar, type FilterState } from "./filter-bar";
import { DISTRICT_LABELS, FEATURE_LABELS, TYPE_LABELS } from "@/lib/labels";
import { MessageCircle } from "lucide-react";

/**
 * ListingsExplorer (client — brief §4 filter law):
 * reads AND writes searchParams, toggles card visibility client-side,
 * zero server roundtrips. Filter state serializes to the querystring on
 * every change via history.replaceState (shareable URLs, no history spam);
 * the browser Back button restores the previous result set (AC-10).
 */

function parseFilters(searchParams: URLSearchParams): FilterState {
  const district = searchParams.get("district");
  const type = searchParams.get("type");
  const rooms = searchParams.get("rooms");
  const features = searchParams.get("features");
  return {
    district: (DISTRICTS as readonly string[]).includes(district ?? "")
      ? (district as District)
      : null,
    type: (LISTING_TYPES as readonly string[]).includes(type ?? "") ? (type as ListingType) : null,
    min: parsePriceParam(searchParams.get("min")) ?? null,
    max: parsePriceParam(searchParams.get("max")) ?? null,
    rooms: rooms && /^[1-4]$/.test(rooms) ? Number(rooms) : null,
    features: features
      ? (features
          .split(",")
          .map((f) => f.trim())
          .filter((f): f is Feature => (FEATURES as readonly string[]).includes(f)))
      : [],
  };
}

function serializeFilters(f: FilterState): string {
  const params = new URLSearchParams();
  if (f.district) params.set("district", f.district);
  if (f.type) params.set("type", f.type);
  if (f.min !== null) params.set("min", serializePriceParam(f.min));
  if (f.max !== null) params.set("max", serializePriceParam(f.max));
  if (f.rooms !== null) params.set("rooms", String(f.rooms));
  if (f.features.length) params.set("features", f.features.join(","));
  return params.toString();
}

export function ListingsExplorer({ listings }: { listings: ListingCardData[] }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
  );

  // Back/Forward restores the previous result set: subscribe to the browser
  // history (external system) and re-read the real URL on popstate.
  useEffect(() => {
    const onPopState = () => {
      setFilters(parseFilters(new URLSearchParams(window.location.search)));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // serialize on every change (replaceState — no history spam)
  useEffect(() => {
    const qs = serializeFilters(filters);
    window.history.replaceState(null, "", qs ? `/ar/listings?${qs}` : "/ar/listings");
  }, [filters]);

  const results = useMemo(
    () =>
      listings.filter((l) => {
        if (filters.district && l.districtKey !== filters.district) return false;
        if (filters.type && l.typeKey !== filters.type) return false;
        if (filters.min !== null && (l.priceUsd ?? Number.POSITIVE_INFINITY) < filters.min)
          return false;
        if (filters.max !== null && (l.priceUsd ?? Number.POSITIVE_INFINITY) > filters.max)
          return false;
        if (filters.rooms !== null && (l.rooms ?? 0) < filters.rooms) return false;
        if (filters.features.length && !filters.features.every((x) => l.features.includes(x)))
          return false;
        return true;
      }),
    [listings, filters],
  );

  const hasActive =
    filters.district !== null ||
    filters.type !== null ||
    filters.min !== null ||
    filters.max !== null ||
    filters.rooms !== null ||
    filters.features.length > 0;

  const requestSummary = [
    filters.district ? `حي ${DISTRICT_LABELS[filters.district]}` : null,
    filters.type ? TYPE_LABELS[filters.type] : null,
    filters.rooms ? `${filters.rooms}+ غرف` : null,
    filters.features.map((f) => FEATURE_LABELS[f]).join(" و"),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        hasActive={hasActive}
      />

      <h2 aria-live="polite" className="text-body font-bold text-stone-900">
        {results.length > 0 ? (
          <>
            <Num>{countLabel(results.length)}</Num> — معروضة الآن
          </>
        ) : (
          "لا نتائج مطابقة"
        )}
      </h2>

      {results.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((listing) => (
            <li key={listing.ref} className="h-full">
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-stone-300/70 bg-stone-50 p-8 text-center shadow-1">
          <MashrabiyaLayer />
          <div className="relative flex flex-col items-center gap-4 py-8">
            <h2 className="font-heading text-h3 font-bold text-stone-900">
              لا نتائج مطابقة لبحثك
            </h2>
            <p className="max-w-md text-body text-stone-700">
              اطلب منّا — صفّ لنا ما تريد وسنجده لك: قل لنا تفاصيل العقار في رسالة واتساب
              واحدة وسيتواصل المكتب خلال ٢٤ ساعة.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={waLink("REQ", requestSummary || "عقار حسب الطلب", "direct")}
                data-wa-property="REQ"
                data-wa-source="direct"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-primary flex h-12 items-center gap-2 rounded-md bg-gold-600 px-6 text-base font-bold text-stone-50 transition-transform duration-200 active:scale-[0.98]"
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                اطلب منّا — واتساب
              </a>
              {hasActive ? (
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="flex h-12 items-center rounded-md border border-stone-500/60 bg-stone-100 px-6 text-base font-bold text-stone-900 transition-colors duration-200 hover:bg-stone-200 active:scale-[0.98]"
                >
                  مسح الفلاتر
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
