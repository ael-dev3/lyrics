// Compact solar fire behind stable lyric glyphs. All motion is a pure function
// of source-media time; seeking never leaves a particle or smoothing history.
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const fract = value => value - Math.floor(value);
const hash = value => fract(Math.sin(value * 127.1 + 311.7) * 43758.5453123);
const smooth = (from, to, value) => {
  const position = clamp((value - from) / (to - from), 0, 1);
  return position * position * (3 - 2 * position);
};

function seedNumber(value) {
  if (Number.isFinite(value)) return value;
  let seed = 2166136261;
  for (const character of String(value ?? 'sunfire')) {
    seed = Math.imul(seed ^ character.codePointAt(0), 16777619);
  }
  return seed >>> 0;
}

/**
 * Draw into a cleared, CSS-pixel-transformed overlay canvas behind the lyrics.
 * anchors: {x,y,width,fontSize,maxRise?,seed,wordStart,wordEnd,role}[]; one per glyph.
 * x is the glyph center, y its upper-stroke height, width its measured width.
 * time: source video.currentTime; power: measured vocal drive 0..1.
 * phase: preintegrated source-time burn rate; presence: phrase fade 0..1.
 * Does not clear, resize or retransform the canvas. Restores context state.
 */
export function drawSunfire(context, width, height, anchors, time, power, {phase=time,presence=1}={}) {
  if (!context || !Number.isFinite(time) || !(width > 0) || !(height > 0)
      || !Number.isFinite(power) || power <= 0 || !Number.isFinite(phase)
      || !Number.isFinite(presence) || presence <= 0 || !Array.isArray(anchors)) return;
  const drive = clamp(power, 0, 1);
  const opacity = clamp(presence, 0, 1) * (.2 + .8 * Math.sqrt(drive));
  const flare = Math.pow(drive, 1.4);
  const roleStrength = {sun: .94, burns: 1, out: .82, tonight: .9};
  const xBound = x => clamp(x, 0, width);
  const yBound = y => clamp(y, 0, height);
  context.save();
  context.beginPath();
  context.rect(0, 0, width, height);
  context.clip();
  context.globalCompositeOperation = 'screen';
  context.lineWidth = 1;
  // Per-path canvas shadows allocate costly intermediate blur surfaces. Keep
  // these bodies translucent; the small overlay may receive one CSS softening
  // pass from its owner instead of a separate blur for every tongue.
  context.shadowBlur = 0;
  context.shadowColor = 'transparent';
  const gradientCache = new Map();

  // Up to 64 glyphs protect against oversized input; one or two tongues per
  // glyph keep this phrase near 32–40 tongues, each with two fills.
  let emberCount = 0;
  for (const anchor of anchors.slice(0, 64)) {
    const {x, y, width: glyphWidth, fontSize, wordStart, wordEnd} = anchor;
    if (![x, y, glyphWidth, fontSize, wordStart, wordEnd].every(Number.isFinite)
        || glyphWidth <= 0 || fontSize <= 0 || wordEnd <= wordStart
        || x - glyphWidth / 2 >= width || x + glyphWidth / 2 <= 0 || y < 0 || y > height) continue;
    const size = Math.min(fontSize, height);
    const seed = seedNumber(anchor.seed);
    const ignition = .12 + .88 * smooth(wordStart - .04, wordStart + .015, time);
    const release = 1 - (.6 - .2 * drive) * smooth(wordEnd - .025, wordEnd + .085, time);
    const focus = ignition * release;
    const role = roleStrength[anchor.role] ?? .85;
    const strength = opacity * focus * role;
    if (strength < .002) continue;
    const maxRise = Math.min(size * (.4 + 1.3 * flare), Number.isFinite(anchor.maxRise) ? Math.max(0, anchor.maxRise) : size * 1.7);
    if (maxRise < .5) continue;
    const count = glyphWidth < size * .3 ? 1 : 2;

    const gradientKey = `${y}:${size}:${maxRise}`;
    let gradients = gradientCache.get(gradientKey);
    if (!gradients) {
      const outer = context.createLinearGradient(0, yBound(y - maxRise), 0, yBound(y + size * .035));
      outer.addColorStop(0, 'rgba(255,94,12,0)');
      outer.addColorStop(.18, 'rgba(255,112,20,.42)');
      outer.addColorStop(.61, 'rgba(255,137,27,.69)');
      outer.addColorStop(1, 'rgba(255,186,62,.8)');
      const inner = context.createLinearGradient(0, yBound(y - maxRise * .65), 0, yBound(y));
      inner.addColorStop(0, 'rgba(255,215,112,0)');
      inner.addColorStop(.54, 'rgba(255,225,132,.65)');
      inner.addColorStop(1, 'rgba(255,250,219,.96)');
      gradients = {outer, inner};
      gradientCache.set(gradientKey, gradients);
    }
    const {outer, inner} = gradients;

    for (let index = 0; index < count; index++) {
      const id = seed + index * 13.37;
      const period = .35 + hash(id + 4) * .22;
      const age = fract(phase / period + hash(id + 7));
      const life = Math.pow(Math.sin(Math.PI * age), .82);
      if (life < .035) continue;
      const localPower = .72 + .28 * hash(id + 9);
      // Unequal overlapping bodies prevent two evenly spaced spikes per glyph.
      const secondary = index ? .58 + hash(id + 14) * .24 : 1;
      const rise = maxRise * Math.sqrt(focus) * localPower * life * secondary;
      const base = xBound(x + glyphWidth * (index - (count - 1) / 2) * .4
        + (hash(id + 1) - .5) * glyphWidth * .07);
      const baseY = yBound(y + size * .025);
      const halfWidth = Math.min(glyphWidth * .34, size * .115) * (.85 + .4 * drive)
        * (.72 + .28 * hash(id + 2)) * (.7 + .3 * life);
      const whip = Math.sin(phase * (9 + hash(id + 6) * 7) + id) * rise * (.1 + .27 * drive)
        + Math.sin(phase * 23 + id * .47) * rise * (.02 + .07 * drive);
      const bend = Math.sin(phase * 9 + id * 2.1) * rise * (.08 + .12 * drive);
      const belly = base + bend;
      const neck = base + whip * .32 - bend * .52;
      const tipX = xBound(base + whip);
      const tipY = yBound(y - rise);

      context.globalAlpha = strength * life * (.58 + .3 * drive);
      context.fillStyle = outer;
      context.beginPath();
      context.moveTo(xBound(base - halfWidth), baseY);
      // Broad irregular shoulders feed an S-shaped neck. A rounded hook at the
      // top replaces the sharp shared vertex that made the old bodies metallic.
      context.bezierCurveTo(xBound(base - halfWidth * 1.3), yBound(y - rise * .13),
        xBound(belly - halfWidth * 1.2), yBound(y - rise * .32),
        xBound(belly - halfWidth * .78), yBound(y - rise * .48));
      context.bezierCurveTo(xBound(neck - halfWidth * .68), yBound(y - rise * .66),
        xBound(tipX - halfWidth * .4), yBound(y - rise * .94),
        xBound(tipX - halfWidth * .13), yBound(tipY + rise * .025));
      context.quadraticCurveTo(xBound(tipX + halfWidth * .15), tipY,
        xBound(tipX + halfWidth * .27), yBound(tipY + rise * .09));
      context.bezierCurveTo(xBound(tipX + halfWidth * .54), yBound(y - rise * .7),
        xBound(neck + halfWidth * .56), yBound(y - rise * .72),
        xBound(belly + halfWidth * .54), yBound(y - rise * .47));
      context.bezierCurveTo(xBound(belly + halfWidth * 1.23), yBound(y - rise * .29),
        xBound(base + halfWidth * 1.13), yBound(y - rise * .12), xBound(base + halfWidth), baseY);
      context.closePath();
      context.fill();

      context.globalAlpha = strength * life * (.55 + .32 * drive);
      context.fillStyle = inner;
      context.beginPath();
      context.moveTo(xBound(base - halfWidth * .52), baseY);
      context.bezierCurveTo(xBound(base - halfWidth * .71), yBound(y - rise * .15),
        xBound(belly - halfWidth * .47), yBound(y - rise * .3),
        xBound(neck - halfWidth * .14), yBound(y - rise * .56));
      context.quadraticCurveTo(xBound(neck + halfWidth * .18), yBound(y - rise * .67),
        xBound(neck + halfWidth * .29), yBound(y - rise * .5));
      context.bezierCurveTo(xBound(belly + halfWidth * .65), yBound(y - rise * .31),
        xBound(base + halfWidth * .7), yBound(y - rise * .13), xBound(base + halfWidth * .52), baseY);
      context.closePath();
      context.fill();
    }

    // Quiet singing gets no sparks; forceful hooks can eject a few hot embers.
    // At most six across the phrase. Nothing is
    // accumulated: an arbitrary seek reconstructs exactly the same ember.
    if (focus > .25 && drive > .4 && emberCount < (drive > .7 ? 6 : 2) && maxRise >= size * .84) {
      const period = .71 + hash(seed + 70) * .52;
      const cycle = Math.floor(phase / period + hash(seed + 71));
      const age = fract(phase / period + hash(seed + 71));
      if (hash(seed + cycle * 31.3 + 72) > .99 - .24 * flare && age > .08 && age < .9) {
        const emberAge = (age - .08) / .82;
        const fade = Math.sin(Math.PI * emberAge);
        const emberX = xBound(x + glyphWidth * (hash(seed + cycle * 9.1) - .5) * .6
          + Math.sin(emberAge * 5 + seed) * size * (.07 + .18 * drive));
        const travel = Math.min(size * (1 + .9 * flare), Number.isFinite(anchor.maxRise) ? anchor.maxRise : size * 1.9);
        const emberY = yBound(y - travel * (.3 * Math.sqrt(focus) + emberAge * .7));
        const radius = Math.min(1.5, size * (.02 + .025 * drive)) * fade;
        context.globalAlpha = strength * fade * (.56 + .25 * drive);
        context.fillStyle = 'rgb(255,234,158)';
        context.beginPath();
        context.ellipse(emberX, emberY, radius * .6, radius, -.25, 0, Math.PI * 2);
        context.fill();
        emberCount++;
      }
    }
  }
  context.restore();
}
