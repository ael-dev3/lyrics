# Historical v2.4.0 cinematic-parity baseline

> This immutable v2.4.0 implementation note is retained as historical provenance. The current v2.4.1 source preserves the precision profile on `C1-01`–`C1-04` and affinely maps the approved C2 visual schedule only onto `C1-05`–`C1-08`. See [the v2.4.1 correction record](first-act-and-outro-polish-v2.4-implementation.md) for the exact issue, formula, and verification workflow.

## Scope

Version `v2.4.0` brings the repeated `00:40–00:50` lyric passage to the same presentation treatment as `01:46–01:56`. It also removes the small rounded transient shapes from the bottom spectrum. The soundtrack, sample-indexed alignment, semantic target order, English wording, artwork, composition geometry, and 153-second public timeline remain unchanged.

## Diagnosis

The two passages did not use the same presentation contract even though their lyrics repeat.

| Behavior | Former first passage | Later passage and v2.4 first passage |
| --- | --- | --- |
| Line entrance lead | 368 samples / one 120 fps frame | 10,584 samples / 240 ms |
| Fully settled | On vocal contact | 2,205 samples / 50 ms before contact |
| Internal handoff | 368 samples, hard replacement at contact | 8,379-sample / 190 ms crossfade |
| Focus attack | Immediate full emphasis | Three-frame eased emphasis |
| Focus release | Immediate removal at exclusive end | Two-frame residual release |
| Inactive lyric opacity | 0.48 | 0.62 |
| Underline | 4 px | 3 px |

The former precision treatment made the first passage cut more abruptly and increased focus contrast. Version 2.4 assigns every production line the cinematic profile. It preserves each C1 vocal start, vocal end, semantic cue start, semantic cue end, target segment, and backward/forward activation exactly as reviewed.

## Timing implementation

All lyric drafts now derive presentation boundaries from one set of constants at 44,100 Hz:

- entrance start: `vocalStartSample - 10_584`;
- entrance complete: `vocalStartSample - 2_205`;
- crossfade duration: `8_379` samples;
- semantic release hold before an outgoing transition may begin: `1_470` samples;
- focus attack: three rendered frames;
- residual release: two rendered frames.

The `C1-06`, `C1-07`, and `C1-08` semantic sequences remain:

| Line | Sample-reviewed visible focus sequence |
| --- | --- |
| `C1-06` | `Let` → `tremble` → `the earth` |
| `C1-07` | `Through` → `walls` → `apartment` |
| `C1-08` | `I'll sweep through` → `like a wave` → `of fire` |

The break-card and outro milestones remain explicit terminal transitions rather than lyric-to-lyric handoffs.

## Spectrum implementation

The audio analysis and smoothing data are unchanged. The render layer now draws one SVG line for each of the 64 logarithmic bands:

- 4 px stroke width;
- flat `butt` line endings;
- ember for bands 0–17 and teal for bands 18–63;
- 2–96 px measured height;
- 0–18 px transient extension integrated into the same line;
- 114 px maximum total travel;
- no second impact element, rounded cap, circle, or dot.

The line opacity range is reduced to `0.30–0.74`. Browser measurement verifies 36 px minimum lyric separation, no spectrum clipping, and 11 px lower-chrome clearance at the peak fixture.

## Regression and visual review

The automated contract covers both 60 and 120 fps:

- every production line uses the cinematic profile and fixed sample-derived lead;
- the revised first-passage lines are settled before contact;
- the `C1-05→C1-06`, `C1-06→C1-07`, and `C1-07→C1-08` handoffs retain cinematic overlap through contact;
- C1 and C2 contact glyph styles are identical;
- exact reviewed C1 cue samples and target order are unchanged;
- the spectrum contains exactly 64 continuous SVG lines and no measured/cap rectangles;
- peak and quiet geometry, palette, line width, flat endings, safe area, and clipping are fixed by tests.

The v2.4 visual-review package includes:

- soundtrack-bearing `39.5–50.5 s` and `105.5–116.5 s` comparison clips;
- a relative-time two-row contact sheet;
- a semantic-contact sheet at the C1/C2 repeated line onsets;
- a v2.3/v2.4 cropped spectrum comparison;
- the lossless 2160×2160 README screenshot from frame 2,760 (`00:46.00`).

The final release matrix runs typechecking, all unit and integration tests, browser layout measurement, composition discovery, alignment verification, full reference/public/proof media verification, strict decode, selected-frame extraction, QA-media generation, and two independent QA executions before publication.
