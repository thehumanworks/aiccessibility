import {
  acceptDetections,
  sanitizeCandidateLabels,
  type AcceptedRegionDetection,
  type RawRegionDetection,
} from './acceptance';
import { compactMaskFromTensor, type MaskTensorLike } from './mask';
import type {
  AnalyzeArtworkRegionsInput,
  AnalyzeArtworkRegionsResult,
  ModelDetectedRegion,
  RegionModelBackend,
  RegionModelMetadata,
  RegionProgressListener,
} from './types';

export const REGION_MODEL_BUNDLE = {
  runtime: '@huggingface/transformers@3.8.1',
  detector: {
    id: 'onnx-community/owlv2-base-patch16-ensemble-ONNX',
    revision: '180d6ef7599bd69bb48db5c72bd49ad03ddfab80',
  },
  refiner: {
    id: 'Xenova/slimsam-77-uniform',
    // This export accepts points and boxes; `main` historically accepted points only.
    revision: '7c8459c48dabad6291b384c97be46c451c25d6c4',
  },
} as const;

interface DisposableLike {
  dispose: () => void | Promise<unknown>;
}

interface TensorLike extends MaskTensorLike, DisposableLike {}

interface ProcessedSamImage {
  pixel_values: TensorLike;
  original_sizes: [number, number][];
  reshaped_input_sizes: [number, number][];
  input_boxes?: TensorLike;
}

interface SamOutputs {
  pred_masks: TensorLike;
  iou_scores: TensorLike;
}

interface SamModelLike extends DisposableLike {
  (inputs: Record<string, unknown>): Promise<SamOutputs>;
  get_image_embeddings: (
    inputs: Pick<ProcessedSamImage, 'pixel_values'>,
  ) => Promise<Record<string, TensorLike>>;
}

interface SamProcessorLike {
  (
    image: RawImageLike,
    options?: { input_boxes?: number[][][] },
  ): Promise<ProcessedSamImage>;
  post_process_masks: (
    masks: TensorLike,
    originalSizes: [number, number][],
    reshapedInputSizes: [number, number][],
  ) => Promise<TensorLike[]>;
}

interface RawImageLike {
  width: number;
  height: number;
}

interface DetectorLike extends DisposableLike {
  (
    image: string,
    labels: string[],
    options: { threshold: number; top_k: number; percentage: true },
  ): Promise<RawRegionDetection[]>;
}

interface TransformersProgress {
  status: string;
  file?: string;
  progress?: number;
}

export interface TransformersBindings {
  pipeline: (
    task: 'zero-shot-object-detection',
    model: string,
    options: Record<string, unknown>,
  ) => Promise<DetectorLike>;
  SamModel: {
    from_pretrained: (
      model: string,
      options: Record<string, unknown>,
    ) => Promise<SamModelLike>;
  };
  AutoProcessor: {
    from_pretrained: (
      model: string,
      options: Record<string, unknown>,
    ) => Promise<SamProcessorLike>;
  };
  RawImage: {
    fromURL: (url: string) => Promise<RawImageLike>;
  };
  Tensor: new (
    type: 'float32' | 'int64',
    data: number[] | bigint[],
    dimensions: number[],
  ) => TensorLike;
}

export interface RegionModelAdapter {
  analyze: (
    input: AnalyzeArtworkRegionsInput,
    onProgress?: RegionProgressListener,
  ) => Promise<AnalyzeArtworkRegionsResult>;
  dispose: () => Promise<void>;
}

interface LoadedRuntime {
  backend: RegionModelBackend;
  metadata: RegionModelMetadata;
  bindings: TransformersBindings;
  detector: DetectorLike;
  samModel: SamModelLike;
  samProcessor: SamProcessorLike;
}

interface EmbeddingCacheEntry {
  key: string;
  image: RawImageLike;
  embeddings: Record<string, TensorLike>;
  originalSizes: [number, number][];
  reshapedInputSizes: [number, number][];
}

export interface TransformersRegionAdapterOptions {
  loadBindings?: () => Promise<TransformersBindings>;
  canUseWebGpu?: () => Promise<boolean>;
  embeddingCacheSize?: number;
}

async function defaultLoadBindings(): Promise<TransformersBindings> {
  return (await import('@huggingface/transformers')) as unknown as TransformersBindings;
}

