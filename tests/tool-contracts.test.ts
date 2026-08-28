import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createElement, StrictMode } from 'react';
import { afterEach } from 'vitest';

import { App } from '../src/App';
import {
  createGalleryController,
  type GalleryController,
  type RegionAnalysisRunner,
} from '../src/gallery/controller';
import {
  createInitialGalleryState,
  galleryReducer,
} from '../src/gallery/reducer';
import { registerGalleryTools, supportsWebMcp } from '../src/webmcp/register';
import { createGalleryTools } from '../src/webmcp/tools';

interface SuccessResult {
  ok: true;
  action: string;
  state: {
    artwork: { id: string; title: string };
    mode: string;
    speakingStyle: { label: string; instruction: string };
    personalization: {
      fontFamily: string;
      fontSize: string;
      contrast: string;
      theme: string;
      language: string;
    };
    focusedRegion?: { id: string; provenance: string } | null;
    availableRegionCount?: number;
    regionAnalysis?: { phase: string; backend: string };
    revision: number;
    collectionSize: number;
  };
  artworks?: Array<{ id: string }>;
  regions?: Array<{ id: string; provenance: string }>;
  query?: string;
  region?: { id: string; provenance: string; confidence?: number };
  description?: {
    mode: string;
    segments: Array<{ provenance: string; text: string }>;
  };
}

interface ErrorResult {
  ok: false;
  error: {
    code: string;
    recovery: Record<string, unknown>;
  };
  state: { revision: number };
}

class FakeModelContext extends EventTarget implements WebMCP.ModelContext {
  readonly tools: WebMCP.ModelContextTool[] = [];

  async registerTool(
    tool: WebMCP.ModelContextTool,
    options?: WebMCP.ModelContextRegisterToolOptions,
  ): Promise<void> {
    this.tools.push(tool);
    options?.signal?.addEventListener(
      'abort',
      () => {
        const index = this.tools.indexOf(tool);
        if (index >= 0) {
          this.tools.splice(index, 1);
        }
      },
      { once: true },
    );
  }
}

class AutoRespondingRegionWorker extends EventTarget {
  static instances: AutoRespondingRegionWorker[] = [];
  terminated = false;

  constructor() {
    super();
    AutoRespondingRegionWorker.instances.push(this);
  }

  postMessage(message: { type: string; requestId: string }) {
    if (message.type !== 'analyze') return;
    queueMicrotask(() => {
      this.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'result',
            requestId: message.requestId,
            result: {
              artworkId: 'pissarro-boulevard-montmartre',
              status: 'complete',
              analyzedLocally: true,
              model: {
                runtime: '@huggingface/transformers@3.8.1',
                backend: 'webgpu',
                detector: {
                  id: 'onnx-community/grounding-dino-tiny-ONNX',
                  revision: 'test-detector-revision',
                  dtype: 'q4f16',
                },
                refiner: {
                  id: 'Xenova/slimsam-77-uniform',
                  revision: 'test-refiner-revision',
                  dtype: 'q8',
                },
              },
              regions: [
                {
                  id: 'model-red-omnibus-test',
                  label: 'red omnibus',
                  confidence: 0.79,
                  bounds: { x: 0.4, y: 0.48, width: 0.18, height: 0.2 },
                  provenance: 'model-detected',
                  verification: 'unverified-model-suggestion',
                  model: {
                    runtime: '@huggingface/transformers@3.8.1',
                    backend: 'webgpu',
                    detector: {
                      id: 'onnx-community/grounding-dino-tiny-ONNX',
                      revision: 'test-detector-revision',
                      dtype: 'q4f16',
                    },
                    refiner: {
                      id: 'Xenova/slimsam-77-uniform',
                      revision: 'test-refiner-revision',
                      dtype: 'q8',
                    },
                  },
                },
              ],
            },
          },
        }),
      );
    });
  }

  terminate() {
    this.terminated = true;
  }
}

