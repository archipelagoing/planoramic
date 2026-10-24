Implement a reusable "flame text" effect for the application's display typography.

The goal is NOT to make the letters look like they are literally on fire. Instead, the fill of each letter should reproduce the COLOR AND LIGHT STRUCTURE of a real orange flame: flowing, luminous, irregular, and incandescent.

REFERENCE PALETTE:
- Charred shadow: #160603
- Deep ember: #6E1605
- Burnt orange: #B63308
- Flame orange: #ED6B0A
- Golden orange: #FF9D18
- Hot gold: #FFC044
- Incandescent yellow: #FFE08A
- Warm cream highlight: #FFF0B5

VISUAL DIRECTION:

Do not use a simple linear top-to-bottom gradient.

Instead, create an organic, flowing flame texture INSIDE the glyphs.

The dominant colors should be:
- flame orange
- golden orange
- amber

Use deep ember/burnt orange for shadowed folds and small amounts of pale yellow/cream for extremely hot highlights.

The cream color should occupy only approximately 5–10% of the visible texture.

The color structure should resemble flowing flame folds:

deep ember
   ↓
orange
   ↘
gold
     ↘
cream highlight
     ↗
gold
   ↗
orange
   ↓
ember

These regions should curve, stretch, and flow vertically rather than forming straight gradient bands.

TEXTURE:

Create large, smooth, vertically flowing S-shaped structures.

Think of slow-moving liquid, silk, smoke, or marbling rather than noise.

The texture should contain:
- broad orange fields
- darker red-orange folds
- glowing golden channels
- occasional thin incandescent cream ribbons
- smooth transitions between colors

Avoid:
- rainbow gradients
- uniform gradients
- tiny noisy marble veins
- obvious repeating patterns
- hard color boundaries
- excessive yellow
- an orange glow around the entire glyph
- cartoon flames
- flame icons
- animated fire particles

LIGHTING:

The brightest cream/yellow regions should appear INSIDE the orange areas, like light shining through folds in the flame.

Optionally add a very subtle bloom immediately around the hottest internal regions.

Do NOT add a generic outer glow around the entire text.

IMPLEMENTATION:

Build this as a reusable component/effect so any heading or word can use it.

Prefer a procedural solution rather than a static background image.

Depending on the existing stack, use the most appropriate technique:
- SVG filters / turbulence / displacement
- CSS masks + layered gradients
- Canvas
- WebGL/shader

Use the text glyphs themselves as a mask so the generated flame texture is visible only inside the letters.

If SVG is appropriate, experiment with low-frequency turbulence and displacement to distort several layered gradients into broad flowing structures.

The effect must remain crisp at the edges of the letters.

Make the implementation responsive and work at different font sizes.

If animation is added, it should be extremely slow and subtle. The internal color fields can drift upward or deform slightly, but the text should still feel like typography rather than an animated fire effect.

Create parameters for:
- intensity
- turbulence/distortion
- animation speed
- highlight amount
- texture scale

DEFAULT LOOK:

The default should resemble a macro photograph of an orange flame captured inside typography: dark burnt-orange folds surrounding luminous orange and gold, with rare near-white-hot yellow ribbons.

The final result should feel elegant, organic, expensive, and slightly hypnotic rather than flashy or gimmicky.


IMPORTANT: Treat the entire text string as one continuous mask.

Generate one large flame field behind the complete word and reveal that field
through the glyphs. Do not generate an independent gradient or texture for
each character.

For example, a bright flame ribbon should be able to enter through one letter,
disappear in the space between glyphs, and continue through the next letter.
This makes the typography feel like one physical material rather than
individually colored characters.


-------------------

v2. Refine the typography by introducing italics as a deliberate secondary
typographic voice.

Do NOT apply italics decoratively or randomly.

Use the following semantic typography system:

ROMAN / UPRIGHT:
- Main page title
- Date headings
- Event times
- Event titles
- Primary UI/navigation labels

ITALIC:
- PLANORAMIC wordmark
- Page subtitle ("Next seven days · 29 calendars")
- Event metadata / calendar source / location
  ("Fall 26 · Kidde 226", "AstroSeek", "Family")

Keep "Updated 2:54 PM" upright but muted so it behaves like system/status
information rather than editorial copy.

The conceptual rule is:

ROMAN = primary information / what / when
ITALIC = identity / context / secondary description

Do not italicize event times. They will receive the flame-text treatment and
should remain structurally stable and highly scannable.

Do not italicize date headings or event titles.

Use the true italic face of the selected font whenever available rather than
synthetically skewing the regular font.

For italic secondary text, consider slightly lighter weight and subtly
increased letter spacing if appropriate for the selected font.

The result should have a restrained editorial quality, similar to sophisticated
print typography translated into a glass interface, rather than looking
ornamental or handwritten.