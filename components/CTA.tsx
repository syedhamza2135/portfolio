import { CALENDLY_URL } from "@/lib/site";

// §5 CTA block. The page's one "opposite block": ink card on ivory (light) / ivory card on
// ink (dark) — both first-class (§4.5). Location honesty is LOCKED copy (T4).
export default function CTA() {
  return (
    <section
      aria-labelledby="cta-h"
      className="border-t border-hairline px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="reveal mx-auto max-w-3xl rounded-2xl bg-cta-bg px-7 py-12 text-cta-text sm:px-12 sm:py-16">
        <h2 id="cta-h" className="font-serif text-3xl font-medium sm:text-4xl">
          Have a content bottleneck?
        </h2>
        <p className="mt-5 max-w-xl text-lg opacity-90">
          20 minutes, your timezone. I&rsquo;m based in Pakistan and work US hours —
          async-first, weekly Loom updates, and you&rsquo;ll never wait a day for a reply. If
          I&rsquo;m not the right fit, I&rsquo;ll tell you who is.
        </p>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-track="cta_book_main"
          className="mt-8 inline-flex min-h-[44px] items-center rounded-full bg-cta-text px-6 text-[0.95rem] font-medium text-cta-bg transition-transform hover:-translate-y-0.5"
        >
          Book a 20-min call
        </a>
      </div>
    </section>
  );
}
