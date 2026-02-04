import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignSystem } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/src/i18n/use-translation';
import { useSessionsStore } from '@/src/store/sessions-store';

const { spacing, radius, shadow } = DesignSystem;

function displayGender(gender: string): string {
  if (gender === 'Female' || gender === 'Male') return gender;
  return '—';
}

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const scheme = useColorScheme() ?? 'light';
  const colors = DesignSystem.colors[scheme];
  const getProvider = useSessionsStore((s) => s.getProvider);
  const getSession = useSessionsStore((s) => s.getSession);
  const provider = id ? getProvider(id) : null;

  if (!provider) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.muted, { color: colors.textMuted }]}>Provider not found.</ThemedText>
      </View>
    );
  }

  const sessions = provider.sessionIds
    .map((sid) => getSession(sid))
    .filter(Boolean);
  const genderLabel = displayGender(provider.gender);
  const initial = provider.name.charAt(0).toUpperCase();
  const degree = locale === 'ar' && provider.degreeAr ? provider.degreeAr : provider.degree;
  const specialization = locale === 'ar' && provider.specializationAr ? provider.specializationAr : provider.specialization;
  const bio = locale === 'ar' && provider.bioAr ? provider.bioAr : provider.bio;
  const specialties = specialization.split(/[,،\s]+/).map((s) => s.trim()).filter(Boolean);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
        <View style={styles.providerHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.mint }]}>
            <ThemedText type="defaultSemiBold" style={[styles.avatarText, { color: colors.primary }]}>
              {initial}
            </ThemedText>
          </View>
          <View style={styles.headerBody}>
            <ThemedText type="title" style={[styles.name, { color: colors.text }]}>{provider.name}</ThemedText>
            {genderLabel !== '—' && (
              <ThemedText style={[styles.meta, { color: colors.textMuted }]}>{genderLabel}</ThemedText>
            )}
            <ThemedText style={[styles.meta, { color: colors.textMuted }]}>{degree}</ThemedText>
            <View style={styles.chipRow}>
              {specialties.map((spec) => (
                <View key={spec} style={[styles.chip, { backgroundColor: colors.mint }]}>
                  <ThemedText style={[styles.chipText, { color: colors.primary }]}>{spec}</ThemedText>
                </View>
              ))}
            </View>
            {provider.volunteerCoHost && (
              <ThemedText style={[styles.volunteer, { color: colors.textMuted }]}>{t('providers.volunteerCoHost')}</ThemedText>
            )}
          </View>
        </View>
      </View>
      <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
        <ThemedText style={[styles.label, { color: colors.textMuted }]}>{t('providers.bio')}</ThemedText>
        <ThemedText style={[styles.bio, { color: colors.text }]}>{bio}</ThemedText>
      </View>
      <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }, shadow.card]}>
        <ThemedText style={[styles.label, { color: colors.textMuted }]}>{t('providers.sessionsTheyHost')}</ThemedText>
        {sessions.map((s) => (
          <ThemedText key={s!.id} style={[styles.sessionName, { color: colors.text }]}>
            {s!.name} · {s!.date} {s!.time}
          </ThemedText>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  block: { padding: spacing.md, borderRadius: radius.card, borderWidth: 1, marginBottom: spacing.md },
  providerHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 22 },
  headerBody: { flex: 1 },
  name: { fontSize: 22 },
  meta: { fontSize: 14, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: DesignSystem.radius.chip },
  chipText: { fontSize: 12 },
  volunteer: { fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  label: { fontSize: 12, marginBottom: 6 },
  bio: { fontSize: 15, lineHeight: 22 },
  sessionName: { fontSize: 14, marginTop: 4 },
  muted: { fontSize: 14 },
});
