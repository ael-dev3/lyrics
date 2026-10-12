# Timing, coverage and complete bilingual meaning

## Canonical files

Edit `source/selected-boundaries.json` for acoustic ownership and `source/editorial-templates.json` for translation/correspondence. `public/timeline.json` and `source/correspondence-ledger.json` are deterministic products of `npm run timeline`. Do not patch generated intervals or apply a global offset.

The 11 bounded phrases produce 59 reader cues, 228 source events and 306 target tokens. Russian onsets and exclusive releases use integer samples at 44.1 kHz. English focus is the union of contributing Russian events, not an enclosing span or invented English syllable times. Color changes neither move nor resize text.

## Evidence preparation

1. Decode the exact source without trimming. Original AAC and native25 fps zero remain authoritative.
2. Create a native44.1 kHz stereo HTDemucs diagnostic estimate (cached 955717e8, shifts 1, overlap 0.25, seed0). Source and estimate each have 11,448,768 samples; six bounded waveform checks find zero lag. This verifies a diagnostic clock, not vocal accuracy.
3. Obtain unconstrained full original large-v3-turbo/small and vocal-turbo coverage, then narrowed original/vocal word-variant observations. Keep ASR omissions and hallucinations distinct from known silence.
4. Run bounded original Whisper attention and original/vocal MMS_FA character paths. Keep MMS20 ms stride and 400 sample receptive field explicit; a character core is not a quiet consonant's full entrance.
5. Compare connected entrance candidates, reject attention assigned to preceding music, and inspect held-body/repeated renewal support. Preserve competing observations and 49 explicit onset/release selections.

The `vocalTrack` value in a reused phrase plan is the planning label. Actual inference provenance must identify the CLI `--input`; vocal refinements used `analysis/vocals16.wav` even where an inherited plan label says original-mix. Older raw diagnostic files remain historical, not new listening evidence.

## Corrections and uncertainty

`Завиляет` replaces a recognizer's malformed supplied verb. `моей жизни часов` replaces the supplied possessive mismatch. A very quiet `В` is retained before `сердце ледяной тайги`. These selected readings have model support, not verified songwriter authority; [coverage-review](source/coverage-review.json) records their basis and remaining uncertainty.

First sung event starts11.981995s. Every repeated chorus is timed independently, including four separate `убегу` renewals in the third chorus. First-word color is fully visible at the selected onset. Broad crop starts are never accepted merely because an aligner assigns them to a word.

Final `беги` continues through 245.601995s. The last two `наперегонки` events begin247.006009s and 249.393991s; the final lexical release is255.593991s. Character paths that stop around 251s omit the held vowel; attention allocated from 243.4s steals the preceding `беги`. Keep those rejected alternatives. Neutral reading continues to255.833991s and fades clear by256.333991s, without extending active focus.

Wordless Ah/Ooh/howling passages, guitar and birds stay audible. Their exact renewal count is not established, so no fabricated independent words are displayed. A hallucinated closing continuation credit is rejected. Nonlexical treatment and lexical ownership are separate.

## Translation decisions

| Source meaning | Selected English | Focus rule |
| --- | --- | --- |
| `убегу` | I'll run away | All three target words share this inflected event |
| `кусачий` | I bite | Full subject + verb follows the adjective's event |
| `очень живой` | very much alive | Degree follows `очень`; implied I'm/alive follows `живой` |
| `шпалам` | sleepers | Railway term, justified by preceding rails |
| `все стрелки` | all the hands | Clock hands, not arrows |
| `Только ты не отставай, отставай` | Just don't you fall behind, fall behind | Whole negative context stays readable; each sung verb lights its own fall/behind pair |
| `подпевай, подпевай` | sing along, sing along | Each repetition has its own complete target span |
| `Волк привык` | The wolf has grown accustomed | Preserve the unstated object |

Natural English word order can produce backward focus. Do not group reorderings for convenience or leave necessary grammar neutral. Review every source event and every target word in the correspondence ledger.

## Evidence boundaries

The owner accepted the current complete preview and directly authorized rendering. Granular normal/reduced-speed and both-format listening scope remains unattested. No direct assistant audition is available. Source/model/signal observations, exact sample assertions, actual-browser pictures, owner direction, and encoded checks have different scopes; none certifies perceptually perfect millisecond boundaries.
