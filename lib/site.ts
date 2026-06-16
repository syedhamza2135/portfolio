// Single source of truth for site-wide constants.
// Items marked TODO map to PRD §3 (Trust Architecture) / §9 (Open Items) and must be
// confirmed before launch. Env vars (NEXT_PUBLIC_*) are inlined at build time.

export const NAME = "Syed Hamza";

// Custom domain (PRD T5). Drives metadataBase, canonical, OG absolute URL, sitemap, JSON-LD.
// NEXT_PUBLIC_SITE_URL can still override (e.g. for a preview environment).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://syedhamza.xyz";

// Booking link (30-min intro call). NEXT_PUBLIC_CALENDLY_URL overrides if needed.
export const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/syedhamza2135/30min";

// Footer "fire exit" mailto (§5 Footer). Swap for a domain address once the domain is live.
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "syedhamza2135@gmail.com";

// WhatsApp contact. Set the number in international format — digits only, no "+" or spaces
// (e.g. 923001234567). Empty string = the WhatsApp option stays hidden until a number is set.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923437877462";
export const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Syed — saw your portfolio.")}`
  : "";

export const TAGLINE =
  "I build content systems for agencies — strategy, automation, and the engineering to make it scale.";

// Nav section index (the mono "01 — " numbering is visual; headings carry real hierarchy).
export const SECTIONS = [
  { id: "problem", num: "01", label: "problem" },
  { id: "system", num: "02", label: "system" },
  { id: "services", num: "03", label: "services" },
  { id: "proof", num: "04", label: "proof" },
  { id: "about", num: "05", label: "about" },
] as const;
