import { ReactNode } from "react";

// Asymmetric editorial frame: a sticky numbered index in the left rail, content offset to
// the right. The "0X" + label is decorative (aria-hidden); the <h2> in `children` carries the
// real heading hierarchy via `labelledBy` (§7.5). Collapses to a single column on mobile.
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
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-y-7 sm:grid-cols-[11rem_1fr] sm:gap-x-10 lg:grid-cols-[12rem_1fr]">
          <div aria-hidden="true" className="reveal sm:sticky sm:top-24 sm:self-start">
            <div className="mono text-[1.9rem] font-medium leading-none text-accent">{num}</div>
            <div className="mono mt-2 text-[0.78rem] tracking-wide text-muted">{label}</div>
            <div className="mt-4 hidden h-px w-10 bg-signal sm:block" />
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
