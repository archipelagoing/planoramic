# Flame Text

The browser app and `/connect` share `backend/public/flame-text.js`. The renderer
builds smooth, domain-warped orange/gold fields and narrow hot ribbons, then masks
them with text at device-pixel resolution. It does not load a photograph or use
an outer glow. Dark mode uses a restrained ember/amber palette without outlines or shadows. Real DOM
text supplies layout, selection and accessible names. `FlameIcon` uses the same
renderer with the existing Material Community icon font.

```tsx
<FlameText
  intensity={0.85}
  distortion={0.8}
  animationSpeed={0}
  highlightAmount={0.075}
  textureScale={1}
  style={{fontSize: 48}}>
  Planoramic
</FlameText>
```

- `intensity`: tonal contrast, 0 to 1.5. Lower values keep the fill more uniform.
- `distortion`: bend strength, 0 to 2.
- `animationSpeed`: 0 for still; 0.25 to 1 for slow motion, capped at 2.
- `highlightAmount`: ribbon width, 0 to 0.2; 0 removes cream ribbons.
- `textureScale`: fold size relative to font size, 0.25 to 4.
- `neutralInDark`: keep secondary text neutral in dark mode (dates and times).

Dark mode reserves the effect for branding, page headings, and active icons.
Pass `active` to `FlameIcon` for selected controls or navigation items.

Highlight coverage varies with the text and chosen font; the parameter is not a
guaranteed percentage of visible glyph pixels. Motion pauses in hidden tabs and
is disabled when reduced motion is requested. Default rendering is static.

For plain browser DOM, use `attachFlameText(element, options)` and call its returned
cleanup function before changing fonts, text, or removing the element. Wrapping
and resizing are observed automatically. Pass `{dark: true}` for the dark-mode palette.
Use plain-text headings with zero letter
spacing, not mixed-font rich text. Native TV currently retains plain typography.
