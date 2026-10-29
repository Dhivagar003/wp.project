"use client";
import { useState } from "react";
import { inr, type Rates } from "@/lib/price";

// Old-gold exchange: net weight × purity rate, less a small testing/melting deduction.
const DEDUCT_PCT = 2;

export default function ExchangeEstimator({ rates }: { rates: Rates }) {
  const [w, setW] = useState("");
  const [p, setP] = useState<"22K" | "18K">("22K");
  const value = Math.round((Number(w) || 0) * rates[p] * (1 - DEDUCT_PCT / 100));
  return (
    <details className="card group mt-6 p-5">
      <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.3em] text-gold">Exchange your old gold ▾</summary>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex-1"><span className="label">Net weight (g)</span><input inputMode="decimal" value={w} onChange={(e) => setW(e.target.value.replace(/[^\d.]/g, ""))} placeholder="10" className="field" /></label>
        <label><span className="label">Purity</span><select value={p} onChange={(e) => setP(e.target.value as "22K" | "18K")} className="field w-auto">{["22K", "18K"].map((x) => <option key={x} className="bg-coal">{x}</option>)}</select></label>
      </div>
      <p className="mt-4 text-sm">Estimated value: <span className="text-lg text-gold-light">{inr(value)}</span></p>
      <p className="mt-1 text-[11px] text-white/40">At today’s rate, less {DEDUCT_PCT}% testing. Final value is set after a purity test at our showroom. Mention “old gold exchange” in your booking note.</p>
    </details>
  );
}
