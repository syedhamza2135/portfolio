// Voice Engine — client-side heuristics (§6.3). Zero hosting cost, zero dependencies.
//
// Credibility rule (§6.4): the demo is judged by professional writers. Every line of output
// must be *demonstrably true* of the input. We measure structure (rhythm, address, density)
// and never claim unfalsifiable qualities like "warm" or "authoritative".

export interface VoiceMetrics {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLen: number;
  sentenceStdev: number;
  variance: "low" | "moderate" | "high";
  contractionCount: number;
  contractionPer: number; // words per contraction, 0 = none
  person: "second" | "first" | "third";
  secondCount: number;
  firstCount: number;
  adverbLyCount: number;
  adverbLyPct: number;
  emDashCount: number;
  semicolonCount: number;
  questionCount: number;
  questionPct: number;
  avgParagraphLen: number;
}

export interface ProfileLine {
  key: string;
  value: string;
}

export type AnalysisResult =
  | { ok: false; reason: "too_short"; message: string }
  | { ok: false; reason: "not_prose"; message: string }
  | {
      ok: true;
      metrics: VoiceMetrics;
      profile: ProfileLine[];
      rules: string[];
      compiled: string;
      summary: string; // single sentence for aria-live (announced once, §7.5)
    };

const MIN_WORDS = 50;

const FIRST_PERSON = ["i", "i'm", "i've", "i'll", "i'd", "we", "we're", "we've", "we'll", "our", "ours", "us", "my", "mine", "me"];
const SECOND_PERSON = ["you", "you're", "you've", "you'll", "you'd", "your", "yours", "yourself"];
// Common -ly words that aren't manner adverbs — excluded so the count stays honest.
const LY_STOPLIST = new Set(["only", "family", "reply", "apply", "supply", "early", "ally", "rely", "holy", "ugly", "fully", "italy", "july", "assembly", "supply", "imply", "comply", "multiply"]);

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'’-]*/g) ?? [];
}

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z"'(“])|(?<=[.!?])$/)
    .map((s) => s.trim())
    .filter((s) => /[a-z]/i.test(s));
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function looksLikeCodeOrList(text: string): boolean {
  const w = words(text).length || 1;
  const codeSignals = (text.match(/=>|[{}();<>]|\bfunction\b|\bconst\b|\blet\b|\bimport\b|\breturn\b|\bclass\b|::/g) ?? []).length;
  if (codeSignals / w > 0.12) return true;

  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 3) {
    const listLines = lines.filter((l) => /^([-*•·]|\d+[.)])\s/.test(l)).length;
    if (listLines / lines.length > 0.5) return true;
  }
  return false;
}

