import type { CSSProperties } from 'react';

import { getVisibleRegion } from './regions';
import { getUiCopy, localizeRegion } from './i18n';
import type { RegionBounds } from './types';
import { useGallery } from './GalleryProvider';

type RegionStyle = CSSProperties & Record<`--region-${string}`, string>;

function regionStyle(bounds: RegionBounds): RegionStyle {
  return {
    '--region-x': `${bounds.x * 100}%`,
    '--region-y': `${bounds.y * 100}%`,
    '--region-width': `${bounds.width * 100}%`,
    '--region-height': `${bounds.height * 100}%`,
  };
}

export function RegionOverlay() {
  const { state } = useGallery();
  const focusedRegion = state.focusedRegionId
    ? getVisibleRegion(state, state.focusedRegionId)
    : undefined;

  return (
    <div
      className="region-overlay"
      data-testid="region-overlay"
      aria-hidden="true"
    >
      {focusedRegion ? (
        <span
          className="region-focus-marker"
          style={regionStyle(focusedRegion.bounds)}
          data-region-id={focusedRegion.id}
          data-provenance={focusedRegion.provenance ?? 'authored'}
        />
      ) : null}
      {focusedRegion?.mask ? (
        <span
          className="region-mask"
          data-region-id={focusedRegion.id}
          style={{
            clipPath: `polygon(${Array.from(
              { length: Math.floor(focusedRegion.mask.points.length / 2) },
              (_, index) =>
                `${focusedRegion.mask!.points[index * 2]! * 100}% ${focusedRegion.mask!.points[index * 2 + 1]! * 100}%`,
            ).join(', ')})`,
          }}
        />
      ) : null}
    </div>
  );
}

export function RegionExplorer() {
  const { state, controller } = useGallery();
  const language = state.personalization.language;
  const copy = getUiCopy(language);
  const focusedRegion = state.focusedRegionId
    ? localizeRegion(getVisibleRegion(state, state.focusedRegionId)!, language)
    : undefined;

  if (!focusedRegion) return null;

  return (
    <div className="region-explorer" aria-label={copy.artworkRegions}>
      <div className="region-actions">
        <button
          type="button"
          className="region-action"
          onClick={() => controller.clearRegionFocus()}
        >
          {copy.showWholeArtwork}
        </button>
      </div>
      <p className="region-focus-caption">
        <strong>{focusedRegion.label}.</strong> {focusedRegion.description}
      </p>
    </div>
  );
}