function createTestController(
  runRegionAnalysis?: RegionAnalysisRunner,
): GalleryController {
  let state = createInitialGalleryState();
  return createGalleryController({
    getState: () => state,
    applyAction: (action) => {
      state = galleryReducer(state, action);
      return state;
    },
    ...(runRegionAnalysis ? { runRegionAnalysis } : {}),
  });
}

function findTool(
  tools: readonly WebMCP.ModelContextTool[],
  name: string,
): WebMCP.ModelContextTool {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`Missing test tool: ${name}`);
  }
  return tool;
}

function executionOptions(signal = new AbortController().signal) {
  return { signal };
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
  Reflect.deleteProperty(document, 'modelContext');
  AutoRespondingRegionWorker.instances = [];
  vi.unstubAllGlobals();
});

describe('WebMCP probe contracts', () => {
  it('detects support and registers the gallery and region tools with cleanup', async () => {
    const modelContext = new FakeModelContext();
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: modelContext,
    });

    expect(supportsWebMcp()).toBe(true);
    const registration = registerGalleryTools(createTestController());
    expect(registration.supported).toBe(true);
    expect(await registration.ready).toBe(true);
    expect(modelContext.tools.map(({ name }) => name)).toEqual([
      'get_gallery_state',
      'list_artworks',
      'navigate_to_artwork',
      'set_experience_mode',
      'set_font_family',
      'set_font_size',
      'set_contrast',
      'set_color_theme',
      'set_content_language',
      'list_regions',
      'focus_artwork_area',
      'analyze_artwork_regions',
      'zoom_to_artwork_detail',
      'focus_region',
      'describe_region',
      'clear_region_focus',
    ]);

    registration.unregister();
    expect(modelContext.tools).toEqual([]);
  });

  it('uses closed schemas and accurate read/write annotations', () => {
    const tools = createGalleryTools(createTestController());

    for (const tool of tools) {
      expect(tool.inputSchema).toMatchObject({
        type: 'object',
        additionalProperties: false,
      });
    }
    expect(
      findTool(tools, 'get_gallery_state').annotations?.readOnlyHint,
    ).toBe(true);
    expect(findTool(tools, 'list_artworks').annotations?.readOnlyHint).toBe(
      true,
    );
    expect(
      findTool(tools, 'navigate_to_artwork').annotations?.readOnlyHint,
    ).toBe(false);
    expect(
      findTool(tools, 'set_experience_mode').annotations?.readOnlyHint,
    ).toBe(false);
    for (const name of [
      'set_font_family',
      'set_font_size',
      'set_contrast',
      'set_color_theme',
      'set_content_language',
    ]) {
      expect(findTool(tools, name).annotations?.readOnlyHint).toBe(false);
    }
    expect(findTool(tools, 'list_regions').annotations?.readOnlyHint).toBe(true);
    expect(
      findTool(tools, 'focus_artwork_area').annotations?.readOnlyHint,
    ).toBe(false);
    expect(findTool(tools, 'describe_region').annotations?.readOnlyHint).toBe(
      true,
    );
    expect(findTool(tools, 'focus_region').annotations?.readOnlyHint).toBe(false);
    expect(
      findTool(tools, 'analyze_artwork_regions').annotations?.readOnlyHint,
    ).toBe(false);
    expect(
      findTool(tools, 'zoom_to_artwork_detail').annotations?.readOnlyHint,
    ).toBe(false);
  });

  it('routes ordinary gallery language to the right tool and follow-up', () => {
    const tools = createGalleryTools(createTestController());
    const stateDescription = findTool(tools, 'get_gallery_state').description;
    const regionDescription = findTool(tools, 'describe_region').description;

    expect(stateDescription).toContain('tell me what you see');
    expect(stateDescription).toContain(
      'speakingStyle must govern the description’s interpretive tone and structure',
    );
    expect(stateDescription).toContain('does not replace your host persona');
    expect(stateDescription).toContain('focusedRegion is not null');
    expect(stateDescription).toContain('call describe_region with its id');
    expect(stateDescription).toContain('otherwise explain the whole visible artwork');
    expect(findTool(tools, 'list_artworks').description).toContain(
      'follow with navigate_to_artwork',
    );
    expect(findTool(tools, 'navigate_to_artwork').description).toContain(
      'call list_artworks first',
    );
    expect(findTool(tools, 'set_experience_mode').description).toContain(
      'continue with get_gallery_state',
    );
    expect(findTool(tools, 'list_regions').description).toContain(
      'focus_region or describe_region',
    );
    expect(findTool(tools, 'analyze_artwork_regions').description).toContain(
      'not for one specific detail; use zoom_to_artwork_detail',
    );
    expect(findTool(tools, 'zoom_to_artwork_detail').description).toContain(
      'follow with describe_region',
    );
    expect(findTool(tools, 'focus_region').description).toContain(
      'natural-language target without an id',
    );
    expect(regionDescription).toContain('visitor asks what they see');
    expect(regionDescription).toContain('currently selected speaking style');
    expect(regionDescription).toContain('mode-specific segments');
    expect(regionDescription).toContain('host persona');
    expect(findTool(tools, 'clear_region_focus').description).toContain(
      'asks to zoom out',
    );
  });

  it('keeps revision unchanged for both read-only tools', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);
    const before = controller.getState();

    const stateResult = (await findTool(tools, 'get_gallery_state').execute(
      {},
      executionOptions(),
    )) as SuccessResult;
    const listResult = (await findTool(tools, 'list_artworks').execute(
      { excludeCurrent: true },
      executionOptions(),
    )) as SuccessResult;

    expect(stateResult.ok).toBe(true);
    expect(stateResult.state.revision).toBe(0);
    expect(listResult.artworks?.map(({ id }) => id)).toEqual([
      'vermeer-woman-with-water-pitcher',
      'gifford-kauterskill-clove',
      'vangogh-wheat-field-cypresses',
      'hokusai-great-wave',
      'degas-dance-class',
    ]);
    expect(stateResult.state.collectionSize).toBe(6);
    expect(stateResult.state.speakingStyle).toEqual({
      label: 'Literal',
      instruction: 'Concrete visual detail, without invented meaning.',
    });
    expect(listResult.state.revision).toBe(0);
    expect(controller.getState()).toBe(before);
  });

  it('applies all five personalization tools through one live state', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);

    await findTool(tools, 'set_font_family').execute(
      { fontFamily: 'mono' },
      executionOptions(),
    );
    await findTool(tools, 'set_font_size').execute(
      { fontSize: 'extra-large' },
      executionOptions(),
    );
    await findTool(tools, 'set_contrast').execute(
      { contrast: 'high' },
      executionOptions(),
    );
    await findTool(tools, 'set_color_theme').execute(
      { theme: 'light' },
      executionOptions(),
    );
    const result = (await findTool(tools, 'set_content_language').execute(
      { language: 'es' },
      executionOptions(),
    )) as SuccessResult;

    expect(result.state).toMatchObject({
      artwork: {
        title: 'El bulevar Montmartre en una mañana de invierno',
      },
      personalization: {
        fontFamily: 'mono',
        fontSize: 'extra-large',
        contrast: 'high',
        theme: 'light',
        language: 'es',
      },
      revision: 5,
    });

    const repeated = (await findTool(tools, 'set_content_language').execute(
      { language: 'es' },
      executionOptions(),
    )) as SuccessResult;
    expect(repeated.state.revision).toBe(5);
  });

  it('rejects unknown personalization values without changing state', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);
    const before = controller.getState();

    const result = (await findTool(tools, 'set_font_family').execute(
      { fontFamily: 'papyrus' },
      executionOptions(),
    )) as ErrorResult;
    const extra = (await findTool(tools, 'set_color_theme').execute(
      { theme: 'light', surprise: true },
      executionOptions(),
    )) as ErrorResult;

    expect(result.error.code).toBe('UNKNOWN_FONT_FAMILY');
    expect(extra.error.code).toBe('INVALID_INPUT');
    expect(controller.getState()).toBe(before);
  });

  it('lists authored regions immediately and shares focus with the live state', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);

    const listing = (await findTool(tools, 'list_regions').execute(
      {},
      executionOptions(),
    )) as SuccessResult;
    expect(listing.regions).toHaveLength(3);
    expect(listing.regions?.every(({ provenance }) => provenance === 'authored')).toBe(
      true,
    );

    const focused = (await findTool(tools, 'focus_region').execute(
      { regionId: 'pissarro-left-tree' },
      executionOptions(),
    )) as SuccessResult;
    expect(focused.state).toMatchObject({
      focusedRegion: {
        id: 'pissarro-left-tree',
        provenance: 'authored',
      },
      availableRegionCount: 3,
    });
    expect(controller.getState().focusedRegionId).toBe('pissarro-left-tree');

    await findTool(tools, 'clear_region_focus').execute({}, executionOptions());
    expect(controller.getState().focusedRegionId).toBeNull();
  });

  it('describes the focused region in the selected style with explicit provenance', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);
    controller.setExperienceMode('story');
    controller.focusRegion('pissarro-boulevard-flow');

    const stateResult = (await findTool(tools, 'get_gallery_state').execute(
      {},
      executionOptions(),
    )) as SuccessResult;
    expect(stateResult.state.focusedRegion?.id).toBe(
      'pissarro-boulevard-flow',
    );

    const result = (await findTool(tools, 'describe_region').execute(
      { regionId: stateResult.state.focusedRegion?.id },
      executionOptions(),
    )) as SuccessResult;
    expect(result.state.speakingStyle).toEqual({
      label: 'Story',
      instruction: 'A narrative inspired by the work, not its history.',
    });
    expect(result.description?.mode).toBe('story');
    expect(result.description?.segments.map(({ provenance }) => provenance)).toEqual([
      'observed',
      'imagined',
    ]);
  });

  it('rejects stale region ids after navigation', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);
    controller.navigateToArtwork('degas-dance-class');

    const result = (await findTool(tools, 'focus_region').execute(
      { regionId: 'pissarro-left-tree' },
      executionOptions(),
    )) as ErrorResult;
    expect(result.error.code).toBe('UNKNOWN_OR_STALE_REGION');
    expect(controller.getState().focusedRegionId).toBeNull();
  });

  it('accepts only normalized model results and exposes analysis state', async () => {
    const runner: RegionAnalysisRunner = async ({ onProgress }) => {
      onProgress({
        phase: 'loading',
        progress: 0.4,
        message: 'Downloading local models.',
        backend: 'webgpu',
      });
      return {
        backend: 'webgpu',
        regions: [
          {
            id: 'pissarro-boulevard-montmartre--model--red-omnibus-a1b2',
            label: 'red omnibus',
            description: 'A local model suggests a red omnibus in this area.',
            bounds: { x: 0.42, y: 0.51, width: 0.14, height: 0.18 },
            confidence: 0.82,
            provenance: 'model-detected',
            model: {
              detector: 'onnx-community/grounding-dino-tiny-ONNX',
              detectorRevision: 'test-revision',
              backend: 'webgpu',
            },
          },
        ],
      };
    };
    const controller = createTestController(runner);
    const result = (await findTool(
      createGalleryTools(controller),
      'analyze_artwork_regions',
    ).execute({ labels: ['red omnibus'] }, executionOptions())) as SuccessResult;

    expect(result.ok).toBe(true);
    expect(result.regions).toHaveLength(4);
    expect(result.state).toMatchObject({
      availableRegionCount: 4,
      regionAnalysis: { phase: 'complete', backend: 'webgpu' },
    });
  });

  it('runs a natural-language model query and atomically focuses the strongest match', async () => {
    const runner: RegionAnalysisRunner = async (request) => {
      expect(request.labels).toEqual(['the boats beneath the wave']);
      expect(request.threshold).toBe(0.12);
      expect(request.maxRegions).toBe(4);
      for (let index = 0; index <= 100; index += 1) {
        request.onProgress({
          phase: 'loading',
          progress: index / 100,
          message: 'Downloading local model chunks.',
          backend: 'webgpu',
        });
      }
      return {
        backend: 'webgpu',
        regions: [
          {
            id: 'hokusai-great-wave--model--boats-low',
            label: 'boats',
            description: 'A lower-confidence local model suggestion.',
            bounds: { x: 0.14, y: 0.62, width: 0.24, height: 0.2 },
            confidence: 0.44,
            provenance: 'model-detected',
          },
          {
            id: 'hokusai-great-wave--model--boats-best',
            label: 'boats beneath the wave',
            description: 'The strongest local model suggestion.',
            bounds: { x: 0.24, y: 0.54, width: 0.31, height: 0.24 },
            confidence: 0.87,
            provenance: 'model-detected',
            model: {
              detector: 'onnx-community/grounding-dino-tiny-ONNX',
              detectorRevision: 'test-revision',
              refiner: 'Xenova/slimsam-77-uniform',
              refinerRevision: 'test-refiner-revision',
              backend: 'webgpu',
            },
          },
        ],
      };
    };
    const controller = createTestController(runner);
    controller.navigateToArtwork('hokusai-great-wave');

    const result = (await findTool(
      createGalleryTools(controller),
      'zoom_to_artwork_detail',
    ).execute(
      { query: '  the boats beneath the wave  ' },
      executionOptions(),
    )) as SuccessResult;

    expect(result).toMatchObject({
      ok: true,
      action: 'zoom_to_artwork_detail',
      query: 'the boats beneath the wave',
      verification: 'unverified-model-suggestion',
      region: {
        id: 'hokusai-great-wave--model--boats-best',
        provenance: 'model-detected',
        confidence: 0.87,
      },
      state: {
        focusedRegion: {
          id: 'hokusai-great-wave--model--boats-best',
          provenance: 'model-detected',
        },
        regionAnalysis: { phase: 'complete', backend: 'webgpu' },
      },
    });
    expect(controller.getState().focusedRegionId).toBe(
      'hokusai-great-wave--model--boats-best',
    );
    expect(controller.getState().revision).toBeLessThan(20);
  });

  it('prefers a matching authored detail over an unverified model box', async () => {
    const runner = vi.fn<RegionAnalysisRunner>();
    const controller = createTestController(runner);
    controller.navigateToArtwork('hokusai-great-wave');

    const result = (await findTool(
      createGalleryTools(controller),
      'zoom_to_artwork_detail',
    ).execute(
      { query: 'the Japanese inscriptions in the upper-left corner' },
      executionOptions(),
    )) as SuccessResult;

    expect(result).toMatchObject({
      ok: true,
      action: 'zoom_to_artwork_detail',
      verification: 'gallery-authored-region',
      region: {
        id: 'hokusai-title-cartouche-signature',
        provenance: 'authored',
        bounds: { x: 0.012, y: 0.05, width: 0.085, height: 0.26 },
      },
      state: {
        focusedRegion: {
          id: 'hokusai-title-cartouche-signature',
          provenance: 'authored',
        },
        regionAnalysis: { phase: 'idle', backend: 'authored' },
      },
    });
    expect(runner).not.toHaveBeenCalled();
  });

  it('lets a visual agent add and focus normalized bounds without local inference', async () => {
    const runner = vi.fn<RegionAnalysisRunner>();
    const controller = createTestController(runner);
    controller.navigateToArtwork('hokusai-great-wave');
    const tool = findTool(createGalleryTools(controller), 'focus_artwork_area');

    const result = (await tool.execute(
      {
        label: 'Japanese inscriptions',
        description:
          'A vertical title cartouche and Hokusai signature appear at the upper left.',
        bounds: { x: 0.012, y: 0.05, width: 0.085, height: 0.26 },
      },
      executionOptions(),
    )) as SuccessResult;

    expect(result).toMatchObject({
      ok: true,
      action: 'focus_artwork_area',
      verification: 'agent-grounded-visual-selection',
      region: {
        id: expect.stringMatching(/^agent-japanese-inscriptions-/),
        label: 'Japanese inscriptions',
        provenance: 'agent-grounded',
        bounds: { x: 0.012, y: 0.05, width: 0.085, height: 0.26 },
      },
      state: {
        focusedRegion: { provenance: 'agent-grounded' },
        availableRegionCount: 5,
        regionAnalysis: { phase: 'idle', backend: 'authored' },
      },
    });
    expect(result.region?.confidence).toBeUndefined();
    expect(runner).not.toHaveBeenCalled();

    const invalid = (await tool.execute(
      {
        label: 'Outside',
        bounds: { x: 0.9, y: 0.1, width: 0.2, height: 0.2 },
      },
      executionOptions(),
    )) as ErrorResult;
    expect(invalid.error.code).toBe('INVALID_INPUT');
  });

  it('returns a recoverable not-found result when a natural-language query has no accepted match', async () => {
    const controller = createTestController(async () => ({
      backend: 'webgpu',
      regions: [],
    }));
    const result = (await findTool(
      createGalleryTools(controller),
      'zoom_to_artwork_detail',
    ).execute({ query: 'a purple airship' }, executionOptions())) as ErrorResult;

    expect(result.error.code).toBe('DETAIL_NOT_FOUND');
    expect(controller.getState().focusedRegionId).toBeNull();
    expect(controller.getState().regionAnalysis[controller.getState().artworkId]).toMatchObject({
      phase: 'complete',
      backend: 'webgpu',
    });
  });

  it('keeps authored fallback and returns a recoverable model error', async () => {
    const controller = createTestController(async () => {
      throw new Error('Mocked operator failure');
    });
    const tools = createGalleryTools(controller);
    const result = (await findTool(tools, 'analyze_artwork_regions').execute(
      {},
      executionOptions(),
    )) as ErrorResult;

    expect(result.error.code).toBe('LOCAL_ANALYSIS_FAILED');
    expect(controller.getState().regionAnalysis[controller.getState().artworkId]).toMatchObject({
      phase: 'failed',
      backend: 'authored',
    });
    const listing = (await findTool(tools, 'list_regions').execute(
      {},
      executionOptions(),
    )) as SuccessResult;
    expect(listing.regions).toHaveLength(3);
  });

  it('returns recoverable errors and never changes state for invalid calls', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);
    const before = controller.getState();

    const unknownArtwork = (await findTool(
      tools,
      'navigate_to_artwork',
    ).execute(
      { artworkId: 'missing-artwork' },
      executionOptions(),
    )) as ErrorResult;
    const unknownMode = (await findTool(tools, 'set_experience_mode').execute(
      { mode: 'chaos' },
      executionOptions(),
    )) as ErrorResult;
    const extraProperty = (await findTool(tools, 'get_gallery_state').execute(
      { surprise: true },
      executionOptions(),
    )) as ErrorResult;

    expect(unknownArtwork).toMatchObject({
      ok: false,
      error: {
        code: 'UNKNOWN_ARTWORK',
        recovery: { validArtworks: expect.any(Array) },
      },
    });
    expect(unknownMode).toMatchObject({
      ok: false,
      error: {
        code: 'UNKNOWN_MODE',
        recovery: { validModes: expect.any(Array) },
      },
    });
    expect(extraProperty.error.code).toBe('INVALID_INPUT');
    expect(controller.getState()).toBe(before);
    expect(controller.getState().revision).toBe(0);
  });

  it('does not apply a mutation after execution has already been cancelled', async () => {
    const controller = createTestController();
    const tool = findTool(createGalleryTools(controller), 'navigate_to_artwork');
    const cancellation = new AbortController();
    cancellation.abort();

    const result = (await tool.execute(
      { artworkId: 'hokusai-great-wave' },
      executionOptions(cancellation.signal),
    )) as ErrorResult;

    expect(result.error.code).toBe('EXECUTION_CANCELLED');
    expect(controller.getState()).toEqual(createInitialGalleryState());
    expect(window.location.search).toBe('');
  });

  it('applies mutations when the runtime omits callback options', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);

    const modeResult = (await findTool(
      tools,
      'set_experience_mode',
    ).execute({ mode: 'story' })) as SuccessResult;
    const navigationResult = (await findTool(
      tools,
      'navigate_to_artwork',
    ).execute({ artworkId: 'hokusai-great-wave' })) as SuccessResult;

    expect(modeResult).toMatchObject({
      ok: true,
      state: {
        mode: 'story',
        speakingStyle: {
          label: 'Story',
          instruction: 'A narrative inspired by the work, not its history.',
        },
        revision: 1,
      },
    });
    expect(navigationResult).toMatchObject({
      ok: true,
      state: {
        artwork: { id: 'hokusai-great-wave' },
        mode: 'story',
        revision: 2,
      },
    });
    expect(controller.getState()).toMatchObject({
      artworkId: 'hokusai-great-wave',
      mode: 'story',
      revision: 2,
    });
  });

  it('routes tool mutations through the live App controller without losing tools', async () => {
    const modelContext = new FakeModelContext();
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: modelContext,
    });

    const { unmount } = render(createElement(App));
    await waitFor(() => expect(modelContext.tools).toHaveLength(16));

    await act(async () => {
      await findTool(modelContext.tools, 'set_experience_mode').execute(
        { mode: 'story' },
        executionOptions(),
      );
      await findTool(modelContext.tools, 'navigate_to_artwork').execute(
        { artworkId: 'hokusai-great-wave' },
        executionOptions(),
      );
    });

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Under the Wave off Kanagawa (The Great Wave)',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Mode: Story');
    expect(document.querySelector('.gallery')).toHaveAttribute(
      'data-mode',
      'story',
    );
    expect(window.location.search).toBe('?artwork=hokusai-great-wave');
    expect(modelContext.tools).toHaveLength(16);

    // The tool-set mode is the chosen option of the wall-label control.
    const checkedStyle = (group: HTMLElement) =>
      within(group)
        .getAllByRole('radio')
        .find((option) => option.getAttribute('aria-checked') === 'true')
        ?.textContent;

    const wallLabelGroup = within(
      document.querySelector<HTMLElement>('.gallery')!,
    ).getByRole('radiogroup', { name: 'Speaking style' });
    expect(checkedStyle(wallLabelGroup)).toBe('4Story');

    // ...and the settings copy of the same control agrees with it.
    fireEvent.click(screen.getByRole('button', { name: 'Gallery settings' }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(
      checkedStyle(
        within(dialog).getByRole('radiogroup', { name: 'Speaking style' }),
      ),
    ).toBe('4Story');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Close gallery settings' }),
    );

    unmount();
    expect(modelContext.tools).toHaveLength(0);
  });

  it('keeps the lazy model client usable through StrictMode effect replay', async () => {
    vi.stubGlobal('Worker', AutoRespondingRegionWorker);
    const modelContext = new FakeModelContext();
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: modelContext,
    });

    const { unmount } = render(
      createElement(StrictMode, null, createElement(App)),
    );
    await waitFor(() => expect(modelContext.tools).toHaveLength(16));

    let result: SuccessResult | undefined;
    await act(async () => {
      result = (await findTool(
        modelContext.tools,
        'zoom_to_artwork_detail',
      ).execute(
        { query: 'red omnibus' },
        executionOptions(),
      )) as SuccessResult;
    });

    expect(result).toMatchObject({
      ok: true,
      state: {
        focusedRegion: {
          provenance: 'model-detected',
        },
        regionAnalysis: { phase: 'complete', backend: 'webgpu' },
      },
    });
    expect(AutoRespondingRegionWorker.instances).toHaveLength(1);
    expect(AutoRespondingRegionWorker.instances[0]?.terminated).toBe(false);

    unmount();
    await Promise.resolve();
    expect(AutoRespondingRegionWorker.instances[0]?.terminated).toBe(true);
  });

  it('leaves the manual gallery available when WebMCP is unsupported', async () => {
    expect(supportsWebMcp()).toBe(false);
    const registration = registerGalleryTools(createTestController());
    expect(registration.supported).toBe(false);
    expect(await registration.ready).toBe(false);
    expect(() => registration.unregister()).not.toThrow();
  });
});
