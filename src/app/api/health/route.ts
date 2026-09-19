/** GET /api/health — probe (brief §8 route table): `{ok:true}`. */
export async function GET() {
  return Response.json({ ok: true });
}
