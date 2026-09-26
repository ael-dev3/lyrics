# TAKE ME THERE — source-picture integration plan

## Scope and observed material

The intended composition now retains the actual `CPznmfSbAiE` moving picture and soundtrack. Generated replacement scenery is not part of this direction. The source is 1920×1080 at 60 fps, with frequent dissolves among facial close-ups, rooftop scenes, car interiors, a night city and final fireworks.

This study inspected native frames at 1, 10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90, 98, 106, 114, 122 and 130 seconds, plus source-wide contact sheets sampled every 0.5 second. `src/shots.ts` records 28 contiguous art-direction intervals, normalized reading boxes, suggested portrait framing centers and environment polygons.

Boundaries are manually selected dissolve handoffs to approximately half-second precision. They are not exact edit-list reconstruction, tracked surfaces, word timings or listening evidence. The source often changes subject pose substantially inside a shot; static polygons and boxes require complete playback review before acceptance.

## Source scene map

| Interval, seconds | Source imagery | Reading treatment |
| --- | --- | --- |
| 0–1.5 | Seated woman, blue sky | Large right-side negative sky |
| 1.5–5.5 | Smoking profile, rose clouds | Lower composition, avoiding face and smoke |
| 5.5–9.5 | Car close-up | Upper-right dark sky |
| 9.5–12 | Rear car / open road | Upper-left sky |
| 12–16.5 | Driver framed by car | Open right-side sky |
| 16.5–21 | Couple close-up | Lower body region; deliberate graphic, not a claimed physical sign |
| 21–29.5 | Tearful face / eye close-ups | Short upper reading region over dark hair; inspect against changing face scale |
| 29.5–32 | Monochrome car | Lower car-body band |
| 32–36 | Road, lake and lightning | Right sky; do not amplify the existing lightning |
| 36–40.5 | Monochrome smoking couple | Lower nonfacial composition |
| 40.5–43.5 | Side of car against neon windows | Broad car-body reading region |
| 43.5–47.5 | Gray rooftop embrace | Upper sky |
| 47.5–50.5 | Front portrait against stars | Lower composition, stars only on sides |
| 50.5–54 | Embrace beneath rain | Upper sky, with subject protected |
| 54–57.5 | Second tearful close-up | Upper dark hair region |
| 57.5–59.5 | Blue smoking portrait | Right-side sky |
| 59.5–64.5 | Rooftop conversation | Upper sky |
| 64.5–75.5 | Kiss and city pullback | Upper sky/architecture; protect couple below |
| 75.5–77.5 | Kiss at water | Upper sky; restrained water response |
| 77.5–86.5 | Couple entering car | Upper sky, clear of heads |
| 86.5–93 | Warm car interior | Upper sky |
| 93–100.5 | Drift through city canyon | Central sky opening; windows and wet road carry response |
| 100.5–108.5 | Couple with city behind | Upper sky |
| 108.5–115.5 | Second drift / city canyon | Upper central/right sky |
| 115.5–119.5 | Close kiss | Lower nonfacial region; minimal environmental response |
| 119.5–122 | Car moving past buildings | Upper building region |
| 122–126 | Rooftop before fireworks | Upper sky |
| 126–134.931 | Fireworks and city pullback | Lower architectural region; fireworks remain unamplified |

## Integration contract

- Draw the decoded source frame, preserving the full native frame in landscape. One native video element should own picture, audio and playback time; separate animation clocks must not drift from it.
- Keep words large and stable while active. Recompose at real picture handoffs rather than continuously chasing a changing patch of negative space. A picture cut must not reset a held word's acoustic interval.
- Match emphasis to the current source's ice-blue or rose light. Body/wall labels in the shot map are candidate material cues, not permission to imply a tracked projection without tracking it.
- Treat close-ups honestly: when no physical host exists, use a deliberate readable graphic over a nonfacial region. Do not paint a new subtitle box or claim the words are attached to absent architecture.
- Keep the primary spectrum at a fixed screen-space anchor in each format. Its 48 shafts interpolate the 24 measured bands; only their heights, emission and source-matched color respond. Do not relocate or resize it at a source cut.
- Reserve the spectrum plus its reading gap before fitting a lyric host. The landscape rectangle is `(250,864,1420,146)` on 1920×1080 with a 34-pixel gap; portrait is `(108,1490,864,174)` on 1080×1920 with a 50-pixel gap. Lower lyric hosts are moved upward, so the scene table describes candidate regions rather than guaranteed final physical anchors.
- Drive secondary environmental response through **existing bright source pixels** within the environment polygons. Those polygons exclude principal faces and eyes; they do not introduce new buildings, stars or lightning.
- Restrict window response to window pixels and reflection response to wet surfaces. A broad polygon is only an exclusion region; luminance/chroma selection must still reject dark walls and nonemissive pixels. Retain source texture.
- Bound all added emission and blur. The primary spectrum blends its ice/rose palette over 0.5 seconds and remains visible through cuts. Secondary environment masks use 0.45-second handoff attenuation because outgoing/incoming subjects can cross a static polygon. The source's lightning and fireworks already produce strong peaks.

## Portrait and known difficult passages

`portraitCenter` is a framing suggestion, not evidence that both subjects and all landscape text fit a 9:16 crop. A portrait crop retains only about 31.6% of the source width. The car at 10/34/42/90 seconds and two-person scenes around 18/82 seconds can lose important content. Recompose the reading region in portrait coordinates and inspect each scene; never transform a landscape reading rectangle and silently clip it. If the scene cannot keep its focal subject and lyric legible, preserve the complete source frame within an authored source-derived portrait arrangement.

The two eye close-up runs, moving car interiors, and fireworks ending are the highest-risk reading placements. Their small or busy safe areas need actual text-fit and motion review. At approximately 134.800–134.8667 seconds, the source itself includes a brief black interval; distinguish original source-black from a new compositor gap.

## Repository principles used

The [scene-integration guide](../../../docs/scene-integrated-visuals.md) requires matching light, material, depth and reflection, and allows a deliberate graphic when no reliable physical host exists. The [If The Sun Burns Out Tonight lessons](../../if-the-sun-burns-out-tonight-lyric-film/PRODUCTION-LESSONS.md) provide a source-video master clock and decoded-frame fallback pattern. The [Mitski lessons](../../ill-change-for-you-lyric-film/PRODUCTION-LESSONS.md) distinguish full source preservation, original black frames and audio-tail coverage.

This plan is visual analysis only. The 37-cue/225-event lyric map includes a restored lead at approximately 44.288–45.870 seconds and remains provisional; no listening attestation, completed creative review or production render approval is established here.
