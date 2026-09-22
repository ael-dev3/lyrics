"""Reproduce bounded signal evidence for the four temporal-phrase releases.

Run from the project root with a Python environment providing numpy, soundfile,
torch and torchaudio, and the cached MMS_FA model. This writes evidence only;
it never changes cues, source corrections, approval state or rendered media.
"""

import hashlib
import json
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
import torchaudio
from torchaudio.pipelines import MMS_FA

torch.set_num_threads(3)
SR = 16000
SOURCE_SR = 44100
OUT = Path("analysis/duration-focus-v3-signal.json")


def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for part in iter(lambda: f.read(1024 * 1024), b""):
            h.update(part)
    return h.hexdigest()


def rms(x):
    return float(np.sqrt(np.mean(np.asarray(x, dtype=np.float64) ** 2)))


def body(x, t):
    # Centered 20 ms window; normalized lag correlation over overlapping samples.
    c = round(t * SR)
    w = x[c - 160:c + 160].astype(np.float64)
    w = w - np.mean(w)
    periodicity = max(
        float(np.dot(w[:-lag], w[lag:]) /
              max(1e-15, np.linalg.norm(w[:-lag]) * np.linalg.norm(w[lag:])))
        for lag in range(30, 161)
    )
    return {"time": round(t, 3), "rms": round(rms(x[c - 160:c + 160]), 6),
            "periodicity": round(periodicity, 6)}


items = [
    {"id": "LM-002-s04", "text": "уже", "startSample": 474006,
     "previousEndSample": 494350, "chosenEndSample": 523908,
     "nextStartSample": 525308, "trace": [11.72, 11.96],
     "uncertaintySeconds": 0.025,
     "rationale": "The strongly periodic held vowel decays around 11.83–11.89 s, before the independent mix/stem k/g anchor near 11.912 s. Retain the existing next-word onset; extend only this release to 11.880 s. This does not imply a perfectly separable sung/reverberant boundary."},
    {"id": "LM-013-s04", "text": "уже", "startSample": 3441069,
     "previousEndSample": 3458760, "chosenEndSample": 3489192,
     "nextStartSample": 3491489, "trace": [79.00, 79.23],
     "uncertaintySeconds": 0.04,
     "rationale": "The strong held vowel decays around 79.07–79.12 s. A quieter periodic tail continues toward 79.17 s and may contain reverberation; the mix/stem k/g anchor follows at 79.172–79.192 s. Choose the conservative 79.120 s release, retain the next onset, and record wider release uncertainty."},
    {"id": "LM-002-s05", "text": "который", "startSample": 525308,
     "previousEndSample": 592532, "chosenEndSample": 597996,
     "nextStartSample": 600493, "trace": [13.40, 13.64],
     "uncertaintySeconds": 0.025,
     "rationale": "Periodic vowel energy continues beyond the CTC core release at 13.436 s and decays around 13.53–13.57 s. End at 13.560 s before the low-energy consonant transition and independently located next word near 13.617 s."},
    {"id": "LM-013-s05", "text": "который", "startSample": 3491489,
     "previousEndSample": 3555178, "chosenEndSample": 3563280,
     "nextStartSample": 3564908, "trace": [80.58, 80.88],
     "uncertaintySeconds": 0.025,
     "rationale": "Periodic vowel energy persists beyond the CTC core release at 80.616 s and decays around 80.78–80.82 s. End at 80.800 s, before the low-energy closure and next-word onset near 80.837 s. The two repeats are measured separately."},
]

inputs = {}
waves = {}
for kind in ["vocals", "mix"]:
    path = f"analysis/{kind}16.wav"
    waves[kind], sr = sf.read(path, dtype="float32")
    assert sr == SR and waves[kind].ndim == 1
    inputs[path] = {"sha256": sha(path), "sampleRate": sr,
                    "samples": len(waves[kind])}

