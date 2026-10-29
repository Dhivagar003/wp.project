import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets a production build run beside `next dev` without clobbering its cache
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
