# Кометы — conservative portrait framing plan

## Current proposal

`source/portrait-framing.json` is a contiguous array covering source time **0–260.086712 s**. Its 78 spans use one fixed framing center per span; none introduces a synthetic pan or zoom. The plan contains 50 medium panoramas, covering approximately 130.36 seconds, and 28 full-width spans, covering approximately 129.727 seconds.

This is preparation evidence for the complete preview. It does not establish final moving-picture acceptance, lyric clearance, audio timing or render authorization. Source media remain unchanged.

## Frame and mode contract

The original is **1920×796, square pixels, 25 fps**. A portrait cover crop of the full source height retains only 447.75 source pixels horizontally; it cannot preserve many singing faces, drawn bows, hand/mirror interactions or performer/orb pairs in this film.

| JSON mode | Source region | Portrait presentation |
| --- | --- | --- |
| `panorama` | Full 796-pixel source height; fixed `cropWidth` of 1300 or 1500; horizontally centered on normalized `centerX` | Fit without stretching to 1080 px wide. Heights are approximately 661.29 px and 573.12 px respectively. A stable top near y=300 leaves room for equally prominent reading below. This is a proposed composition location, not a crop of the lyric layout. |
| `wide` | Complete original 1920×796 source picture | Fit without stretching to 1080×447.75. Preserve all original lettering, paired subjects and source-designed black grounds. |
| `crop` | Conventional full-height 9:16 cover | Not used in the selected plan: rejected tight-cover candidates clipped mouths, profiles, petals or interaction landmarks. |

For `panorama`, compute the source x coordinate as `clamp(centerX * 1920 - cropWidth / 2, 0, 1920 - cropWidth)`; keep source y=0 and height=796. `centerX` is a normalized source coordinate, not an output coordinate or a motion keyframe. Wide spans use the full frame regardless of `centerX`. The JSON intentionally omits `startCenterX` and `endCenterX`.

The finished portrait scene can use source-compatible continuous surrounding composition, but this plan does not prescribe a blurred duplicate of faces or readable credits. Keep the foreground source picture crisp and complete. Never stretch the original to fill the 9:16 output. Do not project a landscape lyric host blindly into these fitted regions.

## Preparation method

1. Run read-only FFmpeg scene detection over the actual source at three thresholds. The 0.18 pass produced 63 candidates, the 0.08 pass 91, and the 0.025 pass 195. The lowest threshold catches dark cuts but also reports moving light, flicker and source-camera changes; none is treated automatically as an editorial cut.
2. Build candidate intervals from the 0.08 observations. Group source-authored rapid light-flash clusters rather than changing framing at every flash. Add conservative late-ending ranges while retaining full width throughout them.
3. Inspect each interval near entry and exit: **156 full-source stills across 78 intervals**. This identifies substantial subject movement that one midpoint still would conceal.
4. Test 14 representative tight portrait candidates near entry, midpoint and exit: **42 tight crops**. Inspect eyes, singing mouth, hands, dress, flower petals and bow landmarks against the original source.
5. Compare those same 14 candidates at the same three times using a **1300-pixel medium crop**, adding 42 medium proofs. The larger source region keeps facial features, gesture and material context while showing a larger picture than full-width fit.
6. Choose 1300-pixel panoramas for safely contained faces or single subjects, 1500-pixel panoramas for wider gestures/body movement, and full width where paired subjects, action extremes, original lettering or dark-cut uncertainty require it.
7. Validate ordered positive intervals, exact adjacency, complete source/audio duration coverage and the selected widths. The renderer must still validate crop bounds, output placement and text clearances with the actual loaded fonts.

Reproducible detector expression:

```sh
ffmpeg -hide_banner -nostdin -i public/source.mp4 -an \
  -vf "select='gt(scene,0.08)',metadata=print:key=lavfi.scene_score:file=analysis/portrait-scene-candidates.log" \
  -fps_mode vfr -f null -
```

Use 0.18 and 0.025 for the conservative/high-sensitivity comparisons. These are source-analysis operations; no full lyric-film capture or encoded preview was created for this study. Temporary contacts and logs are local diagnostics, not publication assets.

## Reasons for the main decisions

- **Singing faces:** a 447.75-pixel cover region clipped a singing mouth or a profile in several reclined and upright shots. The 1300-pixel comparison retains both eyes, mouth and nearby hand/neckline across the sampled movement. Retain native source clipping where it already exists; do not introduce additional mouth/eye loss merely to fill portrait.
- **Dance and bow:** source camera angles change, and raised hands or drawn bow ends can span much of the picture. Wider medium framing is used only where the sampled action fits; full width remains for extremes and uncertain transitions.
- **Mirror:** the reflection, touching hand and foreground head are separate landmarks. Full width preserves the interaction instead of choosing one face and losing its receiver.
- **Orb:** performer and orb occupy separated positions during the final field approach. The full native composition carries their relationship; a narrow automatic center would lose one or misrepresent the source staging.
- **Source flashes:** the light bursts around 91.6–92.36 and 124.92–125.32 seconds stay whole. Framing must not jump, zoom or recenter with every source flash.
- **Dark source cuts:** the lower detector threshold revealed cuts that the main threshold misses, notably light-to-face and tree-to-profile passages. Those intervals use a generous medium region or full width rather than implying a tracked single shot.
- **Opening and credits:** preserve the original title, performer reveal, creator-credit row, website, album and platform cards. Full width remains through the final fade and original 46.7 ms audio tail. Original dark card grounds are intentional picture design, not decoder failure. Retire spectrum/atmospheric decoration without removing performed speech: the inventory includes a second full radio passage around 235.92–249.960 s across these cards. Keep its bilingual reading below the full original portrait card, around y=1470/1600 in the current plan, outside embedded source lettering. Landscape uses equal 36 px reading rows around y=725/780. These placements need current-preview collision and moving-card review; this framing record does not certify them.

## Boundaries and remaining uncertainty

The plan is **shot-boundary-aware, not a frame-certified edit-decision list**. Detector values can arise from actor movement or light changes. Some proposed intervals contain multiple low-score source cuts, and the late 234/240/249-second divisions are conservative ending ranges rather than asserted exact cut frames. They do not introduce a framing change because all use `wide`.

The entry/midpoint/exit comparisons give more reliable framing evidence than one still, but they are not continuous motion tracking. Brief movement between samples, changing portrait lyric positions and platform overlays still require actual moving-preview review. Do not describe this report as a completed frame-by-frame viewing or listening audit.

Before handoff, verify the complete portrait with real video motion after load, seeking, pause/resume, layout switching and recovery. Include the mirror/hand interaction, fast bow gestures, dark-cut spans, performer/orb approach and original cards. At realistic mobile size, confirm that panoramic pictures remain large enough and both language lanes retain equal contrast. Change framing only at justified source intervals; do not interpolate centers for cosmetic movement.

The source framing geometry is unchanged by the late-radio coverage correction. Caption visibility, individual acoustic word focus and decorative cutoff remain separate clocks: keep the second radio passage complete, prevent collisions with creator/website/album lettering, then clear added reading at its justified ending. Main and independent onset audits are currently addressing a reported timing lag. This report claims neither completed acoustic approval nor permission to render.

## Operation boundary

This work performed no source changes or remote mutations. Any later push, pull-request action, merge, dispatch, rerun or trigger change must first follow the coordinating assistant's current approval policy and conservative current-UTC-day GitHub Actions preflight. Unknown monthly usage remains unknown; do not expand billing permissions or bypass required checks.
