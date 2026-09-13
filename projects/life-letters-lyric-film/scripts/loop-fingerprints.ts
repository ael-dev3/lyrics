import {writeFileSync} from 'node:fs';
import {pcm,correlate,peaks} from './signal.ts';
const x=pcm('analysis/vocals16.f32',4),sr=4000;
const probes=[
 {id:'long-vowel-a',template:[73.4,74.2],search:[76,214]},
 {id:'long-vowel-b',template:[76.1,76.9],search:[78,214]},
 {id:'long-vowel-c',template:[79.4,80.2],search:[81,214]},
 {id:'nas-syllable',template:[95.1,95.8],search:[96,145.3]},
 {id:'rays-release-a',template:[95.8,97],search:[97.5,145]},
 {id:'start-vot',template:[23.9,24.65],search:[0,14.9]},
 {id:'third-chorus-kiss',template:[60.84,62.15],search:[208,213]}
];
const output=probes.map(p=>{const [a=0,b=0]=p.template,[c=0,d=0]=p.search;const matches=peaks(correlate(x.slice(Math.round(a*sr),Math.round(b*sr)),x.slice(Math.round(c*sr),Math.round(d*sr))),sr,c,12,.8);console.log(p.id,matches.slice(0,8));return {...p,matches};});
writeFileSync('analysis/loop-fingerprints.json',JSON.stringify(output,null,2));
