import type { ListingCardData } from "@/lib/listings";
import { ListingCard } from "./listing-card";

/** SimilarListings (brief §4 PDP ⑧): same type/district/price band, 3 cards. */
export function SimilarListings({ similar }: { similar: ListingCardData[] }) {
  if (similar.length === 0) return null;
  return (
    <section aria-labelledby="similar" className="scroll-mt-24">
      <h2 id="similar" className="font-heading text-h3 font-bold text-stone-900">
        عقارات مشابهة
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {similar.map((listing) => (
          <li key={listing.ref} className="h-full">
            <ListingCard listing={listing} />
          </li>
        ))}
      </ul>
    </section>
  );
}
