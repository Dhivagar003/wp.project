import { NextResponse } from "next/server";
import { getSession, getSettings, insertOrder } from "@/lib/db";
import { buildOrder } from "@/lib/order";
import { notifyShop } from "@/lib/notify";
import { inr } from "@/lib/price";

// Booking / enquiry: no payment, the shop calls the customer to confirm.
export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if ((await getSettings()).paymentsEnabled) return NextResponse.json({ error: "Online payment is required right now. Please refresh." }, { status: 409 });
  const o = await buildOrder(await req.json().catch(() => null));
  if ("error" in o) return NextResponse.json({ error: o.error }, { status: 400 });
  const orderId = await insertOrder({ user_id: user.id, items: o.lines, address: o.address, total: o.total, status: "booked" });
  const a = o.address;
  await notifyShop(`New booking #${orderId.slice(0, 8).toUpperCase()} — ${a.name}`, {
    name: a.name, phone: a.phone, email: user.email, best_time_to_call: a.contactTime, note: a.note,
    items: o.lines.map((l) => `${l.name} × ${l.qty} (${l.finish}${l.size ? `, size ${l.size}` : ""})`).join("; "),
    estimated_total: inr(o.total), address: `${a.line1}, ${a.city}, ${a.state} ${a.pincode}`,
  });
  return NextResponse.json({ orderId });
}
