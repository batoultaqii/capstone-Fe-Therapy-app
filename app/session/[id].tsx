import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { DesignSystem } from "@/constants/design-system";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/src/i18n/use-translation";
import { useSessionsStore } from "@/src/store/sessions-store";

const { spacing, radius, shadow } = DesignSystem;

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? "light";
  const colors = DesignSystem.colors[scheme];
  const getSession = useSessionsStore((s) => s.getSession);
  const enroll = useSessionsStore((s) => s.enroll);
  const session = id ? getSession(id) : null;

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.muted, { color: colors.textMuted }]}>
          Session not found.
        </ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={{ color: colors.primary }}>Back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const isFull = session.enrolledCount >= session.maxParticipants;
  const status = isFull ? "Fully booked" : "Available";

  const handleEnroll = () => {
    if (isFull) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ok = enroll(session.id);
    if (ok) {
      router.replace({
        pathname: "/enrollment-confirmation",
        params: { sessionName: session.name, sessionFormat: session.format },
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          {session.name}
        </ThemedText>
        <ThemedText style={[styles.provider, { color: colors.textMuted }]}>
          {session.providerName}
        </ThemedText>
      </View>

      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <View style={styles.blockRow}>
          <MaterialIcons name="schedule" size={20} color={colors.primary} />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>
            Date & time
          </ThemedText>
        </View>
        <ThemedText style={[styles.value, { color: colors.text }]}>
          {session.date} · {session.time}
        </ThemedText>
        <ThemedText style={[styles.valueSmall, { color: colors.textMuted }]}>
          {session.durationMinutes} min
        </ThemedText>
      </View>

      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <View style={styles.blockRow}>
          <MaterialIcons
            name={session.format === "Online" ? "wifi" : "place"}
            size={20}
            color={colors.primary}
          />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>
            Format
          </ThemedText>
        </View>
        <ThemedText style={[styles.value, { color: colors.text }]}>
          {session.format}
        </ThemedText>
      </View>

      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <View style={styles.blockRow}>
          <MaterialIcons name="language" size={20} color={colors.primary} />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>
            {t("session.language")}
          </ThemedText>
        </View>
        <ThemedText style={[styles.value, { color: colors.text }]}>
          {t(`session.language.${session.language.toLowerCase()}`)}
        </ThemedText>
      </View>

      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <ThemedText style={[styles.label, { color: colors.textMuted }]}>
          About this session
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.text }]}>
          {session.description}
        </ThemedText>
      </View>

      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <View style={styles.blockRow}>
          <MaterialIcons name="groups" size={20} color={colors.primary} />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>
            Enrollment
          </ThemedText>
        </View>
        <ThemedText style={[styles.value, { color: colors.text }]}>
          {session.availability}
        </ThemedText>
        <ThemedText style={[styles.valueSmall, { color: colors.textMuted }]}>
          {session.enrolledCount} of {session.maxParticipants} enrolled
        </ThemedText>
      </View>

      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <ThemedText style={[styles.label, { color: colors.textMuted }]}>
          Status
        </ThemedText>
        <ThemedText
          style={[
            styles.status,
            { color: colors.text },
            isFull && styles.statusFull,
          ]}
        >
          {status}
        </ThemedText>
      </View>

      <Pressable
        style={[
          styles.enrollBtn,
          { backgroundColor: colors.primary },
          isFull && styles.enrollBtnDisabled,
        ]}
        onPress={handleEnroll}
        disabled={isFull}
        accessibilityLabel={
          isFull ? "Session fully booked" : "Enroll in this session"
        }
      >
        <ThemedText style={styles.enrollBtnLabel}>
          {isFull ? "Fully booked" : "Enroll"}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  block: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: { fontSize: 22, lineHeight: 30 },
  provider: { fontSize: 15, marginTop: 4 },
  label: { fontSize: 12 },
  value: { fontSize: 16 },
  valueSmall: { fontSize: 13, marginTop: 2 },
  description: { fontSize: 15, lineHeight: 22 },
  status: { fontSize: 16, fontWeight: "600" },
  statusFull: { opacity: 0.7 },
  enrollBtn: {
    marginTop: spacing.md,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  enrollBtnDisabled: { opacity: 0.6 },
  enrollBtnLabel: { fontSize: 16, fontWeight: "600", color: "#0F172A" },
  muted: { fontSize: 14 },
});
