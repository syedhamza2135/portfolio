# Syed Hamza portfolio

The site is the portfolio. The copy is the writing sample and the build is the engineering
sample, so the repo is held to the same standard as the page.

Live at https://syedhamza.xyz.

## Stack

- Next.js 16.2, App Router, `output: 'export'` (fully static, no server runtime).
- React 19.2.
- Tailwind CSS v4, CSS-first. Design tokens live in `app/globals.css` under `@theme`; there is no `tailwind.config.js`.
- Fonts self-hosted at build time via `next/font`: Instrument Serif (display), Hanken Grotesk (body), Courier Prime (the typewriter "draft" face), and JetBrains Mono (terminal).
- One React client island, the Voice Engine demo. The theme toggle and scroll reveals are hand-rolled vanilla JS injected from `lib/scripts.ts`. The hero has an ambient three.js backdrop that is code-split and loaded after hydration.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000 (Turbopack)
npm run build    # static export to ./out
npx serve out    # serve the production build locally
npm run og       # regenerate public/og.png
```

`next/font` downloads the fonts during the build, so building needs network access.

## Layout

```
app/
  layout.tsx     fonts, metadata, no-flash theme script, nav + footer, analytics
  page.tsx       section assembly and JSON-LD (Person, ProfilePage)
  globals.css    Tailwind v4 @theme plus the light and dark token sets
  styleguide/    token preview; not linked, noindex
  sitemap.ts, robots.ts, icon.svg
components/      Hero, HeroField and EditingField (three.js), Problem, System and
                 VoiceEngine, Services, Proof, About, CTA, Nav, Footer, Section
lib/
  voice.ts       the demo's client-side text analyzer (measured, falsifiable output)
  samples.ts     three sample texts in distinct voices
  site.ts        shared constants: URLs, email, WhatsApp number
  scripts.ts     inline theme, scroll-reveal, and click-tracking JS
  track.ts       small analytics event helper
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
in-voice words underlined in blue, the rest faint. It reads the theme tokens, pauses when offscreen,
and is skipped entirely under `prefers-reduced-motion`.

## Deploy

Vercel, auto-deploying from `master`, framework preset Next.js (it honors `output: 'export'`).
`SITE_URL`, `CALENDLY_URL`, `CONTACT_EMAIL`, and `WHATSAPP_NUMBER` can be set as `NEXT_PUBLIC_*`
environment variables instead of editing `lib/site.ts`. Web Analytics and Speed Insights are wired
in code; turn on Web Analytics in the Vercel dashboard.

## Content stubs

Two gaps are left blank on purpose rather than filled with something unverifiable (search `TODO`):

- `components/Proof.tsx`: `TESTIMONIAL` stays `null` until there is a real attributed quote; the case studies are specific but unnamed.
- `components/System.tsx`: the demo caption states no draft count until there is a figure worth defending.
