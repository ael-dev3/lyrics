import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {createMenuLandscape3D,riverX,terrainHeight} from './landscape.js';
import {createWorldLyrics} from './world-lyrics.js';
import {createMagicVfx} from './magic-vfx.js';
import {createMountainSign} from './mountain-sign.js';
import {clamp,smooth,seedRandom} from './core.js';
import {sampleGuardianPose} from './guardian-clock.js';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export async function createWorld(canvas,onProgress=()=>{}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setSize(540,960,false);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#162a32');scene.fog=new THREE.FogExp2('#1c333c',.008);
 const camera=new THREE.PerspectiveCamera(40,9/16,.1,300);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.42,.65,1.08);composer.addPass(bloom);composer.addPass(new OutputPass());
 const landscape=createMenuLandscape3D(scene,'cinematic');const sky=scene.getObjectByName('PR375 sky');const skyColors=sky.geometry.getAttribute('color');for(let i=0;i<skyColors.count;i++){skyColors.setXYZ(i,skyColors.getX(i)*.3,skyColors.getY(i)*.41,skyColors.getZ(i)*.54)}skyColors.needsUpdate=true;
 const river=scene.getObjectByName('PR375 river');river.material.color.set('#418d92');river.material.emissive.set('#245969');river.material.emissiveIntensity=.26;
 const hemi=new THREE.HemisphereLight('#b5d9df','#293726',.4);scene.add(hemi);scene.add(new THREE.AmbientLight('#c4d1c2',.06));
 const key=new THREE.DirectionalLight('#ffe4b9',2.4);key.position.set(-22,36,29);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:110});key.shadow.bias=-.0002;key.shadow.normalBias=.035;scene.add(key);
 const fill=new THREE.DirectionalLight('#829bd5',1.18);fill.position.set(25,24,8);scene.add(fill);const rim=new THREE.DirectionalLight('#89a8e5',.82);rim.position.set(-4,31,-25);scene.add(rim);
 const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);const models={};const names=['castle','guardian','honor-guard','lamplighter','rabbit','brazier','tree','pine'];await Promise.all(names.map(async name=>{models[name]=await loader.loadAsync('/public/assets/pr375/'+name+'.glb');onProgress(`Lighting ${name.replaceAll('-',' ')}…`)}));
 const bounds={};function configure(root){root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}})}
 for(const [name,m]of Object.entries(models)){const b=new THREE.Box3().setFromObject(m.scene);bounds[name]={min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(V()).toArray()}}
 const castle=models.castle.scene;configure(castle);scene.add(castle);
 const guardian=models.guardian.scene;guardian.position.y=12;configure(guardian);scene.add(guardian);const gm=new THREE.AnimationMixer(guardian);const idle=gm.clipAction(models.guardian.animations.find(c=>c.name==='Warplet_Idle'));idle.play();const saluteClip=models.guardian.animations.find(c=>c.name==='Warplet_Torch_Salute');const salute=saluteClip?gm.clipAction(saluteClip).play():null;if(salute)salute.weight=0;
 const actors=[];function actor(name,pos,scale,clip){const root=cloneSkeleton(models[name].scene);configure(root);root.position.fromArray(pos);root.scale.setScalar(scale);scene.add(root);const mixer=new THREE.AnimationMixer(root);const c=models[name].animations.find(x=>x.name===clip)||models[name].animations[0];const action=c?mixer.clipAction(c).play():null;actors.push({root,mixer,action,name,pos:root.position.clone(),duration:c?.duration||1});return root}
 const guardLeft=actor('honor-guard',[-5.9,0,12.9],1.18,'Idle');guardLeft.rotation.y=.2;
 const guardRight=actor('honor-guard',[5.8,0,12.9],1.18,'Idle');guardRight.rotation.y=-.2;
 const worker=actor('lamplighter',[9,0,15],1.2,'Work');worker.rotation.y=2.9;
 const rabbit=actor('rabbit',[-11,0,16.3],2.3,'Idle');rabbit.rotation.y=1.1;
 const treeSites=[[-17,-8,.9,0],[-19,5,1.05,.8],[-15.5,13,.75,1.5],[16,-11,1.1,2],[18,5,.86,2.9],[15.5,14.5,.72,3.5],[-7,-20,1.15,4.1],[7,-21,.95,4.8]];
 for(const [i,[x,z,s,r]]of treeSites.entries()){const root=models[i%2?'pine':'tree'].scene.clone(true);configure(root);root.position.set(x,terrainHeight(x,z),z);root.scale.setScalar(s);root.rotation.y=r;scene.add(root)}
 const rng=seedRandom(8127);const fireGroups=[],practicals=[];
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const gc=glowCanvas.getContext('2d');const grad=gc.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(255,233,175,1)');grad.addColorStop(.06,'rgba(255,199,114,.95)');grad.addColorStop(.23,'rgba(255,149,60,.22)');grad.addColorStop(1,'rgba(255,126,35,0)');gc.fillStyle=grad;gc.fillRect(0,0,128,128);const glowTex=new THREE.CanvasTexture(glowCanvas);
 function glow(x,y,z,size=2.2,intensity=20){const light=new THREE.PointLight('#ffb75f',intensity,14,2);light.position.set(x,y,z);scene.add(light);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sprite.position.copy(light.position);sprite.scale.setScalar(size);scene.add(sprite);practicals.push({light,sprite,intensity});return light}
 for(const [index,x]of [-9,9].entries()){const base=models.brazier.scene.clone(true);base.position.set(x,0,14);configure(base);scene.add(base);const g=new THREE.Group();g.position.set(x,2.13,14);scene.add(g);for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(.21-i*.025,.83-i*.065,5),new THREE.MeshStandardMaterial({color:i<2?'#e68734':'#ffe5a8',emissive:i<2?'#f17a24':'#ffcc74',emissiveIntensity:2.4,roughness:1}));m.position.set((i%3-1)*.13,.28,(i%2)*.11);g.add(m)}fireGroups.push({g,phase:index*2});glow(x,2.9,14,3.2,36)}
 glow(-6.2,7.4,7.7,2.3,27);glow(6.2,7.4,7.7,2.3,27);glow(0,11.7,2,2,17);
 // Native gate recess receives a bounded practical-light response.
 const gateLight=new THREE.PointLight('#ffc77f',55,18,2);gateLight.position.set(0,3.5,10.7);scene.add(gateLight);
 const glyphLight=new THREE.PointLight('#e8c78f',17,18,2);glyphLight.position.set(0,3.5,20);scene.add(glyphLight);
 // Forty-eight measured bands become a stone-and-light instrument along the approach.
 const spectrumGroup=new THREE.Group();spectrumGroup.name='Measured spectrum · forecourt resonators';scene.add(spectrumGroup);const bars=[],barMat=new THREE.MeshStandardMaterial({color:'#6bf6f5',emissive:'#19dae8',emissiveIntensity:2.6,metalness:.62,roughness:.32});const bases=new THREE.MeshStandardMaterial({color:'#657064',metalness:.2,roughness:.85});
 for(let i=0;i<48;i++){const x=(i-23.5)*.52,z=22.9+Math.pow(x/12,2)*.65;const base=new THREE.Mesh(new THREE.BoxGeometry(.36,.18,.55),bases);base.position.set(x,.1,z);spectrumGroup.add(base);const bm=barMat.clone();bm.color.setHSL(.51+i/48*.23,.8,.68);bm.emissive.setHSL(.51+i/48*.23,.85,.53);const bar=new THREE.Mesh(new THREE.BoxGeometry(.23,1,.23),bm);bar.position.set(x,.24,z);spectrumGroup.add(bar);bars.push(bar)}
 const connectionMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},strength:{value:0},energy:{value:0}},vertexShader:`varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 uv0;uniform float time,strength,energy;void main(){vec2 p=uv0-.5;float ring=exp(-abs(length(vec2(p.x,p.y*.82))-.36)*240.);float pulse=pow(.5+.5*sin(uv0.y*48.-time*1.8),8.);float line=exp(-abs(p.x)*150.)*pulse;gl_FragColor=vec4(.32,.68,.63,(ring*.23+line*.18)*strength*(.45+.55*energy));}`});const connection=new THREE.Mesh(new THREE.PlaneGeometry(31,25),connectionMat);connection.rotation.x=-Math.PI/2;connection.position.set(0,.071,16);scene.add(connection);
 const portalMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{time:{value:0},amount:{value:0},energy:{value:0}},vertexShader:`varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 uv0;uniform float time,amount,energy;void main(){vec2 p=(uv0-.5)*2.;float r=length(p),a=atan(p.y,p.x);float coils=pow(.5+.5*cos(r*75.-time*1.2+2.*sin(a*5.-time*.2)),17.);float aperture=exp(-abs(r-.7)*150.);float mist=exp(-r*5.)*.16;float fade=(1.-smoothstep(.72,.96,r));gl_FragColor=vec4(.48,.27,.88,(coils*.16+aperture*.7+mist)*amount*fade*(.5+energy*.5));}`});const portal=new THREE.Mesh(new THREE.PlaneGeometry(18,18),portalMat);portal.position.set(0,13,-8);scene.add(portal);
 // The complete radial field sits behind the intact architecture and guardian.
 const riverRibbonMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},level:{value:0}},vertexShader:`varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 uv0;uniform float time,level;void main(){float stripes=pow(.5+.5*sin(uv0.y*300.-time*2.+sin(uv0.x*50.)),14.);float edge=sin(uv0.x*3.14159);gl_FragColor=vec4(.23,.68,.69,stripes*edge*level*.32);}`});const rp=[],ruv=[],ri=[];for(let i=0;i<=100;i++){const z=-65+i*1.2;rp.push(riverX(z)-2.5,-.36,z,riverX(z)+2.5,-.36,z);ruv.push(0,i/100,1,i/100);if(i<100){const a=i*2;ri.push(a,a+2,a+1,a+1,a+2,a+3)}}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(ruv,2));rg.setIndex(ri);const riverRibbon=new THREE.Mesh(rg,riverRibbonMat);riverRibbon.frustumCulled=false;scene.add(riverRibbon);
 const dustN=220,dustPos=new Float32Array(dustN*3),dustSeeds=[];for(let i=0;i<dustN;i++)dustSeeds.push([(rng()-.5)*58,rng()*18+.5,(rng()-.5)*50,rng()*6.28]);const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dustPos,3));const dust=new THREE.Points(dg,new THREE.PointsMaterial({color:'#dcbd78',size:.07,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(dust);
 const rainN=700,rainPos=new Float32Array(rainN*6),rainSeeds=Array.from({length:rainN},()=>[(rng()-.5)*65,rng()*33,(rng()-.5)*65]);const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:'#9caecc',transparent:true,opacity:0,depthWrite:false}));scene.add(rain);
 const birds=[];const birdMat=new THREE.MeshStandardMaterial({color:'#8dabae',roughness:1});for(let i=0;i<4;i++){const g=new THREE.Group(),body=new THREE.Mesh(new THREE.IcosahedronGeometry(.17,0),birdMat);body.scale.set(1.4,.5,.6);g.add(body);const wings=[];for(const side of [-1,1]){const pivot=new THREE.Group(),wing=new THREE.Mesh(new THREE.ConeGeometry(.13,.7,3),birdMat);wing.rotation.z=side*Math.PI/2;wing.position.x=side*.3;pivot.add(wing);g.add(pivot);wings.push(pivot)}scene.add(g);birds.push({g,wings,phase:i*2})}
 const mountainSign=await createMountainSign(THREE,scene,{terrainHeight});const raycaster=new THREE.Raycaster();const magic=createMagicVfx(THREE,scene);const worldLyrics=createWorldLyrics(scene);let lyricData={cues:[]},spectrum=null,options={lyrics:true};
 let format='portrait',lastState=null,lastLyrics=null;
 const shots=[
 {t:0,p:[26,24,48],l:[0,8,3],f:38},{t:24,p:[24,23,47],l:[0,8,3],f:38},
 {t:54,p:[28,23,46],l:[0,8,3],f:39},{t:59,p:[19,20,44],l:[0,7.8,4],f:37},
 {t:68,p:[18,20,43],l:[0,8,4],f:37},{t:70,p:[28,27,53],l:[0,8,2],f:39},
 {t:99,p:[25,26,51],l:[0,8,2],f:39},{t:104,p:[16,25,51],l:[0,8,2],f:39},
 {t:127,p:[13,26,52],l:[0,8,2],f:39},{t:132,p:[-21,22,47],l:[0,7,4],f:38},
 {t:144,p:[-18,22,46],l:[0,7,4],f:38},{t:148,p:[28,27,53],l:[0,8,2],f:39},
 {t:177,p:[25,26,51],l:[0,8,2],f:39},{t:180,p:[-20,23,49],l:[0,8,3],f:39},
 {t:197,p:[-17,23,48],l:[0,8,3],f:39},{t:203,p:[-30,28,55],l:[-2,8,1],f:41},
 {t:212,p:[-25,29,55],l:[-2,8,1],f:41},{t:215,p:[28,27,53],l:[0,8,2],f:39},
 {t:223,p:[24,24,49],l:[0,8,3],f:38},{t:227,p:[18,21,45],l:[0,8,4],f:37},
 {t:247,p:[20,22,46],l:[0,8,3],f:38},{t:254,p:[26,24,48],l:[0,8,3],f:38},{t:274,p:[26,24,48],l:[0,8,3],f:38}];
 function resize(w,h,f){format=f;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
 function update(s){lastState=s;const t=s.t,m=s.reduced?.15:1;let a=shots[0],b=shots.at(-1);for(let i=0;i<shots.length-1;i++)if(t>=shots[i].t&&t<shots[i+1].t){a=shots[i];b=shots[i+1];break}const u=smooth(a.t,b.t,t),p=a.p.map((v,i)=>v+(b.p[i]-v)*u),l=a.l.map((v,i)=>v+(b.l[i]-v)*u);p[0]=(Math.abs(a.p[0])+(Math.abs(b.p[0])-Math.abs(a.p[0]))*u)*.4;l[0]=0;l[1]+=1;if(format==='portrait'){p[0]*=.38;p[1]+=1;p[2]+=8;l[1]+=1;}
  camera.position.fromArray(p);camera.lookAt(...l);camera.fov=a.f+(b.f-a.f)*u+7;camera.updateProjectionMatrix();
  landscape.update(t*m);sampleGuardianPose(gm,idle,salute,saluteClip,t,m);
  for(const actor of actors)actor.mixer.setTime(t*m*(actor.name==='lamplighter'?.65:.45));
  fireGroups.forEach(({g,phase})=>{g.children.forEach((flame,i)=>{flame.scale.y=.85+.17*Math.sin(t*m*(6.4+i)+phase+i)+s.mid*.3;flame.rotation.z=Math.sin(t*m*2.8+phase+i)*.1})});
  practicals.forEach(({light,sprite,intensity},i)=>{const level=.76+.1*Math.sin(t*1.4*m+i)+s.mid*.22+s.lamps*.2;light.intensity=intensity*level;sprite.material.opacity=.62+level*.17;});gateLight.intensity=40+s.mid*18+s.door*38;glyphLight.intensity=12+s.mid*12;
  const frame=spectrum?.frames?.[Math.min(spectrum.frames.length-1,Math.floor(t*(spectrum.sampleRate||25)))];for(let i=0;i<bars.length;i++){const measured=frame?(frame[i]/(spectrum.quantization?.max||255)):0;const h=.13+(s.effects?Math.pow(measured,.85)*(1.2+s.chorus*.9):0);bars[i].scale.y=h;bars[i].position.y=.2+h/2;bars[i].material.emissiveIntensity=.7+measured*1.25;}barMat.emissiveIntensity=2.4+s.mid*1.7;
  river.material.emissiveIntensity=.13+s.low*.25;riverRibbonMat.uniforms.time.value=t*m;riverRibbonMat.uniforms.level.value=s.effects?.4+s.low*.6:0;
  connectionMat.uniforms.time.value=t*m;connectionMat.uniforms.energy.value=s.low;connectionMat.uniforms.strength.value=s.effects?.35+s.chorus*.65:0;portalMat.uniforms.time.value=t*m;portalMat.uniforms.amount.value=s.core;portalMat.uniforms.energy.value=s.low;
  for(let i=0;i<dustN;i++){const[x,y,z,phase]=dustSeeds[i];dustPos.set([x+Math.sin(t*.12*m+phase)*.8,y+Math.sin(t*.2*m+phase)*.5,z+Math.cos(t*.11*m+phase)*.7],i*3)}dg.attributes.position.needsUpdate=true;
  rain.visible=s.rain>.001;rain.material.opacity=s.rain*.23;for(let i=0;i<rainN;i++){const[x,y,z]=rainSeeds[i],yy=(y-t*10*m%33+33)%33;rainPos.set([x,yy,z,x-.1,yy+.7,z],i*6)}rainGeo.attributes.position.needsUpdate=true;
  birds.forEach(({g,wings,phase},i)=>{const angle=t*.065*m+phase;g.position.set(-5+Math.cos(angle)*(14+i*2),22+i*.6+Math.sin(angle*2)*.4,-15+Math.sin(angle)*(10+i));g.rotation.y=-angle+Math.PI/2;wings[0].rotation.z=Math.sin(t*7*m+phase)*.48;wings[1].rotation.z=-wings[0].rotation.z});
  key.intensity=.63+s.chorus*.22+s.community*.12;fill.intensity=.38+s.core*.25;bloom.strength=.36+s.chorus*.12;camera.updateMatrixWorld(true);lastLyrics=worldLyrics.update(t,lyricData,camera,format,options.lyrics);magic.update(s,frame,format);mountainSign.update(s);composer.render();
 }
 function dispose(){magic.dispose();composer.dispose();renderer.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()})}
 return{update,resize,dispose,scene,camera,renderer,bounds,pickLink(clientX,clientY){const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1),camera);return raycaster.intersectObjects(mountainSign.clickTargets,true).length?mountainSign.url:null},setData(lyrics,spec){lyricData=lyrics;spectrum=spec},setOptions(o){options=o},get lyricState(){return lastLyrics},get state(){return lastState},get stats(){return{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles}}};
}
