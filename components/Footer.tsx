import { NAME, CONTACT_EMAIL } from "@/lib/site";

// One quiet mono line + a mailto "fire exit" — not a competing CTA (§5 Footer).
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-10 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <p className="draft text-[0.75rem] text-muted">
          {NAME} · built by hand, no template · {year}
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          data-track="footer_mailto"
          className="draft text-[0.75rem] text-muted link-underline"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
