// Server-side data access. Uses Supabase when configured, otherwise the local demo store.
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { hasSupabase, supabaseServer, supabaseAdmin } from "./supabase/server";
import { readDB, writeDB, type Row } from "./demo-store";
import { DEMO_COOKIE, verifySession } from "./session";
import type { Rates } from "./price";

export type Session = { user: { id: string; email: string } | null; isAdmin: boolean };
export type Settings = { paymentsEnabled: boolean };

export async function getSession(): Promise<Session> {
  if (hasSupabase) {
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return { user: null, isAdmin: false };
    const { data } = await sb.from("profiles").select("role").eq("id", user.id).single();
    return { user: { id: user.id, email: user.email ?? "" }, isAdmin: data?.role === "admin" };
  }
  if (process.env.NODE_ENV === "production") return { user: null, isAdmin: false };
  const db = readDB();
  const id = verifySession((await cookies()).get(DEMO_COOKIE)?.value, db.secret);
  const u = db.users.find((x) => x.id === id);
  return u ? { user: { id: u.id, email: u.email }, isAdmin: u.role === "admin" } : { user: null, isAdmin: false };
}

const byNewest = (a: Row, b: Row) => b.created_at.localeCompare(a.created_at);
const check = <T,>({ data, error }: { data: T; error: { message: string } | null }) => { if (error) throw new Error(error.message); return data; };

export async function getSettings(): Promise<Settings> {
  if (!hasSupabase) return readDB().settings;
  const { data } = await (await supabaseServer()).from("settings").select("value").eq("key", "payments_enabled").maybeSingle();
  return { paymentsEnabled: data?.value === true };
}
export async function saveSettings(s: Settings) {
  if (!hasSupabase) return writeDB((db) => { db.settings = s; });
  check(await (await supabaseServer()).from("settings").upsert({ key: "payments_enabled", value: s.paymentsEnabled }));
}

export async function saveRates(r: Rates) {
  if (!hasSupabase) return writeDB((db) => { db.rates = r; });
  check(await (await supabaseServer()).from("rates").upsert(Object.entries(r).map(([purity, per_gram]) => ({ purity, per_gram, updated_at: new Date().toISOString() }))));
}

// Orders are written by trusted server routes only.
export async function insertOrder(row: Row): Promise<string> {
  if (!hasSupabase) { const id = randomUUID(); writeDB((db) => { db.orders.push({ ...row, id, created_at: new Date().toISOString() }); }); return id; }
  return check(await supabaseAdmin().from("orders").insert(row).select("id").single())!.id;
}
export async function listOrders(userId?: string): Promise<Row[]> {
  if (!hasSupabase) return readDB().orders.filter((o) => !userId || o.user_id === userId).sort(byNewest);
  let q = (await supabaseServer()).from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (userId) q = q.eq("user_id", userId);
  return check(await q) ?? [];
}
export async function getOrder(id: string, userId: string) {
  return (await listOrders(userId)).find((o) => o.id === id) ?? null;
}
export async function setOrderStatus(id: string, status: string) {
  if (!hasSupabase) return writeDB((db) => { const o = db.orders.find((x) => x.id === id); if (o) o.status = status; });
  check(await (await supabaseServer()).from("orders").update({ status }).eq("id", id));
}

