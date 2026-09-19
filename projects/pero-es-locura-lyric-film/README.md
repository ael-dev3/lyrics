# Fémina — Pero es locura

**Vivo en La Oreja Negra · Spanish + English · corrected semantic-focus preview v2**

![Live performance with equal Spanish and English word focus](../../assets/pero-es-locura-final-109.png)

*Delivered v1 landscape frame 6540 at 01:49.000, decoded from the verified delivery. Music and performance: Fémina. Production: La Oreja Negra. Film: FLAN Audiovisual.*

## Current preview: complete English phrases

Revision 2 corrects **58 phrase occurrences in 40 cues**, including “love you,” “to tell you,” “my heart,” “inspires me” and “be soaked.” Individual lexical mappings remain available alongside the complete display groups. Spanish timing, wording, audio and geometry are unchanged. Use **Review highlight fixes** to jump to examples in the playable preview.

The new focus is technically checked; affected audiovisual review and new render authorization remain pending. The delivered v1 videos are preserved and have known incomplete English highlight spans. [Correction details and audit](SEMANTIC-FOCUS-V2.md) · [Current review](evidence/cross-language-sync-review.json) · [Current identity](evidence/preview-identity.json)

## Historical v1 delivery

The complete **4:54.104** live recording is delivered in 1920×1080 and 1080×1920 at 60 fps, with Spanish lyrics and meaning-linked English highlighting. Original live cuts and motion remain intact; warm serif text, continuous shading and a compact measured spectrum support the performance. Both languages have equal size, weight and focus strength, with stable word positions. Portrait retains the full source width above dedicated reading space. Added decoration clears before the source credits; the late spoken tag remains subtitled.

The local upload kit includes both films, separate YouTube and TikTok titles/descriptions, a 1920×1080 YouTube thumbnail, a **1200×1600 portrait TikTok profile cover**, optional captions and checksums. Full recording files and upload assets stay local. Source integration does not publish the recording to a video platform or create a public media release.

[Delivery receipt](evidence/delivery-receipt.json) · [Desktop handoff](evidence/desktop-handoff.json) · [Checksums](evidence/delivery-checksums.sha256) · [Posting assets](publishing/README.md) · [Production and verification](PRODUCTION-NOTES.md)

## Historical v1 review and final-file verification

The project owner explicitly confirmed complete actual-audio review, uncertain events at reduced speed and both layouts, then authorized rendering of `preview-v1-live-capitalized`. The strict gate remains unchanged. Its completed cue records identify human attestation as the review basis; no granular playback telemetry or automated listening is claimed. Those final files retain the approved v1 inputs. Revision 2 changes English display focus in the preview only.

- Both final films contain **17,647 frames at 60 fps**, with every timestamp checked and strict full-file decode passing.
- Each format passed **168,742 visible word-state checks**, with **zero mismatches and zero ambiguous classifications**.
- All **12,666 AAC packets**, their timestamps and **12,969,984 decoded stereo sample frames** match the original. The decoded audio SHA-256 is identical.
- The metadata correction preserved every native 10-bit pixel hash and timestamp across both films.

Before production, the SVG checks covered **70,730 visible word-color states**; browser geometry covered **6,036 states** with no missing words, overlaps, clipping or glyph movement. Twenty-two compositor proofs verified the production typography against the approved preview. An intentionally shifted encoded diagnostic demonstrated that the focus checker detects incorrect timing.

Software checks establish agreement with the approved map and preservation of the source timeline. The subsequent semantic audit found incomplete English spans despite that agreement; the v1 results are not proof that its map was semantically complete. Human acoustic review is recorded separately. Raw alignment disagreements remain available as provenance; frame quantization and physical playback latency are not claims of perfect acoustic accuracy.

[Completed review](evidence/history/delivery-v1/cross-language-sync-review.json) · [Authorization](evidence/history/delivery-v1/render-authorization.json) · [Timing audit](evidence/history/delivery-v1/final-sync-audit.json) · [Technical checks](evidence/history/delivery-v1/technical-checks.json) · [Browser geometry](evidence/history/delivery-v1/browser-geometry.json) · [Frozen identity](evidence/history/delivery-v1/preview-identity.json)

## Text and timing

- **86 displayed cues, 586 Spanish words and 636 English tokens**, prepared from 55 independently aligned performance windows.
- Both supplied lyric references are retained. The transcription follows this live recording, including its early heart refrain, shortened refrain endings, three “mucho” repetitions and final spoken “Esto se acabó.”
- Every cue starts with a capital letter. Internal text uses sentence case; a wrapped continuation is not automatically capitalized. Spanish accents and Rioplatense forms are retained, including `párpado`, `estadía`, `Perdoná`, `sumás`, `aumentás` and `hacés`; `Quedate` remains unaccented.
- English words follow their corresponding Spanish source intervals. Reordered words keep their own events; necessary grammatical completions receive the complete mapped focus. Gaps remain gaps, without fabricated English syllable timings.
- Preview picture, sound and graphics follow one video clock. Production preserves the original 24000/1001 fps picture cadence on the 60 fps graphics timeline, with the final source picture held through the remaining audio.

[Performed Spanish](source/lyrics-performed-es.txt) · [English translation](source/lyrics-translated-en.txt) · [Meaning mappings](source/translation-templates.json) · [Timing and coverage notes](SYNC-NOTES.md)

## Run locally

Requires Node with direct TypeScript execution, npm and FFmpeg. The committed lockfile pins dependencies. Production uses macOS VideoToolbox HEVC Main10 encoding; the preview does not require that encoder.

```sh
npm ci
# Restore the locked local recording using source/PREPARATION.md.
npm run check
npm run preview
```

The review preview remains available at **http://127.0.0.1:4321/**, with 16:9 / 9:16 selection and normal or reduced-speed playback. `Start Preview.command` starts it on macOS. The interface labels revision 2 and offers a correction checkpoint menu. Current status is in the [review record](evidence/cross-language-sync-review.json) and [project status](status.json). Saving preview notes never authorizes production.

To rebuild this English-focus correction without recalculating acoustic boundaries:

```sh
node scripts/translation-templates.ts
node scripts/remap-translations.ts
npm run layout
npm run check
npm run preview:freeze
```

Changed review inputs invalidate prior signoff. Recheck the affected material and obtain authorization for the new revision before rendering. See [production reproduction](PRODUCTION-NOTES.md#reproduction) for cache capture, diagnostic proofs, full rendering and final verification.

[Original live recording](https://www.youtube.com/watch?v=uvLVcEBIn-4) · [Source preparation](source/PREPARATION.md) · [Design brief](PREVIEW-BRIEF.md) · [Workflow findings](WORKFLOW-NOTES.md)
