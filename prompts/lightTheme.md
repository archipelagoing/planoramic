Refine the existing Planoramic LIGHT MODE.

Do not redesign the application's layout or structure.

Keep:
- the existing background image
- the glassmorphism concept
- the existing navigation/layout
- the flame-text feature
- the current functionality

The goal is to make light mode feel sophisticated, restrained, architectural,
and premium.

Conceptually:

DARK MODE = firelight through smoked architectural glass
LIGHT MODE = daylight through pearlescent architectural glass

They should clearly belong to the same design system.


==================================================
1. KEEP THE EXISTING BACKGROUND IMAGE
==================================================

The background image is intentional and necessary.

Its vertical/ribbed variation provides the visual information that makes
glassmorphism and backdrop blur visible.

DO NOT:
- remove the background image
- replace it with a flat color
- replace it with a generic gradient
- blur it so heavily that its structure disappears

Instead, create the background as its own visual layer so filters applied
to it do not affect the UI.


==================================================
2. LIGHT-MODE BACKGROUND TREATMENT
==================================================

Transform the existing image so it resembles daylight passing through
pearlescent or ribbed architectural glass.

Starting targets:

saturation: 50–65%
contrast: 65–80%
brightness: 105–112%

Place a translucent warm-neutral ivory wash above the image:

rgba(248, 245, 241, 0.55–0.68)

IMPORTANT:

Do not make the resulting background peach, orange, yellow, or beige.

The dominant perception should be:

PEARL
IVORY
SOFT STONE
CHAMPAGNE
SUBTLE WARM GRAY

The warm colors already present in the photograph should only appear as
faint undertones.

Preserve enough vertical tonal variation for glass surfaces to visibly
distort and blur the image beneath them.

The image should be perceptible without becoming the focal point.


==================================================
3. GLASS SHOULD LOOK LIKE FROSTED OPTICAL GLASS
==================================================

Do not use opaque or nearly opaque white cards.

Use genuinely translucent surfaces.

Starting point:

background: rgba(255,255,255,0.28–0.42);

backdrop-filter:
    blur(18px–24px)
    saturate(115–130%);

border:
    1px solid rgba(255,255,255,0.45–0.60);

box-shadow:
    0 10px 30px rgba(45,35,30,0.05),
    inset 0 1px 0 rgba(255,255,255,0.70);

The underlying ribbed image should remain subtly visible through the glass.

The cards should feel like pieces of frosted optical glass floating slightly
above another glass surface.

Avoid:
- white plastic
- beige cards
- peach cards
- heavy borders
- obvious gray outlines


==================================================
4. MAKE BORDERS ALMOST DISAPPEAR
==================================================

Do not define every component with a visible rounded rectangle.

Use transparency, blur, spacing, and elevation to establish hierarchy.

Borders should generally be subtle enough that they are noticed only on
closer inspection.

Avoid excessive outlined UI.


==================================================
5. NEUTRAL TYPOGRAPHY
==================================================

Most text should NOT be warm-colored.

Primary text:
#292522

Secondary text:
#68615C

Muted text:
#8B837D

Very subtle text:
#A49D97

Use dark charcoal rather than pure black.

The majority of the screen should consist of neutral typography.


==================================================
6. FLAME COLOR IS PRECIOUS
==================================================

Orange should occupy only a small percentage of the interface.

Do NOT make all of these orange:
- dates
- times
- icons
- borders
- buttons
- navigation labels
- metadata

Reserve flame coloration primarily for:
- PLANORAMIC branding
- major display typography when flame text is enabled
- very small selected-state details where appropriate

The flame effect should feel like jewelry against an otherwise restrained
interface.


==================================================
7. LIGHT-MODE FLAME PALETTE
==================================================

Do not reuse the exact dark-mode flame palette.

Light mode requires a darker, more saturated flame treatment to maintain
contrast against the pale environment.

Use approximately:

deep ember      #721500
burnt ember     #A82302
vermilion       #D83B02
flame orange    #F45D04
hot orange      #FF820B
amber highlight #FFAC24

Bright yellow/cream should be extremely rare or absent in light mode.

Keep the existing organic flowing flame texture.

The effect should resemble glowing ember/orange material inside the
letterforms rather than a simple gradient.

NO:
- orange text outlines
- black text outlines
- outer glow
- embossed effects
- cartoon flame shapes

Flame coloration should exist INSIDE the glyphs.


==================================================
8. NAVIGATION
==================================================

Make the light-mode sidebar quiet and architectural.

Inactive items:
- charcoal/gray icon
- charcoal/gray label
- no orange

Active item:
- subtle frosted-glass background
- slightly darker text
- optional tiny ember accent

Do not make every navigation icon orange.

Selected states should be communicated primarily through contrast and
surface treatment rather than saturated color.


==================================================
9. EVENT CARDS
==================================================

Event cards should be translucent frosted glass, NOT white cards.

Use slightly restrained corner radii:
approximately 16–20px.

Typography hierarchy:

TIME
dark charcoal or restrained ember accent

