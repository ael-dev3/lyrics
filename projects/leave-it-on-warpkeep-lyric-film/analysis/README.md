# Leave It On: source clock, lyric candidates and measured response

This is a **review-preview timing map**. The complete recording was processed by acoustic models; no complete perceptual listening review is claimed. Every word and all high-risk passages remain open for actual-audio adjudication. Technical checks and detailed timestamps do not mark synchronization or production authorization complete.

## Locked source and timeline

The supplied master is `source/Leave It On.m4a`, SHA-256 `376926ae77af41789ac620685dd15b5e1515e3777aece65e964463277e5cfe44`, 4,448,680 bytes. Despite its extension, its soundtrack is stereo **Opus at 48 kHz**. The source contains 78 embedded subtitle entries: 67 lyric candidates and 11 bracketed production hints. The original supplied SRT, text and cue JSON are preserved unchanged. A fresh subtitle extraction matches the supplied SRT.

The first audio packet has PTS −312 samples and instructs the decoder to skip 312 samples (6.5 ms). Native FFmpeg decoding produces 13,131,528 samples per channel, or 273.5735 seconds. The MP4 presentation metadata reports 273.560 seconds; the final packet begins at 273.5535 seconds and has a declared duration of 6.5 ms. The extra decoded 13.5 ms is recorded rather than stretched or manually offset.

The preview uses the selected audio element's presentation clock and reads its duration at runtime. `source/leave-it-on.opus.webm` is an optional Opus **stream copy** for browser compatibility. Its declared duration is 273.568 seconds because its container uses a millisecond timebase. Both containers have the same concatenated audio packet payload SHA-256, `d1a6dbe54f991321838f54a25e0fca90964cbc55df8c22d2a687968a22bdfe95`, and the same FFmpeg-decoded native s16le PCM SHA-256, `be63de4991bf5530d54f35c607e5b75c045779e623909b8681a6f764e08ac920`. This establishes packet and decoded-sample preservation for the remux, not identical container timestamps. Browser onset/tail behavior is a separate check owned by the complete preview review.

Keep the master, remux and estimated stems local. The estimated vocal stem is never the playback soundtrack.

## Performed-text decisions and timing method

The embedded subtitle clock is a reference. An unforced Whisper large-v3-turbo pass covered the complete source in ten overlapping windows without receiving the supplied lyrics. A separate Whisper small pass examined seven risky regions on an HTDemucs vocal estimate. These are two Whisper variants, not independent model families.

Two pretrained CTC models, MMS FA and Wav2Vec2 ASR Base 960h, aligned the supplied words independently against the original mix and estimated vocals. Both CTC systems belong to the wav2vec architecture family. Stable Whisper attention alignment on the estimated vocals supplies an additional method. Five final candidate passes are retained, with the preliminary larger-window passes kept as evidence of failures. The vocal estimate and analysis source contain the same number of 16 kHz samples; waveform cross-correlation found zero lag in six inspected regions (correlations 0.309–0.891). Separation can still remove vocal harmonics and leave instrumental leakage.

`select_timing.py` records the selected model for each boundary and explicit corrections to obvious candidate failures. It selects existing observations and rounds them to the 48 kHz source sample grid. It never spreads words evenly through a caption, synthesizes a beat-based word onset, or averages conflicting estimates into a claim of certainty. A mixed-candidate overlap, if present, hands off at the following measured onset and is flagged. Source-sample precision describes representation; it does not prove sample-accurate phonetic alignment. Model confidence scores are not comparable across systems.

The current map contains **63 line cues and 343 words**. IDs retain their positions in the supplied 67-line reference. Source reference entries 25–28 (lyric IDs L21–L24) are omitted from the preview because both unforced Whisper passes support two first-chorus refrain pairs, around 84.7–90.7 and 93.3–99.3 seconds, rather than the four pairs listed in the embedded text. This is a model-supported editorial decision requiring listening confirmation. The unchanged source references retain all four pairs.

The rendered words preserve the supplied spelling of Warpkeep, Hyperion and Farcaster. `Warpkeep—Hyperion` is split into two independently timed words. Bracketed production directions never enter the performed lyric lane.

## High-risk review queue

| Region | Current preview decision | What remains open |
| --- | --- | --- |
| 7–18.8 s | Intro “You still there?” and “Leave it on” have bounded stem-based candidates. | Breathy onset and processed “on” release. |
| 84–101.5 s | Two independently aligned first-chorus refrain pairs; compressed extra pairs removed. | Confirm exact performed count and held-vowel releases with audio. |
| 102.9–110.7 s | Supplied proper names and “starways grown” retained. | Recognizers vary on the fantasy names and “grown/growing.” |
| 119.16–126.82 s | “The Core” begins around 119.16 s; “where no one…” around 123.49 s. | Embedded Core line starts early; verify consonants, held releases and semantic effect lifetime. |
| 161.5–176.1 s | Second chorus refrains use independent windows and selected mix/stem candidates. | Some CTC paths drift into instrumental vowels. Word disagreements remain explicit. |
| 178.78–183.64 s | Farcaster sentence begins around 178.78 s and ends around 181.51 s; next line then follows. | Supplied 175.452–176.649 cue was early and impossibly compressed. Verify name pronunciation and onset. |
| 196.6–214 s | No new lyric is invented during the bridge tail and candidate instrumental passage. | One turbo pass emitted a possible isolated “you” around 204 s; small stem pass did not. Distinguish real echo/rearticulation from hallucination before production. The 198.3 s chapter boundary is editorial/provisional. |
| 229.6–240.6 s | Final refrain uses bounded candidates; no invented repeated “on” words. | Turbo emitted repeated “on” tokens around 235–238 s, while small stem pass did not reliably recover the line. Check whether this is distinct backing singing, electronic repeats or reverb. |
| 242.64–268.65 s | “I'm still here,” “Leave it on,” and all four supplied outro lines are present. | Every release and remaining original tail require full listening review. No early black card or audio fade is implied. |

