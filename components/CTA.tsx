import { CALENDLY_URL, WHATSAPP_URL, CONTACT_EMAIL } from "@/lib/site";

// §5 CTA block. The page's one "opposite block": ink card on bond (light) / bond card on ink
// (dark). Three ways to reach me — WhatsApp, email, or a booked call. Location honesty is
// LOCKED copy (T4).
export default function CTA() {
  return (
    <section
      aria-labelledby="cta-h"
      className="border-t border-hairline px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="reveal mx-auto max-w-3xl rounded-sm bg-cta-bg px-7 py-12 text-cta-text sm:px-12 sm:py-16">
        <h2 id="cta-h" className="font-serif text-3xl sm:text-4xl">
          Have a content bottleneck?
        </h2>
        <p className="mt-5 max-w-xl text-lg opacity-90">
          30 minutes, your timezone. I&rsquo;m based in Pakistan and work US hours: async-first,
          with weekly Loom updates, and you won&rsquo;t wait a day for a reply. If I&rsquo;m not
          the right fit, I&rsquo;ll tell you who is.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="cta_book_main"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-cta-text px-6 text-[0.95rem] font-medium text-cta-bg transition-transform hover:-translate-y-0.5"
          >
            Book a 30-min call
          </a>
          {WHATSAPP_URL && (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-track="cta_whatsapp"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-cta-text/35 px-6 text-[0.95rem] font-medium text-cta-text transition-colors hover:bg-cta-text/10"
            >
              Message on WhatsApp
            </a>
          )}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-track="cta_email"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-cta-text/35 px-6 text-[0.95rem] font-medium text-cta-text transition-colors hover:bg-cta-text/10"
          >
            Email me
          </a>
        </div>

        <p className="draft mt-5 text-[0.78rem] opacity-70">
          Whatever&rsquo;s easiest — I reply the same day.
        </p>
      </div>
    </section>
  );
}
