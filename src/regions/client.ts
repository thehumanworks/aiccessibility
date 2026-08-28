import type {
  AnalyzeArtworkRegionsInput,
  AnalyzeArtworkRegionsResult,
  RegionProgressListener,
} from './types';
import type { RegionWorkerRequest, RegionWorkerResponse } from './worker-protocol';

interface WorkerLike {
  postMessage: (message: RegionWorkerRequest) => void;
  addEventListener: (
    type: 'message' | 'error',
    listener: EventListenerOrEventListenerObject,
  ) => void;
  terminate: () => void;
}

interface PendingAnalysis {
  resolve: (value: AnalyzeArtworkRegionsResult) => void;
  reject: (reason: Error) => void;
  onProgress?: RegionProgressListener;
}

export interface RegionAnalysisClient {
  analyze: (
    input: AnalyzeArtworkRegionsInput,
    onProgress?: RegionProgressListener,
    signal?: AbortSignal,
  ) => Promise<AnalyzeArtworkRegionsResult>;
  dispose: () => void;
}

export interface RegionAnalysisClientOptions {
  workerFactory?: () => WorkerLike;
}

function defaultWorkerFactory(): WorkerLike {
  return new Worker(new URL('./region.worker.ts', import.meta.url), {
    type: 'module',
    name: 'local-artwork-region-analysis',
  });
}

export function createRegionAnalysisClient(
  options: RegionAnalysisClientOptions = {},
): RegionAnalysisClient {
  const workerFactory = options.workerFactory ?? defaultWorkerFactory;
  const pending = new Map<string, PendingAnalysis>();
  let worker: WorkerLike | undefined;
  let sequence = 0;
  let disposed = false;

  const ensureWorker = () => {
    if (worker) return worker;
    worker = workerFactory();
    worker.addEventListener('message', ((event: MessageEvent<RegionWorkerResponse>) => {
      const response = event.data;
      const request = pending.get(response.requestId);
      if (!request) return;
      if (response.type === 'progress') {
        request.onProgress?.(response.progress);
      } else if (response.type === 'result') {
        pending.delete(response.requestId);
        request.resolve(response.result);
      } else if (response.type === 'error') {
        pending.delete(response.requestId);
        request.reject(new Error(response.error.message));
      }
    }) as EventListener);
    worker.addEventListener('error', ((event: ErrorEvent) => {
      const error = new Error(event.message || 'Local region-analysis worker failed.');
      for (const request of pending.values()) request.reject(error);
      pending.clear();
      worker?.terminate();
      worker = undefined;
    }) as EventListener);
    return worker;
  };

  return {
    analyze: (input, onProgress, signal) => {
      if (disposed) {
        return Promise.reject(new Error('Region analysis client has been disposed.'));
      }
      if (signal?.aborted) {
        return Promise.reject(new DOMException('Region analysis was cancelled.', 'AbortError'));
      }
      const requestId = `region-analysis-${++sequence}`;
      return new Promise<AnalyzeArtworkRegionsResult>((resolve, reject) => {
        const handleAbort = () => {
          pending.delete(requestId);
          reject(new DOMException('Region analysis was cancelled.', 'AbortError'));
        };
        signal?.addEventListener('abort', handleAbort, { once: true });
        pending.set(requestId, {
          resolve: (result) => {
            signal?.removeEventListener('abort', handleAbort);
            resolve(result);
          },
          reject: (error) => {
            signal?.removeEventListener('abort', handleAbort);
            reject(error);
          },
          ...(onProgress ? { onProgress } : {}),
        });
        ensureWorker().postMessage({ type: 'analyze', requestId, input });
      });
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      const error = new Error('Region analysis client has been disposed.');
      for (const request of pending.values()) request.reject(error);
      pending.clear();
      if (worker) {
        worker.postMessage({ type: 'dispose', requestId: `dispose-${++sequence}` });
        worker.terminate();
        worker = undefined;
      }
    },
  };
}
