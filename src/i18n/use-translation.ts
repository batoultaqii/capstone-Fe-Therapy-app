/**
 * useTranslation — locale and t() for Togetherness.
 */
import { useLocaleStore } from '@/src/store/locale-store';
import { useMemo } from 'react';
import { I18nManager } from 'react-native';
import { getTranslation } from './translations';

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const isRTL = I18nManager.isRTL;
  const t = useMemo(
    () => (key: string) => getTranslation(locale, key),
    [locale]
  );
  return { t, locale, isRTL };
}
