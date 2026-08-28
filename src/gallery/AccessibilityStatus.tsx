import { modeDefinitions } from './modes';
import type { Artwork, ExperienceMode, RegionId } from './types';

interface AccessibilityStatusProps {
  artwork: Artwork;
  mode: ExperienceMode;
  focusedRegionId: RegionId | null;
  currentIndex: number;
  collectionSize: number;
}

export function AccessibilityStatus({
  artwork,
  mode,
  focusedRegionId,
  currentIndex,
  collectionSize,
}: AccessibilityStatusProps) {
  const focusedRegion = focusedRegionId
    ? artwork.regions.find(({ id }) => id === focusedRegionId)
    : undefined;
  const focusLabel = focusedRegion
    ? `Focused on ${focusedRegion.label}.`
    : 'Showing the whole artwork.';

  return (
    <p className="gallery-status" role="status" aria-live="polite" aria-atomic="true">
      Artwork {currentIndex + 1} of {collectionSize}: {artwork.title}. Mode:{' '}
      {modeDefinitions[mode].label}. {focusLabel}
    </p>
  );
}
