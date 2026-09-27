# Leave It On — reproduction and technical ownership

Current source preview: **`preview-v2-pr375`**. The deliverable is the complete local browser preview in portrait and landscape. Complete acoustic review and explicit production authorization remain pending; this file does not open the production gate.

## Local inputs and startup

Use Node.js with the committed `package-lock.json`. Runtime dependency: Three.js **0.185.1**. The small local HTTP server serves ES modules, the media element's byte-range requests, local fonts and local GLBs. No build service or game authority is required.

Restore the supplied master as `source/Leave It On.m4a` and verify its SHA-256 against [source-inspection.json](analysis/source-inspection.json). Obtain the exact authorized asset bytes listed in [the PR375 manifest](source/asset-provenance/pr375/manifest.json) from the pinned Warpkeep source tree. Preserve the filenames under `public/assets/pr375/` used by the scene. The earlier selected asset set remains locally retained and checked by the integrity audit; its complete restore list is [selected-assets.json](source/asset-provenance/selected-assets.json). These earlier objects are provenance history, not the current scene's castle/landscape choice.

Create the browser-compatible audio container without re-encoding:

```sh
ffmpeg -v error -y -i 'source/Leave It On.m4a' -map 0:a:0 -c:a copy source/leave-it-on.opus.webm
npm ci
npm run check
npm run preview:start
```

The normal address is `http://127.0.0.1:4392/`. The recommended `preview:start` launcher starts a detached process, polls for the exact Leave It On preview title, and writes its log to `output/preview-server.log`. It recognizes an already-running matching instance and keeps the preview usable after the launcher exits. For another local port, use `PORT=4393 npm run preview:start`. `npm run preview` is available as a foreground alternative. A fresh page begins paused at zero. The default player explicitly uses the WebM Opus stream copy; it reads the resulting duration from `HTMLMediaElement`, rather than forcing the master container's duration onto playback.

Useful bounded review links are `/?format=landscape&t=85.5`, `/?format=portrait&t=119.6`, and `/?format=portrait&t=242.7`. Add `&cinema` for the composition without the surrounding review layout. These source times are inspection points, not acceptance records. The optional `layoutaudit` query runs projected-glyph checks at three points per cue in both formats; geometric bounds do not prove visual reading quality.

## Data and source responsibilities

| File | Responsibility |
| --- | --- |
| `source/embedded_lyrics.srt`, `lyrics_embedded_reference.txt`, `embedded_cues_unreviewed.json` | Preserved original lyric/section evidence; bracketed directions never become sung text automatically |
| `analysis/source-inspection.json` | Original media identity, pre-skip, packet/PCM preservation and timeline reconciliation |
| `analysis/select_timing.py`, `word-candidates.json`, `timing-audit.json` | Explicit candidate-boundary selection, disagreement and remaining listening questions |
| `data/lyrics.json` | 63 visible lines and 343 acoustic word candidates; separate visible and focus intervals |
| `data/features.json` | Precomputed 50 Hz RMS/low/mid/high/attack response |
| `data/spectrum.json` | Precomputed 25 Hz, 48-band measured spectrum with shared normalization |
| `src/core.js` | Exclusive word/line lookup, source-time feature sampling, exact semantic selectors and authored envelopes |
| `src/scene.js` | PR375 models, camera knots, landscape, lighting, atmosphere, forecourt resonators and rendering |
| `src/guardian-clock.js` | Deterministic sampling of the actual guardian actions, including seeks into and out of salute windows |
| `src/world-lyrics.js` | Stable full-phrase canvas geometry, contrast, word color focus, world anchor and floor projection |
| `src/magic-vfx.js` | Native arch seams/runes, tower ribbons/motes, unified guardian ward and its 48 measured radial segments |
| `src/mountain-sign.js` | Fixed extruded WARPKEEP/address meshes, terrain supports and exact Farcaster link target |
| `src/player.js` | Audio-owned transport, format changes, settled-frame refresh, restore, notes and review stills |
| `scripts/start-preview.mjs`, `scripts/preview-server.mjs` | Persistent local launch/readiness check and loopback media/asset serving |
| `scripts/check.mjs`, `contracts.test.mjs` | Data/identity/behavior checks, negative controls and actual-rig seek checks |
| `review/production-status.json`, `scripts/render-gate.mjs` | Separate review/authorization state, current-input binding and closed production entry point |

`data/story.json` is the original provisional story plan. It is retained as a planning record; some proposed beam/door assembly actions were not implemented. Current camera, carrier, effects and lighting behavior are described in [STORYBOARD.md](STORYBOARD.md) and owned by the source modules above.

