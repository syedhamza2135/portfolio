import Image from "next/image";
import Section from "@/components/Section";

const TIMELINE = [
  { tag: "foundation", text: "CS degree. I think in systems and write the Python myself." },
  { tag: "markets", text: "Years in trading and finance, so I write fintech and VC content without faking the fluency." },
  { tag: "shipping", text: "Freelance dev work: real clients, real deadlines, code that goes live." },
  {
    tag: "the merge",
    text: "Ran agency content for AI and VC clients, then built the voice pipeline when the volume outgrew the writers.",
  },
];

const PILLS = [
  "python",
  "claude api & skills",
  "technical writing",
  "content strategy",
  "marketing ops",
  "web dev",
];

export default function About() {
  return (
    <Section id="about" label="who you're hiring" labelledBy="about-h">
        <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
          {/* Real face photo (§7) — hand-cropped + sized to 432px, served unoptimized under
              output:export. Full colour on touch; desaturated → colour on hover for pointers. */}
          <figure className="photo-frame reveal relative m-0 h-[140px] w-[140px] shrink-0 overflow-hidden rounded-xl border border-hairline">
            <Image
              src="/me.jpg"
              alt="Syed Hamza"
              width={140}
              height={140}
              className="photo-treat h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-[3px] w-9 bg-accent"
            />
          </figure>

          <div>
            <h2 id="about-h" className="reveal max-w-2xl text-3xl font-medium sm:text-4xl">
              I&rsquo;m the contractor agencies call when the work sits between two job titles.
            </h2>
            <p className="reveal mt-6 max-w-2xl text-lg text-muted">
              Strong writers usually can&rsquo;t build the tool. Strong builders usually write
              like engineers. I do both and bill it as one line item, which is what an agency
              wants when a project won&rsquo;t sit cleanly under &ldquo;writer&rdquo; or
              &ldquo;developer.&rdquo;
            </p>
          </div>
        </div>

        <ol className="mt-12 max-w-2xl space-y-4">
          {TIMELINE.map((t) => (
            <li key={t.tag} className="reveal grid grid-cols-[7rem_1fr] gap-4 sm:grid-cols-[8rem_1fr]">
              <span className="draft pt-0.5 text-[0.78rem] text-accent">{t.tag}</span>
              <span className="text-base">{t.text}</span>
            </li>
          ))}
        </ol>

        <ul className="reveal mt-10 flex flex-wrap gap-2" aria-label="Capabilities">
          {PILLS.map((p) => (
            <li key={p} className="pill">
              {p}
            </li>
          ))}
        </ul>

        {/* The proverb joke lands exactly once, as a wink (§2, §8). */}
        <p className="reveal mt-12 max-w-2xl font-sans text-xl italic text-muted">
          Jack of all trades, master of none — though oftentimes better than master of one.
        </p>
    </Section>
  );
}
