# Leave It On — production and delivery record

## Accepted preview and scope

This edition uses `preview-v2-pr375`, the complete local browser film accepted by the owner on 2026-09-27. Its frozen presentation/input digest is `cdb2e50d74be6be9c1144a78473bfdd6f6387430184592f4467d1da3aa768e24`; the original recording SHA-256 is `376926ae77af41789ac620685dd15b5e1515e3777aece65e964463277e5cfe44`. [`review/owner-acceptance.json`](review/owner-acceptance.json) binds authorization to this song and revision, both 16:9 and 9:16 renders, a Desktop publishing kit, and a lyrics-repository release. The owner clarified that YouTube and TikTok publishing copy should be delivered as files; no video-platform posting is requested.

This is the repo's narrowly scoped `owner-approved-preview` production path for an English-only film. It does not assert an independently recorded every-word listening pass. [`analysis/candidate-sync-audit.md`](analysis/candidate-sync-audit.md) preserves unresolved acoustic model spread, disputed wording, repeats, echoes and outro boundaries. The standard granular synchronization gate remains closed. The accepted candidate map is frozen for this edition, so the final film's highlight fidelity can be checked against that map without treating model candidates as a perceptual ground truth.

## From supplied material to accepted picture

The supplied `Leave It On.m4a` was inspected as an Opus recording in an `.m4a` container. The source packet stream was remuxed for browser playback without changing packet payloads. Full-recording measurements produced the RMS/attack features and 48-band spectrum; several independent recognition and forced-alignment candidates informed the 63-cue, 343-word map. The source inspection, disagreement inventory and open questions remain in [`analysis/`](analysis/). No boundary was inferred from a visualizer peak alone, and no model candidate is described as an actual-audio listening verdict.

The [asset ledger](ASSETS.md) binds the picture to Warpkeep PR #375 commit `75934520a8dc295c8b68d4c8c197785299e2ff0b`, with nine selected assets and their hashes in [`source/asset-provenance/pr375/manifest.json`](source/asset-provenance/pr375/manifest.json). The [storyboard](STORYBOARD.md) and [project README](README.md) document the castle, rooftop guardian, mountains, lyric inscription, two measured instruments, source-time magic, and physical mountain sign. The game meshes and rig remain source assets; the film's lighting, particles, typography, camera and sign are authored presentation. The channel link is `https://farcaster.xyz/~/channel/warpkeep`.

The complete 16:9 and 9:16 browser preview, revision `preview-v2-pr375`, was the creative review surface. Its [`evidence/`](evidence/) contains native stills and interaction checks; the accepted picture is bound by the frozen input digest above. The owner accepted that revision and requested both renders, the Desktop handoff and repository upload. The candidate timing audit records the narrower limit of that acceptance.

## Render and parity method

The production adapter uses the same `src/scene.js`, `src/core.js` and `src/typography.js` as the accepted browser preview. `review/render.html` loads the exact approved fonts and sets scene state to frame `n / 60` seconds. `scripts/render-production.mjs` accepts native PNG frames over a loopback-only render channel, in frame order, and streams them to FFmpeg. Every frame is generated from source time; no advancing wall-clock simulation or interpolated audio timing is part of the composition. The 16:9 canvas is 1920×1080; the 9:16 canvas is 1080×1920.

The original audio remains Opus at 48 kHz stereo in the supplied `.m4a` source and packet-preserving WebM preview remux. The posting MP4 uses high-bitrate AAC for platform compatibility. Separate Matroska files retain original Opus packets with the same visual stream. All final outputs and a source archive are release assets rather than large blobs in ordinary Git history.

Reproduction commands from this directory, with the frozen local soundtrack and assets present:

```sh
npm ci
npm run check
node scripts/render-production.mjs --proof-still --format landscape --at 119.6
node scripts/render-production.mjs --proof-still --format portrait --at 105
node scripts/render-production.mjs --diagnostic --format landscape --at 119.6 --seconds 2
node scripts/render-production.mjs --production --format landscape
node scripts/verify-production.mjs --format landscape
node scripts/render-production.mjs --production --format portrait
node scripts/verify-production.mjs --format portrait
```

`npm run render` remains the ordinary granular-review gate and is intentionally closed. The explicit production command requires the exact frozen input digest, current owner acceptance, both-format parity record, and renderer digest; the accepted preview is the scope of this exception. A changed scene, source, renderer or fonts requires fresh review and parity evidence.

Before full capture, single-frame renders at 119.600 s (wide) and 105.000 s (portrait) were compared with browser captures at the same exact native dimensions. Per-channel RGB mean absolute error was 1.237/1.217/1.092 for wide and 1.862/1.622/1.332 for portrait, on a 0–255 scale. The first proof exposed a font fallback; the adapter explicitly loads the approved Space Grotesk and Cormorant faces before layout. A two-second wide diagnostic encoded 120/120 frames at 60 fps in approximately six seconds. Its H.264 image used square pixels, yuv420p and tagged BT.709 primaries, transfer and matrix. AAC muxing decoded cleanly. A test Matroska copy retained the original Opus packet hash list.

## Source and archive boundary

