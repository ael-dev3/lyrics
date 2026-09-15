# Workflow study and application

Repository baseline: `ael-dev3/lyrics`, commit `6a7b860`. This project applies the production workflow in general. No particular song is credited as design inspiration and no historical lyric treatment is copied as a quality standard.

## Precedence and scope

Reviewed AGENTS.md; production, first-pass, bilingual, cinematic, cross-language synchronization, TypeScript, QA, visual fidelity, scientific audio and motion guidance; current review template; implemented model, signal, composition and render interfaces; accepted-edition limitation records. The latest synchronization and equal-language rules supersede earlier visual defaults. Historical render entry points do not enforce the new gate and must not be reused without that check.

## Decisions for this recording

- Exact official music-video performance, with its original animation and AAC soundtrack. Analysis stems never replace delivery audio.
- Russian and English only. Preserve supplied text separately. Meaning-based English, independent word correspondences wherever defensible, complete grammatical expansions, natural English word order.
- 1920×1080 and 1080×1920 at 60 fps, independently composed around shared sample-indexed timing. Diagnostic cadence may be slower or sample-stepped; never infer acoustic accuracy from frame rounding.
- Equal bundled font, size, weight and color roles in each language. Stable complete-line geometry and instantaneous color/luminance focus. No cumulative karaoke sweep, active-word boxes, underlines or bouncing text.
- Original footage retains its own cadence and picture edits. Reading-area shading is continuous. Lyrics, focus, picture, decorative motion and final credits remain independent events.
- Source audio uses its first presented decoded sample as zero. Keep original 44.1 kHz sample indices. A separately documented 48 kHz resample feeds the reusable stereo spectrum only.
- Compare independent unforced transcription, bounded Whisper and MMS candidates, mixed and isolated audio, waveform and spectrogram evidence. A disagreement over 25 ms requires actual-audio review; no average offset or waveform attack is treated as truth.
- Complete target-word coverage includes articles, auxiliaries, prepositions and pronouns. No default neutral-grammar category. Multi-source English focus uses the union of source intervals.
- Full recording coverage includes intro, both independent choruses, gaps and the entire closing tail. Model omissions and hallucinations are unresolved evidence questions, not performed lyrics.
- Separate translation completeness, acoustic review, audiovisual review, delivery acceptance and publication status. Full rendering must reject missing, incomplete or stale review records.

## Toolchain

The npm stable TypeScript tag was checked on 2026-09-15: 7.0.2. Dependencies are pinned with a clean install. All new orchestration, data, rendering and validation use TypeScript. Embedded Python is limited to third-party pretrained model interfaces, following the repository's existing integration boundary.

## Evidence limits

Machine consistency checks cannot certify a perfect sync. Actual listening and full audiovisual review must name their real reviewer and method. Starting playback, extracting frames, successful alignment and interval tests cannot be recorded as completed listening. The user subsequently reported review completion and authorized full rendering; the current gate preserves that attestation, its limits and exact input hashes.
