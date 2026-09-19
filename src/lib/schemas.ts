import { z } from "zod";

/**
 * Zod contracts — the single validation layer for every boundary
 * (brief §2: Zod on every API boundary; §4.4 one Zod everywhere).
 * These unions replace the brief's Prisma enums under SQLite (ASSUMPTIONS.md A-1).
 */

export const LISTING_TYPES = [
  "apartment",
  "villa",
  "house",
  "land",
  "shop",
  "office",
  "farm",
  "building",
] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const LISTING_STATUSES = ["available", "reserved", "sold", "rented"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const VERIFICATION_LEVELS = ["unverified", "deed_checked", "verified"] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export const DISTRICTS = ["al-mezze", "al-maliki", "abu-rummaneh"] as const;
export type District = (typeof DISTRICTS)[number];

export const FEATURES = ["elevator", "generator", "solar", "waterTank", "parking", "balcony"] as const;
export type Feature = (typeof FEATURES)[number];

/** Media law (brief §6): is_ai:true must NEVER render under /listings/** paths. */
export const MediaItemSchema = z.object({
  url: z.string().min(1),
  kind: z.enum(["photo", "floorplan"]),
  is_ai: z.boolean().refine((v) => v === false, { message: "AI imagery may never depict a listed property" }),
  room: z.string().max(40).optional(),
});
export type MediaItem = z.infer<typeof MediaItemSchema>;

/**
 * Lead capture contract (brief §8).
 * NOTE: `honeypot` accepts any string so a filled honeypot reaches the handler's
 * silent sink and returns 200 {ok:true} with ZERO insert (AC-18) — the AC is
 * authoritative over the exemplar's max(0), which would 422 instead.
 */
export const LeadInput = z.object({
  source: z.enum(["pdp", "card", "valuation", "en", "direct"]),
  propertyRef: z
    .string()
    .regex(/^[A-Z]{3}-\d{4}-\d{3}$/)
    .optional(),
  district: z.string().max(40).optional(),
  type: z.string().max(20).optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "رقم هاتف غير صالح"),
  honeypot: z.string().max(200).optional().default(""),
});
export type LeadInput = z.infer<typeof LeadInput>;

/** Querystring filter contract (brief §4 filter law: /ar/listings?district=al-mezze&min=80k&rooms=3). */
export const FiltersSchema = z.object({
  district: z.enum(DISTRICTS).optional(),
  type: z.enum(LISTING_TYPES).optional(),
  min: z.number().int().nonnegative().optional(),
  max: z.number().int().nonnegative().optional(),
  rooms: z.number().int().min(1).max(4).optional(),
  features: z.array(z.enum(FEATURES)).default([]),
});
export type Filters = z.infer<typeof FiltersSchema>;

/** Parse a price query value: "80k" | "80000" | 80000 -> number | undefined */
export function parsePriceParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const m = /^(\d+)(k)?$/i.exec(v.trim());
  if (!m) return undefined;
  const n = parseInt(m[1]!, 10);
  return m[2] ? n * 1000 : n;
}

/** Serialize a price to the compact querystring form: 80000 -> "80k". */
export function serializePriceParam(n: number): string {
  return n % 1000 === 0 ? `${n / 1000}k` : String(n);
}
