# Floral light inside the original portrait

## Picture and emotional reading

The square release photograph already contains the song's physical embrace: a woman holds herself among silver carnations and small ivory flowers. Preserve that human gesture and the photograph's grain. Music changes the light within the existing petals instead of adding a separate spectrum shape, a new environment or moving the figure.

The source is intentionally still artwork encoded as a video. Distributed decoded frames establish that stillness; native frame PTS must nevertheless advance in a functioning live preview. One original video element supplies both picture and sound. A still-looking source is not an excuse to omit video or accept a stalled decoder.

## Measured visualizer

`src/scene.ts` defines four manually fitted carnation polygons, centered at source coordinates (680,262), (972,167), (821,534) and (809,740). Six soft angular sectors per flower make 24 frequency patches. Source luminance, blue-versus-red pigment and a nine-pixel inward edge feather retain the real petal folds and silhouettes. The face and embracing arms, small white flowers and stems are protected. Light has a stable upper-left direction.

The original stereo mix is measured at 50 rows per second. Each row contains RMS, transient proxy and 24 logarithmic bands from 40 to 10,000 Hz. Stereo power avoids cancellation from an early mono downmix. The spectral FFT is 2,048 samples at 22,050 Hz, approximately 92.9 ms; RMS uses 40 ms. Raw measurements are retained separately from the display transform. The scene uses bands and RMS; the transient proxy is not a lyric or beat annotation.

Display response is `clamp((bandDb + 64) / 52)^2.7`, multiplied by a bounded RMS factor. A centered seven-row Gaussian with sigma 1.25 rows smooths the response, followed by linear interpolation. This ±60 ms decorative smoothing is separate from word timing. Adjacent bands share a 0.64/0.23/0.13 weighted contribution. The nonlinear transform avoids a permanently saturated glow while keeping the refrain visible at ordinary player size.

Cool light is RGB (168,207,215), warm light (248,222,169), using screen compositing. Warmth follows authored refrain regions 43.5–70.8, 131.5–159.0 and 182.7–198.8 s, with a 3.1 s entrance and about 2 s release. These are this recording's artistic windows, not reusable song defaults. A small 0.045 light lift exists only while a selected **свет** event is active. Stable sector geometry means that energy changes brightness, not the location of the visualizer.

## Layout and reading

| Property | 16:9 | 9:16 |
| --- | --- | --- |
| Canvas | 1920×1080 | 1080×1920 |
| Original square | left, 1080×1080 | top, 1080×1080 |
| Main reading center | (1480,548) | (540,1345) |
| Main reading width | 720 | 900 |
| Main font | 62 px | 66 px |
| Backing center | (1480,874) | (540,1670) |
| Backing font | 43 px | 47 px |

Noto Serif Medium (weight 500) is equal for both languages. Long blocks reflow or reduce both languages together, with a 50 px minimum for the main block. Complete English grammatical groups remain together when wrapping. The lead and backing geometry is reserved before any line becomes visible. Words stay stationary; active pigment is honey ivory `#ffe5ab`, neutral pigment `#c4cbc4`, ground `#141817`. Each glyph receives its own reset outline and shadow state.

The last 72 columns of the wide photograph softly meet a dim extension of actual floral detail. Portrait retains all source edges, with an 84-pixel lower join and a very dim floral continuation. The extension never duplicates the human figure. It provides reading space, not a second illustration. Phone-size stills are checked in addition to native geometry; one still cannot certify moving perception or listening.

## Reusable decisions

- Start with what already carries emotion in the actual picture. Place measured response in that material, and protect the human subject.
- Audit response in motion and with animation disabled. A stable frequency transform can still look too bright or detached.
- Prefer a natural English embrace idiom for an intimate sustained refrain. Keep its source-word mapping explicit; translation style does not justify stretching focus across unrelated words.
- Separate decorative smoothing, lexical release and neutral line reading hold. Each serves a different purpose.
- Preserve every intended layer in the review browser. Source comparison is a separate diagnostic control; recovery restores the complete preview at the same position.
