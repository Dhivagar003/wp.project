import { NextResponse } from "next/server";
import { getSession, markOrderPaid } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay-verify";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!verifyRazorpaySignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature, process.env.RAZORPAY_KEY_SECRET!))
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  const order = await markOrderPaid(b.razorpay_order_id, user.id, b.razorpay_payment_id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ orderId: order.id });
}
