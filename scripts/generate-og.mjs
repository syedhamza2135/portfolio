// Generates public/og.png (1200×630) — the site's primary face in link previews (§7 SEO).
// "Redline" design, light/bond theme by design. Two columns: the revision signature (the image
// performs the craft it sells — a struck generic draft revised into an in-voice line) on the left,
// a portrait on the right. The portrait is treated to a bond/ink duotone so it sits on-palette: its
// source halftone/sunburst reads as editorial print texture, not loud colour. Rasterized from SVG
// via sharp (already a Next dependency) and composited — no build-time font fetch, no extra package.
// System fonts stand in for the web faces: a serif for Instrument Serif (in-voice/display), Courier
// New for the typewriter draft + revision marks. Portrait source: scripts/og-portrait.src.webp.
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
const HAIR = "#d0d1c9";

const serif = "Georgia, 'Times New Roman', serif";
const draft = "'Courier New', Consolas, monospace";

const W = 1200, H = 630;
const PANEL_X = 812, PANEL_W = W - PANEL_X; // right-hand portrait panel

// Left column: wordmark, value prop, the revision signature, locator. Sized to clear the panel.
const base = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BOND}"/>

  <!-- wordmark: a red change-bar tick + the name in serif -->
  <rect x="80" y="60" width="4" height="30" fill="${RED}"/>
  <text x="98" y="84" font-family="${serif}" font-size="28" fill="${INK}">Syed Hamza</text>

  <!-- value prop -->
  <text x="80" y="196" font-family="${serif}" font-size="34" fill="${INK}">Publish like a ten-person content team.</text>
  <text x="80" y="244" font-family="${serif}" font-size="34" font-style="italic" fill="${INK_BLUE}">With one contractor.</text>
  <text x="80" y="294" font-family="${draft}" font-size="19" fill="${MUTED}">Content pipelines for US agencies. Writing and code included.</text>

  <!-- revision signature: the struck generic draft, then the in-voice line -->
  <rect x="80" y="350" width="680" height="170" fill="${CARD}"/>
  <rect x="80" y="350" width="4" height="170" fill="${RED}"/>
  <text x="104" y="388" font-family="${draft}" font-size="18" fill="${MUTED}">revision · draft, in the client's voice</text>
  <text x="104" y="430" font-family="${draft}" font-size="20" fill="${RED}" text-decoration="line-through">In today's landscape, leverage content at scale.</text>
  <text x="104" y="480" font-family="${serif}" font-size="27" fill="${INK}">Your readers can tell when a person wrote it.</text>

  <!-- locator -->
  <text x="80" y="590" font-family="${draft}" font-size="19" fill="${FAINT}">based in Pakistan · works US hours</text>
</svg>`;

// Drawn over the photo: a soft bond fade at the seam, the hairline divider, and a redline tick that
// echoes the About frame.
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="blend" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${BOND}" stop-opacity="1"/>
      <stop offset="1" stop-color="${BOND}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="${PANEL_X}" y="0" width="70" height="${H}" fill="url(#blend)"/>
  <rect x="${PANEL_X}" y="0" width="2" height="${H}" fill="${HAIR}"/>
  <rect x="${PANEL_X - 1}" y="276" width="4" height="78" fill="${RED}"/>
</svg>`;

// Portrait → bond/ink duotone (grayscale, contrast lift, warm-neutral tint). Cover-cropped to the
// panel, biased to the top so the head stays framed.
const portrait = await sharp(join(__dirname, "og-portrait.src.webp"))
  .resize(PANEL_W, H, { fit: "cover", position: "top" })
  .grayscale()
  .linear(1.18, -16)
  .tint("#d2cdc2")
  .toBuffer();

mkdirSync(out, { recursive: true });
const png = await sharp(Buffer.from(base))
  .composite([
    { input: portrait, left: PANEL_X, top: 0 },
    { input: Buffer.from(overlay), left: 0, top: 0 },
  ])
  .png()
  .toBuffer();
writeFileSync(join(out, "og.png"), png);
console.log("wrote public/og.png", png.length, "bytes");
