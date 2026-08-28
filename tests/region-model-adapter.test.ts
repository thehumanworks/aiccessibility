import {
  createTransformersRegionAdapter,
  REGION_MODEL_BUNDLE,
  type TransformersBindings,
} from '../src/regions/transformers-adapter';
import type { RawRegionDetection } from '../src/regions/acceptance';

class FakeTensor {
  readonly dispose = vi.fn();

  constructor(
    readonly type: 'float32' | 'int64',
    readonly data: ArrayLike<number | bigint | boolean>,
    readonly dims: number[],
  ) {}
}

function makeBindings(options: {
  webGpuInferenceFails?: boolean;
  webGpuLoadFails?: boolean;
}) {
  const detections: RawRegionDetection[] = [
    {
      label: 'tree',
      score: 0.81,
      box: { xmin: 0.1, ymin: 0.1, xmax: 0.4, ymax: 0.9 },
    },
    {
      label: 'boat',
      score: 0.72,
      box: { xmin: 0.62, ymin: 0.65, xmax: 0.9, ymax: 0.88 },
    },
  ];
  const detectors: Array<ReturnType<typeof vi.fn> & { dispose: ReturnType<typeof vi.fn> }> = [];
  const samModels: Array<ReturnType<typeof vi.fn> & {
    get_image_embeddings: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  }> = [];
  const processor = Object.assign(
    vi.fn(async (_image, processorOptions?: { input_boxes?: number[][][] }) => ({
      pixel_values: new FakeTensor('float32', [0], [1, 3, 10, 10]),
      original_sizes: [[10, 10] as [number, number]],
      reshaped_input_sizes: [[10, 10] as [number, number]],
      ...(processorOptions?.input_boxes
        ? {
            input_boxes: new FakeTensor(
              'float32',
              processorOptions.input_boxes.flat(2),
              [1, processorOptions.input_boxes[0]!.length, 4],
            ),
          }
        : {}),
    })),
    {
      post_process_masks: vi.fn(async (_masks, _original, _reshaped) => {
        const data = new Uint8Array(2 * 3 * 10 * 10);
        data.fill(1, 0, 100);
        data.fill(1, 4 * 100, 5 * 100);
        return [new FakeTensor('float32', data, [2, 3, 10, 10])];
      }),
    },
  );
  const pipeline = vi.fn(async (_task, _model, loadOptions: Record<string, unknown>) => {
    const backend = loadOptions.device as 'webgpu' | 'wasm';
    if (backend === 'webgpu' && options.webGpuLoadFails) {
      throw new Error('WebGPU operator not supported');
    }
    const detector = Object.assign(
      vi.fn(async () => {
        if (backend === 'webgpu' && options.webGpuInferenceFails) {
          throw new Error('WebGPU inference failed');
        }
        return detections;
      }),
      { dispose: vi.fn() },
    );
    detectors.push(detector);
    return detector;
  });
  const fromPretrained = vi.fn(async (_model, loadOptions: Record<string, unknown>) => {
    const backend = loadOptions.device as 'webgpu' | 'wasm';
    const getImageEmbeddings = vi.fn(async () => ({
      image_embeddings: new FakeTensor('float32', [1], [1, 1, 1, 1]),
      image_positional_embeddings: new FakeTensor('float32', [1], [1, 1, 1, 1]),
    }));
    const sam = Object.assign(
      vi.fn(async (inputs: Record<string, FakeTensor>) => {
        if (backend === 'webgpu' && options.webGpuInferenceFails) {
          throw new Error('WebGPU SAM failed');
        }
        const boxes = inputs.input_boxes!;
        const regionCount = boxes.dims[1]!;
        return {
          pred_masks: new FakeTensor(
            'float32',
            new Float32Array(regionCount * 3 * 4),
            [1, regionCount, 3, 2, 2],
          ),
          iou_scores: new FakeTensor(
            'float32',
            regionCount === 2
              ? [0.91, 0.2, 0.1, 0.1, 0.88, 0.2]
              : [0.91, 0.2, 0.1],
            [1, regionCount, 3],
          ),
        };
      }),
      { get_image_embeddings: getImageEmbeddings, dispose: vi.fn() },
    );
    samModels.push(sam);
    return sam;
  });
  const bindings = {
    pipeline,
    SamModel: { from_pretrained: fromPretrained },
    AutoProcessor: { from_pretrained: vi.fn(async () => processor) },
    RawImage: { fromURL: vi.fn(async () => ({ width: 10, height: 10 })) },
    Tensor: FakeTensor,
  } as unknown as TransformersBindings;

  return { bindings, pipeline, processor, detectors, samModels, fromPretrained };
}

