# Tanisea vNext — QC report implementation record

This record explains how the external [synchronization and production QC report](Tanisea_Lyric_Film_Sync_QC_Report.md) and the independent [timing/animation/lyric QA audit](Tanisea_Lyric_Film_Timing_QA_Audit.md) were reconciled and applied to the 60 fps source composition. The exact measurements, spreads, consensus anchors, and implemented cue values are also available as [machine-readable JSON](tanisea-vnext-qc-implementation.json).

## Evidence and precedence

- Both reports reviewed the earlier 1080×1080, 30 fps production master. One used the time-coded remix lyric track cross-checked against the waveform; the other used waveform, onset-strength, spectrogram, and visual sampling.
- Both find the same structural errors and no global stream offset. The soundtrack and visual timeline begin at `00:00.000`; no blanket lyric-layer shift is applied.
- Their 24 phrase-onset measurements differ by `10–450 ms`, partly because “lyric onset” and “prominent waveform attack” are not identical. The implementation stores both and uses their rounded arithmetic midpoint, minimizing the worst-case visual error instead of pretending one uncertain estimate is sample-accurate.
- The two reports jointly supersede the earlier provisional local cue map. The verse consensus begins at `01:04.06`, not `01:00.09`.
- Direct user-approved wording takes precedence over optional translation naturalization. The new film therefore retains “Night in the silence freezes helplessly;”, “I'll fold the peaks of every mountain”, and “And raise the ocean” exactly.
- Other natural-English recommendations were applied where they improve clarity and line length without changing the lyric order.

## Timing system implemented

Every line now has separate vocal and visual windows:

| Event | Rule at 60 fps |
| --- | --- |
| Entrance motion begins | `240 ms` before measured vocal onset |
| Main line fully legible | `50 ms` / 3 frames before onset |
| Active semantic highlight | begins on the measured onset |
| Standard outgoing fade | final 3 frames after the inferred vocal end, complete by the next onset |
| Final lyric/title handoff | `120 ms`, complete at the `01:58.20` original-title transition |

The two choruses are generated from one normalized semantic marker stack. Each performance keeps its independently anchored absolute phrase starts, while subdivisions, wording, and target order are shared. Runtime assertions block the render if a cue leaves its vocal window, targets an unknown semantic segment, creates a blank adjacent handoff, remains visible after the next onset, or diverges from the shared repeated-chorus stack.

The second audit adds three useful Russian-stress markers that were not explicit in the first report: `00:25.62` for “the horizon”, `00:28.83` for “it in two”, and `00:38.43` for “the whole world”. The normalized shared stack now lands those semantic English chunks within about `10 ms` of those markers instead of dividing the line by English word count.

The cue target model is independent of English display order. Future Russian-to-English review can intentionally jump backward, repeat a target, or activate several meaning groups without corrupting layout order.

## What the second audit caught that was new

| New evidence or recommendation | Disposition |
| --- | --- |
| Independent phrase attacks up to `450 ms` earlier than the first table | Applied as preserved evidence and fused midpoint anchors; neither uncertain table silently replaces the other |
| Approximate `152 BPM` pulse and a highly regular verse phrase grid | Recorded as audit evidence; not presented as a calibrated beat measurement or used to manufacture lyric starts |
| Internal accents near `25.62`, `28.83`, and `38.43 s` | Applied directly to “the horizon”, “it in two”, and “the whole world” semantic-group changes |
| Cumulative drift likely caused by chained card durations | Eliminated: every phrase start is absolute, with render-blocking adjacent-handoff checks |
| Preserve semantic chunks rather than dividing English by word count | Applied to the shared chorus marker stack |
| Separate archival and platform-safe audio outputs | Applied: untouched-AAC archive plus a separately named `4 dB`-attenuated platform final |
| `15–25 s` social discovery cut | Documented as a future derivative; outside the requested full-length master |
| Additional H.264 compatibility copy | Not made the primary final because the user requested size optimization; the checked-in workflow can add one without changing the source master |

## High-priority corrections

