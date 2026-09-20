/**
 * Depth-map generation for the M2 cinema layer (Tier A).
 * Depth Anything V2 (small, ONNX) via transformers.js — CPU inference.
 * Output: 512w grayscale webp, bright = near (shader law: R8, 1 = near).
 * DA v2 emits relative INVERSE depth (higher = closer) — direct normalize.
 */
import { pipeline } from "@huggingface/transformers";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { execFileSync } from "child_process";

const IN_DIR = process.argv[2] ?? "/tmp/kf-work";
const OUT_DIR = process.argv[3] ?? "/tmp/kf-work";
const MODEL = process.argv[4] ?? "onnx-community/depth-anything-v2-small";

async function toPngRaw(bytes: Uint8Array, w: number, h: number): Promise<Buffer> {
	// PGM (P5) is the simplest grayscale container ffmpeg can read.
	const header = Buffer.from(`P5\n${w} ${h}\n255\n`, "ascii");
	return Buffer.concat([header, Buffer.from(bytes)]);
}

async function main() {
	const keys = ["K1", "K2", "K3", "K4"];
	console.log(`Loading ${MODEL} …`);
	const depth = await pipeline("depth-estimation", MODEL, { dtype: "q8" });
	mkdirSync(OUT_DIR, { recursive: true });

	for (const k of keys) {
		const img = `${IN_DIR}/${k}.png`;
		console.log(`→ ${k}`);
		const out = (await depth(img)) as any;
		const data: Float32Array = out[0]?.predicted_depth?.data ?? out.predicted_depth?.data;
		const dims = out[0]?.predicted_depth?.dims ?? out.predicted_depth?.dims;
		if (!data || !dims) throw new Error(`no depth output for ${k}`);
		const [H, W] = dims;
		// normalize to 0..255 (higher disparity = nearer = brighter)
		let min = Infinity, max = -Infinity;
		for (let i = 0; i < data.length; i++) {
			const v = data[i];
			if (v < min) min = v;
			if (v > max) max = v;
		}
		const span = max - min || 1;
		const gray = new Uint8Array(W * H);
		for (let i = 0; i < data.length; i++) gray[i] = Math.round(((data[i] - min) / span) * 255);
		// DA v2 pads to 518×518-ish square with edges; center-crop to source AR 16:9
		const targetH = Math.round((W * 9) / 16); // for 518 → 291
		const top = Math.floor((H - targetH) / 2);
		const crop = new Uint8Array(W * targetH);
		for (let y = 0; y < targetH; y++) {
			const src = (top + y) * W;
			crop.set(gray.subarray(src, src + W), y * W);
		}
		const pgm = await toPngRaw(crop, W, targetH);
		const pgmPath = `${OUT_DIR}/${k}_depth.pgm`;
		writeFileSync(pgmPath, pgm);
		// → 512w grayscale webp via ffmpeg
		execFileSync("ffmpeg", ["-y", "-v", "error", "-i", pgmPath, "-vf", "scale=512:288,format=gray", "-c:v", "libwebp", "-quality", "80", "-preset", "photo", `${OUT_DIR}/${k}_depth.webp`]);
		const size = readFileSync(`${OUT_DIR}/${k}_depth.webp`).length;
		console.log(`  ${W}x${H} → 512x288 webp ${size}B (min=${min.toFixed(2)} max=${max.toFixed(2)})`);
	}
	console.log("DONE");
}

main().catch((e) => {
	console.error("DEPTH FAILED:", e?.message ?? e);
	process.exit(1);
});
