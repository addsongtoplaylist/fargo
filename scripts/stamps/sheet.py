"""Review sheet (docs/STAMPS.md v2): raw vs cleaned, per stamp, as one PNG.

    python3 scripts/stamps/sheet.py <folder> <list.json> [--raw-only]

Writes stamps-review/<folder>/sheet.png — each cell shows the raw image (left) and
the cleaned stamp on the share card's navy (right), labelled with id and place.
--raw-only shows just the white-background images (owner's review, round 2).
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[2]
provider = sys.argv[1]
entries = json.loads(Path(sys.argv[2]).read_text())
base = root / "stamps-review" / provider

raw_only = "--raw-only" in sys.argv
CELL, PAD, LABEL = 360, 16, 34
COLS = 3 if raw_only else 2
PER = 1 if raw_only else 2  # images per cell
NAVY = (14, 34, 64)
font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)

rows = (len(entries) + COLS - 1) // COLS
W = COLS * (PER * CELL + (PER + 1) * PAD)
H = rows * (CELL + LABEL + 2 * PAD) + PAD
sheet = Image.new("RGB", (W, H), (240, 241, 245))
draw = ImageDraw.Draw(sheet)

for i, e in enumerate(entries):
    col, row = i % COLS, i // COLS
    x = col * (PER * CELL + (PER + 1) * PAD) + PAD
    y = row * (CELL + LABEL + 2 * PAD) + PAD
    label = f"{i + 1}. {e['name']}" + (" (country)" if e["kind"] == "country" else "") + (f"  ·  {e.get('shape', '').split(' (')[0].replace(' with a perforated postage-stamp edge', ', postage edge')}" if raw_only else f"  ·  {e['id']}")
    draw.text((x, y), label, fill=(30, 35, 45), font=font)
    y += LABEL
    raw, clean = base / "raw" / f"{e['id']}.png", base / "clean" / f"{e['id']}.png"
    if raw.exists():
        sheet.paste(Image.open(raw).convert("RGB").resize((CELL, CELL)), (x, y))
    if raw_only:
        continue
    tile = Image.new("RGBA", (CELL, CELL), NAVY + (255,))
    if clean.exists():
        tile.alpha_composite(Image.open(clean).resize((CELL - 20, CELL - 20)), (10, 10))
    sheet.paste(tile.convert("RGB"), (x + CELL + PAD, y))

out = base / "sheet.png"
sheet.save(out)
print(out)