const request = {
  artworkId: 'painting',
  imageUrl: '/painting.jpg',
  candidateLabels: ['tree', 'boat'],
  acceptanceThreshold: 0.2,
};

describe('Transformers.js region model adapter', () => {
  it('pins both models, prefers q4f16 WebGPU, refines accepted boxes, and reuses embeddings', async () => {
    const mock = makeBindings({});
    const adapter = createTransformersRegionAdapter({
      loadBindings: async () => mock.bindings,
      canUseWebGpu: async () => true,
    });

    const first = await adapter.analyze(request);
    const second = await adapter.analyze(request);

    expect(mock.pipeline).toHaveBeenCalledWith(
      'zero-shot-object-detection',
      REGION_MODEL_BUNDLE.detector.id,
      expect.objectContaining({
        revision: REGION_MODEL_BUNDLE.detector.revision,
        device: 'webgpu',
        dtype: 'q4f16',
      }),
    );
    expect(mock.fromPretrained).toHaveBeenCalledWith(
      REGION_MODEL_BUNDLE.refiner.id,
      expect.objectContaining({
        revision: REGION_MODEL_BUNDLE.refiner.revision,
        device: 'wasm',
        dtype: 'q8',
      }),
    );
    expect(mock.detectors[0]).toHaveBeenCalledWith(
      '/painting.jpg',
      ['tree. boat.'],
      expect.objectContaining({ percentage: true }),
    );
    expect(first.regions).toHaveLength(2);
    expect(first.regions[0]).toMatchObject({
      provenance: 'model-detected',
      verification: 'unverified-model-suggestion',
      mask: { encoding: 'binary-rle-v1' },
    });
    expect(second.regions.map(({ id }) => id)).toEqual(
      first.regions.map(({ id }) => id),
    );
    expect(mock.samModels[0]!.get_image_embeddings).toHaveBeenCalledTimes(1);
    const samInputs = mock.samModels[0]!.mock.calls[0]?.[0] as Record<
      string,
      FakeTensor
    >;
    expect(samInputs.input_boxes!.dims).toEqual([1, 2, 4]);
    expect(samInputs.input_points!.dims).toEqual([1, 2, 0, 2]);
    expect(samInputs.input_labels!.dims).toEqual([1, 2, 0]);

    await adapter.dispose();
    expect(mock.detectors[0]!.dispose).toHaveBeenCalledTimes(1);
    expect(mock.samModels[0]!.dispose).toHaveBeenCalledTimes(1);
  });

  it('falls back to WASM when WebGPU model loading fails', async () => {
    const mock = makeBindings({ webGpuLoadFails: true });
    const progress = vi.fn();
    const adapter = createTransformersRegionAdapter({
      loadBindings: async () => mock.bindings,
      canUseWebGpu: async () => true,
    });

    const result = await adapter.analyze(request, progress);

    expect(result.model).toMatchObject({
      backend: 'wasm',
      detector: { dtype: 'q8' },
    });
    expect(mock.pipeline.mock.calls.map((call) => call[2]?.device)).toEqual([
      'webgpu',
      'wasm',
    ]);
    expect(progress).toHaveBeenCalledWith(
      expect.objectContaining({ phase: 'fallback', backend: 'wasm' }),
    );
  });

  it('disposes the WebGPU runtime and retries with WASM after inference failure', async () => {
    const mock = makeBindings({ webGpuInferenceFails: true });
    const progress = vi.fn();
    const adapter = createTransformersRegionAdapter({
      loadBindings: async () => mock.bindings,
      canUseWebGpu: async () => true,
    });

    const result = await adapter.analyze(request, progress);

    expect(result.model.backend).toBe('wasm');
    expect(mock.detectors).toHaveLength(2);
    expect(mock.detectors[0]!.dispose).toHaveBeenCalledTimes(1);
    expect(mock.samModels[0]!.dispose).toHaveBeenCalledTimes(1);
    expect(progress).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'fallback',
        message: expect.stringContaining('retrying'),
      }),
    );
  });

  it('surfaces a safe failure after WASM errors so authored fallback can remain active', async () => {
    const mock = makeBindings({});
    mock.pipeline.mockImplementation(async () => {
      throw new Error('model unavailable');
    });
    const progress = vi.fn();
    const adapter = createTransformersRegionAdapter({
      loadBindings: async () => mock.bindings,
      canUseWebGpu: async () => false,
    });

    await expect(adapter.analyze(request, progress)).rejects.toThrow(
      'model unavailable',
    );
    expect(progress).toHaveBeenLastCalledWith(
      expect.objectContaining({
        phase: 'failed',
        message: expect.stringContaining('Authored artwork regions remain available'),
      }),
    );
  });
});
