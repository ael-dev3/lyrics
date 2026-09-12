# Joyride — final verification

Both complete lyric films passed delivery verification. The checks below describe the encoded files and the reviewed evidence; they do not establish perfect acoustic timing or platform playback.

| Delivery | Video | Frames | Size | SHA-256 |
| --- | --- | --- | --- | --- |
| YouTube | 1920×1080 / 60 fps | 8932 | 279.82 MiB | `e24959234c4da3bb6491cddd45f393c240bda10a9eb364b9946ef76ddd3b6982` |
| TikTok | 1080×1920 / 60 fps | 8932 | 205.00 MiB | `8262dc5e198e825dcc59cc7c3b1fe6fac4e1145c7bef074b515227a792b71376` |

## Media checks

- Strict complete decoding passed for both video and audio tracks.
- Every decoded video timestamp follows frame index / 60. Maximum reported timestamp rounding error: 0.333 microseconds.
- Both deliveries are H.264 High, 8-bit yuv420p, BT.709 primaries/transfer/matrix, limited range, square pixels and fast-start MP4. The timeline starts at zero.
- Both retain the same 6979 AAC packets and timestamps as the locked 48 kHz stereo soundtrack. Eleven source/delivery waveform windows locate zero sample shift.
- The original recording is 148.8535 seconds; 8,932 full video frames span 148.866667 seconds. No audio was inserted to fill the final frame.
- The original working video preserves all 3,721 source packets and timestamps. The extracted Opus preserves all 7,443 original packet payloads. Original 25 fps footage is sampled onto a 60 fps graphic timeline without optical-flow interpolation.

## Lyric and visual checks

- 395 supplied words retained, 44 reference lines, 70 display cues and 323 focus groups.
- All groups have complete coverage and positive ordered sample intervals; all are fully visible on their selected contact frame and release on exclusive frame boundaries.
- 280 active/inactive DOM layout states pass safe-area and stable-glyph checks across both formats. No karaoke underlines, boxes, pills or bouncing glyphs are present.
- Two 15-second previews cover the opening chorus, repeated-chorus handoffs, daylight footage, fire footage and final vocal release. Native stills and two 30-frame preview contact sheets were inspected.
- 78 decoded final frames were visually reviewed across the two editions. They cover intro, candidate onsets, dense rap, bridge, all seven segment joins per edition, bright source scenes, final held word, closing title and last frame. [Exact frames and hashes](encoded-frame-review.json).
- Continuous full-frame shading conceals source crop edges and keeps the lyric area readable when occupied or empty. Cream and coral text preserve stable geometry. Title/footer rules and spectrum baselines remain separate composition graphics.
- Dedicated YouTube and portrait TikTok covers were reviewed at native and small size. The 1200×1600 profile cover survives a local 5%-per-edge center crop with title, artist and face intact. No live platform-upload preview is claimed.

## Rendering lineage

The final run freezes source code, dependencies, media, calibrated signal data, layout reports and render options after an awaited preflight. Remaining workers share one browser bundle and render at 2× delivery dimensions into lossless intermediates. A single Lanczos downsample and CRF 14 slow H.264 encode create each delivery.

The first 1116 YouTube frames reuse intact PNG captures from an interrupted run of the same source composition. Three fresh native RGB comparisons and 3 lossless encoded-frame comparisons match exactly. Original input hashes and every recovered PNG hash are retained in the [recovery record](recovery/capture-reuse.json). The restarted run uses explicit decode-cache limits and eight shorter segments per composition. Recovery is an intermediate optimization, not a resolution or quality reduction.

## Scientific scope and remaining uncertainty

The 64-band display uses calibrated, fixed-scale filtered RMS values. Zero-phase filtering and centered, frequency-dependent windows do not constitute instantaneous measurements. Decorative motion is separate from those measurements and is not an objective reading of emotion.

Lyric review combines model observations, text reconciliation and visual waveform inspection. Connected short tokens and held-vowel boundaries remain estimates; the 8.33 ms maximum display quantization is not an acoustic error bound. No human/native-listener auditory audition is claimed. The coverage audit records the uncorroborated intro token and extra full-track ASR tail line instead of treating transcription silence as proof of instrumental audio. No additional lyric omission is confirmed by the reviewed evidence.

Decoded-frame review and recovery comparisons are sampled. They do not certify all intervening pixels, subjective quality or YouTube/TikTok playback after transcoding. Full encoded-file checks and eventual downloaded-asset verification are separate evidence.

[Complete production record](../README.md) · [Original creator credits](../CREDITS-SOURCE.md) · [Source-stream identity](source-stream-identity.json) · [Coverage audit](../analysis/vocal-coverage.json) · [Cover review](cover-verification.json)
