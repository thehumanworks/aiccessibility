import type { GalleryController } from '../gallery/controller';
import { createGalleryTools } from './tools';

export interface GalleryToolsRegistration {
  supported: boolean;
  ready: Promise<boolean>;
  unregister: () => void;
}

export function supportsWebMcp(
  target: Pick<Document, 'modelContext'> = document,
): boolean {
  return typeof target.modelContext?.registerTool === 'function';
}

export function registerGalleryTools(
  controller: GalleryController,
  target: Pick<Document, 'modelContext'> = document,
): GalleryToolsRegistration {
  const modelContext = target.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    return {
      supported: false,
      ready: Promise.resolve(false),
      unregister: () => undefined,
    };
  }

  const registrationController = new AbortController();
  const ready = Promise.all(
    createGalleryTools(controller).map((tool) =>
      modelContext.registerTool(tool, {
        signal: registrationController.signal,
      }),
    ),
  ).then(
    () => true,
    () => {
      registrationController.abort();
      return false;
    },
  );

  return {
    supported: true,
    ready,
    unregister: () => registrationController.abort(),
  };
}
