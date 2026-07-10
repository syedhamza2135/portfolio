import Section from "@/components/Section";
import VoiceEngine from "@/components/VoiceEngine";
import { folioFor, REPO_URL } from "@/lib/site";
import { rd } from "@/lib/ui";

// §02 — The system. Server-rendered shell around the one client island (the demo).
export default function System() {
  return (
    <Section id="system" num={folioFor("system")} label="the system" labelledBy="system-h">
        <h2 id="system-h" className="reveal t-h2 max-w-2xl">
          The voice pipeline, running live.
        </h2>
        <p className="reveal t-lead mt-6 mb-8 max-w-2xl text-ink" style={rd(80)}>
          It reads a writing sample and compiles a reusable voice profile. That&rsquo;s the
          first step the production pipeline runs before it drafts anything.
        </p>

        <VoiceEngine />

        {/*
          §02: no caption line here by design. The demo is framed by the lead above and the
          paragraph below, so a third "this is the lite version" beat was cut. Settled
          2026-07-09: state no draft count anywhere (no defensible figure yet); if a caption
          ever returns, it carries no number.
        */}

        <p className="reveal mt-6 max-w-2xl text-base text-muted">
          The production version runs on Python and Claude. It reads a client&rsquo;s back
          catalog and builds a deeper profile than these client-side heuristics can. Every
          draft starts from a written profile of how the client actually sounds. The first
          pass already reads like the client wrote it. This page runs the lightweight version
          so you can see how it works without a server.
        </p>

        {/* The build is the engineering sample. The source is public, so it is a proof link,
            not a footnote (§03 credibility). */}
        <p className="reveal mt-6 text-base text-muted">
          This page is its own writing sample.{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="system_repo"
            className="draft text-[0.9rem] text-ink link-underline"
          >
            read the build ↗
          </a>
        </p>

        {/* Pipeline seam: the compiled voice out of this engine flows into the editor (§03).
            A proof-mark in the redline hand, decorative; the section headings carry the claim. */}
        <div className="pipe-seam reveal" aria-hidden="true">
          <span className="draft pipe-seam-note">the compiled voice feeds the editor</span>
          <span className="pipe-seam-line" />
          <span className="pipe-seam-caret">▾</span>
        </div>
    </Section>
  );
}
