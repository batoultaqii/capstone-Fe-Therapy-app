/**
 * Locale (language) state and persistence for iBelong.
 * Supports English (LTR) and Arabic (RTL). Persists to AsyncStorage and applies RTL on change.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { create } from 'zustand';

const STORAGE_KEY = '@togetherness/locale';
export type Locale = 'en' | 'ar';

interface LocaleState {
  locale: Locale;
  isHydrated: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  hydrate: () => Promise<void>;
}

async function persistLocale(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, locale);
}

async function reloadForRTL(): Promise<void> {
  try {
    const { default: Updates } = await import('expo-updates');
    await Updates.reloadAsync();
  } catch {
    // expo-updates may be unavailable (e.g. in dev without config). RTL will apply on next app launch.
  }
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: 'en',
  isHydrated: false,

  async setLocale(locale: Locale) {
    const current = get().locale;
    if (current === locale) return;

    await persistLocale(locale);
    const isRTL = locale === 'ar';
    const rtlAlreadyApplied = I18nManager.isRTL === isRTL;
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTL);
    set({ locale });

    if (!rtlAlreadyApplied) {
      await reloadForRTL();
    }
  },

  async hydrate() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const locale: Locale = stored === 'ar' || stored === 'en' ? stored : 'en';
      const wantRTL = locale === 'ar';
      if (I18nManager.isRTL !== wantRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(wantRTL);
        set({ locale });
        await reloadForRTL();
        return;
      }
      set({ locale, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },
}));
