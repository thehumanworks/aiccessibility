import type { ArtworkId, RightsRecord } from '../gallery/types';

export const rightsByArtwork = {
  'pissarro-boulevard-montmartre': {
    status: 'Public Domain',
    provider: 'The Metropolitan Museum of Art',
    objectPageUrl: 'https://www.metmuseum.org/art/collection/search/437310',
    metadataUrl:
      'https://collectionapi.metmuseum.org/public/collection/v1/objects/437310',
    originalImageUrl:
      'https://images.metmuseum.org/CRDImages/ep/original/DP-21959-001.jpg',
    policyUrl: 'https://www.metmuseum.org/policies/image-resources',
    objectId: 437310,
    accessionNumber: '60.174',
  },
  'degas-dance-class': {
    status: 'Public Domain',
    provider: 'The Metropolitan Museum of Art',
    objectPageUrl: 'https://www.metmuseum.org/art/collection/search/438817',
    metadataUrl:
      'https://collectionapi.metmuseum.org/public/collection/v1/objects/438817',
    originalImageUrl:
      'https://images.metmuseum.org/CRDImages/ep/original/DP-20101-001.jpg',
    policyUrl: 'https://www.metmuseum.org/policies/image-resources',
    objectId: 438817,
    accessionNumber: '1987.47.1',
  },
  'vangogh-wheat-field-cypresses': {
    status: 'Public Domain',
    provider: 'The Metropolitan Museum of Art',
    objectPageUrl: 'https://www.metmuseum.org/art/collection/search/436535',
    metadataUrl:
      'https://collectionapi.metmuseum.org/public/collection/v1/objects/436535',
    originalImageUrl:
      'https://images.metmuseum.org/CRDImages/ep/original/DP-42549-001.jpg',
    policyUrl: 'https://www.metmuseum.org/policies/image-resources',
    objectId: 436535,
    accessionNumber: '1993.132',
  },
  'vermeer-woman-with-water-pitcher': {
    status: 'Public Domain',
    provider: 'The Metropolitan Museum of Art',
    objectPageUrl: 'https://www.metmuseum.org/art/collection/search/437881',
    metadataUrl:
      'https://collectionapi.metmuseum.org/public/collection/v1/objects/437881',
    originalImageUrl:
      'https://images.metmuseum.org/CRDImages/ep/original/DP353257.jpg',
    policyUrl: 'https://www.metmuseum.org/policies/image-resources',
    objectId: 437881,
    accessionNumber: '89.15.21',
  },
  'gifford-kauterskill-clove': {
    status: 'Public Domain',
    provider: 'The Metropolitan Museum of Art',
    objectPageUrl: 'https://www.metmuseum.org/art/collection/search/10946',
    metadataUrl:
      'https://collectionapi.metmuseum.org/public/collection/v1/objects/10946',
    originalImageUrl:
      'https://images.metmuseum.org/CRDImages/ad/original/DT81.jpg',
    policyUrl: 'https://www.metmuseum.org/policies/image-resources',
    objectId: 10946,
    accessionNumber: '15.30.62',
  },
  'hokusai-great-wave': {
    status: 'Public Domain',
    provider: 'The Metropolitan Museum of Art',
    objectPageUrl: 'https://www.metmuseum.org/art/collection/search/45434',
    metadataUrl:
      'https://collectionapi.metmuseum.org/public/collection/v1/objects/45434',
    originalImageUrl:
      'https://images.metmuseum.org/CRDImages/as/original/DP130155.jpg',
    policyUrl: 'https://www.metmuseum.org/policies/image-resources',
    objectId: 45434,
    accessionNumber: 'JP1847',
  },
} as const satisfies Record<ArtworkId, RightsRecord>;
