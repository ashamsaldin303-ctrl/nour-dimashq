import { z } from "zod";

/**
 * M2 cinema layer — data contract (integration brief §6, VERBATIM schema).
 * One manifest, MEASURED numbers only: the consent MB label renders
 * `consent.tierB.clipsMbTotal` — never a typed literal (NEVER #9).
 */

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
  scenes: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        engine: z.literal("keyframe"),
        keyframes: z.object({ A: z.string(), B: z.string() }),
        depth: z.object({ A: z.string(), B: z.string() }).optional(),
        delta: z
          .object({ dolly_m: z.number().optional(), rotate_deg: z.number().optional() })
          .optional(),
        budgetKb: z.number().max(150),
        caption: z.string().optional(),
      }),
    )
    .min(1),
  disclosure: z.literal("صور مولدة بالذكاء الاصطناعي"),
});

export type CinemaManifest = z.infer<typeof CinemaManifestSchema>;
export type CinemaScene = CinemaManifest["scenes"][number];

/** Manifest location — public/ so Next serves it (repo-layout mapping of `media/`). */
export const CINEMA_MANIFEST_URL = "/media/manifest/cinema.json" as const;

/**
 * Seam law (§8.4): chapter N's end-keyframe IS chapter N+1's start-keyframe.
 * Returns the list of violations ([] when the chain is structurally seamless).
 */
export function seamViolations(m: CinemaManifest): string[] {
  const bad: string[] = [];
  for (let i = 0; i + 1 < m.scenes.length; i++) {
    if (m.scenes[i]!.keyframes.B !== m.scenes[i + 1]!.keyframes.A) {
      bad.push(`seam ${i}->${i + 1}: B("${m.scenes[i]!.keyframes.B}") !== A("${m.scenes[i + 1]!.keyframes.A}")`);
    }
    const dA = m.scenes[i]!.depth;
    const dB = m.scenes[i + 1]!.depth;
    if (dA && dB && dA.B !== dB.A) {
      bad.push(`depth seam ${i}->${i + 1}: B("${dA.B}") !== A("${dB.A}")`);
    }
  }
  return bad;
}

/**
 * Load + validate the manifest. A schema failure or a seam violation throws
 * (the film then stays off and the M1 hero remains — fail-closed, never broken).
 */
export async function loadCinemaManifest(): Promise<CinemaManifest> {
  const res = await fetch(CINEMA_MANIFEST_URL, { cache: "force-cache" });
  if (!res.ok) throw new Error(`cinema manifest: HTTP ${res.status}`);
  const parsed = CinemaManifestSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`cinema manifest: schema violation — ${parsed.error.message}`);
  }
  const seams = seamViolations(parsed.data);
  if (seams.length > 0) {
    throw new Error(`cinema manifest: ${seams.length} seam violation(s): ${seams.join("; ")}`);
  }
  return parsed.data;
}

/**
 * Runtime byte-budget guard (§6 loader rules): before engine warm-up, the REAL
 * asset bytes of each scene (keyframes.A + keyframes.B + depth.A + depth.B)
 * must not exceed its `budgetKb`. Measured via content-length HEAD requests;
 * scenes whose server omits the header are skipped (logged) rather than
 * downloaded — zero video bytes and zero prepaid keyframe bytes before consent.
 */
export async function checkSceneBudgets(m: CinemaManifest): Promise<void> {
  const failures: string[] = [];
  await Promise.all(
    m.scenes.map(async (scene) => {
      const assets = [scene.keyframes.A, scene.keyframes.B, scene.depth?.A, scene.depth?.B];
      const sizes = await Promise.all(
        assets.filter((u): u is string => typeof u === "string").map(async (url) => {
          try {
            const res = await fetch(url, { method: "HEAD" });
            const len = res.headers.get("content-length");
            return len ? Number(len) : null;
          } catch {
            return null;
          }
        }),
      );
      const measured = sizes.filter((s): s is number => s !== null);
      if (measured.length === 0) {
        console.warn(`cinema budget: no content-length for scene ${scene.id} — guard skipped`);
        return;
      }
      const totalKb = measured.reduce((a, b) => a + b, 0) / 1024;
      if (totalKb > scene.budgetKb) {
        failures.push(`scene ${scene.id}: ${totalKb.toFixed(1)}KB > budget ${scene.budgetKb}KB`);
      }
    }),
  );
  if (failures.length > 0) {
    throw new Error(`cinema budget guard FAILED: ${failures.join("; ")}`);
  }
}
