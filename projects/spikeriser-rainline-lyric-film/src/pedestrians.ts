export type PedestrianVariant = 'violet' | 'teal';
export type PedestrianOptions = {
  /** Horizontal body anchor in the city's logical pixel grid. */
  x: number;
  /** Ground line under the shoes in the city's logical pixel grid. */
  footY: number;
  /** Umbrella top to ground line, in logical pixels. */
  height: number;
  /** Direction of travel on screen. The atlas figures have different native facings. */
  direction: 1 | -1;
  /** Source soundtrack time in seconds. */
  time: number;
  /** Positive ground speed in logical pixels per second. */
  speed: number;
  /** Stable cycle offset for this pedestrian, measured in turns. */
  phase: number;
  variant: PedestrianVariant;
};

type Foot = {x: number; lift: number; planted: boolean};
export type WalkPose = {
  cycle: number;
  phaseIndex: number;
  bob: number;
  left: Foot;
  right: Foot;
};

const BASE_HEIGHT = 74;
const CYCLE_DISTANCE = 34;
const STANCE = .58;
const TAU = Math.PI * 2;
const frac = (value: number) => value - Math.floor(value);
const smooth = (value: number) => value * value * (3 - 2 * value);
const rect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) => {
  c.fillStyle = fill;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};

/**
 * The stance foot countertravels at exactly the character's ground speed.
 * A complete cycle has eight recognisable phases while joint positions remain
 * continuous, so a planted shoe does not slide between frames.
 */
export function walkPose(time: number, speed: number, height: number, phase: number): WalkPose {
  const scale = Math.max(.1, height / BASE_HEIGHT);
  const cycle = frac(Math.abs(speed) * Math.max(0, time) / (CYCLE_DISTANCE * scale) + phase);
  const stanceTravel = CYCLE_DISTANCE * STANCE;
  const front = stanceTravel / 2;
  const back = -front;
  const foot = (turn: number): Foot => {
    const position = frac(turn);
    if (position < STANCE) {
      const u = position / STANCE;
      return {x: front - u * stanceTravel, lift: 0, planted: true};
    }
    const u = (position - STANCE) / (1 - STANCE);
    return {x: back + smooth(u) * stanceTravel, lift: Math.sin(Math.PI * u) * 6.5, planted: false};
  };
  return {
    cycle,
    phaseIndex: Math.floor(cycle * 8),
    bob: -.85 * (1 - Math.cos(2 * TAU * cycle)) / 2,
    left: foot(cycle),
    right: foot(cycle + .5),
  };
}

function pixelSegment(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, width: number, color: string) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let step = 0; step <= steps; step++) {
    const u = step / steps;
    rect(c, x0 + (x1 - x0) * u - width / 2, y0 + (y1 - y0) * u - width / 2, width, width, color);
  }
}

function paintLeg(c: CanvasRenderingContext2D, foot: Foot, hipX: number, near: boolean, variant: PedestrianVariant) {
  const pants = near ? '#192b42' : '#111a30';
  const shade = near ? '#344963' : '#283851';
  const accent = variant === 'violet' ? '#875caa' : '#4db5c5';
  const ankleY = -3 - foot.lift;
  const kneeX = hipX * .4 + foot.x * .6 + (foot.planted ? 1 : 2.5 * foot.lift / 6.5);
  const kneeY = -15 - foot.lift * .35;
  pixelSegment(c, hipX, -29, kneeX, kneeY, near ? 5 : 4, pants);
  pixelSegment(c, kneeX, kneeY, foot.x, ankleY, near ? 4 : 3, pants);
  pixelSegment(c, kneeX + 1, kneeY + 2, foot.x + 1, ankleY, 1, shade);
  rect(c, foot.x - 3, ankleY - 1, 10, 4, '#0a1428');
  rect(c, foot.x - 1, ankleY - 1, 6, 1, shade);
  rect(c, foot.x + 1, ankleY + 2, 5, 1, accent);
}

