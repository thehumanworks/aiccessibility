import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type KeyboardEvent, useId, useRef } from 'react';

import type { GalleryController } from './controller';
import { getModeDefinition, getUiCopy } from './i18n';
import { experienceModes } from './reducer';
import type { ExperienceMode, GalleryLanguage } from './types';

interface SpeakingStyleSelectProps {
  mode: ExperienceMode;
  language: GalleryLanguage;
  controller: GalleryController;
  /* `label` sits under the wall label; `settings` sits in the full-viewport
     settings. Both drive the same controller, so they stay in step. */
  variant: 'label' | 'settings';
}

/* A radiogroup rather than a listbox or a native select: five styles, always
   visible, no popup the operating system gets to draw for us. */
export function SpeakingStyleSelect({
  mode,
  language,
  controller,
  variant,
}: SpeakingStyleSelectProps) {
  const groupId = useId();
  const labelId = `${groupId}-label`;
  const hintId = `${groupId}-hint`;
  /* Unique per instance: the wall label and the settings each animate their
     own pill, even though both are mounted at the same time. */
  const pillId = `${groupId}-pill`;
  const reduceMotion = useReducedMotion();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIndex = experienceModes.indexOf(mode);
  const copy = getUiCopy(language);

  // Selection follows focus, so choosing and moving are the same gesture.
  const select = (index: number) => {
    const requested = experienceModes[index];
    if (!requested) {
      return;
    }

    controller.setExperienceMode(requested);
    optionRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const count = experienceModes.length;
    const focusedIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement,
    );
    const current = focusedIndex >= 0 ? focusedIndex : selectedIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        select((current + 1) % count);
        return;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        select((current - 1 + count) % count);
        return;
      case 'Home':
        event.preventDefault();
        select(0);
        return;
      case 'End':
        event.preventDefault();
        select(count - 1);
        return;
      case ' ':
      case 'Spacebar':
      case 'Enter':
        event.preventDefault();
        select(current);
        return;
      default:
        break;
    }

    // 1-5 jumps straight to the indexed style from anywhere in the group.
    const index = Number.parseInt(event.key, 10) - 1;
    if (Number.isInteger(index) && index >= 0 && index < count) {
      event.preventDefault();
      select(index);
    }
  };

  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 520, damping: 42, mass: 0.9 };
  const textTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <div
      className="style-select"
      data-variant={variant}
      data-motion={reduceMotion ? 'reduced' : 'full'}
    >
      <span className="style-select-label" id={labelId}>
        {copy.speakingStyle}
      </span>

      <div
        role="radiogroup"
        className="style-select-track"
        aria-labelledby={labelId}
        aria-describedby={hintId}
        onKeyDown={handleKeyDown}
      >
        {experienceModes.map((experienceMode, index) => {
          const selected = experienceMode === mode;

          return (
            <button
              key={experienceMode}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-describedby={`${groupId}-description-${index}`}
              className="style-select-option"
              data-selected={selected}
              /* Roving tabIndex: the whole group is one keyboard stop. */
              tabIndex={selected ? 0 : -1}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              onClick={() => select(index)}
            >
              {selected ? (
                <motion.span
                  layoutId={pillId}
                  className="style-select-pill"
                  aria-hidden="true"
                  transition={pillTransition}
                />
              ) : null}
              <span className="style-select-index" aria-hidden="true">
                {index + 1}
              </span>
              <span className="style-select-name">
                {getModeDefinition(experienceMode, language).label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Referenced, never rendered: each style keeps its own description in
          the accessibility tree without crowding the wall label. */}
      <div hidden>
        {experienceModes.map((experienceMode, index) => (
          <span key={experienceMode} id={`${groupId}-description-${index}`}>
            {getModeDefinition(experienceMode, language).description}
          </span>
        ))}
      </div>

      <p className="style-select-hint" id={hintId}>
        {copy.speakingHint}
      </p>

      {variant === 'settings' ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={mode}
            className="style-select-description"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={textTransition}
          >
            {getModeDefinition(mode, language).description}
          </motion.p>
        </AnimatePresence>
      ) : null}
    </div>
  );
}
