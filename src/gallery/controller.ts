import { getArtwork, listArtworks } from '../collection/repository';
import { pushArtworkToHistory } from './history';
import {
  createAgentGroundedRegionId,
  findAuthoredRegionForQuery,
} from './regions';
import type { GalleryAction } from './reducer';
import { isExperienceMode } from './reducer';
import {
  isColorTheme,
  isContrastLevel,
  isFontFamily,
  isFontSize,
  isGalleryLanguage,
} from './personalization';
import type {
  Artwork,
  ArtworkRegion,
  ChangeOrigin,
  ColorTheme,
  ContrastLevel,
  ExperienceMode,
  FontFamily,
  FontSize,
  GalleryLanguage,
  GalleryState,
  InterpretationSegment,
  SessionActivityEntry,
} from './types';

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
  origin?: ChangeOrigin;
}

export interface ZoomToArtworkDetailOptions {
  signal?: AbortSignal;
  origin?: ChangeOrigin;
}

export interface FocusArtworkAreaInput {
  label: string;
  description?: string;
  bounds: ArtworkRegion['bounds'];
}

export interface ConfigurePresentationInput {
  mode?: ExperienceMode;
  fontFamily?: FontFamily;
  fontSize?: FontSize;
  contrast?: ContrastLevel;
  theme?: ColorTheme;
  language?: GalleryLanguage;
  expectedRevision?: number;
}

export type GalleryResponseSegmentInput =
  | { provenance: 'observed' | 'known'; statementId: string }
  | { provenance: 'interpreted' | 'imagined'; text: string };

export interface PublishGalleryResponseInput {
  mode?: ExperienceMode;
  title?: string;
  segments: readonly GalleryResponseSegmentInput[];
  expectedRevision?: number;
}

interface GalleryControllerDependencies {
  getState: () => GalleryState;
  applyAction: (action: GalleryAction) => GalleryState;
  runRegionAnalysis?: RegionAnalysisRunner;
}

export interface GalleryController {
  getState: () => GalleryState;
  getArtworkContext: (artworkId?: GalleryState['artworkId']) => Artwork;
  getSessionActivity: () => readonly SessionActivityEntry[];
  expectedRevisionMatches: (expectedRevision?: number) => boolean;
  navigateToArtwork: (artworkId: string, origin?: ChangeOrigin) => GalleryState;
  navigateFromHistory: (artworkId: string, origin?: ChangeOrigin) => GalleryState;
  goPrevious: (origin?: ChangeOrigin) => GalleryState;
  goNext: (origin?: ChangeOrigin) => GalleryState;
  setExperienceMode: (mode: string, origin?: ChangeOrigin) => GalleryState;
  setFontFamily: (fontFamily: string, origin?: ChangeOrigin) => GalleryState;
  setFontSize: (fontSize: string, origin?: ChangeOrigin) => GalleryState;
  setContrast: (contrast: string, origin?: ChangeOrigin) => GalleryState;
  setTheme: (theme: string, origin?: ChangeOrigin) => GalleryState;
  setLanguage: (language: string, origin?: ChangeOrigin) => GalleryState;
  configurePresentation: (
    input: ConfigurePresentationInput,
    origin?: ChangeOrigin,
  ) => GalleryState;
  publishGalleryResponse: (
    input: PublishGalleryResponseInput,
    origin?: ChangeOrigin,
  ) => GalleryState;
  clearGalleryResponse: (
    origin?: ChangeOrigin,
    expectedRevision?: number,
  ) => GalleryState;
  undoLastChange: (
    origin?: ChangeOrigin,
    expectedRevision?: number,
  ) => GalleryState;
  focusRegion: (regionId: string, origin?: ChangeOrigin) => GalleryState;
  focusArtworkArea: (
    input: FocusArtworkAreaInput,
    origin?: ChangeOrigin,
  ) => GalleryState;
  confirmRegion: (regionId: string) => GalleryState;
  dismissRegion: (regionId: string) => GalleryState;
  clearRegionFocus: (origin?: ChangeOrigin) => GalleryState;
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
  let latestAnalysisRequest = 0;
  let activeAnalysisAbort: AbortController | undefined;

  const cancelActiveAnalysis = () => {
    if (!activeAnalysisAbort) return;
    latestAnalysisRequest += 1;
    activeAnalysisAbort.abort();
    activeAnalysisAbort = undefined;
  };

  const navigate = (
    artworkId: string,
    writeHistory: boolean,
    origin: ChangeOrigin = 'human',
  ) => {
    cancelActiveAnalysis();
    const previousState = getState();
    const nextState = applyAction({ type: 'navigate', artworkId, origin });

    if (
      writeHistory &&
      nextState.artworkId !== previousState.artworkId
    ) {
      pushArtworkToHistory(nextState.artworkId);
    }

    return nextState;
  };

