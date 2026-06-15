import { CALENDLY_URL } from "@/lib/site";

// §5.0 Hero. Fully meaningful with JS disabled; no animation gates the headline (§7).
export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
      <p className="mono text-[0.8rem] tracking-wide text-muted">
        content systems · technical writing · code
      </p>

      <h1 className="mt-6 max-w-3xl text-balance text-4xl font-medium leading-[1.06] sm:text-5xl md:text-6xl">
        Publish like a ten-person content team. With{" "}
        <em className="italic text-accent">one contractor.</em>
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
          className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-6 text-[0.95rem] font-medium text-shell shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Book a 30-min call
        </a>
        <a href="#system" className="mono text-[0.82rem] text-muted link-underline">
          or see the system below ↓
        </a>
      </div>
    </section>
  );
}
