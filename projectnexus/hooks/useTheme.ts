import { Colors } from '@/constants/theme';
import { useThemeStore } from '../store/themeStore';

export const useTheme = () => {
  const activeTheme = useThemeStore((state) => state.activeTheme);

  const themeColors = activeTheme === 'dark' ? Colors.dark : Colors.light;

  return {
    theme: activeTheme,
    colors: themeColors,
  };
};
