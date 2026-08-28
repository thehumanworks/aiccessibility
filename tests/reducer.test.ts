import { listArtworks } from '../src/collection/repository';
import { createGalleryController } from '../src/gallery/controller';
import {
  createInitialGalleryState,
  galleryReducer,
} from '../src/gallery/reducer';
import type { GalleryState, RenderedInterpretation } from '../src/gallery/types';

const interpretation: RenderedInterpretation = {
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

  it('mode changes retain artwork, focus, and interpretation', () => {
    const state = exploredState();
    const nextState = galleryReducer(state, {
      type: 'set-mode',
      mode: 'spatial',
    });

    expect(nextState).toMatchObject({
      artworkId: state.artworkId,
      mode: 'spatial',
      focusedRegionId: state.focusedRegionId,
      interpretation: state.interpretation,
      revision: state.revision + 1,
    });
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
});