async function defaultCanUseWebGpu(): Promise<boolean> {
  const workerNavigator = globalThis.navigator as Navigator & {
    gpu?: { requestAdapter: () => Promise<unknown> };
  };
  if (!workerNavigator?.gpu) return false;
  try {
    return Boolean(await workerNavigator.gpu.requestAdapter());
  } catch {
    return false;
  }
}

function progressCallback(
  onProgress: RegionProgressListener | undefined,
  backend: RegionModelBackend,
) {
  return (event: TransformersProgress) => {
    if (!onProgress) return;
    const progress =
      typeof event.progress === 'number'
        ? Math.min(1, Math.max(0, event.progress / 100))
        : undefined;
    onProgress({
      phase: 'loading',
      message:
        event.status === 'progress'
          ? 'Downloading local artwork-analysis models…'
          : 'Preparing local artwork-analysis models…',
      ...(progress === undefined ? {} : { progress }),
      backend,
      ...(event.file ? { file: event.file } : {}),
    });
  };
}
async function safelyDispose(value: DisposableLike | undefined): Promise<void> {
  if (!value) return;
  try {
    await value.dispose();
  } catch {
    // Disposal is best-effort and must not hide the analysis result/error.
  }
}

function scoreAt(tensor: TensorLike, index: number): number {
  const value = tensor.data[index];
  return typeof value === 'bigint' ? Number(value) : Number(value ?? 0);
}

function asFourDimensionalMask(tensor: TensorLike): MaskTensorLike | undefined {
  if (tensor.dims.length === 4) return tensor;
  if (tensor.dims.length === 3) {
    return { data: tensor.data, dims: [1, ...tensor.dims] };
  }
  return undefined;
}

