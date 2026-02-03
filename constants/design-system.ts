/**
 * Unified visual system for the mental health app.
 * Single source of truth for Home, Register, and shared components.
 * Gentle, modern, emotionally safe — one primary, one secondary, neutral text only.
 */

export const DesignSystem = {
  // 1 primary (CTAs, focus), 1 secondary (highlights), 1 background tone
  colors: {
    light: {
      primary: '#2DD4BF',        // teal — Breathe, Register button, focus, one tile, one upcoming
      secondary: '#A7C4B5',      // soft sage — used sparingly for highlights
      background: '#FAFAF8',     // warm off-white
      surface: '#FFFFFF',        // cards, inputs, tiles
      text: '#1F2937',
      textMuted: '#6B7280',
      placeholder: '#9CA3AF',
    },
    dark: {
      primary: '#5EEAD4',
      secondary: '#7A9A8A',
      background: '#1A2424',
      surface: '#243333',
      text: '#F3F4F6',
      textMuted: '#9CA3AF',
      placeholder: '#6B7280',
    },
  },

  // Same radius everywhere for tiles, inputs, cards; pill for primary CTA
  radius: {
    input: 16,
    card: 16,
    tile: 16,
    pill: 999,
    avatar: 999,
  },

  // Spacing rhythm — same on Home and Register
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Typography scale
  typography: {
    titleSize: 26,
    titleLineHeight: 34,
    bodySize: 16,
    bodyLineHeight: 24,
    labelSize: 14,
    microSize: 12,
    buttonSize: 18,
  },

  // Primary button (Breathe / Register) — same everywhere
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    minWidth: 168,
    borderRadius: 999,
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.25,
    elevation: 4,
  },
} as const;
