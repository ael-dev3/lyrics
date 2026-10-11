# Source timing and English correspondence

## Locked recording

The original input is a 200.600 s, 1080×1080, 25 fps H.264 video with original 44.1 kHz stereo AAC, both streams beginning at zero. Its SHA-256 is recorded in every derived timing/visual asset. Decoding produces 8,846,784 samples, or 200.6073469 s; the small codec tail does not extend the visible timeline. No gain, retiming, replacement soundtrack or cuts were applied.

The diagnostic HTDemucs estimate preserves the original stereo sample count. Six original/stem cross-correlation crops peak at zero lag within a ±80 ms search. This rejects a detected fixed diagnostic delay in those crops; it does not identify sung onsets or certify phonetic accuracy. Production playback always uses the original soundtrack.

## Preparation and competing paths

1. Strip pasted advertising and recommendations. Preserve supplied sung lines, repeated sections and backing parentheses as editorial input, not audio truth.
2. Run unconstrained recognition on the original signal and vocal estimate to find omissions and variants. Full runs miss quiet/filtered material and hallucinate subtitle credits in music gaps; retain those failures.
3. Use explicitly bounded, source-offset crops with text-conditioned Whisper large-v3-turbo attention and independent MMS_FA CTC on both original and estimated vocals. Repeated post-chorus calls receive narrow independent crops.
4. Inspect original/stem waveform and spectrogram candidates on a 2 ms hop with a 32 ms window. Character cores, attack peaks and model scores are proposals, never automatic word truth.
5. Keep rejected competing paths in `source/acoustic-observations.json`. Select integer 44.1 kHz events explicitly in `source/selected-boundaries.json`; regenerate the timeline without rerunning or replacing those selections.

Unsuccessful duration-preserving pitch experiments do not establish the filtered hooks. Repeated waveform correlations are too weak to justify copying boundaries from one occurrence to another. Every repeated phrase retains an independent selection. `scripts/author-timing.ts` refuses to replace existing selections unless `--replace` is explicitly requested; ordinary work edits the canonical selected file and runs `npm run timeline`.

## Important selections and limits

| Area | Selected observation | Rejected failure / remaining uncertainty |
| --- | --- | --- |
| Opening | quiet first word at 5.660 s | conditioned allocation beginning at source zero |
| Pre-choruses | independent starts at 31.574 and 119.540 s | no section-wide offset or copied repetition |
| First refrain | Когда 44.088; ты 46.004; меня 46.288; обнимаешь 47.699 s | connected words need original-audio judgment |
| Second refrain | starts 132.086 and 144.981 s | vocal-path 145.81 s absorbs the preceding held свет into the next phrase |
| First break | no authored supplied call cues | 01:11–01:21 is a recording-reviewed negative interval; two later candidates also lack reliable unprompted original-recording support and are withheld |
| Later break | three calls retained with shortened internal ownership/releases | broad original-mix recognition recovers the words; narrow/original/stem results disagree, and the unsupported fourth candidate is withheld |
| Backing echoes | four separate Вся candidates | very weak CTC support; do not certify their boundaries or invent additional repeats |
| Ending | становится 193.701–195.639; свет 196.977–197.873 s | final light allocation at about 195.06 crosses preceding syllables and a real gap |

These are initial review selections, not a completed listening log. Ownership ranges in the selected file are editorial tolerances, not statistical confidence intervals. Sample-exact storage and a fine signal-view hop do not prove millisecond perceptual accuracy.

## Word focus and line visibility

Source starts are inclusive and ends exclusive. The model retains fractional playback samples with only machine-epsilon boundary repair; no anticipatory offset or half-sample rounding is applied. The browser paints lyrics from the native video element's `currentTime` at display cadence. Decoded 25 fps picture PTS is tracked separately, so a word is not held back until the next picture frame. Paused repaint reads the actual stopped source time; seeking/buffering never extrapolate the voice.

Each cue has a separate reveal, full-opacity reading hold and release. A line is fully visible at its first word and throughout every selected vocal interval. Neutral reading holds last approximately 0.10 s, 0.18 s for calls and 0.20 s for light endings. A fade uses available room; adjacent sung cues hand off atomically instead of fading while a held word is still active. During the ending's internal pause the line remains visible, with no active word.

## English editorial audit

English was translated for this recording. **Hold me** is used in the romantic sense of staying in an embrace; **When you hold me** and **When I hold you** preserve the corresponding actions and subjects. The literal alternative “hug” is valid, while the selected idiom fits the sustained comforting refrain. It introduces no independent word event or guessed physical detail.

Every English token has a documented Russian source anchor in `source/correspondence-ledger.json`. Reordered English pronouns remain attached to меня/тебя rather than the later embrace verb. Required grammatical completions follow their source word together: **do you hear** ↔ слышишь, **I run** ↔ бегу, **with concrete** ↔ бетоном, **my own** ↔ свою. The idiomatic **together** follows the union of В and руках, not an enclosing span that includes unrelated words. **Surrounding** follows вокруг even though its written position moves before darkness. The ending uses **becomes light** for становится свет, distinct from earlier **turns into light** for превращается в свет.

The timeline's 144 source events and 165 English tokens pass deterministic correspondence, visibility and geometry checks. Actual full-song/reduced-speed bilingual listening remains separate and pending.

## v2 coverage correction

The v1 map placed two supplied calls in a recording-reviewed lyric-free interval at 71–81 s. They were withdrawn, not shifted to a nearby musical attack. Two later first-break candidates and the fourth later-break candidate were also withheld for lack of reliable lexical support. This withholding does not prove that every vocal-like sound is absent. The supplied lyric text and original candidate records remain separate from the current performed-word inventory.

Twenty fresh unprompted window observations used the original recording and a diagnostic vocal, with large-v3-turbo and small Whisper checkpoints. Wide original-mix recognition recovers three later calls; narrower crops and stem recognition remain unstable. These related models/crops are correlated observations, not independent listening votes. Subtitle-credit and music-caption hallucinations are rejected. No assistant direct-audio audition was available, and no full listening attestation is inferred.

The three retained later calls preserve source-renewal onsets at 158.601, 164.981 and 171.444 s. Their English/Russian internal handoffs are selected at 160.940, 167.360 and 173.640 s; lexical releases at 161.880, 168.460 and 174.400 s. These selections shorten long model/stem overhangs and retain explicit processed-word uncertainty. Other source word intervals and English meanings are unchanged. [The complete before/after and coverage record](source/coverage-review.json) binds the frozen v1 baseline.

The timeline builder rejects withheld IDs and any reading line overlapping the recording-reviewed 71–81 s window. A separate regression covers every 60 Hz frame in that interval, including neutral line visibility. Coverage decisions must be reviewed before alignment; passing a forced path or timing validator cannot establish that a repeat was sung.
