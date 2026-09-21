# Preview verification — beat-sync trailer revision

Date: 21 September 2026. Revision: `trailer-preview-v3-beat-sync`. This record covers a playable preview, not a rendered film or completed listening review. Current media and scene inputs are bound in [input-identity.json](input-identity.json).

## Technical checks

- TypeScript and six focused tests pass: production gates; shot coverage; section visibility; decoded-frame selection; beat/anchor bounds; and paused/overlapping seeks without a fresh compositor callback.
- 45 cues / 284 source words / 568 word-layout states pass interval, containment, layout bounds and 60 fps visibility checks. Lyrics, word intervals, layout, raw spectrum and soundtrack remain hash-identical to the preceding trailer preview.
- Full recording duration: 227.718095 seconds; 13,664 60 Hz measurement/presentation rows. The original AAC payload SHA-256 equals the preview soundtrack payload SHA-256: `18188bb5c93ed58db8c9aa12e29e00e3417a4ae2a13f6807fb079059ebdceb2f`.
- Both silent trailer assets pass complete strict FFmpeg decoding: 1,608 and 2,064 frames at 1920×1080 / 60 fps, with no audio streams. Animation cadence is retained through retiming and frame repetition, without optical-flow synthesis.
- All 13 selected source action frames first match the edited pixels at their target output frames. The [asset audit](trailer-asset-verification.json) records source timestamps, near-match spans, pixel-error method, stream properties and hashes. Source trim origin and upward output-frame rounding prevent premature accents.
- The production command rejects preview-only evidence before capture or encoding. No full-length lyric-film file was created.

## Beat evidence

The 150 BPM grid uses a 0.350-second phase. A 512-sample Hann-window spectral-flux analysis with 44-sample hops (~0.998 ms) finds 162 qualified quarter-note attack candidates. Their median absolute grid residual is 0.681 ms; p95 is 1.877 ms and maximum is 10.181 ms. This detector identifies local signal changes near an editorial grid; it is not an independent human beat annotation.

Moving the 36 cut boundaries 66.667 ms earlier reduces their median absolute difference from nearby attack peaks from 67.097 ms to 0.657 ms. Selected movement frames receive additional within-shot retiming. The visualizer uses a bounded 45 ms decay from measured broadband attacks alongside its bass-envelope response. [Measurement details](beat-audit.json).

## Actual browser picture and transport

Both edits were played in the actual in-app browser, with successive screenshots showing different poses and scenes. Checks include normal and reduced speed, both layouts, chapter jumps, reverse seeking between edits, the first drop's natural entrance from 101.9 seconds, picture restoration and return to the original artwork after the drops.

The player decodes about 200 ms ahead, caches native frame timestamps and selects the most recent decoded picture at or before the audio clock. It samples at compositor callbacks and display ticks, paints the composition once per display tick during playback, and binds portrait framing to the selected picture. Loading and paused seeking also capture the native decoded frame, so an unchanged frame does not require a new compositor callback. Obsolete transport requests cannot replace the latest request.

After the final playback optimization, the complete first drop produced 1,608 painted-frame timing observations: p95 picture age **13.615 ms**, maximum **35.673 ms**. Picture age means audio time minus the chosen picture's presentation timestamp, including the edit's song offset. These are browser-clock measurements, not speaker/display latency measurements. The rolling telemetry retains at most 3,600 observations, so later snapshots may cover a different window. After the second normal-speed drop, the rolling 3,600-observation window had p95 **15.832 ms** and maximum **32.908 ms**. A subsequent normal-speed recovery run retained p95 **15.728 ms** with a larger isolated maximum of **46.075 ms**; the browser is not claimed to meet a hard per-frame bound. The preceding half-speed portrait check had p95 **15.034 ms**, maximum **16.537 ms**, across its last 3,600 observations.

Technical basis: the [WebCodecs VideoFrame constructor](https://w3c.github.io/webcodecs/#videoframe-constructors) preserves the underlying video's frame metadata and timestamp when no override is supplied. [Video-frame callback metadata](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback) provides a picture timestamp distinct from the moving element clock. The preview preserves the native timestamp instead of relabelling pixels with the requested seek time.

## Evidence limits

Browser observations establish moving-picture presence and sampled software timing, not exhaustive acoustic accuracy or hardware output latency. The cue map remains provisional, with 121 events flagged for reduced-speed listening review. Processed vocal coverage, held endings and final-word transcription still require listening. Technical picture checks do not complete a listener checklist. Explicit full-song production approval remains absent.
