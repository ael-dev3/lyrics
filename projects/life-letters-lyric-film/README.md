# Never Get Used To People — Life Letters

**Russian lyrics, Argentinian Spanish meanings and a synchronized pronunciation aid in an expansive landscape film.** Equally prominent Russian and Spanish lyrics sit beneath the original moving footage. Pink and warm-gold focus follows the voice, above a wide 64-band spectrum.

![Final encoded film at 01:03.800, with Russian, pronunciation and Argentinian Spanish](evidence/final-phone-63.8.png)

*Decoded final movie frame, reduced to 874×402 for phone-size readability review. Original song and source video: [Never Get Used To People — Life Letters (Long Version)](https://www.youtube.com/watch?v=7hUbvIJ0Hnw). Added lyric presentation by Ael, assisted with Codex.*

[Download v1.0.0](https://github.com/ael-dev3/lyrics/releases/tag/life-letters-v1.0.0) · [Pronunciation guide](publishing/Pronunciacion-para-Argentina.md) · [Verification and limits](evidence/final-verification.md) · [Software and source credits](SOFTWARE.md)

[Downloaded-asset verification](evidence/release-upload-verification.json) · [Archive integrity and clean extraction](evidence/package-verification.json) · [Asset inventory](release-assets.json). These publication records are added after the immutable release source commit.

## Delivery

| Item | Specification |
| --- | --- |
| Film | 2348×1080 landscape, 60 fps, 15,692 frames; 261.533333 seconds |
| Picture | H.264 High level 5.1, yuv420p, limited-range BT.709 SDR, fast-start MP4 |
| Soundtrack | Complete 261.526-second recording; AAC LC stereo 48 kHz, copied from the locked soundtrack |
| Typography | Russian and Spanish: 82 px; word-linked pronunciation: 44 px |
| Cue map | 42 display cards, 231 contextual word entries, 147 focus events and 23 character holds |
| Captions | Separate Russian, Spanish, pronunciation and combined three-layer SRT files |
| Editable archive | Committed source, dependency lock, fonts, original extracted streams, render media, acoustic observations and final QA |

[Film](https://github.com/ael-dev3/lyrics/releases/download/life-letters-v1.0.0/LIFE-LETTERS-RU-ES-AR-LANDSCAPE.mp4) · [Editable project](https://github.com/ael-dev3/lyrics/releases/download/life-letters-v1.0.0/Life-Letters-Editable.zip) · [SHA-256 checksums](https://github.com/ael-dev3/lyrics/releases/download/life-letters-v1.0.0/CHECKSUMS.sha256)

The composition is intended for a phone held horizontally and also works as a wide desktop film. Encoded phone-size frames were reviewed; **physical iPhone playback has not been tested**. Video outlasts the audio by approximately 7.33 ms to finish its last frame, without inserting audio.

## Visual and language decisions

Russian and Argentinian Spanish have equal size and weight, strong contrast and linked timing. Spanish retains natural word order and follows corresponding meanings rather than Russian syllables. The adaptation uses voseo and Rioplatense wording, including “Besame,” “vos” and “acá.”

This edition explicitly includes a third pronunciation layer for Spanish speakers: a scoped exception to the repository's pronunciation exclusion and usual Russian/English pairing. It does not change other editions or general production defaults.

The pronunciation key marks stress, vowel reduction and selected soft consonants. It distinguishes unfamiliar Russian sounds and uses `ia` to avoid the Rioplatense `y/ll` sound. Its clock is shared with Russian. The [editable dictionary](source/pronunciation-es-ar.json) and [Spanish guide](publishing/Pronunciacion-para-Argentina.md) record conventions and references. This is a practical reading aid, not lossless IPA or native-speaker certification.

Stable glyphs receive color and luminance emphasis. The original 25 fps footage keeps its cadence on the 60 fps graphics timeline. Its 1920×816 active image is preserved; baked black bars are excluded from the framing. Graphics fade between 232 and 234 seconds, leaving the complete source closing credits unobscured.

`ECO VOCAL` marks five passages made from reused vocal fragments. Dim text supplies context; only the audible fragment receives focus. Supported open-vowel portions illuminate the Russian letter and matching phonetic accent together; ambiguous transformed timbres receive whole-word focus. A measured 5 ms vocal-energy envelope controls the glow.

## Timing and complete-recording review

The original extracted Opus is the audio authority. The supplied Russian text is retained separately from the [meaning map](source/semantic-map.json), raw model observations and [final render cues](src/landscape-cues.json).

The study combines HTDemucs isolation, full-track large-v3-turbo recognition, bounded full large-v3 recognition on mix and vocals, MMS forced alignment, unconstrained CTC emissions and waveform cross-correlation. Continuous alignment blocks prevent adjacent phrases from being pulled into the same audio. Raw recognition files are **observations, not approved lyrics**: hallucinated subtitle-credit names and unrelated text over processed loops are rejected.

The [composition audit](evidence/composition-audit.json) classifies the complete recording, including gaps and the ending. The first accepted complete phrase begins at 9.14 seconds; earlier ambiguous glitches receive no invented words. Quiet vocal gaps rule out falsely early alignment candidates. The rays phrase returns near 93.61, 103.93 and 114.25 seconds. A near-10.3226-second edit period guides searches but does not establish that every cycle contains a lyric.

Waveform fingerprints distinguish full words from reused vowel cuts. The 73.4–74.2-second template recurs at 135.3355 seconds with correlation 0.9221 and at 202.43225 seconds with correlation 0.9895. [Repetition study](analysis/repetition-study.json) · [Loop fingerprints](analysis/loop-fingerprints.json). Correlation supports sample reuse; it does not alone identify a phoneme.

The performed map adds the ending “на воде” / “sobre el agua” beyond the supplied text, based on bounded alignment and unconstrained emissions. This addition and difficult processed-vocal boundaries remain model- and signal-based decisions without independent native-listener confirmation. The cue builders make the selections explicit; decimal precision is not an acoustic error bound.

## Soundtrack and visualizer

Delivery applies a fixed −3 dB gain to the original mix and one AAC encode, with no time stretching, silence insertion or dynamic processing. Measured integrated loudness changes from −6.9 to −9.9 LUFS and true peak from +1.7 to −0.9 dBTP. Analysis vocals are not mixed into the film.

An alternative YouTube AAC was 36.3125 ms later than the chosen Opus across six checked windows and is not used. An early preview's audio path also added an offset. The final renderer renders picture muted and stream-copies the complete locked AAC. [Encoded and decoded audio hashes](evidence/audio-identity.json), matching starts and sample durations verify that final assembly adds no offset or drift relative to that lock.

The spectrum uses 64 logarithmic bands from 20 Hz to 20 kHz, forward/backward band-pass filtering and centered, frequency-dependent RMS windows. Values are filtered stereo RMS dBFS on a fixed −60 to 0 scale, without per-frame normalization. [Filter coefficients, units and time support](analysis/manifest.json) are retained. Zero-phase filtering removes causal delay, not the finite measurement window; artistic glow is separate from the measured spectrum.

## Reproduce

Extract `Life-Letters-Editable.zip` into an empty directory. Runtime media are omitted from ordinary Git history. `SOURCE-REVISION.txt` identifies the committed source; `PACKAGE-CHECKSUMS.sha256` hashes all packaged files other than itself. The final MP4 is a separate download.

Use Node.js 24, FFmpeg/FFprobe and the pinned dependencies. From the extracted project directory:

```sh
npm ci
npm run typecheck
node scripts/build-core-cues.ts
node scripts/build-landscape-cues.ts
node scripts/export-delivery.ts
node scripts/render.ts --stills
node scripts/render.ts --full
node scripts/verify-final.ts
```

Stored cues and signal data are sufficient to render. The cue-build commands reproduce the stored editorial map. Export regenerates the guide and SRTs under `output/`; committed copies are in `publishing/`. Rendering checks actual browser text bounds at cue changes. Final verification checks decoded cadence, color, dimensions, MP4 layout and compressed/decoded audio identity. New renders need fresh visual review.

Optional analysis regeneration is described in [SOFTWARE.md](SOFTWARE.md). Models, dependencies, raw decoded audio, caches and superseded previews are excluded from the archive. Original extracted streams and their identity evidence are included.

To package a new release from a clean committed checkout, run `node scripts/package-source.ts` from this directory with its four media inputs present. It archives the committed project tree, verifies media hashes and records the revision and per-file checksums. The publication receipt belongs in a later commit because it verifies the archive's own uploaded bytes.

## Credits and AI assistance

**Music, Russian lyrics, recording and immediate source upload: Never Get Used To People.** [Source video](https://www.youtube.com/watch?v=7hUbvIJ0Hnw) · [Artist links from its description](https://linktr.ee/ngutp). Individual underlying footage credits have not been independently established here; the source closing credits remain intact.

Ael's contribution is the added lyric presentation, Argentinian Spanish adaptation, pronunciation aid and workflow, assisted with OpenAI Codex. AI tools assisted code, translation drafting and vocal analysis. No new song or original source footage was generated for this edition. No artist endorsement is implied.

The [repository CC BY 4.0 scope](https://github.com/ael-dev3/lyrics/blob/main/LICENSE.md) applies only to contributions it has authority to license. Original music, lyrics, recording and footage are excluded; the finished audiovisual film is not a wholly CC BY 4.0 asset. Fonts, software and models retain their respective licences.
