/**
 * PR375 magic: three readable environmental gestures, reconstructed from source time.
 * Gate trace follows the actual arch face z≈8.77; its luminous surface sits at 8.84.
 * Threshold stays on the approach; tower ribbons/particles remain behind z=9.
 * The guardian field is one circular aperture at [0,16,-5], never split by its subject.
 * Call update(sourceState, spectrumFrame, format) before the main scene render.
 */
export function createMagicVfx(THREE, scene) {
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));
  const fract = n => n - Math.floor(n);
  const hash = n => fract(Math.sin(n * 127.1 + 19.37) * 43758.5453123);
  const vec = (x, y, z) => new THREE.Vector3(x, y, z);
  const root = new THREE.Group();
  root.name = 'Warpkeep · source-clocked cyan-violet magic';
  scene.add(root);
  const geometries = new Set(), materials = new Set();
  const ownGeometry = g => (geometries.add(g), g);
  const ownMaterial = m => (materials.add(m), m);
  const add = (geometry, material, name) => {
    const mesh = new THREE.Mesh(ownGeometry(geometry), material);
    mesh.name = name; root.add(mesh); return mesh;
  };
  const additive = {transparent:true, depthWrite:false, depthTest:true, blending:THREE.AdditiveBlending};
  const cyan = new THREE.Color('#5cf4f4'), violet = new THREE.Color('#aa79ff'), gold = new THREE.Color('#ffd68b');

  // The arch is a continuous trace, rather than a rectangular glowing gate card.
  const archPoints = [vec(-1.76,.78,8.84), vec(-1.76,2.1,8.84), vec(-1.76,4.05,8.84)];
  for (let i=1;i<=48;i++) {
    const angle = Math.PI - i / 48 * Math.PI;
    archPoints.push(vec(Math.cos(angle)*1.76,4.05+Math.sin(angle)*1.76,8.84));
  }
  archPoints.push(vec(1.76,2.1,8.84),vec(1.76,.78,8.84));
  const archCurve = new THREE.CatmullRomCurve3(archPoints,false,'centripetal');
  const archCoreMat = ownMaterial(new THREE.MeshBasicMaterial({...additive,color:cyan.clone().multiplyScalar(2.25),opacity:.8}));
  const archAuraMat = ownMaterial(new THREE.MeshBasicMaterial({...additive,color:cyan,opacity:.12}));
  add(new THREE.TubeGeometry(archCurve,112,.024,5,false),archCoreMat,'Native arch · luminous seam');
  add(new THREE.TubeGeometry(archCurve,112,.087,5,false),archAuraMat,'Native arch · bounded spill');

  // Small angular glyphs belong to the gate piers, clear of the existing crest cloth.
  const runeSegments = [];
  for (const side of [-1,1]) for(let row=0;row<5;row++) {
    const x=side*2.93, y=1.42+row*.61, z=8.57;
    const shape=[[-.11,-.16],[.1,0],[-.11,.16],[-.11,-.16]];
    for(let k=0;k<shape.length-1;k++) runeSegments.push([vec(x+shape[k][0],y+shape[k][1],z),vec(x+shape[k+1][0],y+shape[k+1][1],z)]);
    runeSegments.push([vec(x-.17,y-.055,z),vec(x+.17,y-.055,z)]);
  }
  const runeMat = ownMaterial(new THREE.MeshBasicMaterial({...additive,color:0xffffff,opacity:.82}));
  const runeGeo = ownGeometry(new THREE.CylinderGeometry(.014,.014,1,5,1));
  const runes = new THREE.InstancedMesh(runeGeo,runeMat,runeSegments.length);
  runes.name='Gate piers · measured rune light';
  const matrix = new THREE.Matrix4(), q = new THREE.Quaternion(), axis=vec(0,1,0);
  runeSegments.forEach(([a,b],i)=>{
    const delta=b.clone().sub(a),length=delta.length();
    q.setFromUnitVectors(axis,delta.normalize());
    matrix.compose(a.clone().add(b).multiplyScalar(.5),q,vec(1,length,1));
    runes.setMatrixAt(i,matrix);runes.setColorAt(i,cyan.clone().multiplyScalar(1.4));
  });
  runes.instanceMatrix.needsUpdate=true;root.add(runes);

  const groundMat=ownMaterial(new THREE.MeshBasicMaterial({...additive,color:cyan.clone().multiplyScalar(1.65),opacity:.34}));
  const threshold=add(new THREE.TorusGeometry(2.23,.026,5,96),groundMat,'Threshold · circle in paving');
  threshold.rotation.x=-Math.PI/2;threshold.position.set(0,.115,11.05);threshold.scale.y=.69;
  const gateLight=new THREE.PointLight('#53dddf',14,10,2);gateLight.position.set(0,3.8,9.5);root.add(gateLight);

  // Ribbons use a fixed spatial curve. Only their traveling emission changes phase.
  const ribbonUniforms={time:{value:0},amount:{value:0},energy:{value:0},reduced:{value:0}};
  const ribbonMat=ownMaterial(new THREE.ShaderMaterial({
    ...additive,side:THREE.DoubleSide,uniforms:ribbonUniforms,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float time,amount,energy,reduced;
      void main(){float travel=fract(vUv.x-time*.13);float d=min(abs(travel-.43),1.-abs(travel-.43));
      float comet=exp(-d*d*190.);float strand=.2+.8*comet;
      vec3 tint=mix(vec3(.23,1.25,1.4),vec3(.72,.35,1.5),smoothstep(.25,.9,vUv.x));
      float ends=sin(vUv.x*3.14159265);float a=amount*(.26+.72*strand)*ends;
      gl_FragColor=vec4(tint*(1.+energy*.7),a);}`
  }));
  const ribbonPaths=[];
  for(const side of [-1,1]) {
    const pts=[];
    for(let i=0;i<=90;i++){
      const u=i/90,a=u*Math.PI*3.6+side*.8;
      pts.push(vec(side*7.6+Math.cos(a)*(.72+u*.15),7.9+u*6.4,6.95+Math.sin(a)*.72));
    }
    const path=new THREE.CatmullRomCurve3(pts);ribbonPaths.push(path);
    add(new THREE.TubeGeometry(path,90,.024,4,false),ribbonMat,side<0?'West tower · rising ribbon':'East tower · rising ribbon');
  }
  const towerLights=[];
  for(const side of [-1,1]){const light=new THREE.PointLight(side<0?'#62eaf2':'#b38aff',10,9,2);light.position.set(side*7.6,8.65,7);towerLights.push(light);root.add(light)}

  // Deterministic sparse motes follow the same tower routes. No foreground particles.
  const moteCount=56,positions=new Float32Array(moteCount*3),alphas=new Float32Array(moteCount),sizes=new Float32Array(moteCount),colors=new Float32Array(moteCount*3);
  for(let i=0;i<moteCount;i++){
    const c=(i%7===0?gold:i%2?cyan:violet);colors.set([c.r,c.g,c.b],i*3);sizes[i]=1.2+hash(i+6)*1.7;
  }
  const moteGeo=ownGeometry(new THREE.BufferGeometry());
  moteGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  moteGeo.setAttribute('alpha',new THREE.BufferAttribute(alphas,1));
  moteGeo.setAttribute('size',new THREE.BufferAttribute(sizes,1));
  moteGeo.setAttribute('tint',new THREE.BufferAttribute(colors,3));
  const moteMat=ownMaterial(new THREE.ShaderMaterial({
    ...additive,uniforms:{amount:{value:0}},
    vertexShader:`attribute float alpha,size;attribute vec3 tint;varying float vAlpha;varying vec3 vTint;
      void main(){vAlpha=alpha;vTint=tint;vec4 mv=modelViewMatrix*vec4(position,1.);
      gl_PointSize=clamp(size*115./max(1.,-mv.z),1.2,8.);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vAlpha;varying vec3 vTint;uniform float amount;
      void main(){float r=length(gl_PointCoord-.5)*2.;float a=exp(-r*r*5.5)*(1.-smoothstep(.5,1.,r));
      gl_FragColor=vec4(vTint*1.65,a*vAlpha*amount);}`
  }));
  const motes=new THREE.Points(moteGeo,moteMat);motes.frustumCulled=false;motes.name='Tower signal · sparse light motes';root.add(motes);

  // A single complete circular field remains coherent behind the guardian occlusion.
  const haloUniforms={time:{value:0},amount:{value:0},energy:{value:0},high:{value:0}};
  const haloMat=ownMaterial(new THREE.ShaderMaterial({
    ...additive,side:THREE.DoubleSide,uniforms:haloUniforms,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float time,amount,energy,high;
      float ring(float r,float at,float width){return exp(-pow((r-at)/width,2.));}
      void main(){vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x);
        float phase=a-time*.09;
        float outer=ring(r,.83,.0038);
        float inner=ring(r,.695,.0032);
        float middle=ring(r,.758,.005)*( .14+.7*pow(.5+.5*cos(phase*3.+r*8.),10.));
        float ticks=pow(.5+.5*cos(a*32.),28.)*smoothstep(.782,.79,r)*(1.-smoothstep(.812,.82,r));
        float signal=ring(r,.697,.011)*pow(.5+.5*cos(phase*4.),15.);
        float atmosphere=ring(r,.765,.065)*.024;
        float alpha=(outer*.65+inner*.38+middle*.45+ticks*.26+signal*.4+atmosphere)*amount;
        vec3 color=mix(vec3(.25,1.14,1.35),vec3(.69,.34,1.38),smoothstep(.71,.83,r));
        color*=1.+energy*.5;gl_FragColor=vec4(color,alpha*(1.-smoothstep(.92,.98,r)));}`
  }));
  const halo=add(new THREE.PlaneGeometry(19.2,19.2),haloMat,'Guardian · one coherent circular ward');
  halo.position.set(0,16,-5);halo.frustumCulled=false;

  // Forty-eight genuine spectrum bins form a luminous rune crown around the ward.
  // Every spoke shares the ward's center; the shader field continues behind the model.
  const crownMat=ownMaterial(new THREE.MeshBasicMaterial({...additive,color:0xffffff,opacity:.92}));
  const crownGeo=ownGeometry(new THREE.CylinderGeometry(.042,.042,1,5,1));
  const crown=new THREE.InstancedMesh(crownGeo,crownMat,48);
  crown.name='Guardian ward · 48 measured radial spectrum runes';
  crown.frustumCulled=false;root.add(crown);
  const crownDirections=Array.from({length:48},(_,i)=>{
    const angle=Math.PI/2+i/48*Math.PI*2;return vec(Math.cos(angle),Math.sin(angle),0);
  });
  const crownColors=crownDirections.map((_,i)=>cyan.clone().lerp(violet,(.5+.5*Math.sin(i/48*Math.PI*2-.5))*.72));

  const frameScale=255; // Measured project spectra use the documented 8-bit quantization.
  function update(state={},spectrumFrame,format='landscape') {
    root.visible=state.effects!==false;
    const t=Math.max(0,Number(state.t)||0),motionT=state.reduced?0:t;
    const chorus=clamp(state.chorus),core=clamp(state.core),ending=clamp(state.ending);
    let spectralLow=0,spectralMid=0;
    if(spectrumFrame?.length){
      const split=Math.max(1,Math.floor(spectrumFrame.length*.24)),stop=Math.max(split+1,Math.floor(spectrumFrame.length*.72));
      for(let i=0;i<split;i++)spectralLow+=clamp((Number(spectrumFrame[i])||0)/frameScale);
      for(let i=split;i<stop;i++)spectralMid+=clamp((Number(spectrumFrame[i])||0)/frameScale);
      spectralLow/=split;spectralMid/=Math.max(1,stop-split);
    }
    const low=clamp(Math.max(clamp(state.low),spectralLow*.85));
    const mid=clamp(Math.max(clamp(state.mid),spectralMid*.9));
    const high=clamp(state.high),attack=clamp(state.attack);
    const endingQuiet=1-ending*.38;
    const lift=(.58+chorus*.32+core*.1)*endingQuiet;
    const pulse=.64+low*.32+mid*.18;
    archCoreMat.opacity=clamp((.57+low*.19+mid*.13+chorus*.12)*endingQuiet,0,.95);
    archCoreMat.color.copy(cyan).lerp(gold,ending*.56).multiplyScalar(1.9+low*.75+chorus*.35);
    archAuraMat.opacity=(.1+mid*.055+chorus*.035)*endingQuiet;
    groundMat.opacity=(.21+low*.19+chorus*.11)*endingQuiet;
    gateLight.intensity=(12+low*10+mid*5+chorus*7)*endingQuiet;
    runeMat.opacity=(.58+mid*.22+chorus*.11)*endingQuiet;
    for(let i=0;i<runeSegments.length;i++){
      const row=Math.floor(i/4)%5;
      const measured=spectrumFrame?.length?clamp((Number(spectrumFrame[(row*7+3)%spectrumFrame.length])||0)/frameScale):mid;
      runes.setColorAt(i,cyan.clone().lerp(violet,(i>=20?.22:0)).multiplyScalar(1.05+measured*.95));
    }
    if(runes.instanceColor)runes.instanceColor.needsUpdate=true;
    ribbonUniforms.time.value=motionT;ribbonUniforms.amount.value=(.28+chorus*.5+core*.15)*pulse*endingQuiet;
    ribbonUniforms.energy.value=mid;ribbonUniforms.reduced.value=state.reduced?1:0;
    towerLights.forEach((light,i)=>{light.intensity=(6+mid*8+chorus*7+(i?core*4:0))*endingQuiet});
    const particleAmount=state.reduced?.12:(.35+chorus*.5+high*.13)*endingQuiet;
    moteMat.uniforms.amount.value=particleAmount;
    for(let i=0;i<moteCount;i++){
      const u=fract(motionT*(.075+hash(i+101)*.045)+hash(i+303));
      const pt=ribbonPaths[i%2].getPointAt(u);
      const drift=(hash(i+401)-.5)*.31;
      positions.set([pt.x+drift,pt.y+hash(i+501)*.3,pt.z+drift*.55],i*3);
      alphas[i]=Math.pow(Math.sin(u*Math.PI),1.5)*(.5+hash(i+601)*.5);
    }
    moteGeo.attributes.position.needsUpdate=true;moteGeo.attributes.alpha.needsUpdate=true;
    haloUniforms.time.value=motionT;haloUniforms.energy.value=low;haloUniforms.high.value=high;
    haloUniforms.amount.value=(.16+chorus*.38+core*.36)*(.82+low*.18)*endingQuiet*(format==='portrait'?.9:1);
    for(let i=0;i<48;i++){
      const bin=spectrumFrame?.length?Math.min(spectrumFrame.length-1,Math.floor(i*spectrumFrame.length/48)):i;
      const measured=spectrumFrame?.length?clamp((Number(spectrumFrame[bin])||0)/frameScale):0;
      const response=Math.pow(measured,.78);
      const length=.085+response*(state.reduced?.47:1.22);
      const direction=crownDirections[i];
      q.setFromUnitVectors(axis,direction);
      matrix.compose(vec(direction.x*(8.1+length*.5),16+direction.y*(8.1+length*.5),-5),q,vec(1,length,1));
      crown.setMatrixAt(i,matrix);
      crown.setColorAt(i,crownColors[i].clone().multiplyScalar((.95+response*1.8+chorus*.35)*endingQuiet));
    }
    crown.instanceMatrix.needsUpdate=true;if(crown.instanceColor)crown.instanceColor.needsUpdate=true;
    crownMat.opacity=(.6+mid*.19+chorus*.16)*endingQuiet;
    // Kept for QA: no dynamic geometry can enter the requested lyric exclusion prism.
    root.userData.sourceTime=t;root.userData.audio={low,mid,high,attack};
    root.userData.lyricExclusion={zMin:13,yMin:3,yMax:10,particleMaxZ:7.76};
    root.userData.energy=lift;
  }
  update({t:0,effects:true});
  return {update,group:root,dispose(){root.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}};
}
