import type {
  RegionAnalysisProgress as GalleryAnalysisProgress,
  RegionAnalysisRunner,
} from '../gallery/controller';
import type { ArtworkRegion, CompactRegionMask } from '../gallery/types';
import { createRegionAnalysisClient, type RegionAnalysisClient } from './client';
import type { CompactRegionMask as RleMask, NormalizedBounds } from './types';

function decodeRle(mask: RleMask): number[] {
  const values: number[] = [];
  let value = 0;
  for (const count of mask.counts) {
    for (let index = 0; index < count; index += 1) values.push(value);
    value = value ? 0 : 1;
  }
  return values.slice(0, mask.width * mask.height);
}

function cross(
  origin: readonly [number, number],
  a: readonly [number, number],
  b: readonly [number, number],
): number {
  return (
    (a[0] - origin[0]) * (b[1] - origin[1]) -
    (a[1] - origin[1]) * (b[0] - origin[0])
  );
}

function convexHull(points: Array<[number, number]>): Array<[number, number]> {
  const sorted = points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length <= 2) return sorted;
  const lower: Array<[number, number]> = [];
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2]!, lower[lower.length - 1]!, point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper: Array<[number, number]> = [];
  for (const point of [...sorted].reverse()) {
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2]!, upper[upper.length - 1]!, point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function toGalleryMask(mask: RleMask | undefined): CompactRegionMask | undefined {
  if (!mask) return undefined;
  const values = decodeRle(mask);
  const points: Array<[number, number]> = [];
  const stride = Math.max(1, Math.floor(Math.max(mask.width, mask.height) / 16));
  for (let y = 0; y < mask.height; y += stride) {
    for (let x = 0; x < mask.width; x += stride) {
      if (!values[y * mask.width + x]) continue;
      const artworkX = mask.crop.x + ((x + 0.5) / mask.width) * mask.crop.width;
      const artworkY = mask.crop.y + ((y + 0.5) / mask.height) * mask.crop.height;
      points.push([artworkX, artworkY]);
    }
  }
  const hull = convexHull(points);
  if (hull.length < 3) return undefined;
  return { encoding: 'polygon', points: hull.flat() };
}

function modelDescription(label: string, bounds: NormalizedBounds): string {
  const horizontal =
    bounds.x + bounds.width / 2 < 0.4
      ? 'left'
      : bounds.x + bounds.width / 2 > 0.6
        ? 'right'
        : 'centre';
  const vertical =
    bounds.y + bounds.height / 2 < 0.4
      ? 'upper'
      : bounds.y + bounds.height / 2 > 0.6
        ? 'lower'
        : 'middle';
  return `A local vision model suggests “${label}” in the ${vertical}-${horizontal} area. This is an unverified visual suggestion, not museum-authored information.`;
}

export function createGalleryRegionAnalysisRunner(
  client: RegionAnalysisClient = createRegionAnalysisClient(),
): { runner: RegionAnalysisRunner; dispose: () => void } {
  return {
    runner: async (request) => {
      const result = await client.analyze(
        {
          artworkId: request.artworkId,
          imageUrl: request.imageUrl,
          candidateLabels: request.labels,
          detectionThreshold: Math.min(request.threshold, 0.08),
          acceptanceThreshold: request.threshold,
          maxRegions: request.maxRegions,
        },
        (progress) => {
          const phase: GalleryAnalysisProgress['phase'] =
            progress.phase === 'loading' || progress.phase === 'fallback'
              ? 'loading'
              : 'analyzing';
          request.onProgress({
            phase,
            progress: progress.progress ?? 0,
            message: progress.message,
            ...(progress.backend ? { backend: progress.backend } : {}),
          });
        },
        request.signal,
      );
      const regions = result.regions.map<ArtworkRegion>((region) => {
        const mask = toGalleryMask(region.mask);
        return {
          id: `${request.artworkId}-${region.id}`,
          label: region.label,
          description: modelDescription(region.label, region.bounds),
          bounds: region.bounds,
          confidence: region.confidence,
          provenance: 'model-detected',
          model: {
            detector: region.model.detector.id,
            detectorRevision: region.model.detector.revision,
            refiner: region.model.refiner.id,
            refinerRevision: region.model.refiner.revision,
            ...(region.model.refiner.backend
              ? { refinerBackend: region.model.refiner.backend }
              : {}),
            backend: region.model.backend,
          },
          ...(mask ? { mask } : {}),
        };
      });
      return { regions, backend: result.model.backend };
    },
    dispose: () => client.dispose(),
  };
}
