// Redline Engine. Client-side copy markup (§ demo v2). Zero hosting cost, zero dependencies.
//
// Credibility rule (mirrors voice.ts): the marks are judged by professional writers. Every mark
// must be *demonstrably true* of the input. We only mark text that is actually present, and when a
// call is a judgment (passive voice, adverbs) we phrase the note as a question or a hint, never a
// verdict. No mark is ever invented.
//
// Pure + deterministic + browser-safe: no Node APIs, no randomness, no external packages. Same
// input always returns the same output. NO EM-DASHES in any user-facing string (detecting them in
// the *input* is a feature; producing them in *output* is forbidden).

export type RedlineCategory =
  | "cliche" | "hedge" | "emdash" | "antithesis" | "adverb" | "opener" | "passive" | "buzzword";

export type Mark = {
  text: string;                 // the exact substring from the input this mark covers
  type: "del" | "flag";         // del = suggest cutting/replacing (struck); flag = second look (dotted)
  category: RedlineCategory;
  note: string;                 // short reason, sentence case, no em-dash
  suggestion?: string;          // optional concrete replacement (UI renders as an ins after the del)
};

export type Segment =
  | { kind: "text"; text: string }
  | { kind: "mark"; mark: Mark };

export type RedlineStat = { category: RedlineCategory; count: number; label: string };

export type RedlineResult =
  | { ok: false; message: string }
  | {
      ok: true;
      segments: Segment[];   // FULL input tokenized in order; joining every segment's text reproduces
      stats: RedlineStat[];  //   the original input EXACTLY (whitespace preserved)
      markCount: number;
      wordCount: number;
      summary: string;       // ONE sentence for a screen-reader aria-live region
      verdict: string;       // one short honest line, terminal-style closing result
    };

// The successful shape the UI renders (and editLetter summarizes).
export type RedlineOk = Extract<RedlineResult, { ok: true }>;

const MIN_WORDS = 12;
const CAP = 4000; // detection is capped so a giant paste can't hang the UI; text past it stays plain

// -- dictionary ------------------------------------------------------------------------------------
// Seeded from lib/voice.ts and components/EditingField.tsx (its CUT list) and extended. Single-word
// jargon is "buzzword"; multi-word filler is "cliche". Suggestions only where one safe replacement
// exists. Tuple is [phrase, suggestion?].

const BUZZWORDS: [string, string?][] = [
  ["leverage", "use"], ["synergy"], ["robust", "solid"], ["seamless", "smooth"], ["unpack"],
  ["revolutionary"], ["elevate", "improve"], ["unlock"], ["empower"], ["supercharge"],
  ["delve"], ["tapestry"], ["paradigm"], ["holistic"], ["streamline", "simplify"], ["turnkey"],
  ["synergize"], ["operationalize"], ["ideate"], ["learnings"], ["frictionless"],
];

const CLICHES: [string, string?][] = [
  ["in today's fast-paced"], ["in today's landscape"], ["fast-paced"], ["digital landscape"],
  ["best-in-class"], ["circle back", "follow up"], ["moving forward"], ["low-hanging fruit"],
  ["at scale"], ["thought leadership"], ["game-changing"], ["deep dive"], ["cutting-edge"],
  ["world-class"], ["in the realm of"], ["navigate the complexities"], ["ever-evolving"],
  ["actionable insights"], ["move the needle"], ["north star"], ["value-add"], ["mission-critical"],
  ["next-level"], ["bleeding-edge"], ["take it to the next level"], ["think outside the box"],
  ["boil the ocean"], ["touch base"], ["drill down"], ["state-of-the-art"], ["value proposition"],
  ["core competencies"], ["core competency"], ["secret sauce"], ["special sauce"],
  ["hit the ground running"], ["on the same page"], ["raise the bar"], ["table stakes"],
  ["win-win"], ["best of breed"], ["future-proof"], ["next-generation"], ["end-to-end"],
];

const HEDGES: [string, string?][] = [
  ["very"], ["really"], ["just"], ["quite"], ["actually"], ["basically"], ["literally"],
  ["simply"], ["somewhat"], ["rather"], ["a bit"], ["kind of"], ["sort of"], ["in order to", "to"],
];

