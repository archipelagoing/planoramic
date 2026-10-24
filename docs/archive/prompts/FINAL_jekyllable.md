Create a complete, reusable Jekyll theme from the visual design system that
already exists in this repository.

The current Planoramic implementation is the SOURCE OF TRUTH.

Do not redesign the visual system from memory or invent a new interpretation
of it. Inspect the existing implementation and extract the actual design
decisions, values, effects, assets, and behavior currently being used.


======================================================================
OUTPUT LOCATION — IMPORTANT
======================================================================

Create the entire theme inside a new folder at the ROOT of this repository:

jekyll-theme/

For now:

Planoramic repository
├── existing Planoramic application
└── jekyll-theme/
    └── complete standalone reusable Jekyll theme

DO NOT:
- turn the current Planoramic repository itself into a Jekyll project
- create a separate Git repository
- move existing Planoramic files
- refactor Planoramic to consume the theme
- change Planoramic's functionality
- break or redesign the existing application

The existing application should continue working exactly as it does now.

The jekyll-theme/ folder should be SELF-CONTAINED.

Later, I should be able to copy/move jekyll-theme/ into a separate repository
and turn it into an independent GitHub Pages/Jekyll theme with minimal
additional work.


======================================================================
PRIMARY GOAL
======================================================================

Extract the reusable DESIGN SYSTEM from Planoramic.

Do NOT extract the Planoramic application itself.

The theme should reproduce the visual language currently implemented in
Planoramic, including:

- light mode
- dark mode
- flame-text effect
- separate light/dark flame palettes
- glassmorphism
- smoked-glass dark surfaces
- frosted/pearlescent light surfaces
- architectural/ribbed background image treatment
- typography
- italic typography hierarchy
- headings
- body text
- metadata
- cards
- buttons
- inputs
- dropdowns
- navigation
- controls
- borders
- border radii
- spacing
- shadows
- responsive behavior
- transitions
- selected/active states

Do NOT include application-specific functionality such as:

- Google Calendar logic
- event retrieval
- authentication
- TV pairing
- APIs
- backend logic
- calendar parsing
- Planoramic-specific data models
- application state
- routing specific to Planoramic

I want the aesthetic and component system, not the calendar application.


======================================================================
FIRST: INSPECT THE EXISTING IMPLEMENTATION
======================================================================

Before creating the theme, inspect the repository and identify:

1. where the current light/dark theme values live
2. how the flame-text effect is implemented
3. how the background image is rendered and filtered
4. how glass surfaces are implemented
5. which fonts and font variants are being used
6. how italic typography is currently handled
7. button/input/control styling
8. navigation styling
9. card styling
10. spacing, radii, borders, shadows, and transitions
11. responsive behavior
12. any JavaScript required purely for presentation/theme behavior

Extract ACTUAL values from the implementation wherever possible.

Do not approximate existing values unnecessarily.

If several implementations of the same visual pattern exist, consolidate them
into a coherent reusable component/token system while preserving the current
visual result.


======================================================================
TARGET STRUCTURE
======================================================================

Create approximately:

jekyll-theme/
├── _includes/
│   ├── head.html
│   ├── header.html
│   ├── navigation.html
│   ├── footer.html
│   └── theme-controls.html
│
├── _layouts/
│   ├── default.html
│   ├── home.html
│   ├── page.html
│   └── post.html
│
├── _sass/
│   ├── _tokens.scss
│   ├── _base.scss
│   ├── _typography.scss
│   ├── _flame.scss
│   ├── _glass.scss
│   ├── _components.scss
│   ├── _navigation.scss
│   ├── _forms.scss
│   ├── _content.scss
│   └── _responsive.scss
│
├── assets/
│   ├── css/
│   │   └── main.scss
│   ├── js/
│   │   └── theme.js
│   └── images/
│       └── [required reusable visual assets]
│
├── _config.yml
├── Gemfile
├── index.md
├── 404.html
└── README.md

Adjust this structure if Jekyll conventions make another organization
cleaner, but keep the theme modular and understandable.


======================================================================
DESIGN TOKENS
======================================================================

