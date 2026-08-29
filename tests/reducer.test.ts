import { listArtworks } from '../src/collection/repository';
import {
  createGalleryController,
  type RegionAnalysisRequest,
  type RegionAnalysisResult,
} from '../src/gallery/controller';
import {
  createInitialGalleryState,
  galleryReducer,
} from '../src/gallery/reducer';
import type { GalleryState, RenderedInterpretation } from '../src/gallery/types';

const interpretation: RenderedInterpretation = {
  artworkId: 'pissarro-boulevard-montmartre',
  focusedRegionId: 'pissarro-left-tree',
  language: 'en',
  mode: 'story',
  title: 'A room waiting to move',
  segments: [
    { provenance: 'imagined', text: 'The floor remembers every step.' },
  ],
};

function exploredState(): GalleryState {
  const initial = createInitialGalleryState();
  const focused = galleryReducer(initial, {
    type: 'focus-region',
    regionId: 'pissarro-left-tree',
  });
  return galleryReducer(focused, {
    type: 'render-interpretation',
    interpretation,
  });
}

describe('galleryReducer', () => {
  it('starts with a defined, literal, whole-artwork state', () => {
    expect(createInitialGalleryState()).toMatchObject({
      artworkId: 'pissarro-boulevard-montmartre',
      mode: 'literal',
      focusedRegionId: null,
      interpretation: null,
      agentGroundedRegions: {},
      acceptedModelRegions: {},
      revision: 0,
      activity: [],
      activitySequence: 0,
      undoSnapshot: null,
    });
    expect(
      createInitialGalleryState().regionAnalysis[
        'pissarro-boulevard-montmartre'
      ],
    ).toMatchObject({ phase: 'idle', backend: 'authored', progress: 0 });
  });

  it('navigation clears focus and interpretation while preserving mode', () => {
    const state = exploredState();
    const nextState = galleryReducer(state, {
      type: 'navigate',
      artworkId: 'degas-dance-class',
    });

    expect(nextState).toMatchObject({
      artworkId: 'degas-dance-class',
      mode: 'story',
      focusedRegionId: null,
      interpretation: null,
      revision: state.revision + 1,
    });
  });

  it('updates and preserves bounded personalization preferences', () => {
    let state = createInitialGalleryState();
    state = galleryReducer(state, { type: 'set-font-family', fontFamily: 'mono' });
    state = galleryReducer(state, { type: 'set-font-size', fontSize: 'large' });
    state = galleryReducer(state, { type: 'set-contrast', contrast: 'high' });
    state = galleryReducer(state, { type: 'set-theme', theme: 'light' });
    state = galleryReducer(state, { type: 'set-language', language: 'es' });

    expect(state.personalization).toEqual({
      fontFamily: 'mono',
      fontSize: 'large',
      contrast: 'high',
      theme: 'light',
      language: 'es',
    });
    expect(state.revision).toBe(5);

    const navigated = galleryReducer(state, {
      type: 'navigate',
      artworkId: 'degas-dance-class',
    });
    expect(navigated.personalization).toEqual(state.personalization);
  });

  it('rejects invalid and idempotent personalization updates', () => {
    const state = createInitialGalleryState();
    expect(galleryReducer(state, { type: 'set-font-family', fontFamily: 'comic' })).toBe(state);
    expect(galleryReducer(state, { type: 'set-font-size', fontSize: 'huge' })).toBe(state);
    expect(galleryReducer(state, { type: 'set-contrast', contrast: 'none' })).toBe(state);
    expect(galleryReducer(state, { type: 'set-theme', theme: 'neon' })).toBe(state);
    expect(galleryReducer(state, { type: 'set-language', language: 'xx' })).toBe(state);
    expect(galleryReducer(state, { type: 'set-theme', theme: 'dark' })).toBe(state);
  });

  it('configures multiple presentation settings in exactly one revision', () => {
    const state = createInitialGalleryState();
    const next = galleryReducer(state, {
      type: 'configure-presentation',
      presentation: {
        mode: 'spatial',
        fontFamily: 'mono',
        fontSize: 'extra-large',
        contrast: 'high',
        theme: 'light',
        language: 'fr',
      },
      origin: 'agent',
    });

    expect(next).toMatchObject({
      mode: 'spatial',
      personalization: {
        fontFamily: 'mono',
        fontSize: 'extra-large',
        contrast: 'high',
        theme: 'light',
        language: 'fr',
      },
      revision: 1,
      activity: [
        {
          sequence: 1,
          origin: 'agent',
          action: 'configure-presentation',
          fromRevision: 0,
          toRevision: 1,
        },
      ],
    });
    expect(next.undoSnapshot).toMatchObject({
      mode: 'literal',
      personalization: state.personalization,
    });
  });

  it('clears a differently-mode response during atomic reconfiguration', () => {
    const state = exploredState();
    const next = galleryReducer(state, {
      type: 'configure-presentation',
      presentation: { mode: 'spatial', contrast: 'high' },
    });

    expect(next).toMatchObject({
      mode: 'spatial',
      interpretation: null,
      personalization: { contrast: 'high' },
      revision: state.revision + 1,
    });
  });

  it('keeps a bounded redacted activity log and performs one-step undo', () => {
    let state = createInitialGalleryState();
    state = galleryReducer(state, {
      type: 'render-interpretation',
      interpretation: {
        artworkId: 'pissarro-boulevard-montmartre',
        focusedRegionId: null,
        language: 'en',
        mode: 'story',
        title: 'Do not copy this into activity',
        segments: [
          { provenance: 'imagined', text: 'Secret generated response text.' },
        ],
      },
      origin: 'agent',
    });
    expect(JSON.stringify(state.activity)).not.toContain('Secret generated');
    expect(JSON.stringify(state.activity)).not.toContain('Do not copy');

    for (let index = 0; index < 24; index += 1) {
      state = galleryReducer(state, {
        type: 'set-mode',
        mode: index % 2 === 0 ? 'literal' : 'spatial',
      });
    }
    expect(state.activity).toHaveLength(20);
    expect(state.activitySequence).toBeGreaterThan(20);

    const modeBeforeLastChange = state.undoSnapshot?.mode;
    const undone = galleryReducer(state, { type: 'undo', origin: 'human' });
    expect(undone.mode).toBe(modeBeforeLastChange);
    expect(undone.revision).toBe(state.revision + 1);
    expect(undone.activity.at(-1)).toMatchObject({
      origin: 'human',
      action: 'undo',
      fromRevision: state.revision,
      toRevision: state.revision + 1,
    });
    expect(undone.undoSnapshot).toBeNull();
    expect(galleryReducer(undone, { type: 'undo' })).toBe(undone);
  });

  it('mode changes retain artwork and focus but clear a stale response', () => {
    const state = exploredState();
    const nextState = galleryReducer(state, {
      type: 'set-mode',
      mode: 'spatial',
    });

    expect(nextState).toMatchObject({
      artworkId: state.artworkId,
      mode: 'spatial',
      focusedRegionId: state.focusedRegionId,
      interpretation: null,
      revision: state.revision + 1,
    });
  });

  it('clears a published response when focus or language context changes', () => {
    const state = exploredState();

    const wholeArtwork = galleryReducer(state, { type: 'clear-focus' });
    expect(wholeArtwork.focusedRegionId).toBeNull();
    expect(wholeArtwork.interpretation).toBeNull();

    const translated = galleryReducer(state, {
      type: 'set-language',
      language: 'fr',
    });
    expect(translated.personalization.language).toBe('fr');
    expect(translated.interpretation).toBeNull();
  });

  it('keeps transient analysis progress outside revision and undo history', () => {
    const state = createInitialGalleryState();
    const progress = galleryReducer(state, {
      type: 'region-analysis-progress',
      artworkId: state.artworkId,
      phase: 'analyzing',
      progress: 0.5,
      message: 'Looking locally.',
    });

    expect(progress.revision).toBe(state.revision);
    expect(progress.activity).toEqual([]);
    expect(progress.undoSnapshot).toBeNull();

    const complete = galleryReducer(progress, {
      type: 'region-analysis-complete',
      artworkId: state.artworkId,
      regions: [],
      message: 'No proposals found.',
      backend: 'webgpu',
    });
    expect(complete.revision).toBe(state.revision + 1);
    expect(complete.activity.at(-1)?.action).toBe('analyze-regions');
    expect(complete.undoSnapshot).toBeNull();
    expect(galleryReducer(complete, { type: 'undo' })).toBe(complete);
  });

  it('rejects invalid ids, invalid modes, and regions from another artwork', () => {
    const state = createInitialGalleryState();

    expect(
      galleryReducer(state, { type: 'navigate', artworkId: 'not-in-gallery' }),
    ).toBe(state);
    expect(galleryReducer(state, { type: 'set-mode', mode: 'chaos' })).toBe(
      state,
    );
    expect(
      galleryReducer(state, {
        type: 'focus-region',
        regionId: 'degas-mirror',
      }),
    ).toBe(state);
  });

  it('does not increment the revision for no-op actions', () => {
    const state = createInitialGalleryState();

    expect(
      galleryReducer(state, {
        type: 'navigate',
        artworkId: state.artworkId,
      }),
    ).toBe(state);
    expect(galleryReducer(state, { type: 'set-mode', mode: state.mode })).toBe(
      state,
    );
    expect(galleryReducer(state, { type: 'clear-focus' })).toBe(state);
    expect(galleryReducer(state, { type: 'clear-interpretation' })).toBe(state);
  });

  it('stores and focuses an agent-grounded region independently of model analysis', () => {
    const state = createInitialGalleryState();
    const region = {
      id: 'agent-red-omnibus-test',
      label: 'Red omnibus',
      description: 'A visual agent grounded the red omnibus in this area.',
      bounds: { x: 0.42, y: 0.5, width: 0.14, height: 0.18 },
      provenance: 'agent-grounded' as const,
    };
    const next = galleryReducer(state, {
      type: 'focus-agent-region',
      artworkId: state.artworkId,
      region,
    });

    expect(next).toMatchObject({
      focusedRegionId: region.id,
      agentGroundedRegions: { [state.artworkId]: [region] },
      acceptedModelRegions: {},
      revision: 1,
    });
    expect(next.agentGroundedRegions[state.artworkId]?.[0]?.verification).toBe(
      'unverified',
    );

    const confirmed = galleryReducer(next, {
      type: 'confirm-region',
      regionId: region.id,
    });
    expect(
      confirmed.agentGroundedRegions[state.artworkId]?.[0]?.verification,
    ).toBe('human-confirmed');
    expect(confirmed.activity.at(-1)).toMatchObject({
      origin: 'human',
      action: 'confirm-region',
    });

    const dismissed = galleryReducer(confirmed, {
      type: 'dismiss-region',
      regionId: region.id,
    });
    expect(dismissed.agentGroundedRegions[state.artworkId]).toEqual([]);
    expect(dismissed.focusedRegionId).toBeNull();
    expect(
      galleryReducer(dismissed, {
        type: 'dismiss-region',
        regionId: 'pissarro-left-tree',
      }),
    ).toBe(dismissed);
  });
});

