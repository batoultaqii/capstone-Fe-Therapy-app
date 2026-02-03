import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const tintColor = useThemeColor({ light: '#008080', dark: '#90EE90' }, 'tint');
  const backgroundColor = variant === 'primary' ? tintColor : 'transparent';
  const borderColor = variant === 'secondary' ? tintColor : 'transparent';

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      disabled={disabled || loading}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : tintColor} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: variant === 'primary' ? '#fff' : tintColor },
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
