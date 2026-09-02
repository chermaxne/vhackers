import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray package-lock.json one level up
  // (from an unrelated sibling project) otherwise makes Turbopack guess wrong.
  turbopack: {
    root: path.join(__dirname),
  },
  // pdf-parse ships its own worker file (pdf.worker.mjs) that the bundler
  // needs to leave alone rather than trying to trace/inline — see
  // app/api/resume/parse/route.ts.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
