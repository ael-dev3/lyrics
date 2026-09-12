# Software, models and fonts

The editable production is TypeScript/React. The npm lockfile records exact dependencies. Third-party packages, model weights and fonts retain their own terms.

| Component | Recorded version / role | Primary project |
| --- | --- | --- |
| OpenAI Codex | GPT-6 Astra; implementation, timing reconciliation, visual review and documentation | https://openai.com/codex/ |
| Built-in image generation | Source-referenced covers; image-model version not exposed | https://openai.com/ |
| Node.js | 24.20.0 | https://nodejs.org/ |
| TypeScript | 7.0.2 | https://www.typescriptlang.org/ |
| React | 19.2.8 | https://react.dev/ |
| Remotion | 4.0.518; Chromium rendering and lossless PNG capture | https://www.remotion.dev/ |
| Chromium | Chrome for Testing 149.0.7790.0 | https://www.chromium.org/ |
| FFmpeg / FFprobe | 8.1.2; decoding, AAC, libx264, Lanczos and verification | https://ffmpeg.org/ |
| yt-dlp | 2026.08.19; source acquisition | https://github.com/yt-dlp/yt-dlp |
| PyTorch / torchaudio | 2.13.0 / 2.11.0 in the CPU model environment | https://pytorch.org/ |
| stable-ts | 2.19.1; attention alignment | https://github.com/jianfch/stable-ts |
| OpenAI Whisper | 20250625 package; large-v3-turbo | https://github.com/openai/whisper |
| MMS-FA | Multilingual CTC forced aligner, mix and vocals | https://docs.pytorch.org/audio/main/generated/torchaudio.pipelines.MMS_FA.html |
| wav2vec2 | WAV2VEC2_ASR_BASE_960H; independent English acoustic encoder | https://docs.pytorch.org/audio/main/generated/torchaudio.pipelines.WAV2VEC2_ASR_BASE_960H.html |
| Demucs | 4.1.0; htdemucs vocal-analysis stem | https://github.com/facebookresearch/demucs |
| SoundFile / NumPy | 0.13.1 / 2.5.2; model input handling | https://python-soundfile.readthedocs.io/ · https://numpy.org/ |
| uroman | 1.3.1.1; MMS tokenizer preprocessing only | https://github.com/isi-nlp/uroman |
| Space Grotesk | Bundled variable font for lyrics | https://github.com/floriankarsten/space-grotesk |
| Cormorant Garamond | Bundled Semibold and Italic for titles | https://github.com/CatharsisFonts/Cormorant |

Font notices are bundled in `public/SpaceGrotesk-OFL.txt` and `public/CormorantGaramond-OFL.txt`. No software, model or font is relicensed by this project.

`scripts/align-models.ts` invokes Python only for pretrained model APIs. Lyric selection, timing decisions, DSP, animation, rendering and verification are TypeScript. Internal model preprocessing does not create pronunciation material.

The films retain the original recording and animated footage. No synthetic singing or reconstructed stem mix replaces the source. Covers are AI-assisted adaptations; their exact prompts and selected generated originals are retained in `analysis/`.
