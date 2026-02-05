/**
 * Unified visual system for iBelong — clean, modern, supportive.
 * Muted green accents, light backgrounds, soft depth. Matches reference design.
 */

export const DesignSystem = {
  // iBelong palette: muted green, light grey/white, soft card tints.
  colors: {
    light: {
      primary: '#7EAC7E',           // earthy green — CTAs, active tab
      primaryDark: '#2E473D',       // dark green — headings, emphasis
      secondary: '#A7C4B5',         // soft sage — highlights
      mint: '#E8F5E9',              // light mint — tab active bg, profile accent
      background: '#F8F8F8',        // light grey background
      surface: '#FFFFFF',           // cards — white
      surfaceElevated: '#FFFFFF',   // elevated surfaces
      text: '#333333',
      textMuted: '#666666',
      placeholder: '#9C9590',
      streakGold: '#FCE08F',        // star / points accent
      // Home card tints
      streakBg: '#FEE8ED',
      streakCircle: '#F9D3D8',
      pointsBg: '#FFF8DD',
      pointsCircle: '#FCE08F',
      therabotBg: '#E8EBFD',
      therabotIcon: '#4266D0',
      // Profile / chart
      chartPink: '#F2DCE5',
      chartGreen: '#A9D1A9',
      // Secondary button
      buttonSecondary: '#F0F0F0',
      border: 'rgba(46, 71, 61, 0.12)',
      borderLight: '#E0E0E0',
      shadow: 'rgba(0, 0, 0, 0.06)',
    },
    dark: {
      primary: '#7EAC7E',
      primaryDark: '#5EEAD4',
      secondary: '#7A9A8A',
      mint: '#2D4A44',
      background: '#1A2424',
      surface: '#243333',
      surfaceElevated: '#2A3D3D',
      text: '#F3F4F6',
      textMuted: '#9CA3AF',
      placeholder: '#6B7280',
      streakGold: '#FCE08F',
      streakBg: '#3D2A2E',
      streakCircle: '#5C3A40',
      pointsBg: '#3D3A2A',
      pointsCircle: '#5C5430',
      therabotBg: '#2A2A3D',
      therabotIcon: '#7B8FD4',
      chartPink: '#5C4A52',
      chartGreen: '#3D5C3D',
      buttonSecondary: '#3D3D3D',
      border: 'rgba(94, 234, 212, 0.15)',
      borderLight: '#3D3D3D',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },

  // Rounded corners — 12–16px per reference
  radius: {
    input: 14,
    card: 14,
    tile: 14,
    pill: 999,
    avatar: 999,
    chip: 12,
  },

  // Soft depth — light shadow for cards
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardWarm: {
      shadowColor: '#2E473D',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
  },

  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    titleSize: 26,
    titleLineHeight: 34,
    bodySize: 16,
    bodyLineHeight: 24,
    labelSize: 14,
    microSize: 12,
    buttonSize: 18,
  },

  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    minWidth: 168,
    borderRadius: 999,
    shadowColor: '#7EAC7E',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.2,
    elevation: 4,
  },
} as const;
