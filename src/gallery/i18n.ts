import type {
  Artwork,
  ArtworkRegion,
  ExperienceMode,
  GalleryActivityAction,
  GalleryLanguage,
  ProvenanceKind,
} from './types';

export interface UiCopy {
  tagline: string;
  skipToArtwork: string;
  skipToCompanion: string;
  gallerySettings: string;
  artworkNavigation: string;
  previousArtwork: string;
  nextArtwork: string;
  speakingStyle: string;
  speakingHint: string;
  showWholeArtwork: string;
  artworkRegions: string;
  exploreDetails: string;
  hideDetails: string;
  authoredRegion: string;
  agentRegion: string;
  modelRegion: string;
  confirmedRegion: string;
  confirmRegion: string;
  dismissRegion: string;
  sharedCompanion: string;
  clearCompanion: string;
  companionFootnote: string;
  canonicalEnglish: string;
  sources: string;
  agentChanged: string;
  youChanged: string;
  revisionLabel: string;
  undoLastChange: string;
  dismissActivity: string;
  activityActions: Record<GalleryActivityAction, string>;
  askChatGpt: string;
  toolsReadyShort: string;
  manualReadyShort: string;
  guideReady: string;
  guideManual: string;
  promptSuggestions: readonly string[];
  imageUnavailable: string;
  imageCouldNotDisplay: string;
  artworkRecordAvailable: string;
  noObservation: string;
  settingsTitle: string;
  closeSettings: string;
  personalizationTitle: string;
  personalizationLede: string;
  fontFamily: string;
  fontSize: string;
  contrast: string;
  theme: string;
  language: string;
  choosingLens: string;
  choosingLensLede: string;
  provenanceTitle: string;
  talkingTitle: string;
  talkingBody: string;
  toolsDetected: string;
  toolsUnavailable: string;
  comfortTitle: string;
  comfortBody: string;
  metPolicy: string;
  done: string;
  fontOptions: Record<'atkinson' | 'sans' | 'serif' | 'mono', string>;
  sizeOptions: Record<'small' | 'medium' | 'large' | 'extra-large', string>;
  contrastOptions: Record<'soft' | 'standard' | 'high', string>;
  themeOptions: Record<'light' | 'dark', string>;
}

