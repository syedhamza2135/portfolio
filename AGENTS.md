<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project context — Syed Hamza portfolio

Quick orientation + current focus + gotchas. For full architecture, see `README.md`.

## What this is

A single-page portfolio for an independent contractor selling **content systems for
scale** (writing + automation + code) to agencies and AI companies. The site *is* the
portfolio: the copy is a
writing sample, the build is an engineering sample. Built from a detailed PRD (v1.2; not
committed — it contains private strategy/client names).

- **Live:** https://syedhamza.xyz (Vercel, auto-deploys from `master`)
- **Repo:** github.com/syedhamza2135/portfolio
- **Local:** `C:\Users\syedh\dev\portfolio`

## Stack & architecture (deliberate decisions, not defaults)

- Next.js 16.2 App Router, **`output: 'export'`** — pure static; Vercel serves prebuilt HTML.
- React 19.2; Tailwind v4 **CSS-first** (no `tailwind.config.js`; tokens in `app/globals.css` via `@theme`).
- Self-hosted fonts via `next/font`: Instrument Serif (display) / Hanken Grotesk (body) / Courier
  Prime (typewriter — raw drafts + revision marks) / JetBrains Mono (terminal).
- **Three client islands:** the Voice Engine demo (`components/VoiceEngine.tsx`), the Redline copy
  tool (`components/RedlineTool.tsx`, powered by the pure `lib/redline.ts`), and the hero
  editing-field backdrop (`components/EditingField.tsx`, mounted via `HeroField.tsx` behind a
  reduced-motion gate + `next/dynamic` `ssr:false`). The theme toggle, scroll reveals, and left-edge
  read-progress bar are hand-rolled vanilla JS in `lib/scripts.ts`, injected as inline `<script>`.
  Keep this structure unless deliberately changing it. The Redline tool marks up its first sample
  during render, so its output is in the static HTML (works with JS off, indexable).
- **Hero backdrop is hand-built Canvas 2D, not WebGL.** It was three.js (~130 KB gz); that was
  replaced with a ~3 KB hand-written canvas animation to keep the lean-JS value prop intact. Don't
  reintroduce a 3D engine for ambient decoration.
- Light/dark via `[data-theme]` CSS-var tokens; no-FOUC inline head script. Dark theme is
  *designed*, not inverted (warm-ink shell ≠ the green-black terminal). Terminal palette is
  theme-invariant — the contrast is the whole concept.
- `@vercel/analytics` + `@vercel/speed-insights` wired. Booking = link-out to Calendly.

## Commands

- `npm run dev` (Turbopack) · `npm run build` → `./out` · `npm run og` (regenerates `public/og.png`).
- `npm run check` (typecheck + unit tests) · `npm run test` (node's built-in runner, needs Node 22+
  for TS type stripping, zero test deps). CI runs `check` before `build`. `lib/voice.ts` and
  `lib/redline.ts` are pure and unit-tested; keep them that way.
- Verify a change: `npm run build`, then serve `out/` and use the preview tools.
  `.claude/launch.json` has a **portfolio-static** config (`:3100`) for screenshotting the real
  production build, and **portfolio** (`:3000`) for dev.

## Gotchas (learned the hard way — don't rediscover)

- **Base CSS must live in `@layer base`** (`app/globals.css`). Unlayered element rules (e.g.
  `a { color: inherit }`) beat Tailwind's `@layer utilities` regardless of specificity and
  silently break `text-*` / `border-*` utilities. This already caused an invisible CTA button.
- **React 19 logs dev-only "script tag in component" console errors** for the no-FOUC + JSON-LD
  inline scripts. The static production build is clean (verified). Don't chase these in `dev`.
- **`next/font` fetches fonts at build time** → the build needs network access.
- **JS budget:** the PRD wanted <75 KB gz first-load; actual is ~120–150 KB gz. That's the
  irreducible React 19 + App Router runtime floor, not app code — accepted. The only way under
  it is leaving App Router (Pages Router / Astro), which is a re-platform decision for the user.
