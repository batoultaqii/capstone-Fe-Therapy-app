import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, editable = true, ...props }: InputProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({ light: '#008080', dark: '#90EE90' }, 'tint');
  const errorColor = '#dc3545';

  return (
    <View style={styles.wrapper}>
      {label ? (
        <ThemedText style={styles.label}>{label}</ThemedText>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            borderColor: error ? errorColor : tintColor,
            opacity: editable ? 1 : 0.6,
          },
          style,
        ]}
        placeholderTextColor="#687076"
        editable={editable}
        {...props}
      />
      {error ? (
        <Text style={[styles.error, { color: errorColor }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
  },
});
