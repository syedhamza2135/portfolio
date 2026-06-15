import Section from "@/components/Section";

/*
  §04 — Proof. Using the PRD T1 *specific-anonymous* fallback (no client named yet).
  When permission lands (open item #1), swap `tag` for the real client + logo.
  Keep every number honest (§8) — replace the outcome lines only with figures you can defend.
*/
const CASES = [
  {
    tag: "AI observability · $10M-funded startup",
    required: "Technical content on LLM evaluation and observability, accurate enough for a developer audience and held to agency deadlines.",
    shipped: "Long-form technical articles and docs explaining evaluation, tracing, and observability to engineers.",
    outcome: "Delivered on schedule and cleared technical review without a rewrite cycle.",
  },
  {
    tag: "Venture capital · mid-size firm",
    required: "Investor-grade thought leadership written by someone who can actually read the charts.",
    shipped: "Market commentary and thesis pieces that hold up in front of LPs and founders.",
    outcome: "Published under the firm's name with edits measured in lines, not paragraphs.",
  },
];

// §04 testimonial slot (T2). Set to an object once you have one attributed quote — until
// then it renders nothing and the layout stays intact.
const TESTIMONIAL: { quote: string; name: string; title: string } | null = null;

export default function Proof() {
  return (
    <Section id="proof" num="04" label="proof" labelledBy="proof-h">
        <h2 id="proof-h" className="reveal max-w-2xl text-3xl font-medium sm:text-4xl">
          Work that went live, on real deadlines.
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {CASES.map((c) => (
            <article
              key={c.tag}
              className="reveal rounded-xl border border-hairline bg-card p-6"
            >
              <p className="mono text-[0.74rem] text-accent">{c.tag}</p>
              <dl className="mt-4 space-y-3 text-[0.95rem]">
                <div>
                  <dt className="mono text-[0.7rem] text-muted">what it required</dt>
                  <dd className="mt-1">{c.required}</dd>
                </div>
                <div>
                  <dt className="mono text-[0.7rem] text-muted">what shipped</dt>
                  <dd className="mt-1">{c.shipped}</dd>
                </div>
                <div>
                  <dt className="mono text-[0.7rem] text-muted">outcome</dt>
                  <dd className="mt-1 text-muted">{c.outcome}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {TESTIMONIAL && (
          <figure className="reveal mt-8 max-w-2xl border-l-2 border-accent pl-5">
            <blockquote className="font-sans text-xl italic">
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </blockquote>
            <figcaption className="mono mt-3 text-[0.78rem] text-muted">
              {TESTIMONIAL.name} · {TESTIMONIAL.title}
            </figcaption>
          </figure>
        )}
    </Section>
  );
}
