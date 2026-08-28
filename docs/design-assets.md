# Design Assets

## Renaissance frame

- Project path: `public/frames/renaissance-frame.png`
- Dimensions: `1122 × 1402`
- Format: RGBA PNG with a transparent exterior and center opening
- Generation mode: built-in ImageGen tool
- Use: responsive CSS nine-slice `border-image` around every painting
- Reference roles:
  - Reference image 1 supplied the classical ornament, theatrical gallery atmosphere, and aged material language.
  - Reference image 2 supplied the radical simplicity, flowing borderless components, and restraint.

### Final generation prompt

```text
Use case: stylized-concept
Asset type: transparent website artwork-frame overlay, portrait orientation
Input image: the most recent generated landscape frame is the exact material, ornament, patina, front-on geometry, and restraint reference. Generate a matching portrait companion, not an edit or crop.
Primary request: one isolated rectangular Renaissance-era painting frame viewed perfectly straight-on, portrait 4:5 outer proportion, suitable for overlaying around a digital painting in the same refined web gallery.
Subject: matching carved walnut and restrained antique-gold leaf, shallow sculptural relief, subtle acanthus and egg-and-dart motifs, slightly worn museum patina, elegant and historically plausible, not baroque or gaudy.
Composition/framing: full frame entirely visible, centered, symmetrical, thin-to-medium moulding, very large empty center opening, precise front elevation, no perspective distortion, generous transparent margin outside.
Lighting/mood: soft museum lighting revealing real wood grain and aged gilt; quiet, cinematic, expensive.
Constraints: genuinely transparent background AND genuinely transparent empty center opening; clean alpha edges; no wall, no shadow backdrop, no painting, no people, no columns, no museum room, no UI, no text, no logos, no watermark. The frame itself must be the only visible object.
```

### Quality-control note

An initial landscape generation and one extraction attempt baked a visible checkerboard into RGB rather than producing alpha. Those invalid workspace copies were removed. The retained portrait asset has a verified alpha channel and is intentionally reused with CSS nine-slice geometry for both landscape and portrait works, avoiding separate distorted frame bitmaps.

## Painting assets

The six paintings are not AI-generated. They are optimized local reproductions of Met Open Access public-domain works. Their source, rights, and original-image records are documented in `docs/artwork-rights.md`.
