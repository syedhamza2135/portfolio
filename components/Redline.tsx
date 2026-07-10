import Section from "@/components/Section";
import RedlineTool from "@/components/RedlineTool";
import { folioFor } from "@/lib/site";
import { rd } from "@/lib/ui";

// §03 — Redline. The second half of the pipeline story: the voice engine (§02) reads how a client
// writes; this is the editor that cleans what gets drafted. Server-rendered shell around the one
// client island (the tool). The two demos share a story but not a look: terminal vs. bond page.
export default function Redline() {
  return (
    <Section id="redline" num={folioFor("redline")} label="redline" labelledBy="redline-h">
      <h2 id="redline-h" className="reveal t-h2 max-w-2xl">
        The editor half of the pipeline. Run it on your copy.
      </h2>
      <p className="reveal t-lead mt-6 mb-8 max-w-2xl text-ink" style={rd(80)}>
        Matching a voice is step one. The system also strips the filler that makes copy read like a
        machine wrote it. Paste a headline or a landing page below and watch the same editing pass
        mark it up: clichés struck, AI tells flagged. Every mark is measured from your text.
      </p>

      <RedlineTool />

      <p className="reveal mt-4 text-sm text-muted">
        It runs entirely in your browser on a fixed set of editorial rules, so it is fast and it is
        honest about what it finds. The production version does this with Claude against a client
        style guide, which catches the calls a rule list cannot.
      </p>
    </Section>
  );
}
