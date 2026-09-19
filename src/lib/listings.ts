import { db } from "./db";
import { MediaItemSchema, VERIFICATION_LEVELS, LISTING_STATUSES, LISTING_TYPES, DISTRICTS } from "./schemas";
import type { District, Feature, ListingStatus, ListingType, MediaItem, VerificationLevel } from "./schemas";
import { DISTRICT_LABELS, TYPE_LABELS } from "./labels";
import {
  areaLabel,
  bathsLabel,
  formatDateAr,
  formatDateShortAr,
  floorLabel,
  formatUsd,
  roomsLabel,
} from "./format";
import { waLink } from "./wa";

/**
 * Server-side data layer (brief §6 + §4). All Prisma access lives here.
 * Mappers produce display-ready, JSON-safe data — every label/badge/date is
 * computed ONCE on the server, so client components never recompute
 * (zero hydration risk) and cards stay pure-render.
 */

type DbListing = Awaited<ReturnType<typeof db.listing.findFirstOrThrow>>;

export type CardBadge = "verified" | "new" | "exclusive" | null;

export type ListingCardData = {
  // identity
  ref: string;
  slug: string;
  titleAr: string;
  // filterable keys (client-side filtering)
  typeKey: ListingType;
  districtKey: District;
  statusKey: ListingStatus;
  rooms: number | null;
  priceUsd: number | null;
  features: Feature[];
  // display (preformatted server-side)
  typeLabel: string;
  districtLabel: string;
  priceLabel: string;
  priceDateLabel: string;
  negotiable: boolean;
  areaLabel: string;
  roomsLabel: string;
  bathsLabel: string;
  floorLabel: string;
  mediaCountLabel: string;
  tileKey: string;
  badge: CardBadge;
  badgeLabel: string | null;
  reserved: boolean;
  sold: boolean;
  waHref: string;
};

const NEW_WINDOW_DAYS = 14;

function asType(v: string): ListingType {
  return (LISTING_TYPES as readonly string[]).includes(v) ? (v as ListingType) : "apartment";
}
function asStatus(v: string): ListingStatus {
  return (LISTING_STATUSES as readonly string[]).includes(v) ? (v as ListingStatus) : "available";
}
function asDistrict(v: string): District {
  return (DISTRICTS as readonly string[]).includes(v) ? (v as District) : "al-mezze";
}
function asVerification(v: string): VerificationLevel {
  return (VERIFICATION_LEVELS as readonly string[]).includes(v) ? (v as VerificationLevel) : "unverified";
}

