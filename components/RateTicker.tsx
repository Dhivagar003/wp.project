import { inr, type Rates } from "@/lib/price";

export default function RateTicker({ rates }: { rates: Rates }) {
  const items = [`22K GOLD ${inr(rates["22K"])}/g`, `18K GOLD ${inr(rates["18K"])}/g`, `925 SILVER ${inr(rates["925"])}/g`, "BIS HALLMARKED", "FREE INSURED SHIPPING", "LIFETIME POLISH", "CUSTOM DESIGNS IN 3D"];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-gold/15 bg-black py-4">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-14 whitespace-nowrap text-[10px] tracking-[0.4em] text-gold-light/80">
        {row.map((t, i) => <span key={i} className="flex items-center gap-14">{t}<span className="text-gold">✦</span></span>)}
      </div>
      <style>{`@keyframes marquee{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
