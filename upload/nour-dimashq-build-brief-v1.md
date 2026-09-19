---
brief: nour-dimashq v1.0 (M1 — Funnel Launch)
date: 2026-09-19
plan_ref: nour-dimashq-plan.md@v1.0
stack_pin: "Next.js 16.x · React 19.x · TypeScript 5 strict · Tailwind CSS 4.x · shadcn/ui · Prisma (PostgreSQL)"
token_budget: ~12K (within 8–16K law)
scope_law: "THIS BRIEF BUILDS THE FUNNEL ONLY (M1). The cinematic film layer (M2) is a SEPARATE future brief — do NOT build it."
---

# BUILD BRIEF — «نور دمشق» Nour Dimashq · M1 Funnel Launch

> **الملخص العربي (تنفيذي):**
> هذا عقد البناء الأول لموقع «نور دمشق» — مكتب عقاري دمشقي. المرحلة M1 تبني **القمع التجاري كاملاً**: الصفحة الرئيسية (الباب الخفيف)، فهرس العقارات مع فلاتر تُكتب في الرابط، صفحة كل عقار مع شريط واتساب ثابت، قمع التقييم «كم يساوي عقارك؟»، صفحة «عقار موثّق»، أرشيف «تم البيع»، صفحة قسم المؤسس، وممر إنجليزي للمغتربين — فوق هوية «نور دمشق» (حجر كلسي، بازلت، ذهبي واحد، كوفي للعناوين وCairo للنص).
> **قانون هذا العقد:** القمع أولاً — لا سينما، لا فيديو، لا WebGL، لا GSAP في هذه المرحلة. البيانات التجريبية موسومة SAMPLE والبيانات الحقيقية قرار الإنسان قبل الإطلاق. كل سعر بالدولار + «السعر بالليرة يُحدَّد يومياً» بتاريخ. واتساب هو القمع.

---

## 1. Mission & Role

You are the full-stack build agent for **Nour Dimashq (نور دمشق)**, a licensed Damascus real-estate brokerage. This brief is your ONLY authority — it is self-contained; you need zero clarifying questions. The site's business model: a trust-first listings funnel where **WhatsApp conversations are the conversion event**, verification deeds are the moat, and the cinematic scroll film (built later, never in this brief) is ornament on top. Your job now: ship the complete M1 funnel — every route, every state, every wa.me link, every gate — so a Syrian buyer on a $200 Android inside the Facebook WebView sees the listings grid **paint before Instagram renders its own link preview**.

**Rule zero — never invent:** any unknown not answered by this file goes to `ASSUMPTIONS.md` (max 5 entries: id, decision, rationale, risk, reversal). A blocking unknown (would change routes/schema/tokens) → stop and emit a BLOCKED report (condition → hypothesis → attempts → options → recommended default → the exact question). Never guess forward on money, legal, or brand identity.

## 2. Pinned Stack (exact — never "latest")

| Layer | Pin | Contrast rule (use X, NEVER legacy-Y) |
|---|---|---|
| Framework | Next.js 16.x, App Router | RSC + Route Handlers; NEVER pages/, NEVER getInitialProps |
| React | 19.x | Server Components for data pages; `"use client"` ONLY for filter bar, valuation form, analytics |
| TypeScript | 5.x `strict: true` | NEVER `any` (unknown + narrowing); NEVER non-null assertions on data |
| Styles | Tailwind CSS 4.x via `@theme` in `app/globals.css` | NEVER `tailwind.config.js`; NEVER raw hex in JSX |
| Components | shadcn/ui (CLI-installed) | NEVER hand-rolled copies of shadcn primitives |
| Data | Prisma + PostgreSQL (`DATABASE_URL`; Supabase-compatible) | Singleton client in `lib/db.ts`; NEVER instantiate per request; NEVER raw SQL strings |
| Fonts | `next/font/google`: **Noto Kufi Arabic** (400,700 — headings) + **Cairo** (400,500,600,700 — body), subsets `["arabic","latin"]` | NEVER `<link>` to fonts.googleapis.com; NEVER runtime CDN fonts |
| Images | `next/image` with explicit `sizes` + `width`/`height` | NEVER raw `<img>` |
| Validation | Zod on every API boundary | NEVER unvalidated `req.body` reads |
| Tests | Vitest (unit) + Playwright (E2E, prod build) + playwright-axe (a11y) | — |
| Motion | **NONE.** Zero animation libraries in M1. CSS transitions only (tokens §5) | NEVER import gsap/lenis/three in this brief |

Version echo: your ACK (§12) must state the exact versions resolved in `package.json` for every row above.

