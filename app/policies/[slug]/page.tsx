import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Prose from "@/components/Prose";
import { SITE } from "@/lib/site";

// Template policies for a hallmarked-jewellery business; the owner should review them before launch.
const POLICIES: Record<string, { title: string; body: ReactNode }> = {
  shipping: {
    title: "Shipping & Delivery",
    body: (<>
      <p>All orders ship fully insured within India, free of charge, in tamper-evident packaging. Ready pieces dispatch within 2–4 working days; made-to-order and custom pieces within the timeline in your quote.</p>
      <h2>Tracking & handover</h2>
      <p>You will receive a tracking link by SMS/WhatsApp. An OTP or signature is required at delivery. Please record a video while opening the parcel. If the seal is broken, refuse the delivery and contact us at once.</p>
      <h2>Store pickup</h2>
      <p>You can choose to collect your piece from our showroom ({SITE.address}) with a valid photo ID.</p>
    </>),
  },
  returns: {
    title: "Returns, Exchange & Buyback",
    body: (<>
      <h2>15-day return</h2>
      <p>Unworn ready pieces in original condition and packaging, with the invoice and hallmark certificate, can be returned within 15 days of delivery for a full refund of the amount paid. Customised, engraved or resized pieces cannot be returned.</p>
      <h2>Lifetime exchange</h2>
      <p>WP gold jewellery can be exchanged at any time at the prevailing gold rate for its net weight and purity. Making charges and stones are not refunded.</p>
      <h2>Buyback</h2>
      <p>We buy back our gold jewellery at the prevailing rate less a small deduction, paid by bank transfer after testing.</p>
      <h2>Refunds</h2>
      <p>Approved refunds are processed to the original payment method within 7 working days.</p>
    </>),
  },
  privacy: {
    title: "Privacy Policy",
    body: (<>
      <p>We collect only what we need to serve you: your name, contact details, delivery address, order history and any reference images you upload for custom designs.</p>
      <h2>How we use it</h2>
      <ul><li>To process bookings, orders, payments and deliveries.</li><li>To contact you about your order or quote.</li><li>To meet legal and tax obligations (e.g. GST invoices, KYC for high-value purchases).</li></ul>
      <h2>Sharing</h2>
      <p>We never sell your data. It is shared only with our payment processor (Razorpay), courier partners, and hosting providers, and only as needed to fulfil your order.</p>
      <h2>Your rights</h2>
      <p>You can request a copy of your data or ask us to delete your account by emailing {SITE.email}.</p>
    </>),
  },
  terms: {
    title: "Terms & Conditions",
    body: (<>
      <p>By using this website you agree to these terms. {SITE.name} is a jewellery retailer operating from {SITE.address}.</p>
      <h2>Pricing</h2>
      <p>Prices are calculated from the live metal rate, net weight, a stated making charge and 3% GST. Metal rates change daily; the price confirmed at payment (or on our confirmation call for bookings) is final. Weights may vary by ±3% for handmade pieces, and the price is adjusted to the actual weight.</p>
      <h2>Bookings</h2>
      <p>A booking request reserves nothing until we confirm it by phone. We may ask for an advance for made-to-order and custom pieces.</p>
      <h2>Custom designs</h2>
      <p>3D previews are illustrative. The final piece follows the approved quote and may differ slightly due to the nature of handwork.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, and disputes fall under the jurisdiction of the courts of Tamil Nadu.</p>
    </>),
  },
};

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(POLICIES).map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = POLICIES[(await params).slug];
  return { title: p ? `${p.title} | WP Ornaments` : "Not found" };
}

export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const p = POLICIES[(await params).slug];
  if (!p) notFound();
  return <Prose eyebrow="Policies" title={p.title}>{p.body}</Prose>;
}
