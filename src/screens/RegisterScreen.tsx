import { useAuthStore } from '@/src/store/auth-store';
import { getErrorMessage, register } from '@/src/api/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DesignSystem } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/src/i18n/use-translation';

const { radius, spacing, primaryButton, colors: DSColors, typography } = DesignSystem;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const scheme = useColorScheme() ?? 'light';
  const c = DSColors[scheme];
  const backgroundColor = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = c.placeholder;

  const handleSubmit = async () => {
    if (!email.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in email, username, and password');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await register({
        email: email.trim(),
        username: username.trim(),
        password,
      });
      setAuth(token, user);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      Alert.alert('Registration Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.form}>
          <ThemedText type="title" style={styles.title}>
            {t('auth.createAccountTitle')}
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              { color: textColor, borderColor: c.textMuted, borderRadius: radius.input },
            ]}
            placeholder={t('auth.email')}
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            style={[
              styles.input,
              { color: textColor, borderColor: c.textMuted, borderRadius: radius.input },
            ]}
            placeholder={t('auth.username')}
            placeholderTextColor={placeholderColor}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            style={[
              styles.input,
              { color: textColor, borderColor: c.textMuted, borderRadius: radius.input },
            ]}
            placeholder={t('auth.password')}
            placeholderTextColor={placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <Pressable
            style={[styles.button, { backgroundColor: primary }, primaryButton]}
            onPress={handleSubmit}
            disabled={loading}
            android_ripple={{ color: 'rgba(255,255,255,0.3)' }}>
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.createAccountButton')}</Text>
            )}
          </Pressable>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.titleSize,
    lineHeight: typography.titleLineHeight,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: spacing.md,
    fontSize: typography.bodySize,
  },
  button: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: typography.buttonSize,
    fontWeight: '600',
  },
});