describe('galleryController over the six-work collection', () => {
  function createController() {
    let state = createInitialGalleryState();
    return createGalleryController({
      getState: () => state,
      applyAction: (action) => {
        state = galleryReducer(state, action);
        return state;
      },
    });
  }

  it('cycles forward through every work and wraps back to the first', () => {
    const collection = listArtworks();
    expect(collection).toHaveLength(6);

    const controller = createController();
    const visited = collection.map(() => controller.goNext().artworkId);

    expect(visited).toEqual([
      ...collection.slice(1).map(({ id }) => id),
      collection[0]!.id,
    ]);
    expect(controller.getState().revision).toBe(6);
  });

  it('wraps backward from the first work to the last', () => {
    const collection = listArtworks();
    const controller = createController();

    expect(controller.goPrevious().artworkId).toBe(collection.at(-1)!.id);
  });

  it('preserves the mode across a full walk of the collection', () => {
    const controller = createController();
    controller.setExperienceMode('curatorial');

    for (let step = 0; step < listArtworks().length; step += 1) {
      expect(controller.goNext().mode).toBe('curatorial');
    }

    expect(controller.getState().artworkId).toBe(listArtworks()[0]!.id);
  });

  it('lets only the newest overlapping region analysis commit', async () => {
    const pending: Array<{
      request: RegionAnalysisRequest;
      resolve: (result: RegionAnalysisResult) => void;
    }> = [];
    let state = createInitialGalleryState();
    const controller = createGalleryController({
      getState: () => state,
      applyAction: (action) => {
        state = galleryReducer(state, action);
        return state;
      },
      runRegionAnalysis: (request) =>
        new Promise((resolve) => pending.push({ request, resolve })),
    });

    const first = controller.analyzeArtworkRegions({ labels: ['first'] });
    const second = controller.analyzeArtworkRegions({ labels: ['second'] });
    expect(pending[0]?.request.signal?.aborted).toBe(true);

    pending[1]!.resolve({
      backend: 'webgpu',
      regions: [
        {
          id: 'newest-region',
          label: 'Newest',
          description: 'The accepted newest proposal.',
          bounds: { x: 0.2, y: 0.2, width: 0.2, height: 0.2 },
          provenance: 'model-detected',
        },
      ],
    });
    await second;
    pending[0]!.resolve({
      backend: 'wasm',
      regions: [
        {
          id: 'stale-region',
          label: 'Stale',
          description: 'This must not overwrite the newer result.',
          bounds: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
          provenance: 'model-detected',
        },
      ],
    });
    await first;

    expect(controller.getState().acceptedModelRegions[state.artworkId]).toMatchObject([
      { id: 'newest-region', verification: 'unverified' },
    ]);
    expect(controller.getState().activity.filter(({ action }) => action === 'analyze-regions')).toHaveLength(1);
  });

  it('does not commit a region result after mid-flight cancellation', async () => {
    let resolveAnalysis!: (result: RegionAnalysisResult) => void;
    let state = createInitialGalleryState();
    const initial = state;
    const controller = createGalleryController({
      getState: () => state,
      applyAction: (action) => {
        state = galleryReducer(state, action);
        return state;
      },
      runRegionAnalysis: () =>
        new Promise((resolve) => {
          resolveAnalysis = resolve;
        }),
    });
    const cancellation = new AbortController();
    const analysis = controller.analyzeArtworkRegions({
      labels: ['cancel me'],
      signal: cancellation.signal,
    });
    cancellation.abort();
    resolveAnalysis({ backend: 'webgpu', regions: [] });
    await analysis;

    expect(controller.getState()).toBe(initial);
  });

  it('aborts active analysis when undo restores prior shared state', async () => {
    let resolveAnalysis!: (result: RegionAnalysisResult) => void;
    let request!: RegionAnalysisRequest;
    let state = createInitialGalleryState();
    const controller = createGalleryController({
      getState: () => state,
      applyAction: (action) => {
        state = galleryReducer(state, action);
        return state;
      },
      runRegionAnalysis: (nextRequest) => {
        request = nextRequest;
        return new Promise((resolve) => {
          resolveAnalysis = resolve;
        });
      },
    });

    controller.setExperienceMode('story');
    const analysis = controller.analyzeArtworkRegions({ labels: ['wave'] });
    controller.undoLastChange('human', state.revision);
    expect(request.signal?.aborted).toBe(true);

    resolveAnalysis({
      backend: 'webgpu',
      regions: [
        {
          id: 'late-after-undo',
          label: 'Late',
          description: 'This must never commit.',
          bounds: { x: 0.2, y: 0.2, width: 0.2, height: 0.2 },
          provenance: 'model-detected',
        },
      ],
    });
    await analysis;

    expect(controller.getState().mode).toBe('literal');
    expect(controller.getState().acceptedModelRegions[state.artworkId]).toBeUndefined();
  });
});
