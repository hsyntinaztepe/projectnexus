import { useLocalSearchParams, router, Stack } from 'expo-router';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import ModelViewer from '@/components/ModelViewer';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useProductStore } from '@/store/productStore';
import api, { productsAPI, type Product } from '@/services/api';

const LOCAL_MODEL = require('@/assets/models/Koltuk.glb');

function resolveModelUrl(rawUrl: string): string {
  const base = (api.defaults.baseURL || '').replace(/\/$/, '');
  try {
    const u = new URL(rawUrl);
    return base + u.pathname;
  } catch {
    return rawUrl;
  }
}

export default function CompareViewerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const { id1, id2 } = useLocalSearchParams<{ id1: string; id2: string }>();
  
  const [product1, setProduct1] = useState<Product | null>(null);
  const [product2, setProduct2] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const p1Stored = useProductStore.getState().getProductById(id1);
        const p2Stored = useProductStore.getState().getProductById(id2);

        if (p1Stored) {
          setProduct1(p1Stored);
        } else if (id1) {
          const res1 = await productsAPI.getById(id1);
          setProduct1(res1.data);
        }

        if (p2Stored) {
          setProduct2(p2Stored);
        } else if (id2) {
          const res2 = await productsAPI.getById(id2);
          setProduct2(res2.data);
        }
      } catch (error) {
        console.error("Failed to load products for comparison", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [id1, id2]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product1 || !product2) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.title}>Modeller bulunamadı</Text>
          <Text style={styles.subtitle}>Lütfen ürün seçimlerini kontrol edin.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const modelSource1 = product1.model_url && product1.model_url.startsWith('http')
    ? resolveModelUrl(product1.model_url)
    : LOCAL_MODEL;

  const modelSource2 = product2.model_url && product2.model_url.startsWith('http')
    ? resolveModelUrl(product2.model_url)
    : LOCAL_MODEL;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Karşılaştırma' }} />

      <View style={styles.container}>
        <Text style={styles.hint}>Parmakla döndür ve yakınlaştır</Text>
        
        {/* Üst Kısım / İlk Ürün */}
        <View style={styles.modelContainer}>
          <Text style={styles.productName}>{product1.name}</Text>
          <View style={styles.viewerWrapper}>
            <ModelViewer modelSource={modelSource1} />
          </View>
        </View>
        
        <View style={styles.divider} />

        {/* Alt Kısım / İkinci Ürün */}
        <View style={styles.modelContainer}>
          <Text style={styles.productName}>{product2.name}</Text>
          <View style={styles.viewerWrapper}>
            <ModelViewer modelSource={modelSource2} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  backIcon: {
    fontSize: 16,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xs,
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
  modelContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  viewerWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: Spacing.xs,
  },
});
