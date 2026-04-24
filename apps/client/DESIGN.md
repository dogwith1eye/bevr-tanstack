---
version: alpha
name: bevr-tanstack
description: >-
  A fullstack developer toolkit UI — monospace-first, flat, and technically precise.
  Built with Bun, Effect, Vite, React, and TanStack on a blue-teal palette.
colors:
  primary: "#007595"
  primary-foreground: "#ecfeff"
  secondary: "#f4f4f5"
  secondary-foreground: "#18181b"
  muted: "#f1f3f3"
  muted-foreground: "#67787c"
  accent-foreground: "#161b1d"
  surface: "#f9fbfb"
  background: "#ffffff"
  foreground: "#090b0c"
  destructive: "#e7000b"
  border: "#e3e7e8"
  ring: "#9ca8ab"
  primary-dark: "#005f78"
  primary-emphasis-dark: "#00b8db"
  background-dark: "#090b0c"
  foreground-dark: "#f9fbfb"
  surface-dark: "#161b1d"
  muted-dark: "#22292b"
  destructive-dark: "#ff6467"
  chart-1: "#fda5d5"
  chart-2: "#f6339a"
  chart-3: "#e60076"
  chart-4: "#c6005c"
  chart-5: "#a3004c"
typography:
  display:
    fontFamily: JetBrains Mono Variable
    fontSize: 48px
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: -0.02em
  heading:
    fontFamily: JetBrains Mono Variable
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  heading-sm:
    fontFamily: JetBrains Mono Variable
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: JetBrains Mono Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: JetBrains Mono Variable
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: JetBrains Mono Variable
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
  code:
    fontFamily: JetBrains Mono Variable
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: '"liga" 1, "calt" 1'
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  gutter: 16px
  container-max: 72rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: 32px
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: 32px
    padding: 12px
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: 32px
    padding: 12px
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: 32px
    padding: 12px
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    height: 32px
    padding: 10px
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: 16px
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: 20px
    padding: 8px
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: 20px
    padding: 8px
  chat-bubble-user:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 16px
  chat-bubble-assistant:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
  navigation-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: 12px
  navigation-link-active:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
---

# bevr-tanstack Design System

## Overview

**Terminal Precision meets Developer Tooling.** The UI evokes a high-fidelity
terminal or technical dashboard — the kind of interface a systems engineer would
trust. Every pixel is intentional, every font choice deliberate.

The defining trait is monospace-everywhere: JetBrains Mono Variable is the sole
typeface, used for headings, body text, labels, code, and navigation alike. This
creates an environment that feels built by and for engineers, where content and
structure are always legible and aligned.

The color palette is anchored by a blue-teal primary — a hue associated with
precision instruments and data systems — against crisp white (light mode) or near-
black (dark mode) backgrounds. Flat, sharp-cornered surfaces replace rounded
softness. There are no shadows. Hierarchy is expressed through tonal layers and
weight contrast alone.

The application itself is a developer toolkit showcasing four capabilities: streaming
AI chat, REST API testing, RPC API calls, and real-time WebSocket presence. The
design reflects this purpose — dense but readable, direct, and never decorative.

## Colors

The palette is built on a single blue-teal accent against neutral grays, with a
clear semantic separation between interactive and structural colors.

- **Primary (`#007595`):** Deep teal for all primary interactive elements —
  buttons, active states, user chat bubbles, and focus rings. In dark mode this
  shifts to `#005f78` to preserve contrast against dark surfaces.
- **Primary Foreground (`#ecfeff`):** Near-white on all primary-colored surfaces,
  ensuring maximum legibility.
- **Secondary (`#f4f4f5`):** Cool light gray for secondary buttons, tag backgrounds,
  and subdued surfaces. Pairs with `secondary-foreground` (`#18181b`).
- **Muted (`#f1f3f3`):** Slightly warmer gray used for hover states, code block
  backgrounds, and inactive tab fills. `muted-foreground` (`#67787c`) handles
  all caption and metadata text.
