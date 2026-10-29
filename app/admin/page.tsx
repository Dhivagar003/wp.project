import { notFound } from "next/navigation";
import { getSession, getSettings, listOrders, listCustoms, refUrls } from "@/lib/db";
import { getProducts, getRates } from "@/lib/catalog";
import AdminDashboard from "./AdminDashboard";

export const metadata = { title: "Admin | WP Ornaments" };
export const dynamic = "force-dynamic";

export default async function Admin() {
  if (!(await getSession()).isAdmin) notFound();
  const [products, rates, settings, orders, customs] = await Promise.all([getProducts(), getRates(), getSettings(), listOrders(), listCustoms()]);
  // Reference images live in a private bucket; hand the admin short-lived links.
  const urls = await refUrls(customs.flatMap((c) => c.refs as string[]));
  return <AdminDashboard products={products} rates={rates} settings={settings} orders={orders} customs={customs} refUrls={urls} />;
}
