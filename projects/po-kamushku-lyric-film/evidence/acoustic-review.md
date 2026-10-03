# Source-signal timing review — По камушку

**Preview evidence only. All 163 retained source events have separate onset and lexical release selections. This is model/signal inspection, not a normal-speed or reduced-speed listening attestation. Production remains closed.**

Revision: `po-kamushku-preview-v5-held-myself-occurrences`. Original source SHA-256: `f6572759f48f725497ad42b7c84cf12825824041897c47fdd36832a40ad30dd6`. Editorial SHA-256: `bbcf3f94a89dee54df7fc2f1cd7d8341d6b35d0c204770c04f81293da3fee0d1`. Timing candidate SHA-256: `43e741499b02b001a75e9f12bd8728789ed4a87142a00b942f25b7d0bc08f09e`.

## Recording and inventory

- Native source picture is 1080 × 1080 at 25 fps, 208.800 s. Original AAC is stereo at 44,100 Hz with container extent 208.809002 s. The decoded analysis contains 9,209,280 samples, 208.827210884 s. All word events retain original source zero; the slight AAC decode-tail difference is not an onset offset.
- Thirty occurrence cues cover all supplied sections, spoken introduction, both pre-choruses, three full choruses and four pebble refrains. Russian words retain individual source events; English meanings follow mapped source intervals rather than invented translated timestamps.
- Original supplied introduction has one Яна. Targeted listening rejected the provisional name at 6.127 s. The current preview removes that event and its English counterpart, retains the later 7.328 s name and all other acoustic samples, and follows the supplied text. The historical recognizer and signal proposals remain evidence of the failed allocation, not proof that a second name was spoken.
- Full unprompted ASR incorrectly allocates a Яна to 0.18–5.14 s and omits most first-verse words. Bounded recognition recovers the sequence; the first sung word’s actual source/stem body begins near 16.38 s. The broad ASR 14.06 s allocation and crop-bound Whisper 13.30 s allocation are rejected. Forced alignment cannot independently confirm words.
- The apparent extra И before the late refrain appears only in a weak full-recognition result; bounded unprompted recognition does not support it. It is retained as disagreement and is not added to the displayed inventory. No text is invented over the final instrumental tail.

## Method and practical limits

Cached local Whisper large-v3-turbo provides complete unprompted recognition, bounded inventory and 30 phrase-conditioned observations. A small Whisper model independently inspects bounded speech, while remaining the same model family. MMS_FA provides a separate multilingual CTC family; repeated phrases have separate recorded occurrences and crop bounds. Model scores are uncalibrated path observations, not accuracy probabilities.

HTDemucs 4.1.0 uses cached checkpoint 955717e8 (SHA-256 `d9fa14133cfcc034a6758923bb3a8ca9f8dfd0b582134643bbf83f72c17576dd`), CPU, shifts 0 and two-stem vocal output. Source and estimate both contain 9,209,280 samples at 44,100 Hz. Original/estimate correlation peaks at zero lag in three separate ranges (6–12.7, 14–20, 91.5–95.8 s), with correlations 0.8427, 0.8850 and 0.5456. The estimate is analysis support only and never replaces the soundtrack.

The primary reviewer inspects 20 cues/109 events using 1024-sample spectral support with 128-sample hops (~23.22 ms support, 2.90 ms sampling). A separate reviewer originally inspected the remaining 10 cues/55 proposed events, including all held refrain words, the first sung entry and both run/carry phrases. The v3 intro correction removes one of those proposals, leaving 54 retained events from that scope; the original independent record is preserved unchanged. Spectra, waveform and stems remain correlated observations of the recording. None certifies an exact physical phoneme edge or millisecond auditory accuracy.

Every word has a selected source sample, plausible onset/release interval, changed/retained audit against a frozen provisional baseline, model scores and a concrete per-word signal rationale in `source/timing-candidate.json`. The independent proposals remain separately preserved in `source/independent-timing-review.json`. Adjacent phonetic handoffs have coupled selected endpoints only where the observed transition supports it. Genuine softer gaps and passive tails are retained; no global anticipation or repeated-chorus offset is applied.

## Failures avoided in this first pass

