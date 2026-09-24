# Pixel-art lyric film workflow

Use this guide when a song benefits from a custom pixel-art place such as a rainy night city, apartment block, arcade, street or interior world. Begin with the current [cinematic lyric workflow](cinematic-lyric-workflow.md), [audio-reactive motion specification](emotional-audio-reactive-motion.md), [bilingual lyric workflow](bilingual-lyric-workflow.md) and [preview-before-render gate](preview-before-render.md). The [pixel city reference study](studies/pixel-city-visualiser-2026/README.md) describes two distinct references: a dark architectural pixel scene and a separate canvas-animation project whose transferable value is its planning and determinism.

This is an optional visual treatment. Do not apply it by default to songs whose source art, story or mood calls for a different look.

## 1. Brief and research the actual reference

Write one sentence describing the place, its emotional role and the feeling of the song. Record the exact reference links, which element of each source is being studied, the aspect ratio and duration, and the observation method. Use a readable contact sheet or seek through representative held frames, beginnings, transitions, endings and changing focal details. Distinguish what is visible from interpretations about how a reference was made. Do not claim per-frame or audio analysis that was not performed.

Separate **art direction** from **production mechanics**. The city post informs deep architectural framing, the hierarchy of lit windows and signs, and restrained exploration of a persistent setting. The procedural-film project informs planning documents, deterministic scene code, time-indexed drawings, caching, audio cue schedules and contact-sheet review. Its cream paper, ink strokes, butterfly shapes, storyboard timings and synthesized score are not the city art direction.

Record only rules that help the song's new world. Do not trace the reference's full facade, reuse its named signs or copy its specific layout. Make a new street plan, typography, room inventory and silhouette language.

## 2. Set a pixel and palette contract

Define the final delivery frame rate, sizes and both aspect ratios before drawing. Choose a logical pixel grid that enlarges cleanly to the final encoded frame. Every building edge, window, sign and raindrop should land on that grid. Use deliberate integer scaling and nearest-neighbor enlargement for pixel layers; disable smoothing for those layers only. Do not globally force pixel rendering onto sharp bilingual text or other measured geometry.

Choose a small named palette by role: two or three night and shadow levels, a structural mid-tone, a distinct lit-glass family, a warm human-light family, and one or two controlled sign accents. Keep hue and luminance steps large enough to survive downsampling and 4:2:0 video. Limit accent colors to the signs or rooms that need focus. Keep lyrics and their complete active translations readable above the actual brightest scene frames.

Set texture rules too. Use grouped pixel clusters, varied but planned window spacing, selective checker or ordered dithering on chosen surfaces, and directional rain. Avoid isolated single pixels with no compositional purpose, uniform noise over every surface, gradient-like blur that breaks the pixel grid, thin saturated lines that vanish in encoding, and chaotic window patterns that flatten into visual noise.

## 3. Design a stable city world

Plan the world as back-to-front layers with named ownership:

1. deep sky, distant skyline and far rain;
2. far building masses and sparse lights;
3. target building silhouettes and stable floor geometry;
4. room interiors, shop fixtures, people and embedded visualisers;
5. facade frame, eaves, balconies, fire escapes and signboards;
6. front rain, glass glints and selected water trails;
7. wet ledge, street, a small moving vehicle or other scale cue;
8. restrained atmosphere and separate lyric/title layers.

Draw 3–5 useful floor archetypes such as sleeping rooms, a laundry, an arcade, a small cafe, a stairwell and a rooftop. Place each room in a floor plan table with bounds, window mask, primary light, silhouette, local spectrum channel and movement allowance. Reuse the archetypes, not identical repeated interiors: vary occupancy, color state, props and sign widths while preserving consistent building proportions. Roofs and walls occlude rain. Indoor bars remain behind window glass. Foreground rain can cross the building only when the composition says it is closer than the facade.

For an optional city map, define building footprints, heights, signs, entrances, connecting alleys and light sources once. Make camera limits and transitions explicit. Give the opening and ending matching geometry if the music should loop. The map and repeated floors should make slow camera movement easy to follow.

## 4. Let the building carry the visualisers

Analyze the exact locked song audio and create a song-specific, frame-indexed measurement stream. Keep raw source measurements separate from artistic display transforms. Use a small number of frequency bands or reviewed event cues; document each band's units, normalization, smoothing, floor/ceiling, spatial owner, display range and fade. Calibrate against quiet, loud and vocal-only passages from this song. Never assume a high-frequency spike means a lyric or a new camera cut.

Give each room one simple role. For example, a bar stack may illuminate windows in an arcade; a slim row of cells may appear above a cafe counter; low frequencies may add a brief warm pulse along a selected floor beam; a single reviewed onset may switch on a sign. Keep values quantized to clear pixel states. A lightly smoothed level can control how many cells are lit, while selected exact cues control an ignition or section change. Most frames should remain below maximum.

Keep environmental motion separate from audio motion. Rain continues at a steady, scene-appropriate rate. A few reflected lights, one sign or one threshold-crossing drop may react to a reviewed event; the whole building should not shake on every transient. Lyrics keep their stable positions, legible contrast and exact shared bilingual timing while the rooms move behind them.

## 5. Construct rain as a layered physical effect

Use deterministic raindrop records with seed, depth, initial world position, speed, slant, length, brightness and fall interval. Compute every position from the locked frame/time, so seeking directly to a frame produces the same scene as playing forward. Recycle drops at the top by modulo height instead of generating new random pixels each frame.

