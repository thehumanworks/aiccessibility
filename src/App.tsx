import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getArtwork, listArtworks } from './collection/repository';
import { AccessibilityStatus } from './gallery/AccessibilityStatus';
import { GalleryNav } from './gallery/GalleryNav';
import { GalleryProvider, useGallery } from './gallery/GalleryProvider';
import { getUiCopy, localizeArtwork, localizeRegion } from './gallery/i18n';
import {
  getCurrentRegionAnalysis,
  getVisibleRegion,
  getVisibleRegions,
} from './gallery/regions';
import { modeAtmospheres } from './gallery/modes';
import { SettingsDialog } from './gallery/SettingsDialog';
import { SpeakingStyleSelect } from './gallery/SpeakingStyleSelect';
import { StageCarousel } from './gallery/StageCarousel';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function GalleryExperience() {
  const { state, controller, siteToolsSupported } = useGallery();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  const language = state.personalization.language;
  const copy = getUiCopy(language);
  const artworks = useMemo(
    () => listArtworks().map((artwork) => localizeArtwork(artwork, language)),
    [language],
  );
  const artwork = localizeArtwork(getArtwork(state.artworkId), language);
  const focusedRegion = state.focusedRegionId
    ? localizeRegion(getVisibleRegion(state, state.focusedRegionId)!, language)
    : undefined;
  const currentIndex = artworks.findIndex(({ id }) => id === state.artworkId);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  /* Manual arrows and WebMCP navigation both land here, so the carousel
     travels the same way whoever moved it. */
  const directionRef = useRef(1);
  const lastIndexRef = useRef(currentIndex);
  if (lastIndexRef.current !== currentIndex) {
    const delta = currentIndex - lastIndexRef.current;
    directionRef.current =
      Math.abs(delta) > artworks.length / 2 ? -Math.sign(delta) : Math.sign(delta);
    lastIndexRef.current = currentIndex;
  }
  const atmosphere = modeAtmospheres[state.mode];

  useEffect(() => {
    const root = document.documentElement;
    const previous = {
      fontFamily: root.dataset.fontFamily,
      fontSize: root.dataset.fontSize,
      contrast: root.dataset.contrast,
      theme: root.dataset.theme,
      lang: root.lang,
    };
    root.dataset.fontFamily = state.personalization.fontFamily;
    root.dataset.fontSize = state.personalization.fontSize;
    root.dataset.contrast = state.personalization.contrast;
    root.dataset.theme = state.personalization.theme;
    root.lang = language;

    return () => {
      for (const [key, value] of Object.entries(previous)) {
        if (key === 'lang') {
          root.lang = value ?? 'en';
        } else if (value === undefined) {
          delete root.dataset[key];
        } else {
          root.dataset[key] = value;
        }
      }
    };
  }, [language, state.personalization]);

  return (
    <>
      <div className="gallery" data-mode={state.mode} inert={settingsOpen}>
        <AnimatePresence initial={false}>
          <motion.div
            key={state.mode}
            className="mode-atmosphere"
            aria-hidden="true"
            style={{
              background: `radial-gradient(ellipse 70% 48% at 50% 34%, ${atmosphere.glow}, transparent 72%),
                radial-gradient(ellipse 120% 70% at 50% 118%, ${atmosphere.floor}, transparent 60%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </AnimatePresence>

        <a className="skip-link" href="#artwork-stage">
          {copy.skipToArtwork}
        </a>

        <header className="masthead">
          <h1 className="wordmark">
            <span className="wordmark-lead">AI</span>ccessibility
          </h1>
          <p className="tagline">{copy.tagline}</p>
          <button
            type="button"
            className="settings-cog"
            ref={settingsButtonRef}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            aria-label={copy.gallerySettings}
            onClick={() => setSettingsOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M19.4 13.6a7.7 7.7 0 0 0 0-3.2l1.9-1.4-1.9-3.3-2.2.9a7.7 7.7 0 0 0-2.8-1.6L14 2h-4l-.4 3a7.7 7.7 0 0 0-2.8 1.6l-2.2-.9-1.9 3.3 1.9 1.4a7.7 7.7 0 0 0 0 3.2l-1.9 1.4 1.9 3.3 2.2-.9a7.7 7.7 0 0 0 2.8 1.6l.4 3h4l.4-3a7.7 7.7 0 0 0 2.8-1.6l2.2.9 1.9-3.3-1.9-1.4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        <main className="hall">
          <GalleryNav
            artworks={artworks}
            currentIndex={currentIndex}
            controller={controller}
            language={language}
          />
          <StageCarousel
            artworks={artworks}
            currentIndex={currentIndex}
            positionLabel={`${pad(currentIndex + 1)} / ${pad(artworks.length)}`}
            direction={directionRef.current}
          />
          <SpeakingStyleSelect
            mode={state.mode}
            language={language}
            controller={controller}
            variant="label"
          />
        </main>

        <AccessibilityStatus
          artwork={artwork}
          mode={state.mode}
          focusedRegionLabel={focusedRegion?.label ?? null}
          currentIndex={currentIndex}
          collectionSize={artworks.length}
          regionAnalysis={getCurrentRegionAnalysis(state)}
          availableRegionCount={getVisibleRegions(state).length}
          language={language}
        />
      </div>

      <SettingsDialog
        open={settingsOpen}
        onClose={closeSettings}
        mode={state.mode}
        preferences={state.personalization}
        controller={controller}
        siteToolsSupported={siteToolsSupported}
        returnFocusTo={settingsButtonRef}
      />
    </>
  );
}

export function App() {
  return (
    /* Motion's own reduced-motion support, rather than a parallel CSS path. */
    <MotionConfig reducedMotion="user">
      <GalleryProvider>
        <GalleryExperience />
      </GalleryProvider>
    </MotionConfig>
  );
}
