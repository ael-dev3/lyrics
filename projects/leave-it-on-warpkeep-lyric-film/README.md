# Leave It On — Warpkeep lyric preview

**English · complete recording · 16:9 and 9:16 browser compositions · `preview-v2-pr375`**

A real-time lyric film set around Warplet's Watch, using the exact castle, rooftop guardian and landscape from [Warpkeep PR #375](https://github.com/ael-dev3/Warpkeep/pull/375). Bright English phrases appear as a magical inscription above the forecourt. The same measured music spectrum drives luminous stone resonators and a circular rune field behind the guardian. Cyan and violet gate light, tower ribbons, warm practical lights and a physical mountain landmark give the fantasy setting its electronic treatment.

The entire supplied recording is playable. **All 343 acoustic word candidates still require complete actual-audio review, and production authorization remains closed.** This is a review preview; no full film capture, final encode or public media release is recorded. Source identity, automated behavior, sampled visual inspection, perceptual synchronization and production approval are separate evidence categories.

[Start and reproduce](WORKFLOW.md) · [Art direction and sequence](STORYBOARD.md) · [Audio/timing method and uncertainty](analysis/README.md) · [Asset provenance](ASSETS.md) · [Reference ledger](REFERENCES.md) · [Production status](review/production-status.json)

![Wide browser preview at 119.600 s](evidence/preview-landscape-119.600.png)

[Portrait browser still](evidence/preview-portrait-105.000.png) · [Current visual/interaction evidence](evidence/README.md)

## Open the complete preview

From this project directory, with its authorized local soundtrack and asset inputs present:

```sh
npm ci
npm run check
npm run preview:start
```

