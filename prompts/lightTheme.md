Keep the existing background image in light mode.

The background image is intentional and necessary because its variation
provides the visual information that makes the glassmorphism/backdrop-blur
effects visible.

Do NOT replace the image with a flat background.

Instead, redesign how the background image is rendered in light mode.

GOAL:
The background should behave like subtle pearlescent/ribbed glass material
behind the interface rather than visually competing with the content.

Create the background as its own layer so filters applied to it do not affect
the UI.

LIGHT MODE BACKGROUND:
- Keep the existing image.
- Reduce its saturation to approximately 50–65%.
- Reduce its contrast to approximately 65–80%.
- Slightly increase brightness.
- Place a translucent warm-neutral/ivory wash over it.
- Target overlay: approximately rgba(248, 245, 241, 0.55–0.70).
- Preserve enough variation in the underlying image that backdrop-filter
  remains clearly visible through glass controls.
- The vertical structures should remain perceptible but subtle.

The result should resemble light passing through frosted or ribbed
architectural glass.

GLASS COMPONENTS:
Use genuinely translucent surfaces rather than nearly opaque white.

Starting point:
background: rgba(255,255,255,0.30–0.45)
backdrop-filter: blur(16px–22px) saturate(120–140%)
border: 1px solid rgba(255,255,255,0.45–0.60)

Add a very subtle shadow and an inset white top highlight to communicate
glass thickness.

The background pattern should visibly blur/refract underneath buttons,
inputs, dropdowns, and major glass panels.

COLOR HIERARCHY:

Background:
pearl / champagne / warm-neutral / desaturated

Glass:
translucent neutral white

Body typography:
dark charcoal

Controls:
muted burgundy

Flame typography:
highly saturated ember → orange → gold

This separation is important.

Do NOT tint the entire light interface orange or peach just because the
branding uses flame colors.

The flame typography should be the most saturated warm-colored element
on the screen.

For light-mode flame text use:
#721500
#A82302
#D83B02
#F45D04
#FF820B
#FFAC24

Keep the flame texture organic and flowing, but bias it toward darker ember
and saturated orange so it maintains contrast against the pale environment.

Overall visual concept:

PEARLESCENT RIBBED BACKGROUND
            ↓
TRANSLUCENT FROSTED GLASS UI
            ↓
DARK NEUTRAL CONTENT
            ↓
INCANDESCENT FLAME BRANDING

The background image should support the glass effect without becoming the
focal point.