const copy: Record<GalleryLanguage, UiCopy> = {
  en: {
    tagline: 'One gallery · many ways of seeing',
    skipToArtwork: 'Skip to the artwork',
    skipToCompanion: 'Skip to the shared companion',
    gallerySettings: 'Gallery settings',
    artworkNavigation: 'Artwork navigation',
    previousArtwork: 'Previous artwork',
    nextArtwork: 'Next artwork',
    speakingStyle: 'Speaking style',
    speakingHint: 'Arrow keys move through the five styles. Number keys 1 to 5 choose one directly.',
    showWholeArtwork: 'Show whole artwork',
    artworkRegions: 'Artwork regions',
    exploreDetails: 'Explore details',
    hideDetails: 'Hide details',
    authoredRegion: 'Gallery-authored',
    agentRegion: 'Agent-grounded suggestion',
    modelRegion: 'Local-model suggestion',
    confirmedRegion: 'Human-confirmed',
    confirmRegion: 'Confirm this detail',
    dismissRegion: 'Not this',
    sharedCompanion: 'Shared companion',
    clearCompanion: 'Clear the shared response',
    companionFootnote:
      'Published into this page for everyone using it. Conversation remains with ChatGPT.',
    canonicalEnglish: 'Canonical English record',
    sources: 'Sources',
    agentChanged: 'ChatGPT changed the gallery:',
    youChanged: 'You changed the gallery:',
    revisionLabel: 'Shared state',
    undoLastChange: 'Undo last change',
    dismissActivity: 'Dismiss activity receipt',
    activityActions: {
      navigate: 'Changed the current artwork.',
      'set-mode': 'Changed the speaking style.',
      'configure-presentation': 'Adapted the presentation.',
      'set-font-family': 'Changed the typeface.',
      'set-font-size': 'Changed the text size.',
      'set-contrast': 'Changed the contrast.',
      'set-theme': 'Changed the colour theme.',
      'set-language': 'Changed the language.',
      'focus-region': 'Focused an artwork detail.',
      'focus-agent-region': 'Proposed a grounded detail.',
      'confirm-region': 'Confirmed a proposed detail.',
      'dismiss-region': 'Dismissed a proposed detail.',
      'clear-focus': 'Returned to the whole artwork.',
      'analyze-regions': 'Completed local detail analysis.',
      'publish-gallery-response': 'Published a shared response.',
      'clear-gallery-response': 'Cleared the shared response.',
      undo: 'Undid the previous change.',
    },
    askChatGpt: 'Ask ChatGPT',
    toolsReadyShort: 'Site Tools ready.',
    manualReadyShort: 'Manual gallery mode.',
    guideReady: 'Site Tools are ready. Try a natural request:',
    guideManual:
      'The gallery remains fully usable here. In a WebMCP-enabled browser, ChatGPT can share these controls.',
    promptSuggestions: [
      'Describe this spatially.',
      'What is known, and what are you imagining?',
      'Show me details I can explore.',
      'Take me somewhere calmer.',
    ],
    imageUnavailable: 'Image unavailable',
    imageCouldNotDisplay: 'The image could not be displayed.',
    artworkRecordAvailable: 'The artwork record is still available.',
    noObservation: 'No visual observation is available.',
    settingsTitle: 'Gallery settings',
    closeSettings: 'Close gallery settings',
    personalizationTitle: 'Make the gallery yours',
    personalizationLede: 'Adjust the whole experience. Every change is immediate, whether it comes from you or an agent.',
    fontFamily: 'Font family',
    fontSize: 'Text size',
    contrast: 'Contrast',
    theme: 'Theme',
    language: 'Language',
    choosingLens: 'Choosing the lens',
    choosingLensLede: 'The artwork stays where it is; only the way it is described changes. This is the same control that sits under the wall label.',
    provenanceTitle: 'How to read what you hear',
    talkingTitle: 'Talking with the gallery',
    talkingBody: 'This page publishes its live state and personalization controls as WebMCP Site Tools, so an agent can adapt the gallery while you watch.',
    toolsDetected: 'Site Tools detected in this browser.',
    toolsUnavailable: 'No Site Tools in this browser. The gallery stays fully usable by keyboard and screen reader.',
    comfortTitle: 'Comfort and privacy',
    comfortBody: 'Transitions follow your system reduced-motion setting. Preferences last only for this visit: no account, cookie, or tracking. All six works come from The Metropolitan Museum of Art and are marked Public Domain under the',
    metPolicy: 'Met Open Access policy',
    done: 'Back to the gallery',
    fontOptions: { atkinson: 'Hyperlegible', sans: 'Sans', serif: 'Serif', mono: 'Mono' },
    sizeOptions: { small: 'Smaller', medium: 'Default', large: 'Larger', 'extra-large': 'Largest' },
    contrastOptions: { soft: 'Softer', standard: 'Standard', high: 'High' },
    themeOptions: { light: 'Light', dark: 'Dark' },
  },
  es: {
    tagline: 'Una galería · muchas formas de mirar',
    skipToArtwork: 'Ir a la obra',
    skipToCompanion: 'Ir al compañero compartido',
    gallerySettings: 'Ajustes de la galería',
    artworkNavigation: 'Navegación de obras',
    previousArtwork: 'Obra anterior',
    nextArtwork: 'Obra siguiente',
    speakingStyle: 'Estilo de narración',
    speakingHint: 'Usa las flechas para recorrer los cinco estilos. Las teclas 1 a 5 eligen uno directamente.',
    showWholeArtwork: 'Mostrar la obra completa',
    artworkRegions: 'Regiones de la obra',
    exploreDetails: 'Explorar detalles',
    hideDetails: 'Ocultar detalles',
    authoredRegion: 'Creado por la galería',
    agentRegion: 'Sugerencia situada por el agente',
    modelRegion: 'Sugerencia del modelo local',
    confirmedRegion: 'Confirmado por una persona',
    confirmRegion: 'Confirmar este detalle',
    dismissRegion: 'No es esto',
    sharedCompanion: 'Compañero compartido',
    clearCompanion: 'Borrar la respuesta compartida',
    companionFootnote:
      'Publicado en esta página para todas las personas que la usan. La conversación permanece en ChatGPT.',
    canonicalEnglish: 'Registro canónico en inglés',
    sources: 'Fuentes',
    agentChanged: 'ChatGPT cambió la galería:',
    youChanged: 'Cambiaste la galería:',
    revisionLabel: 'Estado compartido',
    undoLastChange: 'Deshacer el último cambio',
    dismissActivity: 'Ocultar el recibo de actividad',
    activityActions: {
      navigate: 'Cambió la obra actual.',
      'set-mode': 'Cambió el estilo de narración.',
      'configure-presentation': 'Adaptó la presentación.',
      'set-font-family': 'Cambió la tipografía.',
      'set-font-size': 'Cambió el tamaño del texto.',
      'set-contrast': 'Cambió el contraste.',
      'set-theme': 'Cambió el tema de color.',
      'set-language': 'Cambió el idioma.',
      'focus-region': 'Enfocó un detalle de la obra.',
      'focus-agent-region': 'Propuso un detalle situado.',
      'confirm-region': 'Confirmó un detalle propuesto.',
      'dismiss-region': 'Descartó un detalle propuesto.',
      'clear-focus': 'Volvió a la obra completa.',
      'analyze-regions': 'Completó el análisis local de detalles.',
      'publish-gallery-response': 'Publicó una respuesta compartida.',
      'clear-gallery-response': 'Borró la respuesta compartida.',
      undo: 'Deshizo el cambio anterior.',
    },
    askChatGpt: 'Pregunta a ChatGPT',
    toolsReadyShort: 'Site Tools listas.',
    manualReadyShort: 'Modo de galería manual.',
    guideReady: 'Las Site Tools están listas. Prueba una petición natural:',
    guideManual:
      'La galería sigue siendo plenamente utilizable. En un navegador con WebMCP, ChatGPT puede compartir estos controles.',
    promptSuggestions: [
      'Describe esto espacialmente.',
      '¿Qué se sabe y qué estás imaginando?',
      'Muéstrame detalles que pueda explorar.',
      'Llévame a un lugar más tranquilo.',
    ],
    imageUnavailable: 'Imagen no disponible',
    imageCouldNotDisplay: 'No se pudo mostrar la imagen.',
    artworkRecordAvailable: 'La ficha de la obra sigue disponible.',
    noObservation: 'No hay una observación visual disponible.',
    settingsTitle: 'Ajustes de la galería',
    closeSettings: 'Cerrar los ajustes de la galería',
    personalizationTitle: 'Haz tuya la galería',
    personalizationLede: 'Adapta toda la experiencia. Cada cambio es inmediato, tanto si lo haces tú como un agente.',
    fontFamily: 'Tipografía',
    fontSize: 'Tamaño del texto',
    contrast: 'Contraste',
    theme: 'Tema',
    language: 'Idioma',
    choosingLens: 'Elegir la mirada',
    choosingLensLede: 'La obra permanece en su sitio; solo cambia la forma de describirla. Es el mismo control que aparece bajo la cartela.',
    provenanceTitle: 'Cómo interpretar lo que escuchas',
    talkingTitle: 'Hablar con la galería',
    talkingBody: 'Esta página publica su estado y sus controles de personalización como Site Tools de WebMCP, para que un agente adapte la galería mientras la observas.',
    toolsDetected: 'Site Tools detectadas en este navegador.',
    toolsUnavailable: 'Este navegador no ofrece Site Tools. La galería sigue siendo accesible con teclado y lector de pantalla.',
    comfortTitle: 'Comodidad y privacidad',
    comfortBody: 'Las transiciones respetan la preferencia del sistema para reducir el movimiento. Los ajustes duran solo esta visita: sin cuenta, cookies ni seguimiento. Las seis obras proceden de The Metropolitan Museum of Art y están marcadas como dominio público según la',
    metPolicy: 'política Met Open Access',
    done: 'Volver a la galería',
    fontOptions: { atkinson: 'Hiperlegible', sans: 'Sans serif', serif: 'Serif', mono: 'Monoespaciada' },
    sizeOptions: { small: 'Más pequeño', medium: 'Predeterminado', large: 'Más grande', 'extra-large': 'Máximo' },
    contrastOptions: { soft: 'Suave', standard: 'Estándar', high: 'Alto' },
    themeOptions: { light: 'Claro', dark: 'Oscuro' },
  },
  fr: {
    tagline: 'Une galerie · plusieurs façons de voir',
    skipToArtwork: 'Aller à l’œuvre',
    skipToCompanion: 'Aller au compagnon partagé',
    gallerySettings: 'Réglages de la galerie',
    artworkNavigation: 'Navigation des œuvres',
    previousArtwork: 'Œuvre précédente',
    nextArtwork: 'Œuvre suivante',
    speakingStyle: 'Style de narration',
    speakingHint: 'Les flèches parcourent les cinq styles. Les touches 1 à 5 en choisissent un directement.',
    showWholeArtwork: 'Afficher l’œuvre entière',
    artworkRegions: 'Régions de l’œuvre',
    exploreDetails: 'Explorer les détails',
    hideDetails: 'Masquer les détails',
    authoredRegion: 'Créé par la galerie',
    agentRegion: 'Suggestion localisée par l’agent',
    modelRegion: 'Suggestion du modèle local',
    confirmedRegion: 'Confirmé par une personne',
    confirmRegion: 'Confirmer ce détail',
    dismissRegion: 'Ce n’est pas cela',
    sharedCompanion: 'Compagnon partagé',
    clearCompanion: 'Effacer la réponse partagée',
    companionFootnote:
      'Publié sur cette page pour toutes les personnes qui l’utilisent. La conversation reste dans ChatGPT.',
    canonicalEnglish: 'Notice canonique en anglais',
    sources: 'Sources',
    agentChanged: 'ChatGPT a modifié la galerie :',
    youChanged: 'Vous avez modifié la galerie :',
    revisionLabel: 'État partagé',
    undoLastChange: 'Annuler la dernière modification',
    dismissActivity: 'Masquer le reçu d’activité',
    activityActions: {
      navigate: 'A changé l’œuvre actuelle.',
      'set-mode': 'A changé le style de narration.',
      'configure-presentation': 'A adapté la présentation.',
      'set-font-family': 'A changé la police.',
      'set-font-size': 'A changé la taille du texte.',
      'set-contrast': 'A changé le contraste.',
      'set-theme': 'A changé le thème de couleur.',
      'set-language': 'A changé la langue.',
      'focus-region': 'A ciblé un détail de l’œuvre.',
      'focus-agent-region': 'A proposé un détail localisé.',
      'confirm-region': 'A confirmé un détail proposé.',
      'dismiss-region': 'A écarté un détail proposé.',
      'clear-focus': 'Est revenu à l’œuvre entière.',
      'analyze-regions': 'A terminé l’analyse locale des détails.',
      'publish-gallery-response': 'A publié une réponse partagée.',
      'clear-gallery-response': 'A effacé la réponse partagée.',
      undo: 'A annulé la modification précédente.',
    },
    askChatGpt: 'Demandez à ChatGPT',
    toolsReadyShort: 'Site Tools prêtes.',
    manualReadyShort: 'Mode galerie manuel.',
    guideReady: 'Les Site Tools sont prêtes. Essayez une demande naturelle :',
    guideManual:
      'La galerie reste entièrement utilisable. Dans un navigateur WebMCP, ChatGPT peut partager ces commandes.',
    promptSuggestions: [
      'Décris ceci spatialement.',
      'Qu’est-ce qui est connu et qu’imagines-tu ?',
      'Montre-moi des détails à explorer.',
      'Emmène-moi vers quelque chose de plus calme.',
    ],
    imageUnavailable: 'Image indisponible',
    imageCouldNotDisplay: 'L’image n’a pas pu être affichée.',
    artworkRecordAvailable: 'La fiche de l’œuvre reste disponible.',
    noObservation: 'Aucune observation visuelle n’est disponible.',
    settingsTitle: 'Réglages de la galerie',
    closeSettings: 'Fermer les réglages de la galerie',
    personalizationTitle: 'Faites de cette galerie la vôtre',
    personalizationLede: 'Adaptez toute l’expérience. Chaque changement est immédiat, qu’il vienne de vous ou d’un agent.',
    fontFamily: 'Police',
    fontSize: 'Taille du texte',
    contrast: 'Contraste',
    theme: 'Thème',
    language: 'Langue',
    choosingLens: 'Choisir le regard',
    choosingLensLede: 'L’œuvre reste en place ; seule sa manière d’être décrite change. C’est le même contrôle que sous le cartel.',
    provenanceTitle: 'Comment lire ce que vous entendez',
    talkingTitle: 'Dialoguer avec la galerie',
    talkingBody: 'Cette page publie son état et ses réglages de personnalisation comme Site Tools WebMCP, afin qu’un agent adapte la galerie sous vos yeux.',
    toolsDetected: 'Site Tools détectés dans ce navigateur.',
    toolsUnavailable: 'Ce navigateur ne propose pas de Site Tools. La galerie reste entièrement utilisable au clavier et avec un lecteur d’écran.',
    comfortTitle: 'Confort et confidentialité',
    comfortBody: 'Les transitions respectent le réglage système de réduction des animations. Les préférences ne durent que cette visite : aucun compte, cookie ou suivi. Les six œuvres proviennent du Metropolitan Museum of Art et sont dans le domaine public selon la',
    metPolicy: 'politique Met Open Access',
    done: 'Retour à la galerie',
    fontOptions: { atkinson: 'Hyperlisible', sans: 'Sans sérif', serif: 'Sérif', mono: 'Monospace' },
    sizeOptions: { small: 'Plus petit', medium: 'Par défaut', large: 'Plus grand', 'extra-large': 'Maximum' },
    contrastOptions: { soft: 'Adouci', standard: 'Standard', high: 'Élevé' },
    themeOptions: { light: 'Clair', dark: 'Sombre' },
  },
};

