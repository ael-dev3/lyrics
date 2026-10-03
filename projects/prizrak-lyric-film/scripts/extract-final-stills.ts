import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream,mkdirSync,readFileSync,renameSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {resolve,relative,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(import.meta.dirname,'..');
const OUTPUT_FRAME=12858,OUTPUT_FPS=60,SOURCE_FPS=25,SOURCE_FRAME=5357;
const SOURCE_PTS_SECONDS=214.28,OUTPUT_TIME_SECONDS=214.3;
type Format='landscape'|'portrait';
type Identity={project:string;revision:string;inputHashes:Record<string,string>;cueIds:string[]};
type Film={file:string;sha256:string;width?:number;height?:number};
type Report={status:string;revision:string;sourceSha256:string;approvedInputHashes:Record<string,string>;rendererSha256:string;verifierSha256:string;formats:Partial<Record<Format,Film>>;manifestSha256?:string;previewIdentitySha256?:string;syncReviewSha256?:string;productionAuthorizationSha256?:string;gateEvidenceHashes?:Record<string,string>};
type Clock={sha256:string;sourceOffsetSeconds:number;video:{width:number;height:number;fpsNumerator:number;fpsDenominator:number;frameCount:number};output:{fpsNumerator:number;fpsDenominator:number;frames:number}};
type Snapshot<T>={data:T;sha256:string};
const names:Record<Format,string>={landscape:'Prizrak-Sotode-YouTube-1920x1080-60fps.mp4',portrait:'Prizrak-Sotode-TikTok-1080x1920-60fps.mp4'};
const geometry:Record<Format,{width:number;height:number}>={landscape:{width:1920,height:1080},portrait:{width:1080,height:1920}};
const digest=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
const snapshot=<T>(path:string):Snapshot<T>=>{const bytes=readFileSync(resolve(root,path));return {data:JSON.parse(bytes.toString('utf8')) as T,sha256:digest(bytes)};};
async function hashFile(path:string){const h=createHash('sha256');for await(const chunk of createReadStream(path))h.update(chunk as Buffer);return h.digest('hex');}

async function assertInputs(identity:Identity){
  assert.equal(identity.project,'prizrak-lyric-film');
  assert.equal(Object.keys(identity.inputHashes).length,18,'Expected the current 18-input approved identity.');
  for(const [name,expected]of Object.entries(identity.inputHashes)){
    const path=resolve(root,name),inside=relative(root,path);
    assert.ok(inside&&!inside.startsWith('..'),'Frozen input escaped the project.');
    assert.match(expected,/^[a-f0-9]{64}$/u);
    assert.equal(await hashFile(path),expected,`Changed approved input: ${name}`);
  }
}

async function decodeStill(format:Format,filmPath:string,temporary:string){
  // Decode the delivered film's zero-based frame index. No seek heuristic,
  // paintScene call, scale, crop, reconstructed text or audio change is used.
  const args=['-hide_banner','-loglevel','info','-nostdin','-y','-copyts','-i',filmPath,'-map','0:v:0','-an','-vf',`select=eq(n\\,${OUTPUT_FRAME}),showinfo`,'-frames:v','1','-fps_mode','passthrough','-q:v','2','-f','image2','-update','1',temporary];
  let diagnostics='';const started=Date.now();
  const child=spawn('ffmpeg',args,{stdio:['ignore','ignore','pipe']});
  child.stderr.setEncoding('utf8');child.stderr.on('data',(part:string)=>{diagnostics=(diagnostics+part).slice(-256000);});
  const ticker=setInterval(()=>console.log(JSON.stringify({phase:'final-still-extraction',format,outputFrame:OUTPUT_FRAME,elapsedSeconds:Math.round((Date.now()-started)/1000)})),15000);
  try{
    await new Promise<void>((done,fail)=>{child.once('error',fail);child.once('close',code=>code===0?done():fail(Error(`Final still extraction failed (${format}, exit ${code}): ${diagnostics.slice(-1600)}`)));});
  }finally{clearInterval(ticker);}
  const shown=/n:\s*0\s+pts:\s*\d+\s+pts_time:([\d.]+)/u.exec(diagnostics);
  assert.ok(shown,`No selected decoded-frame PTS: ${format}`);
  assert.ok(Math.abs(Number(shown[1])-OUTPUT_TIME_SECONDS)<1e-6,`Unexpected delivered picture PTS: ${format}`);
  const probe=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,sample_aspect_ratio','-of','json',temporary],{encoding:'utf8'});
  assert.equal(probe.status,0,`JPEG probe failed: ${probe.error?.message??probe.stderr}`);
  const metadata=JSON.parse(probe.stdout) as {streams:{width:number;height:number;sample_aspect_ratio:string}[]};
  assert.equal(metadata.streams.length,1);
  const image=metadata.streams[0]!;assert.equal(image.width,geometry[format].width);assert.equal(image.height,geometry[format].height);assert.equal(image.sample_aspect_ratio,'1:1');
  const bytes=statSync(temporary).size;assert.ok(bytes>0);
  return {format,path:`evidence/final-${format}-overlap-214.300.jpg`,width:image.width,height:image.height,bytes,sha256:await hashFile(temporary),filmPath:`renders/${names[format]}`,outputFrame:OUTPUT_FRAME,outputPtsSeconds:Number(shown[1]),sourceFrame:SOURCE_FRAME,sourcePtsSeconds:SOURCE_PTS_SECONDS};
}

async function main(){
  if(process.argv.includes('--help')){console.log('Usage: node scripts/extract-final-stills.ts\nRequires both combined passed final verification reports and exact completed film hashes. Extracts output frame 12858 (214.300s) in both formats.');return;}
  assert.equal(SOURCE_FRAME,Number(BigInt(OUTPUT_FRAME)*BigInt(SOURCE_FPS)/BigInt(OUTPUT_FPS)));
  assert.equal(SOURCE_PTS_SECONDS,SOURCE_FRAME/SOURCE_FPS);assert.equal(OUTPUT_TIME_SECONDS,OUTPUT_FRAME/OUTPUT_FPS);
  const paths=['evidence/preview-inputs.json','evidence/final-verification.json','evidence/decoded-scene-verification.json','source/production-clock.json','evidence/sync-review.json','evidence/production-authorization.json'] as const;
  const frozen=Object.fromEntries(paths.map(path=>[path,snapshot<unknown>(path).sha256]));
  const identity=snapshot<Identity>(paths[0]).data,technical=snapshot<Report>(paths[1]).data,decoded=snapshot<Report>(paths[2]).data,clock=snapshot<Clock>(paths[3]).data;
  await assertInputs(identity);
  assert.equal(clock.sha256,identity.inputHashes['public/source.mp4']);assert.equal(clock.sourceOffsetSeconds,0);
  assert.equal(clock.video.width,1920);assert.equal(clock.video.height,1080);assert.equal(clock.video.fpsNumerator,25);assert.equal(clock.video.fpsDenominator,1);assert.equal(clock.video.frameCount,6376);
  assert.equal(clock.output.fpsNumerator,60);assert.equal(clock.output.fpsDenominator,1);assert.equal(clock.output.frames,15306);assert.ok(OUTPUT_FRAME<clock.output.frames);
  const rendererPath=resolve(root,'scripts/render-production.ts'),rendererSha256=await hashFile(rendererPath),makerSha256=await hashFile(fileURLToPath(import.meta.url));
  for(const [report,verifier]of [[technical,'scripts/verify-final.ts'],[decoded,'scripts/verify-decoded-scene.ts']] as const){
    assert.equal(report.status,'passed','Both-format combined report must be passed; partial is not sufficient.');
    assert.equal(report.revision,identity.revision);assert.equal(report.sourceSha256,identity.inputHashes['public/source.mp4']);assert.deepEqual(report.approvedInputHashes,identity.inputHashes);
    assert.equal(report.rendererSha256,rendererSha256);assert.equal(report.verifierSha256,await hashFile(resolve(root,verifier)));
    for(const format of ['landscape','portrait'] as const){
      const film=report.formats[format];assert.ok(film,`Missing report format: ${format}`);assert.equal(film.file,names[format]);assert.equal(basename(film.file),film.file);
      assert.equal(await hashFile(resolve(root,'renders',names[format])),film.sha256,`Verified completed film changed: ${format}`);
    }
  }
  assert.equal(technical.manifestSha256,frozen['source/production-clock.json']);assert.equal(technical.previewIdentitySha256,frozen['evidence/preview-inputs.json']);assert.equal(technical.syncReviewSha256,frozen['evidence/sync-review.json']);assert.equal(technical.productionAuthorizationSha256,frozen['evidence/production-authorization.json']);
  assert.ok(decoded.gateEvidenceHashes,'Decoded report lacks its approval snapshot.');
  for(const name of ['source/production-clock.json','evidence/preview-inputs.json','evidence/sync-review.json','evidence/production-authorization.json'])assert.equal(decoded.gateEvidenceHashes[name],frozen[name],`Decoded approval evidence changed: ${name}`);
  const temporaryPaths: string[]=[];
  try{
    mkdirSync(resolve(root,'evidence'),{recursive:true});
    const images=[];
    for(const format of ['landscape','portrait'] as const){
      const temporary=resolve(root,`evidence/.final-${format}-overlap-214.300.${process.pid}.jpg`);temporaryPaths.push(temporary);
      images.push({...await decodeStill(format,resolve(root,'renders',names[format]),temporary),filmSha256:technical.formats[format]!.sha256,temporary});
    }
    // Recheck the actual media, all frozen inputs and reports before exposing
    // either image as final evidence. Only then write the complete receipt.
    await assertInputs(identity);
    for(const path of paths)assert.equal(await hashFile(resolve(root,path)),frozen[path],`Evidence changed during extraction: ${path}`);
    assert.equal(await hashFile(rendererPath),rendererSha256);assert.equal(await hashFile(fileURLToPath(import.meta.url)),makerSha256);
    for(const image of images)assert.equal(await hashFile(resolve(root,image.filmPath)),image.filmSha256,`Film changed during extraction: ${image.format}`);
    for(const image of images){renameSync(image.temporary,resolve(root,image.path));assert.equal(await hashFile(resolve(root,image.path)),image.sha256);}
    const receipt={schema:'prizrak/final-stills/v1',status:'passed',project:identity.project,revision:identity.revision,extractedAt:new Date().toISOString(),sourceSha256:identity.inputHashes['public/source.mp4'],approvedInputHashes:identity.inputHashes,previewIdentitySha256:frozen['evidence/preview-inputs.json'],rendererSha256,makerSha256,verificationReportHashes:{technical:frozen['evidence/final-verification.json'],decodedScene:frozen['evidence/decoded-scene-verification.json']},outputFrame:OUTPUT_FRAME,outputPtsSeconds:OUTPUT_TIME_SECONDS,sourceFrame:SOURCE_FRAME,sourcePtsSeconds:SOURCE_PTS_SECONDS,images:images.map(({temporary,...image})=>image),method:'Actual completed MP4 frames selected by zero-based decoded frame index 12858, verified PTS 214.300, full-frame JPEG quality 2; no crop, scaling, scene reconstruction or text repaint.',limits:'Still provenance and gate identity only; both combined passed reports are prerequisites. This extraction does not add listening attestation, establish acoustic accuracy, or prove every unsampled picture.'};
    const reportPath=resolve(root,'evidence/final-stills.json'),reportTemporary=reportPath+'.tmp';writeFileSync(reportTemporary,JSON.stringify(receipt,null,2)+'\n');renameSync(reportTemporary,reportPath);
    console.log(JSON.stringify({status:receipt.status,revision:identity.revision,outputFrame:OUTPUT_FRAME,images:receipt.images.map(image=>({path:image.path,width:image.width,height:image.height,sha256:image.sha256}))}));
  }finally{for(const path of temporaryPaths)rmSync(path,{force:true});}
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error instanceof Error?error.message:String(error));process.exitCode=1;});
