# Preview v6: word, meaning and synchronization review

**Preview only. Complete actual-audio review and explicit approval of this revision remain pending. No production film was rendered.**

## Three verification passes

### 1. Wording and meaning

The supplied 31 lyrical lines and one nonlexical `У-у-у` event are retained in performed order. Unrelated recommendation links and section labels are excluded from the lyric layer. The song title uses «делал»; the first sung line uses the supplied «сделал». All 221 source tokens and 306 English tokens, including punctuation and `Ooh`, have stable IDs and source-linked highlights.

Free Whisper large-v3-turbo recognition was compared on the original mix and isolated vocals. Independent Whisper small recognition covered both verses, hooks, gaps and ending. These models sometimes misrecognize «пледом», «свитер», «Питер», «дуэт», «теле» and heavily processed repeated hooks. The supplied coherent words are retained. A fabricated subtitle credit in the instrumental gap is rejected. ASR disagreement remains evidence to inspect, not permission to replace the lyrics.

English preserves explicit threat, shelter imagery, tense, negation, repetition and unstated possessors. «Питер» remains St. Petersburg; «запястье» remains the wrist without an invented possessive; «бракованный» remains defective. «Лишь бы…» is “Just so…” with each wish mapped independently. English word order remains natural even when focus moves backward. The complete `with a blanket`, `of the dark`, `I'll crawl`, and `you smile` expansions share their corresponding source meanings. `hurt` uses the two separate «сделал» / «больно» intervals and stays inactive during the intervening «тебе».

### 2. Acoustic candidates and release inspection

Every lexical event has bounded MMS candidates from original mix and isolated vocals, plus bounded Whisper alignment. Primary onsets retain section-bounded isolated-vocal MMS observations. No global offset or copied repetition timing is applied. Full-track ASR's implausible early onsets across instrumental gaps are rejected.

The vocal stem was inspected using waveform/spectrogram support. Thirty-two held-vowel/final-word releases extend beyond the recognizer's phonetic core. The extension analysis is deterministic and starts from the unmodified core draft. Two capped automatic tails were shortened after harmonic-envelope inspection: final «ты» in KB-014 to **83.920 s**, and KB-025 to **153.860 s**. These remain preview candidates. Stem energy and reverberation are not exact audible word boundaries.

The supplied «У-у-у» / `Ooh` has a provisional bounded MMS interval near **154.415–155.962 s**. Lexical recognizers label this region as music or return no words; the supplied vocalisation and stem energy support keeping an explicit reviewable event. Its boundaries need listening.

### 3. Highlight implementation and visuals

- 2,580 onset, handoff and exclusive-end frame states across both formats; 44,434 visible word-color checks passed.
- All 32 cues were checked in the browser through 3,086 focus and boundary states, covering 53,116 word boxes. No ink collisions, missing text, unsafe placement or moving glyphs were found. Persistent preview focus and artwork pose matched the static scene implementation. Minimum same-row spacing was 17.854 native pixels.
- Both formats have equal language weight, size and active/rest colors. English expansions remain together at line breaks. The portrait title's accent clearance and landscape eye crop are protected.
- Three authored base colors; a centered vocal-energy measurement shapes the selected medium and strongest spectrum windows while the artwork stays still. Unrelated decorative motion and palette inversion are removed. The measured visualizer stays separate from the fixed reading panel. Full recording and instrumental gaps remain available.
- Encoded audio payload and decoded PCM match the original source. The preview uses the media element's clock, with no soundtrack retiming or gain change.

The maximum frame-grid rounding is **8.322 ms** at 60 fps. This is an implementation precision bound, **not** a claim that every acoustic boundary is accurate within that amount.

The v6 change adds bounded shadow texture at vocal spectral changes. Picture geometry and the exact section-based spectrum budgets remain unchanged from v5. Russian words, English meaning maps, lyric sample intervals, layouts and source audio remain identical to v2 and v3. [Motion and playback evidence](motion-review.md) records the separate shadow event map, purpose audit and browser checks. No global lyric offset was introduced to compensate for decorative motion or browser cadence.

## Remaining review before production

Play the complete recording at normal speed in both formats. Check every model disagreement above 25 ms at reduced speed, including short connecting words, repeated «столе» and «ты» releases, the nonlexical vocalisation and the final vocal. Review the full translated meaning on each event. The browser inspector offers source-linked words, acoustic candidates, local boundary proposals and saved notes. Its review controls must only be marked after actual listening.

Current evidence does not attest completed listening. Technical tests, direction feedback, screenshots and a source merge do not clear the production gate. The [machine-readable review](sync-review.json), [frozen identity](preview-identity.json), [semantic ledger](semantic-ledger.json) and [technical results](technical-checks.json) keep those statuses separate.
