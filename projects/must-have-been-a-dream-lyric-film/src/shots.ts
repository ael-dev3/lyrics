/**
 * Shot-aware cover crops for the source's 1920×672 active picture (the MP4
 * stores it at source y=204..876 inside 1920×1080). All positions are source
 * x coordinates; all times are original-video media seconds.
 *
 * A 16:9 cover uses about 1195 source pixels of width; a 9:16 cover uses
 * about 378. Short intervals around hard cuts keep the performer in frame
 * without continuously chasing him within a shot. Lyric zones describe open
 * picture space, never the encoded black mattes.
 */
export type LyricZone = 'left' | 'right' | 'upper' | 'lower' | 'center';

export type Shot = {
  id: string;
  start: number;
  end: number;
  landscapeCenter: number;
  portraitCenter: number;
  lyricZone?: LyricZone;
  /** Maximum lyric block width in 1920px landscape composition space. */
  lyricMaxWidth?: number;
  portraitLyricZone?: 'upper' | 'lower';
  mood: 'street' | 'transit' | 'stage' | 'day' | 'memory' | 'black';
  /** Original title or credit text is authored into this picture. */
  protectSourceText?: boolean;
};

export const SHOTS: readonly Shot[] = [
  {id:'opening-lamps',start:0,end:8.9,landscapeCenter:960,portraitCenter:1080,lyricZone:'lower',mood:'street'},
  {id:'blue-sleep',start:8.9,end:19.5,landscapeCenter:960,portraitCenter:1020,lyricZone:'lower',mood:'memory'},
  {id:'first-stage-crowd',start:19.5,end:23.4,landscapeCenter:1110,portraitCenter:400,lyricZone:'left',mood:'stage'},
  {id:'city-hood',start:23.4,end:27.5,landscapeCenter:930,portraitCenter:840,lyricZone:'right',mood:'street'},
  {id:'gray-alley-intro',start:27.5,end:31.3,landscapeCenter:920,portraitCenter:760,lyricZone:'right',mood:'day'},
  {id:'underpass-walk-intro',start:31.3,end:33.7,landscapeCenter:960,portraitCenter:960,lyricZone:'right',mood:'street'},
  {id:'stage-floor-intro',start:33.7,end:35.2,landscapeCenter:960,portraitCenter:960,lyricZone:'upper',mood:'stage'},
  {id:'backlit-road-intro',start:35.2,end:41.8,landscapeCenter:900,portraitCenter:960,lyricZone:'right',mood:'street'},
  {id:'pre-title-flash',start:41.8,end:43.35,landscapeCenter:960,portraitCenter:960,lyricZone:'center',mood:'black'},

  // First sung line begins over the original artist title, then the gray alley.
  {id:'artist-title-left',start:43.35,end:44.45,landscapeCenter:960,portraitCenter:800,lyricZone:'lower',mood:'day',protectSourceText:true},
  {id:'artist-title-center',start:44.45,end:44.8,landscapeCenter:960,portraitCenter:960,lyricZone:'lower',mood:'day',protectSourceText:true},
  {id:'gray-alley-credit-close',start:44.8,end:46,landscapeCenter:940,portraitCenter:1000,lyricZone:'right',mood:'day',protectSourceText:true},
  {id:'gray-alley-verse-far',start:46,end:47.35,landscapeCenter:940,portraitCenter:760,lyricZone:'right',mood:'day'},
  {id:'gray-alley-verse-near',start:47.35,end:49.9,landscapeCenter:880,portraitCenter:550,lyricZone:'right',mood:'day'},
  {id:'boarding-bus',start:49.9,end:51.8,landscapeCenter:1050,portraitCenter:900,lyricZone:'right',mood:'transit'},
  {id:'bus-seat-right',start:51.8,end:53.25,landscapeCenter:1120,portraitCenter:1050,lyricZone:'left',mood:'transit'},
  {id:'bus-glass-left',start:53.25,end:59.75,landscapeCenter:750,portraitCenter:650,lyricZone:'right',mood:'transit'},
  {id:'blue-face-macro-one',start:59.75,end:61.55,landscapeCenter:960,portraitCenter:960,lyricZone:'lower',mood:'memory'},
  {id:'post-office-close-one',start:61.55,end:63.5,landscapeCenter:850,portraitCenter:900,lyricZone:'right',mood:'street'},
  {id:'post-office-wide',start:63.5,end:67.4,landscapeCenter:800,portraitCenter:1010,lyricZone:'left',mood:'street'},
  {id:'glitch-brick',start:67.4,end:69.35,landscapeCenter:1080,portraitCenter:740,lyricZone:'right',mood:'street'},
  {id:'post-office-close-two-a',start:69.35,end:71.35,landscapeCenter:740,portraitCenter:900,lyricZone:'left',mood:'street'},
  {id:'post-office-close-two-b',start:71.35,end:73.45,landscapeCenter:740,portraitCenter:1000,lyricZone:'left',mood:'street'},
  {id:'red-bed',start:73.45,end:75.25,landscapeCenter:960,portraitCenter:960,lyricZone:'upper',mood:'memory'},
  {id:'blue-stage-first',start:75.25,end:79.55,landscapeCenter:770,portraitCenter:1010,lyricZone:'left',mood:'stage'},

  // The underpass footage changes scale and performer position on hard cuts.
  {id:'underpass-chorus-left',start:79.55,end:81.45,landscapeCenter:760,portraitCenter:1040,lyricZone:'left',mood:'street'},
  {id:'underpass-chorus-pan-right',start:81.45,end:82.16,landscapeCenter:760,portraitCenter:850,lyricZone:'left',lyricMaxWidth:820,portraitLyricZone:'upper',mood:'street'},
  {id:'underpass-chorus-pan-left',start:82.16,end:82.76,landscapeCenter:760,portraitCenter:540,lyricZone:'left',lyricMaxWidth:820,portraitLyricZone:'upper',mood:'street'},
  {id:'underpass-chorus-pan-return',start:82.76,end:83.45,landscapeCenter:760,portraitCenter:820,lyricZone:'left',lyricMaxWidth:820,portraitLyricZone:'upper',mood:'street'},
  {id:'underpass-chorus-near',start:83.45,end:85.35,landscapeCenter:800,portraitCenter:910,lyricZone:'left',mood:'street'},
  {id:'underpass-chorus-wide',start:85.35,end:87.35,landscapeCenter:750,portraitCenter:750,lyricZone:'right',mood:'street'},
  {id:'station-glitch',start:87.35,end:89.45,landscapeCenter:1050,portraitCenter:970,lyricZone:'left',mood:'street'},
  {id:'night-station',start:89.45,end:91.45,landscapeCenter:1120,portraitCenter:1200,lyricZone:'left',mood:'street'},
  {id:'hood-face-night',start:91.45,end:93.2,landscapeCenter:1160,portraitCenter:750,lyricZone:'right',mood:'street'},
  {id:'blue-stage-verse-wide',start:93.2,end:95.3,landscapeCenter:1100,portraitCenter:1350,lyricZone:'left',mood:'stage'},
  {id:'blue-stage-verse-close',start:95.3,end:99.35,landscapeCenter:850,portraitCenter:1100,lyricZone:'left',mood:'stage'},
  {id:'gray-alley-verse-two-far',start:99.35,end:101.35,landscapeCenter:1030,portraitCenter:1230,lyricZone:'left',mood:'day'},
  {id:'gray-alley-verse-two-near',start:101.35,end:105.2,landscapeCenter:1030,portraitCenter:1150,lyricZone:'left',mood:'day'},
  {id:'post-office-night-two',start:105.2,end:109.7,landscapeCenter:740,portraitCenter:780,lyricZone:'right',mood:'street'},
  {id:'face-glitch-macro',start:109.7,end:113.35,landscapeCenter:960,portraitCenter:960,lyricZone:'lower',mood:'memory'},
  {id:'tilted-underpass',start:113.35,end:122.25,landscapeCenter:1200,portraitCenter:1430,lyricZone:'left',mood:'street'},
  {id:'underpass-glitch-cut',start:122.25,end:124.15,landscapeCenter:830,portraitCenter:650,lyricZone:'right',mood:'street'},
  {id:'stage-glass-cut',start:124.15,end:127.3,landscapeCenter:850,portraitCenter:720,lyricZone:'right',mood:'stage'},
  {id:'nested-memory',start:127.3,end:133,landscapeCenter:960,portraitCenter:960,lyricZone:'lower',mood:'memory'},
  {id:'gray-alley-return',start:133,end:135.45,landscapeCenter:1100,portraitCenter:950,lyricZone:'right',mood:'day'},
  {id:'blue-face-glasses',start:135.45,end:139.25,landscapeCenter:780,portraitCenter:980,lyricZone:'lower',mood:'memory'},
  {id:'bus-standing',start:139.25,end:141.25,landscapeCenter:1120,portraitCenter:1250,lyricZone:'left',mood:'transit'},
  {id:'underpass-close',start:141.25,end:143.15,landscapeCenter:750,portraitCenter:850,lyricZone:'right',mood:'street'},
  {id:'underpass-last-chorus',start:143.15,end:151.25,landscapeCenter:750,portraitCenter:980,lyricZone:'left',mood:'street'},
  {id:'ghost-black-bridge',start:151.25,end:156.4,landscapeCenter:850,portraitCenter:780,lyricZone:'right',mood:'black'},
  {id:'blue-face-final',start:156.4,end:161.35,landscapeCenter:1000,portraitCenter:1210,lyricZone:'left',mood:'memory'},

  // Instrumental continuation keeps the moving source visible; no new lyrics.
  {id:'underpass-double-exposure',start:161.35,end:166.9,landscapeCenter:960,portraitCenter:960,mood:'street'},
  {id:'stage-floor-return',start:166.9,end:167.55,landscapeCenter:870,portraitCenter:960,mood:'stage'},
  {id:'song-title-flash',start:167.55,end:168.8,landscapeCenter:960,portraitCenter:960,mood:'stage',protectSourceText:true},
  {id:'overhead-run',start:168.8,end:174.4,landscapeCenter:960,portraitCenter:990,mood:'day'},
  {id:'stage-bus-montage',start:174.4,end:187.3,landscapeCenter:940,portraitCenter:990,mood:'stage'},
  {id:'late-bus',start:187.3,end:189.5,landscapeCenter:1050,portraitCenter:990,mood:'transit'},
  {id:'concert-final',start:189.5,end:199.6,landscapeCenter:930,portraitCenter:970,mood:'stage'},
  {id:'face-monitor-glitch',start:199.6,end:205.8,landscapeCenter:960,portraitCenter:960,mood:'memory'},
  {id:'late-underpass',start:205.8,end:211.6,landscapeCenter:910,portraitCenter:960,mood:'street'},
  {id:'late-glitch-woods',start:211.6,end:220.5,landscapeCenter:960,portraitCenter:960,mood:'memory'},
  {id:'post-office-final',start:220.5,end:225.3,landscapeCenter:830,portraitCenter:1000,mood:'street'},
  {id:'final-stage',start:225.3,end:234.9,landscapeCenter:900,portraitCenter:960,mood:'stage'},
  {id:'source-credit-cards',start:234.9,end:244.55,landscapeCenter:960,portraitCenter:960,mood:'black',protectSourceText:true},
  {id:'daylight-source-credits',start:244.55,end:257,landscapeCenter:960,portraitCenter:940,mood:'day',protectSourceText:true},
];

export function shotAt(time: number): Shot {
  if (!Number.isFinite(time) || time <= 0) return SHOTS[0]!;
  if (time >= SHOTS[SHOTS.length - 1]!.end) return SHOTS[SHOTS.length - 1]!;
  return SHOTS.find(shot => time >= shot.start && time < shot.end) ?? SHOTS[0]!;
}
