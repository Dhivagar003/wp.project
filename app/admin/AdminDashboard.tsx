"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { waTo } from "@/lib/site";
import { inr, type Rates } from "@/lib/price";
import { CATEGORIES, ORDER_STATUSES, CUSTOM_STATUSES, FORM_OPTIONS, stoneName, type Product } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
const TABS = ["Overview", "Orders & bookings", "Custom requests", "Products", "Metal rates", "Store settings"] as const;

const api = (body: object) => fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export default function AdminDashboard({ products, rates, settings, orders, customs, refUrls }: { products: Product[]; rates: Rates; settings: { paymentsEnabled: boolean }; orders: Row[]; customs: Row[]; refUrls: Record<string, string> }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const run = async (p: Promise<Response>) => {
    const res = await p;
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Saved ✓" : `Error: ${data.error ?? res.status}`);
    if (res.ok) router.refresh();
    setTimeout(() => setMsg(""), 2500);
    return res.ok;
  };

  const live = orders.filter((o) => o.status !== "pending" && o.status !== "cancelled");
  const stats = [
    ["Mode", settings.paymentsEnabled ? "Online payments" : "Booking / enquiry"],
    ["Order value", inr(live.reduce((n, o) => n + Number(o.total), 0))],
    ["New bookings to call", orders.filter((o) => o.status === "booked").length],
    ["To make / ship", orders.filter((o) => ["paid", "confirmed", "crafting", "ready"].includes(o.status)).length],
    ["New custom requests", customs.filter((c) => c.status === "submitted").length],
    ["Products", products.length],
    ["Out of stock", products.filter((p) => p.stock < 1).length],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-8">
      <div className="flex items-end justify-between"><div><p className="eyebrow">Atelier Console</p><h1 className="mt-3 font-serif text-4xl">Admin</h1></div>{msg && <span className="text-sm text-gold">{msg}</span>}</div>
      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-white/10">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-[0.25em] ${tab === t ? "border-b-2 border-gold text-gold" : "text-white/50"}`}>{t}</button>)}
      </div>

      {tab === "Overview" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map(([k, v]) => <div key={k} className="card p-6"><p className="text-[10px] uppercase tracking-[0.3em] text-white/45">{k}</p><p className="mt-3 font-serif text-3xl text-gold-light">{v}</p></div>)}
        </div>
      )}

      {tab === "Metal rates" && (
        <form className="card mt-8 max-w-md space-y-4 p-6" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          run(api({ action: "rates", rates: Object.fromEntries(["22K", "18K", "925"].map((k) => [k, f.get(k)])) }));
        }}>
          {(["22K", "18K", "925"] as const).map((k) => <label key={k} className="block"><span className="label">{k} ₹ / gram</span><input name={k} type="number" step="0.01" min="1" required defaultValue={rates[k]} className="field" /></label>)}
          <button className="btn-gold w-full">Update rates</button>
          <p className="text-[11px] text-white/40">All product prices recalculate from these rates.</p>
        </form>
      )}

      {tab === "Products" && <Products products={products} run={run} />}

      {tab === "Store settings" && (
        <div className="card mt-8 max-w-xl p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="font-display text-sm tracking-[0.25em]">ONLINE PAYMENTS</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {settings.paymentsEnabled
                  ? "ON — customers pay at checkout with Razorpay (UPI, cards, netbanking)."
                  : "OFF — checkout becomes “Book / Enquire”. Customers send a booking request and you call them to confirm price and delivery."}
              </p>
            </div>
            <button role="switch" aria-checked={settings.paymentsEnabled} aria-label="Online payments"
              onClick={() => run(api({ action: "settings", paymentsEnabled: !settings.paymentsEnabled }))}
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${settings.paymentsEnabled ? "bg-gold" : "bg-white/15"}`}>
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${settings.paymentsEnabled ? "left-7" : "left-1"}`} />
            </button>
          </div>
          <p className="mt-5 text-[11px] text-white/35">Turning payments on needs Razorpay keys in the server environment.</p>
        </div>
      )}

      {tab === "Orders & bookings" && (
        <div className="mt-8 space-y-3">
          {!orders.length && <p className="text-white/40">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="card grid gap-3 p-5 text-sm md:grid-cols-[1fr_2fr_1fr_auto] md:items-center">
              <div><span className="font-display tracking-[0.15em]">#{o.id.slice(0, 8).toUpperCase()}</span><span className="block text-[11px] text-white/40">{new Date(o.created_at).toLocaleString("en-IN")}</span></div>
              <div><p>{o.status === "booked" && <span className="mr-2 bg-gold px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-ink">New booking</span>}{o.items.map((i: Row) => `${i.name} ×${i.qty}${i.size ? ` (${i.size})` : ""} · ${i.finish}`).join(", ")}</p><p className="text-[11px] text-white/40">{o.address.name} · {o.address.phone} · {o.address.line1}, {o.address.city} {o.address.pincode}</p>
                {(o.address.contactTime || o.address.note) && <p className="mt-1 text-[11px] text-gold-light/70">{o.address.contactTime && `Call: ${o.address.contactTime}. `}{o.address.note}</p>}
                <a href={waTo(o.address.phone, `Hello ${o.address.name}, this is WP Ornaments about your booking #${o.id.slice(0, 8).toUpperCase()}.`)} target="_blank" rel="noopener" className="mt-1 inline-block text-[11px] text-[#25D366]">WhatsApp customer →</a></div>
              <span className="text-gold-light">{inr(Number(o.total))}</span>
              <select defaultValue={o.status} onChange={(e) => run(api({ action: "orderStatus", id: o.id, status: e.target.value }))} className="field w-auto py-2">
                {ORDER_STATUSES.map((s) => <option key={s} className="bg-coal">{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === "Custom requests" && (
        <div className="mt-8 space-y-4">
          {!customs.length && <p className="text-white/40">No custom requests yet.</p>}
          {customs.map((c) => (
            <form key={c.id} className="card grid gap-4 p-6 md:grid-cols-[2fr_1fr]" onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              run(api({ action: "custom", id: c.id, quote: f.get("quote"), status: f.get("status"), note: f.get("note") }));
            }}>
              <div>
                <p className="font-serif text-xl capitalize">{c.metal} {c.category}</p>
                <p className="mt-1 text-[11px] text-white/40">{new Date(c.created_at).toLocaleString("en-IN")} · 📞 {c.phone}{c.budget ? ` · Budget ${inr(Number(c.budget))}` : ""}</p>
                <p className="mt-3 text-sm text-white/70">{Object.entries(c.config ?? {}).filter(([k, v]) => v && k !== "gemColor").map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
                {c.notes && <p className="mt-2 font-serif italic text-white/60">“{c.notes}”</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {(c.refs as string[]).map((r) => refUrls[r] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a key={r} href={refUrls[r]} target="_blank" rel="noopener"><img src={refUrls[r]} alt="Reference" className="h-20 w-20 border border-white/10 object-cover" /></a>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="block"><span className="label">Quote ₹</span><input name="quote" type="number" min="0" defaultValue={c.quote ?? ""} className="field" /></label>
                <label className="block"><span className="label">Status</span><select name="status" defaultValue={c.status} className="field">{CUSTOM_STATUSES.map((s) => <option key={s} className="bg-coal">{s}</option>)}</select></label>
                <label className="block"><span className="label">Note to customer</span><textarea name="note" rows={2} defaultValue={c.admin_note ?? ""} className="field" /></label>
                <button className="btn-gold w-full">Save</button>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}

function Products({ products, run }: { products: Product[]; run: (p: Promise<Response>) => Promise<boolean> }) {
  const [edit, setEdit] = useState<Partial<Product> | null>(null);
  const [busy, setBusy] = useState(false);
  const [cat, setCat] = useState(CATEGORIES[0].name);
  const stones = FORM_OPTIONS[CATEGORIES.find((c) => c.name === cat)?.model ?? "ring"].stones;
  const startEdit = (p: Partial<Product>) => { setCat(p.category ?? CATEGORIES[0].name); setEdit(p); };

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    if (edit?.id) f.set("id", edit.id);
    if (edit?.slug) f.set("slug", edit.slug);
    if (edit?.glb_url) f.set("glb_url", edit.glb_url);
    f.set("keepImages", JSON.stringify(edit?.images ?? []));
    if (await run(fetch("/api/admin/product", { method: "POST", body: f }))) setEdit(null);
    setBusy(false);
  }

  if (edit) return (
    <form onSubmit={save} className="card mt-8 grid gap-5 p-6 sm:grid-cols-2">
      <label className="sm:col-span-2"><span className="label">Name</span><input name="name" required defaultValue={edit.name} className="field" /></label>
      <label className="sm:col-span-2"><span className="label">Description</span><textarea name="description" rows={3} defaultValue={edit.description} className="field" /></label>
      <label><span className="label">Metal</span><select name="metal" defaultValue={edit.metal ?? "gold"} className="field"><option className="bg-coal">gold</option><option className="bg-coal">silver</option></select></label>
      <label><span className="label">Purity</span><select name="purity" defaultValue={edit.purity ?? "22K"} className="field">{["22K", "18K", "925"].map((p) => <option key={p} className="bg-coal">{p}</option>)}</select></label>
      <label><span className="label">Category (sets 3D model)</span><select name="category" value={cat} onChange={(e) => setCat(e.target.value)} className="field">{CATEGORIES.map((c) => <option key={c.name} className="bg-coal">{c.name}</option>)}</select></label>
      <label><span className="label">Net weight (g)</span><input name="weight_g" type="number" step="0.01" min="0.01" required defaultValue={edit.weight_g} className="field" /></label>
      <label><span className="label">Making charge %</span><input name="making_pct" type="number" step="0.1" min="0" required defaultValue={edit.making_pct ?? 12} className="field" /></label>
      <label><span className="label">Stock</span><input name="stock" type="number" min="0" required defaultValue={edit.stock ?? 1} className="field" /></label>
      <label><span className="label">Stone</span>
        <select name="stone" key={cat} defaultValue={stones.includes(stoneName(edit.gem ?? null) as never) ? stoneName(edit.gem ?? null)! : "None"} disabled={!stones.length} className="field disabled:opacity-40">
          <option className="bg-coal">None</option>
          {stones.map((n) => <option key={n} className="bg-coal">{n}</option>)}
        </select>
        {!stones.length && <span className="mt-1 block text-[11px] text-white/40">This category is plain metal.</span>}
      </label>
      <label className="flex items-center gap-3"><input type="checkbox" name="featured" defaultChecked={edit.featured} /><span className="label mb-0">Featured on home</span></label>
      <label><span className="label">Photos (add)</span><input type="file" name="images" accept="image/*" multiple className="field" /></label>
      <label><span className="label">Real 3D model .glb (optional)</span><input type="file" name="glb" accept=".glb,model/gltf-binary" className="field" /></label>
      {!!edit.images?.length && (
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {edit.images.map((src) => (
            <button type="button" key={src} title="Remove" onClick={() => setEdit({ ...edit, images: edit.images!.filter((i) => i !== src) })} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-20 object-cover" /><span className="absolute right-0 top-0 bg-black px-1 text-xs">×</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-3 sm:col-span-2"><button type="button" onClick={() => setEdit(null)} className="btn-ghost">Cancel</button><button disabled={busy} className="btn-gold flex-1">{busy ? "Saving…" : "Save product"}</button></div>
    </form>
  );

  return (
    <div className="mt-8">
      <button onClick={() => startEdit({})} className="btn-gold">+ New product</button>
      <div className="mt-6 divide-y divide-white/5 border border-white/5">
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <span className="flex-1 font-serif text-lg">{p.name}{p.featured && <span className="ml-2 text-[9px] text-gold">★</span>}</span>
            <span className="w-40 text-white/50">{p.category}</span>
            <span className="w-24 text-white/50">{p.purity} · {p.weight_g}g</span>
            <span className={`w-20 ${p.stock < 1 ? "text-red-400" : "text-white/50"}`}>Stock {p.stock}</span>
            <button onClick={() => startEdit(p)} className="text-gold">Edit</button>
            <button onClick={() => confirm(`Delete ${p.name}?`) && run(api({ action: "deleteProduct", id: p.id }))} className="text-red-400/80">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
