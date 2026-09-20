---
brief: nour-dimashq M2 cinema-integration brief v1.0 (Gemini edition)
date: 2026-09-20
target_agent: "Google AI Studio — Build mode — model: Gemini Flash 3.8 (user-pinned)"
parent_plan: nour-dimashq-plan.md v1.1 (changelog §10) · assets: nour-dimashq-m2-media-prompts-v1.md
preconditions: "USE ONLY AFTER: (1) M1 funnel accepted, (2) keyframes K1–K4 + depth + Tier B clips QC'd, (3) media/manifest/cinema.json filled with MEASURED numbers."
scope_law: "THIS BRIEF BUILDS THE CINEMA LAYER ONLY (M2): Tier A keyframe engine everywhere + Tier B consent-gated video, mounted into the EXISTING Nour Dimashq M1 site. It never touches M1 funnel logic."
language: bilingual-en-ar
---

# M2 INTEGRATION BRIEF — «نور دمشق» Cinema Layer
## Build prompt for Google AI Studio (Gemini Flash 3.8)

> **الملخص العربي (تنفيذي):**
> هذا هو البرومبت الثاني الذي طلبته — الصق كامل هذا الملف في Google AI Studio (بناءً بنموذج Gemini Flash 3.8) ليدمج أصولك البصرية بالموقع. العقد يبني **طبقة السينما فقط**: محرك الكي-فريمات WebGL2 (الصور الأربع + خرائط العمق = الخلفية المتحركة بالسكرول في كل مكان، ≤150KB للفصل)، فوقه عمود GSAP+Lenis، وبوابة موافقة للفيديوهات (سطح المكتب فقط، بحجم معلن بالميغابايت من المانيفست). كل الكود المرجعي هنا **منقول حرفياً من البحث** — لا تبتكر محركاً بديلاً.
> **قبل الاستخدام:** يجب أن يكون M1 مبنيًا ومقبولاً، والأصول جاهزة بمانيفست أرقامه مقيسة. المخرجات ملفات إضافية تُدمج بمستودع M1 بخطوات مذكورة في §12.

---

## 0. Preconditions (read first — if any fails, STOP and say so in your ACK)

1. The M1 site exists: a Next.js 16 App Router project with routes `/`, `/ar/listings`, `/ar/listings/[slug]`, `/ar/valuation`, `/ar/verification`, `/ar/sold`, `/ar/about`, `/en`.
2. The hero section of `app/page.tsx` carries `id="film-prologue"` and `data-cinema-slot="hero"` (M1 reserved these hooks).
3. Assets exist under `media/`: `keyframes/K1..K4.webp`, `depth/K1..K4.webp`, `derivatives/c1..c3_720w_intra.mp4` (all-intra H.264, ≤2.5 MB each), `poster.avif`, `og/default.jpg`, and `manifest/cinema.json` with MEASURED numbers.
4. The user runs in a repo you cannot see. **You produce a FILE SET, not a new app.** Do NOT scaffold a fresh project, do NOT invent M1 pages, do NOT restate the funnel. If your sandbox forces an app harness, keep it minimal and clearly separate — the graded deliverable is exactly the file list in §4.

## 1. Mission & Role

You are the cinema-layer build agent for **Nour Dimashq (نور دمشق)**, a licensed Damascus real-estate brokerage site whose M1 funnel (listings → WhatsApp) is already built and accepted. Your job: mount the scroll-driven film on top of it — a ~700vh cinematic journey (unpinned 100vh poster prologue + 3 pinned ~200vh chapters) that **match-cuts into the existing listings grid**, so the film hands the visitor to the funnel. Two engines, one law: **Tier A (WebGL2 keyframe pairs + depth maps, zero video bytes) renders everywhere — phones, Save-Data, reduced-motion; Tier B (three 720p all-intra clips) is desktop-only ornament behind an explicit consent door with an honest MB label, demotable by one env flag.** Every constant below is a ruling from the project's research, not a suggestion. Never invent values, routes, or APIs; anything you must assume goes to an `ASSUMPTIONS` section in your final reply (≤5 entries, each with a reversal).

## 2. Pinned Stack (exact — resolve exact versions in your ACK)

