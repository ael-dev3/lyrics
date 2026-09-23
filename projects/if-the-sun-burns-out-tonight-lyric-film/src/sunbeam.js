const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => {const x=clamp(value);return x*x*(3-2*x);};

export function isSunbeamWord(words,index) {
  if(!words?.[index]) return false;
  const token=word=>word.text.toLowerCase().replace(/[^a-z]/g,'');
  if(token(words[index])==='light') return true;
  return index>=4 && words.slice(index-4,index+1).map(token).join(' ')==='all i need is you';
}

// The decorative envelope shares the acoustic word interval. No wall-clock
// animation, advance trigger or lingering highlight is introduced.
export function sunbeamPresence(time, word) {
  if (!word || time < word.start || time >= word.end) return 0;
  const duration=word.end-word.start;
  return smooth((time-word.start)/Math.min(.10,duration*.3))
    * smooth((word.end-time)/Math.min(.14,duration*.35));
}

export function drawSunbeam(context, width, height, anchor, presence, progress) {
  if(!anchor || presence<=0) return;
  const {x,y,wordWidth,fontSize}=anchor;
  // A soft diagonal shaft arrives from above-left. Its destination is fixed on
  // the glyphs; only the broad upper end drifts slightly as the word is sung.
  const origin={x:Math.max(fontSize*.7,x-fontSize*(4.7+.14*progress)),y:Math.max(0,y-fontSize*8.2)};
  context.save();
  context.beginPath();context.rect(0,0,width,height);context.clip();
  context.globalCompositeOperation='screen';
  function shaft(offset, spread, gain) {
    const tx=x+wordWidth*offset,ty=y-fontSize*.04;
    const ox=origin.x+fontSize*offset*2,oy=origin.y;
    const dx=tx-ox,dy=ty-oy,length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
    const gradient=context.createLinearGradient(ox,oy,tx,ty);
    gradient.addColorStop(0,'rgba(255,243,205,0)');
    gradient.addColorStop(.16,'rgba(255,239,193,.7)');
    gradient.addColorStop(.70,'rgba(255,220,147,1)');
    gradient.addColorStop(.95,'rgba(255,237,186,.8)');
    gradient.addColorStop(1,'rgba(255,235,180,0)');
    context.fillStyle=gradient;
    // Nested translucent shafts feather both edges without a hard cone or
    // expensive whole-frame blur. Brightness stays steady, with no flicker.
    for(let layer=9;layer>=1;layer--) {
      const fraction=layer/9,top=fontSize*spread*fraction,bottom=wordWidth*.30*spread*fraction;
      context.globalAlpha=presence*gain*.015;
      context.beginPath();context.moveTo(ox+nx*top,oy+ny*top);
      context.lineTo(tx+nx*bottom,ty+ny*bottom);
      context.lineTo(tx-nx*bottom,ty-ny*bottom);
      context.lineTo(ox-nx*top,oy-ny*top);context.closePath();context.fill();
    }
  }
  shaft(0,1.1,.75);shaft(-.24,.24,.75);shaft(.25,.18,.6);
  // A small landing glow keeps the shaft visually attached to this word only.
  context.translate(x,y);context.scale(Math.max(1,wordWidth*.56),fontSize*.58);
  const glow=context.createRadialGradient(0,0,0,0,0,1);
  glow.addColorStop(0,'rgba(255,240,189,.22)');
  glow.addColorStop(.45,'rgba(255,211,122,.08)');
  glow.addColorStop(1,'rgba(255,211,122,0)');
  context.globalAlpha=presence;context.fillStyle=glow;
  context.beginPath();context.arc(0,0,1,0,Math.PI*2);context.fill();
  context.restore();
}
