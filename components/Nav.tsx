"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useShop } from "@/lib/store";

const LINKS = [
  ["/shop", "Collections"],
  ["/shop?metal=gold", "Gold"],
  ["/shop?metal=silver", "Silver"],
  ["/custom", "Custom Design"],
  ["/#atelier", "Atelier"],
] as const;

export default function Nav({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();
  const count = useShop((s) => s.cart.reduce((n, c) => n + c.qty, 0));
  const wish = useShop((s) => s.wishlist.length);
  const setCartOpen = useShop((s) => s.setCartOpen);

  useEffect(() => {
    setMounted(true);
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled || open ? "border-b border-white/5 bg-black/70 backdrop-blur-xl" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/brand/logoxx.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" priority />
          <span className="whitespace-nowrap font-display text-lg tracking-[0.3em] text-cream">WP<span className="hidden text-gold sm:inline"> ORNAMENTS</span></span>
        </Link>
        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map(([href, label]) => (
            <li key={href}><Link href={href} className="text-[11px] uppercase tracking-[0.3em] text-cream/70 transition hover:text-gold">{label}</Link></li>
          ))}
        </ul>
        <div className="flex items-center gap-1 sm:gap-3">
          {isAdmin && <Link href="/admin" className="hidden border border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold sm:block">Admin</Link>}
          <Link href={signedIn ? "/account" : "/login"} aria-label={signedIn ? "My account" : "Sign in"} className="p-2 text-cream/80 hover:text-gold">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
          </Link>
          <Link href="/account#wishlist" aria-label="Wishlist" className="relative p-2 text-cream/80 hover:text-gold">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
            {mounted && wish > 0 && <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] text-ink">{wish}</span>}
          </Link>
          <button onClick={() => setCartOpen(true)} aria-label="Open cart" className="relative p-2 text-cream/80 hover:text-gold">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12H6.2L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {mounted && count > 0 && <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] text-ink">{count}</span>}
          </button>
          <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open} className="p-2 text-cream lg:hidden">
            <div className="space-y-1.5"><span className={`block h-px w-6 bg-current transition ${open ? "translate-y-[7px] rotate-45" : ""}`} /><span className={`block h-px w-6 bg-current transition ${open ? "opacity-0" : ""}`} /><span className={`block h-px w-6 bg-current transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} /></div>
          </button>
        </div>
      </nav>
      {open && (
        <ul className="space-y-1 border-t border-white/5 px-6 pb-6 pt-2 lg:hidden">
          {LINKS.map(([href, label]) => (
            <li key={href}><Link href={href} className="block py-3 font-display text-sm tracking-[0.3em] text-cream">{label}</Link></li>
          ))}
          {isAdmin && <li><Link href="/admin" className="block py-3 font-display text-sm tracking-[0.3em] text-gold">Admin</Link></li>}
        </ul>
      )}
    </header>
  );
}