export function getUiCopy(language: GalleryLanguage): UiCopy {
  return copy[language];
}

const localizedModes: Record<GalleryLanguage, Record<ExperienceMode, { label: string; description: string }>> = {
  en: {
    literal: { label: 'Literal', description: 'Concrete visual detail, without invented meaning.' },
    spatial: { label: 'Spatial', description: 'Composition and relationships mapped across the frame.' },
    poetic: { label: 'Poetic', description: 'An imaginative encounter, clearly distinct from fact.' },
    story: { label: 'Story', description: 'A narrative inspired by the work, not its history.' },
    curatorial: { label: 'Curatorial', description: 'Verified context alongside careful interpretation.' },
  },
  es: {
    literal: { label: 'Literal', description: 'Detalles visuales concretos, sin significados inventados.' },
    spatial: { label: 'Espacial', description: 'Composición y relaciones situadas dentro del encuadre.' },
    poetic: { label: 'Poético', description: 'Un encuentro imaginativo, claramente separado de los hechos.' },
    story: { label: 'Relato', description: 'Una narración inspirada en la obra, no en su historia.' },
    curatorial: { label: 'Curatorial', description: 'Contexto verificado junto a una interpretación cuidadosa.' },
  },
  fr: {
    literal: { label: 'Littéral', description: 'Des détails visuels concrets, sans signification inventée.' },
    spatial: { label: 'Spatial', description: 'La composition et les relations situées dans le cadre.' },
    poetic: { label: 'Poétique', description: 'Une rencontre imaginative, clairement distincte des faits.' },
    story: { label: 'Récit', description: 'Un récit inspiré par l’œuvre, et non par son histoire.' },
    curatorial: { label: 'Curatorial', description: 'Un contexte vérifié accompagné d’une interprétation mesurée.' },
  },
};

