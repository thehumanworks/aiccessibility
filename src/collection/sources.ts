import type { SourceRecord } from '../gallery/types';

export const sources = {
  metPissarro: {
    id: 'met-object-437310',
    label: 'The Metropolitan Museum of Art, object 437310',
    url: 'https://www.metmuseum.org/art/collection/search/437310',
  },
  metDegas: {
    id: 'met-object-438817',
    label: 'The Metropolitan Museum of Art, object 438817',
    url: 'https://www.metmuseum.org/art/collection/search/438817',
  },
  metVanGogh: {
    id: 'met-object-436535',
    label: 'The Metropolitan Museum of Art, object 436535',
    url: 'https://www.metmuseum.org/art/collection/search/436535',
  },
  metVermeer: {
    id: 'met-object-437881',
    label: 'The Metropolitan Museum of Art, object 437881',
    url: 'https://www.metmuseum.org/art/collection/search/437881',
  },
  metGifford: {
    id: 'met-object-10946',
    label: 'The Metropolitan Museum of Art, object 10946',
    url: 'https://www.metmuseum.org/art/collection/search/10946',
  },
  metHokusai: {
    id: 'met-object-45434',
    label: 'The Metropolitan Museum of Art, object 45434',
    url: 'https://www.metmuseum.org/art/collection/search/45434',
  },
  metOpenAccess: {
    id: 'met-open-access-policy',
    label: 'The Met Open Access and Image Resources policy',
    url: 'https://www.metmuseum.org/policies/image-resources',
  },
} as const satisfies Record<string, SourceRecord>;

export const sourceList = Object.values(sources);
