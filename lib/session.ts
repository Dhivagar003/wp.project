import { createHmac, timingSafeEqual } from "node:crypto";

export const DEMO_COOKIE = "wp_demo";

export function signSession(userId: string, secret: string, days = 7) {
  const body = `${userId}.${Date.now() + days * 864e5}`;
  return `${body}.${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export function verifySession(token: string | undefined, secret: string): string | null {
  const [id, exp, sig] = (token ?? "").split(".");
  if (!id || !exp || !sig || Number(exp) < Date.now()) return null;
  const want = Buffer.from(createHmac("sha256", secret).update(`${id}.${exp}`).digest("hex"));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got) ? id : null;
}