| Layer | Pin | Contrast rule |
|---|---|---|
| Framework | Next.js 16 App Router (existing M1 repo) | NEVER pages router, NEVER re-scaffold |
| UI runtime | React 19 (existing) | NEVER class components |
| Language | TypeScript 5 strict | NEVER `any` (use `unknown` + guards) |
| Styling | Tailwind CSS 4 + the M1 `@theme` tokens (inherit; do NOT re-declare) | NEVER new hex values |
| Motion spine | `gsap@^3.13.0` + its free `ScrollTrigger` · `lenis@^1.3.0` — installed BY THE USER (§12) | NEVER three.js / react-three-fiber / pixi / framer-motion |
| Rendering | Raw WebGL2, `#version 300 es`, GLSL ES 3.00 | NEVER libraries, NEVER WebGL1 |
| Video | `<video>` as hidden decoder + canvas repaint, H.264 all-intra MP4s | NEVER autoplay-with-audio, NEVER HLS/DASH, NEVER AV1/VP9 |
| Fonts | Noto Kufi Arabic (headings) + Cairo (body) — already in M1 | NEVER new fonts, `letter-spacing: 0` on Arabic always |

## 3. Scope IN / OUT

**IN (build all of this):**
- ✅ `CinemaFilm` client component mounting on `[data-cinema-slot="hero"]`, self-contained, lazy.
- ✅ Tier A `KeyframeEngine`: one fullscreen triangle, 4 textures (uColA/uColB/uDepA/uDepB), the depth-displacement fragment shader (§8.2 verbatim), lerp-landed progress.
- ✅ Tier B `ScrubVideoEngine` (§8.3 verbatim): hidden video + canvas repaint, commit threshold, 80 ms seek throttle, `fastSeek` when present, rVFC repaint companion.
- ✅ One `SceneEngine` interface (§8.1) + registry; chapters declare their engine from the manifest.
- ✅ GSAP+Lenis one-clock spine (§8.4 verbatim): pinned chapter timelines (~200vh each), `scrub` 0.8–1 wheel / ~0.5 touch, prologue 100vh, `matchMedia` variants, reduced-motion statics.
- ✅ Consent door component: desktop-only offer, honest MB label **computed from `manifest.consent.tierB.clipsMbTotal`**, Arabic-Indic numerals, AI disclosure, accept/decline, persisted choice, off-toggle.
- ✅ Fallback ladder: `webglcontextlost` → CSS rung; no WebGL2 → CSS push-in rung; `prefers-reduced-motion` → keyframe stills. CSS-only — zero canvas code in fallbacks.
- ✅ Manifest loader + Zod schema (§6) + byte-budget guard that FAILS the build when a chapter exceeds its `budgetKb`.
- ✅ Env gates: `NEXT_PUBLIC_CINEMA_ENABLED`, `NEXT_PUBLIC_CINEMA_TIER_B` (demotion flag).

**OUT (do NOT build — defect if present):**
- ❌ ANY edit to M1 funnel logic: listings, PDPs, `lib/wa.ts`, valuation, verification, sold, about, /en, Prisma schema, seed, analytics events. Additive files only (§4) + the one-line mounts in §12.
- ❌ Audio of any kind (ambient stays a deferred opt-in Web Audio layer — not this brief).
- ❌ Frame-sequence flip-book, three.js, per-listing films, 360° panoramas, service worker, RUM beacon (separate later brief).
- ❌ New routes or pages. The film lives on `/` only.
- ❌ Fake numbers: no hardcoded MB values, no invented scene data — everything from `cinema.json`.

## 4. File Map (the deliverable — exact paths in the M1 repo)

```
components/cinema/cinema-film.tsx        # orchestrator: consent → spine → engines → match-cut
components/cinema/cinema-prologue.tsx    # 100vh poster rung (M1 poster, fetchpriority law intact)
components/cinema/cinema-chapter.tsx     # pinned chapter shell (media + captions + chapters)
components/cinema/cinema-consent.tsx     # consent door + off-toggle
lib/cinema/scene-engine.ts               # SceneEngine interface + engine registry
lib/cinema/keyframe-engine.ts            # Tier A WebGL2 engine (shaders inline)
lib/cinema/scrub-video-engine.ts         # Tier B scrub engine
lib/cinema/progress-store.ts             # one store: chapter index + landed progress
lib/cinema/spine.ts                      # Lenis + ScrollTrigger one-clock wiring
lib/cinema/manifest.ts                   # CinemaManifest types + Zod + loader + budget guard
lib/cinema/fallback.ts                   # CSS rung / statics helpers
media/manifest/cinema.json               # AUTHORED by the user (media prompts file §4)
app/globals.css                          # ADDITIVE block only: .cinema-* utilities + motion vars
```

