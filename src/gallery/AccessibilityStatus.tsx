import { modeDefinitions } from './modes';
import type {
  Artwork,
  ExperienceMode,
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
}

export function AccessibilityStatus({
  artwork,
  mode,
  focusedRegionLabel,
  currentIndex,
  collectionSize,
  regionAnalysis,
  availableRegionCount,
}: AccessibilityStatusProps) {
  const focusLabel = focusedRegionLabel
    ? `Focused on ${focusedRegionLabel}.`
    : 'Showing the whole artwork.';

  return (
    <p className="gallery-status" role="status" aria-live="polite" aria-atomic="true">
      Artwork {currentIndex + 1} of {collectionSize}: {artwork.title}. Mode:{' '}
      {modeDefinitions[mode].label}. {focusLabel}
      {' '}{availableRegionCount} regions available. {regionAnalysis.message}
    </p>
  );
}
