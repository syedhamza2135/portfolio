// Generates public/og.png (1200×630) — the site's primary face in link previews (§7 SEO).
// Light theme, by design (§4.5). Rasterized from SVG via sharp (already a Next dependency),
// so there's no build-time font fetch and no extra package.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "..", "public");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f3ea"/>
  <rect x="0" y="0" width="1200" height="8" fill="#5e1f2e"/>
  <text x="80" y="120" font-family="Consolas, monospace" font-size="22" letter-spacing="1" fill="#5f5e5a">content systems · technical writing · code</text>
  <text x="78" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-weight="500" fill="#211d14">Most agencies don&#8217;t need</text>
  <text x="78" y="340" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-weight="500" fill="#211d14">another writer. They need a</text>
  <text x="78" y="430" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-weight="500" font-style="italic" fill="#5e1f2e">system.</text>
  <text x="80" y="560" font-family="Consolas, monospace" font-size="24" fill="#211d14">Syed Hamza</text>
  <text x="80" y="592" font-family="Consolas, monospace" font-size="19" fill="#5f5e5a">based in Pakistan · works US hours</text>
  <g transform="translate(980,470)">
    <rect width="140" height="92" rx="10" fill="#131512"/>
    <path d="M28 34 l18 18 -18 18" fill="none" stroke="#5dcaa5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="60" y="64" width="34" height="6" rx="3" fill="#5dcaa5"/>
  </g>
</svg>`;

mkdirSync(out, { recursive: true });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(join(out, "og.png"), png);
console.log("wrote public/og.png", png.length, "bytes");