- **Surface (`#f9fbfb`):** The sidebar and panel background — one step cooler than
  pure white to separate structural chrome from content.
- **Foreground (`#090b0c`):** Near-black for all primary body text. Close to
  black but with a faint blue-gray undertone that ties it to the teal palette.
- **Destructive (`#e7000b`):** Vivid red strictly for error states and destructive
  actions. In dark mode this becomes `#ff6467` to maintain visibility.
- **Border (`#e3e7e8`) / Ring (`#9ca8ab`):** Subtle cool-gray borders and focus
  rings. In dark mode borders use white at 10% opacity to keep surfaces light-
  weight.

**Dark Mode** inverts the tonal structure: `background-dark` (`#090b0c`) becomes
the canvas, `surface-dark` (`#161b1d`) lifts cards and panels, and `muted-dark`
(`#22292b`) provides the deepest inset layer.

**Data Visualization** uses a concentrated pink-to-magenta ramp (`chart-1` through
`chart-5`) — a deliberate contrast to the blue-teal UI palette that ensures chart
series stand out from structural color.

## Typography

The entire system uses a single typeface: **JetBrains Mono Variable**. There are
no display or body serif/sans alternatives. This constraint is a feature — it
signals that the product is a technical tool, not a publication.

The variable font allows expressive weight contrast without changing families:

- **Display** (900 weight, 48px, tight tracking): Reserved for the main page
  heading — the only time the maximum weight is deployed. Used once, it acts as
  an unmistakable anchor.
- **Heading** (700 weight, 24px): Section headings, card titles, and modal headers.
  Slight negative tracking keeps it crisp at this size.
- **Heading SM** (600 weight, 18px): Sub-section labels and sidebar navigation
  group headers.
- **Body** (400 weight, 14px): Primary readable text in cards, descriptions, and
  response panels. Generous line height (1.6) keeps dense terminal output legible.
- **Body SM** (400 weight, 12px): The dominant size throughout the application —
  used in buttons, inputs, badges, chat messages, and all interactive controls.
  Most UI elements operate at 12px because the target audience is comfortable
  reading dense technical content.
- **Label** (500 weight, 12px): Navigation items, field labels, and button text.
  Medium weight differentiates labels from body text at the same size.
- **Code** (400 weight, 12px, ligatures enabled): Inline and block code, API
  response payloads. Font ligatures (`liga`, `calt`) are enabled only for code
  contexts to improve operator readability.

All typography inherits from `html { font-family: "JetBrains Mono Variable" }`.

## Layout

The layout follows a **centered single-column** model with a fixed maximum width of
72rem (6xl). All content is `mx-auto` with 16px (1rem) outer padding. This keeps
the interface readable on wide monitors without excessive horizontal scanning.

Vertical rhythm is defined by the base spacing unit of **4px** (1 Tailwind unit).
The spacing scale multiplies this base in powers of two: 4px → 8px → 16px → 32px
→ 64px. Components default to 8px internal gaps; page-level sections use 32px
separation.

The structure from top to bottom:
1. **Header** — logo lockup + navigation menu
2. **Main content area** — route-specific view with max-w-6xl constraint
3. **Footer** — minimal attribution

No sidebars, no multi-column grids. Content is always full-width within the container.
The navigation is horizontal tab-style rather than a sidebar, reinforcing the single-
column approach.

## Elevation & Depth

Depth is communicated through **tonal contrast alone** — there are no shadows in
this design system.

- Layer 0 (base): `background` (`#ffffff` / `#090b0c`)
- Layer 1 (cards, panels): `background` with `border` (`#e3e7e8`) outline
- Layer 2 (sidebar, chrome): `surface` (`#f9fbfb` / `#161b1d`)
- Layer 3 (inset, code blocks): `muted` (`#f1f3f3` / `#22292b`)

Interactive state changes are communicated through background color transitions
rather than elevation: hover shifts a ghost button from transparent to `muted`,
active shifts primary from `#007595` to `#005f78`. Depth is read, not felt.

