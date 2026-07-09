"use client";

import { useId, useState } from "react";
import { redline, type RedlineResult, type Segment } from "@/lib/redline";
import { REDLINE_SAMPLES } from "@/lib/samples";
import { track } from "@/lib/track";

// The interactive redline. A visitor pastes marketing copy onto a bond page and the editor marks it
// up: clichés struck in red, hedges cut, AI tells and passive voice flagged in ink-blue, each mark
// carrying a one-line reason. Pure client-side (lib/redline.ts) so it costs nothing to host and every
// mark is demonstrably true of the input (the site's credibility rule §6.4). This is the hero's
// static "draft → in voice" figure made real: the craft the site sells, running in your hands.
//
// The first sample is redlined during render, so the marked page is in the server HTML (visible with
// JS off, indexable) and the settle animation is pure CSS. Re-running keys a remount to replay it.

export default function RedlineTool() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<RedlineResult>(() => redline(REDLINE_SAMPLES[0].text));
  const [runId, setRunId] = useState(0);

  const errId = useId();

  const run = (text: string) => {
    setResult(redline(text));
    setRunId((n) => n + 1);
  };

  const onMark = () => {
    track("redline_mark");
    run(input);
  };
  const onExample = () => {
    const next = (sampleIdx + 1) % REDLINE_SAMPLES.length;
    setSampleIdx(next);
    setInput("");
    track("redline_example");
    run(REDLINE_SAMPLES[next].text);
  };

  const ok = result.ok ? result : null;

  return (
    <div className="reveal">
      <div className="change-bar border-y border-r border-hairline bg-card shadow-sm">
        {/* header: a manuscript slug line, not terminal chrome */}
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3">
          <span className="draft text-[0.74rem] text-muted">
            <span className="text-accent">redline</span> / your copy, marked up
          </span>
          <span className="draft text-[0.72rem] text-faint">client-side · nothing leaves the page</span>
        </div>

        {/* the marked page — decorative for SR; the summary + verdict below carry the meaning */}
        <div
          key={runId}
          aria-hidden="true"
          onClick={(e) => {
            // Delegated tap-to-reveal (the paper is aria-hidden, so no ARIA/tabindex here).
            const paper = e.currentTarget;
            const mark = (e.target as HTMLElement).closest<HTMLElement>(".rl-mark");
            const wasOpen = mark?.classList.contains("is-open") ?? false;
            // Only one note open at a time: clear every open mark first.
            paper.querySelectorAll(".rl-mark.is-open").forEach((el) => el.classList.remove("is-open"));
            // Outside-click, or a second tap on the open mark, leaves all notes closed.
            if (!mark || wasOpen) return;
            // Flip the note to the right edge when the mark sits past the paper's midline.
            const mr = mark.getBoundingClientRect();
            const pr = paper.getBoundingClientRect();
            mark.classList.toggle("note-right", mr.left + mr.width / 2 > pr.left + pr.width / 2);
            mark.classList.add("is-open");
          }}
          className="rl-paper rl-animate min-h-[13rem] px-5 py-6 text-ink sm:px-7"
        >
          {!result.ok && <span className="draft text-muted">{result.message}</span>}
          {ok && <MarkedCopy segments={ok.segments} />}
        </div>

        {/* legend + verdict */}
        {ok && (
          <div className="border-t border-hairline bg-shell/60 px-5 py-4 sm:px-7">
            {ok.stats.length > 0 && (
              <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1" aria-hidden="true">
                {ok.stats.map((s) => (
                  <li key={s.category} className="draft text-[0.72rem] text-muted">
                    <span className="text-accent">{s.count}</span> {s.label}
                  </li>
                ))}
              </ul>
            )}
            <p className="draft text-[0.86rem] text-ink">
              <span className="text-accent">✎</span> {ok.verdict}
            </p>
          </div>
        )}

        {/* controls */}
        <div className="border-t border-hairline bg-card px-5 py-4 sm:px-7">
          <label htmlFor="redline-input" className="draft block text-[0.74rem] text-muted">
            paste your own copy
          </label>
          <textarea
            id="redline-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onMark();
              }
            }}
            rows={3}
            spellCheck={false}
            placeholder="a headline, a landing page, an about section…"
            aria-keyshortcuts="Control+Enter"
            aria-describedby={!result.ok ? errId : undefined}
            aria-invalid={!result.ok}
            className="draft mt-2 w-full resize-y rounded-sm border border-hairline bg-shell px-3 py-2 text-[0.9rem] text-ink placeholder:text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          />
          {!result.ok && (
            <p id={errId} className="draft mt-2 text-[0.74rem] text-accent">
              {result.message}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onMark}
              className="draft inline-flex min-h-[44px] items-center rounded-sm bg-cta-bg px-5 text-[0.82rem] font-medium text-cta-text transition-transform hover:-translate-y-0.5"
            >
              mark it up
            </button>
            <button
              type="button"
              onClick={onExample}
              className="draft inline-flex min-h-[44px] items-center rounded-sm border border-hairline px-5 text-[0.82rem] text-muted transition-colors hover:text-ink"
            >
              try bad copy
            </button>
          </div>
        </div>
      </div>

      {/* announced once per run, never mark-by-mark (§7.5) */}
      <div className="sr-only" aria-live="polite">
        {ok ? `${ok.summary} ${ok.verdict}` : !result.ok ? result.message : ""}
      </div>
    </div>
  );
}

function MarkedCopy({ segments }: { segments: Segment[] }) {
  let markN = 0;
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
        const m = seg.mark;
        const delay = `${markN++ * 55}ms`;
        if (m.type === "del") {
          return (
            <span key={i} className="rl-mark" style={{ animationDelay: delay }}>
              <del className="del">{m.text}</del>
              {m.suggestion && <ins className="ins"> {m.suggestion}</ins>}
              <span className="rl-note">{m.note}</span>
            </span>
          );
        }
        return (
          <span key={i} className="rl-mark" style={{ animationDelay: delay }}>
            <span className="flag">{m.text}</span>
            <span className="rl-note">{m.note}</span>
          </span>
        );
      })}
    </>
  );
}
