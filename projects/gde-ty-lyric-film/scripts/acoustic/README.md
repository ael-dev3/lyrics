# Optional acoustic observations

These narrow native-library adapters reproduce preparation diagnostics. They do not accept boundaries or authorize a render. Frozen text, mappings, observations and source-sample selections are sufficient to reproduce the approved film without downloading models.

The original preparation used Python, PyTorch/torchaudio 2.8.0, SoundFile, NumPy, SciPy, Uroman, stable-ts/Whisper and native HTDemucs safetensors. Use a compatible existing environment; large cached models and diagnostic sound stay outside Git. Uroman is internal MMS tokenizer preprocessing only, never a displayed pronunciation layer.

From the project directory, verify `source/recording.json`, create `analysis`, then decode untrimmed inputs:

```sh
ffmpeg -v error -i public/source.mp4 -map 0:a:0 -vn -ac 2 -ar 44100 -f f32le analysis/stereo44100.f32
ffmpeg -v error -i public/source.mp4 -map 0:a:0 -vn -ac 1 -ar 16000 analysis/mix16.wav
cp source/acoustic-crop-plan.json analysis/phrases.private.json
python scripts/acoustic/estimate-vocals.py
ffmpeg -v error -i analysis/vocals44100.wav -ac 1 -ar 16000 analysis/vocals16.wav
python scripts/acoustic/mms-observations.py --phrases source/acoustic-crop-plan.json --input analysis/mix16.wav --output analysis/mms-original
python scripts/acoustic/mms-observations.py --phrases source/acoustic-crop-plan.json --input analysis/vocals16.wav --output analysis/mms-vocals
python scripts/acoustic/whisper-observations.py
python scripts/acoustic/signal-panels.py
node scripts/acoustic/draw-panels.mjs
```

The vocal estimator expects the cached official HTDemucs `955717e8.safetensors`. It fixes random seed 0, one shift and 0.25 overlap, and requires unchanged stereo sample count. Stems remain estimates; the source mix is authoritative. Conditioned Whisper compares supplied units; its unprompted opening crop tests omission independently. Original preparation also used full and bounded unprompted recognition with large-v3-turbo and small; those complementary experiments are described in the production record rather than represented as new listening.

MMS retains physical encoder centers: 320-sample stride, 400-sample receptive field, 199.5-sample center offset at 16 kHz. It also records historical crop/frame ratios as diagnostics; never stretch accepted events by that ratio. Character cores are not complete word bodies. Wide-context reruns around quiet entrances or held endings need new explicit crop IDs/destinations; an existing retained result must not silently stand in for changed input. The published plan records the initial crops, including crops later found too narrow; committed boundary observations and rationale identify reconciled choices.

Signal panels use a fixed −80 to −15 dBFS display range, log frequency 90–5,000 Hz, a 1,024-point window and 4 ms hop. View original and estimated vocals together. Signal smearing, model stride and vocal leakage are explicit limits; complete normal/reduced-speed human review remains required.
