# Native acoustic adapters

The scene, timeline authoring, identity, preview server, proof and contracts use TypeScript. These small Python adapters are retained exceptions for native PyTorch/Demucs/torchaudio/Whisper/SciPy APIs; they do not render or control the browser.

Preparation used Python 3.12, Torch/torchaudio 2.8, stable-whisper large-v3-turbo, HTDemucs and MMS_FA. Uroman 1.3.1.1 is only private MMS text preprocessing; it is never displayed as pronunciation. Native vocal estimation uses 44.1 kHz stereo, a fixed seed and equal input/output sample counts. Analysis crops use 16 kHz derivatives and explicit original-source offsets.

- `estimate-vocals.py`: diagnostic vocal estimate with provenance.
- `unprompted-observations.py` / `vocal-coverage.py` / `bounded-coverage.py`: unconstrained coverage observations.
- `conditioned-whisper.py` / `mms-observations.py`: competing conditioned paths on explicit crops, not inferred truth.
- `signal-review.py`: original/stem signal data and relative normalized repetition comparisons.
- `clock-check.py`: original/stem lag search, separately from phonetic timing.
- `repeat-diagnostics.py`: duration-preserving pitch variants for recognition of difficult filtered hooks. These unsuccessful candidates cannot establish source boundaries.

Private PCM/stems/emission tensors/model caches remain ignored. Initial `node scripts/author-timing.ts` preserves compact source-bound competing paths and explicit selections. It refuses to overwrite a corrected selection file without `--replace`. The current timeline reproduces independently through `node scripts/build-timeline.ts`.

Do not name an adapter `coverage.py`: that shadows the installed Python coverage package during Whisper imports. Model outputs can stretch conditioned repeats into instrumentals or hallucinate closing text; original audio and an actual listener review remain decisive.
