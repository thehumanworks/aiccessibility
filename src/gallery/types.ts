export type ArtworkId =
  | 'pissarro-boulevard-montmartre'
  | 'degas-dance-class'
  | 'vangogh-wheat-field-cypresses'
  | 'vermeer-woman-with-water-pitcher'
  | 'gifford-kauterskill-clove'
  | 'hokusai-great-wave';

export type AuthoredRegionId =
  | 'pissarro-boulevard-flow'
  | 'pissarro-left-tree'
  | 'pissarro-right-facades'
  | 'degas-foreground-dancer'
  | 'degas-waiting-group'
  | 'degas-mirror'
  | 'vangogh-cypress'
  | 'vangogh-wheat-field'
  | 'vangogh-rolling-sky'
  | 'vermeer-window-hand'
  | 'vermeer-pitcher-and-basin'
  | 'vermeer-wall-map'
  | 'gifford-veiled-sun'
  | 'gifford-leaning-tree'
  | 'gifford-gorge-floor'
  | 'hokusai-breaking-wave'
  | 'hokusai-mount-fuji'
  | 'hokusai-oarsmen';

/** Authored ids and stable ids assigned to accepted local-model regions. */
export type RegionId = AuthoredRegionId | (string & {});

export type ExperienceMode =
  | 'literal'
  | 'spatial'
  | 'poetic'
  | 'story'
  | 'curatorial';

export type ProvenanceKind = 'observed' | 'known' | 'interpreted' | 'imagined';

export type FontFamily = 'atkinson' | 'sans' | 'serif' | 'mono';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ContrastLevel = 'soft' | 'standard' | 'high';
export type ColorTheme = 'light' | 'dark';
export type GalleryLanguage = 'en' | 'es' | 'fr';
export type ChangeOrigin = 'human' | 'agent';

export interface PersonalizationPreferences {
  fontFamily: FontFamily;
  fontSize: FontSize;
  contrast: ContrastLevel;
  theme: ColorTheme;
  language: GalleryLanguage;
}

export interface InterpretationSegment {
  provenance: ProvenanceKind;
  text: string;
  /** Present when the text was resolved from the gallery's authored record. */
  statementId?: string;
  /** Present for sourced Known or attributed Interpreted statements. */
  sourceIds?: readonly string[];
}

export interface RenderedInterpretation {
  artworkId: ArtworkId;
  focusedRegionId: RegionId | null;
  language: GalleryLanguage;
  mode: ExperienceMode;
  title?: string;
  segments: readonly InterpretationSegment[];
}

export interface GallerySnapshot {
  artworkId: ArtworkId;
  mode: ExperienceMode;
  personalization: PersonalizationPreferences;
  focusedRegionId: RegionId | null;
  interpretation: RenderedInterpretation | null;
  agentGroundedRegions: Partial<Record<ArtworkId, readonly ArtworkRegion[]>>;
  acceptedModelRegions: Partial<Record<ArtworkId, readonly ArtworkRegion[]>>;
  regionAnalysis: Record<ArtworkId, RegionAnalysisState>;
}

export type GalleryActivityAction =
  | 'navigate'
  | 'set-mode'
  | 'configure-presentation'
  | 'set-font-family'
  | 'set-font-size'
  | 'set-contrast'
  | 'set-theme'
  | 'set-language'
  | 'focus-region'
  | 'focus-agent-region'
  | 'confirm-region'
  | 'dismiss-region'
  | 'clear-focus'
  | 'analyze-regions'
  | 'publish-gallery-response'
  | 'clear-gallery-response'
  | 'undo';

export interface SessionActivityEntry {
  sequence: number;
  origin: ChangeOrigin;
  action: GalleryActivityAction;
  fromRevision: number;
  toRevision: number;
  /** Deliberately excludes raw prompts and generated response text. */
  summary: string;
}

export interface GalleryState extends GallerySnapshot {
  revision: number;
  activity: readonly SessionActivityEntry[];
  activitySequence: number;
  /** One-step, in-memory recovery state. Never included in tool output. */
  undoSnapshot: GallerySnapshot | null;
}

export interface RightsRecord {
  status: 'Public Domain';
  provider: string;
  objectPageUrl: string;
  metadataUrl: string;
  originalImageUrl: string;
  policyUrl: string;
  objectId: number;
  accessionNumber: string;
}

export interface SourceRecord {
  id: string;
  label: string;
  url: string;
}

export interface GroundedStatement {
  id: string;
  text: string;
}

export interface SourcedStatement extends GroundedStatement {
  sourceIds: string[];
}

export interface RegionBounds {
  /** Normalized to the displayed source image, from 0 through 1. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionModelMetadata {
  detector: string;
  detectorRevision: string;
  refiner?: string;
  refinerRevision?: string;
  refinerBackend?: 'webgpu' | 'wasm';
  backend: 'webgpu' | 'wasm';
}

export interface CompactRegionMask {
  /** A browser-safe normalized outline, never raw model tensors or bitmap data. */
  encoding: 'polygon';
  points: readonly number[];
}

export interface ArtworkRegion {
  id: RegionId;
  label: string;
  description: string;
  bounds: RegionBounds;
  /** Natural-language phrases that can resolve directly to an authored region. */
  queryAliases?: readonly string[];
  confidence?: number;
  provenance?: 'authored' | 'agent-grounded' | 'model-detected';
  verification?: 'authored' | 'unverified' | 'human-confirmed';
  model?: RegionModelMetadata;
  mask?: CompactRegionMask;
}

export type RegionAnalysisPhase =
  | 'idle'
  | 'loading'
  | 'analyzing'
  | 'complete'
  | 'failed';

export interface RegionAnalysisState {
  phase: RegionAnalysisPhase;
  progress: number;
  message: string;
  backend: 'webgpu' | 'wasm' | 'authored';
  error: string | null;
}

export interface Artwork {
  id: ArtworkId;
  title: string;
  artist: string;
  yearLabel: string;
  medium: string;
  dimensionsLabel: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  rights: RightsRecord;
  discovery: {
    moods: string[];
    themes: string[];
    palette: string[];
    subjects: string[];
  };
  observed: GroundedStatement[];
  known: SourcedStatement[];
  interpreted: SourcedStatement[];
  regions: ArtworkRegion[];
}
