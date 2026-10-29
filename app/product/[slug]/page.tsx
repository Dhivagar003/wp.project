import { notFound } from "next/navigation";
import Link from "next/link";
import ProductView from "./ProductView";
import ProductCard from "@/components/ProductCard";
import { getProduct, getProducts, getRates } from "@/lib/catalog";
import { getSettings } from "@/lib/db";
import { computePrice } from "@/lib/price";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Not found" };
  return { title: `${p.name} | WP Ornaments`, description: p.description, openGraph: { title: p.name, description: p.description, images: p.images[0] ? [p.images[0]] : undefined } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, all, rates, settings] = await Promise.all([getProduct(slug), getProducts(), getRates(), getSettings()]);
  if (!p) notFound();
  const breakdown = computePrice(p.weight_g, p.making_pct, rates[p.purity]);
  const related = all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-8">
      <nav className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/40">
        <Link href="/shop" className="hover:text-gold">Shop</Link> / <Link href={`/shop?category=${encodeURIComponent(p.category)}`} className="hover:text-gold">{p.category}</Link> / <span className="text-gold">{p.name}</span>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, sku: p.slug, image: p.images,
        brand: { "@type": "Brand", name: "WP Ornaments" }, material: p.purity === "925" ? "925 Sterling Silver" : `${p.purity} Gold`,
        offers: { "@type": "Offer", priceCurrency: "INR", price: breakdown.total, availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder" },
      }).replace(/</g, "\\u003c") }} />
      <ProductView p={p} breakdown={breakdown} rate={rates[p.purity]} paymentsEnabled={settings.paymentsEnabled} rates={rates} />
      {related.length > 0 && (
        <section className="mt-28">
          <h2 className="font-serif text-3xl">You may also love</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={r} price={computePrice(r.weight_g, r.making_pct, rates[r.purity]).total} />)}
          </div>
        </section>
      )}
    </div>
  );
}
