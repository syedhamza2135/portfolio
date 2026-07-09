import Section from "@/components/Section";
import VoiceEngine from "@/components/VoiceEngine";
import { folioFor } from "@/lib/site";
import { rd } from "@/lib/ui";

// §02 — The system. Server-rendered shell around the one client island (the demo).
export default function System() {
  return (
    <Section id="system" num={folioFor("system")} label="the system" labelledBy="system-h">
        <h2 id="system-h" className="reveal t-h2 max-w-2xl font-medium">
          The voice pipeline, running live.
        </h2>
        <p className="reveal t-lead mt-5 mb-8 max-w-2xl text-muted" style={rd(80)}>
          It reads a writing sample and compiles a reusable voice profile. That&rsquo;s the
          first step the production pipeline runs before it drafts anything.
        </p>

        <VoiceEngine />

        {/*
          §02 caption. Settled decision (2026-07-09): state no draft count. No defensible
          figure exists yet, and the site's rule is to never assert a number it can't back up.
          The caption stands on its own without one. Revisit only if a verifiable figure lands.
        */}
        <p className="reveal mt-4 text-sm text-muted">
          A stripped-down slice of the real pipeline: drafts in, a voice + editing skill out.
        </p>

        <p className="reveal mt-6 max-w-2xl text-base text-muted">
          The production version runs on Python and Claude. It reads a client&rsquo;s back
          catalog and builds a deeper profile than these client-side heuristics can. Every
          draft gets a voice and editing skill to work from. The first pass already reads
          like the client wrote it. This page runs the lightweight version so you can see
          how it works without a server.
        </p>
    </Section>
  );
}
