"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// The hero canvas field is loaded ONLY here, code-split via next/dynamic (ssr:false), after
// hydration — the hero text is server-rendered HTML, so this is pure progressive enhancement and
// never blocks first paint. Skipped entirely under reduced-motion.
const EditingField = dynamic(() => import("./EditingField"), { ssr: false });

export default function HeroField() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setOn(true);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {on && <EditingField />}
    </div>
  );
}
