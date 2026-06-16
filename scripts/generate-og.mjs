// Generates public/og.png (1200×630) — the site's primary face in link previews (§7 SEO).
// "Redline" design, light/bond theme by design. Rasterized from SVG via sharp (already a Next
// dependency), so there's no build-time font fetch and no extra package. System fonts stand in
// for the web faces: a serif for Instrument Serif (in-voice/display), Courier New for the
// typewriter draft + revision marks. The image performs the craft it sells: a struck generic
// draft revised into an in-voice line.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "..", "public");

// Redline tokens (light/bond), kept in sync with app/globals.css :root.
const BOND = "#e6e7e1"; // cool bond stock
const INK = "#191b19";
const MUTED = "#585b56";
const FAINT = "#8b8d86";
const RED = "#b3382b"; // redline — deletions, change-bars, the wordmark tick
const INK_BLUE = "#2b4fa0"; // insertion / in-voice accent
const CARD = "#eeefe9";

const serif = "Georgia, 'Times New Roman', serif";
const draft = "'Courier New', Consolas, monospace";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BOND}"/>

  <!-- wordmark: a red change-bar tick + the name in serif -->
  <rect x="80" y="68" width="4" height="30" fill="${RED}"/>
  <text x="98" y="92" font-family="${serif}" font-size="28" fill="${INK}">Syed Hamza</text>
  <text x="1120" y="92" text-anchor="end" font-family="${draft}" font-size="22" letter-spacing="0.4" fill="${MUTED}">content systems · technical writing · code</text>

  <!-- value prop -->
  <text x="80" y="214" font-family="${serif}" font-size="48" fill="${INK}">Publish like a ten-person content team.</text>
  <text x="80" y="272" font-family="${serif}" font-size="48" font-style="italic" fill="${INK_BLUE}">With one contractor.</text>
  <text x="80" y="322" font-family="${draft}" font-size="22" fill="${MUTED}">Content pipelines for US agencies. Writing and code included.</text>

  <!-- revision signature: the struck generic draft, then the in-voice line -->
  <rect x="80" y="378" width="640" height="150" fill="${CARD}"/>
  <rect x="80" y="378" width="4" height="150" fill="${RED}"/>
  <text x="104" y="406" font-family="${draft}" font-size="18" fill="${MUTED}">revision · draft, in the client's voice</text>
  <text x="104" y="450" font-family="${draft}" font-size="24" fill="${RED}" text-decoration="line-through">In today's fast-paced landscape, leverage content at scale.</text>
  <text x="104" y="500" font-family="${serif}" font-size="30" fill="${INK}">Your readers can tell when a person wrote it.</text>

  <!-- locator -->
  <text x="80" y="590" font-family="${draft}" font-size="20" fill="${FAINT}">based in Pakistan · works US hours</text>
</svg>`;

mkdirSync(out, { recursive: true });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(join(out, "og.png"), png);
console.log("wrote public/og.png", png.length, "bytes");
