import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { loadStoredAuth } = useAuthStore();
  const { loadTheme } = useThemeStore();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      Promise.all([loadStoredAuth(), loadTheme()]).finally(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { theme } = useTheme();
  const colorScheme = theme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{
              title: 'Giriş Yap',
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              title: 'Kayıt Ol',
              headerBackTitle: 'Geri',
            }}
          />
          <Stack.Screen
            name="product/[id]"
            options={{ title: 'Ürün Detayı', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen
            name="viewer/[id]"
            options={{ title: '3D Görüntüleyici', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen
            name="admin"
            options={{ title: 'Admin Panel', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
