/**
 * Generate iOS PWA splash screens using sharp (bundled with Next.js).
 * Run: node scripts/generate-splash.mjs
 */
import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "splash");

// iOS splash screen sizes: [width, height, scaleFactor, description]
const screens = [
  // iPhones
  [1290, 2796, 3, "iPhone 15 Pro Max / 14 Pro Max"],
  [1179, 2556, 3, "iPhone 15 Pro / 14 Pro"],
  [1170, 2532, 3, "iPhone 14 / 13 / 13 Pro / 12 / 12 Pro"],
  [1125, 2436, 3, "iPhone X / XS / 11 Pro"],
  [1284, 2778, 3, "iPhone 12/13 Pro Max"],
  [828, 1792, 2, "iPhone XR / 11"],
  [1242, 2688, 3, "iPhone XS Max / 11 Pro Max"],
  [750, 1334, 2, "iPhone 8 / 7 / 6s / SE2/3"],
  // iPads
  [2048, 2732, 2, "iPad Pro 12.9"],
  [1668, 2388, 2, "iPad Pro 11"],
  [1640, 2360, 2, "iPad Air 10.9"],
  [1536, 2048, 2, "iPad 9.7 / mini"],
];

const BG = "#f7f2ee";
const TEAL = "#1a8a6e";
const TEXT_COLOR = "#f7f2ee";

async function generateSplash(width, height, scale) {
  const iconSize = Math.round(Math.min(width, height) * 0.18);
  const fontSize = Math.round(iconSize * 0.55);
  const borderRadius = Math.round(iconSize * 0.25);

  // Create the "F" icon as SVG
  const iconSvg = `
    <svg width="${iconSize}" height="${iconSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${iconSize}" height="${iconSize}" rx="${borderRadius}" fill="${TEAL}"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
            font-family="system-ui, -apple-system, sans-serif"
            font-weight="600" font-size="${fontSize}" fill="${TEXT_COLOR}">F</text>
    </svg>
  `;

  const iconBuffer = await sharp(Buffer.from(iconSvg)).png().toBuffer();

  // Create the splash: background color + centered icon
  const splash = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG,
    },
  });

  const result = await splash
    .composite([
      {
        input: iconBuffer,
        top: Math.round((height - iconSize) / 2),
        left: Math.round((width - iconSize) / 2),
      },
    ])
    .png({ quality: 90 })
    .toBuffer();

  return result;
}

async function main() {
  const { mkdirSync } = await import("fs");
  mkdirSync(outDir, { recursive: true });

  for (const [w, h, scale, desc] of screens) {
    const filename = `splash-${w}x${h}.png`;
    const buf = await generateSplash(w, h, scale);
    await sharp(buf).toFile(join(outDir, filename));
    console.log(`✓ ${filename} (${desc})`);
  }

  console.log("\nDone! Add the meta tags from layout.tsx.");
}

main().catch(console.error);
