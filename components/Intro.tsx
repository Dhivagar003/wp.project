"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Brand loader from the original index.html; plays once per browser session.
export default function Intro() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem("wp-intro")) return; sessionStorage.setItem("wp-intro", "1"); } catch {}
    setShow(true);
    const t = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black" exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }} onClick={() => setShow(false)}>
          <motion.svg width="90" height="90" viewBox="0 0 100 100" className="mb-10">
            <motion.circle cx="50" cy="50" r="36" fill="none" stroke="#c5a059" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: "easeInOut" }} />
            <motion.path d="M50 6 L58 18 L50 24 L42 18 Z" fill="#f6dfa1" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} />
          </motion.svg>
          <div className="text-gold-shine font-serif text-4xl uppercase tracking-[0.4em] sm:text-6xl">WP Ornaments</div>
          <div className="mt-10 h-px w-72 bg-white/5">
            <motion.div className="h-full bg-gold shadow-[0_0_20px_#c5a059]" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.3, ease: [0.65, 0, 0.35, 1] }} />
          </div>
          <div className="mt-4 animate-pulse text-[10px] uppercase tracking-[0.5em] text-gold/60">Synchronizing Heritage</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
