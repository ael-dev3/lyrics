"""Per-frame picture measurements for the shot map (all 6,794 source frames).

Decodes the locked source at 192x108 and records luma, saturation, hue balance,
histogram change (cut evidence) and a contrast-weighted subject centre used to
suggest portrait crops. The shot map itself is authored and reviewed in
src/shots.ts; these numbers are evidence for it, not an automatic edit.
"""
import csv
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "source.mp4"
W, H = 192, 108
FPS_NUM, FPS_DEN = 24000, 1001


def hsv(rgb: np.ndarray):
    r, g, b = [rgb[..., i].astype(np.float32) / 255 for i in range(3)]
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = np.where(mx > 1e-6, (mx - mn) / (mx + 1e-6), 0)
    return h, s, mx


def main() -> None:
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-nostdin", "-i", str(SOURCE), "-map", "0:v:0", "-vf", f"scale={W}:{H}:flags=area",
                             "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"], stdout=subprocess.PIPE)
    rows, prev_hist, prev_small = [], None, None
    xs = (np.arange(W) + 0.5) / W
    n = 0
    while True:
        buf = proc.stdout.read(W * H * 3)
        if not buf:
            break
        if len(buf) != W * H * 3:
            raise SystemExit("truncated frame")
        rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        y = (0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]) / 255
        h, s, v = hsv(rgb)
        vivid = (s > 0.45) & (v > 0.35)
        pink = vivid & ((h > 0.80) | (h < 0.03))
        cyan = vivid & (h > 0.42) & (h < 0.58)
        yellow = vivid & (h > 0.11) & (h < 0.19)
        hist = np.histogramdd(np.stack([h[vivid | (v > 0.2)].ravel(), s[vivid | (v > 0.2)].ravel(), v[vivid | (v > 0.2)].ravel()], 1), bins=(12, 3, 4), range=((0, 1), (0, 1), (0, 1)))[0].ravel()
        hist = hist / max(1, hist.sum())
        small = y[::4, ::4]
        diff = 0.0 if prev_hist is None else float(np.abs(hist - prev_hist).sum() / 2)
        ldiff = 0.0 if prev_small is None else float(np.abs(small - prev_small).mean())
        gy, gx = np.gradient(y)
        edge = np.hypot(gx, gy)
        col = edge.sum(0) + 1e-9
        centre = float((col * xs).sum() / col.sum())
        spread = float(np.sqrt(((xs - centre) ** 2 * col).sum() / col.sum()))
        rows.append({
            "frame": n, "time": round(n * FPS_DEN / FPS_NUM, 6),
            "luma": round(float(y.mean()), 4), "lumaP05": round(float(np.quantile(y, .05)), 4), "lumaP95": round(float(np.quantile(y, .95)), 4),
            "black": round(float((y < 0.06).mean()), 4), "white": round(float((y > 0.88).mean()), 4),
            "sat": round(float(s.mean()), 4), "pink": round(float(pink.mean()), 4), "cyan": round(float(cyan.mean()), 4), "yellow": round(float(yellow.mean()), 4),
            "histDiff": round(diff, 4), "lumaDiff": round(ldiff, 4), "edgeCentreX": round(centre, 4), "edgeSpreadX": round(spread, 4),
        })
        prev_hist, prev_small, n = hist, small, n + 1
    if proc.wait() != 0:
        raise SystemExit("decoder failed")
    out = ROOT / "analysis" / "work"
    out.mkdir(parents=True, exist_ok=True)
    with open(out / "frame-metrics.csv", "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps({"frames": n}))


if __name__ == "__main__":
    main()