EVENT TITLE
dark charcoal
highest contrast within the card

METADATA
muted gray

Do not make the entire time column orange.

Date headings should generally be charcoal, not orange.

Let spacing and typography create hierarchy instead of color.


==================================================
10. CONTROLS
==================================================

Theme controls, dropdowns, toggles, and refresh controls should resemble
small precision objects made from frosted glass.

Default:
neutral charcoal/gray icons

Selected:
slightly brighter glass
+
one restrained amber/ember detail

Avoid burgundy-filled controls.

Avoid thick circular borders.

Avoid making every interactive control a warm accent color.


==================================================
11. COLOR BALANCE
==================================================

Approximately:

70–80%:
pearl / ivory / translucent neutral glass

15–20%:
charcoal / gray typography and controls

5–10% MAXIMUM:
ember / orange / amber accents

Do not interpret these as rigid pixel measurements.
They describe the intended visual hierarchy.


==================================================
12. MOST IMPORTANT DESIGN PRINCIPLE
==================================================

Do not make "light mode" synonymous with "warm mode."

The background photograph already supplies warmth.

The interface layered over it should therefore be mostly neutral.

Let the BACKGROUND provide atmosphere.

Let the GLASS provide materiality.

Let TYPOGRAPHY provide hierarchy.

Let the FLAME provide identity.

The desired first impression should be:

"beautiful glass calendar interface"

not:

"orange fire-themed calendar."


==================================================
FINAL VISUAL TARGET
==================================================

PEARLESCENT RIBBED BACKGROUND
              ↓
TRANSLUCENT FROSTED GLASS
              ↓
CHARCOAL TYPOGRAPHY
              ↓
RARE EMBER / FLAME DETAILS

The interface should feel quiet, expensive, contemporary, and architectural.

On first glance it should look like premium home-display software.

On second glance the user should notice the subtle fire-inspired identity.


------------
v2, 
The current light-mode design is close. Do NOT redesign it.

I want to make ONE targeted refinement:

THE EVENT TILES DO NOT LOOK GLASSY ENOUGH.

Keep unchanged:
- layout
- typography
- colors
- background image
- background treatment
- spacing
- card dimensions
- card radius
- navigation
- controls
- flame text
- content hierarchy

Only refine the MATERIAL APPEARANCE of the event cards.


GOAL

The event cards should look like actual sheets of frosted architectural
glass floating slightly in front of the ribbed background.

Right now they read too much like translucent white rectangles.

The underlying vertical/ribbed background must remain visibly perceptible
through each card.

The important optical relationship is:

OUTSIDE CARD:
background ribs are relatively sharp

INSIDE CARD:
the SAME background ribs remain visible, but become softened, diffused,
slightly refracted, and subtly brighter

That visual transition is what should communicate glass.


TRANSPARENCY

Reduce the opaque white component of the cards substantially.

Do not achieve the effect by simply making the cards white.

Start around:

background:
linear-gradient(
    135deg,
    rgba(255,255,255,0.24),
    rgba(255,255,255,0.10)
);

Adjust as necessary based on the actual implementation.

The background image should clearly contribute to the appearance of the
card.


BACKDROP FILTER

Use moderate backdrop processing approximately around:

backdrop-filter:
    blur(14px–20px)
    saturate(115–130%)
    brightness(1.02–1.06);

Do NOT use extreme blur.

If the background structure disappears completely inside the card, there is
too much blur.

I should still recognize the vertical ribs through the glass.


GLASS EDGE

Make the edge behave like a thin physical sheet of glass.

Use a subtle translucent white border approximately:

1px solid rgba(255,255,255,0.40–0.55)

Add a stronger but still subtle highlight along the upper edge.

Optionally add an extremely subtle highlight along the left edge.

Do not create a uniformly bright white outline around the entire card.


SPECULAR LIGHT

Add a very subtle internal directional highlight, preferably originating
from the upper-left.

For example, use a low-opacity pseudo-element with a broad diagonal
transparent-to-white-to-transparent gradient.

This should be barely noticeable.

It should create the impression that the glass surface is catching ambient
light.

Do NOT create:
- glossy plastic
- obvious shine streaks
- chrome
- strong gradients
- skeuomorphic reflections


DEPTH

Use a very soft shadow beneath the glass:

approximately:
0 10px 30px rgba(40,30,25,0.05–0.08)

The shadow should create separation from the background without making the
cards look like floating material-design panels.

Also use a very subtle inset upper highlight.


IMPORTANT

Glass should come primarily from:

1. transparency
2. visible background distortion
3. backdrop blur
4. subtle edge reflection
5. slight luminance change
6. extremely restrained shadow

NOT from making the card white.


VISUAL TARGET

The result should resemble:

a thin piece of premium frosted architectural glass placed in front of
ribbed glass.

It should feel optical and physical rather than like a CSS rectangle with
opacity.


DO NOT CHANGE ANY OTHER PART OF THE DESIGN.

After implementing it, tell me exactly which CSS properties controlling the
glass material were changed so I can tune them individually later.