export const FPS=60, SR=48000, SAMPLES=8400648, FRAMES=Math.ceil(SAMPLES/SR*FPS);
export const TRACK={artist:'ТАНЦЫ МИНУС',title:'ПОЛОВИНКА',translation:'Half of Myself'};
export const P={ink:'#100e0d',cream:'#fff1db',teal:'#87e3d0',amber:'#e7a863',muted:'#d0b9a0'};
export const layout=(portrait:boolean)=>portrait?{width:1080,height:1920,left:74,lyricWidth:850,ruTop:1040,enTop:1280,fontSize:68,baseline:1656,spectrumWidth:850,footer:1700}:{width:1920,height:1080,left:88,lyricWidth:1744,ruTop:664,enTop:800,fontSize:72,baseline:986,spectrumWidth:1744,footer:1024};
