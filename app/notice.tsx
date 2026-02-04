import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { DesignSystem } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const STORAGE_KEY = '@notice_entries';
const { spacing } = DesignSystem;

export type Intensity = 'mild' | 'moderate' | 'strong';

export interface NoticeEntry {
  id: string;
  createdAt: string;
  emotions: string[];
  intensity: Intensity;
  bodyNote?: string;
}

const PRIMARY_EMOTIONS = [
  'calm',
  'anxious',
  'sad',
  'angry',
  'numb',
  'overwhelmed',
] as const;

const INTENSITY_OPTIONS: { value: Intensity; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'strong', label: 'Strong' },
];

function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function loadNoticeEntries(): Promise<NoticeEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: NoticeEntry[] = JSON.parse(raw);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

async function saveNoticeEntries(entries: NoticeEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (_) {}
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Trend: count emotions over last 7 days (reflects without interpreting)
function useTrend(entries: NoticeEntry[]) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = entries.filter((e) => new Date(e.createdAt).getTime() >= sevenDaysAgo);
  const counts: Record<string, number> = {};
  recent.forEach((e) => {
    e.emotions.forEach((em) => {
      counts[em] = (counts[em] || 0) + 1;
    });
  });
  return { recent, counts: Object.entries(counts).sort((a, b) => b[1] - a[1]) };
}

type Step = 'emotions' | 'intensity' | 'body' | 'done';

