import Section from "@/components/Section";
import { folioFor } from "@/lib/site";
import { rd } from "@/lib/ui";

// §01. Written AT the agency owner. This is the highest copy bar on the page (§5.01).
export default function Problem() {
  return (
    <Section id="problem" num={folioFor("problem")} label="the problem" labelledBy="problem-h">
        <h2
          id="problem-h"
          className="reveal t-h2 max-w-3xl"
        >
          You sold the retainer. Now you&rsquo;re drowning in production.
        </h2>
        <div className="reveal t-lead mt-6 max-w-2xl space-y-5 text-ink" style={rd(80)}>
          <p>
            The pitch was the easy part. The work is volume: a dozen pieces a month, each
            one supposed to sound like the client, hit a real quality bar and ship on a
            date you already promised. Hire fast and the voice drifts. Edit everything
            yourself and you become the bottleneck you hired around.
          </p>
          <p>
            Adding another writer doesn&rsquo;t fix that. It splits the same problem across
            more people. The fix is a system that keeps the voice steady as the volume
            climbs, so quality stops depending on who picked up the brief. That&rsquo;s the
            work I do.
          </p>
        </div>
    </Section>
  );
}