## 3. Scope IN / OUT

**IN — MUST (all of it):** routes of §4 · token contract §5 · Prisma schema §6 · content §7 · lead API + wa.me + GA4 §8 · all acceptance criteria §9 · verification loop §10.

**IN — SHOULD:** OG image kit per PDP · `docs/api-route-table.md` + `docs/component-inventory.md` + `CONTENT.md` · lazy static map card (OSM iframe, loading="lazy") on About.

**IN — COULD (only if MUST is green):** print-friendly PDP sheet.

**OUT — do NOT build (labeled, will NOT be built in this brief):**
- ❌ The cinematic film: no WebGL, no shaders, no GSAP, no Lenis, no `<video>`, no depth maps, no scroll pinning. (M2 brief, later.)
- ❌ Tier B video, consent door UI, MB labels, cinema manifests. (M2.)
- ❌ Service worker, RUM beacon, 360° panoramas (Pannellum), per-listing films. (M2/v1.1.)
- ❌ Admin UI, uploads, auth, webhooks. Content ops = seed script + CONTENT.md publish path.
- ❌ Dark mode. v1 is daylight-only (Damascus Light law).
- ❌ Stripe/payments or any paid dependency. Zero recurring licenses is the law.
- ❌ /en listings index (EN is a one-page corridor only).

M2 mounting points (build these hooks, nothing more): home hero section carries `id="film-prologue"` and a `data-cinema-slot="hero"` attribute; tokens §5 include motion durations for later use.

## 4. Pages Map (route → one job → ordered sections)

Server-set locale: every `/ar/**` and `/` route renders `<html lang="ar" dir="rtl">`; `/en` renders `lang="en" dir="ltr"`. NEVER client-side dir switching.

| Route | One job | Ordered sections (top→bottom) |
|---|---|---|
| `/` (ar, default) | Convince in 5 seconds this office is verifiable, then hand off | ① Poster hero (16:9, ≤60 KB, sole `fetchpriority="high"`, LCP): H1 + subline + dual CTA ② Trust strip (3 proof chips) ③ «مجموعة منتقاة» Signature collection (4–6 ListingCards from seed `isSignature`) ④ Verification teaser («عقار موثّق» → /ar/verification) ⑤ Founder intro snippet (2 sentences + link) ⑥ Footer (license `[TO-OBTAIN]`, 011, WhatsApp CTA, address) |
| `/ar/listings` | Let a buyer filter & compare in ≤3 taps | ① Filter bar (client component): purpose (بيع/إيجار via status/type mapping — v1 sale only, rent toggle disabled with label «قريباً»), type, district (المزة/المالكي/أبو رمانة), price range, rooms, features (generator/solar first-class) ② Results count line («٨ عقارات») ③ Card grid (1 col @375, 2 @768, 3 @1440) ④ Zero-result state → «اطلب منّا» wa.me handoff |
| `/ar/listings/[slug]` | Convert to a WhatsApp conversation carrying the ref | ① Full-bleed hero photo (real/sample placeholder, 4:3) ② Key-facts bar: dual-currency price + date stamp, area/rooms/baths/floor/واجهة — equal-width icon tiles ③ Trust panel (verification status + what was checked + date; or honest «غير موثّق») ④ Gallery grid (room-tagged, photo-count badge «٣٢ صورة» style, floor-plan tab if present) ⑤ Description + highlights chips ⑥ Location card (district + distance chips; SHOULD: lazy OSM iframe) ⑦ Agent card ⑧ Similar properties (same type/district/price band, 3 cards) ⑨ Sticky bottom wa.me bar («احجز معاينة — واتساب») — always visible |
| `/ar/valuation` | Capture seller leads in 3 steps | ① H1 + promise ② 3-step form (one question per screen): district select → type segmented → phone (country-code aware) + submit ③ Privacy line («رقمك يبقى معنا — لا رسائل جماعية») ④ Success state: «سنجيب خلال ٢٤ ساعة» + direct wa.me handoff CTA |
| `/ar/verification` | Sell the deed-check service | ① H1 + what is checked ② 5-step process timeline ③ Fee line («٥٠–١٥٠ دولاراً») ④ wa.me CTA «أريد توثيق عقار» ⑤ FAQ (3 items) |
| `/ar/sold` | Prove activity with dated evidence | ① H1 «تم البيع» + honesty line ② Dated proof cards (original photo, original price, sold date, ref) |
| `/ar/about` | The founder vow | ① Vow H1 + 2 paragraphs (verbatim §7) ② License + family name + 011 landline `[TO-OBTAIN]` slots ③ Office address card ④ CTA |
| `/en` | Route diaspora buyers into the same funnel | ① Hero trust line (EN) ② Verification explainer ③ Three explainers: *Buying from abroad · POA mechanics · Funds & deed risk* (each doubles verbatim as a WhatsApp reply template — write them as paste-able paragraphs) ④ EN wa.me CTA (prefilled EN text) |
| `POST /api/lead` | Persist leads, spam-guarded | See §8 |
| `GET /api/health` | Probe | `{ok:true}` |

