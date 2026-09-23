const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};

export function damageState(time,word) {
  const token=word?.text.toLowerCase().replace(/[^a-z]/g,'');
  if(!/^(hurt|hurts)$/.test(token||'') || time<word.start || time>=word.end) return {presence:0,impact:0,fracture:0,progress:0};
  const duration=word.end-word.start,elapsed=time-word.start,progress=elapsed/duration;
  const presence=smooth(elapsed/Math.min(.07,duration*.2))*smooth((word.end-time)/Math.min(.14,duration*.3));
  const impact=presence*(1-smooth(elapsed/Math.min(.3,duration)));
  return {presence,impact,fracture:presence*smooth(elapsed/Math.min(.16,duration*.4)),progress};
}

// A single soft contact glow and tiny released flecks, without shaking glyphs.
// Travel and opacity derive only from the active word's source-time progress.
export function drawDamage(context,width,height,fontSize,wordWidth,state) {
  const {presence,impact,fracture,progress}=state;
  if(!presence) return;
  const left=(width-wordWidth)/2,centerY=height/2;
  context.save();
  context.translate(width/2,centerY);context.scale(wordWidth*.58+fontSize*.12,fontSize*.51);
  const glow=context.createRadialGradient(0,0,0,0,0,1);
  glow.addColorStop(0,'rgba(211,132,78,.24)');glow.addColorStop(.5,'rgba(181,101,62,.10)');glow.addColorStop(1,'rgba(181,101,62,0)');
  context.globalAlpha=impact;context.fillStyle=glow;
  context.beginPath();context.arc(0,0,1,0,Math.PI*2);context.fill();context.restore();
  context.save();context.fillStyle='#d6a16d';context.globalAlpha=fracture*.42;
  for(let i=0;i<3;i++) {
    const travel=smooth((progress-.16-i*.05)/.8);
    const x=left+wordWidth*(.22+i*.31)+fontSize*(i-1)*travel*.1;
    const y=centerY+fontSize*(.31+travel*.24);
    context.save();context.translate(x,y);context.rotate((i-1)*.4+travel*.35);
    context.beginPath();context.moveTo(-fontSize*.022,0);context.lineTo(fontSize*.028,fontSize*.016);context.lineTo(0,fontSize*.043);context.closePath();context.fill();context.restore();
  }
  context.restore();
}
