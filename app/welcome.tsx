/**
 * Welcome — entry to Togetherness. Calm, inclusive, non-clinical.
 * Bilingual: EN | عربي with persistent locale and full RTL support when Arabic is selected.
 */
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { DesignSystem } from '@/constants/design-system';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/src/i18n/use-translation';
import { useLocaleStore, type Locale } from '@/src/store/locale-store';

const { spacing } = DesignSystem;

const WELCOME_ACCENT = { light: '#0D9488', dark: '#2DD4BF' };
const WELCOME_SAGE = { light: '#A7C4B5', dark: '#7A9A8A' };

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const bg = useThemeColor({}, 'background');
  const muted = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  const accent = useThemeColor(
    { light: WELCOME_ACCENT.light, dark: WELCOME_ACCENT.dark },
    'tint'
  );
  const sage = useThemeColor(
    { light: WELCOME_SAGE.light, dark: WELCOME_SAGE.dark },
    'tint'
  );
  const accentVibrant = useThemeColor(
    { light: WELCOME_ACCENT.light, dark: WELCOME_ACCENT.dark },
    'tint'
  );
  const reassuranceColor = useThemeColor(
    { light: '#4B5563', dark: '#D1D5DB' },
    'text'
  );
  const insets = useSafeAreaInsets();

  const logoScale = useSharedValue(0.98);
  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 14 });
  }, [logoScale]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const contentPaddingTop = insets.top + spacing.lg;
  const languageToggleColor = useThemeColor(
    { light: '#6B7280', dark: '#9CA3AF' },
    'text'
  );

  const handleSetLocale = (next: Locale) => {
    if (next === locale) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocale(next);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: contentPaddingTop,
          paddingBottom: insets.bottom + spacing.xxl + 40,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={styles.brandContainer}>
        <Animated.View style={[styles.logoWrap, logoAnimatedStyle]}>
          <View style={styles.logoShadow}>
            <Image
              source={require('@/assets/images/togetherness-logo.png')}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Togetherness logo — hands in a circle representing connection and support"
            />
          </View>
        </Animated.View>

        <View style={styles.appNameWrap}>
          <ThemedText style={[styles.appName, { color: accentVibrant }]}>
            Togetherness
          </ThemedText>
        </View>

        {/* Language toggle — subtle, below app name. Text-based, no flags. */}
        <View style={styles.languageRow}>
          <Pressable
            onPress={() => handleSetLocale('en')}
            style={styles.languageOption}
            accessibilityLabel={t('welcome.language.aria')}
            accessibilityRole="button">
            <ThemedText
              style={[
                styles.languageLabel,
                { color: locale === 'en' ? accent : languageToggleColor },
              ]}>
              EN
            </ThemedText>
          </Pressable>
          <ThemedText style={[styles.languageDivider, { color: languageToggleColor }]}>
            |
          </ThemedText>
          <Pressable
            onPress={() => handleSetLocale('ar')}
            style={styles.languageOption}
            accessibilityLabel={t('welcome.language.aria')}
            accessibilityRole="button">
            <ThemedText
              style={[
                styles.languageLabelAr,
                { color: locale === 'ar' ? accent : languageToggleColor },
              ]}>
              عربي
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText style={[styles.languageHint, { color: muted }]}>
          {t('welcome.language.hint')}
        </ThemedText>

        <ThemedText style={styles.headline}>{t('welcome.headline')}</ThemedText>
        <ThemedText style={[styles.supporting, { color: muted }]}>
          {t('welcome.supporting')}
        </ThemedText>
        <ThemedText style={[styles.registrationBenefit, { color: muted }]}>
          {t('welcome.registrationBenefit')}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.ctaBlock}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: accent }]}
          onPress={() => router.push('/register')}
          accessibilityLabel={t('welcome.cta.createAccount')}>
          <ThemedText style={styles.primaryBtnLabel}>{t('welcome.cta.createAccount')}</ThemedText>
        </Pressable>
        <ThemedText style={[styles.reassurance, { color: reassuranceColor }]}>
          {t('welcome.cta.reassurance')}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(180)} style={styles.actions}>
        <Pressable
          style={[styles.secondaryBtn, { borderColor: sage }]}
          onPress={() => router.push('/(auth)/login')}
          accessibilityLabel={t('welcome.cta.signIn')}>
          <ThemedText style={[styles.secondaryBtnLabel, { color: muted }]}>
            {t('welcome.cta.signIn')}
          </ThemedText>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const LOGO_SIZE = 128;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    flexGrow: 1,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadow: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  appNameWrap: {
    width: '100%',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 46,
    textAlign: 'center',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  languageOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  languageLabelAr: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageDivider: {
    fontSize: 13,
    marginHorizontal: 6,
    opacity: 0.7,
  },
  languageHint: {
    fontSize: 11,
    marginBottom: spacing.sm,
    textAlign: 'center',
    maxWidth: 260,
  },
  headline: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 32,
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    opacity: 0.95,
    textAlign: 'center',
  },
  supporting: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 300,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  registrationBenefit: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 300,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xl,
  },
  ctaBlock: {
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing.lg,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    shadowOpacity: 0.35,
    elevation: 6,
  },
  primaryBtnLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reassurance: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  secondaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryBtnLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
