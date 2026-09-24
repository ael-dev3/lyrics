# I'll Change for You — agent handoff

## Start with the current source and rules

Read repository [AGENTS.md](../../AGENTS.md), [preview before render](../../docs/preview-before-render.md), [cinematic presentation](../../docs/cinematic-lyric-workflow.md), [scene-integrated visuals](../../docs/scene-integrated-visuals.md) and this project's [overview](README.md). The English-only preview revision received full-song listening review and explicit production authorization before two complete exports. Later material changes still require affected review.

| Identity | Current value |
| --- | --- |
| Source | [Mitski — I'll Change for You](https://www.youtube.com/watch?v=BPy1NIiKKW0) |
| Local source | `public/source.mp4`, ignored by Git; SHA-256 `5af79acdcb8d708a6d53f901dee814f2a8038e2c775e806635e4286a57d01309` |
| Picture | 1440×1080 **4:3**, 4,709 H.264 frames at approximately 23.976 fps; preserve the complete frame |
| Sound | Stereo AAC, 44.1 kHz, 8,664,064 samples / 196.464036 s; picture is about 60 ms shorter |
| Language | English only; 25 display lines, 118 individual word IDs |
| Preview | Full source video/sound, Original 4:3 and composed 9:16, source-time word focus, measured edge print, small local “change” ink offset |
| Review and approval | [Owner-attested review and production authorization](evidence/render-authorization.json) for the frozen acoustic revision; the timeline's older draft label is part of that immutable preview input |
| Final films | 4:3 SHA-256 `4b3076311ccdf60e9996a602bb26d9670f3f5672d45125545bd8f0e85ba8bc04`; 9:16 SHA-256 `ca45673173f7af3886e66a8a18c22f12276f6f587c0b283b4d1a3140eba12f64` |

## Reproduce the complete preview

Check the local source against [source/media-manifest.json](source/media-manifest.json) first. From this project directory:

```sh
shasum -a 256 public/source.mp4
npm run preview
```

Open <http://127.0.0.1:4326/>. The server listens on loopback, supports media range requests and must remain running during review. If another process owns 4326, run `PORT=4327 npm run preview` and use the new port. The player starts paused at zero; it supports direct seek, line jumps, 1×/0.75×/0.5×, both layouts and Restore picture. Example checks: [opening](http://127.0.0.1:4326/?t=8&format=landscape), [first refrain](http://127.0.0.1:4326/?t=78&format=portrait&speed=0.5), [later verse](http://127.0.0.1:4326/?t=123&format=landscape), [closing refrain](http://127.0.0.1:4326/?t=166&format=portrait).

Verify a nonblack, moving source frame and audible soundtrack after fresh load, forward/backward seek, pause/resume, layout change and Restore picture. Check the final vocal, the original ending and the picture hold through the shorter video tail. An advancing media clock, poster or decoded offline frame cannot substitute for browser picture inspection. The entire intended composition must stay present in this review preview.

Regenerate analysis only from the exact matching source. `scripts/analyze-audio.py` needs Python with NumPy, FFmpeg and FFprobe; `scripts/analyze-picture.py` needs Python, FFmpeg and FFprobe:

```sh
python3 scripts/analyze-audio.py
python3 scripts/analyze-picture.py
```

Audio output is `public/audio-features.json` plus the binary; picture output is `public/picture-tones.json`. Each has an audit under `evidence/`. The measured 64-band source spectrum and 2 Hz picture-tone observations are separate from the authored display transform. Rerunning them against another source or changing their algorithms changes preview identity and requires affected review.

## Files and review state

| File | Purpose |
| --- | --- |
| `source/media-manifest.json` | Exact local media hash, picture geometry, streams and durations |
| `source/lyrics-supplied.txt` | Supplied English text, kept separate from acoustic decisions |
| `src/timeline.json` | Revised preview line and word IDs, sample indices and display wording |
| `evidence/alignment-candidate-preliminary.json` | Preliminary model-assisted timing basis and uncertainty; not a listening certificate |
| `evidence/alignment-revision-2026-09-24.json` | Old and revised interval ledger from independent vocal/CTC/spectral comparison; not a listening certificate |
| `evidence/alignment-audit.json`, `evidence/timing-review.md` | Six bounded model observations per word and the actual-audio review priorities |
| `evidence/browser-preview-review.md` | Sampled browser picture/control checks and their limits |
| `src/preview-core.js` | Source-time cue/word lookup, feature interpolation and frame/paused-refresh logic |
| `src/player.js`, `review/index.html` | Complete browser transport, source picture, lyric composition, formats and recovery |
| `src/edgeprint.js` | Deliberately modest 28-mark artistic mapping of measured audio in a picture edge |
| `public/audio-features.*`, `evidence/audio-features-audit.json` | Raw 60 Hz band data, units, source hash and reproducibility checks |
| `public/picture-tones.json`, `evidence/picture-tone-audit.json` | Broad source brightness samples, switch proposal and known limits |
| `scripts/render-gate.mjs`, `evidence/render-authorization.json` | Fail-closed render entry bound to review scope, explicit approval and preview hashes |
| `scripts/production-scene.mjs`, `scripts/render-production.mjs` | Same-clock 4:3 and 9:16 scene overlays, original source picture and copied AAC |
| `scripts/verify-render.py` | Independent stream, audio, picture, black-frame and exact-frame checks |
| `scripts/assemble-posting-kit.py`, `publishing/` | Source-derived covers, platform copy, captions and checksum manifest |

The recorded review covered the full track at normal speed, uncertain connected short words and held endings at reduced speed, and both formats. Each performed repeat and final vocal belongs to the locked map. The 24 September acoustic revision moved the first refrain’s “For” behind a vocal pause and corrected short-word starts and held endings. Preserve the original review scope and frozen input hashes without inventing per-cue telemetry.

The current guarded production path accepted the [review and authorization record](evidence/render-authorization.json) before any full-film capture. The browser and renderer were compared at matching source times and all 25 cue line breaks in both formats; see [the parity review](evidence/render-parity-review.md) and [production lessons](PRODUCTION-LESSONS.md). Production is a separate entry point:

```sh
npm ci
npm run check
npm run render:production -- --format landscape
npm run render:production -- --format portrait
npm run render:parity-stills
python3 scripts/verify-render.py --report evidence/final-verification.json --contact-dir evidence/final-contact-sheets --reference-dir output/qa-reference
```

The first two commands reproduce the MP4s only from the exact locally available source and approved preview input hashes. `output/` is ignored by Git; use the project README and delivery manifest for the verified media identities. Material changes to source, lyric inventory, word timing, scene or format composition require affected re-review and a new authorization. Repository source updates follow the checked-and-merged GitHub handoff; public media release and video-platform posting are separate actions.
