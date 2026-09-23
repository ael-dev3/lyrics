# Make reactive visuals belong to the picture

Use this guide when writing the visual brief for a new song. The aim is a coherent film: lyrics stay easy to follow, and musical response shares the picture's light, texture and composition. Accurate synchronization alone does not establish the right visual prominence.

This is prospective art-direction guidance, informed by documented productions and subsequent design review. Suggested comparisons are experiments, not measured improvements or changes to accepted exports. Start through the [one-prompt workflow](source-clocked-word-effects-workflow.md); retain the [cinematic reading rules](cinematic-lyric-workflow.md) and [preview-before-render gate](preview-before-render.md).

## 1. Choose a visual role before adding detail

Inspect representative source passages: an intimate shot, the darkest and brightest imagery, a musical peak, a busy composition, a transition and the ending. Record the subject, usable negative space, dominant light direction/color, contrast, texture and camera movement. Include both delivery compositions; an anchor that works in landscape may disappear in portrait.

Choose a role that the footage can support:

| Role | Appropriate treatment | Check before keeping it |
| --- | --- | --- |
| Supporting graphic | A compact spectrum or restrained light response in stable negative space, using the scene's palette and edge softness | It complements the picture without implying a physical surface that is absent |
| Part of the environment | Reactive windows, a sign, room lights or a reflection assigned to an actual object or authored scene region | Perspective, tracking, masking, light direction and material behavior remain believable throughout the shot |
| Local lyric atmosphere | A small set of meaning-linked treatments around measured word boxes | The effect makes the phrase more expressive while the glyphs and reading position remain stable |

