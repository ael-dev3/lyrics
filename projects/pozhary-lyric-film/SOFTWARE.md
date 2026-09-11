# Software, models and fonts

The editable production is TypeScript/React. The Node dependency lock records exact package versions; third-party packages and fonts retain their own licenses.

| Component | Recorded version / role | Primary project |
| --- | --- | --- |
| OpenAI Codex | GPT-6 Astra; implementation, English adaptation, analysis review and publishing copy | https://openai.com/codex/ |
| Built-in image-generation tool | Referenced-artwork cover generation; model version not exposed | https://openai.com/ |
| Node.js | 24.20.0 | https://nodejs.org/ |
| TypeScript | 7.0.2 | https://www.typescriptlang.org/ |
| React | 19.2.8 | https://react.dev/ |
| Remotion | 4.0.518; Chromium rendering, PNG frame capture | https://www.remotion.dev/ |
| Chromium | Chrome for Testing 149.0.7790.0; recorded rendering browser | https://www.chromium.org/ |
| FFmpeg / FFprobe | 8.1.2; decoding, AAC, libx264, Lanczos, muxing, technical checks | https://ffmpeg.org/ |
| yt-dlp | 2026.08.19; original-source acquisition | https://github.com/yt-dlp/yt-dlp |
| PyTorch / torchaudio | 2.13.0 / 2.11.0 in the available CPU alignment environment | https://pytorch.org/ |
| stable-ts | 2.19.1; bounded word alignment | https://github.com/jianfch/stable-ts |
| OpenAI Whisper | 20250625 package, large-v3-turbo model | https://github.com/openai/whisper |
| MMS-FA | torchaudio pretrained CTC aligner | https://docs.pytorch.org/audio/main/generated/torchaudio.pipelines.MMS_FA.html |
| Demucs | 4.1.0, htdemucs; vocal analysis stem | https://github.com/facebookresearch/demucs |
| SoundFile / NumPy | 0.13.1 / 2.5.2; model input handling | https://python-soundfile.readthedocs.io/ · https://numpy.org/ |
| uroman | 1.3.1.1; MMS tokenizer preprocessing only | https://github.com/isi-nlp/uroman |
| Oswald | Bundled Bold and Medium; Cyrillic display type | https://fonts.google.com/specimen/Oswald |
| Space Grotesk | Bundled variable font; English text | https://github.com/floriankarsten/space-grotesk |

The bundled font notices are `public/Oswald-OFL.txt` and `public/SpaceGrotesk-OFL.txt`. No font or software is relicensed by this project.

The optional model bridge in `scripts/align-models.ts` invokes Python libraries whose pretrained interfaces are available in Python. It does not own lyric selection, translation, animation, DSP or verification. Internal tokenizer normalization is not published as a pronunciation guide.

Finished films use the original recording, not synthesized vocals or a reconstructed mix of stems. Covers are AI-assisted adaptations, while the film background is the original photograph. The exact cover prompts appear in `analysis/cover-prompts.json`; no image-model version is inferred from the Codex model name.
