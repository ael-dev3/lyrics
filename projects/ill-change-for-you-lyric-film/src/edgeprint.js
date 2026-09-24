// An audio-shaped exposure mark in the film edge, not a separate illuminated rail.
// The dBFS measurements and media clock remain unchanged by this display mapping.
export function paintEdgeprint(context, width, height, db, mode = 'dark') {
  context.clearRect(0, 0, width, height);
  if (!db?.length || width < 1 || height < 1) return;
  const count = 28;
  const rgb = mode === 'light' ? '63,31,45' : '248,224,208';
  context.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const lo = Math.floor(i * db.length / count);
    const hi = Math.max(lo + 1, Math.floor((i + 1) * db.length / count));
    let sum = 0;
    for (let j = lo; j < hi; j++) sum += db[j];
    const average = sum / (hi - lo);
    const energy = Math.pow(Math.max(0, Math.min(1, (average + 56) / 39)), 1.7);
    if (energy < .035) continue;
    const y = (i + .5) * height / count;
    const length = 1.3 + energy * width * .70;
    const wobble = Math.sin(i * 7.41) * .42;
    context.lineWidth = Math.max(.7, Math.min(1.55, height / count * .23));
    context.strokeStyle = `rgba(${rgb},${.12 + energy * .36})`;
    context.beginPath();
    context.moveTo(.7, y);
    context.lineTo(Math.max(1.4, length * .52), y + wobble);
    context.lineTo(length, y + wobble * .3);
    context.stroke();
  }
}
