import { create } from 'zustand';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  themeMode: ColorSchemeName | 'system';
  activeTheme: 'light' | 'dark';
  setTheme: (mode: ColorSchemeName | 'system') => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'system',
  activeTheme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  
  setTheme: async (mode) => {
    let active: 'light' | 'dark';
    if (mode === 'system') {
      active = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    } else {
      active = mode as 'light' | 'dark';
      Appearance.setColorScheme(active);
    }
    
    set({ themeMode: mode, activeTheme: active });
    await AsyncStorage.setItem('user-theme', mode ?? 'system');
  },
  
  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem('user-theme') as ColorSchemeName | 'system' | null;
      if (stored) {
        get().setTheme(stored);
      } else {
        get().setTheme('system');
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  }
}));

// Also listen to system appearance changes if in system mode
Appearance.addChangeListener(({ colorScheme }) => {
  const store = useThemeStore.getState();
  if (store.themeMode === 'system') {
    useThemeStore.setState({
      activeTheme: colorScheme === 'dark' ? 'dark' : 'light'
    });
  }
});