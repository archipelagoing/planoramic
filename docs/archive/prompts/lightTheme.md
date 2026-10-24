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


==================================================
Refine the COLOR LANGUAGE of the existing Planoramic LIGHT THEME.

This is a targeted visual refinement, NOT a redesign.

The current light-mode structure, layout, glassmorphism, background treatment,
typography, calendar layout, spacing, and controls are already close to the
desired result.

The problem I want to solve is:

There are too many separate orange focal points, but I do NOT want to solve
that by making the interface cold, black, gray, or corporate.

The light theme should become softer, warmer, more luminous, and more
sophisticated.

Think:

PEARL
→ WARM STONE
→ MUSHROOM
→ TAUPE
→ ESPRESSO
→ TERRACOTTA EMBER
→ FLAME AMBER

NOT:

WHITE
→ BLACK
→ ORANGE


======================================================================
DO NOT REDESIGN THE INTERFACE
======================================================================

Do NOT change:

- layout
- calendar structure
- sidebar structure
- background image
- background positioning
- existing glass material
- backdrop blur behavior
- card dimensions
- spacing
- border radii
- typography family
- font sizing hierarchy
- responsive behavior
- theme controls
- functionality

Do not introduce new components.

This task is primarily about COLOR HIERARCHY and ACCENT RESTRAINT.


======================================================================
OVERALL LIGHT-MODE DIRECTION
======================================================================

The light theme should feel like:

daylight passing through warm pearlescent architectural glass.

It should feel:

- luminous
- warm
- quiet
- elegant
- slightly organic
- sophisticated
- comfortable in a home environment
- premium without looking luxurious for the sake of luxury

The warmth should primarily come from:

1. the existing background photograph
2. warm-neutral typography
3. subtle terracotta/ember states
4. very selective flame typography

Do NOT tint the entire UI beige, orange, yellow, or peach.


======================================================================
WARM NEUTRAL TYPOGRAPHY SYSTEM
======================================================================

Replace cold charcoal/black thinking with a warm-neutral hierarchy.

Use approximately:

PRIMARY TEXT
#393330

MAJOR HEADINGS
#514640

SECONDARY TEXT
#716862

MUTED TEXT
#918882

VERY SUBTLE TEXT
#AAA29C

These values can be adjusted slightly if necessary for accessibility and
contrast, but preserve their relationships.

The visual progression should feel like:

deep warm espresso
→ cocoa/taupe
→ mushroom
→ warm stone

Do not use pure black for normal typography.

Do not make all typography brown either.

The colors should remain neutral enough that the interface still feels clean.


======================================================================
PLANORAMIC WORDMARK
======================================================================

KEEP the PLANORAMIC wordmark in flame text.

This should remain one of the strongest expressions of the visual identity.

Keep its italic/editorial treatment.

The flame should exist inside the glyphs.

Do NOT add:

- orange outlines
- black outlines
- outer glow
- embossed effects
- strong shadows

It should feel like a small piece of incandescent material rather than
ordinary orange text.


======================================================================
"UPCOMING EVENTS"
======================================================================

REMOVE the flame treatment from the main "Upcoming Events" heading.

Do NOT make it charcoal or black.

Use the warm major-heading color:

#514640

The heading should remain visually important because of:

- size
- typography
- placement
- weight

rather than saturated color.

This creates the hierarchy:

FLAME:
PLANORAMIC

WARM ESPRESSO:
Upcoming Events

MUTED:
Sample events · Preview


======================================================================
SUBTITLE / EDITORIAL TEXT
======================================================================

Keep:

"Sample events · Preview"

italic.

Use a warm secondary/muted color approximately:

#716862

or slightly softer if necessary.

This text should feel editorial and atmospheric rather than structural.


======================================================================
SIDEBAR
======================================================================

Reduce flame/orange usage in the sidebar.

INACTIVE ITEMS:

Use warm-neutral icons and labels.

Icons:
approximately #716862

Labels:
approximately #625A55 to #716862

Do NOT make inactive icons orange.


ACTIVE ITEM:

Keep the existing frosted-glass active surface.

Let the GLASS SURFACE communicate most of the selected state.

The active label should use the primary warm text color.

The active icon may use either:

A. the primary warm text color

or

B. a restrained terracotta ember

Prefer a restrained terracotta ember if it looks balanced.

Suggested:

#AD4A30

Do NOT use bright flame orange for the active navigation icon.

The active state should feel integrated rather than highlighted with a
highlighter.


======================================================================
TODAY / CURRENT DATE
======================================================================

KEEP today's date as a colored semantic accent.

This is a good use of the ember identity because the color communicates
meaning.

Use the SAME semantic treatment for today's date in:

- the mini calendar
- the main week calendar
- any other date representation

Shift today's color away from bright red-orange and toward a warm terracotta
ember.

Preferred starting value:

#AD4A30

Alternative:

#B64224

The result should feel like fired terracotta / glowing ember rather than
bright red.

Keep sufficient contrast for the number inside the circle.


======================================================================
CURRENT TIME
======================================================================

If the calendar displays a current-time indicator, keep it as a restrained
ember accent.

Use the same semantic ember family as TODAY.

Do not use bright generic orange.

TODAY and CURRENT TIME can share the ember family because both represent
"now."


======================================================================
EVENT COLORS
======================================================================

Do NOT force Planoramic flame colors onto calendar events.

If an event/calendar has its own source color, preserve that color.

