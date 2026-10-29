"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useShop } from "@/lib/store";
import { inr } from "@/lib/price";
import { FINISH_LABEL } from "@/lib/finish";

declare global { interface Window { Razorpay: new (o: object) => { open: () => void; on: (e: string, cb: (r: { error: { description: string } }) => void) => void } } }

const FIELDS = [["name", "Full name", "name"], ["phone", "Phone", "tel"], ["line1", "Address", "street-address"], ["city", "City", "address-level2"], ["state", "State", "address-level1"], ["pincode", "PIN code", "postal-code"]] as const;

export default function Checkout({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const router = useRouter();
  const { cart, clear } = useShop();
  const [mounted, setMounted] = useState(false);
  const [addr, setAddr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { setMounted(true); try { setAddr(JSON.parse(localStorage.getItem("wp-addr") ?? "{}")); } catch {} }, []);
  const total = cart.reduce((n, c) => n + c.unitPrice * c.qty, 0);

  async function pay(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try { localStorage.setItem("wp-addr", JSON.stringify({ ...addr, note: "" })); } catch {}
    const res = await fetch(paymentsEnabled ? "/api/razorpay/order" : "/api/orders/book", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: cart.map((c) => ({ productId: c.productId, qty: c.qty, finish: c.finish, size: c.size })), address: addr }) });
    const data = await res.json();
    if (!res.ok) { setBusy(false); return setErr(data.error); }
    if (!paymentsEnabled) { clear(); router.push(`/order/${data.orderId}`); return; }
    const rzp = new window.Razorpay({
      key: data.key, order_id: data.razorpayOrderId, amount: data.amount, currency: "INR",
      name: "WP Ornaments", description: `${cart.length} piece(s)`, prefill: { name: addr.name, contact: addr.phone },
      theme: { color: "#c5a059" },
      modal: { ondismiss: () => setBusy(false) },
      handler: async (r: object) => {
        const v = await fetch("/api/razorpay/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(r) });
        const vd = await v.json();
        if (!v.ok) { setBusy(false); return setErr(vd.error); }
        clear();
        router.push(`/order/${vd.orderId}`);
      },
    });
    rzp.on("payment.failed", (r) => { setErr(r.error.description); setBusy(false); });
    rzp.open();
  }

  if (!mounted) return null;
  if (!cart.length) return (
    <div className="px-6 pb-24 pt-40 text-center"><h1 className="font-serif text-4xl">Your bag is empty</h1><Link href="/shop" className="btn-gold mt-8">Shop collections</Link></div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-24 pt-32 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
      {paymentsEnabled && <Script src="https://checkout.razorpay.com/v1/checkout.js" />}
      <form onSubmit={pay}>
        <p className="eyebrow">{paymentsEnabled ? "Secure Checkout" : "Book / Enquire"}</p>
        <h1 className="mt-4 font-serif text-4xl">{paymentsEnabled ? "Delivery details" : "Your contact details"}</h1>
        {!paymentsEnabled && <p className="mt-3 text-sm text-white/55">No payment now. Our goldsmith will call you to confirm today’s price, sizing and pickup or delivery.</p>}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {FIELDS.map(([k, l, ac]) => (
            <label key={k} className={k === "line1" ? "sm:col-span-2" : ""}>
              <span className="label">{l}</span>
              <input required autoComplete={ac} value={addr[k] ?? ""} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} pattern={k === "pincode" ? "\\d{6}" : undefined} className="field" />
            </label>
          ))}
          {!paymentsEnabled && (
            <>
              <label><span className="label">Best time to call</span><input value={addr.contactTime ?? ""} onChange={(e) => setAddr({ ...addr, contactTime: e.target.value })} placeholder="e.g. Weekdays after 6 pm" className="field" /></label>
              <label className="sm:col-span-2"><span className="label">Note (optional)</span><textarea rows={3} value={addr.note ?? ""} onChange={(e) => setAddr({ ...addr, note: e.target.value })} placeholder="Occasion, store pickup, old gold exchange…" className="field" /></label>
            </>
          )}
        </div>
        {err && <p role="alert" className="mt-6 text-sm text-red-400">{err}</p>}
        <button disabled={busy} className="btn-gold mt-10 w-full">{busy ? "Processing…" : paymentsEnabled ? `Pay ${inr(total)}` : "Place booking request"}</button>
        <p className="mt-4 text-center text-[11px] text-white/35">{paymentsEnabled ? "UPI · Cards · Netbanking · Wallets — secured by Razorpay. Final amount is confirmed at today’s metal rate." : "Estimated total shown; final price is confirmed at today’s metal rate when we call."}</p>
      </form>
      <aside className="card h-fit p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-sm tracking-[0.3em]">{paymentsEnabled ? "ORDER SUMMARY" : "BOOKING SUMMARY"}</h2>
        <ul className="mt-6 divide-y divide-white/5">
          {cart.map((c) => (
            <li key={c.key} className="flex justify-between gap-4 py-4 text-sm">
              <span><span className="font-serif text-base">{c.name}</span> × {c.qty}<span className="block text-[11px] text-white/40">{FINISH_LABEL[c.finish]}{c.size ? ` · ${c.size}` : ""}</span></span>
              <span>{inr(c.unitPrice * c.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4"><span>{paymentsEnabled ? "Total" : "Estimated total"}</span><span className="text-xl text-gold-light">{inr(total)}</span></div>
        <p className="mt-2 text-[11px] text-white/35">Free insured shipping · incl. GST</p>
      </aside>
    </div>
  );
}
