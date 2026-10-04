# Candidex UI Design System

This document outlines the design system, architecture, and styling patterns used across the Candidex frontend.

## Overview

Candidex utilizes a sleek, modern, and highly interactive aesthetic. It operates with a fully custom-built design system via Vanilla CSS in `globals.css` combined with atomic Tailwind utility classes for layout components, avoiding generic out-of-the-box UI framework limitations. 

The application strictly supports a seamless Light and Dark mode toggle to accommodate user preferences.

## 1. Typography

We rely on Google's **Inter** font family to provide clean, legible, and modern typography.

- **Primary Font:** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- **Font Weights:**
  - Light (300) - For subtle helper texts.
  - Regular (400) - For standard body text.
  - Medium (500) - For interactive elements (buttons, nav links).
  - Semibold (600) - For section headers and active states.
  - Extra Bold (800) / Black (900) - For large Hero titles and prominent numbers.

## 2. Color Palette (CSS Variables)

Our colors are strictly defined via CSS Custom Properties (`--bg-primary`, `--accent-primary`, etc.) in `globals.css`. This enables instant and seamless theme switching.

### Light Mode (`:root`)
- **Backgrounds:** Crisp slate gradients and solid white cards.
  - `--bg-primary`: `#f8fafc` (Slate 50)
  - `--bg-secondary`: `#f1f5f9` (Slate 100)
  - `--bg-tertiary`: `#ffffff` (White)
  - `--bg-card`: `rgba(255, 255, 255, 0.9)` (Frosted White)
- **Accents:** Vibrant and contrasting colors.
  - `--accent-primary`: `#00b38f` (Dark Cyan)
  - `--accent-secondary`: `#0284c7` (Sky Blue)
  - `--text-primary`: `#0f172a` (Deep Slate)

### Dark Mode (`.dark`)
- **Backgrounds:** Deep, immersive zinc and sleek dark blue tints.
  - `--bg-primary`: `#09090b` (Deepest black)
  - `--bg-secondary`: `#13111c` (Dark charcoal)
  - `--bg-tertiary`: `#1c1a27` (Elevated surfaces)
  - `--bg-card`: `rgba(28, 26, 39, 0.7)` (Frosted Dark)
- **Accents:** Electric neon highlights for visibility.
  - `--accent-primary`: `#00d4aa` (Neon Emerald/Cyan)
  - `--accent-secondary`: `#0ea5e9` (Neon Blue)
  - `--text-primary`: `#f8fafc` (Off-white)

## 3. Theming & Aesthetics

We prioritize a "poppy" but professional look. We deliberately avoid AI-generated "random gradients" and excessive noise, focusing on solid, contrasting colors with structural depth.

- **Glows & Shadows:** Used strategically to indicate interactivity and elevation.
  - Hovering over buttons triggers `var(--shadow-glow)`.
  - Cards float up (`translateY(-1px)`) and gain subtle border highlights on hover.
- **Glassmorphism:** Navigation bars and static cards use `backdrop-filter: blur(20px)` combined with semi-transparent background colors (`rgba`) to create a frosted glass effect that adapts dynamically to the background.
- **Progress Bars:** Tracks utilize `var(--border-subtle)` ensuring they are visible against card backgrounds in *both* Light and Dark themes, while the fill colors rely on specific semantic matching scales (High: Green, Medium: Orange, Low: Red).

## 4. Reusable Component Styles

Rather than relying entirely on sprawling inline Tailwind classes, major UI components are abstracted into CSS classes within `globals.css` to maintain clean JSX files:

### Buttons
- `.btn`: Base structural styling (padding, flex alignment, transition speeds).
- `.btn-primary`: Uses the primary accent color with a subtle box-shadow glow.
- `.btn-secondary`: A glassmorphic card-like button.
- `.btn-ghost`: Transparent background with border highlighting on hover.

### Cards
- `.card`: Base structural card with borders, padding, and hover transitions.
- `.card-glass`: Similar to `.card` but relies heavily on blur effects for overlapping elements.

### AI Claim Cards & Interview Questions
- `.claim-card`: Used in candidate details to flag discrepancies. Features a left-border color-coded by severity (`.high`, `.medium`).
- `.question-item`: Distinct rows for auto-generated AI interview questions.
- `.question-number`: A perfect circle containing the list number, matching the primary accent color theme.

## 5. Layout and Responsiveness

- **Container:** `.container` sets a strict `max-width: 1280px` with horizontal padding.
- **Media Queries:** Found at the bottom of `globals.css` (e.g., `@media (max-width: 768px)`).
  - Navigation links hide or adapt into mobile-friendly views.
  - Grids (`grid-template-columns: repeat(...)`) seamlessly stack into single columns.
  - Progress bars and statistics cards shrink margins to fit mobile viewports.

## 6. Iconography

All icons are rendered natively via SVG paths directly in the components (or standard emoji characters for rapid prototyping) to keep the bundle size small and entirely independent of external icon libraries. SVG colors always inherit via `stroke="currentColor"` or are explicitly mapped to `--accent-primary`.
