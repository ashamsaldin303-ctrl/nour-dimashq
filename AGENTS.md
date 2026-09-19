# AGENTS.md — Agent Operating Instructions · نور دمشق

Rules of engagement for any agent (human or AI) working in this repository. **Read this file, `README.md`, `CONTENT.md`, and `ASSUMPTIONS.md` before writing a single line.** The build contract is `upload/nour-dimashq-build-brief-v1.md` — it is the only authority; this file is its digest for daily work. Build history and decisions live in `worklog.md` (append-only).

## Project overview

Nour Dimashq (نور دمشق) M1 funnel — a trust-first Damascus real-estate funnel built on Next.js 16 App Router, **Arabic RTL first** (`/` and `/ar/**`; English corridor at `/en`), SQLite + Prisma (PostgreSQL in production), zero animation libraries. The single conversion throat: **every CTA is a wa.me link built by `src/lib/wa.ts`** — WhatsApp conversations are the conversion event, deed verification is the moat. The cinematic film layer (M2) is a separate future brief.

## Project DoD (brief §9, verbatim)

`tsc --noEmit` 0 errors · `eslint --max-warnings 0` · build green · zero console errors on any route · all gates green.

**Sandbox adaptation (ASSUMPTIONS.md A-2):** this environment runs the dev server only — no `next build`, no Vitest/Playwright/LHCI files. Verification here = `bunx tsc --noEmit` + `bun run lint` + curl greps + browser journeys, with evidence filed under `/evidence/<AC-ID>/`. Production-build-only numbers (Lighthouse scores) are labeled dev-measured or UNVERIFIED — never claimed. On a build-capable machine, run the brief §10 battery verbatim.

## Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Dev server on http://localhost:3000 (output tee'd to `dev.log`) |
| `bun run lint` | ESLint over the repo — expect exit 0, zero warnings |
| `bunx tsc --noEmit` | TypeScript strict check — expect 0 errors (scope: `src/**`) |
| `bun run db:push` | Push `prisma/schema.prisma` to the SQLite DB (`DATABASE_URL`) |
| `bun prisma/seed.ts` | Seed 8 SAMPLE listings + 1 agent (idempotent upserts by `ref`) |

## Structure map

```
src/app/(ar)/            Arabic ROOT layout — <html lang="ar" dir="rtl">, owns "/" (canonical) + "/ar/**"
  page.tsx               Home: poster hero → trust strip → signature collection → verification teaser → founder snippet
  ar/listings/           Index (static shell + client-side filter explorer) and [slug] PDP
                         (generateStaticParams, 9 sections, JSON-LD WITHOUT price)
  ar/valuation/          3-step seller-lead funnel → POST /api/lead
  ar/verification/       Deed-check service page (fee ٥٠–١٥٠ دولاراً)
  ar/sold/               Dated sold archive — ProofCard is defined LOCALLY in this page file
  ar/about/              Founder vow + [TO-OBTAIN] identity card + lazy OSM map
  [...rest]/ + not-found Designed Arabic 404 (catch-all)
src/app/(en)/            English ROOT layout — <html lang="en" dir="ltr">, owns /en (one-page corridor, self-contained header/footer)
src/app/api/lead/        POST lead capture — Zod LeadInput, honeypot silent sink, in-memory rate limit 5/min/IP
src/app/api/health/      GET probe → {"ok":true}
src/components/site/     The inventoried presentation components — NEVER recreate; extend via props/variants.
                         Canonical registry: docs/component-inventory.md
src/components/ui/       shadcn/ui primitives (new-york) — CLI-installed, never hand-rolled copies
src/lib/                 Contracts (no JSX): schemas (Zod unions + LeadInput + FiltersSchema + MediaItem law) ·
                         labels (Arabic display labels) · format (Arabic-Indic digits, dates, floors — zero ICU variance) ·
                         wa (the funnel throat: env number + 4+1 sources, ref in every text) ·
                         analytics (exactly 2 GA4 events, env-gated no-op) · office ([TO-OBTAIN] env slots) ·
                         listings (server-side mappers: cards, details, similar chain, sold proofs, verification panel) ·
                         db (Prisma singleton) · fonts (Cairo + Noto Kufi Arabic via next/font) · utils (cn)
prisma/                  schema.prisma (SQLite-adapted per ASSUMPTIONS.md A-1) + seed.ts (ALL DATA SAMPLE)
public/poster.webp       The SOLE LCP priority image — 58,750 bytes ≤ 60,000 budget (AC-6), 1600×900
```

