// A brand glyph for a profile link. Monochrome, drawn in currentColor so it inherits the
// link's color and stays theme-aware (no baked-in brand colors — that would fight the
// editorial bond-paper palette). Decorative: the link text carries the accessible name,
// so the SVG is aria-hidden. Sized in em so it tracks the label's font-size.
export default function SocialIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
