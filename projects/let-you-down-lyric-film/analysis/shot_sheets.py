"""Candidate segmentation and labelled review sheets for authoring src/shots.ts.

Cut candidates: colour-histogram change > 0.30 or mean luma change > 0.07
between consecutive frames, with detections within 3 frames merged (flashes and
fast dissolves). Each candidate segment gets first/middle/last thumbnails and
the contrast-weighted subject centre (magenta tick) for portrait-crop review.
Sheets are local review aids (analysis/study/, not committed).
"""
import csv
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "source.mp4"
TW, TH = 320, 180
SPF = 1001 / 24000


def segments(rows):
    hd = np.array([float(r["histDiff"]) for r in rows])
    ld = np.array([float(r["lumaDiff"]) for r in rows])
    hits = [i for i in range(1, len(rows)) if hd[i] > 0.30 or ld[i] > 0.07]
    groups = []
    for i in hits:
        if groups and i - groups[-1][-1] <= 3:
            groups[-1].append(i)
        else:
            groups.append([i])
    starts = [0] + [g[0] for g in groups]
    ends = starts[1:] + [len(rows)]
    return [(a, b) for a, b in zip(starts, ends)]


def main() -> None:
    rows = list(csv.DictReader(open(ROOT / "analysis" / "work" / "frame-metrics.csv", encoding="utf-8")))
    segs = segments(rows)
    wanted = {}
    for k, (a, b) in enumerate(segs):
        for tag, f in (("a", a), ("m", (a + b - 1) // 2), ("z", b - 1)):
            wanted.setdefault(f, []).append((k, tag))
    frames = {}
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-nostdin", "-i", str(SOURCE), "-map", "0:v:0", "-vf", f"scale={TW}:{TH}:flags=area",
                             "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"], stdout=subprocess.PIPE)
    n = 0
    while True:
        buf = proc.stdout.read(TW * TH * 3)
        if not buf:
            break
        if n in wanted:
            frames[n] = Image.frombytes("RGB", (TW, TH), buf)
        n += 1
    proc.wait()
    font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15)
    out = ROOT / "analysis" / "study"
    out.mkdir(parents=True, exist_ok=True)
    per_sheet, cols = 24, 3
    summary = []
    for s in range(0, len(segs), per_sheet):
        chunk = segs[s:s + per_sheet]
        sheet = Image.new("RGB", (cols * (TW * 3 + 12), ((len(chunk) + cols - 1) // cols) * (TH + 26)), (18, 18, 24))
        d = ImageDraw.Draw(sheet)
        for j, (a, b) in enumerate(chunk):
            k = s + j
            x0, y0 = (j % cols) * (TW * 3 + 12), (j // cols) * (TH + 26)
            for t, f in enumerate((a, (a + b - 1) // 2, b - 1)):
                im = frames[f].copy()
                cx = float(rows[f]["edgeCentreX"])
                dd = ImageDraw.Draw(im)
                dd.line([(cx * TW, TH - 14), (cx * TW, TH)], fill=(255, 0, 200), width=3)
                sheet.paste(im, (x0 + t * TW, y0 + 24))
            label = f"S{k:03d}  {a * SPF:7.2f}-{b * SPF:7.2f}s  ({b - a}f)  L{float(rows[(a + b - 1) // 2]['luma']):.2f}"
            d.text((x0 + 4, y0 + 4), label, font=font, fill=(255, 235, 90))
            mid = rows[(a + b - 1) // 2]
            summary.append({"segment": k, "startFrame": a, "endFrame": b, "start": round(a * SPF, 6), "end": round(b * SPF, 6),
                            "midLuma": float(mid["luma"]), "midWhite": float(mid["white"]), "midBlack": float(mid["black"]),
                            "pink": float(mid["pink"]), "cyan": float(mid["cyan"]), "yellow": float(mid["yellow"]),
                            "subjectX": float(mid["edgeCentreX"])})
        sheet.save(out / f"segments-{s // per_sheet:02d}.jpg", quality=86)
    (ROOT / "analysis" / "work" / "segments.json").write_text(json.dumps(summary, indent=1), encoding="utf-8", newline="\n")
    print(len(segs), "segments")


if __name__ == "__main__":
    main()
