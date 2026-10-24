Refine the current Planoramic dark-mode UI to feel significantly more
sophisticated, restrained, architectural, and premium.

IMPORTANT:
Do not redesign the application from scratch.
Preserve the existing layout, navigation structure, background image,
glassmorphism concept, calendar cards, theme controls, and flame-text feature.

The problem is VISUAL RESTRAINT.

The current design uses too much orange, too many outlines, too much brown,
and too many simultaneous decorative effects. This makes the interface feel
themed rather than refined.

The new design should feel like:

premium home-display software
+
dark architectural glass
+
warm firelight

NOT:
- Halloween
- rustic
- steampunk
- casino
- fantasy UI
- gaming dashboard
- orange-and-black theme
- generic streaming interface


-----------------------------------------
1. REDUCE ORANGE BY APPROXIMATELY 70%
-----------------------------------------

Orange/flame colors should become a PRECIOUS accent rather than the main UI
color.

Reserve flame coloration primarily for:
- PLANORAMIC wordmark
- major page title
- selected/active state
- occasional tiny status accent

Do NOT make all of these orange:
- every date
- every time
- every icon
- every outline
- every control
- every label

Most interface text should be neutral ivory or warm gray.

The interface should still clearly belong to Planoramic even if only
approximately 5–10% of visible pixels contain orange.


-----------------------------------------
2. REMOVE THE ORANGE TEXT OUTLINES
-----------------------------------------

The current dark outlines/shadows around orange typography make it look
embossed or game-like.

Remove:
- thick text strokes
- obvious black outlines
- strong drop shadows
- embossed text effects

Flame text should create its own contrast through luminance and color.

If a shadow is necessary, use an extremely subtle diffuse shadow.


-----------------------------------------
3. MAKE THE FLAME EFFECT MORE SOPHISTICATED
-----------------------------------------

Keep the flame-text system, but make it less obviously "fire themed."

Use flowing internal coloration rather than outlined orange letters.

Dark-mode flame palette:

#7A2108
#B83B08
#E9630B
#F79A22
#F6C56A
#FFE3A0

Do not distribute these colors evenly.

Most of the glyph should live in burnt orange / amber.
Bright gold and cream should appear only in small internal ribbons.

No outer orange glow.
No orange stroke.

Think:
light from a fireplace reflected through amber glass

rather than:
text that is on fire.


-----------------------------------------
4. CHANGE THE GLASS FROM BROWN TO SMOKED GLASS
-----------------------------------------

The event cards currently become large brown rectangles.

Remove the obvious brown tint.

Cards should be neutral smoked glass with only a VERY subtle warm undertone.

Target visual behavior:

background: rgba(24, 22, 21, 0.42);

backdrop-filter:
    blur(20px)
    saturate(115%);

border:
    1px solid rgba(255,255,255,0.14);

Use a very subtle inner highlight:
inset 0 1px 0 rgba(255,255,255,0.08);

Use a soft shadow rather than a visible outline.

The background image should remain visible through the cards, but heavily
softened.

Cards should look like dark glass placed in front of warm architectural
lighting.

Do NOT make them look like brown translucent plastic.


-----------------------------------------
5. MAKE BORDERS ALMOST DISAPPEAR
-----------------------------------------

The current UI has too many visible rounded rectangles.

Reduce border contrast substantially.

Borders should generally only become noticeable when the user looks closely.

Use:
rgba(255,255,255,0.10–0.16)

rather than bright gray borders.

Let differences in translucency, blur, and elevation define components.


-----------------------------------------
6. SIMPLIFY THE SIDEBAR
-----------------------------------------

Make the sidebar quieter and more luxurious.

Inactive navigation:
- warm-gray text
- neutral icons
- no orange
- no visible container

Active navigation:
- very subtle translucent highlight
- slightly brighter text
- ONE small flame/amber accent

Do not put every icon in orange.

Consider using monochrome warm-white icons for inactive items and allowing
only the selected icon/accent to receive a restrained amber treatment.

The active state should be obvious through hierarchy, not saturation.


-----------------------------------------
7. IMPROVE TYPOGRAPHIC HIERARCHY
-----------------------------------------

Keep the serif direction if it works with the selected user font, but remove
the "old-fashioned decorative" feeling.

Use typography through SCALE and WEIGHT rather than outlines and shadows.

Suggested hierarchy:

PLANORAMIC
small uppercase
increased letter spacing
flame treatment

Upcoming Events
large elegant heading
flame treatment OR warm ivory depending on flame-text setting

Next seven days · 29 calendars
smaller muted warm-gray

DATE HEADINGS
warm ivory
medium weight
no orange outline

EVENT TIME
slightly brighter neutral or restrained amber
medium weight

EVENT TITLE
soft ivory
strongest neutral text

CALENDAR / LOCATION
muted gray
smaller
lower contrast

The event title should visually dominate its metadata.


-----------------------------------------
8. LET THE BACKGROUND PROVIDE THE WARMTH
-----------------------------------------

The existing background image already contains beautiful amber/brown light.

DO NOT repeat those colors aggressively across every UI component.

Let the photograph provide approximately 80% of the warm atmosphere.

The interface layered above it should primarily use:
- charcoal
- smoke
- ivory
- warm gray
- transparent glass

Then tiny flame accents will appear much richer.


-----------------------------------------
9. CONTROLS SHOULD LOOK LIKE OBJECTS, NOT BADGES
-----------------------------------------

Restyle the circular theme controls and refresh control.

Use:
- smoked translucent glass
- extremely subtle border
- neutral icon by default

Selected control:
- slightly brighter glass
- tiny amber indication
- subtle inner highlight

Avoid thick circular outlines.

The controls should resemble precision hardware controls embedded in glass.


-----------------------------------------
10. INCREASE NEGATIVE SPACE
-----------------------------------------

Do not solve hierarchy by adding decoration.

Increase breathing room around:
- page heading
- date groups
- event cards
- toolbar controls

Slightly reduce the visual density of the cards.

The interface is intended for a television/home display, so information
should remain highly legible at a distance without appearing crowded.


-----------------------------------------
11. EVENT CARD REFINEMENT
-----------------------------------------

Make cards slightly less rounded.

Current cards feel pill-like.

Target border radius:
16–20px on large cards.

Within each event:

TIME        EVENT TITLE
            metadata

Give the time column a consistent width.

Do not separate these areas with visible lines.

Use spacing and typography to establish the grid.


-----------------------------------------
12. COLOR SYSTEM
-----------------------------------------

Base:
#11100F
#181716
#23211F

Primary text:
#F1ECE5

Secondary text:
#AAA29A

Muted text:
#77716C

Glass:
rgba(25,23,22,0.35–0.55)

Borders:
rgba(255,255,255,0.10–0.16)

Accent ember:
#B83B08

Accent orange:
#E9630B

Accent amber:
#F79A22

Hot highlight:
#F6C56A

Do not introduce additional warm accent colors unless necessary.


-----------------------------------------
DESIGN PRINCIPLE
-----------------------------------------

Every element should pass this test:

"If I remove this decorative effect, does the hierarchy still work?"

If yes, remove the decorative effect.

Use:
contrast
spacing
transparency
blur
typographic scale
and a tiny amount of flame color

to establish hierarchy.

The interface should initially read as an elegant dark glass calendar.

Only on second glance should the user notice that the warm highlights have
the color and movement of fire.

That subtle discovery is the desired Planoramic identity.