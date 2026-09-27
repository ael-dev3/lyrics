#!/usr/bin/env python3
"""Build an exact-frame, compact visual study from the five primary X clips.

Every decoded video frame is represented by one numbered JPEG and one CSV row.
The original MP4 remains available for native-resolution inspection.
"""

from __future__ import annotations

import csv
import hashlib
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat


ROOT = Path(__file__).resolve().parent
PRIMARY_DIRS = [
    "other__reality-2102514581684052169",
    "donaldjewkes-2102801274173587569",
    "mexicat-2103108369569726802",
    "pleometric-2103082510607610023",
    "luisbizarro-2104111432149164474",
]
SHEET_COLS, SHEET_ROWS = 15, 10
SHEET_SIZE = SHEET_COLS * SHEET_ROWS
TILE_W, TILE_H = 166, 112


def command_json(args: list[str]) -> dict:
    return json.loads(subprocess.check_output(args, text=True))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(4 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def frame_path(folder: Path, index: int) -> Path:
    return folder / f"frame_{index:06d}.jpg"


def extract(video: Path, frames: Path, expected: int) -> None:
    frames.mkdir(exist_ok=True)
    # Re-extract on every run: a new source can have the same frame count as
    # an older source, so a count-only cache could mix stale images with a new
    # manifest hash and produce invalid measurements.
    for stale in frames.glob("frame_*.jpg"):
        stale.unlink()
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-threads", "2",
        "-i", str(video), "-map", "0:v:0", "-an", "-sn", "-dn",
        "-vf", "scale=320:-2:flags=lanczos", "-fps_mode", "passthrough",
        "-q:v", "3", "-start_number", "0", str(frames / "frame_%06d.jpg"),
    ]
    subprocess.run(cmd, check=True)
    actual = len(list(frames.glob("frame_*.jpg")))
    if actual != expected or not frame_path(frames, expected - 1).exists():
        raise RuntimeError(f"{video}: extracted {actual} frames, expected {expected}")


