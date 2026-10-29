import { Suspense } from "react";
import ShopGrid from "./ShopGrid";
import { getProducts, getRates } from "@/lib/catalog";
import { computePrice } from "@/lib/price";

export const revalidate = 300;
export const metadata = { title: "Collections | WP Ornaments" };

export default async function Shop() {
  const [products, rates] = await Promise.all([getProducts(), getRates()]);
  const items = products.map((p) => ({ p, price: computePrice(p.weight_g, p.making_pct, rates[p.purity]).total }));
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-8">
      <p className="eyebrow">The Collections</p>
      <h1 className="mt-4 font-serif text-5xl">Shop the Archive</h1>
      <Suspense><ShopGrid items={items} /></Suspense>
    </div>
  );
}
