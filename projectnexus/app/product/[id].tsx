import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { productsAPI, recordBuyClick, type Product } from '@/services/api';

export default function ProductDetail() {
  const { colors } = useTheme();
  let styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleFavorite, isFavorite } = useProductStore();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      try {
        // Önce store'dan dene
        const stored = useProductStore.getState().getProductById(id);
        if (stored) {
          setProduct(stored);
          setIsLoading(false);
          return;
        }
        // API'den çek
        const response = await productsAPI.getById(id);
        setProduct(response.data);
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Ürün bulunamadı</Text>
          <Text style={styles.errorSubtitle}>Geçerli bir ürün seçip tekrar dene.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const favorited = isFavorite(product.id);

  function handleToggleFavorite() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggleFavorite(product!);
  }

  function handleBuy() {
    recordBuyClick(product!.id);
    Linking.openURL(product!.source_url);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: product.image_url || 'https://via.placeholder.com/600' }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.info}>
          <View style={styles.topRow}>
            <View style={styles.badgeRow}>
              <Text style={styles.category}>{product.category || 'Genel'}</Text>
              {product.platform && (
                <View style={styles.platformBadge}>
                  <Text style={styles.platformText}>
                    {product.platform === 'Amazon' ? '🛒' : '📦'} {product.platform}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Text style={styles.heartIcon}>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{product.name}</Text>

          {product.dimensions && (
            <Text style={styles.dimensions}>
              📐 {product.dimensions.width} cm × {product.dimensions.height} cm ×{' '}
              {product.dimensions.depth} cm
            </Text>
          )}

          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {product.price != null && (
            <Text style={styles.price}>{product.price.toLocaleString('tr-TR')} TL</Text>
          )}

          {/* Renk Seçici */}
          {product.colors.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Renk Seçenekleri</Text>
              <View style={styles.colorRow}>
                {product.colors.map((color, index) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      selectedColor === index && styles.colorDotSelected,
                    ]}
                    onPress={() => setSelectedColor(index)}
                  />
                ))}
              </View>
            </>
          )}

          {/* Butonlar */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push({ pathname: '/viewer/[id]', params: { id: product.id } })}>
            <Text style={styles.primaryBtnText}>🔮 3D İncele</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleBuy}>
            <Text style={styles.secondaryBtnText}>🛒 Satın Al</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  errorSubtitle: {
    marginTop: Spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: colors.card,
  },
  info: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heartIcon: {
    fontSize: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  dimensions: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.accent,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: Spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorDotSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
