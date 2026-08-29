import {
  type CSSProperties,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { getVisibleRegion, getVisibleRegions } from './regions';
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
  const [expanded, setExpanded] = useState(false);
  const optionsId = useId();
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const provenanceRef = useRef<HTMLParagraphElement>(null);
  const language = state.personalization.language;
  const copy = getUiCopy(language);
  const regions = getVisibleRegions(state).map((region) =>
    localizeRegion(region, language),
  );
  const focusedRegion = state.focusedRegionId
    ? localizeRegion(getVisibleRegion(state, state.focusedRegionId)!, language)
    : undefined;

  useEffect(() => {
    setExpanded(false);
  }, [state.artworkId]);

  const provenanceLabel = focusedRegion
    ? focusedRegion.verification === 'human-confirmed'
      ? copy.confirmedRegion
      : focusedRegion.provenance === 'agent-grounded'
        ? copy.agentRegion
        : focusedRegion.provenance === 'model-detected'
          ? copy.modelRegion
          : copy.authoredRegion
    : undefined;
  const canRatify =
    focusedRegion &&
    focusedRegion.provenance !== 'authored' &&
    focusedRegion.verification !== 'human-confirmed';

  return (
    <div
      className="region-explorer"
      data-expanded={expanded}
      data-focused={Boolean(focusedRegion)}
      aria-label={copy.artworkRegions}
      role="group"
      data-no-gallery-swipe
    >
      <div className="region-actions">
        <button
          ref={exploreButtonRef}
          type="button"
          className="region-action region-action-primary"
          aria-expanded={expanded}
          aria-controls={optionsId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? copy.hideDetails : copy.exploreDetails}{' '}
          <span aria-hidden="true">· {regions.length}</span>
        </button>
        {focusedRegion ? (
          <button
            type="button"
            className="region-action"
            onClick={() => controller.clearRegionFocus()}
          >
            {copy.showWholeArtwork}
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="region-options" id={optionsId}>
          {regions.map((region) => (
            <button
              type="button"
              className="region-option"
              key={region.id}
              data-selected={region.id === focusedRegion?.id}
              aria-pressed={region.id === focusedRegion?.id}
              onClick={() => controller.focusRegion(region.id)}
            >
              {region.label}
            </button>
          ))}
        </div>
      ) : null}

      {focusedRegion ? (
        <div className="region-focus-detail">
          <p className="region-provenance" ref={provenanceRef} tabIndex={-1}>
            {provenanceLabel}
          </p>
          <p className="region-focus-caption">
            <strong>{focusedRegion.label}.</strong> {focusedRegion.description}
          </p>
          {canRatify ? (
            <div className="region-ratification" aria-label={provenanceLabel}>
              <button
                type="button"
                className="region-action"
                onClick={() => {
                  controller.confirmRegion(focusedRegion.id);
                  requestAnimationFrame(() => provenanceRef.current?.focus());
                }}
              >
                {copy.confirmRegion}
              </button>
              <button
                type="button"
                className="region-action region-action-quiet"
                onClick={() => {
                  controller.dismissRegion(focusedRegion.id);
                  requestAnimationFrame(() => exploreButtonRef.current?.focus());
                }}
              >
                {copy.dismissRegion}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
