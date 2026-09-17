# Anya Nami — Sugar Glass

**English only · verified landscape and portrait delivery**

![Sugar Glass final film with large English lyric focus and an expanded reflective spectrum](../../assets/sugar-glass-90.png)

*Decoded final landscape frame at 01:30.000. Original music, performance and mood video: [Anya Nami](https://www.youtube.com/watch?v=-NsQ8_WLq2s).*

This edition uses English lyrics only. The full-recording preview applies the **Lyrics workflow in general**, using the source video's glass, cream, blue and black imagery. Removing the translation lane makes room for larger type, oversized refrain lines and a more expressive spectrum. The earlier bilingual draft is superseded; its history remains in Git.

## Visual direction

- **Lyric hierarchy:** 102 px verse/bridge/outro text in both formats; 116 px landscape and 108 px portrait choruses; 156/142 px refrains. Independent backing vocals use a separate 64/62 px lane. Complete lines retain fixed word positions while warm color follows each vocal event.
- **Opening:** a large title settles into the small persistent identity before the first lyric. No sung word is hidden by the title transition.
- **Audio spectrum:** 64 measured bands become broader prismatic columns with a faint reflection. Smooth arrangement envelopes expand the display into choruses and the post-chorus, then ease back for the bridge and outro. Display travel ranges from 38–132 px landscape and 56–195 px portrait, with opacity 0.60–0.94.
- **Source imagery:** original footage and cadence are preserved. Continuous shading supports the lower reading area. Portrait reserves separate image, backing-vocal, lead-lyric and spectrum regions.
- **Player:** a clean watching view opens by default. Timing tools remain available through **Timing review**, including word boundaries, candidate comparisons, notes and saved progress.

The spectrum uses `height = 2 + clamp((dB + 65) / 52, 0, 1)^1.18 × travel`. Arrangement envelopes are artistic display decisions, separate from raw measurements and lyric timing. There is no per-frame normalization, random beat simulation or word-position bounce.

| Item | Delivery scope |
| --- | --- |
| Recording | Original AAC, 44.1 kHz stereo; 10,202,112 decoded samples; 231.340408 s |
| Formats | Landscape 1920×1080 and portrait 1080×1920; 60 fps lyric event display |
| Footage | Original 25 fps; local 4K VP9 retained, official 1080p H.264 used for live playback |
| Lyrics | 71 English lead/backing cues, 424 source tokens; existing acoustic boundaries preserved |
| Approval | Current preview accepted; both production formats explicitly authorized; granular listening telemetry remains unavailable |

## Review the preview

With Node 24 or newer and the source assets restored from [the manifest](source/input-manifest.json):

```sh
npm ci
npm run check
npm run preview
```

Open `http://127.0.0.1:4318/`. **Play from beginning** covers the full 3:51 recording. Switch between 16:9 and 9:16, use normal/0.75×/0.5× speed, or seek. **Timing review** reveals the cue list and word inspector. Notes and proposed edits remain local; saving progress does not approve production.

A cached page can remain visible after its local server exits. Keep the server running, or restart the portable package with **Start Preview.command**, then choose **Retry playback**. Retry reconnects without discarding notes. Drafts from an earlier input identity are archived locally before a new draft is saved.

For a clean still, use `?clean=1&t=90`; append `&format=portrait` for portrait. These URLs do not encode a lyric film. The geometry audit is at `review/geometry.html`.

## Timing and review limits

[Review questions](evidence/sync-review.md) cover supplied “sleeve” versus recognized “sleep,” the bridge wording, post-chorus repetitions and sustained releases. The English-only revision preserves all 424 source-word intervals; a larger display does not imply improved acoustic accuracy. Independent recognizers and aligners support listening review; they do not certify it.

The [sync review](evidence/sync-review.json) and [authorization](evidence/render-authorization.json) remain separate. This single-language edition retains the full performed English text and both formats. The project owner accepted the preview and explicitly authorized production. The scoped acceptance record preserves unknown listening fields and model uncertainty; it does not claim a completed granular acoustic audit. Multilingual productions still require the repository's cross-language checks.

## Preview before rendering

The playable English preview preceded explicit approval of **preview-v2-english**. Its [original identity](evidence/approved-preview-identity.json) and [earlier review record](evidence/pre-render-review.json) remain intact. [Production inputs](evidence/production-identity.json) preserve the approved scene, timing, text, audio, font and layouts; the capture adapter adds a production guard and the original picture's final-frame hold. Follow the [preview-first workflow](../../docs/preview-before-render.md) and [scoped production notes](PRODUCTION-LESSONS.md).

## Production and verification

The approved renderer requires an explicit mode and verifies current input hashes, acceptance and authorization before creating output. The default Remotion composition remains guarded against accidental capture. Both formats use 2× PNG capture, twelve contiguous ProRes 4444 segments, one Lanczos downsample, HEVC Main 10 / CRF 17 / BT.709 and original AAC packet copying.

```sh
npm run check
npm run sync:gate
npm run render -- --production --format landscape
npm run render -- --production --format portrait
node scripts/post-render.ts landscape
node scripts/post-render.ts portrait
```

The post-render checks verify strict decoding, every frame timestamp, stream metadata, original AAC packet identity, decoded word focus and reference segment continuity. They extract selected final frames for visual inspection. A technical pass verifies faithful delivery of the accepted event map; it does not certify model-derived acoustic boundaries. Both complete files passed. See the [final verification](evidence/final-verification.md), [delivery receipt](evidence/delivery-receipt.json) and [checksums](evidence/delivery-checksums.sha256). Full media is delivered locally; no new public binary release or platform upload was performed.

## Posting kit

The [YouTube and TikTok publishing kit](publishing/README.md) includes separate titles and descriptions, matching landscape and portrait covers, exact cover prompts and crop-review evidence. Both verified films and all posting files were delivered locally with matching checksums. The [posting-handoff addendum](evidence/posting-handoff-addendum.json) records these later additions without changing the original delivery receipt. No platform upload is claimed.

## Source and reproduction

- Original music, lyrics, performance and mood video: **Anya Nami — Sugar Glass**. No additional production credits are inferred.
- Added lyric presentation: Lyrics project, assisted with Codex. No individual song serves as the stated design inspiration.
- Cormorant Garamond Semibold: [SIL Open Font License](public/CormorantGaramond-OFL.txt).
- [Source identity](source/input-manifest.json), [preview hashes](evidence/preview-identity.json), [browser geometry](evidence/browser-geometry.json), [verification](evidence/preview-verification.json).

`source/lyric-plan.json` preserves the English cue plan. Existing model evidence and the boundary ledger retain the timing candidates. `scripts/prepare-text.ts` rebuilds the text reference without changing alignment windows. `scripts/build-cues.ts` reconstructs candidate selection; `scripts/layout.ts` lays out the English edition. Rebuilding timing requires renewed review. Full audio/video assets and listener records stay local.
