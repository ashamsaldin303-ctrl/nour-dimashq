# نور دمشق · Nour Dimashq — M1 Funnel

Nour Dimashq (نور دمشق) is a licensed Damascus real-estate brokerage. This repository is its **M1 funnel**: a trust-first, Arabic-RTL-first site where every screen exists to move a buyer or seller into a **WhatsApp conversation — the single conversion event**. Deed verification against the real-estate registry is the moat («نبيع البيت ونحفظ حكايته»), every price is USD + date-stamped with the daily-SYP line «السعر بالليرة يُحدَّد يومياً», sold listings become a dated archive instead of disappearing, and the cinematic scroll film is a separate future brief (M2). M1 ships the complete funnel: home, filterable listings index, property pages with a sticky WhatsApp bar, a 3-step valuation funnel, the deed-check service page, the sold archive, the founder page, and an English corridor for the diaspora.

## Stack (pinned — exact resolved versions)

| Layer | Pin |
|---|---|
| Framework | **Next.js 16.1.3** (App Router, RSC, Route Handlers — never pages/) |
| UI runtime | **React 19.2.3** (`"use client"` only where needed: filters, valuation form, analytics) |
| Language | **TypeScript 5.9.3** (`strict: true`, no `any`) |
| Styles | **Tailwind CSS 4.1.18** — CSS-first `@theme` in `src/app/globals.css` (no `tailwind.config`) |
| Components | **shadcn/ui** (new-york style, CLI-installed in `src/components/ui/`) |
| Data | **Prisma 6.19.2** + SQLite (`db/custom.db`) — **PostgreSQL in production**, see `ASSUMPTIONS.md` A-1 for the mechanical mapping + reversal |
| Validation | **Zod 4.3.5** on every API boundary |
| Fonts | `next/font` self-hosted: **Noto Kufi Arabic** (headings) + **Cairo** (body), subsets arabic+latin — never CDN fonts |
| Analytics | GA4 via `src/lib/analytics.ts` — exactly 2 events; no-op without `NEXT_PUBLIC_GA4_ID` |
| Motion | **None.** Zero animation libraries in M1 (CSS transitions + reserved tokens only) |

## Quick start

```bash
cp .env.example .env      # then fill the vars (NEXT_PUBLIC_WHATSAPP_NUMBER + NEXT_PUBLIC_SITE_URL are required;
                          #  the 4 OFFICE_* identity slots are launch-blocking — see CONTENT.md)
bun install
bun run db:push           # create/refresh the SQLite schema (DATABASE_URL)
bun prisma/seed.ts        # seed 8 SAMPLE listings + 1 agent (idempotent upserts by ref)
bun run dev               # http://localhost:3000
```

## Routes (9 pages + 2 APIs)

| Route | What it is |
|---|---|
| `/` | Arabic home (canonical) — poster hero, trust strip, signature collection, verification teaser, founder snippet |
| `/ar/listings` | Listings index — client filters that write the querystring (`?district=al-mezze&min=80k&rooms=3`) |
| `/ar/listings/[slug]` | Property page — 9 sections, sticky WhatsApp bar, JSON-LD without price |
| `/ar/valuation` | «كم يساوي عقارك؟» — 3-step seller-lead funnel → `POST /api/lead` |
| `/ar/verification` | «عقار موثّق» — deed-check service (٥٠–١٥٠ دولاراً) |
| `/ar/sold` | «تم البيع» — dated sold archive (proof cards) |
| `/ar/about` | Founder vow + office identity card + lazy OSM map |
| `/en` | English corridor for diaspora buyers (`lang=en dir=ltr`) |
| `/*` (catch-all) | Designed Arabic 404 |
| `POST /api/lead` | Lead capture — Zod `LeadInput`, honeypot silent sink, rate limit 5/min/IP (200/422/429) |
| `GET /api/health` | Probe → `{"ok":true}` |

Full contract (req/res schemas, querystring values, example pairs): `docs/api-route-table.md`.

## Verification battery (brief §10, adapted to this sandbox — see `AGENTS.md` DoD)

```bash
bunx tsc --noEmit          # 0 errors
bun run lint               # 0 warnings
```

Route + locale checks (dev server on :3000):

