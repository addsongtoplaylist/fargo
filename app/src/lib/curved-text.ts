import type { Font } from "opentype.js";

/**
 * Text running round a circle, as one SVG path (v0.5.7 passport stamp). Each
 * letter is drawn from the font's own outline, centred on the curve and
 * turned to face outwards — exact spacing, no font needed when rendering.
 * `top` reads clockwise over the top; otherwise left-to-right along the bottom.
 */
export function curvedTextPath(
  font: Font,
  text: string,
  opts: { cx: number; cy: number; radius: number; size: number; top: boolean; letterSpacing?: number }
): string {
  const { cx, cy, radius, size, top, letterSpacing = 0.1 } = opts;
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  const advances = glyphs.map((g) => (g.advanceWidth ?? 0) * scale + letterSpacing * size);
  const capHeight = ((font.tables.os2?.sCapHeight as number | undefined) ?? font.unitsPerEm * 0.7) * scale;

  let angle = -advances.reduce((a, b) => a + b, 0) / radius / 2;
  const parts: string[] = [];

  glyphs.forEach((glyph, i) => {
    const mid = angle + advances[i] / 2 / radius;
    angle += advances[i] / radius;
    const px = cx + radius * Math.sin(mid);
    const py = top ? cy - radius * Math.cos(mid) : cy + radius * Math.cos(mid);
    const rot = top ? mid : -mid;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const half = ((glyph.advanceWidth ?? 0) * scale) / 2;

    // Glyph drawn with its baseline at y = 0; centre it, then turn and place it
    const map = (x: number, y: number) => {
      const lx = x - half;
      const ly = y + capHeight / 2;
      return `${(px + lx * cos - ly * sin).toFixed(2)} ${(py + lx * sin + ly * cos).toFixed(2)}`;
    };
    for (const c of glyph.getPath(0, 0, size).commands) {
      if (c.type === "M") parts.push(`M${map(c.x, c.y)}`);
      else if (c.type === "L") parts.push(`L${map(c.x, c.y)}`);
      else if (c.type === "Q") parts.push(`Q${map(c.x1, c.y1)} ${map(c.x, c.y)}`);
      else if (c.type === "C") parts.push(`C${map(c.x1, c.y1)} ${map(c.x2, c.y2)} ${map(c.x, c.y)}`);
      else if (c.type === "Z") parts.push("Z");
    }
  });
  return parts.join("");
}
