/**
 * Home tab: support groups — warm, alive session cards with enrollment counter.
 * Design: soft gradients, subtle icons, gentle depth. Support, not performance.
 */
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { DesignSystem } from "@/constants/design-system";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/src/i18n/use-translation";
import type { SupportSession } from "@/src/store/sessions-store";
import { useSessionsStore } from "@/src/store/sessions-store";

const { spacing, radius, shadow } = DesignSystem;

/** Match sessions by user input (name, description, provider, availability). Works in EN and AR. */
function suggestSessionsFromInput(
  sessions: SupportSession[],
  input: string,
): SupportSession[] {
  const terms = input.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const searchable = (s: SupportSession) =>
    `${s.name} ${s.description} ${s.providerName} ${s.availability} ${s.language}`.toLowerCase();
  return sessions.filter((s) =>
    terms.some((term) => searchable(s).includes(term)),
  );
}

function EnrollmentCount({
  count,
  enrolledLabel,
  accentColor,
  mutedColor,
  pulse,
}: {
  count: number;
  enrolledLabel: string;
  accentColor: string;
  mutedColor: string;
  pulse: boolean;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (pulse) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 200 }),
      );
    }
  }, [pulse, count]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.enrollmentRow, animatedStyle]}>
      <MaterialIcons
        name="groups"
        size={18}
        color={accentColor}
        style={styles.enrollmentIcon}
      />
      <ThemedText style={[styles.enrollmentText, { color: mutedColor }]}>
        {count} {enrolledLabel}
      </ThemedText>
    </Animated.View>
  );
}

function SessionCard({
  session,
  onPress,
  colors,
  isJustEnrolled,
  enrolledLabel,
  languageLabel,
}: {
  session: SupportSession;
  onPress: () => void;
  colors: (typeof DesignSystem.colors)["light"];
  isJustEnrolled: boolean;
  enrolledLabel: string;
  languageLabel: string;
}) {
  const accent = colors.primary;
  const muted = colors.textMuted;
  const borderColor = colors.border;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor,
          borderLeftWidth: 4,
          borderLeftColor: accent,
          opacity: pressed ? 0.92 : 1,
        },
        shadow.card,
      ]}
      onPress={onPress}
      accessibilityLabel={`${session.name} with ${session.providerName}, ${session.date} ${session.time}, ${session.format}. Tap for details.`}
    >
      <View style={styles.cardHeader}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {session.name}
        </ThemedText>
        <View style={[styles.formatBadge, { backgroundColor: colors.mint }]}>
          <MaterialIcons
            name={session.format === "Online" ? "wifi" : "place"}
            size={14}
            color={accent}
            style={styles.badgeIcon}
          />
          <ThemedText style={[styles.formatText, { color: accent }]}>
            {session.format}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.cardProvider, { color: muted }]}>
        {session.providerName}
      </ThemedText>
      <View style={styles.metaRow}>
        <MaterialIcons name="schedule" size={16} color={muted} />
        <ThemedText style={[styles.cardDateTime, { color: muted }]}>
          {session.date} · {session.time}
        </ThemedText>
      </View>
      <View style={styles.metaRow}>
        <MaterialIcons name="category" size={16} color={muted} />
        <ThemedText style={[styles.cardGroupType, { color: muted }]}>
          {session.availability}
        </ThemedText>
      </View>
      <View style={styles.metaRow}>
        <MaterialIcons name="language" size={16} color={muted} />
        <ThemedText style={[styles.cardGroupType, { color: muted }]}>
          {languageLabel}
        </ThemedText>
      </View>
      <EnrollmentCount
        count={session.enrolledCount}
        enrolledLabel={enrolledLabel}
        accentColor={accent}
        mutedColor={muted}
        pulse={isJustEnrolled}
      />
    </Pressable>
  );
}