function paintCoat(c: CanvasRenderingContext2D, variant: PedestrianVariant, cycle: number, bob: number) {
  const base = variant === 'violet' ? '#2b304d' : '#523a38';
  const shade = variant === 'violet' ? '#171d35' : '#2a2637';
  const edge = variant === 'violet' ? '#875bb4' : '#4da9c4';
  const lag = Math.round(-1.5 - 1.5 * Math.sin(TAU * cycle - .7));
  for (let row = 0; row < 18; row++) {
    const spread = Math.round(11 * (row / 17) ** 1.35);
    const left = -8 - spread + Math.round(lag * row / 17);
    const right = 8 - Math.floor(row / 6);
    rect(c, left, -32 + row + bob, right - left, 1, base);
    rect(c, left, -32 + row + bob, 2, 1, shade);
    if (row % 3 === 0) rect(c, left + 4, -32 + row + bob, 2, 1, shade);
  }
  rect(c, -18 + lag, -16 + bob, 16, 2, shade);
  rect(c, -15 + lag, -15 + bob, 9, 1, edge);
  rect(c, 5, -31 + bob, 2, 14, shade);
}

function paintAtlasUpper(c: CanvasRenderingContext2D, atlas: CanvasImageSource, variant: PedestrianVariant, cycle: number, bob: number) {
  const sourceX = variant === 'violet' ? 162 : 729;
  const sourceWidth = variant === 'violet' ? 366 : 358;
  const left = variant === 'violet' ? -27 : -22;
  const width = 50;
  const sourceTop = 646;
  const sourceBottom = 1010;
  const upperHeight = 46;
  const sourceToLocal = upperHeight / (sourceBottom - sourceTop);
  const bodyStart = 785;
  const canopyEnd = 810;
  const bodyX = Math.round(.6 * Math.sin(TAU * cycle));
  const canopyLag = Math.round(-1.1 * Math.sin(TAU * cycle - .9));
  const coatLag = Math.round(-1.5 - 1.5 * Math.sin(TAU * cycle - .7));
  const upperY = -BASE_HEIGHT + Math.round(bob);

  // The lower coat is a separate textured flap; static atlas boots are excluded.
  const tailX = variant === 'violet' ? 190 : 900;
  const tailWidth = variant === 'violet' ? 180 : 174;
  const tailY = 995;
  const tailHeight = 85;
  const tailDestX = left + (tailX - sourceX) * width / sourceWidth + coatLag;
  const tailDestY = upperY + (tailY - sourceTop) * sourceToLocal;
  const tailDestW = tailWidth * width / sourceWidth;
  const tailDestH = tailHeight * sourceToLocal;
  if (variant === 'teal') {
    c.save();
    c.scale(-1, 1);
    c.drawImage(atlas, tailX, tailY, tailWidth, tailHeight, tailDestX, tailDestY, tailDestW, tailDestH);
    c.restore();
  } else c.drawImage(atlas, tailX, tailY, tailWidth, tailHeight, tailDestX, tailDestY, tailDestW, tailDestH);

  const slice = (from: number, to: number, dx: number) => {
    const destY = upperY + (from - sourceTop) * sourceToLocal;
    const destH = (to - from) * sourceToLocal;
    if (variant === 'teal') {
      // Teal faces left in the atlas; normalise both figures to face right.
      c.save();
      c.scale(-1, 1);
      c.drawImage(atlas, sourceX, from, sourceWidth, to - from, left + dx, destY, width, destH);
      c.restore();
    } else c.drawImage(atlas, sourceX, from, sourceWidth, to - from, left + dx, destY, width, destH);
  };
  slice(bodyStart, sourceBottom, bodyX);
  slice(sourceTop, canopyEnd, bodyX + canopyLag);
}

/** Draw one full figure. `x` is the torso's ground anchor; `footY` is the pavement. */
export function paintPedestrian(c: CanvasRenderingContext2D, atlas: CanvasImageSource, options: PedestrianOptions): void {
  const {x, footY, height, direction, time, speed, phase, variant} = options;
  if (!(height > 0) || !Number.isFinite(x + footY + time + speed + phase)) return;
  const scale = height / BASE_HEIGHT;
  const pose = walkPose(time, speed, height, phase);
  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(Math.round(x), Math.round(footY));
  c.scale(direction * scale, scale);
  rect(c, -13, 1, 27, 1, '#071324');
  rect(c, -9, 2, 19, 1, '#305168');
  if (pose.left.x >= pose.right.x) {
    paintLeg(c, pose.right, -3, false, variant);
    paintLeg(c, pose.left, 3, true, variant);
  } else {
    paintLeg(c, pose.left, 3, false, variant);
    paintLeg(c, pose.right, -3, true, variant);
  }
  paintCoat(c, variant, pose.cycle, Math.round(pose.bob));
  paintAtlasUpper(c, atlas, variant, pose.cycle, pose.bob);
  c.restore();
}
