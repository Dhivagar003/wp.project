import { NextResponse } from "next/server";
import { getSession, saveProduct, saveUpload } from "@/lib/db";
import { CATEGORIES, FORM_OPTIONS, STONES, type StoneName } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await getSession()).isAdmin) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const f = await req.formData();
  const s = (k: string) => String(f.get(k) ?? "").trim();
  const cat = CATEGORIES.find((c) => c.name === s("category"));
  const name = s("name");
  if (!name || !cat || !["gold", "silver"].includes(s("metal")) || !["22K", "18K", "925"].includes(s("purity")) || !(Number(s("weight_g")) > 0))
    return NextResponse.json({ error: "Please fill name, metal, purity, category and weight." }, { status: 400 });
  try {
    const imgs = (f.getAll("images") as File[]).filter((x) => x.size);
    const glb = f.get("glb") as File | null;
    const keep: string[] = JSON.parse(s("keepImages") || "[]");
    const row = {
      name, slug: s("slug") || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: s("description"), metal: s("metal"), purity: s("purity"), category: cat.name, model_type: cat.model,
      weight_g: Number(s("weight_g")), making_pct: Number(s("making_pct")) || 0, stock: Math.max(0, Number(s("stock")) || 0),
      // only stones this form can actually hold; anything else (or "None") is plain metal
      gem: FORM_OPTIONS[cat.model].stones.includes(s("stone") as StoneName) ? STONES[s("stone") as StoneName] : null, featured: !!f.get("featured"),
      images: [...keep, ...(await Promise.all(imgs.map((x) => saveUpload("products", x))))],
      glb_url: glb?.size ? await saveUpload("products", glb) : s("glb_url") || null,
    };
    await saveProduct(row, s("id") || undefined);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
