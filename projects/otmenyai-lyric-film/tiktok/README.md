# Отменяй — TikTok profile cover

The corrected cover is a dedicated **1200×1600 portrait** composition for the tall profile preview labelled “4:3” in the observed upload interface. The file's actual width:height ratio is **3:4**. It replaces the previous landscape arrangement, which lost part of the title and face in the portrait crop.

![Corrected portrait cover at 300×400 review size](profile-300x400.png)

## Files

- `Otmenyai-TikTok-Cover-Profile-1200x1600.jpg` — selected upload file.
- `cover-generated.png` — selected generated image before dimension normalization.
- `profile-150x200.png` and `profile-300x400.png` — profile-size visual reviews.
- `crop-stress-300x400.png` — local simulation removing 5% from every edge.
- `cover-prompt-v2.txt` and `cover-refinement-prompt-v2.txt` — exact generation and final layout-refinement prompts.
- `cover-verification.json` — dimensions, hashes and reviewed checks.

The source face is centered above the complete title and artist name. Large condensed lettering, a protected near-black text area and the original red/black/gray visual language make the title readable at profile size. The crop stress check is a local simulation; it does not claim verification in a live uploader.

## Method

Built-in image generation adapted the approved YouTube/landscape cover and source illustration, followed by a targeted typography-position refinement. The tool did not expose its image-model version. The selected image was resized with Lanczos, minimally edge-cropped to the exact canvas and exported as a high-quality JPEG. No change to the video, soundtrack or lyric timing is part of this cover correction.

Reproduce the delivery sizing and review images with FFmpeg:

```sh
ffmpeg -y -v error -i cover-generated.png \
  -vf 'scale=1200:1600:force_original_aspect_ratio=increase:flags=lanczos,crop=1200:1600,setsar=1' \
  -frames:v 1 -q:v 1 -pix_fmt yuvj444p Otmenyai-TikTok-Cover-Profile-1200x1600.jpg
ffmpeg -y -v error -i Otmenyai-TikTok-Cover-Profile-1200x1600.jpg \
  -vf 'scale=150:200:flags=lanczos' -frames:v 1 profile-150x200.png
ffmpeg -y -v error -i Otmenyai-TikTok-Cover-Profile-1200x1600.jpg \
  -vf 'scale=300:400:flags=lanczos' -frames:v 1 profile-300x400.png
ffmpeg -y -v error -i Otmenyai-TikTok-Cover-Profile-1200x1600.jpg \
  -vf 'crop=1080:1440:60:80,scale=300:400:flags=lanczos' -frames:v 1 crop-stress-300x400.png
```

Future publishing kits follow the [TikTok cover workflow](../../../docs/tiktok-cover-workflow.md) automatically.

## Credits and rights

Music, lyrics and source artwork: [REDCHINAWAVE — Отменяй](https://www.youtube.com/watch?v=U9SYUPV0QrA). [Support the artist](https://linktr.ee/redchinawave). The source illustrator has not been independently identified. Cover direction and presentation: Ael, with OpenAI Codex assistance and built-in AI image generation. Original source authorship remains with its creators.

The [CC BY 4.0 policy](../../../LICENSE.md) applies only to eligible project-owned workflow contributions. The adapted cover is mixed third-party media and is not offered as a wholly CC BY asset. [AI disclosure](../../../AI-DISCLOSURE.md).
