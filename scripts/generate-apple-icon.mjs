// Generates app/apple-icon.png (180×180) — the iOS "Add to Home Screen" / Safari touch icon.
// Next serves any app/apple-icon.png automatically and emits <link rel="apple-touch-icon">.
// Same "Redline" monogram as app/icon.svg (the red change-bar tick + serif "SH" on the ink shell),
// but full-bleed: iOS masks its own rounded-rect, so a square with no transparent corners avoids a
// dark halo. Rasterized from SVG via sharp (already a dependency), matching scripts/generate-og.mjs.
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "..", "app");

const INK = "#191b19"; // shell
const BOND = "#e6e7e1"; // the "kept" initials
const RED = "#cf4436"; // redline tick (matches app/icon.svg)
const S = 180; // Apple touch icon standard size

// Full-bleed monogram. The tick tracks the cap height so it reads as the wordmark mark, not a rule.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="${INK}"/>
  <rect x="26" y="55" width="13" height="70" rx="3" fill="${RED}"/>
  <text x="112" y="94" font-family="Georgia, 'Times New Roman', serif" font-size="90"
        letter-spacing="-2" fill="${BOND}" text-anchor="middle" dominant-baseline="central">SH</text>
</svg>`;

const png = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, effort: 10, palette: true })
  .toBuffer();
writeFileSync(join(out, "apple-icon.png"), png);
console.log("wrote app/apple-icon.png", png.length, "bytes");
