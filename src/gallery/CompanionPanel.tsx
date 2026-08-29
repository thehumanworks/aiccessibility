import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { getSource } from '../collection/repository';
import type { GalleryController } from './controller';
import {
  getModeDefinition,
  getProvenanceDefinition,
  getUiCopy,
  type UiCopy,
} from './i18n';
import type { GalleryLanguage, RenderedInterpretation } from './types';
import { useGallery } from './GalleryProvider';

interface CompanionContentsProps {
  controller: GalleryController;
  copy: UiCopy;
  headingRef: RefObject<HTMLHeadingElement | null>;
  interpretation: RenderedInterpretation;
  language: GalleryLanguage;
}

function CompanionContents({
  controller,
  copy,
  headingRef,
  interpretation,
  language,
}: CompanionContentsProps) {
  return (
    <>
      <header className="companion-header">
        <div>
          <p className="companion-eyebrow">{copy.sharedCompanion}</p>
          <h2 id="companion-title" ref={headingRef} tabIndex={-1}>
            {interpretation.title ??
              getModeDefinition(interpretation.mode, language).label}
          </h2>
        </div>
        <button
          type="button"
          className="companion-close"
          onClick={() => {
            controller.clearGalleryResponse('human');
            document.getElementById('artwork-stage')?.focus();
          }}
          aria-label={copy.clearCompanion}
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div className="companion-segments">
        {interpretation.segments.map((segment, index) => {
          const provenance = getProvenanceDefinition(
            segment.provenance,
            language,
          );
          const sources = (segment.sourceIds ?? [])
            .map((sourceId) => getSource(sourceId))
            .filter((source) => source !== undefined);
          const canonicalEnglish = Boolean(segment.statementId) && language !== 'en';

          return (
            <article
              className="companion-segment"
              data-provenance={segment.provenance}
              key={`${segment.provenance}-${segment.statementId ?? index}`}
              lang={canonicalEnglish ? 'en' : language}
            >
              <p className="companion-provenance">
                {provenance.label}
                {canonicalEnglish ? (
                  <span className="companion-canonical-language">
                    {' '}· {copy.canonicalEnglish}
                  </span>
                ) : null}
              </p>
              <p>{segment.text}</p>
              {sources.length > 0 ? (
                <ul className="companion-sources" aria-label={copy.sources}>
                  {sources.map((source) => (
                    <li key={source.id}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>

      <p className="companion-footnote">{copy.companionFootnote}</p>
    </>
  );
}

function useCompactCompanion(): boolean {
  const [compact, setCompact] = useState(() =>
    window.matchMedia('(max-width: 70rem)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(max-width: 70rem)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return compact;
}

export function CompanionPanel({ suspended = false }: { suspended?: boolean }) {
  const { state, controller } = useGallery();
  const interpretation = state.interpretation;
  const reduceMotion = useReducedMotion();
  const compact = useCompactCompanion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const language = state.personalization.language;
  const copy = getUiCopy(language);
  const dialogShouldOpen = compact && Boolean(interpretation) && !suspended;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (dialogShouldOpen) {
      if (!dialog.open) dialog.showModal();
      headingRef.current?.focus();
      return;
    }

    const shouldRestoreFocus = dialog.contains(document.activeElement);
    if (dialog.open) dialog.close();
    if (shouldRestoreFocus) {
      requestAnimationFrame(() =>
        document.getElementById('artwork-stage')?.focus(),
      );
    }
  }, [dialogShouldOpen]);

  const clearResponse = () => {
    controller.clearGalleryResponse('human');
    document.getElementById('artwork-stage')?.focus();
  };

  if (compact) {
    return (
      <dialog
        ref={dialogRef}
        className="companion-dialog"
        aria-labelledby={interpretation ? 'companion-title' : undefined}
        onCancel={(event) => {
          event.preventDefault();
          clearResponse();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) clearResponse();
        }}
        onClose={() => {
          if (!suspended) {
            requestAnimationFrame(() =>
              document.getElementById('artwork-stage')?.focus(),
            );
          }
        }}
      >
        {interpretation ? (
          <motion.section
            className="companion-panel companion-panel-compact"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.12 }
                : { duration: 0.28, ease: [0.32, 0.08, 0.24, 1] }
            }
          >
            <CompanionContents
              controller={controller}
              copy={copy}
              headingRef={headingRef}
              interpretation={interpretation}
              language={language}
            />
          </motion.section>
        ) : null}
      </dialog>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {interpretation ? (
        <motion.aside
          key="gallery-companion"
          className="companion-panel"
          aria-labelledby="companion-title"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
          transition={
            reduceMotion
              ? { duration: 0.12 }
              : { duration: 0.32, ease: [0.32, 0.08, 0.24, 1] }
          }
        >
          <CompanionContents
            controller={controller}
            copy={copy}
            headingRef={headingRef}
            interpretation={interpretation}
            language={language}
          />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
