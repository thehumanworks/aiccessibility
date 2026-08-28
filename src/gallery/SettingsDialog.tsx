import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import type { GalleryController } from './controller';
import { getProvenanceDefinition, getUiCopy } from './i18n';
import { PersonalizationControls } from './PersonalizationControls';
import { SpeakingStyleSelect } from './SpeakingStyleSelect';
import type {
  ExperienceMode,
  PersonalizationPreferences,
  ProvenanceKind,
} from './types';

const focusableSelector = [
  'a[href]',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const provenanceOrder: readonly ProvenanceKind[] = [
  'observed',
  'known',
  'interpreted',
  'imagined',
];

/* If Motion never reports the exit as finished, the dialog still closes. */
const exitSafetyMs = 700;

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  mode: ExperienceMode;
  preferences: PersonalizationPreferences;
  controller: GalleryController;
  siteToolsSupported: boolean;
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function SettingsDialog({
  open,
  onClose,
  mode,
  preferences,
  controller,
  siteToolsSupported,
  returnFocusTo,
}: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldRestoreFocus = useRef(false);
  const reduceMotion = useReducedMotion();
  const copy = getUiCopy(preferences.language);

  /* The native dialog stays open through the exit animation: a modal dialog
     holds the top layer, so focus can only return to the cog once it closes. */
  const finishClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (typeof dialog.close === 'function') {
        if (dialog.open) {
          dialog.close();
        }
      } else {
        dialog.removeAttribute('open');
      }
    }

    if (shouldRestoreFocus.current) {
      shouldRestoreFocus.current = false;
      returnFocusTo.current?.focus();
    }
  }, [returnFocusTo]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) {
      return;
    }

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.setAttribute('open', '');
    }

    shouldRestoreFocus.current = true;
    headingRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) {
      return;
    }

    const timer = window.setTimeout(finishClose, exitSafetyMs);
    return () => window.clearTimeout(timer);
  }, [finishClose, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    // A browser-initiated close still has to reconcile React's own state.
    const handleClose = () => {
      if (open) {
        onClose();
      }
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose, open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusable = [
      ...dialog.querySelectorAll<HTMLElement>(focusableSelector),
    ].filter((element) => element.getAttribute('aria-hidden') !== 'true');

    if (focusable.length === 0) {
      return;
    }

    const first = focusable.at(0);
    const last = focusable.at(-1);
    if (!first || !last) {
      return;
    }

    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === headingRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="settings-dialog"
      aria-labelledby="settings-title"
      data-motion={reduceMotion ? 'reduced' : 'full'}
      onKeyDown={handleKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <AnimatePresence onExitComplete={finishClose}>
        {open ? (
          <motion.section
            key="settings-panel"
            className="settings-panel"
            aria-labelledby="settings-title"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={
              reduceMotion
                ? { duration: 0.12 }
                : { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
            }
          >
            <div className="settings-masthead">
              <h2 id="settings-title" ref={headingRef} tabIndex={-1}>
                {copy.settingsTitle}
              </h2>
              <button
                type="button"
                className="settings-close"
                onClick={onClose}
                aria-label={copy.closeSettings}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="settings-section settings-personalization">
              <h3>{copy.personalizationTitle}</h3>
              <p className="settings-lede">{copy.personalizationLede}</p>
              <PersonalizationControls
                preferences={preferences}
                controller={controller}
              />
            </div>

            <div className="settings-section">
              <h3>{copy.choosingLens}</h3>
              <p className="settings-lede">{copy.choosingLensLede}</p>
              <SpeakingStyleSelect
                mode={mode}
                language={preferences.language}
                controller={controller}
                variant="settings"
              />
            </div>

            <div className="settings-section">
              <h3>{copy.provenanceTitle}</h3>
              <dl className="provenance-list">
                {provenanceOrder.map((kind) => (
                  <div key={kind} className="provenance-item">
                    <dt>{getProvenanceDefinition(kind, preferences.language).label}</dt>
                    <dd>{getProvenanceDefinition(kind, preferences.language).description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="settings-section">
              <h3>{copy.talkingTitle}</h3>
              <p>{copy.talkingBody}</p>
              <p className="settings-signal">
                <span
                  className="settings-dot"
                  data-supported={siteToolsSupported}
                  aria-hidden="true"
                />
                {siteToolsSupported
                  ? copy.toolsDetected
                  : copy.toolsUnavailable}
              </p>
            </div>

            <div className="settings-section">
              <h3>{copy.comfortTitle}</h3>
              <p>
                {copy.comfortBody}{' '}
                <a
                  href="https://www.metmuseum.org/policies/image-resources"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {copy.metPolicy}
                </a>
                .
              </p>
            </div>

            <button type="button" className="settings-done" onClick={onClose}>
              {copy.done}
            </button>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
