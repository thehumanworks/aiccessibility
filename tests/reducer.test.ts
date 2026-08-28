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
    expect(createInitialGalleryState()).toEqual({
      artworkId: 'pissarro-boulevard-montmartre',
      mode: 'literal',
      focusedRegionId: null,
      interpretation: null,
      revision: 0,
    });
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