Convert the existing visual system into reusable design tokens.

Use CSS custom properties wherever practical, with SCSS used for organization
and generation.

Create tokens for at least:

COLORS
- page background
- surface background
- primary text
- secondary text
- muted text
- subtle text
- accent colors
- light flame palette
- dark flame palette

GLASS
- glass background
- glass background hover
- glass border
- glass highlight
- glass blur
- glass saturation
- glass shadow

GEOMETRY
- small radius
- medium radius
- large radius
- pill radius if needed

SPACING
- reusable spacing scale

TYPOGRAPHY
- font families
- body size
- metadata size
- heading sizes
- display sizes
- weights
- line heights
- letter spacing
- italic treatment

MOTION
- transition duration
- easing
- hover transitions

Create separate light and dark values where necessary.

Prefer semantic variable names rather than names tied to one component.

For example:

--color-text-primary
--color-text-muted
--surface-glass
--surface-glass-border
--flame-ember
--flame-orange
--flame-amber

rather than:

--calendar-card-brown
--orange-heading-color


======================================================================
FLAME TEXT SYSTEM
======================================================================

Preserve the EXISTING Planoramic flame-text implementation.

Do NOT replace it with a generic orange/yellow linear gradient.

The effect should preserve the existing qualities:

- organic internal coloration
- ember → orange → amber → hot highlight behavior
- flowing/marbled visual structure
- crisp glyph edges
- separate light-mode and dark-mode palettes
- no cartoon flames
- no generic outer glow
- no heavy outline
- no embossed text appearance

Make the flame effect reusable.

At minimum, support:

<span class="flame-text">Flame text</span>

Also provide intensity variants such as:

<span class="flame-text flame-text-subtle">Subtle flame</span>

<span class="flame-text flame-text-medium">Medium flame</span>

<span class="flame-text flame-text-strong">Strong flame</span>

The variants should alter intensity/highlight behavior rather than completely
changing the visual identity.

The effect must automatically use the appropriate light/dark flame palette.


======================================================================
FLAME TYPOGRAPHY SEMANTICS
======================================================================

The current Planoramic design uses flame color selectively.

Preserve the philosophy that flame color is a PRECIOUS accent rather than a
general UI color.

Do not make the generic Jekyll theme orange everywhere.

Provide utilities/components that allow flame treatment to be applied to:

- branding
- display headings
- selected accents
- small information anchors

but leave its use opt-in.

Normal theme elements should remain predominantly neutral.


======================================================================
GLASS SYSTEM
======================================================================

Extract the current glass styling into reusable components.

Provide classes such as:

.glass
.glass-card
.glass-button
.glass-input
.glass-select
.glass-nav
.glass-control

These should automatically adapt between light and dark modes.

DARK MODE:

The visual language should preserve the existing concept of:

smoked architectural glass
+
neutral dark surfaces
+
warm background light

Do not turn glass surfaces into opaque brown rectangles.


LIGHT MODE:

Preserve the concept of:

frosted / pearlescent architectural glass
+
neutral translucent surfaces
+
subtle background variation

Do not turn glass surfaces into opaque white rectangles.

The background underneath should remain perceptible enough for
backdrop-filter to create visible material depth.


======================================================================
BACKGROUND SYSTEM
======================================================================

Preserve the existing architectural/ribbed background image system.

Copy any REQUIRED reusable background assets into:

jekyll-theme/assets/images/

Do not reference assets outside jekyll-theme/.

Make the background configurable through _config.yml.

Example:

theme_background: "/assets/images/background.jpg"

Also allow individual pages to override the background through front matter
where practical.

For example:

---
layout: page
background_image: /assets/images/example.jpg
---

Preserve separate light/dark processing.

DARK MODE:
Maintain the current dark, warm, architectural atmosphere.

LIGHT MODE:
Preserve the same source image while transforming it toward a
pearlescent/frosted architectural-glass appearance.

The background system should be reusable with other images later.

Do not hardcode styling around one exact image dimension.


======================================================================
TYPOGRAPHY
======================================================================

Preserve the typography system developed in Planoramic.

Create reusable semantic classes/components for:

