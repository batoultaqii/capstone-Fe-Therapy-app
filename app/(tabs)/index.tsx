import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { TileIcon, type TileIconName } from '@/components/tile-icon';
import { DesignSystem } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const { radius, spacing, primaryButton, colors: DSColors } = DesignSystem;

// Softer, warmer tokens for this screen (reduced tension, felt safety)
const SOFT = {
  breathDuration: 3200,           // slower, almost imperceptible
  circleOpacityMin: 0.06,
  circleOpacityMax: 0.18,
  primarySaturation: '#3DB8A8',   // slightly softer teal
  primarySaturationDark: '#6EE7D9',
  radiusCushion: 22,
  shadowOpacity: 0.03,
  shadowRadius: 12,
};

type FacilitatorType = 'professional' | 'volunteer';

interface SupportCircleSession {
  id: string;
  title: string;
  time: string;
  facilitatorType: FacilitatorType;
  facilitatorLabel: string;
  recommended?: boolean;
}

const SUPPORT_CIRCLES: SupportCircleSession[] = [
  { id: '1', title: 'When anxiety feels heavy', time: 'Tue 6:00 PM', facilitatorType: 'professional', facilitatorLabel: 'Sarah M.', recommended: true },
  { id: '2', title: 'Finding calm together', time: 'Wed 4:30 PM', facilitatorType: 'volunteer', facilitatorLabel: 'Alex' },
  { id: '3', title: 'Gentle space for low days', time: 'Thu 7:00 PM', facilitatorType: 'professional', facilitatorLabel: 'Dr. James L.' },
  { id: '4', title: 'Hope and connection', time: 'Sat 10:00 AM', facilitatorType: 'volunteer', facilitatorLabel: 'Sam' },
];

// Tiles with human subtext — emotionally reframed
const TILES: Array<{ id: TileIconName; label: string; subtext: string; accent: boolean }> = [
  { id: 'slow', label: 'Slow down', subtext: 'When things feel fast', accent: true },
  { id: 'unload', label: 'Unload', subtext: 'Let it out safely', accent: false },
  { id: 'notice', label: 'Notice', subtext: 'Gently check in', accent: false },
  { id: 'held', label: 'Be held', subtext: "You're not alone", accent: false },
];

const BREATH_DURATION = 2400;

