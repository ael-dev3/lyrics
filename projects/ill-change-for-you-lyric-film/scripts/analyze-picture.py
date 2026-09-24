#!/usr/bin/env python3
"""Measure the source picture behind the likely lyric area at two samples/second.

This is a deterministic readability *proposal*, not a shot or text-contrast proof.
It never edits the media, lyrics, or authored picture. Run from any directory:

    python3 scripts/analyze-picture.py

Requires ffmpeg and ffprobe. The 160x120 area-downsampled RGB proxy deliberately
suppresses film grain, while retaining the broad bright/dark changes that matter
when choosing a legible ink color. Inspect the actual full-size preview as well.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/source.mp4"
OUTPUT = ROOT / "public/picture-tones.json"
AUDIT = ROOT / "evidence/picture-tone-audit.json"
RATE = 2
WIDTH, HEIGHT = 160, 120
# Candidate lower-picture reading zone; normalized source coordinates, not a
# declaration that the final landscape and portrait lyric layouts must use it.
ROI = (0.10, 0.58, 0.90, 0.88)
ROI_PX = tuple(round(v * (WIDTH if i % 2 == 0 else HEIGHT)) for i, v in enumerate(ROI))
PIXELS_PER_FRAME = WIDTH * HEIGHT * 3
LIGHT_MEDIAN = 156
LIGHT_SHARE = 0.40
DARK_MEDIAN = 102
DARK_SHARE = 0.26
BRIGHT_PIXEL = 185
DARK_PIXEL = 75
CONFIRM_SAMPLES = 2  # Two consecutive half-second observations.
MIN_HOLD_SAMPLES = 4  # Hold a switched state for at least two seconds.


def run_json(*args: str) -> dict:
    return json.loads(subprocess.check_output(args, text=True))


def source_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def percentile(sorted_values: list[int], percentile_number: float) -> int:
    return sorted_values[round((len(sorted_values) - 1) * percentile_number)]


def measure_rgb(frame: bytes) -> dict:
    left, top, right, bottom = ROI_PX
    values = []
    view = memoryview(frame)
    for y in range(top, bottom):
        row = y * WIDTH * 3
        for x in range(left, right):
            index = row + x * 3
            # Integer approximation of gamma-encoded Rec.709 luma. This is a
            # viewing proxy, not a linear-light luminance or WCAG contrast.
            values.append((54 * view[index] + 183 * view[index + 1] + 19 * view[index + 2]) >> 8)
    values.sort()
    count = len(values)
    return {
        "medianLuma": percentile(values, 0.50),
        "p75Luma": percentile(values, 0.75),
        "brightFraction": round(sum(value >= BRIGHT_PIXEL for value in values) / count, 4),
        "darkFraction": round(sum(value <= DARK_PIXEL for value in values) / count, 4),
    }


def proposed_raw_mode(item: dict) -> str:
    if item["medianLuma"] >= LIGHT_MEDIAN or item["brightFraction"] >= LIGHT_SHARE:
        return "light"
    if item["medianLuma"] <= DARK_MEDIAN and item["brightFraction"] <= DARK_SHARE:
        return "dark"
    return "uncertain"


def apply_hysteresis(values: list[dict]) -> None:
    # Initial state is decided from the first two observations, then never
    # guesses a new polarity for intermediate frames. A change requires two
    # consecutive proposals and a hold after each switch to prevent flicker.
    initial = values[: min(CONFIRM_SAMPLES, len(values))]
    mode = "light" if sum(row["medianLuma"] for row in initial) / len(initial) >= LIGHT_MEDIAN else "dark"
    candidate = ""
    consecutive = 0
    candidate_start = 0
    last_switch_index = -MIN_HOLD_SAMPLES
    for index, item in enumerate(values):
        item["mode"] = mode
        proposal = proposed_raw_mode(item)
        if proposal == mode or proposal == "uncertain":
            candidate, consecutive = "", 0
        elif proposal == candidate:
            consecutive += 1
        else:
            candidate, consecutive = proposal, 1
            candidate_start = index
        if consecutive >= CONFIRM_SAMPLES and index - last_switch_index >= MIN_HOLD_SAMPLES:
            # We have seen the confirming future observation. Place the
            # boundary on the first qualifying sample, subject to the hold,
            # rather than adding an artificial half-second playback delay.
            switch_index = max(candidate_start, last_switch_index + MIN_HOLD_SAMPLES)
            for row in values[switch_index : index + 1]:
                row["mode"] = candidate
            mode = candidate
            last_switch_index = switch_index
            candidate, consecutive = "", 0


def runs(values: list[dict]) -> list[dict]:
    result = []
    for index, item in enumerate(values):
        if not result or item["mode"] != result[-1]["mode"]:
            result.append({"start": item["time"], "end": item["time"], "mode": item["mode"], "samples": 1})
        else:
            result[-1]["end"] = item["time"]
            result[-1]["samples"] += 1
    return result


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing locked source: {SOURCE}")
    probe = run_json(
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration:stream=index,codec_type,width,height,avg_frame_rate",
        "-of", "json", str(SOURCE),
    )
    video = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
    if (video["width"], video["height"]) != (1440, 1080):
        raise SystemExit("Source size changed; review ROI and analysis assumptions before regenerating")
    command = [
        "ffmpeg", "-v", "error", "-i", str(SOURCE),
        "-vf", f"fps=fps={RATE}:start_time=0:round=near,scale={WIDTH}:{HEIGHT}:flags=area,format=rgb24",
        "-an", "-vsync", "0", "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
    ]
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    assert process.stdout is not None
    values = []
    try:
        while True:
            frame = process.stdout.read(PIXELS_PER_FRAME)
            if not frame:
                break
            if len(frame) != PIXELS_PER_FRAME:
                raise RuntimeError("Incomplete decoded RGB frame")
            values.append({"time": round(len(values) / RATE, 3), **measure_rgb(frame)})
    finally:
        process.stdout.close()
    error = process.stderr.read().decode("utf-8", errors="replace") if process.stderr else ""
    if process.wait() != 0:
        raise RuntimeError(f"ffmpeg failed: {error}")
    if not values:
        raise RuntimeError("No picture samples decoded")
    apply_hysteresis(values)
    identity = source_sha256(SOURCE)
    payload = {
        "schema": "source-picture-tones/v1",
        "sourceSha256": identity,
        "framesPerSecond": RATE,
        "sourceRegion": {"x0": ROI[0], "y0": ROI[1], "x1": ROI[2], "y1": ROI[3]},
        "modeMeaning": {"light": "Bright lower source area; dark lyric ink may read better", "dark": "Dark lower source area; light lyric ink may read better"},
        "values": values,
    }
    # A conservative list for manual review. Holding an ink mode through a
    # contrary extreme may be preferable to distracting flicker, but the
    # actual preview may require an authored cut or continuous local shading.
    conflicting = [
        {
            "time": item["time"],
            "mode": item["mode"],
            "medianLuma": item["medianLuma"],
            "brightFraction": item["brightFraction"],
        }
        for item in values
        if (item["mode"] == "dark" and item["medianLuma"] >= 205)
        or (item["mode"] == "light" and item["medianLuma"] <= 65)
    ]
    mode_runs = runs(values)
    audit = {
        "schema": "source-picture-tone-audit/v1",
        "sourceSha256": identity,
        "sourceVideo": {
            "width": video["width"], "height": video["height"],
            "avgFrameRate": video["avg_frame_rate"],
            "containerDurationSeconds": float(probe["format"]["duration"]),
        },
        "sampling": {
            "rateHz": RATE, "proxySize": [WIDTH, HEIGHT],
            "roiNormalized": list(ROI), "roiPixels": list(ROI_PX),
            "luma": "(54R + 183G + 19B) / 256 on gamma-encoded RGB proxy",
            "downsample": "FFmpeg area filter; suppresses fine grain and print dots",
            "brightPixelAtLeast": BRIGHT_PIXEL, "darkPixelAtMost": DARK_PIXEL,
            "lightIf": f"median >= {LIGHT_MEDIAN} or bright fraction >= {LIGHT_SHARE}",
            "darkIf": f"median <= {DARK_MEDIAN} and bright fraction <= {DARK_SHARE}",
            "hysteresis": f"two consecutive {1/RATE:.1f}s observations; minimum {MIN_HOLD_SAMPLES/RATE:.1f}s after a switch",
        },
        "summary": {
            "sampleCount": len(values),
            "firstSampleSeconds": values[0]["time"],
            "lastSampleSeconds": values[-1]["time"],
            "modeCounts": {mode: sum(item["mode"] == mode for item in values) for mode in ("light", "dark")},
            "modeSwitches": len(mode_runs) - 1,
            "medianLumaRange": [min(item["medianLuma"] for item in values), max(item["medianLuma"] for item in values)],
            "contraryExtremeCount": len(conflicting),
        },
        "modeRuns": mode_runs,
        "manualReviewCandidates": conflicting,
        "limitations": [
            "This measures a provisional lower source region, not final text pixels or portrait framing.",
            "Half-second sampling can miss shorter cuts, white leaders and flashes; held modes deliberately avoid chasing them.",
            "A luma proxy cannot certify glyph contrast over detailed faces or colored film marks; review the complete source-backed preview at normal and small-player sizes.",
            "Mode estimates are artistic suggestions. Do not retime lyrics or treat these values as acoustic evidence.",
        ],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    AUDIT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(audit["summary"], indent=2))


if __name__ == "__main__":
    main()