**Filter law:** the index page is prerendered static; the filter bar is a `"use client"` component that reads AND writes `searchParams` (`/ar/listings?district=al-mezze&min=80k&rooms=3`) and toggles card visibility client-side. Shareable URLs + working back button + zero server roundtrips. Serialize filter state to the querystring on every change (replaceState, no history spam).

**Component inventory (author at T0.4, canonical `docs/component-inventory.md`):** `PosterHero`, `TrustStrip`, `ListingCard`, `FilterBar`, `KeyFactsBar`, `TrustPanel`, `GalleryGrid`, `AgentCard`, `SimilarListings`, `StickyWaBar`, `ValuationForm`, `ProofCard`, `FooterOffice`, `SectionHeading`. NEVER recreate an inventoried component.

## 5. Design Tokens (exact values — freeze before any feature task)

Damascus Light: limestone daylight, basalt ink, ONE copper-gold accent. Light theme only. Generate `app/globals.css` FROM this table; never retype values elsewhere.

```css
@theme {
  /* palette — warm-tinted stone ramp + gold */
  --color-stone-50:#F5F0E4; --color-stone-100:#EDE6D4;  /* page bg */
  --color-stone-200:#E2D9C2; --color-stone-300:#CFC3A6; --color-stone-400:#B3A583;
  --color-stone-500:#97896B; --color-stone-600:#7A6E55; --color-stone-700:#5C5340;
  --color-stone-800:#3E382B; --color-stone-900:#262119;  /* basalt ink — text */
  --color-gold-300:#D9AE6B;   /* on-dark accent */
  --color-gold-400:#C08A3E;   /* badge fill (stone-900 text = 5.4:1) */
  --color-gold-500:#9C6E2A;   /* large text ≥24px + UI lines (3:1 on stone-100) */
  --color-gold-600:#7A531B;   /* accent text at body size (4.6:1 on stone-100) */
  --color-ok-600:#4A6B3A; --color-ok-50:#EAF0E4;         /* success */
  --color-bad-600:#A03D2E; --color-bad-50:#F6E8E4;       /* danger */
  /* type */
  --font-heading:"Noto Kufi Arabic",serif;
  --font-body:"Cairo",sans-serif;
  /* scale (px): 12/13/14/16/18/20/24/30/38/46 · body leading 1.75 · headings 1.4 */
  --text-body:16px; --text-body--line-height:1.75;
  --text-lead:18px; --text-lead--line-height:1.8;
  --text-h1:clamp(30px,5vw,46px); --text-h1--line-height:1.3;
  --text-h2:clamp(24px,4vw,30px); --text-h2--line-height:1.35;
  /* spacing grid (px): 4·8·12·16·24·32·48·64·96 — banned: 5,10,18,36 */
  --spacing:4px;
  /* radius */
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px;
  /* elevation — matte daylight: soft warm shadows only */
  --shadow-1:0 1px 2px rgba(38,33,25,.08);
  --shadow-2:0 4px 12px rgba(38,33,25,.12);
  --shadow-3:0 12px 32px rgba(38,33,25,.16);
  /* motion — one easing personality; durations reserved for M2 use too */
  --ease-out:cubic-bezier(.22,1,.36,1);
  --dur-fast:120ms; --dur-base:220ms; --dur-slow:380ms; --dur-cinema:600ms;
  /* z ladder: content 0 · sticky bar 40 · header 50 · overlay 60 · toast 70 */
}
```

**Contrast floors (measured, not eyeballed):** body text stone-900 on stone-100 (12.5:1) · accent text gold-600 (4.6:1) · large text/UI lines gold-500 (3:1) · focus ring gold-600 ≥3:1 on both stone-100 and stone-900. `letter-spacing: 0` on ALL Arabic (law). Numerals: `.num{unicode-bidi:isolate;direction:ltr;font-variant-numeric:tabular-nums}` — every price, area, phone, ref wrapped in `<bdi>`.

**Brand motif:** a parametric mashrabiya lattice SVG pattern (geometric 8-point star grid, stroke stone-300/gold-400, ≤6 KB inline) used as: hero poster background layer (beneath a stone gradient), section dividers, and the «صورة العقار قادمة» placeholder tile. No imagery of fake rooms, ever.

