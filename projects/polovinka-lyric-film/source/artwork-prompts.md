# Cover artwork specifications

Tool: built-in image generator. Reference inputs: `evidence/performer-reference.png` and `evidence/performance-reference.png`, extracted from the native source picture at 70 and 80 seconds by full-decode frame selection. Both were inspected before generation.

## YouTube

Premium landscape 16:9 editorial music poster. Preserve the source performer's recognizable face, period hairstyle, amber sunglasses, black leather jacket, red top and cream guitar. Warm amber key light, subtle turquoise rim, charcoal/brick backdrop, restrained tactile grain. Performer and instrument occupy the right; huge cream condensed Cyrillic title occupies the left. Exact wording: “ТАНЦЫ МИНУС”, “ПОЛОВИНКА”, “RU / EN”. No other text, logos or borders. Require readable artist and dominant title at 320×180. Source output is `cover-youtube-generated.png`; final delivery is normalized to 1920×1080.

## TikTok

Dedicated portrait 3:4 composition. Waist-up performer with cream guitar occupies the middle/lower area; title and artist are above the face. Match the landscape palette, source identity and illustrated photographic treatment. Exact same wording. Require complete title, artist and face with safe margins, and readability at 150×200. Source first pass is `cover-tiktok-generated.png`.

Margin revision: preserve face, instrument, wardrobe, lighting, background and wording. Move the artist line downward, reduce title height slightly and keep every letter clear of the frame edge and subject. Require all typography to survive removal of 5% from each edge. Final source is `cover-tiktok-final-generated.png`; delivery is normalized to 1200×1600 and checked under the specified crop.

Dimension normalization and small/cropped QA previews use FFmpeg Lanczos scaling. Original generated PNGs remain available with their generation metadata.
