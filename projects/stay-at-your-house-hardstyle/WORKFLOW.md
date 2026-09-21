# Production workflow — Stay at Your House (Hardstyle)

This record covers the complete path from source selection to the local posting kit. It preserves reusable decisions and reproducible evidence, without private review conversation. The approved presentation is `trailer-preview-v5-action-sync`; the [input manifest](evidence/input-identity.json) binds the exact recording, words, layouts, media, features and scene code.

## 1. Lock the recording and performed text

The selected upload lasts 227.718095 seconds. Its original stereo AAC remains the sole soundtrack. Keep its packet payloads, timestamps and decoded sample identity through final muxing; trailer dialogue must never enter the mix. Source URLs, credits and hashes are in [the media manifest](source/media-manifest.json).

Preserve the supplied lyrics separately. This remix uses a different arrangement from the original song: inventory the actual performed phrases, repeated choruses, processed textures and final vocal. The adopted edition contains 45 phrases and 284 word events. Do not append unused original-song sections or turn indistinct electronic textures into invented words.

Alignment uses original-mix and separated-vocal MMS candidates, wider contextual windows and an independent Whisper candidate set. Wider windows can recover a clipped first word but also fail elsewhere; do not select one entire model result blindly. Keep each candidate, adopted interval and disagreement in [word-candidates.json](analysis/word-candidates.json). A model flag is a listening-review request, not a calibrated error probability.

## 2. Establish a distinct visual treatment

Use the official Edgerunners yellow `#FCEE0A` for stable word focus. Keep the original illustration during vocal passages, protect readable lyric positions and let the electronic peaks carry stronger movement. Procedural 3D was explored as a preparatory direction, but recognizable animation from the same story world provided a closer fit. Unused assets are excluded from the final composition.

Use the official trailer as a visual source, with no dialogue or promotional cards in the selected edits. The first drop preserves its accepted sequence. The second builds a separate progression with 28 unique shots and no repeated source-time ranges from the first: character reactions beneath the final chorus, action escalation, then a quieter release. Portrait focal points are authored per shot and checked during motion. A central crop is not sufficient for off-center characters.

## 3. Separate five kinds of timing

Keep these on the same locked clock, but author and verify them independently:

1. Acoustic word intervals and held endings.
2. Line visibility and stable glyph geometry.
3. Picture cut boundaries.
4. Movement accents inside each shot.
5. Spectrum response and presentation intensity.

A beat detector cannot establish a sung-word onset. A cut on a beat does not guarantee that the action inside the shot lands with the music. A correct BPM also does not establish the grid's phase.

The measured grid is 150 BPM with a 0.350-second phase. The 43 cut starts have a 0.703 ms median residual against nearby detected attacks. The 23 selected action targets have a 0.658 ms median residual. These are spectral-flux observations near an editorial grid, not independently certified beat labels. [Detector and results](evidence/beat-audit.json).

Seventeen second-edit action accents correct movement inside existing source ranges without changing shot boundaries or portrait framing. Identify actual onset/pose frames by inspecting their neighbors; the brightest flash may come after onset. Two shots use multiple ordered retiming anchors for repeated bursts. Natural character holds remain unwarped. [Edit decisions](source/trailer-edit.json).

## 4. Verify prepared footage before composition

Build silent assets with `node scripts/build-trailer-assets.ts`. Each edit has a fixed 60 fps frame count. Preserve actual first retained source timestamps and explicitly bound shot tails, because seek rounding can leak an adjacent shot or card. Select output rounding deliberately; repeated original animation frames are acceptable, invented optical flow is unnecessary here.

`python3 scripts/verify-trailer-assets.py` requires NumPy and FFmpeg. It fully decodes both assets, checks all output timestamps, compares 23 selected action frames with their source frames, and tests all 56 second-edit trim endpoints. It uses exact decoded frame indices rather than timestamp seeks near cuts. [Verification](evidence/trailer-asset-verification.json).

## 5. Deliver the complete preview and correct real playback

Run `npm run preview`; the full recording opens at the beginning with both layouts, seeking, chapter jumps, three playback speeds and **Restore visuals**. Never substitute a lyrics-only diagnostic for the complete review composition.

