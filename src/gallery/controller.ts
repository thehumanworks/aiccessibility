import { getArtwork, listArtworks } from '../collection/repository';
import { pushArtworkToHistory } from './history';
import { findAuthoredRegionForQuery } from './regions';
import type { GalleryAction } from './reducer';
import type { GalleryState } from './types';
import type { ArtworkRegion } from './types';

export interface RegionAnalysisProgress {
  phase: 'loading' | 'analyzing';
  progress: number;
  message: string;
  backend?: 'webgpu' | 'wasm';
}

export interface RegionAnalysisRequest {
  artworkId: GalleryState['artworkId'];
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  labels: readonly string[];
  threshold: number;
  maxRegions: number;
  signal?: AbortSignal;
  onProgress: (progress: RegionAnalysisProgress) => void;
}

export interface RegionAnalysisResult {
  regions: readonly ArtworkRegion[];
  backend: 'webgpu' | 'wasm';
}

export type RegionAnalysisRunner = (
  request: RegionAnalysisRequest,
) => Promise<RegionAnalysisResult>;

export interface AnalyzeArtworkRegionOptions {
  labels?: readonly string[];
  threshold?: number;
  maxRegions?: number;
  signal?: AbortSignal;
}

export interface ZoomToArtworkDetailOptions {
  signal?: AbortSignal;
}

interface GalleryControllerDependencies {
  getState: () => GalleryState;
  applyAction: (action: GalleryAction) => GalleryState;
  runRegionAnalysis?: RegionAnalysisRunner;
}

export interface GalleryController {
  getState: () => GalleryState;
  navigateToArtwork: (artworkId: string) => GalleryState;
  navigateFromHistory: (artworkId: string) => GalleryState;
  goPrevious: () => GalleryState;
  goNext: () => GalleryState;
  setExperienceMode: (mode: string) => GalleryState;
  focusRegion: (regionId: string) => GalleryState;
  clearRegionFocus: () => GalleryState;
  analyzeArtworkRegions: (
    options?: AnalyzeArtworkRegionOptions,
  ) => Promise<GalleryState>;
  zoomToArtworkDetail: (
    query: string,
    options?: ZoomToArtworkDetailOptions,
  ) => Promise<GalleryState>;
}

export function createGalleryController({
  getState,
  applyAction,
  runRegionAnalysis,
}: GalleryControllerDependencies): GalleryController {
  const navigate = (artworkId: string, writeHistory: boolean) => {
    const previousState = getState();
    const nextState = applyAction({ type: 'navigate', artworkId });

    if (
      writeHistory &&
      nextState.artworkId !== previousState.artworkId
    ) {
      pushArtworkToHistory(nextState.artworkId);
    }

    return nextState;
  };

  const goBy = (offset: number) => {
    const collection = listArtworks();
    const currentIndex = collection.findIndex(
      ({ id }) => id === getState().artworkId,
    );
    const nextIndex = (currentIndex + offset + collection.length) % collection.length;
    const artwork = collection[nextIndex];

    return artwork ? navigate(artwork.id, true) : getState();
  };

  const runArtworkRegionAnalysis = async (
    options: AnalyzeArtworkRegionOptions,
    focusBestMatch: boolean,
  ) => {
    const artworkId = getState().artworkId;
    const artwork = getArtwork(artworkId);
    let lastAppliedProgress: RegionAnalysisProgress | undefined;
    const labels = (options.labels ?? artwork.discovery.subjects)
      .map((label) => label.trim())
      .filter(Boolean)
      .slice(0, 12);

    if (!runRegionAnalysis) {
      return applyAction({
        type: 'region-analysis-failed',
        artworkId,
        message: 'Local analysis is unavailable. Authored regions remain ready.',
        error: 'Region analysis worker is unavailable.',
      });
    }

    try {
      const result = await runRegionAnalysis({
        artworkId,
        imageUrl: artwork.image.src,
        imageWidth: artwork.image.width,
        imageHeight: artwork.image.height,
        labels,
        threshold: options.threshold ?? 0.2,
        maxRegions: options.maxRegions ?? 8,
        ...(options.signal ? { signal: options.signal } : {}),
        onProgress: (progress) => {
          const scaledProgress =
            progress.phase === 'loading'
              ? Math.min(0.45, progress.progress * 0.45)
              : progress.progress;
          const displayedProgress =
            progress.phase === 'loading' &&
            lastAppliedProgress?.phase === 'loading'
              ? Math.max(lastAppliedProgress.progress, scaledProgress)
              : scaledProgress;
          const nextProgress = {
            ...progress,
            progress: displayedProgress,
          };
          if (
            lastAppliedProgress &&
            lastAppliedProgress.phase === nextProgress.phase &&
            lastAppliedProgress.backend === nextProgress.backend &&
            Math.abs(lastAppliedProgress.progress - nextProgress.progress) < 0.05
          ) {
            return;
          }
          lastAppliedProgress = nextProgress;
          applyAction({
            type: 'region-analysis-progress',
            artworkId,
            ...nextProgress,
          });
        },
      });
      const bestMatch = focusBestMatch
        ? result.regions.reduce<ArtworkRegion | undefined>(
            (best, region) =>
              !best || (region.confidence ?? 0) > (best.confidence ?? 0)
                ? region
                : best,
            undefined,
          )
        : undefined;
      return applyAction({
        type: 'region-analysis-complete',
        artworkId,
        regions: result.regions,
        backend: result.backend,
        message: `Local analysis complete. ${result.regions.length} model suggestion${result.regions.length === 1 ? '' : 's'} accepted for exploration.`,
        ...(bestMatch ? { focusedRegionId: bestMatch.id } : {}),
      });
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'AbortError'
          ? 'Local analysis was cancelled. Authored regions remain ready.'
          : 'Local analysis could not finish. Authored regions remain ready.';
      return applyAction({
        type: 'region-analysis-failed',
        artworkId,
        message,
        error: error instanceof Error ? error.message : 'Unknown analysis error.',
      });
    }
  };

  return {
    getState,
    navigateToArtwork: (artworkId) => navigate(artworkId, true),
    navigateFromHistory: (artworkId) => navigate(artworkId, false),
    goPrevious: () => goBy(-1),
    goNext: () => goBy(1),
    setExperienceMode: (mode) => applyAction({ type: 'set-mode', mode }),
    focusRegion: (regionId) =>
      applyAction({ type: 'focus-region', regionId }),
    clearRegionFocus: () => applyAction({ type: 'clear-focus' }),
    analyzeArtworkRegions: (options = {}) =>
      runArtworkRegionAnalysis(options, false),
    zoomToArtworkDetail: async (query, options = {}) => {
      const authoredMatch = findAuthoredRegionForQuery(
        getState().artworkId,
        query,
      );
      if (authoredMatch) {
        return applyAction({
          type: 'focus-region',
          regionId: authoredMatch.id,
        });
      }

      return runArtworkRegionAnalysis(
        {
          labels: [query],
          threshold: 0.12,
          maxRegions: 4,
          ...(options.signal ? { signal: options.signal } : {}),
        },
        true,
      );
    },
  };
}
