import { CALENDLY_URL } from "@/lib/site";

// §5.0 Hero. Fully meaningful with JS disabled; no animation gates the headline (§7).
// "Signal" composition: instrument status line, oversized grotesque display, a signal-filled
// CTA, over a faint blueprint grid that the lazy 3D pipeline scene will later inhabit.
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
        <p className="mono flex items-center gap-2 text-[0.78rem] tracking-wide text-muted">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-term-teal" />
          content systems · technical writing · code
        </p>

        <h1 className="mt-7 max-w-4xl text-[2.6rem] font-bold leading-[1.02] sm:text-6xl md:text-7xl">
          Publish like a ten-person content team.{" "}
          <span className="hero-accent">With one contractor.</span>
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
            className="inline-flex min-h-[44px] items-center rounded-full bg-signal px-6 text-[0.95rem] font-medium text-[#15161a] shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Book a 30-min call
          </a>
          <a href="#system" className="mono text-[0.82rem] text-muted link-underline">
            or see the system below ↓
          </a>
        </div>
      </div>
    </section>
  );
}
