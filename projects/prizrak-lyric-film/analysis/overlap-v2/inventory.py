"""Fresh unprompted Japanese observations of overlapping voices; not lexical proof."""
import argparse, hashlib, json, time
from pathlib import Path
from importlib.metadata import version
import numpy as np
import soundfile as sf
import stable_whisper
import torch

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]
INPUTS = PROJECT / 'analysis/independent-audio'
p = argparse.ArgumentParser()
p.add_argument('--model', default='large-v3-turbo')
p.add_argument('--kind', choices=['original', 'vocals', 'original-side', 'vocals-side'], default='original')
p.add_argument('--start', type=float, default=200)
p.add_argument('--end', type=float, default=241)
p.add_argument('--tag', required=True)
args = p.parse_args()

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''): h.update(block)
    return h.hexdigest()

input_path = (HERE / (args.kind + '-16000.wav')) if args.kind.endswith('-side') else (INPUTS / ('vocals-16000.wav' if args.kind == 'vocals' else 'original-mix-16000.wav'))
wave, sr = sf.read(input_path)
assert sr == 16000
lo, hi = round(args.start * sr), round(args.end * sr)
assert 0 <= lo < hi <= len(wave)
torch.set_num_threads(4)
print(json.dumps({'phase': 'load', 'model': args.model, 'kind': args.kind, 'crop': [lo / sr, hi / sr]}), flush=True)
model = stable_whisper.load_model(args.model, device='cpu')
start = time.monotonic()
result = model.transcribe(wave[lo:hi].astype(np.float32), language='ja', verbose=False,
    temperature=0, condition_on_previous_text=False, initial_prompt=None,
    word_timestamps=True, regroup=False, suppress_silence=False, fp16=False)
result.offset_time(lo / sr)
out = {
    'schemaVersion': 1,
    'status': 'Unprompted lexical observations of overlapping vocals; not selected timing or human hearing.',
    'sourceSha256': sha(PROJECT / 'public/source.mp4'),
    'method': {'model': args.model, 'checkpointSha256': sha(Path.home() / '.cache/whisper' / (args.model + '.pt')),
        'implementation': 'stable-ts ' + version('stable-ts'), 'language': 'ja',
        'inputKind': args.kind, 'inputFile': str(input_path.relative_to(PROJECT)),
        'inputSha256': sha(input_path), 'conditioningText': None, 'initialPrompt': None,
        'conditionOnPreviousText': False, 'suppressSilence': False,
        'cropStartSample16000': lo, 'cropEndSample16000': hi,
        'originalSourceZeroPreserved': True, 'humanListening': False,
        'elapsedSeconds': time.monotonic() - start},
    'result': result.to_dict()
}
(HERE / (args.tag + '.json')).write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'phase': 'complete', 'tag': args.tag, 'elapsedSeconds': out['method']['elapsedSeconds'],
    'segments': [{k: s[k] for k in ['start', 'end', 'text']} for s in out['result']['segments']]}, ensure_ascii=False), flush=True)
