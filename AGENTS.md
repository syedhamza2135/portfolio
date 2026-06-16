<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project context — Syed Hamza portfolio

Quick orientation + current focus + gotchas. For full architecture, see `README.md`.

## What this is

A single-page portfolio for an independent contractor selling **content systems for
agencies** (writing + automation + code). The site *is* the portfolio: the copy is a
writing sample, the build is an engineering sample. Built from a detailed PRD (v1.2; not
committed — it contains private strategy/client names).

- **Live:** https://syedhamza.xyz (Vercel, auto-deploys from `master`)
- **Repo:** github.com/syedhamza2135/portfolio
- **Local:** `C:\Users\syedh\dev\portfolio`

## Stack & architecture (deliberate decisions, not defaults)

- Next.js 16.2 App Router, **`output: 'export'`** — pure static; Vercel serves prebuilt HTML.
- React 19.2; Tailwind v4 **CSS-first** (no `tailwind.config.js`; tokens in `app/globals.css` via `@theme`).
- Self-hosted fonts via `next/font`: Newsreader (serif) / Instrument Sans (body) / JetBrains Mono.
- **One client island only:** the Voice Engine demo (`components/VoiceEngine.tsx`). The theme
  toggle + scroll reveals are hand-rolled vanilla JS in `lib/scripts.ts`, injected as inline
  `<script>`. Keep this structure unless deliberately changing it.
- Light/dark via `[data-theme]` CSS-var tokens; no-FOUC inline head script. Dark theme is
  *designed*, not inverted (warm-ink shell ≠ the green-black terminal). Terminal palette is
  theme-invariant — the contrast is the whole concept.
- `@vercel/analytics` + `@vercel/speed-insights` wired. Booking = link-out to Calendly.

## Commands

- `npm run dev` (Turbopack) · `npm run build` → `./out` · `npm run og` (regenerates `public/og.png`).
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
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Commit/push only when the user asks. Branch is `master`.

## Open content TODOs (placeholders in code — search `TODO`)

- Real face photo (currently an "SH" initials block in `components/About.tsx`).
- Named client + attributed testimonial in `components/Proof.tsx` (currently specific-but-
  anonymous; the testimonial slot renders nothing until filled).
- Verified draft count in the demo caption (`components/System.tsx`).

## CURRENT FOCUS (next session)

**Goal: take the design up a notch.** The user feels (1) the design reads as "AI-default" and
(2) the site feels static.

- **"Looks AI":** the editorial-warm shell + serif display + mono labels + hairline borders is
  tasteful but a now-recognizable LLM-generated-portfolio aesthetic, and the palette only broke
  one axis of the default (oxblood instead of terracotta). Directions worth exploring: a bolder /
  less-default palette, a more characterful display face (Newsreader is "safe"), more intentional
  or asymmetric editorial composition, print/texture details, and a stronger custom visual
  signature beyond the terminal (the terminal demo is the most distinctive asset — lean into
  handmade character). **Propose 2–3 concrete directions before coding.**
- **"Static":** add restrained life/motion. ⚠️ The original PRD explicitly banned award-site
  theatrics (no particles/3D/parallax/cursor-fx/preloaders) and brags about the JS budget, so
  adding motion *revisits* that stance. Clarify with the user whether "static" means visual
  liveliness (tasteful motion, richer interactions, a more alive terminal) or backend dynamism
  (demo v2 on a real Claude API → would drop `output: 'export'`). Decide tradeoffs explicitly;
  don't just bolt on effects.
