import Link from "next/link";
import { FileSearch, FileSignature, Globe, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkipLink } from "@/components/site/skip-link";
import { MashrabiyaDivider, StarMark } from "@/components/site/mashrabiya";
import { waLink } from "@/lib/wa";

/**
 * /en (brief §4 + §7): the one-page English corridor for diaspora buyers —
 * routes them into the same WhatsApp funnel. lang="en" dir="ltr" comes from
 * the (en) root layout. Header + footer are EN-specific and self-contained
 * in this file (SiteHeader/FooterOffice are Arabic).
 * The three explainer paragraphs are written to be pasted verbatim into
 * WhatsApp replies.
 */

export const metadata = {
  title: { absolute: "Nour Dimashq — Verified Damascus real estate" },
  description:
    "Verified Damascus real estate — bought from abroad, without the guesswork. We check the deed against the real-estate registry, review ownership history and area, and hand you a photographed report — before you pay anything.",
  alternates: { canonical: "/en" },
};

export default function EnPage() {
  const waHref = waLink("EN", "buying property in Damascus from abroad", "en");

  return (
    <>
      <SkipLink href="#main" label="Skip to content" />

      {/* Minimal EN header — sticky like SiteHeader (z-50 ladder) */}
      <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-stone-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-md py-1"
            aria-label="Nour Dimashq — Arabic home page"
          >
            <StarMark className="size-6 text-gold-600" />
            <span className="font-heading text-title font-bold text-stone-900">Nour Dimashq</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1">
            <Link
              href="/ar/listings"
              className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold text-stone-700 transition-colors duration-200 hover:bg-stone-200 hover:text-stone-900"
            >
              Properties
            </Link>
            <Link
              href="/"
              lang="ar"
              className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-bold text-gold-600 transition-colors duration-200 hover:text-gold-500"
            >
              العربية
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* ① hero trust line + ② verification explainer */}
        <section
          aria-labelledby="en-hero-heading"
          className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
        >
          <h1 id="en-hero-heading" className="max-w-4xl text-h1 font-bold text-stone-900">
            Verified Damascus real estate — bought from abroad, without the guesswork.
          </h1>
          <p className="mt-4 max-w-3xl text-lead text-stone-700">
            You are buying in a city you cannot easily visit, so trust has to come from
            documents instead of handshakes. We are a small Damascus real-estate office —
            and everything below is exactly how we work.
          </p>
          <div className="mt-8 flex max-w-3xl items-start gap-4 rounded-lg border border-stone-300/70 bg-stone-50 p-6 shadow-1">
            <FileSearch className="mt-1 size-6 shrink-0 text-gold-600" aria-hidden="true" />
            <div>
              <h2 className="font-heading text-title font-bold text-stone-900">The deed check</h2>
              <p className="mt-2 text-body text-stone-700">
                Before you pay anything, we check the deed against the real-estate registry,
                review the ownership history and the measured area, and hand you a photographed
                report. The same check protects every property we list.
              </p>
            </div>
          </div>
        </section>

        <MashrabiyaDivider />

        {/* ③ three explainers — each H2 + a paste-able WhatsApp paragraph */}
        <section
          aria-label="How buying from abroad works"
          className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
        >
          <div className="flex flex-col gap-12 md:gap-16">
            <section aria-labelledby="en-buying-heading" className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-900 text-gold-300">
                  <Globe className="size-6" aria-hidden="true" />
                </span>
                <h2 id="en-buying-heading" className="text-h2 font-bold text-stone-900">
                  Buying from abroad
                </h2>
              </div>
              <p className="mt-4 text-body text-stone-700">
                Here is the full journey, done remotely. We start with a live video tour of the
                property, then run our paid deed check against the real-estate registry. If
                everything checks out, you issue a power of attorney, and we negotiate and sign
                the sale contract on your behalf. Payments are released in milestones tied to
                documents, and the handover is registered and photographed. You never need to
                travel until you want to.
              </p>
            </section>

            <section aria-labelledby="en-poa-heading" className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-900 text-gold-300">
                  <FileSignature className="size-6" aria-hidden="true" />
                </span>
                <h2 id="en-poa-heading" className="text-h2 font-bold text-stone-900">
                  POA mechanics
                </h2>
              </div>
              <p className="mt-4 text-body text-stone-700">
                The power of attorney is notarized at a Syrian embassy or consulate and sent to
                Damascus. It must authorize exactly three things, for this transaction only:
                signing the sale contract, completing the registration, and handing over the
                funds. Before you sign anything, we coordinate the lawyer, review the scope of
                the POA with you, and send you the draft to approve. A POA broader than the
                transaction is a risk we do not take.
              </p>
            </section>

            <section aria-labelledby="en-funds-heading" className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-900 text-gold-300">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </span>
                <h2 id="en-funds-heading" className="text-h2 font-bold text-stone-900">
                  Funds &amp; deed risk
                </h2>
              </div>
              <p className="mt-4 text-body text-stone-700">
                Never pay the full price upfront. Money moves in milestones tied to documents: a
                deposit when the sale contract is signed, the balance when the transfer is
                registered in your name, and the remainder at a documented handover. Every
                release is matched to a verifiable step, and our paid deed check de-risks the
                whole chain — the seller, the ownership history, and the area — before any of
                it begins.
              </p>
            </section>
          </div>
        </section>

        {/* ④ EN wa.me CTA (prefilled EN text) */}
        <section aria-labelledby="en-cta-heading" className="bg-stone-900">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <p className="font-heading text-caption font-bold text-gold-300">WhatsApp</p>
            <h2 id="en-cta-heading" className="mt-2 max-w-2xl text-h2 font-bold text-stone-50">
              The next step is a conversation, not a form.
            </h2>
            <p className="mt-3 max-w-2xl text-lead text-stone-300">
              Ask about a property, a deed check, or a power of attorney — we reply in English.
            </p>
            <Button
              asChild
              size="lg"
              className="cta-primary mt-8 h-12 px-6 text-base active:scale-[0.98]"
            >
              <a
                href={waHref}
                data-wa-property="EN"
                data-wa-source="en"
                target="_blank"
                rel="noopener noreferrer"
              >
                Message us on WhatsApp — English spoken.
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Minimal EN footer */}
      <footer className="mt-auto border-t border-stone-300/70 bg-stone-200/60">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <div className="flex items-center gap-2">
                <StarMark className="size-6 text-gold-600" />
                <p className="font-heading text-title font-bold text-stone-900">
                  Nour Dimashq Real Estate — Damascus
                </p>
              </div>
              <p className="mt-3 text-sm text-stone-700">
                Prices in USD; the SYP rate is set daily with the last-update date.
              </p>
            </div>
            <a
              href={waHref}
              data-wa-property="EN"
              data-wa-source="en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-bold text-stone-50 transition-transform duration-200 active:scale-[0.98]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
