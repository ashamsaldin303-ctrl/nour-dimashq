/**
 * M2 cinema pipeline v2 — the full-film builder (T2.1 rework).
 *
 * Reproducibility law: every byte the film ships is produced here from the
 * user's source asset (`full vedio.mp4`, repo root) with MEASURED numbers:
 *
 *   1. film.mp4  — H.264 (universal: the HEVC source does not decode in
 *                  Chrome/Firefox), 1280x720, 60 fps kept for smooth scrub,
 *                  GOP 30 frames (0.5 s) for fast exact seeks, faststart,
 *                  no audio (silent scrub law).
 *   2. poster.webp — frame 0 at 1600w (the pre-video paint; the video fades
 *                  in over this SAME frame, so activation is seamless).
 *   3. cinema.json — manifest v2: durationSec + sizeMb measured via ffprobe
 *                  and stat; caption copy + time windows are authored here.
 *
 * Run: bun run scripts/cinema-pipeline/build-film.ts
 */
import { execSync } from "node:child_process";
import { statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const SRC = join(root, "full vedio.mp4");
const FILM = join(root, "public", "media", "film", "film.mp4");
const POSTER = join(root, "public", "media", "film", "poster.webp");
const MANIFEST = join(root, "public", "media", "manifest", "cinema.json");

const sh = (cmd: string): string =>
  execSync(cmd, { stdio: ["ignore", "pipe", "inherit"], cwd: root }).toString().trim();

/* 1 — the film: scrub-optimized H.264 */
sh(
  `ffmpeg -y -v error -i "${SRC}" -c:v libx264 -profile:v high -preset veryfast -crf 26 ` +
    `-x264-params "keyint=30:min-keyint=30:scenecut=0" -pix_fmt yuv420p -an ` +
    `-movflags +faststart "${FILM}"`,
);

/* 2 — the poster: frame 0 (the video's own first frame) */
sh(
  `ffmpeg -y -v error -ss 0 -i "${FILM}" -frames:v 1 -vf "scale=1600:-2" ` +
    `-c:v libwebp -quality 80 "${POSTER}"`,
);

/* 3 — measured numbers for the manifest */
const durationSec = Number(
  sh(`ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${FILM}"`),
);
const sizeMb = Math.round((statSync(FILM).size / 1048576) * 100) / 100;
const posterKb = Math.round(statSync(POSTER).size / 1024);

/** §7 caption copy (v1) + time windows mapped to the dolly's three acts. */
const captions = [
  {
    id: "ataba",
    index: 1,
    title: "العتبة",
    text: "كل دارٍ دمشقية تبدأ عند عتبتها؛ حجرٌ صامت وضوءٌ يروي الحكاية.",
    fromSec: 0.3,
    toSec: 3.7,
  },
  {
    id: "baha",
    index: 2,
    title: "الباح",
    text: "نافورةٌ وليمونةٌ وظلالٌ تتحرك؛ قلب الدار حيث تُقاس الأوقات بالضوء.",
    fromSec: 4.0,
    toSec: 7.7,
  },
  {
    id: "nour",
    index: 3,
    title: "النور",
    text: "من خلف المشربية يتسلل الضوء فيرسم على الحجر ما لا يُقال.",
    fromSec: 8.1,
    toSec: Math.min(11.6, durationSec - 0.2),
  },
];

const manifest = {
  version: 2,
  film: {
    src: "/media/film/film.mp4",
    poster: "/media/film/poster.webp",
    durationSec: Math.round(durationSec * 1000) / 1000,
    sizeMb,
    runwayVh: 560,
    matchCutTo: "/#properties",
  },
  captions,
  disclosure: "صور مولدة بالذكاء الاصطناعي",
};

writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  `cinema film built: ${durationSec.toFixed(3)}s · ${sizeMb.toFixed(2)}MB · poster ${posterKb}KB`,
);
