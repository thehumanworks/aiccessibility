import {
  acceptDetections,
  boundsIoU,
  createModelRegionId,
  normalizeBounds,
  sanitizeCandidateLabels,
} from '../src/regions/acceptance';
import { compactMaskFromTensor, encodeBinaryRle } from '../src/regions/mask';

describe('region model acceptance', () => {
  it('normalizes reversed and out-of-range boxes without producing invalid bounds', () => {
    const normalized = normalizeBounds({
      xmin: 1.2,
      ymin: 0.8,
      xmax: -0.2,
      ymax: 0.1,
    });
    expect(normalized).toMatchObject({ x: 0, y: 0.1, width: 1 });
    expect(normalized!.height).toBeCloseTo(0.7);
    expect(
      normalizeBounds({ xmin: Number.NaN, ymin: 0, xmax: 1, ymax: 1 }),
    ).toBeNull();
    expect(normalizeBounds({ xmin: 2, ymin: 2, xmax: 3, ymax: 3 })).toBeNull();
  });

  it('filters weak/degenerate detections and applies deterministic overlap suppression', () => {
    const detections = [
      {
        label: 'tree',
        score: 0.82,
        box: { xmin: 0.1, ymin: 0.1, xmax: 0.5, ymax: 0.8 },
      },
      {
        label: 'dark tree',
        score: 0.9,
        box: { xmin: 0.11, ymin: 0.1, xmax: 0.51, ymax: 0.8 },
      },
      {
        label: 'boat',
        score: 0.7,
        box: { xmin: 0.7, ymin: 0.7, xmax: 0.9, ymax: 0.9 },
      },
      {
        label: 'sky',
        score: 0.1,
        box: { xmin: 0, ymin: 0, xmax: 1, ymax: 0.5 },
      },
    ];

    const accepted = acceptDetections(detections, {
      threshold: 0.2,
      maxRegions: 4,
    });

    expect(accepted.map(({ label }) => label)).toEqual(['dark tree', 'boat']);
    expect(accepted.every(({ id }) => id.startsWith('model-'))).toBe(true);
    expect(boundsIoU(accepted[0]!.bounds, accepted[1]!.bounds)).toBe(0);
  });

  it('generates stable ids at the documented one-thousandth precision', () => {
    const first = createModelRegionId('Blue boat', {
      x: 0.2004,
      y: 0.3004,
      width: 0.4004,
      height: 0.1004,
    });
    const jittered = createModelRegionId('Blue boat', {
      x: 0.20041,
      y: 0.30041,
      width: 0.40041,
      height: 0.10041,
    });
    expect(jittered).toBe(first);
  });

  it('sanitizes duplicate/blank prompts and retains an immediate default', () => {
    expect(sanitizeCandidateLabels(['  Tree ', 'tree', '', 'red   boat'])).toEqual([
      'Tree',
      'red boat',
    ]);
    expect(sanitizeCandidateLabels([])).not.toHaveLength(0);
  });
});
describe('compact mask representation', () => {
  it('uses a zero-first binary RLE', () => {
    expect(encodeBinaryRle([1, 1, 0, 1])).toEqual([0, 2, 1, 1]);
    expect(encodeBinaryRle([0, 0, 1])).toEqual([2, 1]);
  });

  it('extracts only the selected SAM region and mask into a bounded crop', () => {
    const data = new Uint8Array(2 * 3 * 4 * 4);
    const secondRegionThirdMaskOffset = (1 * 3 + 2) * 16;
    data.fill(1, secondRegionThirdMaskOffset, secondRegionThirdMaskOffset + 16);

    const compact = compactMaskFromTensor(
      { data, dims: [2, 3, 4, 4] },
      1,
      2,
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
      0.87,
      2,
    );

    expect(compact).toMatchObject({
      encoding: 'binary-rle-v1',
      width: 2,
      height: 2,
      counts: [0, 4],
      score: 0.87,
    });
  });
});
