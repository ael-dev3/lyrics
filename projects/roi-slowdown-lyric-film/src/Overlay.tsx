import {LyricFilm} from './LyricFilm';

export const LyricOverlay = ({showProof = false}: Readonly<{showProof?: boolean}>) => (
  <LyricFilm showProof={showProof} transparentBackground />
);
