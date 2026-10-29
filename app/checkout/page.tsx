import { getSettings } from "@/lib/db";
import Checkout from "./Checkout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout | WP Ornaments" };

export default async function Page() {
  return <Checkout paymentsEnabled={(await getSettings()).paymentsEnabled} />;
}
