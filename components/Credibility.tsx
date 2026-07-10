// A slim credibility band between the problem (§01) and the two live demos (§02/§03). It front-loads
// proof so a skeptical buyer sees who this has shipped for before the two "paste your copy" tools,
// which the design review flagged as arriving too late. It compresses the real client-scale markers
// from §05 Proof (no new claims) and links down to the full cases. Deliberately not a numbered
// Section: a margin note between sections, so it does not disturb the 01..06 folio index or the
// System → Redline pipe-seam.
export default function Credibility() {
  return (
    <aside aria-label="Recent work" className="border-t border-hairline bg-card">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        <div className="reveal flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
          <p className="draft text-[0.72rem] tracking-wide text-accent">already shipped for</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li className="draft text-[0.9rem] text-ink">a $10M-funded AI startup</li>
            <li aria-hidden="true" className="text-faint">·</li>
            <li className="draft text-[0.9rem] text-ink">a 1,500-attendee VC conference</li>
          </ul>
          <a href="#proof" className="draft text-[0.82rem] text-muted link-underline sm:ml-auto">
            see the work ↓
          </a>
        </div>
      </div>
    </aside>
  );
}
