"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { analyze } from "@/lib/voice";
import { SAMPLES } from "@/lib/samples";
import { track } from "@/lib/track";

type Status = "idle" | "running" | "done" | "error";

type TermLine =
  | { kind: "cmd" | "dim" | "brace" | "ok" | "rule" | "blank" | "src"; text?: string }
  | { kind: "kv"; k: string; v: string };

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildLines(
  label: string,
  source: "example" | "custom",
  text: string,
  r: Extract<ReturnType<typeof analyze>, { ok: true }>
): TermLine[] {
  const lines: TermLine[] = [
    { kind: "cmd", text: source === "example" ? `analyze --sample "${label}"` : "analyze --stdin" },
    // Echo the source being read so the analysis is legible — you see the text, then its profile.
    ...(source === "example" ? [{ kind: "src", text } as TermLine] : []),
    { kind: "dim", text: `parsing ${r.metrics.wordCount} words · ${r.metrics.sentenceCount} sentences` },
    { kind: "dim", text: "measuring rhythm · address · density" },
    { kind: "blank" },
    { kind: "brace", text: "voice_profile {" },
    ...r.profile.map((p): TermLine => ({ kind: "kv", k: p.key, v: p.value })),
    { kind: "brace", text: "}" },
    { kind: "blank" },
    { kind: "dim", text: `compiling ${r.rules.length} voice rules` },
    ...r.rules.map((rule): TermLine => ({ kind: "rule", text: rule })),
    { kind: "blank" },
    { kind: "ok", text: r.compiled },
  ];
  return lines;
}

// The first sample, pre-built so its full output can reserve the terminal's height
// from the initial render (SSR included). `analyze`/`buildLines` are pure, so this is
// deterministic and hydration-safe. Streaming reveals into space that already exists.
function initialLines(): TermLine[] {
  const r = analyze(SAMPLES[0].text);
  return r.ok ? buildLines(SAMPLES[0].label, "example", SAMPLES[0].text, r) : [];
}

