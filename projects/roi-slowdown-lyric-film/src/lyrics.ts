import {
  SAMPLE_RATE,
  SOURCE_DURATION_SECONDS,
  sampleForSeconds,
} from './timing';
import type {
  DualSongAlignment,
  LyricLine,
  LyricWord,
  SongAlignment,
  SongId,
} from './timing';

type DraftLine = Readonly<{
  start: number;
  end: number;
  text: string;
  section: string;
  evidence: string;
  confidence?: 'high' | 'medium' | 'low';
}>;

const wordize = (songId: SongId, lineId: string, draft: DraftLine): readonly LyricWord[] => {
  const words = draft.text.trim().split(/\s+/).filter(Boolean);
  const totalWeight = words.reduce((sum, word) => sum + Math.max(1, word.replace(/[^\p{L}\p{N}]/gu, '').length), 0);
  const start = sampleForSeconds(draft.start);
  const end = sampleForSeconds(draft.end);
  const usable = Math.max(1, end - start);
  let cursor = start;
  return words.map((word, index) => {
    const remainingWords = words.length - index;
    const weight = Math.max(1, word.replace(/[^\p{L}\p{N}]/gu, '').length);
    const nominal = Math.round((usable * weight) / totalWeight);
    const wordStart = cursor;
    const wordEnd = index === words.length - 1
      ? end
      : Math.min(end - (remainingWords - 1), cursor + Math.max(1, nominal));
    cursor = wordEnd;
    return {
      id: `${songId}-${lineId}-W${String(index + 1).padStart(2, '0')}`,
      text: word,
      startSample: wordStart,
      endSample: wordEnd,
    };
  });
};

const makeLines = (songId: SongId, drafts: readonly DraftLine[]): readonly LyricLine[] =>
  drafts.map((draft, index) => {
    const id = `${songId === 'song-1' ? 'S1' : 'S2'}-${String(index + 1).padStart(2, '0')}`;
    return {
      id,
      songId,
      songLabel: songId === 'song-1' ? 'SONG 1 · ROI' : 'SONG 2 · SLOW DOWN',
      section: draft.section,
      text: draft.text,
      startSample: sampleForSeconds(draft.start),
      endSample: sampleForSeconds(draft.end),
      words: wordize(songId, id, draft),
      evidence: draft.evidence,
      confidence: draft.confidence ?? 'medium',
    };
  });

