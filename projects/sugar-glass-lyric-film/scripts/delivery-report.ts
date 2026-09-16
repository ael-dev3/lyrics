import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import {frameAt} from '../src/focus.ts';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const formats=['landscape','portrait'] as const;
const rows=formats.map(format=>{
 const name=`Sugar-Glass-${format}-${format==='landscape'?'1920x1080':'1080x1920'}-60fps.mp4`;
 const verification=read(`evidence/${name}.verification.json`),focus=read(`evidence/${name}.focus-verification.json`),reference=read(`evidence/${format}-reference-verification.json`),visual=read(`evidence/delivery-approved-${format}.json`);
 if(verification.status!=='passed technical verification'||focus.status!=='passed'||reference.status!=='passed'||visual.status!=='approved')throw Error('Incomplete delivery acceptance '+format);
 if(focus.decodedFrames!==13881||focus.mismatchCount||focus.ambiguous)throw Error('Incomplete decoded focus '+format);
 return {format,name,verification,focus,reference,visual};
});
const data=parseData(read('src/cues.json')),words=data.cues.flatMap(c=>c.source),maxDisplayRoundingMs=Math.max(...words.flatMap(w=>[w.startSample,w.endSample]).map(s=>Math.abs(frameAt(s,data.sampleRate,data.fps)/data.fps-s/data.sampleRate)*1000));
const receipt={project:'Anya Nami — Sugar Glass',edition:'English-only approved preview v2',status:'both local deliveries technically and visually verified',sourceUrl:'https://www.youtube.com/watch?v=-NsQ8_WLq2s',previewRevision:'preview-v2-english',authorizationId:read('evidence/render-authorization.json').authorizationId,productionInputHashes:read('evidence/production-identity.json').hashes,sourceCommit:process.argv[2]??null,sourceAudioSeconds:data.duration,videoFrames:data.frames,fps:data.fps,maxDisplayRoundingMs,cues:data.cues.length,words:words.length,files:rows.map(({format,name,verification:v,focus:f,reference:r})=>({format,name,bytes:v.bytes,sha256:v.sha256,width:v.video.width,height:v.video.height,codec:v.video.codec_name,pixelFormat:v.video.pix_fmt,aacPackets:v.aacPackets,visibleWordStates:f.wordStates,decodedFocusMismatches:f.mismatchCount,ambiguousStates:f.ambiguous,referenceSegments:r.segments.length})),publication:'Local media delivery; source, small visual evidence and checksums on GitHub. No new public binary release or platform upload.',limits:'Accepted event map preserved. Granular listening telemetry is unknown and acoustic-model disagreement remains documented; decoded color checks are not an acoustic-accuracy certificate.'};
writeFileSync('evidence/delivery-receipt.json',JSON.stringify(receipt,null,2)+'\n');
writeFileSync('evidence/delivery-checksums.sha256',rows.map(({name,verification:v})=>`${v.sha256}  ${name}`).join('\n')+'\n');
const report=`# Sugar Glass — final delivery verification

Both complete English-only films reproduce the accepted preview-v2 composition and original soundtrack. Production followed explicit acceptance and render authorization. The review record preserves unavailable granular listening telemetry and the documented acoustic uncertainty.

## Verified deliveries

| Format | Dimensions | Frames | Decoded word states checked | Original AAC packets |
| --- | --- | ---: | ---: | ---: |
${rows.map(({format,verification:v,focus:f})=>`| ${format} | ${v.video.width}×${v.video.height}, 60 fps | ${v.frames.toLocaleString('en-US')} | ${f.wordStates.toLocaleString('en-US')} | ${v.aacPackets.toLocaleString('en-US')} |`).join('\n')}

Both files use HEVC Main 10 / hvc1, 10-bit 4:2:0 pixels, square pixels and BT.709 limited-range metadata. Rendering captures 2× PNG frames into twelve ProRes 4444 segments per format, then applies one Lanczos downsample and a medium-preset CRF 17 encode. The source footage retains its 25 fps cadence; new graphics run at 60 fps.

## Checks passed

- Strict full-file decoding, complete frame inventory and every video timestamp against frame number / 60.
- Original 44.1 kHz stereo AAC payloads, PTS, DTS, packet durations and sizes retained exactly; no audio re-encode, gain or resampling. Decoded PCM SHA-256 and all 10,202,112 samples match the original.
- Every visible lead/backing word's decoded highlight agrees with the accepted event map, with zero mismatches and zero ambiguous states in both complete files. An intentionally shifted one-frame diagnostic produces 13 mismatches and four ambiguous states.
- All twelve reference segments have matching SHA-256 identities, complete packet inventories and contiguous global frame ranges.
- Representative final pictures and both sides of every capture join were inspected, including the opening title, large refrain, long lines, independent backing vocals, final lyric and complete tail.
- Fast-start MP4 structure places metadata before media data.

The paired 90-frame codec diagnostic scored full-frame SSIM 0.998144 and a lyric-region average PSNR of 53.549430 dB (minimum 52.023554 dB). These are sample measurements, not whole-film quality scores; [the diagnostic record](codec-diagnostic.json) records its exact scope.

## Timing and review limits

The 13,881-frame video lasts 231.35 seconds. Original audio lasts ${data.duration.toFixed(9)} seconds. The final video frame covers the fractional audio ending; the source picture is held within its last frame for the short remaining tail.

Display rounding differs from the frozen sample intervals by at most ${maxDisplayRoundingMs.toFixed(6)} ms, below half a 60 fps frame. This is a display bound, not proof that acoustic boundaries are exact. Independent aligner disagreements, supplied wording and post-chorus questions remain in the [review record](sync-review.md). Overall preview acceptance is not represented as recorded per-cue listening.

## Identity and handoff

${rows.map(({format,verification:v})=>`- ${format}: SHA-256 \`${v.sha256}\``).join('\n')}

See the [structured receipt](delivery-receipt.json), [checksums](delivery-checksums.sha256), [production notes](../PRODUCTION-LESSONS.md) and [original source](https://www.youtube.com/watch?v=-NsQ8_WLq2s). Original music, lyrics, performance and mood video: Anya Nami. Added lyric presentation follows the Lyrics workflow in general with Codex assistance.

Full media stays local. This source handoff does not publish a new binary release or upload to a video platform.
`;
writeFileSync('evidence/final-verification.md',report);console.log('Delivery receipt, checksums and verification report written');