## 6. Data Contract (Prisma schema verbatim + seed law)

```prisma
generator client { provider = "prisma-client-js" }
datasource db  { provider = "postgresql"  url = env("DATABASE_URL") }

enum ListingType   { apartment villa house land shop office farm building }
enum ListingStatus { available reserved sold rented }
enum VerificationLevel { unverified deed_checked verified }

model Agent {
  id            String   @id @default(cuid())
  nameAr        String
  titleAr       String?
  whatsapp      String          // digits only, E.164 without +, e.g. "963991234567"
  phoneLandline String?
  isPrimary     Boolean  @default(false)
  listings      Listing[]
  createdAt     DateTime @default(now())
}

model Listing {
  id               String           @id @default(cuid())
  ref              String  @unique  // "APR-2026-118" — office quotes refs
  slug             String  @unique  // "apartment-mezze-apr-118"
  type             ListingType
  status           ListingStatus    @default(available)
  priceUsd         Decimal?         @db.Decimal(12,2)
  priceSyp         Decimal?         @db.Decimal(16,2)
  priceDate        DateTime?        // «سعر اليوم؟» weekly ritual stamp
  negotiable       Boolean          @default(true)
  areaM2           Int
  rooms            Int?
  baths            Int?
  floor            Int?
  totalFloors      Int?
  direction        String?          // واجهة
  district         String           // al-mezze | al-maliki | abu-rummaneh
  yearBuilt        Int?
  features         String[]         // elevator,generator,solar,waterTank,parking,balcony
  media            Json             @default("[]")  // [{url,kind,is_ai,room?}]
  isSignature      Boolean          @default(false)
  verification     VerificationLevel @default(unverified)
  verificationDate DateTime?
  titleAr          String?
  titleEn          String?
  descAr           String?
  descEn           String?
  agentId          String?
  agent            Agent?           @relation(fields:[agentId],references:[id])
  listedDate       DateTime         @default(now())
  soldDate         DateTime?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}

model Lead {
  id          String   @id @default(cuid())
  source      String   // pdp|card|valuation|en|direct
  propertyRef String?
  district    String?
  type        String?
  phone       String
  status      String   @default("new")
  createdAt   DateTime @default(now())
}
```

**Media law (structural):** `media` items are `{url, kind:"photo"|"floorplan", is_ai:boolean, room?:string}`. Under `/listings/**` render paths, `is_ai === true` is a **build error** (grep gate §10). M1 sample imagery = generated placeholder tiles (mashrabiya motif + district label + «صورة العقار قادمة»), `is_ai:false`, clearly SAMPLE.

**Seed (`prisma/seed.ts`, idempotent, 8 listings — ALL marked SAMPLE in a header comment + CONTENT.md):**

| ref | type | district | area | rooms | floor | USD | status | verification | signature |
|---|---|---|---|---|---|---|---|---|---|
| APR-2026-118 | apartment | al-mezze | 165 | 3 | 3/5 | 118,000 | available | verified | ✔ |
| APR-2026-102 | apartment | al-maliki | 140 | 2 | 2/4 | 95,000 | available | deed_checked | ✔ |
| VIL-2026-031 | villa | abu-rummaneh | 320 | 5 | G/2 | 260,000 | available | verified | ✔ |
| APR-2026-090 | apartment | al-mezze | 110 | 2 | 4/6 | 72,000 | available | unverified | — |
| HOU-2026-044 | house | al-maliki | 210 | 4 | G/1 | 145,000 | available | deed_checked | — |
| APR-2026-075 | apartment | al-mezze | 95 | 2 | 1/5 | 68,000 | reserved | unverified | — |
| APR-2025-211 | apartment | al-maliki | 130 | 3 | 3/5 | 88,000 | sold (2026-06-14) | deed_checked | — |
| OFF-2026-019 | office | abu-rummaneh | 85 | 2 | 2/8 | 60,000 | available | unverified | — |

All seeds: `negotiable:true`, `priceDate` = build date, `features` realistic mixes (always include `solar` or `generator` on ≥4 — post-2020 differentiator), Arabic titles like «شقة ١٦٥م² — المزة، إطلالة شارع رئيسي», 3-line Arabic descriptions with honest specifics (طراز البناء، الطابق، واجهة، أجهزة). One agent: `nameAr:"أبو محمد الحلبي"`, `titleAr:"مؤسس المكتب"` (SAMPLE).

## 7. Content (real copy verbatim — content-source law)

