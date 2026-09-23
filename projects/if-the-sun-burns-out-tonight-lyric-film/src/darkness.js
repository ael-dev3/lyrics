const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};

export function darknessState(time,word) {
  if(!word || time<word.start || time>=word.end) return {presence:0,progress:0};
  return {presence:smooth((time-word.start)/.18)*smooth((word.end-time)/.22),progress:(time-word.start)/(word.end-word.start)};
}

// Feathered charcoal wisps slide behind the word; the real glyphs stay still.
// All positions derive from source progress, so a seek reconstructs the shadow.
export function drawDarkness(context,width,height,fontSize,wordWidth,presence,progress) {
  if(!presence) return;
  context.save();context.globalCompositeOperation='source-over';
  const left=(width-wordWidth)/2,centerY=height/2;
  for(let index=0;index<5;index++) {
    const phase=progress*Math.PI*1.25+index*1.9;
    const x=left+wordWidth*(index+.5)/5+Math.sin(phase)*fontSize*.22;
    const y=centerY+Math.cos(phase*.8)*fontSize*.18;
    const rx=wordWidth*.13+fontSize*.48,ry=fontSize*(.43+.06*Math.sin(phase));
    context.save();context.translate(x,y);context.rotate(Math.sin(phase)*.12);context.scale(rx,ry);
    const gradient=context.createRadialGradient(0,0,0,0,0,1);
    gradient.addColorStop(0,'rgba(3,4,10,.58)');
    gradient.addColorStop(.42,'rgba(5,6,14,.42)');
    gradient.addColorStop(.78,'rgba(13,13,24,.14)');
    gradient.addColorStop(1,'rgba(13,13,24,0)');
    context.globalAlpha=presence;context.fillStyle=gradient;
    context.beginPath();context.arc(0,0,1,0,Math.PI*2);context.fill();context.restore();
  }
  context.restore();
}
