"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import LazyJewel from "@/components/three/LazyJewel";
import { CATEGORIES, FORM_OPTIONS, STONES, type Finish, type Metal, type ModelType, type StoneName } from "@/lib/types";
import { finishesFor, FINISH_LABEL, defaultFinish } from "@/lib/finish";
import { FINISH_COLOR } from "@/components/three/models";
import SizeGuide from "@/components/SizeGuide";

const DRAFT = "wp-custom-draft";

type Draft = { metal: Metal; category: string; model: ModelType; finish: Finish; gemName: StoneName | "None"; engraving: string; size: string; budget: string; notes: string; phone: string };
const blank: Draft = { metal: "gold", category: "", model: "ring", finish: "yellow", gemName: "Diamond", engraving: "", size: "", budget: "", notes: "", phone: "" };

// Drops any choice the selected form can't carry (e.g. a stone on a plain chain).
function fit(d: Draft): Draft {
  const o = FORM_OPTIONS[d.model] ?? FORM_OPTIONS.ring;
  return {
    ...d,
    finish: d.metal === "silver" ? "silver" : d.finish === "silver" ? "yellow" : d.finish,
    gemName: d.gemName !== "None" && o.stones.includes(d.gemName) ? d.gemName : "None",
    engraving: o.engraving ? d.engraving : "",
    size: o.sizes.includes(d.size) ? d.size : "",
  };
}
const gemColor = (n: Draft["gemName"]) => (n === "None" ? null : STONES[n]);