const song1Drafts: readonly DraftLine[] = [
  {start: 26.4, end: 29.9, text: "T'en trouveras d'autres des mecs comme moi", section: 'INTRO', evidence: 'manual lyric placement; low vocal separation', confidence: 'low'},
  {start: 29.9, end: 33.3, text: "Y'en aura plein des gars pour toi", section: 'INTRO', evidence: 'manual lyric placement; low vocal separation', confidence: 'low'},
  {start: 33.3, end: 37.3, text: 'Tes boucles brunes s’évaporent', section: 'INTRO', evidence: 'manual lyric placement; low vocal separation', confidence: 'low'},
  {start: 37.3, end: 41.8, text: 'Dans mon âme, dans mon corps', section: 'INTRO', evidence: 'manual lyric placement; low vocal separation', confidence: 'low'},
  {start: 42.28, end: 44.62, text: 'Je te cherche dans mes songes, je te traque dans mes rêves', section: 'COUPLET 1', evidence: 'whisper-fr segment 42.28–46.98; waveform boundary review', confidence: 'high'},
  {start: 44.62, end: 46.98, text: 'À l’aube ou dans mon ombre, errant vaine sur tes lèvres', section: 'COUPLET 1', evidence: 'whisper-fr segment 42.28–46.98; waveform boundary review', confidence: 'high'},
  {start: 46.98, end: 49.20, text: 'Écorchant les abîmes de mon cœur écarlate', section: 'COUPLET 1', evidence: 'whisper-fr segment 46.98–51.24; waveform boundary review', confidence: 'high'},
  {start: 49.20, end: 51.24, text: "Tu n'es que le point fixe de mes songes disparates", section: 'COUPLET 1', evidence: 'whisper-fr segment 46.98–51.24; waveform boundary review', confidence: 'high'},
  {start: 51.24, end: 53.32, text: "Aime-moi dans la neige, aime-moi sous l'soleil", section: 'COUPLET 1', evidence: 'whisper-fr segment 51.24–55.30; word-weight split', confidence: 'high'},
  {start: 53.32, end: 55.30, text: 'Aime-moi la peau beige dans les fleurs de vermeille', section: 'COUPLET 1', evidence: 'whisper-fr segment 51.24–55.30; word-weight split', confidence: 'high'},
  {start: 55.30, end: 57.50, text: "J'vois des gens qui courent nus, j'vois des gens qui m'sourient", section: 'COUPLET 1', evidence: 'whisper-fr segment 55.30–57.50', confidence: 'high'},
  {start: 57.50, end: 59.74, text: "Mais moi j'plane dans la rue, dans tes yeux, sous la pluie", section: 'COUPLET 1', evidence: 'whisper-fr segment 57.50–59.74', confidence: 'high'},
  {start: 59.98, end: 61.86, text: 'Et je reste l’esprit de tes lointains souvenirs', section: 'COUPLET 1', evidence: 'whisper-fr segment 59.98–61.86', confidence: 'high'},
  {start: 61.86, end: 63.84, text: 'Dans mes songes ensevelis, tes larmes, tes rires', section: 'COUPLET 1', evidence: 'whisper-fr segment 61.86–63.84', confidence: 'high'},
  {start: 63.84, end: 66.26, text: 'Tu es ma femme iconique, tu es mon rubis saphir', section: 'COUPLET 1', evidence: 'whisper-fr segment 63.84–66.26', confidence: 'high'},
  {start: 66.26, end: 68.64, text: 'Je suis ta rose lyrique, je suis ces gens qui t’admirent', section: 'COUPLET 1', evidence: 'whisper-fr segment 66.26–68.64', confidence: 'high'},
  {start: 68.64, end: 72.08, text: 'Aime-moi dans la neige, aime-moi sous le soleil', section: 'REFRAIN', evidence: 'whisper-fr segment 68.64–71.98', confidence: 'high'},
  {start: 72.08, end: 76.92, text: 'Aime-moi la peau beige dans les fleurs de vermeille', section: 'REFRAIN', evidence: 'whisper-fr segments 72.08–77.14; waveform boundary review', confidence: 'high'},
  {start: 76.92, end: 81.04, text: 'Aime-moi dans la neige, aime-moi sous le soleil', section: 'REFRAIN', evidence: 'whisper-fr segment 76.92–81.04', confidence: 'high'},
  {start: 81.04, end: 86.60, text: 'Aime-moi la peau beige dans les fleurs de vermeille', section: 'REFRAIN', evidence: 'whisper-fr segment 81.04–86.14; transition hold to Song 2', confidence: 'high'},
  {start: 145.40, end: 146.72, text: 'Des jours durant', section: 'COUPLET 2', evidence: 'whisper-fr lead-in at 145.40; manual onset review', confidence: 'medium'},
  {start: 146.72, end: 148.60, text: "Fuyant la nuit, j'parcours ta peau", section: 'COUPLET 2', evidence: 'whisper-fr segment 146.72–148.60', confidence: 'high'},
  {start: 148.60, end: 149.52, text: "J'parcours la ville", section: 'COUPLET 2', evidence: 'whisper-fr segment 148.60–149.52', confidence: 'high'},
  {start: 149.52, end: 152.02, text: "La fumée suave de ta bouche, file, s'échappe de jours en jours", section: 'COUPLET 2', evidence: 'whisper-fr segments 149.52–152.02', confidence: 'high'},
  {start: 152.02, end: 154.22, text: 'Quand je ride dans la nuit, je suis seule sous mes vices', section: 'COUPLET 2', evidence: 'whisper-fr segments 152.02–154.22', confidence: 'high'},
  {start: 154.22, end: 156.60, text: "Je t'aime quand il pleut tu es la nymphe de mes vœux", section: 'COUPLET 2', evidence: 'whisper-fr segments 154.22–156.60', confidence: 'high'},
  {start: 156.60, end: 158.76, text: "Je t'embrasse dans mes rêves et je t'aime au bout des lèvres", section: 'COUPLET 2', evidence: 'whisper-fr segments 156.60–158.76', confidence: 'high'},
  {start: 158.76, end: 160.94, text: 'Je déteste le gout mièvre de leurs bouches, de leurs rêves', section: 'COUPLET 2', evidence: 'whisper-fr segments 158.76–160.94', confidence: 'high'},
  {start: 160.94, end: 163.10, text: 'Dans la nuit tu me regardes, sous les nuages je divague', section: 'COUPLET 2', evidence: 'whisper-fr segments 160.94–163.10', confidence: 'high'},
  {start: 163.10, end: 164.10, text: 'Avec toi je suis roi', section: 'PRÉ-REFRAIN', evidence: 'whisper-fr onset sequence 163.10–167.00', confidence: 'high'},
  {start: 164.10, end: 165.10, text: 'Toi je suis roi', section: 'PRÉ-REFRAIN', evidence: 'whisper-fr onset sequence 163.10–167.00', confidence: 'high'},
  {start: 165.10, end: 166.10, text: 'Toi je suis roi', section: 'PRÉ-REFRAIN', evidence: 'whisper-fr onset sequence 163.10–167.00', confidence: 'high'},
  {start: 166.10, end: 167.35, text: 'Toi je suis roi', section: 'PRÉ-REFRAIN', evidence: 'whisper-fr onset sequence 163.10–167.00', confidence: 'high'},
  {start: 169.86, end: 174.90, text: 'Toi je suis roi', section: 'PRÉ-REFRAIN', evidence: 'whisper-fr held vocal at 169.86–175.12', confidence: 'medium'},
  {start: 222.36, end: 224.58, text: "J'suis un garçon de la nuit, moi je laisse tomber les filles", section: 'COUPLET 3', evidence: 'whisper-fr segment 222.36–224.58', confidence: 'high'},
  {start: 224.58, end: 226.66, text: "Je n'aime que tes bas résilles qui dans mes pensées grésillent", section: 'COUPLET 3', evidence: 'whisper-fr segment 224.58–226.66', confidence: 'high'},
  {start: 231.16, end: 233.10, text: "J'suis un garçon de la nuit, moi je laisse tomber les filles", section: 'COUPLET 3', evidence: 'whisper-fr segment 231.16–233.10', confidence: 'high'},
  {start: 233.10, end: 235.28, text: "Je n'aime que tes bas résilles qui dans mes pensées grésillent", section: 'COUPLET 3', evidence: 'whisper-fr segment 233.10–235.28', confidence: 'high'},
  {start: 239.46, end: 241.70, text: "J'suis un garçon de la nuit, moi je laisse tomber les filles", section: 'COUPLET 3 · REPEAT', evidence: 'whisper-fr segment 239.46–241.70; repeated audible take', confidence: 'medium'},
  {start: 241.70, end: 243.78, text: "Je n'aime que tes bas résilles qui dans mes pensées grésillent", section: 'COUPLET 3 · REPEAT', evidence: 'whisper-fr segment 241.70–243.78; repeated audible take', confidence: 'medium'},
  {start: 248.16, end: 252.68, text: 'Aime-moi dans la neige, aime-moi sous le soleil', section: 'REFRAIN', evidence: 'whisper-fr segment 248.16–252.68', confidence: 'high'},
  {start: 252.68, end: 256.64, text: 'Aime-moi la peau beige dans les fleurs de vermeille', section: 'REFRAIN', evidence: 'whisper-fr segment 252.68–256.64', confidence: 'high'},
  {start: 256.64, end: 261.10, text: 'Aime-moi dans la neige, aime-moi sous le soleil', section: 'REFRAIN', evidence: 'whisper-fr segment 256.64–261.10', confidence: 'high'},
  {start: 261.10, end: 265.22, text: 'Aime-moi la peau beige dans les fleurs de vermeille', section: 'REFRAIN', evidence: 'whisper-fr segment 261.10–265.22', confidence: 'high'},
  {start: 338.14, end: 342.26, text: 'Aime-moi dans la neige, aime-moi sous le soleil', section: 'FINAL REFRAIN', evidence: 'late French vocal cluster; waveform review', confidence: 'medium'},
  {start: 342.26, end: 346.38, text: 'Aime-moi la peau beige dans les fleurs de vermeille', section: 'FINAL REFRAIN', evidence: 'late French vocal cluster; waveform review', confidence: 'medium'},
  {start: 346.38, end: 350.28, text: 'Aime-moi dans la neige, aime-moi sous le soleil', section: 'FINAL REFRAIN', evidence: 'late French vocal cluster; waveform review', confidence: 'medium'},
  {start: 350.28, end: 354.94, text: 'Aime-moi la peau beige dans les fleurs de vermeille', section: 'FINAL REFRAIN', evidence: 'late French vocal cluster; waveform review', confidence: 'medium'},
];

