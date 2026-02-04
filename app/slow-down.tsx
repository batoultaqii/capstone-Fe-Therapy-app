import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { DesignSystem } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const { spacing } = DesignSystem;
const ACCENT = { light: '#3DB8A8', dark: '#6EE7D9' };
const BREATH_CYCLE_MS = 4000; // 4s in, 4s out
const BREATHING_PHASE_SEC = 60; // 30–90 sec range
const INTRO_AUTO_ADVANCE_MS = 4000;
const BODY_AUTO_ADVANCE_MS = 12000;

type Phase = 'intro' | 'breathing' | 'body' | 'closing';

// Scripted prompts — calm, brief, body-based. No "why", no analysis.
const INTRO_LINES = [
  'Take a breath.',
  "No need to change anything. Just here.",
];

const BREATHING_LINES = [
  "Let the breath come in. And let it go.",
  "Your body knows how.",
  "Just following the circle.",
];

const BODY_LINES = [
  "If you like, soften your jaw.",
  "Let your shoulders drop.",
  "Let your hands be heavy.",
];

const CLOSING_LINES = [
  "You're safe here.",
  "Would you like to notice what's here now?",
  "You can return to the home screen.",
];

// Expanding/contracting circle synced to breath (4s in = expand, 4s out = contract)
function BreathPacingCircle({ accentColor }: { accentColor: string }) {
  const scale = useSharedValue(0.72);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    const half = BREATH_CYCLE_MS / 2;
    const ease = Easing.inOut(Easing.ease);
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: half, easing: ease }),
        withTiming(0.72, { duration: half, easing: ease })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: half, easing: ease }),
        withTiming(0.5, { duration: half, easing: ease })
      ),
      -1,
      true
    );
  }, [scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.breathCircle,
        { backgroundColor: accentColor, borderColor: accentColor },
        style,
      ]}
      accessibilityLabel="Breathing pace. Circle expands as you breathe in, softens as you breathe out."
    />
  );
}

export default function SlowDownScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const bg = useThemeColor({}, 'background');
  const muted = useThemeColor(
    { light: '#6B7280', dark: '#9CA3AF' },
    'text'
  );
  const accent = useThemeColor(
    { light: ACCENT.light, dark: ACCENT.dark },
    'tint'
  );

  const [phase, setPhase] = useState<Phase>('intro');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(BREATHING_PHASE_SEC);
  const [introLineIndex, setIntroLineIndex] = useState(0);

  // Intro: show lines one by one, then auto-advance to breathing
  useEffect(() => {
    if (phase !== 'intro') return;
    const nextLine = setTimeout(() => {
      if (introLineIndex < INTRO_LINES.length - 1) {
        setIntroLineIndex((i) => i + 1);
      }
    }, 2200);
    return () => clearTimeout(nextLine);
  }, [phase, introLineIndex]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const advance = setTimeout(() => {
      setPhase('breathing');
    }, INTRO_AUTO_ADVANCE_MS);
    return () => clearTimeout(advance);
  }, [phase]);

  // Breathing phase: countdown 60s then go to body
  useEffect(() => {
    if (phase !== 'breathing') return;
    const t = setInterval(() => {
      setBreathSecondsLeft((s) => {
        if (s <= 1) {
          setPhase('body');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Body phase: auto-advance to closing after 12s
  useEffect(() => {
    if (phase !== 'body') return;
    const advance = setTimeout(() => setPhase('closing'), BODY_AUTO_ADVANCE_MS);
    return () => clearTimeout(advance);
  }, [phase]);

  const goToBreathing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('breathing');
  }, []);

  const goToClosing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('closing');
  }, []);

  const backToHome = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {phase === 'intro' && (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.phaseContent}
          accessibilityLabel="Slow down. Take a breath. No need to change anything. Just here.">
          <ThemedText style={[styles.calmLine, { color: muted }]}>
            {INTRO_LINES[introLineIndex]}
          </ThemedText>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: accent }]}
            onPress={goToBreathing}
            accessibilityLabel="Continue to breathing exercise">
            <ThemedText style={styles.primaryBtnLabel}>Continue</ThemedText>
          </Pressable>
        </Animated.View>
      )}

      {phase === 'breathing' && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.phaseContent}>
          <View style={styles.circleWrap}>
            <BreathPacingCircle accentColor={accent} />
          </View>
          <ThemedText style={[styles.calmLine, styles.breathLine, { color: muted }]}>
            {BREATHING_LINES[Math.min(Math.floor((BREATHING_PHASE_SEC - breathSecondsLeft) / 20), BREATHING_LINES.length - 1)]}
          </ThemedText>
          <ThemedText style={[styles.timerText, { color: muted }]}>
            {breathSecondsLeft}s
          </ThemedText>
          <Pressable
            style={[styles.skipBtn, { borderColor: muted }]}
            onPress={goToClosing}
            accessibilityLabel="Skip to end">
            <ThemedText style={[styles.skipBtnLabel, { color: muted }]}>
              Skip to end
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}

      {phase === 'body' && (
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.phaseContent}
          accessibilityLabel="If you like, soften your jaw. Let your shoulders drop. Let your hands be heavy.">
          {BODY_LINES.map((line, i) => (
            <ThemedText key={i} style={[styles.calmLine, { color: muted }]}>
              {line}
            </ThemedText>
          ))}
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: accent }]}
            onPress={goToClosing}
            accessibilityLabel="Continue">
            <ThemedText style={styles.primaryBtnLabel}>Continue</ThemedText>
          </Pressable>
        </Animated.View>
      )}

      {phase === 'closing' && (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.phaseContent}
          accessibilityLabel="You're safe here. Would you like to notice what's here now? You can return to the home screen.">
          <ThemedText style={[styles.calmLine, { color: muted }]}>
            {CLOSING_LINES[0]}
          </ThemedText>
          <ThemedText style={[styles.calmLine, { color: muted, marginTop: spacing.sm }]}>
            {CLOSING_LINES[1]}
          </ThemedText>
          <ThemedText style={[styles.calmLine, { color: muted, marginTop: spacing.sm }]}>
            {CLOSING_LINES[2]}
          </ThemedText>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: accent }]}
            onPress={backToHome}
            accessibilityLabel="Back to home screen">
            <ThemedText style={styles.primaryBtnLabel}>Back to Home</ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg + 4,
  },
  phaseContent: {
    alignItems: 'center',
    maxWidth: 340,
  },
  calmLine: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  breathLine: {
    marginTop: spacing.xl,
  },
  timerText: {
    fontSize: 14,
    marginTop: spacing.sm,
  },
  circleWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
  },
  primaryBtn: {
    marginTop: spacing.xl,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryBtnLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  skipBtn: {
    marginTop: spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
  },
  skipBtnLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
