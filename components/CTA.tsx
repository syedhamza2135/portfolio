import { CALENDLY_URL, WHATSAPP_URL, CONTACT_EMAIL } from "@/lib/site";

// §5 CTA block. The page's one "opposite block": ink card on bond (light) / bond card on ink
// (dark). One primary CTA (book a call); WhatsApp + email are demoted to a small fallback line
// so cold traffic gets a single obvious next step. Location honesty is LOCKED copy (T4).
export default function CTA() {
  return (
    <section
      aria-labelledby="cta-h"
      className="border-t border-hairline px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="reveal mx-auto max-w-3xl rounded-sm bg-cta-bg px-7 py-14 text-cta-text sm:px-12 sm:py-20">
        <h2 id="cta-h" className="t-h2 font-serif">
          Have a content bottleneck?
        </h2>
        <p className="t-lead mt-6 max-w-xl opacity-90">
          30 minutes, your timezone. I&rsquo;m based in Pakistan and work US hours: async-first,
          with weekly Loom updates and you won&rsquo;t wait a day for a reply. If I&rsquo;m not
          the right fit, I&rsquo;ll tell you who is.
        </p>

        <div className="mt-8">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="cta_book_main"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-cta-text px-6 text-[0.95rem] font-medium text-cta-bg transition-transform hover:-translate-y-0.5"
          >
            Book a 30-min call
          </a>
        </div>

        <p className="draft mt-5 text-[0.95rem] opacity-95">
          Prefer not to book?{" "}
          {WHATSAPP_URL && (
            <>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-track="cta_whatsapp"
                className="font-medium underline decoration-cta-text/70 underline-offset-2 hover:decoration-cta-text"
              >
                Message on WhatsApp
              </a>
              {" or "}
            </>
          )}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-track="cta_email"
            className="font-medium underline decoration-cta-text/70 underline-offset-2 hover:decoration-cta-text"
          >
            email me
          </a>
          . I reply the same day.
        </p>
      </div>
    </section>
  );
}
