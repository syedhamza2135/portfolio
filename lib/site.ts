// Single source of truth for site-wide constants.
// Items marked TODO map to PRD §3 (Trust Architecture) / §9 (Open Items) and must be
// confirmed before launch. Env vars (NEXT_PUBLIC_*) are inlined at build time.

export const NAME = "Syed Hamza";

// PRD T5 / open item #7 — a *.vercel.app URL undermines the professionalism claim.
// Set NEXT_PUBLIC_SITE_URL once the custom domain is live.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://yourdomain.com";

// PRD open item #7 — real Calendly/Cal.com link, US-overlap availability windows.
export const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/your-handle/20min";

// Footer "fire exit" mailto (§5 Footer). Swap for a domain address once the domain is live.
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "syedhamza2135@gmail.com";

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
