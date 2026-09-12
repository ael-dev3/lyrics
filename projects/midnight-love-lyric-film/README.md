# girl in red — midnight love

A cinematic lyric film built around the official video's hooded silhouette, moving flame and blue night sky. Large English words hold a stable reading position; pale-gold color alone follows the sung words or explicit connected-word groups, without karaoke underlines. The landscape and vertical compositions preserve the original source animation and share one soundtrack and lyric timeline.

![Final cinematic landscape frame](evidence/youtube-final-44.png)

*Decoded from the final v1.1.0 YouTube film at 44 seconds. Active words use pale-gold color alone.*

## Deliverables

| Asset | Specification |
| --- | --- |
| YouTube film | 1920×1080 · 16:9 · 60 fps · H.264 High / AAC |
| TikTok film | 1080×1920 · 9:16 · 60 fps · H.264 High / AAC |
| Timeline | 193.8535 s retained audio · 11,632 delivery frames |
| Lyrics | 38 cues · 185 performed words · 161 focus groups |
| YouTube thumbnail | 1920×1080 JPEG |
| TikTok profile cover | **1200×1600 portrait**, 3:4 width:height |
| Publishing kit | Titles, concise descriptions, English SRT captions and verification reports |

The song is already in English, so English is the primary lyric layer. An additional translation lane is unnecessary. No pronunciation or singing-guide material is included.

## v1.1.0 correction

This revision restores six performed reprise lines that were omitted after the supplied reference ended near 02:34. All **151 supplied words** remain; **34 repeated words confirmed in the recording** bring the production sequence to **185 words in 38 cues and 161 focus groups**. The selected final held-vocal endpoint is **185.4 s**, and the closing title begins after **188 s**. The passage after the supplied text ends is not an instrumental tail.

Independent transcription of the source mix and separated vocals exposed the omitted reprise. The repeated phrases are aligned to their actual closing performance rather than assigned timestamps copied from an earlier chorus. The [tail transcription evidence](analysis/tail-correction/transcribe-vocals16.json) is retained alongside the [source-mix transcription](analysis/tail-correction/transcribe-audio16.json).

An audit of the earlier cues also repairs the focus grouping around “But I always”: “But” retains its **35.432 s** onset, releases at **35.72 s**, and the connected group becomes **“I always”** instead of “But I”. This prevents “I” from highlighting roughly a second early. A proposed shift of “But” to 36.21 s was rejected after review of the model confidence evidence; the preceding “call” cue remains unchanged. Separately, new bounded observations and vocal-envelope evidence support “Able” beginning near **80.735 s**, with the preceding “die” release restored to **80.20 s**. [Audit observations](analysis/original-cue-audit/comparison.json) · [Historical v1.0 candidate and selection record](analysis/alignment-decisions.json) · [v1.1 integration builder](scripts/build-revision-cues.ts) · [Current production cues](src/cues.json).

