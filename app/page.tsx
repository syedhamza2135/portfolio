import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import System from "@/components/System";
import Redline from "@/components/Redline";
import Services from "@/components/Services";
import Proof from "@/components/Proof";
import About from "@/components/About";
import CTA from "@/components/CTA";
import { NAME, SITE_URL, TAGLINE } from "@/lib/site";

// JSON-LD: Person + ProfilePage structured data (§7 SEO).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: NAME,
      url: SITE_URL,
      jobTitle: "Content systems contractor",
      description: TAGLINE,
      knowsAbout: [
        "Content strategy",
        "AI content automation",
        "Technical writing",
        "Python",
        "Web development",
      ],
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: SITE_URL,
      name: `${NAME} · content systems for agencies`,
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