Focus states use `ring` (`#9ca8ab`) at 50% opacity — visible enough for
accessibility without visual noise.

## Shapes

**Architectural Sharpness.** All components default to `rounded-none` — zero border
radius. Buttons, inputs, cards, badges, chat bubbles, and navigation items are all
perfectly rectangular.

This is the defining visual signature of the system. Square corners enforce the
engineering-tool aesthetic and create crisp, predictable alignment across all
element types.

The rounded scale (`sm` through `xl`) is defined in the token system for use in
contextually appropriate exceptions — status indicator dots, avatar initials, and
toggle switches use `rounded-full`. No other exceptions are standard.

## Components

### Buttons

Four variants cover all interaction needs:

- **Primary** — teal fill (`#007595`), white text, 32px height. The call-to-action
  for API calls, send actions, and confirmations. One per view.
- **Secondary** — light gray fill (`#f4f4f5`), dark text. Supporting actions alongside
  a primary, or standalone low-emphasis actions.
- **Ghost** — transparent background, foreground text. Navigation controls, icon-only
  actions, and toolbar items. Background appears only on hover.
- **Destructive** — red fill (`#e7000b`), white text. Deletion and irreversible actions.

All button text uses the `label` typography token (500 weight, 12px). Icon sizes
follow the button height tier: `xs` (24px), `sm` (28px), `default` (32px), `lg` (36px).

### Inputs

Text inputs match button height (32px, no border radius) for visual alignment in
form rows. Border is `#e3e7e8`, background transparent. Placeholder text uses
`muted-foreground`. Focused state adds a `ring` outline at 50% opacity.

### Cards

Cards are the primary content container. They use `border` for all four edges —
no shadow, no elevation treatment. Two sizes:

- **Default** — 16px vertical padding, 16px gaps between sections.
- **SM** — 12px vertical padding, 8px gaps. Used for response detail panels and
  compact metadata.

### Chat Interface

- **User messages** — right-aligned, primary teal fill, white text, max 85% width.
  Represents the human turn.
- **Assistant messages** — left-aligned, transparent background, foreground text.
  Segments are separated by 8px gaps. Tool calls and token usage metadata render
  within the assistant bubble using `muted-foreground` label text.
- **Streaming indicator** — an animated spinner within the response card while
  the stream is in-flight.
- **Error state** — red (`destructive`) border with error message body, no fill.

### Navigation

Horizontal tab navigation using `NavigationMenuLink` components. Active link uses
`foreground` text weight; inactive uses `muted-foreground`. No background fill on
either state — active status is communicated by color weight alone, not a filled
tab. 12px padding per link.

### Badges

Flat rectangular labels, 20px height, 12px label typography. Used for status
indicators (online/away/busy in presence view) and API response codes.

### Response Cards

A composite pattern used in REST and RPC views. States:
- **Loading** — spinner centered in a `min-h-[168px]` card
- **Completed** — response data rendered as formatted JSON or markdown
- **Error** — `destructive` border, error message in body

## Do's and Don'ts

- Do use `primary` for exactly one call-to-action per view — it signals "the main
  thing to do here"
- Don't apply border radius to interactive components; all buttons, inputs, cards,
  and bubbles must use `rounded-none`
- Do maintain WCAG AA contrast (4.5:1 minimum) — primary teal on white exceeds
  this; always verify before introducing new color pairings
- Don't introduce a second typeface — JetBrains Mono Variable is the only font in
  this system
- Do use `muted-foreground` for metadata, timestamps, labels, and secondary
  information — never use a fully opaque non-token gray
- Don't use shadows — use tonal layering and `border` to establish depth
- Do use the chart palette (pink-magenta ramp) exclusively for data visualization;
  never use `chart-*` colors for UI chrome or interactive elements
- Don't exceed two font weights in a single view; prefer the 400/700 pairing for
  body/heading contrast
- Do keep the max content width at `container-max` (72rem); don't stretch content
  to full viewport width
- Don't add decorative elements — no gradients, no illustrations, no icons that
  aren't strictly functional