export default function Studio() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [d, setD] = useState<Draft>(blank);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneId, setDoneId] = useState("");
  const up = (p: Partial<Draft>) => setD((x) => fit({ ...x, ...p }));
  const [hover, setHover] = useState<ModelType | null>(null);
  const opts = FORM_OPTIONS[d.model];

  // Restore a design saved before the login redirect.
  useEffect(() => {
    try { const s = localStorage.getItem(DRAFT); if (s) { setD(fit({ ...blank, ...JSON.parse(s) })); setStep(3); } } catch {}
  }, []);

  const summary = `Custom ${d.metal} ${d.category} — ${FINISH_LABEL[d.finish]}${opts.stones.length ? `, stone: ${d.gemName}` : ""}${d.engraving ? `, engraving "${d.engraving}"` : ""}${d.size ? `, size ${d.size}` : ""}${d.budget ? `, budget ₹${d.budget}` : ""}. ${d.notes}`;

  async function submit() {
    setErr("");
    if (!d.phone.match(/^[+\d][\d\s-]{7,}$/)) return setErr("Please enter a valid phone number so our goldsmith can reach you.");
    if (files.some((f) => f.size > 8 * 1024 * 1024)) return setErr("Each reference image must be under 8 MB.");
    setBusy(true);
    const fd = new FormData();
    Object.entries({ metal: d.metal, category: d.category, phone: d.phone, budget: d.budget, notes: d.notes }).forEach(([k, v]) => fd.set(k, v));
    fd.set("config", JSON.stringify({ model: d.model, finish: d.finish, ...(opts.stones.length && { gem: d.gemName }), engraving: d.engraving, size: d.size }));
    files.forEach((f) => fd.append("refs", f));
    const res = await fetch("/api/custom", { method: "POST", body: fd });
    setBusy(false);
    if (res.status === 401) {
      try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch {}
      router.push("/login?next=/custom");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data.error ?? "Could not submit. Please try WhatsApp.");
    try { localStorage.removeItem(DRAFT); } catch {}
    setDoneId(data.id);
  }

  const pane = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: 0.45 } };

  if (doneId) return (
    <div className="mx-auto max-w-xl px-6 pb-24 pt-40 text-center">
      <p className="eyebrow">Request #{doneId.slice(0, 8).toUpperCase()}</p>
      <h1 className="mt-6 font-serif text-5xl">Your design is with our master smith.</h1>
      <p className="mt-6 text-white/60">You’ll receive a personal quote within 24 hours. Track it any time in your account.</p>
      <div className="mt-10 flex justify-center gap-4"><Link href="/account#custom" className="btn-gold">Track request</Link><Link href="/shop" className="btn-ghost">Keep browsing</Link></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-8">
      <p className="eyebrow">Bespoke Atelier</p>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Custom Design Studio</h1>
      <ol className="mt-8 flex gap-2 text-[10px] uppercase tracking-[0.3em]">
        {["Medium", "Form", "Design", "Details"].map((s, i) => (
          <li key={s} className={`flex-1 border-t-2 pt-3 ${step > i ? "border-gold text-gold" : "border-white/10 text-white/30"}`}>{`0${i + 1} ${s}`}</li>
        ))}
      </ol>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="card relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(197,160,89,.18),transparent_65%)] lg:sticky lg:top-28 lg:self-start">
          <LazyJewel type={hover ?? d.model} finish={d.finish} gem={hover && hover !== d.model ? null : gemColor(d.gemName)} controls sparkles className="h-full w-full" />
          {d.engraving && <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 font-serif text-lg italic text-gold-light/90">“{d.engraving}”</span>}
          <span className="absolute left-4 top-4 text-[9px] uppercase tracking-[0.3em] text-white/40">Live preview · drag to rotate</span>
        </div>

        <div className="min-h-[520px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" {...pane}>
                <h2 className="font-display tracking-[0.3em]">I. Select your medium</h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {(["gold", "silver"] as Metal[]).map((m) => (
                    <button key={m} onClick={() => { up({ metal: m, finish: defaultFinish(m) }); setStep(2); }} className={`card p-10 text-left transition hover:border-gold/50 ${d.metal === m ? "border-gold/60" : ""}`}>
                      <span className="font-display text-3xl tracking-[0.3em]">{m.toUpperCase()}</span>
                      <p className="mt-3 text-xs text-white/50">{m === "gold" ? "22K / 18K · yellow, rose or white" : "925 sterling silver"}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="2" {...pane}>
                <h2 className="font-display tracking-[0.3em]">II. {d.metal.toUpperCase()} — choose the form</h2>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {CATEGORIES.map((c) => (
                    <button key={c.name} onClick={() => { setHover(null); up({ category: c.name, model: c.model, gemName: d.gemName === "None" ? FORM_OPTIONS[c.model].stones[0] ?? "None" : d.gemName }); setStep(3); }} onMouseEnter={() => setHover(c.model)} onMouseLeave={() => setHover(null)}
                      className={`card px-5 py-6 text-left font-display text-xs tracking-[0.2em] transition hover:border-gold/50 hover:text-gold ${d.category === c.name ? "border-gold/60 text-gold" : ""}`}>{c.name}</button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="mt-8 text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-gold">← Back</button>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="3" {...pane} className="space-y-8">
                <h2 className="font-display tracking-[0.3em]">III. Design your {d.category}</h2>
                <div>
                  <span className="label">Finish — {FINISH_LABEL[d.finish]}</span>
                  <div className="flex gap-3">
                    {finishesFor(d.metal).map((f) => (
                      <button key={f} onClick={() => up({ finish: f })} aria-label={FINISH_LABEL[f]} aria-pressed={d.finish === f} className={`h-11 w-11 rounded-full border-2 ${d.finish === f ? "scale-110 border-gold" : "border-transparent"}`} style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${FINISH_COLOR[f]} 45%, #6b5323)` }} />
                    ))}
                  </div>
                </div>
                {opts.stones.length > 0 && (
                  <div>
                    <span className="label">Stone — {d.gemName}</span>
                    <div className="flex flex-wrap gap-2">
                      {(["None", ...opts.stones] as Draft["gemName"][]).map((n) => (
                        <button key={n} onClick={() => up({ gemName: n })} aria-pressed={d.gemName === n} className={`flex items-center gap-2 border px-3 py-2 text-xs ${d.gemName === n ? "border-gold bg-gold/10" : "border-white/10"}`}>
                          <span className={`h-3 w-3 ${n === "Pearl" ? "rounded-full" : "rotate-45"}`} style={{ background: gemColor(n) ?? "transparent", border: n === "None" ? "1px solid #666" : "none" }} />{n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {opts.engraving && (
                  <label className="block"><span className="label">Engraving (optional)</span><input maxLength={24} value={d.engraving} onChange={(e) => up({ engraving: e.target.value })} placeholder="e.g. Forever · 14.02.2027" className="field" /></label>
                )}
                {opts.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between"><span className="label">Size</span><SizeGuide /></div>
                    <div className="flex flex-wrap gap-2">
                      {opts.sizes.map((z) => <button key={z} onClick={() => up({ size: d.size === z ? "" : z })} aria-pressed={d.size === z} className={`min-w-12 border px-3 py-2 text-sm transition ${d.size === z ? "border-gold bg-gold/15 text-gold-light" : "border-white/10 text-white/60 hover:border-gold/40"}`}>{z}</button>)}
                    </div>
                    <p className="mt-2 text-[11px] text-white/35">Not sure? Leave it — we’ll help you size on the call.</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="btn-ghost">Back</button>
                  <button onClick={() => setStep(4)} className="btn-gold flex-1">Continue</button>
                </div>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="4" {...pane} className="space-y-6">
                <h2 className="font-display tracking-[0.3em]">IV. Inspiration & details</h2>
                <label className="block">
                  <span className="label">Reference images (up to 5)</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))} className="field file:mr-4 file:border-0 file:bg-gold file:px-4 file:py-1 file:text-xs file:text-ink" />
                  {files.length > 0 && <span className="mt-2 block text-xs text-white/40">{files.map((f) => f.name).join(", ")}</span>}
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className="label">Budget (₹)</span><input inputMode="numeric" value={d.budget} onChange={(e) => up({ budget: e.target.value.replace(/\D/g, "") })} placeholder="50000" className="field" /></label>
                  <label className="block"><span className="label">Phone *</span><input type="tel" value={d.phone} onChange={(e) => up({ phone: e.target.value })} placeholder="+91 98xxxxxxx" className="field" /></label>
                </div>
                <label className="block"><span className="label">Notes for the goldsmith</span><textarea rows={4} value={d.notes} onChange={(e) => up({ notes: e.target.value })} placeholder="Occasion, deadline, style references, old gold to exchange…" className="field" /></label>
                <div className="card p-4 text-xs leading-relaxed text-white/55">{summary}</div>
                {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
                <div className="flex gap-4">
                  <button onClick={() => setStep(3)} className="btn-ghost">Back</button>
                  <button onClick={submit} disabled={busy} className="btn-gold flex-1">{busy ? "Transmitting…" : "Request my quote"}</button>
                </div>
                <p className="text-[11px] text-white/35">You’ll be asked to sign in to submit — your design is saved. No payment needed until you approve the quote.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
