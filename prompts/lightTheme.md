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