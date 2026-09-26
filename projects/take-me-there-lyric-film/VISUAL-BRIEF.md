# TAKE ME THERE — integrate with the original picture

**Current direction:** `source-integrated-preview-v2` retains the actual music video and soundtrack, with large shot-aware lyrics, a spectrum fixed in each format and secondary response in existing scene lights. The full-length preview contains 37 provisional cues and 225 word events, including the restored lead at approximately 44.288–45.870 seconds. Listening review, creative acceptance and render authorization remain separate and incomplete.

## Source and scope

The video alternates intimate anime-style portraits with rooftop, car, city, rain and fireworks scenes. Blue and rose light recur, but framing, contrast and usable negative space change substantially. The spectrum uses that recurring palette and a stable reading relationship while preserving the source's expressive movement, lightning and dissolves.

**Preserve the commissioned source unless an explicit request changes the scope to original artwork.** A study of custom environments supplies useful integration techniques; it does not authorize replacing the song's picture. Generated replacement scenery is not part of this edition.

Landscape keeps the full original 16:9 frame. Portrait crops the same decoded frame using shot-specific centers and recomposes its reading region. This is an authored crop, not preservation of the complete source frame; review car interiors, two-person scenes and facial close-ups independently. Do not hide framing losses behind a claim that both formats show identical content.

## Shot map and lyric placement

`src/shots.ts` defines 28 contiguous visual intervals, normalized reading boxes, portrait framing suggestions, cool/rose emphasis and environment polygons. The [source integration plan](evidence/source-integration-plan.md) records their picture families and difficult passages.

The map was based on native stills and source-wide half-second sampling. Dissolve handoffs are approximate visual midpoints, not frame-exact cut detection or object tracking. Review them in motion. A change of shot must not reset a held word's acoustic event.

Space Grotesk 700 lettering reserves full phrase geometry before playback. Text uses open sky where available, the lower car body in selected side views, and deliberately composed nonfacial regions in close-ups. In those close-ups the type is a readable graphic; it does not pretend to be attached to a physical sign. The two eye close-up runs and the fireworks ending need particular contrast and face-clearance review.

The composition reserves a fixed spectrum rectangle and a 34-pixel landscape or 50-pixel portrait gap before fitting text. A lyric host that would overlap that region moves upward. Review the resulting host against the actual frame: moving a box to avoid the spectrum does not establish face clearance or a new physical surface.

Active words gain light matching the current shot's ice-blue or rose palette. Inactive words retain readable cool contrast. Glyphs do not bounce or grow with the beat. Soft continuous exposure shaping belongs to the shot, rather than a rectangle appearing behind each cue. Limited light spill is reserved for regions identified as a real body or wall; there is no invented mirrored lyric in the sky.

Repeated hook echoes can relight one stable “there” slot. Their IDs and acoustic intervals remain distinct, including rests between events. Display compression is not permission to ignore unresolved echo counts.

## A stable primary spectrum

The primary spectrum is a deliberate screen-space graphic whose color, softness and local spill match the film. Its anchor and dimensions stay fixed throughout each format:

| Format | Canvas | Spectrum `(x, y, width, height)` | Baseline |
| --- | --- | --- | --- |
| Landscape | 1920×1080 | `(250, 864, 1420, 146)` | 1010 px |
| Portrait | 1080×1920 | `(108, 1490, 864, 174)` | 1664 px |

Forty-eight columns interpolate adjacent values from the 24 measured bands. Display height uses `band^0.88 × (0.40 + 0.60 × energy)`, with a 1.8% minimum shaft height. Columns have colored bloom, bright narrow cores and a gradual fade toward the baseline. A shallow local light pool integrates the shafts with source texture. It is light spill, not a claimed reflection on every source shot.

Spectrum color blends between ice `(104,187,244)` and rose `(243,124,194)` over 0.5 seconds at a shot handoff. Cuts do not relocate, resize or fade the spectrum. Only the overall opening and ending apply its edge envelope: a 0.15-second entrance and a 0.2-second exit ending at 134.8 seconds. Its heights always use the measured source-time bands rather than a decorative wave or a new beat grid.

## Secondary response in the picture

The compositor also samples the current decoded source frame at 640×360, selects existing bright pixels inside environment polygons, and applies bounded response to those pixels. It retains their source color and shape.

