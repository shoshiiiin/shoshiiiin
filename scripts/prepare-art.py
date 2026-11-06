"""Prepare generated figure images for the SVGs.

Put PNGs with transparent background into art/ (itachi.png, sasuke.png, team7.png,
itachi-susanoo.png, sasuke-susanoo.png), then run:  python3 -I scripts/prepare-art.py

Each image is trimmed to its visible pixels, scaled down and saved as WebP with alpha
in src/art/, small enough to embed in an SVG. For the Susanoo the contour of the
visible body is also sampled into points, which the hero draws as Lichtfeld light.
Missing files are skipped; the build then keeps the drawn silhouettes.
"""

import json
import math
import random
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "art"
TARGET = ROOT / "src" / "art"

# name -> height in pixels after trimming (about twice the size shown on GitHub)
FIGURES = {"itachi": 760, "sasuke": 760, "team7": 420, "itachi-susanoo": 640, "sasuke-susanoo": 640}
ALPHA_FLOOR = 10
QUALITY = 82

# Contour points for the Susanoo: where the body (not its faint glow) meets the dark.
OUTLINE_FLOOR = 90
OUTLINE_POINTS = 320
OUTLINE_STEP = 2


def outline(image: Image.Image, count: int = OUTLINE_POINTS) -> list[list[float]]:
    """Sample points on the boundary of the image's solid part, ordered around its centre.

    Coordinates are fractions of width and height, so the scene can place them at any size.
    """
    alpha = image.getchannel("A")
    w, h = alpha.size
    px = alpha.load()
    s = OUTLINE_STEP
    edge = []
    for y in range(s, h - s, s):
        for x in range(s, w - s, s):
            if px[x, y] <= OUTLINE_FLOOR:
                continue
            if min(px[x - s, y], px[x + s, y], px[x, y - s], px[x, y + s]) <= OUTLINE_FLOOR:
                edge.append((x, y))
    if not edge:
        return []
    picked = random.Random(7).sample(edge, min(count, len(edge)))
    cx = sum(p[0] for p in picked) / len(picked)
    cy = sum(p[1] for p in picked) / len(picked)
    picked.sort(key=lambda p: math.atan2(p[1] - cy, p[0] - cx))
    return [[round(x / w, 4), round(y / h, 4)] for x, y in picked]


METADATA_CHUNKS = {b"EXIF", b"XMP "}


def assert_no_metadata(path: Path) -> None:
    """Walk the RIFF chunks of a WebP file and refuse any metadata chunk."""
    data = path.read_bytes()
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise SystemExit(f"{path.name}: not a WebP file")
    pos = 12
    while pos + 8 <= len(data):
        fourcc = data[pos : pos + 4]
        size = int.from_bytes(data[pos + 4 : pos + 8], "little")
        if fourcc in METADATA_CHUNKS:
            raise SystemExit(f"{path.name}: still carries a {fourcc.decode().strip()} chunk")
        pos += 8 + size + (size & 1)


def prepare(name: str, height: int) -> None:
    src = SOURCE / f"{name}.png"
    if not src.exists():
        print(f"{name:15} skipped (no {src.relative_to(ROOT)})")
        return
    image = Image.open(src).convert("RGBA")
    alpha = image.getchannel("A").point(lambda a: 255 if a > ALPHA_FLOOR else 0)
    box = alpha.getbbox()
    if box is None:
        raise SystemExit(f"{name}: image is fully transparent")
    corners = [image.getpixel(p)[3] for p in [(0, 0), (image.width - 1, 0), (0, image.height - 1)]]
    if min(corners) > 200:
        raise SystemExit(f"{name}: background is not transparent; export PNG with a transparent background")
    trimmed = image.crop(box)
    scale = height / trimmed.height
    sized = trimmed.resize((round(trimmed.width * scale), height), Image.LANCZOS) if scale < 1 else trimmed
    TARGET.mkdir(parents=True, exist_ok=True)
    out = TARGET / f"{name}.webp"
    # Copy only the pixels: no EXIF, XMP or provenance data from the generator leaves this machine.
    clean = Image.frombytes("RGBA", sized.size, sized.tobytes())
    clean.save(out, "WEBP", quality=QUALITY, alpha_quality=90, method=6, exif=b"", xmp=b"")
    assert_no_metadata(out)
    meta = {"w": sized.width, "h": sized.height}
    if name.endswith("-susanoo"):
        meta["outline"] = outline(clean)
    (TARGET / f"{name}.json").write_text(json.dumps(meta) + "\n")
    print(f"{name:15} {sized.width}x{sized.height}  {out.stat().st_size / 1024:.0f} KB")


def main() -> int:
    for name, height in FIGURES.items():
        prepare(name, height)
    return 0


if __name__ == "__main__":
    sys.exit(main())
