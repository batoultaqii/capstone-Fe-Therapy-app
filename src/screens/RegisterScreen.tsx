import { useAuthStore } from '@/src/store/auth-store';
import { getErrorMessage, register } from '@/src/api/auth';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
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
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DesignSystem } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const { radius, spacing, primaryButton, colors: DSColors, typography } = DesignSystem;

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const scheme = useColorScheme() ?? 'light';
  const c = DSColors[scheme];
  const backgroundColor = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = c.placeholder;

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to add a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in both username and password');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await register({
        username: username.trim(),
        password,
        avatarUri: avatarUri ?? undefined,
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
            Create your account
          </ThemedText>

          <View style={styles.avatarSection}>
            <Pressable
              style={[styles.avatarButton, { borderColor: primary }]}
              onPress={pickAvatar}
              disabled={loading}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <ThemedText style={styles.avatarPlaceholder}>+</ThemedText>
              )}
            </Pressable>
            <Pressable onPress={pickAvatar} disabled={loading}>
              <ThemedText type="link" style={[styles.avatarLabel, { color: primary }]}>
                Add a photo
              </ThemedText>
            </Pressable>
          </View>

          <TextInput
            style={[
              styles.input,
              { color: textColor, borderColor: c.textMuted, borderRadius: radius.input },
            ]}
            placeholder="Username"
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
            placeholder="Password"
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
              <Text style={styles.buttonText}>Create account</Text>
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
  avatarSection: {
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  avatarButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontSize: 32,
    opacity: 0.5,
  },
  avatarLabel: {
    fontSize: typography.labelSize,
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