Component contract: every cinema component is `'use client'`, dynamically imported (`next/dynamic`, `ssr:false`) from a tiny wrapper so **zero cinema JS is in the initial M1 bundle**; the cinema chunk (GSAP + Lenis + engines ≤ **90 KB gz**) loads after M1 content paints.

## 5. Motion & Style Tokens (rulings — hardcode nothing outside these)

| Token | Value | Where |
|---|---|---|
| `uDisp` | `0.035` | displacement strength (frag shader uniform) |
| `uZoomMax` | `1.12` | per-chapter push-in ceiling |
| `uFade` | `0.08` | A→B crossfade half-width (blend spans uP ∈ [0.42, 0.58]) |
| `TAU` | `90 ms` | exponential landing time-constant (frame-rate independent) |
| draw epsilon | `0.001` | redraw only if landed progress moved > epsilon (idle scroll = zero draws) |
| `velGain` clamp | `\|x\|+\|y\| ≤ 0.02` | scroll-velocity + pointer parallax feed |
| Lenis | `lerp 0.09 · syncTouch:false · respectReducedMotion:true` | one instance, native scrollbar kept |
| scrub | wheel `0.8–1` · touch `~0.5` | `scrub:true` is a bug — raw 1:1 steps are visibly janky |
| pin | `100vh prologue + 3 × 200vh chapters` | `anticipatePin:1 · pinSpacing:true · invalidateOnRefresh:true` |
| easing | `ease:"none"` on ALL position-mapped tweens | any other ease corrupts scroll→progress |
| durations | fast 120 / base 220 / slow 380 / cinema 600 ms | inherited from M1 tokens — reuse, don't redeclare |
| captions | Noto Kufi Arabic headings + Cairo body · `letter-spacing: 0` · word-level spans only | Arabic motion law |
| fallback ladder | contextlost → CSS poster+crossfade · no-WebGL2 → CSS push-in · reduced-motion → stills | zero canvas code in rungs |

Palette: inherit M1 `@theme` (stone ramp `#F5F0E4→#262119`, gold `#C08A3E` family) — never declare a new hex.

## 6. Data Contract — `media/manifest/cinema.json` (types + Zod, verbatim)

```ts
// lib/cinema/manifest.ts
import { z } from "zod";

export const CinemaManifestSchema = z.object({
  version: z.literal(1),
  film: z.object({
    totalVh: z.number().min(300).max(900),
    prologueVh: z.number().min(100).max(150),
    chapterVh: z.number().min(150).max(300),
    matchCutTo: z.string().startsWith("/"),
  }),
  consent: z.object({
    tierB: z.object({
      enabled: z.boolean(),
      desktopOnly: z.literal(true),
      chain: z.array(z.string()).min(1).max(3),
      clipsMbTotal: z.number().positive(),
    }),
  }),
  scenes: z.array(z.object({
    id: z.string(),
    title: z.string().min(1),
    engine: z.literal("keyframe"),
    keyframes: z.object({ A: z.string(), B: z.string() }),
    depth: z.object({ A: z.string(), B: z.string() }).optional(),
    delta: z.object({ dolly_m: z.number().optional(), rotate_deg: z.number().optional() }),
    budgetKb: z.number().max(150),
    caption: z.string().optional(),
  })).min(1),
  disclosure: z.literal("صور مولدة بالذكاء الاصطناعي"),
});
export type CinemaManifest = z.infer<typeof CinemaManifestSchema>;
```

Loader rules: validate at module init — a schema failure or a chapter whose REAL asset bytes exceed `budgetKb` throws at build/dev time (budget guard: sum of `keyframes.A + keyframes.B + depth.A + depth.B` sizes via `fs.statSync` in a dev-only check, and `fetch(...).headers.get('content-length')` guard at runtime before engine warm-up). The consent-door MB label renders `manifest.consent.tierB.clipsMbTotal` — **never a typed literal**.

