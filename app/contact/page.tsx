import Prose from "@/components/Prose";
import { SITE, waLink } from "@/lib/site";

export const metadata = { title: "Contact | WP Ornaments", description: "Visit our showroom, call, WhatsApp or email WP Ornaments." };

export default function Contact() {
  const rows = [
    ["Showroom", SITE.address, SITE.mapUrl, "Open in Maps"],
    ["Hours", SITE.hours],
    ["Phone", SITE.phone, `tel:${SITE.phone.replace(/\s/g, "")}`, "Call now"],
    ["WhatsApp", SITE.phone, waLink("Hello WP Ornaments, I have a question."), "Chat"],
    ["Email", SITE.email, `mailto:${SITE.email}`, "Write to us"],
    ["Instagram", `@${SITE.instagram}`, `https://instagram.com/${SITE.instagram}`, "Follow"],
  ];
  return (
    <Prose eyebrow="We’d love to hear from you" title="Contact & Visit">
      <p>Book a showroom visit or a live video viewing of any piece. For custom designs, the <a href="/custom" className="text-gold">design studio</a> is the fastest way to get a quote.</p>
      <dl className="card divide-y divide-white/5">
        {rows.map(([k, v, href, cta]) => (
          <div key={k} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
            <dt className="w-28 text-[10px] uppercase tracking-[0.3em] text-gold/80">{k}</dt>
            <dd className="flex-1 text-cream/90">{v}</dd>
            {href && <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="text-[10px] uppercase tracking-[0.25em] text-gold hover:text-gold-light">{cta} →</a>}
          </div>
        ))}
      </dl>
    </Prose>
  );
}
