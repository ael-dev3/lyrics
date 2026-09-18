# Lunar visual decisions

Revision: **preview-v2-lunar**. Status: full-length playable preview, awaiting actual-audio review and current-revision approval.

## Each motion has one job

| Layer | Driver | Purpose and bound |
| --- | --- | --- |
| Opening shade | Recording time, ending at first vocal onset | Gradually reveal the Moon across the instrumental introduction; no repeating phase cycle |
| Moonlight | Centered 40 ms RMS of separated vocals | Small opacity range, 0.78–0.95, gives the voice a restrained visual presence |
| Radial spectrum | 64 measured mixed-audio frequency bands at 60 fps | Place the acoustic response around the subject; maximum travel 28.5 px landscape / 35.5 px portrait |
| Halo ripple | Selected original-audio attacks outside lexical vocal windows | A faint expanding ring, 650 ms lifetime, maximum opacity 0.16 and 38 px travel |
| Titles | Three instrumental regions from the cue structure | Identify the song without repeatedly flashing in short inter-line gaps |
| Closing fade | Final 2.5 seconds of the original recording | Let the scene close with the recording |

Instrumental attack selection measures changes in the mixed waveform. It does not identify beats or individual instruments. Separated vocals can contain leakage. These features control visual light and radius only; they never change words, timings or audio. Fixed star positions provide depth without a separate flashing rhythm. The lunar picture never shakes, zooms or bounces.

## Composition and color

Both formats use a centered lunar subject, fixed sans-serif lyric rows and equal language size/weight. French appears above English. The longest portrait lines wrap at the same 68 px size; landscape uses 60 px. Word geometry is reserved in advance and focus changes only color.

The asset supplies a cold palette: midnight `#050C18`, inactive lunar blue `#98B0C5`, active pearl `#EDF8FF`, secondary blue `#7692A9` and halo blue `#85A8C3`. The raster asset contains natural shades within this family. This edition has no imposed three-color limit.

The artwork is an AI-assisted lunar illustration, not a scientific surface map or artwork attributed to the musicians. The delivered asset is 1254×1254; the prompt's requested dimensions do not establish actual output dimensions. The original upload's bus collage is not used by the current scene.

## Transferable lessons

1. Reuse the timing/meaning pipeline while designing subject, composition, typography and motion afresh for each song.
2. Assign every animated layer an audio or structural purpose and a documented bound. Silence and quiet passages can retain stable imagery.
3. Keep vocal light, mixed-audio spectrum and selected transient gestures separate. Their measurements answer different questions.
4. Preserve the complete recording, including long instrumental passages. A lyric-free outro is part of the arrangement.
5. Read the actual PCM sample rate before feature extraction. A hard-coded 48 kHz assumption would misplace 44.1 kHz features; checks now compare the source rate, sample count and audio hash.
6. Test the persistent browser painter against the deterministic still scene. Fast DOM updates should preserve every word state and animated attribute.
7. Quantization bounds and model agreement are technical evidence. Actual listening remains a separate prerequisite for production.
