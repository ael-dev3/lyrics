# Preview v3: picture timing and purpose

**Revision: `preview-v3-audio-led`. Preview only; full rendering and complete listening review remain pending.**

## Purpose audit

| Element | Decision and role |
| --- | --- |
| Original kitchen illustration | Retained. The figure, creature, table and original red eyes carry the scene. |
| Tritone treatment | Retained with fixed ink, ivory and vermilion. Chorus inversion removed so the source image keeps a consistent reading. |
| Picture motion | Replaced independent sine drift with small, fixed-anchor pulses at corroborated acoustic attacks. The picture rests between events. |
| Orbiting ellipses, extra eye marks and steam | Removed. Their independent clocks and added shapes competed with the source imagery and suggested musical events without evidence. |
| Illustration/lyric seam | Static. It separates the reading field from the picture without adding another motion signal. |
| Spectrum | Retained: 64 independently measured bands, all vermilion. Band height carries musical detail; arbitrary alternating bar colors were removed. |
| Russian and English lyrics | Equal fixed geometry, source-linked color emphasis. No camera transforms apply to text. |
| Artist divider, title cards and final fade | Retained for hierarchy, instrumental passages and closure. They are presentation elements, not acoustic word events. |

## Attack selection

The Demucs percussion stem is used only for analysis. The generator compares an 8 ms centered power window with the preceding 33 ms mean, searches at 5 ms intervals, refines local peaks at 0.5 ms resolution and suppresses neighbors. Track-relative strength and spacing reduce 742 candidates to 126 selected stem attacks.

Each selected event is then checked against an 8 ms positive-power attack in the original stereo mix within ±25 ms. Events with a nonpositive mix attack or more than 20 ms disagreement are omitted. **107 events remain; 19 are rejected.** The accepted original-mix sample, rather than the stem sample, anchors each picture pulse. See the [generator manifest](../analysis/motion-manifest.json), [full acceptance/rejection ledger](../analysis/mix-impact-corroboration.json) and [event map](../public/motion.json).

The first accepted event is at 72.006 seconds. Earlier material retains the measured spectrum with a still picture. Each pulse reaches its maximum on the nearest 60 fps frame and returns to rest over 11 frames (about 183 ms), with a one-frame approach. Maximum added scale is 0.012. A fixed focal anchor prevents sideways movement. These are musical attack candidates, not human beat annotations or sung-word boundaries.

The spectral data retains its existing centered measurement windows and zero-phase filters. Its frequency-dependent time support differs from a brief percussion attack; it is not used as a word clock. Neither the raw bands nor lyric intervals changed in v3.

## Playback implementation

The original stream-copied AAC now plays through an audio element. Its `currentTime` drives lyric focus, measured bars and picture pose. No independent elapsed-time accumulator or guessed global compensation is applied. Encoded audio packets and decoded PCM remain identical to the source.

The browser keeps the SVG image and filter mounted across frames and lyric handoffs. It updates only changing attributes and replaces the lyric group when a cue changes. Full scene reconstruction happens on format changes. Waveform/spectrogram drawing is deferred while the timing inspector is hidden. Opening the inspector refreshes it to the current cue.

An observed portrait playback from 69 seconds to the recording's end completed without media errors and with one scene build. The final periodic sample reported 7,500 painted frames, about 0.326 ms average DOM-update work, 0.5 ms recent p95 and 2.3 ms maximum. The recent animation-callback interval p95 was **34.4 ms**, with a 36.9 ms maximum. This browser run therefore does **not** establish uninterrupted 60 fps display. A separate landscape 0.75× smoke check and paused format/inspector switches also succeeded. Raw observations and their scope are in [playback diagnostics](playback-diagnostics.json).

The measured media-clock rounding stayed within half a composition frame. That is a timeline implementation bound; it excludes hardware audio/display latency and does not certify acoustic word timing. No listening checkboxes were marked by these smoke tests.

## Verification

- Nine tests pass, covering meaningful bilingual mappings, production approval rules, exact event-frame peaks, bounded release and a fixed picture anchor over all 12,798 frames in both formats.
- Structural verification checks 2,580 boundary states and 44,434 visible word colors.
- The browser checks 3,086 cue/focus/boundary states and 53,116 word boxes. Focus and artwork pose match the static scene implementation. No collisions, moving glyphs or safe-area failures were found.
- Native diagnostic stills cover both formats, dense text, the intro, chorus and ending. The README screenshot is refreshed from this exact preview.
- Source audio, lyrics, meaning mapping, cue times and layout hashes are unchanged from v2. Full actual-audio review remains pending under the [sync gate](../../../docs/cross-language-sync-gate.md).

All source media, model stems, raw PCM and personal listening notes remain local. No full-length film was rendered for this revision.
