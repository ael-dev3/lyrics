"""Narrow native-library adapter: torchaudio MMS inference and CTC paths only.

TypeScript owns orchestration, provenance, acoustic review, and proposals. This
adapter never promotes character cores into accepted word boundaries.
"""
import argparse
import json
import re
import time
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
import torchaudio
import uroman
processor=uroman.Uroman()

parser = argparse.ArgumentParser()
parser.add_argument("--phrases", required=True)
parser.add_argument("--input", required=True)
parser.add_argument("--output", required=True)
parser.add_argument("--threads", type=int, default=4)
args = parser.parse_args()
torch.set_num_threads(args.threads)
torch.set_num_interop_threads(1)
phrases = json.loads(Path(args.phrases).read_text())
source_sha = phrases.get("sourceSha256") if isinstance(phrases, dict) else None
if isinstance(phrases, dict):
    phrases = phrases["phrases"]
wave, sample_rate = sf.read(args.input, dtype="float32")
assert sample_rate == 16000 and wave.ndim == 1
out = Path(args.output)
out.mkdir(parents=True, exist_ok=True)
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval()
tokenizer, aligner = bundle.get_tokenizer(), bundle.get_aligner()
labels = bundle.get_labels(star=None)
records = []
for phrase in phrases:
    phrase_id = phrase["id"]
    saved = out / ("mms-" + phrase_id + ".json")
    if saved.exists():
        retained = json.loads(saved.read_text())
        assert retained.get("sourceSha256") == source_sha, "Stale retained source"
        assert retained.get("conditionedUnits") == phrase["units"], "Stale retained text"
        assert retained.get("crop") == phrase["crop"], "Stale retained crop"
        records.append(retained)
        print(json.dumps({"id": phrase_id, "retained": True}), flush=True)
        continue
    lo, hi = [round(value * sample_rate) for value in phrase["crop"]]
    assert 0 <= lo < hi <= len(wave), phrase_id
    units = phrase["units"]
    tokens = [re.sub("[^a-z']", "", processor.romanize_string(unit).lower().replace("’", "'")) for unit in units]
    assert all(tokens), phrase_id
    started = time.monotonic()
    with torch.inference_mode():
        emission, _ = model(torch.from_numpy(wave[lo:hi]).unsqueeze(0))
    paths = aligner(emission[0], tokenizer(tokens))
    # Wav2vec2's convolutional centers have stride 320 and receptive field 400.
    # Retain both historical crop/frame ratio and the physical encoder centers.
    step = (hi - lo) / sample_rate / emission.shape[1]
    frame_stride = 320 / sample_rate
    center_offset = 199.5 / sample_rate
    words = []
    for index, (text, token, path) in enumerate(zip(units, tokens, paths)):
        weight = sum(part.end - part.start for part in path)
        words.append({"sourceIndex": index, "text": text,
                      "startSeconds": lo/sample_rate + center_offset + path[0].start*frame_stride,
                      "endSeconds": lo/sample_rate + center_offset + (path[-1].end-1)*frame_stride,
                      "score": sum(part.score*(part.end-part.start) for part in path)/weight,
                      "characters": [{"modelSymbol": token[j],
                                      "startSeconds": lo/sample_rate + part.start*step,
                                      "endSeconds": lo/sample_rate + part.end*step,
                                      "encoderFirstCenterSeconds": lo/sample_rate + center_offset + part.start*frame_stride,
                                      "encoderLastCenterSeconds": lo/sample_rate + center_offset + (part.end-1)*frame_stride,
                                      "score": part.score}
                                     for j, part in enumerate(path)]})
    best = emission[0].argmax(-1).numpy()
    greedy = [{"timeSeconds": lo/sample_rate+center_offset+i*frame_stride, "modelSymbol": labels[symbol],
               "score": float(emission[0,i,symbol].exp())}
              for i, symbol in enumerate(best) if symbol != 0 and (i == 0 or best[i-1] != symbol)]
    emission_file = "mms-" + phrase_id + "-logprob.f32"
    emission[0].numpy().astype("<f4").tofile(out / emission_file)
    record = {"phraseId": phrase_id, "sourceSha256": source_sha, "vocalTrack": phrase.get("vocalTrack"),
              "crop": [lo/sample_rate, hi/sample_rate], "conditionedUnits": units,
              "words": words, "unforcedModelSymbols": greedy,
              "emission": {"file": emission_file, "frames": int(emission.shape[1]),
                           "labels": labels, "cropRatioStepSeconds": step,
                           "encoderStrideSamples": 320, "encoderReceptiveFieldSamples": 400,
                           "encoderCenterOffsetSamples": 199.5},
              "elapsedSeconds": time.monotonic()-started,
              "humanListening": False,
              "normalization": "Uroman is private MMS tokenizer preprocessing only; never a displayed pronunciation layer.",
              "status": "Independent model observations requiring acoustic ownership review"}
    saved.write_text(json.dumps(record, ensure_ascii=False, indent=2)+"\n")
    records.append(record)
    print(json.dumps({"id": phrase_id, "seconds": round(record["elapsedSeconds"],2),
                      "words": [{"text": w["text"], "start": round(w["startSeconds"],3),
                                 "end": round(w["endSeconds"],3), "score": round(w["score"],3)}
                                for w in words]}), flush=True)
(out / "mms-all.json").write_text(json.dumps({"model": "torchaudio.pipelines.MMS_FA with_star=False",
                                           "torch": torch.__version__, "torchaudio": torchaudio.__version__,
                                           "threads": args.threads, "records": records},
                                          ensure_ascii=False, indent=2)+"\n")
