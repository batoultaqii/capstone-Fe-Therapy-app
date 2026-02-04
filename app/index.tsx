import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useAuthStore } from '@/src/store/auth-store';

/**
 * App entry: redirect to Welcome (if not signed in) or Home tabs (if signed in).
 */
export default function Index() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const id = setTimeout(() => {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/welcome');
      }
    }, 0);
    return () => clearTimeout(id);
  }, [user, router]);

  return <View style={{ flex: 1 }} />;
}
