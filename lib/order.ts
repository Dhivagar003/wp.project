import { getProducts, getRates } from "./catalog";
import { computePrice } from "./price";

export type OrderInput = { items?: { productId: string; qty: number; finish: string; size?: string }[]; address?: Record<string, string> };
const ADDR = ["name", "phone", "line1", "city", "state", "pincode"] as const;

// Validates the bag and prices it server-side; never trusts client totals. Returns an error string or the order parts.
export async function buildOrder(body: OrderInput | null) {
  if (!body?.items?.length || body.items.length > 20) return { error: "Your bag is empty." };
  if (body.items.some((i) => !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 10)) return { error: "Invalid quantity." };
  const address = Object.fromEntries([...ADDR, "contactTime", "note"].map((k) => [k, String(body.address?.[k] ?? "").trim().slice(0, 300)]));
  if (ADDR.some((k) => !address[k]) || !/^\d{6}$/.test(address.pincode)) return { error: "Please complete your delivery details." };

  const [products, rates] = await Promise.all([getProducts(), getRates()]);
  const lines = [];
  for (const i of body.items) {
    const p = products.find((x) => x.id === i.productId);
    if (!p) return { error: "A product in your bag is no longer available." };
    if (p.stock < i.qty) return { error: `Only ${p.stock} left of ${p.name}.` };
    const unit = computePrice(Number(p.weight_g), Number(p.making_pct), rates[p.purity]).total;
    lines.push({ productId: p.id, slug: p.slug, name: p.name, qty: i.qty, finish: i.finish, size: i.size ?? null, unit });
  }
  return { lines, address, total: lines.reduce((n, l) => n + l.unit * l.qty, 0) };
}
