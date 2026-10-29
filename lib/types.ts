import type { Purity } from "./price";

export type Metal = "gold" | "silver";
export type ModelType = "ring" | "bangle" | "chain" | "bracelet" | "pendant" | "earring" | "necklace" | "mangalsutra";
export type Finish = "yellow" | "rose" | "white" | "silver";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  metal: Metal;
  purity: Purity;
  category: string;
  weight_g: number;
  making_pct: number;
  images: string[];
  model_type: ModelType;
  gem: string | null; // hex colour of the stone, null = plain metal
  glb_url: string | null;
  stock: number;
  featured: boolean;
};

export const CATEGORIES: { name: string; model: ModelType }[] = [
  { name: "Imperial Earrings", model: "earring" },
  { name: "Signature Rings", model: "ring" },
  { name: "Heirloom Bangles", model: "bangle" },
  { name: "Solid Chains", model: "chain" },
  { name: "Artisan Bracelets", model: "bracelet" },
  { name: "Grand Necklaces", model: "necklace" },
  { name: "Pendants", model: "pendant" },
  { name: "Mangalsutra/Thaali", model: "mangalsutra" },
];

export const ORDER_STATUSES = ["booked", "confirmed", "pending", "paid", "crafting", "ready", "shipped", "delivered", "cancelled"] as const;
export const CUSTOM_STATUSES = ["submitted", "quoted", "accepted", "crafting", "ready", "delivered", "declined"] as const;

// Stones the 3D models and the atelier support, by name → render colour.
export const STONES = { Diamond: "#f4f8ff", Ruby: "#c0123a", Emerald: "#0f8a4f", Sapphire: "#1f4fd1", Pearl: "#f3efe6" } as const;
export type StoneName = keyof typeof STONES;
export const stoneName = (hex: string | null) => (Object.entries(STONES).find(([, c]) => c === hex)?.[0] as StoneName | undefined) ?? null;

// What each form can actually carry, so the UI never offers an option the piece (or model) can't show.
export const FORM_OPTIONS: Record<ModelType, { stones: StoneName[]; engraving: boolean; sizes: string[] }> = {
  ring: { stones: ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl"], engraving: true, sizes: ["8", "10", "12", "14", "16", "18", "20", "22"] },
  bangle: { stones: ["Diamond", "Ruby", "Emerald", "Sapphire"], engraving: true, sizes: ["2.2", "2.4", "2.6", "2.8"] },
  bracelet: { stones: [], engraving: true, sizes: ['6.5"', '7"', '7.5"'] },
  chain: { stones: [], engraving: false, sizes: ['16"', '18"', '20"', '22"'] },
  pendant: { stones: ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl"], engraving: true, sizes: [] },
  earring: { stones: ["Diamond", "Ruby", "Emerald", "Pearl"], engraving: false, sizes: [] },
  necklace: { stones: ["Ruby", "Emerald", "Diamond"], engraving: false, sizes: [] },
  mangalsutra: { stones: [], engraving: false, sizes: ['18"', '20"', '22"', '24"'] },
};
