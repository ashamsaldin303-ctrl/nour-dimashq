# M2 Cinema Layer — Verification Matrix (integration brief §9/§10)

- **Date:** 2026-09-20 (Asia/Damascus) · **Agent:** Z.ai Code · **Brief:** nour-dimashq-m2-integration-brief-gemini-v1.md
- **Source video:** repo root `full vedio.mp4` (user upload; HEVC 1280×720 · 60fps · 11.87s · 16.1MB · has AAC audio)
- **Analysis:** GLM-4.6V (z-ai-web-dev-sdk) — single continuous dolly shot through a Damascene courtyard; arc fit العتبة 7/10 · الباح 10/10 · النور 9/10; verdict AI-generated (3D render) → disclosure badge legally required and present.
- **Derived assets:** keyframes K1..K4 @960×540 webp q75 (frame-exact 0.000 / 3.950 / 7.900 / 11.850s) · depth maps K1..K4 @512×288 webp (Depth Anything V2 small, ONNX q8, transformers.js — VLM QC verdict USABLE) · clips c1..c3 720×406 all-intra H.264 24fps CRF27, audio stripped (`-an`, law #8), ffprobe: 95/95 I-frames, zero B/P.
- **Environment adaptation:** verified in headless Chrome (`--enable-unsafe-swiftshader`): reports `pointer: none` → a third matchMedia condition covers it (scrub falls to 0.5); software-GL context losses in EARLIER sessions exercised the contextlost ladder (chapters demoted to CSS rungs, film never broke). Final clean session: 0 console errors, 0 warnings.

| AC | Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-C1 | Tier A renders K1→K4 via WebGL2 + depth parallax; shader compiles clean | **PASS [G]** | console badge `cinema:tierA ok`; screenshots `chapter1/2/3--pinned--1440.png`; VLM confirms rendered courtyard |
| AC-C2 | Every chapter's real asset bytes ≤ budgetKb 150 | **PASS** | `AC-C2-budget-guard.txt`: 132.3 / 106.5 / 105.5 KB ≤ 150; runtime HEAD guard also ran clean |
| AC-C3 | Zero video bytes before consent (any viewport) | **PASS [G+U]** | `mp4=0` pre-consent on desktop + mobile sessions (network record via performance entries) |
| AC-C4 | Consent MB label === manifest clipsMbTotal, Arabic-Indic | **PASS** | rendered `٣٫٧` vs manifest `3.7` (`AC-C2` MATCH line) |
| AC-C5 | Tier B never on touch / pointer:coarse / viewport <1024 | **PASS** | mobile 375 full journey: door never rendered, `mp4AfterScroll=0`; desktop gate = pointer:fine ∧ ≥1024 |
| AC-C6 | prefers-reduced-motion → static stills, no rAF loop | **PASS [G]** | emulated RM: 3 stills, 0 canvases, 0 pin-spacers, badge `cinema:static`; gsap.ticker never started |
| AC-C7 | Seam: scenes[N].B === scenes[N+1].A (same path) | **PASS [G]** | `AC-C7-seam-check.txt`: 0 violations — chain K1>K2 \| K2>K3 \| K3>K4 (depth seams identical) |
| AC-C8 | Scrub discipline verbatim: 1/24s commit + ≥80ms throttle + fastSeek branch | **PASS [G]** | `AC-C8-scrub-discipline.txt` (code lines 144–148) |
| AC-C9 | Cinema chunk lazy, ≤90KB gz total; M1 LCP unchanged ±100ms | **PASS(dev, structural)** | FCP 384ms → gsap chunk starts 647ms (post-paint); only a ~1KB stub in the initial graph; **[U]** LHCI Syria prod numbers |
| AC-C10 | NEXT_PUBLIC_CINEMA_TIER_B=false → zero Tier B code path | **PASS** | `AC-C10-tierb-off.txt`: `videos=0`, door=false, Tier A unaffected (live env-flip + restart test) |
| AC-C11 | axe 0 critical/serious on door + film | **PASS (spot)** | door role=region + aria-labelledby + H2; both buttons accessible names + focusable; canvases/media aria-hidden; lang=ar dir=rtl; heading order H1→H2×4; **[U]** full axe run |
| AC-C12 | No horizontal scroll @375 with film active; no pin flash | **PASS** | `scrollW=375=innerW` after full mobile journey; pin boundaries clean in all screenshots |
| AC-C13 | AI disclosure badge visible on film AND door | **PASS [G]** | bar badge «صور مولدة بالذكاء الاصطناعي» always-on + door chip — both in `prologue--door--1440.png` |

## Journey log (desktop 1440, pointer:fine emulated)
1. Load → film takes hero slot (`data-cinema-active="on"`, M1 content display:none) → prologue H1 «نور دمشق».
2. Door visible: title + MB «٣٫٧» + disclosure chip + accept/decline → badge `cinema:tierB gated`.
3. Accept «شغّل السينما» → **only c1+c2 fetch** (≤2 warm law), video canvases mount over suspended keyframe engines, off-toggle «إيقاف السينما» appears, `cinema:tierB on`, localStorage persisted.
4. Scroll → ch1 pins (position:fixed, top:0), lede word-spans in/out, media scale 1.06→1.0; at ch3 → c3 warms (window shifts) → all 3 clips fetched across the journey.
5. Off-toggle → all videos + video canvases released, keyframe engines resume instantly, storage "off", door never nags again.
6. Match-cut line «وهنا تبدأ الحكاية التالية — بيوتٌ حقيقية بانتظارك.» → `/#properties` → the EXISTING M1 listings grid hands the funnel back.

## Warm/VRAM window observations
- Chapter tracking → engines at dist≤1 resumed/warmed; dist≥2 released (canvas unmounted). At journey end: ch1 empty (released), ch2+ch3 media live — exactly the §8.1 window law.

## [U] items (post-merge, per §10)
- `next build` + `tsc --noEmit` (tsc done here: 0 errors; eslint: 0 warnings).
- LHCI Syria profile: LCP ≤2.5s ±100ms vs M1 baseline; cinema chunk ≤90KB gz (dev-unminified gsap alone is 107KB; prod gz estimate ≈ 47KB + engines ≈ 60–70KB total).
- Playwright journeys (mirror of the above), ffprobe on the three MP4s, full axe run.
