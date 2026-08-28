export interface NormalizedBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CompactRegionMask {
  encoding: 'binary-rle-v1';
  /** Mask dimensions after bounded downsampling, not the source artwork size. */
  width: number;
  height: number;
  /** Alternating zero/one run lengths in row-major order, beginning with zero. */
  counts: number[];
  /** The artwork-relative crop to which this compact mask applies. */
  crop: NormalizedBounds;
  score: number;
}

export type RegionModelBackend = 'webgpu' | 'wasm';

export interface RegionModelMetadata {
  runtime: '@huggingface/transformers@3.8.1';
  backend: RegionModelBackend;
  detector: {
    id: string;
    revision: string;
    dtype: 'q4f16' | 'q8';
  };
  refiner: {
    id: string;
    revision: string;
    dtype: 'q8';
    backend?: RegionModelBackend;
  };
}

export interface ModelDetectedRegion {
  /** Deterministic for a label and bounds rounded to one-thousandth. */
  id: string;
  label: string;
  bounds: NormalizedBounds;
  confidence: number;
  provenance: 'model-detected';
  verification: 'unverified-model-suggestion';
  model: RegionModelMetadata;
  mask?: CompactRegionMask;
}

export type RegionAnalysisPhase =
  | 'loading'
  | 'fallback'
  | 'detecting'
  | 'refining'
  | 'complete'
  | 'failed';

export interface RegionAnalysisProgress {
  phase: RegionAnalysisPhase;
  message: string;
  /** A best-effort value in the inclusive range 0..1. */
  progress?: number;
  backend?: RegionModelBackend;
  file?: string;
}

export interface AnalyzeArtworkRegionsInput {
  artworkId: string;
  /** Same-origin gallery asset URL or a user-selected object/data URL. */
  imageUrl: string;
  candidateLabels?: readonly string[];
  detectionThreshold?: number;
  acceptanceThreshold?: number;
  maxRegions?: number;
}

export interface AnalyzeArtworkRegionsResult {
  artworkId: string;
  status: 'complete';
  regions: ModelDetectedRegion[];
  model: RegionModelMetadata;
  analyzedLocally: true;
}

export type RegionProgressListener = (progress: RegionAnalysisProgress) => void;
