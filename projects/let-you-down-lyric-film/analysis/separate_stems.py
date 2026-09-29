"""Estimate a vocal stem for timing analysis and vocal-energy display.

The stem is an analysis input only. HTDemucs output leaks accompaniment, and a
second run on different hardware can differ slightly, so the stem is never a
delivery asset. Its SHA-256 is recorded with every result that used it.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from demucs.apply import apply_model
from demucs.pretrained import get_model

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "source.mp4"
OUT = ROOT / "analysis" / "stems"
RATE = 44100


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-nostdin", "-i", str(SOURCE), "-map", "0:a:0", "-ac", "2", "-ar", str(RATE), "-f", "f32le", "pipe:1"],
        check=True, capture_output=True,
    ).stdout
    mix = np.frombuffer(raw, dtype="<f4").reshape(-1, 2).T.copy()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch.manual_seed(0)
    model = get_model("htdemucs")
    model.eval()
    wav = torch.from_numpy(mix)
    ref = wav.mean(0)
    mean, std = ref.mean(), ref.std()
    with torch.no_grad():
        sources = apply_model(model, ((wav - mean) / std)[None], device=device, shifts=0, split=True, overlap=0.25, progress=False)[0]
    sources = sources * std + mean
    names = model.sources
    vocals = sources[names.index("vocals")].cpu().numpy()
    accompaniment = (sources.sum(0) - sources[names.index("vocals")]).cpu().numpy()
    sf.write(OUT / "vocals.wav", vocals.T, RATE, subtype="FLOAT")
    sf.write(OUT / "accompaniment.wav", accompaniment.T, RATE, subtype="FLOAT")
    record = {
        "schema": "lyric-film/stem-estimate/v1",
        "model": "htdemucs (demucs 4.1.0)",
        "settings": {"shifts": 0, "overlap": 0.25, "split": True, "device": device, "torch": torch.__version__},
        "sourceSha256": sha(SOURCE),
        "samplesPerChannel": int(mix.shape[1]),
        "vocalsSha256": sha(OUT / "vocals.wav"),
        "accompanimentSha256": sha(OUT / "accompaniment.wav"),
        "limitations": [
            "Estimated separation. Accompaniment and reverb leak into the vocal stem; breaths and backing vocals are not isolated.",
            "Used for timing evidence and vocal-energy display only. Never delivered.",
        ],
    }
    (ROOT / "analysis" / "stem-estimate.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(record["settings"]), record["vocalsSha256"])


if __name__ == "__main__":
    sys.exit(main())