export function createTransformersRegionAdapter(
  options: TransformersRegionAdapterOptions = {},
): RegionModelAdapter {
  const loadBindings = options.loadBindings ?? defaultLoadBindings;
  const canUseWebGpu = options.canUseWebGpu ?? defaultCanUseWebGpu;
  const embeddingCacheSize = Math.max(
    1,
    Math.min(6, options.embeddingCacheSize ?? 2),
  );
  const embeddings = new Map<string, EmbeddingCacheEntry>();
  let runtimePromise: Promise<LoadedRuntime> | undefined;
  let runtime: LoadedRuntime | undefined;
  let forceWasm = false;
  let disposed = false;

  const clearEmbeddings = async () => {
    for (const entry of embeddings.values()) {
      for (const tensor of Object.values(entry.embeddings)) {
        await safelyDispose(tensor);
      }
    }
    embeddings.clear();
  };

  const disposeRuntime = async () => {
    await clearEmbeddings();
    if (!runtime) return;
    await Promise.all([
      safelyDispose(runtime.detector),
      safelyDispose(runtime.samModel),
    ]);
    runtime = undefined;
    runtimePromise = undefined;
  };

  const loadAttempt = async (
    bindings: TransformersBindings,
    backend: RegionModelBackend,
    onProgress?: RegionProgressListener,
  ): Promise<LoadedRuntime> => {
    const detectorDtype = backend === 'webgpu' ? 'q4f16' : 'q8';
    const callback = progressCallback(onProgress, backend);
    let detector: DetectorLike | undefined;
    let samModel: SamModelLike | undefined;
    try {
      detector = await bindings.pipeline(
        'zero-shot-object-detection',
        REGION_MODEL_BUNDLE.detector.id,
        {
          revision: REGION_MODEL_BUNDLE.detector.revision,
          device: backend,
          dtype: detectorDtype,
          progress_callback: callback,
        },
      );
      samModel = await bindings.SamModel.from_pretrained(
        REGION_MODEL_BUNDLE.refiner.id,
        {
          revision: REGION_MODEL_BUNDLE.refiner.revision,
          device: backend,
          dtype: 'q8',
          progress_callback: callback,
        },
      );
      const samProcessor = await bindings.AutoProcessor.from_pretrained(
        REGION_MODEL_BUNDLE.refiner.id,
        {
          revision: REGION_MODEL_BUNDLE.refiner.revision,
          progress_callback: callback,
        },
      );
      return {
        backend,
        bindings,
        detector,
        samModel,
        samProcessor,
        metadata: {
          runtime: REGION_MODEL_BUNDLE.runtime,
          backend,
          detector: {
            ...REGION_MODEL_BUNDLE.detector,
            dtype: detectorDtype,
          },
          refiner: { ...REGION_MODEL_BUNDLE.refiner, dtype: 'q8' },
        },
      };
    } catch (error) {
      await Promise.all([safelyDispose(detector), safelyDispose(samModel)]);
      throw error;
    }
  };

  const loadRuntime = async (
    onProgress?: RegionProgressListener,
  ): Promise<LoadedRuntime> => {
    if (disposed) throw new Error('Region model adapter has been disposed.');
    if (runtime) return runtime;
    if (runtimePromise) return runtimePromise;

    runtimePromise = (async () => {
      const bindings = await loadBindings();
      if (!forceWasm && (await canUseWebGpu())) {
        try {
          return await loadAttempt(bindings, 'webgpu', onProgress);
        } catch {
          onProgress?.({
            phase: 'fallback',
            message: 'WebGPU was unavailable for this model; continuing locally with WASM.',
            backend: 'wasm',
          });
        }
      }
      return loadAttempt(bindings, 'wasm', onProgress);
    })();

    try {
      runtime = await runtimePromise;
      return runtime;
    } catch (error) {
      runtimePromise = undefined;
      throw error;
    }
  };

  const getEmbedding = async (
    loaded: LoadedRuntime,
    input: AnalyzeArtworkRegionsInput,
  ): Promise<EmbeddingCacheEntry> => {
    const key = `${input.artworkId}|${input.imageUrl}`;
    const cached = embeddings.get(key);
    if (cached) {
      embeddings.delete(key);
      embeddings.set(key, cached);
      return cached;
    }

    const image = await loaded.bindings.RawImage.fromURL(input.imageUrl);
    const processed = await loaded.samProcessor(image);
    const imageEmbeddings = await loaded.samModel.get_image_embeddings(processed);
    await safelyDispose(processed.pixel_values);
    const entry = {
      key,
      image,
      embeddings: imageEmbeddings,
      originalSizes: processed.original_sizes,
      reshapedInputSizes: processed.reshaped_input_sizes,
    };
    embeddings.set(key, entry);

    while (embeddings.size > embeddingCacheSize) {
      const oldest = embeddings.values().next().value as
        | EmbeddingCacheEntry
        | undefined;
      if (!oldest) break;
      embeddings.delete(oldest.key);
      for (const tensor of Object.values(oldest.embeddings)) {
        await safelyDispose(tensor);
      }
    }
    return entry;
  };

  const refineMasks = async (
    loaded: LoadedRuntime,
    input: AnalyzeArtworkRegionsInput,
    accepted: AcceptedRegionDetection[],
    onProgress?: RegionProgressListener,
  ): Promise<Array<ModelDetectedRegion['mask']>> => {
    if (accepted.length === 0) return [];
    onProgress?.({
      phase: 'refining',
      message: `Refining ${accepted.length} detected region${accepted.length === 1 ? '' : 's'} locally…`,
      progress: 0.72,
      backend: loaded.backend,
    });
    const cached = await getEmbedding(loaded, input);
    const boxes = accepted.map(({ bounds }) => [
      bounds.x * cached.image.width,
      bounds.y * cached.image.height,
      (bounds.x + bounds.width) * cached.image.width,
      (bounds.y + bounds.height) * cached.image.height,
    ]);
    const processed = await loaded.samProcessor(cached.image, {
      input_boxes: [boxes],
    });
    if (!processed.input_boxes) {
      await safelyDispose(processed.pixel_values);
      throw new Error('SlimSAM processor did not produce box prompts.');
    }

    const emptyPoints = new loaded.bindings.Tensor(
      'float32',
      [],
      [1, accepted.length, 0, 2],
    );
    const emptyLabels = new loaded.bindings.Tensor(
      'int64',
      [],
      [1, accepted.length, 0],
    );
    let output: SamOutputs | undefined;
    let masks: TensorLike[] = [];
    try {
      output = await loaded.samModel({
        ...cached.embeddings,
        input_points: emptyPoints,
        input_labels: emptyLabels,
        input_boxes: processed.input_boxes,
      });
      masks = await loaded.samProcessor.post_process_masks(
        output.pred_masks,
        cached.originalSizes,
        cached.reshapedInputSizes,
      );
      const firstMask = masks[0] ? asFourDimensionalMask(masks[0]) : undefined;
      const maskCount = output.iou_scores.dims.at(-1) ?? 0;

      return accepted.map((region, regionIndex) => {
        let bestIndex = 0;
        let bestScore = scoreAt(output!.iou_scores, regionIndex * maskCount);
        for (let index = 1; index < maskCount; index += 1) {
          const score = scoreAt(
            output!.iou_scores,
            regionIndex * maskCount + index,
          );
          if (score > bestScore) {
            bestIndex = index;
            bestScore = score;
          }
        }
        return firstMask
          ? compactMaskFromTensor(
              firstMask,
              regionIndex,
              bestIndex,
              region.bounds,
              bestScore,
            )
          : undefined;
      });
    } finally {
      await Promise.all([
        safelyDispose(emptyPoints),
        safelyDispose(emptyLabels),
        safelyDispose(processed.input_boxes),
        safelyDispose(processed.pixel_values),
        safelyDispose(output?.pred_masks),
        safelyDispose(output?.iou_scores),
        ...masks.map((mask) => safelyDispose(mask)),
      ]);
    }
  };

  const analyzeWithRuntime = async (
    loaded: LoadedRuntime,
    input: AnalyzeArtworkRegionsInput,
    onProgress?: RegionProgressListener,
  ): Promise<AnalyzeArtworkRegionsResult> => {
    const labels = sanitizeCandidateLabels(input.candidateLabels);
    const detectionThreshold = Math.min(
      1,
      Math.max(0.01, input.detectionThreshold ?? 0.08),
    );
    const acceptanceThreshold = Math.min(
      1,
      Math.max(detectionThreshold, input.acceptanceThreshold ?? 0.14),
    );
    const maxRegions = Math.max(1, Math.min(12, input.maxRegions ?? 8));
    onProgress?.({
      phase: 'detecting',
      message: 'Looking for candidate artwork regions locally…',
      progress: 0.58,
      backend: loaded.backend,
    });
    const detections = await loaded.detector(input.imageUrl, labels, {
      threshold: detectionThreshold,
      top_k: Math.min(48, maxRegions * 4),
      percentage: true,
    });
    const accepted = acceptDetections(detections, {
      threshold: acceptanceThreshold,
      maxRegions,
    });
    const masks = await refineMasks(loaded, input, accepted, onProgress);
    const regions = accepted.map<ModelDetectedRegion>((region, index) => ({
      ...region,
      provenance: 'model-detected',
      verification: 'unverified-model-suggestion',
      model: loaded.metadata,
      ...(masks[index] ? { mask: masks[index] } : {}),
    }));
    onProgress?.({
      phase: 'complete',
      message: `Local analysis found ${regions.length} region${regions.length === 1 ? '' : 's'} to review.`,
      progress: 1,
      backend: loaded.backend,
    });
    return {
      artworkId: input.artworkId,
      status: 'complete',
      regions,
      model: loaded.metadata,
      analyzedLocally: true,
    };
  };

  return {
    analyze: async (input, onProgress) => {
      if (disposed) throw new Error('Region model adapter has been disposed.');
      try {
        const loaded = await loadRuntime(onProgress);
        try {
          return await analyzeWithRuntime(loaded, input, onProgress);
        } catch (error) {
          if (loaded.backend !== 'webgpu') throw error;
          onProgress?.({
            phase: 'fallback',
            message: 'WebGPU analysis could not finish; retrying locally with WASM.',
            backend: 'wasm',
          });
          forceWasm = true;
          await disposeRuntime();
          const wasm = await loadRuntime(onProgress);
          return await analyzeWithRuntime(wasm, input, onProgress);
        }
      } catch (error) {
        onProgress?.({
          phase: 'failed',
          message:
            'Local region analysis is unavailable. Authored artwork regions remain available.',
        });
        throw error;
      }
    },
    dispose: async () => {
      if (disposed) return;
      disposed = true;
      if (runtimePromise && !runtime) {
        try {
          runtime = await runtimePromise;
        } catch {
          runtimePromise = undefined;
        }
      }
      await disposeRuntime();
    },
  };
}
