// Bundled example texts for the Voice Engine (§6.2 state 4). Three deliberately distinct
// voices so re-runs PROVE the analysis isn't canned: mid-length/first-person/questioning
// vs. short/second-person/contraction-heavy vs. long/third-person/formal. Each is original
// prose and doubles as a writing sample. The founder note leads: it is the default the demo
// auto-runs, and the most human of the three.

export interface Sample {
  label: string;
  text: string;
}

// Deliberately bad marketing copy for the Redline tool (§ new). Each one is stuffed with the
// exact tells the editor strikes: clichés, hedges, an AI antithesis, a weak opener, an em-dash.
// These are INPUT being critiqued, not site voice, so the em-dash here is intentional (it shows
// the em-dash flag firing). The tool marks them up live so a visitor sees the craft, not a claim.
export const REDLINE_SAMPLES: Sample[] = [
  {
    label: "SaaS landing page",
    text: `In today's fast-paced digital landscape, our best-in-class platform empowers teams to leverage cutting-edge automation and unlock game-changing results at scale. It's not just a tool, it's a paradigm shift. Our robust, seamless solution helps you move the needle and take your workflow to the next level.`,
  },
  {
    label: "agency about page",
    text: `We are a world-class team of thought leaders who are deeply passionate about delivering actionable insights. There is nothing we love more than to circle back, unpack the low-hanging fruit, and drill down into the data — it is important to note that we always go the extra mile. Our holistic approach really moves the needle.`,
  },
  {
    label: "product announcement",
    text: `We're thrilled to announce our revolutionary new feature that will supercharge your productivity. This next-level, mission-critical update was carefully engineered by our team to seamlessly streamline your entire workflow. Needless to say, it's a total game-changer that empowers you to do more with less.`,
  },
];

export const SAMPLES: Sample[] = [
  {
    label: "founder note",
    text: `I learned to write the way I learned to trade: by losing, repeatedly, in public. My first clients were patient in the way that only people paying very little can afford to be. Did I know what I was doing? Not entirely. But I shipped, I listened and I rewrote until the work stopped embarrassing me. Somewhere in there, the writing started to sound like a person instead of a template.`,
  },
  {
    label: "agency pitch",
    text: `You sold the retainer on a promise. Now the drafts pile up, and every one needs your voice stamped on it before it ships. That's the trap. You didn't hire a writer to become an editor. But here you are, rewriting the same opening for the third time this week. The work isn't hard. There's just too much of it, and it all has to sound like you.`,
  },
  {
    label: "systems essay",
    text: `The shift to automated editorial systems is frequently misread as a reduction in human oversight; in practice, it represents a redistribution of that oversight toward the decisions that genuinely require judgment. A well-constructed pipeline does not replace the editor. It relocates the editor's attention from mechanical correction to the questions a machine cannot settle: whether the argument holds, whether the evidence is sufficient and whether the piece earns the reader's continued attention.`,
  },
];
