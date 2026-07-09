import type { CSSProperties } from "react";

// Small helpers for setting CSS custom properties from TSX without casting at every call site.
// `rd` sets the reveal stagger delay (--rd, read by the .reveal transition in globals.css).
export const rd = (ms: number): CSSProperties => ({ "--rd": `${ms}ms` }) as CSSProperties;
