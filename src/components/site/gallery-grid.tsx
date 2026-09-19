import type { MediaItem } from "@/lib/schemas";
import { PlaceholderTile } from "./placeholder-tile";
import { Num } from "./num";

/**
 * GalleryGrid (brief §4 PDP ④): room-tagged photo grid with the photo-count
 * badge. M1 = motif placeholder tiles (media law); real photos swap in via
 * the media url without touching this component.
 */
export function GalleryGrid({ media }: { media: MediaItem[] }) {
  const photos = media.filter((m) => m.kind === "photo");
  const floorplans = media.filter((m) => m.kind === "floorplan");
  if (photos.length === 0) return null;

  return (
    <section aria-labelledby="gallery" className="scroll-mt-24">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="gallery" className="font-heading text-h3 font-bold text-stone-900">
          صور العقار
        </h2>
        <p className="text-caption font-semibold text-stone-700">
          <Num>{photos.length} {photos.length === 1 ? "صورة" : photos.length === 2 ? "صورتان" : "صور"}</Num>
          {floorplans.length > 0 ? " + مخطط" : ""}
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((m, i) => (
          <li key={`${m.url}-${i}`} className="relative">
            <PlaceholderTile
              tileKey={m.url}
              top={m.room}
              className="aspect-square w-full"
            />
          </li>
        ))}
      </ul>
      {floorplans.length > 0 ? (
        <div className="mt-6">
          <h3 className="font-heading text-body font-bold text-stone-900">مخطط العقار</h3>
          <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {floorplans.map((m, i) => (
              <li key={`${m.url}-${i}`}>
                <PlaceholderTile tileKey={m.url} top="مخطط" sub="المخطط قادم" className="aspect-[4/3] w-full" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