def make_sheet(paths: list[Path], first: int, times: list[float], out: Path) -> None:
    sheet = Image.new("RGB", (TILE_W * SHEET_COLS, TILE_H * SHEET_ROWS), "#111620")
    draw = ImageDraw.Draw(sheet)
    for offset, path in enumerate(paths):
        index = first + offset
        x, y = (offset % SHEET_COLS) * TILE_W, (offset // SHEET_COLS) * TILE_H
        with Image.open(path) as source:
            thumb = source.convert("RGB")
            thumb.thumbnail((TILE_W - 6, 90), Image.Resampling.LANCZOS)
            sheet.paste(thumb, (x + (TILE_W - thumb.width) // 2, y))
        draw.text((x + 4, y + 92), f"{index:06d}  {times[index]:07.3f}s", fill="#f1f5f9")
    sheet.save(out, quality=90, subsampling=0, optimize=True)


def svg_chart(rows: list[dict], out: Path) -> None:
    width, height = 1600, 320
    values = [float(row["frame_delta_0_1"]) for row in rows]
    sorted_values = sorted(values)
    p99 = sorted_values[int(0.99 * (len(values) - 1))] if values else 0
    ceiling = max(p99 * 1.25, 0.01)
    points = []
    for i, value in enumerate(values):
        x = 45 + i * (width - 65) / max(len(values) - 1, 1)
        y = height - 45 - min(value / ceiling, 1) * (height - 85)
        points.append(f"{x:.1f},{y:.1f}")
    duration = float(rows[-1]["timestamp_seconds"]) if rows else 0
    out.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">'
        '<rect width="100%" height="100%" fill="#111620"/>'
        f'<text x="45" y="25" fill="#eef2ff" font-family="sans-serif" font-size="16">'
        'Frame-to-frame pixel change (resized preview; peaks may be cuts or rapid motion)</text>'
        f'<path d="M {" L ".join(points)}" fill="none" stroke="#63dbff" stroke-width="1.4"/>'
        f'<text x="45" y="{height-16}" fill="#aab4c2" font-family="sans-serif" font-size="12">0 s</text>'
        f'<text x="{width-115}" y="{height-16}" fill="#aab4c2" font-family="sans-serif" font-size="12">'
        f'{duration:.2f} s</text></svg>', encoding="utf-8"
    )


def viewer(frame_count: int, times: list[float], out: Path) -> None:
    rounded = [round(t, 5) for t in times]
    html = """<!doctype html><html lang="en"><meta charset="utf-8">
<title>Exact-frame video study</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;background:#0b1018;color:#e6edf4;font:15px system-ui,sans-serif}
header{padding:14px 20px;border-bottom:1px solid #293344}main{padding:16px;max-width:1500px;margin:auto}
img{display:block;max-width:100%;width:960px;height:auto;margin:0 auto;background:#000;image-rendering:auto}
.controls{display:flex;align-items:center;gap:12px;margin:18px auto;max-width:960px}
input{flex:1}button{font-size:18px;padding:6px 14px;background:#253952;color:#fff;border:1px solid #527698;border-radius:4px}
a{color:#7fd8ff}.hint{color:#a5b3c5}.meta{font-variant-numeric:tabular-nums;min-width:170px;text-align:right}</style>
<header><strong>Frame-by-frame viewer</strong> · one image for each decoded source frame · <a href="source.mp4">open original MP4</a> · <a href="frame-index.csv">frame data</a> · <a href="contact-sheets/">contact sheets</a></header>
<main><img id="frame" alt="Selected exact video frame"><div class="controls"><button id="prev" title="Previous frame">←</button>
<input id="slider" type="range" min="0" max="FRAME_MAX" value="0"><button id="next" title="Next frame">→</button><span id="meta" class="meta"></span></div>
<p class="hint">Use ← and → to move one frame, or drag the slider. The preview frames are 320 pixels wide; open the MP4 for native detail. Each contact sheet contains 150 consecutive frames.</p>
<img src="frame-activity.svg" alt="Frame change chart"></main>
<script>const times=TIMES;const slider=document.getElementById('slider');const frame=document.getElementById('frame');const meta=document.getElementById('meta');
function show(n){n=Math.max(0,Math.min(times.length-1,n));slider.value=n;frame.src='frames/frame_'+String(n).padStart(6,'0')+'.jpg';meta.textContent=`#${n} · ${times[n].toFixed(3)} s`;}
document.getElementById('prev').onclick=()=>show(+slider.value-1);document.getElementById('next').onclick=()=>show(+slider.value+1);
slider.oninput=()=>show(+slider.value);document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(+slider.value-1)}if(e.key==='ArrowRight'){e.preventDefault();show(+slider.value+1)}});show(0)</script></html>"""
    out.write_text(html.replace("FRAME_MAX", str(frame_count - 1)).replace("TIMES", json.dumps(rounded, separators=(",", ":"))), encoding="utf-8")


def process(folder: Path) -> dict:
    video = folder / "source.mp4"
    if not video.exists():
        raise FileNotFoundError(video)
    probe = command_json(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(video)])
    stream = next(s for s in probe["streams"] if s["codec_type"] == "video")
    frames_info = command_json([
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_frames",
        "-show_entries", "frame=best_effort_timestamp_time,pkt_duration_time,pict_type,key_frame",
        "-of", "json", str(video),
    ])["frames"]
    expected = len(frames_info)
    # HLS remuxes sometimes carry a nominal nb_frames that differs from the
    # number of frames actually decoded. Preserve both counts in the report.
    times = [float(f["best_effort_timestamp_time"]) for f in frames_info]
    if any(times[i] < times[i-1] for i in range(1, expected)):
        raise RuntimeError(f"{video}: timestamps are out of order")
    frame_dir = folder / "frames"
    extract(video, frame_dir, expected)

    rows: list[dict] = []
    prev = None
    for index, meta in enumerate(frames_info):
        with Image.open(frame_path(frame_dir, index)) as source:
            small = source.convert("RGB").resize((96, 54), Image.Resampling.BILINEAR)
        gray = small.convert("L")
        bright = ImageStat.Stat(gray).mean[0] / 255
        saturation = ImageStat.Stat(small.convert("HSV")).mean[1] / 255
        edge = ImageStat.Stat(gray.filter(ImageFilter.FIND_EDGES)).mean[0] / 255
        delta = 0 if prev is None else sum(ImageStat.Stat(ImageChops.difference(small, prev)).mean) / 3 / 255
        rows.append({
            "frame": index, "timestamp_seconds": f"{times[index]:.6f}",
            "duration_seconds": meta.get("pkt_duration_time", ""),
            "keyframe": meta.get("key_frame", ""), "pict_type": meta.get("pict_type", ""),
            "brightness_0_1": f"{bright:.5f}", "saturation_0_1": f"{saturation:.5f}",
            "edge_energy_0_1": f"{edge:.5f}", "frame_delta_0_1": f"{delta:.5f}",
            "image": str(frame_path(Path("frames"), index)),
        })
        prev = small
    with (folder / "frame-index.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    sheets = folder / "contact-sheets"
    sheets.mkdir(exist_ok=True)
    for first in range(0, expected, SHEET_SIZE):
        paths = [frame_path(frame_dir, i) for i in range(first, min(first + SHEET_SIZE, expected))]
        make_sheet(paths, first, times, sheets / f"sheet_{first // SHEET_SIZE:03d}.jpg")
    svg_chart(rows, folder / "frame-activity.svg")
    viewer(expected, times, folder / "frame-viewer.html")
    result = {
        "file": str(video.relative_to(ROOT)), "sha256": sha256(video),
        "video_frames": expected, "preview_frames": len(list(frame_dir.glob("frame_*.jpg"))),
        "container_reported_frames": int(stream["nb_frames"]) if stream.get("nb_frames") else None,
        "contact_sheets": len(list(sheets.glob("sheet_*.jpg"))),
        "width": stream["width"], "height": stream["height"],
        "nominal_frame_rate": stream.get("r_frame_rate"),
        "first_frame_timestamp_seconds": times[0], "last_frame_timestamp_seconds": times[-1],
        "container_duration_seconds": float(probe["format"]["duration"]),
        "source_size_bytes": int(probe["format"]["size"]),
        "metric_note": "Pixel metrics use 96×54 resized preview frames; frame_delta is mean absolute RGB channel change and is not a semantic cut detector.",
    }
    (folder / "frame-scan.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result


def main() -> None:
    selected = sys.argv[1:] or PRIMARY_DIRS
    manifest = {}
    for name in selected:
        print(f"Processing {name}", flush=True)
        manifest[name] = process(ROOT / name)
        print(f"  {manifest[name]['video_frames']} frames verified", flush=True)
    (ROOT / "frame-study-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
