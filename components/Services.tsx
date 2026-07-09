import Section from "@/components/Section";
import { rd } from "@/lib/ui";

// §03 — What I build for agencies. Moved up before proof/about (§5 revision).
const OFFERS = [
  {
    marker: "a",
    title: "Content pipelines",
    body: "Voice matching, brief-to-draft automation, editing systems. The same team ships more, and it still sounds like the client.",
  },
  {
    marker: "b",
    title: "Technical content",
    body: "AI, fintech, and developer-facing writing for the clients generalist writers tap out on. I read the docs and the charts.",
  },
  {
    marker: "c",
    title: "Copy + code, one invoice",
    body: "Landing pages, programmatic SEO, and the small internal tools that make a content team faster. Written and built by the same person.",
  },
];

export default function Services() {
  return (
    <Section id="services" num="03" label="what i build for agencies" labelledBy="services-h">
        <h2 id="services-h" className="reveal t-h2 max-w-2xl font-medium">
          Three ways to put me to work.
        </h2>

        <ul className="mt-12">
          {OFFERS.map((o, i) => (
            <li
              key={o.marker}
              style={rd(i * 90)}
              className={`reveal grid grid-cols-[2rem_1fr] gap-x-4 gap-y-2 py-8 sm:grid-cols-[3.5rem_1fr] ${
                i > 0 ? "border-t border-hairline" : ""
              }`}
            >
              <span className="draft pt-1 text-2xl text-accent sm:text-3xl">{o.marker}.</span>
              <h3 className="t-h3 self-center font-serif font-medium">{o.title}</h3>
              <p className="col-start-2 max-w-xl text-base text-muted">{o.body}</p>
            </li>
          ))}
        </ul>
    </Section>
  );
}
