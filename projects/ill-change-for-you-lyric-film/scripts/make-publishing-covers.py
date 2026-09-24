#!/usr/bin/env python3
"""Make source-derived upload covers for the locked Mitski recording."""

from __future__ import annotations

import hashlib
import io
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/source.mp4"
MANIFEST = ROOT / "source/media-manifest.json"
PUBLISHING = ROOT / "publishing"
PROOF = ROOT / "evidence/cover-review"
FRAME_SECONDS = 45.0
SERIF = Path("/System/Library/Fonts/NewYork.ttf")
SANS = Path("/System/Library/Fonts/Avenir.ttc")
# Generated covers are committed. These bundled typefaces give a legible
# fallback when regenerating on a host without the original macOS fonts.
if not SERIF.exists():
    SERIF = ROOT.parent / "pero-es-locura-lyric-film/public/fonts/CormorantGaramond-Semibold.ttf"
if not SANS.exists():
    SANS = ROOT.parent / "midnight-love-lyric-film/public/SpaceGrotesk.ttf"
CREAM = (249, 239, 222)
PLUM = (34, 19, 30)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def source_frame() -> Image.Image:
    expected = json.loads(MANIFEST.read_text())["sha256"]
    actual = sha256(SOURCE)
    if actual != expected:
        raise SystemExit(f"Source SHA-256 mismatch: {actual} != {expected}")
    png = subprocess.check_output(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(FRAME_SECONDS),
         "-i", str(SOURCE), "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
    )
    frame = Image.open(io.BytesIO(png)).convert("RGB")
    if frame.size != (1440, 1080):
        raise SystemExit(f"Unexpected source frame size: {frame.size}")
    return frame


def linear_overlay(size: tuple[int, int], vertical: bool) -> Image.Image:
    width, height = size
    shade = Image.new("RGBA", size, (*PLUM, 0))
    pixels = shade.load()
    for y in range(height):
        for x in range(width):
            if vertical:
                # Keep the artist's face untouched; only the title area recedes.
                u = max(0.0, min(1.0, (y - 690) / 600))
                opacity = int(210 * u ** 1.55)
            else:
                # A soft reading field, fading into the source room and figure.
                u = max(0.0, min(1.0, (x - 100) / 1000))
                opacity = int(198 * (1 - u) ** 1.6)
                opacity = max(opacity, int(38 * max(0.0, (y - 610) / 470)))
            pixels[x, y] = (*PLUM, opacity)
    return shade


def text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, font: ImageFont.FreeTypeFont,
         fill: tuple[int, int, int] = CREAM, spacing: int = 0) -> None:
    x, y = xy
    if spacing:
        for character in value:
            draw.text((x, y), character, font=font, fill=fill, stroke_width=0)
            x += draw.textlength(character, font=font) + spacing
    else:
        draw.text(xy, value, font=font, fill=fill, stroke_width=0)


def landscape(frame: Image.Image) -> Image.Image:
    # Top-anchored crop retains the face and the video’s hand-marked room.
    base = frame.resize((1920, 1440), Image.Resampling.LANCZOS).crop((0, 0, 1920, 1080)).convert("RGBA")
    base = Image.alpha_composite(base, linear_overlay((1920, 1080), vertical=False))
    draw = ImageDraw.Draw(base)
    sans = ImageFont.truetype(str(SANS), 58)
    title = ImageFont.truetype(str(SERIF), 135)
    text(draw, (125, 88), "MITSKI", sans, spacing=8)
    draw.line((125, 176, 480, 176), fill=(*CREAM, 190), width=3)
    text(draw, (125, 612), "I’LL CHANGE", title)
    text(draw, (125, 753), "FOR YOU", title)
    return base.convert("RGB")


def portrait(frame: Image.Image) -> Image.Image:
    # Dedicated 3:4 composition: the complete vertical source frame is used,
    # while the horizontal crop is centered on Mitski at this source moment.
    base = frame.crop((355, 0, 1165, 1080)).resize((1200, 1600), Image.Resampling.LANCZOS).convert("RGBA")
    base = Image.alpha_composite(base, linear_overlay((1200, 1600), vertical=True))
    draw = ImageDraw.Draw(base)
    sans = ImageFont.truetype(str(SANS), 74)
    title = ImageFont.truetype(str(SERIF), 142)
    text(draw, (100, 985), "MITSKI", sans, spacing=8)
    draw.line((100, 1091, 511, 1091), fill=(*CREAM, 190), width=3)
    text(draw, (100, 1130), "I’LL CHANGE", title)
    text(draw, (100, 1306), "FOR YOU", title)
    return base.convert("RGB")


def save_review(image: Image.Image, filename: str, small: tuple[int, int]) -> dict:
    destination = PUBLISHING / filename
    image.save(destination, "JPEG", quality=94, subsampling=0, optimize=True)
    reduced = image.resize(small, Image.Resampling.LANCZOS)
    reduced.save(PROOF / filename.replace(".jpg", f"-{small[0]}x{small[1]}.png"))
    margin_x, margin_y = round(image.width * .05), round(image.height * .05)
    cropped = image.crop((margin_x, margin_y, image.width - margin_x, image.height - margin_y))
    cropped.resize(small, Image.Resampling.LANCZOS).save(
        PROOF / filename.replace(".jpg", f"-crop5-{small[0]}x{small[1]}.png"))
    saved = Image.open(destination)
    assert saved.size == image.size
    assert saved.getexif().get(274, 1) == 1
    return {
        "file": filename,
        "size": image.size,
        "bytes": destination.stat().st_size,
        "sha256": sha256(destination),
        "sourceFrameSeconds": FRAME_SECONDS,
        "sourceSha256": json.loads(MANIFEST.read_text())["sha256"],
        "typefaces": [SERIF.name, SANS.name],
        "smallProof": small,
        "cropStress": "5% on each edge",
        "exifOrientation": saved.getexif().get(274, 1),
    }


def main() -> None:
    PUBLISHING.mkdir(parents=True, exist_ok=True)
    PROOF.mkdir(parents=True, exist_ok=True)
    frame = source_frame()
    records = [
        save_review(landscape(frame), "Mitski-Ill-Change-for-You-YouTube-Thumbnail-1920x1080.jpg", (320, 180)),
        save_review(portrait(frame), "Mitski-Ill-Change-for-You-TikTok-Cover-Profile-1200x1600.jpg", (150, 200)),
    ]
    (ROOT / "evidence/cover-assets.json").write_text(json.dumps({"covers": records}, indent=2) + "\n")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
