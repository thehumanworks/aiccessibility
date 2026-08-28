import type { CSSProperties } from 'react';

import { getCurrentRegionAnalysis, getVisibleRegions } from './regions';
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
  const { state, controller } = useGallery();
  const regions = getVisibleRegions(state);

  return (
    <div className="region-overlay" data-testid="region-overlay">
      {regions.map((region) => {
        const focused = state.focusedRegionId === region.id;
        return (
          <button
            key={region.id}
            type="button"
            className="region-hotspot"
            style={regionStyle(region.bounds)}
            data-region-id={region.id}
            data-provenance={region.provenance ?? 'authored'}
            aria-pressed={focused}
            aria-label={`Focus region: ${region.label}`}
            title={region.label}
            onClick={() => controller.focusRegion(region.id)}
          >
            <span className="region-hotspot-label">{region.label}</span>
          </button>
        );
      })}
      {regions.map((region) =>
        region.mask ? (
          <span
            key={`${region.id}-mask`}
            className="region-mask"
            aria-hidden="true"
            data-region-id={region.id}
            style={{
              clipPath: `polygon(${Array.from(
                { length: Math.floor(region.mask.points.length / 2) },
                (_, index) =>
                  `${region.mask!.points[index * 2]! * 100}% ${region.mask!.points[index * 2 + 1]! * 100}%`,
              ).join(', ')})`,
            }}
          />
        ) : null,
      )}
    </div>
  );
}

export function RegionExplorer() {
  const { state, controller } = useGallery();
  const analysis = getCurrentRegionAnalysis(state);
  const regions = getVisibleRegions(state);
  const focusedRegion = regions.find(({ id }) => id === state.focusedRegionId);
  const busy = analysis.phase === 'loading' || analysis.phase === 'analyzing';

  return (
    <div className="region-explorer" aria-label="Artwork regions">
      <div className="region-actions">
        <button
          type="button"
          className="region-action"
          disabled={busy}
          onClick={() => void controller.analyzeArtworkRegions()}
        >
          {busy ? `Analyzing ${Math.round(analysis.progress * 100)}%` : 'Analyze regions locally'}
        </button>
        <button
          type="button"
          className="region-action"
          disabled={!focusedRegion}
          onClick={() => controller.clearRegionFocus()}
        >
          Show whole artwork
        </button>
      </div>
      <p className="region-privacy-note">
        Optional analysis runs on this device after download. Authored regions are always available.
      </p>
      {focusedRegion ? (
        <p className="region-focus-caption">
          <strong>{focusedRegion.label}.</strong> {focusedRegion.description}
          {focusedRegion.provenance === 'model-detected'
            ? ' Local model suggestion; not verified museum fact.'
            : ''}
        </p>
      ) : null}
      <span className="region-count" aria-hidden="true">
        {regions.length} regions
      </span>
    </div>
  );
}
