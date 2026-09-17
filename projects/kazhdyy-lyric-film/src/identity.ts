export const identityPaths=[
 'public/soundtrack.m4a','public/review-source.mp4','public/artwork.png',
 'public/Oswald-Medium.ttf','public/Oswald-Bold.ttf','public/science.json',
 'source/text-and-mapping.json','source/supplied-lyrics.txt',
 'src/cues.json','src/layout.json','src/scene.ts','src/focus.ts','src/palette.ts',
 'public/motion.json','src/motion.ts','src/preview-painter.ts','src/schema.ts','src/review-client.ts','review/index.html',
 'package.json','package-lock.json',
] as const;
export type PreviewIdentity={song:string;revision:string;hashes:Record<string,string>};
