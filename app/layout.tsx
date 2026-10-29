import type { Metadata } from "next";
import { Playfair_Display, Cinzel, Poppins } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Intro from "@/components/Intro";
import SmoothScroll from "@/components/SmoothScroll";
import WhatsApp from "@/components/WhatsApp";
import { getSession, getSettings } from "@/lib/db";
import Scene from "@/components/three/Scene";
import { SITE } from "@/lib/site";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", style: ["normal", "italic"] });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", weight: ["200", "300", "400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  openGraph: { siteName: "WP Ornaments", type: "website", images: ["/brand/gold-card.jpg"] },
  title: "WP Ornaments | Goldsmith Atelier",
  description: "Hallmarked gold & silver jewellery, crafted by hand. Explore in 3D, shop online, or design your own bespoke piece.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ user, isAdmin }, { paymentsEnabled }] = await Promise.all([getSession(), getSettings()]);
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${cinzel.variable} ${poppins.variable} font-sans font-light antialiased`}>
        <Scene />
        <Intro />
        <SmoothScroll />
        <Nav signedIn={!!user} isAdmin={isAdmin} />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer paymentsEnabled={paymentsEnabled} />
        <WhatsApp />
        {/* developer watermark: faint, non-blocking, centred so it clears the WhatsApp button */}
        <a href="https://github.com/KArT4206" target="_blank" rel="noopener" aria-label="Developer: KArT4206 on GitHub"
          className="fixed bottom-3 left-1/2 z-30 -translate-x-1/2 select-none font-display text-[9px] tracking-[0.35em] text-white/25 transition hover:text-gold print:hidden">
          © KArT4206
        </a>
      </body>
    </html>
  );
}