export default function NoticeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor(
    { light: '#FFFFFF', dark: '#243333' },
    'text'
  );
  const muted = useThemeColor(
    { light: '#6B7280', dark: '#9CA3AF' },
    'text'
  );
  const accent = useThemeColor(
    { light: '#3DB8A8', dark: '#6EE7D9' },
    'tint'
  );
  const borderColor = useThemeColor(
    { light: 'rgba(0,0,0,0.06)', dark: 'rgba(255,255,255,0.08)' },
    'background'
  );
  const placeholderColor = useThemeColor(
    { light: '#9CA3AF', dark: '#6B7280' },
    'text'
  );
  const textColor = useThemeColor(
    { light: '#1F2937', dark: '#F3F4F6' },
    'text'
  );

  const [entries, setEntries] = useState<NoticeEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<Step>('emotions');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [bodyNote, setBodyNote] = useState('');
  const [showTrends, setShowTrends] = useState(false);

  const { recent, counts } = useTrend(entries);

  const load = useCallback(async () => {
    const list = await loadNoticeEntries();
    setEntries(list);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEmotion = useCallback((emotion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  }, []);

  const selectIntensity = useCallback((value: Intensity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIntensity(value);
  }, []);

  const submitCheckIn = useCallback(async () => {
    if (selectedEmotions.length === 0) return;
    const entry: NoticeEntry = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      emotions: [...selectedEmotions],
      intensity: intensity ?? 'moderate',
      bodyNote: bodyNote.trim() || undefined,
    };
    const next = [entry, ...entries];
    setEntries(next);
    await saveNoticeEntries(next);
    setStep('done');
  }, [selectedEmotions, intensity, bodyNote, entries]);

  const startNew = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('emotions');
    setSelectedEmotions([]);
    setIntensity(null);
    setBodyNote('');
  }, []);

  const backToHome = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  if (!loaded) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <ThemedText style={[styles.muted, { color: muted }]}>Loading…</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {step === 'emotions' && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
            <ThemedText style={[styles.prompt, { color: muted }]}>
              What's here right now? You can choose more than one.
            </ThemedText>
            <View style={styles.chipRow}>
              {PRIMARY_EMOTIONS.map((emotion) => {
                const selected = selectedEmotions.includes(emotion);
                return (
                  <Pressable
                    key={emotion}
                    style={[
                      styles.emotionChip,
                      { borderColor: selected ? accent : borderColor, backgroundColor: selected ? accent + '22' : surface },
                    ]}
                    onPress={() => toggleEmotion(emotion)}
                    accessibilityLabel={`${emotion}${selected ? ', selected' : ''}. Tap to ${selected ? 'deselect' : 'select'}.`}>
                    <ThemedText style={[styles.emotionChipText, selected && { color: accent }]}>
                      {emotion}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            {selectedEmotions.length > 0 && (
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: accent }]}
                onPress={() => setStep('intensity')}
                accessibilityLabel="Continue">
                <ThemedText style={styles.primaryBtnLabel}>Continue</ThemedText>
              </Pressable>
            )}
          </Animated.View>
        )}

        {step === 'intensity' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.section}>
            <ThemedText style={[styles.prompt, { color: muted }]}>
              Does this feel mild, moderate, or strong?
            </ThemedText>
            <View style={styles.intensityRow}>
              {INTENSITY_OPTIONS.map((opt) => {
                const selected = intensity === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.intensityChip,
                      { borderColor: selected ? accent : borderColor, backgroundColor: selected ? accent + '22' : surface },
                    ]}
                    onPress={() => selectIntensity(opt.value)}
                    accessibilityLabel={`${opt.label}${selected ? ', selected' : ''}`}>
                    <ThemedText style={[styles.intensityChipText, selected && { color: accent }]}>
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.rowBtns}>
              <Pressable style={[styles.secondaryBtn, { borderColor: borderColor }]} onPress={() => setStep('emotions')}>
                <ThemedText style={[styles.secondaryBtnLabel, { color: muted }]}>Back</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: accent }]}
                onPress={() => setStep('body')}
                accessibilityLabel="Continue to body">
                <ThemedText style={styles.primaryBtnLabel}>Continue</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {step === 'body' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.section}>
            <ThemedText style={[styles.prompt, { color: muted }]}>
              Where do you notice this in your body? Optional.
            </ThemedText>
            <TextInput
              style={[styles.bodyInput, { backgroundColor: surface, borderColor, color: textColor }]}
              placeholder="e.g. chest, shoulders, stomach…"
              placeholderTextColor={placeholderColor}
              value={bodyNote}
              onChangeText={setBodyNote}
              multiline
              accessibilityLabel="Where you notice this in your body. Optional."
            />
            <View style={styles.rowBtns}>
              <Pressable style={[styles.secondaryBtn, { borderColor: borderColor }]} onPress={() => setStep('intensity')}>
                <ThemedText style={[styles.secondaryBtnLabel, { color: muted }]}>Back</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: accent }]}
                onPress={submitCheckIn}
                accessibilityLabel="Save check-in">
                <ThemedText style={styles.primaryBtnLabel}>Done</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {step === 'done' && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
            <ThemedText style={[styles.reflect, { color: muted }]}>
              That makes sense.
            </ThemedText>
            <ThemedText style={[styles.subReflect, { color: muted }]}>
              Thanks for naming what's here.
            </ThemedText>
            <View style={styles.doneActions}>
              <Pressable style={[styles.primaryBtn, { backgroundColor: accent }]} onPress={startNew}>
                <ThemedText style={styles.primaryBtnLabel}>Check in again</ThemedText>
              </Pressable>
              <Pressable style={[styles.secondaryBtn, { borderColor: borderColor }]} onPress={backToHome}>
                <ThemedText style={[styles.secondaryBtnLabel, { color: muted }]}>Back to Home</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Private emotional timeline & trend — no interpretation */}
        <View style={styles.trendSection}>
          <Pressable
            style={[styles.trendToggle, { borderColor: borderColor }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowTrends((p) => !p); }}>
            <ThemedText style={[styles.trendToggleLabel, { color: muted }]}>
              {showTrends ? 'Hide your timeline' : 'Your emotional timeline'}
            </ThemedText>
          </Pressable>
          {showTrends && (
            <Animated.View entering={FadeIn.duration(300)}>
              {entries.length === 0 ? (
                <ThemedText style={[styles.muted, { color: muted }]}>
                  Your check-ins will appear here. Private, by date and time.
                </ThemedText>
              ) : (
                <>
                  <ThemedText style={[styles.trendTitle, { color: muted }]}>This week</ThemedText>
                  {counts.length > 0 ? (
                    <View style={styles.countRow}>
                      {counts.slice(0, 6).map(([emotion, count]) => (
                        <ThemedText key={emotion} style={[styles.countChip, { color: muted }]}>
                          {emotion} {count}×
                        </ThemedText>
                      ))}
                    </View>
                  ) : (
                    <ThemedText style={[styles.muted, { color: muted }]}>No check-ins this week yet.</ThemedText>
                  )}
                  <ThemedText style={[styles.trendTitle, { color: muted, marginTop: spacing.md }]}>Recent</ThemedText>
                  {entries.slice(0, 10).map((entry) => (
                    <View key={entry.id} style={[styles.timelineItem, { backgroundColor: surface, borderColor }]}>
                      <ThemedText style={[styles.timelineDate, { color: muted }]}>
                        {formatEntryDate(entry.createdAt)}
                      </ThemedText>
                      <ThemedText style={styles.timelineEmotions}>
                        {entry.emotions.join(', ')} · {entry.intensity}
                        {entry.bodyNote ? ` · ${entry.bodyNote}` : ''}
                      </ThemedText>
                    </View>
                  ))}
                </>
              )}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl + 24 },
  section: { marginBottom: spacing.xl },
  prompt: { fontSize: 16, lineHeight: 24, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  emotionChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  emotionChipText: { fontSize: 15 },
  intensityRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  intensityChip: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  intensityChipText: { fontSize: 15 },
  bodyInput: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  rowBtns: { flexDirection: 'row', gap: spacing.sm },
  primaryBtn: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryBtnLabel: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryBtnLabel: { fontSize: 15, fontWeight: '500' },
  reflect: { fontSize: 18, lineHeight: 26, marginBottom: spacing.xs },
  subReflect: { fontSize: 15, marginBottom: spacing.lg },
  doneActions: { gap: spacing.sm },
  trendSection: { marginTop: spacing.xl },
  trendToggle: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  trendToggleLabel: { fontSize: 13 },
  trendTitle: { fontSize: 12, marginBottom: spacing.xs },
  countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  countChip: { fontSize: 13 },
  timelineItem: {
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  timelineDate: { fontSize: 12, marginBottom: 2 },
  timelineEmotions: { fontSize: 14 },
  muted: { fontSize: 14 },
});
