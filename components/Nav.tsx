import { NAME, SECTIONS, CALENDLY_URL } from "@/lib/site";

// Server component. The theme toggle is a plain button wired by the vanilla enhancement
// script (lib/scripts.ts) — no React client island here (§4.5, §7).
export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-shell/85 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <a
          href="#main"
          className="flex items-center gap-2.5"
          aria-label={`${NAME}, back to top`}
        >
          <span aria-hidden="true" className="h-5 w-[3px] bg-accent" />
          <span className="font-serif text-[1.2rem] tracking-tight text-ink">{NAME}</span>
        </a>

        <div className="flex items-center gap-5">
          <ul className="hidden items-center gap-5 md:flex">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  data-spy={s.id}
                  className="nav-link draft text-[0.78rem] text-muted transition-colors hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="nav_book"
            className="draft inline-flex min-h-[44px] items-center text-[0.78rem] text-ink link-underline"
          >
            book ↗
          </a>

          <button
            id="theme-toggle"
            type="button"
            data-choice="auto"
            aria-label="Theme: auto. Activate to change."
            className="draft inline-flex h-9 items-center gap-1.5 rounded-sm border border-hairline bg-card px-3 text-[0.72rem] text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true">◐</span>
            <span data-choice-label>auto</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
