import Link from "next/link";
import Image from "next/image";
import LazyJewel from "@/components/three/LazyJewel";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import RateTicker from "@/components/RateTicker";
import Testimonials from "@/components/Testimonials";
import { getProducts, getRates } from "@/lib/catalog";
import { computePrice } from "@/lib/price";
import { CATEGORIES } from "@/lib/types";

export const revalidate = 300;

const STANDARD = [
  ["BIS Hallmarked", "Every gram certified for purity, with HUID on each piece."],
  ["In-house Refining", "Our own 22K blends, melted and refined at the forge since 1987."],
  ["See it in 3D", "Rotate, zoom and switch metal finishes before you buy."],
  ["Lifetime Care", "Free polishing, resizing guidance and lifetime exchange value."],
];

const PHASES = [
  ["Phase I", "The Alchemical Forging", "We begin at the forge. By purifying our gold through intense heat, we ensure integrity and a glow that never fades."],
  ["Phase II", "The Artisan’s Soul", "Where machines fail, the human hand prevails. The rhythmic strike of the master’s hammer sculpts details that carry a heartbeat."],
  ["Phase III", "The Signature Hallmark", "Hand-polished to a mirror finish and presented in our signature casing — certified, pure, and ready for your story."],
];

const PHILOSOPHY = [
  ["/brand/the-alchemical-process.jpeg", "The Alchemical Process", "The Soul of the Metal", "Gold is more than luxury — it’s a vessel for your memories. We melt and refine our own gold, creating custom 22K blends in-house for a deep, warm glow and lasting strength."],
  ["/brand/l1.jpeg", "Design Intent", "The Artist’s Touch", "In a world of mass-production, we choose the slow way. Every curve is intentional, shaped by the hammer, carrying character a machine cannot replicate."],
  ["/brand/mythical-artistry.jpeg", "Mythical Artistry", "Fantasy Gold", "Inspired by ancient myths — dragon scales, celestial stars, fairy-tale elegance — combined with traditional forging into wearable treasures."],
];

