"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hasSupabase, supabaseBrowser } from "@/lib/supabase/client";

export default function LoginForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const raw = sp.get("next") ?? "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account"; // no open redirects
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!hasSupabase) return <DemoLogin next={next} />;

  const sb = supabaseBrowser();
  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    setBusy(false);
    if (error) setMsg(error.message); else setSent(true);
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    const { error } = await sb.auth.verifyOtp({ email, token: code, type: "email" });
    setBusy(false);
    if (error) return setMsg(error.message);
    router.replace(next); router.refresh();
  };
  const google = () => sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });

  return (
    <div className="mx-auto max-w-md px-6 pb-24 pt-36">
      <p className="eyebrow text-center">Welcome</p>
      <h1 className="mt-4 text-center font-serif text-4xl">Sign in to continue</h1>
      <p className="mt-3 text-center text-sm text-white/50">Only needed to place orders and custom requests. No password — we email you a code.</p>
      <div className="card mt-10 space-y-6 p-8">
        <button onClick={google} className="btn-ghost w-full">Continue with Google</button>
        <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] text-white/30"><span className="h-px flex-1 bg-white/10" />OR<span className="h-px flex-1 bg-white/10" /></div>
        {!sent ? (
          <form onSubmit={sendCode} className="space-y-4">
            <label className="block"><span className="label">Email</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" /></label>
            <button disabled={busy} className="btn-gold w-full">{busy ? "Sending…" : "Email me a code"}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <p className="text-sm text-white/60">We sent a code to <span className="text-gold-light">{email}</span>. Enter it below, or click the link in the email.</p>
            <label className="block"><span className="label">Code</span><input inputMode="numeric" required value={code} onChange={(e) => setCode(e.target.value.trim())} className="field tracking-[0.5em]" autoComplete="one-time-code" /></label>
            <button disabled={busy} className="btn-gold w-full">{busy ? "Verifying…" : "Sign in"}</button>
            <button type="button" onClick={() => setSent(false)} className="w-full text-[10px] uppercase tracking-[0.3em] text-white/40">Use another email</button>
          </form>
        )}
        {msg && <p role="alert" className="text-sm text-red-400">{msg}</p>}
      </div>
    </div>
  );
}

// Local demo mode (no Supabase): email + password test accounts from DEMO_ACCOUNTS.md.
function DemoLogin({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    const res = await fetch("/api/demo/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    setBusy(false);
    if (!res.ok) return setMsg((await res.json().catch(() => ({}))).error ?? "Sign-in failed.");
    location.href = next; // full reload so the server layout picks up the session
  };
  return (
    <div className="mx-auto max-w-md px-6 pb-24 pt-36">
      <p className="eyebrow text-center">Welcome</p>
      <h1 className="mt-4 text-center font-serif text-4xl">Sign in to continue</h1>
      <p className="mt-3 text-center text-sm text-white/50">Only needed to book, order or send a custom design.</p>
      <form onSubmit={submit} className="card mt-10 space-y-5 p-8">
        <label className="block"><span className="label">Email</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="username" /></label>
        <label className="block"><span className="label">Password</span><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoComplete="current-password" /></label>
        <button disabled={busy} className="btn-gold w-full">{busy ? "Signing in…" : "Sign in"}</button>
        {msg && <p role="alert" className="text-sm text-red-400">{msg}</p>}
        <p className="text-[11px] text-white/35">Local test mode — accounts are listed in DEMO_ACCOUNTS.md in the project folder.</p>
      </form>
    </div>
  );
}
