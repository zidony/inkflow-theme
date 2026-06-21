/**
 * Generates the brand raster assets referenced by src/partials/head.html:
 *   - src/public/apple-touch-icon.png  (180x180)
 *   - src/public/og-cover.png          (1200x630)
 *   - src/public/favicon.ico           (32x32, PNG-encoded)
 *
 * Pure Node (no native/image dependencies) so the build stays portable and
 * the assets are fully reproducible. The mark mirrors src/public/favicon.svg:
 * a rounded brand-gradient tile with a white "N" wordmark glyph.
 *
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'src', 'public');

// Brand colours (kept in sync with design-tokens.css --ink-accent / --ink-primary).
const ACCENT = [0x00, 0xc9, 0x8d];
const PRIMARY = [0x0a, 0x66, 0x40];
const WHITE = [0xff, 0xff, 0xff];

// "N" glyph polygon in a 64x64 viewBox (matches favicon.svg path).
const GLYPH = [
  [20, 44], [20, 20], [25.4, 20], [38.6, 36.2], [38.6, 20],
  [44, 20], [44, 44], [38.6, 44], [25.4, 27.8], [25.4, 44],
];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  // remaining bytes (compression/filter/interlace) default to 0

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

/**
 * Renders the brand tile centred on a canvas.
 * @param {number} w canvas width
 * @param {number} h canvas height
 * @param {number} tile tile size (square)
 * @param {boolean} fullBleed when true the gradient fills the whole canvas
 */
function renderTile(w, h, tile, fullBleed) {
  const rgba = Buffer.alloc(w * h * 4);
  const offX = Math.round((w - tile) / 2);
  const offY = Math.round((h - tile) / 2);
  const radius = tile * (14 / 64); // mirror favicon.svg rx
  const scale = tile / 64;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Background: brand gradient when full-bleed, else dark page surface.
      const bgT = (x / w + y / h) / 2;
      let r;
      let g;
      let b;
      let a = 255;

      if (fullBleed) {
        r = lerp(ACCENT[0], PRIMARY[0], bgT);
        g = lerp(ACCENT[1], PRIMARY[1], bgT);
        b = lerp(ACCENT[2], PRIMARY[2], bgT);
      } else {
        r = 0x0d;
        g = 0x11;
        b = 0x17;
        a = 0; // transparent canvas for icons
      }

      const lx = x - offX;
      const ly = y - offY;
      const insideTile = lx >= 0 && lx < tile && ly >= 0 && ly < tile;

      if (insideTile) {
        // Rounded-rect corner test.
        const cx = Math.min(Math.max(lx, radius), tile - radius);
        const cy = Math.min(Math.max(ly, radius), tile - radius);
        const dist = Math.hypot(lx - cx, ly - cy);
        if (dist <= radius) {
          const tt = (lx / tile + ly / tile) / 2;
          r = lerp(ACCENT[0], PRIMARY[0], tt);
          g = lerp(ACCENT[1], PRIMARY[1], tt);
          b = lerp(ACCENT[2], PRIMARY[2], tt);
          a = 255;

          // White "N" glyph (supersampled for smoother edges).
          const gx = lx / scale;
          const gy = ly / scale;
          let hits = 0;
          for (const [sx, sy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
            if (pointInPolygon(gx + (sx - 0.5) / scale, gy + (sy - 0.5) / scale, GLYPH)) hits++;
          }
          if (hits) {
            const t = hits / 4;
            r = lerp(r, WHITE[0], t);
            g = lerp(g, WHITE[1], t);
            b = lerp(b, WHITE[2], t);
          }
        }
      }

      rgba[idx] = r;
      rgba[idx + 1] = g;
      rgba[idx + 2] = b;
      rgba[idx + 3] = a;
    }
  }
  return rgba;
}

function buildIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count

  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size; // width
  entry[1] = size >= 256 ? 0 : size; // height
  entry[2] = 0; // palette
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  const appleSize = 180;
  const applePng = encodePng(appleSize, appleSize, renderTile(appleSize, appleSize, Math.round(appleSize * 0.86), false));
  await writeFile(path.join(publicDir, 'apple-touch-icon.png'), applePng);

  const og = encodePng(1200, 630, renderTile(1200, 630, 360, true));
  await writeFile(path.join(publicDir, 'og-cover.png'), og);

  const faviconSize = 32;
  const faviconPng = encodePng(faviconSize, faviconSize, renderTile(faviconSize, faviconSize, faviconSize, false));
  await writeFile(path.join(publicDir, 'favicon.ico'), buildIco(faviconPng, faviconSize));

  console.log('Generated apple-touch-icon.png, og-cover.png, favicon.ico in src/public/.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
