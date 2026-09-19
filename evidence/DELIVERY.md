# DELIVERY — نور دمشق Nour Dimashq · M1 Funnel Launch — 2026-09-19

**Stack (from node_modules, not memory):** Next.js 16.1.3 · React 19.2.3 · TypeScript 5.9.3 (strict + noImplicitAny) · Tailwind CSS 4.1.18 (CSS-first `@theme`, no config file) · shadcn/ui new-york · Prisma 6.19.2 + SQLite (PostgreSQL reversal path: ASSUMPTIONS.md A-1) · Zod 4.3.5 · next/font (Noto Kufi Arabic 400/700 + Cairo 400–700, arabic+latin subsets, self-hosted).

## What was built

- **`/`** — Poster hero (58.75KB mashrabiya poster, sole high-priority LCP fetch, M2 mounting hooks `id="film-prologue"` `data-cinema-slot="hero"`) + trust strip + «مجموعة منتقاة» signature collection (4 seed cards) + dark verification-teaser panel + founder snippet + footer.
- **`/ar/listings`** — client FilterBar (purpose sale-only/«قريباً», type ×8, district ×3, price min/max, rooms, features generator/solar first-class) writing shareable querystrings via replaceState; popstate restores results; count line (aria-live); zero-result state = «اطلب منّا» wa.me handoff; 1/2/3-col grid.
- **`/ar/listings/[slug]` ×8** — PDP: full-bleed tile hero, KeyFactsBar (price triple + 5 icon tiles), TrustPanel (3 honest verification states), room-tagged GalleryGrid, description + feature chips, location card, AgentCard, SimilarListings (±25% band chain), sticky WhatsApp bar (z-40, safe-area). `generateStaticParams` + `generateMetadata` + JSON-LD `RealEstateListing` WITHOUT price.
- **`/ar/valuation`** — 3-screen form (district → type → phone), honeypot, full state matrix, success = direct WhatsApp handoff; `POST /api/lead` (Zod, honeypot silent sink, 5/min/IP rate limit, Telegram env-gated); `GET /api/health`.
- **`/ar/verification`** — deed-check service: lede, 5-step timeline, fee line, wa.me CTA, 3-item FAQ.
- **`/ar/sold`** — dated proof cards (original photo placeholder, original price, sold date, ref).
- **`/ar/about`** — founder vow (verbatim), TO-OBTAIN identity slots, address card + lazy OSM iframe.
- **`/en`** — LTR corridor: trust line, verification explainer, 3 paste-able WhatsApp-template explainers (Buying from abroad · POA mechanics · Funds & deed risk), EN wa CTA.
- **Cross-cutting** — Damascus-Light token contract (`globals.css` from brief §5 verbatim values), multi-root layouts (server-set `lang`/`dir`), `.num`+`<bdi>` on every numeral, skip links, gold focus rings, reduced-motion kill-switch, zero-JS header, exactly-2 GA4 events (env-gated), designed 404, brand icon.

## Verification matrix

→ `evidence/verification-matrix.md` — **25 PASS · 2 PASS(dev-measured) · 1 SUBSTITUTED(PASS-equivalent) · 3 UNVERIFIED(prod-only)** across AC-1…28, each with evidence path. Zero FAIL.

## Evidence

`/evidence/` — per-AC directories with command outputs, 26 screenshots (8 routes × 3 viewports + full-page), perf measurements, contrast audit (13/13 pairs), heading structure, console-error scan (0 × 8 routes), API test transcripts.

## ASSUMPTIONS.md (5/5, cap respected)

A-1 SQLite↔PostgreSQL mapping · A-2 verification-harness substitution · A-3 4th signature listing (brief-internal 3-vs-4–6 inconsistency) · A-4 SAMPLE WhatsApp number + swap path · A-5 global poster OG (no Arabic system fonts for satori).

## Known gaps / blockers

- AC-2/4/5 need a production build + LHCI (Syria profile) — run brief §10 verbatim on a build-capable host. Proxy numbers recorded.
- All listing imagery = SAMPLE motif tiles (media law — real photography is the owner's call; swap path in CONTENT.md).
- Office identity slots [TO-OBTAIN ×4] unset — launch-blocking, not build-blocking.

## Handoff for next session

README.md (cold-start quick start + battery) · AGENTS.md (laws + DoD) · CONTENT.md (content registers + publish path) · ASSUMPTIONS.md · docs/api-route-table.md · docs/component-inventory.md · .env.example · prisma/schema.prisma + seed.ts · scripts/contrast-audit.mjs.

**Cold-start test:** a fresh agent reading those files needs zero clarifying questions — structure, laws, contracts, swap paths, and verified commands are all on disk.

## Architecture note (one paragraph)

Two root layouts (`(ar)` RTL, `(en)` LTR) give every route a server-set `lang`/`dir` and keep `/` as the Arabic default; all data flows through `lib/listings.ts` whose mappers compute every label, badge, and date **once on the server**, so client components (FilterBar, ValuationForm, AnalyticsInit) stay pure-render with zero hydration risk — Arabic-Indic numerals are produced by a hand-rolled deterministic formatter inside `<bdi class="num">`. The single conversion throat is `lib/wa.ts` (env number, ref-carrying prefilled texts, 5 sources) fired by exactly one delegated `whatsapp_click` listener; leads land in SQLite through a Zod-validated honeypot+rate-limited route handler. The whole visual system is one frozen token file (limestone `stone-*` ramp, one gold accent, Kufi/Cairo, matte shadows, mashrabiya motif) — the M2 cinema mounts later on the reserved `film-prologue` hooks and `--dur-cinema` token without touching the funnel.
