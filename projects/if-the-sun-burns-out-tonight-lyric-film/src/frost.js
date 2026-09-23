const smooth = value => {const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};

export function frostState(time, word) {
  if(!word || time<word.start || time>=word.end) return {presence:0,spread:0};
  const duration=word.end-word.start,progress=(time-word.start)/duration;
  return {
    presence:smooth((time-word.start)/Math.min(.12,duration*.3))*smooth((word.end-time)/Math.min(.15,duration*.3)),
    spread:smooth(progress/.72),
  };
}

// Fine, stationary ice branches grow on a few measured letter edges. The frost
// front is a slow progression across the word, never a shake or a sparkle loop.
export function drawFrost(context, anchors, presence, spread) {
  if(!presence || !anchors.length) return;
  context.save();context.lineCap='round';context.lineJoin='round';
  context.globalCompositeOperation='screen';
  anchors.forEach((anchor,index)=>{
    if(index%2) return;
    const growth=smooth((spread-index/anchors.length*.65)/.35);
    if(!growth) return;
    const {x,y,fontSize}=anchor;
    const height=fontSize*(.115+(index%3)*.026)*growth;
    const lean=(index%3-1)*height*.24;
    context.strokeStyle='rgba(211,243,255,.75)';
    context.lineWidth=Math.max(.45,fontSize*.017);
    context.globalAlpha=presence*.65*growth;
    context.beginPath();context.moveTo(x,y+fontSize*.025);context.lineTo(x+lean,y-height);
    for(const fraction of [.42,.7]) {
      const px=x+lean*fraction,py=y-height*fraction,arm=height*(1-fraction)*.55;
      context.moveTo(px-arm,py-arm*.8);context.lineTo(px,py);context.lineTo(px+arm,py-arm*.8);
    }
    context.stroke();
  });
  context.restore();
}
