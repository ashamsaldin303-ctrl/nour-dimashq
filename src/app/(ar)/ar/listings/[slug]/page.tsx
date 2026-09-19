import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { SkipLink } from "@/components/site/skip-link";
import { SiteHeader } from "@/components/site/site-header";
import { FooterOffice } from "@/components/site/footer-office";
import { PlaceholderTile } from "@/components/site/placeholder-tile";
import { KeyFactsBar } from "@/components/site/key-facts-bar";
import { TrustPanel } from "@/components/site/trust-panel";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { AgentCard } from "@/components/site/agent-card";
import { SimilarListings } from "@/components/site/similar-listings";
import { StickyWaBar } from "@/components/site/sticky-wa-bar";
import { MashrabiyaDivider } from "@/components/site/mashrabiya";
import { Num } from "@/components/site/num";
import { getAllSlugs, getListingBySlug } from "@/lib/listings";
import { FEATURE_LABELS, FEATURE_ORDER, RESERVED_LABEL, SOLD_LABEL } from "@/lib/labels";
import type { Feature } from "@/lib/schemas";

/**
 * PDP (brief §4, route `/ar/listings/[slug]`): one job — convert to a
 * WhatsApp conversation carrying the ref. Sections ①–⑨ in brief order.
 * `price` is deliberately OMITTED from JSON-LD (stale price = published lie).
 */

const DISTRICT_INFO: Record<string, { line: string; chips: string[] }> = {
  "al-mezze": { line: "حي حيوي غربي دمشق — شوارع رئيسية وخدمات كاملة.", chips: ["مواصلات يومية", "أسواق وخدمات", "قرب الجامعة"] },
  "al-maliki": { line: "من أهدى أحياء دمشق — سكني عائلي وشوارع خضراء.", chips: ["هدوء عائلي", "مدارس قريبة", "شوارع خضراء"] },
  "abu-rummaneh": { line: "من أرقى أحياء دمشق — سفارات ومقار رسمية.", chips: ["حي راقٍ", "أمن وأمان", "قرب الروضة"] },
};

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getListingBySlug(slug);
  if (!detail) return { title: "العقار غير موجود" };
  const { card } = detail;
  return {
    title: card.titleAr,
    description: `${card.typeLabel} في ${card.districtLabel} — ${card.areaLabel}${card.roomsLabel ? ` · ${card.roomsLabel}` : ""}. ${detail.verification.summary} من مكتب نور دمشق.`,
    alternates: { canonical: `/ar/listings/${slug}` },
    openGraph: {
      title: card.titleAr,
      description: `${card.typeLabel} في ${card.districtLabel} — ${card.areaLabel} · كود ${card.ref}`,
      locale: "ar_SY",
      images: [{ url: "/poster.webp", width: 1600, height: 900, alt: card.titleAr }],
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getListingBySlug(slug);
  if (!detail) notFound();

  const { card } = detail;
  const districtInfo = DISTRICT_INFO[card.districtKey] ?? {
    line: "حي سكني في دمشق.",
    chips: [],
  };

  // JSON-LD RealEstateListing — price deliberately omitted (brief §8 SEO law)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: card.titleAr,
    datePosted: detail.listedDateIso,
    url: `/ar/listings/${slug}`,
    image: "/poster.webp",
    itemOffered: {
      "@type": card.typeKey === "apartment" ? "Apartment" : card.typeKey === "house" ? "House" : card.typeKey === "office" ? "OfficeOrCommercialBuilding" : "SingleFamilyResidence",
      name: card.titleAr,
      numberOfRooms: card.rooms ?? undefined,
      floorSize: { "@type": "QuantitativeValue", value: Number(card.areaLabel.replace(/[^\d]/g, "")) || undefined, unitCode: "MTK" },
      address: {
        "@type": "PostalAddress",
        addressLocality: districtInfo ? card.districtLabel : "دمشق",
        addressRegion: "دمشق",
        addressCountry: "SY",
      },
    },
  };

  return (
    <>
      <SkipLink href="#gallery" label="تخطَّ إلى تفاصيل العقار" />
      <SiteHeader active="listings" />

      <main id="main" className="flex-1 pb-28">
        {/* ① full-bleed hero photo (sample placeholder tile until real photography) */}
        <section aria-label={`صورة ${card.titleAr}`}>
          <PlaceholderTile
            tileKey={card.tileKey}
            top={card.districtLabel}
            className="aspect-[4/3] w-full rounded-none md:aspect-[16/9]"
          />
          {card.sold || card.reserved ? (
            <p className="bg-stone-900 px-4 py-3 text-center font-heading text-body font-bold text-stone-50 md:px-8">
              {card.sold ? (
                <>
                  {SOLD_LABEL}
                  {detail.soldDateLabel ? (
                    <>
                      {" "}
                      بتاريخ <Num>{detail.soldDateLabel}</Num>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  {RESERVED_LABEL} — سجّل اهتمامك عبر واتساب
                </>
              )}
            </p>
          ) : null}
        </section>

        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
          {/* title + ref */}
          <header>
            <p className="text-caption font-bold text-gold-600">
              {card.typeLabel} · {card.districtLabel}
              {detail.yearBuiltLabel ? ` · ${detail.yearBuiltLabel}` : ""}
            </p>
            <h1 className="mt-2 text-h1 font-bold text-stone-900">{card.titleAr}</h1>
            <p className="mt-2 text-caption font-semibold text-stone-700">
              كود العقار: <Num>{card.ref}</Num> · نُشر في <Num>{detail.listedDateLabel}</Num>
            </p>
          </header>

          {/* ② key facts: price triple + icon tiles */}
          <KeyFactsBar detail={detail} />

          {/* ③ trust panel */}
          <TrustPanel verification={detail.verification} />

          {/* ④ gallery */}
          <GalleryGrid media={detail.media} />

          {/* ⑤ description + highlights */}
          <section aria-labelledby="description">
            <h2 id="description" className="font-heading text-h3 font-bold text-stone-900">
              عن هذا العقار
            </h2>
            {detail.descAr ? (
              <div className="mt-4 flex max-w-3xl flex-col gap-3 text-body leading-loose text-stone-800">
                {detail.descAr.split("\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : null}
            {card.features.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {FEATURE_ORDER.filter((f) => card.features.includes(f as Feature)).map((f) => (
                  <li
                    key={f}
                    className="rounded-sm border border-stone-300 bg-stone-100 px-3 py-2 text-caption font-semibold text-stone-800"
                  >
                    {FEATURE_LABELS[f as Feature]}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {/* ⑥ location card */}
          <section
            aria-labelledby="location"
            className="rounded-lg border border-stone-300/70 bg-stone-50 p-4 shadow-1 md:p-6"
          >
            <h2 id="location" className="flex items-center gap-2 font-heading text-h3 font-bold text-stone-900">
              <MapPin className="size-5 text-gold-600" aria-hidden="true" />
              الموقع
            </h2>
            <p className="mt-2 text-body text-stone-800">
              حي {card.districtLabel} — {districtInfo.line}
            </p>
            {districtInfo.chips.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {districtInfo.chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-sm bg-stone-200 px-3 py-2 text-caption font-semibold text-stone-800"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {/* ⑦ agent */}
          <AgentCard detail={detail} />

          {/* ⑧ similar */}
          <SimilarListings similar={detail.similar} />
        </div>

        <MashrabiyaDivider />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>

      <FooterOffice />

      {/* ⑨ sticky WhatsApp bar — always visible */}
      <StickyWaBar detail={detail} />
    </>
  );
}
