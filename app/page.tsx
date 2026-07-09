import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import System from "@/components/System";
import Redline from "@/components/Redline";
import Services from "@/components/Services";
import Proof from "@/components/Proof";
import About from "@/components/About";
import CTA from "@/components/CTA";
import { NAME, SITE_URL, TAGLINE, CONTACT_EMAIL } from "@/lib/site";

// JSON-LD: Person + ProfilePage structured data (§7 SEO).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: NAME,
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/me.jpg`,
      jobTitle: "Content systems contractor",
      description: TAGLINE,
      email: "mailto:" + CONTACT_EMAIL,
      sameAs: [
        "https://www.linkedin.com/in/syedhamza2135",
        "https://github.com/syedhamza2135",
        "https://www.tradingview.com/u/syedhamza2135/",
      ],
      knowsAbout: [
        "Content strategy",
        "AI content automation",
        "Technical writing",
        "Python",
        "Web development",
        "Developer documentation",
        "LLM evaluation",
        "Editorial automation",
        "Claude API",
      ],
      alumniOf: { "@type": "CollegeOrUniversity", name: "COMSATS University Islamabad" },
      address: { "@type": "PostalAddress", addressCountry: "PK" },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: `${SITE_URL}/`,
      name: `${NAME} · content systems for scale`,
      about: { "@id": `${SITE_URL}/#person` },
      mainEntity: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Problem />
      <System />
      <Redline />
      <Services />
      <Proof />
      <About />
      <CTA />
    </>
  );
}
