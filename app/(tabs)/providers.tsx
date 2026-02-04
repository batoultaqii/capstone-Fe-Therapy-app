/**
 * Providers tab — facilitators and co-hosts. Warm cards with mock photo,
 * Female/Male only label, credentials, specialty chips. View bio & sessions.
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
import type { Provider } from '@/src/store/sessions-store';
import { useSessionsStore } from '@/src/store/sessions-store';

const { spacing, radius, shadow } = DesignSystem;

// Display gender: Female or Male only per spec. Others show as "—".
function displayGender(gender: string): string {
  if (gender === 'Female' || gender === 'Male') return gender;
  return '—';
}

function ProviderCard({
  provider,
  onPress,
  colors,
  viewBioLabel,
  volunteerLabel,
  locale,
}: {
  provider: Provider;
  onPress: () => void;
  colors: (typeof DesignSystem.colors)['light'];
  viewBioLabel: string;
  volunteerLabel: string;
  locale: 'en' | 'ar';
}) {
  const initial = provider.name.charAt(0).toUpperCase();
  const degree = locale === 'ar' && provider.degreeAr ? provider.degreeAr : provider.degree;
  const specialization = locale === 'ar' && provider.specializationAr ? provider.specializationAr : provider.specialization;
  const specialties = specialization.split(/[,،\s]+/).map((s) => s.trim()).filter(Boolean);
  const genderLabel = displayGender(provider.gender);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
          opacity: pressed ? 0.92 : 1,
        },
        shadow.card,
      ]}
      onPress={onPress}
      accessibilityLabel={`${provider.name}, ${degree}. View bio and sessions.`}>
      <View style={styles.cardInner}>
        <View style={[styles.avatar, { backgroundColor: colors.mint }]}>
          <ThemedText type="defaultSemiBold" style={[styles.avatarText, { color: colors.primary }]}>
            {initial}
          </ThemedText>
        </View>
        <View style={styles.cardBody}>
          <ThemedText type="defaultSemiBold" style={[styles.name, { color: colors.text }]}>
            {provider.name}
          </ThemedText>
          {genderLabel !== '—' && (
            <ThemedText style={[styles.meta, { color: colors.textMuted }]}>
              {genderLabel}
            </ThemedText>
          )}
          <ThemedText style={[styles.credentials, { color: colors.textMuted }]} numberOfLines={2}>
            {degree}
          </ThemedText>
          <View style={styles.chipRow}>
            {specialties.map((spec) => (
              <View key={spec} style={[styles.chip, { backgroundColor: colors.mint }]}>
                <ThemedText style={[styles.chipText, { color: colors.primary }]} numberOfLines={1}>
                  {spec}
                </ThemedText>
              </View>
            ))}
          </View>
          {provider.volunteerCoHost && (
            <View style={[styles.volunteerBadge, { backgroundColor: colors.mint + '60' }]}>
              <ThemedText style={[styles.volunteerText, { color: colors.textMuted }]}>
                {volunteerLabel}
              </ThemedText>
            </View>
          )}
          <View style={styles.ctaRow}>
            <ThemedText style={[styles.ctaLabel, { color: colors.primary }]}>
              {viewBioLabel}
            </ThemedText>
            <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function ProvidersScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const scheme = useColorScheme() ?? 'light';
  const colors = DesignSystem.colors[scheme];
  const providers = useSessionsStore((s) => s.providers);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.hero, styles.heroShape, { backgroundColor: colors.mint + '40' }]}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          {t('providers.title')}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
          {t('providers.subtitle')}
        </ThemedText>
      </Animated.View>
      {providers.map((p, i) => (
        <Animated.View key={p.id} entering={FadeInDown.duration(400).delay(80 + i * 40)}>
          <ProviderCard
            provider={p}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/provider/${p.id}`);
            }}
            colors={colors}
            viewBioLabel={t('providers.viewBio')}
            volunteerLabel={t('providers.volunteerCoHost')}
            locale={locale}
          />
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
  },
  heroShape: { borderLeftWidth: 4, borderLeftColor: 'transparent' },
  title: { fontSize: 24, lineHeight: 32, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, lineHeight: 21 },
  card: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
  },
  cardInner: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 22 },
  cardBody: { flex: 1 },
  name: { fontSize: 17 },
  meta: { fontSize: 13, marginTop: 2 },
  credentials: { fontSize: 13, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: DesignSystem.radius.chip },
  chipText: { fontSize: 12 },
  volunteerBadge: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, alignSelf: 'flex-start' },
  volunteerText: { fontSize: 12, fontStyle: 'italic' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  ctaLabel: { fontSize: 14, marginRight: 4 },
});
