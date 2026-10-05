# YouTube standard-video delivery

## Check classification before composition

Decide whether the requested YouTube delivery is a standard video or a Short before choosing its export dimensions. Preserving the source's native aspect ratio and meeting a platform's classification rules are separate requirements.

YouTube states that square or vertical videos uploaded on or after 15 October 2024, up to three minutes long, are classified as Shorts. Its guidance recommends a wider aspect ratio such as **16:9** when a standard video is wanted. [Official YouTube guidance](https://support.google.com/youtube/answer/15424877?hl=en) (checked 5 October 2026).

Verify the current official policy for each new delivery. Inspect the actual encoded width, height, sample aspect ratio, rotation metadata and duration; a filename, landscape thumbnail or upload description does not establish the video's displayed aspect ratio. Record the selected platform format separately from the native source dimensions. Local compliance with these dimensions is not proof of a completed platform upload or its final classification.

## Adapt square artwork deliberately

For a standard-video edition of approved square artwork, **1920×1080 with square pixels** is a useful delivery target. Keep a 1080×1080 composition centered at x420–1499, preserving all original edges, text, focal subjects and environmental visualizer geometry. Continue suitable empty source material into the side regions. Do not stretch the square or crop away its subjects to fill the wide frame.

Choose edge material by inspection. Reflected curtain, cloth or floor texture can suit a photographed theatre; a different source may require another treatment. Avoid repeating people, buildings, readable words, source lettering or conspicuous scratches. When sampling an already lettered film, audit every cue's actual glyph bounds before selecting an edge strip. Prefer unlettered source material when the safe strip is too narrow. Keep the central composition sharp, and inspect extension joins rather than hiding them with an unrelated effect.

Review the complete wide composition at its native resolution and realistic desktop/mobile player sizes. A centered square occupies less of a wide player, so verify equal language prominence, active-word visibility and environmental response again. Adjusting the surrounding canvas must not silently change word timing, lyric lifetimes or the approved visualizer response.

## Verify and hand off the new edition

- Preserve original audio and the approved source clock. Check the new file's decoded frame count and every frame PTS, complete decode, dimensions, sample aspect ratio and rotation. Verify AAC packet timing/payload/priming and decoded audio identity when stream copying; do not infer audio preservation from matching duration alone.
- Check the central picture against the approved edition with suitable lossy-encoding tolerances, including word entrances, held endings, quiet passages and the final frame. Check complete-frame continuity for unintended black regions and duplicated edge subjects. Reencoding changes picture bytes even when composition and timing are preserved.
- Give the aspect adaptation its own output hash, verification report and receipt. Retain the earlier edition's reports under their original format and scope; do not relabel prior encoded-frame evidence as a test of the new file.
- Preserve prior receipts and user files. Identify one clear current YouTube upload file, update posting instructions and manifest/checksums, and distinguish any retained superseded edition from the current upload. Keep the TikTok edition and its evidence separately identified.

Follow the existing [preview and authorization gate](preview-before-render.md), [bilingual review](bilingual-lyric-workflow.md) and [scene-integration guide](scene-integrated-visuals.md). An approved aspect correction does not authorize unrelated design changes or a platform upload. Complete repository publication under the current GitHub Actions preflight policy.
