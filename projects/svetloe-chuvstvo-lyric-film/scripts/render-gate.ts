import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const requiredPreviewInputs=['public/source.mp4','public/source-reference.png','public/timeline.json','public/audio-features.json','public/window-anchors.json','public/fonts/NotoSerif.ttf','src/model.ts','src/scene.ts','src/player.ts','review/index.html','review/client.js'];
export function assertRequiredPreviewInputs(binding:{inputs?:Record<string,unknown>}):void {
  for(const path of requiredPreviewInputs)if(typeof binding.inputs?.[path]!=='string'||!/^[a-f0-9]{64}$/.test(binding.inputs[path] as string))throw Error(`Missing required complete-preview input: ${path}`);
}
export function checkCurrentProductionGate():void {
  const state=JSON.parse(readFileSync('evidence/review-status.json','utf8'));
  const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
  const digest=hash('public/timeline.json');
  const timeline=JSON.parse(readFileSync('public/timeline.json','utf8'));
  const binding=JSON.parse(readFileSync('evidence/preview-inputs.json','utf8'));
  assertRequiredPreviewInputs(binding);
  if(state.timelineSha256!==digest)throw Error('Stale current-revision review');
  if(state.previewInputsSha256!==hash('evidence/preview-inputs.json')||state.revision!==timeline.revision||state.sourceSha256!==timeline.sourceSha256)throw Error('Stale song or preview identity');
  for(const [path,expected] of Object.entries(binding.inputs))if(hash(path)!==expected)throw Error(`Stale complete-preview input: ${path}`);
  if(!state.renderApproval.approved||!state.productionAuthorized)throw Error('Preview-only: current song has no render approval');
  if(state.renderApproval.revision!==state.revision||state.renderApproval.previewInputsSha256!==state.previewInputsSha256)throw Error('Render approval belongs to another revision');
  if(state.listeningReview.status!=='complete'||!state.listeningReview.fullNormalSpeed||!state.listeningReview.uncertainReducedSpeed||!state.listeningReview.bothLayouts)throw Error('Incomplete current-revision listening review');
  if(state.listeningReview.previewInputsSha256!==state.previewInputsSha256)throw Error('Listening review belongs to another revision');
  if(state.technicalChecks!=='passed')throw Error('Incomplete technical verification');
}
