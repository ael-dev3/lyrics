import {writeFileSync} from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {initNative, root} from './native-host.ts';
import {getCues, layoutCue, SPECTRUM} from '../src/scene.ts';
import {cueWindow} from '../src/model.ts';
import {placement, SHOTS} from '../src/frame.ts';

// Geometry audit of every cue in every shot it is visible over, both formats,
// with the real local text (or placeholders with --placeholder). Reports only
// numbers and IDs: font size, row count, whether each glyph box stays inside
// its reading zone and clear of the spectrum's full reach.
const placeholder = process.argv.includes('--placeholder');
initNative({timelinePath: `${root}public/timeline.json`, placeholder});
const cues = getCues(), ctx = createCanvas(1920, 1920).getContext('2d') as unknown as CanvasRenderingContext2D;
type Row = {cue: string; format: string; shot: string; size: number; rows: number; outside: number; spectrumClash: number};
const rows: Row[] = [];
for (const format of ['landscape', 'portrait'] as const) {
  const spec = SPECTRUM[format], specTop = spec.base - spec.travel - 6;
  cues.forEach((cue, i) => {
    const [a, b] = cueWindow(cues, i, 283.422766);
    for (const shot of SHOTS.filter(s => s.end > a && s.start < b)) {
      const t = Math.max(a, shot.start) + 1e-3, p = placement(format, shot, t);
      const layout = layoutCue(ctx, cue, format, shot, p);
      const box = layout.box;
      let outside = 0, clash = 0;
      for (const pl of layout.placed) {
        const top = pl.y - pl.size * 0.82, bottom = pl.y + pl.size * 0.2, left = pl.x, right = pl.x + pl.w;
        if (left < box.x - 1 || right > box.x + box.w + 1 || top < box.y - pl.size * 0.25 || bottom > box.y + box.h + pl.size * 0.25) outside++;
        if (bottom > specTop && right > spec.x && left < spec.x + spec.w) clash++;
      }
      rows.push({cue: cue.id, format, shot: shot.id, size: layout.size, rows: new Set(layout.placed.map(p => p.row)).size, outside, spectrumClash: clash});
    }
  });
}
const summary = (f: string) => {
  const r = rows.filter(x => x.format === f);
  return {layouts: r.length, minSize: Math.min(...r.map(x => x.size)), maxRows: Math.max(...r.map(x => x.rows)),
    threeRows: r.filter(x => x.rows >= 3).length, outside: r.filter(x => x.outside).map(x => `${x.cue}@${x.shot}`), spectrumClash: r.filter(x => x.spectrumClash).map(x => `${x.cue}@${x.shot}`),
    smallest: [...r].sort((x, y) => x.size - y.size).slice(0, 5).map(x => `${x.cue}@${x.shot}:${x.size}px/${x.rows}r`)};
};
const result = {schema: 'lyric-film/layout-audit/v1', text: placeholder ? 'placeholder' : 'local lyric file (text not recorded)', landscape: summary('landscape'), portrait: summary('portrait')};
writeFileSync(`${root}evidence/layout-audit.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 1));
