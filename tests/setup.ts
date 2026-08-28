import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/* jsdom ships no matchMedia, and Motion asks it for prefers-reduced-motion.
   Motion caches that subscription per module instance, so the reduce case is
   asserted in the browser instead: tests/e2e/motion.spec.ts. */
if (!window.matchMedia) {
  window.matchMedia = vi.fn((query: string) => ({
    media: query,
    matches: false,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  cleanup();
});
