import { getModeDefinition } from './i18n';
import type {
  Artwork,
  ExperienceMode,
  GalleryLanguage,
  RegionAnalysisState,
} from './types';

interface AccessibilityStatusProps {
  artwork: Artwork;
  mode: ExperienceMode;
  focusedRegionLabel: string | null;
  currentIndex: number;
  collectionSize: number;
  regionAnalysis: RegionAnalysisState;
  availableRegionCount: number;
  language: GalleryLanguage;
}

export function AccessibilityStatus({
  artwork,
  mode,
  focusedRegionLabel,
  currentIndex,
  collectionSize,
  regionAnalysis,
  availableRegionCount,
  language,
}: AccessibilityStatusProps) {
  const modeLabel = getModeDefinition(mode, language).label;
  const analysisMessage =
    language === 'es'
      ? {
          idle: 'Las regiones creadas están listas. El análisis local no se ha iniciado.',
          loading: 'Cargando el análisis visual local.',
          analyzing: 'Analizando la obra localmente.',
          complete: 'El análisis local ha terminado.',
          failed: 'El análisis local no pudo terminar; las regiones creadas siguen disponibles.',
        }[regionAnalysis.phase]
      : language === 'fr'
        ? {
            idle: 'Les régions préparées sont disponibles. L’analyse locale n’a pas été lancée.',
            loading: 'Chargement de l’analyse visuelle locale.',
            analyzing: 'Analyse locale de l’œuvre en cours.',
            complete: 'L’analyse locale est terminée.',
            failed: 'L’analyse locale n’a pas abouti ; les régions préparées restent disponibles.',
          }[regionAnalysis.phase]
        : regionAnalysis.message;
  const message =
    language === 'es'
      ? `Obra ${currentIndex + 1} de ${collectionSize}: ${artwork.title}. Modo: ${modeLabel}. ${focusedRegionLabel ? `Enfoque en ${focusedRegionLabel}.` : 'Mostrando la obra completa.'} ${availableRegionCount} regiones disponibles. ${analysisMessage}`
      : language === 'fr'
        ? `Œuvre ${currentIndex + 1} sur ${collectionSize} : ${artwork.title}. Mode : ${modeLabel}. ${focusedRegionLabel ? `Cadrage sur ${focusedRegionLabel}.` : 'Affichage de l’œuvre entière.'} ${availableRegionCount} régions disponibles. ${analysisMessage}`
        : `Artwork ${currentIndex + 1} of ${collectionSize}: ${artwork.title}. Mode: ${modeLabel}. ${focusedRegionLabel ? `Focused on ${focusedRegionLabel}.` : 'Showing the whole artwork.'} ${availableRegionCount} regions available. ${regionAnalysis.message}`;

  return (
    <p className="gallery-status" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}