Open [the local preview](http://127.0.0.1:4392/). It starts paused at 0:00 in portrait. Select YouTube 16:9 or TikTok 9:16; both use the same original source clock. `npm run preview:start` starts a detached server, checks the exact preview page title before reporting readiness, and logs to `output/preview-server.log`. Re-running it recognizes an existing matching instance. The server binds to loopback and remains available after the launch command exits. Use `PORT=4393 npm run preview:start` for another local port. `npm run preview` is the optional foreground command.

The preview includes play/pause, restart, scrubbing, chapter and cue navigation, 1×/0.75×/0.5× speed, sound control, cinema view, effects and lyrics comparison toggles, reduced motion, timestamped review notes and note export. **Restore visuals** rebuilds the scene while preserving source position and existing notes. Errors identify missing local input rather than substituting a poster. The full soundtrack continues through its original ending.

## Current picture and typography

The PR castle retains its original limestone, oak, teal roofs, gold details, eight native emblem-bearing cloth panels and embedded materials. The separate 12-joint Warplet retains the +12 world-Y rooftop seating relationship and its authored Idle and Torch Salute actions. Honor guards, a lamplighter, rabbit, trees, birds and fire support the inhabited scene. Camera movement returns to recognizable views of this same place.

The lyric installation is authored for the film. Its transparent, camera-facing inscription stays at a fixed world anchor for each format, with a restrained matching projection onto the paving. It has no opaque plaque and does not replace the original crest or pretend to be text painted on a source wall. Complete phrase geometry is reserved before focus changes; active words turn warm ivory-gold while inactive words remain pale cyan. A dark contour protects the letters against the moving castle and glow. Layout adapts each complete phrase to its composition without resizing the currently sung word.

Two measured 48-band instruments make the response obvious: a cyan/violet forecourt arc and short radial rune segments around the guardian's circular ward. Their input is the recording's shared 25 Hz spectrum, not random motion. Additional magic traces the actual gateway, sends bounded ribbons and sparse light motes upward beside the towers, and colors the existing practical light and river. The gate trace, particle routes and circular field reconstruct from source time after arbitrary seeks. The circular field keeps one center behind the guardian; the subject's occlusion does not split it into separate effects.

A fixed **WARPKEEP** sign uses actual extruded Space Grotesk letter meshes, steel braces and stone footings on the north mountain. Its lower physical lettering reads `farcaster.xyz/~/channel/warpkeep`. The sign and a normal HTML link open the exact [Warpkeep Farcaster channel](https://farcaster.xyz/~/channel/warpkeep). It is an authored film landmark, not a claim that the PR source already contains it. Neither the sign nor the castle scales with the bass.

## Source, text and measured response

| Item | Current record |
| --- | --- |
| Original master | `source/Leave It On.m4a`, 4,448,680 bytes |
| Master SHA-256 | `376926ae77af41789ac620685dd15b5e1515e3777aece65e964463277e5cfe44` |
| Actual soundtrack codec | Stereo Opus, 48 kHz, despite the `.m4a` extension |
| Declared master duration | 273.560 seconds |
| Local browser playback | Opus stream copy in `source/leave-it-on.opus.webm`; declared 273.568 seconds |
| Native decoded length | 13,131,528 samples per channel, 273.5735 seconds |
| Current acoustic map | 63 line cues, 343 independently represented word events; all pending listening review |
| Measured features | 13,679 frames at 50 Hz: RMS, low, mid, high and attack |
| Measured spectrum | 6,840 frames at 25 Hz; 48 log-spaced bands from 45 Hz to 10 kHz, quantized 0–255 |

The master and browser remux preserve the same compressed audio packet payload and FFmpeg-decoded PCM. Their container timestamps differ; the preview follows the selected audio element's presentation clock without a manually added offset. The [source inspection](analysis/source-inspection.json) records Opus pre-skip, packet timestamps, tail and exact hashes. This does not substitute for browser onset/tail listening.

Unforced recognition and multiple CTC/attention alignments informed the candidate text and boundaries. The preserved 67-line embedded reference lists extra compressed first-chorus repetitions; the current model-supported candidate contains two refrain pairs there, retaining the omitted reference entries unchanged in source evidence. Proper names keep their supplied spelling. The Farcaster entrance, repeated refrains, processed echoes and every final release remain explicit review questions. Words are never distributed evenly across captions or snapped to musical attacks.

The spectrum uses one full-recording reference for every band; quiet passages are not independently amplified to maximum. Acoustic word focus, line visibility, measured energy, authored camera paths and semantic-effect tails have separate data ownership. The [analysis method](analysis/README.md) records the windows, models, limitations, filtering, normalization and reproduction commands.

## Exact PR asset identity

The selected game source is [`75934520a8dc295c8b68d4c8c197785299e2ff0b`](https://github.com/ael-dev3/Warpkeep/tree/75934520a8dc295c8b68d4c8c197785299e2ff0b), branch `codex/verdant-title-menu`. The archived source and the music-film staging are distinct from a released game build.

| Selected local asset | SHA-256 |
| --- | --- |
| `public/assets/pr375/castle.glb` | `c55f2c6c610e4aacddde58e485156c85629dd0a2eab88fad65652c317ae59088` |
| `public/assets/pr375/guardian.glb` | `e934a81ae2a210e495675aff99293aebc60cebb1a42603c9d99351db43d9e602` |
| `public/assets/pr375/hegemony-emblem.png` | `26e8664b1db0acf3e6db443caf46ef13e45fe9de794749e431b7c2e3d6fb8774` |

The [complete PR asset manifest](source/asset-provenance/pr375/manifest.json) includes all nine selected files, original paths, byte sizes, hashes and animation metadata. The [asset ledger](ASSETS.md) also records exact landscape source, dimensions, native facade measurements, original source terms and the earlier superseded selection. Source GLBs, materials, UVs, pivots and rig hierarchies remain unchanged. Film camera, illumination, procedural magic, lyric carrier and mountain sign are new presentation code.

Space Grotesk supplies the primary lyric and sign lettering; Cormorant Garamond supplies the review page's contrasting display type. Both are distributed with their SIL Open Font License 1.1 notices under `public/fonts/`. The mountain sign uses a weight-700 subset derived from the included Space Grotesk outlines, preserving its letter designs and source hash. Three.js is pinned to 0.185.1 in the package lock.

## Review and production boundary

Automated checks cover source/asset integrity, all cue and word intervals, measured-data contracts, exclusive releases and neutral gaps, exact semantic selectors, deterministic reconstruction, and stale/missing production bindings. The actual guardian rig also has direct versus nonsequential-seek pose checks. Such checks establish the behavior of the candidate map and code; they do not establish phonetic accuracy or a successful whole-song visual review.

Complete actual-audio review remains necessary for every cue, each independently performed repetition, difficult proper names, the bridge/instrumental boundary, possible late echoes and the final voice/music tail. Both compositions also need normal-speed creative acceptance and visible recovery checks. Limited outputs in `evidence/` are browser preview stills, not frames decoded from a completed film.

`npm run render` evaluates the production gate and is expected to fail while review or authorization is incomplete. It does not contain a full capture renderer. Even valid review/approval bindings would still require browser/renderer parity and an approved short encoded proof before full production. A technical input freeze never grants approval.

The supplied audio, estimated stems and local GLBs are excluded from Git. Public source documentation retains provenance and evidence limits without publishing those media. The Warpkeep asset records are specific use/distribution records, not a blanket open-content license. No game deployment, account assignment, player-data operation or platform posting is part of this project.
