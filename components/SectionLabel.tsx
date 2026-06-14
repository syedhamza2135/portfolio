// Visual section numbering (§4.4). The "0X —" marker is decorative; the <h2> that follows
// carries the real heading hierarchy for screen readers (§7.5).
export default function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <p className="section-label reveal">
      {num} — {label}
    </p>
  );
}
