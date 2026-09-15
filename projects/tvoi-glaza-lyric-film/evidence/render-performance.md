# Capture and reference encoding

All production captures use the frozen reviewed Remotion scene, original footage, exact bundled font, PNG image frames and 2× scale.

The first full segments were captured with software ProRes selected initially. Their complete PNG sequences were preserved before cancelling slow software encoding and encoded with the Mac's VideoToolbox ProRes 4444 encoder. Frame-packet counts, dimensions, profile, pixel format and segment SHA-256 were checked before adopting those references. Remaining segments use Remotion's hardware-acceleration option, with the same codec profile and image capture contract. This changes the reference encoder, not the scene, focus or source clock.

A GL-backend still test favored the original default (3.35 s versus ANGLE 5.94 s, including setup under concurrent work). A separate three-layer cache experiment changed some compositing values by up to 2/255 and did not demonstrate a throughput gain; it was rejected. No production segment uses that experimental scene. `src/Film.tsx` and `src/scene.ts` remain equal to the frozen reviewed hashes apart from the already recorded final-picture hold.

Performance diagnostics are not delivery masters and are not used as production intermediates.