**Placeholder policy: NEVER ship lorem/Acme/test@example.** Every string below is final copy. Listings data = SAMPLE seed (source: sample — swap path in CONTENT.md). Office identity fields = `[TO-OBTAIN]` env slots (source: to-obtain — launch-blocking, not build-blocking).

**Home hero (verbatim):**
- H1: «بيوت دمشقية مختارة، بسنود موثّقة»
- Sub: «مكتب عقاري دمشقي — نبيع البيت ونحفظ حكايته. كل عقار نفحص سنده قبل النشر، ونصوّره كما هو، والسعر بالدولار يُحدَّد بالليرة يومياً.»
- CTA primary (gold): «تسوّق العقارات» → `/ar/listings` · CTA secondary: «كم يساوي عقارك؟» → `/ar/valuation`
- Trust strip chips: «تحقّق من السند قبل النشر» · «أسعار بتاريخ اليوم» · «أرشيف مبيعات مؤرَّخ»

**Valuation (verbatim):** H1 «كم يساوي عقارك؟» · promise: «نجيب خلال ٢٤ ساعة بنطاق سعري تقريبي من صفقات حقيقية — مجاناً، والوعد الذي لا يستطيع أي منشور فيسبوك تقديمه.» · steps labels: «الحي» / «نوع العقار» / «رقم هاتفك» · privacy: «رقمك يبقى معنا — لا رسائل جماعية ولا مشاركة مع أي طرف.» · success: «شكراً — سيتواصل معك المكتب خلال ٢٤ ساعة. استعجل؟ راسلنا مباشرة:» + wa.me CTA.

**Verification (verbatim):** H1 «عقار موثّق» · lede: «نفحص سند الملكية مقابل السجل العقاري، ونراجع تاريخ الملكية ومساحة العقار، ونسلّمك تقريراً مصوّراً — قبل أن تدفع على العقار فلساً واحداً.» · fee line: «٥٠–١٥٠ دولاراً حسب العقار» · 5 steps: «تواصل واتساب» → «اتفاق الرسوم» → «طلب السجل العقاري (ميدانياً)» → «تقرير مصوّر يصلك في المحادثة» → «شارة عقار موثّق إذا وكّلتنا البيع». FAQ: (1) هل التحقق إلزامي للنشر؟ لا — لكن كل عقار موثّق يباع أسرع. (2) هل تفحصون عقارات غير معروضة عندكم؟ نعم — الخدمة لأي عقار في دمشق. (3) كم يستغرق؟ من ٢ إلى ٣ أسابيع بحسب السجل.

**Sold archive (verbatim):** H1 «تم البيع» · line: «كل عقار نبيعه يتحوّل إلى إثبات مؤرَّخ — لأن السوق الذي يحكم بالسمعة يستحق أرشيفاً صادقاً.»

**About (verbatim, with slots):** H1 «نبيع البيت ونحفظ حكايته» · P1: «نور دمشق ليس موقعاً يعرض إعلانات — بل مكتباً دمشقياً صغيراً يختار البيوت التي يستحقها هذا البلد، ويتحقق من كل سند قبل أن يراه أحد. اسمنا وترخيصنا وأرقام مبيعاتنا أمامك، لأن الثقة هنا تُورَّث ولا تُشترى.» · P2: «إن كنت تشتري من الخارج: نجهّز لك التوكيل والتحقق والتسليم المرحلي، ونتابع معك حتى القيد. وإن كنت تبيع: نعطيك سعراً صادقاً بالدولار لا رقماً للمجاملة.» · Slots `[TO-OBTAIN]`: `OFFICE_LICENSE`, `FOUNDER_NAME`, `LANDLINE_011`, `OFFICE_ADDRESS`.

**/en (verbatim):** H1 "Verified Damascus real estate — bought from abroad, without the guesswork." · Explainer 1 *Buying from abroad*: full remote journey (video tour → verification → POA → milestone payments → registered handover), written to paste verbatim into a WhatsApp reply. · Explainer 2 *POA mechanics*: notarized at a Syrian embassy/consulate; what it must authorize; we coordinate the lawyer. · Explainer 3 *Funds & deed risk*: milestone payments (contract/registration/handover), documented handover, the paid deed-check that de-risks all of it. · CTA: "Message us on WhatsApp — English spoken."

**Footer (all routes):** «مكتب نور دمشق العقاري — دمشق» · license slot · 011 landline slot · WhatsApp CTA · «الأسعار بالدولار والسعر بالليرة يُحدَّد يومياً بتاريخ آخر تحديث».