export function getModeDefinition(mode: ExperienceMode, language: GalleryLanguage) {
  return localizedModes[language][mode];
}

const localizedProvenance: Record<GalleryLanguage, Record<ProvenanceKind, { label: string; description: string }>> = {
  en: {
    observed: { label: 'Observed', description: 'Checked against the image itself.' },
    known: { label: 'Known', description: 'Taken from the museum record, with a source.' },
    interpreted: { label: 'Interpreted', description: 'A reading of the work, attributed rather than asserted.' },
    imagined: { label: 'Imagined', description: 'Invention. Never presented as fact about the work.' },
  },
  es: {
    observed: { label: 'Observado', description: 'Comprobado en la propia imagen.' },
    known: { label: 'Conocido', description: 'Tomado de la ficha del museo, con una fuente.' },
    interpreted: { label: 'Interpretado', description: 'Una lectura atribuida de la obra, no una afirmación.' },
    imagined: { label: 'Imaginado', description: 'Invención. Nunca se presenta como un hecho sobre la obra.' },
  },
  fr: {
    observed: { label: 'Observé', description: 'Vérifié directement dans l’image.' },
    known: { label: 'Connu', description: 'Issu de la fiche du musée, avec une source.' },
    interpreted: { label: 'Interprété', description: 'Une lecture attribuée de l’œuvre, et non une affirmation.' },
    imagined: { label: 'Imaginé', description: 'Une invention, jamais présentée comme un fait sur l’œuvre.' },
  },
};

