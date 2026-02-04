/**
 * Unified visual system for Togetherness — warm, human, reassuring.
 * Warm teal/sage/mint, cream backgrounds, soft depth. Support, not performance.
 */

export const DesignSystem = {
  // Warm palette: teal/sage/mint, cream off-white. No pure white or harsh grays.
  colors: {
    light: {
      primary: '#2BA99B',           // warm teal — CTAs, accents
      secondary: '#A7C4B5',         // soft sage — highlights
      mint: '#B8E0D8',              // soft mint — subtle fills
      background: '#F5F3F0',        // cream / warm off-white
      surface: '#FDFCFA',           // cards — warm white
      surfaceElevated: '#FFFFFF',   // slightly brighter for elevation
      text: '#2C2A26',
      textMuted: '#6B6560',
      placeholder: '#9C9590',
      streakGold: '#C9A227',        // soft gold for streak badge
      border: 'rgba(43, 169, 155, 0.12)',
      shadow: 'rgba(0, 0, 0, 0.06)',
    },
    dark: {
      primary: '#5EEAD4',
      secondary: '#7A9A8A',
      mint: '#2D4A44',
      background: '#1A2424',
      surface: '#243333',
      surfaceElevated: '#2A3D3D',
      text: '#F3F4F6',
      textMuted: '#9CA3AF',
      placeholder: '#6B7280',
      streakGold: '#E5C65C',
      border: 'rgba(94, 234, 212, 0.15)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },

  // Gentle rounded — friendly, not sharp
  radius: {
    input: 16,
    card: 20,
    tile: 20,
    pill: 999,
    avatar: 999,
    chip: 12,
  },

  // Soft depth — cards elevated, calm
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    cardWarm: {
      shadowColor: '#2BA99B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 3,
    },
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