| Source behavior | Misleading observation | Selected treatment |
| --- | --- | --- |
| Quiet spoken calls | One MMS path stacks both names near 7.4–7.9 s; broad Whisper stretches a name over silence. | Reject the 6.127 s name after targeted listening; retain the 7.328 s name. A physical burst is not a certified lexical event. |
| First Тёплый | Broad ASR starts at 14.06; conditioned Whisper starts at the 13.30 crop edge. | Original/stem voice begins at 16.385; earlier accompaniment receives no word focus. |
| Long refrain По and на | Sparse CTC core can last only 0.12–0.16 s. | Inspect the full sung vowel and preserve actual direct body through the next lexical handoff. |
| Final несу in both pre-choruses | Character paths end at 41.387 / 132.927 s. | Separate direct held vowel extends to 43.050 / 134.410 s; weak later residue stays neutral. |
| Held chorus пески / куски | Models stop near the first pronounced character group. | Follow changing direct i body in each occurrence, independently, until its source-supported release. |
| человечка | Narrow crop censors its final character at 103.250; Whisper steals the preceding vowel at 101.370. | Widen the original crop and inspect the quiet 101.85–102.22 transition. Select 102.095 with broad ownership uncertainty; release 103.650. |
| Conjunction и in Я разбита | MMS emits a 20 ms core; Whisper favors following frication. | Preserve its separate changed vowel at 116.635–116.865 s. |
| Final земли | MMS ends at 196.137; conditioned Whisper at 196.280. | Direct final held voice continues through 199.990; complete neutral line stays readable through 201.400. |

## Neutral reading lifetime

All 30 full-opacity reading holds are separate from word focus. The body end is acoustic; a neutral line may remain readable through weaker residual decay. Close adjacent vocal phrases replace atomically when a gentle fade cannot fit. A hold never extends beyond the next actual phrase entry. Other reviewed word events receive no reverb extension. Three targeted себя / myself focus tails now end at58.385,149.700 and164.820 seconds, extending their prior direct-body estimates by250,295 and390 ms respectively. Each release was inspected independently and stops before its unchanged next из onset, leaving75,140 and270 ms. Prior body estimates remain separate; signal alone cannot distinguish all soft carry from reverberation. These are bounded requested focus refinements, not new claims of exact phonetic duration. See `held-myself-repeat-review.json`; the earlier single-occurrence v4 record remains historical evidence.

| Cue | First onset (s) | Last direct release (s) | Neutral hold through (s) |
| --- | ---: | ---: | ---: |
| PK-001 | 7.328 | 12.485 | 13.030 |
| PK-002 | 16.385 | 20.045 | 20.220 |
| PK-003 | 20.340 | 23.800 | 23.920 |
| PK-004 | 24.035 | 27.450 | 27.650 |
| PK-005 | 27.875 | 31.455 | 31.650 |
| PK-006 | 31.745 | 34.080 | 34.550 |
| PK-007 | 35.470 | 37.860 | 38.040 |
| PK-008 | 39.352 | 43.050 | 43.135 |
| PK-009 | 43.135 | 45.995 | 46.170 |
| PK-010 | 46.845 | 54.430 | 54.550 |
| PK-011 | 54.580 | 61.630 | 61.720 |
| PK-012 | 61.740 | 76.430 | 76.942 |
| PK-013 | 76.942 | 90.585 | 91.530 |
| PK-014 | 92.600 | 96.255 | 96.370 |
| PK-015 | 96.460 | 103.650 | 103.870 |
| PK-016 | 104.100 | 107.680 | 107.810 |
| PK-017 | 107.930 | 111.460 | 111.640 |
| PK-018 | 111.750 | 115.055 | 115.210 |
| PK-019 | 115.555 | 119.135 | 119.300 |
| PK-020 | 119.320 | 122.455 | 122.640 |
| PK-021 | 123.153 | 125.445 | 126.420 |
| PK-022 | 126.925 | 129.545 | 129.720 |
| PK-023 | 130.747 | 134.410 | 134.550 |
| PK-024 | 134.550 | 137.385 | 137.690 |
| PK-025 | 138.295 | 145.790 | 145.920 |
| PK-026 | 145.945 | 153.175 | 153.390 |
| PK-027 | 153.555 | 161.045 | 161.190 |
| PK-028 | 161.200 | 168.220 | 168.340 |
| PK-029 | 168.391 | 183.005 | 183.582 |
| PK-030 | 183.582 | 199.990 | 201.400 |

## Listening still needed

The owner’s complete normal-speed review, reduced-speed review of uncertain onsets/held endings, and review in both native square and 9:16 layouts are separate from these signal records. Continuous reduced-vowel handoffs, source-versus-passive-tail splits and the quiet человечка opening deserve particular attention. No listening checkboxes or production permission are inferred from model evidence.
