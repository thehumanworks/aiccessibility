import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import type { GalleryController } from './controller';
import { provenanceDefinitions } from './modes';
import { SpeakingStyleSelect } from './SpeakingStyleSelect';
import type { ExperienceMode, ProvenanceKind } from './types';

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
  controller: GalleryController;
  siteToolsSupported: boolean;
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function SettingsDialog({
  open,
  onClose,
  mode,
  controller,
  siteToolsSupported,
  returnFocusTo,
}: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldRestoreFocus = useRef(false);
  const reduceMotion = useReducedMotion();

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
                Gallery settings
              </h2>
              <button
                type="button"
                className="settings-close"
                onClick={onClose}
                aria-label="Close gallery settings"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="settings-section">
              <h3>Choosing the lens</h3>
              <p className="settings-lede">
                The artwork stays where it is; only the way it is described
                changes. This is the same control that sits under the wall
                label.
              </p>
              <SpeakingStyleSelect
                mode={mode}
                controller={controller}
                variant="settings"
              />
            </div>

            <div className="settings-section">
              <h3>How to read what you hear</h3>
              <dl className="provenance-list">
                {provenanceOrder.map((kind) => (
                  <div key={kind} className="provenance-item">
                    <dt>{provenanceDefinitions[kind].label}</dt>
                    <dd>{provenanceDefinitions[kind].description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="settings-section">
              <h3>Talking with the gallery</h3>
              <p>
                This page publishes its live state and four actions as WebMCP
                Site Tools, so an agent such as ChatGPT can read the wall, list
                the collection, move to another work, and change the lens while
                you watch.
              </p>
              <p className="settings-signal">
                <span
                  className="settings-dot"
                  data-supported={siteToolsSupported}
                  aria-hidden="true"
                />
                {siteToolsSupported
                  ? 'Site Tools detected in this browser.'
                  : 'No Site Tools in this browser. The gallery stays fully usable by keyboard and screen reader.'}
              </p>
            </div>

            <div className="settings-section">
              <h3>Comfort and privacy</h3>
              <p>
                Transitions follow your system reduced-motion setting. Nothing
                is stored: no account, no cookie, no tracking, no preference
                carried between visits. All six works come from The Metropolitan
                Museum of Art and are marked Public Domain under the{' '}
                <a
                  href="https://www.metmuseum.org/policies/image-resources"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Met Open Access policy
                </a>
                .
              </p>
            </div>

            <button type="button" className="settings-done" onClick={onClose}>
              Back to the gallery
            </button>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
