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

    # --- Vocal activity bound (stem energy) ------------------------------------
    hop = int(0.01 * SR)
    frames = len(stem) // hop
    db = 20 * np.log10(np.sqrt(np.mean(stem[:frames * hop].reshape(frames, hop) ** 2, axis=1) + 1e-12))
    loud = np.nonzero(db > -34.0)[0]
    vocal_end = float(loud[-1] + 1) * 0.01 if len(loud) else n / SR
    result["vocalActivity"] = {"thresholdDbFS": -34.0, "lastActiveSeconds": round(vocal_end, 2)}

    # --- Line anchors: unforced Whisper matched to the text IN MEMORY ------------
    # A whole-song forced pass can collapse when a performance runs long (it did
    # here after 3:02). Recognized words matched to the supplied sequence give
    # an independent map of where each line is sung; only IDs and times are kept.
    import difflib
    import stable_whisper
    from lyrics_io import normalize_word
    wmodel = stable_whisper.load_faster_whisper("large-v3", device=DEVICE, compute_type="float16")
    segments, _info = wmodel.transcribe_original(stem, language="en", word_timestamps=True, vad_filter=False,
                                                 condition_on_previous_text=False, beam_size=5)
    heard = [(normalize_word(w.word), float(w.start), float(w.end), float(w.probability)) for s in segments for w in (s.words or []) if normalize_word(w.word)]
    result["unforcedWhisperWords"] = {"fields": ["start", "end", "probability", "chars"], "rows": [[round(h[1], 3), round(h[2], 3), round(h[3], 4), len(h[0])] for h in heard]}
    toks_all = [t for l in lines for t in l.tokens]
    sm = difflib.SequenceMatcher(a=[t.norm for t in toks_all], b=[h[0] for h in heard], autojunk=False)
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            h = heard[b + k]
            result["words"][toks_all[a + k].id]["whisper_unforced"] = [round(h[1], 3), round(h[2], 3), round(h[3], 4)]
    anchors = []
    for l in lines:
        hit = [result["words"][t.id]["whisper_unforced"] for t in l.tokens if result["words"][t.id].get("whisper_unforced")]
        # Guard against a stray late match (e.g. a sound effect heard as a word):
        # a sung line spans at most 1.2 s per word plus 4 s of held notes.
        cap = lambda a0: a0 + 1.2 * len(l.tokens) + 4.0  # noqa: E731
        anchors.append([min(x[0] for x in hit), min(max(x[1] for x in hit), vocal_end + 0.5, cap(min(x[0] for x in hit)))] if len(hit) >= 2 else None)
    for k in range(len(anchors)):  # sparse lines: bounded by their anchored neighbours
        if anchors[k] is None:
            prev = next((anchors[j] for j in range(k - 1, -1, -1) if anchors[j]), [0.0, 0.0])
            nxt = next((anchors[j] for j in range(k + 1, len(anchors)) if anchors[j]), [vocal_end, vocal_end])
            anchors[k] = [prev[1], nxt[0]]
    for k in range(len(anchors) - 1):  # a line cannot run into the next line's start
        anchors[k][1] = max(anchors[k][0] + 0.2, min(anchors[k][1], anchors[k + 1][0] + 0.3))
    for k, l in enumerate(lines):
        a, b = anchors[k]
        prev_end = anchors[k - 1][1] if k else 0.0
        next_start = anchors[k + 1][0] if k + 1 < len(lines) else b + 0.8
        wa = max(0.0, a - 0.8, prev_end - 0.4)
        wb = min(n / SR, b + 0.9, next_start + 0.4)
        count = sum(1 for t in l.tokens if result["words"][t.id].get("whisper_unforced"))
        result["lines"][l.id] = {"anchorSpan": [round(a, 3), round(b, 3)], "anchorWords": count, "window": [round(wa, 3), round(wb, 3)]}

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
    # Whole-song MMS pass. Sequence context places line entrances well (a first
    # word is not pulled back into the previous line's tail), but a long pass
    # can collapse where the performance runs long. Lines whose whole-song span
    # disagrees with the independent Whisper anchors are re-aligned as a run,
    # bounded by their reliable neighbours and by the end of vocal activity.
    all_words = [t for l in lines for t in l.tokens]
    glob = mms.align_words(ems[("mms", "stem")], [t.norm for t in all_words], 0)
    for t, g in zip(all_words, glob):
        result["words"][t.id]["global_mms"] = g
    def span_of(line, key):
        v = [result["words"][t.id][key] for t in line.tokens if result["words"][t.id].get(key)]
        return [min(x[0] for x in v), max(x[1] for x in v)] if v else None
    line_span = [span_of(l, "global_mms") for l in lines]
    reliable = []
    for k, l in enumerate(lines):
        g, a = line_span[k], anchors[k]
        ok = bool(g and a and abs(g[0] - a[0]) <= 2.5 and g[1] - g[0] <= 1.2 * len(l.tokens) + 4.0 and (k == 0 or g[0] >= line_span[k - 1][0]))
        reliable.append(ok)
    # End of the sung region: last active stem frame before the first silent
    # gap of at least 10 s that follows the last line's anchor.
    k0 = int(anchors[-1][0] / 0.01)
    act = np.nonzero(db[k0:] > -34.0)[0] + k0
    tail_end = n / SR
    for p, q in zip(act, act[1:]):
        if q - p >= 1000:
            tail_end = (p + 1) * 0.01
            break
    result["vocalActivity"]["sungRegionEnd"] = round(tail_end, 2)
    # Inside an unreliable stretch, lines that Whisper recognized well (at
    # least half of their words and at least 2) are pinned to their anchor
    # (start − 0.35 s to the next anchor's start + 0.25 s); only the weakly
    # recognized lines between pins are re-aligned as a run.
    strong = [sum(1 for t in l.tokens if result["words"][t.id].get("whisper_unforced")) >= max(2, 0.5 * len(l.tokens)) for l in lines]
    for k, l in enumerate(lines):
        if not reliable[k] and strong[k]:
            nxt = anchors[k + 1][0] if k + 1 < len(lines) else tail_end
            line_span[k] = [anchors[k][0], max(anchors[k][1], nxt)]
            reliable[k] = True
            result["lines"][l.id]["pinnedToAnchor"] = True
    k = 0
    while k < len(lines):
        if reliable[k]:
            k += 1
            continue
        j = k
        while j + 1 < len(lines) and not reliable[j + 1]:
            j += 1
        lo = line_span[k - 1][1] - 0.05 if k > 0 else max(0.0, anchors[k][0] - 1.0)
        hi = line_span[j + 1][0] + 0.05 if j + 1 < len(lines) else tail_end
        run = [t for l in lines[k:j + 1] for t in l.tokens]
        fa, fb = int(lo / 0.02), int(math.ceil(hi / 0.02))
        try:
            seg = mms.align_words(ems[("mms", "stem")][fa:fb], [t.norm for t in run], fa)
            for t, s in zip(run, seg):
                result["words"][t.id]["segment_mms"] = s
            for m in range(k, j + 1):
                line_span[m] = span_of(lines[m], "segment_mms")
            result.setdefault("realignedRuns", []).append({"lines": [lines[k].id, lines[j].id], "range": [round(lo, 3), round(hi, 3)]})
        except Exception as error:  # noqa: BLE001
            result["failures"].append({"observation": "segment_mms", "lines": [lines[k].id, lines[j].id], "error": str(error)[:200]})
            for m in range(k, j + 1):
                line_span[m] = anchors[m]
        k = j + 1
    # Final windows: the line's sequence-aligned span with small margins, never
    # reaching past a neighbour's span by more than 50 ms.
    for k, l in enumerate(lines):
        a, b = line_span[k]
        pinned = result["lines"][l.id].get("pinnedToAnchor", False)
        prev_end = line_span[k - 1][1] if k else 0.0
        next_start = line_span[k + 1][0] if k + 1 < len(lines) else tail_end + 0.3
        if pinned:  # anchor starts run early; the window reaches the next line's anchor
            wa, wb = max(0.0, a - 0.35), min(n / SR, b + 0.25)
        else:
            wa = max(0.0, a - 0.45, prev_end - 0.05)
            wb = min(n / SR, b + 0.55, next_start + 0.05)
        source = "whisper-anchor" if pinned else ("whole-song" if k < len(lines) and not any(r["lines"][0] <= l.id <= r["lines"][1] for r in result.get("realignedRuns", [])) else "realigned-run")
        result["lines"][l.id].update({"sequenceSpan": [round(a, 3), round(b, 3)], "sequenceSource": source, "window": [round(wa, 3), round(wb, 3)]})

    # Windowed forced alignment of each line's words in text order. Backing
    # echoes follow their lead phrase in the supplied text; aligning the lanes
    # separately let an echo land on the previous line's rhyme, so one ordered
    # sequence is used (true overlaps are then left to the listening review).
    for l in lines:
        wa, wb = result["lines"][l.id]["window"]
        fa, fb = int(wa / 0.02), int(math.ceil(wb / 0.02))
        for voice in ("all",):
            toks = list(l.tokens)
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
        result["models"]["whisper"] = "faster-whisper large-v3 (float16) via stable-ts 2.19.1: align() per line window on the vocal stem, plus one unforced pass matched to the text in memory (whisper_unforced)"
        for l in lines:
            wa, wb = result["lines"][l.id]["window"]
            seg = stem[int(wa * SR):int(wb * SR)]
            for voice in ("all",):
                toks = list(l.tokens)
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
    except Exception as error:  # noqa: BLE001
        result["failures"].append({"observation": "whisper", "error": str(error)[:300]})

    # --- Vocal-stem energy coverage -----------------------------------------
    active = db > -38.0
    covered = np.zeros(frames, bool)
    for w in result["words"].values():
        for key in ("mms_stem", "w2v_stem", "whisper_stem", "whisper_unforced"):
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
