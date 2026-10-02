# Complete preview technical checks

Historical revision: `komety-preview-v3-phonetic-edges`. Frozen source, timing, mapping and player identities: [preview-inputs-v3.json](preview-inputs-v3.json). Acoustic candidate validation: [timing-candidate-validation.json](timing-candidate-validation.json). This record does not certify the revised v4 line lifetime.

These are browser, layout and signal checks. They do not constitute human listening acceptance or authorize production.

## Actual browser observations

- The original video visibly moved during playback in Native wide and 9:16. The full original picture, both language lanes and measured ribbon were present.
- At 42.800 s, the first held «землёй» and its complete English meaning remained highlighted. At 120.340 s, the short «ей» / “it” event had a separate highlight. At 189.600 s, the held «Свети» / “Shine” stayed active before the actual «над» entrance.
- During sampled 0.5× playback, word-paint times 42.985460 and 120.508841 s were about 6.5 and 5.0 ms behind the subsequently observed media time. These are isolated observations, not a maximum-latency profile. Word focus follows original media time independently of the 25 fps picture cadence. Observed paint costs ranged from the timer's 0.0 ms resolution to 0.9 ms.
- A paused seek to 120.340 s used the containing original picture at 120.320 s; word timing remained at the requested time.
- Restore preview retained the reviewed 189.600 s position, Native wide layout, 0.5× rate and muted state, then resumed a healthy original picture.
- At 241.200 s, original source credits remained visible; added radio captions avoided the original Film Gods lettering.
- Playback through the end reached the original 260.086712 s audio extent with `ended=true`. The final decoded source picture remained frame 6500 / PTS 260.000 s through the 46.7 ms audio tail.
- After the final metadata refresh and browser reload, the 12.400 s preview had ready-state 4, word time 12.400000 s and original picture PTS 12.400000 s / frame 310.

## Complete layout evidence

All 27 cues were inspected in paired source-frame scene proofs. Additional paired proofs at 42.800, 50.600, 120.340, 128.400, 178.800, 189.600, 199.950 and 249.900 s cover restored held vowels, short handoffs and the faded final radio release. Representative images are [Native wide](preview-landscape.jpg) and [9:16](preview-portrait.jpg). These stills use the shared scene code; they are not a final encoded film.

The technical checks cover every source start and release, complete translated focus membership, full-opacity vocal intervals, equal bilingual type geometry, visualizer clearance, contiguous portrait framing and the closed production gate. The original dark opening, night photography and authored ending are retained.
