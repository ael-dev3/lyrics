# Software, models and fonts

This production uses TypeScript and React. The npm manifest and lockfile pin the editable project's dependencies; the versions below were checked against the installed tools. Third-party packages, model weights and fonts retain their own licences.

| Component | Version and production role | Primary project |
| --- | --- | --- |
| OpenAI Codex | GPT-6 Astra; implementation, timing reconciliation, visual review and documentation | [Codex](https://openai.com/codex/) |
| Built-in image generation | Source-referenced covers; underlying image-model version is not exposed | [OpenAI](https://openai.com/) |
| Node.js / npm | 24.20.0 / 11.19.0 | [Node.js](https://nodejs.org/) · [npm](https://docs.npmjs.com/) |
| TypeScript | 7.0.2; exact stable compiler pin | [TypeScript](https://www.typescriptlang.org/) |
| React / React DOM | 19.2.8 | [React](https://react.dev/) |
| Remotion | 4.0.518; composition, browser rendering and frame capture | [Remotion](https://www.remotion.dev/) |
| Chromium | Chrome for Testing 149.0.7790.0 | [Chromium](https://www.chromium.org/) |
| FFmpeg / FFprobe | 8.1.2; source decoding, delivery encoding and verification | [FFmpeg](https://ffmpeg.org/) |
| Remotion-bundled FFmpeg | n7.1; lossless render intermediates and matching recovery color conversion | [Remotion](https://www.remotion.dev/docs/ffmpeg) |
| Sharp | 0.35.4; diagnostic waveform images and labelled QA contact sheets only | [Sharp](https://sharp.pixelplumbing.com/) |
| yt-dlp | 2026.08.19; source acquisition | [yt-dlp](https://github.com/yt-dlp/yt-dlp) |
| PyTorch / torchaudio | 2.13.0 / 2.11.0; pretrained audio-model environment | [PyTorch](https://pytorch.org/) |
| stable-ts | 2.19.1; attention-based timing observations | [stable-ts](https://github.com/jianfch/stable-ts) |
| OpenAI Whisper | 20250625 package; large-v3-turbo model | [Whisper](https://github.com/openai/whisper) |
| MMS-FA | TorchAudio multilingual CTC forced aligner; mixed audio and vocal timing observations | [MMS-FA](https://docs.pytorch.org/audio/main/generated/torchaudio.pipelines.MMS_FA.html) |
| wav2vec2 | WAV2VEC2_ASR_BASE_960H; independent English acoustic encoder | [wav2vec2 pipeline](https://docs.pytorch.org/audio/main/generated/torchaudio.pipelines.WAV2VEC2_ASR_BASE_960H.html) |
| Demucs | 4.1.0; htdemucs analysis stems | [Demucs](https://github.com/facebookresearch/demucs) |
| SoundFile / NumPy | 0.13.1 / 2.5.2; model-input handling | [SoundFile](https://python-soundfile.readthedocs.io/) · [NumPy](https://numpy.org/) |
| uroman | 1.3.1.1; installed MMS preprocessing dependency | [uroman](https://github.com/isi-nlp/uroman) |
| Space Grotesk | Bundled variable font for artist and footer metadata | [Space Grotesk](https://github.com/floriankarsten/space-grotesk) |
| Oswald | Medium for lyrics; Bold for the title | [Oswald](https://github.com/googlefonts/OswaldFont) |

Font attribution and SIL Open Font License notices are included in [SpaceGrotesk-OFL.txt](public/SpaceGrotesk-OFL.txt) and [Oswald-OFL.txt](public/Oswald-OFL.txt). These fonts are credited to their respective project authors. No software, model or font is relicensed by this project.

The authored workflow, cue reconciliation, signal analysis, composition and verification use TypeScript. The model bridge invokes Python only for pretrained audio-model interfaces. Stored model observations are evidence for the selected timing data, not proof of exact acoustic boundaries. Internal model preprocessing does not create pronunciation material.

Sharp is optional for diagnostic image regeneration and is supplied by the workspace runtime in this production. Set `SHARP_REQUIRE_BASE` to a module-resolution base containing Sharp 0.35.4 when running `vocal-review.ts` or `final-frames.ts`; the film renderer itself does not require Sharp.

The official source contains 2880×2160 footage at 25 fps. The film preserves that source cadence while the new lyric and graphic animation runs at 60 fps. Camera movement comes from the original footage. A 60 fps delivery does not imply that the source was filmed at 60 fps. Analysis stems do not replace the original recording, and no synthetic singing is attributed to the artist.

AI-assisted covers adapt source-video imagery. The image tool's undisclosed model must not be inferred from the Codex model name. The project record retains cover prompts and selected generated images separately from the original footage. See [source credits and contribution boundaries](CREDITS-SOURCE.md).
