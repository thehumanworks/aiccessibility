import { getUiCopy } from './i18n';
import type { GalleryLanguage } from './types';

export function ExperienceGuide({
  language,
  siteToolsSupported,
}: {
  language: GalleryLanguage;
  siteToolsSupported: boolean;
}) {
  const copy = getUiCopy(language);

  return (
    <details className="experience-guide">
      <summary
        aria-label={`${copy.askChatGpt}. ${
          siteToolsSupported ? copy.toolsReadyShort : copy.manualReadyShort
        }`}
      >
        <span
          className="experience-guide-dot"
          data-supported={siteToolsSupported}
          aria-hidden="true"
        />
        <span className="experience-guide-label">{copy.askChatGpt}</span>
        <span className="experience-guide-compact" aria-hidden="true">
          AI
        </span>
        <span className="visually-hidden">
          {siteToolsSupported ? copy.toolsReadyShort : copy.manualReadyShort}
        </span>
      </summary>
      <div className="experience-guide-body">
        <p>
          {siteToolsSupported ? copy.guideReady : copy.guideManual}
        </p>
        <ul>
          {copy.promptSuggestions.map((prompt) => (
            <li key={prompt}>“{prompt}”</li>
          ))}
        </ul>
      </div>
    </details>
  );
}

