import type { ModelDetectedRegion, NormalizedBounds } from './types';

export interface RawRegionDetection {
  label: string;
  score: number;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

export interface AcceptedRegionDetection {
  id: string;
  label: string;
  confidence: number;
  bounds: NormalizedBounds;
}

export interface DetectionAcceptanceOptions {
  threshold?: number;
  minArea?: number;
  maxArea?: number;
  maxRegions?: number;
  overlapThreshold?: number;
}

const DEFAULTS = {
  threshold: 0.14,
  minArea: 0.0025,
  maxArea: 0.95,
  maxRegions: 8,
  overlapThreshold: 0.72,
} as const;

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function finite(value: number): boolean {
  return Number.isFinite(value);
}

export function normalizeBounds(
  box: RawRegionDetection['box'],
): NormalizedBounds | null {
  if (![box.xmin, box.ymin, box.xmax, box.ymax].every(finite)) {
    return null;
  }

  const x1 = clamp(Math.min(box.xmin, box.xmax));
  const y1 = clamp(Math.min(box.ymin, box.ymax));
  const x2 = clamp(Math.max(box.xmin, box.xmax));
  const y2 = clamp(Math.max(box.ymin, box.ymax));
  const width = x2 - x1;
  const height = y2 - y1;

  return width > 0 && height > 0 ? { x: x1, y: y1, width, height } : null;
}

export function boundsIoU(a: NormalizedBounds, b: NormalizedBounds): number {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  const intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
  const union = a.width * a.height + b.width * b.height - intersection;
  return union > 0 ? intersection / union : 0;
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32) || 'region';
}

export function createModelRegionId(
  label: string,
  bounds: NormalizedBounds,
): string {
  const signature = [bounds.x, bounds.y, bounds.width, bounds.height]
    .map((value) => Math.round(value * 1000))
    .join(':');
  return `model-${slug(label)}-${hashString(`${label.toLowerCase()}|${signature}`)}`;
}

export function sanitizeCandidateLabels(
  labels: readonly string[] | undefined,
): string[] {
  const source = labels ?? DEFAULT_CANDIDATE_LABELS;
  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const candidate of source) {
    const value = candidate.trim().replace(/\s+/g, ' ').slice(0, 80);
    const key = value.toLocaleLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    sanitized.push(value);
    if (sanitized.length === 24) break;
  }

  return sanitized.length > 0 ? sanitized : [...DEFAULT_CANDIDATE_LABELS];
}

export const DEFAULT_CANDIDATE_LABELS = [
  'person',
  'face',
  'tree',
  'building',
  'boat',
  'mountain',
  'sky',
  'water',
  'animal',
  'window',
] as const;

export function acceptDetections(
  detections: readonly RawRegionDetection[],
  options: DetectionAcceptanceOptions = {},
): AcceptedRegionDetection[] {
  const threshold = clamp(options.threshold ?? DEFAULTS.threshold);
  const minArea = clamp(options.minArea ?? DEFAULTS.minArea);
  const maxArea = clamp(options.maxArea ?? DEFAULTS.maxArea);
  const maxRegions = Math.max(
    1,
    Math.min(20, Math.floor(options.maxRegions ?? DEFAULTS.maxRegions)),
  );
  const overlapThreshold = clamp(
    options.overlapThreshold ?? DEFAULTS.overlapThreshold,
  );

  const candidates = detections
    .flatMap((detection) => {
      const label = detection.label.trim().replace(/\s+/g, ' ').slice(0, 80);
      const bounds = normalizeBounds(detection.box);
      const area = bounds ? bounds.width * bounds.height : 0;
      if (
        !label ||
        !finite(detection.score) ||
        detection.score < threshold ||
        !bounds ||
        area < minArea ||
        area > maxArea
      ) {
        return [];
      }
      return [{ label, confidence: clamp(detection.score), bounds }];
    })
    .sort(
      (a, b) =>
        b.confidence - a.confidence ||
        a.label.localeCompare(b.label) ||
        a.bounds.x - b.bounds.x ||
        a.bounds.y - b.bounds.y,
    );

  const accepted: AcceptedRegionDetection[] = [];
  for (const candidate of candidates) {
    if (
      accepted.some(
        (existing) => boundsIoU(existing.bounds, candidate.bounds) >= overlapThreshold,
      )
    ) {
      continue;
    }

    accepted.push({
      ...candidate,
      id: createModelRegionId(candidate.label, candidate.bounds),
    });
    if (accepted.length === maxRegions) break;
  }

  return accepted;
}

export function isModelDetectedRegion(
  value: ModelDetectedRegion,
): value is ModelDetectedRegion {
  return (
    value.provenance === 'model-detected' &&
    value.verification === 'unverified-model-suggestion' &&
    normalizeBounds({
      xmin: value.bounds.x,
      ymin: value.bounds.y,
      xmax: value.bounds.x + value.bounds.width,
      ymax: value.bounds.y + value.bounds.height,
    }) !== null
  );
}