**Banned copy words (grep gate):** seamlessly/supercharge/unlock/elevate/revolutionize-type hype — AR equivalents («سلس»، «ثوري»، «فائق») — and any fabricated numbers. Real small numbers only («٢ عقارات موثّقة هذا الشهر» style derives from seed, never hardcoded).

## 8. API & Integrations

**Route table (canonical copy → `docs/api-route-table.md`):**

| METHOD | path | purpose | auth | req schema | res schema | statuses | notes |
|---|---|---|---|---|---|---|---|
| GET | `/` , `/ar/**` pages | SSG HTML | — | — | HTML | 200 | server-set `lang=ar dir=rtl` |
| GET | `/ar/listings` | index + client filters | — | querystring filters | HTML | 200 | static shell + client filter |
| GET | `/ar/listings/[slug]` | PDP | — | — | HTML | 200/404 | `generateStaticParams` from seed |
| GET | `/en` | corridor | — | — | HTML | 200 | `lang=en dir=ltr` |
| POST | `/api/lead` | lead capture | public | `LeadInput` (Zod) | `{ok:boolean}` | 200/429 | honeypot + rate limit |
| GET | `/api/health` | probe | — | — | `{ok:true}` | 200 | — |

**Zod contract + handler exemplar (complies with every rule — copy this standard):**

```ts
// app/api/lead/route.ts
const LeadInput = z.object({
  source: z.enum(["pdp","card","valuation","en","direct"]),
  propertyRef: z.string().regex(/^[A-Z]{3}-\d{4}-\d{3}$/).optional(),
  district: z.string().max(40).optional(),
  type: z.string().max(20).optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/),
  honeypot: z.string().max(0).optional().default(""),   // filled = bot
});
export async function POST(req: Request) {
  const body = LeadInput.safeParse(await req.json());
  if (!body.success) return Response.json({ok:false}, {status:422});
  if (body.data.honeypot) return Response.json({ok:true});      // silent sink
  if (rateLimited(req))   return Response.json({ok:false}, {status:429}); // in-memory, 5/min/IP
  await db.lead.create({data:{...body.data, status:"new"}});
  await notifyTelegramOptional(body.data);                       // env-gated, never blocks
  return Response.json({ok:true});
}
```

Example request: `{"source":"valuation","district":"al-mezze","type":"apartment","phone":"+963991234567"}` → `{"ok":true}` (row created). Honeypot variant → `{"ok":true}` (NO row).

**`lib/wa.ts` — the funnel's single throat (exemplar):**

