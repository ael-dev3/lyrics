import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const path='publishing/Tvoi-Glaza-TikTok-Cover-Profile-1200x1600.jpg',metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-of','json',path],{encoding:'utf8'})).streams[0];
if(metadata.width!==1200||metadata.height!==1600||metadata.sample_aspect_ratio!=='1:1')throw Error('Cover geometry');
writeFileSync('publishing/cover-manifest.json',JSON.stringify({path,width:1200,height:1600,ratio:'3:4',bytes:statSync(path).size,sha256:createHash('sha256').update(readFileSync(path)).digest('hex'),generation:'built-in image_gen; exact prompt and original retained',review:'Native, 150×200 and 5%-per-edge crop simulation visually checked; no platform upload claimed',sourceCreators:'POLNALYUBVI; ORAMAI; FINITO',thirdPartyRights:'Source imagery excluded from repository contribution license'},null,2));
