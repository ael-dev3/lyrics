# Phantom Liberty — lyric film

**Dawid Podsiadło · P.T. Adamczyk · English lead and backing vocals**

Status: owner-accepted complete-recording v2, with verified native-wide and portrait masters and a hash-verified local upload kit. [Final verification](evidence/final-verification.json) · [Desktop delivery receipt](evidence/delivery-receipt.json).

![Actual decoded native master with simultaneous lead and backing focus](evidence/final-wide-78.061317.jpg)

*Decoded final MP4 frame 4,679 at 01:18.061317; original picture PTS 01:18.044633. [Exact final-frame provenance](evidence/final-wide-still.json). The earlier [browser still](evidence/browser-still.json) remains preproduction history. Neither image is listening evidence.*

The [official Cyberpunk 2077 music video](https://www.youtube.com/watch?v=u15tEo0wsQI) remains the picture and soundtrack. Its crimson holographic figures and light filaments inform the added typography and measured audio response. Every lead and backing occurrence has its own source-clocked events; simultaneous voices retain separate, stable reading blocks.

## Start the complete preview

Acquire the exact recording identified in [source/recording.json](source/recording.json) as `public/source.mp4`. Keep its original zero and audio. The server refuses an unrelated or edited source, missing timing or mismatched measured features.

```sh
npm ci
npm run check
npm run build
node scripts/preview-server.ts
```

Open `http://127.0.0.1:4334/`. Native wide preserves the complete 1920×816 active picture after removing only the source’s baked black margins. Portrait keeps the complete moving picture in a sharp inset with a dim, defocused live extension; it avoids cutting faces and opposing characters with an extreme vertical crop. Both offer seeking, cue jumps, reduced-speed playback, source comparison and recovery.

## Inputs and boundaries

- [Original supplied text](source/lyrics-supplied.txt) remains separate from the performed inventory and selected events.
- [Recording identity](source/recording.json) records the unchanged AAC decode, native 30000/1001 picture cadence and 44,100 Hz source audio.
- [Canonical timeline](public/timeline.json) stores inclusive starts and exclusive ends as integer source samples. English words reference their own performed event.
- [Selected-event record](source/selected-words.json) preserves the rebuilt samples, rejected alternatives, uncertainty and separate vocal ownership. The 312 supplied words plus one wordless-vowel candidate form 60 cues.
- [Measured features](public/audio-features.json) contain stereo-power RMS, transient rise and 24 frequency-band powers. These measurements control light; they do not label sung words or supply a beat map.
- [Scene](src/scene.ts) and [player](src/player.ts) keep picture PTS separate from the finer soundtrack clock used for words. Glyph positions remain fixed; active words receive a pale warm focus and localized crimson diffusion.

Model observations, original-signal inspection, technical checks, owner listening acceptance and render approval are separate evidence. Integer timestamps provide deterministic presentation, not proof of perceptually exact milliseconds. The owner reported completion of the current preview review and authorized production; granular listening fields remain unlogged. [Owner acceptance](evidence/owner-review.json) · [Approved inputs](evidence/preview-inputs.json) · [Render authorization](evidence/render-authorization.json).

Pending acceptance flags in earlier browser, timing and technical reports preserve pre-acceptance history. The separate current owner/authorization records establish the later production decision; those older reports are not rewritten as listening evidence.

The rejected first map is retained only in local diagnostic history. The v2 rebuild passes its local checks, all 120 cue layouts and 1,878 active-event states in both formats. The real browser was checked for native and portrait motion, seeks, half-speed playback, complete backing blocks, held focus, muted source comparison, recovery and the audio tail. Masked backing word boundaries, sixteen chorus releases and several lexical variants retain explicit uncertainty after acceptance. [Timing method](TIMING-METHOD.md) · [Signal/model review](evidence/timing-review.json) · [Shared-scene still proof](evidence/proof-stills.json) · [Browser transport evidence](evidence/browser-review.json).

## Production and local upload kit

The accepted scene is exported at 60000/1001 (approximately 59.94) fps: YouTube 1920×816 and TikTok 1080×1920. Original pictures retain their native cadence; the soundtrack remains an AAC stream copy. Both complete masters passed full decode, sampled source-picture correspondence over the complete duration, all 20,862 picture timestamps, original AAC packet/decoded-sample identity, 939 active-glyph states per format and 58 wrong-next-word controls per format. All Desktop payload checksums passed. [Exact process and reusable lessons](PRODUCTION-NOTES.md).

| Platform | Complete film | Cadence | Bytes |
| --- | --- | --- | --- |
| YouTube | 1920×816 | 60000/1001 fps | 159,388,844 |
| TikTok | 1080×1920 | 60000/1001 fps | 114,448,127 |

Both last 348.0477 seconds and preserve 15,348,736 original decoded stereo samples. [Decoded wide/portrait proof](evidence/final-film-still.json) · [Encoded scene checks](evidence/encoded-scene-review.json) · [Covers, publishing copy and caption source](publishing/README.md).

Source media, analysis caches, machine-specific model adapters, dependencies and generated browser bundles stay local. No platform upload or public binary release is part of this local delivery.

## Credits

The official upload credits music to P.T. Adamczyk and Dawid Podsiadło, lyrics and vocals to Dawid Podsiadło, and orchestration and piano to Marcin Przybyłowicz. Original film: CD PROJEKT RED and the production contributors listed by the [Cyberpunk 2077 upload](https://www.youtube.com/watch?v=u15tEo0wsQI). Added lyric timing, typography and audio visualization are project-specific. [Space Grotesk](https://github.com/floriankarsten/space-grotesk) is used under its [bundled SIL Open Font License](public/fonts/SpaceGrotesk-OFL.txt).