export function parseMedia(raw: string): MediaItem[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const result = MediaItemSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

function parseFeatures(raw: string): Feature[] {
  return (raw || "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean) as Feature[];
}

function computeBadge(l: DbListing): { badge: CardBadge; label: string | null } {
  // Priority law (AC-13): verified > جديد > حصري — exactly ONE badge.
  if (asVerification(l.verification) === "verified") return { badge: "verified", label: "موثّق" };
  const listed = l.listedDate instanceof Date ? l.listedDate.getTime() : Date.parse(String(l.listedDate));
  if (Date.now() - listed <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000) return { badge: "new", label: "جديد" };
  if (l.isSignature) return { badge: "exclusive", label: "حصري" };
  return { badge: null, label: null };
}

export function toCardData(l: DbListing): ListingCardData {
  const media = parseMedia(l.media);
  const { badge, label } = computeBadge(l);
  const typeKey = asType(l.type);
  const districtKey = asDistrict(l.district);
  const photos = media.filter((m) => m.kind === "photo");
  const status = asStatus(l.status);
  const title = l.titleAr ?? `${TYPE_LABELS[typeKey]} — ${DISTRICT_LABELS[districtKey]}`;

  return {
    ref: l.ref,
    slug: l.slug,
    titleAr: title,
    typeKey,
    districtKey,
    statusKey: status,
    rooms: l.rooms,
    priceUsd: l.priceUsd,
    features: parseFeatures(l.features),
    typeLabel: TYPE_LABELS[typeKey],
    districtLabel: DISTRICT_LABELS[districtKey],
    priceLabel: l.priceUsd !== null ? formatUsd(l.priceUsd) : "السعر عند التواصل",
    priceDateLabel: l.priceDate ? formatDateShortAr(l.priceDate) : "",
    negotiable: l.negotiable,
    areaLabel: areaLabel(l.areaM2),
    roomsLabel: roomsLabel(l.rooms) ?? "",
    bathsLabel: bathsLabel(l.baths) ?? "",
    floorLabel: floorLabel(l.floor, l.totalFloors) ?? "",
    mediaCountLabel: `${photos.length} ${photos.length === 1 ? "صورة" : photos.length === 2 ? "صورتان" : "صور"}`,
    tileKey: photos[0]?.url ?? "placeholder:generic",
    badge,
    badgeLabel: label,
    reserved: status === "reserved",
    sold: status === "sold",
    waHref: waLink(l.ref, title, "card"),
  };
}

/* ------------------------------ queries ------------------------------ */

/** Active = listed on the index (available + reserved; sold lives in /ar/sold). */
export async function getActiveListings(): Promise<ListingCardData[]> {
  const rows = await db.listing.findMany({
    where: { status: { in: ["available", "reserved"] } },
    orderBy: [{ isSignature: "desc" }, { listedDate: "desc" }],
    take: 60,
  });
  return rows.map(toCardData);
}

export async function getSignatureListings(): Promise<ListingCardData[]> {
  const rows = await db.listing.findMany({
    where: { isSignature: true, status: { in: ["available", "reserved"] } },
    orderBy: { listedDate: "desc" },
    take: 6,
  });
  return rows.map(toCardData);
}

export async function getSoldListings(): Promise<SoldProofData[]> {
  const rows = await db.listing.findMany({
    where: { status: "sold" },
    orderBy: { soldDate: "desc" },
    take: 24,
  });
  return rows.map((l) => {
    const card = toCardData(l);
    return {
      ...card,
      soldDateLabel: l.soldDate ? formatDateAr(l.soldDate) : "",
      soldPriceLabel: l.priceUsd !== null ? formatUsd(l.priceUsd) : "السعر عند التواصل",
    };
  });
}

export type SoldProofData = ListingCardData & { soldDateLabel: string; soldPriceLabel: string };

export async function getAllSlugs(): Promise<string[]> {
  const rows = await db.listing.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

export type VerificationChecks = {
  level: VerificationLevel;
  dateLabel: string | null;
  checks: string[];
  summary: string;
};

export function verificationPanel(l: DbListing): VerificationChecks {
  const level = asVerification(l.verification);
  const dateLabel = l.verificationDate ? formatDateAr(l.verificationDate) : null;
  if (level === "verified") {
    return {
      level,
      dateLabel,
      checks: ["مطابقة سند الملكية مقابل السجل العقاري", "مراجعة تاريخ الملكية وسلسلة الانتقال", "التحقق من مساحة العقار الفعلية"],
      summary: "عقار موثّق — فُحص السند مقابل السجل العقاري.",
    };
  }
  if (level === "deed_checked") {
    return {
      level,
      dateLabel,
      checks: ["الاطلاع على سند الملكية لدى البائع"],
      summary: "تم الاطلاع على سند الملكية — التوثيق الكامل مقابل السجل العقاري لم يتم بعد.",
    };
  }
  return {
    level,
    dateLabel: null,
    checks: [],
    summary: "غير موثّق بعد — يمكنك طلب التوثيق قبل دفع أي مبلغ.",
  };
}

export type ListingDetail = {
  card: ListingCardData;
  descAr: string | null;
  direction: string | null;
  yearBuiltLabel: string | null;
  baths: number | null;
  media: MediaItem[];
  verification: VerificationChecks;
  listedDateLabel: string;
  listedDateIso: string;
  soldDateLabel: string | null;
  agent: { nameAr: string; titleAr: string | null; landline: string | null } | null;
  similar: ListingCardData[];
  waHrefPdp: string;
};

/** Similar properties: same type+district in a ±25% price band, then same
 *  district, then same type — deterministic fallback chain, take 3. */
function pickSimilar(all: ListingCardData[], self: ListingCardData): ListingCardData[] {
  const band = (p: number | null) =>
    p === null || self.priceUsd === null ? true : p >= self.priceUsd * 0.75 && p <= self.priceUsd * 1.25;
  const notSelf = all.filter((c) => c.ref !== self.ref);
  const tier1 = notSelf.filter(
    (c) => c.typeKey === self.typeKey && c.districtKey === self.districtKey && band(c.priceUsd),
  );
  const tier2 = notSelf.filter((c) => !tier1.includes(c) && c.districtKey === self.districtKey);
  const tier3 = notSelf.filter((c) => !tier1.includes(c) && !tier2.includes(c) && c.typeKey === self.typeKey);
  return [...tier1, ...tier2, ...tier3].slice(0, 3);
}

export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  const l = await db.listing.findFirst({
    where: { slug },
    include: { agent: true },
  });
  if (!l) return null;

  const card = toCardData(l);
  const active = await getActiveListings();

  return {
    card,
    descAr: l.descAr ?? null,
    direction: l.direction ?? null,
    yearBuiltLabel: l.yearBuilt ? `بناء ${l.yearBuilt}` : null,
    baths: l.baths ?? null,
    media: parseMedia(l.media),
    verification: verificationPanel(l),
    listedDateLabel: formatDateAr(l.listedDate),
    listedDateIso: new Date(l.listedDate).toISOString(),
    soldDateLabel: l.soldDate ? formatDateAr(l.soldDate) : null,
    agent:
      l.agent === null
        ? null
        : { nameAr: l.agent.nameAr, titleAr: l.agent.titleAr ?? null, landline: l.agent.phoneLandline ?? null },
    similar: pickSimilar(active, card),
    waHrefPdp: waLink(l.ref, card.titleAr, "pdp"),
  };
}
