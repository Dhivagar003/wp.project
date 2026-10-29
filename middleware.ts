import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/checkout", "/account", "/admin", "/order"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const needsAuth = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // demo mode: cookie presence only here; pages verify the signature via getSession()
    return needsAuth && !req.cookies.has("wp_demo") ? NextResponse.redirect(new URL(`/login?next=${req.nextUrl.pathname}`, req.url)) : res;
  }
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (needsAuth && !user) return NextResponse.redirect(new URL(`/login?next=${req.nextUrl.pathname}`, req.url));
  return res;
}

export const config = { matcher: ["/((?!_next|brand|favicon.ico|api).*)"] };
