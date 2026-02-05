import { useLocalSearchParams, useRouter } from "expo-router";

import * as Haptics from "expo-haptics";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { DesignSystem } from "@/constants/design-system";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/src/i18n/use-translation";

const { spacing, radius, shadow } = DesignSystem;

export default function EnrollmentConfirmationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { sessionName, sessionFormat } = useLocalSearchParams<{
    sessionName?: string;
    sessionFormat?: string;
  }>();
  const isOnline = sessionFormat === "Online";
  const scheme = useColorScheme() ?? "light";
  const colors = DesignSystem.colors[scheme];

  const handleOk = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          {t("enrollment.title")}
        </ThemedText>
        <ThemedText style={[styles.message, { color: colors.textMuted }]}>
          {t("enrollment.message")}
          {sessionName
            ? ` ${t("enrollment.signedUpFor").replace("{sessionName}", sessionName)}`
            : ""}
        </ThemedText>
        {isOnline && (
          <Pressable
            style={[styles.zoomLinkWrap, { marginTop: spacing.md }]}
            onPress={() => Linking.openURL(t("enrollment.zoomLink"))}
            accessibilityLabel={t("enrollment.zoomLinkLabel")}
          >
            <ThemedText
              style={[styles.zoomLinkText, { color: colors.primary }]}
            >
              {t("enrollment.zoomLinkLabel")}
            </ThemedText>
          </Pressable>
        )}
      </View>
      <Pressable
        style={[styles.okBtn, { backgroundColor: colors.primary }]}
        onPress={handleOk}
        accessibilityLabel="Back to Home"
      >
        <ThemedText style={styles.okBtnLabel}>{t("enrollment.ok")}</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xl,
    maxWidth: 340,
  },
  title: { fontSize: 22, textAlign: "center", marginBottom: spacing.md },
  message: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  zoomLinkWrap: { alignSelf: "center" },
  zoomLinkText: { fontSize: 15, textDecorationLine: "underline" },
  okBtn: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 999,
  },
  okBtnLabel: { fontSize: 16, fontWeight: "600", color: "#0F172A" },
});
