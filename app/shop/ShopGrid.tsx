"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, type Product } from "@/lib/types";

const SORTS = { featured: "Featured", "price-asc": "Price: low to high", "price-desc": "Price: high to low", weight: "Weight" } as const;

export default function ShopGrid({ items }: { items: { p: Product; price: number }[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const metal = sp.get("metal") ?? "";
  const category = sp.get("category") ?? "";
  const purity = sp.get("purity") ?? "";
  const sort = (sp.get("sort") ?? "featured") as keyof typeof SORTS;
  const [q, setQ] = useState("");
  const maxPrice = Math.max(...items.map((i) => i.price), 0);
  const [cap, setCap] = useState(maxPrice);

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    router.replace(`/shop?${n}`, { scroll: false });
  };

  const shown = useMemo(() => {
    const list = items.filter(({ p, price }) =>
      (!metal || p.metal === metal) && (!category || p.category === category) && (!purity || p.purity === purity) && price <= cap &&
      (!q || (p.name + p.category).toLowerCase().includes(q.toLowerCase())));
    const by = { featured: (a: typeof list[0], b: typeof list[0]) => +b.p.featured - +a.p.featured, "price-asc": (a: typeof list[0], b: typeof list[0]) => a.price - b.price, "price-desc": (a: typeof list[0], b: typeof list[0]) => b.price - a.price, weight: (a: typeof list[0], b: typeof list[0]) => b.p.weight_g - a.p.weight_g };
    return [...list].sort(by[sort] ?? by.featured);
  }, [items, metal, category, purity, cap, q, sort]);

  const chip = (active: boolean) => `whitespace-nowrap border px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition ${active ? "border-gold bg-gold/15 text-gold-light" : "border-white/10 text-white/60 hover:border-gold/40"}`;

  return (
    <>
      <div className="z-30 -mx-4 md:sticky md:top-20 mt-10 space-y-4 border-y border-white/5 bg-ink/85 px-4 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pieces…" aria-label="Search" className="field max-w-xs py-2" />
          {["", "gold", "silver"].map((m) => <button key={m} onClick={() => set("metal", m)} className={chip(metal === m)}>{m || "All metals"}</button>)}
          {["22K", "18K", "925"].map((m) => <button key={m} onClick={() => set("purity", purity === m ? "" : m)} className={chip(purity === m)}>{m}</button>)}
          <select value={sort} onChange={(e) => set("sort", e.target.value)} aria-label="Sort" className="field ml-auto w-auto py-2">
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k} className="bg-coal">{v}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-1" data-lenis-prevent>
          <button onClick={() => set("category", "")} className={chip(!category)}>All</button>
          {CATEGORIES.map((c) => <button key={c.name} onClick={() => set("category", c.name)} className={chip(category === c.name)}>{c.name}</button>)}
          <label className="ml-auto flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/50">
            Max ₹{Math.round(cap / 1000)}k
            <input type="range" min={0} max={maxPrice} step={1000} value={cap} onChange={(e) => setCap(+e.target.value)} className="accent-[#c5a059]" />
          </label>
        </div>
      </div>
      <p className="mt-6 text-xs text-white/40">{shown.length} pieces</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map(({ p, price }) => <ProductCard key={p.id} p={p} price={price} />)}
      </div>
      {shown.length === 0 && <p className="py-24 text-center font-serif text-xl italic text-white/40">No pieces match. Try fewer filters — or design it yourself.</p>}
    </>
  );
}
