"use client";
import { useState } from "react";

// Indian ring sizes → inner diameter (mm); bangle sizes → inner diameter.
const RINGS: [string, number][] = [["8", 15.3], ["10", 16.0], ["12", 16.5], ["14", 17.2], ["16", 17.8], ["18", 18.5], ["20", 19.1], ["22", 19.8]];
const BANGLES: [string, number][] = [["2.2", 54], ["2.4", 57], ["2.6", 60], ["2.8", 64]];

export default function SizeGuide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-[10px] uppercase tracking-[0.25em] text-gold underline-offset-4 hover:underline">Size guide</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Size guide" className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="card max-h-[85vh] w-full max-w-lg overflow-y-auto bg-coal p-6" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display tracking-[0.3em]">SIZE GUIDE</h2><button onClick={() => setOpen(false)} aria-label="Close" className="text-2xl text-white/60 hover:text-gold">×</button></div>
            <p className="mt-4 text-sm text-white/60">Measure the inner diameter of a ring or bangle that fits you well, and match it below. Between sizes? Choose the larger one. Free resizing within 30 days.</p>
            {[["Rings (Indian size)", RINGS], ["Bangles", BANGLES]].map(([t, rows]) => (
              <table key={t as string} className="mt-6 w-full text-sm">
                <caption className="mb-2 text-left text-[10px] uppercase tracking-[0.3em] text-gold">{t as string}</caption>
                <thead><tr className="text-white/40"><th className="py-1 text-left font-normal">Size</th><th className="py-1 text-right font-normal">Inner diameter</th></tr></thead>
                <tbody>{(rows as [string, number][]).map(([s, d]) => <tr key={s} className="border-t border-white/5"><td className="py-2">{s}</td><td className="py-2 text-right">{d} mm</td></tr>)}</tbody>
              </table>
            ))}
            <p className="mt-6 text-[11px] text-white/40">Not sure? Tick “need help with size” in your booking note and we’ll guide you on the call, or visit the showroom for a free sizing.</p>
          </div>
        </div>
      )}
    </>
  );
}
