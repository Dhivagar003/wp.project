"use client";
import Link from "next/link";
import { useRef } from "react";
import LazyJewel from "./three/LazyJewel";
import { useShop } from "@/lib/store";
import { inr } from "@/lib/price";
import { defaultFinish } from "@/lib/finish";
import type { Product } from "@/lib/types";

export default function ProductCard({ p, price }: { p: Product; price: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const wished = useShop((s) => s.wishlist.includes(p.slug));
  const toggleWish = useShop((s) => s.toggleWish);
  const tilt = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current!.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  };
  return (
    <div ref={ref} onMouseMove={tilt} onMouseLeave={() => (ref.current!.style.transform = "")} className="card group relative transition-transform duration-300 ease-out hover:border-gold/40">
      <button onClick={() => toggleWish(p.slug)} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} className="absolute right-3 top-3 z-10 p-2 text-gold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
      </button>
      <Link href={`/product/${p.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(197,160,89,.14),transparent_65%)]">
          {p.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <LazyJewel type={p.model_type} finish={defaultFinish(p.metal)} gem={p.gem} glb={p.glb_url} controls={false} className="h-full w-full" />
          )}
          <span className="absolute left-3 top-3 border border-gold/30 bg-black/50 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-gold-light">{p.purity === "925" ? "925 Silver" : p.purity + " Gold"}</span>
        </div>
        <div className="p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{p.category}</p>
          <h3 className="mt-2 font-serif text-xl text-cream transition group-hover:text-gold-light">{p.name}</h3>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-gold-light">{inr(price)}</span>
            <span className="text-[11px] text-white/35">{p.weight_g} g</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
