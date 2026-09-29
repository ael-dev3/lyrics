import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';

// Delivery names shared by the packager and the release step.
export const FILMS = [
  ['landscape', 'Let-You-Down-YouTube-1920x1080-60fps.mp4'],
  ['portrait', 'Let-You-Down-TikTok-1080x1920-60fps.mp4'],
] as const;
export const KIT_NAME = 'Let You Down - Lyric Film';
export const RELEASE = {tag: 'let-you-down-v1.0.0', repo: 'ael-dev3/lyrics', title: 'Dawid Podsiadło — Let You Down · lyric film v1.0.0'} as const;

/** The desktop the owner actually sees: Windows may redirect it (OneDrive, localized names). */
export function desktopDir(): string {
  if (process.platform === 'win32') {
    try {
      const out = execFileSync('powershell.exe', ['-NoProfile', '-Command', "[Console]::OutputEncoding=[Text.Encoding]::UTF8; [Environment]::GetFolderPath('Desktop')"], {encoding: 'utf8'}).trim();
      if (out && existsSync(out)) return out;
    } catch {/* fall back below */}
  }
  return join(homedir(), 'Desktop');
}
export const kitDir = (): string => join(desktopDir(), KIT_NAME);
