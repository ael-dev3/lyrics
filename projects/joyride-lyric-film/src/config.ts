export const SR=48000,FPS=60,SAMPLE_COUNT=7144968;
export const FRAMES=Math.ceil(SAMPLE_COUNT/SR*FPS);
export const TRACK={title:'Joyride',artist:'Oliver Tree',year:2025,source:'https://www.youtube.com/watch?v=TIipwQUU9mc',prefix:'Joyride',release:'joyride-v1.0.0'};
export const P={ink:'#101b1c',teal:'#3f7772',cream:'#f0e9d6',red:'#f16e50',dim:'#8daba4',deep:'#173032'};
export const layout=(portrait:boolean)=>portrait?{width:1080,height:1920,lyricLeft:72,lyricTop:1215,lyricWidth:894,lyricBottom:1530,fontSize:82,spectrumLeft:72,spectrumWidth:894,baseline:1635,footerTop:1713}:{width:1920,height:1080,lyricLeft:1218,lyricTop:480,lyricWidth:630,lyricBottom:858,fontSize:78,spectrumLeft:76,spectrumWidth:1772,baseline:967,footerTop:1023};
