// Bundled example texts for the Voice Engine (§6.2 state 4). Three deliberately distinct
// voices so re-runs PROVE the analysis isn't canned: short/second-person/contraction-heavy
// vs. long/third-person/formal vs. mid-length/first-person/questioning. Each is original
// prose and doubles as a writing sample.

export interface Sample {
  label: string;
  text: string;
}

export const SAMPLES: Sample[] = [
  {
    label: "agency pitch",
    text: `You sold the retainer on a promise. Now the drafts pile up, and every one needs your voice stamped on it before it ships. That's the trap. You didn't hire a writer to become an editor. But here you are, rewriting the same opening for the third time this week. The work isn't hard. There's just too much of it, and it all has to sound like you.`,
  },
  {
    label: "systems essay",
    text: `The shift to automated editorial systems is frequently misread as a reduction in human oversight; in practice, it represents a redistribution of that oversight toward the decisions that genuinely require judgment. A well-constructed pipeline does not replace the editor. It relocates the editor's attention from mechanical correction to the questions a machine cannot settle: whether the argument holds, whether the evidence is sufficient, and whether the piece earns the reader's continued attention.`,
  },
  {
    label: "founder note",
    text: `I learned to write the way I learned to trade: by losing, repeatedly, in public. My first clients were patient in the way that only people paying very little can afford to be. Did I know what I was doing? Not entirely. But I shipped, I listened, and I rewrote until the work stopped embarrassing me. Somewhere in there, the writing started to sound like a person instead of a template.`,
  },
];
