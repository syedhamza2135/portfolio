import { ReactNode } from "react";

// Asymmetric editorial frame: a sticky manuscript index in the left rail, content offset to the
// right. The rail shows an oversized draft-face folio number (struck redline) over the sentence-case
// label, both decorative (aria-hidden). The <h2> in `children` carries the real heading hierarchy
// via `labelledBy` (§7.5). Collapses to a single column on mobile, where the index sits inline above
// the content as a compact marker.
export default function Section({
  id,
  num,
  label,
  labelledBy,
  children,
}: {
  id: string;
  num: string;
  label: string;
  labelledBy: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      className="border-t border-hairline"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
        <div className="grid gap-y-8 sm:grid-cols-[11rem_1fr] sm:gap-x-10 lg:grid-cols-[13rem_1fr]">
          <div
            aria-hidden="true"
            className="reveal reveal-x sec-index sm:sticky sm:top-24 sm:self-start"
          >
            <div className="sec-rule">
              <div className="sec-num">{num}</div>
              <div className="draft mt-2 text-[0.82rem] tracking-wide text-accent">{label}</div>
            </div>
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