The browser decodes ahead, caches native decoded frame timestamps and selects the latest picture at or before the audio clock. Portrait framing follows that selected picture. Transport requests have an ordering token, so an obsolete seek cannot overwrite the latest one. Paused same-position seeks must also produce a fresh usable frame. Check visible movement after loading, seeking, reversing between drops, changing layout and recovering the media surface.

Observe actual first appearances of cuts/actions, not only average media-clock drift. The four measured montage/layout passes observed all 66 events per layout; maximum event delay was 27.226 ms. Software measurements do not certify physical speaker/display latency. [Browser measurements](evidence/playback-sync.json).

## 6. Protect reading space under strong musical response

A full-frame audit found spectrum bars crossing glyph descenders on 151 landscape frames. Reserve clearance using the actual cue layout, with a 200 ms approach and release around line visibility. Scale the whole spectrum travel to preserve its shape; regain full height during instrumental passages. Keep raw measurements and word timing unchanged.

`npm run check` includes every lyric-visible frame in both layouts: 832,855 bar/word comparisons, zero collisions and minimum clearance 37.524 pixels. [Clearance audit](evidence/visual-clearance.json). Inspect both native and small compositions in addition to numeric geometry.

## 7. Freeze review and production authorization separately

The owner explicitly attested full normal-speed listening, uncertain-event reduced-speed review and both formats, then authorized production of the accepted preview. [Acceptance scope](evidence/owner-acceptance-v5.json) and [production gate](evidence/production-status.json) bind the exact input identity. The 121 model flags remain historical candidate evidence; do not rewrite model scores or invent per-cue listening telemetry.

`npm run render -- landscape` and `npm run render -- portrait` reject missing, stale or incomplete review and authorization before encoding. Implementing the renderer does not change approved scene inputs. Renderer source hashes are recorded separately in each render receipt.

## 8. Render deterministically, then inspect the encoded files

The production renderer calls the same scene function at exact `frame / 60` times. It consumes each silent trailer asset in complete decoded frame order and uses its native portrait crop at that frame. This avoids real-time browser scheduling delays in the output timeline. Full-resolution RGBA frames feed an H.264 CRF 16 encode with explicit limited-range Rec.709 conversion, square pixels, fast-start MP4 and stream-copied original AAC. Each format contains 13,664 frames; the final video tick differs from the exact audio duration by less than one frame.

Finalize explicit square-pixel metadata without re-encoding, then run the audits for each output. The finalization receipt compares the entire decoded YUV stream before and after.

```sh
node scripts/finalize-container.ts output/<video>.mp4 landscape
node scripts/verify-production.ts output/<video>.mp4 landscape
node scripts/audit-decoded-focus.ts output/<video>.mp4 landscape
node scripts/audit-decoded-picture.ts output/<video>.mp4 landscape
```

Use `portrait` for the vertical file. Technical verification checks complete decoding, all timestamps, dimensions, color metadata, original AAC packets and decoded PCM identity. The focus audit classifies every visible word in every decoded frame against the frozen intervals. The picture audit compares a text-free image region throughout the file with the approved scene, including source footage and critical event neighborhoods. These encoded checks validate output behavior; they do not replace the attested acoustic review.

Inspect decoded full-resolution checkpoints at the opening, lyric passages, montage entrances, action peaks, returns to artwork and final vocal. Refresh README screenshots from a verified final file, identifying the timestamp and edition.

## 9. Assemble the local posting kit

Provide a separate video, title, description and thumbnail for each platform. YouTube uses 1920×1080; TikTok video uses 1080×1920 and its dedicated profile cover is portrait 1200×1600. Covers use the original artwork and bundled typography, with no generated replacement imagery. Check title and artist at 320px wide and 150×200px, and inspect a 5% portrait crop simulation. Do not claim a real upload test when only local proofs were available.

Include optional English SRT captions, a short start guide, a manifest and SHA-256 checksums. Copy to a new Desktop folder, then compare every destination hash. Preserve earlier deliveries. Record public evidence with relative paths and a folder name only; omit local account paths.

## 10. Complete the repository handoff

Publish code, source decisions, sanitized production notes, representative screenshots and verification receipts. Keep third-party recordings and final videos local unless separately authorized for a public media release. Review the final diff, run applicable checks, merge the verified pull request and confirm there are no remaining open requests within scope.

[Concise editorial lessons](PRODUCTION-LESSONS.md) · [Project overview and credits](README.md)
