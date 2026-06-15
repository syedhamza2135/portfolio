import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { NAME, SITE_URL, TAGLINE } from "@/lib/site";
import { THEME_INIT, ENHANCE } from "@/lib/scripts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// All fonts self-hosted at build time via next/font — zero third-party requests at runtime.
// "Signal" pairing: a characterful grotesque display + a clean humanist body + mono for the
// instrument labels and terminal. Deliberately avoids the AI-defaulted Fraunces/Playfair serif.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-display",
  display: "swap",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--ff-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${NAME} — content systems for agencies`,
    template: `%s — ${NAME}`,
  },
  description: TAGLINE,
  applicationName: `${NAME} — portfolio`,
  authors: [{ name: NAME }],
  creator: NAME,
  alternates: { canonical: "/" },
  keywords: [
    "content systems",
    "AI content pipeline",
    "technical writing",
    "agency contractor",
    "voice cloning",
    "editorial automation",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${NAME} — content systems for agencies`,
    description: TAGLINE,
    siteName: NAME,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${NAME} — content systems for agencies` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — content systems for agencies`,
    description: TAGLINE,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f12" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        {/* No-FOUC: set data-theme before first paint. Mandatory with static export (§4.5).
            Inline in <head> so it runs synchronously during HTML parse, before any paint.
            React 19 logs a dev-only "script in component" notice on Fast-Refresh re-renders;
            in the static production HTML the script is server-rendered and runs once. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
        {/* Hand-rolled enhancement: reveals, theme toggle, CTA tracking (§4.5, §7). */}
        <Script
          id="enhance"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: ENHANCE }}
        />
      </body>
    </html>
  );
}
