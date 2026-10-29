"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LazyJewel from "@/components/three/LazyJewel";
import { useShop } from "@/lib/store";
import { inr, GST_PCT } from "@/lib/price";
import { defaultFinish, finishesFor, FINISH_LABEL } from "@/lib/finish";
import { FINISH_COLOR } from "@/components/three/models";
import { waLink } from "@/lib/site";
import SizeGuide from "@/components/SizeGuide";
import ExchangeEstimator from "@/components/ExchangeEstimator";
import type { Rates } from "@/lib/price";
import { FORM_OPTIONS, type Finish, type Product } from "@/lib/types";


export default function ProductView({ p, breakdown, rate, paymentsEnabled, rates }: { p: Product; breakdown: { metal: number; making: number; gst: number; total: number }; rate: number; paymentsEnabled: boolean; rates: Rates }) {
  const router = useRouter();
  const [finish, setFinish] = useState<Finish>(defaultFinish(p.metal));
  const sizes = FORM_OPTIONS[p.model_type].sizes;
  const [size, setSize] = useState<string | undefined>(sizes[Math.floor(sizes.length / 2)]);
  const [view, setView] = useState<"3d" | number>("3d");
  const add = useShop((s) => s.add);
  const wished = useShop((s) => s.wishlist.includes(p.slug));
  const toggleWish = useShop((s) => s.toggleWish);
  const item = { productId: p.id, slug: p.slug, name: p.name, finish, size, unitPrice: breakdown.total };

  return (
    <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="card relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(197,160,89,.18),transparent_65%)]">
          {view === "3d" ? (
            <LazyJewel type={p.model_type} finish={finish} gem={p.gem} glb={p.glb_url} controls sparkles className="h-full w-full cursor-grab active:cursor-grabbing" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[view]} alt={p.name} className="h-full w-full object-cover" />
          )}
          {view === "3d" && <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.4em] text-white/40">Drag to rotate · Scroll to zoom</span>}
        </div>
        {p.images.length > 0 && (
          <div className="mt-4 flex gap-3">
            <button onClick={() => setView("3d")} className={`grid h-20 w-20 place-items-center border font-display text-xs ${view === "3d" ? "border-gold text-gold" : "border-white/10"}`}>3D</button>
            {p.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <button key={src} onClick={() => setView(i)} className={`h-20 w-20 overflow-hidden border ${view === i ? "border-gold" : "border-white/10"}`}><img src={src} alt="" className="h-full w-full object-cover" /></button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:pt-6">
        <p className="eyebrow">{p.category}</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{p.name}</h1>
        <p className="mt-5 text-3xl text-gold-light">{inr(breakdown.total)}</p>
        <p className="mt-1 text-[11px] text-white/40">Inclusive of {GST_PCT}% GST · based on today’s {p.purity} rate {inr(rate)}/g</p>
        <p className="mt-8 leading-relaxed text-white/60">{p.description}</p>

        <div className="mt-10">
          <span className="label">Finish — {FINISH_LABEL[finish]}</span>
          <div className="flex gap-3">
            {finishesFor(p.metal).map((f) => (
              <button key={f} onClick={() => setFinish(f)} aria-label={FINISH_LABEL[f]} aria-pressed={finish === f}
                className={`h-10 w-10 rounded-full border-2 transition ${finish === f ? "scale-110 border-gold" : "border-transparent"}`} style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${FINISH_COLOR[f]} 45%, #6b5323)` }} />
            ))}
          </div>
        </div>

        {sizes.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between"><span className="label">Size</span><SizeGuide /></div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`min-w-12 border px-3 py-2 text-sm transition ${size === s ? "border-gold bg-gold/15 text-gold-light" : "border-white/10 text-white/60 hover:border-gold/40"}`}>{s}</button>)}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <button disabled={p.stock < 1} onClick={() => add(item)} className="btn-gold flex-1">{p.stock < 1 ? "Made to order" : "Add to bag"}</button>
          <button disabled={p.stock < 1} onClick={() => { add(item); useShop.getState().setCartOpen(false); router.push("/checkout"); }} className="btn-ghost flex-1">{paymentsEnabled ? "Buy now" : "Book now"}</button>
          <button onClick={() => toggleWish(p.slug)} aria-label="Wishlist" className="btn-ghost px-4">{wished ? "♥" : "♡"}</button>
        </div>
        <a href={waLink(`Hi, I'm interested in ${p.name} (${p.slug}).`)} target="_blank" rel="noopener" className="mt-4 block text-center text-[11px] uppercase tracking-[0.3em] text-white/50 hover:text-gold">Ask on WhatsApp · Video call viewing</a>

        <dl className="card mt-10 divide-y divide-white/5 text-sm">
          {[["Purity", p.purity === "925" ? "925 Sterling Silver" : `${p.purity} Gold (BIS hallmarked)`], ["Net weight", `${p.weight_g} g`], ["Metal value", inr(breakdown.metal)], [`Making (${p.making_pct}%)`, inr(breakdown.making)], [`GST (${GST_PCT}%)`, inr(breakdown.gst)]].map(([k, v]) => (
            <div key={k} className="flex justify-between px-5 py-3"><dt className="text-white/50">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        {p.metal === "gold" && <ExchangeEstimator rates={rates} />}
        <ul className="mt-6 grid grid-cols-3 gap-3 text-center text-[10px] uppercase tracking-[0.2em] text-white/45">
          <li className="card p-3">Free insured shipping</li><li className="card p-3">Lifetime exchange</li><li className="card p-3">Certified purity</li>
        </ul>
      </div>
    </div>
  );
}
