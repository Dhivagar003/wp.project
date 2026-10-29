import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase/server";
import { readDB, checkPassword } from "@/lib/demo-store";
import { DEMO_COOKIE, signSession } from "@/lib/session";

export async function POST(req: Request) {
  if (hasSupabase || process.env.NODE_ENV === "production") return NextResponse.json({ error: "Demo login is disabled." }, { status: 404 });
  const { email, password } = await req.json().catch(() => ({}));
  const db = readDB();
  const u = db.users.find((x) => x.email === String(email ?? "").trim().toLowerCase());
  if (!u || !checkPassword(String(password ?? ""), u.salt, u.hash)) return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEMO_COOKIE, signSession(u.id, db.secret), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
  return res;
}
