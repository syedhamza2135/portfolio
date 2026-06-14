import SectionLabel from "@/components/SectionLabel";
import VoiceEngine from "@/components/VoiceEngine";

// §02 — The system. Server-rendered shell around the one client island (the demo).
export default function System() {
  return (
    <section
      id="system"
      tabIndex={-1}
      aria-labelledby="system-h"
      className="border-t border-hairline py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionLabel num="02" label="the system" />
        <h2 id="system-h" className="reveal mt-6 max-w-2xl text-3xl font-medium sm:text-4xl">
          The voice pipeline, running live.
        </h2>
        <p className="reveal mt-5 mb-8 max-w-2xl text-lg text-muted">
          It reads a writing sample and compiles a reusable voice profile — the same first
          step the production pipeline runs before it drafts anything.
        </p>

        <VoiceEngine />

        {/*
          §02 caption. PRD open item #6: insert the VERIFIED draft count before launch.
          Do not assert a number you can't back up — keep it honest.
        */}
        <p className="reveal mt-4 text-sm text-muted">
          A stripped-down slice of the real pipeline: drafts in, a voice + editing skill out.
          {/* e.g. "40+ drafts in" — confirm the real figure, then state it here. */}
        </p>

        <p className="reveal mt-6 max-w-2xl text-base text-muted">
          The production version is built with Python and Claude. It ingests a client&rsquo;s
          back catalogue, builds a richer profile than these client-side heuristics can, and
          hands every draft a voice + editing skill — so the first pass already sounds like
          the client instead of like a model. This page runs the lightweight version so you
          can see the idea without waiting on a server.
        </p>
      </div>
    </section>
  );
}
