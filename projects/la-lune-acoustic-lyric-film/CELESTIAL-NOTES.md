# Celestial revision — La Lune

`preview-v3-celestial` refines the completed lunar edition. Audio, source lyrics, English mappings, word boundaries, cue visibility and layout coordinates are unchanged and hash-checked against v2.

## Calm illumination and neutral color

The Moon stays at opacity 0.86 and its atmosphere at 0.07 throughout all 11,854 source frames. Vocal energy no longer changes the large bright disc. The introductory phase reveal and final scene fade remain intentional. Measured spectrum bars still respond to the recording; instrumental ripples keep their vocal exclusion guards and use a reduced maximum strength.

The sky is RGB black. Text, bars, halos and stars use neutral grays and silver white. An sRGB saturation-zero SVG filter removes the blue cast from the existing Moon at display time, preserving the original artwork file. Covers use the same treatment. This is an artistic monochrome grade, not a claim about the Moon's calibrated surface colors.

French and English retain equal font size, weight, inactive luminance and highlighting strength. The existing vertical spacing separates the languages clearly. A divider adds another graphic element without improving this composition's reading order, so none is introduced.

## A real star pattern with explicit artistic limits

The source is the [Yale Bright Star Catalogue, 5th Revised Edition, CDS V/50](https://cdsarc.cds.unistra.fr/viz-bin/ReadMe/V/50?format=html&tex=true) (Hoffleit & Warren, 1991). The [provenance record](analysis/star-catalogue/provenance.json) records the query, raw TSV checksum and 8,404 usable rows with finite coordinates and visual magnitude at most 6.5. The compact production catalogue is [stars-bsc5.json](public/stars-bsc5.json). `node scripts/star-catalogue.ts` verifies that every compact row reproduces the hashed source TSV; add `--write` to regenerate it.

A gnomonic projection centered at RA 65°, declination 0°, uses J2000 coordinates, north up and east left. A 54° short-axis field sets the scale. Frame cropping, foreground-Moon occlusion and a soft fade before the reading area leave 393 stars in landscape and 264 in portrait. No invented filler stars or constellation connecting lines are added. Projection rounding is below 0.0005 delivery pixels.

Visual magnitude is converted to relative flux with `10^(-0.4 × magnitude)`, then compressed by exponent 0.30 for display. Brighter catalogue stars receive stronger point cores and soft radial glows. Slow independent scintillation has a bounded 0.88–1.00 exposure multiplier; the largest measured frame-to-frame opacity step is 0.0007. Stars never pulse on the beat or change position.

[Atmospheric scintillation](https://www.eso.org/public/images/potw1820a/) motivates the subtle twinkling, but the effect is illustrative rather than an atmospheric simulation. Stellar spectral colors are not represented in the neutral grade. Coordinates are catalogue J2000, without proper-motion correction or a date/location/horizon transformation. The oversized Moon is artistic: its phase, scale and position are not an ephemeris. The scientifically grounded claim applies to the projected star pattern and magnitude ordering.

## Verification and delivery scope

The [celestial audit](evidence/celestial-audit.json) checks every source frame's Moon/halo opacity, all visible stars' scintillation bounds, projected coordinates, neutral palette and unchanged timing/text/layout hashes. Every lossless render-cache layer was recaptured after the palette change; v2 colored glyph layers and v2 film segments are not reused.

Eight native preview/production-adapter comparisons have zero differing channels. Eight comparisons at twice the output resolution bound native-compositor antialiasing differences; [the numerical adoption report](evidence/raster-adoption.json) records each result. Encoded two-second diagnostics check 1,920 word states per format, with zero mismatches or ambiguous words. A 20-frame shifted expectation correctly detects 292 errors.

The final files receive full timestamp, AAC-packet, decoded-PCM and word-color checks. A separate [encoded Moon check](evidence/encoded-moon-illumination.json) samples the central lunar surface twice per second from 30–190 seconds, checking stable illumination and neutral color after compression. It excludes the intentional intro and ending fades.

The project owner commissioned these visual corrections and a new local posting delivery after v2 was completed. The initial production instruction was recorded as `owner-directed-visual-revision`, with `previewAccepted: false` at that time. The [subsequent explicit acceptance](evidence/owner-acceptance-v3.json) now records overall approval of the unchanged celestial preview; it does not invent granular listening telemetry. The live corrected preview was technically checked before rendering. Original timing uncertainty and incomplete listening fields remain unchanged. The gate requires the prior audio, text, mappings and geometry to match, plus current source identities and visual evidence. This narrow correction record does not change the preview-first default for new songs.

The new kit uses a distinct folder and distinct `La-Lune-Celestial-v3-*` video names. V2 film files and [v2 evidence snapshots](evidence/history/v2/README.md) are preserved; the new folder uses a distinct delivery name.
