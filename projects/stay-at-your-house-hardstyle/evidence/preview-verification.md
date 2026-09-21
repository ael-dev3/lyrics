# Preview verification — action timing and lyric clearance

Date: 21 September 2026. These measurements were recorded before production authorization; the later [human review and authorization record](owner-acceptance-v5.json) closes the listening/approval gate without changing the reviewed inputs. Revision: `trailer-preview-v5-action-sync`. This covers the playable preview, not a rendered film or completed listening review. [Current input identities](input-identity.json).

## Editorial and encoded-frame checks

- The first edit decision list and encoded MP4 are unchanged from the preceding revision. Its SHA-256 remains `528dceec367af5d4df251a962f645d0d47d7ce5287b93021f47f737300395db1`.
- Every second-edit shot boundary, duration, source range and portrait crop remains unchanged. Its 28 unique shots have zero overlapping source ranges with the first edit and zero repeats within the second. [Preserved-input audit](edit-freshness.json).
- Seventeen new action accents across 15 second-edit shots align selected muzzle flashes, recoil poses and impact frames to quarter/eighth-note attacks. Two shots use two ordered retiming anchors. Preceding and following source frames were inspected to distinguish movement onset from a later bright frame. Natural character holds remain unchanged.
- Relative to the previous linear mapping, the selected source moments had an estimated median absolute offset of 66.334 ms from the new targets, with a maximum of 158.845 ms. These are mapping estimates, not measurements of old encoded pixels.
- Both silent MP4 assets pass strict complete FFmpeg decoding: 1,608 and 2,064 frames at 1920×1080 / 60 fps, without audio streams. Every output timestamp matches its 60 fps position within 0.000333 ms of decimal timestamp rounding. Original animation cadence is retimed through repeated frames, without optical-flow synthesis.
- All 23 selected action frames (six retained and 17 new) first match the intended encoded output frame. All 56 second-edit first/final-frame comparisons match the retained source pixels; maximum grayscale MSE is 0.3995, below the audit threshold of 16. Comparisons use decoded frame indices to avoid seek-time rounding near cuts. [Encoded asset audit](trailer-asset-verification.json).

## Lyric reading space and source preservation

The former landscape spectrum intersected actual glyph descenders on 151 lyric-visible frames, producing 802 colliding bar/word states and up to 39.715 pixels of overlap. The scene now reserves reading space with a 200 ms approach and release, scaling the whole spectrum travel while retaining its measured shape. Full instrumental reach returns outside the clearance window.

The current full-song audit uses the actual font descenders and bar/facet geometry in both formats: **832,855 comparisons, zero collisions, minimum clearance 37.524 pixels**. [Baseline](visual-clearance-baseline.json) · [Current audit](visual-clearance.json) · [Former worst-time composition](preview-lyric-clearance.png).

TypeScript and eight focused tests pass, including production gates, coverage, section visibility, decoded-picture selection, ordered action anchors, overlapping seeks, source freshness and per-event playback observations. The structural audit passes 45 cues / 284 source words / 568 word-layout states. Soundtrack, word timing, layout, artwork, section score, spectrum, motion data and beat pulses remain unchanged. At the time of these preview measurements, no full-song film had been created and listening/authorization were still pending. See the subsequent acceptance record above.

## Beat evidence

The 150 BPM grid uses a 0.350-second phase. A 512-sample Hann-window spectral-flux analysis with 44-sample hops (~0.998 ms) finds 162 qualified quarter-note attack candidates. Their median absolute grid residual is 0.681 ms; p95 is 1.877 ms and maximum is 10.181 ms. The 43 shot starts have a median absolute residual of 0.703 ms against nearby detected attacks. The 23 action targets have a median absolute residual of **0.658 ms**, maximum **2.109 ms**. This measures signal changes near an editorial grid, not independently certified beats or sung-word onsets. [Measurements](beat-audit.json).

The prior beat-phase correction and audio-clock picture selection remain in place. The visualizer still combines the original measured spectrum values with a bounded 45 ms attack decay; only its lyric clearance changes.

## Actual browser playback

Both complete montages played through at normal speed in both layouts, including the return to the artwork. The player records the first paint whose selected decoded picture reaches each cut/action event, separately from the rolling picture-age measurements. All **66 events appeared in each layout**, for 132 observed event appearances. [Playback measurements](playback-sync.json).

| Montage / layout | Events | Onset delay p95 / max | Picture age p95 / max | Picture samples | First event frame missed |
| --- | ---: | ---: | ---: | ---: | ---: |
| First / landscape | 21 | 17.855 / 27.226 ms | 16.189 / 33.159 ms | 1,608 | 2 |
| First / portrait | 21 | 10.731 / 10.776 ms | 11.546 / 26.574 ms | 1,608 | 0 |
| Second / landscape | 45 | 16.530 / 17.386 ms | 15.966 / 33.134 ms | 2,063 | 2 |
| Second / portrait | 45 | 15.252 / 15.526 ms | 15.078 / 31.724 ms | 2,064 | 0 |

A missed first event frame means the browser first painted that event on a later decoded frame; the event itself was still observed. The slowest event appearance was the first montage's mask cut, 27.226 ms after its target. These software-clock observations do not guarantee every future playback or measure physical speaker/display latency.

Reduced-speed inspection showed distinct action poses across the revised second edit. Switching between landscape and portrait preserved moving footage. A paused seek to 195.8 seconds and **Restore visuals** recovered the correct portrait action picture. Resuming, switching from 0.5× to 1× and jumping backward to Drop I also recovered the correct first-edit footage.

The player decodes 200 ms ahead, caches native frame timestamps and selects the latest picture at or before the audio clock. Portrait framing follows the selected picture's timestamp. Paused seeks capture a native decoded frame; obsolete transport requests cannot replace the latest request. Measurement passes reset after transport changes.

## Evidence limits

Picture and signal checks do not complete acoustic lyric review. The 121 flagged word events, processed vocal coverage, held endings and final-word transcription were the pending listening items at this measurement stage. Subsequent human attestation and render authorization are recorded separately above; these browser measurements do not retroactively become acoustic review telemetry.
