/**
 * Profile tab — warm, encouraging. Streak only after 5 sessions.
 * Language setting: change app language anytime; does not affect account or data.
 */
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { DesignSystem } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/src/i18n/use-translation';
import { useAuthStore } from '@/src/store/auth-store';
import { useLocaleStore, type Locale } from '@/src/store/locale-store';
import { useSessionsStore } from '@/src/store/sessions-store';

const { spacing, radius, shadow } = DesignSystem;
const STREAK_THRESHOLD = 5;

export default function ProfileScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const scheme = useColorScheme() ?? 'light';
  const colors = DesignSystem.colors[scheme];
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const sessions = useSessionsStore((s) => s.sessions);
  const enrolledIds = useSessionsStore((s) => s.enrolledIds);

  const handleSetLocale = (next: Locale) => {
    if (next === locale) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocale(next);
  };

  const enrolledSessions = sessions.filter((s) => enrolledIds.has(s.id));
  const sessionsAttendedCount = 0; // placeholder: would come from backend
  const commitmentWeeks = 2; // placeholder: "2 weeks of connection"
  const showStreak = sessionsAttendedCount >= STREAK_THRESHOLD;
  const streakCount = sessionsAttendedCount; // e.g. "5-session streak"

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearAuth();
    router.replace('/welcome');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="person" size={24} color={colors.primary} />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>{t('profile.youAreHere')}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={[styles.value, { color: colors.text }]}>
          {user?.username ?? '—'}
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(400).delay(80)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="event-available" size={24} color={colors.primary} />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>{t('profile.sessionsAttended')}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={[styles.value, { color: colors.text }]}>
          {sessionsAttendedCount}
        </ThemedText>
        <ThemedText style={[styles.hint, { color: colors.textMuted }]}>{t('profile.sessionsAttendedHint')}</ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(400).delay(120)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="favorite" size={24} color={colors.primary} />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>{t('profile.commitment')}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={[styles.value, { color: colors.text }]}>
          {commitmentWeeks === 2 ? t('profile.twoWeeksOfConnection') : `${commitmentWeeks} ${t('profile.weeksOfConnection')}`}
        </ThemedText>
        <ThemedText style={[styles.hint, { color: colors.textMuted }]}>{t('profile.commitmentHint')}</ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(400).delay(160)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="local-fire-department" size={24} color={showStreak ? colors.streakGold : colors.textMuted} />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>{t('profile.streak')}</ThemedText>
        </View>
        {showStreak ? (
          <View style={[styles.streakBadge, { backgroundColor: colors.mint }]}>
            <ThemedText type="defaultSemiBold" style={[styles.streakText, { color: colors.streakGold }]}>
              🔥 {streakCount}-session streak
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText style={[styles.journeyText, { color: colors.text }]}>{t('profile.journeyBuilding')}</ThemedText>
            <ThemedText style={[styles.hint, { color: colors.textMuted }]}>{t('profile.streakUnlock')}</ThemedText>
          </>
        )}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="calendar-today" size={24} color={colors.primary} />
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>{t('profile.upcomingSessions')}</ThemedText>
        </View>
        {enrolledSessions.length === 0 ? (
          <ThemedText style={[styles.hint, { color: colors.textMuted }]}>{t('profile.noUpcoming')}</ThemedText>
        ) : (
          enrolledSessions.map((s) => (
            <ThemedText key={s.id} style={[styles.sessionRow, { color: colors.text }]}>
              {s.name} · {s.date} {s.time}
            </ThemedText>
          ))
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(220)}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="language" size={24} color={colors.primary} />
            <ThemedText style={[styles.label, { color: colors.textMuted }]}>{t('profile.language')}</ThemedText>
          </View>
          <ThemedText style={[styles.hint, { color: colors.textMuted }]}>{t('profile.languageHint')}</ThemedText>
          <View style={styles.languageRow}>
            <Pressable
              onPress={() => handleSetLocale('en')}
              style={[styles.languageChip, locale === 'en' && { backgroundColor: colors.mint }]}>
              <ThemedText style={[styles.languageChipText, { color: locale === 'en' ? colors.primary : colors.textMuted }]}>
                EN
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleSetLocale('ar')}
              style={[styles.languageChip, locale === 'ar' && { backgroundColor: colors.mint }]}>
              <ThemedText style={[styles.languageChipTextAr, { color: locale === 'ar' ? colors.primary : colors.textMuted }]}>
                عربي
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <Pressable
        style={[styles.signOut, { borderColor: colors.border }]}
        onPress={handleSignOut}
        accessibilityLabel={t('profile.signOut')}>
        <ThemedText style={[styles.signOutLabel, { color: colors.textMuted }]}>{t('profile.signOut')}</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  label: { fontSize: 12 },
  value: { fontSize: 18 },
  hint: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  journeyText: { fontSize: 16, lineHeight: 24 },
  streakBadge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.chip, alignSelf: 'flex-start' },
  streakText: { fontSize: 16 },
  sessionRow: { fontSize: 14, marginTop: 4 },
  signOut: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  signOutLabel: { fontSize: 15 },
  languageRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  languageChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: DesignSystem.radius.chip },
  languageChipText: { fontSize: 14 },
  languageChipTextAr: { fontSize: 14 },
});
