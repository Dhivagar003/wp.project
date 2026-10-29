import { NextResponse } from "next/server";
import { hasSupabase, supabaseServer } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  if (hasSupabase) await (await supabaseServer()).auth.signOut();
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.delete(DEMO_COOKIE);
  return res;
}
