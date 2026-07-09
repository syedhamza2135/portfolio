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

// Contact email shown in the footer + CTA (§5). Domain mailbox on syedhamza.xyz.
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hi@syedhamza.xyz";

// WhatsApp contact. Set the number in international format — digits only, no "+" or spaces
// (e.g. 923001234567). Empty string = the WhatsApp option stays hidden until a number is set.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923437877462";
export const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Syed, saw your portfolio.")}`
  : "";

export const TAGLINE =
  "I build content systems for scale: strategy, automation and the engineering to run them.";

// Public profiles. Single source of truth for BOTH the visible footer/About links and the
// JSON-LD Person `sameAs` (app/page.tsx maps this to href), so the two can never drift.
// Order here is the render order. `icon` is a brand glyph path on a 0 0 24 24 viewBox,
// rendered monochrome in currentColor by <SocialIcon> so it stays theme-aware.
// Sources: GitHub + TradingView from Simple Icons; LinkedIn is the canonical mark.
export const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/syedhamza2135",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  },
  {
    label: "GitHub",
    href: "https://github.com/syedhamza2135",
    icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    label: "TradingView",
    href: "https://www.tradingview.com/u/syedhamza2135/",
    icon: "M15.8654 8.2789c0 1.3541-1.0978 2.4519-2.452 2.4519-1.354 0-2.4519-1.0978-2.4519-2.452 0-1.354 1.0978-2.4518 2.452-2.4518 1.3541 0 2.4519 1.0977 2.4519 2.4519zM9.75 6H0v4.9038h4.8462v7.2692H9.75Zm8.5962 0H24l-5.1058 12.173h-5.6538z",
  },
] as const;

// Nav section index (the mono "01 — " numbering is visual; headings carry real hierarchy).
export const SECTIONS = [
  { id: "problem", num: "01", label: "problem" },
  { id: "system", num: "02", label: "system" },
  { id: "redline", num: "03", label: "redline" },
  { id: "services", num: "04", label: "services" },
  { id: "proof", num: "05", label: "proof" },
  { id: "about", num: "06", label: "about" },
] as const;

// Section id union, derived from SECTIONS so a wrong id is a compile error.
export type SectionId = (typeof SECTIONS)[number]["id"];

// The margin folio ("01".."06") for a section, derived from its position in SECTIONS.
// Single source of truth: reorder SECTIONS and every section's folio follows, no manual edits.
export function folioFor(id: SectionId): string {
  const index = SECTIONS.findIndex((s) => s.id === id);
  return String(index + 1).padStart(2, "0");
}
