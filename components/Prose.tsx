import type { ReactNode } from "react";

export default function Prose({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-36">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">{title}</h1>
      <div className="mt-10 space-y-5 leading-relaxed text-white/65 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-sm [&_h2]:tracking-[0.25em] [&_h2]:text-gold [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </div>
  );
}
