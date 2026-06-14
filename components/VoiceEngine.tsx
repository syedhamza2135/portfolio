"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { analyze } from "@/lib/voice";
import { SAMPLES } from "@/lib/samples";
import { track } from "@/lib/track";

type Status = "idle" | "running" | "done" | "error";

type TermLine =
  | { kind: "cmd" | "dim" | "brace" | "ok" | "rule" | "blank"; text?: string }
  | { kind: "kv"; k: string; v: string };

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildLines(
  label: string,
  source: "example" | "custom",
  r: Extract<ReturnType<typeof analyze>, { ok: true }>
): TermLine[] {
  const lines: TermLine[] = [
    { kind: "cmd", text: source === "example" ? `analyze --sample "${label}"` : "analyze --stdin" },
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

export default function VoiceEngine() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [source, setSource] = useState<"example" | "custom">("example");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [lines, setLines] = useState<TermLine[]>([]);
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
      const built = buildLines(label, src, result);
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
                className="mono text-[0.7rem] text-term-muted hover:text-term-bright"
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

        {/* streamed output — aria-hidden; the SR summary is announced once below */}
        <div
          aria-hidden="true"
          onClick={skip}
          className="mono min-h-[19rem] cursor-default space-y-1 px-4 py-4 text-[0.82rem] leading-relaxed sm:min-h-[20rem]"
        >
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

        {/* interactive controls (§6.2 state 4) */}
        <div className="border-t border-term-border bg-term-panel px-4 py-4">
          <label htmlFor="voice-input" className="mono block text-[0.72rem] text-term-muted">
            paste your own writing
          </label>
          <textarea
            id="voice-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder="a paragraph or two — at least 50 words…"
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
              className="mono inline-flex min-h-[44px] items-center rounded-md bg-term-teal px-4 text-[0.78rem] font-medium text-term-bg transition-opacity hover:opacity-90"
            >
              analyze my writing
            </button>
            <button
              type="button"
              onClick={onTryExample}
              className="mono inline-flex min-h-[44px] items-center rounded-md border border-term-border px-4 text-[0.78rem] text-term-text transition-colors hover:text-term-bright"
            >
              try another example
            </button>
          </div>
        </div>
      </div>

      {/* announced once on completion, never line-by-line (§7.5) */}
      <div className="sr-only" aria-live="polite">
        {summary}
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
