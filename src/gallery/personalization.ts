import type {
  ColorTheme,
  ContrastLevel,
  FontFamily,
  FontSize,
  GalleryLanguage,
  PersonalizationPreferences,
} from './types';

export const fontFamilies = [
  'atkinson',
  'sans',
  'serif',
  'mono',
] as const satisfies readonly FontFamily[];

export const fontSizes = [
  'small',
  'medium',
  'large',
  'extra-large',
] as const satisfies readonly FontSize[];

export const contrastLevels = [
  'soft',
  'standard',
  'high',
] as const satisfies readonly ContrastLevel[];

export const colorThemes = [
  'light',
  'dark',
] as const satisfies readonly ColorTheme[];

export const galleryLanguages = [
  'en',
  'es',
  'fr',
] as const satisfies readonly GalleryLanguage[];

export const defaultPersonalization: PersonalizationPreferences = {
  fontFamily: 'atkinson',
  fontSize: 'medium',
  contrast: 'standard',
  theme: 'dark',
  language: 'en',
};

function includes<const T extends readonly string[]>(
  choices: T,
  value: string,
): value is T[number] {
  return choices.some((choice) => choice === value);
}

export function isFontFamily(value: string): value is FontFamily {
  return includes(fontFamilies, value);
}

export function isFontSize(value: string): value is FontSize {
  return includes(fontSizes, value);
}

export function isContrastLevel(value: string): value is ContrastLevel {
  return includes(contrastLevels, value);
}

export function isColorTheme(value: string): value is ColorTheme {
  return includes(colorThemes, value);
}

export function isGalleryLanguage(value: string): value is GalleryLanguage {
  return includes(galleryLanguages, value);
}
