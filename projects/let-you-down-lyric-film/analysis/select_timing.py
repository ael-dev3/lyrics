"""Choose one onset/release per word from the retained observations (IDs only).

Rules (documented in TIMING.md; every decision is logged per word):
  start  1. Among the CTC starts (mms_stem, w2v_stem, mms_mix, w2v_mix), take
            the one supported by the most OTHER models: the other CTC model
            within 70 ms, and/or Whisper (forced or unforced) within 120 ms.
            Ties prefer stem over mix and MMS over wav2vec2. The basis records
            the supporting models, e.g. 'mms-stem~w2v+whisper'.
         2. With no cross-model support: the median of the CTC starts.
         The earliest candidate is never chosen automatically.
  onset  If the chosen start sits in vocal-stem silence (< -40 dBFS for the
         following 80 ms) while energy rises within +250 ms, the start moves to
         that rise (logged as 'energy-onset').
  end    The same observation family as the start; within a lane the end is
         clipped to the next word's start and joined to it when the gap is under
         60 ms (connected singing). A lane-final word is extended while the stem
         stays within 20 dB of the word's peak (max +1.6 s, never past the next
         line's first onset - 0.08 s) to hold sustained vowels.
  review 'priority' when the CTC starts spread > 120 ms, when no cross-model
         support exists, or when a word is shorter than 70 ms. (Whisper's word
         starts run early at entrances after gaps here, so its distance alone
         does not flag a word.)
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
CTC = ["mms_stem", "w2v_stem", "mms_mix", "w2v_mix"]  # preference order on ties
MODEL = {"mms_stem": "mms", "mms_mix": "mms", "w2v_stem": "w2v", "w2v_mix": "w2v"}


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
                # Agreement is only counted across DIFFERENT models: a stem and a
                # mix pass of one model are one model seeing two signals.
                ctc = {k: starts[k] for k in CTC if k in starts}
                spread = (max(ctc.values()) - min(ctc.values())) * 1000 if len(ctc) > 1 else 0.0
                whisper_obs = [v[0] for k, v in words[t.id].items() if k in ("whisper_stem", "whisper_unforced") and isinstance(v, list)]
                def support(key: str) -> list[str]:
                    mine = MODEL[key]
                    agree = {MODEL[k] for k, s in ctc.items() if MODEL[k] != mine and abs(s - ctc[key]) <= 0.07}
                    if any(abs(s - ctc[key]) <= 0.12 for s in whisper_obs):
                        agree.add("whisper")
                    return sorted(agree)
                ranked = sorted(ctc, key=lambda k: (-len(support(k)), CTC.index(k)))
                source = ranked[0] if ranked and support(ranked[0]) else None
                if source:
                    start, end = obs[source][0], obs[source][1]
                    basis = f"{source.replace('_', '-')}~{'+'.join(support(source))}"
                    review = "priority" if spread > 120 else "normal"
                else:
                    pool = list(ctc.values()) or list(starts.values())
                    start = float(np.median(pool))
                    end = float(np.median([v[1] for k, v in obs.items() if k in ctc] or [v[1] for v in obs.values()]))
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
    # Entrances: a line's first word cannot span a clear breath. When its
    # interval contains a dip (stem < -30 dBFS for >= 150 ms) in its first
    # half, the start moves to the rise after the dip ('+entrance-rise').
    for line in lines:
        rec = chosen[line.tokens[0].id]
        a, b = int(rec["start"] / 0.01), int(rec["end"] / 0.01)
        k, run, dip_end = a, 0, None
        while k < min(b, a + max(1, (b - a) // 2) + 15):
            run = run + 1 if db[k] < -30 else 0
            if run >= 15:
                j = k
                while j < b and db[j] < -26:
                    j += 1
                dip_end = j
            k += 1
        if dip_end is not None and dip_end < b - 5:
            rec["entranceMovedMs"] = round((dip_end - a) * 10)
            rec["start"] = dip_end * 0.01
            rec["basis"] += "+entrance-rise"
            rec["review"] = "priority"
    # Early rise: CTC often starts an initial held vowel late. When a line's
    # first word begins within 0.9 s after a clear rise (a >= 100 ms dip below
    # -30 dBFS, then above -26 dBFS) that follows the previous line's last
    # word, the start moves back to the rise ('+early-rise').
    prev_end = 0.0
    for line in lines:
        rec = chosen[line.tokens[0].id]
        k1 = int(rec["start"] / 0.01)
        lo = max(int((prev_end + 0.05) / 0.01), k1 - 90)
        rise = None
        for k in range(max(lo, 10), k1):
            if db[k] > -26 and np.all(db[k - 10:k] < -30):
                rise = k
        if rise is not None and k1 - rise >= 8 and "entrance-rise" not in rec["basis"]:
            rec["earlyRiseMovedMs"] = round((rise - k1) * 10)
            rec["start"] = rise * 0.01
            rec["basis"] += "+early-rise"
            rec["review"] = "priority"
        prev_end = max(chosen[t.id]["end"] for t in line.tokens)
    # Sustained vowels and late entrances inside a lane. A voiced gap (stem
    # above -32 dBFS for >= 80 % of it, up to 2.5 s) joins the word to the next
    # ('+sustained'). A line's first word that is a short blip (< 0.2 s) before
    # a long gap moves to the rise inside that gap ('+late-entrance').
    def voiced(a_s: float, b_s: float) -> float:
        a_i, b_i = int(a_s / 0.01), int(b_s / 0.01)
        return float(np.mean(db[a_i:b_i] > -32)) if b_i > a_i else 1.0
    for line in lines:
        for voice in ("lead", "backing"):
            toks = [t for t in line.tokens if t.voice == voice]
            for i, (a, b) in enumerate(zip(toks, toks[1:])):
                A, B = chosen[a.id], chosen[b.id]
                gap = B["start"] - A["end"]
                if gap <= 0.06:
                    continue
                if i == 0 and a == line.tokens[0] and A["end"] - A["start"] < 0.2 and gap > 0.6:
                    k0, k1 = int(A["end"] / 0.01), int(B["start"] / 0.01)
                    rise = next((k for k in range(k0 + 10, k1) if db[k] > -26 and np.mean(db[k:k1] > -32) >= 0.8), None)
                    if rise is not None:
                        A["lateEntranceMovedMs"] = round((rise * 0.01 - A["start"]) * 1000)
                        A["start"], A["end"] = rise * 0.01, B["start"]
                        A["basis"] += "+late-entrance"; A["review"] = "priority"
                        continue
                if gap <= 2.5 and voiced(A["end"], B["start"]) >= 0.8:
                    A["sustainedMs"] = round(gap * 1000)
                    A["end"] = B["start"]
                    A["basis"] += "+sustained"
                    if gap > 0.6:
                        A["review"] = "priority"
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
