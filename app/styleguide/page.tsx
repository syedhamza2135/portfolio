import type { Metadata } from "next";

// Build-step-2 exit criteria (§10): every token renders in light AND dark; toggle persists;
// no flash. Not linked from the site, disallowed in robots.
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const SHELL_TOKENS = [
  "--shell-bg",
  "--ink",
  "--muted",
  "--faint",
  "--hairline",
  "--card",
  "--accent",
  "--accent-fill",
  "--signal",
  "--cta-bg",
  "--cta-text",
];

const TERM_TOKENS = [
  "--term-bg",
  "--term-panel",
  "--term-border",
  "--term-text",
  "--term-bright",
  "--term-teal",
  "--term-muted",
];

function Swatch({ token }: { token: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-10 w-10 shrink-0 rounded-md border border-hairline"
        style={{ background: `var(${token})` }}
      />
      <code className="mono text-[0.75rem] text-muted">{token}</code>
    </div>
  );
}

export default function Styleguide() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <p className="section-label">styleguide</p>
      <h1 className="mt-4 text-4xl font-medium">Design tokens</h1>
      <p className="mt-3 text-muted">
        Toggle the theme in the nav — every token below re-themes with no reload and no flash.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-medium">Type scale</h2>
        <div className="mt-5 space-y-3">
          <p className="font-serif text-6xl">Bricolage Grotesque display 6xl</p>
          <p className="text-lg">Hanken Grotesk body — the quick brown fox jumps over the lazy dog.</p>
          <p className="font-sans text-lg italic">Hanken Grotesk italic — editorial emphasis.</p>
          <p className="mono text-sm text-accent">JetBrains Mono · section label · sentence case</p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-medium">Shell tokens</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SHELL_TOKENS.map((t) => (
            <Swatch key={t} token={t} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-medium">Terminal tokens (theme-invariant)</h2>
        <div className="mt-5 rounded-xl border border-term-border bg-term-bg p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {TERM_TOKENS.map((t) => (
              <div key={t} className="flex items-center gap-3">
                <span
                  className="h-10 w-10 shrink-0 rounded-md border border-term-border"
                  style={{ background: `var(${t})` }}
                />
                <code className="mono text-[0.72rem] text-term-muted">{t}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-medium">Components</h2>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="pill">capability pill</span>
          <a className="link-underline text-accent" href="#">
            accent link
          </a>
          <button className="inline-flex min-h-[44px] items-center rounded-full bg-signal px-5 text-sm font-medium text-[#15161a]">
            primary button
          </button>
        </div>
        <hr className="hairline mt-6" />
      </section>
    </div>
  );
}
