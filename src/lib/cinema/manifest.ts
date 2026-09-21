import { z } from "zod";

/**
 * M2 cinema layer — data contract v2 (full-film scrub architecture).
 *
 * The user ruling (T2.1): the FULL video is the structural spine of the
 * experience — the site's content overlays it; the video is never chopped
 * to fit a pre-existing structure. One H.264 file, one continuous scroll
 * scrub, captions mapped to video-time windows.
 *
 * MEASURED numbers only: `film.sizeMb` feeds the honest consent MB label
 * (NEVER #9 law) and is verified against the REAL bytes on the server via
 * a HEAD request before any video element is created.
 */

export const CinemaManifestSchema = z.object({
  version: z.literal(2),
  film: z.object({
    src: z.string().startsWith("/media/"),
    poster: z.string().startsWith("/media/"),
    /** ffprobe-measured duration of the encoded file, seconds. */
    durationSec: z.number().min(4).max(30),
    /** REAL bytes of the encoded file / 1048576, one decimal. */
    sizeMb: z.number().positive().max(12),
    /** Scroll runway for the whole film, in viewport-heights (100 = 1 screen). */
    runwayVh: z.number().min(200).max(800),
    /** Where the film hands the visitor after the final frame. */
    matchCutTo: z.string().startsWith("/"),
  }),
  captions: z
    .array(
      z.object({
        id: z.string().min(1),
        /** 1-based display order (kicker numeral). */
        index: z.number().int().min(1).max(9),
        title: z.string().min(1),
        text: z.string().min(1),
        /** Caption window, seconds into the film (fromSec < toSec). */
        fromSec: z.number().min(0),
        toSec: z.number().min(0),
      }),
    )
    .min(1)
    .max(5),
  disclosure: z.literal("صور مولدة بالذكاء الاصطناعي"),
});

export type CinemaManifest = z.infer<typeof CinemaManifestSchema>;
export type CinemaCaption = CinemaManifest["captions"][number];

/** Manifest location — public/ so Next serves it. */
export const CINEMA_MANIFEST_URL = "/media/manifest/cinema.json" as const;

/**
 * Caption-window law: windows must be inside the film duration, strictly
 * ordered, and non-overlapping. Returns the list of violations.
 */
export function captionWindowViolations(m: CinemaManifest): string[] {
  const bad: string[] = [];
  const d = m.film.durationSec;
  for (const c of m.captions) {
    if (c.fromSec >= c.toSec) bad.push(`caption ${c.id}: fromSec >= toSec`);
    if (c.fromSec < 0 || c.toSec > d) bad.push(`caption ${c.id}: window outside film duration`);
  }
  const sorted = [...m.captions].sort((a, b) => a.fromSec - b.fromSec);
  for (let i = 0; i + 1 < sorted.length; i++) {
    if (sorted[i]!.toSec > sorted[i + 1]!.fromSec) {
      bad.push(`captions ${sorted[i]!.id}/${sorted[i + 1]!.id}: windows overlap`);
    }
  }
  return bad;
}

/**
 * Load + validate the manifest. Schema failure or window violation throws —
 * the film then stays off and the M1 hero remains (fail-closed, never broken).
 *
 * `no-cache` (revalidate via ETag, NOT force-cache): the manifest is the
 * film's contract — a stale cached copy (e.g. after a deploy) would fail
 * schema validation and silently kill the cinema. One 304 round-trip for a
 * ~1KB file is the correct price for contract freshness.
 */
export async function loadCinemaManifest(): Promise<CinemaManifest> {
  const res = await fetch(CINEMA_MANIFEST_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`cinema manifest: HTTP ${res.status}`);
  const parsed = CinemaManifestSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`cinema manifest: schema violation — ${parsed.error.message}`);
  }
  const windows = captionWindowViolations(parsed.data);
  if (windows.length > 0) {
    throw new Error(`cinema manifest: ${windows.length} caption-window violation(s): ${windows.join("; ")}`);
  }
  return parsed.data;
}

/**
 * Honest-bytes guard: the consent MB label must match the REAL file. HEAD the
 * film source and verify against `sizeMb` with a 20% tolerance (re-encodes
 * drift slightly; gross mismatches mean the label lies — refuse to run).
 * Zero video bytes are downloaded (HEAD only); a missing content-length
 * skips the guard (logged) instead of failing the film.
 */
export async function checkFilmBytes(m: CinemaManifest): Promise<void> {
  try {
    const res = await fetch(m.film.src, { method: "HEAD" });
    const len = res.headers.get("content-length");
    if (!len) {
      console.warn("cinema bytes: no content-length — guard skipped");
      return;
    }
    const realMb = Number(len) / 1048576;
    if (Math.abs(realMb - m.film.sizeMb) / m.film.sizeMb > 0.2) {
      throw new Error(`film bytes: label ${m.film.sizeMb.toFixed(2)}MB vs real ${realMb.toFixed(2)}MB`);
    }
  } catch (err) {
    if (err instanceof TypeError) {
      console.warn("cinema bytes: HEAD failed (network) — guard skipped");
      return;
    }
    throw err;
  }
}
