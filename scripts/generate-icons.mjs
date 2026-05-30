/**
 * generate-icons.mjs
 * Generates PNG app icons from the design-02 (Shippori Mincho 宅 on navy squircle).
 *
 * Usage:
 *   node scripts/generate-icons.mjs
 *
 * Outputs:
 *   public/apple-touch-icon.png  (180×180 — iOS home screen)
 *   public/icon-192.png          (192×192 — Android PWA)
 *   public/icon-512.png          (512×512 — Android PWA splash)
 */

import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Load font ─────────────────────────────────────────────────────
const FONT_PATH = '/tmp/shippori-mincho-b1-800.ttf';
let fontBuffer;
try {
  fontBuffer = readFileSync(FONT_PATH);
  console.log(`✔ Font loaded (${(fontBuffer.length / 1024 / 1024).toFixed(1)} MB)`);
} catch {
  console.error(`✗ Font not found at ${FONT_PATH}`);
  console.error('  Run: curl -o /tmp/shippori-mincho-b1-800.ttf "https://fonts.gstatic.com/s/shipporiminchob1/v24/wXK1E2wCr44tulPdnn-xbIpJ9RgT9-nKLoxP3g.ttf"');
  process.exit(1);
}

// ── SVG template ──────────────────────────────────────────────────
// navy-deep ≈ oklch(0.39 0.072 256) → #2c3b62
// iOS squircle radius ≈ 22.37% of size
function makeSvg(size) {
  const rx   = Math.round(size * 0.2237);
  const fs   = Math.round(size * 0.60);
  const cy   = Math.round(size * 0.51); // slight optical centering for CJK
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" ry="${rx}" fill="#2c3b62"/>
  <text
    x="${size / 2}" y="${cy}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Shippori Mincho B1"
    font-weight="800"
    font-size="${fs}"
    fill="#fffdf9">宅</text>
</svg>`;
}

// ── Render helper ─────────────────────────────────────────────────
function renderPng(size) {
  const svg = makeSvg(size);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: {
      fontBuffers: [fontBuffer],
      loadSystemFonts: false,
    },
  });
  return resvg.render().asPng();
}

// ── Generate ──────────────────────────────────────────────────────
const publicDir = resolve(root, 'public');
mkdirSync(publicDir, { recursive: true });

const sizes = [
  { size: 180, filename: 'apple-touch-icon.png', label: 'iOS apple-touch-icon' },
  { size: 192, filename: 'icon-192.png',          label: 'Android PWA 192' },
  { size: 512, filename: 'icon-512.png',          label: 'Android PWA 512' },
];

for (const { size, filename, label } of sizes) {
  const png = renderPng(size);
  const outPath = resolve(publicDir, filename);
  writeFileSync(outPath, png);
  console.log(`✔ ${label} → public/${filename} (${size}×${size})`);
}

console.log('\nDone! Update manifest.json and index.html if not already done.');
