import {mkdirSync, writeFileSync} from 'node:fs';
import {decodeFrame, initNative, nativeScene, root, sourceFrameAt} from './native-host.ts';

// Diagnostic stills from the native renderer (not production, no encoding).
// Default text mode is placeholder blocks, so a diagnostic never reproduces
// the lyric; --lyrics renders the local text for private review only.
// Usage: node scripts/render-still.ts --at 12.5,88.2 [--format landscape|portrait|both] [--timeline path] [--lyrics] [--out dir]
const args = process.argv.slice(2);
const opt = (flag: string): string | undefined => {const i = args.indexOf(flag); return i < 0 ? undefined : args[i + 1];};
const times = (opt('--at') ?? '').split(',').filter(Boolean).map(Number);
if (!times.length || times.some(t => !Number.isFinite(t) || t < 0)) throw Error('--at SECONDS[,SECONDS…] is required');
const formats = (opt('--format') ?? 'both') === 'both' ? ['landscape', 'portrait'] as const : [opt('--format') as 'landscape' | 'portrait'];
const placeholder = !args.includes('--lyrics');
const timeline = opt('--timeline') ?? `${root}public/timeline.json`;
const out = opt('--out') ?? `${root}renders/diagnostic`;
initNative({timelinePath: args.includes('--no-timeline') ? null : timeline, placeholder});
mkdirSync(out, {recursive: true});
for (const format of formats) {
  const scene = nativeScene(format);
  for (const t of times) {
    const k = sourceFrameAt(t, 6794), frame = await decodeFrame(k);
    scene.paint(frame, t);
    const file = `${out}/${format}-${t.toFixed(3)}${placeholder ? '-placeholder' : '-private'}.png`;
    writeFileSync(file, await scene.canvas.encode('png'));
    console.log(file);
  }
}
