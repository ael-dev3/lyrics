# Preview verification — fresh second edit

Date: 21 September 2026. Revision: `trailer-preview-v4-fresh-second-edit`. This covers the playable preview, not a rendered film or completed listening review. [Current input identities](input-identity.json).

## Editorial and technical checks

- The first edit decision list and its encoded MP4 are unchanged from the preceding revision. Its SHA-256 remains `528dceec367af5d4df251a962f645d0d47d7ce5287b93021f47f737300395db1`.
- The second edit has 28 unique shots, zero overlapping source ranges with the first edit and zero repeated source ranges within itself. Holds: two at 0.4 seconds, thirteen at 0.8, ten at 1.6 and three at 2.4. [Freshness and preserved-input audit](edit-freshness.json).
- From 02:59.150–03:05.550, reactions accompany the remaining vocal lines. Physical action then develops into shorter details and an escalation, followed by a quieter image at 03:31.150 as the bass recedes. Portrait crops were adjusted to retain off-center faces and moving subjects. Source promotional cards and selected white-flash interstitials were trimmed away; native action lighting remains.
- TypeScript and seven focused tests pass, covering production gates, complete shot coverage, section visibility, decoded-frame selection, beat/anchor bounds, overlapping seeks and source-range freshness.
- 45 cues / 284 source words / 568 word-layout states pass interval, containment, layout and 60 fps visibility checks. Soundtrack, cues, layouts, scene drawing, spectrum and motion data are hash-identical to the preceding revision.
- Both silent MP4 assets pass strict complete FFmpeg decoding: 1,608 and 2,064 frames at 1920×1080 / 60 fps, without audio streams. The original animation cadence is retimed through repeated frames, without optical-flow synthesis.
- Six retained internal action accents in the first edit match their target encoded frames. All 56 first/final-frame comparisons for the new second edit match the retained source pixels; maximum grayscale MSE is 0.3985, below the audit threshold of 16. Source-frame bounds and upward frame rounding are accounted for explicitly. [Encoded asset audit](trailer-asset-verification.json).
- No full-song film was created. Production authorization and listener review remain false in the current identity-bound gate.

## Beat evidence

The 150 BPM grid uses a 0.350-second phase. A 512-sample Hann-window spectral-flux analysis with 44-sample hops (~0.998 ms) finds 162 qualified quarter-note attack candidates. Their median absolute grid residual is 0.681 ms; p95 is 1.877 ms and maximum is 10.181 ms. The 43 current shot starts have a median absolute residual of 0.703 ms against nearby detected attacks. This measures signal changes around an editorial grid, not independently certified beat annotations or sung-word onsets. [Measurements](beat-audit.json).

The prior beat-phase correction and audio-clock picture selection remain in place. The visualizer continues to combine measured spectrum values with a bounded 45 ms attack decay; its authored response is unchanged.

## Actual browser checks

The second edit played through at normal speed in both layouts, including its return to the original artwork. Reduced-speed checks and successive screenshots showed distinct footage and poses. Portrait and landscape inspection included the entrance beneath lyrics, action footage and the quieter closing image. Layout switching preserved the moving picture. A seek to 195.8 seconds and **Restore visuals** also recovered the correct portrait action frame.

The complete portrait pass produced 2,063 picture-age observations: p95 **15.280 ms**, maximum **31.026 ms**. The landscape pass from 179.6 seconds through the edit's end produced 2,041 observations: p95 **16.074 ms**, maximum **34.160 ms**. A sampled half-speed portrait run retained 2,251 observations with p95 **16.017 ms** and maximum **47.938 ms**. These are observed software-clock results, not a guarantee on every frame or a speaker/display latency measurement.

The unchanged player decodes ahead, caches native frame timestamps and selects the latest picture at or before the audio clock. Portrait framing follows the selected picture's timestamp. Paused seeks also capture the native decoded frame, and obsolete transport requests cannot replace the latest request.

## Evidence limits

Picture checks do not complete acoustic lyric review. The 121 flagged word events, processed vocal coverage, held endings and final-word transcription still need listening review. No current-revision full-song render approval is recorded. The preview remains the review deliverable.
