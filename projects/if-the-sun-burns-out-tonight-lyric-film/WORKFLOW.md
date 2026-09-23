# Reproduce the production edition

Read [AGENT-HANDOFF.md](AGENT-HANDOFF.md) first. The shared [one-prompt guide](../../docs/source-clocked-word-effects-workflow.md) is the entry point for a new song; [PRODUCTION-LESSONS.md](PRODUCTION-LESSONS.md) contains this recording's exact effect selectors, timings, measurements, layout decisions and rejected approaches.

## Locked inputs

- Use the exact source identified by `source/media-manifest.json`; verify its SHA-256 before work.
- Keep the accepted `src/timeline.json` independent of visual envelopes. Its 254 word intervals drive individual color focus; the longer fire envelope never extends focus.
- Use committed `public/audio-features.bin` and `public/fire-dynamics.json` unless intentionally rebuilding the measurements and repeating affected review.
- The complete preview includes original picture and soundtrack, every overlay, both layouts and transport recovery. The source picture is 1920×818, not 16:9.

## Preview and production

Requires Node.js, Python 3, FFmpeg/FFprobe, NumPy only when regenerating audio analysis and the approved Avenir Next Condensed DemiBold font. The production host used Node 24.20.0, FFmpeg 8.1.2 and `@napi-rs/canvas` 0.1.100. Package versions are locked. The local system font is extracted as a single face; it is not redistributed. `LYRIC_FONT` cannot silently substitute a different font for an approved render.

```sh
npm ci
npm run font:prepare
npm run check
npm run preview
```

The extraction helper uses the macOS system font collection. On another operating system, supply a legally available byte-identical approved face at the recorded runtime path, or deliberately establish a new font/layout proof and approval. Never accept font fallback just because text renders.

Production is permitted only when `evidence/render-authorization.json` matches all approved inputs and `evidence/production-adoption.json` matches the proven adapter. Proof commands also require current render authorization and diagnostic clips are limited to 15 seconds.

```sh
npm run render:proof -- --format landscape --start 200.7 --output output/proofs/landscape-peak-fire.png
node scripts/render-production.mjs --diagnostic --format portrait --start 32.6 --frames 120 --output output/proofs/portrait-wrapped-fire-motion.mp4
npm run render -- --format landscape --output output/if-the-sun-burns-out-tonight-landscape.mp4
npm run render -- --format portrait --output output/if-the-sun-burns-out-tonight-portrait.mp4
```

The native adapter shares the preview's deterministic effect functions and uses measured browser word boxes frozen in `src/production-layout.json`. It produces transparent overlays at `frame / 60`; FFmpeg decodes and composites the actual source picture. Landscape preserves the full 1920×818 frame without added letterboxing. Portrait preserves the complete panorama above a moving blurred fill from the same frame. Original 24 fps frames are held across the 60 fps overlay timeline with `fps=60:round=up`; no optical-flow synthesis is used. The last picture is held through the original audio tail. AAC is stream-copied.

## Porting details that matter

- Select the DemiBold face explicitly. Registering the whole system TTC collection selected Bold in the native renderer despite a 600 weight request.
- Freeze actual browser wrapping and word positions at canonical layout sizes. Fit native glyph widths to those boxes and keep the baseline and size unchanged.
- Paint glyphs once. Repeated body-plus-shadow passes thicken antialiased edges.
- Paint tinted alpha masks on-canvas for shadows, then blur them. The native engine culls fully off-canvas bodies and their offset shadows; an offscreen-shadow trick silently removed purple halos and readability shadows.
- Use explicit narrow clipped strips for the tiny damage cuts. Duplicate-stop gradients differed between browser CSS and the native canvas.
- Verify actual encoded proof pixels in every effect class. Sharing functions does not prove equivalent font, blend or shadow output. These fixes are adapter corrections, not new artistic direction or timing changes.

## Independent final-file checks

```sh
python3 scripts/verify-delivery.py --input output/if-the-sun-burns-out-tonight-landscape.mp4 --format landscape --fps 60 --report evidence/landscape-verification.json
python3 scripts/verify-delivery.py --input output/if-the-sun-burns-out-tonight-portrait.mp4 --format portrait --fps 60 --picture-rect 0,326,1080,460 --report evidence/portrait-verification.json
```

Check complete decoding, exact frame cadence/count, zero start timestamps, unchanged decoded audio and matched source-picture regions throughout. Treat newly black regions as defects and inspect flagged differences. One near-black source frame at 209.416667–209.458333 seconds is intentional source imagery; it is not an export dropout. Keep the original source fade, cuts and closing card.

```sh
node scripts/verify-word-focus.mjs --input output/if-the-sun-burns-out-tonight-landscape.mp4 --format landscape --report evidence/landscape-word-focus-audit.json
node scripts/verify-word-focus.mjs --input output/if-the-sun-burns-out-tonight-portrait.mp4 --format portrait --report evidence/portrait-word-focus-audit.json
```

Encoded word checks must read the delivered MP4, sample inside the expected glyphs and assess active and inactive colors, including neutral gaps and effect-tinted words. Preserve acoustic listening as a separate human judgment; pixel checks establish presentation of selected times, not the absolute truth of every sung boundary.

## Delivery and repository handoff

Build covers and publishing text with `node scripts/package-assets.mjs`, then run `python3 scripts/finalize-kit.py` after both technical and word-focus reports pass. The finalizer checks both report hashes against the actual masters, timeline/layout identities, the exact file inventory, reviewed cover/caption hashes and copied-file identities. It adds verified masters to `output/posting-kit/YouTube/` and `TikTok/`; preserve separate 1920×1080 YouTube and 1200×1600 TikTok covers. Include English SRT/VTT, both descriptions, titles, a concise start guide and SHA-256 checksums. Copy the complete kit to a new Desktop folder and compare every copied hash.

Extract representative README frames from the verified masters, not from reconstructed stills. Record exact frame index, output SHA, dimensions, image hash and creator credits in the screenshot inventory. Publish source, compact evidence and reusable lessons through a reviewed, checked and merged PR. Full soundtrack/source videos and private machine paths do not belong in the public source handoff. Verify the remote default branch and leave no completed PR outstanding.
