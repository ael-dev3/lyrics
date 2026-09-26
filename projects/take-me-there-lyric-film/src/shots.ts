/** Source-space art direction, sampled every 0.5 s. Dissolve handoffs are
 * approximate visual midpoints, not frame-exact edit detection or vocal times. */
export interface Shot {
  id: string;
  start: number;
  end: number;
  reading: {x: number; y: number; w: number; h: number};
  portraitCenter: number;
  hue: 'ice' | 'rose';
  regions: {kind: 'windows' | 'stars' | 'reflections'; polygon: [number, number][]}[];
  surface?: 'sky' | 'body' | 'wall';
}

type Region = Shot['regions'][number];
const rectangle = (kind: Region['kind'], x: number, y: number, w: number, h: number): Region => ({
  kind, polygon: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]],
});
const stars = (x: number, y: number, w: number, h: number): Region => rectangle('stars', x, y, w, h);
const windows = (x: number, y: number, w: number, h: number): Region => rectangle('windows', x, y, w, h);
const reflection = (x: number, y: number, w: number, h: number): Region => rectangle('reflections', x, y, w, h);

// These are environment exclusion regions, not replacement painted surfaces.
// Inside each polygon only existing bright source pixels may receive response.
// Portrait centers are framing suggestions: landscape reading boxes must be
// recomposed for the cropped view rather than blindly transformed or clipped.
export const SHOTS: Shot[] = [
  {id:'smoker-blue-opening',start:0,end:1.5,reading:{x:.57,y:.31,w:.37,h:.34},portraitCenter:.46,hue:'ice',surface:'sky',regions:[stars(.61,.04,.33,.72)]},
  {id:'smoker-profile-rose',start:1.5,end:5.5,reading:{x:.06,y:.77,w:.70,h:.18},portraitCenter:.47,hue:'rose',regions:[stars(.02,.04,.22,.34),stars(.77,.05,.19,.35)]},
  {id:'car-front-night',start:5.5,end:9.5,reading:{x:.47,y:.04,w:.44,h:.23},portraitCenter:.48,hue:'ice',surface:'sky',regions:[windows(.66,.32,.29,.38),stars(.41,.02,.42,.20)]},
  {id:'car-rear-road',start:9.5,end:12,reading:{x:.08,y:.10,w:.45,h:.24},portraitCenter:.56,hue:'ice',surface:'sky',regions:[windows(.02,.43,.43,.12),reflection(.02,.66,.15,.22)]},
  {id:'car-driver-blue',start:12,end:16.5,reading:{x:.48,y:.34,w:.45,h:.22},portraitCenter:.50,hue:'rose',surface:'sky',regions:[stars(.48,.34,.45,.23)]},
  {id:'rooftop-couple-close',start:16.5,end:21,reading:{x:.10,y:.79,w:.77,h:.17},portraitCenter:.55,hue:'ice',regions:[stars(.01,.04,.17,.26),stars(.84,.04,.13,.27)]},
  {id:'tears-close-one',start:21,end:29.5,reading:{x:.12,y:.035,w:.73,h:.18},portraitCenter:.44,hue:'ice',regions:[stars(.84,.10,.14,.76)]},
  {id:'car-couple-monochrome',start:29.5,end:32,reading:{x:.12,y:.83,w:.77,h:.13},portraitCenter:.50,hue:'ice',surface:'body',regions:[stars(.73,.03,.20,.15)]},
  {id:'road-lightning',start:32,end:36,reading:{x:.56,y:.22,w:.39,h:.26},portraitCenter:.61,hue:'ice',surface:'sky',regions:[windows(.57,.52,.40,.10),reflection(.69,.62,.28,.10)]},
  {id:'couple-smoking-monochrome',start:36,end:40.5,reading:{x:.14,y:.82,w:.72,h:.14},portraitCenter:.50,hue:'ice',regions:[stars(.02,.02,.30,.18),stars(.83,.02,.14,.17)]},
  {id:'neon-car-side',start:40.5,end:43.5,reading:{x:.12,y:.855,w:.76,h:.11},portraitCenter:.34,hue:'rose',surface:'body',regions:[windows(.03,.04,.24,.20),windows(.65,.04,.30,.14)]},
  {id:'rooftop-embrace-gray',start:43.5,end:47.5,reading:{x:.12,y:.055,w:.74,h:.18},portraitCenter:.51,hue:'ice',surface:'sky',regions:[windows(.02,.77,.20,.14),windows(.79,.71,.17,.19)]},
  {id:'smoker-front-stars',start:47.5,end:50.5,reading:{x:.12,y:.825,w:.76,h:.13},portraitCenter:.50,hue:'rose',regions:[stars(.02,.06,.18,.59),stars(.81,.04,.16,.60)]},
  {id:'embrace-rain',start:50.5,end:54,reading:{x:.14,y:.08,w:.73,h:.20},portraitCenter:.54,hue:'ice',surface:'sky',regions:[windows(.01,.79,.18,.14),windows(.82,.79,.16,.14)]},
  {id:'tears-close-two',start:54,end:57.5,reading:{x:.11,y:.045,w:.74,h:.17},portraitCenter:.48,hue:'ice',regions:[stars(.91,.07,.07,.65)]},
  {id:'smoker-blue-return',start:57.5,end:59.5,reading:{x:.59,y:.61,w:.35,h:.22},portraitCenter:.50,hue:'ice',surface:'sky',regions:[stars(.03,.05,.18,.36),stars(.82,.04,.14,.35)]},
  {id:'rooftop-conversation-gray',start:59.5,end:64.5,reading:{x:.13,y:.055,w:.74,h:.18},portraitCenter:.52,hue:'ice',surface:'sky',regions:[stars(.73,.03,.23,.24),windows(.86,.70,.12,.19)]},
  {id:'kiss-city-pullback',start:64.5,end:75.5,reading:{x:.31,y:.07,w:.60,h:.21},portraitCenter:.51,hue:'rose',surface:'sky',regions:[stars(.61,.04,.33,.25),windows(.02,.51,.17,.45),windows(.80,.45,.18,.51)]},
  {id:'water-kiss',start:75.5,end:77.5,reading:{x:.12,y:.055,w:.74,h:.20},portraitCenter:.51,hue:'ice',surface:'sky',regions:[stars(.05,.03,.28,.22),stars(.77,.03,.19,.31),reflection(.10,.87,.78,.11)]},
  {id:'car-entrance',start:77.5,end:86.5,reading:{x:.10,y:.045,w:.75,h:.20},portraitCenter:.54,hue:'ice',surface:'sky',regions:[stars(.13,.015,.72,.15),reflection(.67,.88,.30,.10)]},
  {id:'car-couple-warm',start:86.5,end:93,reading:{x:.13,y:.045,w:.70,h:.18},portraitCenter:.60,hue:'rose',surface:'sky',regions:[stars(.08,.02,.45,.14)]},
  {id:'city-drift-one',start:93,end:100.5,reading:{x:.37,y:.13,w:.36,h:.30},portraitCenter:.53,hue:'ice',surface:'sky',regions:[windows(.025,.03,.29,.57),windows(.79,.035,.18,.62),reflection(.12,.88,.77,.10)]},
  {id:'couple-city-back',start:100.5,end:108.5,reading:{x:.15,y:.055,w:.71,h:.19},portraitCenter:.50,hue:'ice',surface:'sky',regions:[stars(.03,.015,.27,.24),stars(.77,.02,.20,.26),windows(.02,.61,.18,.18),windows(.81,.57,.17,.22)]},
  {id:'city-drift-two',start:108.5,end:115.5,reading:{x:.39,y:.10,w:.42,h:.29},portraitCenter:.54,hue:'ice',surface:'sky',regions:[windows(.025,.03,.27,.59),windows(.80,.025,.18,.62),reflection(.13,.89,.76,.09)]},
  {id:'kiss-close',start:115.5,end:119.5,reading:{x:.11,y:.805,w:.77,h:.15},portraitCenter:.53,hue:'rose',regions:[windows(.01,.06,.10,.40)]},
  {id:'car-night-return',start:119.5,end:122,reading:{x:.16,y:.07,w:.69,h:.21},portraitCenter:.53,hue:'ice',surface:'wall',regions:[windows(.015,.04,.27,.49),windows(.78,.05,.20,.53),reflection(.14,.88,.75,.10)]},
  {id:'rooftop-before-fireworks',start:122,end:126,reading:{x:.15,y:.05,w:.70,h:.23},portraitCenter:.51,hue:'rose',surface:'sky',regions:[stars(.08,.02,.73,.17),windows(.01,.64,.13,.20),windows(.85,.60,.13,.22)]},
  {id:'fireworks-city-ending',start:126,end:134.93115646258502,reading:{x:.13,y:.79,w:.74,h:.16},portraitCenter:.52,hue:'rose',regions:[windows(.04,.66,.24,.31),windows(.79,.66,.19,.31)]},
];
