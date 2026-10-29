import { cache } from "react";
import { hasSupabase, supabaseServer } from "./supabase/server";
import { DEMO_RATES } from "./demo";
import { readDB } from "./demo-store";
import type { Product } from "./types";
import type { Rates } from "./price";

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!hasSupabase) return readDB().products;
  const sb = await supabaseServer();
  const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
});

export const getProduct = async (slug: string) => (await getProducts()).find((p) => p.slug === slug) ?? null;

export const getRates = cache(async (): Promise<Rates> => {
  if (!hasSupabase) return readDB().rates;
  const sb = await supabaseServer();
  const { data } = await sb.from("rates").select("purity, per_gram");
  return { ...DEMO_RATES, ...Object.fromEntries((data ?? []).map((r) => [r.purity, Number(r.per_gram)])) };
});
