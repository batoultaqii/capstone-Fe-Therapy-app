/**
 * Unified tile icons — one family (MaterialIcons), rounded/minimal, metaphor-based clarity.
 * Slow down = breathing circle, Unload = open container, Notice = eye, Be held = connection.
 */

import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleProp, ViewStyle } from 'react-native';

export type TileIconName = 'slow' | 'unload' | 'notice' | 'held';

const ICON_NAMES: Record<TileIconName, ComponentProps<typeof MaterialIcons>['name']> = {
  slow: 'radio-button-unchecked',   // breathing circle / expanding ring
  unload: 'archive',                 // open container
  notice: 'visibility',              // eye
  held: 'people',                    // connection / held
};

interface TileIconProps {
  name: TileIconName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}

export function TileIcon({ name, size = 26, color, style }: TileIconProps) {
  return (
    <MaterialIcons
      name={ICON_NAMES[name]}
      size={size}
      color={color}
      style={[{ marginBottom: 8 }, style]}
    />
  );
}
