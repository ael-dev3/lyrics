# Гречка — Люби меня, люби

**Russian / English · duration-focus preview v3 under review · v1.0.0 films retained as the earlier delivery.**

A full-recording, 187.402-second composition with 33 lyric cues, 147 Russian word events and 169 English words. Landscape and portrait use equal bilingual typography, stable color-only highlighting and the same original soundtrack. The current **`preview-v3-duration-focus`** revision refines the English duration line and its paired focus in LM-002 and LM-013 while preserving the Russian wording. Four held-word release corrections are documented separately from the meaning-map changes.

The earlier **`rose-paper-v1.0.0`** delivery used 167 English words and the reviewed `preview-v2-rose-paper` identity. Its human review, authorization and final-file checks apply to those exact v1 bytes. They do not certify or authorize the new preview. No replacement film or updated Desktop kit is claimed for v3.

![Rose paper composition with the original album print, equal bilingual lyrics and berry focus on жарким / with blazing](evidence/final/landscape-33-2.png)

*Frame 1992 at 00:33.200, decoded directly from the verified v1 landscape film. Original recording and album artwork: Гречка and their respective creators.*

## Picture and sound

The [selected official upload](https://www.youtube.com/watch?v=DBGCHjBSNzo) identifies Гречка and the album **Звёзды только ночью**. Its album picture is visually static in the inspected samples. The composition presents it as a stationary print, tilted −2° on warm rose paper with a pale sleeve edge and a soft offset shadow. Paper texture and generous reading space support the original portrait.

Both languages use Oswald Medium at equal size and weight: dark ink for resting text and berry for current meaning. A single smooth ribbon responds to 64 measured frequency bands, with immediate attack and a short decay. Its shape is an artistic spectrum display, not a physical waveform. The artwork remains mounted across lyric changes; picture geometry is composed separately for 1920×1080 and 1080×1920.

The original stereo AAC is retained at 44.1 kHz. All 8,073 packet payloads, timestamps and durations match the source video. Source URLs, byte identities and the distinction between presented duration and decoded sample extent are recorded in the [media manifest](source/media-manifest.json).

## Open the preview

Use Node.js 24 or later. On a fresh checkout, run `npm ci` in this project directory and supply the hash-matched local media recorded in the manifest.

With the documented local media and dependencies present, double-click **Start Preview.command**, or run from this project directory:

```sh
npm run review:build
node scripts/freeze-preview.ts
REVIEW_PORT=4324 node scripts/review-server.ts
```

Open [the local review preview](http://127.0.0.1:4324/). It starts at the beginning and includes seeking, restart, 16:9 / 9:16 switching, 0.75× / 0.5× playback, cue inspection and saved notes. **Restore visuals** reconnects the full composition at the current position. The source media are local preparation assets; a source checkout alone does not contain the soundtrack.

`npm run preview` rebuilds the client and starts the same server. After changing inputs, run the explicit build-and-freeze sequence above so the manifest includes the newly compiled client. Changed inputs invalidate previous review flags. Missing required media or an incomplete identity prevents preview readiness.

## Current preview review status

| Area | Current status |
| --- | --- |
| Translation and correspondence | Duration wording and finer paired focus revised in LM-002 and LM-013; v3 review pending |
| Acoustic timing | Four exclusive word ends revised from model/signal evidence; current actual-audio review remains pending |
| Complete recording and both layouts | Prior review retained for the 31 unchanged cues; LM-002 and LM-013 listening review reopened |
| Production authorization | New preview requires current review and explicit render authorization |
| Final films and posting kit | Earlier v1 films and 14-file Desktop kit retained; no v3 delivery yet |

Review priorities included short conjunctions, held vowels, all four bridge repetitions and the final vocal release. The supplied lyric inventory and model agreement alone cannot certify full vocal coverage or perfect synchronization. See [timing evidence and questions](evidence/timing-review.md), [translation decisions](evidence/translation-review.md) and the [current synchronization record](evidence/cross-language-sync-review.json).

The retained [instrumental-phrase refinement](evidence/phrase-focus-refinement.json) keeps “with blazing” together on «жарким», followed by “fire” on «огнём», across all four occurrences. It preserves the acoustic events and word geometry.

The [full correspondence scan](evidence/correspondence-scan.json) refines six verse cues to **Те / Those**, then **же / same**. It checks complete English expressions and all repeated patterns while preserving necessary English word-order changes and every acoustic event.

### Duration-focus revision

LM-002 and LM-013 now read **“Has loved, but not me, for years now.”** The English focus follows **Любит → Has loved**, **не → but not**, **меня → me**, and **уже → now**. The complete construction **который год** supplies the lexical meaning **for years**. Its finer display anchors are **который → for**, then **год → years**; the first anchor marks the construction's onset, not a literal translation of «который» as “for.” Russian word highlights remain distinct. Acoustic release/onset checks are recorded separately from this display decision. See [the translation review](evidence/translation-review.md) for the distinction between lexical coverage and performed display anchoring.

Fresh unforced MMS observations of the original mix and vocal stem, together with signal inspection, support extending the ends of «уже» and «который» in both performances. All onsets, the other 143 word intervals, and cue/visibility clocks remain unchanged; 32–57 ms inter-word gaps remain. These are model-supported corrections for review, not a new listening attestation. The [v3 refinement record](evidence/duration-focus-refinement.json) separates those acoustic changes from the translation and focus changes.

### Whole-song word highlighting

All **147 Russian words highlight individually**. English has **125 independent word highlights** and **22 necessary two-word expressions**, such as «вслух / out loud» and «улетай / fly away». Auxiliaries, articles and required grammatical completions stay with the single sung event that supplies their meaning; they do not receive invented English timestamps. “For / years / now” each has its own display anchor. The [whole-song audit](evidence/word-granularity-audit.json) checks all 11,245 presentation frames in both layouts, covering 182,066 generated word-color states with no skipped words or unnecessary groups. [Live browser samples](evidence/word-granularity-browser.json) separately verify twelve focus states in the complete preview. These checks preserve the current inputs and do not replace the pending two-cue listening review or final encoded-file verification.

Run `node scripts/audit-word-granularity.ts` to repeat the generated-markup audit. Its regression tests reject broad Russian groups, missing English focus and unreviewed multi-word expansions.

## Render and verify after current review

The production renderer reuses the frozen scene and source-linked focus at 2× dimensions, then performs one Lanczos reduction to 1920×1080 or 1080×1920. H.264 High-profile video uses 60 fps, CRF 16 and limited-range BT.709. The original AAC is copied without trimming, normalization or re-encoding; MP4 metadata precedes the media for fast loading.

The native SVG decoder omits embedded images and some static text attributes. Explicit adapters preserve the original picture transform and metadata spacing/opacity, with separate native-browser inspection and short encoded proofs. Cached/shared-scene raster agreement is supporting evidence, not a claim of browser pixel equality. See [renderer adoption](evidence/render-adoption.json).

```sh
npm run check
npm run sync:gate
npm run render:proof -- landscape
npm run render:proof -- portrait
npm run render -- landscape
npm run render -- portrait
node scripts/verify-production.ts output/Lyubi-Menya-Lyubi-landscape-1920x1080-60fps.mp4 landscape
node scripts/verify-production.ts output/Lyubi-Menya-Lyubi-portrait-1080x1920-60fps.mp4 portrait
node scripts/audit-decoded-focus.ts output/Lyubi-Menya-Lyubi-landscape-1920x1080-60fps.mp4 landscape
node scripts/audit-decoded-focus.ts output/Lyubi-Menya-Lyubi-portrait-1080x1920-60fps.mp4 portrait
node scripts/extract-delivery-proofs.ts
```

Production requires the current gate, renderer parity and native-browser adoption records. Output files are never silently overwritten. Changing a renderer or verification script requires refreshing its bound evidence. The technical verifier checks the complete frame clock and decode, original AAC packets and decoded PCM; the separate focus audit inspects visible word colors, lyric gaps and original picture presence on every decoded frame.

The commands above describe the production procedure. The v3 preview remains under review; v1 approval and verification records must not be used to pass its production gate.

[Posting assets and optional captions](publishing/README.md) · [Production lessons](PRODUCTION-LESSONS.md) · [Human review and render authorization](evidence/render-authorization.json)

## Earlier verified delivery — v1.0.0

| Video | Dimensions | Frames / cadence | File size |
| --- | --- | --- | --- |
| YouTube | 1920×1080 | 11,245 / 60 fps | 27,573,157 bytes |
| TikTok | 1080×1920 | 11,245 / 60 fps | 29,329,059 bytes |

Both v1 H.264 files passed complete decoding, constant presentation timestamps, square-pixel/BT.709 checks and fast-start placement. All **8,073 original AAC packets**, their timing and priming information, and the decoded **8,265,152 samples per channel** remain identical. Video duration is 187.416667 seconds, the 60 fps frame extent covering the 187.401995-second presented audio.

The v1 independent decoded-focus audit checked **90,306 visible word states per format**, all 33 cues and all 314 displayed source/target words in active and resting states. It found zero mismatches against the v1 specification, ambiguous colors or stale lyrics in gaps. The original picture was present on all 11,245 frames. These encoded-display and media-integrity results remain valid for the identified v1 files; they neither assess the new duration-focus specification nor certify its synchronization. The earlier comprehensive listening approval is recorded separately as human attestation.

The delivered v1 posting kit contains platform-specific videos, a 1920×1080 YouTube thumbnail, a 1200×1600 portrait TikTok profile cover, both titles/descriptions, three optional SRT files, a manifest and checksums. Every one of its 14 Desktop files matched the verified kit at handoff. The v3 preview has not replaced these files. Source, publishing assets, workflow and evidence are tracked here; no platform upload or public media release was performed.

[Delivery receipt](evidence/delivery-receipt.json) · [Desktop copy receipt](evidence/desktop-delivery-receipt.json) · [Decoded final screenshots](evidence/final/manifest.json) · [Final visual review](evidence/final-visual-review.json)

## Reproduction and credits

[Workflow and evidence boundaries](WORKFLOW.md) · [Frozen preview inputs](evidence/preview-identity.json) · [Mandatory preview-first workflow](../../docs/preview-before-render.md)

Original recording and album artwork: Гречка and their respective creators. Font: the Oswald Project Authors, distributed under the [SIL Open Font License 1.1](public/fonts/Oswald-OFL.txt). Translation mapping, timing preparation, preview composition and review tooling are additional project work. Local preview preparation does not constitute public media release or platform upload.
