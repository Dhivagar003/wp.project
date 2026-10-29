import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 pb-24 pt-44 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-6 font-serif text-5xl">This piece has left the vault.</h1>
      <p className="mt-4 text-white/55">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-10 flex justify-center gap-4"><Link href="/shop" className="btn-gold">Browse collections</Link><Link href="/" className="btn-ghost">Home</Link></div>
    </div>
  );
}