.display-title
.section-title
.body-text
.metadata
.editorial-italic
.muted
.flame-text

Preserve the current relationship between roman and italic typography.

General semantic principle:

ROMAN / UPRIGHT
= primary information, structure, what, when

ITALIC
= identity, context, editorial secondary information

The theme should support elegant use of italics without making all content
italic.

Use true italic font faces where available rather than synthetically skewing
regular text.

Make fonts configurable where practical.


======================================================================
GENERIC CONTENT STYLING
======================================================================

Because this will eventually be used for arbitrary GitHub Pages sites,
provide polished styling for normal Markdown/Jekyll content.

Style:

- h1–h6
- paragraphs
- links
- strong
- emphasis
- lists
- nested lists
- blockquotes
- inline code
- fenced code blocks
- tables
- horizontal rules
- images
- figure captions

These should feel like natural extensions of the existing Planoramic visual
system.

Do not make ordinary Markdown content look like calendar cards.


======================================================================
NAVIGATION
======================================================================

Create a generic reusable navigation system based on Planoramic's existing
visual language.

It should support configuration from _config.yml.

Example:

navigation:
  - title: Home
    url: /
  - title: Projects
    url: /projects/
  - title: About
    url: /about/

Support:

- inactive navigation
- active navigation
- hover
- keyboard focus
- responsive/mobile behavior

Keep inactive navigation neutral.

Use accent/flame color sparingly for selected states.


======================================================================
THEME SWITCHING
======================================================================

Support three theme states:

- system
- light
- dark

Preserve the existing theme behavior where possible.

Allow manual selection.

Store an explicit user preference using localStorage.

If "system" is selected, follow prefers-color-scheme.

Avoid a flash of the wrong theme during page load.

Ensure the implementation works without a framework.


======================================================================
CONFIGURATION
======================================================================

Expose useful settings through _config.yml.

Include approximately:

title:
description:

theme:
  default_mode: system
  show_theme_toggle: true
  flame_text_enabled: true
  background_image:
  font_family:

navigation: []

Do not overengineer configuration.

Expose settings that are likely to be useful when this theme is reused on
another site.

Allow sensible front-matter overrides where appropriate.


======================================================================
JEKYLL LAYOUTS
======================================================================

Create generic layouts for:

default.html
home.html
page.html
post.html

They must not contain Planoramic-specific calendar UI.

Use reusable includes for repeated structure.

At minimum:

head
header
navigation
footer
theme controls

Use semantic HTML.


======================================================================
ACCESSIBILITY
======================================================================

Do not sacrifice usability for aesthetics.

Ensure:

- sufficient text contrast
- visible keyboard focus states
- semantic HTML
- navigation works with keyboard
- controls have appropriate labels
- reduced-motion preference is respected
- flame text remains readable
- important information is never communicated by color alone

If backdrop-filter is unsupported, provide a reasonable solid/translucent
fallback.


======================================================================
RESPONSIVE BEHAVIOR
======================================================================

The theme must work on:

- desktop
- laptop
- tablet
- mobile

Do not copy television-specific sizing directly into the generic theme.

Extract the visual language while adapting layout dimensions appropriately
for general websites.

Preserve generous spacing and the architectural feel at smaller sizes.


======================================================================
GITHUB PAGES COMPATIBILITY
======================================================================

Build this with eventual GitHub Pages use in mind.

Avoid unsupported Jekyll plugins unless absolutely necessary.

Prefer native Jekyll/Liquid/CSS/JavaScript.

Asset paths must work for BOTH:

username.github.io

and:

username.github.io/repository/

Use Jekyll filters such as:

relative_url
absolute_url

where appropriate.

Do not hardcode root-relative assumptions that break project pages.


======================================================================
LOCAL DEVELOPMENT
======================================================================

Include a Gemfile so the extracted folder can be run independently.

I should eventually be able to do approximately:

cd jekyll-theme
bundle install
bundle exec jekyll serve

and open the local Jekyll site.

Configure the folder accordingly.


======================================================================
DEMO / DESIGN SYSTEM SHOWCASE
======================================================================