// Sentence-initial filler. type "del" for pure filler that lifts out cleanly, "flag" for openers
// that are merely weak. Tested only at sentence starts (see openerCandidates).
const OPENERS: [string, "del" | "flag"][] = [
  ["there is", "flag"], ["there are", "flag"], ["there's", "flag"],
  ["it is important to note", "del"], ["it's important to note", "del"],
  ["as we all know", "del"], ["needless to say", "del"],
  ["when it comes to", "flag"], ["in today's", "flag"],
];

// -ly words that are not manner adverbs (from voice.ts LY_STOPLIST, extended). Excluded so the
// adverb marks stay honest.
const LY_STOPLIST = new Set([
  "only", "family", "reply", "apply", "supply", "early", "ally", "rely", "holy", "ugly", "fully",
  "italy", "july", "assembly", "imply", "comply", "multiply", "likely", "wobbly", "bubbly", "gnarly",
]);

// Passive heuristic pieces. Conservative on purpose: false positives here are costly.
const BE = new Set(["is", "are", "was", "were", "be", "been", "being"]);
const IRREG_PARTICIPLE = new Set([
  "made", "done", "given", "taken", "seen", "known", "written", "built", "sent", "held", "shown",
]);
// words that end in "ed" but are not participles, so passive never fires on them
const NOT_PARTICIPLE = new Set([
  "speed", "indeed", "embed", "exceed", "proceed", "succeed", "sacred", "hundred", "need", "feed",
  "seed", "breed", "greed", "tweed", "steed",
]);

// -- match plumbing --------------------------------------------------------------------------------

type Candidate = {
  start: number;
  end: number;
  type: "del" | "flag";
  category: RedlineCategory;
  note: string;
  suggestion?: string;
};