function round(n: number, d = 0): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export function analyze(raw: string): AnalysisResult {
  const text = raw.trim();
  const w = words(text);
  const wordCount = w.length;

  if (wordCount < MIN_WORDS) {
    return {
      ok: false,
      reason: "too_short",
      message: `give me a little more to work with, about ${MIN_WORDS} words (${wordCount} so far). a paragraph or two is plenty.`,
    };
  }
  if (looksLikeCodeOrList(text)) {
    return {
      ok: false,
      reason: "not_prose",
      message: "this looks like code or a bullet list. paste a few sentences of prose and i'll read the voice.",
    };
  }

  const sents = sentences(text);
  const sentenceCount = Math.max(sents.length, 1);
  const lens = sents.map((s) => (s.match(/[a-z][a-z'’-]*/gi) ?? []).length).filter((n) => n > 0);
  const avgSentenceLen = lens.reduce((a, b) => a + b, 0) / Math.max(lens.length, 1);
  const stdev = Math.sqrt(
    lens.reduce((a, b) => a + (b - avgSentenceLen) ** 2, 0) / Math.max(lens.length, 1)
  );
  const cv = stdev / Math.max(avgSentenceLen, 1);
  const variance: VoiceMetrics["variance"] = cv < 0.35 ? "low" : cv < 0.6 ? "moderate" : "high";

  const contractionCount = (text.match(/\b[a-z]+['’](s|re|ve|ll|d|t|m)\b|\b[a-z]+n['’]t\b/gi) ?? []).length;
  const contractionPer = contractionCount ? round(wordCount / contractionCount) : 0;

  const firstCount = w.filter((x) => FIRST_PERSON.includes(x)).length;
  const secondCount = w.filter((x) => SECOND_PERSON.includes(x)).length;
  const person: VoiceMetrics["person"] =
    secondCount >= firstCount && secondCount >= 2
      ? "second"
      : firstCount > secondCount && firstCount >= 2
        ? "first"
        : "third";

  const adverbLyCount = w.filter((x) => x.length > 4 && x.endsWith("ly") && !LY_STOPLIST.has(x)).length;
  const adverbLyPct = round((adverbLyCount / wordCount) * 100, 1);

  const emDashCount = (text.match(/—|--|\s-\s/g) ?? []).length;
  const semicolonCount = (text.match(/;/g) ?? []).length;
  const questionCount = sents.filter((s) => s.trim().endsWith("?")).length;
  const questionPct = round((questionCount / sentenceCount) * 100);

  const paras = paragraphs(text);
  const avgParagraphLen = round(wordCount / Math.max(paras.length, 1));

  const metrics: VoiceMetrics = {
    wordCount,
    sentenceCount,
    avgSentenceLen: round(avgSentenceLen, 1),
    sentenceStdev: round(stdev, 1),
    variance,
    contractionCount,
    contractionPer,
    person,
    secondCount,
    firstCount,
    adverbLyCount,
    adverbLyPct,
    emDashCount,
    semicolonCount,
    questionCount,
    questionPct,
    avgParagraphLen,
  };

  const addressText =
    person === "second"
      ? 'second person: direct address ("you")'
      : person === "first"
        ? 'first person ("I" / "we")'
        : "third person: impersonal";

  const contractionText =
    contractionCount === 0
      ? "none, formal register"
      : contractionPer <= 18
        ? `contraction-heavy, 1 per ${contractionPer} words`
        : `light, 1 per ${contractionPer} words`;

  const punctText = `${emDashCount} em-dash${emDashCount === 1 ? "" : "es"} · ${semicolonCount} semicolon${semicolonCount === 1 ? "" : "s"}`;

  const profile: ProfileLine[] = [
    { key: "rhythm", value: `avg ${metrics.avgSentenceLen} words/sentence · ${variance} variance (σ ${metrics.sentenceStdev})` },
    { key: "address", value: addressText },
    { key: "contractions", value: contractionText },
    { key: "adverbs", value: `${adverbLyPct}% "-ly" (${adverbLyCount}) · ${adverbLyPct < 2.5 ? "sparing" : "moderate"}` },
    { key: "punctuation", value: punctText },
    { key: "questions", value: questionCount ? `${questionPct}% of sentences` : "none, declarative" },
  ];

  // Rules mirror the measured register (§6.4) — concrete, falsifiable, draftable.
  const rules: string[] = [];
  rules.push(
    variance === "high"
      ? `Keep most sentences near ${Math.round(avgSentenceLen)} words; allow one long sentence per paragraph as a release valve.`
      : `Hold a steady rhythm around ${Math.round(avgSentenceLen)} words per sentence.`
  );
  rules.push(
    person === "second"
      ? 'Address the reader directly as "you", not "users" or "one".'
      : person === "first"
        ? 'Stay in first person; let the writer\'s "I/we" carry the authority.'
        : "Keep it impersonal: third person, no direct address."
  );
  rules.push(
    contractionCount === 0
      ? "Avoid contractions. The register is formal."
      : "Use contractions freely: it's, you're, don't. The register is conversational."
  );
  if (emDashCount > 0) {
    rules.push("Use em-dashes for asides, sparingly, the way the source does.");
  } else if (semicolonCount > 0) {
    rules.push("Allow semicolons to join closely related clauses.");
  } else {
    rules.push("Lead each paragraph with the claim, then the evidence.");
  }

  const summary = `Voice profile compiled: ${addressText.split(": ")[0]}, ${metrics.avgSentenceLen} words per sentence on average, ${contractionCount === 0 ? "no contractions" : "contraction-heavy"}. ${rules.length} voice rules generated.`;

  return {
    ok: true,
    metrics,
    profile,
    rules,
    compiled: "✓ voice skill compiled, ready to draft in this voice.",
    summary,
  };
}
