import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';

const CHANNEL_URL='https://farcaster.xyz/~/channel/warpkeep';
const clamp01=value=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));

/**
 * A fixed, terrain-mounted landmark. Letter faces and extrusion are real meshes;
 * neither the title nor the address tracks the camera or changes with aspect.
 * Font outlines below are a bold subset of the existing OFL Space Grotesk TTF.
 * Embedding the subset avoids TTFLoader's external OpenType CDN at playback time.
 */
export async function createMountainSign(THREE,scene,{terrainHeight}={}){
  if(typeof terrainHeight!=='function')throw new TypeError('Mountain sign requires terrainHeight(x,z).');
  const font=new FontLoader().parse(SPACE_GROTESK_SIGN_FONT);
  const group=new THREE.Group();
  group.name='WARPKEEP · mountain channel landmark';
  group.position.set(0,0,-58);
  group.rotation.y=.08;
  const yaw=group.rotation.y;
  const worldXZ=(x,z)=>[x*Math.cos(yaw)+z*Math.sin(yaw),-58-x*Math.sin(yaw)+z*Math.cos(yaw)];
  const groundAt=(x,z)=>{const [wx,wz]=worldXZ(x,z);const y=terrainHeight(wx,wz);if(!Number.isFinite(y))throw new Error('Invalid terrain height for mountain sign.');return y;};
  let crest=-Infinity;
  for(let x=-22;x<=22;x+=.5)for(const z of [-1.8,0,.8])crest=Math.max(crest,groundAt(x,z));
  // The source ridge is already above y22. The address and the foot of every
  // letter clear its highest sample, with all steel work anchored below it.
  const baseline=Math.max(17,crest+3.1);
  const face=new THREE.MeshStandardMaterial({color:'#fff0cd',emissive:'#cfb980',emissiveIntensity:.26,roughness:.58,metalness:.16});
  const side=new THREE.MeshStandardMaterial({color:'#233540',emissive:'#183b45',emissiveIntensity:.08,roughness:.48,metalness:.78});
  const steel=new THREE.MeshStandardMaterial({color:'#263b42',roughness:.7,metalness:.68});
  const foundation=new THREE.MeshStandardMaterial({color:'#899080',roughness:.96,metalness:0});
  const urlFace=new THREE.MeshStandardMaterial({color:'#d3e9dc',emissive:'#6ebcb8',emissiveIntensity:.28,roughness:.55,metalness:.22});
  function textMesh(text,width,depth,material,y,name){
    const geometry=new TextGeometry(text,{font,size:1,depth,curveSegments:5,steps:1,bevelEnabled:true,bevelThickness:.016,bevelSize:.006,bevelSegments:1});
    geometry.computeBoundingBox();let box=geometry.boundingBox;
    const scale=width/(box.max.x-box.min.x);
    geometry.scale(scale,scale,1);geometry.computeBoundingBox();box=geometry.boundingBox;
    const height=box.max.y-box.min.y;
    geometry.translate(-(box.max.x+box.min.x)/2,y-box.min.y,0);
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const mesh=new THREE.Mesh(geometry,[material,side]);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.userData={url:CHANNEL_URL,linkLabel:'Warpkeep Farcaster channel',geometryRole:'physical extruded lettering',height};
    group.add(mesh);return mesh;
  }
  const title=textMesh('WARPKEEP',36,.88,face,baseline,'WARPKEEP · ivory extruded letters');
  const address=textMesh('farcaster.xyz/~/channel/warpkeep',32,.24,urlFace,baseline-2.25,'Farcaster address · extruded lower lettering');
  address.position.z=.13;
  const titleHeight=title.userData.height;
  function beam(a,b,width,depth,material=steel,name='Steel support'){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,delta.length(),depth),material);
    mesh.position.copy(start).add(end).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  }
  const letterXs=[-18.7,-13.1,-7.7,-2.0,3.4,8.5,13.7,18.9];
  for(const [index,x] of letterXs.entries()){
    const y=groundAt(x,-.74),rearX=x+(index%2?1.1:-1.1),rearZ=-2.8,rearY=groundAt(rearX,rearZ);
    beam([x,y-.1,-.74],[x,baseline+titleHeight*.7,-.74],.22,.24,steel,'Letter mast anchored to mountain');
    beam([rearX,rearY+.05,rearZ],[x,baseline+titleHeight*.52,-.74],.15,.15,steel,'Rear diagonal mountain brace');
    const foot=new THREE.Mesh(new THREE.BoxGeometry(.9,.48,.94),foundation);foot.position.set(x,y+.07,-.74);foot.castShadow=true;foot.receiveShadow=true;foot.name='Embedded stone footing';group.add(foot);
  }
  beam([-21,baseline+.2,-.7],[21,baseline+.2,-.7],.22,.26,steel,'Lower letter rail');
  beam([-20.6,baseline+titleHeight*.7,-.74],[20.6,baseline+titleHeight*.7,-.74],.16,.2,steel,'Upper letter rail');
  beam([-18.2,baseline-2.37,-.19],[18.2,baseline-2.37,-.19],.13,.18,steel,'Address mounting rail');
  // Restrained physical fixtures illuminate the sign. The response changes
  // brightness by a bounded amount; the sign's geometry never pulses or rotates.
  const rimLights=[];
  for(const [x,color] of [[-15,'#79cfd8'],[0,'#f4ddb0'],[15,'#ab8cd8']]){
    const light=new THREE.PointLight(color,18,21,2);light.position.set(x,baseline+titleHeight*.45,3.2);light.name='Mountain sign local wash';group.add(light);rimLights.push(light);
    const fixture=new THREE.Mesh(new THREE.BoxGeometry(.45,.28,.6),steel);fixture.position.set(x,baseline-2.5,1.15);fixture.name='Shielded sign uplight';group.add(fixture);
  }
  // A non-rendering world-volume makes gaps between real letters clickable too.
  // It has no visible panel, no depth write and no camera-facing transform.
  const hitArea=new THREE.Mesh(new THREE.BoxGeometry(43,titleHeight+2.7,1.6),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
  hitArea.position.set(0,baseline+titleHeight/2-1.1,.25);hitArea.name='Mountain sign interaction volume';
  hitArea.userData={url:CHANNEL_URL,linkLabel:'Warpkeep Farcaster channel'};group.add(hitArea);
  group.userData={url:CHANNEL_URL,fixedWorldAnchor:[0,baseline+titleHeight/2,-58],terrainCrest:crest,letterWidth:36,titleHeight,font:'Space Grotesk Bold',fontSourceSha256:SPACE_GROTESK_SIGN_FONT.original_font_information.sourceSha256};
  scene.add(group);
  function update(state={}){
    const response=state.effects===false?0:clamp01(state.mid)*.75+clamp01(state.high)*.25;
    face.emissiveIntensity=.26+response*.10;
    urlFace.emissiveIntensity=.28+response*.08;
    side.emissiveIntensity=.08+response*.025;
    for(let i=0;i<rimLights.length;i++)rimLights[i].intensity=(i===1?20:15)+response*(i===1?4:3);
  }
  update();
  return{group,clickTargets:[hitArea,title,address],url:CHANNEL_URL,update};

}

