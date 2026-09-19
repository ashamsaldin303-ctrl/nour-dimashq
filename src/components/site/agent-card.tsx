import { MessageCircle, Phone } from "lucide-react";
import type { ListingDetail } from "@/lib/listings";
import { Num } from "./num";

/**
 * AgentCard (brief §4 PDP ⑦): the human behind the listing.
 * WhatsApp CTA carries the ref (source pdp).
 */
export function AgentCard({ detail }: { detail: ListingDetail }) {
  const agent = detail.agent;
  if (!agent) return null;

  return (
    <section
      aria-label="مسؤول العقار"
      className="flex flex-col items-start gap-4 rounded-lg border border-stone-300/70 bg-stone-50 p-4 shadow-1 sm:flex-row sm:items-center sm:justify-between md:p-6"
    >
      <div>
        <p className="font-heading text-title font-bold text-stone-900">{agent.nameAr}</p>
        <p className="mt-1 text-caption font-semibold text-stone-700">{agent.titleAr}</p>
        {agent.landline ? (
          <a
            href={`tel:${agent.landline}`}
            className="mt-2 flex min-h-11 items-center gap-2 text-sm font-semibold text-stone-800 hover:text-stone-900"
          >
            <Phone className="size-4 text-gold-600" aria-hidden="true" />
            <Num>{agent.landline}</Num>
          </a>
        ) : null}
      </div>
      <a
        href={detail.waHrefPdp}
        data-wa-property={detail.card.ref}
        data-wa-source="pdp"
        target="_blank"
        rel="noopener noreferrer"
        className="cta-primary flex h-12 shrink-0 items-center gap-2 rounded-md bg-gold-600 px-6 text-base font-bold text-stone-50 transition-transform duration-200 active:scale-[0.98]"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        احجز معاينة — واتساب
      </a>
    </section>
  );
}
