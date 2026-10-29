import Link from "next/link";
import { SITE, waLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative border-t border-gold/20 bg-black px-6 pb-10 pt-24">
      <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="font-display text-3xl tracking-[0.25em] text-cream">WP ORNAMENTS</div>
          <p className="mt-5 max-w-sm font-serif text-lg italic text-white/50">Mastering the craft since {SITE.since}. Pure gold. Hand-forged. Truly yours.</p>
        </div>
        {[
          ["Shop", [["/shop?metal=gold", "Gold"], ["/shop?metal=silver", "Silver"], ["/shop", "All Collections"], ["/custom", "Custom Design"], ["/account", "My Orders"]]],
          ["Help", [["/about", "About Us"], ["/contact", "Contact & Visit"], ["/policies/shipping", "Shipping"], ["/policies/returns", "Returns & Exchange"], ["/policies/privacy", "Privacy"], ["/policies/terms", "Terms"]]],
          ["Connect", [[waLink("Hello WP Ornaments"), "WhatsApp"], [`mailto:${SITE.email}`, SITE.email], [`https://instagram.com/${SITE.instagram}`, `@${SITE.instagram}`]]],
        ].map(([title, links]) => (
          <div key={title as string}>
            <h5 className="mb-6 font-display text-xs tracking-[0.3em] text-gold">{title as string}</h5>
            <ul className="space-y-3">
              {(links as string[][]).map(([href, label]) => (
                <li key={label}><Link href={href} className="break-all text-xs tracking-wider text-white/50 transition hover:text-gold">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-20 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/5 pt-8 text-[10px] tracking-[0.3em] text-white/30 sm:flex-row">
        <span>© {new Date().getFullYear()} WP ORNAMENTS · BIS HALLMARKED</span>
        <a href="https://github.com/KArT4206" target="_blank" rel="noopener" className="transition hover:text-gold">DESIGNED &amp; DEVELOPED BY KArT4206</a>
      </div>
    </footer>
  );
}
