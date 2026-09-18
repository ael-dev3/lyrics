// Native 2× canvases and raw RGBA buffers can outgrow the JS heap's GC trigger.
// Collect unreachable native buffers during long exports; this never changes pixels.
if(typeof global.gc!=='function')throw Error('Run the memory guard with node --expose-gc');
const collect=global.gc;
setInterval(()=>collect(),1000).unref();
