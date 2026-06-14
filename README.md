# Syed Hamza — portfolio

A single-page portfolio whose copy, design, and one interactive demo *are* the portfolio.
Built from PRD v1.2. The site is the proof: every sentence is a writing sample, every
build decision an engineering sample.

## Stack

- **Next.js 16.2** (App Router, `output: 'export'` — pure static, no server)
- **React 19.2**
- **Tailwind CSS v4** (CSS-first: tokens live in `app/globals.css`, no `tailwind.config.js`)
- Self-hosted fonts via `next/font` — Newsreader / Instrument Sans / JetBrains Mono
- One client island (the Voice Engine demo); theme toggle + scroll reveals are hand-rolled
  vanilla JS (`lib/scripts.ts`). No animation library, no UI framework.

## Develop

```bash
npm run dev        # http://localhost:3000  (Turbopack, default in 16)
npm run build      # static export -> ./out
npx serve out      # preview the production build locally
npm run og         # regenerate public/og.png from scripts/generate-og.mjs
```

## Architecture

```
app/
  layout.tsx        fonts, metadata, no-FOUC theme script, nav/footer, analytics
  page.tsx          section assembly + JSON-LD (Person + ProfilePage)
  globals.css       Tailwind v4 @theme + light/dark tokens (PRD 4.5)
  styleguide/       token preview (light + dark); not linked, noindex
  sitemap.ts, robots.ts, icon.svg
components/          Hero, Problem, System(+VoiceEngine), Services, Proof, About, CTA, Nav, Footer
lib/
  voice.ts          client-side heuristic analyzer (honest, falsifiable output)
  samples.ts        three distinct-voice example texts
  site.ts           shared constants (URLs, email) - see TODOs below
  scripts.ts        inline theme + reveal + tracking JS
```

### Theming

Tokens are CSS custom properties on `:root` / `[data-theme="dark"]`, mapped into Tailwind via
`@theme inline`. Swapping `data-theme` re-themes the whole page. The dark theme is *designed*,
not inverted: the warm-ink shell stays distinct from the cooler green-black terminal, and the
CTA block flips (ink-on-ivory <-> ivory-on-ink). Default follows `prefers-color-scheme`; the
nav toggle cycles light -> dark -> auto and persists in `localStorage`. A `<head>` script sets
the theme before first paint (no flash).

## Before launch — content you must supply

These are PRD open items the code stubs out. Search the codebase for `TODO`.

| Where | What |
|-------|------|
| `lib/site.ts` | `SITE_URL` (custom domain), `CALENDLY_URL` (real booking link), `CONTACT_EMAIL` |
| `components/System.tsx` | Verify the real Voice Engine draft count before stating a number |
| `components/Proof.tsx` | Swap the specific-anonymous tags for the named client once permission lands; add the attributed `TESTIMONIAL` |
| `components/About.tsx` | Replace the `SH` initials block with the real face photo — AVIF/WebP, ~264px |

`SITE_URL`, `CALENDLY_URL`, and `CONTACT_EMAIL` also read from `NEXT_PUBLIC_*` env vars, so you
can set them in Vercel without editing code.

## Deploy (Vercel)

1. Import the GitHub repo into Vercel. Framework preset: **Next.js** (it respects `output: 'export'`).
2. Add the custom domain and the `NEXT_PUBLIC_*` env vars above.
3. Enable **Web Analytics** in the Vercel dashboard (the `<Analytics/>` component is already wired).
