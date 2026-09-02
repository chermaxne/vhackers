import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray package-lock.json one level up
  // (from an unrelated sibling project) otherwise makes Turbopack guess wrong.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