export function getProvenanceDefinition(kind: ProvenanceKind, language: GalleryLanguage) {
  return localizedProvenance[language][kind];
}

type ArtworkTranslation = Pick<Artwork, 'title' | 'medium'> & {
  alt: string;
};

const artworkTranslations: Record<Exclude<GalleryLanguage, 'en'>, Record<string, ArtworkTranslation>> = {
  es: {
    'pissarro-boulevard-montmartre': { title: 'El bulevar Montmartre en una mañana de invierno', medium: 'Óleo sobre lienzo', alt: 'Vista elevada de un bulevar parisino invernal, con edificios grises, árboles desnudos, peatones, carruajes y ómnibus rojos bajo un cielo pálido.' },
    'vermeer-woman-with-water-pitcher': { title: 'Joven con una jarra de agua', medium: 'Óleo sobre lienzo', alt: 'Una mujer con toca blanca y falda azul está en una habitación tranquila, junto a una ventana y una jarra de plata sobre una mesa.' },
    'gifford-kauterskill-clove': { title: 'Un desfiladero en las montañas (Kauterskill Clove)', medium: 'Óleo sobre lienzo', alt: 'Un profundo desfiladero boscoso lleno de neblina dorada, con un árbol inclinado y un sol pálido sobre montañas azules.' },
    'vangogh-wheat-field-cypresses': { title: 'Campo de trigo con cipreses', medium: 'Óleo sobre lienzo', alt: 'Un campo de trigo ocre bajo un cielo agitado, con un ciprés oscuro a la derecha y montañas azules en el horizonte.' },
    'hokusai-great-wave': { title: 'Bajo la ola de Kanagawa (La gran ola)', medium: 'Xilografía; tinta y color sobre papel', alt: 'Una enorme ola azul se curva sobre tres barcas mientras el monte Fuji aparece pequeño en el horizonte.' },
    'degas-dance-class': { title: 'La clase de danza', medium: 'Óleo sobre lienzo', alt: 'Una sala de ensayo llena de bailarinas con tutús blancos alrededor del maestro de ballet, con un gran espejo y un atril.' },
  },
  fr: {
    'pissarro-boulevard-montmartre': { title: 'Le boulevard Montmartre, matin d’hiver', medium: 'Huile sur toile', alt: 'Vue en hauteur d’un boulevard parisien hivernal bordé d’immeubles gris, d’arbres nus, de piétons, de fiacres et d’omnibus rouges.' },
    'vermeer-woman-with-water-pitcher': { title: 'Jeune femme à l’aiguière', medium: 'Huile sur toile', alt: 'Une femme coiffée de blanc et vêtue d’une jupe bleue se tient dans une pièce calme, près d’une fenêtre et d’une aiguière d’argent.' },
    'gifford-kauterskill-clove': { title: 'Une gorge dans les montagnes (Kauterskill Clove)', medium: 'Huile sur toile', alt: 'Une profonde gorge boisée baignée de brume dorée, avec un arbre penché et un soleil pâle au-dessus de montagnes bleues.' },
    'vangogh-wheat-field-cypresses': { title: 'Champ de blé avec cyprès', medium: 'Huile sur toile', alt: 'Un champ de blé ocre sous un ciel tourbillonnant, avec un grand cyprès sombre à droite et des montagnes bleues à l’horizon.' },
    'hokusai-great-wave': { title: 'Sous la vague au large de Kanagawa (La Grande Vague)', medium: 'Estampe sur bois ; encre et couleur sur papier', alt: 'Une immense vague bleue se courbe au-dessus de trois barques tandis que le mont Fuji paraît minuscule à l’horizon.' },
    'degas-dance-class': { title: 'La Classe de danse', medium: 'Huile sur toile', alt: 'Une salle de répétition remplie de danseuses en tutus blancs autour du maître de ballet, avec un grand miroir et un pupitre.' },
  },
};

