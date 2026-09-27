import * as THREE from 'three';
import {cueAt,wordAt,smooth} from './core.js';
export function createWorldLyrics(scene){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=896;const ctx=canvas.getContext('2d');
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.minFilter=THREE.LinearFilter;
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,fog:false});
 const group=new THREE.Group();group.name='Forecourt inscription — world lyric carrier';scene.add(group);
 const text=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);text.renderOrder=3;group.add(text);
 // A faint same-text projection belongs to the stone underneath the inscription.
 const projection=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.10,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));projection.rotation.x=-Math.PI/2;scene.add(projection);
 const gold=new THREE.MeshStandardMaterial({color:'#ad9870',metalness:.55,roughness:.44,emissive:'#b79851',emissiveIntensity:.16});
 const runes=new THREE.Group();runes.name='Inscription anchor stones';scene.add(runes);
 for(const side of [-1,1]){const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.26,0),gold);st.position.set(side*8,.26,19.2);st.scale.set(.65,1.6,.65);runes.add(st)}
 let cueId='',active=-2,format='',lastGeometry=[],layoutCache=new Map(),currentCue=null;
 function layout(cue,f){
  const key=f+cue.id;if(layoutCache.has(key))return layoutCache.get(key);
  const max=f==='portrait'?1700:1920;let font=f==='portrait'?225:175,rows,gap;
  // Fit a whole phrase once, before it appears; word focus never changes size.
  do{ctx.font=`700 ${font}px Space`;gap=ctx.measureText(' ').width;rows=[];let r=[],rw=0;
   cue.words.forEach((w,i)=>{const m=ctx.measureText(w.text),ww=m.width;if(r.length&&rw+gap+ww>max){rows.push({words:r,width:rw});r=[];rw=0}r.push({text:w.text,width:ww,index:i,ascent:m.actualBoundingBoxAscent,descent:m.actualBoundingBoxDescent,left:m.actualBoundingBoxLeft,right:m.actualBoundingBoxRight});rw+=ww+(r.length>1?gap:0)});
   if(r.length)rows.push({words:r,width:rw});if(rows.length<=3)break;font-=5;
  }while(font>150);
  const line=font*1.19;const result=[];rows.forEach((r,ri)=>{let x=(2048-r.width)/2;const y=470+(ri-(rows.length-1)/2)*line;r.words.forEach(w=>{result.push({...w,x,y,font});x+=w.width+gap})});layoutCache.set(key,result);return result;
 }
 function update(t,lyrics,camera,f,enabled=true){const cue=enabled?cueAt(lyrics.cues,t):null;currentCue=cue;const ai=cue?wordAt(cue.words,t):-1;const changed=cueId!==(cue?.id||'')||ai!==active||f!==format;
  if(changed){ctx.clearRect(0,0,2048,896);lastGeometry=[];if(cue){const geo=layout(cue,f);for(const w of geo){ctx.font=`700 ${w.font}px Space`;ctx.textBaseline='alphabetic';ctx.fillStyle=w.index===ai?'#fff4ad':'#c2dce7';ctx.lineJoin='round';ctx.strokeStyle='rgba(2,9,20,.97)';ctx.lineWidth=15;ctx.shadowColor='rgba(2,8,20,.95)';ctx.shadowBlur=16;ctx.strokeText(w.text,w.x,w.y);ctx.shadowColor=w.index===ai?'rgba(255,180,36,.85)':'rgba(63,230,255,.36)';ctx.shadowBlur=w.index===ai?28:11;ctx.fillText(w.text,w.x,w.y);lastGeometry.push({...w,active:w.index===ai})}ctx.shadowBlur=0;}texture.needsUpdate=true;cueId=cue?.id||'';active=ai;format=f;}
  // Same physical anchor throughout a phrase. Format determines staging, not per-word geometry.
  const pw=f==='portrait'?15.5:27.5;group.position.set(f==='portrait'?.7:3.8,f==='portrait'?7.2:8.1,21);group.quaternion.copy(camera.quaternion);text.scale.set(pw,pw*896/2048,1);
  const alpha=cue?Math.min(smooth(cue.displayStart,cue.displayStart+.11,t),1-smooth(cue.displayEnd-.10,cue.displayEnd,t)):0;material.opacity=alpha;group.visible=!!cue;projection.visible=!!cue;projection.position.set(f==='portrait'?1.5:3.8,.09,22.2);projection.scale.set(pw,5.4,1);projection.material.opacity=.028*alpha;
  group.updateMatrixWorld(true);const glyphCorners=lastGeometry.flatMap(w=>[[w.x-w.left-12,w.y-w.ascent-12],[w.x+w.right+12,w.y+w.descent+12]]).map(([x,y])=>new THREE.Vector3((x/2048-.5)*pw,(.5-y/896)*pw*896/2048,0).applyMatrix4(group.matrixWorld).project(camera));const corners=glyphCorners.length?[[Math.min(...glyphCorners.map(v=>v.x)),Math.min(...glyphCorners.map(v=>v.y))],[Math.max(...glyphCorners.map(v=>v.x)),Math.max(...glyphCorners.map(v=>v.y))]]:[];return {cue,geometry:lastGeometry,projectedCorners:corners,carrier:'forecourt-inscription',worldPosition:group.position.toArray(),worldWidth:pw};
 }
 return {update,group,projection,get geometry(){return lastGeometry},get cue(){return currentCue}};
}
