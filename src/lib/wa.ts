/**
 * lib/wa.ts — the funnel's single throat (brief §8).
 * Every WhatsApp CTA in the app routes through this builder:
 * one number (env), four+one sources, free attribution.
 *
 * NEVER hardcode the number (NEVER-10) — env-gated, fail-fast with a clear
 * message if missing.
 */

export type WaSource = "pdp" | "card" | "valuation" | "en" | "direct";

function waNumber(): string {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!num || !/^\d{8,15}$/.test(num)) {
    throw new Error(
      "NEXT_PUBLIC_WHATSAPP_NUMBER must be set (digits only, E.164 without +, e.g. 963991234567) — see .env.example",
    );
  }
  return num;
}

/**
 * Build a wa.me link with prefilled text.
 * All four property/sources carry the ref inside the encoded text (AC-22).
 * `ref` is the listing ref (APR-2026-118) or a context token
 * (VALUATION / EN / REQ) for non-property CTAs.
 */
export function waLink(ref: string, title: string, source: WaSource): string {
  const text =
    source === "en"
      ? `Hello, I'm interested in ${title} (Ref ${ref})`
      : source === "valuation"
        ? `مرحباً، أرسلت طلب تقييم لعقار في ${title} — كود الطلب ${ref}`
        : source === "direct"
          ? `مرحباً، أبحث عن عقار: ${title} (كود ${ref})`
          : `مرحباً، مهتم بالعقار ${title} (كود ${ref})`;
  return `https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`;
}