Calendar colors should remain functional data visualization.

Planoramic's brand accent should not override them.

If an event does not have a color, use a quiet neutral/default treatment
rather than automatically assigning orange.


======================================================================
BUTTONS AND CONTROLS
======================================================================

Keep buttons, segmented controls, arrows, theme controls, and other UI
controls primarily neutral.

Use:

- translucent glass
- warm-neutral text
- warm-neutral icons
- subtle borders
- existing glass highlights

Do NOT make normal controls orange.

Do NOT make normal controls terracotta simply because terracotta exists in
the palette.

Color should communicate either:

1. brand identity
2. semantic state
3. meaningful selection

not simply "this is clickable."


======================================================================
FLAME PALETTE — LIGHT MODE
======================================================================

Refine the light-mode flame palette so it feels less like generic orange and
more like incandescent ember/fire.

Use approximately:

DEEP EMBER
#7A1D0B

BURNT EMBER
#A82A0D

VERMILION
#D6410C

FLAME ORANGE
#EF650D

AMBER HIGHLIGHT
#F49A28

Bias strongly toward:

#7A1D0B
#A82A0D
#D6410C
#EF650D

Use #F49A28 only as a relatively small highlight.

Do NOT distribute all flame colors evenly.

The effect should contain darker ember folds surrounding smaller luminous
orange/amber regions.

Avoid pale yellow and cream in light mode because those highlights disappear
against the pearlescent background.


======================================================================
FLAME COLOR SHOULD BE RARE
======================================================================

Flame is the identity, NOT the general accent color.

In the current calendar view, flame should primarily appear in:

- PLANORAMIC wordmark
- explicit flame-text content when enabled

Terracotta ember may appear in:

- today
- current time
- a very restrained selected-state detail if necessary

Everything else should primarily use the warm-neutral system.


======================================================================
COLOR SEMANTICS
======================================================================

Establish this semantic system:

PEARL / IVORY
= environment

FROSTED GLASS
= surfaces and controls

ESPRESSO / COCOA
= primary information and headings

TAUPE / MUSHROOM
= secondary information

TERRACOTTA EMBER
= current state / today / now

FLAME
= Planoramic identity

CALENDAR COLORS
= event/category information


These roles should remain visually distinct.


======================================================================
IMPORTANT: DO NOT MAKE EVERYTHING BROWN
======================================================================

"Warm" does NOT mean applying brown to every component.

The interface should still read primarily as a very light pearl/ivory
environment.

Warm-neutral typography should be subtle enough that it often reads simply
as a softer alternative to charcoal.

Avoid:

- sepia appearance
- beige-on-beige
- brown cards
- orange glass
- peach overlays
- yellow backgrounds
- vintage styling

This should remain contemporary.


======================================================================
CONTRAST HIERARCHY
======================================================================

Use contrast intentionally.

Highest neutral contrast:
- event titles
- important calendar information
- major structural headings

Medium contrast:
- navigation
- secondary information
- controls

Lower contrast:
- metadata
- weather details
- preview/status text
- tertiary information

Saturated color:
- brand
- semantic state
- event data when applicable

Do not use saturated color merely to create hierarchy.


======================================================================
DESIGN PRINCIPLE
======================================================================

The light theme should follow this hierarchy:

BACKGROUND provides ATMOSPHERE.

GLASS provides MATERIAL.

TYPOGRAPHY provides HIERARCHY.

TERRACOTTA EMBER communicates NOW / CURRENT STATE.

FLAME communicates PLANORAMIC IDENTITY.

EVENT COLORS communicate CALENDAR DATA.


The user should first perceive:

"a beautiful warm glass calendar"

then:

"this has an unusual fire-inspired identity."

The fire theme should reveal itself rather than dominate the screen.


======================================================================
TARGET VISUAL IMPRESSION
======================================================================

The finished light mode should resemble:

PEARLESCENT RIBBED GLASS
              ↓
FROSTED TRANSLUCENT SURFACES
              ↓
WARM ESPRESSO TYPOGRAPHY
              ↓
SOFT TAUPE METADATA
              ↓
OCCASIONAL TERRACOTTA EMBER
              ↓
RARE INCANDESCENT FLAME

It should feel harmonious with the warm architectural background without
becoming monochromatically orange or brown.


======================================================================
DO NOT CHANGE DARK MODE
======================================================================

This task applies ONLY to light mode.

Do not modify dark-mode colors, styling, flame treatment, glass treatment,
or typography unless shared code absolutely requires a structural change.

If shared variables currently control both modes, separate the necessary
light-mode tokens rather than changing dark mode as a side effect.


======================================================================
IMPLEMENTATION
======================================================================

Inspect the existing theme implementation before changing values.

Reuse the existing CSS custom property/theme-token architecture where
possible.

If these colors are currently repeated as hardcoded values, consolidate them
into semantic LIGHT-MODE variables where reasonable, such as:

--text-primary
--text-heading
--text-secondary
--text-muted

--accent-ember
--accent-ember-soft

--flame-deep
--flame-ember
--flame-vermilion
--flame-orange
--flame-amber

Do not over-refactor unrelated styling.


======================================================================
WHEN FINISHED
======================================================================

Tell me:

1. exactly which light-mode color variables/values changed
2. which elements still use flame text
3. which elements use terracotta ember
4. which elements use warm-neutral typography
5. whether any dark-mode styling was affected

Do not make unrelated design changes.