# Independent acoustic review — Призрак

## Scope and limits

Complete recording inventory, two Whisper checkpoints, original MMS and clock-verified estimated-vocal MMS, all 27 Russian cues/106 word proposals, plus separate Japanese opening/main/response checks. No canonical event was edited. No human listening or approval is implied. Dense sample/hop coordinates are representations, not acoustic millisecond certainty.

Source SHA256: `8563f6b817c9b1cc39649363a52486214c691c0d98ae7bb82263021ac7363523`. Original audio 44,100Hz/11,249,664 decoded stereo samples; source zero retained. HTDemucs stems have matching length and six original-versus-reconstruction zero-lag windows, with reconstruction correlations .996–.9999. Estimates are not bit-identical audio or lexical authority.

## Findings

- First «Такое» must not start on 134.66/138.509 music. Its ta-ko articulation is around 141.15; a preceding quiet burst 140.67–140.89 may be breath. Explicit range 140.65–141.18 remains pending listening.
- Several sustained final words continue far beyond ASR/CTC cores: «волосам», «меня», «луною», and especially verse-ending «человек» through about 177.6. Full bilingual text must remain readable through actual vocal bodies.
- Four quiet «В» events before night phrases or after long tails are particularly uncertain. Both constrained model scores are weak/near-zero. Prefix/overlap ranges are retained rather than claiming a perfect onset from the strongest vowel.
- Final Russian «ночь» cannot extend to 224.060 using the stem path: that borrows the Japanese response. Its Russian body ends around 222.2. A separately examined Japanese initial «憂き» may begin around 221.8 beneath that closing body; preserve overlap rather than clipping either word to force a non-overlapping handoff.
- The source contains two opening and two final pairs compatible with poem 30 «憂きものはなし / 暁ばかり», in addition to two main poem 59 runs. No first-half poem 30 line is invented. Canonical institutions corroborate spelling/meaning in the separate editorial report, not acoustic performance.
- Large/small lexical main passes preserve recognizable phonetic shapes but often replace classical wording. Japanese-global ASR garbles Russian. Music labels, instrument syllables and 251–255 “thanks for watching” are rejected rather than subtitled.

## Per-word proposals

The JSON contains each source word, raw original/stem/Whisper bounds and scores, a proposed onset/release, explicit ranges, sample representations and rationale. They remain proposals for the coordinator’s single canonical writer. Separate lyric focus, neutral reading hold and effect tail; do not fill an uncertain gap with active highlighting.

| Cue | First proposed onset | Last proposed body release | Words |
| --- | ---: | ---: | ---: |
| RU-001 | 86.200s | 90.120s | 4 |
| RU-002 | 90.550s | 94.850s | 5 |
| RU-003 | 95.045s | 99.390s | 4 |
| RU-004 | 99.735s | 103.910s | 2 |
| RU-005 | 103.910s | 108.430s | 4 |
| RU-006 | 108.800s | 113.265s | 5 |
| RU-007 | 113.730s | 117.630s | 3 |
| RU-008 | 117.970s | 124.230s | 4 |
| RU-009 | 126.240s | 127.590s | 3 |
| RU-010 | 128.430s | 130.400s | 4 |
| RU-011 | 141.130s | 145.250s | 5 |
| RU-012 | 146.690s | 148.120s | 3 |
| RU-013 | 149.945s | 154.940s | 6 |
| RU-014 | 155.980s | 157.280s | 2 |
| RU-015 | 159.440s | 163.790s | 5 |
| RU-016 | 165.020s | 166.430s | 3 |
| RU-017 | 168.255s | 177.600s | 6 |
| RU-018 | 177.600s | 181.840s | 4 |
| RU-019 | 181.980s | 186.510s | 5 |
| RU-020 | 186.560s | 191.140s | 4 |
| RU-021 | 191.185s | 195.530s | 2 |
| RU-022 | 195.530s | 199.840s | 4 |
| RU-023 | 200.270s | 204.730s | 5 |
| RU-024 | 205.155s | 209.390s | 3 |
| RU-025 | 209.400s | 217.430s | 4 |
| RU-026 | 217.600s | 219.150s | 3 |
| RU-027 | 219.835s | 222.240s | 4 |

## Reproducibility

Owned scripts and model/checkpoint/input identities are retained under `analysis/independent-audio/`. Every Russian instance has a fixed-scale original/estimate spectrum and original-sample min/max panel. FFT 1024 at 44.1k has 23.22ms support; hop88 is 1.995ms, which does not resolve phonetic uncertainty to 2ms. No remote operation, production render, Desktop output or human listening log was created.
