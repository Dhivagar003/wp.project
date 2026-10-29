// Shared by UI and server routes; server always recomputes, never trusts client totals.
export type Purity = "22K" | "18K" | "925";
export type Rates = Record<Purity, number>; // ₹ per gram

export const GST_PCT = 3;

export function computePrice(weight_g: number, making_pct: number, rate: number) {
  const metal = Math.round(weight_g * rate);
  const making = Math.round((metal * making_pct) / 100);
  const gst = Math.round(((metal + making) * GST_PCT) / 100);
  return { metal, making, gst, total: metal + making + gst };
}

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
