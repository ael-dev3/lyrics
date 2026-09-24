# El Tesoro — bilingual lyric-film preview

**Él Mató a un Policía Motorizado · Spanish + English · preview for review.** The complete 4:31.534 [official recording](https://www.youtube.com/watch?v=vlneT-a-KkQ) plays with its source artwork, individually timed Spanish words, meaning-linked English words and a restrained audio-responsive atmosphere. The full film has **not** been rendered. Follow the repository's [preview-before-render rule](../../docs/preview-before-render.md) and [cross-language gate](../../docs/cross-language-sync-gate.md) before production.

![The source video's magenta-and-peach sword illustration, which anchors the lyric preview](public/source-poster.jpg)

*A frame from the official source upload. The browser preview adds equal bilingual typography, light reading shade, smoke contours and a blade reflection; this still is source artwork, not a rendered lyric-film frame.*

## Open the complete preview

With Node.js, FFmpeg and the exact local source present as `public/source.mp4`:

```sh
npm ci
npm run build
npm run check
npm run preview
```

Open <http://127.0.0.1:4327/>. The preview starts paused at the beginning and includes play/pause, restart, full-duration seek, direct lyric-line jumps, 1×/0.75×/0.5× playback, original 16:9 and authored 9:16 layouts, and **Restore picture**. A direct link such as <http://127.0.0.1:4327/?t=137.76&format=portrait&speed=0.5> opens a review point. Set `PORT` to another local port if needed. Keep the server running during review; the button restores the media surface while retaining position, speed, format and browser-saved notes.

The source recording is **not committed to Git**. Its locked SHA-256 is `a94238e7b20a812b10a307eb4b9b167cac78061c18862a908c512ec4abdd7c40` (8,515,238 bytes). The [manifest](source/media-manifest.json) records the YouTube format selection, 1920×1080 60 fps H.264 picture, 44.1 kHz AAC audio and duration. A fresh checkout needs an authorized local copy matching that hash; a different upload or transcode requires new timing and review. The source picture is nearly static, so authored motion is explicitly separate from the video itself. [Browser review observations](evidence/browser-preview-review.md) document picture, seek and recovery checks.

## Text and timing

The [supplied Spanish reference](source/lyrics-supplied.txt) is retained separately from [editorial punctuation and accents](source/lyrics-editorial.txt). The latter preserves Rioplatense **vos / pensás**, normalizes `día`, `Pensé`, `Perdón`, `está`, `depresión` and `épica`, and adds the Spanish opening question mark. The independent [Cifra Club text](https://www.cifraclub.com/el-mato-un-policia-motorizado/el-tesoro/letra/) and acoustic candidates were consulted without treating either as a certified transcript of this upload. `Ah` versus `Ay` and the second `el final` versus `del final` remain targeted listening questions; the preview follows the supplied wording and the more likely acoustic candidates.

The [editorial translation map](source/translation-mapping.json) records each English word's source-token meaning, including word order changes. For example, *acá / here* and *de nuevo / again* illuminate at their Spanish events even though English reads “here again”; *Cuidarte* carries “To … care for you” as a complete grammatical unit. “Sin épica” is rendered “without grandeur” as a poetic, non-literal phrase. Both languages use the same font, size, weight, inactive color and focus color. No invented English vocal timestamps are used.

The [timeline](src/timeline.json) contains 24 independent performed lines and 153 Spanish word windows at the locked 44.1 kHz source clock. Its boundaries are **provisional acoustic suggestions**, not a completed listening review. [Candidate evidence](analysis/provisional-word-evidence.json) combines unprompted Spanish ASR, constrained CTC on original/bandpassed mix and separated vocals, plus measured sustained-vowel tails. [The eight “Ah” tails](analysis/ah-tail-evidence.json) release in real pauses; [model disagreement flags](analysis/ctc-disagreement.json) identify weak short words and held endings. L16 “acá” provisionally releases near 137.50 s so L17 “Pensé” can enter at 137.74 s. The last clearly intelligible vocal ends near 180.8 s; the rest is an instrumental coda with fading vocal residue, so the preview does not invent repeated lyric cues there.

## Visual treatment

The 16:9 layout keeps the full source frame and places the two equally weighted lyric lanes in its darker side fields, leaving the blade and hands clear. The 9:16 layout centers the sword above equal stacked lyric lanes and feathers the picture into a plum reading field. Stable words change only in color and light. The source artwork breathes by less than a few percent; four fine smoke contours on either side respond to measured frequency energy, and a small transient reflection stays on the existing blade. There is no added neon spectrum rail, camera shake, strobe or invented scene cut. The colors come from the source's magenta, peach and lilac; shade is used for legibility.

The [audio analyzer](scripts/analyze-audio.ts) stores 24 logarithmic frequency bands, RMS and positive spectral flux at 60 samples per second. `public/audio-features.bin` is source-locked by SHA-256 metadata. Flux is normalized between this recording's 10th and 98th percentile; the independent check rejects a saturated response. These measurements drive only the atmosphere in [the visual code](src/visual.ts), never a lyric boundary. `npm run check` validates the source, cue/translation coverage, non-overlapping line visibility and feature identity. The browser and native-size review still matter: measurements and interval tests do not prove auditory synchronization or aesthetic fit.

## Review and production boundary

The [cross-language review](evidence/cross-language-sync-review.md) is **incomplete**. It identifies listening priorities and the every-cue checks still needed at normal and reduced speed in both layouts. There is no render authorization for this song. `npm run render:production` refuses missing, incomplete or stale review and approval evidence before any capture; a production renderer has not been added to this preview-only project. Do not infer production permission from a passing test or from the browser picture looking correct.

Use [AGENT-HANDOFF.md](AGENT-HANDOFF.md) to resume without redoing the source investigation.
