export const SITE = {
  name: "WP Ornaments",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  since: 1987,
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "919842229987",
  phone: "+91 98422 29987",
  email: "wpgoldsmith1987@gmail.com",
  instagram: "wp.smithcraft",
  // TODO(owner): replace with the real showroom address and hours.
  address: "WP Ornaments Showroom, Main Bazaar Street, Tamil Nadu, India",
  hours: "Mon–Sat 10:00 am – 8:30 pm · Sunday by appointment",
  mapUrl: "https://maps.google.com/?q=WP+Ornaments",
};
export const waLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
// Indian 10-digit numbers get the 91 country code.
export const waTo = (phone: string, text: string) =>
  `https://wa.me/${String(phone).replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}?text=${encodeURIComponent(text)}`;
