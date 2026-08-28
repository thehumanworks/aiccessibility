/// <reference lib="webworker" />

import { createTransformersRegionAdapter } from './transformers-adapter';
import { createRegionWorkerMessageHandler } from './worker-runtime';
import type { RegionWorkerRequest, RegionWorkerResponse } from './worker-protocol';

const workerScope = self as DedicatedWorkerGlobalScope;
const handleMessage = createRegionWorkerMessageHandler(
  createTransformersRegionAdapter(),
  (message: RegionWorkerResponse) => workerScope.postMessage(message),
);
let queue = Promise.resolve();

workerScope.addEventListener('message', (event: MessageEvent<RegionWorkerRequest>) => {
  // ONNX sessions and the small embedding LRU are shared; serialize requests so
  // simultaneous UI/WebMCP calls cannot race the same model resources.
  queue = queue.then(() => handleMessage(event.data));
});
