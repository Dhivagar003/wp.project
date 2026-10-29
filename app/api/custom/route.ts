import { NextResponse } from "next/server";
import { getSession, insertCustom, saveUpload } from "@/lib/db";
import { notifyShop } from "@/lib/notify";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const f = await req.formData();
  const s = (k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
  const phone = s("phone", 20);
  if (!/^[+\d][\d\s-]{7,}$/.test(phone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  if (!["gold", "silver"].includes(s("metal")) || !s("category")) return NextResponse.json({ error: "Choose a metal and form." }, { status: 400 });
  const files = (f.getAll("refs") as File[]).filter((x) => x.size).slice(0, 5);
  if (files.some((x) => x.size > 8 * 1024 * 1024 || !x.type.startsWith("image/"))) return NextResponse.json({ error: "Reference files must be images under 8 MB." }, { status: 400 });

  let config: Record<string, unknown> = {};
  try { config = JSON.parse(s("config", 2000)); } catch {}
  const refs = await Promise.all(files.map((x) => saveUpload("custom-refs", x, user.id)));
  const budget = Number(s("budget")) || null;
  const id = await insertCustom({ user_id: user.id, metal: s("metal"), category: s("category"), config, refs, phone, budget, notes: s("notes", 2000) });
  await notifyShop(`New custom design request — ${s("metal")} ${s("category")}`, {
    phone, email: user.email, budget: budget ? `₹${budget}` : "not given", notes: s("notes", 2000),
    design: Object.entries(config).filter(([k, v]) => v && k !== "gemColor").map(([k, v]) => `${k}: ${v}`).join(", "),
    reference_images: refs.length,
  });
  return NextResponse.json({ id });
}
