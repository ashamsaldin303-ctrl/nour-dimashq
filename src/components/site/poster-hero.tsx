import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CinemaFilm } from "@/components/cinema/cinema-film";

/**
 * PosterHero (brief §4 section ①): 16:9 poster (≤60KB, sole
 * fetchpriority="high" on the site — AC-6), H1 + subline + dual CTA.
 * Carries the M2 mounting hooks: id="film-prologue" data-cinema-slot="hero".
 * M2 mount (integration brief §12): <CinemaFilm /> inside this section; the
 * film takes the slot only via [data-cinema-active="on"] — this hero stays
 * the no-JS / pre-activation / fail-closed rung.
 */
export function PosterHero() {
  return (
    <section id="film-prologue" data-cinema-slot="hero" className="relative isolate">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/poster.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        {/* daylight scrim: light stone gradient keeps basalt-ink text ≥ 4.5:1 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-stone-100/90 via-stone-100/60 to-stone-100/95"
        />
      </div>

      <div className="cinema-m1-content mx-auto flex min-h-[480px] max-w-6xl flex-col justify-center px-4 py-16 md:min-h-[560px] md:px-8 md:py-24">
        <h1 className="max-w-3xl text-h1 font-bold text-stone-900">
          بيوت دمشقية مختارة، بسنود موثّقة
        </h1>
        <p className="mt-4 max-w-2xl text-lead text-stone-800">
          مكتب عقاري دمشقي — نبيع البيت ونحفظ حكايته. كل عقار نفحص سنده قبل النشر،
          ونصوّره كما هو، والسعر بالدولار يُحدَّد بالليرة يومياً.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="cta-primary h-12 px-6 text-base active:scale-[0.98]">
            <Link href="/ar/listings">تسوّق العقارات</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-stone-600/50 bg-stone-50/80 px-6 text-base text-stone-900 hover:bg-stone-50 hover:text-stone-900 active:scale-[0.98]"
          >
            <Link href="/ar/valuation">كم يساوي عقارك؟</Link>
          </Button>
        </div>
      </div>

      {/* M2 cinema layer — dynamic mount (zero cinema JS in the initial bundle) */}
      <CinemaFilm />
    </section>
  );
}