Create jekyll-theme/index.md as a visual demonstration of the theme.

This is NOT a Planoramic page.

It should demonstrate:

- display heading
- flame heading
- subtle flame text
- regular heading
- body typography
- italic/editorial typography
- muted metadata
- links
- glass cards
- glass buttons
- inputs
- select controls
- navigation
- blockquotes
- lists
- code
- tables
- images
- light/dark theme switching

Include enough content to expose visual problems.

The demo should make it easy to compare light and dark mode.


======================================================================
README
======================================================================

Write a useful README.md inside jekyll-theme/.

Document:

1. what the theme is
2. how to run it locally
3. directory structure
4. configuration
5. light/dark themes
6. changing the background image
7. flame text
8. flame intensity variants
9. glass components
10. typography utilities
11. navigation configuration
12. overriding design tokens
13. using the theme for normal Markdown pages
14. eventual GitHub Pages deployment
15. how the folder could later be moved into its own repository

Include copy-paste examples.


======================================================================
DO NOT OVER-ABSTRACT
======================================================================

This is important.

Do not turn every CSS declaration into a configurable variable.

Do not build a JavaScript component framework.

Do not introduce React/Vue/etc. into the Jekyll theme.

Do not create unnecessary dependencies.

Do not build a giant generic design-system framework.

This should remain:

Jekyll
+ Liquid
+ SCSS/CSS
+ small amounts of vanilla JavaScript

The goal is a beautiful, understandable, portable theme.


======================================================================
PRESERVE THE VISUAL IDENTITY
======================================================================

The theme should retain the core visual identity developed in Planoramic:

DARK MODE:

warm architectural background
        ↓
smoked translucent glass
        ↓
ivory neutral typography
        ↓
rare molten/flame accents


LIGHT MODE:

pearlescent architectural background
        ↓
frosted translucent glass
        ↓
charcoal neutral typography
        ↓
rare ember/flame accents


The theme should NOT become:

- generic orange-and-black
- beige
- Halloween themed
- gaming themed
- fantasy themed
- steampunk
- overly glossy
- overly skeuomorphic
- generic Bootstrap-style UI

The flame identity should reveal itself through restrained details rather than
dominating every component.


======================================================================
IMPLEMENTATION RULE
======================================================================

Whenever there is a choice between:

A. recreating an effect approximately

and

B. extracting/adapting the working implementation already in Planoramic

choose B.

The existing implementation is the reference.


======================================================================
DO NOT MODIFY PLANORAMIC
======================================================================

For this step, treat jekyll-theme/ as an independent extraction.

Do NOT change the existing Planoramic application to import or depend on
jekyll-theme/.

Do NOT delete existing styling after copying/extracting it.

Do NOT reorganize the current application.

Do NOT make unrelated cleanup changes.

All new theme work should live inside jekyll-theme/.

If copying an existing asset or adapting existing code is necessary, COPY it
into jekyll-theme/ rather than moving it out of the application.


======================================================================
VALIDATION
======================================================================

Before considering the task complete:

1. Verify that the existing Planoramic application still works unchanged.

2. Verify that jekyll-theme/ can operate independently.

3. Verify that all theme assets referenced by the Jekyll site exist inside
   jekyll-theme/.

4. Verify that there are no accidental dependencies on Planoramic source
   files.

5. Verify light mode.

6. Verify dark mode.

7. Verify flame text in both modes.

8. Verify responsive behavior.

9. Verify relative asset paths suitable for GitHub project pages.

10. Verify the demo page exercises the major components.


======================================================================
WHEN FINISHED
======================================================================

Give me a concise implementation report containing:

1. the final jekyll-theme/ directory tree

2. the Planoramic files you inspected as visual/design sources

3. the design tokens you extracted

4. how the flame-text implementation was generalized

5. how light/dark background processing was generalized

6. which pieces of Planoramic were intentionally NOT included

7. anything that could not be generalized cleanly

8. exact commands to run the Jekyll demo locally

9. any prerequisites I need installed

10. confirmation that existing Planoramic files were not modified

Do not merely describe what should be built.

Actually create the complete jekyll-theme/ implementation.