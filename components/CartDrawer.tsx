"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/lib/store";
import { inr } from "@/lib/price";
import { FINISH_LABEL } from "@/lib/finish";

export default function CartDrawer({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const { cart, cartOpen, setCartOpen, setQty, remove } = useShop();
  const total = cart.reduce((n, c) => n + c.unitPrice * c.qty, 0);
  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} />
          <motion.aside role="dialog" aria-label="Shopping bag" className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col border-l border-gold/20 bg-coal" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 260 }}>
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="font-display tracking-[0.3em]">YOUR BAG</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close" className="text-2xl text-white/60 hover:text-gold">×</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6" data-lenis-prevent>
              {cart.length === 0 && (
                <div className="py-20 text-center text-white/40">
                  <p className="font-serif text-xl italic">Your bag is empty.</p>
                  <Link href="/shop" onClick={() => setCartOpen(false)} className="btn-ghost mt-8">Explore Collections</Link>
                </div>
              )}
              {cart.map((c) => (
                <div key={c.key} className="card flex gap-4 p-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center bg-gradient-to-br from-gold/30 to-transparent font-display text-gold">{c.name[0]}</div>
                  <div className="flex-1">
                    <Link href={`/product/${c.slug}`} onClick={() => setCartOpen(false)} className="font-serif text-lg leading-tight hover:text-gold">{c.name}</Link>
                    <p className="mt-1 text-[11px] text-white/40">{FINISH_LABEL[c.finish]}{c.size ? ` · Size ${c.size}` : ""}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-white/10">
                        <button className="px-3 py-1" onClick={() => setQty(c.key, c.qty - 1)} aria-label="Decrease">−</button>
                        <span className="w-6 text-center text-sm">{c.qty}</span>
                        <button className="px-3 py-1" onClick={() => setQty(c.key, c.qty + 1)} aria-label="Increase">+</button>
                      </div>
                      <span className="text-gold-light">{inr(c.unitPrice * c.qty)}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(c.key)} aria-label="Remove" className="self-start text-white/30 hover:text-red-400">×</button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-white/5 p-6">
                <div className="mb-1 flex justify-between text-sm"><span className="text-white/60">Estimated total</span><span className="text-xl text-gold-light">{inr(total)}</span></div>
                <p className="mb-5 text-[11px] text-white/35">{paymentsEnabled ? "Incl. 3% GST. Final price uses today’s metal rate. Free insured shipping." : "Incl. 3% GST. No payment now — book and we’ll call to confirm today’s price."}</p>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-gold w-full">{paymentsEnabled ? "Secure Checkout" : "Book / Enquire"}</Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
