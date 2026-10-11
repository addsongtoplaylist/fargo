"""Stamp inks (STAMPS.md, owner 2026-10-12): every library stamp gets one of three fixed inks —
teal, passport red or ochre — mixed so each covers about a third and a country's stamps differ.

    python3 scripts/stamps/recolour.py

Re-inks app/public/stamp-art/<CC>/*.png in place (only the colour changes; the stamp's shape comes
from its alpha, so running it again gives the same result) and writes scripts/stamps/inks.json.
Rule: countries in A–Z order, stamps in A–Z order within a country; ink = INKS[(country index +
stamp index) % 3]. New stamps: add the file, run this again (earlier stamps may shift colour).
"""
import json
from pathlib import Path
from PIL import Image

INKS = [("teal", (6, 94, 107)), ("red", (184, 50, 42)), ("ochre", (192, 138, 16))]
root = Path(__file__).resolve().parents[2]
stamps = root / "app/public/stamp-art"

assigned = {}
for ci, country in enumerate(sorted(p for p in stamps.iterdir() if p.is_dir())):
    for si, f in enumerate(sorted(country.glob("*.png"))):
        name, rgb = INKS[(ci + si) % 3]
        alpha = Image.open(f).convert("RGBA").getchannel("A")
        out = Image.new("RGBA", alpha.size, rgb + (0,))
        out.putalpha(alpha)
        out.quantize(colors=32, method=Image.Quantize.FASTOCTREE).save(f, optimize=True)
        assigned[f"{country.name}-{f.stem}"] = name

(root / "scripts/stamps/inks.json").write_text(json.dumps(assigned, indent=2) + "\n")
counts = {n: list(assigned.values()).count(n) for n, _ in INKS}
print(len(assigned), "stamps:", counts)
