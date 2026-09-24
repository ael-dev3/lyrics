# I’ll Change for You — provisional timing handoff

## Input and coverage

- Exact local source SHA-256: `5af79acdcb8d708a6d53f901dee814f2a8038e2c775e806635e4286a57d01309`; 196.464036 seconds; AAC 44.1 kHz stereo starts at source time zero.
- Supplied sequence: 118 words. For display, split isolated **How** and **Yeah** into their own cues: 25 lines, same word order and wording.
- Baseline candidate: [alignment-candidate-preliminary.json](alignment-candidate-preliminary.json), 44.1 kHz sample indices and seconds, stable word IDs, positive exclusive intervals, no overlap. Its final release was 174.76 s; the revised preview map extends the supported closing release to 174.86 s.
- No confirmed 26th outro line. The apparent 186.7–187.9 s reprise appears only in unforced Whisper-small over the full vocal stem; targeted mix/stem ASR and unforced large-v3-turbo mix recognition stop near 174.7 s. Stem RMS falls below roughly −67 dBFS by 176.5 s and stays below the report threshold thereafter. This extra line is excluded from the provisional map; confirm the tail with actual listening. The source mix continues with a musical fade.

## Timing evidence

- HTDemucs `htdemucs --two-stems=vocals --shifts=0 --overlap=0.25` on the exact decoded mix for analysis only.
- MMS-FA and English wav2vec2 forced alignment independently on 25 bounded phrase windows, each on full mix and separated vocal stem.
- Stable Whisper large-v3-turbo bounded alignments on mix and stem; unforced large-v3-turbo mix and small stem transcripts for coverage/navigation.
- [alignment-audit.json](alignment-audit.json) retains per-word observations from all six bounded model passes, selected samples, disagreements and flags. The full-text Whisper pass is retained as an analysis-only full-text pass but **rejected**: it collapsed 118 words into 12.24–82.54 s despite the performance continuing to ~175 s. Model scores are not calibrated acoustic probabilities.
- This agent did not perform human listening. Acoustic boundaries, especially held vowels and connected short words, remain estimates; equal sample/second identity and a passing ordering check do not establish sung-word truth.

## Acoustic revision — 24 September 2026

The first candidate was revisited after preview feedback about early and lingering highlights. The [revision ledger](alignment-revision-2026-09-24.json) retains the previous and revised interval for all 118 word IDs, model ranges, and notes on uncertain cases. An independent silence scan cross-checked the proposal. Both original picture and audio begin at presentation time zero, and the browser paints lyric focus from the playing video element's clock; a global offset would not fix the observed word-level errors.

The clearest correction is the first refrain: “For” previously began at 60.00 s, inside a low-vocal gap. Its revised onset is 61.95 s, after the preceding sustained phrase; the pause now has no active word. Both “again” repetitions begin later, short linked words such as the first “I” in “Do I” and the “I” after “mean” no longer light during a preceding syllable, and several held line endings remain active through their supported release. A held “be” and “all” were recovered after a second gap audit. The lyrics and 25-line order are unchanged. Sample indices and seconds remain locked to the source's 44.1 kHz audio.

This remains an **acoustic/model-assisted candidate**, not a completed listening review. In particular, the vocal event at roughly 59.75–60.8 s and first-refrain wording need reduced-speed judgment on the actual mix. Forced aligners can mark a late point inside a held vowel as a word onset, so long “I’ll” and “don’t” intervals were not blindly shifted to those late marks. The current complete preview, in both formats, is the review surface. Rendering remains blocked until the current revision passes the repository's actual-audio review and receives explicit render approval.

## Priority listening windows

| Source time | Check |
| --- | --- |
| 8–15.7 s | Isolated `How`, gap, then each word in `Do I let our love die`; held `die` release. |
| 22–28.5 s | `keeper` → `Of`; singular/plural ending of `memories`; last-vowel release. |
| 29–37.5 s | Isolated `Yeah`, gap, `I've been drinking`; `I've` and `drinking` boundaries. |
| 40.8–50.5 s | `Why's` and the short linked words around `can't call you 'bout you and me`. |
| 51.8–66 s | First `‘Cause I’ll do anything` and the long following `For`; CTC selects late points inside held vowels. Confirm wording and each handoff. |
| 68–81 s | First `If you don’t ...` long `don’t`; `I will` may be sung as a contraction; exact `for you` release. |
| 90.8–98 s | Isolated `Bars` (ASR alternatives include `What's`/`But`), gap, then `Such magic places`. |
| 100.7–111.8 s | `with other people` versus ASR `without the people`; separate `any` / `one` if audibly supportable. |
| 112.5–120.3 s | Isolated `But now`, long pause before `They say they’re closing`. |
| 122.4–139.5 s | Long `loitering`, `Watching all`, `Like a kid waiting`, held `ride`. |
| 143–154.2 s | Second chorus opening `I’ll do anything` has model onset disagreement over one second; independently confirm before borrowing any first-chorus timing. |
| 156.3–175.2 s | Second held `don’t`, `I will` versus contracted pronunciation, final supplied `I’ll change for you`, last sung release. |
| 175–193 s | Confirm there is no additional lexical reprise under the instrumental fade. |

## Reproduction summary

From the locked source, decode 16 kHz mono mix and 44.1 kHz stereo mix with FFmpeg, isolate vocals with Demucs, then resample vocals to 16 kHz mono. The 25 phrase windows, all six bounded model observations for each word, preliminary selections and uncertainty flags are embedded in the original audit JSON; revised selections are in the [revision ledger](alignment-revision-2026-09-24.json). The supplied lyric reference stays in [source/lyrics-supplied.txt](../source/lyrics-supplied.txt), and the active preview map is [src/timeline.json](../src/timeline.json). Model reruns are optional analysis; their outputs must be reviewed before replacing selected intervals. The decoded mix and separation stems are analysis inputs only.
