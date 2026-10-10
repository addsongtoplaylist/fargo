"""Stamp clean-up (docs/STAMPS.md v2): raw model image -> cream ink on transparent, 600 x 600.

    python3 scripts/stamps/clean.py <provider>

Reads stamps-review/<provider>/raw/*.png, writes stamps-review/<provider>/clean/*.png.
Ink darkness becomes opacity, the colour becomes Fargo's cream (#f6f2e8, same as the
hand-made Ho Chi Minh City stamp), and the stamp is cropped to its circle.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

CREAM = (246, 242, 232)
SIZE = 600

root = Path(__file__).resolve().parents[2]
provider = sys.argv[1] if len(sys.argv) > 1 else "openai"
raw_dir = root / "stamps-review" / provider / "raw"
out_dir = root / "stamps-review" / provider / "clean"
out_dir.mkdir(parents=True, exist_ok=True)

for src in sorted(raw_dir.glob("*.png")):
    im = Image.open(src).convert("RGBA")
    # Flatten any transparency onto white, then darkness = ink
    flat = Image.new("RGBA", im.size, (255, 255, 255, 255))
    flat.alpha_composite(im)
    ink = ImageOps.invert(flat.convert("L"))
    ink = ink.point(lambda v: 0 if v < 28 else min(255, int((v - 28) * 1.35)))  # drop paper noise, firm up lines
    box = ink.point(lambda v: 255 if v > 60 else 0).getbbox()
    if not box:
        print(f"empty  {src.name}")
        continue
    # Square crop around the stamp, small margin
    l, t, r, b = box
    side = max(r - l, b - t)
    cx, cy = (l + r) // 2, (t + b) // 2
    pad = int(side * 0.02)
    half = side // 2 + pad
    crop = (cx - half, cy - half, cx + half, cy + half)
    alpha = ink.crop(crop).resize((SIZE, SIZE), Image.LANCZOS)
    out = Image.new("RGBA", (SIZE, SIZE), CREAM + (0,))
    out.putalpha(alpha)
    out.save(out_dir / src.name, optimize=True)
    print(f"clean  {src.name}")
