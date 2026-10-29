import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSession, getSettings, insertOrder } from "@/lib/db";
import { buildOrder } from "@/lib/order";

export async function POST(req: Request) {
  if (!(await getSettings()).paymentsEnabled) return NextResponse.json({ error: "Online payments are turned off. Please place a booking instead." }, { status: 403 });
  if (!process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ error: "Payments are not configured yet (missing Razorpay keys)." }, { status: 503 });
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const o = await buildOrder(await req.json().catch(() => null));
  if ("error" in o) return NextResponse.json({ error: o.error }, { status: 400 });

  const rzp = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const rOrder = await rzp.orders.create({ amount: o.total * 100, currency: "INR", notes: { user: user.id } });
  const orderId = await insertOrder({ user_id: user.id, items: o.lines, address: o.address, total: o.total, status: "pending", razorpay_order_id: rOrder.id });
  return NextResponse.json({ orderId, razorpayOrderId: rOrder.id, amount: o.total * 100, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
}
