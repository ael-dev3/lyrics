"""Independent word-timing observations for every supplied word (IDs only).

Observation sets, each kept separately (never averaged here):
  mms_stem / mms_mix   torchaudio MMS_FA (multilingual wav2vec2 family) forced
                       alignment on the HTDemucs vocal stem and on the mix
  w2v_stem / w2v_mix   English wav2vec2 LV60K-960h CTC forced alignment (same
                       wav2vec2 family as MMS; a different model and vocabulary)
  whisper_stem         Whisper large-v3 (faster-whisper) forced alignment of each
                       line inside its window via stable-ts (different family)
  global_mms           one whole-song MMS pass, used only to place line windows
Coverage audit: unforced Whisper large-v3 on the stem, reported as times and
probabilities only, plus vocal-stem energy spans that no supplied word covers.

No lyric text is written. Output: analysis/word-candidates.json.
"""
from __future__ import annotations

import hashlib
import json
import math
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import torch
import torchaudio
import torchaudio.functional as AF

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyrics_io import ROOT, load, shape  # noqa: E402

SR = 16000
SOURCE = ROOT / "public" / "source.mp4"
STEM = ROOT / "analysis" / "stems" / "vocals.wav"
OUT = Path(__import__("os").environ.get("LYD_CANDIDATES", str(ROOT / "analysis" / "word-candidates.json")))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def decode(path: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", str(path), "-map", "0:a:0", "-ac", "1", "-ar", str(SR), "-f", "f32le", "pipe:1"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype="<f4").copy()


def emissions(model, wav: np.ndarray, log_softmax: bool, chunk_s: float = 24.0, pad_s: float = 3.0) -> torch.Tensor:
    """Chunked emissions on a global 320-sample frame grid (20 ms)."""
    hop = 320
    chunk, pad = int(chunk_s * SR) // hop * hop, int(pad_s * SR) // hop * hop
    total_frames = math.ceil(len(wav) / hop)
    padded = np.concatenate([np.zeros(pad, np.float32), wav, np.zeros(chunk + 2 * pad, np.float32)])
    parts = []
    for a in range(0, total_frames * hop, chunk):
        seg = padded[a:a + chunk + 2 * pad]  # starts at global sample a - pad
        with torch.inference_mode():
            x = torch.from_numpy(seg)[None].to(DEVICE)
            em, _ = model(x)
            em = em[0].float()
            if log_softmax:
                em = torch.log_softmax(em, dim=-1)
        keep = em[pad // hop: pad // hop + chunk // hop]
        if keep.shape[0] < chunk // hop:  # final frames of the padded tail
            keep = torch.cat([keep, keep[-1:].repeat(chunk // hop - keep.shape[0], 1)])
        parts.append(keep.cpu())
    return torch.cat(parts)[:total_frames]


def spans_from_path(path: list[int], scores: list[float], targets: list[int], blank: int):
    """Merge a frame-level CTC path into per-target spans (start, end, mean prob)."""
    spans, t_index, i = [], 0, 0
    while i < len(path):
        tok = path[i]
        if tok == blank:
            i += 1
            continue
        j = i
        while j + 1 < len(path) and path[j + 1] == tok:
            j += 1
        spans.append((i, j + 1, float(np.exp(np.mean(scores[i:j + 1])))))
        t_index += 1
        i = j + 1
    return spans


def force(em: torch.Tensor, targets: list[int], blank: int):
    if not targets:
        return []
    T = em.shape[0]
    if len(targets) * 1 > T:
        raise ValueError("window shorter than transcript")
    ali, scores = AF.forced_align(em[None].to(DEVICE), torch.tensor([targets], dtype=torch.int32, device=DEVICE), blank=blank)
    ali, scores = ali[0].cpu().tolist(), scores[0].cpu().tolist()
    # Repeated identical targets are separated by blank or by the path itself;
    # merge_tokens handles both, so use torchaudio's implementation.
    merged = AF.merge_tokens(torch.tensor(ali), torch.tensor(scores).exp())
    return [(s.start, s.end, float(s.score)) for s in merged]


class CTCModel:
    def __init__(self, name: str):
        self.name = name
        if name == "mms":
            bundle = torchaudio.pipelines.MMS_FA
            self.model = bundle.get_model(with_star=False).to(DEVICE).eval()
            self.dictionary = bundle.get_dict(star=None)
            self.blank = 0
            self.log_softmax = False
            self.upper = False
            self.sep = None
        else:
            bundle = torchaudio.pipelines.WAV2VEC2_ASR_LARGE_LV60K_960H
            self.model = bundle.get_model().to(DEVICE).eval()
            labels = bundle.get_labels()
            self.dictionary = {c: i for i, c in enumerate(labels)}
            self.blank = 0
            self.log_softmax = True
            self.upper = True
            self.sep = self.dictionary["|"]

    def encode(self, words: list[str]) -> tuple[list[int], list[tuple[int, int]]]:
        """Returns flat targets and, for each word, the [first, last] target index."""
        targets, ranges = [], []
        for k, w in enumerate(words):
            chars = [c.upper() if self.upper else c for c in w if (c.upper() if self.upper else c) in self.dictionary]
            if self.sep is not None and k > 0:
                targets.append(self.sep)
            a = len(targets)
            targets.extend(self.dictionary[c] for c in chars)
            ranges.append((a, len(targets) - 1))
        return targets, ranges

    def align_words(self, em: torch.Tensor, words: list[str], frame0: int):
        targets, ranges = self.encode(words)
        spans = force(em, targets, self.blank)
        if len(spans) != len(targets):
            raise ValueError(f"{self.name}: {len(spans)} spans for {len(targets)} targets")
        out = []
        for a, b in ranges:
            if b < a:
                out.append(None)
                continue
            s, e = spans[a][0], spans[b][1]
            score = float(np.mean([spans[k][2] for k in range(a, b + 1)]))
            out.append([round((frame0 + s) * 0.02, 3), round((frame0 + e) * 0.02, 3), round(score, 4)])
        return out


def main() -> None:
    started = time.time()
    text_sha, _normalized, lines = load()
    text_shape = shape(lines)
    stem, mix = decode(STEM), decode(SOURCE)
    n = min(len(stem), len(mix))
    stem, mix = stem[:n], mix[:n]
    result: dict = {
        "schema": "lyric-film/word-candidates/v1",
        "textSha256": text_sha,
        "sourceSha256": sha(SOURCE),
        "vocalStemSha256": sha(STEM),
        "shape": {k: text_shape[k] for k in ("lines", "tokens", "tokensPerLine")},
        "frameSeconds": 0.02,
        "models": {},
        "lines": {},
        "words": {t.id: {"voice": t.voice} for l in lines for t in l.tokens},
        "failures": [],
    }

    # --- CTC families ------------------------------------------------------
    ems = {}
    for name in ("mms", "w2v"):
        model = CTCModel(name)
        result["models"][name] = {
            "mms": "torchaudio.pipelines.MMS_FA (with_star=False), 16 kHz, chunked 24 s + 3 s context",
            "w2v": "torchaudio.pipelines.WAV2VEC2_ASR_LARGE_LV60K_960H (English CTC), 16 kHz, chunked 24 s + 3 s context",
        }[name]
        for signal, wav in (("stem", stem), ("mix", mix)):
            ems[(name, signal)] = emissions(model.model, wav, model.log_softmax)
        if name == "mms":
            mms = model
        else:
            w2v = model
        # keep models for windowed passes
    # Global MMS pass on the stem: every token in text order (lead and backing).
    all_words = [t for l in lines for t in l.tokens]
    em = ems[("mms", "stem")]
    glob = mms.align_words(em, [t.norm for t in all_words], 0)
    for t, g in zip(all_words, glob):
        result["words"][t.id]["global_mms"] = g
    # Line windows from the global pass, bounded by neighbouring lines.
    windows = []
    for k, l in enumerate(lines):
        starts = [result["words"][t.id]["global_mms"][0] for t in l.tokens if result["words"][t.id]["global_mms"]]
        ends = [result["words"][t.id]["global_mms"][1] for t in l.tokens if result["words"][t.id]["global_mms"]]
        windows.append([min(starts), max(ends)])
    for k, l in enumerate(lines):
        a, b = windows[k]
        prev_end = windows[k - 1][1] if k else 0.0
        next_start = windows[k + 1][0] if k + 1 < len(lines) else n / SR
        wa = max(0.0, a - 0.9, prev_end - 0.25)
        wb = min(n / SR, b + 0.8, next_start + 0.25)
        result["lines"][l.id] = {"globalSpan": [round(a, 3), round(b, 3)], "window": [round(wa, 3), round(wb, 3)]}

    # Windowed forced alignment. Lead and backing tokens are aligned as separate
    # sequences in the same window because they can overlap in time.
    for l in lines:
        wa, wb = result["lines"][l.id]["window"]
        fa, fb = int(wa / 0.02), int(math.ceil(wb / 0.02))
        for voice in ("lead", "backing"):
            toks = [t for t in l.tokens if t.voice == voice]
            if not toks:
                continue
            for name, model in (("mms", mms), ("w2v", w2v)):
                for signal in ("stem", "mix"):
                    key = f"{name}_{signal}"
                    try:
                        spans = model.align_words(ems[(name, signal)][fa:fb], [t.norm for t in toks], fa)
                    except Exception as error:  # noqa: BLE001 - recorded, not fatal
                        result["failures"].append({"line": l.id, "voice": voice, "observation": key, "error": str(error)[:200]})
                        continue
                    for t, s in zip(toks, spans):
                        result["words"][t.id][key] = s

    # --- Whisper family ------------------------------------------------------
    try:
        import stable_whisper
        wmodel = stable_whisper.load_faster_whisper("large-v3", device=DEVICE, compute_type="float16")
        result["models"]["whisper"] = "faster-whisper large-v3 (float16) via stable-ts 2.19.1 align(), per line window on the vocal stem"
        for l in lines:
            wa, wb = result["lines"][l.id]["window"]
            seg = stem[int(wa * SR):int(wb * SR)]
            for voice in ("lead", "backing"):
                toks = [t for t in l.tokens if t.voice == voice]
                if not toks:
                    continue
                try:
                    res = wmodel.align(seg, " ".join(t.norm for t in toks), language="en", verbose=None, suppress_silence=False, regroup=False)
                    words = [w for s in res.segments for w in s.words]
                    if len(words) != len(toks):
                        raise ValueError(f"{len(words)} words for {len(toks)} tokens")
                    for t, w in zip(toks, words):
                        result["words"][t.id]["whisper_stem"] = [round(wa + w.start, 3), round(wa + w.end, 3), round(float(w.probability or 0), 4)]
                except Exception as error:  # noqa: BLE001
                    result["failures"].append({"line": l.id, "voice": voice, "observation": "whisper_stem", "error": str(error)[:200]})
        # Coverage audit: unforced transcription, times and probabilities only.
        segments, _info = wmodel.transcribe_original(stem, language="en", word_timestamps=True, vad_filter=False,
                                                     condition_on_previous_text=False, beam_size=5)
        heard = []
        for s in segments:
            for w in (s.words or []):
                heard.append([round(w.start, 3), round(w.end, 3), round(float(w.probability), 4), len(w.word.strip())])
        result["unforcedWhisperWords"] = {"fields": ["start", "end", "probability", "chars"], "rows": heard}
    except Exception as error:  # noqa: BLE001
        result["failures"].append({"observation": "whisper", "error": str(error)[:300]})

    # --- Vocal-stem energy coverage -----------------------------------------
    hop = int(0.01 * SR)
    frames = len(stem) // hop
    rms = np.sqrt(np.mean(stem[:frames * hop].reshape(frames, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    active = db > -38.0
    covered = np.zeros(frames, bool)
    for w in result["words"].values():
        for key in ("mms_stem", "w2v_stem", "whisper_stem", "global_mms"):
            if w.get(key):
                a, b = int(w[key][0] / 0.01), int(w[key][1] / 0.01)
                covered[max(0, a - 30):b + 30] = True
    spans, k = [], 0
    while k < frames:
        if active[k] and not covered[k]:
            j = k
            while j < frames and active[j] and not covered[j]:
                j += 1
            if j - k >= 15:
                spans.append([round(k * 0.01, 2), round(j * 0.01, 2), round(float(db[k:j].max()), 1)])
            k = j
        else:
            k += 1
    result["uncoveredVocalEnergy"] = {"thresholdDbFS": -38.0, "minimumSeconds": 0.15, "marginSeconds": 0.30, "spans": spans}
    result["elapsedSeconds"] = round(time.time() - started, 1)
    OUT.write_text(json.dumps(result, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"words": len(result["words"]), "failures": len(result["failures"]), "uncovered": len(spans), "seconds": result["elapsedSeconds"]}))


if __name__ == "__main__":
    main()
