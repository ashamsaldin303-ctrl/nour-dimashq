# cinema-pipeline

Media pipeline for the M2 cinema layer (v2 — full-film architecture, T2.1).

## Scripts

- `build-film.ts` — **the one that ships.** Encodes the user's source
  (`full vedio.mp4`, repo root) into the scrub-optimized film:
  - `public/media/film/film.mp4` — H.264 720p60, GOP 30, faststart, silent
    (the HEVC source does not decode in Chrome/Firefox — never ship it raw).
  - `public/media/film/poster.webp` — frame 0 at 1600w (seamless pre-video paint).
  - `public/media/manifest/cinema.json` — manifest v2 with MEASURED
    durationSec/sizeMb + the authored caption windows.
- `analyze-video.ts` — GLM visual analysis of the source (asset QC; used in
  T2 to establish the one-shot dolly + AI-render disclosure ruling).

## Run

```bash
bun run build-film.ts
```

Requires `ffmpeg`/`ffprobe` on PATH. The old v1 scripts (frame extraction,
depth maps, intra-clip chain) were removed with the architecture they fed —
see worklog T2.1 for the diagnosis that retired them.
