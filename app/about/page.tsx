import Image from "next/image";
import Link from "next/link";
import Prose from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata = { title: "About | WP Ornaments", description: `Goldsmiths since ${SITE.since}. The story of the WP atelier.` };

export default function About() {
  return (
    <Prose eyebrow={`Since ${SITE.since}`} title="The WP Atelier">
      <div className="relative aspect-[16/9] overflow-hidden border border-white/10"><Image src="/brand/the-alchemical-process.jpeg" alt="Goldsmith at the forge" fill className="object-cover" sizes="768px" /></div>
      <p>WP Ornaments began in {SITE.since} as a single goldsmith’s bench. Nearly four decades later we still melt, refine and alloy our own gold in-house, and every piece is finished by hand.</p>
      <h2>What we stand for</h2>
      <ul>
        <li>BIS-hallmarked 22K and 18K gold and 925 sterling silver, with HUID on every hallmarked piece.</li>
        <li>Transparent pricing: today’s metal rate × weight, a clearly stated making charge, and GST — nothing hidden.</li>
        <li>Bespoke work: bring a sketch, a photo or an heirloom and we will design it with you.</li>
        <li>Lifetime care: free cleaning and polishing, and fair exchange value on our jewellery.</li>
      </ul>
      <p><Link href="/custom" className="text-gold">Start a custom design →</Link></p>
    </Prose>
  );
}
