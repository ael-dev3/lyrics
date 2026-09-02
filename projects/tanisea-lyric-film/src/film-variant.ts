export const filmVariants = ['square', 'youtube'] as const;

export type FilmVariant = (typeof filmVariants)[number];

export const isYouTubeVariant = (variant: FilmVariant): boolean =>
  variant === 'youtube';
