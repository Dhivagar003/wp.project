"use client";
import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 pb-24 pt-44 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-6 font-serif text-4xl">We couldn’t load this page.</h1>
      <p className="mt-4 text-white/55">Please try again. If it keeps happening, message us on WhatsApp.</p>
      <div className="mt-10 flex justify-center gap-4"><button onClick={reset} className="btn-gold">Try again</button><Link href="/" className="btn-ghost">Home</Link></div>
    </div>
  );
}
