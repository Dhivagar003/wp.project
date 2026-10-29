"use client";
import dynamic from "next/dynamic";
import type { JewelProps } from "./JewelView";

const JewelView = dynamic(() => import("./JewelView"), { ssr: false });

// The soft gold glow behind every slot doubles as the placeholder before the first frame.
export default function LazyJewel({ className = "", ...props }: JewelProps) {
  return (
    <div className={`${className.includes("absolute") ? "" : "relative "}${className}`}>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(236,208,143,.16),transparent_62%)]" />
      <JewelView {...props} className="absolute inset-0" />
    </div>
  );
}