export function localizeArtwork(artwork: Artwork, language: GalleryLanguage): Artwork {
  if (language === 'en') return artwork;
  const translation = artworkTranslations[language][artwork.id];
  if (!translation) return artwork;
  return {
    ...artwork,
    title: translation.title,
    medium: translation.medium,
    image: { ...artwork.image, alt: translation.alt },
  };
}

const regionLabels: Record<Exclude<GalleryLanguage, 'en'>, Record<string, string>> = {
  es: {
    'pissarro-boulevard-flow': 'El flujo del bulevar', 'pissarro-left-tree': 'El árbol invernal cercano', 'pissarro-right-facades': 'Las fachadas de la derecha',
    'vermeer-window-hand': 'La mano junto a la ventana', 'vermeer-pitcher-and-basin': 'La jarra y la palangana', 'vermeer-wall-map': 'El mapa de la pared',
    'gifford-veiled-sun': 'El sol velado', 'gifford-leaning-tree': 'El árbol inclinado', 'gifford-gorge-floor': 'El desfiladero',
    'vangogh-cypress': 'El ciprés', 'vangogh-wheat-field': 'El trigo en movimiento', 'vangogh-rolling-sky': 'El cielo ondulante',
    'hokusai-title-cartouche-signature': 'El cartucho del título y la firma japonesa', 'hokusai-breaking-wave': 'La ola rompiendo', 'hokusai-mount-fuji': 'El monte Fuji', 'hokusai-oarsmen': 'Los remeros',
    'degas-foreground-dancer': 'La bailarina en primer plano', 'degas-waiting-group': 'Las bailarinas que esperan y el maestro', 'degas-mirror': 'El espejo central',
  },
  fr: {
    'pissarro-boulevard-flow': 'Le mouvement du boulevard', 'pissarro-left-tree': 'L’arbre hivernal au premier plan', 'pissarro-right-facades': 'Les façades de droite',
    'vermeer-window-hand': 'Sa main à la fenêtre', 'vermeer-pitcher-and-basin': 'L’aiguière et le bassin', 'vermeer-wall-map': 'La carte au mur',
    'gifford-veiled-sun': 'Le soleil voilé', 'gifford-leaning-tree': 'L’arbre penché', 'gifford-gorge-floor': 'La gorge en contrebas',
    'vangogh-cypress': 'Le cyprès', 'vangogh-wheat-field': 'Le blé en mouvement', 'vangogh-rolling-sky': 'Le ciel tourbillonnant',
    'hokusai-title-cartouche-signature': 'Le cartouche du titre et la signature japonaise', 'hokusai-breaking-wave': 'La vague déferlante', 'hokusai-mount-fuji': 'Le mont Fuji', 'hokusai-oarsmen': 'Les rameurs',
    'degas-foreground-dancer': 'La danseuse au premier plan', 'degas-waiting-group': 'Les danseuses en attente et le maître', 'degas-mirror': 'Le miroir central',
  },
};

