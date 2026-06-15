import Section from "@/components/Section";
import VoiceEngine from "@/components/VoiceEngine";

// §02 — The system. Server-rendered shell around the one client island (the demo).
export default function System() {
  return (
    <Section id="system" num="02" label="the system" labelledBy="system-h">
        <h2 id="system-h" className="reveal max-w-2xl text-3xl font-medium sm:text-4xl">
          The voice pipeline, running live.
        </h2>
        <p className="reveal mt-5 mb-8 max-w-2xl text-lg text-muted">
          It reads a writing sample and compiles a reusable voice profile. That&rsquo;s the
          first step the production pipeline runs before it drafts anything.
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
          The production version runs on Python and Claude. It reads a client&rsquo;s back
          catalogue, builds a deeper profile than these client-side heuristics can, and gives
          every draft a voice and editing skill to work from. The first pass already sounds
          like the client, not like a model. This page runs the lightweight version so you
          can see how it works without a server.
        </p>
    </Section>
  );
}
