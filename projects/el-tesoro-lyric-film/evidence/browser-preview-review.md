# Browser preview observation — 2026-09-24

**Scope:** sampled technical/visual inspection of the local complete preview, not a full-song listening review or a production render. The source art is nearly static; decoded-frame callbacks and visible nonblack picture are reported separately from the artwork's small original pixel changes. The observations below used the browser at a 1400×~800 desktop window, with a 1068×600 landscape stage and a ~342×608 portrait stage. Mobile-device perception and every-cue audiovisual approval remain pending.

| Check | Browser observation |
| --- | --- |
| Fresh beginning, 16:9 | Source sword/hand picture visible from 0:00; no false lyric during the instrumental opening. |
| Seek 23.9 s, 16:9 | Both complete equal-size lyric lines visible over shaded side fields; original blade remains unobscured. |
| Fresh seek 106.9 s, 9:16 | Centered source sword, feathered portrait composition and both lyric lanes visible; 1920×1080 source dimensions reported. |
| Play from 137.76 s, 9:16 | L17 Spanish “Pensé…” and its English meaning are shown together. Video `readyState=4`; decoded frame callbacks advanced from 3 to 552 while source media time advanced from 137.7667 to 146.95 s. |
| Switch to 16:9 during playback | Current song time and audio continued; source picture remained visible with the L21 paired lyric. Decoded callback count reached 1,084 at media time 155.8167 s. |
| Fresh seek and play from 268 s, 16:9 | Nonblack source art and coda title visible near the ending; no fabricated lyric after the last sung phrase. Playback ended at 271.534 s with 205 decoded callbacks and last picture time 271.45 s; the picture remained visible through the brief AAC tail. |
| Direct reduced-speed link and Restore picture | `?t=106.9&format=portrait&speed=0.5` loaded the intended lyric and 0.5× control. Restore picture reloaded at 106.900 s with portrait and speed retained. Notes are stored by source hash in the browser; persistence was implemented but no private note contents are recorded here. |

The full sound track, source picture, lyrics, measured atmosphere and controls are present in the main preview. These checks establish that the browser can load, seek, decode and display sampled states. They do **not** establish that all 153 word onsets/releases were heard and approved, that every cue fits at a phone's native size, or that a final video has been encoded.
