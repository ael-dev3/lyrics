# призрак — production and delivery

## Approved composition

The complete original music video supplies the moving image and soundtrack. Russian-led passages show Russian and English; Japanese-led passages show Japanese with independent Russian and English translations. During the closing overlap, a complete Japanese-led block remains above the complete Russian-led block. Both share a centered reading axis, equal fitted type sizes and independent source-event ownership. Vertical separation identifies the voices without assigning one voice's held words to the other.

The native edition preserves the entire 1920×1080 source, including authored mattes, optical effects, flashes and credits. The portrait edition preserves the complete sharp source window above the language blocks. A dim, defocused copy of that same picture supplies surrounding atmosphere. The fixed measured spectrum follows the source's practical-light colors; lyric focus changes color and localized shadow without moving the glyphs.

The accepted scene and timing are not redesigned for production. The frozen [preview identity](evidence/preview-inputs.json) identifies 18 exact inputs. The [authorization](evidence/production-authorization.json), separate listening review and final-byte verification remain distinct records. Renderer, source-clock manifest, verification scripts and publishing assets have their own hashes.

## Source clock and rendering

- Original picture: 6376 frames at 25 fps, starting at zero, ending at 255.04 seconds. Last picture PTS is 255.00 seconds.
- Original audio: stereo 44.1 kHz AAC, 11,249,664 decoded samples, ending at 255.0944217687 seconds. No trimming, speed change, gain filter or replacement soundtrack.
- Delivery: 15,306 frames at 60 fps, ending at 255.10 seconds. Output frame `n` uses original picture `min(6375, floor(n × 5 / 12))`. The final original image remains through the short audio tail and CFR remainder.
- Word focus uses exact selected 44.1 kHz samples, with source-picture ownership separate from the fine word clock. A narrowly bounded floating-point normalization prevents an exact output sample from rounding below itself; it is not an authored global timing offset.
- Decode source pictures sequentially, paint the unchanged shared scene, stream full-range RGBA into a BT.709 limited-range H.264 encoder, and copy the complete original AAC stream. Avoid raster-frame caches and motion interpolation.
- Before any capture, enforce current visual hashes, complete current-song synchronization review and explicit authorization. Preserve source dimensions, cadence, approved fonts, renderer identity and source-clock identity through export. Reject partial output, unexpected decoded counts and existing final filenames.

The [renderer clock check](scripts/verify-render-clock.ts) verifies cadence, exact sample focus, final-picture ownership and fragmented/truncated decoder streams. The technical verifier checks complete encoded films; the decoded scene verifier separately checks visible composition and glyph focus. Codec output can differ across software versions even when the source clock and scene are identical.

## Editorial and synchronization lessons

The selected inventory contains 38 cues and 156 source events: 106 Russian words and 50 Japanese lexical/inflection units. Every performance of a repeated line has its own events. Full translated meaning follows the contributing source intervals; grammatical expansions receive no fabricated English syllable timestamps. Preserve negation, counterfactual Japanese morphology and unstated objects.

Two classical fragments require separate text identification and performance discovery. Poem 59's counterfactual expresses regret about sleeping; a modern negative interpretation is incorrect. Poem 30's comparative fragment includes complete negation and comparison. Institutional textual sources support grammar and attribution; they do not establish sung boundaries. See [editorial research](evidence/editorial-research.md).

The initial mono discovery missed a masked Japanese backing phrase beneath the louder Russian lead. Stereo-side analysis, unprompted discovery and corrected native-kana acoustic candidates supported the additional pair at 212.34–221.06. Broad forced alignment borrowed a preceding articulation at the first nasal handoff; narrower observations informed the selected 213.70-second transition. Model output, separation and spectrograms remain aids, with explicit uncertainty ranges and original audio as the authority.

Keep lexical onset/release, whole-line visibility, translation meaning focus and visual decoration separate. Full opacity begins with the first selected source sample. A held body must not be clipped by a reading transition or the other voice's entrance. The original 150 events remain unchanged when the six new backing events are added. Corrected preprocessing and masked-vocal findings are documented in [the overlap revision](OVERLAP-REVISION.md), with scheduling evidence distinct from listening judgment.

## Visual and delivery lessons

Center each row of the upper and lower vocal blocks on the same axis. Separate simultaneous voices vertically and keep those regions fixed after either voice ends. A lateral shift can unbalance an otherwise coherent five-lane composition. Apply a continuous symmetric readability shade rather than a hard vertical edge. Recheck the affected source shots and phone view after a layout correction without shifting acoustic events.

Use Noto Serif for Russian/English and Noto Serif JP for Japanese, with equal fitted size and script-specific optical weight. Strong pale focus and a local halo retain phone visibility; check actual decoded glyphs rather than only active-token diagnostics. Keep the spectrum anchor fixed and source-derived; supporting light response must not compete with five simultaneous language lanes.

Each platform receives a complete film, dedicated cover and publishing copy. The YouTube thumbnail is 1920×1080. The TikTok profile cover is portrait 1200×1600, reviewed at 150×200, 300×400 and a modest centered crop. Optional SRT/VTT captions carry complete cue meanings; exact word highlighting remains in the films. Simultaneous voice captions merge full cue text into non-overlapping subtitle intervals.

Stage and verify the upload kit before copying to Desktop. Record every file's bytes and SHA-256, verify copied hashes, preserve a committed reproducible source snapshot and independently inspect archives before any cleanup. Git integration does not back up excluded original media. Rights-sensitive film/source archives remain in authenticated draft release storage unless separately authorized for public release. Platform posting is separate from rendering and repository handoff.

## Reproduction and status

Read [AGENT-HANDOFF.md](AGENT-HANDOFF.md) first. Final status, file identities, listening scope and publication evidence are recorded separately; this process description is not proof that encoding or delivery is complete. Do not treat an earlier track's approval, a model alignment or a passing technical check as current production authorization.

The original recording and picture belong to their source creators. Translations, timing maps, typography, measured visual response and publishing preparation are AI-assisted production contributions; they do not relicense the underlying work. Retain source attribution and the repository's license exclusions.
