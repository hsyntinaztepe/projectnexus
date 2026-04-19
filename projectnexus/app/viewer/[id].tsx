import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ModelViewer from '@/components/ModelViewer';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useProductStore } from '@/store/productStore';

// Şimdilik tüm ürünler için local Koltuk.glb kullanılıyor.
// İleride: Gemini API → prompt oluştur → Meshy API → 3D model üret → indir → göster
const LOCAL_MODEL = require('@/assets/models/Koltuk.glb');

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

  // Local bundled asset kullanıyoruz (require -> number döner)
  // AI pipeline'dan gelen "model_url" (http://...) varsa onu direk useGLTF hook'una string (URL) olarak paslıyoruz.
  const modelSource = product.model_url && product.model_url.startsWith('http') 
    ? product.model_url 
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
