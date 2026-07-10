import { NAME, CONTACT_EMAIL, SOCIAL_LINKS, REPO_URL } from "@/lib/site";
import SocialIcon from "@/components/SocialIcon";

// One quiet mono line, the public profiles, and a mailto "fire exit" — not a competing
// CTA (§5 Footer). The profile links are the visible counterpart to the JSON-LD sameAs.
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <p className="draft text-[0.75rem] text-muted">
          {NAME} ·{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="footer_repo"
            className="link-underline"
          >
            built by hand, no template
          </a>{" "}
          · {year}
        </p>
        <nav aria-label="Profiles and contact">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track={`footer_${s.label.toLowerCase()}`}
                  className="draft inline-flex items-center gap-1.5 text-[0.75rem] text-muted link-underline"
                >
                  <SocialIcon d={s.icon} className="opacity-80" />
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                data-track="footer_mailto"
                className="draft text-[0.75rem] text-muted link-underline"
              >
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