export default function VoiceEngine() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [source, setSource] = useState<"example" | "custom">("example");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [lines, setLines] = useState<TermLine[]>(initialLines);
  const [shown, setShown] = useState(0);
  const [summary, setSummary] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const pendingSummary = useRef("");
  const errId = useId();

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  const run = useCallback(
    (text: string, label: string, src: "example" | "custom") => {
      clearTimers();
      const result = analyze(text);
      if (!result.ok) {
        setStatus("error");
        setError(result.message);
        return;
      }
      const built = buildLines(label, src, text, result);
      pendingSummary.current = result.summary;
      setSource(src);
      setError("");
      setLines(built);
      setSummary("");

      if (reduceMotion()) {
        setShown(built.length);
        setStatus("done");
        setSummary(result.summary);
        return;
      }

      setShown(0);
      setStatus("running");
      const step = Math.min(380, Math.max(170, Math.floor(4400 / built.length)));
      built.forEach((_, i) => {
        const t = window.setTimeout(() => {
          setShown(i + 1);
          if (i + 1 === built.length) {
            setStatus("done");
            setSummary(result.summary);
          }
        }, step * (i + 1));
        timers.current.push(t);
      });
    },
    [clearTimers]
  );

  const skip = useCallback(() => {
    if (status !== "running") return;
    clearTimers();
    setShown(lines.length);
    setStatus("done");
    setSummary(pendingSummary.current);
  }, [status, lines.length, clearTimers]);

  // Auto-run once on first viewport entry (§6.1). Reduced-motion → final state immediately.
  useEffect(() => {
    if (started.current) return;
    if (reduceMotion()) {
      started.current = true;
      run(SAMPLES[0].text, SAMPLES[0].label, "example");
      return;
    }
    const el = cardRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      started.current = true;
      run(SAMPLES[0].text, SAMPLES[0].label, "example");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && !started.current) {
            started.current = true;
            run(SAMPLES[0].text, SAMPLES[0].label, "example");
            track("demo_autorun");
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [run]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const onAnalyze = () => {
    track("demo_analyze");
    run(input, "your text", "custom");
  };
  const onTryExample = () => {
    const next = (sampleIdx + 1) % SAMPLES.length;
    setSampleIdx(next);
    setInput("");
    track("demo_try_example");
    run(SAMPLES[next].text, SAMPLES[next].label, "example");
  };

  const visible = lines.slice(0, shown);

  return (
    <div className="reveal">
      <div
        ref={cardRef}
        className="overflow-hidden rounded-xl border border-term-border bg-term-bg shadow-lg"
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-term-border bg-term-panel px-4 py-2.5">
          <span className="mono text-[0.72rem] text-term-muted">
            <span className="text-term-teal">voice-engine</span> / built in production
          </span>
          <span className="flex items-center gap-3">
            {status === "running" && (
              <button
                type="button"
                onClick={skip}
                className="mono text-[0.7rem] text-term-muted hover:text-term-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-teal"
              >
                skip ▸
              </button>
            )}
            <span className="mono inline-flex items-center gap-1.5 text-[0.72rem] text-term-text">
              <span aria-hidden="true" className="text-term-teal">
                ●
              </span>
              live demo
            </span>
          </span>
        </div>

        {/* streamed output — aria-hidden; the SR summary is announced once below.
            Two layers share one grid cell: an invisible sizer holds the FULL output so
            the cell takes its final height up front, and the visible layer streams lines
            into that already-reserved space. This is what keeps the page below from being
            pushed down as lines appear (no cumulative layout shift). */}
        <div
          aria-hidden="true"
          onClick={skip}
          className="mono grid min-h-[19rem] cursor-default px-4 py-4 text-[0.82rem] leading-relaxed sm:min-h-[20rem]"
        >
          {/* height reservation — laid out but never painted; wraps identically to the
              visible layer because both share the cell's width and type styles */}
          <div className="invisible col-start-1 row-start-1 space-y-1">
            {lines.map((line, i) => (
              <TerminalRow key={i} line={line} />
            ))}
          </div>

          {/* visible streaming layer */}
          <div className="col-start-1 row-start-1 space-y-1">
            {visible.map((line, i) => (
              <TerminalRow key={i} line={line} />
            ))}
            {status === "running" && (
              <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-term-teal" />
            )}
            {status === "error" && (
              <div className="text-[#e0a3a3]">
                <span className="text-term-muted">!</span> {error}
              </div>
            )}
          </div>
        </div>

        {/* interactive controls (§6.2 state 4) */}
        <div className="border-t border-term-border bg-term-panel px-4 py-4">
          <label htmlFor="voice-input" className="mono block text-[0.72rem] text-term-muted">
            paste your own writing
          </label>
          <textarea
            id="voice-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onAnalyze();
              }
            }}
            rows={3}
            spellCheck={false}
            placeholder="a paragraph or two, at least 50 words…"
            aria-keyshortcuts="Control+Enter"
            aria-describedby={status === "error" ? errId : undefined}
            aria-invalid={status === "error"}
            className="mono mt-2 w-full resize-y rounded-md border border-term-border bg-term-bg px-3 py-2 text-[0.8rem] text-term-bright placeholder:text-term-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-term-teal"
          />
          {status === "error" && (
            <p id={errId} className="mono mt-2 text-[0.72rem] text-[#e0a3a3]">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onAnalyze}
              className="mono inline-flex min-h-[44px] items-center rounded-md bg-term-teal px-4 text-[0.78rem] font-medium text-term-bg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-teal"
            >
              analyze my writing
            </button>
            <button
              type="button"
              onClick={onTryExample}
              className="mono inline-flex min-h-[44px] items-center rounded-md border border-term-border px-4 text-[0.78rem] text-term-text transition-colors hover:text-term-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-teal"
            >
              try another example
            </button>
          </div>
        </div>
      </div>

      {/* announced once on completion, never line-by-line (§7.5). Errors are announced too,
          since the terminal error copy lives in the aria-hidden region and focus is on the button. */}
      <div className="sr-only" role="status" aria-live="polite">
        {status === "error" ? error : summary}
      </div>
    </div>
  );
}

function TerminalRow({ line }: { line: TermLine }) {
  switch (line.kind) {
    case "blank":
      return <div className="h-2" />;
    case "cmd":
      return (
        <div>
          <span className="text-term-teal">$</span>{" "}
          <span className="text-term-bright">{line.text}</span>
        </div>
      );
    case "dim":
      return <div className="text-term-muted">{line.text}</div>;
    case "src":
      return (
        <div className="my-1 border-l-2 border-term-teal/50 pl-3 text-term-muted">
          <span className="text-term-muted/70">“</span>
          {line.text}
          <span className="text-term-muted/70">”</span>
        </div>
      );
    case "brace":
      return <div className="text-term-text">{line.text}</div>;
    case "kv":
      return (
        <div className="flex gap-2 pl-3">
          <span className="w-28 shrink-0 text-term-muted">{line.k}</span>
          <span className="text-term-text">{line.v}</span>
        </div>
      );
    case "rule":
      return (
        <div className="flex gap-2">
          <span className="shrink-0 text-term-teal">→</span>
          <span className="text-term-text">{line.text}</span>
        </div>
      );
    case "ok":
      return <div className="font-medium text-term-teal">{line.text}</div>;
  }
}