| Report issue | vNext result |
| --- | --- |
| Second “And raise the ocean” `0.95–1.17 s` late | Consensus anchor `01:40.89`; fully legible at `01:40.84` |
| “Some spoke; others stayed silent” about `0.72–0.74 s` early | Consensus anchor `01:23.18`; fully legible at `01:23.13` |
| First “And raise the ocean” early in the first audit | Consensus anchor `00:33.75`; fully legible at `00:33.70` |
| “My hands shook…” about `0.53–0.54 s` early | Consensus anchor `01:19.99`; fully legible at `01:19.94` |
| Final fire line `0.52–0.86 s` late | Consensus anchor `01:53.81`; fully legible at `01:53.76` |
| Verse opening late and blurred | Entrance begins `01:03.82`, sharp at `01:04.01`, active at `01:04.06` |
| Blank handoffs around the earth/walls lines | Incoming card is already sharp; outgoing card completes its fade by the consensus onset |

## Editorial changes

Applied naturalizations include:

- “And shatter it in two”;
- “Through apartment walls”;
- “I'll sweep through like a wave of fire”;
- “The sky hangs low, a silent ceiling”;
- “I remember what happened; questions gnaw at me”;
- “Who am I? Where am I from? Where is my home?”;
- “My soul walked along the edge”;
- “Behind my back, someone couldn't hold back a laugh”.

The literal English project title remains primary. The more idiomatic “I'll Scream for the Whole World to Hear” appears only as a small translation beneath the original Russian title in the outro.

## Visual-development changes

- Critical build and verse text moved `50 px` upward into the mobile-safe central area.
- Inactive lyric luminance increased from `55%` to `62%`, retaining a dark shadow for phone-size contrast.
- Tiny competing preview text remains removed.
- The interlude now lasts through the reconciled `01:04.06` verse entrance and develops into a second `KSVIETY REMIX` phase halfway through.
- The outro follows four authored states: original Russian title at `01:58.20`, English translation at `02:06.30`, restrained title separation at `02:16.80`, and artist/remix end card at `02:25.45`.
- All additions remain inside the live composition; no image or patch is placed over an encoded master.
- The native 1080×1080 artwork remains on the final pixel grid without the former under-resolved zoom.
- Cyrillic uses the bundled Playfair variable font, eliminating host-dependent fallback rendering.

## Audio-reactive and export decisions

- The locked `153.000 s`, 44.1 kHz stereo soundtrack remains the timing authority.
- The audio-feature package contains 9,180 records at 60 fps, 64 logarithmic bands from 20 Hz to 20 kHz, stereo-combined Hann-windowed spectrum data, momentary RMS, sample peak, pressure, transient impact, low-end weight, brightness, emotional accents, hero state, and line reach.
- Analysis is millisecond-resolved where the source permits; the rendered display is honestly limited to one update every `16.667 ms` at 60 fps.
- Central motion lines remain near `520 px` in restrained states and reach the hard `920 px` cap only on exceptional loud or reviewed emotional peaks.
- The source audio is extremely hot. The composition adds no gain. The archival master copies the original AAC stream unchanged; a separate platform copy preserves that master and attenuates audio by `4 dB` before a high-bitrate AAC encode, targeting roughly `−10 LUFS` and no more than `−1 dBTP`.
- The reference path uses PNG browser frames, explicit BT.709 metadata, and a 4:4:4 ProRes intermediate before the optimized 10-bit HEVC delivery encode.

## Verification gates

Before release, the implementation must pass:

1. strict TypeScript with no emit;
2. Remotion composition discovery at 1080×1080, 60 fps, 9,180 frames;
3. deterministic audio-feature regeneration and manifest checksum review;
4. still review at every report-defined high-risk cue and all four outro states;
5. complete reference render and optimized delivery encode;
6. full decode of every delivered frame and audio packet;
7. exact `153.000 s` duration, frame-rate, colour, codec-tag, fast-start, and stream-start checks;
8. source/delivery audio packet comparison and final SHA-256 recording;
9. repository source/report commit and remote push.

Final encode measurements and checksums are recorded after the production render rather than predicted here.