```bash
curl -s http://localhost:3000/   | grep '<html'   # lang="ar" dir="rtl"   (AC-9)
curl -s http://localhost:3000/en | grep '<html'   # lang="en" dir="ltr"   (AC-9)
curl -s http://localhost:3000/   | grep -c fetchpriority   # 1            (AC-6 — sole high-priority image)
wc -c public/poster.webp                            # 58750 ≤ 60000      (AC-6 poster budget)
curl -s http://localhost:3000/ar/listings/apartment-mezze-apr-118 \
  | grep -c "APR-2026-118\|المزة\|واتساب"           # ≥3                  (AC-14)
curl -s http://localhost:3000/ar/listings/apartment-mezze-apr-118 \
  | grep RealEstateListing                          # present; contains NO "price" key (AC-15)
curl -s http://localhost:3000/en | grep -c "POA\|Buying from abroad\|Funds"   # ≥3 (AC-21)
curl -s http://localhost:3000/api/health            # {"ok":true}

# AC-19 — valid valuation lead → row created
curl -X POST http://localhost:3000/api/lead -H 'Content-Type: application/json' \
  -d '{"source":"valuation","district":"al-mezze","type":"apartment","phone":"+963991234567"}'   # → {"ok":true}
# AC-18 — honeypot → 200 with ZERO insert
curl -X POST http://localhost:3000/api/lead -H 'Content-Type: application/json' \
  -d '{"source":"valuation","phone":"+963991234567","honeypot":"spam"}'                        # → {"ok":true} (no row)
```

Grep gates (exact commands from brief §10/§11.1, AC-24/25/26; this repo keeps app code under `src/`, so both forms are given):

```bash
# AC-24 — AI imagery may never depict a listed property → 0 hits
grep -r 'is_ai":\s*true' --include='*.ts' --include='*.tsx' src/          # adapted form (brief form: app/ components/) → 0 hits

# AC-25 — no placeholder stink → 0 hits in product source
grep -riE "lorem|acme|test@example" src/ prisma/ public/  # banned-token gate (run verbatim from the brief §11.1) → 0 hits
# (brief-wide form scans the whole repo; the upload/ contract files quote the banned tokens when stating the law, so the product-surface scope above is the meaningful gate
#  — run against product source; the contract files themselves quote the banned
#  words when stating this law, so scope the gate to src/ prisma/ public/)

# AC-26 — no letter-spacing on Arabic → 0 rule hits
grep -r "letter-spacing" src/   # brief form: grep -r "letter-spacing" app/
# → exactly one textual match: the law's own header comment in src/app/globals.css:9
#   ("letter-spacing: 0 on ALL Arabic"); zero actual declarations anywhere.
#   Stricter rule-level check: grep -rn "letter-spacing" src/ | grep -v "globals.css:9" → 0

# AC-27 — TO-OBTAIN register complete
grep -c "TO-OBTAIN" CONTENT.md   # → ≥4 lines (all four office slots listed)
```

Browser journeys (agent-browser / Playwright on a build-capable machine): **J1** filter → PDP → wa.me click (href carries the ref) · **J2** valuation 3 steps → submit → success · **J3** /ar/sold proof card → home → signature card. Viewports 375/768/1440, no horizontal scroll @375 (AC-8), axe 0 critical+serious (AC-7). Evidence files under `/evidence/<AC-ID>/`.

## Contracts & pointers

| Topic | File |
|---|---|
| Content ops — SAMPLE↔real swap path, `[TO-OBTAIN]` office register, WhatsApp number swap | `CONTENT.md` |
| Environment contract (required + optional + office-identity vars) | `.env.example` (copy to `.env`) |
| Agent operating rules, project DoD, hard laws digest, M2 mounting points | `AGENTS.md` |
| Route contract (10 routes, `LeadInput` schema, example pairs) | `docs/api-route-table.md` |
| Component registry — NEVER recreate, extend via props | `docs/component-inventory.md` |
| Environment assumptions (SQLite↔PostgreSQL, dev-server verification, …) | `ASSUMPTIONS.md` |
| Build history & decisions (append-only) | `worklog.md` |
| The build contract itself | `upload/nour-dimashq-build-brief-v1.md` |

**Launch-blocking (not build-blocking) before going public:** fill the 4 `OFFICE_*` env slots and replace the SAMPLE WhatsApp number `963991234567` — both documented in `CONTENT.md`.

## Cold-start test

**A fresh agent reading `README.md` + `AGENTS.md` + `CONTENT.md` + `ASSUMPTIONS.md` + `docs/` needs zero clarifying questions to continue this project** — the brief is the contract, these files are its map, and every open unknown is either logged in `ASSUMPTIONS.md` (cap 5, currently full) or answered by `CONTENT.md`'s swap paths.
