// Unit tests for the Redline engine. Node's built-in runner, no framework dependency.
//   node --experimental-strip-types --test lib/redline.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { redline, editLetter, type RedlineResult, type RedlineCategory } from "./redline.ts";

// -- helpers ---------------------------------------------------------------------------------------

function ok(input: string): Extract<RedlineResult, { ok: true }> {
  const r = redline(input);
  assert.equal(r.ok, true, `expected ok:true for: ${input}`);
  return r as Extract<RedlineResult, { ok: true }>;
}

// categories present in the marks of a result
function cats(r: Extract<RedlineResult, { ok: true }>): Set<RedlineCategory> {
  const s = new Set<RedlineCategory>();
  for (const seg of r.segments) if (seg.kind === "mark") s.add(seg.mark.category);
  return s;
}

function joinSegments(r: Extract<RedlineResult, { ok: true }>): string {
  return r.segments.map((s) => (s.kind === "text" ? s.text : s.mark.text)).join("");
}

const EM_DASH = "—";

// A genuinely clean control sentence (>= 12 words, no marks of any kind).
const CLEAN = "We write clear copy for agencies and ship the whole thing in a single pass.";

// -- round-trip invariant --------------------------------------------------------------------------

test("round-trip: joining every segment reproduces the input exactly", () => {
  const inputs = [
    CLEAN,
    "In today's fast-paced digital landscape, we leverage synergy to unlock game-changing results at scale.",
    "We ship fast and we edit hard " + EM_DASH + " that is the whole promise we make to every client.",
    "It's not about the tools, it's about the outcome your agency ships to real readers.",
    "  leading and trailing whitespace should survive the tokenizer just fine for this input here.  ",
  ];
  for (const input of inputs) {
    const r = ok(input);
    assert.equal(joinSegments(r), input, `round-trip failed for: ${JSON.stringify(input)}`);
  }
});

// -- each category fires on a positive, and not on the clean control -------------------------------

test("cliche fires on a positive and not on clean copy", () => {
  const r = ok("We circle back at scale to move the needle on every deep dive we run for you now.");
  assert.ok(cats(r).has("cliche"));
  assert.ok(!cats(ok(CLEAN)).has("cliche"));
});

test("buzzword fires on a positive and not on clean copy", () => {
  const r = ok("We leverage a robust and seamless paradigm to empower the whole team every single day here.");
  assert.ok(cats(r).has("buzzword"));
  assert.ok(!cats(ok(CLEAN)).has("buzzword"));
});

test("hedge fires on a positive and not on clean copy", () => {
  const r = ok("This is just really very simple to basically understand for actually anyone reading here today.");
  assert.ok(cats(r).has("hedge"));
  assert.ok(!cats(ok(CLEAN)).has("hedge"));
});

test("emdash fires on a positive and not on clean copy", () => {
  const r = ok("We edit hard " + EM_DASH + " then we ship it, and that is the whole promise to every client.");
  assert.ok(cats(r).has("emdash"));
  assert.ok(!cats(ok(CLEAN)).has("emdash"));
});

test("antithesis fires on a positive and not on clean copy", () => {
  const r = ok("It's not about the tools, it's about the outcome your agency ships to real readers.");
  assert.ok(cats(r).has("antithesis"));
  assert.ok(!cats(ok(CLEAN)).has("antithesis"));
});

test("opener fires on a positive and not on clean copy", () => {
  const r = ok("There is a faster way to write agency copy that your readers finish and remember later.");
  assert.ok(cats(r).has("opener"));
  assert.ok(!cats(ok(CLEAN)).has("opener"));
});

test("adverb fires on a positive and not on clean copy", () => {
  const r = ok("We quickly rewrote the landing page and it converted noticeably better for the paying client.");
  assert.ok(cats(r).has("adverb"));
  assert.ok(!cats(ok(CLEAN)).has("adverb"));
});

test("passive fires on a positive and not on clean copy", () => {
  const r = ok("The homepage was written last week and the final draft was reviewed by two editors here.");
  assert.ok(cats(r).has("passive"));
  assert.ok(!cats(ok(CLEAN)).has("passive"));
});

// -- determinism -----------------------------------------------------------------------------------

test("determinism: calling twice gives a deeply equal result", () => {
  const input = "In today's fast-paced digital landscape we leverage synergy to just really elevate the brand.";
  assert.deepEqual(redline(input), redline(input));
});

// -- short / empty input ---------------------------------------------------------------------------

test("short and empty inputs return ok:false with a lowercase nudge", () => {
  for (const bad of ["", "   ", "too short here"]) {
    const r = redline(bad);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.ok(r.message.length > 0);
      assert.equal(r.message, r.message.toLowerCase());
      assert.ok(!r.message.includes(EM_DASH));
    }
  }
});

// -- counting invariants ---------------------------------------------------------------------------

test("markCount equals the number of mark segments, and stats sum to markCount", () => {
  const r = ok("In today's fast-paced digital landscape we leverage synergy to just really elevate the brand.");
  const markSegs = r.segments.filter((s) => s.kind === "mark").length;
  assert.equal(r.markCount, markSegs);
  const statSum = r.stats.reduce((a, s) => a + s.count, 0);
  assert.equal(statSum, r.markCount);
  assert.ok(r.stats.every((s) => s.count > 0));
});

