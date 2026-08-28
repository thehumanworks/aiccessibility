import { createRegionAnalysisClient } from '../src/regions/client';
import { createGalleryRegionAnalysisRunner } from '../src/regions/gallery-runner';
import { createRegionWorkerMessageHandler } from '../src/regions/worker-runtime';
import type { RegionModelAdapter } from '../src/regions/transformers-adapter';
import type { RegionWorkerRequest, RegionWorkerResponse } from '../src/regions/worker-protocol';

class FakeWorker {
  messages: RegionWorkerRequest[] = [];
  terminated = false;
  private messageListeners: EventListener[] = [];
  private errorListeners: EventListener[] = [];

  postMessage(message: RegionWorkerRequest) {
    this.messages.push(message);
  }

  addEventListener(
    type: 'message' | 'error',
    listener: EventListenerOrEventListenerObject,
  ) {
    const callback: EventListener =
      typeof listener === 'function'
        ? listener
        : (event) => listener.handleEvent(event);
    (type === 'message' ? this.messageListeners : this.errorListeners).push(callback);
  }

  terminate() {
    this.terminated = true;
  }

  emit(message: RegionWorkerResponse) {
    const event = new MessageEvent('message', { data: message });
    this.messageListeners.forEach((listener) => listener(event));
  }
}

const analysisInput = {
  artworkId: 'work-one',
  imageUrl: '/artwork.jpg',
  candidateLabels: ['tree'],
};

const metadata = {
  runtime: '@huggingface/transformers@3.8.1' as const,
  backend: 'wasm' as const,
  detector: { id: 'owl', revision: 'owl-rev', dtype: 'q8' as const },
  refiner: { id: 'sam', revision: 'sam-rev', dtype: 'q8' as const },
};

describe('lazy region analysis worker client', () => {
  it('does not create a worker until analysis is explicitly requested', async () => {
    const fakeWorker = new FakeWorker();
    const factory = vi.fn(() => fakeWorker);
    const client = createRegionAnalysisClient({ workerFactory: factory });

    expect(factory).not.toHaveBeenCalled();
    const progress = vi.fn();
    const resultPromise = client.analyze(analysisInput, progress);
    expect(factory).toHaveBeenCalledTimes(1);
    const requestId = fakeWorker.messages[0]!.requestId;
    fakeWorker.emit({
      type: 'progress',
      requestId,
      progress: { phase: 'detecting', message: 'Local detection', progress: 0.5 },
    });
    fakeWorker.emit({
      type: 'result',
      requestId,
      result: {
        artworkId: 'work-one',
        status: 'complete',
        regions: [],
        model: metadata,
        analyzedLocally: true,
      },
    });

    await expect(resultPromise).resolves.toMatchObject({ status: 'complete' });
    expect(progress).toHaveBeenCalledWith(
      expect.objectContaining({ phase: 'detecting' }),
    );
    client.dispose();
    expect(fakeWorker.terminated).toBe(true);
  });

  it('rejects cancelled and disposed work without leaking a late response', async () => {
    const fakeWorker = new FakeWorker();
    const client = createRegionAnalysisClient({ workerFactory: () => fakeWorker });
    const abort = new AbortController();
    const resultPromise = client.analyze(analysisInput, undefined, abort.signal);
    abort.abort();
    await expect(resultPromise).rejects.toMatchObject({ name: 'AbortError' });

    client.dispose();
    await expect(client.analyze(analysisInput)).rejects.toThrow('disposed');
  });
});
describe('region worker protocol', () => {
  it('forwards progress/results and converts adapter failures to safe errors', async () => {
    const responses: RegionWorkerResponse[] = [];
    const adapter: RegionModelAdapter = {
      analyze: vi
        .fn()
        .mockImplementationOnce(async (_input, progress) => {
          progress?.({ phase: 'detecting', message: 'Detecting' });
          return {
            artworkId: 'work-one',
            status: 'complete',
            regions: [],
            model: metadata,
            analyzedLocally: true,
          };
        })
        .mockRejectedValueOnce(new Error('operator unsupported')),
      dispose: vi.fn(async () => undefined),
    };
    const handle = createRegionWorkerMessageHandler(adapter, (message) => {
      responses.push(message);
    });

    await handle({ type: 'analyze', requestId: 'one', input: analysisInput });
    await handle({ type: 'analyze', requestId: 'two', input: analysisInput });

    expect(responses.map(({ type }) => type)).toEqual([
      'progress',
      'result',
      'error',
    ]);
    expect(responses[2]).toMatchObject({
      type: 'error',
      error: { code: 'analysis-failed', message: 'operator unsupported' },
    });
  });

  it('preserves message-bearing worker failures that are not Error instances', async () => {
    const responses: RegionWorkerResponse[] = [];
    const adapter: RegionModelAdapter = {
      analyze: vi.fn().mockRejectedValue({
        message: 'WebGPU validation rejected the model graph.',
      }),
      dispose: vi.fn(async () => undefined),
    };
    const handle = createRegionWorkerMessageHandler(adapter, (message) => {
      responses.push(message);
    });

    await handle({ type: 'analyze', requestId: 'gpu-error', input: analysisInput });

    expect(responses[0]).toMatchObject({
      type: 'error',
      error: {
        code: 'analysis-failed',
        message: 'WebGPU validation rejected the model graph.',
      },
    });
  });
});
describe('gallery region runner bridge', () => {
  it('maps model suggestions to stable, explicitly unverified gallery regions', async () => {
    const analyze = vi.fn(async () => ({
      artworkId: 'pissarro-boulevard-montmartre',
      status: 'complete' as const,
      analyzedLocally: true as const,
      model: metadata,
      regions: [
        {
          id: 'model-tree-abc',
          label: 'tree',
          confidence: 0.8,
          bounds: { x: 0.1, y: 0.1, width: 0.4, height: 0.6 },
          provenance: 'model-detected' as const,
          verification: 'unverified-model-suggestion' as const,
          model: metadata,
          mask: {
            encoding: 'binary-rle-v1' as const,
            width: 2,
            height: 2,
            counts: [0, 4],
            crop: { x: 0.1, y: 0.1, width: 0.4, height: 0.6 },
            score: 0.9,
          },
        },
      ],
    }));
    const client = { analyze, dispose: vi.fn() };
    const { runner } = createGalleryRegionAnalysisRunner(client);
    const result = await runner({
      artworkId: 'pissarro-boulevard-montmartre',
      imageUrl: '/artwork.jpg',
      imageWidth: 100,
      imageHeight: 100,
      labels: ['tree'],
      threshold: 0.2,
      maxRegions: 4,
      onProgress: vi.fn(),
    });

    expect(result.regions[0]).toMatchObject({
      id: 'pissarro-boulevard-montmartre-model-tree-abc',
      provenance: 'model-detected',
      model: { detector: 'owl', refiner: 'sam', backend: 'wasm' },
      mask: { encoding: 'polygon' },
    });
    expect(result.regions[0]!.description).toContain('unverified visual suggestion');
  });
});