| Host | Response | Protection |
| --- | --- | --- |
| Existing windows | Frequency energy controls lit reach through existing window floors, with moderate dimming between hits | Exclude principal faces and the source credit; retain native window shapes |
| Existing stars | Gentler light response | Do not add a competing artificial star field or amplify lightning |
| Wet surfaces | Restrained response on actual reflected highlights | Keep emission subordinate; do not create a floating mirror strip |

Window regions distribute 12 lower bands on the left and 12 upper bands on the right. Stars and reflections use the local 24-band distribution. A source-color layer and bounded emission layer provide contrast and spill; environmental bloom uses 9-pixel landscape or 13-pixel portrait blur. These secondary masks retain a 0.45-second handoff envelope because their static exclusions are least reliable during dissolves. That envelope does not affect the fixed primary spectrum. The source's fireworks remain the ending's principal picture event.

Polygons are exclusion regions, not tracked surfaces. Luminance thresholds further select source detail, but cannot prove that every surviving pixel belongs to the intended material. Review the actual moving frames for skin, smoke or bright objects entering a region. Reduce or remove response where reliable exclusion is not possible.

## Clock and evidence contract

One native video element owns the picture, soundtrack and source time. The canvas draws its decoded frame and reconstructs word focus and visual response from that time. Playback, paused seeks, layout changes and recovery must maintain the same relationship; an advancing media clock alone does not prove that the picture is updating.

Keep three independent layers of timing:

- **Acoustic word events:** individually identified source intervals, with unresolved evidence visible.
- **Reading visibility:** a bounded phrase lead/release and neighboring-cue handoff; it does not prolong word highlighting.
- **Decoration:** source-time feature lookup and shot-specific display envelopes; these do not change lyric times.

RMS, positive spectral flux and 24 logarithmic bands are measured at 60 Hz over the full recording. Their centered 2048-sample window at 22,050 Hz spans approximately 92.88 ms. These are useful musical-response features, not verified vocal onsets or beat labels. Source-specific normalization preserves variation, while scene emission and blur remain artistic choices to judge separately.

## Repository lessons applied

| Reference | Applied principle |
| --- | --- |
| [Scene integration](../../docs/scene-integrated-visuals.md) | Match lighting, material and depth; use a deliberate graphic where no trustworthy physical host exists |
| [Rainline art bible](../spikeriser-rainline-lyric-film/ART-BIBLE.md) | Reserve a real reading region before effects; this principle does not imply replacing source footage |
| [Rainline aperture checks](../spikeriser-rainline-lyric-film/tests/native-apertures.test.ts) | Check text against independently observed geometry rather than expanding bounds to satisfy a test |
| [Source-clocked word effects](../../docs/source-clocked-word-effects-workflow.md) | Separate acoustic events, exact word selectors, features and decorative tails |
| [Moon study](../../docs/studies/moyka-moon-2026/README.md) | Keep picture changes, phrase visibility and word focus independent |
| [If The Sun Burns Out Tonight lessons](../if-the-sun-burns-out-tonight-lyric-film/PRODUCTION-LESSONS.md) | Verify decoded picture motion and recovery, not just playback time |

Prior films supply techniques and failure examples, not inherited listening approval or proof of quality for this recording.

## Before accepting this revision

- Resolve the lexical and echo uncertainties listed in the [README](README.md#outstanding-listening-review), including “Leave”/“Live,” chopped words and late fragments.
- Review every phrase against the actual audio at normal speed and uncertain boundaries at reduced speed.
- Inspect changing faces, longest rows, inactive contrast, active focus and shot handoffs in both formats at native and realistic player sizes.
- Compare the primary spectrum and secondary source-light response during quiet, intimate, city and peak passages. Confirm the fixed anchor survives cuts, lyric hosts stay clear, and local spill does not wash out the picture.
- Verify source motion after fresh load, seek, restart, format switching and recovery. Distinguish the brief original black tail near 134.8 seconds from any newly introduced blank frame.
- Record technical, listening and creative results separately. A screenshot cannot certify motion or acoustic precision.
- Obtain current-revision render authorization and prove renderer parity before production. No final renderer or delivery kit exists at this stage.
