"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { redline, editLetter, type RedlineResult, type Segment } from "@/lib/redline";
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
  // The source slug shown in the header: a sample's label, or the visitor's own copy.
  const [source, setSource] = useState(REDLINE_SAMPLES[0].label);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The bond page container; measured after render to anchor each mark's note left or right.
  const paperRef = useRef<HTMLDivElement | null>(null);

  const errId = useId();

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  // Static edge-flip: a note overflows off the right of the paper when its mark sits past the
  // paper's midline, so anchor those notes to the right edge instead. Computed by measurement (not
  // in the click handler) so it is correct for hover on desktop as well as tap on touch. Re-runs on
  // every fresh run (runId keys the paper's remount) and on a debounced window resize.
  useLayoutEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    const measure = () => {
      const pr = paper.getBoundingClientRect();
      const mid = pr.left + pr.width / 2;
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const gap = 0.35 * rootPx; // matches the note's 0.35rem offset in CSS
      const contentTop = pr.top + parseFloat(getComputedStyle(paper).paddingTop || "0");
      paper.querySelectorAll<HTMLElement>(".rl-mark").forEach((mark) => {
        const mr = mark.getBoundingClientRect();
        mark.classList.toggle("note-right", mr.left + mr.width / 2 > mid);
        // First-line marks: an above-anchored note rises into the paper's top padding and crowds
        // (shadow bleeds over) the top edge, so drop it below the mark. Flip when the above-note's top
        // would sit above where the body text begins. Computed from the mark's top and the note's
        // height (both stable whether the note is above or below), so re-measures never oscillate.
        const note = mark.querySelector<HTMLElement>(".rl-note");
        if (note) {
          const noteH = note.getBoundingClientRect().height;
          mark.classList.toggle("note-below", mr.top - gap - noteH < contentTop);
        }
      });
    };
    measure();
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [runId]);

  const run = (text: string): RedlineResult => {
    const next = redline(text);
    setResult(next);
    setRunId((n) => n + 1);
    return next;
  };

  const onMark = () => {
    track("redline_mark");
    setCopied(false);
    // Only relabel the source once the markup succeeds, so the slug never sits over an error.
    const next = run(input);
    if (next.ok) setSource("your copy, marked up");
  };
  const onExample = () => {
    const next = (sampleIdx + 1) % REDLINE_SAMPLES.length;
    setSampleIdx(next);
    setInput("");
    setCopied(false);
    setSource(REDLINE_SAMPLES[next].label);
    track("redline_example");
    run(REDLINE_SAMPLES[next].text);
  };

  const ok = result.ok ? result : null;

  const onCopyLetter = () => {
    if (!ok || ok.markCount === 0) return;
    // Guard the whole clipboard call: `navigator.clipboard` is undefined in non-secure contexts
    // and some in-app browsers (LinkedIn/Twitter webviews), where `?.writeText(...).catch()` would
    // throw on the chained .catch and abort the rest of this handler. Bail before claiming "copied".
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(editLetter(ok)).catch(() => {});
    track("redline_copy_letter");
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="reveal">
      <div className="change-bar border-y border-r border-hairline bg-card shadow-sm">
        {/* header: a manuscript slug line, not terminal chrome */}
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3">
          <span className="draft text-[0.74rem] text-muted">
            <span className="text-accent">redline</span> / {source.toLowerCase()}
          </span>
          <span className="draft text-[0.72rem] text-muted">client-side · nothing leaves the page</span>
        </div>

        {/* The marked page. Exposed to AT: the copy is real <del>/<ins> semantics and each mark is
            focusable with its reason wired via aria-describedby, so keyboard and screen-reader users
            reach the per-mark editorial notes (not just the once-per-run summary below). */}
        <div
          key={runId}
          ref={paperRef}
          onClick={(e) => {
            // Delegated tap-to-reveal for touch (marks also reveal on hover and on keyboard focus).
            // note-right is set by measurement (see useLayoutEffect), not here, so hover gets it too.
            const paper = e.currentTarget;
            const mark = (e.target as HTMLElement).closest<HTMLElement>(".rl-mark");
            const wasOpen = mark?.classList.contains("is-open") ?? false;
            // Only one note open at a time: clear every open mark first.
            paper.querySelectorAll(".rl-mark.is-open").forEach((el) => el.classList.remove("is-open"));
            // Outside-click, or a second tap on the open mark, leaves all notes closed.
            if (!mark || wasOpen) return;
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
            <p className="draft mb-3 text-[0.72rem] text-muted">tap or focus a mark for the reason</p>
            {ok.stats.length > 0 && (
              <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
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
              mark up a sample
            </button>
            <button
              type="button"
              onClick={onCopyLetter}
              disabled={!ok || ok.markCount === 0}
              className="draft inline-flex min-h-[44px] items-center rounded-sm border border-hairline px-5 text-[0.82rem] text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted"
            >
              {copied ? "copied" : "copy the edit letter"}
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
        // Each mark is a focus stop whose reason is announced via aria-describedby (the note is
        // present in the DOM even while visually collapsed, so AT reads it on focus). Focus-visible
        // also reveals the note for sighted keyboard users (see .rl-mark:focus-visible in globals.css).
        const noteId = `rl-note-${i}`;
        if (m.type === "del") {
          return (
            <span
              key={i}
              className="rl-mark"
              tabIndex={0}
              aria-describedby={noteId}
              style={{ animationDelay: delay }}
            >
              <del className="del">{m.text}</del>
              {m.suggestion && <ins className="ins"> {m.suggestion}</ins>}
              <span className="rl-note" id={noteId}>{m.note}</span>
            </span>
          );
        }
        return (
          <span
            key={i}
            className="rl-mark"
            tabIndex={0}
            aria-describedby={noteId}
            style={{ animationDelay: delay }}
          >
            <span className="flag">{m.text}</span>
            <span className="rl-note" id={noteId}>{m.note}</span>
          </span>
        );
      })}
    </>
  );
}
