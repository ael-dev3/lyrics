# Three-pass synchronization review — preview v5

This review preserves the accepted autumn scene. No full film was rendered.

## 1. Meaning and complete bilingual focus

Reviewed the supplied Russian text, 34 unique cue constructions and their repeats: 54 cues, 218 Russian words and 281 English words. No additional translation omissions were found. Scraped recommendation text remains excluded.

- Preserve unstated objects in **Искусаю / I'll bite** and **ты любил / you loved**.
- Keep complete grammatical expansions together: **поосторожней / more careful**, **Искупи / Atone for**, **Хочешь / If you want**, **отпустить / to let go**, **возгорит / will burn**.
- Explicit negation, possessive and recipient words retain separate focus; natural English reordering does not justify grouping them.
- The discontinuous **в глаза кидал … пыль** idiom completes **you were deceiving**, releases for **мне / me**, then resumes for **пыль**. Its intervals never bridge the recipient or a silent gap.
- All four chorus performances retain their own events. English shares those source events; no artificial English syllable timestamps were introduced.

Meaning is reviewed against the supplied reading. Recognition disagreements about performed wording remain listening targets, especially VE-008/012/017/027/028/034. A forced aligner cannot independently validate the words it was given.

## 2. Acoustic candidate comparison

Compared 1,526 candidates for 218 words: MMS on original mix and vocal stem, bounded vocal-line Whisper, full large-v3 on mixed and vocal section windows, and expanded-context MMS on both signals. These are seven configurations from two model families, not seven independent systems.

One provisional correction was adopted: **VE-012-s02, не / Don't**, from **45.979–46.019 s** to **45.499–45.859 s**. The original-mix estimate remains stable across window sizes; the isolated-stem estimate shifts by more than 0.5 s. Full Whisper assigns this very short word zero duration and is unsuitable for selecting its boundary. The complete rationale is in `source/timing-corrections.json`.

No blanket offset, averaging or minimum highlight duration was applied. All candidates remain in `analysis/boundary-ledger.json` and `evidence/alignment-audit.json`. Eight prior held-vowel proposals remain separately documented. Wider windows exposed last-word drift into reverberation or following phrases; those estimates were not blindly adopted. Four zero-duration candidates were retained as rejected timing evidence.

**Limit:** these are machine-assisted acoustic checks. Full normal-speed listening, reduced-speed resolution of uncertain events and corresponding audiovisual review remain incomplete. Neither confidence scores nor waveform periodicity justify marking those checks complete.

## 3. Source clock, runtime and visual integrity

- Original AAC packet payloads, decoded stereo PCM and analysis PCM match exactly. The fast-start M4A remux changes metadata placement without changing sound or audio origin.
- Scene and highlight state derive from the audio element's current time. No separate free-running picture timer accumulates drift.
- All 2,346 boundary scene states and 22,914 visible-word colors passed in both layouts; all eight regression tests passed.
- Nearest-frame conversion contributes at most **8.300 ms** at 60 fps. This is not a measured acoustic error or hardware-latency bound.
- Browser checks cover actual ready media, advancing playback, 0.5× speed, seek/reload, format switching, complete paired focus, moving leaves and a fixed palette. Actual glyph geometry is checked separately across all 108 cue/layout combinations.
- Cadence measurements reset after pauses, seeks and speed changes so deliberate pauses are not mislabeled as dropped frames.
- The representative scene at 94.55 s is byte-identical as SVG in both formats to the accepted v4 stills. The photograph, autumn palette, leaf treatment, spectrum geometry and typography are unchanged.

The current frozen review identity is in `evidence/preview-identity.json`. Runtime evidence is in `evidence/browser-visual-state.json`; glyph results are in `evidence/browser-geometry.json`. The source handoff and visual acceptance do not authorize a production render or certify unresolved acoustic boundaries.
