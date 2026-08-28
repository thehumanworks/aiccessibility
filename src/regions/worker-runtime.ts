import type { RegionModelAdapter } from './transformers-adapter';
import type { RegionWorkerRequest, RegionWorkerResponse } from './worker-protocol';

export type RegionWorkerPostMessage = (message: RegionWorkerResponse) => void;

export function createRegionWorkerMessageHandler(
  adapter: RegionModelAdapter,
  postMessage: RegionWorkerPostMessage,
) {
  return async (request: RegionWorkerRequest): Promise<void> => {
    if (request.type === 'dispose') {
      await adapter.dispose();
      postMessage({ type: 'disposed', requestId: request.requestId });
      return;
    }

    try {
      const result = await adapter.analyze(request.input, (progress) => {
        postMessage({ type: 'progress', requestId: request.requestId, progress });
      });
      postMessage({ type: 'result', requestId: request.requestId, result });
    } catch (error) {
      postMessage({
        type: 'error',
        requestId: request.requestId,
        error: {
          code: 'analysis-failed',
          message: error instanceof Error ? error.message : 'Local analysis failed.',
        },
      });
    }
  };
}