const regionDescriptions: Record<Exclude<GalleryLanguage, 'en'>, Record<string, string>> = {
  es: {
    'pissarro-boulevard-flow': 'El tráfico y los peatones convergen por la amplia avenida hacia un punto de fuga brumoso.',
    'pissarro-left-tree': 'Un árbol oscuro y sin hojas se alza desde la acera cercana e interrumpe las fachadas pálidas.',
    'pissarro-right-facades': 'Una larga pared de tejados de pizarra, chimeneas, balcones y escaparates avanza hacia la calle.',
    'vermeer-window-hand': 'La mano izquierda extendida de la mujer toca la ventana emplomada por la que entra la luz.',
    'vermeer-pitcher-and-basin': 'Una jarra metálica descansa en una palangana sobre la mesa alfombrada, sostenida suavemente por su mano derecha.',
    'vermeer-wall-map': 'Un mapa enrollado cuelga en lo alto de la pared derecha, la única marca sobre una superficie casi vacía.',
    'gifford-veiled-sun': 'Un disco de luz suave aparece entre la bruma dorada sobre las tenues montañas azules del fondo.',
    'gifford-leaning-tree': 'Un árbol delgado y desnudo se arquea desde el acantilado izquierdo, con las ramas bañadas por la luz baja.',
    'gifford-gorge-floor': 'Las laderas boscosas descienden a ambos lados hacia una pequeña poza pálida en el fondo del barranco.',
    'vangogh-cypress': 'Un alto ciprés verde oscuro asciende por la derecha del lienzo y supera la línea de nubes.',
    'vangogh-wheat-field': 'Trazos ocres y dorados barren de lado el tercio inferior y acercan el campo al espectador.',
    'vangogh-rolling-sky': 'Nubes blancas y azules ondulantes llenan la parte superior izquierda y convierten el cielo en movimiento visible.',
    'hokusai-title-cartouche-signature': 'El título de la serie y de la estampa ocupa un cartucho estrecho arriba a la izquierda, junto a la firma vertical de Hokusai.',
    'hokusai-breaking-wave': 'La gran cresta surge del borde izquierdo y se extiende por la mitad superior con espuma blanca en forma de garras.',
    'hokusai-mount-fuji': 'El cono nevado permanece pequeño y quieto en el centro del horizonte, empequeñecido por el agua.',
    'hokusai-oarsmen': 'Los remeros se agachan en largas barcas entre las olas, con la espalda siguiendo la curva del mar.',
    'degas-foreground-dancer': 'Una bailarina con faja azul y amplio tutú blanco se sitúa junto al atril y corta la sala en diagonal.',
    'degas-waiting-group': 'Las bailarinas se reúnen, estiran y esperan alrededor del maestro de ballet en el extremo derecho.',
    'degas-mirror': 'Un espejo alto de marco oscuro refleja figuras pálidas y una ventana luminosa, ampliando la sala abarrotada.',
  },
  fr: {
    'pissarro-boulevard-flow': 'La circulation et les piétons convergent le long de la grande avenue vers un point de fuite brumeux.',
    'pissarro-left-tree': 'Un arbre sombre et dénudé s’élève du trottoir proche et interrompt les façades pâles.',
    'pissarro-right-facades': 'Une longue paroi de toits d’ardoise, cheminées, balcons et devantures se resserre vers la rue.',
    'vermeer-window-hand': 'La main gauche tendue de la femme rejoint la fenêtre à croisillons par laquelle entre la lumière.',
    'vermeer-pitcher-and-basin': 'Une aiguière en métal repose dans un bassin sur la table couverte d’un tapis, tenue délicatement de la main droite.',
    'vermeer-wall-map': 'Une carte roulée est suspendue en haut du mur de droite, seule marque sur une surface presque nue.',
    'gifford-veiled-sun': 'Un disque de lumière douce repose dans la brume dorée au-dessus des faibles crêtes bleues du lointain.',
    'gifford-leaning-tree': 'Un arbre fin et dénudé s’arque depuis la falaise gauche, ses branches saisissant la lumière basse.',
    'gifford-gorge-floor': 'Les pentes boisées descendent de part et d’autre vers un petit bassin pâle au fond du ravin.',
    'vangogh-cypress': 'Un grand cyprès vert sombre monte sur le côté droit de la toile et dépasse la ligne des nuages.',
    'vangogh-wheat-field': 'Des touches ocre et or balayent le tiers inférieur et aplatissent le champ vers le regardeur.',
    'vangogh-rolling-sky': 'Des nuages blancs et bleus ondulants remplissent le haut gauche et rendent le mouvement du ciel visible.',
    'hokusai-title-cartouche-signature': 'Le titre de la série et celui de l’estampe remplissent un étroit cartouche en haut à gauche, près de la signature verticale de Hokusai.',
    'hokusai-breaking-wave': 'La grande crête s’élève du bord gauche et traverse la moitié supérieure dans une écume blanche en forme de griffes.',
    'hokusai-mount-fuji': 'Le cône enneigé reste petit et immobile au centre de l’horizon, dominé par l’eau.',
    'hokusai-oarsmen': 'Les rameurs se courbent dans de longues barques entre les houles, le dos suivant la courbe de la mer.',
    'degas-foreground-dancer': 'Une danseuse à ceinture bleue et large tutu blanc se tient près du pupitre, son corps coupant la salle en diagonale.',
    'degas-waiting-group': 'Les danseuses se regroupent, s’étirent et attendent autour du vieux maître de ballet à l’extrême droite.',
    'degas-mirror': 'Un haut miroir au cadre sombre reflète des silhouettes pâles et une fenêtre lumineuse, approfondissant la salle encombrée.',
  },
};

export function localizeRegion(region: ArtworkRegion, language: GalleryLanguage): ArtworkRegion {
  if (language === 'en' || region.provenance === 'agent-grounded' || region.provenance === 'model-detected') return region;
  const label = regionLabels[language][region.id];
  const description = regionDescriptions[language][region.id];
  return label || description
    ? { ...region, ...(label ? { label } : {}), ...(description ? { description } : {}) }
    : region;
}
