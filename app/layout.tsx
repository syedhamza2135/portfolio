import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Newsreader, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { NAME, SITE_URL, TAGLINE } from "@/lib/site";
import { THEME_INIT, ENHANCE } from "@/lib/scripts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// All fonts self-hosted at build time via next/font (§4.3, §7) — zero third-party requests
// at runtime. Faces chosen to avoid the AI-defaulted Fraunces/Playfair (§4.3 constraint).
const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
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
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#171410" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
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
