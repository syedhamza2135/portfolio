import Section from "@/components/Section";

// §03 — What I build for agencies. Moved up before proof/about (§5 revision).
const OFFERS = [
  {
    marker: "a",
    title: "Content pipelines",
    body: "Voice cloning, brief-to-draft automation, editing systems. 3× the output on the same headcount, and it still sounds like the client.",
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
        <h2 id="services-h" className="reveal max-w-2xl text-3xl font-medium sm:text-4xl">
          Three ways to put me to work.
        </h2>

        <ul className="mt-10">
          {OFFERS.map((o, i) => (
            <li
              key={o.marker}
              className={`reveal grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 py-7 sm:grid-cols-[3rem_1fr] ${
                i > 0 ? "border-t border-hairline" : ""
              }`}
            >
              <span className="mono pt-1 text-sm text-accent">{o.marker}.</span>
              <h3 className="font-serif text-xl font-medium sm:text-2xl">{o.title}</h3>
              <p className="col-start-2 max-w-xl text-base text-muted">{o.body}</p>
            </li>
          ))}
        </ul>
    </Section>
  );
}
