import { useAuthStore } from '@/src/store/auth-store';
import { getErrorMessage, login } from '@/src/api/auth';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/src/i18n/use-translation';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const backgroundColor = useThemeColor({}, 'background');

  const handleSubmit = async () => {
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both username and password');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await login({ username: username.trim(), password });
      setAuth(token, user);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.form}>
        <ThemedText type="title" style={styles.title}>
          {t('auth.loginTitle')}
        </ThemedText>

        <Input
          placeholder={t('auth.username')}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Input
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <Button
          title={t('auth.login')}
          onPress={handleSubmit}
          loading={loading}
        />

        <Link href="/register" asChild>
          <Pressable style={styles.registerLink}>
            <ThemedText type="link">{t('auth.noAccountRegister')}</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    gap: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 8,
  },
});
