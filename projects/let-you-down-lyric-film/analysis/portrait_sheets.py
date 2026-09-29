"""Review sheets for portrait crops: each candidate segment's middle frame cut to
9:16 at a proposed centre. Usage: portrait_sheets.py [centres.json]
Without an argument the proposal is the segment's mean contrast centroid.
"""
import csv
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "source.mp4"
W, H = 960, 540
CW = H * 9 / 16  # crop width at this scale
TH = 360
TW = int(TH * 9 / 16)


def main() -> None:
    segs = json.loads((ROOT / "analysis" / "work" / "segments.json").read_text(encoding="utf-8"))
    rows = list(csv.DictReader(open(ROOT / "analysis" / "work" / "frame-metrics.csv", encoding="utf-8")))
    override = json.loads(Path(sys.argv[1]).read_text()) if len(sys.argv) > 1 else {}
    centres = {}
    for s in segs:
        a, b = s["startFrame"], s["endFrame"]
        xs = [float(r["edgeCentreX"]) for r in rows[a:b]]
        c = sum(xs) / len(xs)
        centres[s["segment"]] = override.get(str(s["segment"]), c)
    want = {(s["startFrame"] + s["endFrame"] - 1) // 2: s["segment"] for s in segs}
    frames = {}
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-nostdin", "-i", str(SOURCE), "-map", "0:v:0", "-vf", f"scale={W}:{H}:flags=area",
                             "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"], stdout=subprocess.PIPE)
    n = 0
    while True:
        buf = proc.stdout.read(W * H * 3)
        if not buf:
            break
        if n in want:
            frames[want[n]] = Image.frombytes("RGB", (W, H), buf)
        n += 1
    proc.wait()
    font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 14)
    out = ROOT / "analysis" / "study"
    per, cols = 30, 15
    for p in range(0, len(segs), per):
        chunk = segs[p:p + per]
        sheet = Image.new("RGB", (cols * (TW + 6), ((len(chunk) + cols - 1) // cols) * (TH + 22)), (18, 18, 24))
        d = ImageDraw.Draw(sheet)
        for j, s in enumerate(chunk):
            k = s["segment"]
            c = min(1 - CW / W / 2, max(CW / W / 2, centres[k]))
            x0 = int(c * W - CW / 2)
            im = frames[k].crop((x0, 0, int(x0 + CW), H)).resize((TW, TH))
            x, y = (j % cols) * (TW + 6), (j // cols) * (TH + 22)
            sheet.paste(im, (x, y + 20))
            d.text((x + 2, y + 2), f"S{k:03d} {s['start']:.1f} c{c:.2f}", font=font, fill=(255, 235, 90))
        sheet.save(out / f"portrait-{p // per:02d}.jpg", quality=85)
    (ROOT / "analysis" / "work" / "portrait-centres.json").write_text(json.dumps({str(k): round(v, 3) for k, v in centres.items()}, indent=0), encoding="utf-8", newline="\n")
    print("ok")


if __name__ == "__main__":
    main()