// Grounding exercise: 5-4-3-2-1 technique (seconds for timer)
const GROUNDING_DURATION_SEC = 120; // 2 minutes
const GROUNDING_STEPS = [
  { count: 5, sense: 'things you can see', prompt: 'Look around and name 5 things you can see.' },
  { count: 4, sense: 'things you can hear', prompt: 'Listen and name 4 things you can hear.' },
  { count: 3, sense: 'things you can touch', prompt: 'Notice 3 things you can touch or feel.' },
  { count: 2, sense: 'things you can smell', prompt: 'Name 2 things you can smell (or like the smell of).' },
  { count: 1, sense: 'thing you can taste', prompt: 'Name 1 thing you can taste or notice in your mouth.' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Grounding exercise view with timer — shown when user taps Pause
function GroundingExerciseView({
  onBack,
  accentColor,
  backgroundColor,
  mutedColor,
}: {
  onBack: () => void;
  accentColor: string;
  backgroundColor: string;
  mutedColor: string;
}) {
  const [secondsLeft, setSecondsLeft] = useState(GROUNDING_DURATION_SEC);
  const [running, setRunning] = useState(true);

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        setRunning(false);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.groundingContainer, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.groundingContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.groundingHeader}>
          <ThemedText type="title" style={styles.groundingTitle}>
            Pause & ground
          </ThemedText>
          <ThemedText style={[styles.groundingSubtitle, { color: mutedColor }]}>
            Use your senses to come back to the present.
          </ThemedText>
        </View>

        <View style={[styles.timerWrap, { backgroundColor: accentColor + '22', borderColor: accentColor }]}>
          <ThemedText style={[styles.timerLabel, { color: mutedColor }]}>Time remaining</ThemedText>
          <ThemedText style={[styles.timerValue, { color: accentColor }]}>
            {formatTime(secondsLeft)}
          </ThemedText>
        </View>

        <View style={styles.stepsWrap}>
          {GROUNDING_STEPS.map((step, i) => (
            <View key={i} style={styles.groundingStep}>
              <View style={[styles.stepBullet, { backgroundColor: accentColor }]}>
                <ThemedText style={styles.stepBulletText}>{step.count}</ThemedText>
              </View>
              <View style={styles.stepTextWrap}>
                <ThemedText type="defaultSemiBold" style={styles.stepSense}>
                  {step.count} {step.sense}
                </ThemedText>
                <ThemedText style={[styles.stepPrompt, { color: mutedColor }]}>
                  {step.prompt}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.groundingBackBtn, { borderColor: accentColor }]}
          onPress={onBack}
          android_ripple={{ color: accentColor + '20' }}>
          <ThemedText style={[styles.groundingBackLabel, { color: accentColor }]}>
            Back to home
          </ThemedText>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}

// Soft presence: very slow breathing-like motion, light opacity (almost imperceptible)
function BreathingCircle({ accentColor }: { accentColor: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(SOFT.circleOpacityMin);
  const translateY = useSharedValue(0);
  const d = SOFT.breathDuration;

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: d, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: d, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(SOFT.circleOpacityMax, { duration: d, easing: Easing.inOut(Easing.ease) }),
        withTiming(SOFT.circleOpacityMin, { duration: d, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: d * 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: d * 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [scale, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.signatureCircle,
        { backgroundColor: accentColor, borderColor: accentColor },
        style,
      ]}
    />
  );
}

// Gentle exhale-like pulse — invitation, not CTA
function RitualPulse({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: SOFT.breathDuration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: SOFT.breathDuration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function HomeScreen() {
  const [showGrounding, setShowGrounding] = useState(false);
  const scheme = useColorScheme() ?? 'light';
  const c = DSColors[scheme];
  const bg = useThemeColor({}, 'background');
  const accent = useThemeColor(
    { light: SOFT.primarySaturation, dark: SOFT.primarySaturationDark },
    'tint'
  );
  const tileBg = c.surface;
  const muted = c.textMuted;
  const iconTint = scheme === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(31,41,55,0.72)';

  const onPrimary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowGrounding(true);
  };

  if (showGrounding) {
    return (
      <GroundingExerciseView
        onBack={() => setShowGrounding(false)}
        accentColor={accent}
        backgroundColor={bg}
        mutedColor={muted}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Hero: soft presence, calm headline, supporting line */}
      <Animated.View
        entering={FadeInDown.duration(900)}
        style={styles.hero}>
        <View style={styles.signatureWrap} pointerEvents="none">
          <BreathingCircle accentColor={accent} />
        </View>
        <ThemedText type="title" style={styles.heroTitle}>
          Let's begin gently.
        </ThemedText>
        <ThemedText style={[styles.heroSupport, { color: muted }]}>
          I'm glad you're here.
        </ThemedText>
      </Animated.View>

      {/* Pause: invitation to grounding — softer color, gentle pulse, reassuring microcopy */}
      <Animated.View entering={FadeInDown.duration(850).delay(180)} style={styles.primaryWrap}>
        <RitualPulse>
          <Pressable
            style={[styles.primaryPill, { backgroundColor: accent }]}
            onPress={onPrimary}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}>
            <ThemedText style={styles.primaryLabel}>Pause</ThemedText>
          </Pressable>
        </RitualPulse>
        <ThemedText style={[styles.ritualMicrocopy, { color: muted }]}>
          Take a moment to ground yourself.
        </ThemedText>
      </Animated.View>

      {/* Tiles: human subtext, softer icons, cushioned cards */}
      <Animated.View entering={FadeInDown.duration(800).damping(18).delay(280)} style={styles.tilesWrap}>
        <View style={styles.tilesRow}>
          {TILES.slice(0, 2).map((tile, i) => (
            <Pressable
              key={tile.id}
              style={[
                styles.tile,
                { backgroundColor: tileBg, borderRadius: SOFT.radiusCushion },
                i === 0 ? styles.tileStaggerLeft : styles.tileStaggerRight,
                tile.accent && { borderWidth: 1, borderColor: accent },
              ]}
              onPress={() => {}}
              android_ripple={{ color: 'rgba(61,184,168,0.08)' }}>
              <TileIcon
                name={tile.id}
                color={tile.accent ? accent : iconTint}
                size={24}
              />
              <ThemedText
                type="defaultSemiBold"
                style={[styles.tileLabel, tile.accent && { color: accent }]}>
                {tile.label}
              </ThemedText>
              <ThemedText style={[styles.tileSubtext, { color: muted }]} numberOfLines={1}>
                {tile.subtext}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        <View style={[styles.tilesRow, styles.tilesRowSecond]}>
          {TILES.slice(2, 4).map((tile, i) => (
            <Pressable
              key={tile.id}
              style={[
                styles.tile,
                { backgroundColor: tileBg, borderRadius: SOFT.radiusCushion },
                i === 0 ? styles.tileStaggerRight : styles.tileStaggerLeft,
              ]}
              onPress={() => {}}
              android_ripple={{ color: 'rgba(61,184,168,0.08)' }}>
              <TileIcon name={tile.id} color={iconTint} size={24} />
              <ThemedText type="defaultSemiBold" style={styles.tileLabel}>
                {tile.label}
              </ThemedText>
              <ThemedText style={[styles.tileSubtext, { color: muted }]} numberOfLines={1}>
                {tile.subtext}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Upcoming: caring label, softer Recommended badge */}
      <Animated.View entering={FadeInDown.duration(800).delay(380)}>
        <ThemedText style={[styles.upcomingLabel, { color: muted }]}>
          Available when you need it
        </ThemedText>
        {SUPPORT_CIRCLES.slice(0, 3).map((s) => (
          <Pressable
            key={s.id}
            style={[
              styles.upcomingRow,
              { backgroundColor: tileBg, borderRadius: SOFT.radiusCushion },
              s.recommended && styles.upcomingRowHighlight,
              s.recommended && { borderLeftColor: accent },
            ]}
            onPress={() => {}}>
            <View style={styles.upcomingContent}>
              {s.recommended && (
                <View style={[styles.recommendedBadge, { borderColor: accent }]}>
                  <ThemedText style={[styles.recommendedPill, { color: accent }]}>
                    Recommended
                  </ThemedText>
                </View>
              )}
              <ThemedText type="defaultSemiBold" style={styles.upcomingTitle} numberOfLines={1}>
                {s.title}
              </ThemedText>
            </View>
            <ThemedText style={[styles.upcomingTime, { color: muted }]}>{s.time}</ThemedText>
          </Pressable>
        ))}
      </Animated.View>

      <View style={styles.auth}>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <ThemedText type="link">Sign in</ThemedText>
          </Pressable>
        </Link>
        <ThemedText style={[styles.authDot, { color: muted }]}>·</ThemedText>
        <Link href="/register" asChild>
          <Pressable>
            <ThemedText type="link">Create account</ThemedText>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  groundingContainer: {
    flex: 1,
  },
  groundingContent: {
    padding: spacing.lg + 4,
    paddingTop: spacing.xxl + 8,
    paddingBottom: 56,
  },
  groundingHeader: {
    marginBottom: 28,
  },
  groundingTitle: {
    fontSize: 24,
    letterSpacing: 0.2,
    lineHeight: 32,
  },
  groundingSubtitle: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  timerWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: SOFT.radiusCushion,
    borderWidth: 1,
    marginBottom: 32,
    minWidth: 160,
  },
  timerLabel: {
    fontSize: 12,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  stepsWrap: {
    gap: 20,
    marginBottom: 36,
  },
  groundingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBulletText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepTextWrap: {
    flex: 1,
  },
  stepSense: {
    fontSize: 15,
  },
  stepPrompt: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  groundingBackBtn: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: SOFT.radiusCushion,
    borderWidth: 1,
  },
  groundingBackLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg + 4,
    paddingTop: spacing.xxl + 8,
    paddingBottom: 56,
  },
  hero: {
    marginBottom: 40,
    position: 'relative',
    minHeight: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureWrap: {
    position: 'absolute',
    top: -30,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 26,
    letterSpacing: 0.2,
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 26,
    opacity: 0.92,
  },
  heroSupport: {
    fontSize: 12,
    marginTop: 6,
    letterSpacing: 0.2,
    opacity: 0.85,
  },
  primaryWrap: {
    marginBottom: 40,
    alignItems: 'center',
  },
  primaryPill: {
    ...primaryButton,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  primaryLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  ritualMicrocopy: {
    fontSize: 13,
    marginTop: 10,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  tilesWrap: {
    gap: 16,
    marginBottom: 36,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  tilesRowSecond: {
    paddingLeft: 10,
  },
  tile: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: SOFT.shadowOpacity,
    shadowRadius: SOFT.shadowRadius,
    elevation: 1,
  },
  tileStaggerLeft: { marginLeft: 0 },
  tileStaggerRight: { marginRight: 4 },
  tileLabel: {
    fontSize: 14,
  },
  tileSubtext: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  upcomingLabel: {
    fontSize: 14,
    marginBottom: 14,
    lineHeight: 22,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  upcomingRowHighlight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  upcomingContent: {
    flex: 1,
    marginRight: 12,
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  recommendedPill: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  upcomingTitle: {
    fontSize: 15,
  },
  upcomingTime: {
    fontSize: 13,
  },
  auth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 44,
  },
  authDot: { fontSize: 14 },
});