export default function HomeSessionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? "light";
  const colors = DesignSystem.colors[scheme];
  const sessions = useSessionsStore((s) => s.sessions);
  const lastEnrolledId = useSessionsStore((s) => s.lastEnrolledId);
  const clearLastEnrolledId = useSessionsStore((s) => s.clearLastEnrolledId);
  const [query, setQuery] = useState("");
  const [therabotModalOpen, setTherabotModalOpen] = useState(false);
  const [therabotInput, setTherabotInput] = useState("");
  const [therabotSuggestions, setTherabotSuggestions] = useState<
    SupportSession[]
  >([]);
  const [therabotHasSearched, setTherabotHasSearched] = useState(false);

  useEffect(() => {
    if (!lastEnrolledId) return;
    const t = setTimeout(clearLastEnrolledId, 2500);
    return () => clearTimeout(t);
  }, [lastEnrolledId, clearLastEnrolledId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.providerName.toLowerCase().includes(q),
    );
  }, [sessions, query]);

  const openSession = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/session/${id}`);
    },
    [router],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[
            styles.hero,
            styles.heroShape,
            { backgroundColor: colors.mint + "40" },
          ]}
        >
          <ThemedText
            type="title"
            style={[styles.title, { color: colors.text }]}
          >
            {t("home.title")}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
            {t("home.subtitle")}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(80)}
          style={[
            styles.searchWrap,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            shadow.card,
          ]}
        >
          <MaterialIcons
            name="search"
            size={22}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search sessions by name or provider"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(120)}
          style={styles.list}
        >
          {filtered.length === 0 ? (
            <ThemedText style={[styles.empty, { color: colors.textMuted }]}>
              {t("home.empty")}
            </ThemedText>
          ) : (
            filtered.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => openSession(session.id)}
                colors={colors}
                isJustEnrolled={lastEnrolledId === session.id}
                enrolledLabel={
                  session.enrolledCount === 1
                    ? t("home.enrolledOne")
                    : t("home.enrolled")
                }
                languageLabel={t(
                  `session.language.${session.language.toLowerCase()}`,
                )}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>

      <Pressable
        style={[
          styles.aiFab,
          { backgroundColor: colors.primary },
          shadow.cardWarm,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTherabotModalOpen(true);
          setTherabotSuggestions([]);
          setTherabotInput("");
          setTherabotHasSearched(false);
        }}
        accessibilityLabel={`${t("therabot.title")}. Find sessions based on how you're feeling.`}
      >
        <MaterialIcons name="psychology" size={26} color="#FFF" />
      </Pressable>

      <Modal visible={therabotModalOpen} transparent animationType="fade">
        <Pressable
          style={styles.aiOverlay}
          onPress={() => setTherabotModalOpen(false)}
        >
          <Pressable
            style={[
              styles.aiCard,
              { backgroundColor: colors.surface },
              shadow.card,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[styles.aiTitle, { color: colors.text }]}
            >
              {t("therabot.title")}
            </ThemedText>
            <ThemedText style={[styles.aiBody, { color: colors.textMuted }]}>
              {t("therabot.prompt")}
            </ThemedText>
            <TextInput
              style={[
                styles.therabotInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder={t("therabot.placeholder")}
              placeholderTextColor={colors.placeholder}
              value={therabotInput}
              onChangeText={setTherabotInput}
              multiline
              accessibilityLabel="Describe how you feel or what you're looking for"
            />
            <Pressable
              style={[
                styles.therabotSuggestBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTherabotHasSearched(true);
                const suggested = therabotInput.trim()
                  ? suggestSessionsFromInput(sessions, therabotInput)
                  : sessions.slice(0, 3);
                setTherabotSuggestions(suggested);
              }}
            >
              <ThemedText style={styles.therabotSuggestBtnLabel}>
                {t("therabot.suggest")}
              </ThemedText>
            </Pressable>
            {therabotSuggestions.length > 0 ? (
              <>
                <ThemedText
                  style={[
                    styles.therabotSuggestionsLabel,
                    { color: colors.textMuted },
                  ]}
                >
                  {t("therabot.suggestionsFor")}
                </ThemedText>
                <View style={styles.aiSuggestions}>
                  {therabotSuggestions.map((s) => (
                    <Pressable
                      key={s.id}
                      style={[
                        styles.aiSuggestionChip,
                        { borderColor: colors.primary },
                      ]}
                      onPress={() => {
                        setTherabotModalOpen(false);
                        openSession(s.id);
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.aiSuggestionText,
                          { color: colors.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {s.name}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : therabotHasSearched && therabotSuggestions.length === 0 ? (
              <ThemedText
                style={[styles.therabotNoResults, { color: colors.textMuted }]}
              >
                {t("therabot.noResults")}
              </ThemedText>
            ) : null}
            <Pressable
              style={[styles.aiClose, { borderColor: colors.border }]}
              onPress={() => setTherabotModalOpen(false)}
            >
              <ThemedText
                style={[styles.aiCloseLabel, { color: colors.textMuted }]}
              >
                {t("therabot.close")}
              </ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  hero: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
  },
  heroShape: { borderLeftWidth: 4, borderLeftColor: "transparent" },
  title: { fontSize: 24, lineHeight: 32, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, lineHeight: 21 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.card,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 48,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 12 },
  list: { gap: spacing.md },
  card: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardTitle: { flex: 1, fontSize: 16 },
  formatBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DesignSystem.radius.chip,
  },
  badgeIcon: { marginRight: 4 },
  formatText: { fontSize: 12, fontWeight: "600" },
  cardProvider: { fontSize: 13, marginTop: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardDateTime: { fontSize: 13, marginLeft: 6 },
  cardGroupType: { fontSize: 13, marginLeft: 6 },
  enrollmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  enrollmentIcon: { marginRight: 6 },
  enrollmentText: { fontSize: 13 },
  empty: { fontSize: 14, textAlign: "center", marginTop: spacing.lg },
  aiFab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  aiOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  aiCard: { borderRadius: radius.card, padding: spacing.lg },
  aiTitle: { fontSize: 18, marginBottom: spacing.sm },
  aiBody: { fontSize: 14, lineHeight: 22, marginBottom: spacing.md },
  therabotInput: {
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    minHeight: 44,
    marginBottom: spacing.sm,
  },
  therabotSuggestBtn: {
    paddingVertical: 12,
    borderRadius: radius.card,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  therabotSuggestBtnLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  therabotSuggestionsLabel: { fontSize: 13, marginBottom: spacing.xs },
  therabotNoResults: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  aiSuggestions: { gap: spacing.sm, marginBottom: spacing.md },
  aiSuggestionChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiSuggestionText: { fontSize: 14 },
  aiClose: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
  },
  aiCloseLabel: { fontSize: 14 },
});
