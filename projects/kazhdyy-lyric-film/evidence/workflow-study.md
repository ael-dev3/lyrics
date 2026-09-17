# Workflow study and implementation decisions

This edition applies the Lyrics workflow in general. Its composition grows from this recording's static kitchen illustration, repeated table image and tension between shelter and possession. No particular prior song is a design inspiration.

## References studied

- [Preview before render](../../../docs/preview-before-render.md): full playable recording first; current-song, current-revision approval required for full production.
- [Cross-language gate](../../../docs/cross-language-sync-gate.md) and [bilingual workflow](../../../docs/bilingual-lyric-workflow.md): every source event and target token accounted for; shared source intervals; complete grammatical expansions; union of disjoint intervals.
- [Cinematic treatment](../../../docs/cinematic-lyric-workflow.md): fixed glyph geometry, color-only emphasis, equal language size and weight, quiet reading areas.
- [First pass](../../../docs/first-pass-song-workflow.md), [preferences and known issues](../../../docs/track-workflow-preferences-and-known-issues.md), and [TypeScript first](../../../docs/typescript-first-workflow.md): lock inputs, retain uncertainty, preserve earlier editions, verify and merge source changes, author production logic in TypeScript.
- [Emotional audio-reactive motion](../../../docs/emotional-audio-reactive-motion.md): arrangement and source imagery determine motion intensity; measured bands and artistic display transforms are separate.
- [Moon study](../../../docs/studies/moyka-moon-2026/README.md): independent acoustic, visibility, semantic and picture clocks; inspect repeated releases independently; do not infer word boundaries from picture cuts or flashes.
- [Loop study](../../../docs/studies/loop-2026/README.md): compare vocal events against the actual recording and preserve gaps and source texture; recognizer certainty is not acoustic truth.

Historical project implementation and verification records were inspected for layout, source handling, spectral measurement and delivery failure modes. Prior production failures inform checks, not visual imitation. The current preview preserves the distinction between technical verification and completed listening.

## Decisions for this recording

| Constraint | Implementation | Verification |
| --- | --- | --- |
| Three-color palette | Ink `#101116`, ivory `#F2E9D8`, vermilion `#FF6454`; source tritone filter | Three authored base colors. Antialiasing and opacity produce intermediate pixel values. |
| More expressive visuals | Source-relative eye scribbles and kettle steam, enclosing red contours, bounded camera movement, measured 64-band spectrum | Lyrics remain outside the artwork motion; full-frame portrait and landscape stills inspected. |
| Chorus contrast | Reverse ink/paper roles on the artwork at section transitions; red remains stable | No beat-driven flashing of the reading background. |
| Equal languages | Same Oswald weight, 78 px landscape / 82 px portrait for both languages | Fixed precomputed word boxes; reflow up to three rows; do not split identical-source English expansions. |
| Word accuracy | Supplied words, two free recognizers, original mix and isolated vocals, bounded section alignment | Reject recognizer substitutions and instrumental hallucinations; preserve explicit negation and repetition. |
| Release precision | Inspect 32 extended vowel/final-word candidates, including all repeated hooks | Two one-second energy caps shortened after harmonic-tail inspection. Exact audible releases remain listening questions. |
| Render restraint | One-frame diagnostic compositions and full browser preview | Production command rejects missing, stale or incomplete review and missing explicit approval. |

## Lessons retained

1. Full-track ASR missed most of the first hook and absorbed instrumental gaps into neighboring words. Bounded free recognition recovered the three first-chorus lines; each repeat therefore retains independent acoustic candidates.
2. CTC word cores often end before sustained vowels. A shared Russian/English release candidate improves preview focus, but energy tails can include reverb. Spectrograms must challenge automatic extensions rather than merely decorate them.
3. SVG text boxes include font em metrics beyond visible ink. Use browser-measured ink ascent/descent for vertical collision checks and SVG bounds for horizontal geometry; verify the actual pictures as well.
4. Diagnostic timestamps must reach the resolved composition props. Passing `inputProps` alone with previously resolved default composition props can silently produce repeated wrong-time stills. The corrected script sets both, and distinct frames were visually verified.
5. Large portrait title accents and source eyes need explicit clearance from picture masks and camera crops.