- The demo's analyzer (`lib/voice.ts`) detects em-dashes in whatever a visitor pastes and reports
  the count. The bundled samples (`lib/samples.ts`) are kept em-dash-free like the rest of the
  copy (the user wants NO em-dashes anywhere in the site's voice). The detection regex on the
  `emDashCount` line is functional, not copy — leave it. `voice.ts` builds the address summary by
  splitting the address label on `": "`, so keep that label's `:` separator in sync.

## Conventions

- **Copy bar:** every sentence is a writing sample — active voice, sentence case, specific over
  clever. A copy pass already stripped AI tells (NO em-dashes anywhere in the site copy; no
  "it's not X, it's Y" antithesis; no chiasmus; no rule-of-three pile-ups; no buzzword
  blacklist). Keep it that way.
- **Profile links have one source:** `SOCIAL_LINKS` in `lib/site.ts` (LinkedIn, GitHub,
  TradingView — each `label` + `href` + brand-glyph `icon` path). The footer, the About §06
  `elsewhere:` row, AND the JSON-LD `Person.sameAs` in `app/page.tsx` all derive from it. Add or
  change a profile in that array only. (History: the links once lived *only* in `sameAs`, so they
  were crawler metadata with no visible link on the page — don't reintroduce that split.) Icons
  render via `components/SocialIcon.tsx`, a **server** component (monochrome, `currentColor`,
  `aria-hidden`) — it is not a fourth client island.
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Commit/push only when the user asks. Branch is `master`.

## Open content TODOs (placeholders in code — search `TODO`)

- (Settled 2026-07-09) Verified draft count in the demo caption (`components/System.tsx`): decision
  is to state NO number until a defensible figure exists. The caption stands without one. Not an open
  item anymore; revisit only if a verifiable count lands.
- Proof testimonial slot (`components/Proof.tsx`) is intentionally empty (user decided: no
  invented or anonymous testimonial). `TESTIMONIAL` stays `null` until a real attributed quote
  exists; the layout holds without it.
- (Done) Real face photo now at `public/me.jpg`, shown in `components/About.tsx`.

## CURRENT FOCUS

**The "Redline" redesign shipped and is live.** It answered the two earlier worries — that the
design read as "AI-default" and that the site felt static:

- **Identity:** an editor's-proof / revision system — clichés struck in redline red, in-voice
  lines set in the Instrument Serif display, ink-blue insertions, change-bars, a typewriter face
  for raw drafts and marks, on a cool bond-paper shell (not the cream default). The terminal
  voice-engine demo is the signature asset. This is no longer the generic editorial-LLM look.
- **Life/motion:** restrained. Scroll reveals + the live voice-engine terminal + an ambient hero
  "editing floor" (drifting word-fragments struck/underlined as they rise). The hero field is
  **hand-built Canvas 2D** (see the stack note) — the earlier three.js version was dropped to
  protect the JS budget. It's theme-aware-dimmed + radial-masked so it never competes with the
  headline copy.

If pushing further, keep changes *inside* the Redline system rather than restyling. The one real
open content item is the verified draft count (see TODOs). A demo v2 on a real Claude API would
drop `output: 'export'` — a re-platform decision, so confirm with the user before starting it.

### Update (bolder evolution, branch `overhaul/redline-v2`)

A second pass dialed the Redline system up without leaving it, and added the flagship interactive
asset:

- **Redline copy tool (§03, new section).** The static hero "draft → in voice" figure made
  interactive: paste copy, the editor marks it up live (`components/RedlineTool.tsx` +
  `lib/redline.ts`, unit-tested, ~90-term dictionary + structural heuristics for em-dash, antithesis,
  weak openers, adverbs, passive voice). Every mark is measured from the input, never invented. It
  renders as a bond page, deliberately unlike the green Voice Engine terminal, so the two demos read
  as two tools telling one pipeline story. The section index shifted: redline is 03, services 04,
  proof 05, about 06.
- **Bolder layout.** Oversized draft-face folio numbers in each section margin (`Section.tsx` +
  `.sec-num`), a left-edge redline read-progress bar (`.edge-rule`, driven by `--read` in
  `scripts.ts`), a fluid heading scale (`.t-hero` / `.t-h2` / `.t-h3` / `.t-lead`, unlayered so they
  beat `text-*`), and staggered/directional reveals (`--rd`, `.reveal-x`). All motion stays gated on
  `prefers-reduced-motion` and the JS budget did not move (the tool is a small pure function).
- **Engineering rigor.** `npm run check` (typecheck + `node --test`) added and wired into CI on Node
  22. The honest placeholders (draft count, testimonial) were left empty on purpose, as before.
