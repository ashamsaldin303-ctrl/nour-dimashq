/**
 * Dev-only byte-budget guard (integration brief §6 loader rules):
 * fs.statSync check — the sum of keyframes.A + keyframes.B + depth.A + depth.B
 * per scene must not exceed its budgetKb. Mirrors the runtime
 * content-length guard; run ad hoc and paste output into evidence.
 */
import { statSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");
const manifest = JSON.parse(readFileSync(join(root, "media/manifest/cinema.json"), "utf8"));

let fail = 0;
console.log("scene          A(B)        B(B)        depA(B)     depB(B)     total(KB)   budget  verdict");
for (const scene of manifest.scenes) {
  const files = [scene.keyframes.A, scene.keyframes.B, scene.depth?.A, scene.depth?.B];
  const sizes = files.map((f) => (f ? statSync(join(root, f)).size : 0));
  const total = sizes.reduce((a, b) => a + b, 0);
  const kb = total / 1024;
  const ok = kb <= scene.budgetKb;
  if (!ok) fail++;
  console.log(
    `${scene.id.padEnd(14)} ${String(sizes[0]).padStart(9)}   ${String(sizes[1]).padStart(9)}   ${String(sizes[2]).padStart(9)}   ${String(sizes[3]).padStart(9)}   ${kb.toFixed(1).padStart(8)}    ${scene.budgetKb}     ${ok ? "PASS" : "FAIL"}`,
  );
}
const clips = manifest.consent.tierB.chain.map((c) => statSync(join(root, c)).size);
const clipsMb = clips.reduce((a, b) => a + b, 0) / 1048576;
console.log(
  `\ntierB clips: ${clips.map((s) => (s / 1048576).toFixed(2) + "MB").join(" + ")} = ${clipsMb.toFixed(2)}MB | manifest clipsMbTotal=${manifest.consent.tierB.clipsMbTotal} | ${Math.abs(clipsMb - manifest.consent.tierB.clipsMbTotal) < 0.05 ? "MATCH" : "MISMATCH"}`,
);
process.exit(fail > 0 ? 1 : 0);
