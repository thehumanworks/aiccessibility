import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { registerGalleryTools } from '../webmcp/register';
import { createGalleryRegionAnalysisRunner } from '../regions/gallery-runner';
import { createGalleryController, type GalleryController } from './controller';
import { readArtworkIdFromLocation } from './history';
import {
  createInitialGalleryState,
  galleryReducer,
  type GalleryAction,
} from './reducer';
import type { GalleryState } from './types';

interface GalleryContextValue {
  state: GalleryState;
  controller: GalleryController;
  siteToolsSupported: boolean;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

function initializeGallery(): GalleryState {
  return createInitialGalleryState(readArtworkIdFromLocation());
}

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(galleryReducer, undefined, initializeGallery);
  const [siteToolsSupported, setSiteToolsSupported] = useState(false);
  const regionAnalysis = useMemo(() => createGalleryRegionAnalysisRunner(), []);
  const stateRef = useRef(state);
  stateRef.current = state;

  const getState = useCallback(() => stateRef.current, []);
  const applyAction = useCallback((action: GalleryAction) => {
    const nextState = galleryReducer(stateRef.current, action);
    if (nextState !== stateRef.current) {
      stateRef.current = nextState;
      dispatch(action);
    }
    return nextState;
  }, []);

  const controller = useMemo(
    () =>
      createGalleryController({
        getState,
        applyAction,
        runRegionAnalysis: regionAnalysis.runner,
      }),
    [applyAction, getState, regionAnalysis.runner],
  );

  useEffect(() => () => regionAnalysis.dispose(), [regionAnalysis]);

  useEffect(() => {
    const registration = registerGalleryTools(controller);
    setSiteToolsSupported(registration.supported);
    return () => {
      registration.unregister();
      setSiteToolsSupported(false);
    };
  }, [controller]);

  useEffect(() => {
    const handlePopState = () => {
      controller.navigateFromHistory(readArtworkIdFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [controller]);

  const value = useMemo(
    () => ({ state, controller, siteToolsSupported }),
    [controller, siteToolsSupported, state],
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
}

export function useGallery(): GalleryContextValue {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider.');
  }
  return context;
}