test("clean copy has zero marks and an encouraging verdict", () => {
  const r = ok(CLEAN);
  assert.equal(r.markCount, 0);
  assert.equal(r.stats.length, 0);
  assert.equal(r.verdict, "Clean copy. Nothing to strike.");
});

// -- no em-dash may ever appear in output strings --------------------------------------------------

test("no output string contains an em-dash character", () => {
  const inputs = [
    "In today's fast-paced digital landscape we leverage synergy to unlock game-changing results at scale.",
    "We edit hard " + EM_DASH + " then we ship, and the draft was reviewed quickly by two editors today.",
  ];
  for (const input of inputs) {
    const r = ok(input);
    assert.ok(!r.summary.includes(EM_DASH), "summary has em-dash");
    assert.ok(!r.verdict.includes(EM_DASH), "verdict has em-dash");
    for (const s of r.stats) assert.ok(!s.label.includes(EM_DASH), "stat label has em-dash");
    for (const seg of r.segments) {
      if (seg.kind === "mark") {
        assert.ok(!seg.mark.note.includes(EM_DASH), "note has em-dash");
        assert.ok(!(seg.mark.suggestion ?? "").includes(EM_DASH), "suggestion has em-dash");
      }
    }
  }
});

// -- overlaps and suggestions ----------------------------------------------------------------------

test("overlapping matches are not double-marked (longest wins)", () => {
  // "in today's fast-paced" (cliche) should win over the "in today's" opener and "fast-paced" cliche.
  const r = ok("In today's fast-paced world we still write plain copy that readers actually finish reading.");
  // marks are non-overlapping and in order
  const marks = r.segments.filter((s) => s.kind === "mark") as { kind: "mark"; mark: { text: string } }[];
  let last = 0;
  const idx = joinSegments(r);
  for (const m of marks) {
    const at = idx.indexOf(m.mark.text, last);
    assert.ok(at >= last, "marks should be ordered and non-overlapping");
    last = at + m.mark.text.length;
  }
  assert.ok(cats(r).has("cliche"));
});

test("a known suggestion is attached (leverage -> use)", () => {
  const r = ok("Teams that leverage our system ship cleaner copy in far fewer passes than before now.");
  const lev = r.segments.find((s) => s.kind === "mark" && /leverage/i.test(s.mark.text));
  assert.ok(lev && lev.kind === "mark");
  if (lev && lev.kind === "mark") assert.equal(lev.mark.suggestion, "use");
});

test("summary reports the total mark count and word count", () => {
  const r = ok("We leverage synergy and circle back to just really move the needle for you every time.");
  assert.match(r.summary, new RegExp(`Marked ${r.markCount} spot`));
  assert.match(r.summary, new RegExp(`${r.wordCount} words`));
});

// -- edit letter -----------------------------------------------------------------------------------

test("editLetter: deterministic output for a known input", () => {
  const r = ok("In today's fast-paced digital landscape we leverage synergy to just really elevate the brand.");
  const letter = editLetter(r);
  assert.equal(
    letter,
    [
      "redline / syedhamza.xyz",
      r.summary,
      "",
      'strike "In today\'s fast-paced" - cliche, cut it',
      'strike "digital landscape" - cliche, cut it',
      'strike "leverage" - jargon, say it plainly',
      'strike "synergy" - jargon, say it plainly',
      'strike "just" - hedge, cut it',
      'strike "really" - hedge, cut it',
      'strike "elevate" - jargon, say it plainly',
      "",
      r.verdict,
    ].join("\n"),
  );
  // calling twice gives the same string
  assert.equal(editLetter(r), letter);
});

test("editLetter: one line per mark, in document order", () => {
  const r = ok("In today's fast-paced digital landscape we leverage synergy to just really elevate the brand.");
  const letter = editLetter(r);
  const markLines = letter.split("\n").filter((l) => /^(strike|flag) /.test(l));
  assert.equal(markLines.length, r.markCount);
});

test("editLetter: zero-mark case is a short, graceful letter", () => {
  const r = ok(CLEAN);
  assert.equal(r.markCount, 0);
  const letter = editLetter(r);
  assert.equal(letter, ["redline / syedhamza.xyz", r.summary, r.verdict].join("\n"));
  // no mark lines, and it does not throw
  assert.ok(!/^(strike|flag) /m.test(letter));
});

test("editLetter: no em-dash appears anywhere in the output", () => {
  const inputs = [
    CLEAN,
    "In today's fast-paced digital landscape we leverage synergy to unlock game-changing results at scale.",
    "We edit hard " + EM_DASH + " then we ship, and the draft was reviewed quickly by two editors today.",
  ];
  for (const input of inputs) {
    assert.ok(!editLetter(ok(input)).includes(EM_DASH), `edit letter has em-dash for: ${input}`);
  }
});

test("editLetter: has no trailing whitespace on any line", () => {
  const r = ok("We edit hard " + EM_DASH + " then we ship, and the draft was reviewed quickly by two editors today.");
  const letter = editLetter(r);
  assert.equal(letter, letter.replace(/[ \t]+$/gm, ""));
  assert.equal(letter, letter.trimEnd());
});