The presentation also changes throughout both complete films to **color-only word/group focus**, with stable spacing and no karaoke underlines, word boxes, pills or bouncing glyphs. Pale-gold active words and silver inactive words remain readable against the continuous full-frame shading. This visual revision preserves the corrected cue times and focus groups and follows the [cinematic default for future productions](https://github.com/ael-dev3/lyrics/blob/main/docs/track-workflow-preferences-and-known-issues.md#visual-language).

The original **193.8535 s** audio timeline and locked AAC remain unchanged. The selected pipeline reconstructs the complete lyric area on **every frame** of both films at **2× delivery dimensions**, including the moving backdrop beneath the words. It replaces that area opaquely in the retained lossless master while keeping the earlier pixels outside it. Both inputs use the same integer **1/60 s** frame clock. A single Lanczos downsample produces the H.264 High **CRF 14 / slow** delivery, with the locked AAC copied unchanged. The original animation remains nominally **24 fps**; added graphics remain 60 fps.

**Revision status:** both v1.1.0 films are rendered and verified. The current [delivery report](evidence/final-verification.md) records their hashes and checks; earlier edition receipts do not verify these revised movies.

## Original creators

**girl in red** — [original song and visual](https://www.youtube.com/watch?v=9256X67IQdQ), [official listening links](https://girlinred.ffm.to/midnightlove-single), [artist website](https://www.worldinred.com), [source channel](https://www.youtube.com/channel/UCwlHDQ83jgF1crd6XXzSmIA).

The original upload, dated 14 April 2020, credits the photograph to **Fabian Fjeldvik**. That photograph credit does not establish separate authorship of every animated element. This project retains the official upload's visual footage and recording. [Source identity, tool versions and input hashes](source.json).

Lyric presentation and additional motion: **Ael / Lyrics workflow**, assisted with **OpenAI Codex (GPT-6 Astra)**. The covers are AI-assisted adaptations using the source visual as a reference; the image tool did not expose its model version. Exact prompts and selected generated originals are retained.

We do not take credit for the original music, lyrics, performance, recording or imagery. The repository's [scoped CC BY 4.0 license](https://github.com/ael-dev3/lyrics/blob/main/LICENSE.md) covers only contributions we have authority to license. It does not cover the original works, complete films or source-derived cover imagery. Source credits do not imply endorsement or rights clearance.

## Timing method and limits

1. Preserve the supplied English reference, normalizing apostrophes and display capitalization, and record confirmed performed additions separately. Decode the source once to a 48 kHz sample clock; derive 16 kHz model inputs without moving timeline zero.
2. Separate a vocal analysis stem with Demucs. Compare full-track transcription with the supplied reference and investigate uncovered vocal passages across the complete recording, including its ending. Forced alignment of a reference cannot prove complete vocal coverage; an automatic-caption `[Music]` label cannot prove an instrumental passage.
3. Use Whisper/stable-ts attention alignment to locate phrases, then refine bounded phrases with MMS-FA on both mix and vocals, an independent English wav2vec2 acoustic encoder, and bounded attention observations. Retain each observation, not just selected timestamps. Reject gap absorption and held-word drift as final timing authority.
4. Use vocal MMS contacts as the primary path, with explicit corrections supported by independent observations and visible vocal-envelope boundaries. Group short connected words without allowing a neighboring word to highlight early. Compare model confidence and waveform evidence before accepting a candidate correction: the 36.21 s “But” proposal was rejected, while the “Able” attack and preceding held-word release were revised.
5. Keep repeated performances independently aligned, including the restored final reprise. Separate waveform-correlation searches of the earlier choruses produced low similarity and did **not** justify copying or shifting their cue timestamps.
6. Check all 151 supplied words plus 34 confirmed repeated words, ordered positive intervals, complete focus-group coverage, presentation windows and nearest-frame conversion. Both editions use the same 38-cue production sequence. Audit the gaps and final vocal release before allowing the closing title to appear.

[Final cues](src/cues.json) · [Historical v1.0 candidates and selections](analysis/alignment-decisions.json) · [v1.1 integration builder](scripts/build-revision-cues.ts) · [Phrase windows](analysis/windows.json) · [Repeated-phrase evidence](analysis/repeated-vocal-correlation.json) · [Timing checks](evidence/timing-checks.json).

**Review limits:** nearest-frame conversion at 60 fps has a half-frame rounding limit of approximately 8.333 ms; this is not a bound on acoustic alignment accuracy. The delivery report records the observed rounding error. Short sung vowels, the second chorus's “In / this” transition, and held/reverberant endings retain uncertainty. The selected 185.4 s ending is an acoustic interpretation, not a certified exact boundary. The record includes model comparisons and waveform observations; completed layout checks and selected decoded-frame review are recorded separately. It does not claim native-listener or human audition of every word. The second chorus near 105.6 s, the sustained endings near 70 s and 119 s, and the restored closing reprise remain useful listening checkpoints.

## Visual and audio design

- Preserve the official moving flame and source grain. The source is nominally 24 fps; its existing motion is sampled on the 60 fps delivery clock. Camera movement, lyric focus, added embers and spectrum graphics are newly rendered at 60 fps. No optical-flow interpolation or recovered source detail is claimed.
- Draw the palette from the source: midnight `#090f24`, navy `#141e3b`, silver `#dce3f1`, gold `#ffcf9c`, blue `#83a6ec` and muted blue-gray `#8491ad`. Cormorant Garamond titles and Space Grotesk lyrics sit above continuous, full-frame shading and soft text shadows. No cue-shaped dark patch appears behind the lyrics.
- Use pale-gold color-only emphasis for active words or connected groups. Keep glyph positions and spacing stable, with no lyric underlines, word boxes or pills, or bouncing glyphs. Preserve readable contrast for both active and inactive text across the full-frame source imagery. The styling change does not alter source timing or the selected semantic groups.
- Keep the shading independent of cue visibility, so it does not pulse at lyric handoffs. The portrait source extends beyond the top edge and fades completely into the background before its lower edge. Check both empty and occupied lyric states for visible seams.
- Fade the opening landscape title out before revealing the persistent header, completing the handoff before the first lyric. Keep the portrait header stable throughout.
- Compose the full landscape and portrait frames separately. Keep the figure and flame prominent, protect the lyric reading area, and leave confirmed instrumental gaps free of filler lyrics. The restored ending remains in the lyric presentation through the selected final held-vocal release at 185.4 s; the closing title begins after 188 s.
- Measure 64 logarithmic stereo-power bands from 20 Hz–20 kHz using zero-phase forward/backward prewarped biquads and centered RMS windows. Show a fixed −60 to 0 dBFS scale. Artistic camera, particle and glow controls do not change measured band values.
- Apply **−2.7 dB fixed gain** before a single 320 kb/s AAC encode. The result measures **−12.34 LUFS integrated** and **−1.79 dBTP**. Preserve the source dynamics without a limiter, time stretching or inserted silence. Eleven waveform-correlation windows show no measured source-to-delivery delay.

[Spectrum analysis](analysis/manifest.json) · [DSP calibration](evidence/dsp-checks.log) · [Artistic motion controls](analysis/motion-manifest.json) · [Audio timing check](evidence/audio-timing-check.json).

## Review and delivery verification

All **152 active/inactive browser layout states** passed: every word fits its reading region and focus does not move glyph rectangles. Visual review covers **48 decoded frames** across both formats, including the corrected early focus/onset, each rendering chunk boundary, all six restored closing lines, the final held-word release and the closing title. Native-resolution stills confirm readable color-only focus and continuous shading without a lyric panel or visible viewport edge in the reviewed samples. These are selected-frame observations, not a claim of continuous or human-listener review. [Recorded observations](evidence/encoded-frame-review.json).

[YouTube layout](evidence/layout-YouTube.json) · [TikTok layout](evidence/layout-TikTok.json) · [Final verification](evidence/final-verification.md) · [YouTube report](evidence/youtube-verification.json) · [TikTok report](evidence/tiktok-verification.json).

Both delivery files passed full strict decoding, 11,632 frames per movie, a timestamp check for every frame on the 60 fps clock, expected dimensions, square pixels, limited-range BT.709, fast-start MP4 layout and identical AAC packets/timestamps in both editions.

The [opening-title repair record](evidence/intro-revision.json) documents a bounded replacement of landscape frames 0–959 before encoding. Only two opening-opacity expressions changed; the first untouched PNG matched byte for byte, and the opacity values agree for every later frame. The finalized source includes this clean title handoff in a normal full render.

The [viewport proof](evidence/viewport-proof.json) compares **16 sampled 2× PNG captures**, eight per aspect ratio, against the corresponding crops of the full revised composition. All 16 sampled RGBA hashes match. The [capture rectangles](src/viewport-config.ts) enclose every lyric cue and the closing title; [RevisionViewport](src/RevisionViewport.tsx) preserves the full-size parent and its gradient coordinates with `willChange: 'transform'`, without shifting the global frame clock. This sampled proof establishes crop equivalence at those frames, not exhaustive equality of the final encoded films or acoustic accuracy.

All **64 sampled lossless YUV 4:4:4 comparisons** passed: 32 checks preserve pixels outside the replacement rectangle and 32 match the new viewport inside it. Samples include render joins, the earlier corrections and the restored ending. [Decoded pixel evidence](evidence/cinematic-pixel-verification.json). The separate final-film checks verify every video timestamp and all 9,088 locked AAC packets and timestamps per film. Current screenshots are extracted from the final cinematic encodes.

## Covers and publishing copy

![Portrait cover at profile size](evidence/profile-150x200.png)

The TikTok profile cover is 1200 pixels wide and 1600 pixels tall, following the [repository cover default](https://github.com/ael-dev3/lyrics/blob/main/docs/tiktok-cover-workflow.md). Its full title, artist and subject are reviewed at 150×200 and under a centered crop removing 5% from every edge. The YouTube cover is reviewed at 320×180. These are local crop checks, not a live platform-preview claim.

[YouTube title](publishing/Midnight-Love-YouTube-Title.txt) · [YouTube description](publishing/Midnight-Love-YouTube-Description.txt) · [TikTok title](publishing/Midnight-Love-TikTok-Title.txt) · [TikTok description](publishing/Midnight-Love-TikTok-Description.txt) · [English captions](publishing/Midnight-Love.en.srt) · [Exact cover prompts](analysis/cover-prompts.json).

## Reproduction

Use Node.js 24+, FFmpeg/FFprobe with libx264, and the exact npm lockfile. Obtain the complete production archive for large source media and finalized observations; the Git snapshot excludes large media and replaceable intermediates.

To rebuild the corrected cue data from the retained decisions, run `node scripts/build-revision-cues.ts`, then `node scripts/check.ts` and `node scripts/captions.ts`. It starts from `analysis/v1.0-cues.json`, applies the documented earlier corrections, and appends the independently aligned ending. `build-cues.ts` is the historical 32-cue generator and does not reproduce v1.1 by itself. `manifest.ts` records hashes and revision counts from the finalized current files.

```sh
npm ci
npm run typecheck
node scripts/check.ts
node scripts/dsp-test.ts
node scripts/layout.ts
node scripts/render.ts --preview --start=104 --seconds=7
node scripts/render-all.ts
node scripts/verify.ts
node scripts/captions.ts
```

The normal full-render path remains valid and renders the revised full `Film` independently of the earlier edition's caches. It uses two segments per format at **2× final dimensions**, lossless PNG frames and lossless H.264 4:4:4 intermediates, followed by a single Lanczos downsample to H.264 High CRF 14 / slow and a copy of the locked AAC. This is the portable reproduction path when the earlier lossless masters are unavailable.

The selected revision route, [render-cinematic.ts](scripts/render-cinematic.ts), reuses retained v1.0 lossless masters and reconstructs the full opaque lyric rectangle at every global frame. The rectangle includes its background, so the old typography and underlines are replaced together with the backdrop beneath them. The full-size parent preserves the original layout and gradient coordinate system. Four lossless viewport segments per format are joined without re-encoding, then composited in YUV 4:4:4 at exact integer frame positions before the same single delivery downsample. Frozen-input checks, safe-area containment and the 16-sample full-composition comparison gate this route. Final decoded-pixel and media QA remain separate requirements.

With the previous lossless masters available at the paths required by the script, the revision route begins with:

```sh
node scripts/benchmark-viewport.ts --proof-only
node scripts/render-cinematic.ts
```

After lossless compositing and pixel verification, delivery encoding uses `node scripts/encode.ts` and `node scripts/encode.ts --portrait`, followed by `node scripts/verify.ts`. The final masters and decoded-frame review passed the recorded gates. Publication uses a separate download-and-hash check after upload. Render cancellation is propagated to child processes.

To regenerate audio analysis:

```sh
ffmpeg -i source/soundtrack.opus -ar 48000 -ac 2 -f f32le analysis/audio.f32
ffmpeg -i public/soundtrack.m4a -af atrim=end_sample=9304968 -ar 48000 -ac 2 -f f32le analysis/audio-delivery.f32
node scripts/analyze.ts
node scripts/motion.ts
node scripts/audio-check.ts
```

For model experiments, install the versions in [SOFTWARE.md](SOFTWARE.md), set `ALIGN_PYTHON` to that environment's Python executable, and provide the 16 kHz `audio16.wav` and `vocals16.wav` files. `align-models.ts` supports `full`, `whisper`, `mms` and `wav2vec` modes. Finalized observations and cues are the release authority; new model inference requires review before replacing them. Python is confined to pretrained interfaces; cue selection, DSP, animation, rendering and verification are authored in TypeScript.

Prepare model inputs and reproduce the recorded candidate passes with:

```sh
"$ALIGN_PYTHON" -m demucs --two-stems=vocals -n htdemucs -o analysis/stems source/soundtrack.opus
ffmpeg -i source/soundtrack.opus -ar 16000 -ac 1 analysis/audio16.wav
ffmpeg -i analysis/stems/htdemucs/soundtrack/vocals.wav -ar 16000 -ac 1 analysis/vocals16.wav
ffmpeg -i analysis/vocals16.wav -f f32le analysis/vocals.f32
node scripts/align-models.ts full audio16
node scripts/align-models.ts full vocals16
node scripts/align-models.ts whisper vocals16
node scripts/align-models.ts mms vocals16
node scripts/align-models.ts mms audio16
node scripts/align-models.ts wav2vec vocals16
```

Source-video remuxing and the fixed-gain delivery audio are reproducible separately:

```sh
ffmpeg -i source/original.mkv -map 0:v:0 -c copy public/source-video.webm
ffmpeg -i source/soundtrack.opus -af volume=-2.7dB -ar 48000 -ac 2 -c:a aac -b:a 320k -movflags +faststart public/soundtrack.m4a
```

Keep the archived AAC and finalized observations when reproducing the released edition. Regenerating them may change hashes or model estimates and requires new verification.

## Archive and publication

The [v1.1.0 release](https://github.com/ael-dev3/lyrics/releases/tag/midnight-love-v1.1.0) supersedes the incomplete ending in v1.0.0. Its delivery set includes both films, original source video, covers, publishing copy, corrected captions and a complete production ZIP. The ZIP combines the committed source snapshot with original media, source-audio extraction, video remux, locked AAC, analysis stems and selected final proof frames. `SOURCE-REVISION.txt`, `MANIFEST.json` and `CHECKSUMS.sha256` identify its source revision and file contents.

Git keeps the editable TypeScript project, finalized observations, fonts and notices, generated cover originals, concise publishing material and sanitized evidence. Replaceable decoded PCM, model weights, npm dependencies, temporary download URLs, obsolete previews and lossless rendering caches are excluded from the archive. Final delivery verification checks the frozen composition inputs, strict full decoding, audio packet identity, source timing, layout, dimensions, color tags and fast-start metadata.

Publication scripts are `stage-repo.ts`, `package.ts` and `verify-publication.ts`. The last compares every release asset against bytes downloaded from GitHub and verifies the release tag, public README and displayed final-frame image. `desktop.ts` copies the publishing kit to an explicitly supplied local destination and verifies each copied media hash.

Release verification downloads every published asset from GitHub, compares SHA-256 hashes with the local release set, and checks the release tag, public README and displayed final screenshot. The post-upload receipt is committed separately from the immutable source snapshot packaged in the release; it records the exact source and README commits it verified. The v1.0.0 receipt applies only to that earlier edition.

**Publication verified:** all **16 GitHub release assets** were downloaded and matched their local SHA-256 hashes. The release tag, public root README and final-frame screenshot also matched the recorded source commit. The [publication receipt](evidence/release-upload-verification.json) identifies those assets and the exact commits checked. The [Desktop receipt](evidence/desktop-verification.json) records the 13 delivered files and verified hashes.
