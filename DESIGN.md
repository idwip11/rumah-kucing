---
name: Serene Feline
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#414844'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#727973'
  outline-variant: '#c1c8c2'
  surface-tint: '#446554'
  primary: '#416352'
  on-primary: '#ffffff'
  primary-container: '#5a7c6a'
  on-primary-container: '#f5fff7'
  inverse-primary: '#aacfba'
  secondary: '#885030'
  on-secondary: '#ffffff'
  secondary-container: '#fcb38c'
  on-secondary-container: '#784324'
  tertiary: '#755b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a84c'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c6ebd5'
  primary-fixed-dim: '#aacfba'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#2c4d3d'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb68f'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#6c391b'
  tertiary-fixed: '#ffe08f'
  tertiary-fixed-dim: '#e6c363'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
  surface-cream: '#F9F7F2'
  surface-card: '#FFFFFF'
  sage-deep: '#4A6355'
  terracotta-soft: '#F2B89C'
  ink: '#2D3330'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 80px
---

## Brand & Style

The design system is crafted to evoke feelings of trust, serenity, and gentle playfulness. Designed for "Rumah Kucing," it moves away from the sterile, clinical aesthetic often found in pet health apps, opting instead for a **premium, lifestyle-oriented experience**.

The visual direction follows a **Modern Tactile** style—combining clean, high-end layouts with soft, organic shapes and a warm, inviting color palette. The goal is to make cat owners feel empowered and calm, as if they are stepping into a well-curated home sanctuary rather than a medical portal. Key visual drivers include:
- **Warmth:** Eschewing pure whites and grays for cream and earth-inspired neutrals.
- **Expertise:** Utilizing high-quality serif-like balance in typography paired with approachable rounded accents.
- **Softness:** Aggressive use of large corner radii to mimic the organic nature of pets.

## Colors

The palette is anchored by **Warm Sage Green**, representing health, growth, and natural care. This is contrasted by **Soft Terracotta**, which injects warmth and energy into the interface without becoming jarring.

- **Primary (Sage):** Used for primary actions, branding elements, and health-related indicators.
- **Secondary (Terracotta/Peach):** Used for playful accents, notifications, and secondary calls to action.
- **Backgrounds:** We avoid `#FFFFFF` for the main canvas, utilizing a **Warm Cream (#F9F7F2)** to reduce eye strain and establish a premium, "paper-like" tactile quality. Pure white is reserved strictly for cards to provide elevation contrast.
- **Typography:** An "Ink" color (#2D3330) is used instead of pure black to maintain the soft visual harmony.

## Typography

This design system uses a dual-font strategy to balance friendliness with professional legibility:
- **Heading Font (Quicksand):** A rounded, geometric sans-serif that provides an immediate sense of approachability. Its soft terminals reflect the "Rumah Kucing" personality.
- **Body Font (Be Vietnam Pro):** A modern, highly legible sans-serif that ensures professional clarity for medical advice, articles, and data-heavy timelines.

**Mobile Scaling:** Headlines larger than 32px scale down by 20% on mobile devices (e.g., Display-LG becomes 38px) to maintain readability without overwhelming the viewport.

## Layout & Spacing

The layout philosophy is **generous and breathable**. We utilize a 12-column fluid grid for desktop and a 4-column grid for mobile.

- **Rhythm:** A base-8 spacing scale is used. However, "Macro Spacing" (between sections) is intentionally large (40px-64px) to emphasize the minimalist, premium feel.
- **Containment:** Content is primarily housed in wide-margin containers to avoid a cluttered "edge-to-edge" look, creating a focused center of gravity.
- **Mobile:** Margins shrink to 16px, but internal card padding remains at 24px to maintain the "cushioned" look.

## Elevation & Depth

Hierarchy is established through **Soft Organic Shadows** and **Tonal Layering** rather than harsh borders or dark shadows.

- **Surface Strategy:** The base background is Cream. Primary cards are White, appearing to float slightly above the surface.
- **Shadow Character:** Shadows are highly diffused (Large blur, low opacity) with a slight hint of the secondary color (Terracotta) in the shadow tint to keep them feeling "warm" rather than gray.
- **Active States:** When a user interacts with a card, it may "lift" (shadow becomes slightly larger and more diffused) or "sink" (shadow disappears and a subtle inset stroke appears), mimicking a soft tactile button.

## Shapes

The shape language is the core of the "friendly" personality.
- **Extreme Rounding:** Standard cards and containers use a **24px radius**.
- **Small Elements:** Buttons and input fields use a **16px radius** (Soft-Pill).
- **Icons:** Icons should be enclosed in rounded-square or circular containers to maintain the "contained" and safe visual theme.
- **Visual Metaphor:** Avoid sharp 90-degree angles anywhere in the interface to reinforce the safety and comfort of the brand.

## Components

### Buttons
Primary buttons are solid Sage Green with white text, featuring a 16px radius. Secondary buttons use a Sage-tinted transparent background with an outline. All buttons utilize a subtle "bounce" transition on hover/active states.

### Cards
White background, 24px corner radius, and a soft "Warm Glow" shadow. Cards should always have a minimum of 24px internal padding to ensure content does not feel cramped.

### Icon-Driven Stat Badges
Used for cat metrics (Weight, Age, Activity). These consist of a soft-colored circular background (Sage or Peach at 15% opacity) with a centered icon and bold text underneath.

### Soft-Pill Status Tags
Pill-shaped badges for status (e.g., "Healthy," "Upcoming Vacine"). These use a high-saturation text color on a very low-saturation version of the same hue (e.g., Deep Green text on Light Green background).

### Input Fields
Inputs feature a subtle cream-tinted background with a 1px border that shifts to Sage Green on focus. Labels are positioned above the field in the `label-md` style.