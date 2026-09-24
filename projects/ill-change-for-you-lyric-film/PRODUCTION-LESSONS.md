# I'll Change for You — production lessons

This film keeps the original 4:3 picture and its print texture in the foreground. The English reading line, changing ink color and small audio-shaped marks belong to the source image rather than forming a second stage. The 9:16 version shows the whole 4:3 frame; a dim, moving enlargement of that same frame fills the remaining space. The fill is atmosphere, so it stays behind the complete source picture and the fixed lyric position.

## Timing and presentation

- Keep the source recording as the only clock. The approved revision has 25 display cues and 118 independently timed words. Its [acoustic revision ledger](evidence/alignment-revision-2026-09-24.json) preserves the earlier boundaries and the reasons for 72 changes, including a vocal pause before the first refrain's “For” and several held endings. The [authorization record](evidence/render-authorization.json) binds the full-song, normal/reduced-speed and both-format review to exact preview inputs; it does not invent a per-word listening log.
- Reserve the lower source picture for a stable English line. Accent only the current sung word; change its ink color without moving the line. A small displaced print impression is limited to the highlighted “change.” Verify both the bright and dark source scenes rather than applying one fixed color to every frame.
- Shape the 28-mark edge print with the measured 64-band spectrum, but keep its low opacity and short reach. The underlying dBFS samples, the artistic display transform and the lyric intervals have distinct jobs. Increasing the visualizer for this gentle arrangement would compete with the existing picture texture.
- At the original audio tail, the source picture is roughly 60 ms shorter than the soundtrack. Hold the final source frame through the audio end. Retain source-black frames that already belong to the music video; reject new black gaps introduced by the renderer.

## Preview and renderer parity

The complete browser preview is the review surface. Production reconstructs the same source-time cue and edgeprint logic as an overlay over the locked video; the original AAC packets are copied into both deliverables. Both 4:3 and 9:16 outputs use a 60 fps frame clock. The native 4:3 output keeps the full source geometry. The portrait output places the uncut source picture above the fixed lyric area and uses only source-derived motion for its dim fill.

Cross-engine details require measured comparisons before full production. On this host, the canvas font rasterizer made the same Iowan Old Style declaration about 7.7% narrower than Chrome; measured word boxes led to a production-only font scale correction. The first portrait proof also revealed that FFmpeg's additive brightness control did not reproduce the preview's multiplicative 0.39 background brightness. Correct the compositor, then compare the actual source shot, word focus, line geometry and fill in both formats at identical source times. A matching script or similar-looking thumbnail alone is insufficient.

The guarded [production entry point](scripts/render-production.mjs) checks [the preview-before-render gate](scripts/render-gate.mjs) before capture or encoding. The gate is tied to the song, revision, full synchronization-review scope, explicit production approval and SHA-256 of the preview inputs. Its negative tests cover missing or stale evidence. Diagnostic clips and stills are separate modes and never substitute for full-preview acceptance.

## Final-file standard

The independent [render verifier](scripts/verify-render.py) checks dimensions, 60 fps frame count, full decode, ending coverage, copied AAC packet content and timestamps, new black intervals and sampled continuity of the original picture. Native stills and exact encoded frames are compared in both formats; contact sheets place expected word labels alongside decoded video frames. These tests establish technical delivery integrity. Acoustic fit remains grounded in the listening review of the same locked preview. The verified posting kit should use the actual final videos, separate YouTube and TikTok covers, copy, captions, hashes and a Desktop copy checked after transfer. Public Git tracks the source, methods and delivery evidence; rights-sensitive full media stays in the local posting kit.