export default async function Home() {
  const [products, rates] = await Promise.all([getProducts(), getRates()]);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const price = (p: (typeof products)[number]) => computePrice(p.weight_g, p.making_pct, rates[p.purity]).total;

  return (
    <>
      {/* HERO */}
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[radial-gradient(ellipse_at_60%_45%,rgba(197,160,89,.18),transparent_60%)]">
        <LazyJewel type="ring" finish="yellow" gem="#f4f8ff" controls={false} sparkles scrollSpin zoom={6.8} className="absolute inset-x-0 top-0 bottom-[38%] md:bottom-0 md:left-[30%]" />
        <div className="pointer-events-none absolute inset-0 z-[6] bg-gradient-to-t from-ink via-transparent to-transparent md:bg-gradient-to-r md:from-ink md:via-ink/20" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-24 sm:px-8 md:items-center md:pb-0">
          <Reveal className="max-w-xl">
            <p className="eyebrow">Goldsmiths since 1987</p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-cream sm:text-7xl">
              Purity <em className="text-gold-shine">in Art.</em>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60">Hand-forged gold and silver heirlooms. Explore every piece in 3D, order online, or design your own with our master smiths.</p>
            <div className="pointer-events-auto mt-10 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-gold">Shop Collections</Link>
              <Link href="/custom" className="btn-ghost">Design Your Own</Link>
            </div>
          </Reveal>
        </div>
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[9px] tracking-[0.5em] text-white/40 md:flex">SCROLL<span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" /></div>
      </section>

      <RateTicker rates={rates} />

      {/* METALS */}
      <section className="mx-auto max-w-7xl px-6 py-28 sm:px-8">
        <Reveal><p className="eyebrow text-center">I. Select your medium</p></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[["gold", "/brand/gold-card.jpg", "Gold", "22K & 18K hallmarked"], ["silver", "/brand/silver-card.jpeg", "Silver", "925 sterling"]].map(([m, img, t, s], i) => (
            <Reveal key={m} delay={i * 0.1}>
              <Link href={`/shop?metal=${m}`} className="group relative block aspect-[4/3] overflow-hidden border border-white/10">
                <Image src={img} alt={`${t} collection`} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover opacity-70 transition duration-1000 group-hover:scale-110 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h2 className="font-display text-4xl tracking-[0.3em] text-cream">{t.toUpperCase()}</h2>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.4em] text-gold">{s} · Explore →</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 pb-28 sm:px-8">
        <Reveal><h2 className="text-center font-serif text-4xl sm:text-5xl">The Collections</h2></Reveal>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.name} delay={(i % 4) * 0.08}>
              <Link href={`/shop?category=${encodeURIComponent(c.name)}`} className="card group block p-4 text-center transition hover:border-gold/40">
                <LazyJewel type={c.model} finish="yellow" gem={c.model === "ring" ? "#c0123a" : null} controls={false} className="aspect-square" />
                <span className="mt-3 block font-display text-[11px] tracking-[0.25em] text-cream/80 group-hover:text-gold">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="border-y border-white/5 bg-coal py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="eyebrow">Signature Archive</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">Featured Pieces</h2></div>
            <Link href="/shop" className="btn-ghost">View all</Link>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} p={p} price={price(p)} />)}
          </div>
        </div>
      </section>

      {/* CUSTOM TEASER */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-28 sm:px-8 md:grid-cols-2">
        <LazyJewel type="pendant" finish="rose" gem="#0f8a4f" controls className="aspect-square w-full" />
        <Reveal>
          <p className="eyebrow">Bespoke Atelier</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Imagine it. <em className="text-gold-shine">We forge it.</em></h2>
          <p className="mt-6 text-sm leading-relaxed text-white/60">Choose your metal, form, stone and engraving in our live 3D studio, upload reference images, and our master goldsmith will send you a personal quote — usually within 24 hours.</p>
          <ol className="mt-8 space-y-3 text-sm text-white/70">
            {["Configure in 3D", "Upload inspiration & set budget", "Receive quote & approve", "Hand-forged & delivered insured"].map((s, i) => (
              <li key={s} className="flex gap-4"><span className="font-display text-gold">0{i + 1}</span>{s}</li>
            ))}
          </ol>
          <Link href="/custom" className="btn-gold mt-10">Open the Studio</Link>
        </Reveal>
      </section>

      {/* STANDARD */}
      <section className="border-t border-white/5 py-24">
        <div className="mx-auto grid max-w-7xl gap-px bg-white/5 px-0 sm:grid-cols-2 lg:grid-cols-4">
          {STANDARD.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="bg-ink p-10">
              <span className="font-display text-3xl text-gold/40">0{i + 1}</span>
              <h3 className="mt-6 font-display text-sm tracking-[0.25em] text-cream">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ATELIER */}
      <section id="atelier" className="scroll-mt-20 bg-coal py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="text-center"><p className="eyebrow">Exclusive Insight</p><h2 className="mt-4 font-display text-3xl tracking-[0.3em] sm:text-5xl">The Atelier Narrative</h2></Reveal>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {PHASES.map(([p, t, d], i) => (
              <Reveal key={p} delay={i * 0.12} className="card p-10">
                <p className="eyebrow">{p}</p>
                <h3 className="mt-5 font-serif text-2xl">{t}</h3>
                <p className="mt-4 font-serif text-base italic leading-relaxed text-white/55">“{d}”</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-28 space-y-28">
            {PHILOSOPHY.map(([img, eyebrow, t, d], i) => (
              <div key={t} className={`grid items-center gap-12 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <Reveal className="relative aspect-[4/3] overflow-hidden border border-white/10">
                  <Image src={img} alt={t} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
                </Reveal>
                <Reveal delay={0.15}>
                  <p className="eyebrow">{eyebrow}</p>
                  <h3 className="mt-4 font-serif text-4xl">{t}</h3>
                  <p className="mt-6 leading-relaxed text-white/60">{d}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-32 sm:px-8">
        <p className="eyebrow mb-12 text-center">Voices of the Archive</p>
        <Testimonials />
      </section>
    </>
  );
}
