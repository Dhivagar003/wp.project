// Demo catalogue: used when Supabase isn't configured, and as the source of supabase/seed.sql.
import type { Product, ModelType, Metal } from "./types.ts";
import type { Purity, Rates } from "./price.ts";

export const DEMO_RATES: Rates = { "22K": 9450, "18K": 7730, "925": 118 };

type Row = [name: string, metal: Metal, purity: Purity, category: string, model: ModelType, weight: number, making: number, gem: string | null, featured?: boolean];

const rows: Row[] = [
  ["Aurelia Solitaire Ring", "gold", "18K", "Signature Rings", "ring", 4.2, 14, "#f4f8ff", true],
  ["Maharani Ruby Band", "gold", "22K", "Signature Rings", "ring", 5.8, 12, "#c0123a"],
  ["Moonlit Silver Ring", "silver", "925", "Signature Rings", "ring", 6, 30, "#1f4fd1"],
  ["Emerald Crown Ring", "gold", "22K", "Signature Rings", "ring", 6.5, 13, "#0f8a4f"],
  ["Temple Jhumka", "gold", "22K", "Imperial Earrings", "earring", 9.4, 15, null, true],
  ["Pearl Drop Jhumka", "silver", "925", "Imperial Earrings", "earring", 12, 28, "#f3efe6"],
  ["Kundan Bloom Earrings", "gold", "22K", "Imperial Earrings", "earring", 7.1, 16, "#c0123a"],
  ["Royal Kada", "gold", "22K", "Heirloom Bangles", "bangle", 24, 11, null, true],
  ["Navratna Bangle", "gold", "22K", "Heirloom Bangles", "bangle", 18.5, 14, "#1f4fd1"],
  ["Silver Heritage Kada", "silver", "925", "Heirloom Bangles", "bangle", 40, 22, null],
  ["Rope Link Chain", "gold", "22K", "Solid Chains", "chain", 16, 9, null],
  ["Cuban Silver Chain", "silver", "925", "Solid Chains", "chain", 55, 18, null, true],
  ["Delicate Box Bracelet", "gold", "18K", "Artisan Bracelets", "bracelet", 6.2, 13, null],
  ["Silver Charm Bracelet", "silver", "925", "Artisan Bracelets", "bracelet", 14, 25, null],
  ["Lakshmi Haar Necklace", "gold", "22K", "Grand Necklaces", "necklace", 42, 13, "#c0123a", true],
  ["Antique Silver Choker", "silver", "925", "Grand Necklaces", "necklace", 65, 24, "#0f8a4f"],
  ["Diamond Tear Pendant", "gold", "18K", "Pendants", "pendant", 3.6, 15, "#f4f8ff", true],
  ["Om Silver Pendant", "silver", "925", "Pendants", "pendant", 8, 26, null],
  ["Classic Mangalsutra", "gold", "22K", "Mangalsutra/Thaali", "mangalsutra", 11, 12, null, true],
  ["Thaali Kodi", "gold", "22K", "Mangalsutra/Thaali", "mangalsutra", 21, 10, null],
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const DEMO_PRODUCTS: Product[] = rows.map(([name, metal, purity, category, model_type, weight_g, making_pct, gem, featured], i) => ({
  id: `demo-${i + 1}`,
  slug: slugify(name),
  name,
  description: `Hand-finished ${purity === "925" ? "925 sterling silver" : purity + " hallmarked gold"} ${category.toLowerCase().replace(/s$/, "")}, crafted in the WP atelier. Every piece is BIS hallmarked and can be resized or personalised on request.`,
  metal,
  purity,
  category,
  weight_g,
  making_pct,
  images: [],
  model_type,
  gem,
  glb_url: null,
  stock: 5,
  featured: !!featured,
}));
