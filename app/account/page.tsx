import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, listOrders, listCustoms } from "@/lib/db";
import { getProducts, getRates } from "@/lib/catalog";
import { computePrice, inr } from "@/lib/price";
import StatusTimeline from "@/components/StatusTimeline";
import { QuoteActions, Wishlist } from "./client";

export const metadata = { title: "My Account | WP Ornaments" };
export const dynamic = "force-dynamic";

export default async function Account() {
  const { user } = await getSession();
  if (!user) redirect("/login?next=/account");
  const [orders, customs, products, rates] = await Promise.all([listOrders(user.id), listCustoms(user.id), getProducts(), getRates()]);
  const priced = products.map((p) => ({ p, price: computePrice(p.weight_g, p.making_pct, rates[p.purity]).total }));
  const shown = orders.filter((o) => o.status !== "pending");

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">My Account</p><h1 className="mt-4 font-serif text-4xl">Welcome back</h1><p className="mt-2 text-sm text-white/45">{user.email}</p></div>
        <form action="/auth/signout" method="post"><button className="btn-ghost">Sign out</button></form>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-sm tracking-[0.3em] text-gold">ORDERS & BOOKINGS</h2>
        {!shown.length && <p className="mt-6 text-white/40">Nothing yet. <Link href="/shop" className="text-gold">Start shopping →</Link></p>}
        <div className="mt-6 space-y-4">
          {shown.map((o) => (
            <Link key={o.id} href={`/order/${o.id}`} className="card block p-6 transition hover:border-gold/40">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-display tracking-[0.2em]">{o.razorpay_order_id ? "ORDER" : "BOOKING"} #{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-white/45">{new Date(o.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                <span className="text-gold-light">{o.razorpay_order_id ? "" : "est. "}{inr(Number(o.total))}</span>
              </div>
              <p className="mt-2 text-sm text-white/60">{(o.items as { name: string; qty: number }[]).map((i) => `${i.name} × ${i.qty}`).join(", ")}</p>
              <div className="mt-6"><StatusTimeline status={o.status} booked={!o.razorpay_order_id} /></div>
            </Link>
          ))}
        </div>
      </section>

      <section id="custom" className="mt-16 scroll-mt-28">
        <div className="flex items-center justify-between"><h2 className="font-display text-sm tracking-[0.3em] text-gold">CUSTOM REQUESTS</h2><Link href="/custom" className="text-[10px] uppercase tracking-[0.3em] text-white/50 hover:text-gold">+ New design</Link></div>
        {!customs.length && <p className="mt-6 text-white/40">No custom designs yet.</p>}
        <div className="mt-6 space-y-4">
          {customs.map((c) => (
            <div key={c.id} className="card p-6">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-serif text-xl capitalize">{c.metal} {c.category}</span>
                <span className="border border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold">{c.status}</span>
              </div>
              <p className="mt-2 text-sm text-white/55">{[c.config?.finish, c.config?.gem, c.config?.engraving && `“${c.config.engraving}”`, c.config?.size].filter(Boolean).join(" · ")}</p>
              {c.quote && <p className="mt-4">Quote from our goldsmith: <span className="text-xl text-gold-light">{inr(Number(c.quote))}</span></p>}
              {c.admin_note && <p className="mt-2 font-serif italic text-white/60">“{c.admin_note}”</p>}
              {c.status === "quoted" && <QuoteActions id={c.id} />}
            </div>
          ))}
        </div>
      </section>

      <section id="wishlist" className="mt-16 scroll-mt-28">
        <h2 className="font-display text-sm tracking-[0.3em] text-gold">WISHLIST</h2>
        <Wishlist items={priced} />
      </section>
    </div>
  );
}
