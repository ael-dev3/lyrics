const columns = ['mixDbfs','vocalDbfs','highMidDbfs','highMidRatio','roughness','drive','rate','phase'];

export function validateFireDynamics(data) {
  if (data?.schema !== 'lyric-film/fire-dynamics/v1' || data.frameRate !== 60
      || !(data.durationSeconds > 0) || data.firstFrameSeconds !== 0
      || JSON.stringify(data.columns) !== JSON.stringify(columns)
      || !Array.isArray(data.rows) || data.rows.length !== data.frameCount
      || data.frameCount !== Math.ceil(data.durationSeconds * data.frameRate) + 1) return false;
  let previousPhase = -1;
  for (const row of data.rows) {
    if (!Array.isArray(row) || row.length !== columns.length || !row.every(Number.isFinite)
        || row[5] < 0 || row[5] > 1 || row[6] < .45 || row[6] > 2.8
        || row[7] < previousPhase) return false;
    previousPhase = row[7];
  }
  return true;
}

// Integrating instantaneous rate in the browser would make seeking and slow
// playback disagree. The offline phase integral is sampled on the media clock.
export function fireDynamicsAt(data, time) {
  if (!data || !Number.isFinite(time) || time < 0 || time > data.durationSeconds)
    return {drive:0,rate:.45,phase:0,mixDbfs:-100,vocalDbfs:-100};
  const position = Math.min(data.frameCount - 1, time * data.frameRate);
  const index = Math.floor(position), fraction = position - index;
  const first = data.rows[index], second = data.rows[Math.min(index + 1, data.frameCount - 1)];
  const lerp = column => first[column] + (second[column] - first[column]) * fraction;
  return {drive:lerp(5),rate:lerp(6),phase:lerp(7),mixDbfs:lerp(0),vocalDbfs:lerp(1)};
}
