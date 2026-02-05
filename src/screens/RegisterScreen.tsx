import { useAuthStore } from "@/src/store/auth-store";
import { AVATAR_OPTIONS } from "@/constants/avatars";
import { getErrorMessage, register } from "@/src/api/auth";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DesignSystem } from "@/constants/design-system";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useTranslation } from "@/src/i18n/use-translation";

const {
  radius,
  spacing,
  primaryButton,
  colors: DSColors,
  typography,
} = DesignSystem;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    AVATAR_OPTIONS[0].id,
  );
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const scheme = useColorScheme() ?? "light";
  const c = DSColors[scheme];
  const backgroundColor = useThemeColor({}, "background");
  const primary = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = c.placeholder;

  const handleSubmit = async () => {
    if (!email.trim() || !username.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in email, username, and password");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await register({
        email: email.trim(),
        username: username.trim(),
        password,
        avatarId: selectedAvatarId,
      });
      setAuth(token, user);
      router.replace("/(tabs)");
    } catch (error: unknown) {
      Alert.alert("Registration Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.form}>
          <ThemedText type="title" style={styles.title}>
            {t("auth.createAccountTitle")}
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: c.textMuted,
                borderRadius: radius.input,
              },
            ]}
            placeholder={t("auth.email")}
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
              {
                color: textColor,
                borderColor: c.textMuted,
                borderRadius: radius.input,
              },
            ]}
            placeholder={t("auth.username")}
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
              {
                color: textColor,
                borderColor: c.textMuted,
                borderRadius: radius.input,
              },
            ]}
            placeholder={t("auth.password")}
            placeholderTextColor={placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <ThemedText style={[styles.avatarLabel, { color: textColor }]}>
            {t("auth.chooseAvatar") || "Choose your avatar"}
          </ThemedText>
          <View style={styles.avatarRow}>
            {AVATAR_OPTIONS.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                onPress={() => setSelectedAvatarId(avatar.id)}
                style={[
                  styles.avatarCircle,
                  {
                    borderColor:
                      selectedAvatarId === avatar.id ? primary : c.textMuted,
                  },
                ]}
                disabled={loading}
              >
                <Image
                  source={avatar.image}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>

          <Pressable
            style={[styles.button, { backgroundColor: primary }, primaryButton]}
            onPress={handleSubmit}
            disabled={loading}
            android_ripple={{ color: "rgba(255,255,255,0.3)" }}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.buttonText}>
                {t("auth.createAccountButton")}
              </Text>
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
    justifyContent: "center",
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
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: spacing.md,
    fontSize: typography.bodySize,
  },
  button: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  buttonText: {
    color: "#0F172A",
    fontSize: typography.buttonSize,
    fontWeight: "600",
  },
  avatarLabel: {
    fontSize: typography.bodySize,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  avatarRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
});
