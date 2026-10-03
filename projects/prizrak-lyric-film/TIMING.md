# Performance inventory and timing decisions

The supplied lyric sheet is a reference, not an acoustic schedule. The unchanged source clock is authoritative: 44100 Hz presented AAC audio, 1920×1080 picture at 25 fps, source zero preserved. Canonical intervals are integer samples, inclusive start/exclusive end. This is exact scheduling, **not a claim of sample-accurate perceptual recognition**. CTC emissions have approximately 20 ms support, and the narrow signal panels use 23.22 ms spectral support.

## Performed inventory

| Source time | Selected performed material | Languages shown |
| --- | --- | --- |
| 0–about 20.53 | Source instrumental/ambience; early model lexical hallucinations rejected | No fabricated lyric |
| 20.53–38.07 | Two pairs:憂きものはなし / 暁ばかり | Japanese, Russian, English |
| 38.07–49.39 | Instrumental lead-in; source picture and measured spectrum remain | No fabricated lyric |
| 49.39–86.12 | Two complete performances ofやすらはで寝なましものを / 小夜更けて / 傾くまでの月を見しかな | Japanese, Russian, English |
| 86.20–130.40 | First Russian chorus, including independently timed nights | Russian, English |
| 130.40–141.13 | Instrumental interval; forced earlyТакое placement rejected | No fabricated lyric |
| 141.13–177.60 | Russian disappearance verse, independently reviewed repeats and long finalчеловек | Russian, English |
| 177.60–222.24 | Second Russian chorus and complete finalночь | Russian, English |
| 212.34–239.04 | Three late Japanese fragment pairs on an independent track; the first pair was recovered from the masked backing voice | Japanese/Russian/English upper block; full Russian/English foreground remains below through its own final cue |
| After 239.04 | Neutral final reading hold, then original ending/credits to 255.094422 | No invented closing lyric |

These are selected preview intervals. Unprompted transcription establishes candidate presence; primary poem sources and cross-model/signal evidence reconcile lexical shapes. A forced aligner cannot prove a word exists. Stock end-of-video ASR text, the unperformed upper stanza of poem 30 and page recommendations are absent from the scene.

## Independent evidence and rejected shortcuts

1. Bounded and full unprompted Whisper runs used no lyric prompt. A language-locked recognizer sometimes turned the other language or instrumental sound into plausible text; those strings remain rejected discovery outputs.
2. HTDemucs estimated vocals preserve the decoded source sample count and have zero measured clock lag in four comparison windows. Stem clocks are verified, but separation changes the sound; stems do not replace the original mix as authority.
3. Source-conditioned Whisper attention and MMS/CTC provide independent candidates. Quiet connected prefixes and sustained endings can fall outside their character cores. Every Russian occurrence has its own selected proposal and ranges; repeated phrases receive no copied offset.
4. A Japanese normalization error was discovered: default uroman converted several Japanese kanji into Chinese readings, even with a Japanese language code. Those paths are explicitly rejected. The corrected model input uses contextual native kana solely inside acoustic preprocessing; **screen text stays original Japanese**, with no pronunciation lane.
5. A crop beginning at 80.2 missed the second 月 entrance. Widening it verifies a 79.66 core, with earlier quiet frication selected at 79.63. A crop beginning at 222.35 also missed the closing Japanese vowel; widened CTC borrowed the prior Russian night for its weak initial symbol. Independent physical/morphological context supports a provisional 221.8 entry instead, with overlapping ownership represented honestly.
6. Final independent review moved the last 憂き from230.79 to 230.55 and prolonged the two 更けて proposals through 58.28 and 76.50. The lower-level vowel/room-decay distinction remains a listening judgment, not a solved model fact.

[Independent proposal report](evidence/independent-acoustic-review.json) · [All selected events and ranges](evidence/timing-decisions.json) · [Corrected native-kana candidates](analysis/japanese-ctc/)

## Translation focus

Each displayed token stores actual source contributors and an editorial rationale. Focus uses the **union** of those source intervals, not the enclosing start-to-end envelope. English articles, auxiliaries and paraphrases have no invented independent timestamps.

- `не / not` keeps its own event; `тревожили / was troubled` and `мысли / by thoughts` preserve complete inflected meanings.
- `я / I` stays separate from `исчез / have vanished`. Original Russian words remain individually timed, including every repeat.
- `ночь / the night` focuses the complete English noun phrase; the article does not follow the adjective by accident.
- Japanese `寝なまし` is one complete counterfactual verb: all of `I should have slept` and `стоило бы уснуть` focus together. Perfectiveな is not negation. Adversativeものを retains its separate regretful continuation.
- The moon sentence joins two source fragments into one natural stable block. Japanese inflections stay distinct; Russian uses a gender-neutral past visual paraphrase. 傾く means the moon lowers, not that it dims. かな is an exclamation, not a question.
- The reversed poem 30 fragments preserve the comparison: nothing more sorrowful **than dawn**. ばかり is not translated as simply only dawn.
- English `my hair` is a documented contextual completion from the following first-personменя, not an explicit possessive inволосам. `Beyond the moon` is the selected poetic interpretation ofза луною; ambiguity is retained in editorial notes.

## Three independent lifetimes

**Word focus:** reviewed source articulation/body interval. **Complete-line reading:** prelead and neutral hold, with full opacity on every owned active sample. **Decoration/picture:** measured spectrum, source 25 fps PTS and credit-clearance envelope. None sets the others’ onset or release.

The late overlap now uses independent full-cue tracks. The newly recovered Japanese pair enters at 212.34; subsequent Japanese pairs start at 221.8 and 230.55. The Russian foreground retains all prior source intervals, including the final night through 222.24. Upper Japanese-led and lower Russian-led blocks keep separate full translations and focus. See [v2 evidence and the masked first-word uncertainty](OVERLAP-REVISION.md).

All timing/semantic tests and technical previews remain separate from actual listening review. Freeze current input hashes only after preview verification; production needs complete current-input review and explicit current-song approval.