export async function insertCustom(row: Row): Promise<string> {
  if (!hasSupabase) { const id = randomUUID(); writeDB((db) => { db.customs.push({ ...row, id, status: "submitted", quote: null, admin_note: null, created_at: new Date().toISOString() }); }); return id; }
  return check(await (await supabaseServer()).from("custom_requests").insert(row).select("id").single())!.id;
}
export async function listCustoms(userId?: string): Promise<Row[]> {
  if (!hasSupabase) return readDB().customs.filter((c) => !userId || c.user_id === userId).sort(byNewest);
  let q = (await supabaseServer()).from("custom_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (userId) q = q.eq("user_id", userId);
  return check(await q) ?? [];
}
export async function updateCustom(id: string, patch: { quote: number | null; status: string; admin_note: string | null }) {
  if (!hasSupabase) return writeDB((db) => { const c = db.customs.find((x) => x.id === id); if (c) Object.assign(c, patch); });
  check(await (await supabaseServer()).from("custom_requests").update(patch).eq("id", id));
}
export async function respondQuote(userId: string, id: string, accept: boolean) {
  if (!hasSupabase) return writeDB((db) => {
    const c = db.customs.find((x) => x.id === id && x.user_id === userId && x.status === "quoted");
    if (c) c.status = accept ? "accepted" : "declined";
  });
  check(await (await supabaseServer()).rpc("respond_quote", { req_id: id, accept }));
}

export async function saveProduct(row: Row, id?: string) {
  if (!hasSupabase) return writeDB((db) => {
    if (id) Object.assign(db.products.find((p) => p.id === id) ?? {}, row);
    else db.products.unshift({ ...row, id: randomUUID() } as never);
  });
  const sb = await supabaseServer();
  check(await (id ? sb.from("products").update(row).eq("id", id) : sb.from("products").insert(row)));
}
export async function deleteProduct(id: string) {
  if (!hasSupabase) return writeDB((db) => { db.products = db.products.filter((p) => p.id !== id); });
  check(await (await supabaseServer()).from("products").delete().eq("id", id));
}

// Returns a public URL (products) or a storage path (private custom refs).
export async function saveUpload(bucket: "products" | "custom-refs", f: File, folder = ""): Promise<string> {
  const name = `${folder ? folder + "/" : ""}${randomUUID()}-${f.name.replace(/[^\w.]/g, "_")}`;
  if (!hasSupabase) {
    const dir = join(process.cwd(), "public", "uploads", bucket, folder);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(process.cwd(), "public", "uploads", bucket, name), Buffer.from(await f.arrayBuffer()));
    return `/uploads/${bucket}/${name}`;
  }
  const sb = await supabaseServer();
  check(await sb.storage.from(bucket).upload(name, f));
  return bucket === "products" ? sb.storage.from(bucket).getPublicUrl(name).data.publicUrl : name;
}
export async function refUrls(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  if (!hasSupabase) return Object.fromEntries(paths.map((p) => [p, p]));
  const { data } = await (await supabaseServer()).storage.from("custom-refs").createSignedUrls(paths, 3600);
  return Object.fromEntries((data ?? []).map((s) => [s.path, s.signedUrl]));
}

// Marks a pending Razorpay order paid (after signature check) and decrements stock.
export async function markOrderPaid(rzpOrderId: string, userId: string, paymentId: string): Promise<Row | null> {
  if (!hasSupabase) {
    let hit: Row | null = null;
    writeDB((db) => {
      const o = db.orders.find((x) => x.razorpay_order_id === rzpOrderId && x.user_id === userId && x.status === "pending");
      if (!o) return;
      Object.assign(o, { status: "paid", razorpay_payment_id: paymentId });
      for (const l of o.items) { const p = db.products.find((x) => x.id === l.productId); if (p) p.stock = Math.max(0, p.stock - l.qty); }
      hit = o;
    });
    return hit;
  }
  const db = supabaseAdmin();
  const { data: order } = await db.from("orders").update({ status: "paid", razorpay_payment_id: paymentId })
    .eq("razorpay_order_id", rzpOrderId).eq("user_id", userId).eq("status", "pending").select("id, items").single();
  if (!order) return null;
  // shortcut: read-then-write stock decrement isn't atomic; move to an SQL function if concurrent sales of 1-of-1 pieces matter.
  for (const l of order.items as { productId: string; qty: number }[]) {
    const { data: p } = await db.from("products").select("stock").eq("id", l.productId).single();
    if (p) await db.from("products").update({ stock: Math.max(0, p.stock - l.qty) }).eq("id", l.productId);
  }
  return order;
}
