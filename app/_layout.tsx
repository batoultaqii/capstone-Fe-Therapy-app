import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocaleStore } from '@/src/store/locale-store';

export const unstable_settings = {
  initialRouteName: 'index',
};

/** Back from session details always goes to Home (tabs), avoiding stack issues on second visit. */
function SessionBackButton() {
  const router = useRouter();
  return (
    <HeaderBackButton
      onPress={() => router.replace('/(tabs)')}
      label="Home"
    />
  );
}

/** Back from register always goes to Welcome so user can cancel registration. */
function RegisterBackButton() {
  const router = useRouter();
  return (
    <HeaderBackButton
      onPress={() => router.replace('/welcome')}
      label="Back"
    />
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useLocaleStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ title: 'Welcome', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="register"
          options={{
            title: 'Create account',
            headerBackTitle: 'Back',
            headerShown: true,
            headerLeft: () => <RegisterBackButton />,
          }}
        />
        <Stack.Screen
          name="session/[id]"
          options={{
            title: 'Session',
            headerBackTitle: 'Home',
            headerLeft: () => <SessionBackButton />,
          }}
        />
        <Stack.Screen name="enrollment-confirmation" options={{ title: 'Enrolled', headerBackTitle: 'Home', headerLeft: () => null }} />
        <Stack.Screen name="provider/[id]" options={{ title: 'Provider', headerBackTitle: 'Providers' }} />
        <Stack.Screen name="slow-down" options={{ title: 'Slow down', headerBackTitle: 'Home' }} />
        <Stack.Screen name="unload" options={{ title: 'Unload', headerBackTitle: 'Home' }} />
        <Stack.Screen name="notice" options={{ title: 'Notice', headerBackTitle: 'Home' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