```ts
const NUM = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!; // digits only, e.g. "963991234567"
export function waLink(ref: string, title: string, source: "pdp"|"card"|"valuation"|"en") {
  const text = source === "en"
    ? `Hello, I'm interested in ${title} (Ref ${ref})`
    : `مرحباً، مهتم بالعقار ${title} (كود ${ref})`;
  return `https://wa.me/${NUM}?text=${encodeURIComponent(text)}`;
}
```

Every CTA in the app routes through this builder — one number, four sources, free attribution. Unit-test all four branches (ref present in encoded text).

**GA4 (exactly 2 product events — never more):** `whatsapp_click {property_id, source}` on every wa.me click · `time_to_first_listing {value_ms}` once, when the first ListingCard enters viewport (`performance.getEntriesByType("navigation")` baseline). Via `lib/analytics.ts` with `NEXT_PUBLIC_GA4_ID` env — unset = no-op logger. Zero other custom events.

**Env (`/.env.example`):** `DATABASE_URL` · `NEXT_PUBLIC_WHATSAPP_NUMBER` · `NEXT_PUBLIC_GA4_ID` (optional) · `NEXT_PUBLIC_SITE_URL` · `TELEGRAM_BOT_TOKEN` + `OFFICE_CHAT_ID` (optional).

**SEO law:** content in DOM, never canvas-only. PDP `generateMetadata`: Arabic title, description, `og:image` = listing poster, `og:locale=ar_SY`. JSON-LD `RealEstateListing` with `datePosted`, `itemOffered` — **`price` deliberately OMITTED** (stale price = published lie). hreflang: `ar` ↔ `en` only where /en has an equivalent (it doesn't for listings — only x-default → ar).

## 9. Acceptance Criteria (binary · each names its check · no and/or)

**Project DoD (once, in AGENTS.md):** `tsc --noEmit` 0 errors · `eslint --max-warnings 0` · `next build` green · zero console errors on any route · all tests green.

| ID | Criterion (binary) | Check |
|---|---|---|
| AC-1 | Build+types+lint all green | CI log |
| AC-2 | Lighthouse perf ≥0.90 on `/`, `/ar/listings`, one PDP (Syria profile 3.3Mbps/100ms RTT) | LHCI report → `/evidence/AC-2/` |
| AC-3 | LCP ≤2500ms AND CLS ≤0.02 on those 3 routes | LHCI assertions |
| AC-4 | `/` total byte weight ≤1,250,000 | LHCI assertion |
| AC-5 | Route JS ≤80KB gz on every M1 route | LHCI `resource-summary:script:size` ≤81920 |
| AC-6 | Home poster ≤60,000 bytes AND exactly one `fetchpriority="high"` on `/` | `curl -s / | grep -c fetchpriority` = 1 + `wc -c` on asset |
| AC-7 | axe: 0 critical AND 0 serious on every route | playwright-axe report → `/evidence/AC-7/` |
| AC-8 | No horizontal scroll at 375px on any route | Playwright `document.scrollWidth ≤ 375` |
| AC-9 | `<html lang="ar" dir="rtl">` on `/`+`/ar/**`; `lang="en" dir="ltr"` on `/en` | `curl | grep '<html'` |
| AC-10 | Filter changes write querystring; browser Back restores previous result set | Playwright journey J1 |
| AC-11 | Zero-result filter state shows «اطلب منّا» wa.me link (not a dead end) | Playwright: `?district=al-maliki&min=500k` |
| AC-12 | Every ListingCard price wrapped in `<bdi>` with `.num` class | DOM assertion |
| AC-13 | Card badge count ≤1 AND priority verified>جديد>حصري | unit test on seed render |
| AC-14 | PDP static HTML contains ref code AND district name AND «واتساب» | `curl -s <pdp> | grep -c "APR-2026-118\|المزة\|واتساب"` ≥3 |
| AC-15 | PDP JSON-LD present AND contains no `"price"` key | `grep RealEstateListing` + `!grep '"price"'` |
| AC-16 | Sticky bar href matches `wa.me/<env>?text=…<ref>…` on PDP | DOM assertion |
| AC-17 | Valuation = 3 screens, one question each | Playwright journey J2 |
| AC-18 | Honeypot-filled POST → 200 `{ok:true}` AND zero DB insert | route test |
| AC-19 | Valid valuation POST → Lead row `source:"valuation"` | route test |
| AC-20 | Sold listing APR-2025-211 renders in `/ar/sold` with sold date AND original price | Playwright |
| AC-21 | `/en` contains all 3 explainer H2s AND an EN wa.me link | `curl | grep -c "POA\|Buying from abroad\|Funds"` ≥3 |
| AC-22 | `lib/wa.ts` 4 branches: each prefilled text contains the ref | vitest |
| AC-23 | `whatsapp_click` payload carries `property_id` AND `source` | vitest on `trackWaClick` |
| AC-24 | `grep -r "is_ai\":\s*true" --include="*.ts" app/ components/` → 0 hits under listings paths | grep gate |
| AC-25 | `grep -ri "lorem\|acme\|test@example"` over repo → 0 hits | grep gate |
| AC-26 | `grep -r "letter-spacing" app/` → 0 hits on Arabic text rules | grep gate |
| AC-27 | `[TO-OBTAIN]` register present in CONTENT.md with all 4 office slots | grep CONTENT.md |
| AC-28 | Skip link «تخطَّ إلى العقارات» is the first focusable element on `/` | Playwright keyboard |

## 10. Verification Loop (exact battery — run per task AND full at the end)

```bash
pnpm tsc --noEmit && pnpm eslint . --max-warnings 0
pnpm next build                     # static export of listings pages via generateStaticParams
pnpm vitest run                     # unit: wa.ts, badge priority, analytics payloads
pnpm playwright test                # prod build · journeys J1 J2 J3 · 375/768/1440 · axe
grep -r "is_ai\":\s*true" app/ components/ || true        # AC-24 gate
grep -ri "lorem\|acme\|test@example" . --exclude-dir=node_modules || true   # AC-25
npx @lhci/cli autorun               # assertions: perf≥.9 · LCP≤2500 · CLS≤.02 ·
                                    # byteWeight≤1250000 · script≤81920 · document≤51200
```

Playwright journeys (prod build): **J1** filter→PDP→wa.me click (`href` contains ref, event fires) · **J2** valuation 3 steps→submit→success state · **J3** /ar/sold proof card → home → signature card. Evidence per AC-ID → `/evidence/<AC-ID>/` (screenshots + command output). Screenshot naming: `route--state--width.png`.

## 11. NEVER Rules (≤15 · each paired with ALWAYS · defect signature)

1. NEVER fabricate listings, counters, testimonials, or metrics → ALWAYS real data or seed marked SAMPLE + swap path in CONTENT.md. *(Defect: fake trust — fatal in this market.)*
2. NEVER render AI-generated imagery for a listed property (`is_ai:true` under `/listings/**` = build error) → ALWAYS real photos or «صورة العقار قادمة» motif placeholder. *(Defect: trust law violation.)*
3. NEVER `letter-spacing` on Arabic → ALWAYS 0 + `word-spacing` if needed. *(Defect: broken letter joins — reads as foreign machine site.)*
4. NEVER split Arabic text per-character for any effect → ALWAYS word/line-level only. *(Defect: disconnected glyphs.)*
5. NEVER physical `left/right/margin-left` in new CSS → ALWAYS logical `inline-start/inline-end`. *(Defect: RTL mirroring bugs.)*
6. NEVER show a price without date stamp AND «السعر بالليرة يُحدَّد يومياً» AND negotiable mark → ALWAYS the triple. NEVER a static SYP figure. *(Defect: published lie.)*
7. NEVER raw `<img>` → ALWAYS `next/image` + `sizes` + dimensions. *(Defect: LCP/CLS blowout.)*
8. NEVER runtime font CDN → ALWAYS `next/font` self-hosted subsets. *(Defect: Damascus latency + sanctions fragility.)*
9. NEVER raw hex in JSX → ALWAYS `@theme` token classes. *(Defect: token contract rot.)*
10. NEVER hardcode WhatsApp number/copy → ALWAYS env + `lib/wa.ts` builder. *(Defect: untraceable funnel.)*
11. NEVER client-side `dir`/`lang` switching → ALWAYS server-set per route. *(Defect: mode flash + SEO.)*
12. NEVER delete/hide sold listings → ALWAYS status flip → dated proof card in `/ar/sold`. *(Defect: trust archive destroyed.)*
13. NEVER import gsap/lenis/three/video/WebGL in this brief → ALWAYS CSS transitions only. *(Defect: scope creep into M2.)*
14. NEVER more than the 2 named GA4 events → ALWAYS `whatsapp_click` + `time_to_first_listing` only. *(Defect: instrumentation spam.)*
15. NEVER stacked badges/fake urgency → ALWAYS ≤1 badge, real small numbers. *(Defect: fraud signal in a fraud-scarred market.)*

## 12. Done Definition & ACK

**DONE = all 28 AC PASS with evidence at `/evidence/<AC-ID>/`, re-runnable read-only by the reviewer.** No partial credit — "mostly done" = NOT-DONE; ship the blocker list instead. When all AC pass → STOP (gold-plating is a defect; reject unrequested extras). Deliver: verification matrix (AC-ID → check → expected → actual → PASS/FAIL → evidence path) + delivery report + cold-start handoff (README with verified commands, AGENTS.md, `.env.example`, migrations, CONTENT.md publish path) + one-paragraph architecture note.

**Your FIRST output is an ACK (≤15 lines):** exact resolved versions of every §2 row · route count built · AC count accepted · inactive feature triggers you are NOT activating (payments/webhooks/realtime/video/WebGL/auth — list them) · the single line: "Zero clarifying questions — brief is self-contained." Then build T0.1→T1.12 in DAG order.

**Terminal reminders (positional law — critical content repeats at the end):** Rule zero: never invent — unknowns → `ASSUMPTIONS.md` ≤5, blockers → BLOCKED report. Scope law: funnel only — cinema is a SEPARATE later brief. Trust law: AI never depicts a listed property; honest small numbers only. The funnel ships complete: every route, every state, every wa.me link, every gate.

---

### Appendix (compact) — shared constants (mirror of plan)

Viewports 375/768/1440 · screenshots `route--state--width.png` · no horizontal scroll @375 · AC 3–8/feature binary with named checks · fix loop ≤3 rounds · task ≤5 files/3–7 AC/one commit · route JS ≤80KB gz · poster ≤60KB sole high-priority · LCP ≤2.5s · CLS ≤0.02 · INP ≤200ms · axe 0 critical+serious · contrast 4.5:1 body / 3:1 large+UI (light theme only, v1 ruling) · icons one family (Lucide) 16/20/24 one stroke rule · evidence `/evidence/<AC-ID>/` · NEVER registry ≤15 paired.

**Content-source table (CONTENT.md law):** static copy = AUTHORED (§7 verbatim) · listings = SAMPLE (seed, swap pre-launch) · office identity = TO-OBTAIN (env slots, launch-blocking) · photography = deferred to owner (placeholder tiles until then).