## 7. Content (Arabic copy, verbatim — v1, pending owner approval)

| Slot | Copy (AR) |
|---|---|
| Prologue H1 | «نور دمشق» + sub «وسيطٌ عقاري دمشقي يعمل كفيلم — والبيوت حقيقية» |
| Ch.1 lede «العتبة» | «كل دارٍ دمشقية تبدأ عند عتبتها؛ حجرٌ صامت وضوءٌ يروي الحكاية.» |
| Ch.2 lede «الباح» | «نافورةٌ وليمونةٌ وظلالٌ تتحرك؛ قلب الدار حيث تُقاس الأوقات بالضوء.» |
| Ch.3 lede «النور» | «من خلف المشربية يتسلل الضوء فيرسم على الحجر ما لا يُقال.» |
| Match-cut line | «وهنا تبدأ الحكاية التالية — بيوتٌ حقيقية بانتظارك.» → scrolls into the EXISTING listings grid |
| Consent title | «النسخة السينمائية» |
| Consent body | «تجربة فيديو سينمائية اختيارية بحجم ≈ {MB} ميغابايت. الصور مولّدة بالذكاء الاصطناعي لأغراض الأجواء فقط.» — {MB} = manifest value in Arabic-Indic numerals (٧٫٢) |
| Consent accept | «شغّل السينما» · decline «البقاء على النسخة الخفيفة» |
| Off-toggle | «إيقاف السينما» (persistent bottom control while cinema is on) |
| Disclosure badge | «صور مولدة بالذكاء الاصطناعي» — visible on the film and the door, always |

Captions animate word-level only: split `.lede` into word `<span>`s at build time (never per-character — Arabic shaping law).

## 8. Reference Implementation (VERBATIM from the project research — implement exactly; do not redesign)

### 8.1 The SceneEngine interface

```ts
export interface SceneEngine {
  warmUp(): Promise<void>;      // fetch/decode keyframes or prime the decoder
  setProgress(p: number): void; // 0..1 target — never seek/draw here
  draw(): void;                 // called by the ticker, only if landed p moved
  suspend(): void;              // offscreen: stop rAF, keep warm assets
  release(): void;              // 2+ chapters away: free VRAM/decoders
}
```

### 8.2 Tier A — vert.glsl + frag.glsl (WebGL2, #version 300 es)

```glsl
// vert.glsl
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;          // (-1..3) maps to (0..2); edges clamp off-screen
  gl_Position = vec4(aPos, 0.0, 1.0);
}
```

```glsl
// frag.glsl
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uColA, uColB;     // RGBA8: start / end keyframe
uniform sampler2D uDepA, uDepB;     // R8: 512w depth maps (1 = near)
uniform float uP;                   // landed local progress 0..1 (lerped in JS)
uniform vec2  uShift;               // signed velocity + pointer parallax, |x|+|y| <= 0.02
uniform float uDisp;                // displacement strength (motion.config: 0.035)
uniform float uZoomMax;             // push-in ceiling (motion.config: 1.12)
uniform float uFade;                // crossfade half-width (motion.config: 0.08 -> +-8%)

vec2 mirrored(vec2 uv) {            // wrap sampler without texture() mirror setup
  vec2 m = mod(uv, 2.0);
  return min(m, 2.0 - m);
}
vec3 layer(sampler2D col, sampler2D dep, vec2 uv, float zoom) {
  vec2 z = (uv - 0.5) / zoom + 0.5;             // push-in (zoom>1 = wider view)
  float d = texture(dep, z).r;
  vec2 su = mirrored(z + uShift * (d - 0.5) * uDisp); // near shifts more -> parallax
  return texture(col, su).rgb;
}
void main() {
  float q    = smoothstep(0.5 - uFade, 0.5 + uFade, uP); // A->B blend
  float zoom = mix(1.0, uZoomMax, uP);                    // slow dolly all chapter
  vec3 a = layer(uColA, uDepA, vUv, zoom);
  vec3 b = layer(uColB, uDepB, vUv, zoom);
  vec3 c = mix(a, b, q);
  c *= 1.0 - 0.18 * distance(vUv, vec2(0.5));             // vignette (matches LUT grade)
  outColor = vec4(c, 1.0);
}
```

