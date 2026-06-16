import { CALENDLY_URL } from "@/lib/site";
import HeroField from "@/components/HeroField";

// §5.0 Hero. "Redline": the value prop on the left, the signature on the right — a draft revised
// into the client's voice (the craft this site sells). Fully meaningful with JS disabled; the
// final marked-up state carries the message, the insertion just settles in on load.
export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <HeroField />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          <p className="draft text-[0.8rem] tracking-wide text-muted">
            content systems · technical writing · code
          </p>

          <h1 className="mt-6 max-w-2xl text-[2.7rem] leading-[1.04] sm:text-5xl md:text-[3.7rem]">
            Publish like a ten-person content team. With{" "}
            <em className="italic text-ins">one contractor.</em>
          </h1>

          <p className="mt-7 max-w-xl text-lg text-muted">
            Content pipelines for US agencies: voice cloning, technical content, editorial
            automation. Writing and code included.
          </p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-track="cta_hero"
              className="inline-flex min-h-[44px] items-center rounded-sm bg-cta-bg px-6 text-[0.95rem] font-medium text-cta-text shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Book a 30-min call
            </a>
            <a href="#system" className="draft text-[0.82rem] text-muted link-underline">
              or see the system below ↓
            </a>
          </div>
        </div>

        {/* signature: a generic draft revised into the client's voice */}
        <figure className="change-bar relative m-0 border-y border-r border-hairline bg-card py-6 pl-6 pr-6">
          <figcaption className="draft mb-4 flex items-center justify-between text-[0.72rem] text-muted">
            <span>revision · draft → in voice</span>
            <span className="text-accent">redline</span>
          </figcaption>
          <p className="draft text-[0.95rem] leading-relaxed">
            <span className="rev-del">
              In today&rsquo;s fast-paced digital landscape, leveraging content is the key to
              driving meaningful engagement at scale.
            </span>
          </p>
          <p className="rev-ins mt-5 font-serif text-2xl leading-snug text-ink">
            Your readers know when a post was written by a committee. This one wasn&rsquo;t.
          </p>
          <p className="draft mt-6 text-[0.74rem] text-faint">
            ✎ matched to the client&rsquo;s voice — first pass, no rewrite.
          </p>
        </figure>
      </div>
    </section>
  );
}
