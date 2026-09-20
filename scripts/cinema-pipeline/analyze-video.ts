import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync } from 'fs';

const VIDEO_PATH = process.argv[2] || '/tmp/proxy.mp4';
const OUT_PATH = process.argv[3] || '/tmp/video-analysis.txt';
const MODEL = process.argv[4] || 'glm-4.6v';

const PROMPT = `Analyze this 11.87-second video (originally 1280x720 60fps HEVC; this is a 512x288 12fps H264 proxy of the SAME content) in forensic detail for integration as a scroll-driven cinematic background of a Damascus real-estate website. Provide EXACTLY this structure:
1. SHOT STRUCTURE: number of distinct shots/cuts, with precise in/out timestamps (seconds, 2 decimals). If no hard cuts but continuous camera motion, say so and divide into logical segments with timestamps.
2. PER SHOT DESCRIPTION: setting, architectural elements (door/threshold, courtyard, fountain, lemon tree, mashrabiya, stone, tiles), lighting direction and quality, camera movement (dolly-in, pan, orbit, zoom, static), speed of motion.
3. MOOD & PALETTE per shot: dominant colors, warm/cool, contrast.
4. OVERLAYS: any visible text, logos, watermarks, people, faces, brand marks, subtitles — quote them exactly and give timestamps.
5. PROVENANCE: does footage appear real filmed or AI-generated? What artifacts suggest so?
6. FRAME-ACCURATE BOUNDARIES: for each shot boundary, describe the exact last frame of the outgoing shot and first frame of the incoming shot (for match-cut extraction).
7. NARRATIVE ARC: does it follow threshold → courtyard → light progression? Rate fit 0-10 for: (a) chapter 'The Threshold العتبة' (entrance/door/stone) (b) chapter 'The Courtyard الباح' (fountain/courtyard/trees) (c) chapter 'The Light النور' (mashrabiya/light rays).
8. QUALITY ISSUES: stutter, flicker, banding, compression artifacts, exposure pulsing.
Answer in English. Output ONLY a fenced json block with keys: shots[], overlays[], provenance, boundaries[], arc{threshold_fit, courtyard_fit, light_fit, reasoning}, quality_issues[].`;

async function main() {
	try {
		const zai = await ZAI.create();
		const buf = readFileSync(VIDEO_PATH);
		const b64 = buf.toString('base64');
		console.log(`Video loaded: ${VIDEO_PATH} (${(buf.length / 1024).toFixed(0)} KB, b64 ${(b64.length / 1024).toFixed(0)} KB), model=${MODEL}`);

		const response = await zai.chat.completions.createVision({
			model: MODEL,
			messages: [
				{
					role: 'user',
					content: [
						{ type: 'text', text: PROMPT },
						{ type: 'video_url', video_url: { url: `data:video/mp4;base64,${b64}` } }
					]
				}
			],
			thinking: { type: 'enabled' }
		});

		const reply = response.choices?.[0]?.message?.content ?? '';
		console.log('=== RAW REPLY ===');
		console.log(reply);
		writeFileSync(OUT_PATH, reply, 'utf-8');
		console.log(`\nSaved to ${OUT_PATH}`);
	} catch (err: any) {
		console.error('FAILED:', err?.message || err);
		if (err?.status) console.error('status:', err.status);
		if (err?.error) console.error('error body:', JSON.stringify(err.error));
		process.exit(1);
	}
}

main();
