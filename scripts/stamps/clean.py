"""Stamp clean-up (docs/STAMPS.md v2.1) for the white share card.

    python3 scripts/stamps/clean.py <review-folder> [<review-folder> ...] [--out app/src/assets/stamps]

Reads stamps-review/<folder>/raw/<id>.png and writes <out>/<CC>/<slug>.png (id "MY-penang" ->
MY/penang.png): white paper becomes transparent, every stamp is re-inked in one exact Fargo teal
(#065E6B, the median ink of the approved set) so the library matches, cropped to the stamp's own
shape with a small margin, long side 800 px, saved as a 32-level palette PNG (~1/4 the size).
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

TEAL = (6, 94, 107)  # #065E6B
LONG_SIDE = 800
INK_LUMA = 0.299 * TEAL[0] + 0.587 * TEAL[1] + 0.114 * TEAL[2]  # how dark full ink is
FULL = 255 - INK_LUMA  # darkness of solid ink
FLOOR = 18  # paper speckle below this darkness is dropped

root = Path(__file__).resolve().parents[2]
args = sys.argv[1:]
out = root / (args[args.index("--out") + 1] if "--out" in args else "app/src/assets/stamps")
folders = [a for i, a in enumerate(args) if not a.startswith("--") and (i == 0 or args[i - 1] != "--out")]

made = 0
for folder in folders:
    for src in sorted((root / "stamps-review" / folder / "raw").glob("*.png")):
        cc, slug = src.stem.split("-", 1)
        im = Image.open(src).convert("RGBA")
        flat = Image.new("RGBA", im.size, (255, 255, 255, 255))
        flat.alpha_composite(im)  # some models return transparency; treat it as paper
        dark = ImageOps.invert(flat.convert("L"))
        alpha = dark.point(lambda v: 0 if v < FLOOR else min(255, round((v - FLOOR) * 255 / (FULL - FLOOR))))
        box = alpha.point(lambda v: 255 if v > 40 else 0).getbbox()
        if not box:
            print(f"empty  {src.name}")
            continue
        pad = round(max(box[2] - box[0], box[3] - box[1]) * 0.015)
        box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
        alpha = alpha.crop(box)
        k = LONG_SIDE / max(alpha.size)
        alpha = alpha.resize((round(alpha.width * k), round(alpha.height * k)), Image.LANCZOS)
        stamp = Image.new("RGBA", alpha.size, TEAL + (0,))
        stamp.putalpha(alpha)
        dest = out / cc / f"{slug}.png"
        dest.parent.mkdir(parents=True, exist_ok=True)
        # One colour, so a 32-level palette keeps it identical to the eye at a fraction of the size
        stamp.quantize(colors=32, method=Image.Quantize.FASTOCTREE).save(dest, optimize=True)
        made += 1
print(f"{made} stamps -> {out.relative_to(root)}")