The committed source tree holds code, lyric candidates, provenance, fonts, tests, artwork evidence and production notes. The release source archive is built from the exact merged source commit and supplements only the ignored, frozen media inputs: the original audio, the packet-preserving preview remux, PR375 GLBs/PNG and superseded local source assets that remain part of the frozen identity. Dependencies, model weights, analysis PCM/stems, browser profiles, proofs, and redundant intermediates are excluded. The archive, Desktop copies and remote release assets receive independent SHA-256 inventories.

## Verification records

[`evidence/README.md`](evidence/README.md) records the accepted preview checks. [`evidence/final-verification.json`](evidence/final-verification.json) holds sanitized byte identities and final-film technical checks for both formats. Desktop copy verification and remote release-byte verification are separate delivery/publication records. The publishing kit includes separate YouTube and TikTok copy, native artwork and the TikTok profile crop.

The wide final MP4 passed strict full video/audio decode at 1920×1080, 60 fps, 16,414 frames, 273.566667 s of video, square-pixel yuv420p and BT.709 tags. Its 48 kHz stereo AAC stream is 273.573 s. The companion MKV passed full decode and its 13,679 Opus packet payload hashes match the original supplied recording. The wide MP4 SHA-256 is `e6d61911e59322747a42c51fa0574f1381d912ad87c8fa8172cb373e2ca41d0c` (288,869,749 bytes); the archival MKV SHA-256 is `fca97461aa685173e973ea398e34a83d1a04a87b55a4704b8c54e24d494ea415` (282,129,554 bytes).

Independent decoded-picture inspection covered the opening, several early/middle/late lyric moments, the final sung phrase at 268.200 s, and the lyric-free last frame at 273.550 s. Those selected samples were readable, contained the castle/guardian/sign and showed no blank or stale final picture. The [wide final lyric still](evidence/final-landscape-268.200.png) and [last-frame still](evidence/final-landscape-273.550.png) are copied directly from the encoded MP4. Sample-level correlation of its decoded AAC against the original source at 10.000, 119.600 and 263.000 s found **zero sample lag** at all three points (correlations 0.999982, 0.999700 and 0.999917). This verifies the posting audio clock at sampled positions, not phonetic placement of every candidate word.

The portrait final MP4 passed the same strict full decode at 1080×1920, 60 fps and 16,414 frames, with 273.566667 s of video and 273.573 s of AAC. Its square-pixel yuv420p BT.709 tags passed. The companion MKV passed full decode and retained all 13,679 original Opus packet payloads. The portrait MP4 SHA-256 is `fc41920d20e66ae708ccd2c1b62d4da7b73a3b6c7f347aa9ec0066d75185a56c` (301,626,325 bytes); its archival MKV SHA-256 is `0b7392edc873ce1d77c03d55f910eb86bbe38eb3426b63f33bc082a3c099d5e2` (294,870,865 bytes).

Ten decoded portrait samples covered the opening, middle phrases, last sung phrase at 268.200 s and clean final frame at 273.550 s. The lyric fits the 9:16 composition at the sampled points, with the mountain sign, guardian and instruments visible. [Portrait word-focus still](evidence/final-portrait-105.000.png), [final-phrase still](evidence/final-portrait-268.200.png) and [last-frame still](evidence/final-portrait-273.550.png) are exact MP4 decodes. The same three source-to-AAC comparisons also found **zero sample lag** for the portrait file, with the correlations above. The full file and sampled checks establish the encoded delivery properties without closing the every-word listening audit.

## Desktop handoff and repository publication

The project source and final-film evidence entered `main` through [PR #54](https://github.com/ael-dev3/lyrics/pull/54). A final packager check then caught a local absolute path in the generated source archive; [PR #55](https://github.com/ael-dev3/lyrics/pull/55) removed that leak and added a regression check before the handoff was rebuilt. Both pull requests were merged. The immutable source tag [`leave-it-on-warpkeep-v1.0.0`](https://github.com/ael-dev3/lyrics/releases/tag/leave-it-on-warpkeep-v1.0.0) points to their resulting source commit `4c94cd871c5765ccfd71a94cbfc32fb9336953ed`.

The Desktop folder **`Leave It On - Warpkeep`** contains `YouTube`, `TikTok`, and `Source & Verification`. It has the two posting MP4s, two original-packet Opus archival MKVs, a YouTube thumbnail, two TikTok covers, title/description/caption/tags text, source ZIP, and manifests and checksum records. The source ZIP is `Leave-It-On-Warpkeep-Source-4c94cd871c57.zip`, 36,428,869 bytes, SHA-256 `f1003969fb3bc211abf039abf23748d35441dce256ce216193e2f8b506eea5a1`. Its exact committed source tree was supplemented with hash-checked, ignored frozen inputs. The ZIP does not include this later publication receipt, because the receipt could only be made after publication.

The [published GitHub release](https://github.com/ael-dev3/lyrics/releases/tag/leave-it-on-warpkeep-v1.0.0) has 17 individually uploaded assets. After publication, all 17 were downloaded again and compared byte-for-byte by SHA-256 with the Desktop package and GitHub's asset digests. Every comparison passed; the release is public rather than a draft. The [publication receipt](evidence/release-upload-verification.json) records each asset's URL, size, digest and three-way result. The repository's public project README and hero image were checked separately. Prepared YouTube and TikTok copy is part of the kit; no post to either video platform is claimed.
