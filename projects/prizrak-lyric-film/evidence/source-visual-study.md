# призрак — original-video study

**Scope: source inspection and preview art direction; no full production render or listening attestation.** The selected picture is the actual [sotode 外で music video](https://www.youtube.com/watch?v=Psp5vt8BwoY), not newly generated artwork. Its winter narrative, handheld performance, sketchbook, practical moonlike light and source VFX provide the visual vocabulary.

## Source identity and credits

Downloaded upload metadata identifies **sotode 外で - призрак (music video)**, published 9 September 2026. The channel describes the group as a shoegaze band from Yekaterinburg. The upload credits directors **dana arshagti & anna ananich**, cinematographer **fedor levshin**, camera assistant **pavel inx**, and cast **marusya may, garold adventure, dasha geniyatova, roman muradov**. These are source-supplied credits, not inferred identities. Other credits remain in the original end card; preserve that complete card rather than rewriting uncertain names from thumbnails. The video description does not supply a reuse license.

| Probe field | Actual acquired source |
| --- | --- |
| SHA-256 | `8563f6b817c9b1cc39649363a52486214c691c0d98ae7bb82263021ac7363523` |
| Acquired streams | YouTube formats 137 + 140, H.264 picture and AAC soundtrack |
| Encoded image | 1920×1080, square pixels, progressive, limited-range BT.709, yuv420p |
| Picture cadence | 25 fps; 6,376 original frames; 255.040000 s |
| Soundtrack | Stereo AAC, 44,100 Hz; presentation extent 255.094422 s |
| Timeline zero | Picture and presented audio begin at zero; preserve original priming contract rather than applying a second compensation |
| Local bytes | 109,199,355 |

The stream is 16:9. Normal photographed scenes contain authored horizontal matte bands, visibly about 75 source pixels above and below the active picture at the inspected 20-second bus frame. Bright transitions and end-card effects can occupy the wider encoded frame. The current design therefore preserves the complete 1920×1080 image; a permanent crop based on one photograph would discard authored transition content. A whole-source `cropdetect` union was affected by flashes and returned full-frame bounds; it is not independent proof that all scenes have identical active edges.

## What was inspected

- All **6,376 decoded frames** were analyzed at 160×90 with FFmpeg `signalstats`. This discovers exposure/saturation extremes; it does not mean every native frame was visually read.
- A full-duration overview contains **64 evenly distributed thumbnails**, at four-second sampling cadence. The overview includes the opening, every major environment, quiet-looking shots, bright practical light, busy ensemble shots, snow, tunnel, credits and the final optical texture.
- A separate every-frame coarse cut/change scan uses `scene > 0.18` after scaling to 160×90. All **154 selected change candidates** were visually inspected on ten sheets. They include cuts, rapid motion, orb flashes and scratch overlays, so 154 is **not a shot count**. The candidate timestamps are discovery points, not source edit decisions or musical beat annotations.
- A native 1920×1080 frame at 20 seconds verifies full ensemble/bus geometry and the matte bands. An additional ending overview samples the last 23 seconds each second. Twenty-one consecutive frames around 242.40–243.20 seconds inspect the transition toward the original credits.
- Closing-layout review uses seven further decoded native source frames across221.76–237s. The221.92s frame locates the small bright tunnel figure around y730–810. Actual canonical scene stills at the overlapping voice, its release and the later hand/light shot inform the closing upper reading region; the full picture remains visible. These stills verify composition, not audio listening or the performer identity.
- Reduced thumbnails can miss small lettering and brief intermediate frames. Full playback, source-dimension checks after seeking, actual subject-clearance review and the all-cue multilingual review remain separate preview checks.

Scratch frame catalogs and measurements are kept in `analysis/visual-study/`, outside ordinary source history. The original video remains the only moving-picture authority. Contact sheets establish observed imagery, not audio listening or phonetic accuracy.

## Source scene families

Ranges below are approximate overview boundaries. They summarize visible environments, not a frame-exact edit list. The original transitions remain untouched.

| Approximate source range | Observed picture | Composition implications |
| --- | --- | --- |
| 0–14 s | Dark tunnel opening, small violet light, rapidly moving branches/light and instrument detail | Preserve source darkness and motion; added graphics must not manufacture a second opening scene |
| 14–49 s | Bus seats/windows, headphone-wearing figure, sketchbook/charcoal marks, ensemble and instrument close-ups | Wide ensemble spacing and hands matter; a center portrait crop would lose performers and the drawing |
| 49–81 s | Library shelves, reading, green desk lamps, book/illustration close-ups, band performance | Books and fingers are actual picture content; no trustworthy fixed sign plane exists across the cuts |
| 81–139 s | Bedroom, sleeping face, moonlike practical light, colored band performance, dark doorway/hall | Strong pale/cyan-green light already supplies impact; avoid adding particles or making that light pulse on an invented beat |
| 139–163 s | Winter brick buildings, headphones, overhead snowy walk, handheld close-ups | Preserve face and snow context; stable reading geometry helps with source camera movement |
| 163–192 s | Riverside/waterfront at dusk, held orb, city night performance and skyline | The cold silver/cyan source light supports the chosen spectrum pigment; retain the complete skyline and framing |
| 192–226 s | Moving city light, snow-lit ensemble/instruments, tight playing details and footsteps | Source cuts, snow and flares already carry energy; a stronger measured spectrum can remain fixed rather than shaking the camera |
| 226–about 243 s | Tunnel/arch, figure moving through darkness, hand/light interaction and optical dissolve | Preserve source-owned tunnel geometry and the final hand/light gesture; clear additions before the credit card |
| About 243–255.04 s | Original creator card over scratched/bright optical texture, including full-frame flashes | Full-width source card remains visible in both formats; added title and spectrum clear by 242.65 s |

Every-frame coarse luma ranges from YAVG 16 at 1.08 s to 219.55 at 87.80 s. These are reduced-image limited-luma averages, not a calibrated exposure or emotion measurement. They identify useful dark/bright review samples. The flash sequence and scratch card explain many late change candidates; adding separate flashing type would duplicate an existing source gesture and weaken reading stability.

## Integration findings

**A persistent physically embedded visualizer is not supported by this footage.** The bus, library, bedroom, waterfront and tunnel use incompatible perspectives and camera movement. A fixed polygon on a bus window would move off that material at the next cut; a bright-pixel threshold could also relight skin, hands or snow. No object-tracking or three-dimensional reconstruction has been performed. Consequently the current preview uses a deliberate fixed supporting spectrum whose pigment and soft light match the actual pale practicals. It makes no claim of a physical reflection, sign, stone surface or building installation.

The recurring light is predominantly white/silver with cyan-green spill. Muted green/olive interiors, blue winter light, charcoal black, paper and the red scarf remain source colors. A stable pale green/ivory reading and spectrum palette relates to those practicals without recoloring the film. The source red scarf remains a focal narrative accent; added red attention markers would compete with it.

The complete sharp portrait picture is fit to width. A separate dim defocused enlargement of the **same current source frame** fills the extra portrait space, and an authored reading area sits below the sharp image. This is a graphic composition with source-derived atmosphere, not a claim that the original camera filmed a vertical frame. It avoids cropping ensemble performers, sketchbook content, face close-ups, the wide orb/figure relationship and end credits. Review the fill to ensure it never becomes a second readable subject.

## Workflow decisions carried forward

The brief combines current [cinematic reading](../../../docs/cinematic-lyric-workflow.md), [scene integration](../../../docs/scene-integrated-visuals.md), [complete-preview recovery](../../../docs/preview-before-render.md), [equal multilingual focus](../../../docs/bilingual-lyric-workflow.md), [connected-word timing](../../../docs/connected-phoneme-onset-workflow.md) and [current production preferences](../../../docs/track-workflow-preferences-and-known-issues.md). These are shared method references, not visual-style attribution to another song.

The latest [portrait focus observation](../../po-kamushku-lyric-film/KNOWN-ISSUES.md) is especially relevant: correct event samples and encoded palette agreement did not make active words sufficiently obvious at phone size. This preview must evaluate active/neutral salience separately from timing, increase visible luminance difference in every language and inspect ordinary-speed small-player playback. No existing media or historic audit is changed by applying that lesson here.

## Subsequent v2 overlap correction

The physical source study remains valid. The earlier closing-tail presentation is historical v1; [v2](../OVERLAP-REVISION.md) uses a full independent upper Japanese-led block for the newly recovered backing pair and subsequent closing pairs. The Russian-led pair remains below with every original source body intact. Native upper placement is right-biased to clear the large left-side face around217s; portrait keeps the same full sharp source window and separates the two reading blocks below it. The upper Japanese block does not relocate after Russian ends.
