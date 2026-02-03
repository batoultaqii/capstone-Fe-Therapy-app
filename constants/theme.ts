/**
 * Theme colors — aligned with DesignSystem. Used by useThemeColor across the app.
 */

import { Platform } from 'react-native';
import { DesignSystem } from './design-system';

const { colors } = DesignSystem;

export const Colors = {
  light: {
    text: colors.light.text,
    background: colors.light.background,
    tint: colors.light.primary,
    icon: colors.light.textMuted,
    tabIconDefault: colors.light.textMuted,
    tabIconSelected: colors.light.primary,
  },
  dark: {
    text: colors.dark.text,
    background: colors.dark.background,
    tint: colors.dark.primary,
    icon: colors.dark.textMuted,
    tabIconDefault: colors.dark.textMuted,
    tabIconSelected: colors.dark.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
