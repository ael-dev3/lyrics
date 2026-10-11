"""Recording coverage audit without supplied lyric text; never authors cues."""
import argparse, hashlib, json
from pathlib import Path
import soundfile as sf
import stable_whisper
import torch

root = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--model', choices=['large-v3-turbo', 'small'], required=True)
parser.add_argument('--input', choices=['mix', 'vocals'], default='mix')
parser.add_argument('--group', choices=['wide', 'narrow'], default='wide')
args = parser.parse_args()
torch.set_num_threads(3)
torch.set_num_interop_threads(1)
recording = json.loads((root / 'source/recording.json').read_text())
source_hash = hashlib.sha256((root / 'public/source.mp4').read_bytes()).hexdigest()
assert source_hash == recording['sourceSha256'], 'Changed original recording'
input_path = root / ('analysis/mix-audit-v2.wav' if args.input == 'mix' else 'analysis/vocals16.wav')
wave, sr = sf.read(input_path, dtype='float32')
assert sr == 16000 and wave.ndim == 1
plan = json.loads((root / 'source/repeat-audit-plan.json').read_text())
assert plan['sourceSha256'] == source_hash
model = stable_whisper.load_model(args.model, device='cpu')
out = root / 'analysis/repeat-audit-v2'
out.mkdir(exist_ok=True)
records = []
for window in plan['windows']:
    if window['group'] != args.group:
        continue
    lo, hi = window['crop']
    result = model.transcribe(
        wave[round(lo * sr):round(hi * sr)], language='ru', verbose=False,
        temperature=0, condition_on_previous_text=False, initial_prompt=None,
        word_timestamps=True, regroup=False, suppress_silence=False, fp16=False,
    )
    result.offset_time(lo)
    data = result.to_dict()
    provenance = {
        'sourceSha256': source_hash, 'input': args.input, 'model': args.model,
        'inputSha256': hashlib.sha256(input_path.read_bytes()).hexdigest(),
        'crop': [lo, hi], 'conditioningText': None, 'humanListening': False,
    }
    record = {'id': window['id'], 'provenance': provenance, 'result': data}
    (out / f'{args.model}-{args.input}-{window["id"]}.json').write_text(
        json.dumps(record, ensure_ascii=False, indent=2) + '\n'
    )
    records.append(record)
    print(json.dumps({
        'id': window['id'], 'model': args.model, 'input': args.input,
        'segments': [{'start': s['start'], 'end': s['end'], 'text': s['text'],
                      'words': [{'text': w['word'].strip(), 'start': w['start'],
                                 'end': w['end'], 'score': w['probability']}
                                for w in s.get('words', [])]}
                     for s in data['segments']],
    }, ensure_ascii=False), flush=True)
(out / f'{args.model}-{args.input}-{args.group}-all.json').write_text(
    json.dumps(records, ensure_ascii=False, indent=2) + '\n'
)
