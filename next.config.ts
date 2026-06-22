import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pure static export — no server for v1. Vercel serves the prebuilt HTML from its CDN.
  // Revisit only when the Voice Engine demo v2 needs a serverless function (§6.5).
  output: "export",

  // With `output: 'export'` the on-demand Image Optimization API is disabled (§7).
  // One photo + one OG image don't justify a custom loader — ship unoptimized, hand-sized assets.
  images: { unoptimized: true },

  // Trailing slashes keep static hosting tidy (each route → its own index.html folder).
  trailingSlash: true,

  // Pin the Turbopack filesystem root to this project dir. Otherwise a lockfile in a parent dir
  // (e.g. when this checkout lives inside a git worktree under the main repo) makes Turbopack walk
  // up and warn about "multiple lockfiles". cwd is the project dir for `next dev`/`next build`.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
