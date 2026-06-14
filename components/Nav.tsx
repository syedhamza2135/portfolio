import { NAME, SECTIONS, CALENDLY_URL } from "@/lib/site";

// Server component. The theme toggle is a plain button wired by the vanilla enhancement
// script (lib/scripts.ts) — no React client island here (§4.5, §7).
export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-shell/85 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <a
          href="#main"
          className="font-serif text-lg italic tracking-tight text-ink"
          aria-label={`${NAME} — back to top`}
        >
          {NAME}
        </a>

        <div className="flex items-center gap-5">
          <ul className="hidden items-center gap-5 md:flex">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="mono text-[0.78rem] text-muted transition-colors hover:text-ink"
                >
                  <span className="text-accent">{s.num}</span>{" "}
                  <span>{s.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="nav_book"
            className="mono text-[0.78rem] text-ink link-underline"
          >
            book ↗
          </a>

          <button
            id="theme-toggle"
            type="button"
            data-choice="auto"
            aria-label="Theme: auto. Activate to change."
            className="mono inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-card px-3 text-[0.72rem] text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true">◐</span>
            <span data-choice-label>auto</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
