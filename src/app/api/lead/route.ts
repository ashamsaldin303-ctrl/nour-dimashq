import { db } from "@/lib/db";
import { LeadInput } from "@/lib/schemas";
import type { LeadInput as LeadInputType } from "@/lib/schemas";

/**
 * POST /api/lead — lead capture, spam-guarded (brief §8 exemplar standard).
 *   422 invalid payload · 200 {ok:true} honeypot silent sink (ZERO insert —
 *   AC-18) · 429 rate limit (in-memory, 5/min/IP) · 200 {ok:true} row created.
 * Field-by-field Prisma data — NEVER a body spread (mass-assignment law).
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

async function notifyTelegramOptional(data: LeadInputType): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.OFFICE_CHAT_ID;
  if (!token || !chatId) return; // env-gated no-op — never blocks
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `رابط جديد (${data.source}) — ${data.phone}${data.propertyRef ? ` — ${data.propertyRef}` : ""}${data.district ? ` — ${data.district}` : ""}`,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // notifications never fail the lead
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 422 });
  }

  const parsed = LeadInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 422 });
  }

  const data = parsed.data;

  if (data.honeypot) {
    return Response.json({ ok: true }); // silent sink — bot filled the honeypot
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return Response.json({ ok: false }, { status: 429 });
  }

  await db.lead.create({
    data: {
      source: data.source,
      propertyRef: data.propertyRef ?? null,
      district: data.district ?? null,
      type: data.type ?? null,
      phone: data.phone,
      status: "new",
    },
  });

  await notifyTelegramOptional(data);
  return Response.json({ ok: true });
}
