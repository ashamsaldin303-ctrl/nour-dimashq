# API Route Table — جدول المسارات (canonical)

Canonical route contract: brief §8 (verbatim intent) **+ as-built actuals** of this repo. Source of truth for handlers: `src/app/**`. Every page renders server-set locale — `lang="ar" dir="rtl"` on `/` + `/ar/**`, `lang="en" dir="ltr"` on `/en` (NEVER client-side dir switching).

## Routes

| METHOD | Path | Purpose | Auth | Req schema | Res schema | Statuses | Notes |
|---|---|---|---|---|---|---|---|
| GET | `/` | Arabic home (canonical) — convince in 5 s the office is verifiable, then hand off | — | — | HTML (SSG) | 200 | Server-set `lang=ar dir=rtl`; poster hero is the sole `fetchpriority="high"` (AC-6); skip link «تخطَّ إلى العقارات» is the first focusable element (AC-28) |
| GET | `/ar/listings` | Listings index + client-side filters | — | querystring (see below) | HTML (static shell + client filter) | 200 | Static server shell (`getActiveListings`, sold excluded); `ListingsExplorer` reads AND writes `searchParams` via `history.replaceState`; Back restores the previous result set (AC-10); zero-result state → «اطلب منّا» wa.me handoff (AC-11) |
| GET | `/ar/listings/[slug]` | PDP — convert to a WhatsApp conversation carrying the ref | — | path param `slug` | HTML | 200 / 404 | `generateStaticParams` from all seed slugs (8); 9 sections per brief order; sticky wa.me bar (z-40, safe-area); JSON-LD `RealEstateListing` **without** `price` (AC-15); `generateMetadata` keeps price out of the description (stale-price law) |
| GET | `/ar/valuation` | Seller-lead funnel — 3 screens, one question each | — | — | HTML | 200 | Client `ValuationForm` (district → type → phone) POSTs `/api/lead`; honeypot + `+963` prefix display; full state matrix incl. 429/422/network |
| GET | `/ar/verification` | Sell the deed-check service | — | — | HTML | 200 | Fee line «٥٠–١٥٠ دولاراً حسب العقار», 5-step timeline, FAQ accordion, wa CTA «أريد توثيق عقار» (source `direct`, context `VER`) |
| GET | `/ar/sold` | Prove activity with dated evidence | — | — | HTML | 200 | `getSoldListings()` → dated proof cards (original price + sold date + ref); sold listing `APR-2025-211` renders with its sold date + original price (AC-20); honest empty state |
| GET | `/ar/about` | The founder vow + office identity | — | — | HTML | 200 | Vow H1 + 2 paragraphs (§7 verbatim); 4 `[TO-OBTAIN]` identity slots; address card + lazy OSM iframe (general-Damascus view until `OFFICE_ADDRESS` is filled) |
| GET | `/en` | English corridor for diaspora buyers | — | — | HTML | 200 | Server-set `lang=en dir=ltr`; self-contained EN header/footer; all 3 explainer H2s (Buying from abroad · POA mechanics · Funds & deed risk) + EN wa.me CTA (AC-21); all numerals Latin |
| POST | `/api/lead` | Lead capture, spam-guarded | public | `LeadInput` (Zod) — see below | `{ok: boolean}` | 200 / 422 / 429 | Honeypot silent sink (200 + ZERO insert — AC-18); in-memory rate limit 5/min/IP; valid → Lead row `status:"new"` (AC-19); Telegram notify env-gated, never blocks; field-by-field Prisma data — never a body spread |
| GET | `/api/health` | Liveness probe | — | — | `{ok: true}` | 200 | — |

**Not built (by scope law):** `/en` listings index (EN is a one-page corridor), admin/upload/auth routes, any M2 cinema route.

## `/ar/listings` querystring filter contract

Filters are pure client state serialized into the URL (shareable links; `replaceState`, no history spam):

| Param | Allowed values | Example |
|---|---|---|
| `district` | `al-mezze` \| `al-maliki` \| `abu-rummaneh` | `?district=al-mezze` |
| `type` | `apartment` \| `villa` \| `house` \| `land` \| `shop` \| `office` \| `farm` \| `building` | `?type=villa` |
| `min` / `max` | price, compact `80k` style or plain `80000` (`parsePriceParam`: `/^(\d+)(k)?$/i`) | `?min=80k&max=150k` |
| `rooms` | `1`–`4` (4 means ٤+) | `?rooms=3` |
| `features` | CSV of `elevator,generator,solar,waterTank,parking,balcony` | `?features=generator,solar` |

Combined example (brief §4 filter law): `/ar/listings?district=al-mezze&min=80k&rooms=3`.
The equivalent Zod mirror is `FiltersSchema` in `src/lib/schemas.ts`.

## `POST /api/lead` — `LeadInput` schema (`src/lib/schemas.ts`, brief §8)

| Field | Type | Rules |
|---|---|---|
| `source` | enum (required) | `"pdp" \| "card" \| "valuation" \| "en" \| "direct"` |
| `propertyRef` | string (optional) | `/^[A-Z]{3}-\d{4}-\d{3}$/` — e.g. `APR-2026-118` |
| `district` | string (optional) | max 40 chars |
| `type` | string (optional) | max 20 chars |
| `phone` | string (required) | `/^\+?[0-9]{8,15}$/` |
| `honeypot` | string (optional, default `""`) | any non-empty value = bot → silent sink (200, ZERO insert — AC-18). Accepts a string so a filled honeypot reaches the sink instead of 422 (the AC is authoritative over the exemplar's `max(0)` — documented in `schemas.ts`) |

### Example request/response pairs

**1. Valid valuation lead (AC-19):**
```bash
curl -X POST http://localhost:3000/api/lead \
  -H 'Content-Type: application/json' \
  -d '{"source":"valuation","district":"al-mezze","type":"apartment","phone":"+963991234567"}'
```
→ `200 {"ok":true}` — Lead row created (`source:"valuation"`, `status:"new"`). Telegram notification fires only if `TELEGRAM_BOT_TOKEN` + `OFFICE_CHAT_ID` are set; failures never block the lead.

**2. Honeypot variant (AC-18):**
```bash
curl -X POST http://localhost:3000/api/lead \
  -H 'Content-Type: application/json' \
  -d '{"source":"valuation","phone":"+963991234567","honeypot":"http://spam.example"}'
```
→ `200 {"ok":true}` — **NO row inserted** (silent sink).

**3. Invalid payload:**
```bash
curl -X POST http://localhost:3000/api/lead \
  -H 'Content-Type: application/json' \
  -d '{"source":"valuation","phone":"12345"}'
```
→ `422 {"ok":false}` (malformed JSON also → 422).

**4. Rate limit:** the 6th POST within 60 s from the same IP → `429 {"ok":false}` (in-memory counter, 5/min/IP; `x-forwarded-for` first hop, fallback `local`).

## wa.me integration (the funnel's single throat)

Every CTA routes through `waLink(ref, title, source)` in `src/lib/wa.ts` — one number from `NEXT_PUBLIC_WHATSAPP_NUMBER` (never hardcoded), 4+1 sources (`pdp | card | valuation | en | direct`), and the ref rides inside every prefilled text (AC-22). GA4: exactly two events — `whatsapp_click {property_id, source}` (click delegation on `a[href*="wa.me/"]`) and `time_to_first_listing {value_ms}` (first `[data-listing-card]` intersection). `NEXT_PUBLIC_GA4_ID` unset → analytics is a no-op logger, no scripts load.
