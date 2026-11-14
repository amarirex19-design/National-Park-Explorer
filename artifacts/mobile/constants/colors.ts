/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#1d352d',
    tint: '#2c5949',

    // Core surfaces
    background: '#f3f0e8',
    foreground: '#1d352d',

    // Cards / elevated surfaces
    card: '#fffdf8',
    cardForeground: '#1d352d',

    // Primary action color (buttons, links, active states)
    primary: '#285746',
    primaryForeground: '#fffdf8',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#e4e9df',
    secondaryForeground: '#35584a',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#e9e5da',
    mutedForeground: '#747d74',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#d4a44e',
    accentForeground: '#1d352d',

    // Destructive actions (delete, error states)
    destructive: '#a95442',
    destructiveForeground: '#fffdf8',

    // Borders and input outlines
    border: '#ded9cc',
    input: '#ded9cc',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 14,
};

export default colors;
