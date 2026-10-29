"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/lib/store";
import type { Product } from "@/lib/types";

export function QuoteActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const respond = async (accept: boolean) => {
    setBusy(true);
    await fetch("/api/custom/respond", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, accept }) });
    router.refresh();
  };
  return (
    <div className="mt-5 flex gap-3">
      <button disabled={busy} onClick={() => respond(true)} className="btn-gold">Accept quote</button>
      <button disabled={busy} onClick={() => respond(false)} className="btn-ghost">Decline</button>
    </div>
  );
}

export function Wishlist({ items }: { items: { p: Product; price: number }[] }) {
  const wish = useShop((s) => s.wishlist);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const shown = items.filter((i) => wish.includes(i.p.slug));
  if (!shown.length) return <p className="mt-6 text-white/40">Tap ♡ on any piece to save it here.</p>;
  return <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map(({ p, price }) => <ProductCard key={p.id} p={p} price={price} />)}</div>;
}
