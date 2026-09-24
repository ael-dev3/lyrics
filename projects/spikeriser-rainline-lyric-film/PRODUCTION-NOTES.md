# Rainline: production process and delivery record

This record covers the original pixel-art lyric film made from the soundtrack in [SpikeRiser's X post](https://x.com/SpikeRiser/status/2102888874858959029). It links the source study, provisional transcription, artwork, successive city revisions, playable review, scoped exports, and final-file checks. The source video and soundtrack, full MP4s, and local working captures are excluded from Git.

## 1. Lock and study the source

The post supplied neither a lyric sheet nor a confirmed song or performer credit; its automatic captions contained no performed text. The downloaded 960 × 540, 30 fps video and stream-copied 48 kHz stereo AAC soundtrack were identified by SHA-256 in [SOURCE-LOCK.md](SOURCE-LOCK.md). The soundtrack is the sole audio clock for the lyric events and measured spectrum. No song title or artist is inferred from the post.

The [reference study](REFERENCE-STUDY.md) measured regional motion across all **7,415 decoded video frames**, inspected one-frame-per-second contact sheets across the recording, and examined selected two-frame-per-second crops and consecutive-frame sequences. This was an automated full-frame scan plus sampled visual inspection, not a claim of manual semantic inspection of every frame. It found a fixed rainy city with a roughly 30.9 s visual loop, elevated train passes about every 15.45 s, brief airship streaks, umbrellas, opposing road traffic, neon storefronts, and a luminous circular sky. These observations supplied the scene's layered grammar and scale. The new city, vehicles, signs, cat, and lyric choreography are original artwork and editorial choices; no source video frame is composited into the film.

## 2. Derive a reviewable lyric clock

With no supplied text, two full Whisper small passes and targeted medium and large-v3-turbo passes established a **provisional** 18-line, 76-word transcription. Six bounded alignment passes—Wav2Vec2, MMS, and stable Whisper on the original mix and a vocal stem—supplied independent boundary candidates. Chosen starts and ends are recorded observations snapped to the original 48 kHz sample clock, not words distributed proportionally through lines. Repeated refrains were aligned separately. See [TRANSCRIPTION.md](TRANSCRIPTION.md), [the candidate table](evidence/word-alignment-candidates.json), and [the canonical cue map](src/word-cues.json).

The evidence still leaves material uncertainty: 73 of 76 words have at least one candidate boundary disagreement over 25 ms, and 30 have CTC spread over 250 ms. The first word of `V1-02` may be “Ceiling” or “sealing”; the committed choice remains flagged. Automatic passes found no clear lexical singing after roughly 187 s, but the tail has not received a complete listening review. `npm run timing:verify` checks data integrity and provenance, not acoustic truth. The actual-audio, every-cue, both-format synchronization record remains [pending](evidence/sync-review.json).

## 3. Build the city around lyric-bearing surfaces

Five selected imagegen assets supply independently composed landscape and portrait districts, a separate airship and train, and a taxi/cat/umbrella sprite atlas. Their identities, sizes, and condensed briefs are in [ASSET-PROVENANCE.md](ASSET-PROVENANCE.md). A deterministic Canvas painter adds source-clocked depth layers and motion: heavy near/far rain, lightning and sky-ring light, a single recurring four-car service on the viaduct, opposing taxis, five small hover cars, steam, shop light, and gait-cycled umbrella walkers whose feet stay on three paved sidewalk lanes above the curb. Distinct landscape and portrait compositions preserve the same city while fitting their own frames.

The 18 sung lines use **five shop, five train, seven tower/building, and one airship** lyric hosts. The airship carries the `CH-03` “Lightning” word at ordinary skyline scale; its other flights carry ambient service text. Train words ride the existing service rather than a second vehicle appearing for a cue. The 5 × 7 pixel font is fitted, colored, and clipped to the art's original glass apertures, including moving metal displays; active words brighten in place. Shop lines span fascia signs, with a built-in municipal-board relay for portrait readability. This avoids freestanding subtitle slabs or solid rectangles pasted across storefronts. The [art bible](ART-BIBLE.md) and [choreography map](REFERENCE-STUDY.md#v4-adaptation-against-this-soundtrack) specify the hosts, depth and time windows.

The soundtrack also drives 12 measured spectral bands in two tower light panels and a short civic-board strip. The [analysis record](evidence/spectrum-analysis.json) specifies the frequency bands, RMS treatment, per-band ceilings, and display mapping. These lights are environmental response, not a detector used to infer lyric timing.

## 4. Iterate the complete moving preview

| Revision | Main change | Preserved evidence |
| --- | --- | --- |
| `preview-v2-city` (`0a881ca`) | Initial full city and source-clocked words with a review player. | [v2 frozen identity](evidence/history/preview-identity-v2-city.json) and historical checks in `evidence/history/` |
| `preview-v3-street` (`776c0c6`) | More rain and cyberpunk traffic; smaller, rarer airship; one slower train on the established rail; stronger storefront/tower use; improved walking motion; prolonged, smoother cat focus. | [v3 frozen identity](evidence/history/preview-identity-v3-street.json) and historical checks |
| `preview-v4-native` (`52e3c56`) | Lettering fitted directly into native sign and vehicle glass; moving text follows vehicle coordinates; three sidewalk depth lanes; refined portrait rail pushes and cat-adjacent display. | [v4 identity](evidence/preview-identity.json) and [limited technical preview checks](evidence/technical-preview-checks.json) |

The local browser review page plays the full recording and both formats with seeking, speed control, cue navigation, notes, and visual recovery. The same `paintCity(context, frame, format)` scene function serves browser playback and the later Remotion capture. Motion was checked at sampled points in the browser; selected v4 stills covered shops, train, ship, and cat. The cat push begins at 173.3 s, settles by 175.1 s, holds through 180.5 s, and releases by 183.2 s so its window remains central through `V2-03`. These checks established the intended visual composition and selected transitions. They do not establish whole-film, frame-by-frame visual approval or word accuracy by ear.

The v4 freeze binds 30 source, code, art, and soundtrack inputs to SHA-256 identity `8933b9713474b0b9e42a7b19130d5f3a6728fde6eb80cf7e2dd463072be1f2cb`. The [project README](README.md) explains the runnable preview and the normal production gate. Historical v2/v3 evidence was retained rather than rewritten.

## 5. Scoped final exports and gate distinction

The normal `npm run production:gate` and committed [render authorization](evidence/render-authorization.json) remain **pending** because the detailed actual-audio and every-cue/both-format sync review is incomplete. The production path in `scripts/render.ts` was not used. Two separate, explicitly scoped `owner-approved-preview` acceptances covered local X-format exports of the frozen v4 scene, with the incomplete review disclosed. Neutral public copies of the scoped [portrait](evidence/delivery/portrait-acceptance.json) and [wide](evidence/delivery/landscape-acceptance.json) acceptance fields retain the song, revision, input and renderer hashes, authorization IDs, and review limits. This historical delivery acceptance is not a certification that the normal review gate passed and is not a general bypass for later revisions.

The exact one-off Remotion adapters are archived at [portrait](work/x-export/render.ts) and [wide](work/x-wide/render.ts), with their scene and entry files in the same folders. Each adapter checked the named song/revision, the preview identity, all 30 source hashes, its three renderer hashes, and the separate local acceptance before capture. The local originals of the acceptance records and full media are excluded from Git; the public acceptance copies normalize only their prose evidence basis, and the sanitized delivery receipts omit private filesystem paths. The archived scripts document the actual export route. Their task-relative output directory and installed-Chrome path are historical environment details; moving them to another workspace would require a fresh identity and authorization check.

For each output, Remotion sampled the 60 Hz city scene at `frame × 2` onto a **30 fps** timeline of **7,418 frames**. PNG frames were captured through installed Chrome and encoded as H.264 with `libx264` slow/CRF 16, BT.709, `yuv420p`, 20 Mb/s VBV cap, and 60-frame GOP. FFmpeg then stream-copied the locked original AAC into the picture and moved MP4 metadata to the front for progressive playback. This local Chrome route resolved a sandbox DNS failure while downloading Remotion's default browser binary; it did not change the frozen city or audio inputs. The wide edition was independently composed at 1920 × 1080 after a wide-format delivery request; it was not a stretch of the portrait output.

| Local output | Geometry | Duration / frames | Bytes | MP4 SHA-256 |
| --- | --- | --- | ---: | --- |
| `Rainline-X.mp4` | 1080 × 1900 portrait | 247.266667 s / 7,418 at 30 fps | 526,590,665 | `a62d5f931bf05a0af5661fe334091d83398350decfbb75e012e90de7692a27c5` |
| `Rainline-X-Wide.mp4` | 1920 × 1080, 16:9 | 247.266667 s / 7,418 at 30 fps | 594,246,963 | `9248b02c412fa12cb937450aa59163e7206aaed837fb5754fa9f6432213d0721` |

## 6. Verify delivery and retain limits

Both final MP4s passed complete FFmpeg video decode, codec/dimension/fps checks, `faststart` inspection, and an original-AAC packet hash comparison. The copied packet stream hash in both is `SHA256=4f041e225d099157e9dbb96a15b667acf717d616bfead75eba86116270939604`. Encoded visual samples were inspected at 12, 101, 177, 184, and 246 s in both formats, with a further 48.8 s sample in wide. Local delivery copies were checksum-matched at handoff. The [portrait](evidence/delivery/portrait.json) and [wide](evidence/delivery/landscape.json) receipts preserve machine-readable technical results without private filesystem paths. A [representative wide frame](../../assets/rainline-wide-final-177.png) is decoded directly from the verified final MP4.

With the excluded locked soundtrack restored, the project checks can be repeated from this project directory. The gate rejection is expected until the pending detailed review is completed:

```sh
npm ci
npm test
npm run typecheck
npm run timing:verify
npm run production:gate  # expected: incomplete audio and both-format review blocks production
```

For a local delivered MP4, compare `shasum -a 256 FILM.mp4` to its receipt, then use `ffprobe` for stream geometry and duration and `ffmpeg -xerror -v error -i FILM.mp4 -map 0:v:0 -f null -` for a full video decode. The stream-copy audio comparison used the same packet-hash command on `public/soundtrack.m4a` and each final MP4:

```sh
ffmpeg -v error -i INPUT -map 0:a:0 -c:a copy -f hash -hash SHA256 -
```

These commands verify byte identity and decoding. They do not replace listening to every provisional word against the actual recording.

The remaining review boundary is specific: no complete actual-audio listening log, no every-word synchronized inspection in both aspect ratios, no resolved `V1-02` homophone, and no confirmed tail classification. Full-file decode and selected picture checks cannot answer those acoustic questions. The [sync review](evidence/sync-review.json) and default [authorization](evidence/render-authorization.json) therefore remain pending. A new version should correct any adjudicated text/timing, freeze a new preview identity, review every cue with the actual audio in both formats, and use the normal gate before another production render.

## Reusable decisions

- Measure the reference's actual motion and depth before designing a new city; keep sampled visual inspection distinct from automated every-frame measurement.
- Make each lyric host a readable piece of the art with its own geometry, occlusion, and motion path. Use environmental signs more often than a giant moving carrier.
- Let one physical train service and a small airship follow continuous routes. Slow or push the camera toward native moving text when needed for reading.
- Keep pedestrians physically on sidewalks and align their gait, body scale, and feet to those paths. Give scene-specific subjects, such as the cat, enough hold time for the sung line.
- Bind renderer inputs and final receipts to exact hashes, while keeping technical validation, scoped delivery acceptance, and full acoustic synchronization review as separate claims.
