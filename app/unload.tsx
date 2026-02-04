import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
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

const STORAGE_KEY = '@unload_entries';
const DEBOUNCE_MS = 2500;
const { spacing } = DesignSystem;

export interface UnloadEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
}

// Gentle, optional prompts — externalize emotion, not analyze. No judgment.
const GENTLE_PROMPTS = [
  'What feels heavy right now?',
  "If you didn't need to explain, what would you say?",
  "What's here that you don't have to fix?",
];

function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function loadEntries(): Promise<UnloadEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: UnloadEntry[] = JSON.parse(raw);
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

async function saveEntries(entries: UnloadEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (_) {}
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function UnloadScreen() {
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
  const textColor = useThemeColor(
    { light: '#1F2937', dark: '#F3F4F6' },
    'text'
  );
  const placeholderColor = useThemeColor(
    { light: '#9CA3AF', dark: '#6B7280' },
    'text'
  );
  const borderColor = useThemeColor(
    { light: 'rgba(0,0,0,0.06)', dark: 'rgba(255,255,255,0.08)' },
    'background'
  );
  const accent = useThemeColor(
    { light: '#3DB8A8', dark: '#6EE7D9' },
    'tint'
  );

  const [entries, setEntries] = useState<UnloadEntry[]>([]);
  const [current, setCurrent] = useState<UnloadEntry | null>(null);
  const [content, setContent] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const load = useCallback(async () => {
    const list = await loadEntries();
    setEntries(list);
    if (list.length > 0 && !current) {
      setCurrent(list[0]);
      setContent(list[0].content);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persistCurrent = useCallback(
    async (entry: UnloadEntry) => {
      const updated = { ...entry, content: entry.content, updatedAt: new Date().toISOString() };
      const nextList = [updated, ...entries.filter((e) => e.id !== entry.id)];
      const sorted = nextList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setEntries(sorted);
      await saveEntries(sorted);
      setCurrent(updated);
    },
    [entries]
  );

  // When user types and there's no current entry yet, create one and persist
  useEffect(() => {
    if (!loaded || current || !content.trim()) return;
    const newEntry: UnloadEntry = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content,
    };
    setCurrent(newEntry);
    setEntries((prev) => {
      const next = [newEntry, ...prev];
      saveEntries(next);
      return next;
    });
  }, [loaded, content, current]);

  useEffect(() => {
    if (!current || !loaded) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persistCurrent({ ...current, content });
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, loaded, current?.id]);

  const startNewEntry = useCallback(() => {
    if (content.trim() && current) {
      const updated = { ...current, content, updatedAt: new Date().toISOString() };
      const nextList = [updated, ...entries.filter((e) => e.id !== current.id)];
      const sorted = nextList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setEntries(sorted);
      saveEntries(sorted);
    }
    const newEntry: UnloadEntry = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: '',
    };
    setCurrent(newEntry);
    setContent('');
    setShowPast(false);
    inputRef.current?.focus();
  }, [content, current, entries]);

  const openEntry = useCallback((entry: UnloadEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrent(entry);
    setContent(entry.content);
    setShowPast(false);
    inputRef.current?.focus();
  }, []);

  const insertPrompt = useCallback((prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContent((prev) => (prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`));
    inputRef.current?.focus();
  }, []);

  const deleteCurrent = useCallback(() => {
    if (!current) return;
    Alert.alert(
      'Delete this entry?',
      "It can't be undone. Your words will be removed from this device.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const nextList = entries.filter((e) => e.id !== current.id);
            setEntries(nextList);
            await saveEntries(nextList);
            if (nextList.length > 0) {
              setCurrent(nextList[0]);
              setContent(nextList[0].content);
            } else {
              setCurrent(null);
              setContent('');
            }
          },
        },
      ]
    );
  }, [current, entries]);

  const backToHome = useCallback(() => {
    if (content.trim() && current) {
      const updated = { ...current, content, updatedAt: new Date().toISOString() };
      const nextList = [updated, ...entries.filter((e) => e.id !== current.id)];
      saveEntries(nextList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    }
    router.back();
  }, [content, current, entries]);

  if (!loaded) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <ThemedText style={[styles.placeholder, { color: muted }]}>Loading…</ThemedText>
      </View>
    );
  }

  const displayedTime = current ? current.updatedAt : new Date().toISOString();

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
        {/* Date and time — auto-recorded, no word count or scores */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.metaRow}>
          <ThemedText style={[styles.dateTime, { color: muted }]} accessibilityLabel={`Entry from ${formatEntryDate(displayedTime)}`}>
            {formatEntryDate(displayedTime)}
          </ThemedText>
        </Animated.View>

        {/* Optional gentle prompts — not mandatory */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.promptsWrap}>
          <ThemedText style={[styles.promptsLabel, { color: muted }]}>
            Optional — only if you want to:
          </ThemedText>
          <View style={styles.promptChips}>
            {GENTLE_PROMPTS.map((prompt, i) => (
              <Pressable
                key={i}
                style={[styles.chip, { borderColor: borderColor }]}
                onPress={() => insertPrompt(prompt)}
                accessibilityLabel={`Suggestion: ${prompt}. Tap to add to your entry.`}>
                <ThemedText style={[styles.chipText, { color: muted }]} numberOfLines={2}>
                  {prompt}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Distraction-free writing space */}
        <Animated.View entering={FadeIn.duration(400)} style={[styles.inputWrap, { backgroundColor: surface, borderColor }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: textColor }]}
            placeholder="Whatever you need to let out…"
            placeholderTextColor={placeholderColor}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Journal entry. Private. No word count or scores."
          />
        </Animated.View>

        {/* Past entries — private, editable */}
        <Pressable
          style={[styles.pastToggle, { borderColor: borderColor }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPast((p) => !p); }}>
          <ThemedText style={[styles.pastToggleLabel, { color: muted }]}>
            {showPast ? 'Hide past entries' : 'Past entries'}
          </ThemedText>
        </Pressable>

        {showPast && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.pastList}>
            {entries.length === 0 && (
              <ThemedText style={[styles.emptyPast, { color: muted }]}>
                No entries yet. What you write is saved here, by date and time.
              </ThemedText>
            )}
            {entries.map((entry) => (
              <Pressable
                key={entry.id}
                style={[styles.pastItem, { backgroundColor: surface, borderColor }]}
                onPress={() => openEntry(entry)}>
                <ThemedText style={[styles.pastItemDate, { color: muted }]}>
                  {formatEntryDate(entry.updatedAt)}
                </ThemedText>
                <ThemedText style={[styles.pastItemPreview, { color: textColor }]} numberOfLines={2}>
                  {entry.content.trim() || '—'}
                </ThemedText>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Actions: new entry, delete (optional), back */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.secondaryBtn, { borderColor: borderColor }]}
            onPress={startNewEntry}
            accessibilityLabel="Start a new entry">
            <ThemedText style={[styles.secondaryBtnLabel, { color: muted }]}>New entry</ThemedText>
          </Pressable>
          {current && entries.some((e) => e.id === current.id) && (
            <Pressable
              style={[styles.textBtn]}
              onPress={deleteCurrent}
              accessibilityLabel="Delete this entry">
              <ThemedText style={[styles.deleteLabel, { color: muted }]}>Delete entry</ThemedText>
            </Pressable>
          )}
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: accent }]}
            onPress={backToHome}
            accessibilityLabel="Back to home">
            <ThemedText style={styles.primaryBtnLabel}>Back to Home</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 24,
  },
  metaRow: { marginBottom: spacing.sm },
  dateTime: { fontSize: 13, letterSpacing: 0.2 },
  promptsWrap: { marginBottom: spacing.lg },
  promptsLabel: { fontSize: 12, marginBottom: spacing.xs },
  promptChips: { gap: spacing.xs },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, lineHeight: 20 },
  inputWrap: {
    minHeight: 220,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    padding: 0,
  },
  placeholder: { fontSize: 15 },
  pastToggle: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  pastToggleLabel: { fontSize: 13 },
  pastList: { gap: spacing.sm, marginBottom: spacing.lg },
  emptyPast: { fontSize: 13, fontStyle: 'italic', marginBottom: spacing.sm },
  pastItem: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  pastItemDate: { fontSize: 12, marginBottom: 4 },
  pastItemPreview: { fontSize: 14, lineHeight: 20 },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryBtnLabel: { fontSize: 15, fontWeight: '500' },
  textBtn: { paddingVertical: 8, alignItems: 'center' },
  deleteLabel: { fontSize: 13 },
  primaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnLabel: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
});
