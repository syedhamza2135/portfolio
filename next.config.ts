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
};

export default nextConfig;
