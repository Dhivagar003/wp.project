"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const T = [
  { text: "The precision of the gold work is unlike anything found in modern retail. It carries the weight of history.", name: "Traditionalist" },
  { text: "WP Ornaments transformed my legacy gold into a contemporary masterpiece while keeping the heritage intact.", name: "Heritage Client" },
  { text: "Finding a smith who knows metalworking very well and also has good design sense is hard to find.", name: "Private Collector" },
  { text: "I designed my engagement ring on the site, saw it in 3D, and the final piece was exactly what I imagined.", name: "Bespoke Client" },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % T.length), 6000); return () => clearInterval(t); }, []);
  return (
    <div className="relative min-h-[220px] text-center">
      <AnimatePresence mode="wait">
        <motion.blockquote key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6 }}>
          <p className="mx-auto max-w-3xl font-serif text-2xl italic leading-relaxed text-cream/90 sm:text-3xl">“{T[i].text}”</p>
          <footer className="mt-8 text-[10px] uppercase tracking-[0.5em] text-gold">— {T[i].name}</footer>
        </motion.blockquote>
      </AnimatePresence>
      <div className="mt-8 flex justify-center gap-2">
        {T.map((_, n) => <button key={n} onClick={() => setI(n)} aria-label={`Testimonial ${n + 1}`} className={`h-px w-8 transition ${n === i ? "bg-gold" : "bg-white/20"}`} />)}
      </div>
    </div>
  );
}
