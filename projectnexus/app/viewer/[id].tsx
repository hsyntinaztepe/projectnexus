import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ModelViewer from '@/components/ModelViewer';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useProductStore } from '@/store/productStore';
import api from '@/services/api';

const LOCAL_MODEL = require('@/assets/models/Koltuk.glb');

/**
 * DB'de saklanan model_url içindeki origin'i (IP:PORT),
 * axios'un kullandığı gerçek baseURL ile değiştirir.
 * Örnek: http://192.168.0.4:8000/media/... → http://10.0.2.2:8000/media/...
 */
function resolveModelUrl(rawUrl: string): string {
  const base = (api.defaults.baseURL || '').replace(/\/$/, '');
  try {
    const u = new URL(rawUrl);
    return base + u.pathname;
  } catch {
    return rawUrl;
  }
}

export default function ViewerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProductStore((state) => state.getProductById(id));

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Model bulunamadı</Text>
          <Text style={styles.subtitle}>Geçerli bir ürün seçip tekrar dene.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const modelSource = product.model_url && product.model_url.startsWith('http')
    ? resolveModelUrl(product.model_url)
    : LOCAL_MODEL;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.subtitle}>Parmakla döndür ve yakınlaştır.</Text>
        <ModelViewer modelSource={modelSource} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
