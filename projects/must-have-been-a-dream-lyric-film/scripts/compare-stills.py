"""Compare one source-clock browser-canvas PNG with the native render PNG.

Both images must show the canvas pixels alone at the same decoded source frame.
This is a diagnostic, not a substitute for watching motion and listening.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser", required=True, type=Path)
    parser.add_argument("--native", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--source-frame", required=True, type=int)
    parser.add_argument("--format", required=True, choices=("landscape", "portrait"))
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    subprocess.run(
        ["node", "--input-type=module", "-e", "import {assertGate} from './scripts/render-gate.ts'; assertGate();"],
        cwd=root,
        check=True,
    )
    with Image.open(args.browser) as opened:
        browser = opened.convert("RGB")
    with Image.open(args.native) as opened:
        native = opened.convert("RGB")
    expected_size = (1920, 1080) if args.format == "landscape" else (1080, 1920)
    if browser.size != expected_size or native.size != expected_size:
        raise ValueError(f"Expected canvas-only {expected_size} images, got {browser.size} and {native.size}")

    def metrics(box: tuple[int, int, int, int]) -> dict[str, float]:
        difference = ImageChops.difference(browser.crop(box), native.crop(box))
        rgb_mean = ImageStat.Stat(difference).mean
        gray_hist = difference.convert("L").histogram()
        count = (box[2] - box[0]) * (box[3] - box[1])
        return {
            "meanAbsoluteRgb": round(sum(rgb_mean) / 3, 4),
            "pixelsLumaDiffOver16Percent": round(sum(gray_hist[17:]) / count * 100, 4),
            "pixelsLumaDiffOver32Percent": round(sum(gray_hist[33:]) / count * 100, 4),
        }

    width, height = expected_size
    regions = {
        "all": (0, 0, width, height),
        "upper": (0, 0, width, height // 3),
        "middle": (0, height // 3, width, height * 2 // 3),
        "lower": (0, height * 2 // 3, width, height),
    }
    report = {
        "status": "diagnostic; inspect difference image and moving preview too",
        "format": args.format,
        "sourceFrame": args.source_frame,
        "sourceTimeSeconds": args.source_frame * 1001 / 24000,
        "width": width,
        "height": height,
        "browserSha256": hashlib.sha256(args.browser.read_bytes()).hexdigest(),
        "nativeSha256": hashlib.sha256(args.native.read_bytes()).hexdigest(),
        "regions": {name: metrics(box) for name, box in regions.items()},
    }
    args.out_dir.mkdir(parents=True, exist_ok=True)
    stem = f"parity-{args.format}-{args.source_frame}"
    difference = ImageChops.difference(browser, native)
    difference.point(lambda value: min(255, value * 4)).save(args.out_dir / f"{stem}-difference-4x.png")
    (args.out_dir / f"{stem}.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
