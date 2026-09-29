"""Choose one onset/release per word from the retained observations (IDs only).

Rules (documented in TIMING.md; every decision is logged per word):
  start  1. mms_stem, when another observation (mms_mix, w2v_stem, w2v_mix or
            whisper_stem) lies within 70 ms of it                  -> corroborated
         2. otherwise w2v_stem when w2v_mix or whisper_stem is within 70 ms
         3. otherwise the median of all available starts           -> priority review
         The earliest candidate is never chosen automatically.
  onset  If the chosen start sits in vocal-stem silence (< -40 dBFS for the
         following 80 ms) while energy rises within +250 ms, the start moves to
         that rise (logged as 'energy-onset').
  end    The same observation family as the start; within a lane the end is
         clipped to the next word's start and joined to it when the gap is under
         60 ms (connected singing). A lane-final word is extended while the stem
         stays within 20 dB of the word's peak (max +1.6 s, never past the next
         line's first onset - 0.08 s) to hold sustained vowels.
  review 'priority' when start candidates spread > 150 ms, when no rule 1/2
         corroboration exists, or when a word is shorter than 70 ms.
Times land on the 44.1 kHz sample grid. Output: analysis/timing-selection.json
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyrics_io import ROOT, load  # noqa: E402

RATE = 44100
CAND = Path(__import__("os").environ.get("LYD_CANDIDATES", str(ROOT / "analysis" / "word-candidates.json")))
OUT = Path(__import__("os").environ.get("LYD_SELECTION", str(ROOT / "analysis" / "timing-selection.json")))
STEM = ROOT / "analysis" / "stems" / "vocals.wav"
KEYS = ["mms_stem", "mms_mix", "w2v_stem", "w2v_mix", "whisper_stem"]


def stem_db() -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", str(STEM), "-ac", "1", "-ar", "16000", "-f", "f32le", "pipe:1"], check=True, capture_output=True).stdout
    x = np.frombuffer(raw, "<f4")
    hop = 160  # 10 ms
    n = len(x) // hop
    return 20 * np.log10(np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-9)


def main() -> None:
    text_sha, _n, lines = load()
    cand = json.loads(CAND.read_text(encoding="utf-8"))
    if cand["textSha256"] != text_sha:
        raise SystemExit("word-candidates.json was made for a different lyric text; rerun align_candidates.py")
    db = stem_db()
    at = lambda s: db[min(len(db) - 1, max(0, int(s / 0.01)))]  # noqa: E731
    words = cand["words"]
    chosen: dict[str, dict] = {}
    for line in lines:
        for voice in ("lead", "backing"):
            toks = [t for t in line.tokens if t.voice == voice]
            for t in toks:
                obs = {k: words[t.id][k] for k in KEYS if words[t.id].get(k)}
                starts = {k: v[0] for k, v in obs.items()}
                rec = {"id": t.id, "voice": voice, "observations": obs}
                if not obs:
                    g = words[t.id].get("global_mms")
                    rec.update(start=g[0], end=g[1], basis="global-mms-only", review="priority")
                    chosen[t.id] = rec
                    continue
                spread = (max(starts.values()) - min(starts.values())) * 1000 if len(starts) > 1 else 0.0
                basis, source = None, None
                if "mms_stem" in starts and any(abs(starts[k] - starts["mms_stem"]) <= 0.07 for k in starts if k != "mms_stem"):
                    basis, source = "mms-stem-corroborated", "mms_stem"
                elif "w2v_stem" in starts and any(abs(starts[k] - starts["w2v_stem"]) <= 0.07 for k in ("w2v_mix", "whisper_stem") if k in starts):
                    basis, source = "w2v-stem-corroborated", "w2v_stem"
                if source:
                    start, end = obs[source][0], obs[source][1]
                    review = "priority" if spread > 150 else "normal"
                else:
                    start = float(np.median(list(starts.values())))
                    ends = [v[1] for v in obs.values()]
                    end = float(np.median(ends))
                    basis, review = "median-uncorroborated", "priority"
                # Energy onset: a start in stem silence moves to the nearby rise.
                if at(start) < -40 and at(start + 0.04) < -40 and at(start + 0.08) < -40:
                    k0 = int(start / 0.01)
                    rise = next((k for k in range(k0, min(len(db), k0 + 25)) if db[k] >= -36), None)
                    if rise is not None:
                        start = rise * 0.01
                        basis += "+energy-onset"
                rec.update(start=start, end=max(end, start + 0.03), basis=basis, review=review, spreadMs=round(spread, 1))
                chosen[t.id] = rec
            # Lane consistency: order, clipping and connected joins.
            for a, b in zip(toks, toks[1:]):
                A, B = chosen[a.id], chosen[b.id]
                if B["start"] < A["start"] + 0.03:
                    B["start"] = A["start"] + 0.03
                    B["review"] = "priority"
                    B["basis"] += "+order-fix"
                if A["end"] > B["start"] or B["start"] - A["end"] < 0.06:
                    A["end"] = B["start"]
    # Held releases for lane-final words, bounded by the next line.
    first_onsets = []
    for line in lines:
        first_onsets.append(min(chosen[t.id]["start"] for t in line.tokens))
    for li, line in enumerate(lines):
        nxt = first_onsets[li + 1] - 0.08 if li + 1 < len(lines) else chosen[line.tokens[-1].id]["end"] + 1.6
        for voice in ("lead", "backing"):
            toks = [t for t in line.tokens if t.voice == voice]
            if not toks:
                continue
            last = chosen[toks[-1].id]
            a, b = int(last["start"] / 0.01), int(last["end"] / 0.01)
            peak = float(db[a:max(a + 1, b)].max())
            k = b
            limit = min(len(db) - 1, int(min(nxt, last["end"] + 1.6) / 0.01))
            while k < limit and db[k] >= max(peak - 20, -42):
                k += 1
            if k > b + 2:
                last["releaseExtendedMs"] = (k - b) * 10
                last["end"] = k * 0.01
    for rec in chosen.values():
        s, e = round(rec["start"] * RATE), round(rec["end"] * RATE)
        rec["startSample"], rec["endSample"] = s, max(s + 1, e)
        rec["start"], rec["end"] = rec["startSample"] / RATE, rec["endSample"] / RATE
        if rec["end"] - rec["start"] < 0.07:
            rec["review"] = "priority"
            rec["short"] = True
        rec.setdefault("spreadMs", 0.0)
    out = {
        "schema": "lyric-film/timing-selection/v1", "textSha256": text_sha, "candidatesSha256": __import__("hashlib").sha256(CAND.read_bytes()).hexdigest(),
        "rules": __doc__.strip().splitlines()[2:23],
        "summary": {
            "words": len(chosen),
            "priority": sum(1 for r in chosen.values() if r["review"] == "priority"),
            "bases": {b: sum(1 for r in chosen.values() if r["basis"] == b) for b in sorted({r["basis"] for r in chosen.values()})},
        },
        "words": chosen,
    }
    OUT.write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(out["summary"]))


if __name__ == "__main__":
    main()