Vary three restrained depth groups: short, dim background specks; narrow mid-distance dashes; and a few longer, brighter foreground drops. Angle streaks consistently with the wind. Keep most movement vertical or slightly slanted and avoid screen-wide strobing. Add tiny eave drips or glass trails only at specific contacts. Put reflection marks below nearby lit signs and window banks, clip them to wet pavement, and let them blur or step softly without losing the pixel structure. Do not add splash rings, branch-like streaks, constant camera shake or random color cycling unless a reviewed musical or physical event supports them.

Control density with masks: less rain around lyric-safe space and essential small labels, none inside dry rooms, and a dark backing behind text where needed. Check that bright rain does not resemble unintended lyric punctuation or false letters.

## 6. Map musical sections to visual behavior before coding

Storyboard the opening, verses, lift, chorus, bridge and outro as needed for the song. Include explicit time boundaries, room/landmark, camera position, lyric placement, audio evidence, rain state and event cues. Reserve larger pans or new neighborhoods for genuine structural change. Sustained notes or louder vocals can increase selected interior levels without forcing a cut.

Use a calm entry to establish the complete facade. Reveal neighboring blocks slowly enough to read the architecture. On a chorus, wake only the chosen windows or sign row; keep the change visible but preserve the city geometry. A bridge may settle to one occupied room with ongoing rain. The ending can return to the opening landmark and room-light state for a seamless loop. These are starting patterns, not fixed song timings.

## 7. Build for Remotion and repeatable review

Keep the existing Remotion project, locked source soundtrack, render settings and preview-first workflow. Do not transplant another project's HTML player, Web Audio composition or image-copy pipeline. A typical implementation can separate components such as:

- `CityLayout`: immutable building and room geometry;
- `PixelBlock` / `PixelSign`: named pixel shapes and font treatment;
- `RoomState`: frame-indexed interior colors and spectrum cells;
- `RainField`: deterministic depth-sorted drop positions and masks;
- `CityCamera`: storyboarded world view and easing;
- `LyricLayer`: sharp bilingual text and shared highlight mapping, independent of the pixel grid.

Cache static city geometry, masks, sign lettering and fixed room furniture. Recompute only frame-varying states such as lights, selected people/vehicle motion, raindrop positions and visualiser cells. Derive all motion from Remotion's frame number and recorded audio analysis. Seed static variation by stable room/prop id; never use unseeded `Math.random()`, wall-clock time, network state or asynchronous render order.

Before drawing every room, define the scene map, palette, grid, frame safe areas, visualiser mapping and rain layers in an art bible. Then create the storyboard with explicit time boundaries, transitions and cue provenance. Make a low-resolution style proof with three different floors and one rain sample before populating the complete map. Confirm that the scene reads at phone size and that the pixel grid survives both exports.

## 8. Preview, inspect and approve before production render

Create a complete playable preview with the actual intended city background, rain, embedded visualisers, lyrics, transitions and source audio. Provide both the 16:9 and 9:16 compositions. Never show a lyric-only diagnostic as though it were the finished preview.

Review contact sheets at regular intervals and on the opening, ending, section transitions, loudest events, brightest sign, densest rain, darkest quiet and held endings. Inspect frame-by-frame for off-grid pixels, accidental window flicker, clipped room masks, missing rain, light that ignores an occluding wall, wrong sign lettering, visualiser saturation and loop mismatch. Also view at normal speed and reduced speed to catch shiver, stutter and brightness pumping. Listen with the picture; the contact sheet cannot verify audio sync.

Check each aspect ratio separately at native output dimensions and mobile display size. Look for lyrics touching neon, UI safe-area collisions, lost colored pixels after encoding, and rain that crosses glyphs too strongly. After any correction, regenerate the complete preview and recheck its source/audio identity. Follow the existing explicit preview acceptance, synchronization gate and render authorization before full-length production.

## Reusable quality bar

- The place reads instantly as architecture rather than a decorative equalizer wall.
- Pixel groups form purposeful room, window, sign, person and rain shapes; no unexplained specks or excessive dithering.
- Rain has consistent wind, depth, masks, speed and fixed-seed frame behavior.
- Every audio-reactive visual has a documented source measurement or reviewed event and remains assigned to a believable object.
- Moving the camera or lights never changes lyric wording, language equality, word timing or safe-area placement.
- First/last frames, transition boundaries, repeated room states and all intended visual layers are present in the playable preview.
- Portrait and landscape variants are both composed and reviewed at their encoded size.
- Only after the preview and sync review are accepted does full production rendering proceed.

## Worked city implementation: Rainline

The [Rainline production record](../projects/spikeriser-rainline-lyric-film/PRODUCTION-NOTES.md) follows the reference study through original artwork, 18 lyric-host assignments, three preview revisions, scoped local exports and final-file verification. Its source video was measured numerically across every decoded frame, with visual inspection of contact sheets and selected sequences; those are distinct evidence claims. The implemented words occupy existing shop, tower, train and airship glass. One rail service travels on a continuous path, pedestrians remain above the curb, and a cat-focused camera hold covers the related line. Both compositions use the same source-clocked scene with separate framing. The 12-band response lights building panels, while words follow the provisional acoustic map. Its detailed actual-audio and both-format cue review remains pending; the separate scoped delivery record does not change this guide's default gate.
