# Твои глаза — publishing kit

Artist: POLNALYUBVI. Original music and animation: https://www.youtube.com/watch?v=qC4sCCmvoXU

- Profile cover: use the JPEG named `Profile-1200x1600`. It is portrait, 1200 pixels wide × 1600 tall, with a 3:4 width:height ratio.
- Title and descriptions: editable UTF-8 text, with original-creator credits and AI assistance disclosed.
- Captions: Russian, English and bilingual SRT. These are optional line-level captions; synchronized word/meaning emphasis is already rendered into the films.
- Cover source: selected built-in imagegen original, exact prompt and native/profile-size/crop review record.

## Complete posting handoff

The final local posting folder contains:

| Platform | Film | Thumbnail | Copy |
| --- | --- | --- | --- |
| YouTube | `YouTube/Tvoi-Glaza-YouTube-1920x1080.mp4` | `YouTube/Thumbnail-3840x2160.jpg` | `YouTube/Title.txt` and `YouTube/Description.txt` |
| TikTok | `TikTok/Tvoi-Glaza-TikTok-1080x1920.mp4` | `TikTok/Profile-Cover-1200x1600.jpg` | `TikTok/Description.txt` |

The public source files for the copy are [YouTube title](Tvoi-Glaza-Title.txt), [YouTube description](Tvoi-Glaza-Description.txt) and [TikTok description](Tvoi-Glaza-TikTok-Copy.txt). The [posting-handoff addendum](../evidence/posting-handoff-addendum.json) verifies both video copies, both covers, the copy files and instructions. Paths in that receipt are relative to the local posting folder; the media files are not hosted in this source checkout.

### Both thumbnail formats

- **YouTube:** 3840×2160 JPEG, 577,603 bytes; dedicated landscape composition with title at left and the same cover character at right. Generated with built-in imagegen from the existing portrait cover, then resized with Lanczos from 1672×941 to the delivery raster. The larger file dimensions do not imply native 4K generated detail. Exact [prompt and tool record](youtube-thumbnail-prompt.json); title, artist and face inspected at 320×180.
- **TikTok:** 1200×1600 JPEG, 169,741 bytes; the existing approved portrait cover. Native, 150×200 and crop review are documented in the [cover review](cover-source/REVIEW.md) and [manifest](cover-manifest.json). Its 3:4 width:height ratio remains distinct from the 9:16 video.

The YouTube thumbnail was completed after the original publishing ZIP was frozen. Its prompt and identity are recorded here as an addition. The original delivery receipt, archives and checksum inventory remain unchanged. Both thumbnails and their instructions are present in the final local posting folder; no platform upload is claimed.

Added translation and lyric presentation by Ael with OpenAI Codex, following the Lyrics workflow in general. Original music, lyrics, recording, animation and source-derived cover imagery remain third-party works. This kit does not claim artist endorsement or grant rights over those works. Media are delivered locally or held in a draft release.
