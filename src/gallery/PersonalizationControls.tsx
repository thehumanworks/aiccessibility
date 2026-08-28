import type { ChangeEvent } from 'react';

import type { GalleryController } from './controller';
import { getUiCopy } from './i18n';
import {
  colorThemes,
  contrastLevels,
  fontFamilies,
  fontSizes,
  galleryLanguages,
} from './personalization';
import type { PersonalizationPreferences } from './types';

interface PersonalizationControlsProps {
  preferences: PersonalizationPreferences;
  controller: GalleryController;
}

const languageNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
} as const;

export function PersonalizationControls({
  preferences,
  controller,
}: PersonalizationControlsProps) {
  const copy = getUiCopy(preferences.language);
  const select =
    (setter: (value: string) => unknown) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value);
    };

  return (
    <div className="personalization-grid">
      <label className="preference-control">
        <span>{copy.fontFamily}</span>
        <select
          value={preferences.fontFamily}
          onChange={select(controller.setFontFamily)}
        >
          {fontFamilies.map((fontFamily) => (
            <option key={fontFamily} value={fontFamily}>
              {copy.fontOptions[fontFamily]}
            </option>
          ))}
        </select>
      </label>

      <label className="preference-control">
        <span>{copy.fontSize}</span>
        <select
          value={preferences.fontSize}
          onChange={select(controller.setFontSize)}
        >
          {fontSizes.map((fontSize) => (
            <option key={fontSize} value={fontSize}>
              {copy.sizeOptions[fontSize]}
            </option>
          ))}
        </select>
      </label>

      <label className="preference-control">
        <span>{copy.contrast}</span>
        <select
          value={preferences.contrast}
          onChange={select(controller.setContrast)}
        >
          {contrastLevels.map((contrast) => (
            <option key={contrast} value={contrast}>
              {copy.contrastOptions[contrast]}
            </option>
          ))}
        </select>
      </label>

      <label className="preference-control">
        <span>{copy.theme}</span>
        <select value={preferences.theme} onChange={select(controller.setTheme)}>
          {colorThemes.map((theme) => (
            <option key={theme} value={theme}>
              {copy.themeOptions[theme]}
            </option>
          ))}
        </select>
      </label>

      <label className="preference-control preference-control-language">
        <span>{copy.language}</span>
        <select
          value={preferences.language}
          onChange={select(controller.setLanguage)}
        >
          {galleryLanguages.map((language) => (
            <option key={language} value={language} lang={language}>
              {languageNames[language]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
