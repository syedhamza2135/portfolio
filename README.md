# Syed Hamza portfolio

The site is the portfolio. The copy is the writing sample and the build is the engineering
sample, so the repo is held to the same standard as the page.

Live at https://syedhamza.xyz.

## Stack

- Next.js 16.2, App Router, `output: 'export'` (fully static, no server runtime).
- React 19.2.
- Tailwind CSS v4, CSS-first. Design tokens live in `app/globals.css` under `@theme`; there is no `tailwind.config.js`.
- Fonts self-hosted at build time via `next/font`: Instrument Serif (display), Hanken Grotesk (body), Courier Prime (the typewriter "draft" face), and JetBrains Mono (terminal).
- Three React client islands: the Voice Engine demo, the Redline copy tool (`RedlineTool`, powered by the pure `lib/redline.ts`), and the hero's ambient backdrop (`EditingField`, mounted via `HeroField` with `next/dynamic` and `ssr:false`). The theme toggle, scroll reveals, and left-edge read-progress bar are hand-rolled vanilla JS injected from `lib/scripts.ts`. The hero backdrop is a hand-built Canvas 2D animation, not a 3D engine, to keep the JS budget lean.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000 (Turbopack)
npm run build    # static export to ./out
npm run check    # typecheck + unit tests (tsc --noEmit && node --test)
npx serve out    # serve the production build locally
npm run og       # regenerate public/og.png
```

Tests are the analyzer logic in `lib/` (`voice.ts` and `redline.ts` are pure, so they get real unit
coverage). They run on Node's built-in test runner with TypeScript type stripping, so there is no
test-framework dependency. Node 22+ is required for `npm run test`. CI runs `npm run check` before
the build.

`next/font` downloads the fonts during the build, so building needs network access.

## Layout

```
app/
  layout.tsx     fonts, metadata, no-flash theme script, nav + footer, analytics
  page.tsx       section assembly and JSON-LD (Person, ProfilePage); the Person
                 sameAs derives from SOCIAL_LINKS so it never drifts from the visible links
  globals.css    Tailwind v4 @theme plus the light and dark token sets
  styleguide/    token preview; not linked, noindex
  sitemap.ts, robots.ts, icon.svg
components/      Hero, HeroField and EditingField (Canvas 2D), Problem, System and
                 VoiceEngine, Redline and RedlineTool, Services, Proof, About, CTA, Nav,
                 Footer, Section (the numbered manuscript index), SocialIcon (monochrome
                 brand glyph for the profile links, currentColor, server component)
lib/
  voice.ts       the voice demo's client-side text analyzer (measured, falsifiable output)
  redline.ts     the copy tool's analyzer: marks cliches, hedges, AI tells, passive voice
  redline.test.ts, voice tests   node:test unit tests for the two analyzers
  samples.ts     voice sample texts + the deliberately bad copy the redline tool marks up
  site.ts        shared constants: URLs, email, WhatsApp number, the section index,
                 and SOCIAL_LINKS (LinkedIn, GitHub, TradingView; label + href + brand glyph)
  scripts.ts     inline theme, scroll-reveal, read-progress, and click-tracking JS
  track.ts       small analytics event helper
  ui.ts          tiny CSS-custom-property helpers for TSX
```

## Design

"Redline" treats the page as an edited manuscript. The palette is cool bond paper (`#e6e7e1`) and
dark carbon (`#1a1c1a`) with two revision marks: editor's red (`#b3382b`) for deletions and
change-bars, and ink-blue (`#2b4fa0`) for insertions and links. Form carries meaning alongside
color, so deletions are struck through and insertions are underlined.

Light and dark are both designed rather than inverted. Swapping `data-theme` re-themes the page by
changing the CSS custom properties that Tailwind reads through `@theme inline`. The CTA block flips
its card (ink on bond in light, bond on ink in dark), while the terminal demo keeps one identity in
both themes because the contrast against the shell is the idea. A `<head>` script sets the theme
before first paint to avoid a flash, and a nav toggle cycles auto, light, and dark, persisted in
`localStorage`.

The hero backdrop, "the editing floor," is a slow drift of word fragments: clichés struck in red,
in-voice words underlined in blue, the rest faint. It is hand-drawn on a 2D canvas (no 3D engine),
dimmed and radially masked in light mode so it never competes with the headline. It reads the theme
tokens, pauses when offscreen, and is skipped entirely under `prefers-reduced-motion`.

The page carries two live demos that share a story but not a look. The Voice Engine (§02) is a green
terminal: the machine reading how a client writes. The Redline tool (§03) is a bond page under the
editor's hand: paste any copy and the same editing pass marks it up, clichés struck, hedges cut, AI
tells and passive voice flagged, each mark measured from the text rather than guessed (`lib/redline.ts`,
unit-tested). Around them the layout leans into the manuscript idea: each section opens with an
oversized draft-face folio number in the margin, and a redline change-bar pinned to the left edge
fills as the page is read. The heading scale is fluid (`t-hero` / `t-h2` / `t-h3`), and reveals
stagger in from the margin. All of it is gated on `prefers-reduced-motion`.

The public profiles (LinkedIn, GitHub, TradingView) render as visible links in two places: the
footer, and an `elsewhere:` row in the About section (§06) where they back the copy directly. Both
read from `SOCIAL_LINKS` in `lib/site.ts`, which is also the source the JSON-LD `Person.sameAs`
maps over, so the links a visitor clicks and the metadata a crawler reads can never fall out of
sync. Each link carries a monochrome brand glyph (`components/SocialIcon.tsx`) drawn in
`currentColor` so it inherits the link color and stays theme-aware.

## Deploy

Vercel, auto-deploying from `master`, framework preset Next.js (it honors `output: 'export'`).
`SITE_URL`, `CALENDLY_URL`, `CONTACT_EMAIL`, and `WHATSAPP_NUMBER` can be set as `NEXT_PUBLIC_*`
environment variables instead of editing `lib/site.ts`. Web Analytics and Speed Insights are wired
in code; turn on Web Analytics in the Vercel dashboard.

## Content stubs

Two gaps are left blank on purpose rather than filled with something unverifiable (search `TODO`):

- `components/Proof.tsx`: `TESTIMONIAL` stays `null` until there is a real attributed quote; the case studies are specific but unnamed.
- `components/System.tsx`: the demo caption states no draft count until there is a figure worth defending.