model = MMS_FA.get_model(with_star=False).eval()
labels = MMS_FA.get_labels(star=None)
windows = [
    {"id": "LM-002", "start": 7.8, "end": 14.8,
     "inspect": [10.6, 12.55], "velar": [11.85, 11.96],
     "vowel": [11.96, 12.08], "stop": [12.32, 12.42],
     "oldGap": [494350 / SOURCE_SR, 525308 / SOURCE_SR]},
    {"id": "LM-013", "start": 75.0, "end": 81.9,
     "inspect": [77.8, 79.80], "velar": [79.12, 79.24],
     "vowel": [79.24, 79.36], "stop": [79.54, 79.65],
     "oldGap": [3458760 / SOURCE_SR, 3491489 / SOURCE_SR]},
]
observations = []
for window in windows:
    for kind in ["vocals", "mix"]:
        x = waves[kind]
        a, b = round(window["start"] * SR), round(window["end"] * SR)
        with torch.inference_mode():
            emission, _ = model(torch.from_numpy(x[a:b]).unsqueeze(0))
        p = emission[0].exp().numpy()
        step = (b - a) / SR / len(p)
        times = a / SR + np.arange(len(p)) * step
        top_indices = np.argmax(p, axis=1)
        events = []
        for n in np.where((times >= window["inspect"][0]) &
                          (times <= window["inspect"][1]))[0]:
            if top_indices[n] != 0:
                top = np.argsort(p[n])[-4:][::-1]
                events.append({"time": round(float(times[n]), 6),
                               "top": [[labels[j], round(float(p[n, j]), 6)] for j in top]})

        def anchor(bounds, target_labels):
            ns = np.where((times >= bounds[0]) & (times <= bounds[1]))[0]
            target = [labels.index(letter) for letter in target_labels]
            n = int(ns[np.argmax(p[ns][:, target].sum(axis=1))])
            return {"searchWindow": bounds, "time": round(float(times[n]), 6),
                    "graphemes": {letter: round(float(p[n, labels.index(letter)]), 6)
                                  for letter in target_labels}}

        gap_a, gap_b = (round(v * SR) for v in window["oldGap"])
        observations.append({"cueId": window["id"], "audio": kind,
                             "crop": [window["start"], window["end"]],
                             "emissionStepSeconds": step,
                             "greedyNonblankEvents": events,
                             "nextWordAnchors": {
                                 "initialVelar": anchor(window["velar"], ["k", "g"]),
                                 "followingVowel": anchor(window["vowel"], ["a", "o"]),
                                 "medialStop": anchor(window["stop"], ["t", "d"])},
                             "previousNeutralGap": {"start": window["oldGap"][0],
                                                    "end": window["oldGap"][1],
                                                    "rms": rms(x[gap_a:gap_b])}})

for item in items:
    item["previousStartSeconds"] = item["startSample"] / SOURCE_SR
    item["previousEndSeconds"] = item["previousEndSample"] / SOURCE_SR
    item["chosenStartSeconds"] = item["previousStartSeconds"]
    item["chosenEndSeconds"] = item["chosenEndSample"] / SOURCE_SR
    item["nextStartSeconds"] = item["nextStartSample"] / SOURCE_SR
    item["remainingGapSeconds"] = (item["nextStartSample"] - item["chosenEndSample"]) / SOURCE_SR
    lo, hi = item.pop("trace")
    item["vocalBodyTrace"] = [body(waves["vocals"], t / 100)
                              for t in range(round(lo * 100), round(hi * 100) + 1)]

result = {
    "schemaVersion": 1,
    "scope": "Four end-only preview corrections in the two independently measured temporal phrases. Previous values explicitly refer to the delivered v2 cue baseline.",
    "status": "signal-supported preview candidates; not listening-attested",
    "humanListeningAttested": False,
    "sourceSampleRate": SOURCE_SR,
    "method": {
        "script": "scripts/audit-duration-focus-v3.py",
        "sha256": sha(__file__),
        "torchVersion": torch.__version__,
        "torchaudioVersion": torchaudio.__version__,
        "model": "torchaudio.pipelines.MMS_FA, with_star=False, CPU, 3 threads",
        "emission": "Unforced model emissions on independent bounded mix/stem windows; no text constraint. Romanized grapheme posteriors are model anchors, not validated phonemes. Time uses crop sample zero plus frame index times crop-duration/frame-count, matching the existing aligner.",
        "waveform": "20 ms centered vocal-stem RMS and demeaned normalized lag correlation, 10 ms spacing, lags 30–160 at 16 kHz. Periodicity supports voiced continuation but cannot identify the word alone.",
        "selection": "The chosen releases are explicit editorial signal estimates from the decay before independently anchored next-word consonants. No minimum hold, averaged repeat offset, global delay or blanket phrase fill is applied."
    },
    "inputs": inputs,
    "observations": observations,
    "corrections": items,
    "interpretation": "Mix and stem locate the k/g–a/o–t/d sequence of который near the existing next-word onsets in each repeat. The long intervening voiced body therefore supports a held ending of уже, rather than advancing который to the early Whisper assignment. Current year-after-year grouping is a separate semantic issue. CTC blank is not acoustic silence.",
    "limitations": [
        "This is signal/model inspection, not a claim of normal-speed or reduced-speed human listening.",
        "MMS mix and stem are separate observations from the same model family, not independent model votes.",
        "Exact sung release versus residual room/reverb remains uncertain at the stated scale, particularly LM-013-s04.",
        "Encoded focus audits establish conformance to cue intervals, not their acoustic correctness."
    ]
}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"path": str(OUT), "corrections": len(items),
                  "observationCount": len(observations), "methodSha256": result["method"]["sha256"]}))
