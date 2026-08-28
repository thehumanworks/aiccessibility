import { artworks } from '../src/collection/artworks';
import { rightsByArtwork } from '../src/collection/rights';
import { sourceList } from '../src/collection/sources';
import {
  getArtwork,
  getRegion,
  getSource,
  isArtworkId,
} from '../src/collection/repository';

const expectedIds = [
  'pissarro-boulevard-montmartre',
  'vermeer-woman-with-water-pitcher',
  'gifford-kauterskill-clove',
  'vangogh-wheat-field-cypresses',
  'hokusai-great-wave',
  'degas-dance-class',
];

describe('collection integrity', () => {
  it('contains six unique, fully licensed public-domain artworks', () => {
    expect(artworks).toHaveLength(6);
    expect(artworks.map((artwork) => artwork.id)).toEqual(expectedIds);
    expect(new Set(artworks.map((artwork) => artwork.id)).size).toBe(6);

    for (const artwork of artworks) {
      expect(artwork.rights.status).toBe('Public Domain');
      expect(artwork.rights.provider).toBe('The Metropolitan Museum of Art');
      expect(artwork.rights.objectPageUrl).toBe(
        `https://www.metmuseum.org/art/collection/search/${artwork.rights.objectId}`,
      );
      expect(artwork.rights.metadataUrl).toBe(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${artwork.rights.objectId}`,
      );
      expect(artwork.rights.originalImageUrl).toMatch(
        /^https:\/\/images\.metmuseum\.org\/CRDImages\//,
      );
      expect(artwork.rights.policyUrl).toBe(
        'https://www.metmuseum.org/policies/image-resources',
      );
      expect(artwork.rights.accessionNumber).not.toBe('');
    }
  });

  it('binds every artwork to a local asset with declared dimensions', () => {
    for (const artwork of artworks) {
      expect(artwork.image.src).toBe(`/artworks/${artwork.id}.jpg`);
      expect(artwork.image.width).toBeGreaterThanOrEqual(1600);
      expect(artwork.image.height).toBeGreaterThanOrEqual(1600);
      expect(artwork.image.alt.length).toBeGreaterThan(60);
      expect(artwork.medium).not.toBe('');
      expect(artwork.dimensionsLabel).toMatch(/cm$/);
    }
  });

  it('keeps regions bounded, uniquely identified, and resolvable', () => {
    const regionIds = artworks.flatMap((artwork) =>
      artwork.regions.map((region) => region.id),
    );
    expect(new Set(regionIds).size).toBe(regionIds.length);

    for (const artwork of artworks) {
      expect(artwork.regions).toHaveLength(3);

      for (const region of artwork.regions) {
        const { x, y, width, height } = region.bounds;
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
        expect(x + width).toBeLessThanOrEqual(1);
        expect(y + height).toBeLessThanOrEqual(1);
        expect(region.label).not.toBe('');
        expect(region.description.length).toBeGreaterThan(20);
        expect(getRegion(artwork.id, region.id)).toEqual(region);
      }
    }
  });

  it('grounds observed statements and resolves every cited source', () => {
    for (const artwork of artworks) {
      expect(artwork.observed.length).toBeGreaterThanOrEqual(3);
      expect(artwork.known.length).toBeGreaterThanOrEqual(2);

      for (const statement of [...artwork.known, ...artwork.interpreted]) {
        expect(statement.sourceIds.length).toBeGreaterThan(0);
        for (const sourceId of statement.sourceIds) {
          expect(getSource(sourceId)).toBeDefined();
        }
      }

      expect(
        artwork.known.some((statement) =>
          (statement.sourceIds as readonly string[]).includes(
            'met-open-access-policy',
          ),
        ),
      ).toBe(true);
    }

    for (const source of sourceList) {
      expect(source.url).toMatch(/^https:\/\/www\.metmuseum\.org\//);
    }
  });

  it('gives every work distinct discovery cues for free navigation', () => {
    const allMoods = new Set<string>();

    for (const artwork of artworks) {
      expect(artwork.discovery.moods.length).toBeGreaterThanOrEqual(4);
      expect(artwork.discovery.themes.length).toBeGreaterThanOrEqual(3);
      expect(artwork.discovery.palette.length).toBeGreaterThanOrEqual(4);
      expect(artwork.discovery.subjects.length).toBeGreaterThanOrEqual(4);
      for (const mood of artwork.discovery.moods) {
        allMoods.add(mood);
      }
    }

    // Contrasting moods make "somewhere warmer" or "solitude" answerable.
    expect(allMoods.has('warm')).toBe(true);
    expect(allMoods.has('cool')).toBe(true);
    expect(allMoods.has('solitary')).toBe(true);
    expect(allMoods.has('electric')).toBe(true);
    expect(allMoods.size).toBeGreaterThanOrEqual(20);
  });

  it('keeps the rights ledger and the collection in exact agreement', () => {
    expect(Object.keys(rightsByArtwork).sort()).toEqual([...expectedIds].sort());

    for (const artwork of artworks) {
      expect(artwork.rights).toBe(rightsByArtwork[artwork.id]);
    }
  });

  it('supports bounded id lookup without pretending arbitrary ids exist', () => {
    expect(isArtworkId('hokusai-great-wave')).toBe(true);
    expect(isArtworkId('invented-work')).toBe(false);
    expect(getArtwork('vermeer-woman-with-water-pitcher').artist).toBe(
      'Johannes Vermeer',
    );
    expect(getArtwork('gifford-kauterskill-clove').yearLabel).toBe('1862');
  });
});
