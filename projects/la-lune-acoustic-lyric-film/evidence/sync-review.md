# Synchronization findings — preview v2

**Actual-audio review remains pending.** The technical work below produces reviewable candidates; it does not attest to perfect synchronization.

## Coverage and timing method

The full 197.555374-second recording is retained. Fourteen cues cover the two vocal passages, approximately 27.3–58.45 s and 83.98–115.10 s. Six independent small-model recognition windows cover the recording; no lyric words were recognized in the introduction, interlude or long outro. This is supporting evidence for instrumental classification, not proof that every possible quiet vocal is absent.

MMS alignment on bounded isolated-vocal lines supplies the primary candidate. Bounded Whisper large-v3-turbo alignment, section-level MMS on vocals and the mix, independent free recognition, and waveform/spectrogram inspection provide comparisons. Long-section Whisper candidates sometimes used silence-window starts, cut held vowels short or produced zero-length tokens; whole-recording recognition also hallucinated credit text. Such outputs were retained as evidence, not accepted as lyric authority.

The [boundary ledger](../analysis/boundary-ledger.json) retains model alternatives and disagreement. [Selected adjustments](../analysis/selected-boundary-decisions.json) document signal-supported overrides. All 49 source words remain marked for listening review. French boundaries are stored as integer 44,100 Hz samples; the nearest 60 fps boundary creates at most 8.232 ms rounding error. English uses the union of its source-word intervals. Line visibility has a small lead/hold independent of word focus.

## Listen closely to these boundaries

| Passage | Candidate concern |
| --- | --- |
| 27–41 s | Soft entrances and sustained déclinent, s’égrènent, noctambule, scène releases |
| 44–49 s | lueurs entrance differs across models; the restrictive ne…qu’une must highlight its complete English meaning |
| 51–58.5 s | elle onset and the extended nue / Lune releases |
| 84–98 s | Reordered adjectives; short transitions into s’emmène; lunar/sudden held releases |
| 100–106 s | Long bilingual line; balnéaire sustain and Neptune-blue union |
| 110–115.1 s | solaire release and the final Lune; avoid extending highlight into instrumental resonance |

Use normal speed for phrasing and reduced speed for boundary investigation, in both layouts. The browser's waveform/spectrogram and source/target audit show each selected interval. Save notes, apply warranted corrections, regenerate affected evidence and repeat the changed review. Browser notes do not automatically certify review or authorize rendering.

## Verified scope

Structural checks cover every word and translation link, boundary ordering, source-clock identity, nearest-frame color states and bounded spectrum geometry. Browser checks cover actual font ink bounds and persistent-painter parity. Technical playback confirms media-clock progress and completion. They exclude hardware audio/display latency and do not replace listening. The [structured review record](sync-review.json) therefore keeps actual-audio and format sign-offs false.

## Accepted preview production decision — 18 September 2026

The project owner accepted the current lunar preview and explicitly requested production. The [final technical and semantic audit](final-sync-audit.json) adds two bounded model comparisons, all fourteen spectrogram panels and every visible source/target word state on the full frame clock. The selected boundaries remain unchanged. The [production record](../PRODUCTION-NOTES.md) and [authorization](render-authorization.json) bind this scoped decision to the exact revision. Unknown per-cue listening fields remain unknown; technical consistency and overall acceptance do not establish perfect acoustic boundaries.
