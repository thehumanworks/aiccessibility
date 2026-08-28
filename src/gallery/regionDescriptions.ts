import { getArtwork } from '../collection/repository';
import type {
  ArtworkRegion,
  ExperienceMode,
  InterpretationSegment,
} from './types';

function horizontalPosition(region: ArtworkRegion): string {
  const center = region.bounds.x + region.bounds.width / 2;
  return center < 0.34 ? 'left side' : center > 0.66 ? 'right side' : 'centre';
}

function verticalPosition(region: ArtworkRegion): string {
  const center = region.bounds.y + region.bounds.height / 2;
  return center < 0.34 ? 'upper area' : center > 0.66 ? 'lower area' : 'middle';
}

export function describeRegionForMode(
  artworkId: Parameters<typeof getArtwork>[0],
  region: ArtworkRegion,
  mode: ExperienceMode,
): readonly InterpretationSegment[] {
  const artwork = getArtwork(artworkId);
  const base: InterpretationSegment = {
    provenance:
      region.provenance === 'model-detected' ? 'interpreted' : 'observed',
    text:
      region.provenance === 'model-detected'
        ? `A local vision model suggests “${region.label}” in this area. This is an unverified navigation cue, not museum fact.`
        : region.description,
  };

  switch (mode) {
    case 'literal':
      return [base];
    case 'spatial':
      return [
        base,
        {
          provenance: 'interpreted',
          text: `This region occupies the ${verticalPosition(region)} of the ${horizontalPosition(region)} and spans about ${Math.round(region.bounds.width * 100)}% of the artwork’s width by ${Math.round(region.bounds.height * 100)}% of its height.`,
        },
      ];
    case 'poetic':
      return [
        base,
        {
          provenance: 'imagined',
          text: `Imagine this part of the painting as a small room of attention around ${region.label.toLowerCase()}.`,
        },
      ];
    case 'story':
      return [
        base,
        {
          provenance: 'imagined',
          text: `In a story inspired by the work, the view pauses here at ${region.label.toLowerCase()} before moving across the rest of the scene.`,
        },
      ];
    case 'curatorial':
      return [
        base,
        {
          provenance: 'known',
          text: `This region belongs to ${artwork.title}, made by ${artwork.artist} in ${artwork.yearLabel}; the region label itself is ${region.provenance === 'model-detected' ? 'a local model suggestion' : 'authored gallery guidance'}.`,
        },
      ];
  }
}
