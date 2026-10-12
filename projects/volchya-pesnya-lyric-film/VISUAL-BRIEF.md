# A living printed broadside

## Picture and material

Retain the complete actual 1080×1080 source picture. The leaping black wolf, pale eye, orange tongue, folk border and knotwork establish the scene. Continue the paper into a facing page in 1920×1080, or below the illustration in 1080×1920. The extension comes from the source's blank paper patch `(605,186,280,160)`, with a faint continuous paper wash; it contains no black panel or replacement world.

## Musical ink

The hosts are existing pigment, not new outline geometry:

| Host | Source rectangle x,y,w,h | Assignment |
| --- | --- | --- |
| Upper knot | 455,0,164,158 | 8 sectors, bands 0,3,6,9,12,15,18,21 |
| Lower knot | 456,928,163,141 | 8 sectors, bands 1,4,7,10,13,16,19,22 |
| Left leaves | 3,218,155,243 | 3 segments, bands 2,8,14 |
| Right leaves | 922,218,155,243 | 3 segments, bands 5,11,17 |
| Upper-left berries | 295,20,53,58 | band 20 |
| Upper-right berries | 734,20,55,59 | band 23 |

Color-selective masks and 6 px edge feathering protect paper, outlines and the entire central wolf. At a measured response frame, over 5,000 source pixels change while no protected wolf pixel changes. The same source time produces the same image after a seek.

Original stereo measurements use 24 bands from 40 Hz to 10 kHz at 50 Hz, FFT 2048 at 22050 Hz, and 40 ms RMS. A centered seven-row Gaussian (sigma1.3) smooths display only. `clamp((dB+66)/49)^1.45 × (0.3+0.7×smooth(-48,-20,RMS))` combines spectrum and energy. Adjacent bands contribute 0.68 / 0.20 / 0.12. Opacity is 0.05+0.88×response for knots, 0.015+0.46×response for leaves, and 0.025+0.57×response for berries. These are artistic transforms, not word timings.

## Reading

Alegreya weight600, rust-red `#852f1f`, olive neutral `#64614c`, paper `#eee4bb`, green ornament `#2a502e`. Both languages have equal size, weight, active color and stable geometry. No boxes, bouncing glyphs, underlines, glow or camera shake.

Landscape reading center `(1485,580)`, width750, initial font74 px. Portrait center `(540,1415)`, width900, initial font76 px. Both languages reduce together to at least54 px for long lines; line height1.25×font, inter-language gap0.72×font. A line reserves its complete geometry before the first word. All 118 cue/layout cases and 1,068 glyph placements pass bounds checks.

The response remains visible in wordless passages; that does not manufacture lyric events. The original soundtrack, native source cadence and audio tail remain complete. Covers are separate code-native poster compositions of the original source and the same typography/palette.