One oversized triangle, no index buffer: positions `(-1,-1), (3,-1), (-1,3)`. Four textures total. If a scene has NO depth maps in the manifest, bind a flat-white 1×1 R8 texture for `uDepA/uDepB` (parallax gracefully degrades to pure crossfade + push-in — still cinematic, never broken).

**Lerp-landed progress discipline (the engine ticker, per frame, dt in seconds):**

```ts
uPLanded += (uPTarget - uPLanded) * (1 - Math.exp(-dt / TAU)); // TAU ≈ 90 ms
uShift.x = clamp(signedVelocity * CFG.velGain, -0.02, 0.02);   // velocity term
if (Math.abs(uPLanded - uDrawn) > 0.001) { draw(); uDrawn = uPLanded; }
```

The shader NEVER sees raw scroll. `webglcontextlost` → `preventDefault()` → CSS fallback rung.

### 8.3 Tier B — ScrubVideoEngine (verbatim)

```ts
class ScrubVideoEngine /* implements SceneEngine */ {
  #video; #ctx; #target = 0; #lastSeek = 0; #lastFrame = -1;
  static FPS = 24; // hero cadence ruling

  async warmUp() {
    const v = this.#video;                  // muted, playsinline, preload="auto", hidden
    await once(v, "loadedmetadata");
    try { await v.play(); v.pause(); } catch {} // play().then(pause()) decoder priming
  }
  setProgress(p) { this.#target = p * (this.#video.duration || 1); }
  tick(now) {                               // called from gsap.ticker
    this.repaint();                         // ALWAYS repaint last decoded frame
    const v = this.#video;
    if (v.readyState < 2) return;           // HAVE_CURRENT_DATA gate
    const dt = Math.abs(this.#target - v.currentTime);
    if (dt < 1 / ScrubVideoEngine.FPS) return;   // commit threshold: 1/fps (~42 ms)
    if (now - this.#lastSeek < 80) return;        // throttle: last-seek-wins, ~80 ms
    this.#lastSeek = now;
    typeof v.fastSeek === "function" ? v.fastSeek(this.#target)
                                     : v.currentTime = this.#target;
  }
  repaint() { drawImageCover(this.#ctx, this.#video); } // cover-fit drawImage
}
```

Guards are the engine: (1) commit threshold 1/fps — seeks are async and pile into a seeking/seeked storm if issued per event; (2) ≥80 ms between seeks, last target wins; (3) `fastSeek()` when present with `currentTime` fallback. Use `requestVideoFrameCallback` as the repaint companion where available (register once per seek; repaint exactly when the decoder presents — `mediaTime` in the callback). Platform rules: ≤2 warm videos at any moment; muted + playsinline + no audio track; iOS Low-Power-Mode recovery = `play()` rejection during warmUp → recover on first gesture: `video.load(); video.play().then(() => video.pause())`. Tier B never blocks launch: env flag off → the code path is inert.

### 8.4 The one-clock spine (Lenis ↔ ScrollTrigger, verbatim)

```ts
const lenis = new Lenis({ lerp: 0.09, syncTouch: false, respectReducedMotion: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); }); // seconds -> ms
gsap.ticker.lagSmoothing(0);                             // no catch-up pauses
```

`lagSmoothing(0)` is mandatory — default lag compensation would pause the shared ticker after a long frame and desynchronize Lenis from ScrollTrigger exactly when a heavy seek lands. NO `scrollerProxy` (Lenis keeps the native scrollbar; sticky, keyboard, find-in-page keep working). This one rAF loop drives Lenis, ScrollTrigger, the ProgressStore, and both engines.

**Pinned chapter timeline (canonical skeleton):**

