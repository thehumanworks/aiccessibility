import type { CompactRegionMask, NormalizedBounds } from './types';

export interface MaskTensorLike {
  data: ArrayLike<number | bigint | boolean>;
  dims: readonly number[];
}

function valueAt(data: MaskTensorLike['data'], index: number): number {
  const value = data[index];
  return typeof value === 'bigint' ? Number(value) : value ? Number(value) : 0;
}

export function encodeBinaryRle(values: readonly number[]): number[] {
  const counts: number[] = [];
  let expected = 0;
  let run = 0;
  for (const rawValue of values) {
    const value = rawValue ? 1 : 0;
    if (value === expected) {
      run += 1;
    } else {
      counts.push(run);
      run = 1;
      expected = value;
    }
  }
  counts.push(run);
  return counts;
}

/**
 * Extract one SAM mask, crop it to the accepted box, and downsample it to a
 * bounded binary RLE. This avoids transferring full-resolution mask tensors
 * from the worker.
 */
export function compactMaskFromTensor(
  tensor: MaskTensorLike,
  regionIndex: number,
  maskIndex: number,
  crop: NormalizedBounds,
  score: number,
  maxSide = 48,
): CompactRegionMask | undefined {
  const dims = [...tensor.dims];
  if (dims.length !== 4) return undefined;
  const [regionCount, maskCount, sourceHeight, sourceWidth] = dims;
  if (
    regionCount === undefined ||
    maskCount === undefined ||
    sourceHeight === undefined ||
    sourceWidth === undefined ||
    regionIndex < 0 ||
    regionIndex >= regionCount ||
    maskIndex < 0 ||
    maskIndex >= maskCount ||
    sourceHeight <= 0 ||
    sourceWidth <= 0
  ) {
    return undefined;
  }

  const left = Math.max(0, Math.floor(crop.x * sourceWidth));
  const top = Math.max(0, Math.floor(crop.y * sourceHeight));
  const right = Math.min(
    sourceWidth,
    Math.max(left + 1, Math.ceil((crop.x + crop.width) * sourceWidth)),
  );
  const bottom = Math.min(
    sourceHeight,
    Math.max(top + 1, Math.ceil((crop.y + crop.height) * sourceHeight)),
  );
  const cropWidth = right - left;
  const cropHeight = bottom - top;
  const scale = Math.min(1, maxSide / Math.max(cropWidth, cropHeight));
  const width = Math.max(1, Math.round(cropWidth * scale));
  const height = Math.max(1, Math.round(cropHeight * scale));
  const values: number[] = [];
  const regionStride = maskCount * sourceHeight * sourceWidth;
  const maskStride = sourceHeight * sourceWidth;

  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(
      bottom - 1,
      top + Math.floor(((y + 0.5) * cropHeight) / height),
    );
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(
        right - 1,
        left + Math.floor(((x + 0.5) * cropWidth) / width),
      );
      const index =
        regionIndex * regionStride +
        maskIndex * maskStride +
        sourceY * sourceWidth +
        sourceX;
      values.push(valueAt(tensor.data, index) > 0 ? 1 : 0);
    }
  }

  return {
    encoding: 'binary-rle-v1',
    width,
    height,
    counts: encodeBinaryRle(values),
    crop,
    score: Math.min(1, Math.max(0, score)),
  };
}
