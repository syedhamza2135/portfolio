import SectionLabel from "@/components/SectionLabel";

// §01. Written AT the agency owner. This is the highest copy bar on the page (§5.01).
export default function Problem() {
  return (
    <section
      id="problem"
      tabIndex={-1}
      aria-labelledby="problem-h"
      className="border-t border-hairline py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionLabel num="01" label="the problem" />
        <h2
          id="problem-h"
          className="reveal mt-6 max-w-3xl text-3xl font-medium sm:text-4xl"
        >
          You sold the retainer. Now you&rsquo;re drowning in production.
        </h2>
        <div className="reveal mt-7 max-w-2xl space-y-5 text-lg text-muted">
          <p>
            The pitch was the easy part. The work is volume: a dozen pieces a month, each
            one supposed to sound like the client, hit a real quality bar, and ship on a
            date you already promised. Hire fast and the voice drifts. Edit everything
            yourself and you become the bottleneck you hired around.
          </p>
          <p>
            That tension — volume against voice against the quality bar — doesn&rsquo;t get
            solved by adding another writer to the pile. It gets solved by building the
            thing that holds the voice steady while the volume scales. That&rsquo;s a
            systems problem, and it&rsquo;s the one I build for.
          </p>
        </div>
      </div>
    </section>
  );
}
