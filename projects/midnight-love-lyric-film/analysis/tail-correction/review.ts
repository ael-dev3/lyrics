import {readFileSync, writeFileSync} from 'node:fs';
const root = 'analysis/tail-correction/';
const bytes = readFileSync('analysis/vocals.f32'), pcm = new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4), sr = 16000;
const correlation = (a: number, b: number, duration: number): number => {
  let xy = 0, xx = 0, yy = 0;
  const count = Math.round(duration * sr), ai = Math.round(a * sr), bi = Math.round(b * sr);
  for (let i = 0; i < count; i += 4) { const x = pcm[ai + i] ?? 0, y = pcm[bi + i] ?? 0; xy += x * y; xx += x * x; yy += y * y; }
  return xy / Math.sqrt(Math.max(1e-20, xx * yy));
};
const matches = [];
for (const [id, referenceStart, duration, expectedShift] of [['L33',90.68,4.9,64],['L34',98.5,4.9,64],['L35',136.65,3.2,32],['L36',140.3,3.2,32],['L37',144.64,3.2,32],['L38',148.3,4.4,32]] as const) {
  let best = {shift: 0, correlation: -1};
  for (let i = -500; i <= 500; i++) { const shift = expectedShift + i / 1000, value = correlation(referenceStart, referenceStart + shift, duration); if (value > best.correlation) best = {shift, correlation: value}; }
  const initial = best.shift;
  for (let i = -16; i <= 16; i++) { const shift = initial + i / sr, value = correlation(referenceStart, referenceStart + shift, duration); if (value > best.correlation) best = {shift, correlation: value}; }
  matches.push({id, referenceStart, duration, expectedShift, ...best});
}
writeFileSync(root + 'repeated-vocal-correlation.json', JSON.stringify({method:'Signed normalized waveform correlation on separated-vocal PCM; independently search each matching phrase within ±0.5s at1ms intervals, refine winning lag at16k sample steps. Values support comparison; no automatic cue transfer.',matches},null,2));
const rms: {seconds:number;db:number}[] = [];
for (let start = 150 * sr; start < pcm.length; start += 80) { let sum = 0; const end = Math.min(pcm.length, start + 80); for (let i = start; i < end; i++) sum += (pcm[i] ?? 0) ** 2; rms.push({seconds:start/sr,db:10*Math.log10(Math.max(1e-12,sum/(end-start)))}); }
writeFileSync(root + 'vocal-rms-5ms.json', JSON.stringify(rms));
const windows: {id:string;text:string;start:number;end:number}[] = JSON.parse(readFileSync(root+'windows.json','utf8'));
let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1680" height="1560"><rect width="1680" height="1560" fill="#0b1020"/><style>text{font-family:monospace;fill:#e3e9f6;font-size:16px}</style>';
for (const [i,w] of windows.entries()) {
  const y = 60 + i * 246, x = (t:number) => 90+(t-w.start)/(w.end-w.start)*1500;
  svg += `<text x="32" y="${y-25}">${w.id}: ${w.text.replaceAll('&','&amp;')}</text>`;
  for (const db of [-50,-35,-20,-5]) { const yy=y+180-(db+60)/60*180;svg+=`<line x1="90" x2="1590" y1="${yy}" y2="${yy}" stroke="#26324b"/><text x="25" y="${yy+5}">${db}</text>`; }
  let path='';for(const r of rms.filter(r=>r.seconds>=w.start&&r.seconds<=w.end))path+=`${path?'L':'M'}${x(r.seconds).toFixed(1)},${(y+180-Math.max(0,Math.min(60,r.db+60))/60*180).toFixed(1)} `;
  svg+=`<path d="${path}" fill="none" stroke="#a0c7fa" stroke-width="1.5"/>`;
  for(let t=Math.ceil(w.start*2)/2;t<=w.end;t+=.5)svg+=`<line x1="${x(t)}" x2="${x(t)}" y1="${y}" y2="${y+180}" stroke="#26324b"/><text x="${x(t)-22}" y="${y+206}">${t.toFixed(1)}</text>`;
}
svg+='</svg>';writeFileSync(root+'vocal-window-review.svg',svg);
console.log(JSON.stringify(matches,null,2));
