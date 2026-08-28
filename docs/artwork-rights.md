# Artwork Rights Ledger

The AIccessibility collection uses only works that The Metropolitan Museum of Art marks **Public Domain**. The Met’s Open Access policy states that images of public-domain works it makes available may be used without permission or fee, including commercially.

- [The Met Image Resources and Open Access policy](https://www.metmuseum.org/policies/image-resources)

Every record below was confirmed against the Met Collection API object record, which reports `"isPublicDomain": true` for each object id listed here. The application serves optimized local copies for repeatable judging. Original-image and machine-readable metadata URLs are retained below and in the typed collection records.

The gallery presents the six works in the order shown here.

## 1. Camille Pissarro — *The Boulevard Montmartre on a Winter Morning* (1897)

- Provider: The Metropolitan Museum of Art
- Object ID: `437310`
- Accession number: `60.174`
- Medium: Oil on canvas
- Dimensions: 64.8 × 81.3 cm
- Rights status: Public Domain
- [Canonical object page](https://www.metmuseum.org/art/collection/search/437310)
- [Machine-readable object metadata](https://collectionapi.metmuseum.org/public/collection/v1/objects/437310)
- [Original image](https://images.metmuseum.org/CRDImages/ep/original/DP-21959-001.jpg)
- Local optimized asset: `public/artworks/pissarro-boulevard-montmartre.jpg` (`2400 × 1938`)

## 2. Johannes Vermeer — *Young Woman with a Water Pitcher* (ca. 1662)

- Provider: The Metropolitan Museum of Art
- Object ID: `437881`
- Accession number: `89.15.21`
- Medium: Oil on canvas
- Dimensions: 45.7 × 40.6 cm
- Rights status: Public Domain
- [Canonical object page](https://www.metmuseum.org/art/collection/search/437881)
- [Machine-readable object metadata](https://collectionapi.metmuseum.org/public/collection/v1/objects/437881)
- [Original image](https://images.metmuseum.org/CRDImages/ep/original/DP353257.jpg)
- Local optimized asset: `public/artworks/vermeer-woman-with-water-pitcher.jpg` (`2134 × 2400`)

## 3. Sanford Robinson Gifford — *A Gorge in the Mountains (Kauterskill Clove)* (1862)

- Provider: The Metropolitan Museum of Art
- Object ID: `10946`
- Accession number: `15.30.62`
- Medium: Oil on canvas
- Dimensions: 121.9 × 101.3 cm
- Rights status: Public Domain
- [Canonical object page](https://www.metmuseum.org/art/collection/search/10946)
- [Machine-readable object metadata](https://collectionapi.metmuseum.org/public/collection/v1/objects/10946)
- [Original image](https://images.metmuseum.org/CRDImages/ad/original/DT81.jpg)
- Local optimized asset: `public/artworks/gifford-kauterskill-clove.jpg` (`2002 × 2400`)

## 4. Vincent van Gogh — *Wheat Field with Cypresses* (1889)

- Provider: The Metropolitan Museum of Art
- Object ID: `436535`
- Accession number: `1993.132`
- Medium: Oil on canvas
- Dimensions: 73.2 × 93.4 cm
- Rights status: Public Domain
- [Canonical object page](https://www.metmuseum.org/art/collection/search/436535)
- [Machine-readable object metadata](https://collectionapi.metmuseum.org/public/collection/v1/objects/436535)
- [Original image](https://images.metmuseum.org/CRDImages/ep/original/DP-42549-001.jpg)
- Local optimized asset: `public/artworks/vangogh-wheat-field-cypresses.jpg` (`2400 × 1910`)

## 5. Katsushika Hokusai — *Under the Wave off Kanagawa (The Great Wave)* (ca. 1830–32)

- Provider: The Metropolitan Museum of Art
- Object ID: `45434`
- Accession number: `JP1847`
- Medium: Woodblock print; ink and color on paper
- Dimensions: 25.7 × 37.9 cm
- Series: *Thirty-six Views of Mount Fuji (Fugaku sanjūrokkei)*
- Rights status: Public Domain
- [Canonical object page](https://www.metmuseum.org/art/collection/search/45434)
- [Machine-readable object metadata](https://collectionapi.metmuseum.org/public/collection/v1/objects/45434)
- [Original image](https://images.metmuseum.org/CRDImages/as/original/DP130155.jpg)
- Local optimized asset: `public/artworks/hokusai-great-wave.jpg` (`2400 × 1613`)

## 6. Edgar Degas — *The Dance Class* (1874)

- Provider: The Metropolitan Museum of Art
- Object ID: `438817`
- Accession number: `1987.47.1`
- Medium: Oil on canvas
- Dimensions: 83.5 × 77.2 cm
- Rights status: Public Domain
- [Canonical object page](https://www.metmuseum.org/art/collection/search/438817)
- [Machine-readable object metadata](https://collectionapi.metmuseum.org/public/collection/v1/objects/438817)
- [Original image](https://images.metmuseum.org/CRDImages/ep/original/DP-20101-001.jpg)
- Local optimized asset: `public/artworks/degas-dance-class.jpg` (`2226 × 2400`)

## Non-Artwork Assets

### Renaissance picture frame

- File: `public/frames/renaissance-frame.png` (`1122 × 1402`, RGBA with a fully transparent rectangular opening)
- Origin: generated for this project with an image-generation model; no third-party photograph or scan was used.
- Use: rendered as a CSS nine-slice `border-image` around the artwork. The opening is never filled, so no artwork pixel is covered, cropped, or distorted at any aspect ratio.
- Measured geometry, used directly by `src/app.css`: opening inset `170 / 161 / 168 / 189` (left / top / right / bottom) in source pixels.

No web fonts, icon libraries, photographs, or other third-party media are bundled. The settings icon is inline SVG authored in this repository.

## Content Provenance Notes

- The `observed` statements and region descriptions were checked against the local images during implementation. Region bounds are normalized to the local optimized asset, including the thin photographic canvas edge present in some Met originals; no image was cropped or retouched.
- The `known` statements are intentionally limited to object metadata and public-domain status backed by the links above.
- No curator fact, exhibition history, provenance chain, or artist intention is asserted beyond what the linked Met object record supports.
- No generated poem, story, or model interpretation is stored as museum fact.
- New works must be added to this ledger and pass `tests/collection.test.ts` before entering the build.
