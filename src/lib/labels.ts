import type { District, Feature, ListingType } from "./schemas";

/**
 * Display label maps (client-safe, no server imports).
 * FilterBar, cards, and PDP all read from here — one source of truth.
 */

export const DISTRICT_LABELS: Record<District, string> = {
  "al-mezze": "المزة",
  "al-maliki": "المالكي",
  "abu-rummaneh": "أبو رمانة",
};

export const TYPE_LABELS: Record<ListingType, string> = {
  apartment: "شقة",
  villa: "فيلا",
  house: "بيت",
  land: "أرض",
  shop: "محل",
  office: "مكتب",
  farm: "مزرعة",
  building: "بناء",
};

export const FEATURE_LABELS: Record<Feature, string> = {
  elevator: "مصعد",
  generator: "مولّدة",
  solar: "طاقة شمسية",
  waterTank: "خزان مياه",
  parking: "موقف سيارات",
  balcony: "شرفة",
};

/** generator/solar first-class (brief §4 filter bar spec). */
export const FEATURE_ORDER: Feature[] = ["generator", "solar", "elevator", "parking", "balcony", "waterTank"];

export const VERIFIED_LABEL = "موثّق";
export const NEW_LABEL = "جديد";
export const EXCLUSIVE_LABEL = "حصري";
export const RESERVED_LABEL = "محجوز";
export const SOLD_LABEL = "تم البيع";