// SIL OFL 1.1 glyph outlines derived from public/fonts/SpaceGrotesk.ttf.
// This is a font subset, not a replacement typeface or a redesigned emblem.
const SPACE_GROTESK_SIGN_FONT={"glyphs":{" ":{"ha":254,"o":""},".":{"ha":298,"o":"m 149.5 -14 q 81.5 12.732 109 -14 q 54 81.232 54 39.463 q 81.5 149.5 54 123 q 149.5 176 109 176 q 217 149.268 190 176 q 244 80.768 244 122.537 q 217 12.5 244 39 q 149.5 -14 190 -14 l 149.5 -14"},"/":{"ha":388,"o":"m -16 -200 l 278 700 l 404 700 l 110 -200 l -16 -200"},"?":{"ha":578,"o":"m 209 230 l 209 254 q 229.5 338 209 305 q 296 393 250 371 l 313 401 q 382 446 358 422 q 406 510 406 470 q 391.5 559.5 406 539 q 351 591 377 580 q 290 602 325 602 q 225.5 590 254 602 q 180.5 554 197 578 q 164 494 164 530 l 164 472 l 34 472 l 34 492 q 68 611 34 561 q 160 687.5 102 661 q 290 714 218 714 q 416.5 688 361 714 q 504 616 472 662 q 536 510 536 570 q 514 411.5 536 450 q 458.5 349.5 492 373 q 390 309 425 326 l 373 301 q 348 281.5 355 293 q 341 248 341 270 l 341 230 l 209 230 m 279 -14 q 211.5 12.5 239 -14 q 184 81 184 39 q 211.5 149.5 184 123 q 279 176 239 176 q 347 149.5 320 176 q 374 81 374 123 q 347 12.5 374 39 q 279 -14 320 -14 l 279 -14"},"A":{"ha":634,"o":"m 18 0 l 202 700 l 432 700 l 616 0 l 480 0 l 442 154 l 192 154 l 154 0 l 18 0 m 223 276 l 411 276 l 326 617 l 308 617 l 223 276"},"E":{"ha":554,"o":"m 66 0 l 66 700 l 516 700 l 516 580 l 198 580 l 198 413 l 488 413 l 488 293 l 198 293 l 198 120 l 522 120 l 522 0 l 66 0"},"K":{"ha":626,"o":"m 66 0 l 66 700 l 198 700 l 198 422 l 216 422 l 443 700 l 612 700 l 320 355 l 622 0 l 448 0 l 216 284 l 198 284 l 198 0 l 66 0"},"P":{"ha":604,"o":"m 66 0 l 66 700 l 354 700 q 470.5 673.5 420 700 q 549.5 599 521 647 q 578 485 578 551 l 578 471 q 548.5 357.5 578 406 q 468.5 282.5 519 309 q 354 256 418 256 l 198 256 l 198 0 l 66 0 m 198 376 l 341 376 q 417 402 388 376 q 446 473 446 428 l 446 483 q 417 554 446 528 q 341 580 388 580 l 198 580 l 198 376"},"R":{"ha":632,"o":"m 66 0 l 66 700 l 370 700 q 485 677 436 700 q 561 612 534 654 q 588 513 588 570 l 588 501 q 558 399 588 438 q 484 342 528 360 l 484 324 q 546 296.5 524 322 q 568 229 568 271 l 568 0 l 436 0 l 436 210 q 423.5 249 436 234 q 382 264 411 264 l 198 264 l 198 0 l 66 0 m 198 384 l 356 384 q 429.5 409.5 403 384 q 456 477 456 435 l 456 487 q 430 554.5 456 529 q 356 580 404 580 l 198 580 l 198 384"},"W":{"ha":898,"o":"m 122 0 l 30 700 l 161 700 l 229 92 l 247 92 l 335 700 l 563 700 l 651 92 l 669 92 l 737 700 l 868 700 l 776 0 l 548 0 l 458 622 l 440 622 l 350 0 l 122 0"},"a":{"ha":578,"o":"m 224 -14 q 129 4.5 171 -14 q 62.5 58.5 87 23 q 38 145 38 94 q 62.5 230.5 38 196 q 130.5 282.5 87 265 q 230 300 174 300 l 366 300 l 366 328 q 344 385.5 366 363 q 274 408 322 408 q 204 386.5 227 408 q 174 331 181 365 l 58 370 q 96.5 439.5 70 408 q 167.5 490.5 123 471 q 276 510 212 510 q 431 461 374 510 q 488 319 488 412 l 488 134 q 516 104 488 104 l 556 104 l 556 0 l 472 0 q 411 18 435 0 q 387 66 387 36 l 387 67 l 368 67 q 350 35.5 364 55 q 306 1 336 16 q 224 -14 276 -14 l 224 -14 m 246 88 q 332.5 117.5 299 88 q 366 196 366 147 l 366 206 l 239 206 q 184 191 204 206 q 164 149 164 176 q 185 105 164 122 q 246 88 206 88 l 246 88"},"c":{"ha":586,"o":"m 303 -14 q 172.5 16 231 -14 q 80 103 114 46 q 46 241 46 160 l 46 255 q 80 393 46 336 q 172.5 480 114 450 q 303 510 231 510 q 425 485 374 510 q 507.5 416.5 476 460 q 549 318 539 373 l 427 292 q 409 346 423 322 q 369.5 384 395 370 q 306 398 344 398 q 237.5 381.5 268 398 q 189.5 332.5 207 365 q 172 253 172 300 l 172 243 q 189.5 163.5 172 196 q 237.5 114.5 207 131 q 306 98 268 98 q 392.5 127.5 363 98 q 430 205 422 157 l 552 176 q 507.5 79.5 539 123 q 425 11 476 36 q 303 -14 374 -14 l 303 -14"},"e":{"ha":577,"o":"m 296 -14 q 165.5 17.5 222 -14 q 77.5 106.5 109 49 q 46 242 46 164 l 46 254 q 77 389.5 46 332 q 164 478.5 108 447 q 294 510 220 510 q 421 477.5 367 510 q 505 387.5 475 445 q 535 254 535 330 l 535 211 l 174 211 q 212 128 176 160 q 300 96 248 96 q 378 119 353 96 q 416 170 403 142 l 519 116 q 478.5 59.5 505 90 q 408 7.5 452 29 q 296 -14 364 -14 l 296 -14 m 175 305 l 407 305 q 372.5 374 403 348 q 293 400 342 400 q 212 374 242 400 q 175 305 182 348 l 175 305"},"f":{"ha":436,"o":"m 152 0 l 152 392 l 26 392 l 26 496 l 152 496 l 152 588 q 182.5 669.5 152 639 q 262 700 213 700 l 392 700 l 392 596 l 306 596 q 278 566 278 596 l 278 496 l 408 496 l 408 392 l 278 392 l 278 0 l 152 0"},"h":{"ha":616,"o":"m 70 0 l 70 700 l 196 700 l 196 435 l 214 435 q 239 467 222 451 q 284.5 493.5 256 483 q 357 504 313 504 q 458.5 477.5 415 504 q 526 404.5 502 451 q 550 296 550 358 l 550 0 l 424 0 l 424 286 q 396.5 370 424 342 q 318 398 369 398 q 228 359.5 260 398 q 196 252 196 321 l 196 0 l 70 0"},"k":{"ha":564,"o":"m 70 0 l 70 700 l 196 700 l 196 313 l 214 313 l 378 496 l 542 496 l 313 256 l 550 0 l 388 0 l 214 197 l 196 197 l 196 0 l 70 0"},"l":{"ha":266,"o":"m 70 0 l 70 700 l 196 700 l 196 0 l 70 0"},"n":{"ha":616,"o":"m 70 0 l 70 496 l 194 496 l 194 431 l 212 431 q 257 480.5 224 457 q 357 504 290 504 q 458.5 477.5 415 504 q 526 404.5 502 451 q 550 296 550 358 l 550 0 l 424 0 l 424 286 q 396.5 370 424 342 q 318 398 369 398 q 228 359.5 260 398 q 196 252 196 321 l 196 0 l 70 0"},"p":{"ha":638,"o":"m 70 -200 l 70 496 l 194 496 l 194 436 l 212 436 q 265 487.5 229 465 q 368 510 301 510 q 479 480.5 428 510 q 561 394 530 451 q 592 256 592 337 l 592 240 q 561 102 592 159 q 479 15.5 530 45 q 368 -14 428 -14 q 292.5 -3.5 323 -14 q 243.5 23.5 262 7 q 214 57 225 40 l 196 57 l 196 -200 l 70 -200 m 330 96 q 427.5 133.5 389 96 q 466 243 466 171 l 466 253 q 427 362.5 466 325 q 330 400 388 400 q 233 362.5 272 400 q 194 253 194 325 l 194 243 q 233 133.5 194 171 q 330 96 272 96 l 330 96"},"r":{"ha":396,"o":"m 70 0 l 70 496 l 194 496 l 194 440 l 212 440 q 248.5 484 223 470 q 308 498 274 498 l 368 498 l 368 386 l 306 386 q 227 360.5 258 386 q 196 282 196 335 l 196 0 l 70 0"},"s":{"ha":524,"o":"m 276 -14 q 117 28 179 -14 q 42 148 55 70 l 158 178 q 181.5 123 165 143 q 222.5 94.5 198 103 q 276 86 247 86 q 341 101.5 320 86 q 362 140 362 117 q 342 175.5 362 163 q 278 196 322 188 l 250 201 q 155 228.5 198 211 q 86 277 112 246 q 60 357 60 308 q 114 470.5 60 431 q 256 510 168 510 q 394 473 339 510 q 466 376 449 436 l 349 340 q 316.5 394 341 378 q 256 410 292 410 q 201 397.5 220 410 q 182 363 182 385 q 202 327.5 182 339 q 256 310 222 316 l 284 305 q 385.5 278.5 340 295 q 457.5 231.5 431 262 q 484 149 484 201 q 427.5 28.5 484 71 q 276 -14 371 -14 l 276 -14"},"t":{"ha":456,"o":"m 260 0 q 180.5 30.5 211 0 q 150 112 150 61 l 150 392 l 26 392 l 26 496 l 150 496 l 150 650 l 276 650 l 276 496 l 412 496 l 412 392 l 276 392 l 276 134 q 304 104 276 104 l 400 104 l 400 0 l 260 0"},"w":{"ha":784,"o":"m 110 0 l 40 496 l 165 496 l 209 85 l 227 85 l 291 496 l 493 496 l 557 85 l 575 85 l 619 496 l 744 496 l 674 0 l 465 0 l 401 411 l 383 411 l 319 0 l 110 0"},"x":{"ha":592,"o":"m 26 0 l 206 250 l 28 496 l 174 496 l 287 331 l 305 331 l 418 496 l 564 496 l 386 250 l 566 0 l 418 0 l 305 167 l 287 167 l 174 0 l 26 0"},"y":{"ha":616,"o":"m 124 -200 l 124 -90 l 394 -90 q 422 -60 422 -90 l 422 65 l 404 65 q 379 31 396 48 q 333 3 362 14 q 259 -8 304 -8 q 157.5 18.5 201 -8 q 90 92 114 45 q 66 200 66 139 l 66 496 l 192 496 l 192 210 q 219.5 126 192 154 q 298 98 247 98 q 388 136.5 356 98 q 420 244 420 175 l 420 496 l 546 496 l 546 -88 q 516 -169.5 546 -139 q 436 -200 486 -200 l 124 -200"},"z":{"ha":518,"o":"m 52 0 l 52 150 l 324 376 l 324 392 l 62 392 l 62 496 l 462 496 l 462 346 l 190 120 l 190 104 l 470 104 l 470 0 l 52 0"},"~":{"ha":620,"o":"m 113 237 l 43 330 l 163 420 q 205.5 446.5 183 436 q 257 457 228 457 q 305.5 445.5 286 457 q 338 416 325 434 q 360 389 352 397 q 381 381 368 381 q 403.5 387.5 393 381 q 427 404 414 394 l 506 463 l 576 370 l 456 280 q 413.5 253.5 436 264 q 362 243 391 243 q 313.5 254.5 333 243 q 281 284 294 266 q 259.5 311.5 267 304 q 238 319 252 319 q 215.5 312.5 226 319 q 192 296 205 306 l 113 237"}},"familyName":"Space Grotesk Bold \u2014 Warpkeep sign subset","ascender":984,"descender":-292,"underlinePosition":-100,"underlineThickness":50,"boundingBox":{"yMin":-274,"yMax":1081,"xMin":-49,"xMax":1203},"resolution":1000,"original_font_information":{"source":"public/fonts/SpaceGrotesk.ttf","license":"SIL Open Font License 1.1; public/fonts/SpaceGrotesk-OFL.txt","sourceSha256":"acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72","weight":700,"derivation":"fontTools instantiation and glyph-outline conversion; unmodified letter designs"}};
