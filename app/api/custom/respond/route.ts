import { NextResponse } from "next/server";
import { getSession, respondQuote } from "@/lib/db";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { id, accept } = await req.json().catch(() => ({}));
  await respondQuote(user.id, String(id), !!accept);
  return NextResponse.json({ ok: true });
}
