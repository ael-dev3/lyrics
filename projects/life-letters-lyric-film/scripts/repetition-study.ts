import {writeFileSync} from 'node:fs';
import {pcm,correlate,peaks,shape,cosine} from './signal.ts';
const x=pcm('analysis/vocals16.f32',4),sr=4000;
const probes=[
 {id:'opening-phrase',template:[23.87,25.12],search:[0,17.4]},
 {id:'kiss-word',template:[60.84,61.5],search:[70,144]},
 {id:'kiss-phrase',template:[60.84,62.15],search:[70,144]},
 {id:'rays-phrase',template:[62.64,65.12],search:[70,147.3]},
 {id:'rays-onset',template:[62.64,63.4],search:[70,147.3]},
 {id:'feel-phrase',template:[65.24,67.7],search:[70,163]},
 {id:'here-phrase',template:[68.1,70.4],search:[70,164]},
 {id:'kiss-tail',template:[60.84,62.15],search:[179,212.5]},
 {id:'hour-tail',template:[172.78,173.25],search:[173.3,226]},
];
const output=probes.map(p=>{const [a=0,b=0]=p.template,[c=0,d=0]=p.search;
 const matches=peaks(correlate(x.slice(Math.round(a*sr),Math.round(b*sr)),x.slice(Math.round(c*sr),Math.round(d*sr))),sr,c,12,.4);console.log(p.id,matches.slice(0,6));return {...p,matches};});
writeFileSync('analysis/repetition-study.json',JSON.stringify({method:'Mean-centered normalized waveform cross-correlation; 4 kHz decimated vocal stem; no inferred textual labels from low-scoring matches',probes:output},null,2));
const full=pcm('analysis/vocals16.f32'),fullSR=16000;
const references=[{id:'u-in-kiss',time:61.23},{id:'a-in-me',time:61.97},{id:'a-in-us',time:64.6},{id:'e-in-me',time:61.65}].map(r=>({...r,shape:shape(full,Math.round(r.time*fullSR),fullSR)}));
const regions=[[70,143],[179,212]];
const frames=regions.flatMap(([a=0,b=0])=>Array.from({length:Math.ceil((b-a)/.04)},(_,i)=>{const time=a+i*.04,feature=shape(full,Math.round(time*fullSR),fullSR);return {time,scores:references.map(r=>cosine(feature,r.shape))};}));
writeFileSync('analysis/sustain-shape-experiment.json',JSON.stringify({status:'Exploratory formant-envelope comparison, not phoneme authority. Digital pitch/filter edits can invalidate these comparisons.',references,frames}));