## Source clock and deterministic scene state

The media element's presentation time is the only playback clock. Word intervals use the original decoded sample timeline after Opus pre-skip; this is documented representation precision, not proof of sample-accurate phonetics. The master declares 273.560 s, the WebM remux 273.568 s, and FFmpeg-native PCM lasts 273.5735 s. No audio time-stretch, hand-entered global lyric offset or invented final trim reconciles these values. The complete chosen media tail remains available to the browser.

The camera interpolates authored knots at source time. Seeded environment placement is stable. River, weather, fields, particles and actor mixers evaluate from explicit source time; guardian actions clear/reset the needed state before sampling. Measured arrays are prepared once from the recording. The magic field's phase never depends on the last displayed frame, and audio changes emission/reach within limits rather than altering the field's center or topology.

Word focus releases at its exclusive `end`. The complete phrase may remain visible outside that interval. Light/rain/Core/door effects select exact word IDs and have independent decorative tails. Musical attacks are not word-onset authority. The gate's final changed line alters illumination; it does not secretly deform the source castle or invoke a gameplay construction command.

## Picture layers and reading geometry

The lyric canvas reserves all words before focus changes. Portrait and landscape use independent fixed world positions, widths and complete-phrase line breaks. Long phrases fit once for that layout; active words keep their glyph positions and size. Warm active text, pale-cyan inactive text, dark outlines and restrained glow preserve contrast. The faint same-text paving projection supports the staged magical inscription and is deliberately lower contrast than the primary read.

The forecourt arc and guardian rune ring both consume the same real 48-band frame. Spoke extension follows globally normalized source energy with a bounded power curve. No new random bar motion or per-window automatic gain is inserted. The rest of the magic supports the instrument: thin gate seams, gate-pier glyphs, coherent concentric field, and sparse tower-bound light motes. Tower particles stay behind z13 and do not enter the defined forecourt lyric region.

The mountain sign is physical geometry at the north ridge, centered around world z−58. Terrain samples determine its footings and baseline; the WARPKEEP word is 36 m wide, with a 32 m address below. It keeps its orientation through camera and aspect changes. The link is exactly `https://farcaster.xyz/~/channel/warpkeep`, with both world-space click targets and a conventional HTML link. Bounded light response changes emission, not sign geometry.

## Re-running analysis

The [analysis README](analysis/README.md) contains the full commands and pinned Python package list. The actual method uses unforced Whisper recognition, independent CTC model passes on mix/stem, and a separate attention-alignment method; the documentation distinguishes shared model families and separation leakage. A stem helps analysis but never replaces the playback master.

Re-running `select_timing.py`, `measure_features.py` or `measure_spectrum.py` changes production inputs. Any changed words, source bytes, font, asset, scene code or measured data invalidates earlier frozen identities and requires renewed review of the affected current revision. Preserve the unmodified embedded references and candidate disagreements.

## Verification and production stop

Run `npm run check` for input integrity and behavioral contracts. It can pass while the production gate remains closed. Keep technical, visual and acoustic evidence separate. Browser inspection must include real changing pixels after fresh load, play, forward/backward/paused/nonsequential seeks, format switches, background/resume and Restore visuals; note preservation and restored source position matter. Compare effects enabled/disabled and inspect realistic phone/player sizes as well as native-resolution stills.

Use limited review captures only to examine particular frames. A browser still is not an encoded-file verification. Full every-cue listening, repeated-word adjudication, endings and both-format creative acceptance remain required before the production decision.

```sh
npm run render
```

This is a gate check, not an encoder. While required review or current-revision authorization is missing, it exits nonzero and explains the unresolved bindings. No complete renderer is provided in this preview revision. Passing bindings later would still require renderer parity and the approved short encoded proof before full capture. Do not create or modify acceptance evidence to make a command pass.

## Credits and local-media boundary

The supplied Leave It On master is preserved as the original recording. Warpkeep assets and procedural landscape derive from the exact PR375 source/ref recorded in [ASSETS.md](ASSETS.md); the new lyric installation, VFX, mountain sign and music-film staging are authored for this preview. External reference media was studied only within the recorded limits and is not imported into the picture.

Space Grotesk and Cormorant retain their included OFL1.1 notices. The mountain sign's embedded outline subset documents its Space Grotesk source hash and derivation. The selected Warpkeep assets retain their specific provenance-required terms. Audio, estimated stems, generated local analysis WAVs, GLBs and later production media remain excluded from Git; source documentation and small review evidence do not grant broader media rights or publication approval.
