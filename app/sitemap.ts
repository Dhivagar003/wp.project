import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/shop", "/custom", "/about", "/contact", "/policies/shipping", "/policies/returns", "/policies/privacy", "/policies/terms"];
  const products = await getProducts();
  return [...pages.map((p) => ({ url: SITE.url + p })), ...products.map((p) => ({ url: `${SITE.url}/product/${p.slug}` }))];
}
