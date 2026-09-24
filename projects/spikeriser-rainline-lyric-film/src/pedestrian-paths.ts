import {paintPedestrian, type PedestrianOptions} from './pedestrians.ts';
import type {Format} from './city-choreography.ts';

type Walker = PedestrianOptions & {lane: 'back' | 'middle' | 'front'};

/** The foreground curb in the two painted city backgrounds. */
export const SIDEWALK = {
  landscape: {width: 640, roadEdgeY: 315, backFootY: 303, middleFootY: 306, frontFootY: 310},
  portrait: {width: 360, roadEdgeY: 551, backFootY: 534, middleFootY: 539, frontFootY: 545},
} as const;

const wrap = (position: number, width: number, margin: number): number => {
  const span = width + 2 * margin;
  return ((position + margin) % span + span) % span - margin;
};

/**
 * Every ground line is on the pavement behind the foreground curb. The larger
 * figures use the near edge of that same pavement instead of the roadway.
 * Positions and gait time both derive from the recording clock, so seeking is
 * deterministic and shoe stance stays tied to travel distance.
 */
export function getSidewalkPedestrians(time: number, format: Format): Walker[] {
  const layout = SIDEWALK[format];
  const portrait = format === 'portrait';
  const width = layout.width;
  const walkers: Walker[] = [];

  for (let i = 0; i < (portrait ? 5 : 7); i++) {
    const direction = (i % 2 ? 1 : -1) as 1 | -1;
    const speed = (portrait ? 5.3 : 6.2) + (i % 3) * .9;
    const start = width * ((i * .219 + .145) % 1);
    const lane = i % 3 === 0 ? 'middle' : 'back';
    walkers.push({
      x: wrap(start + direction * speed * time, width, 23),
      footY: lane === 'middle' ? layout.middleFootY : layout.backFootY,
      height: portrait ? 29 + (i % 3) * 2 : 25 + (i % 3) * 2,
      direction,
      time,
      speed,
      phase: (i * .173) % 1,
      variant: i % 2 ? 'violet' : 'teal',
      lane,
    });
  }

  // Two closer pedestrians travel the uninterrupted curbside paving. Their
  // umbrellas stay below the shop lyric signs even in the landscape view.
  const closer = [
    {direction: -1 as const, start: .8, speed: portrait ? 10 : 14, height: portrait ? 50 : 44, variant: 'teal' as const, phase: .11, footY: layout.frontFootY},
    {direction: 1 as const, start: .15, speed: portrait ? 8.5 : 11, height: portrait ? 46 : 40, variant: 'violet' as const, phase: .47, footY: layout.middleFootY},
  ];
  for (const person of closer) {
    walkers.push({
      x: wrap(width * person.start + person.direction * person.speed * time, width, 34),
      footY: person.footY,
      height: person.height,
      direction: person.direction,
      time,
      speed: person.speed,
      phase: person.phase,
      variant: person.variant,
      lane: person.footY === layout.frontFootY ? 'front' : 'middle',
    });
  }
  return walkers;
}

export function paintSidewalkPedestrians(
  ctx: CanvasRenderingContext2D,
  atlas: CanvasImageSource,
  time: number,
  format: Format,
): void {
  const walkers = getSidewalkPedestrians(time, format);
  // Farther pedestrians sit behind those nearest the curb.
  for (const lane of ['back', 'middle', 'front'] as const) {
    for (const person of walkers) {
      if (person.lane === lane) paintPedestrian(ctx, atlas, person);
    }
  }
}