// Tie-break priority when two candidates cover the exact same span (lower wins). Keeps output
// deterministic and picks the more useful mark (a "del" cut over a soft "flag").
const PRIORITY: Record<RedlineCategory, number> = {
  cliche: 0, buzzword: 1, antithesis: 2, opener: 3, hedge: 4, passive: 5, adverb: 6, emdash: 7,
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build a whole-phrase source: alpha/numeric boundaries so we never mark a substring of a bigger
// word, whitespace between words is flexible, and either apostrophe glyph matches.
function phraseSource(phrase: string): string {
  const parts = phrase.split(/\s+/).map((tok) => escapeRegExp(tok).replace(/['’]/g, "['’]"));
  return "(?<![A-Za-z0-9'’])" + parts.join("\\s+") + "(?![A-Za-z0-9'’])";
}

// Precompute sources once (pure). Fresh RegExp objects are made per call so global lastIndex never
// leaks between calls.
type DictEntry = { source: string; category: RedlineCategory; note: string; suggestion?: string };
const DICT: DictEntry[] = [
  ...BUZZWORDS.map(([p, s]) => ({
    source: phraseSource(p), category: "buzzword" as const, note: "jargon, say it plainly", suggestion: s,
  })),
  ...CLICHES.map(([p, s]) => ({
    source: phraseSource(p), category: "cliche" as const, note: "cliche, cut it", suggestion: s,
  })),
  ...HEDGES.map(([p, s]) => ({
    source: phraseSource(p),
    category: "hedge" as const,
    note: s ? "wordy, tighten it" : "hedge, cut it",
    suggestion: s,
  })),
];

function dictCandidates(text: string): Candidate[] {
  const out: Candidate[] = [];
  for (const e of DICT) {
    const re = new RegExp(e.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      out.push({
        start: m.index, end: m.index + m[0].length,
        type: e.category === "hedge" || e.category === "cliche" || e.category === "buzzword" ? "del" : "flag",
        category: e.category, note: e.note, suggestion: e.suggestion,
      });
      if (m.index === re.lastIndex) re.lastIndex++; // guard against a zero-width match
    }
  }
  return out;
}

function emdashCandidates(text: string): Candidate[] {
  const out: Candidate[] = [];
  const re = /—|(?<= )--(?= )/g; // the literal em-dash char, or a spaced "--"
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    out.push({
      start: m.index, end: m.index + m[0].length, type: "flag", category: "emdash",
      note: "em-dash. this site's voice avoids them.",
    });
  }
  return out;
}

function antithesisCandidates(text: string): Candidate[] {
  const out: Candidate[] = [];
  const note = "antithesis, a common AI tell.";
  const patterns = [
    /\bit['’]?s not\b[^.?!]*,\s*it['’]?s\b/gi, // "it's not X, it's Y"
    /\bnot only\b[^.?!]*\bbut also\b/gi,       // "not only X but also Y"
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      out.push({ start: m.index, end: m.index + m[0].length, type: "flag", category: "antithesis", note });
    }
  }
  return out;
}

function openerCandidates(text: string): Candidate[] {
  const out: Candidate[] = [];
  // sentence starts: index 0, and the first non-space after any .!? (optionally closing quote).
  const starts = [0];
  const boundary = /[.!?]["'”’)]?\s+/g;
  let b: RegExpExecArray | null;
  while ((b = boundary.exec(text))) starts.push(b.index + b[0].length);

  for (const start of starts) {
    for (const [phrase, type] of OPENERS) {
      const re = new RegExp("^" + phraseSource(phrase), "i");
      const m = re.exec(text.slice(start));
      if (m) {
        out.push({ start, end: start + m[0].length, type, category: "opener", note: "weak opener" });
        break; // one opener per sentence start is enough
      }
    }
  }
  return out;
}

function isParticiple(w: string): boolean {
  if (IRREG_PARTICIPLE.has(w)) return true;
  return w.length >= 5 && w.endsWith("ed") && !NOT_PARTICIPLE.has(w);
}

// Tokenize once, reused by adverb + passive detectors.
function tokens(text: string): { lo: string; start: number; end: number }[] {
  const out: { lo: string; start: number; end: number }[] = [];
  const re = /[A-Za-z][A-Za-z'’-]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push({ lo: m[0].toLowerCase(), start: m.index, end: m.index + m[0].length });
  return out;
}

function adverbCandidates(toks: { lo: string; start: number; end: number }[]): Candidate[] {
  const out: Candidate[] = [];
  for (const t of toks) {
    if (t.lo.length > 4 && t.lo.endsWith("ly") && !LY_STOPLIST.has(t.lo)) {
      out.push({ start: t.start, end: t.end, type: "flag", category: "adverb", note: "adverb, often trimmable" });
    }
  }
  return out;
}

function passiveCandidates(toks: { lo: string; start: number; end: number }[]): Candidate[] {
  const out: Candidate[] = [];
  for (let i = 0; i < toks.length; i++) {
    if (!BE.has(toks[i].lo)) continue;
    // a "to be" verb followed within 2 words by a past participle
    for (let j = i + 1; j <= i + 2 && j < toks.length; j++) {
      if (isParticiple(toks[j].lo)) {
        out.push({ start: toks[i].start, end: toks[j].end, type: "flag", category: "passive", note: "passive voice?" });
        break;
      }
    }
  }
  return out;
}

// Resolve overlaps: process left to right, longest/most-specific match wins, no character is ever
// double-marked. Deterministic sort makes the pick stable.
function resolve(cands: Candidate[]): Candidate[] {
  cands.sort((a, b) =>
    a.start - b.start ||
    (b.end - b.start) - (a.end - a.start) ||
    PRIORITY[a.category] - PRIORITY[b.category] ||
    a.note.localeCompare(b.note));
  const accepted: Candidate[] = [];
  let lastEnd = -1;
  for (const c of cands) {
    if (c.start >= lastEnd) {
      accepted.push(c);
      lastEnd = c.end;
    }
  }
  return accepted;
}

// -- output ----------------------------------------------------------------------------------------

const STAT_ORDER: RedlineCategory[] = [
  "cliche", "buzzword", "hedge", "opener", "antithesis", "adverb", "passive", "emdash",
];
const STAT_LABEL: Record<RedlineCategory, string> = {
  cliche: "cliches", buzzword: "buzzwords", hedge: "hedges", opener: "weak openers",
  antithesis: "antithesis", adverb: "adverbs", passive: "passive hints", emdash: "em-dashes",
};

function countWords(text: string): number {
  return (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;
}

function buildVerdict(markCount: number, wordCount: number): string {
  if (markCount === 0) return "Clean copy. Nothing to strike.";
  const ratio = (markCount / Math.max(wordCount, 1)) * 100;
  if (ratio < 3) return "Mostly clean. A few marks to tighten.";
  if (ratio < 8) return "Solid, with some filler to cut.";
  return "Heavy on filler. Cut the marked lines and read it again.";
}

export function redline(raw: string): RedlineResult {
  const wordCount = countWords(raw.trim());
  if (wordCount < MIN_WORDS) {
    return { ok: false, message: "paste a sentence or two of real copy and i'll mark it up." };
  }

  // Detect on the first CAP chars only; anything past it is emitted as trailing plain text so the
  // round-trip still reproduces the full input.
  const scope = raw.slice(0, CAP);
  const toks = tokens(scope);
  const cands = [
    ...dictCandidates(scope),
    ...emdashCandidates(scope),
    ...antithesisCandidates(scope),
    ...openerCandidates(scope),
    ...adverbCandidates(toks),
    ...passiveCandidates(toks),
  ];
  const marks = resolve(cands).sort((a, b) => a.start - b.start);

  // Tokenize the FULL input in order. Concatenating every segment's text reproduces raw exactly.
  const segments: Segment[] = [];
  let cursor = 0;
  for (const m of marks) {
    if (m.start > cursor) segments.push({ kind: "text", text: raw.slice(cursor, m.start) });
    const mark: Mark = { text: raw.slice(m.start, m.end), type: m.type, category: m.category, note: m.note };
    if (m.suggestion) mark.suggestion = m.suggestion;
    segments.push({ kind: "mark", mark });
    cursor = m.end;
  }
  if (cursor < raw.length) segments.push({ kind: "text", text: raw.slice(cursor) });

  const markCount = marks.length;
  const counts = new Map<RedlineCategory, number>();
  for (const m of marks) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
  const stats: RedlineStat[] = STAT_ORDER
    .filter((c) => counts.has(c))
    .map((c) => ({ category: c, count: counts.get(c)!, label: STAT_LABEL[c] }));

  const summary =
    markCount === 0
      ? `No marks in ${wordCount} words. Clean copy.`
      : `Marked ${markCount} spot${markCount === 1 ? "" : "s"} in ${wordCount} words: ` +
        stats.map((s) => `${s.count} ${s.label}`).join(", ") + ".";

  return {
    ok: true,
    segments,
    stats,
    markCount,
    wordCount,
    summary,
    verdict: buildVerdict(markCount, wordCount),
  };
}

// -- edit letter -----------------------------------------------------------------------------------
// A plain-text note a visitor can copy: the summary, one line per mark in document order, and the
// verdict. It is itself a small writing sample, so it follows the copy bar: sentence case, no
// em-dash. Pure (no DOM, no clipboard) so it stays unit-tested; the component owns the clipboard.

export function editLetter(result: RedlineOk): string {
  const header = "redline / syedhamza.xyz";
  const marks = result.segments.flatMap((s) => (s.kind === "mark" ? [s.mark] : []));

  if (marks.length === 0) {
    // Zero-mark case: a short, honest "no marks" letter. Never throws.
    return [header, result.summary, result.verdict].join("\n");
  }

  // "strike" for a cut, "flag" for a second look. Plain hyphen separator, never an em-dash. The
  // marked phrase can itself contain an em-dash (that is what the em-dash flag catches), so name it
  // rather than reprint the glyph. This keeps the letter em-dash-free like the rest of the voice.
  const lines = marks.map((m) => {
    const verb = m.type === "del" ? "strike" : "flag";
    const phrase = m.text.trim().replace(/—/g, "em-dash");
    return `${verb} "${phrase}" - ${m.note}`;
  });

  return [header, result.summary, "", ...lines, "", result.verdict].join("\n");
}
