import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import ModelViewer from '@/components/ModelViewer';
import { Colors, Spacing } from '@/constants/theme';
import { useProductStore } from '@/store/productStore';

// Şimdilik tüm ürünler için local Koltuk.glb kullanılıyor.
// İleride: Gemini API → prompt oluştur → Meshy API → 3D model üret → indir → göster
const LOCAL_MODEL = require('@/assets/models/Koltuk.glb');

export default function ViewerScreen() {
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

  // Local bundled asset kullanıyoruz (require → number döner)
  // İleride AI pipeline hazır olunca, model_url'den indirilen dosya kullanılacak
  const modelSource = LOCAL_MODEL;

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
