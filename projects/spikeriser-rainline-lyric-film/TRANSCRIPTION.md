# Performed-text and source-clocked timing map

The current city preview reads `src/word-cues.json` as its canonical performed-text map: 18 performed lines and 76 independently timed words. The word boundaries are stored as both seconds and exclusive-end sample indices on the original 48 kHz soundtrack clock. No lyric sheet was supplied with the linked post, and the caption track contained no performed text.

## Text evidence

Two full-recording Whisper small passes, targeted medium passages, and a focused large-v3-turbo pass informed the provisional words. The large pass supports “Neon bleeding in the gutter,” “Lightning shows the other side,” and “falling out tonight.” Three model passes returned “axis train” in `V2-04`. The text remains a model-derived working transcription, pending actual-audio review. The first word of `V1-02` is written **“Ceiling”** as a contextual editorial choice; the sung homophone could also be spelled “sealing.” The cue keeps `uncertain: true` and `uncertainText: true`.

The full-track ASR passes found lexical singing around 47.8–129.1 and 163.8–186.9 seconds. They detected no clear lexical singing after roughly 187 seconds. That observation does not establish whether the remaining audio is instrumental, nonlexical vocal, or processed singing; the complete tail still needs listening.

## Word timing evidence

The transcript was force-aligned in bounded line windows using six passes: Wav2Vec2 ASR Base 960h, MMS FA, and stable Whisper on both the original mix and an HTDemucs vocal stem. The stem's measured lag against the mix was 0.000 seconds in four source regions (47–54, 69–77, 93–104, and 163–175 seconds). An unforced large-v3-turbo word pass helped navigate disputed phrases but was not selected as the timing authority.

Every selected start and end in `src/word-cues.json` is a recorded aligner observation snapped to the 48 kHz source sample clock. No word was placed by proportional spacing. The two “Spinward, spinward” refrains were aligned separately. Small unstressed “a” tokens collapsed to about 20 ms in the CTC passes, so their observed stable Whisper spans were selected for the review preview. The six-pass candidate set, selected model for each boundary, model disagreement, and notes are retained in `evidence/word-alignment-candidates.json`; `evidence/word-alignment-provenance.json` records source and analysis hashes.

This timing is a **review candidate**. Under the repository's 25 ms disagreement threshold, 73 of 76 words still require perceptual adjudication of at least one boundary; 30 have CTC candidate spread above 250 ms. The largest disputes include `V1-04` “Hanging,” `V1-08` “Through the glass,” `CH-04` “other side,” the second refrain, and the held “train.” Automatic aligners can misassign held vowels or reverb; selected samples are reproducible, not proof of vocal contact. `npm run timing:verify` checks sample mapping, complete coverage, selection provenance, word ordering, and the retained review flags. It cannot certify sung-word accuracy.

Actual-audio listening, every-word focus in both layouts, independently repeated refrains, and the complete ending remain pending. `evidence/sync-review.json` and `evidence/render-authorization.json` retain pending status; the production render gate remains closed.