Every word has `requiresReview: true`. `timing-audit.json` records disagreement counts and technical validation. A complete actual-audio review is still required before the production gate can open.

## Clock owners and data contracts

- `data/lyrics.json`: performed-text candidate, exact word IDs and acoustic start/end intervals. `displayStart`/`displayEnd` reserve each complete line independently of its word focus. Display intervals contain the full selected acoustic span and do not overlap.
- `data/features.json`: 13,679 five-channel measurements at 50 Hz. Channel order is `rms`, `low`, `mid`, `high`, `attack`. All values are bounded 0–1.
- `data/spectrum.json`: 6,840 frames of **48 measured bands** at 25 Hz, quantized to integers 0–255. `bandCentersHz` gives each log-spaced frequency center from 45 to 10,000 Hz.
- Scene, shot, carrier and decorative-effect lifetimes are authored separately. A doorway reveal may span a lyric phrase without stretching its word highlighting. Frequency attacks are never word-onset authority.

The five-channel feature extraction uses a centered 4,096-sample Hann FFT at 48 kHz and a 960-sample hop. The bands are 35–180 Hz, 180–2,200 Hz and 2,200–12,000 Hz. RMS uses the centered unwindowed mono block; attack is positive spectral flux. Each channel is scaled by its full-recording 98th percentile and clamped, followed by documented attack/release smoothing. No quiet window is independently normalized to maximum. The extraction records coarse tempo candidates but adopts no beat grid.

The 48-band spectrum uses centered 8,192-sample Hann windows with a 1,920-sample hop. Triangular filters are spaced logarithmically; every filter covers actual FFT bins. Band RMS follows Parseval energy scaling. All 48 bands share one full-recording 99.5th-percentile reference (−21.6362 dBFS), with a fixed 54 dB display range down to −75.6362 dBFS. There is no per-band or local-window normalization. A 25 ms attack and 110 ms release envelope is precomputed from source time before quantization. Both feature files reconstruct after any seek; neither requires wall-clock state. After their final sample the player may hold the final measured value while the complete source media finishes.

## Reproduction

Use a Python 3.12 environment with the pinned packages in `python-requirements-lock.txt`. Model downloads require access to the relevant public model hosts. The analysis commands use FFmpeg, PyTorch, torchaudio, OpenAI Whisper, stable-ts and HTDemucs. Binary source/analysis files are intentionally local inputs.

```sh
ffprobe -v error -show_format -show_streams -of json 'source/Leave It On.m4a' > analysis/source-probe.json
ffmpeg -v error -y -i 'source/Leave It On.m4a' -map 0:a:0 -ac 1 -ar 16000 -c:a pcm_s16le analysis/source-mono-16k.wav
ffmpeg -v error -y -i 'source/Leave It On.m4a' -map 0:a:0 -c:a pcm_s16le analysis/source-stereo-48k.wav
ffmpeg -v error -y -i 'source/Leave It On.m4a' -map 0:a:0 -c:a copy source/leave-it-on.opus.webm
python analysis/transcribe.py
python -m demucs -n htdemucs -d cpu --shifts 0 --two-stems vocals -o analysis/stems analysis/source-stereo-48k.wav
ffmpeg -v error -y -i analysis/stems/htdemucs/source-stereo-48k/vocals.wav -ac 1 -ar 16000 -c:a pcm_s16le analysis/vocals-mono-16k.wav
python analysis/check_stem.py
python analysis/align_candidates.py mms v2
python analysis/align_candidates.py wav2vec v2
ALIGN_AUDIO=vocals-mono-16k.wav ALIGN_OUTPUT_LABEL=stem python analysis/align_candidates.py mms v2
ALIGN_AUDIO=vocals-mono-16k.wav ALIGN_OUTPUT_LABEL=stem python analysis/align_candidates.py wav2vec v2
python analysis/align_stable.py stem
python analysis/transcribe_focus.py small stem
python analysis/select_timing.py
python analysis/measure_features.py
python analysis/measure_spectrum.py
python analysis/finalize_evidence.py
```

The model scripts use `WHISPER_CACHE` when set, otherwise `~/.cache/whisper`; set an appropriate cache path when porting. `windows-v2.json` is the adopted, explicitly bounded analysis input; earlier `windows-v1.json` is retained for audit. Re-running a model may change floating-point output with a different runtime, device or model version. Re-freeze evidence and review any changed map before production.