A flat, well-composed graphic can fit better than an elaborate object with incompatible lighting. Use depth only where it helps the scene. The [pixel-art workflow](pixel-art-lyric-film-workflow.md#4-let-the-building-carry-the-visualisers) provides a concrete environmental option: room-owned frequency response, window masks, layered rain and reflections on designated wet surfaces. Architecture and rain are choices for a suitable song, not the default for every video.

During vocals, protect both the picture's focal subject and the active lyric. Supporting graphics should not repeatedly redirect attention away from them. Instrumental peaks can give a visualizer more prominence when the composition has room. Record this hierarchy for the section instead of assigning every layer equal strength.

## 2. Match the picture's visual conditions

Treat these as review questions, not a requirement to simulate every physical property:

| Property | Practical decision |
| --- | --- |
| Palette and exposure | Choose colors from, or deliberately compatible with, the current scene. Compare the brightest graphic pixels with the subject and text. A dark shot often needs less emission because the same highlight stands out more. |
| Light and material | Keep any lit faces, caps and shaded sides consistent with an identified light direction. Use an emissive surface only when it serves the design; every bar does not need its own intense highlight. |
| Depth and edges | Match the intended layer's sharpness, blur, texture and scale. Keep lyric bodies crisp enough to read. Do not add global blur or grain simply to conceal mismatched graphics. |
| Perspective and contact | For an in-scene element, anchor it to a surface and follow that surface through camera movement. Check that it does not slide. If a reliable anchor is unavailable, choose a deliberate screen-space composition. |
| Occlusion | Place environmental elements behind the objects that should hide them. Keep the lyric reading layer protected; integration does not require scenery or particles to obscure the words. |
| Reflection and spill | Give a reflection a plausible receiving surface, position and mask. Let reflected/emitted light remain subordinate to its source. Omit a decorative mirror strip when no surface explains it. |
| Shot changes | Reassess anchors, palette and contrast at cuts. Use authored, source-timed transitions; a picture cut must not reset a held word or its acoustic focus. |

Match active effects to the scene without making neutral lyrics faint. Both languages retain equal perceived size, weight, contrast and focus strength. Readability shading should merge continuously with the picture rather than appearing as a cue-shaped panel.

## 3. Separate audio accuracy from visual prominence

Keep the original analysis and lyric event map unchanged while tuning display parameters. A useful conceptual separation is:

```text
locked source audio → measured features at source time → documented display mapping
                                                           + section/shot limits
                                                           → composed visual
```

Tune height, emission, bloom, reflection and secondary motion independently. Lowering glare need not erase the measured band shape or its timing. Keep the primary response visible; avoid such tight ceilings that every peak looks identical.

- Compare an intimate passage with reduced reflection and cap/bloom brightness while retaining the same feature lookup and bar response. Inspect whether the scene and phrase regain attention.
- Compare a musical peak with more room for the chosen primary gesture. Do not simultaneously maximize bar height, glow, particles, word effects and camera movement.
- Use reviewed section or shot envelopes for presentation limits. Keep these envelopes distinct from measurement smoothing, and do not shift a beat or lyric to fit a visual transition.
- Avoid automatic compensation that makes quiet music or dark footage as visually loud as a climax. Per-frame exposure chasing can also produce distracting brightness pumping; prefer deliberate, bounded changes reviewed in motion.
- Derive envelope values, tracked anchors and particle phases from source time. Seeking, reduced-speed playback and final rendering must reconstruct the same state.

These are artistic decisions. Correct RMS/spectrum response, unchanged soundtrack bytes and frame-accurate event display establish different facts from perceptually convincing synchronization or visual balance. Retain the separate technical, listening and creative reviews.

## 4. Keep effects that communicate at normal viewing size

Begin with a few coherent primary motifs. They should be recognizable during ordinary playback; secondary detail may remain subtle without carrying essential meaning. More selectors and particle types are not a quality target.

For each effect, compare the same passage enabled and disabled. Record what becomes clearer or more expressive. If a fine fracture, wisp or halo is visible only in enlarged stills, decide whether it earns its maintenance and rendering cost as quiet texture. Simplify or remove low-value detail before increasing every effect's brightness.

Use contrast, silhouette and controlled duration before adding complexity. Preserve the sung word's actual focus interval; never extend highlighting to make a tiny effect easier to notice. Any justified decorative tail remains separate and cannot compete with the next word.

Review the film as a whole: an effect can look impressive in isolation yet interrupt the reading rhythm or pull attention away from a source performance. Keep complete moving footage and the full lyric treatment present in every review preview. Optional diagnostic views must be clearly labeled and separate.

## 5. Compare at the size people will watch

1. Select short passages spanning quiet/dark, bright/busy, strongest music, dense text, an effect handoff and the ending. Add every materially different shot treatment.
2. Compare the complete candidate with a simpler baseline at identical source times, audio and player size. Change one prominent parameter family at a time so the comparison explains a decision.
3. Watch at normal speed with sound first. Use paused frames and slower playback to diagnose a specific issue, not to substitute for the viewing experience.
4. Inspect native output and a realistic narrow player for each format. Downscale the landscape frame without reflow for its phone-player check; separately inspect the authored portrait layout. Record the actual displayed width, not just the export resolution.
5. Check active and inactive text, bilingual equality, focal subject, spectrum prominence and whether primary effects still communicate. If fine effects vanish while the spectrum dominates, rebalance the hierarchy before adding detail.
6. Inspect a short encoded proof before full production under the existing preview rules. Compression/downsampling may alter thin lines, glows and reflections. Check the decoded proof at the same viewing sizes and confirm the renderer matches the complete preview.

Do not infer that every effect must be equally visible at every size. The subject, complete lyric and intended focus must survive; atmosphere can remain atmosphere. Keep portrait platform safe areas and the landscape source frame intact.

## 6. Leave a compact decision record

Keep one record per distinct treatment; list exceptions rather than repeating a full specification for every cue. Store song-specific selectors, palettes, shot intervals, anchors and response limits with that project. Reusable renderer or feature code should not silently carry the previous song's words or numeric presets.

```text
Passage / source-time range / shot IDs:
Formats and displayed review sizes:
Visual role and intended attention order:
Scene anchor, palette, lighting, surface and occlusion (as applicable):
Audio feature or reviewed event; separate display mapping and limits:
Primary motif; secondary detail retained or removed and why:
A/B change and observation at normal speed:
Boundary, seek, readability and encoded-proof results:
Decision, evidence location, reviewed revision and remaining uncertainty:
```

Before full rendering, confirm:

- [ ] The complete source picture moves correctly in both formats; no layer has been omitted to make a preview pass.
- [ ] Spectrum lighting and reflections support the scene, including quiet/dark passages.
- [ ] Environmental effects keep their anchors, surfaces and masks through camera movement and cuts.
- [ ] Primary effects communicate at ordinary speed and realistic player size; finer details do not compete with reading.
- [ ] The source clock, acoustic focus and bilingual prominence survive every intensity change.
- [ ] Creative conclusions are recorded separately from technical and listening evidence, with the existing current-revision render approval intact.

Write public lessons as reusable production decisions. Exclude private quotations, ratings, identities and review transcripts. Preserve accepted deliveries and their original evidence; label future A/B ideas as proposals until they have actually been reviewed.
