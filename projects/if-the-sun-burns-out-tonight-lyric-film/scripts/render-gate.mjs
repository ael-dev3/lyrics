import {readFileSync,realpathSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isAbsolute,relative,resolve,sep} from 'node:path';

export const SONG='x8jAY2CoOBg';
export const REVISION='word-atmosphere-v5';
export const APPROVED_FONT='output/runtime/AvenirNextCondensed-DemiBold.ttf';
export const PREVIEW_INPUTS=Object.freeze([
  'public/source.mp4','public/audio-features.json','public/audio-features.bin',
  'public/fire-dynamics.json','review/index.html','src/timeline.json',
  'src/preview-core.js','src/player.js','src/spectrum-view.js',
  'src/fire-dynamics.js','src/sunfire.js','src/sunbeam.js',
  'src/frost.js','src/darkness.js','src/damage.js',
]);
export const PRODUCTION_INPUTS=Object.freeze([
  'scripts/render-production.mjs','scripts/production-scene.mjs',
  'scripts/native-env.mjs','scripts/render-gate.mjs','src/production-layout.json',
  APPROVED_FONT,'package.json','package-lock.json',
]);
export const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
export const previewFiles=()=>[...PREVIEW_INPUTS];

function projectFile(root,path) {
  if(typeof path!=='string'||!path||isAbsolute(path)||path.includes('\\')
      ||path.split('/').some(part=>!part||part==='.'||part==='..'))
    throw Error('Unsafe project-relative input path: '+String(path));
  const file=resolve(root,path),actual=realpathSync(file),inside=relative(root,actual);
  if(inside==='..'||inside.startsWith('..'+sep)||isAbsolute(inside)||!statSync(actual).isFile())
    throw Error('Input is not a regular file inside the project: '+path);
  return file;
}

function readRecord(root,path,label) {
  try{return JSON.parse(readFileSync(projectFile(root,path),'utf8'));}
  catch(error){throw Error(label+' is missing or invalid', {cause:error});}
}

function verifyInputs(root,hashes,required,label) {
  if(!hashes||typeof hashes!=='object'||Array.isArray(hashes))
    throw Error(label+' input hashes required');
  for(const path of required)if(!Object.hasOwn(hashes,path))
    throw Error(label+' omits required input: '+path);
  for(const[path,hash]of Object.entries(hashes)) {
    if(typeof hash!=='string'||!/^[a-f0-9]{64}$/.test(hash))
      throw Error(label+' has an invalid SHA-256: '+path);
    if(sha(projectFile(root,path))!==hash)throw Error(label+' changed: '+path);
  }
}

// Optional root/env injection keeps failure tests isolated from real approval
// records. The production entry point uses its ordinary project cwd/env.
export function assertGate(production=false,{root=process.cwd(),env=process.env}={}) {
  root=realpathSync(root);
  const authorizationPath='evidence/render-authorization.json';
  const record=readRecord(root,authorizationPath,'Current render authorization');
  if(record?.song!==SONG||record.revision!==REVISION||record.productionAuthorized!==true
      ||record.currentPreviewReview!=='owner-attested-complete')
    throw Error('Current song, preview review and render authorization required');
  verifyInputs(root,record.previewHashes,PREVIEW_INPUTS,'Approved preview');
  if(production) {
    const adoption=readRecord(root,'evidence/production-adoption.json','Production adapter proof');
    if(adoption?.status!=='PASS'||adoption.song!==SONG||adoption.revision!==REVISION)
      throw Error('Current song and revision production adapter proof required');
    if(adoption.authorizationSha256!==sha(projectFile(root,authorizationPath)))
      throw Error('Production adapter proof belongs to a different authorization');
    verifyInputs(root,adoption.inputHashes,PRODUCTION_INPUTS,'Production adapter');
    if(env.LYRIC_FONT) {
      const selected=realpathSync(resolve(root,env.LYRIC_FONT));
      if(selected!==realpathSync(projectFile(root,APPROVED_FONT)))
        throw Error('LYRIC_FONT does not select the approved production font');
    }
  }
  return record;
}
