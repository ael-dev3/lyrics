#!/usr/bin/env python3
"""Make a clearly labeled static preview reference from the locked source frame.

This is an editorial still for the repository gallery, not an encoded film frame
or evidence of browser playback. The live preview remains the review source.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
SOURCE = ROOT / "public/source.mp4"
TIMELINE = ROOT / "src/timeline.json"
OUTPUT = REPO / "assets/ill-change-for-you-preview-45.png"
SECOND = 45.0
FONT = "/System/Library/Fonts/Supplemental/Iowan Old Style.ttc"


def source_digest() -> str:
    digest = hashlib.sha256()
    with SOURCE.open("rb") as stream:
        for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def wrapped_words(draw: ImageDraw.ImageDraw, words: list[dict], font: ImageFont.FreeTypeFont, max_width: int) -> list[list[dict]]:
    all_text = " ".join(word["text"] for word in words)
    if draw.textlength(all_text, font=font) <= max_width:
        return [words]
    choices = []
    for split in range(1, len(words)):
        left, right = words[:split], words[split:]
        left_width = draw.textlength(" ".join(word["text"] for word in left), font=font)
        right_width = draw.textlength(" ".join(word["text"] for word in right), font=font)
        if max(left_width, right_width) <= max_width:
            choices.append((abs(left_width - right_width), left, right))
    if not choices:
        raise SystemExit("Representative line needs more than two rows")
    _, left, right = min(choices, key=lambda item: item[0])
    return [left, right]


def main() -> None:
    timeline = json.loads(TIMELINE.read_text())
    if source_digest() != timeline["sourceSha256"]:
        raise SystemExit("Local source does not match the locked preview timeline")
    cue = next(line for section in timeline["sections"] for line in section["lines"]
               if line["words"][0]["start"] <= SECOND < line["words"][-1]["end"])
    with tempfile.TemporaryDirectory(prefix="ill-change-still-") as temp:
        frame = Path(temp) / "source.png"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(SECOND),
                        "-i", str(SOURCE), "-frames:v", "1", "-update", "1", "-y", str(frame)], check=True)
        image = Image.open(frame).convert("RGB")
    width, height = image.size
    if (width, height) != (1440, 1080):
        raise SystemExit(f"Unexpected source size {width}×{height}")

    # Match the browser's light-picture treatment at this exact scene.
    wash = Image.new("RGBA", image.size, (0, 0, 0, 0))
    wash_pixels = wash.load()
    for y in range(round(height * .48), height):
        progress = (y / height - .48) / .52
        alpha = round(133 * max(0, min(1, (progress - .27) / .73)))
        for x in range(width):
            wash_pixels[x, y] = (250, 242, 226, alpha)
    image = Image.alpha_composite(image.convert("RGBA"), wash)

    font = ImageFont.truetype(FONT, round(width * .0425), index=1)
    draw = ImageDraw.Draw(image)
    lines = wrapped_words(draw, cue["words"], font, round(width * .86))
    line_height = round(width * .0425 * 1.20)
    y = round(height * .88) - line_height * len(lines)
    active = next((word["id"] for word in cue["words"] if word["start"] <= SECOND < word["end"]), None)
    positions = []
    for line in lines:
        line_text = " ".join(word["text"] for word in line)
        x = (width - draw.textlength(line_text, font=font)) / 2
        for word in line:
            positions.append((x, y, word))
            x += draw.textlength(word["text"] + " ", font=font)
        y += line_height
    halo = Image.new("RGBA", image.size, (0, 0, 0, 0))
    halo_draw = ImageDraw.Draw(halo)
    for x, y, word in positions:
        halo_draw.text((x, y), word["text"], font=font, fill=(255, 249, 239, 220), stroke_width=2)
    image = Image.alpha_composite(image, halo.filter(ImageFilter.GaussianBlur(5)))
    draw = ImageDraw.Draw(image)
    for x, y, word in positions:
        fill = "#992d47" if word["id"] == active else "#241c23"
        draw.text((x, y), word["text"], font=font, fill=fill)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(OUTPUT, optimize=True)
    print(f"{OUTPUT}: {width}×{height}; source {SECOND:.2f}s; cue {cue['id']}; active {active}")


if __name__ == "__main__":
    main()