const song2Drafts: readonly DraftLine[] = [
  {start: 8.90, end: 12.46, text: 'Slow down, slow down to the feeling', section: 'OPENING', evidence: 'whisper-en word timestamps 8.90–12.46', confidence: 'high'},
  {start: 13.00, end: 17.28, text: 'Wait up, wait there if you see me', section: 'OPENING', evidence: 'whisper-en segment 13.00–17.28; lyric correction from supplied text', confidence: 'high'},
  {start: 17.28, end: 22.94, text: 'Come back, come back to the moment, the moment', section: 'OPENING', evidence: 'whisper-en segments 17.28–22.94', confidence: 'high'},
  {start: 22.94, end: 25.74, text: 'Did I tell you that I miss you?', section: 'OPENING', evidence: 'whisper-en segment 22.94–25.74; supplied lyric', confidence: 'high'},
  {start: 26.10, end: 28.90, text: 'Did I tell you that I miss you?', section: 'OPENING · REPEAT', evidence: 'manual repeated-vocal hold after first detected line', confidence: 'medium'},
  {start: 86.14, end: 89.40, text: 'Hold on, hold on, we could stay here', section: 'SECOND PASS', evidence: 'whisper-en segment 86.14–89.40', confidence: 'high'},
  {start: 90.26, end: 94.30, text: 'Once more, once lost, it was so clear', section: 'SECOND PASS', evidence: 'whisper-en segment 90.26–94.30', confidence: 'high'},
  {start: 94.30, end: 98.18, text: "I'm here, I'm yours for a moment, a moment", section: 'SECOND PASS', evidence: 'whisper-en segment 94.30–98.18', confidence: 'high'},
  {start: 100.00, end: 102.70, text: 'Did I tell you that I miss you?', section: 'SECOND PASS', evidence: 'whisper-en segment 100.00–102.70', confidence: 'high'},
  {start: 108.56, end: 111.44, text: 'Did I tell you that I miss you?', section: 'SECOND PASS · REPEAT', evidence: 'whisper-en segment 108.56–111.44', confidence: 'high'},
  {start: 117.12, end: 119.82, text: 'Did I tell you that I miss you?', section: 'SECOND PASS · REPEAT', evidence: 'whisper-en segment 117.12–119.82', confidence: 'medium'},
  {start: 330.82, end: 333.96, text: 'Did I tell you that I miss you?', section: 'FINAL PASS', evidence: 'whisper-en segment 330.82–333.96', confidence: 'high'},
  {start: 335.08, end: 337.62, text: 'Did I tell you that I miss you?', section: 'FINAL PASS · REPEAT', evidence: 'whisper-en segments 335.08–337.62', confidence: 'high'},
];

const song1: SongAlignment = {id: 'song-1', label: 'SONG 1', title: 'Roi', lines: makeLines('song-1', song1Drafts)};
const song2: SongAlignment = {id: 'song-2', label: 'SONG 2', title: 'Slow down / Did I tell you that I miss you?', lines: makeLines('song-2', song2Drafts)};

export const dualSongAlignment: DualSongAlignment = {
  schemaVersion: 1,
  sourceId: '11tjwUK2adU',
  sourceSha256: 'CB8658716776221A962D04DDE90E0E5A9CB55F230547B25469A0BA35F38B66D7',
  sampleRate: SAMPLE_RATE,
  fps: 60,
  durationSeconds: SOURCE_DURATION_SECONDS,
  songs: [song1, song2],
};

export const getActiveLines = (seconds: number): {song1: readonly LyricLine[]; song2: readonly LyricLine[]} => ({
  song1: song1.lines.filter((line) => seconds >= line.startSample / SAMPLE_RATE && seconds < line.endSample / SAMPLE_RATE),
  song2: song2.lines.filter((line) => seconds >= line.startSample / SAMPLE_RATE && seconds < line.endSample / SAMPLE_RATE),
});