  const goBy = (offset: number, origin: ChangeOrigin = 'human') => {
    const collection = listArtworks();
    const currentIndex = collection.findIndex(
      ({ id }) => id === getState().artworkId,
    );
    const nextIndex = (currentIndex + offset + collection.length) % collection.length;
    const artwork = collection[nextIndex];

    return artwork ? navigate(artwork.id, true, origin) : getState();
  };

  const runArtworkRegionAnalysis = async (
    options: AnalyzeArtworkRegionOptions,
    focusBestMatch: boolean,
  ) => {
    const requestId = ++latestAnalysisRequest;
    activeAnalysisAbort?.abort();
    const requestAbort = new AbortController();
    activeAnalysisAbort = requestAbort;
    const abortFromCaller = () => requestAbort.abort();
    options.signal?.addEventListener('abort', abortFromCaller, { once: true });
    if (options.signal?.aborted) requestAbort.abort();

    const artworkId = getState().artworkId;
    const artwork = getArtwork(artworkId);
    let lastAppliedProgress: RegionAnalysisProgress | undefined;
    const labels = (options.labels ?? artwork.discovery.subjects)
      .map((label) => label.trim())
      .filter(Boolean)
      .slice(0, 12);

    if (!runRegionAnalysis) {
      options.signal?.removeEventListener('abort', abortFromCaller);
      if (requestId !== latestAnalysisRequest || requestAbort.signal.aborted) {
        if (requestId === latestAnalysisRequest) activeAnalysisAbort = undefined;
        return getState();
      }
      activeAnalysisAbort = undefined;
      return applyAction({
        type: 'region-analysis-failed',
        artworkId,
        message: 'Local analysis is unavailable. Authored regions remain ready.',
        error: 'Region analysis worker is unavailable.',
        origin: options.origin,
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
        signal: requestAbort.signal,
        onProgress: (progress) => {
          if (
            requestId !== latestAnalysisRequest ||
            requestAbort.signal.aborted
          ) {
            return;
          }
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
      if (requestId !== latestAnalysisRequest || requestAbort.signal.aborted) {
        return getState();
      }
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
        origin: options.origin,
      });
    } catch (error) {
      if (
        requestId !== latestAnalysisRequest ||
        requestAbort.signal.aborted ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        return getState();
      }
      const message =
        'Local analysis could not finish. Authored regions remain ready.';
      return applyAction({
        type: 'region-analysis-failed',
        artworkId,
        message,
        error: error instanceof Error ? error.message : 'Unknown analysis error.',
        origin: options.origin,
      });
    } finally {
      options.signal?.removeEventListener('abort', abortFromCaller);
      if (requestId === latestAnalysisRequest) activeAnalysisAbort = undefined;
    }
  };

  const expectedRevisionMatches = (expectedRevision?: number) =>
    expectedRevision === undefined || getState().revision === expectedRevision;

  const validConfigureInput = (input: ConfigurePresentationInput) => {
    const presentationKeys = [
      input.mode,
      input.fontFamily,
      input.fontSize,
      input.contrast,
      input.theme,
      input.language,
    ];
    return (
      presentationKeys.some((value) => value !== undefined) &&
      (input.mode === undefined || isExperienceMode(input.mode)) &&
      (input.fontFamily === undefined || isFontFamily(input.fontFamily)) &&
      (input.fontSize === undefined || isFontSize(input.fontSize)) &&
      (input.contrast === undefined || isContrastLevel(input.contrast)) &&
      (input.theme === undefined || isColorTheme(input.theme)) &&
      (input.language === undefined || isGalleryLanguage(input.language))
    );
  };

  const resolveGalleryResponse = (
    input: PublishGalleryResponseInput,
  ): readonly InterpretationSegment[] | undefined => {
    if (
      (input.mode !== undefined && !isExperienceMode(input.mode)) ||
      input.segments.length < 1 ||
      input.segments.length > 8 ||
      (input.title !== undefined &&
        (input.title.trim().length < 1 || input.title.length > 120))
    ) {
      return undefined;
    }
    const artwork = getArtwork(getState().artworkId);
    const resolved: InterpretationSegment[] = [];
    for (const segment of input.segments) {
      if (segment.provenance === 'observed') {
        const statement = artwork.observed.find(
          ({ id }) => id === segment.statementId,
        );
        if (!statement) return undefined;
        resolved.push({
          provenance: 'observed',
          statementId: statement.id,
          text: statement.text,
        });
        continue;
      }
      if (segment.provenance === 'known') {
        const statement = artwork.known.find(
          ({ id }) => id === segment.statementId,
        );
        if (!statement) return undefined;
        resolved.push({
          provenance: 'known',
          statementId: statement.id,
          sourceIds: [...statement.sourceIds],
          text: statement.text,
        });
        continue;
      }
      if (
        (segment.provenance !== 'interpreted' &&
          segment.provenance !== 'imagined') ||
        typeof segment.text !== 'string' ||
        segment.text.trim().length < 1 ||
        segment.text.length > 600
      ) {
        return undefined;
      }
      resolved.push({
        provenance: segment.provenance,
        text: segment.text.trim(),
      });
    }
    return resolved;
  };

  return {
    getState,
    getArtworkContext: (artworkId = getState().artworkId) => getArtwork(artworkId),
    getSessionActivity: () => getState().activity,
    expectedRevisionMatches,
    navigateToArtwork: (artworkId, origin) => navigate(artworkId, true, origin),
    navigateFromHistory: (artworkId, origin) =>
      navigate(artworkId, false, origin),
    goPrevious: (origin) => goBy(-1, origin),
    goNext: (origin) => goBy(1, origin),
    setExperienceMode: (mode, origin) =>
      applyAction({ type: 'set-mode', mode, origin }),
    setFontFamily: (fontFamily, origin) =>
      applyAction({ type: 'set-font-family', fontFamily, origin }),
    setFontSize: (fontSize, origin) =>
      applyAction({ type: 'set-font-size', fontSize, origin }),
    setContrast: (contrast, origin) =>
      applyAction({ type: 'set-contrast', contrast, origin }),
    setTheme: (theme, origin) =>
      applyAction({ type: 'set-theme', theme, origin }),
    setLanguage: (language, origin) =>
      applyAction({ type: 'set-language', language, origin }),
    configurePresentation: (input, origin = 'human') => {
      if (!expectedRevisionMatches(input.expectedRevision) || !validConfigureInput(input)) {
        return getState();
      }
      const { expectedRevision: _expectedRevision, ...presentation } = input;
      return applyAction({ type: 'configure-presentation', presentation, origin });
    },
    publishGalleryResponse: (input, origin = 'human') => {
      if (!expectedRevisionMatches(input.expectedRevision)) return getState();
      const segments = resolveGalleryResponse(input);
      if (!segments) return getState();
      return applyAction({
        type: 'render-interpretation',
        interpretation: {
          artworkId: getState().artworkId,
          focusedRegionId: getState().focusedRegionId,
          language: getState().personalization.language,
          mode: input.mode ?? getState().mode,
          ...(input.title ? { title: input.title.trim() } : {}),
          segments,
        },
        origin,
      });
    },
    clearGalleryResponse: (origin = 'human', expectedRevision) =>
      expectedRevisionMatches(expectedRevision)
        ? applyAction({ type: 'clear-interpretation', origin })
        : getState(),
    undoLastChange: (origin = 'human', expectedRevision) => {
      if (!expectedRevisionMatches(expectedRevision)) return getState();
      cancelActiveAnalysis();
      const before = getState();
      const state = applyAction({ type: 'undo', origin });
      if (state.artworkId !== before.artworkId) {
        pushArtworkToHistory(state.artworkId);
      }
      return state;
    },
    focusRegion: (regionId, origin) =>
      applyAction({ type: 'focus-region', regionId, origin }),
    focusArtworkArea: ({ label, description, bounds }, origin) => {
      const artworkId = getState().artworkId;
      const region: ArtworkRegion = {
        id: createAgentGroundedRegionId(label, bounds),
        label,
        description:
          `A visual agent grounded “${label}” within these artwork bounds.` +
          (description ? ` ${description}` : '') +
          ' This is an agent-supplied navigation cue, not museum-authored information.',
        bounds,
        provenance: 'agent-grounded',
        verification: 'unverified',
      };
      return applyAction({
        type: 'focus-agent-region',
        artworkId,
        region,
        origin,
      });
    },
    confirmRegion: (regionId) =>
      applyAction({ type: 'confirm-region', regionId, origin: 'human' }),
    dismissRegion: (regionId) =>
      applyAction({ type: 'dismiss-region', regionId, origin: 'human' }),
    clearRegionFocus: (origin) =>
      applyAction({ type: 'clear-focus', origin }),
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
          origin: options.origin,
        });
      }

      return runArtworkRegionAnalysis(
        {
          labels: [query],
          threshold: 0.12,
          maxRegions: 4,
          ...(options.signal ? { signal: options.signal } : {}),
          ...(options.origin ? { origin: options.origin } : {}),
        },
        true,
      );
    },
  };
}