## Hard laws digest (brief §5/§9/§11 — a violation is a defect, not a style nit)

1. **NEVER `letter-spacing` on Arabic** — always 0 (broken letter joins read as a foreign machine site). Grep gate AC-26.
2. **NEVER raw hex in JSX** — `@theme` token classes only; `src/app/globals.css` is the single token authority.
3. **NEVER raw `<img>`** — `next/image` with explicit `sizes` + dimensions (LCP/CLS law).
4. **NEVER hardcode the WhatsApp number or prefilled copy** — env `NEXT_PUBLIC_WHATSAPP_NUMBER` + `src/lib/wa.ts` builder only (NEVER-10).
5. **NEVER show a price without the triple**: date stamp + «السعر بالليرة يُحدَّد يومياً» + negotiable mark. NEVER a static SYP figure.
6. **NEVER `is_ai:true` imagery for listings** — real photos or the «صورة العقار قادمة» motif placeholder. The Zod `MediaItemSchema` refuses `is_ai:true` (grep gate AC-24).
7. **≤1 badge per card**, priority **verified > جديد > حصري**; reserved/sold render as separate honest status chips (AC-13).
8. **Exactly 2 GA4 events** — `whatsapp_click {property_id, source}` and `time_to_first_listing {value_ms}`. Never a third (AC-23/NEVER-14).
9. **RTL: logical utilities only** — `ms-/me-/ps-/pe-/text-start`; never `ml/mr/pl/pr/text-left/text-right` in the Arabic tree.
10. **Spacing on the 4px grid** — steps `1,2,3,4,6,8,12,16,24` only (banned: 5,10,18,36). Icons: one Lucide family, 16/20/24, one stroke.
11. **Numerals law** — every price, area, phone, ref, date renders inside `<Num>` (`<bdi class="num">`) for LTR isolation + tabular figures (AC-12).
12. **NEVER fabricate** listings, counters, testimonials, or metrics — seed data is SAMPLE with the swap path in `CONTENT.md`; real small numbers only.
13. **NEVER delete or hide sold listings** — status flip → dated proof card in `/ar/sold` (the trust archive).

**Rule zero:** any unknown not answered by the brief goes to `ASSUMPTIONS.md` (max 5 entries; the cap is full — see the file). A blocking unknown (would change routes/schema/tokens) → stop and emit a BLOCKED report. Never guess forward on money, legal, or brand identity.

## M2 mounting points (build these hooks, nothing more)

- The home hero carries `id="film-prologue"` and `data-cinema-slot="hero"` (present in `PosterHero`'s DOM on `/`).
- Motion tokens are reserved in `globals.css` `@theme`: `--dur-cinema: 600ms` (plus `--ease-out`, `--dur-fast/base/slow`).
- **The cinema (video/WebGL/GSAP/Lenis/scroll-pinning) is a SEPARATE future brief.** Never import those libraries in M1 (NEVER-13). Gold-plating is a defect — when your task is green, stop.

## Working protocol

1. Read the relevant brief section + `worklog.md` notes from prior agents before touching code.
2. Never modify files owned by another task without a worklog note saying you may (see the latest DO-NOT-TOUCH lists in `worklog.md`).
3. Verify with the DoD battery above; file evidence under `/evidence/<AC-ID>/`.
4. Append a Task entry to `worklog.md` (append-only) — what you did, what you verified, what the next agent must know.
5. Do not create new content: static copy is AUTHORED (brief §7), data is SAMPLE, identity is TO-OBTAIN — see `CONTENT.md`.