```ts
gsap.timeline({
  scrollTrigger: {
    trigger: ".chapter-1",
    start: "top top",
    end: "+=100%",                 // 1 viewport-height of pinned scrub (see film math)
    pin: true,                     // never animate the pinned element itself — children only
    pinSpacing: true,
    anticipatePin: 1,              // pre-unpins 1 tick: no flash on fast scroll
    invalidateOnRefresh: true,
    scrub: CFG.scrub.wheel,        // 0.8–1 on wheel, ~0.5 on touch
    onUpdate: (self) => store.setChapter(0, self.progress),
  }
})
  .fromTo(".chapter-1 .media", { scale: 1.06 }, { scale: 1.0, ease: "none" }, 0)
  .from(".chapter-1 .lede .line", { yPercent: 120, stagger: 0.08, ease: "power2.out" }, 0.1)
  .to (".chapter-1 .lede",       { autoAlpha: 0, y: -40 }, 0.75);
```

Hard rules: `ease:"none"` on anything position-mapped; `scrollTrigger` on the timeline/top-level tween only, never a child; never scrub + toggleActions on the same trigger; create triggers top-to-bottom in DOM order; `document.fonts.ready.then(() => ScrollTrigger.refresh())` after Cairo loads. Modality via `gsap.matchMedia()` (auto-revert): desktop/wheel `scrub: 0.8–1`, touch `~0.5`, `prefers-reduced-motion` → static variant.

**Chapter boundary (seam law):** chapter N's end-keyframe IS chapter N+1's start-keyframe — the SAME file path in the manifest. At the pin boundary the outgoing and incoming engines render identical pixels; the engine swap is structurally invisible. NEVER add a crossfade at the seam.

## 9. Acceptance Criteria (binary; runner: [G] = you self-check in AI Studio · [U] = user runs post-merge)

| ID | Criterion (PASS only when binary-true) | Check |
|---|---|---|
| AC-C1 | Tier A renders the K1→K4 chain via WebGL2 with depth parallax; shader compiles clean | [G] console badge `cinema:tierA ok` + screenshot @1440 |
| AC-C2 | Every chapter's real asset bytes ≤ its `budgetKb` (150) | [U] stat vs manifest guard (§6) — build fails otherwise |
| AC-C3 | ZERO video bytes load before consent (any viewport) | [G+U] network record: no `.mp4` request pre-accept |
| AC-C4 | Consent MB label === manifest `clipsMbTotal`, Arabic-Indic numerals | [U] grep rendered label vs manifest value |
| AC-C5 | Tier B never on touch/`pointer:coarse`/viewport <1024 | [U] Playwright iPhone emu: zero `.mp4` requests |
| AC-C6 | `prefers-reduced-motion` → static keyframe stills, no rAF loop | [G] emulated media + badge `cinema:static`; [U] grep no ticker under RM |
| AC-C7 | Chapter seam: `scenes[N].keyframes.B` === `scenes[N+1].keyframes.A` (same path) | [G] manifest check reports 0 seam violations |
| AC-C8 | Scrub discipline verbatim: commit threshold `1/24 s` + ≥80 ms seek throttle + `fastSeek` branch | [G] code present verbatim; [U] review |
| AC-C9 | Cinema chunk lazy (post-paint) and ≤90 KB gz total incl. GSAP+Lenis; M1 LCP unchanged ±100 ms | [U] LHCI Syria profile |
| AC-C10 | `NEXT_PUBLIC_CINEMA_TIER_B=false` → zero Tier B code path (no video element created) | [U] env + e2e grep |
| AC-C11 | axe: 0 critical/serious on consent door + film sections | [G] preview axe; [U] full run |
| AC-C12 | No horizontal scroll @375 with film active; pin boundaries show no flash | [U] Playwright `document.scrollWidth ≤ 375` |
| AC-C13 | AI disclosure badge visible in BOTH the film and the consent door | [G] screenshot; [U] grep |

## 10. Verification Loop (evidence discipline — screenshots named, not vibes)

**You (Gemini), in AI Studio:** run the harness at 375/768/1440, capture `route--state--width.png` per AC-C1/C6/C11/C13; console badges `cinema:tierA ok` / `cinema:tierB gated` / `cinema:static`; manifest seam report (AC-C7). Bundle all into an evidence list with AC IDs.

