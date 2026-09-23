import {spectrumGeometry} from './preview-core.js';

// Display treatment only: the stored dBFS measurements and media clock stay intact.
export function paintSpectrum(context, width, height, db) {
  const energy = Array.from(db, value => Math.max(0, Math.min(1, (value + 58) / 34)));
  const peak = Math.max(...energy);
  if (peak < .02) return;

  const inset = Math.max(2, height * .12);
  const baseline = height * .87;
  const lift = Math.min(2.5, height * .045);
  const bars = spectrumGeometry(width - inset * 2, baseline - inset - lift, energy, 1.6)
    .filter(bar => bar.level > .015)
    .map(bar => ({...bar, x:bar.x + inset, y:bar.y + inset + lift}));

  // One bounded bloom pass, followed by crisp faces. No trails or delayed peaks.
  context.save();
  context.beginPath();
  for (const bar of bars) context.rect(bar.x, bar.y, bar.width, bar.height);
  context.fillStyle = `rgba(255,190,83,${.08 + peak * .12})`;
  context.shadowColor = 'rgba(255,187,75,.65)';
  context.shadowBlur = height * .11;
  context.fill();
  context.restore();

  for (const bar of bars) {
    const depth = Math.min(bar.width * .23, 2.5);
    const front = bar.width - depth;
    const opacity = .58 + bar.level * .4;
    const body = context.createLinearGradient(0, bar.y, 0, baseline);
    body.addColorStop(0, `rgba(255,230,170,${opacity})`);
    body.addColorStop(.24, `rgba(234,183,90,${opacity})`);
    body.addColorStop(1, `rgba(126,83,35,${opacity * .85})`);
    context.fillStyle = body;
    context.fillRect(bar.x, bar.y, front, bar.height);

    // A consistent small extrusion gives each column a lit cap and a dark side.
    context.fillStyle = `rgba(164,108,40,${opacity})`;
    context.beginPath();
    context.moveTo(bar.x + front, bar.y);
    context.lineTo(bar.x + bar.width, bar.y - lift);
    context.lineTo(bar.x + bar.width, baseline - lift);
    context.lineTo(bar.x + front, baseline);
    context.closePath();context.fill();
    context.fillStyle = `rgba(255,243,210,${.60 + bar.level * .35})`;
    context.beginPath();
    context.moveTo(bar.x, bar.y);
    context.lineTo(bar.x + depth, bar.y - lift);
    context.lineTo(bar.x + bar.width, bar.y - lift);
    context.lineTo(bar.x + front, bar.y);
    context.closePath();context.fill();

    // A short, fading reflection anchors the volume without introducing a rail.
    const reflectionHeight = Math.max(0, Math.min(height * .10, bar.height * .2, height - baseline - 1));
    const reflection = context.createLinearGradient(0, baseline + 1, 0, baseline + 1 + reflectionHeight);
    reflection.addColorStop(0, `rgba(236,182,87,${bar.level * .18})`);
    reflection.addColorStop(1, 'rgba(236,182,87,0)');
    context.fillStyle = reflection;
    context.fillRect(bar.x, baseline + 1, front, reflectionHeight);
  }
}
