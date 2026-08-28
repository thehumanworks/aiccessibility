import type { Artwork } from '../gallery/types';
import { rightsByArtwork } from './rights';
import { sources } from './sources';

export const artworks = [
  {
    id: 'pissarro-boulevard-montmartre',
    title: 'The Boulevard Montmartre on a Winter Morning',
    artist: 'Camille Pissarro',
    yearLabel: '1897',
    medium: 'Oil on canvas',
    dimensionsLabel: '64.8 × 81.3 cm',
    image: {
      src: '/artworks/pissarro-boulevard-montmartre.jpg',
      width: 2400,
      height: 1938,
      alt: 'Elevated view down a wintry Paris boulevard lined by grey buildings, bare trees, pedestrians, horse-drawn carriages, and red omnibuses beneath a pale overcast sky.',
    },
    rights: rightsByArtwork['pissarro-boulevard-montmartre'],
    discovery: {
      moods: ['cool', 'rain-washed', 'distant', 'restless', 'wintry'],
      themes: ['urban modernity', 'anonymity', 'movement', 'weather'],
      palette: ['blue-grey', 'slate', 'charcoal', 'muted cream', 'ochre'],
      subjects: ['boulevard', 'Paris', 'pedestrians', 'carriages', 'bare trees'],
    },
    observed: [
      {
        id: 'pissarro-observed-1',
        text: 'The viewpoint is elevated above a broad boulevard that narrows into the distance.',
      },
      {
        id: 'pissarro-observed-2',
        text: 'Bare trees, pedestrians, horse-drawn traffic, and red omnibuses animate the grey street.',
      },
      {
        id: 'pissarro-observed-3',
        text: 'Rows of multi-storey buildings frame both sides beneath a pale overcast sky.',
      },
    ],
    known: [
      {
        id: 'pissarro-known-1',
        text: 'Camille Pissarro painted this work in 1897 in oil on canvas.',
        sourceIds: [sources.metPissarro.id],
      },
      {
        id: 'pissarro-known-2',
        text: 'The Metropolitan Museum of Art identifies the work as Public Domain.',
        sourceIds: [sources.metPissarro.id, sources.metOpenAccess.id],
      },
    ],
    interpreted: [],
    regions: [
      {
        id: 'pissarro-boulevard-flow',
        label: 'The boulevard’s flow',
        description:
          'Traffic and pedestrians converge along the broad avenue toward a misty vanishing point.',
        bounds: { x: 0.23, y: 0.31, width: 0.52, height: 0.67 },
      },
      {
        id: 'pissarro-left-tree',
        label: 'The near winter tree',
        description:
          'A dark, leafless tree rises from the near-left pavement and interrupts the pale façades.',
        bounds: { x: 0.02, y: 0.22, width: 0.28, height: 0.74 },
      },
      {
        id: 'pissarro-right-facades',
        label: 'The right-hand façades',
        description:
          'A long wall of slate roofs, chimneys, balconies, and shopfronts presses toward the street.',
        bounds: { x: 0.55, y: 0.05, width: 0.43, height: 0.86 },
      },
    ],
  },
  {
    id: 'vermeer-woman-with-water-pitcher',
    title: 'Young Woman with a Water Pitcher',
    artist: 'Johannes Vermeer',
    yearLabel: 'ca. 1662',
    medium: 'Oil on canvas',
    dimensionsLabel: '45.7 × 40.6 cm',
    image: {
      src: '/artworks/vermeer-woman-with-water-pitcher.jpg',
      width: 2134,
      height: 2400,
      alt: 'A woman in a white linen headdress and deep blue skirt stands alone in a quiet room, one hand opening a leaded window at the left and the other resting on a silver pitcher set in a basin on a carpet-covered table.',
    },
    rights: rightsByArtwork['vermeer-woman-with-water-pitcher'],
    discovery: {
      moods: ['still', 'solitary', 'hushed', 'contemplative', 'tender'],
      themes: ['solitude', 'domestic ritual', 'morning light', 'interiority'],
      palette: [
        'lapis blue',
        'cool white',
        'pale grey wall',
        'deep red carpet',
        'muted gold',
      ],
      subjects: [
        'single woman',
        'leaded window',
        'silver pitcher and basin',
        'wall map',
        'table carpet',
      ],
    },
    observed: [
      {
        id: 'vermeer-observed-1',
        text: 'One woman stands alone in the room; no other figure is present.',
      },
      {
        id: 'vermeer-observed-2',
        text: 'Her left hand pushes open a leaded casement window at the far left while her right hand rests on the handle of a metal pitcher.',
      },
      {
        id: 'vermeer-observed-3',
        text: 'A white linen headdress and collar sit above a dark yellow bodice and a deep blue skirt.',
      },
      {
        id: 'vermeer-observed-4',
        text: 'A patterned red and blue carpet covers the table that holds the pitcher, a shallow basin, and a small casket.',
      },
      {
        id: 'vermeer-observed-5',
        text: 'A rolled map hangs on the pale wall in the upper right; the rest of the wall is almost empty.',
      },
    ],
    known: [
      {
        id: 'vermeer-known-1',
        text: 'Johannes Vermeer painted this work in oil on canvas around 1662.',
        sourceIds: [sources.metVermeer.id],
      },
      {
        id: 'vermeer-known-2',
        text: 'The Metropolitan Museum of Art identifies the work as Public Domain.',
        sourceIds: [sources.metVermeer.id, sources.metOpenAccess.id],
      },
    ],
    interpreted: [],
    regions: [
      {
        id: 'vermeer-window-hand',
        label: 'Her hand at the window',
        description:
          'The woman’s outstretched left hand meets the leaded casement, where daylight enters the room.',
        bounds: { x: 0.01, y: 0.07, width: 0.32, height: 0.58 },
      },
      {
        id: 'vermeer-pitcher-and-basin',
        label: 'The pitcher and basin',
        description:
          'A metal pitcher stands in a shallow basin on the carpeted table, held lightly by her right hand.',
        bounds: { x: 0.38, y: 0.6, width: 0.46, height: 0.28 },
      },
      {
        id: 'vermeer-wall-map',
        label: 'The map on the wall',
        description:
          'A rolled map hangs high on the right-hand wall, the only marking on an otherwise bare surface.',
        bounds: { x: 0.62, y: 0.02, width: 0.36, height: 0.34 },
      },
    ],
  },
  {
    id: 'gifford-kauterskill-clove',
    title: 'A Gorge in the Mountains (Kauterskill Clove)',
    artist: 'Sanford Robinson Gifford',
    yearLabel: '1862',
    medium: 'Oil on canvas',
    dimensionsLabel: '121.9 × 101.3 cm',
    image: {
      src: '/artworks/gifford-kauterskill-clove.jpg',
      width: 2002,
      height: 2400,
      alt: 'A deep wooded gorge seen from a rocky ledge, filled with warm golden haze; a bare leaning tree rises at the left and a pale sun glows above distant blue ridges.',
    },
    rights: rightsByArtwork['gifford-kauterskill-clove'],
    discovery: {
      moods: ['warm', 'golden', 'hazy', 'expansive', 'reverent'],
      themes: ['light', 'wilderness', 'distance', 'the sublime', 'autumn'],
      palette: ['amber', 'honey gold', 'russet', 'dusty rose', 'soft blue'],
      subjects: [
        'mountain gorge',
        'leaning tree',
        'rocky ledge',
        'hazy sun',
        'distant ridges',
      ],
    },
    observed: [
      {
        id: 'gifford-observed-1',
        text: 'A pale sun burns through golden haze in the upper centre, dissolving the horizon.',
      },
      {
        id: 'gifford-observed-2',
        text: 'A bare, gold-lit tree leans out from the rocky ledge in the left foreground.',
      },
      {
        id: 'gifford-observed-3',
        text: 'Wooded slopes fall away on both sides toward a small bright pool of water far below.',
      },
      {
        id: 'gifford-observed-4',
        text: 'Layered blue-grey ridges recede along the upper third of the canvas.',
      },
    ],
    known: [
      {
        id: 'gifford-known-1',
        text: 'Sanford Robinson Gifford painted this work in 1862 in oil on canvas.',
        sourceIds: [sources.metGifford.id],
      },
      {
        id: 'gifford-known-2',
        text: 'The Metropolitan Museum of Art identifies the work as Public Domain.',
        sourceIds: [sources.metGifford.id, sources.metOpenAccess.id],
      },
    ],
    interpreted: [],
    regions: [
      {
        id: 'gifford-veiled-sun',
        label: 'The veiled sun',
        description:
          'A soft disc of light sits in golden haze above the faint blue ridges of the far distance.',
        bounds: { x: 0.22, y: 0.04, width: 0.56, height: 0.38 },
      },
      {
        id: 'gifford-leaning-tree',
        label: 'The leaning tree',
        description:
          'A slender bare tree arcs out from the left cliff, its branches catching the low light.',
        bounds: { x: 0.0, y: 0.15, width: 0.36, height: 0.62 },
      },
      {
        id: 'gifford-gorge-floor',
        label: 'The gorge below',
        description:
          'Wooded slopes descend on both sides toward a small pale pool on the floor of the ravine.',
        bounds: { x: 0.2, y: 0.42, width: 0.72, height: 0.45 },
      },
    ],
  },
  {
    id: 'vangogh-wheat-field-cypresses',
    title: 'Wheat Field with Cypresses',
    artist: 'Vincent van Gogh',
    yearLabel: '1889',
    medium: 'Oil on canvas',
    dimensionsLabel: '73.2 × 93.4 cm',
    image: {
      src: '/artworks/vangogh-wheat-field-cypresses.jpg',
      width: 2400,
      height: 1910,
      alt: 'A wind-driven field of ochre wheat below a churning sky of white and blue brushstrokes, with a tall dark cypress rising at the right and blue mountains along the horizon.',
    },
    rights: rightsByArtwork['vangogh-wheat-field-cypresses'],
    discovery: {
      moods: ['electric', 'turbulent', 'exhilarated', 'restless', 'sunstruck'],
      themes: ['weather', 'energy', 'growth', 'the living landscape'],
      palette: [
        'ochre',
        'wheat gold',
        'deep bottle green',
        'cobalt blue',
        'chalk white',
      ],
      subjects: [
        'cypress tree',
        'wheat field',
        'rolling clouds',
        'olive shrubs',
        'blue mountains',
      ],
    },
    observed: [
      {
        id: 'vangogh-observed-1',
        text: 'Thick curling brushstrokes turn the upper half of the canvas into rolling white and blue cloud.',
      },
      {
        id: 'vangogh-observed-2',
        text: 'A single dark green cypress rises like a flame along the right edge and breaks the skyline.',
      },
      {
        id: 'vangogh-observed-3',
        text: 'The lower third is a field of ochre and gold wheat combed sideways as if by wind.',
      },
      {
        id: 'vangogh-observed-4',
        text: 'A ridge of blue mountains and a cluster of pale green shrubs separate the field from the sky.',
      },
      {
        id: 'vangogh-observed-5',
        text: 'Small red and pink marks are scattered through the grass at the bottom edge.',
      },
    ],
    known: [
      {
        id: 'vangogh-known-1',
        text: 'Vincent van Gogh painted this work in 1889 in oil on canvas.',
        sourceIds: [sources.metVanGogh.id],
      },
      {
        id: 'vangogh-known-2',
        text: 'The Metropolitan Museum of Art identifies the work as Public Domain.',
        sourceIds: [sources.metVanGogh.id, sources.metOpenAccess.id],
      },
    ],
    interpreted: [],
    regions: [
      {
        id: 'vangogh-cypress',
        label: 'The cypress',
        description:
          'A tall dark green cypress climbs the right side of the canvas and pushes past the cloud line.',
        bounds: { x: 0.68, y: 0.02, width: 0.28, height: 0.7 },
      },
      {
        id: 'vangogh-wheat-field',
        label: 'The moving wheat',
        description:
          'Ochre and gold strokes sweep sideways across the lower third, flattening the field toward the viewer.',
        bounds: { x: 0.03, y: 0.65, width: 0.94, height: 0.33 },
      },
      {
        id: 'vangogh-rolling-sky',
        label: 'The rolling sky',
        description:
          'Curling white and blue clouds fill the upper left and turn the sky into visible motion.',
        bounds: { x: 0.03, y: 0.03, width: 0.7, height: 0.5 },
      },
    ],
  },
  {
    id: 'hokusai-great-wave',
    title: 'Under the Wave off Kanagawa (The Great Wave)',
    artist: 'Katsushika Hokusai',
    yearLabel: 'ca. 1830–32',
    medium: 'Woodblock print; ink and color on paper',
    dimensionsLabel: '25.7 × 37.9 cm',
    image: {
      src: '/artworks/hokusai-great-wave.jpg',
      width: 2400,
      height: 1613,
      alt: 'A towering blue wave with clawed white foam curls over three long boats of crouching oarsmen, while the small snow-capped cone of Mount Fuji sits low at the centre of the horizon.',
    },
    rights: rightsByArtwork['hokusai-great-wave'],
    discovery: {
      moods: ['dramatic', 'graphic', 'precarious', 'exhilarating', 'cold'],
      themes: ['the sea', 'scale', 'endurance', 'nature and people'],
      palette: [
        'Prussian blue',
        'pale indigo',
        'foam white',
        'buff paper',
        'soft grey',
      ],
      subjects: [
        'breaking wave',
        'Mount Fuji',
        'fishing boats',
        'oarsmen',
        'sea spray',
      ],
    },
    observed: [
      {
        id: 'hokusai-observed-1',
        text: 'A single enormous wave fills the left of the sheet and curls over with fingers of white foam.',
      },
      {
        id: 'hokusai-observed-2',
        text: 'Three long narrow boats ride the troughs, each packed with rowers bent low over their oars.',
      },
      {
        id: 'hokusai-observed-3',
        text: 'Mount Fuji appears small and snow-capped near the centre of the horizon, far below the wave crest.',
      },
      {
        id: 'hokusai-observed-4',
        text: 'A rectangular title cartouche and a signature line sit in the upper-left corner.',
      },
      {
        id: 'hokusai-observed-5',
        text: 'The sky is printed in flat grey and buff without clouds.',
      },
    ],
    known: [
      {
        id: 'hokusai-known-1',
        text: 'Katsushika Hokusai made this woodblock print in ink and colour on paper about 1830 to 1832, from the series Thirty-six Views of Mount Fuji.',
        sourceIds: [sources.metHokusai.id],
      },
      {
        id: 'hokusai-known-2',
        text: 'The Metropolitan Museum of Art identifies the work as Public Domain.',
        sourceIds: [sources.metHokusai.id, sources.metOpenAccess.id],
      },
    ],
    interpreted: [],
    regions: [
      {
        id: 'hokusai-breaking-wave',
        label: 'The breaking wave',
        description:
          'The great crest rises from the left edge and reaches across the upper half in clawed white foam.',
        bounds: { x: 0.0, y: 0.02, width: 0.56, height: 0.74 },
      },
      {
        id: 'hokusai-mount-fuji',
        label: 'Mount Fuji',
        description:
          'The snow-capped cone sits small and still at the centre of the horizon, dwarfed by the water.',
        bounds: { x: 0.54, y: 0.58, width: 0.18, height: 0.2 },
      },
      {
        id: 'hokusai-oarsmen',
        label: 'The oarsmen',
        description:
          'Rowers crouch in long boats between the swells, their backs following the curve of the sea.',
        bounds: { x: 0.05, y: 0.52, width: 0.72, height: 0.45 },
      },
    ],
  },
  {
    id: 'degas-dance-class',
    title: 'The Dance Class',
    artist: 'Edgar Degas',
    yearLabel: '1874',
    medium: 'Oil on canvas',
    dimensionsLabel: '83.5 × 77.2 cm',
    image: {
      src: '/artworks/degas-dance-class.jpg',
      width: 2226,
      height: 2400,
      alt: 'Crowded ballet rehearsal room with dancers in white tutus gathering, resting, or practicing around the ballet master at far right; a large mirror and music stand frame the scene.',
    },
    rights: rightsByArtwork['degas-dance-class'],
    discovery: {
      moods: ['warm', 'intimate', 'observant', 'disciplined', 'nervous'],
      themes: ['rehearsal', 'waiting', 'evaluation', 'social choreography'],
      palette: ['warm ochre', 'cream', 'dusty rose', 'muted green', 'white'],
      subjects: ['ballet dancers', 'ballet master', 'mirror', 'music stand'],
    },
    observed: [
      {
        id: 'degas-observed-1',
        text: 'A rehearsal room is crowded with dancers in white tutus who practice, rest, and wait.',
      },
      {
        id: 'degas-observed-2',
        text: 'A dancer with a blue sash dominates the foreground beside a dark music stand.',
      },
      {
        id: 'degas-observed-3',
        text: 'An older man holding a staff stands at the far right while groups of dancers gather behind him.',
      },
    ],
    known: [
      {
        id: 'degas-known-1',
        text: 'Edgar Degas painted this work in 1874 in oil on canvas.',
        sourceIds: [sources.metDegas.id],
      },
      {
        id: 'degas-known-2',
        text: 'The Metropolitan Museum of Art identifies the work as Public Domain.',
        sourceIds: [sources.metDegas.id, sources.metOpenAccess.id],
      },
    ],
    interpreted: [],
    regions: [
      {
        id: 'degas-foreground-dancer',
        label: 'The foreground dancer',
        description:
          'A dancer with a blue sash and expansive white tutu stands near the music stand, her body cutting diagonally into the room.',
        bounds: { x: 0.18, y: 0.43, width: 0.46, height: 0.55 },
      },
      {
        id: 'degas-waiting-group',
        label: 'The waiting dancers and ballet master',
        description:
          'Dancers cluster, stretch, and wait around the older ballet master at the far right.',
        bounds: { x: 0.57, y: 0.18, width: 0.42, height: 0.62 },
      },
      {
        id: 'degas-mirror',
        label: 'The central mirror',
        description:
          'A tall dark-framed mirror reflects pale figures and a bright window, deepening the crowded room.',
        bounds: { x: 0.33, y: 0.09, width: 0.24, height: 0.39 },
      },
    ],
  },
] as const satisfies readonly Artwork[];
