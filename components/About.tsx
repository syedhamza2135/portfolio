import Image from "next/image";
import Section from "@/components/Section";
import { folioFor, SOCIAL_LINKS } from "@/lib/site";
import { rd } from "@/lib/ui";
import SocialIcon from "@/components/SocialIcon";

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
    <Section id="about" num={folioFor("about")} label="who you're hiring" labelledBy="about-h">
        {/* Headline spans the full content width: nested in the photo column it was trapped at
            ~320px and the global `text-wrap: balance` collapsed it into a 5-line, mid-phrase stack.
            Full width, it settles into 2-3 clean lines at every breakpoint. Photo + bio sit below. */}
        <h2 id="about-h" className="reveal t-h2 max-w-3xl">
          I&rsquo;m the contractor teams call when the work sits between two job titles.
        </h2>

        <div className="mt-8 grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
          {/* Real face photo (§7) — 140px, served unoptimized under output:export. Shown in full
              colour; the hairline frame + redline accent tick carry the editorial treatment. */}
          <figure className="reveal relative m-0 h-[140px] w-[140px] shrink-0 overflow-hidden rounded-xl border border-hairline">
            <Image
              src="/me.jpg"
              alt="Syed Hamza"
              width={140}
              height={140}
              className="h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-[3px] w-9 bg-accent"
            />
          </figure>

          <p className="reveal t-lead max-w-2xl text-ink" style={rd(80)}>
            Strong writers usually can&rsquo;t build the tool. Strong builders usually write
            like engineers. I do both and bill it as one line item, which is what a team
            wants when a project won&rsquo;t sit cleanly under &ldquo;writer&rdquo; or
            &ldquo;developer.&rdquo;
          </p>
        </div>

        <ol className="mt-12 max-w-2xl space-y-4">
          {TIMELINE.map((t, i) => (
            <li key={t.tag} style={rd(i * 70)} className="reveal grid grid-cols-[7rem_1fr] gap-4 sm:grid-cols-[8rem_1fr]">
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

        {/* Public profiles behind the copy above (code, markets, work history).
            Same SOCIAL_LINKS source as the footer + JSON-LD sameAs. */}
        <nav className="reveal mt-8" aria-label="Profiles" style={rd(80)}>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li className="draft text-[0.78rem] text-muted">elsewhere:</li>
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track={`about_${s.label.toLowerCase()}`}
                  className="draft inline-flex items-center gap-1.5 text-[0.82rem] text-ink link-underline"
                >
                  <SocialIcon d={s.icon} className="text-accent" />
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </nav>

    </Section>
  );
}
