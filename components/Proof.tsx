import Section from "@/components/Section";

/*
  §04 Proof. Two specific-but-anonymous client cases (real client-scale markers, no name yet)
  plus an original writing sample: a ghostwritten LinkedIn post that shows the craft directly
  instead of claiming a metric we cannot defend. Keep every number honest (§8).
  TESTIMONIAL stays null until a real attributed quote exists.
*/
const CASES = [
  {
    tag: "AI observability · $10M-funded startup",
    required:
      "Technical content on LLM evaluation and observability, accurate enough for a developer audience and held to agency deadlines.",
    shipped:
      "Long-form articles and docs on evaluation, tracing, and observability, written for engineers and shipped through their V2 launch.",
    outcome: "Cleared technical review without a rewrite cycle, on every deadline.",
  },
  {
    tag: "Venture capital · 1,500-attendee, $1,500-ticket conference",
    required:
      "Investor-grade thought leadership written by someone who can actually read the charts.",
    shipped: "Market commentary and thesis pieces that hold up in front of LPs and founders.",
    outcome: "Published under the firm's name with edits measured in lines, not paragraphs.",
  },
];

// An original writing sample (not a published client post): a LinkedIn post ghostwritten in a
// founder's voice, shown to demonstrate the ghostwriting directly. Caption frames it honestly.
const SAMPLE = {
  hook: "We spent four months building the feature our three biggest customers kept asking for.",
  body: [
    "Three weeks after launch, almost nobody touched it.",
    "A feature request is a problem dressed as a solution. They asked for bulk export. What they wanted was to stop dreading the Monday report. We shipped the export. The dread stayed.",
    "So we changed the question. We stopped asking customers what to build, and started asking what they did last Tuesday and where it hurt. The answers are messier and far more useful.",
    "The feature is still in the product. We just stopped calling it a win.",
  ],
};

// §04 testimonial slot (T2). Set to an object once you have one attributed quote; until
// then it renders nothing and the layout stays intact.
const TESTIMONIAL: { quote: string; name: string; title: string } | null = null;

export default function Proof() {
  return (
    <Section id="proof" label="proof" labelledBy="proof-h">
        <h2 id="proof-h" className="reveal max-w-2xl text-3xl font-medium sm:text-4xl">
          Work that went live, on real deadlines.
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {CASES.map((c) => (
            <article
              key={c.tag}
              className="reveal change-bar border-y border-r border-hairline bg-card py-6 pl-6 pr-6"
            >
              <p className="draft text-[0.74rem] text-accent">{c.tag}</p>
              <dl className="mt-4 space-y-3 text-[0.95rem]">
                <div>
                  <dt className="draft text-[0.7rem] text-muted">what it required</dt>
                  <dd className="mt-1">{c.required}</dd>
                </div>
                <div>
                  <dt className="draft text-[0.7rem] text-muted">what shipped</dt>
                  <dd className="mt-1">{c.shipped}</dd>
                </div>
                <div>
                  <dt className="draft text-[0.7rem] text-muted">outcome</dt>
                  <dd className="mt-1 text-muted">{c.outcome}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {/* Original writing sample: show the ghostwriting, do not just assert it. */}
        <figure className="reveal change-bar mt-6 border-y border-r border-hairline bg-card py-7 pl-6 pr-6">
          <figcaption className="draft mb-4 flex items-center justify-between text-[0.72rem] text-muted">
            <span>a LinkedIn post, ghostwritten in a founder&rsquo;s voice</span>
            <span className="text-ins">sample</span>
          </figcaption>
          <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">{SAMPLE.hook}</p>
          <div className="mt-4 max-w-2xl space-y-3 text-[0.95rem] leading-relaxed">
            {SAMPLE.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </figure>

        {TESTIMONIAL && (
          <figure className="reveal mt-8 max-w-2xl border-l-2 border-accent pl-5">
            <blockquote className="font-sans text-xl italic">
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </blockquote>
            <figcaption className="draft mt-3 text-[0.78rem] text-muted">
              {TESTIMONIAL.name} · {TESTIMONIAL.title}
            </figcaption>
          </figure>
        )}
    </Section>
  );
}
