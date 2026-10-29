import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOrder, getSession } from "@/lib/db";
import { inr } from "@/lib/price";
import StatusTimeline from "@/components/StatusTimeline";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) redirect(`/login?next=/order/${id}`);
  const o = await getOrder(id, user.id);
  if (!o) notFound();
  const booked = !o.razorpay_order_id;
  return (
    <div className="mx-auto max-w-2xl px-6 pb-24 pt-36 text-center">
      <p className="eyebrow">{booked ? "Booking" : "Order"} #{o.id.slice(0, 8).toUpperCase()}</p>
      <h1 className="mt-6 font-serif text-5xl">Thank you.</h1>
      <p className="mt-4 text-white/60">
        {booked
          ? `Your booking request (est. ${inr(Number(o.total))}) is received. Our goldsmith will call you on ${o.address.phone} to confirm price & pickup/delivery.`
          : `Your payment of ${inr(Number(o.total))} is confirmed. Our atelier is preparing your piece.`}
      </p>
      <div className="mt-12"><StatusTimeline status={o.status} booked={booked} /></div>
      <div className="mt-12 flex justify-center gap-4"><Link href="/account" className="btn-gold">My orders</Link><Link href="/shop" className="btn-ghost">Continue shopping</Link></div>
    </div>
  );
}