**The user, post-merge (the real gates):** `next build` green + `tsc --noEmit` 0 · LHCI Syria profile (3.3 Mbps/100 ms RTT): LCP ≤2.5 s ±100 ms vs M1 baseline, cinema chunk ≤90 KB gz · Playwright: consent journey (door → accept → 3 mp4 requests, desktop only), mobile journey (zero mp4), reduced-motion statics, no h-scroll @375 · ffprobe on the three MP4s (only `I`, zero `B`) · grep gates: no `three` in `package.json`, no `letter-spacing` on Arabic, no hardcoded MB literal, `film-prologue` slot intact.

## 11. NEVER Registry (≤15, paired — every violation is a defect with a signature)

1. NEVER import three.js/r3f/pixi → ALWAYS raw WebGL2 `#version 300 es`. *(Defect: bundle bloat, engine redesign.)*
2. NEVER request/load any `.mp4` before consent AND desktop → ALWAYS the manifest gate + `pointer/viewport` check. *(Defect: prepaid megabytes on Syrian lines.)*
3. NEVER seek per scroll event → ALWAYS commit threshold `1/24 s` + 80 ms throttle. *(Defect: seeking storm, scrub stutter.)*
4. NEVER feed raw scroll into the shader → ALWAYS lerp-landed `uP` (TAU 90 ms). *(Defect: jank, draw storms.)*
5. NEVER `letter-spacing` on Arabic → ALWAYS `0`. *(Defect: broken Arabic shaping.)*
6. NEVER split Arabic words per-character → ALWAYS word-level spans. *(Defect: severed ligatures.)*
7. NEVER crossfade a chapter seam → ALWAYS the shared boundary keyframe. *(Defect: visible seam — structurally impossible when AC-C7 holds.)*
8. NEVER add audio to the film → ALWAYS silent clips (`-an` was the encode law). *(Defect: autoplay blocks, iOS LPM deaths.)*
9. NEVER type an MB number in UI code → ALWAYS compute from `cinema.json`. *(Defect: lying door.)*
10. NEVER edit M1 funnel files (routes, `lib/wa.ts`, schema, seed) → ALWAYS additive files + §12 mounts. *(Defect: funnel regression.)*
11. NEVER `scrub:true` → ALWAYS 0.8–1 wheel / ~0.5 touch. *(Defect: raw 1:1 steps, visible jank.)*
12. NEVER animate the pinned element itself → ALWAYS children only. *(Defect: pin math corruption.)*
13. NEVER put `scrollTrigger` on a child tween → ALWAYS timeline/top-level only. *(Defect: orphaned triggers.)*
14. NEVER leave `webglcontextlost` unhandled → ALWAYS `preventDefault()` + CSS rung. *(Defect: black screen on context loss.)*
15. NEVER ship the film without «صور مولدة بالذكاء الاصطناعي» → ALWAYS the disclosure badge on film + door. *(Defect: trust-law breach — the project's survival law.)*

## 12. Done Definition & Termination Contract

**Your FIRST output is an ACK (≤15 lines):** exact resolved versions of every §2 row (incl. gsap/lenis versions you assumed) · file count vs §4 map · AC count accepted (13) · inactive triggers you are NOT activating (audio · SW · RUM · per-listing films · any M1 funnel change — list them) · the single line: «لا أسئلة توضيحية — العقد مكتفٍ ذاتياً.» Then build in §4 order: manifest.ts → scene-engine → keyframe-engine → spine → chapters → consent → fallbacks → evidence.

**ASSUMPTIONS section (≤5):** anything the manifest/repo couldn't answer — each with rationale + a one-line reversal. No silent decisions.

**Merge steps (the user runs these after your output — include them verbatim in your final message):**
```bash
npm i gsap@^3.13.0 lenis@^1.3.0
# copy the §4 files into the repo, drop media/ as produced, then:
# app/page.tsx — add inside the hero section (the film-prologue slot):
#   <CinemaFilm />        (dynamic import wrapper from components/cinema/)
# .env.local:
#   NEXT_PUBLIC_CINEMA_ENABLED=true
#   NEXT_PUBLIC_CINEMA_TIER_B=true
npm run build && npx tsc --noEmit
```

**Termination:** you are DONE when the §10 evidence list is complete, all [G]-runner ACs pass, and the ACK/ASSUMPTIONS sections exist. You do NOT iterate beyond the brief; fixes arrive as surgical prompts from the author/judge agent.


