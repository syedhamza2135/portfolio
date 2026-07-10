// Single source of truth for site-wide constants.
// Items marked TODO map to PRD §3 (Trust Architecture) / §9 (Open Items) and must be
// confirmed before launch. Env vars (NEXT_PUBLIC_*) are inlined at build time.

export const NAME = "Syed Hamza";

// Public repo for this site. The build is a first-class engineering sample, so the source is a
// proof link (System §02 "read the build", Footer), not just a profile glyph.
export const REPO_URL = "https://github.com/syedhamza2135/portfolio";

// The one title string. Leads with the concrete hook (a buyer scans this in Google and in a
// shared link before they ever reach the hero) instead of the abstract "content systems for
// scale". Single source: drives the <title>, OG/Twitter titles + image alts, and the JSON-LD
// ProfilePage name, so they can never drift.
export const TITLE = `${NAME} · voice-matched content pipelines for agencies`;

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
  "I build content pipelines that keep a client's voice steady as volume climbs. Writing and code from one contractor.";

// Public profiles. Single source of truth for BOTH the visible footer links and the
// JSON-LD Person `sameAs` (app/page.tsx maps this to href), so the two can never drift.
// Order here is the render order in the footer.
export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/syedhamza2135" },
  { label: "GitHub", href: "https://github.com/syedhamza2135" },
  { label: "TradingView", href: "https://www.tradingview.com/u/syedhamza2135/" },
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
