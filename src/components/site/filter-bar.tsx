"use client";

import { DISTRICTS, LISTING_TYPES, parsePriceParam, serializePriceParam } from "@/lib/schemas";
import type { District, Feature, ListingType } from "@/lib/schemas";
import { DISTRICT_LABELS, FEATURE_LABELS, FEATURE_ORDER, TYPE_LABELS } from "@/lib/labels";

/**
 * FilterBar (brief §4): purpose (v1 sale only — rent disabled «قريباً»),
 * type, district, price range, rooms, features (generator/solar first-class).
 * Pure UI — state lives in ListingsExplorer.
 */

export type FilterState = {
  district: District | null;
  type: ListingType | null;
  min: number | null;
  max: number | null;
  rooms: number | null; // 4 means 4+
  features: Feature[];
};

export const EMPTY_FILTERS: FilterState = {
  district: null,
  type: null,
  min: null,
  max: null,
  rooms: null,
  features: [],
};

const PRICE_STEPS = [60_000, 80_000, 100_000, 150_000, 200_000, 250_000] as const;
const ROOMS = [1, 2, 3, 4] as const;

function Chip({
  active,
  disabled,
  onClick,
  children,
  ...rest
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-3 text-sm font-semibold transition-colors duration-200 active:scale-[0.98] ${
        active
          ? "border-stone-900 bg-stone-900 text-stone-50"
          : "border-stone-300 bg-stone-100 text-stone-800 hover:border-stone-500"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-micro font-bold text-stone-600">{label}</p>
      <div className="no-scrollbar flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  onReset,
  hasActive,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  hasActive: boolean;
}) {
  return (
    <div className="rounded-lg border border-stone-300/70 bg-stone-50 p-4 shadow-1 md:p-6">
      <div className="flex flex-col gap-4">
        {/* purpose — v1 sale only (rent is a labeled future) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="الغرض" className="flex items-center gap-2">
            <Chip active onClick={() => undefined} aria-label="بيع">
              بيع
            </Chip>
            <Chip
              active={false}
              disabled
              onClick={() => undefined}
              aria-label="إيجار — قريباً"
            >
              إيجار
              <span className="rounded-sm bg-stone-200 px-1.5 py-0.5 text-micro text-stone-600">
                قريباً
              </span>
            </Chip>
          </div>
          {hasActive ? (
            <button
              type="button"
              onClick={onReset}
              className="flex min-h-11 items-center rounded-md px-3 text-sm font-bold text-gold-600 transition-colors hover:text-gold-500"
            >
              مسح الفلاتر
            </button>
          ) : null}
        </div>

        <ChipRow label="الحي">
          <Chip active={filters.district === null} onClick={() => onChange({ ...filters, district: null })}>
            الكل
          </Chip>
          {DISTRICTS.map((d) => (
            <Chip
              key={d}
              active={filters.district === d}
              onClick={() => onChange({ ...filters, district: filters.district === d ? null : d })}
            >
              {DISTRICT_LABELS[d]}
            </Chip>
          ))}
        </ChipRow>

        <ChipRow label="النوع">
          <Chip active={filters.type === null} onClick={() => onChange({ ...filters, type: null })}>
            الكل
          </Chip>
          {LISTING_TYPES.map((t) => (
            <Chip
              key={t}
              active={filters.type === t}
              onClick={() => onChange({ ...filters, type: filters.type === t ? null : t })}
            >
              {TYPE_LABELS[t]}
            </Chip>
          ))}
        </ChipRow>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="price-min" className="text-micro font-bold text-stone-600">
              السعر (دولار)
            </label>
            <div className="flex items-center gap-2">
              <select
                id="price-min"
                value={filters.min === null ? "" : serializePriceParam(filters.min)}
                onChange={(e) =>
                  onChange({ ...filters, min: parsePriceParam(e.target.value) ?? null })
                }
                className="h-11 min-w-0 flex-1 rounded-md border border-input bg-stone-100 px-3 text-sm font-semibold text-stone-900"
              >
                <option value="">من أي سعر</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={serializePriceParam(p)}>
                    من {serializePriceParam(p).replace("k", " ألف")}
                  </option>
                ))}
              </select>
              <select
                id="price-max"
                value={filters.max === null ? "" : serializePriceParam(filters.max)}
                onChange={(e) =>
                  onChange({ ...filters, max: parsePriceParam(e.target.value) ?? null })
                }
                className="h-11 min-w-0 flex-1 rounded-md border border-input bg-stone-100 px-3 text-sm font-semibold text-stone-900"
                aria-label="السعر الأقصى"
              >
                <option value="">إلى أي سعر</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={serializePriceParam(p)}>
                    حتى {serializePriceParam(p).replace("k", " ألف")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ChipRow label="الغرف">
            <Chip active={filters.rooms === null} onClick={() => onChange({ ...filters, rooms: null })}>
              أي عدد
            </Chip>
            {ROOMS.map((r) => (
              <Chip
                key={r}
                active={filters.rooms === r}
                onClick={() => onChange({ ...filters, rooms: filters.rooms === r ? null : r })}
              >
                {r === 4 ? "٤+" : String(r).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)])}
                {r === 1 ? " غرفة" : r === 2 ? " غرفتان" : ""}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <ChipRow label="المواصفات">
          {FEATURE_ORDER.map((f) => (
            <Chip
              key={f}
              active={filters.features.includes(f)}
              onClick={() =>
                onChange({
                  ...filters,
                  features: filters.features.includes(f)
                    ? filters.features.filter((x) => x !== f)
                    : [...filters.features, f],
                })
              }
            >
              {FEATURE_LABELS[f]}
            </Chip>
          ))}
        </ChipRow>
      </div>
    </div>
  );
}

/**
 * Suspense fallback for the explorer — geometry-matched to the final layout
 * (filter card + count line + card grid) so the streamed swap costs ~zero CLS.
 */
export function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex flex-col gap-4 rounded-lg border border-stone-300/70 bg-stone-50 p-4 shadow-1 md:p-6">
        <div className="flex items-center gap-2">
          <div className="h-11 w-20 animate-pulse rounded-md bg-stone-200" />
          <div className="h-11 w-24 animate-pulse rounded-md bg-stone-200" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`d${i}`} className="h-11 w-20 animate-pulse rounded-md bg-stone-200" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={`t${i}`} className="h-11 w-16 animate-pulse rounded-md bg-stone-200" />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-11 flex-1 animate-pulse rounded-md bg-stone-200" />
          <div className="h-11 flex-1 animate-pulse rounded-md bg-stone-200" />
        </div>
      </div>
      <div className="h-7 w-44 animate-pulse rounded bg-stone-200" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-stone-300/70 bg-stone-50 shadow-1">
            <div className="aspect-[4/3] w-full animate-pulse bg-stone-200" />
            <div className="flex flex-col gap-3 p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-stone-200" />
              <div className="mt-auto flex items-end justify-between pt-3">
                <div className="h-7 w-32 animate-pulse rounded bg-stone-200" />
                <div className="size-11 animate-pulse rounded-md bg-stone-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
