import Section from "@/components/Section";
import { folioFor } from "@/lib/site";
import { rd } from "@/lib/ui";

/*
  §05 Proof. Two specific-but-anonymous client cases (real client-scale markers, no name yet).
  Keep every number honest (§8) — replace the outcome lines only with figures you can defend.
  TESTIMONIAL stays null until a real attributed quote exists.
*/
const CASES = [
  {
    tag: "AI observability · $10M-funded startup",
    required:
      "Technical content on LLM evaluation and observability, accurate enough for a developer audience and held to agency deadlines.",
    shipped:
      "Long-form articles and docs on evaluation, tracing and observability, written for engineers and shipped through their V2 launch.",
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

// §05 testimonial slot (T2). Set to an object once you have one attributed quote; until
// then it renders nothing and the layout stays intact.
// Note: the blockquote below renders with `font-sans italic`. The Hanken Grotesk italic
// face is being trimmed from app/layout.tsx in a parallel change, so when a real testimonial
// ships, re-add that italic face OR restyle the quote (e.g. font-serif). Do not rely on
// browser-synthesized italics for the body font.
const TESTIMONIAL: { quote: string; name: string; title: string } | null = null;

export default function Proof() {
  return (
    <Section id="proof" num={folioFor("proof")} label="proof" labelledBy="proof-h">
        <h2 id="proof-h" className="reveal t-h2 max-w-2xl font-medium">
          Work that went live, on real deadlines.
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {CASES.map((c, i) => (
            <article
              key={c.tag}
              style={rd(i * 90)}
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
